import { NextResponse } from 'next/server';
// TODO: Verify this import path is correct in the nero-ai-custodial project
import { initNear } from '../../../lib/near';

export async function POST(request) { // Assuming POST based on original req.body usage
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    // initNear and contract need to exist in the target project
    const { contract } = await initNear(); 

    const isVerified = await contract.is_verified({ account_id: accountId });

    return NextResponse.json({ isVerified });

  } catch (error) {
    console.error('Error checking verification:', error);

    // Check for specific NEAR errors if possible
    if (error.type === 'AccountDoesNotExist') {
        return NextResponse.json({ isVerified: false, error: `Account ${accountId} does not exist.` });
    } else if (error.message && error.message.includes('Worker not found')) {
        // Assuming the contract might throw this specific error string
        return NextResponse.json({ isVerified: false, error: `Worker ${accountId} not registered.` });
    } else {
        // Generic error for other issues
        return NextResponse.json({ error: 'Failed to check verification status' }, { status: 500 });
    }
  }
} 