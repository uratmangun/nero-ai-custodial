"use client";
import React from "react";






export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Nero AI Custodial Wallet
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Experience the future of wallet interaction. Manage your assets using natural language with our AI-powered interface. Enjoy seamless, gasless transactions powered by the Nero Blockchain, and interact directly through our Twitter/X bot: 
          <a href="https://x.com/bankrextension0" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium">
            @bankrextension0
          </a>.
        </p>
        <a 
          href="/chat" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          AI Chat
        </a>
        <a 
          href="/near" 
          className="mx-4 inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          Fund the near shade worker agent
        </a>
      </div>
    </main>
  );
}
