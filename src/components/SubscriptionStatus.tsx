'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserAccess } from '@/lib/database';

interface SubscriptionStatusProps {
  onAccessDenied?: () => void;
}

export default function SubscriptionStatus({ onAccessDenied }: SubscriptionStatusProps) {
  const [subscriptionData, setSubscriptionData] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription-status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
        
        // If user doesn't have access, trigger the callback
        if (!data.has_access && onAccessDenied) {
          onAccessDenied();
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#151925] rounded-xl p-4 border border-[#1d2232]">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'text-blue-400';
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-gray-600';
      case 'pro': return 'bg-blue-600';
      case 'enterprise': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-[#151925] rounded-xl p-4 border border-[#1d2232]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPlanBadgeColor(subscriptionData.plan_type)}`}>
            {subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)}
          </span>
          <span className={`text-sm font-medium ${getStatusColor(subscriptionData.status)}`}>
            {subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1)}
          </span>
        </div>
        {subscriptionData.has_access && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">Active</span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {subscriptionData.queries_remaining !== -1 && (
          <div className="flex justify-between">
            <span className="text-gray-400">#Queries offered:</span>
            <span className="text-white font-medium">{subscriptionData.queries_remaining}</span>
          </div>
        )}
        
        {subscriptionData.queries_remaining === -1 && (
          <div className="flex justify-between">
            <span className="text-gray-400">#Queries offered:</span>
            <span className="text-green-400 font-medium">Unlimited</span>
          </div>
        )}

        {subscriptionData.days_remaining !== -1 && (
          <div className="flex justify-between">
            <span className="text-gray-400">
              {subscriptionData.status === 'trial' ? 'Trial ends in:' : 'Renewal in:'}
            </span>
            <span className="text-white font-medium">
              {subscriptionData.days_remaining} day{subscriptionData.days_remaining !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {!subscriptionData.has_access && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-xs text-center">
            {subscriptionData.status === 'expired' ? 'Your trial has expired' : 'Access restricted'}
          </p>
        </div>
      )}
    </div>
  );
} 