"use client";

import { useMemo, useState } from "react";
import type { LifecycleAction, ReservationStage } from "@/app/types/booking";
import { runEscrowAction } from "@/app/lib/soroban/escrow";
import { parseJson, showError, toJsonSafe } from "@/app/lib/soroban/format";
import { getStatusTone } from "@/app/components/ui/Status";
import { updateListingAvailability } from "@/app/lib/listingStore";

type UseEscrowOptions = {
  address: string;
  bookingId: string;
  roomId: string;
  reservationStage: ReservationStage;
  refreshBooking: (bookingId?: string) => Promise<unknown>;
};

export function useEscrow({ address, bookingId, roomId, reservationStage, refreshBooking }: UseEscrowOptions) {
  const [lifecycleStatus, setLifecycleStatus] = useState("Track a reservation to manage check-in, completion, or cancellation.");
  const [lifecycleAction, setLifecycleAction] = useState<LifecycleAction>("");

  const lifecycleResult = useMemo(() => parseJson(lifecycleStatus), [lifecycleStatus]);
  const lifecycleTone = useMemo(() => getStatusTone(lifecycleStatus, Boolean(lifecycleAction)), [lifecycleStatus, lifecycleAction]);

  async function runLifecycleAction(
    action: LifecycleAction,
    contractMethod: string,
    pendingMessage: string,
    successMessage: string,
    listingAvailabilityAfter: "Available" | "Reserved" | "Completed",
  ) {
    if (!address) {
      setLifecycleStatus("Connect your wallet first.");
      return;
    }

    if (!bookingId) {
      setLifecycleStatus("Enter a reservation code first.");
      return;
    }

    if (reservationStage === "Cancelled" || reservationStage === "Completed") {
      setLifecycleStatus("This reservation is already in a terminal state.");
      return;
    }

    setLifecycleAction(action);
    setLifecycleStatus(pendingMessage);

    try {
      setLifecycleStatus("Waiting for wallet approval...");
      const sendResult = await runEscrowAction(address, bookingId, contractMethod);

      setLifecycleStatus("Updating your stay timeline...");

      if (sendResult.status === "ERROR") {
        setLifecycleStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      setLifecycleStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: successMessage,
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );

      await Promise.all([
        refreshBooking(bookingId),
        roomId
          ? updateListingAvailability(
              roomId,
              listingAvailabilityAfter,
              listingAvailabilityAfter === "Reserved" ? undefined : "",
            ).catch(() => undefined)
          : Promise.resolve(),
      ]);
    } catch (error) {
      setLifecycleStatus(showError(error));
    } finally {
      setLifecycleAction("");
    }
  }

  function confirmCheckIn() {
    if (reservationStage !== "Reserved") {
      setLifecycleStatus("Check-in is only available for reserved stays.");
      return Promise.resolve();
    }

    return runLifecycleAction(
      "checkin",
      "checkin",
      "Preparing check-in confirmation...",
      "Check-in confirmed. The stay is verified and escrow remains protected.",
      "Reserved",
    );
  }

  function completeStay() {
    if (reservationStage !== "Checked In") {
      setLifecycleStatus("Completion is only available after check-in.");
      return Promise.resolve();
    }

    return runLifecycleAction(
      "checkout",
      "checkout",
      "Preparing stay completion...",
      "Stay completed. Protected settlement has been released and the listing is available again.",
      "Available",
    );
  }

  function cancelReservation() {
    return runLifecycleAction(
      "cancel",
      "cancel_booking",
      "Preparing cancellation...",
      "Reservation cancelled. The protected stay path is now closed.",
      "Available",
    );
  }

  return {
    lifecycleStatus,
    lifecycleAction,
    lifecycleResult,
    lifecycleTone,
    confirmCheckIn,
    completeStay,
    cancelReservation,
  };
}
