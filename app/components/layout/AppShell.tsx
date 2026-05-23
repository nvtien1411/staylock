"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { shortAddress } from "@/app/lib/soroban/format";

type AppShellProps = {
  address: string;
  onConnect: () => void;
  role: "guest" | "host";
  navItems: Array<{ label: string; href: string }>;
  sidebarNote: string;
  headerTitle: string;
  children: ReactNode;
};

export function AppShell({
  address,
  onConnect,
  role,
  navItems,
  sidebarNote,
  headerTitle,
  children,
}: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070604] text-stone-50">
      <div className="absolute left-[-20rem] top-[-20rem] h-[40rem] w-[40rem] rounded-full bg-amber-300/10 blur-3xl" />
      <div className="absolute right-[-18rem] top-20 h-[36rem] w-[36rem] rounded-full bg-sky-300/8 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[96rem] gap-5 px-4 py-5 lg:grid-cols-[15rem_1fr] lg:px-6">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 shadow-lg shadow-black/20 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 transition hover:bg-white/[0.08]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-xs font-bold text-stone-950">
                SL
              </div>
              <div>
                <p className="text-sm font-semibold text-white">StayLock</p>
                <p className="text-xs text-stone-500">{role === "host" ? "Host workspace" : "Guest marketplace"}</p>
              </div>
            </Link>

            <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="whitespace-nowrap rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-sm text-stone-400 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:block">
              <div className="space-y-1">
                <Link
                  href="/marketplace"
                  className="flex w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-xs text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Guest Marketplace
                </Link>
                <Link
                  href="/host"
                  className="flex w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5 text-xs text-stone-500 transition hover:bg-white/[0.06] hover:text-stone-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Host Portal
                </Link>
              </div>
            </div>

            <div className="mt-auto hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-xs leading-5 text-stone-500 lg:block">
              {sidebarNote}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <header className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">{role === "host" ? "Host" : "Guest"}</p>
              <h1 className="mt-1 text-xl font-semibold text-white">{headerTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-300 sm:inline-flex">
                Testnet
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-stone-300">
                <span className={`h-1.5 w-1.5 rounded-full ${address ? "bg-emerald-400" : "bg-stone-600"}`} />
                {shortAddress(address)}
              </span>
              <button
                onClick={onConnect}
                className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-stone-950 transition hover:bg-amber-100"
              >
                {address ? "Connected" : "Connect"}
              </button>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
