"use client";

import { useState } from "react";
import { glassCard } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage, shortAddress } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";

type ReservationStatusCardProps = {
  liveTone: { label: string; color: string; dot: string; title: string };
  createResult: Record<string, unknown> | null;
  createStatus: string;
  bookingId: string;
  isLoading: boolean;
  getBooking: () => void;
};

export function ReservationStatusCard({ liveTone, createResult, createStatus, bookingId, isLoading, getBooking }: ReservationStatusCardProps) {
  const [showChainDetails, setShowChainDetails] = useState(false);
  const createdBookingId = createResult?.bookingId ?? (bookingId || undefined);
  const transactionHash = createResult?.transactionHash;
  const explorerUrl = getExplorerUrl(transactionHash);
  const showBookingId = typeof createdBookingId === "string" || typeof createdBookingId === "number";
  const hasResult = Boolean(createResult?.success);

  return (
    <section className={`${glassCard} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">Reservation status</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight">{liveTone.title}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${liveTone.color}`}>{liveTone.label}</span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full ${liveTone.dot}`} />
          <p className="text-sm text-stone-300">{statusMessage(createResult, createStatus)}</p>
        </div>

        {showBookingId && (
          <div className="mt-4 rounded-xl border border-amber-200/20 bg-amber-200/10 p-4">
            <p className="text-xs uppercase tracking-widest text-amber-100/70">Reservation code</p>
            <p className="mt-1.5 font-mono text-xl font-semibold text-amber-50">#{String(createdBookingId)}</p>
            <button
              onClick={getBooking}
              disabled={isLoading}
              className="mt-3 inline-flex rounded-full bg-amber-200 px-4 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Track Reservation"}
            </button>
          </div>
        )}

        {typeof transactionHash === "string" && (
          <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs uppercase tracking-widest text-emerald-100/70">Transaction confirmed</p>
            <p className="mt-1.5 break-all font-mono text-sm text-emerald-50">{transactionHash}</p>
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-100">
                View on Stellar Explorer
              </a>
            )}
          </div>
        )}
      </div>

      {hasResult && (
        <div className="mt-4">
          <button
            onClick={() => setShowChainDetails(!showChainDetails)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-stone-400 transition hover:bg-white/[0.06] hover:text-stone-200"
          >
            <span>Verify on-chain reservation</span>
            <span className="text-stone-600">{showChainDetails ? "▲" : "▼"}</span>
          </button>
          {showChainDetails && (
            <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 text-xs">
              {showBookingId && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-stone-500">Booking ID</span>
                  <span className="font-mono text-stone-300">#{String(createdBookingId)}</span>
                </div>
              )}
              {typeof transactionHash === "string" && (
                <div className="flex items-start justify-between gap-4">
                  <span className="shrink-0 text-stone-500">Tx hash</span>
                  <span className="break-all font-mono text-stone-300">{transactionHash}</span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <span className="text-stone-500">Contract</span>
                <span className="font-mono text-stone-300">{shortAddress(CONTRACT_ID)}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-stone-500">Network</span>
                <span className="text-stone-300">Stellar Testnet</span>
              </div>
              {explorerUrl && (
                <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-full border border-white/10 px-3 py-1.5 text-stone-300 transition hover:bg-white/[0.06]">
                  Open Stellar Explorer
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
