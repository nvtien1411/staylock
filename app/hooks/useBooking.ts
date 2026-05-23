"use client";

import { useMemo, useState } from "react";
import type { BookingInput } from "@/app/types/booking";
import { asBookingRecord, getBookingStatusValue, reservationStageFromStatus } from "@/app/types/booking";
import { createBooking as createBookingTransaction, getBooking as getBookingTransaction } from "@/app/lib/soroban/booking";
import { parseJson, showError, toJsonSafe } from "@/app/lib/soroban/format";
import { getStatusTone } from "@/app/components/ui/Status";
import { updateListingAvailability } from "@/app/lib/listingStore";

type UseBookingOptions = {
  address: string;
};

export function useBooking({ address }: UseBookingOptions) {
  const [bookingId, setBookingId] = useState("");
  const [response, setResponse] = useState("Enter a reservation code to view the latest stay details.");
  const [isLoading, setIsLoading] = useState(false);
  const [traveler, setTraveler] = useState("");
  const [host, setHost] = useState("");
  const [roomId, setRoomId] = useState("");
  const [amount, setAmount] = useState("");
  const [dayCheckin, setDayCheckin] = useState("");
  const [dayCheckout, setDayCheckout] = useState("");
  const [createStatus, setCreateStatus] = useState("Complete the reservation details to secure a stay.");
  const [isCreating, setIsCreating] = useState(false);

  const createResult = useMemo(() => parseJson(createStatus), [createStatus]);
  const lookupResult = useMemo(() => parseJson(response), [response]);
  const liveTone = useMemo(() => getStatusTone(createStatus, isCreating), [createStatus, isCreating]);
  const lookupValue = lookupResult?.value;
  const bookingRecord = useMemo(() => asBookingRecord(lookupValue ?? lookupResult), [lookupValue, lookupResult]);
  const reservationStage = useMemo(() => reservationStageFromStatus(getBookingStatusValue(bookingRecord)), [bookingRecord]);

  function seedWallet(value: string) {
    setTraveler(value);
    setHost(value);
  }

  async function refreshBooking(nextBookingId = bookingId) {
    if (!address) {
      setResponse("Connect your wallet first.");
      return null;
    }

    if (!nextBookingId) {
      setResponse("Enter a reservation code first.");
      return null;
    }

    setIsLoading(true);
    setBookingId(nextBookingId);
    setResponse("Loading reservation...");

    try {
      const result = await getBookingTransaction(address, nextBookingId);
      setResponse(result);
      return result;
    } catch (error) {
      setResponse(showError(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function getBooking() {
    return refreshBooking(bookingId);
  }

  async function createBooking() {
    if (!address) {
      setCreateStatus("Connect your wallet first.");
      return;
    }

    if (!traveler || !host || !roomId || !amount || !dayCheckin || !dayCheckout) {
      setCreateStatus("Fill all reservation fields first.");
      return;
    }

    setIsCreating(true);
    setCreateStatus("Preparing secure reservation...");

    try {
      setCreateStatus("Waiting for wallet approval...");
      const sendResult = await createBookingTransaction(address, {
        traveler,
        host,
        roomId,
        amount,
        dayCheckin,
        dayCheckout,
      } satisfies BookingInput);

      setCreateStatus("Finalizing reservation...");

      if (sendResult.status === "ERROR") {
        setCreateStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      const createdBookingId = typeof (sendResult as { bookingId?: string }).bookingId === "string"
        ? (sendResult as { bookingId?: string }).bookingId
        : undefined;

      if (createdBookingId) {
        setBookingId(createdBookingId);
      }

      setCreateStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: createdBookingId
              ? "Your stay has been reserved. Track the reservation to review the latest protected state."
              : "Your stay has been reserved and the escrow is being secured.",
            bookingId: createdBookingId,
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );

      if (roomId) {
        updateListingAvailability(roomId, "Reserved", createdBookingId ?? "").catch(() => undefined);
      }

      if (createdBookingId) {
        await refreshBooking(createdBookingId);
      }
    } catch (error) {
      setCreateStatus(showError(error));
    } finally {
      setIsCreating(false);
    }
  }

  async function createBookingFromListing(params: {
    host: string;
    roomId: string;
    amount: string;
    dayCheckin: string;
    dayCheckout: string;
  }) {
    if (!address) {
      setCreateStatus("Connect your wallet first.");
      return;
    }

    setTraveler(address);
    setHost(params.host);
    setRoomId(params.roomId);
    setAmount(params.amount);
    setDayCheckin(params.dayCheckin);
    setDayCheckout(params.dayCheckout);

    setIsCreating(true);
    setCreateStatus("Preparing secure reservation...");

    try {
      setCreateStatus("Waiting for wallet approval...");
      const sendResult = await createBookingTransaction(address, {
        traveler: address,
        host: params.host,
        roomId: params.roomId,
        amount: params.amount,
        dayCheckin: params.dayCheckin,
        dayCheckout: params.dayCheckout,
      } satisfies BookingInput);

      setCreateStatus("Finalizing reservation...");

      if (sendResult.status === "ERROR") {
        setCreateStatus(JSON.stringify(toJsonSafe(sendResult), null, 2));
        return;
      }

      const createdBookingId = typeof (sendResult as { bookingId?: string }).bookingId === "string"
        ? (sendResult as { bookingId?: string }).bookingId
        : undefined;

      if (createdBookingId) {
        setBookingId(createdBookingId);
      }

      setCreateStatus(
        JSON.stringify(
          toJsonSafe({
            success: true,
            message: createdBookingId
              ? "Your stay has been reserved. Track the reservation to review the latest protected state."
              : "Your stay has been reserved and the escrow is being secured.",
            bookingId: createdBookingId,
            transactionHash: sendResult.hash,
            status: sendResult.status,
          }),
          null,
          2,
        ),
      );

      updateListingAvailability(params.roomId, "Reserved", createdBookingId ?? "").catch(() => undefined);

      if (createdBookingId) {
        await refreshBooking(createdBookingId);
      }
    } catch (error) {
      setCreateStatus(showError(error));
    } finally {
      setIsCreating(false);
    }
  }

  return {
    bookingId,
    setBookingId,
    response,
    isLoading,
    traveler,
    setTraveler,
    host,
    setHost,
    roomId,
    setRoomId,
    amount,
    setAmount,
    dayCheckin,
    setDayCheckin,
    dayCheckout,
    setDayCheckout,
    createStatus,
    isCreating,
    createResult,
    lookupResult,
    lookupValue,
    liveTone,
    reservationStage,
    refreshBooking,
    seedWallet,
    getBooking,
    createBooking,
    createBookingFromListing,
  };
}
