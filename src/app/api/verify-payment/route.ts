import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { upgradeUserSubscription } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planType 
    } = await req.json();

    // Verify the payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update payment transaction status
    await supabase
      .from('payment_transactions')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', userId);

    // Upgrade user subscription
    const result = await upgradeUserSubscription(userId, planType);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified and subscription upgraded' 
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 