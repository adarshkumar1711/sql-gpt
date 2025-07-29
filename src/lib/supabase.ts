import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase client configured for database operations only
// Authentication is now handled by Clerk
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test Supabase database connection
export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase database connection...');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key exists:', !!supabaseAnonKey);
  
  try {
    // Test with a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    console.log('Database test result:', { success: !error, error });
    return { success: !error, data, error };
  } catch (err) {
    console.error('Database connection test failed:', err);
    return { success: false, error: err };
  }
} 