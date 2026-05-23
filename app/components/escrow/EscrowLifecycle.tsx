import type { LifecycleAction, ReservationStage } from "@/app/types/booking";
import { lifecycleStages } from "@/app/components/dashboard/data";
import { glassCard } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage } from "@/app/lib/soroban/format";

function getStageIndex(stage: ReservationStage) {
  return lifecycleStages.findIndex((item) => item.stage === stage);
}

type EscrowLifecycleProps = {
  bookingId: string;
  lifecycleStatus: string;
  lifecycleAction: LifecycleAction;
  lifecycleResult: Record<string, unknown> | null;
  lifecycleTone: { label: string; color: string; dot: string };
  reservationStage: ReservationStage;
  userRole: "guest" | "host";
  confirmCheckIn: () => void;
  completeStay: () => void;
  cancelReservation: () => void;
};

export function EscrowLifecycle({
  bookingId,
  lifecycleStatus,
  lifecycleAction,
  lifecycleResult,
  lifecycleTone,
  reservationStage,
  userRole,
  confirmCheckIn,
  completeStay,
  cancelReservation,
}: EscrowLifecycleProps) {
  const activeStageIndex = getStageIndex(reservationStage);
  const lifecycleExplorerUrl = getExplorerUrl(lifecycleResult?.transactionHash);
  const isTerminal = reservationStage === "Completed" || reservationStage === "Cancelled";
  // Cancellation is only allowed before check-in; once checked in the guest must complete or the host completes
  const canCancel = !isTerminal && reservationStage === "Reserved";

  return (
    <section id="escrow" className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
      <div className={`${glassCard} p-5 sm:p-7`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-100/70">Escrow lifecycle</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Stay timeline</h2>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {userRole === "host"
                ? "Funds stay protected after reservation. Complete the stay to release settlement to your wallet."
                : "Funds stay protected after reservation. Check-in verifies your arrival and completion releases settlement."}
            </p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${lifecycleTone.color}`}>{lifecycleAction ? "Updating" : reservationStage}</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {lifecycleStages.map((item, index) => {
            const isActive = item.stage === reservationStage;
            const isPast = reservationStage !== "Cancelled" && activeStageIndex >= 0 && index < activeStageIndex;
            const isCancelledCard = item.stage === "Cancelled";
            const cardTone = isActive
              ? isCancelledCard
                ? "border-rose-300/35 bg-rose-300/10 text-rose-50 shadow-rose-500/10"
                : "border-amber-200/35 bg-amber-200/10 text-amber-50 shadow-amber-500/10"
              : isPast
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-50 shadow-emerald-500/10"
                : "border-white/10 bg-white/[0.045] text-stone-300 shadow-black/10";

            return (
              <div key={item.stage} className={`rounded-2xl border p-4 shadow-lg transition-all duration-200 ${cardTone}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-60">0{index + 1}</span>
                  <span className={`h-2 w-2 rounded-full ${isActive ? isCancelledCard ? "bg-rose-300" : "bg-amber-200" : isPast ? "bg-emerald-300" : "bg-stone-600"}`} />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.stage}</h3>
                <p className="mt-1 text-sm font-medium opacity-80">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-stone-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`${glassCard} p-5 sm:p-7`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">Stay actions</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">Reservation #{bookingId || "—"}</h3>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${lifecycleTone.color}`}>{lifecycleTone.label}</span>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full shadow-lg ${lifecycleTone.dot}`} />
            <p className="text-sm text-stone-300">{statusMessage(lifecycleResult, lifecycleStatus)}</p>
          </div>
          {typeof lifecycleResult?.transactionHash === "string" && (
            <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-widest text-emerald-100/70">Lifecycle confirmation</p>
              <p className="mt-2 break-all font-mono text-sm text-emerald-50">{lifecycleResult.transactionHash}</p>
              {lifecycleExplorerUrl && (
                <a href={lifecycleExplorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-100">
                  View stay update
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3">
          {userRole === "guest" && (
            <button
              onClick={confirmCheckIn}
              disabled={Boolean(lifecycleAction) || !bookingId || reservationStage !== "Reserved"}
              className="rounded-xl border border-amber-200/20 bg-amber-200/10 px-6 py-3.5 text-sm font-semibold text-amber-50 transition-all duration-200 hover:border-amber-100/50 hover:bg-amber-200/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lifecycleAction === "checkin" ? "Confirming check-in..." : "Confirm Check-In"}
            </button>
          )}

          {userRole === "host" && (
            <button
              onClick={completeStay}
              disabled={Boolean(lifecycleAction) || !bookingId || reservationStage !== "Checked In"}
              className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-6 py-3.5 text-sm font-semibold text-emerald-50 transition-all duration-200 hover:border-emerald-100/50 hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lifecycleAction === "checkout" ? "Completing stay..." : "Complete Stay"}
            </button>
          )}

          {canCancel && (
            <button
              onClick={cancelReservation}
              disabled={Boolean(lifecycleAction) || !bookingId}
              className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-6 py-3.5 text-sm font-semibold text-rose-50 transition-all duration-200 hover:border-rose-100/50 hover:bg-rose-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lifecycleAction === "cancel" ? "Cancelling reservation..." : "Cancel Reservation"}
            </button>
          )}

          {isTerminal && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm text-stone-500">
              Reservation is in a terminal state
            </div>
          )}

          {!canCancel && !isTerminal && userRole === "guest" && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-center text-sm text-stone-500">
              Cancellation not available after check-in
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
