'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  planType: 'pro';
  amount: number;
  buttonText: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export default function RazorpayPayment({
  planType,
  amount,
  buttonText,
  onSuccess,
  onError,
  className
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      alert('Please sign in to continue');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay payment
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SqlGPT',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              alert('Payment successful! Your subscription has been upgraded.');
              onSuccess?.();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            onError?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
} 