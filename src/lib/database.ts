import { supabase } from './supabase';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
  user_id: string;
  schema_content?: string;
  is_schema_locked?: boolean;
}

export interface ChatMessage {
  id: string;
  question: string;
  sqlQuery: string;
  explanation: string;
  timestamp: Date;
}

export interface UserSchema {
  id: string;
  user_id: string;
  schema_content: string;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_start_date?: Date;
  trial_end_date?: Date;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  queries_used: number;
  queries_limit: number; // 0 for free trial, 750 for pro, -1 for unlimited
  created_at: Date;
  updated_at: Date;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  amount: number; // Amount in paise
  currency: string;
  plan_type: string;
  status: 'pending' | 'success' | 'failed';
  payment_method?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserAccess {
  has_access: boolean;
  plan_type: string;
  queries_remaining: number;
  days_remaining: number;
  status: string;
}

// Chat Sessions
export const saveChatSession = async (session: Omit<ChatSession, 'user_id'>, userId: string) => {
  try {
    console.log('💾 Saving chat session:', {
      sessionId: session.id,
      userId: userId,
      title: session.title,
      messagesCount: session.messages?.length || 0,
      hasSchema: !!session.schema_content,
      isLocked: session.is_schema_locked
    });

    // First, save or update the chat session
    const sessionPayload = {
      id: session.id,
      title: session.title,
      user_id: userId,
      schema_content: session.schema_content || null,
      is_schema_locked: session.is_schema_locked || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('💾 Session payload:', sessionPayload);

    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .upsert(sessionPayload)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Session save error:', sessionError);
      console.error('❌ Full session error details:', JSON.stringify(sessionError, null, 2));
      throw sessionError;
    }

    console.log('✅ Session saved successfully:', sessionData);

    // Delete existing messages for this session to avoid duplicates
    await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', session.id);

    // Insert all messages
    if (session.messages.length > 0) {
      console.log('💾 Saving messages:', session.messages.length);
      
      const messagesData = session.messages.map(message => ({
        id: message.id,
        session_id: session.id,
        user_id: userId,
        question: message.question,
        sql_query: message.sqlQuery,
        explanation: message.explanation,
        created_at: message.timestamp.toISOString()
      }));

      console.log('💾 Messages payload:', messagesData);

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(messagesData);

      if (messagesError) {
        console.error('❌ Messages save error:', messagesError);
        console.error('❌ Full messages error details:', JSON.stringify(messagesError, null, 2));
        throw messagesError;
      }

      console.log('✅ Messages saved successfully');
    }

    return { data: sessionData, error: null };
  } catch (error) {
    console.error('Error saving chat session:', error);
    return { data: null, error };
  }
};

export const getUserChatSessions = async (userId: string) => {
  try {
    console.log('🔍 Fetching chat sessions for user:', userId);
    console.log('🔍 User ID type:', typeof userId);
    console.log('🔍 User ID length:', userId?.length);
    
    // Test basic table access without any filtering
    const { data: tableTest, error: tableError } = await supabase
      .from('chat_sessions')
      .select('id, user_id')
      .limit(3);
    
    console.log('🔍 Table test result:', tableTest);
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      console.error('❌ Full error details:', JSON.stringify(tableError, null, 2));
      throw new Error(`Database table error: ${tableError.message}`);
    }

    // Get all sessions for the user with explicit column selection
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        user_id,
        title,
        schema_content,
        is_schema_locked,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (sessionsError) {
      console.error('❌ Sessions query error:', sessionsError);
      console.error('❌ Full error details:', JSON.stringify(sessionsError, null, 2));
      throw sessionsError;
    }

    console.log('✅ Found sessions:', sessionsData?.length || 0);

    // Get all messages for these sessions
    const sessionIds = sessionsData?.map(s => s.id) || [];
    let messagesData: any[] = [];
    
    if (sessionIds.length > 0) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          session_id,
          question,
          sql_query,
          explanation,
          created_at
        `)
        .in('session_id', sessionIds)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Messages query error:', messagesError);
        throw messagesError;
      }
      messagesData = messages || [];
    }

    // Combine sessions with their messages
    const sessions: ChatSession[] = sessionsData?.map(session => ({
      id: session.id,
      title: session.title,
      user_id: session.user_id,
      timestamp: new Date(session.updated_at),
      schema_content: session.schema_content || '',
      is_schema_locked: session.is_schema_locked || false,
      messages: messagesData
        .filter(msg => msg.session_id === session.id)
        .map(msg => ({
          id: msg.id,
          question: msg.question,
          sqlQuery: msg.sql_query,
          explanation: msg.explanation,
          timestamp: new Date(msg.created_at)
        }))
    })) || [];

    console.log('✅ Processed sessions:', sessions.length);
    return { data: sessions, error: null };
  } catch (error) {
    console.error('❌ Error fetching chat sessions:', error);
    return { data: [], error };
  }
};

export const deleteChatSession = async (sessionId: string, userId: string) => {
  try {
    // Delete messages first (cascade should handle this, but being explicit)
    await supabase
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    // Delete the session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return { error };
  }
};

// User Schemas
export const saveUserSchema = async (schemaContent: string, isLocked: boolean, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_schemas')
      .upsert({
        user_id: userId,
        schema_content: schemaContent,
        is_locked: isLocked,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving user schema:', error);
    return { data: null, error };
  }
};

export const getUserSchema = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_schemas')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    const schema: UserSchema | null = data ? {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    } : null;

    return { data: schema, error: null };
  } catch (error) {
    console.error('Error fetching user schema:', error);
    return { data: null, error };
  }
};

// ========================================
// SUBSCRIPTION MANAGEMENT FUNCTIONS
// ========================================

// Start free trial for new user
export const startFreeTrial = async (userId: string) => {
  try {
    console.log('🎁 Starting free trial for user:', userId);
    
    const { error } = await supabase.rpc('start_free_trial', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ Error starting free trial:', error);
      throw error;
    }

    console.log('✅ Free trial started successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error in startFreeTrial:', error);
    return { success: false, error };
  }
};

// Check user access and subscription status
export const checkUserAccess = async (userId: string): Promise<UserAccess> => {
  try {
    console.log('🔍 Checking user access for:', userId);
    
    const { data, error } = await supabase.rpc('check_user_access', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ Error checking user access:', error);
      throw error;
    }

    const accessData = data[0] as UserAccess;
    console.log('✅ User access status:', accessData);
    
    return accessData;
  } catch (error) {
    console.error('❌ Error in checkUserAccess:', error);
    // Return default denied access on error
    return {
      has_access: false,
      plan_type: 'none',
      queries_remaining: 0,
      days_remaining: 0,
      status: 'error'
    };
  }
};

// Increment query usage
export const incrementQueryUsage = async (userId: string): Promise<boolean> => {
  try {
    console.log('📊 Incrementing query usage for user:', userId);
    
    const { data, error } = await supabase.rpc('increment_query_usage', {
      p_user_id: userId
    });

    if (error) {
      console.error('❌ Error incrementing query usage:', error);
      return false;
    }

    const canUse = data as boolean;
    console.log('✅ Query usage result:', canUse ? 'allowed' : 'limit exceeded');
    
    return canUse;
  } catch (error) {
    console.error('❌ Error in incrementQueryUsage:', error);
    return false;
  }
};

// Get user subscription details
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  try {
    console.log('💳 Getting subscription for user:', userId);
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found - this is normal for new users
        console.log('ℹ️ No subscription found for user');
        return null;
      }
      console.error('❌ Error getting subscription:', error);
      throw error;
    }

    console.log('✅ Found subscription:', data);
    return data as UserSubscription;
  } catch (error) {
    console.error('❌ Error in getUserSubscription:', error);
    return null;
  }
};

// Create payment transaction record
export const createPaymentTransaction = async (
  userId: string,
  amount: number,
  planType: string,
  orderId?: string
): Promise<PaymentTransaction | null> => {
  try {
    console.log('💳 Creating payment transaction:', { userId, amount, planType });
    
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'INR',
        plan_type: planType,
        status: 'pending',
        razorpay_order_id: orderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating payment transaction:', error);
      throw error;
    }

    console.log('✅ Payment transaction created:', data);
    return data as PaymentTransaction;
  } catch (error) {
    console.error('❌ Error in createPaymentTransaction:', error);
    return null;
  }
};

// Update subscription after successful payment
export const upgradeUserSubscription = async (
  userId: string,
  planType: 'pro' | 'enterprise',
  razorpaySubscriptionId?: string,
  razorpayCustomerId?: string
) => {
  try {
    console.log('⬆️ Upgrading user subscription:', { userId, planType });
    
    const queriesLimit = planType === 'pro' ? 750 : -1; // Pro: 750, Enterprise: unlimited
    const subscriptionData = {
      user_id: userId,
      plan_type: planType,
      status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: planType === 'pro' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days for pro (₹1,390/month)
        null, // No end date for enterprise
      razorpay_subscription_id: razorpaySubscriptionId,
      razorpay_customer_id: razorpayCustomerId,
      queries_used: 0,
      queries_limit: queriesLimit,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error upgrading subscription:', error);
      throw error;
    }

    console.log('✅ Subscription upgraded successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error in upgradeUserSubscription:', error);
    return { success: false, error };
  }
};

// Initialize database tables (call this once to set up the schema)
export const initializeDatabase = async () => {
  // This function can be used to create the necessary tables
  // You would typically run this as a migration or setup script
  console.log('Database initialization should be done via Supabase SQL editor or migrations');
}; 