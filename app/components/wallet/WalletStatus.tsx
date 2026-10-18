"use client";

import Link from "next/link";
import { Wallet, Check, ExternalLink } from "lucide-react";
import { shortAddress } from "@/app/lib/soroban/format";

type WalletStatusProps = {
  address: string;
  onConnect: () => void;
};

export function WalletStatus({ address, onConnect }: WalletStatusProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 sm:inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        Mạng Stellar Testnet
      </span>

      <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-1.5 font-mono text-xs text-stone-200">
        <span
          className={`h-2 w-2 rounded-full ${
            address ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-stone-600"
          }`}
        />
        {shortAddress(address)}
      </span>

      <button
        onClick={onConnect}
        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-md ${
          address
            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
            : "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-stone-950 shadow-amber-500/15 hover:brightness-105 active:scale-[0.98]"
        }`}
      >
        <Wallet className="h-3.5 w-3.5" />
        <span>{address ? "Đã kết nối ví" : "Kết nối ví"}</span>
      </button>

      <Link
        href="/"
        className="hidden rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-stone-300 transition hover:bg-white/[0.08] hover:text-white lg:inline-flex"
      >
        Trang chủ
      </Link>
    </div>
  );
}
