import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nero AI Custodial Wallet",
  description: "Manage your Nero blockchain assets using natural language with an AI-powered interface. Enjoy gasless transactions and interact via Twitter/X bot.",
  keywords: ["nero", "blockchain", "ai", "custodial", "wallet", "chatbot", "web3", "gasless", "twitter", "bot"],
  authors: [{ name: "Nero AI Team" }],
  category: "Technology",
  openGraph: {
    title: "Nero AI Custodial Wallet",
    description: "Manage your Nero blockchain assets using natural language with an AI-powered interface.",
    type: "website",
    locale: "en_US",
    siteName: "Nero AI Custodial Wallet",
  },
  twitter: {
    card: "player",
    title: "Nero AI Custodial Wallet",
    description: "Interact with your Nero wallet using AI! Features gasless transactions and a Twitter bot (@bankrextension0).",
    creator: "@bankrextension0",
    site: "@bankrextension0",
    images: ["https://closing-elf-internal.ngrok-free.app/auth/twitter/asset/MotherLogo.jpg"],
    players: [{
      playerUrl: "https://sacred-eagle-rm-silver.trycloudflare.com", 
      streamUrl: "",
      width: 480,
      height: 480
    }]
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  metadataBase: new URL("https://twitter-player.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
