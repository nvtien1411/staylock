"use client";

import { useState } from "react";
import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { shortAddress } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";
import { asBookingRecord, pickBookingField, reservationStageFromStatus, getBookingStatusValue } from "@/app/types/booking";

type ReservationLookupProps = {
  bookingId: string;
  setBookingId: (value: string) => void;
  response: string;
  isLoading: boolean;
  lookupResult: Record<string, unknown> | null;
  lookupValue: unknown;
  getBooking: () => void;
};

function fieldText(value: unknown, fallback = "—") {
  if (typeof value === "string" && value) {
    return value;
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function formatAddress(value: unknown) {
  const address = fieldText(value, "");
  return address ? shortAddress(address) : "—";
}

function formatDate(value: unknown) {
  const text = fieldText(value, "");

  if (/^\d{8}$/.test(text)) {
    const year = Number(text.slice(0, 4));
    const month = Number(text.slice(4, 6));
    const day = Number(text.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day));

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
    }
  }

  return text || "—";
}

function formatAmount(value: unknown) {
  const text = fieldText(value, "");

  try {
    const stroops = BigInt(text);
    const stroopsPerXlm = BigInt(10000000);
    const whole = stroops / stroopsPerXlm;
    const remainder = stroops % stroopsPerXlm;
    const decimals = remainder.toString().padStart(7, "0").replace(/0+$/, "");

    return `${whole}${decimals ? `.${decimals}` : ""} XLM`;
  } catch {
    return text ? `${text} XLM` : "—";
  }
}

export function ReservationLookup({
  bookingId,
  setBookingId,
  response,
  isLoading,
  lookupResult,
  lookupValue,
  getBooking,
}: ReservationLookupProps) {
  const [showChainDetails, setShowChainDetails] = useState(false);
  const booking = asBookingRecord(lookupValue ?? lookupResult);
  const rawStatus = getBookingStatusValue(booking);
  const stage = reservationStageFromStatus(rawStatus);
  const status = stage;
  const isCancelled = stage === "Cancelled";
  const traveler = pickBookingField(booking, ["traveler", "guest", "guest_wallet", "traveler_address"]);
  const host = pickBookingField(booking, ["host", "owner", "property_owner", "host_address"]);
  const room = pickBookingField(booking, ["room_name", "roomName", "room", "room_id", "roomId"]);
  const amount = pickBookingField(booking, ["amount", "deposit", "escrow_amount", "escrowAmount"]);
  const checkin = pickBookingField(booking, ["day_checkin", "dayCheckin", "checkin", "check_in", "checkIn"]);
  const checkout = pickBookingField(booking, ["day_checkout", "dayCheckout", "checkout", "check_out", "checkOut"]);
  const lifecycleSteps = ["Reserved", "Checked In", "Completed"];

  function isCompletedStep(step: string) {
    if (isCancelled) {
      return false;
    }

    if (step === "Reserved") {
      return true;
    }

    if (step === "Checked In") {
      return stage === "Checked In" || stage === "Completed";
    }

    return stage === "Completed";
  }

  return (
    <section id="track" className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className={`${glassCard} p-5 sm:p-7`}>
        <p className="text-xs uppercase tracking-widest text-amber-100/70">Reservation lookup</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Track Reservation</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">Look up any stay by reservation code and see its current on-chain state.</p>

        <label className="mt-7 block">
          <FieldLabel label="Reservation Code" hint="number" />
          <input id="booking-id" type="number" min="0" value={bookingId} onChange={(event) => setBookingId(event.target.value)} placeholder="123" className={inputClass} />
        </label>

        <button
          onClick={getBooking}
          disabled={isLoading}
          className="mt-5 w-full rounded-xl border border-amber-200/20 bg-amber-200/10 px-8 py-3.5 text-sm font-semibold text-amber-50 transition-all duration-200 hover:border-amber-100/50 hover:bg-amber-200/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Finding reservation..." : "Track Reservation"}
        </button>
      </div>

      <div className={`${glassCard} p-5 sm:p-7`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-stone-500">Reservation record</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">{lookupResult ? `Reservation #${bookingId || "—"}` : "Awaiting reservation code"}</h3>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${isLoading ? "border-amber-200/30 bg-amber-200/10 text-amber-100" : lookupResult ? isCancelled ? "border-rose-300/30 bg-rose-300/10 text-rose-100" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/[0.06] text-stone-300"}`}>
            {isLoading ? "Searching" : lookupResult ? status : "Ready"}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">
          {lookupResult ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-200/15 bg-gradient-to-br from-amber-200/10 via-white/[0.04] to-cyan-300/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-100/70">Protected stay</p>
                    <h4 className="mt-1.5 text-xl font-semibold text-white">Reservation #{bookingId || "—"}</h4>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${isCancelled ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"}`}>
                    {status}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-widest text-stone-500">Guest</p>
                    <p className="mt-1.5 font-mono text-sm font-medium text-stone-100">{formatAddress(traveler)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-widest text-stone-500">Host</p>
                    <p className="mt-1.5 font-mono text-sm font-medium text-stone-100">{formatAddress(host)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-widest text-stone-500">Stay dates</p>
                    <p className="mt-1.5 text-sm font-semibold text-white">{formatDate(checkin)} <span className="text-stone-500">→</span> {formatDate(checkout)}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200/15 bg-amber-200/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-amber-100/70">Escrow deposit</p>
                    <p className="mt-1.5 text-xl font-semibold text-amber-50">{formatAmount(amount)}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-widest text-stone-500">Room</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{fieldText(room, "Room details pending")}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-widest text-stone-500">Escrow lifecycle</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {lifecycleSteps.map((step) => {
                    const complete = isCompletedStep(step);

                    return (
                      <div key={step} className={`rounded-xl border p-3 ${complete ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50" : "border-white/10 bg-black/25 text-stone-400"}`}>
                        <div className="flex items-center gap-2">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-emerald-300 text-emerald-950" : "bg-stone-800 text-stone-500"}`}>
                            {complete ? "✓" : "·"}
                          </span>
                          <span className="text-sm font-medium">{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowChainDetails(!showChainDetails)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-stone-400 transition hover:bg-white/[0.06] hover:text-stone-200"
                >
                  <span>View on-chain details</span>
                  <span className="text-stone-600">{showChainDetails ? "▲" : "▼"}</span>
                </button>
                {showChainDetails && (
                  <div className="mt-2 space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-500">Booking ID</span>
                      <span className="font-mono text-stone-300">#{bookingId}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-500">Escrow amount</span>
                      <span className="font-mono text-stone-300">{formatAmount(amount)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-500">Host wallet</span>
                      <span className="font-mono text-stone-300">{formatAddress(host)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-500">Contract</span>
                      <span className="font-mono text-stone-300">{shortAddress(CONTRACT_ID)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-500">Lifecycle state</span>
                      <span className={`font-semibold ${isCancelled ? "text-rose-300" : "text-emerald-300"}`}>{status}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-stone-500">Network</span>
                      <span className="text-stone-300">Stellar Testnet</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-stone-400">{response}</p>
          )}
        </div>
      </div>
    </section>
  );
}
