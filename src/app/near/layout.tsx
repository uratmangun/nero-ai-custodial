import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fund the near shade worker agent",
  description: "Fund the near shade worker agent",
  keywords: ["near", "blockchain", "ai", "custodial", "wallet", "chatbot", "web3", "gasless", "twitter", "bot"],
  authors: [{ name: "Nero AI Team" }],
  category: "Technology",
  openGraph: {
    title: "Fund the near shade worker agent",
    description: "Fund the near shade worker agent",
    type: "website",
    locale: "en_US",
    siteName: "Fund the near shade worker agent",
  },
  twitter: {
    card: "player",
    title: "Fund the near shade worker agent",
    description: "Fund the near shade worker agent",
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
       
          {children}
       
      </body>
    </html>
  );
}
