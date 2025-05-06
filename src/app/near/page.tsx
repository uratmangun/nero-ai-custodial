"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../../styles/Home.module.css"; // Adjusted path: TODO: Verify this path and file exist
import { contractView, getBalance, formatNearAmount } from "@neardefi/shade-agent-js"; // TODO: Verify installed
// import Overlay from "../../components/Overlay"; // Adjusted path: TODO: Create or copy this component

// Define basic types for imported functions (adjust if more specific types are known)
type GetBalanceResponse = { available: string; [key: string]: any };
type ContractViewArgs = { accountId: string; methodName: string; args: Record<string, any> };



const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Renamed component to avoid conflict with potential root Home
export default function NearPage() { 
  const [message, setMessage] = useState<React.ReactNode>("");
  const [accountId, setAccountId] = useState<string>("");
  const [balance, setBalance] = useState<GetBalanceResponse>({ available: "0" });

  const setMessageHide = async (message: React.ReactNode, dur = 3000) => {
    setMessage(message);
    await sleep(dur);
    setMessage("");
  };

  const getBalanceSleep = async (accountId: string) => {
    await sleep(1000);
    const balanceResult = await getBalance(accountId);

    if (balanceResult.available === "0") {
      getBalanceSleep(accountId);
      return;
    }
    setBalance(balanceResult);
  };

  const deriveAccount = async () => {
    // API paths are relative to the domain root, not the page component
    const res = await fetch("/api/derive").then((r) => r.json()); // TODO: Verify /api/derive exists
    setAccountId(res.accountId);
    getBalanceSleep(res.accountId);
  };

 

  return (
    // TODO: Consider using App Router <Head> or Metadata API instead of next/head
    <div className={styles.container}>
      <Head>
        {/* TODO: Update title and favicon */}
        <title>Based Agent Template - NEAR</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <Overlay message={message} /> */ } {/* Commented out until component exists */}

      <main className={styles.main}>
        {/* TODO: Update title and description */}
        <h1 className={styles.title}>Based Agent Template - NEAR Interface</h1>
        <ol>
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
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Step 1.</h3>
            <p>
              Fund Worker Agent account:
              <br />
              <br />
              {accountId?.length >= 24
                ? accountId?.substring(0, 24) + "..."
                : accountId}
              <br />
              <button
                className={styles.btn}
                onClick={() => {
                  if(navigator.clipboard) { // Check clipboard API exists
                      navigator.clipboard.writeText(accountId);
                      setMessageHide("copied", 500);
                  } else {
                      setMessageHide("Clipboard not available", 1500);
                  }
                }}
              >
                copy
              </button>
              <br />
              <br />
              balance: {balance ? formatNearAmount(balance.available, 4) : 0}
            </p>
          </div>

          {balance.available !== "0" && (
            <>
              <a
                href="#"
                className={styles.card}
                onClick={async () => {
                  setMessage("Registering Worker");

                  let res;
                  try {
                    // API paths relative to root
                    res = await fetch("/api/register").then((r) => r.json()); // TODO: Verify /api/register
                  } catch (e) {
                    console.log(e);
                    setMessageHide(
                      "register_worker error: " + JSON.stringify(e, null, 4)
                    );
                  }

                  setMessageHide(
                    <>
                      <p>register_worker response:</p>
                      <p className={styles.code}>
                        registered: {JSON.stringify(res?.registered)}
                      </p>
                    </>,
                    // Removed incorrect boolean argument - fixed in previous step but was still present in read content?
                  );
                }}
              >
                <h3>Step 2.</h3>
                <p>
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
                className={styles.card}
                onClick={async () => {
                  setMessage(`Calling get_worker for ${accountId}`);

                  let res;
                  try {
                    res = await contractView({
                      accountId: accountId,
                      methodName: "get_worker",
                      args: {
                        account_id: accountId,
                      },
                    });

                    console.log(res);
                  } catch (e) {
                    console.log(e);
                    setMessageHide(
                      "get_worker error: " + JSON.stringify(e, null, 4)
                      // Removed incorrect boolean argument
                    );
                  }

                  if (res) {
                    setMessageHide(
                      <>
                        <p>get_worker response:</p>
                        <p className={styles.code}>
                          checksum: {res.checksum}
                        </p>
                        <p className={styles.code}>
                          codehash: {res.codehash}
                        </p>
                      </>,
                      // Removed incorrect boolean argument
                    );
                  }
                }}
              >
                <h3>Get Worker Info</h3>
                <p>(registered only)</p>
              </a>

              <a
                href="#"
                className={styles.card}
                onClick={async () => {
                  setMessage("Calling is_verified_by_codehash");
                  
                  // API paths relative to root
                  const res = await fetch("/api/isVerified").then((r) => r.json()); // TODO: Verify /api/isVerified

                  setMessageHide(
                    <>
                      <p>
                        is_verified_by_codehash
                        response:
                      </p>
                      <p className={styles.code}>
                        verified: {JSON.stringify(res?.verified)}
                      </p>
                    </>,
                    // Removed incorrect boolean argument
                  );
                }}
              >
                <h3>Call Protected Method</h3>
                <p>(registered only)</p>
              </a>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://proximity.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by {/* TODO: Ensure these images exist in the public folder */}
          <img
            src="/symbol.svg"
            alt="Proximity Logo"
            className={styles.logo}
          />
          <img
            src="/wordmark_black.svg"
            alt="Proximity Logo"
            className={styles.wordmark}
          />
        </a>
      </footer>
    </div>
  );
} 