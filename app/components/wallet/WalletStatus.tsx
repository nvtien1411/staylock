"use client";

import Link from "next/link";
import { shortAddress } from "@/app/lib/soroban/format";

type WalletStatusProps = {
  address: string;
  onConnect: () => void;
};

export function WalletStatus({ address, onConnect }: WalletStatusProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100 sm:inline-flex">
        Testnet
      </span>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-stone-200 sm:text-sm">
        <span className={`h-2 w-2 rounded-full ${address ? "bg-emerald-300 shadow-lg shadow-emerald-300/70" : "bg-stone-500"}`} />
        {shortAddress(address)}
      </span>
      <button
        onClick={onConnect}
        className="rounded-full bg-stone-50 px-4 py-2 text-xs font-bold text-stone-950 shadow-xl shadow-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-100 sm:px-5 sm:text-sm"
      >
        {address ? "Connected" : "Connect"}
      </button>
      <Link
        href="/"
        className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-stone-300 transition hover:bg-white/[0.08] lg:inline-flex"
      >
        Landing
      </Link>
    </div>
  );
}
