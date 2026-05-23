"use client";

import type { ReactNode } from "react";
import { WalletStatus } from "@/app/components/wallet/WalletStatus";

const guestNavItems = [
  { label: "Overview", href: "#overview" },
  { label: "Browse Stays", href: "#listings" },
  { label: "My Reservation", href: "#reservations" },
  { label: "Escrow", href: "#escrow" },
];

const hostNavItems = [
  { label: "Overview", href: "#overview" },
  { label: "Host Dashboard", href: "#host" },
  { label: "My Listings", href: "#listings" },
  { label: "Reservations", href: "#reservations" },
  { label: "Escrow", href: "#escrow" },
];

type DashboardShellProps = {
  address: string;
  onConnect: () => void;
  isHost: boolean;
  children: ReactNode;
};

export function DashboardShell({ address, onConnect, isHost, children }: DashboardShellProps) {
  const navItems = isHost ? hostNavItems : guestNavItems;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070604] text-stone-50">
      <div className="absolute left-[-14rem] top-[-18rem] h-[38rem] w-[38rem] animate-pulse rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute right-[-16rem] top-32 h-[34rem] w-[34rem] animate-pulse rounded-full bg-cyan-300/14 blur-3xl" />
      <div className="absolute bottom-[20rem] left-[20%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_75%_8%,rgba(251,191,36,0.14),transparent_24%),linear-gradient(135deg,rgba(120,113,108,0.08),transparent_45%,rgba(8,47,73,0.2))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="relative mx-auto grid w-full max-w-[96rem] gap-6 px-4 py-5 lg:grid-cols-[17rem_1fr] lg:px-6">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-black/25 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-stone-50 via-amber-200 to-amber-500 text-sm font-black text-stone-950 shadow-lg shadow-amber-300/20">
                SL
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-white">StayLock</p>
                <p className="text-xs text-stone-500">{isHost ? "Host workspace" : "Guest marketplace"}</p>
              </div>
            </div>

            <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-stone-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto hidden rounded-3xl border border-amber-200/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-50 lg:block">
              {isHost
                ? "Manage your properties, review reservations, and release settlement — all from your wallet."
                : "Browse escrow-protected stays, reserve with your wallet, and track settlement on-chain."}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-black/20 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">{isHost ? "Host" : "Guest"}</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {isHost ? "Host dashboard" : "Decentralized booking marketplace"}
              </h1>
            </div>
            <WalletStatus address={address} onConnect={onConnect} />
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
