"use client"; // Add this directive

import React, { useState, useEffect } from 'react';

// No imports from '@neardefi/shade-agent-js' here

interface AccountBalanceDisplayProps {
  accountId: string | null;
}

export function AccountBalanceDisplay({ accountId }: AccountBalanceDisplayProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setBalance("0 NEAR"); // Default or reset state
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(new URL(`/api/near/get-balance?accountId=${accountId}`, window.location.origin), {
          cache: 'no-store', 
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch balance from API');
        }
        const balanceData = await response.json();
        setBalance(balanceData.formatted || 'Error fetching balance');
      } catch (err) {
        console.error("Error fetching balance in AccountBalanceDisplay:", err);
        setError(err instanceof Error ? err.message : 'Error fetching balance');
        setBalance(null); // Clear previous balance on error
      }
      setIsLoading(false);
    };

    fetchBalance();
  }, [accountId]); // Re-fetch when accountId changes

  if (isLoading) {
    return <span className="font-semibold">Loading...</span>;
  }
  if (error) {
    return <span className="text-red-500 font-semibold">Error: {error}</span>;
  }
  if (balance === null && !accountId) { // Initial state before accountId is set
      return <span className="font-semibold">0 NEAR</span>;
  }

  return <span className="font-semibold">{balance || 'N/A'}</span>;
}

interface WorkerDetailsProps {
  accountId: string | null;
}

export function WorkerDetails({ accountId }: WorkerDetailsProps) {
  const [workerInfo, setWorkerInfo] = useState<{ checksum: string; codehash: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      setWorkerInfo(null);
      setIsLoading(false);
      setError(null);
      return; 
    }

    const fetchWorkerDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(new URL('/api/near/get-worker-info', window.location.origin), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId: accountId,
            methodName: "get_worker",
            args: {
              account_id: accountId,
            },
          }),
          cache: 'no-store',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch worker details from API');
        }
        const data = await response.json();
        if (data && data.checksum && data.codehash) {
            setWorkerInfo(data);
        } else {
            // Handle cases where API returns success but no data, or unexpected structure
            setWorkerInfo(null);
            // Optionally set an error here if this state is unexpected
            // setError('Worker information not found or incomplete.');
            console.warn('WorkerDetails: API success but no worker info or unexpected structure', data);
        }
      } catch (err) {
        console.error("Error in WorkerDetails component fetching data:", err);
        setError(err instanceof Error ? err.message : 'Could not fetch worker details.');
        setWorkerInfo(null);
      }
      setIsLoading(false);
    };

    fetchWorkerDetails();
  }, [accountId]);

  if (!accountId) { // Don't render anything if no accountId was ever passed (and useEffect hasn't run for it)
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
        <p className="text-lg font-semibold text-gray-800">Worker Information:</p>
        <p>Loading worker details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 bg-red-50 p-4 rounded-lg shadow">
        <p className="text-lg font-semibold text-red-700">Worker Information Error:</p>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!workerInfo) { // After loading, if still no worker info (e.g. not registered, or API returned empty for a valid reason)
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
        <p className="text-lg font-semibold text-gray-800">Worker Information:</p>
        <p className="text-gray-600">No worker information available for this account.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
      <p className="text-lg font-semibold text-gray-800">Worker Information:</p>
      <p className="mt-2 bg-gray-100 p-3 rounded font-mono text-sm break-all">
        Checksum: {workerInfo.checksum}
      </p>
      <p className="mt-1 bg-gray-100 p-3 rounded font-mono text-sm break-all">
        Codehash: {workerInfo.codehash}
      </p>
    </div>
  );
}

// If you have other methods from "@neardefi/shade-agent-js" used elsewhere,
// you can create more server components here. 