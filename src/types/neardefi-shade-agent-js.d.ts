declare module '@neardefi/shade-agent-js' {
  export function getBalance(accountId: string): Promise<{ available: string; [key: string]: any }>;
  export function contractView(args: { accountId: string; methodName: string; args: Record<string, any> }): Promise<any>;
  export function formatNearAmount(amount: string, decimals?: number): string;
  // Add other functions and types if known or as needed
} 