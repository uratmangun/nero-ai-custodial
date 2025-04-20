"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useAccount, useChainId, useConfig, usePublicClient } from 'wagmi';
import { erc20Abi,formatUnits } from 'viem'
const NERO_CHAIN_PARAMS = {
  chainId: '0x2b1', // 689 in hex
  chainName: 'NERO Chain Testnet',
  nativeCurrency: {
    name: 'NERO',
    symbol: 'NERO',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-testnet.nerochain.io'],
  blockExplorerUrls: ['https://testnet.neroscan.io'],
  iconUrls: [], // Optionally add icon URLs if available
  testnet: true,
};

export default function Home() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageRoles, setMessageRoles] = useState<('user'|'assistant'|'tool')[]>([]);
  const [messageToolCallIds, setMessageToolCallIds] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isUserMessage, setIsUserMessage] = useState<boolean[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toolCalls, setToolCalls] = useState<any[][]>([]);
  const [respondedToolCalls, setRespondedToolCalls] = useState<boolean[][]>([]);
  const [loadingToolCalls, setLoadingToolCalls] = useState<boolean[][]>([]);
  const [toastError, setToastError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId()
  const config = useConfig()
  const publicClient = usePublicClient({ chainId })
 
  const truncateMiddle = (str: string, start = 6, end = 4) => {
    if (str.length <= start + end) return str;
    return `${str.slice(0, start)}...${str.slice(str.length - end)}`;
  };
  async function getBalance(walletAddress: `0x${string}`, tokenAddress?: `0x${string}`) {
    if (!publicClient) {
      throw new Error("Public client not ready");
    }
    if (!tokenAddress) {
      const nativeBalance = await publicClient.getBalance({ address: walletAddress });
      return formatUnits(nativeBalance, 18);
    }
    const [decimals, balance] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [walletAddress],
      }),
    ]);

    if (decimals === undefined || balance === undefined) {
      console.error("Failed to fetch contract values", { decimals, balance });
      return "0";
    }

    const formattedBalance = formatUnits(balance, decimals);
    console.log(`Formatted Balance: ${formattedBalance}`);
    return formattedBalance;
  }
  const formatDate = (date: Date): string => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const openModal = (row: number, col: number) => {
    setSelectedSquare({ row, col });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSquare(null);
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    // add user message
    setMessages(prev => [...prev, userMsg]);
    setMessageRoles(prev => [...prev, 'user']);
    setMessageToolCallIds(prev => [...prev, '']);
    setIsUserMessage(prev => [...prev, true]);
    setUsernames(prev => [...prev, address ? truncateMiddle(address) : 'Anonymous']);
    setDates(prev => [...prev, formatDate(new Date())]);
    setTimestamps(prev => [...prev, new Date().toLocaleTimeString()]);
    // placeholder for tool-call suggestions
    setToolCalls(prev => [...prev, []]);
    setRespondedToolCalls(prev => [...prev, []]);
    setLoadingToolCalls(prev => [...prev, []]);
    setLoading(true);
    try {
      // send full conversation history
      // build payload using tracked messageRoles and toolCallIds
      const payloadMessages = messages
        .map((m, i) => {
          if (messageRoles[i] === 'tool') {
            return { role: 'tool', tool_call_id: messageToolCallIds[i], content: m };
          }
          return { role: messageRoles[i], content: m };
        })
        .filter(msg => msg.content != null);
      // add current user message
      payloadMessages.push({ role: 'user', content: userMsg });
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        setToastError(errJson.error || 'Server error');
        return;
      }
      const { content: aiContent, tool_calls } = await res.json();
      // add AI response
      setMessages(prev => [...prev, aiContent]);
      setMessageRoles(prev => [...prev, 'assistant']);
      setMessageToolCallIds(prev => [...prev, '']);
      setIsUserMessage(prev => [...prev, false]);
      setUsernames(prev => [...prev, 'ai assistant']);
      setDates(prev => [...prev, formatDate(new Date())]);
      setTimestamps(prev => [...prev, new Date().toLocaleTimeString()]);
      // add tool calls for AI message
      setToolCalls(prev => [...prev, tool_calls || []]);
      setRespondedToolCalls(prev => [...prev, (tool_calls || []).map(() => false)]);
      setLoadingToolCalls(prev => [...prev, (tool_calls || []).map(() => false)]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setToastError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (msgIdx: number, callIdx: number) => {
    // set loading for this tool call
    setLoadingToolCalls(prev => {
      const arr = prev.map(inner => [...inner]);
      if (arr[msgIdx]) arr[msgIdx][callIdx] = true;
      return arr;
    });
    const tc = toolCalls[msgIdx]?.[callIdx];
    if (!tc) {
      setLoadingToolCalls(prev => {
        const arr = prev.map(inner => [...inner]);
        if (arr[msgIdx]) arr[msgIdx][callIdx] = false;
        return arr;
      });
      return;
    }
    try {
      const toolName = tc.function?.name || tc.name;
      if (toolName === 'check_address') {
        if (!isConnected) {
          setToastError('Please connect to a wallet first');
          return;
        }
        const aiMsg = address ? `Connected address: ${address}` : 'No address available';
        setMessages(prev => [...prev, aiMsg]);
        setMessageRoles(prev => [...prev, 'tool']);
        setMessageToolCallIds(prev => [...prev, tc.id]);
        setIsUserMessage(prev => [...prev, false]);
        setUsernames(prev => [...prev, 'ai assistant']);
        setDates(prev => [...prev, formatDate(new Date())]);
        setTimestamps(prev => [...prev, new Date().toLocaleTimeString()]);
        setToolCalls(prev => [...prev, []]);
        setRespondedToolCalls(prev => [...prev, []]);
        setLoadingToolCalls(prev => [...prev, []]);
      } else if (toolName === 'check_balance') {
        if (!isConnected) {
          setToastError('Please connect to a wallet first');
          return;
        }
        const args = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        const tokenAddress = args.tokenAddress;
        const addressParam = args.address || address;
        const nextPage = args.next_page;
        const lines: string[] = [];
        if (!addressParam) {
          lines.push('No address available');
        } else {
          lines.push(`Balances for ${addressParam === address ? 'your wallet' : addressParam}:`);
          // Native token
          const nativeBalance = await getBalance(addressParam);
          lines.push(`NERO: ${nativeBalance}`);
          // ERC20 tokens
          const tokenAddresses = [
            { name: 'DAI', address: '0x5d0E342cCD1aD86a16BfBa26f404486940DBE345' },
            { name: 'USDT', address: '0x1dA998CfaA0C044d7205A17308B20C7de1bdCf74' },
            { name: 'USDC', address: '0xC86Fed58edF0981e927160C50ecB8a8B05B32fed' },
            { name: 'TestToken', address: '0xA919e465871871F2D1da94BccAF3acaF9609D968' },
          ];
          for (const token of tokenAddresses) {
            const tokenBal = await getBalance(addressParam, token.address as `0x${string}`);
            lines.push(`${token.name}: ${tokenBal}`);
          }
        }
        const display = lines.join('\n');
        setMessages(prev => [...prev, display]);
        setMessageRoles(prev => [...prev, 'tool']);
        setMessageToolCallIds(prev => [...prev, tc.id]);
        setIsUserMessage(prev => [...prev, false]);
        setUsernames(prev => [...prev, 'ai assistant']);
        setDates(prev => [...prev, formatDate(new Date())]);
        setTimestamps(prev => [...prev, new Date().toLocaleTimeString()]);
        setToolCalls(prev => [...prev, []]);
        setRespondedToolCalls(prev => [...prev, []]);
        setLoadingToolCalls(prev => [...prev, []]);
      } else if (toolName === 'faucet') {
        // Show the faucet URL (customize the URL as needed)
        const faucetUrl = 'https://app.testnet.nerochain.io/faucet/' // <-- update if you have a different faucet
        setMessages(prev => [...prev, `faucet url: [https://app.testnet.nerochain.io/faucet/](${faucetUrl})`]);
        setMessageRoles(prev => [...prev, 'tool']);
        setMessageToolCallIds(prev => [...prev, tc.id]);
        setIsUserMessage(prev => [...prev, false]);
        setUsernames(prev => [...prev, 'ai assistant']);
        setDates(prev => [...prev, formatDate(new Date())]);
        setTimestamps(prev => [...prev, new Date().toLocaleTimeString()]);
        setToolCalls(prev => [...prev, []]);
        setRespondedToolCalls(prev => [...prev, []]);
        setLoadingToolCalls(prev => [...prev, []]);
      } else {
        setToastError('Unsupported tool: ' + toolName);
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      setToastError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoadingToolCalls(prev => {
        const arr = prev.map(inner => [...inner]);
        if (arr[msgIdx]) arr[msgIdx][callIdx] = false;
        return arr;
      });
      // hide buttons after accept
      setRespondedToolCalls(prev => {
        const arr = prev.map(inner => [...inner]);
        if (arr[msgIdx]) arr[msgIdx][callIdx] = true;
        return arr;
      });
    }
  };

  const handleReject = (msgIdx: number, callIdx: number) => {
    setRespondedToolCalls(prev => {
      const arr = prev.map(inner => [...inner]);
      if (arr[msgIdx]) arr[msgIdx][callIdx] = true;
      return arr;
    });
    const tc = toolCalls[msgIdx]?.[callIdx]; if (!tc) return;
    const aiMsg = `Tool call ${tc.function?.name || tc.name} was rejected.`;
    setMessages(prev => [...prev, aiMsg]);
    setMessageRoles(prev => [...prev, 'assistant']);
    setMessageToolCallIds(prev => [...prev, '']);
    setIsUserMessage(prev => [...prev, false]);
    setUsernames(prev => [...prev, 'ai assistant']);
    setDates(prev => [...prev, formatDate(new Date())]);
    setTimestamps(prev => [...prev, new Date().toLocaleTimeString()]);
    // keep arrays aligned
    setToolCalls(prev => [...prev, []]);
    setRespondedToolCalls(prev => [...prev, []]);
  };

  const addNeroChain = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('No Ethereum provider found');
      return;
    }
    try {
      // attempt to switch if chain exists
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NERO_CHAIN_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // chain not added, add it
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NERO_CHAIN_PARAMS],
          });
        } catch (addError: any) {
          console.error(addError);
          setToastError('Failed to add NERO Chain: ' + (addError instanceof Error ? addError.message : String(addError)));
        }
      } else {
        console.error(switchError);
        setToastError('Failed to switch to NERO Chain: ' + (switchError instanceof Error ? switchError.message : String(switchError)));
      }
    }
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4">
      {toastError && (
        <div className="toast toast-top toast-end fixed z-50">
          <div className="alert alert-error">
            <span>{toastError}</span>
            <button className="btn btn-sm btn-circle ml-2" onClick={() => setToastError(null)}>×</button>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">Nero AI custodial wallet</h1>
      <div className="mb-6 flex flex-col items-center justify-center">
        <ConnectButton />
        <button
          className="btn btn-sm btn-primary mt-2"
          onClick={addNeroChain}
        >
          Add NERO Chain to wallet
        </button>
      </div>
      <div className="w-full max-w-full mb-6">
        <div className="border border-base-content/20 rounded p-4 h-[80vh] overflow-y-auto bg-white w-full">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          ) : (
            messages.map((msg, idx) => {
              // Only render tool call UI for assistant messages (left/ai bubble)
              if (!isUserMessage[idx] && toolCalls[idx] && toolCalls[idx].length > 0) {
                return (
                  <div key={idx} className="mb-4 flex justify-start">
                    <div className="relative rounded-lg px-4 py-2 bg-yellow-100 text-black max-w-[80%]" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      <span className="absolute -top-4 right-0 text-xs text-black">{usernames[idx]}</span>
                      <p className="text-sm font-semibold">Tool calls:</p>
                      {toolCalls[idx].map((tc, tcIdx) => (
                        <div key={tc.id || tcIdx} className="mb-2">
                          <div className="font-mono text-xs font-bold">{tc.function?.name || tc.name}</div>
                          <pre className="text-xs bg-yellow-50 p-1 rounded whitespace-pre-wrap">
                            {(() => {
                              if (tc.function?.arguments) {
                                try { return JSON.stringify(JSON.parse(tc.function.arguments), null, 2); } catch { return tc.function.arguments; }
                              }
                              if (tc.arguments) return JSON.stringify(tc.arguments, null, 2);
                              return 'No arguments';
                            })()}
                          </pre>
                          {!respondedToolCalls[idx]?.[tcIdx] && (
                            <div className="mt-1 flex space-x-2 items-center">
                              <button
                                onClick={() => handleAccept(idx, tcIdx)}
                                className="btn btn-sm btn-success"
                                disabled={loadingToolCalls[idx]?.[tcIdx]}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(idx, tcIdx)}
                                className="btn btn-sm btn-error"
                                disabled={loadingToolCalls[idx]?.[tcIdx]}
                              >
                                Reject
                              </button>
                              {loadingToolCalls[idx]?.[tcIdx] && (
                                <svg
                                  className="animate-spin h-5 w-5 text-gray-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                          <span className="absolute -bottom-4 right-0 text-xs text-gray-500">{dates[idx]} {timestamps[idx]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              // Otherwise, render normal chat bubble
              return (
                <div key={idx} className={`mb-4 flex ${isUserMessage[idx] ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col items-end max-w-[80%]`}>
                    <span className="text-xs mb-1 text-black text-right self-end">{usernames[idx]}</span>
                    <div className={`rounded-lg px-4 py-2 ${isUserMessage[idx] ? 'bg-black text-white' : 'bg-gray-200 text-black'}`} style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {isUserMessage[idx] ? (
                        <p className="text-sm">{msg}</p>
                      ) : (
                        <div className="prose text-sm"><ReactMarkdown>{msg}</ReactMarkdown></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{dates[idx]} {timestamps[idx]}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex mt-2">
          <input
            type="text"
            className="flex-grow input input-bordered"
            placeholder="Type a message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
            disabled={loading}
          />
          <button className="btn btn-primary ml-2" onClick={handleSend} disabled={loading}>
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 pt-4 min-w-[900px] min-h-[700px] text-center relative text-black border-2 border-black/10 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-start w-full mb-4">
              {/* Spacer to help center title/button */}
              <div className="w-8"></div> 
              <div className="flex flex-col items-center flex-grow">
                <h2 className="mb-2 text-3xl font-semibold">Battle</h2>
                <button className="btn btn-accent mb-2 text-lg" onClick={() => router.push('/generate-bot')}>
                  Generate Bot
                </button>
              </div>
              <button
                className="text-2xl font-bold text-black hover:text-gray-700"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */} 
            <div className="flex-grow flex flex-col items-center justify-center">
              <p className="text-lg">Row: {selectedSquare?.row}, Col: {selectedSquare?.col}</p>
              <p className="mb-2 text-lg">list bot</p>

              <button className="btn btn-primary btn-lg mt-auto" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
