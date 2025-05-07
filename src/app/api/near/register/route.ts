import { NextResponse } from 'next/server';
// TODO: Verify these import paths are correct in the nero-ai-custodial project
import { initNear } from '../../../lib/near'; 
import { getAttestation } from '../../../lib/phala'; // Assuming Phala logic exists

export async function POST(request: Request) { // Added Request type
  try {
    // The page.tsx sends accountId in the body, let's use it or decide if it's needed.
    // For now, assuming it might be used for validation or logging, but not directly by contract.register_worker args shown.
    const { accountId: clientAccountId } = await request.json(); 

    // if (!clientAccountId) {
    // return NextResponse.json({ error: 'accountId from client is required for registration' }, { status: 400 });
    // }

    // These functions/objects need to exist in the target project
    const { contract, near } = await initNear(); 
    const { quoteHex, quoteCollateralHex, compose } = await getAttestation();

    // TODO: Confirm if 'getAttestation' returns 'compose' with the necessary hash
    const codehash = compose?.services?.['shade-agent']?.image_sha256;

    if (!codehash) {
      console.error('Could not extract codehash from attestation compose data');
      return NextResponse.json({ error: 'Failed to get codehash from attestation' }, { status: 500 });
    }

    // The original page.tsx call to /api/register returned { registered: ... }
    // The contract.register_worker likely returns a transaction result or similar.
    // We need to map this to the expected { registered: boolean } or similar structure.
    // For now, let's assume a successful transaction means registered: true.
    const tx = await contract.register_worker(
      {
        quoteHex: quoteHex,
        quoteCollateralHex: quoteCollateralHex,
        codehash: codehash,
      },
      '300000000000000', // Gas
      '10000000000000000000000' // Deposit (0.01 NEAR) - adjust if needed
    );

    // Check transaction outcome if possible. For simplicity, assuming success here.
    // A more robust check would inspect tx.status or similar fields.
    const registered = tx && tx.transaction && tx.transaction.hash; // Crude check, improve based on actual tx object

    return NextResponse.json({ registered: !!registered, transactionId: tx?.transaction?.hash });

  } catch (error) {
    console.error('Error registering worker:', error);
    return NextResponse.json({ registered: false, error: 'Failed to register worker', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 