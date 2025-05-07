import { NextResponse } from 'next/server';
// TODO: Verify this import path is correct in the nero-ai-custodial project
import { initNear } from '../../../lib/near';

export async function POST(request: Request) { // Added Request type
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    // initNear and contract need to exist in the target project
    const { contract } = await initNear(); 

    // The method call needs to match the contract. Previously was contract.is_verified
    // This will likely be contract.is_verified_by_codehash based on page.tsx context
    // Assuming the actual method on the contract object is `is_verified_by_codehash`
    const verified = await contract.is_verified_by_codehash({ account_id: accountId });

    return NextResponse.json({ verified }); // Return { verified: ... }

  } catch (error) {
    console.error('Error checking verification:', error);

    // Check for specific NEAR errors if possible
    // @ts-ignore TODO: type near-api-js errors properly
    if (error.type === 'AccountDoesNotExist') {
        return NextResponse.json({ verified: false, error: `Account ${accountId} does not exist.` });
    // @ts-ignore TODO: type near-api-js errors properly
    } else if (error.message && error.message.includes('Worker not found')) {
        // Assuming the contract might throw this specific error string
        return NextResponse.json({ verified: false, error: `Worker ${accountId} not registered.` });
    } else {
        // Generic error for other issues
        return NextResponse.json({ error: 'Failed to check verification status' , details: error instanceof Error ? error.message : String(error)}, { status: 500 });
    }
  }
} 