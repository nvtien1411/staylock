"use client";

import { useState } from "react";
import type { Listing } from "@/app/types/listing";
import { inputClass } from "@/app/components/ui/constants";
import { shortAddress } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";

type BookingModalProps = {
  listing: Listing;
  walletAddress: string;
  isCreating: boolean;
  onConfirm: (dayCheckin: string, dayCheckout: string) => void;
  onClose: () => void;
};

function xlmToDisplay(xlm: number) {
  return xlm % 1 === 0 ? `${xlm} XLM` : `${xlm.toFixed(2)} XLM`;
}

function stroopsToXlm(stroops: string) {
  try {
    const val = BigInt(stroops);
    const whole = val / BigInt(10000000);
    const rem = val % BigInt(10000000);
    const dec = rem.toString().padStart(7, "0").replace(/0+$/, "");
    return `${whole}${dec ? `.${dec}` : ""} XLM`;
  } catch {
    return `${stroops} stroops`;
  }
}

function dateToDay(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function BookingModal({ listing, walletAddress, isCreating, onConfirm, onClose }: BookingModalProps) {
  const [checkinDate, setCheckinDate] = useState(addDays(today(), 1));
  const [checkoutDate, setCheckoutDate] = useState(addDays(today(), 5));
  const [showDetails, setShowDetails] = useState(false);

  const nights = Math.max(1, Math.round((new Date(checkoutDate).getTime() - new Date(checkinDate).getTime()) / 86400000));
  const totalXlm = listing.nightlyPriceXlm * nights;

  function handleConfirm() {
    if (!walletAddress) return;
    const dayCheckin = dateToDay(checkinDate);
    const dayCheckout = dateToDay(checkoutDate);
    onConfirm(dayCheckin, dayCheckout);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0b09] shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-36 w-full"
          style={{
            background: `radial-gradient(circle at 28% 20%, rgba(255,255,255,0.28), transparent 14%), linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
          }}
        >
          <div className="flex h-full items-end justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">{listing.location}</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{listing.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {!walletAddress && (
            <div className="mb-5 rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4">
              <p className="text-sm font-semibold text-amber-100">Connect your wallet to reserve this stay.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <p className="mb-2 text-xs uppercase tracking-widest text-stone-500">Check-in</p>
              <input
                type="date"
                value={checkinDate}
                min={addDays(today(), 1)}
                onChange={(e) => setCheckinDate(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <p className="mb-2 text-xs uppercase tracking-widest text-stone-500">Check-out</p>
              <input
                type="date"
                value={checkoutDate}
                min={addDays(checkinDate, 1)}
                onChange={(e) => setCheckoutDate(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-stone-500">{nights} night{nights !== 1 ? "s" : ""}</p>
                <p className="mt-1 text-xl font-semibold text-white">{xlmToDisplay(totalXlm)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500">Escrow deposit</p>
                <p className="mt-1 text-sm font-bold text-amber-100">{stroopsToXlm(listing.escrowAmount)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              Your deposit is held in escrow on Stellar until check-in is confirmed. No intermediaries.
            </p>
          </div>

          <div className="mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-stone-400 transition hover:bg-white/[0.06] hover:text-stone-200"
            >
              <span>View escrow details</span>
              <span className="text-stone-600">{showDetails ? "▲" : "▼"}</span>
            </button>
            {showDetails && (
              <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500">Room ID</span>
                  <span className="font-mono text-stone-300">#{listing.roomId}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500">Host wallet</span>
                  <span className="font-mono text-stone-300">{shortAddress(listing.ownerWallet)}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500">Contract</span>
                  <span className="font-mono text-stone-300">{shortAddress(CONTRACT_ID)}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500">Network</span>
                  <span className="text-stone-300">Stellar Testnet</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={isCreating || !walletAddress}
            className="mt-5 w-full rounded-xl bg-amber-300 px-8 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/15 transition-all duration-200 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Securing reservation..." : walletAddress ? "Confirm & Reserve" : "Connect Wallet First"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-stone-600">
            Wallet approval required · Stellar Testnet · Freighter
          </p>
        </div>
      </div>
    </div>
  );
}
