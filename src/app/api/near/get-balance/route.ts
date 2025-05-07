import { NextResponse } from 'next/server';
import { getBalance, formatNearAmount } from '@neardefi/shade-agent-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  try {
    const balanceData = await getBalance(accountId);
    const formattedBalance = formatNearAmount(balanceData.available, 4);
    // Return the raw available balance and the formatted one
    return NextResponse.json({ 
      available: balanceData.available, 
      formatted: `${formattedBalance} NEAR` 
    });
  } catch (error) {
    console.error('API Error fetching and formatting balance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
    return NextResponse.json({ error: 'Failed to fetch or format balance', details: errorMessage }, { status: 500 });
  }
} 