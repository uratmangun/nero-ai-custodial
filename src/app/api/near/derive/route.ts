import { KeyPair } from 'near-api-js';
// TODO: Verify this import path is correct in the nero-ai-custodial project
import { getAccountFromSeedPhrase } from '../../../lib/near'; 
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { NextResponse } from 'next/server';

export async function GET(request: Request) { // Added Request type
  try {
    const mnemonic = mnemonicGenerate();
    // This function needs to exist in the target project
    const keyPair = await getAccountFromSeedPhrase(mnemonic); 
    const accountId = Buffer.from(keyPair.publicKey.data).toString('hex');

    // SECURITY WARNING: Returning mnemonic phrases in APIs is highly discouraged.
    // Consider alternative key management strategies.
    // This is kept for functional equivalence but should be reviewed.

    return NextResponse.json({
      mnemonic: mnemonic, 
      accountId: accountId,
      publicKey: keyPair.publicKey.toString()
    });
  } catch (error) {
    console.error('Error deriving account:', error);
    // Provide a more generic error message to the client
    return NextResponse.json({ error: 'Failed to derive account' }, { status: 500 });
  }
} 