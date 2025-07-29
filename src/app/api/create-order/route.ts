import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import { createPaymentTransaction } from '@/lib/database';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType } = await req.json();

    // Define pricing (in paise - ₹1 = 100 paise)
    const pricing = {
      pro: 156500, // $19 USD = ₹1565 = 156500 paise
    };

    if (!pricing[planType as keyof typeof pricing]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const amount = pricing[planType as keyof typeof pricing];

    // Create Razorpay order with shortened receipt ID (max 40 chars)
    const shortUserId = userId.slice(-10); // Last 10 characters of user ID
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `ord_${shortUserId}_${timestamp}`; // Format: ord_PSxmgQRs4b_12345678
    
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      payment_capture: true,
    });

    // Create payment transaction record
    await createPaymentTransaction(userId, amount, planType, order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 