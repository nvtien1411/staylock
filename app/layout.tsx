import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#07080b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "StayLock — Private Decentralized Travel Escrow Protocol",
  description:
    "Next-generation non-custodial travel escrow protocol on Stellar & Soroban. Zero intermediary commission, wallet-native reservations, and trustless settlement for premium stays.",
  keywords: [
    "Stellar",
    "Soroban",
    "Smart Contract Escrow",
    "Web3 Travel",
    "Freighter Wallet",
    "Luxury Stays",
    "Decentralized Booking",
  ],
  authors: [{ name: "StayLock Protocol Team" }],
  openGraph: {
    title: "StayLock — Private Decentralized Travel Escrow",
    description: "Book premium stays with cryptographic escrow on Stellar Soroban.",
    type: "website",
    locale: "en_US",
    siteName: "StayLock",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayLock — Private Decentralized Travel Escrow",
    description: "Book premium stays with cryptographic escrow on Stellar Soroban.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#07080b] text-stone-100">{children}</body>
    </html>
  );
}
