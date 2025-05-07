"use client";
import React, { useState, Suspense } from "react";

import { AccountBalanceDisplay, WorkerDetails } from './components/NearServerComponents';



const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Renamed component to avoid conflict with potential root Home
export default function NearPage() { 
  const [message, setMessage] = useState<React.ReactNode>("");
  const [accountId, setAccountId] = useState<string>("");
  const [balance, setBalance] = useState<{ available: string, formatted?: string }>({ available: "0" });
  const [showWorkerAccountId, setShowWorkerAccountId] = useState<string | null>(null);

  const setMessageHide = async (messageContent: React.ReactNode, dur = 3000) => {
    setMessage(messageContent);
    await sleep(dur);
    setMessage("");
  };

  const getBalanceSleep = async (accountIdForBalance: string) => {
    await sleep(1000);
    try {
      // Fetch balance from the new API route /api/near/get-balance
      const response = await fetch(`/api/near/get-balance?accountId=${accountIdForBalance}`);
      if (!response.ok) {
        // Handle API errors (e.g., log them, show a generic error message)
        console.error("Error fetching balance from API:", await response.text());
        // Optionally retry or set an error state
        getBalanceSleep(accountIdForBalance); // Simple retry, might need backoff
        return;
      }
      const balanceResult = await response.json();

      if (balanceResult.available === "0") {
        getBalanceSleep(accountIdForBalance);
        return;
      }
      setBalance(balanceResult); // Update client state
    } catch (error) {
      console.error("Client error in getBalanceSleep:", error);
      // Optionally retry or set an error state
      getBalanceSleep(accountIdForBalance); // Simple retry, might need backoff
    }
  };

  const deriveAccount = async () => {
    // API paths are relative to the domain root, not the page component
    const res = await fetch("/api/near/derive").then((r) => r.json()); // Updated path
    setAccountId(res.accountId);
    getBalanceSleep(res.accountId);
  };

  return (
    // TODO: Consider using App Router <Head> or Metadata API instead of next/head
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
  
      {/* <Overlay message={message} /> */ } {/* Commented out until component exists */}

      <main className="flex-grow flex flex-col items-center justify-center py-8">
        {/* TODO: Update title and description */}
        <h1 className="text-5xl font-bold text-center mb-10 text-black">Fund the worker agent - NEAR Interface</h1>
        <button onClick={deriveAccount} className="mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out">
          Connect & Derive Account (Click if account not shown)
        </button>
        <ol className="list-decimal list-inside space-y-2 mb-8 text-lg bg-gray-50 p-6 rounded-lg shadow text-black">
          <li>
            This worker agent app is designed to run on Phala Cloud
            inside a TEE and be verified by the worker's smart
            contract.
          </li>
          <li>
            The app derives a key that is unique to the running
            instance and TEE hardware.
          </li>
          <li>
            The app calls the worker smart contract and registers
            itself by using the remote attestation quote.
          </li>
          <li>Follow the steps below to verify your app.</li>
        </ol>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          <div className="p-6 border rounded-lg shadow-lg bg-white">
            <h3 className="text-2xl font-semibold mb-3 text-black">Step 1.</h3>
            <div className="text-black">
              Fund Worker Agent account:
              <br />
              <br />
              {accountId?.length >= 24
                ? accountId?.substring(0, 24) + "..."
                : accountId || "Click 'Connect & Derive Account' above"}
              <br />
              <button
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                onClick={() => {
                  if(navigator.clipboard && accountId) { 
                      navigator.clipboard.writeText(accountId);
                      setMessageHide("copied", 500);
                  } else if (!accountId) {
                      setMessageHide("No account ID to copy", 1500);
                  } else {
                      setMessageHide("Clipboard not available", 1500);
                  }
                }}
                disabled={!accountId}
              >
                copy
              </button>
              <br />
              <br />
              Balance:{" "}
              <Suspense fallback={<span className="font-semibold">Loading balance...</span>}>
                <AccountBalanceDisplay accountId={accountId} />
              </Suspense>
            </div>
          </div>

          {balance.available !== "0" && accountId && (
            <>
              <a
                href="#"
                className="block p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white cursor-pointer"
                onClick={async () => {
                  setMessage("Registering Worker");
                  let res;
                  try {
                    res = await fetch("/api/near/register", { // Updated path
                      method: 'POST', // Assuming register is a POST, adjust if GET
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ accountId: accountId }) // Send necessary data
                    }).then((r) => r.json()); 
                  } catch (e) {
                    console.log(e);
                    setMessageHide(
                      "register_worker error: " + JSON.stringify(e, null, 4)
                    );
                  }
                  setMessageHide(
                    <>
                      <p className="text-lg font-medium">register_worker response:</p>
                      <p className="mt-2 bg-gray-100 p-3 rounded font-mono text-sm break-all">
                        registered: {JSON.stringify(res?.registered)}
                      </p>
                    </>,
                  );
                }}
              >
                <h3 className="text-2xl font-semibold mb-3 text-black">Step 2.</h3>
                <p className="text-black">
                  Register the Worker Agent in the smart
                  contract:
                  <br />
                  <br />
                  {/* TODO: Ensure env var is available */}
                  {process.env.NEXT_PUBLIC_contractId}
                </p>
              </a>

              <a
                href="#"
                className="block p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white cursor-pointer"
                onClick={() => {
                  if (accountId) {
                    setMessage(`Fetching worker info for ${accountId}`);
                    setShowWorkerAccountId(accountId); 
                  } else {
                    setMessageHide("Account ID not available.")
                  }
                }}
              >
                <h3 className="text-2xl font-semibold mb-3 text-black">Get Worker Info</h3>
                <p className="text-black">(registered only)</p>
              </a>
              {showWorkerAccountId && (
                <Suspense fallback={<div className="p-6 border rounded-lg shadow-lg bg-white"><p>Loading worker details...</p></div>}>
                  <WorkerDetails accountId={showWorkerAccountId} />
                </Suspense>
              )}

              <a
                href="#"
                className="block p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white cursor-pointer"
                onClick={async () => {
                  setMessage("Calling is_verified_by_codehash");
                  const res = await fetch("/api/near/isVerified", { // Updated path
                    method: 'POST', // Assuming isVerified is a POST, adjust if GET
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountId: accountId }) // Send necessary data
                  }).then((r) => r.json()); 
                  setMessageHide(
                    <>
                      <p className="text-lg font-medium">
                        is_verified_by_codehash
                        response:
                      </p>
                      <p className="mt-2 bg-gray-100 p-3 rounded font-mono text-sm break-all">
                        verified: {JSON.stringify(res?.verified)}
                      </p>
                    </>,
                  );
                }}
              >
                <h3 className="text-2xl font-semibold mb-3 text-black">Call Protected Method</h3>
                <p className="text-black">(registered only)</p>
              </a>
            </>
          )}
        </div>
      </main>

      <footer className="w-full border-t border-gray-200 flex justify-center items-center py-6 mt-12">
        <a
          href="https://proximity.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          Powered by {/* TODO: Ensure these images exist in the public folder */}
          <img
            src="/symbol.svg"
            alt="Proximity Logo"
            className="h-7 w-auto mr-2 ml-2"
          />
          <img
            src="/wordmark_black.svg"
            alt="Proximity Logo"
            className="h-7 w-auto"
          />
        </a>
      </footer>
    </div>
  );
} 