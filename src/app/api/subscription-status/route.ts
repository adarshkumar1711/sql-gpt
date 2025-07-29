import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserAccess, startFreeTrial } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user access
    const accessData = await checkUserAccess(userId);
    
    // If user needs trial, start it automatically
    if (accessData.status === 'needs_trial') {
      await startFreeTrial(userId);
      // Check again after starting trial
      const newAccessData = await checkUserAccess(userId);
      return NextResponse.json(newAccessData);
    }

    return NextResponse.json(accessData);

  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
} 