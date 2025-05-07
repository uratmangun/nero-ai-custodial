import { NextResponse } from 'next/server';
import { contractView } from '@neardefi/shade-agent-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, methodName, args } = body;

    if (!accountId || !methodName) {
      return NextResponse.json({ error: 'accountId and methodName are required' }, { status: 400 });
    }

    const result = await contractView({
      accountId: accountId,
      methodName: methodName,
      args: args || {},
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error in contractView (/api/near/get-worker-info):', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to call contractView';
    return NextResponse.json({ error: 'Failed to execute contract view', details: errorMessage }, { status: 500 });
  }
} 