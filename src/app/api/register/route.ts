import { NextResponse } from 'next/server';
// TODO: Verify these import paths are correct in the nero-ai-custodial project
import { initNear } from '../../../lib/near'; 
import { getAttestation } from '../../../lib/phala'; // Assuming Phala logic exists

export async function POST(request) { // Assuming POST based on original req.body usage
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    // These functions/objects need to exist in the target project
    const { contract, near } = await initNear(); 
    const { quoteHex, quoteCollateralHex, compose } = await getAttestation();

    // TODO: Confirm if 'getAttestation' returns 'compose' with the necessary hash
    const codehash = compose?.services?.['shade-agent']?.image_sha256;

    if (!codehash) {
      console.error('Could not extract codehash from attestation compose data');
      return NextResponse.json({ error: 'Failed to get codehash from attestation' }, { status: 500 });
    }

    const tx = await contract.register_worker(
      {
        quoteHex: quoteHex,
        quoteCollateralHex: quoteCollateralHex,
        codehash: codehash,
      },
      '300000000000000', // Gas
      '10000000000000000000000' // Deposit (0.01 NEAR) - adjust if needed
    );

    return NextResponse.json({ transactionId: tx.transaction.hash });

  } catch (error) {
    console.error('Error registering worker:', error);
    return NextResponse.json({ error: 'Failed to register worker' }, { status: 500 });
  }
} 