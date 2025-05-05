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
  title: "Mother Agents Battle Royale",
  description: "Vote in epic head-to-head battles and crown the most legendary AI personality!",
  keywords: ["twitter", "video", "player", "downloader", "social media"],
  authors: [{ name: "Twitter Player Team" }],
  category: "Technology",
  openGraph: {
    title: "Mother Agents Battle Royale",
    description: "Vote in epic head-to-head battles and crown the most legendary AI personality!",
    type: "website",
    locale: "en_US",
    siteName: "Twitter Player",
  },
  twitter: {
    card: "player",
    title: "Mother Agents Battle Royale",
    description: "Vote in epic head-to-head battles and crown the most legendary AI personality!",
    creator: "@twitterplayer",
    site: "@hellomother_ai",
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
