"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/app/components/layout/AppShell";
import { ListingGrid } from "@/app/components/listings/ListingGrid";
import { BookingModal } from "@/app/components/listings/BookingModal";
import { ReservationStatusCard } from "@/app/components/reservation/ReservationStatusCard";
import { ReservationLookup } from "@/app/components/reservation/ReservationLookup";
import { EscrowLifecycle } from "@/app/components/escrow/EscrowLifecycle";
import { useWallet } from "@/app/hooks/useWallet";
import { useBooking } from "@/app/hooks/useBooking";
import { useEscrow } from "@/app/hooks/useEscrow";
import { useListings } from "@/app/lib/listingStore";
import type { Listing, ListingAvailability } from "@/app/types/listing";

const NAV_ITEMS = [
  { label: "Browse Stays", href: "#listings" },
  { label: "My Reservation", href: "#reservations" },
  { label: "Escrow", href: "#escrow" },
];

export default function MarketplacePage() {
  const wallet = useWallet();
  const booking = useBooking({ address: wallet.address });
  const activeEscrow = useEscrow({
    address: wallet.address,
    bookingId: booking.bookingId,
    roomId: booking.roomId,
    reservationStage: booking.reservationStage,
    refreshBooking: booking.refreshBooking,
  });

  const rawListings = useListings();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  async function connectWallet() {
    const address = await wallet.connectWallet();
    if (address) booking.seedWallet(address);
  }

  // Derive listing availability from persisted reservations + active booking state
  const listings = useMemo<Listing[]>(() => {
    return rawListings.map((listing) => {
      if (booking.roomId && listing.roomId === booking.roomId) {
        let availability: ListingAvailability = "Available";
        if (booking.reservationStage === "Reserved" || booking.reservationStage === "Checked In") {
          availability = "Reserved";
        } else if (booking.reservationStage === "Completed") {
          availability = "Completed";
        }
        return { ...listing, availability };
      }
      return listing;
    });
  }, [rawListings, booking.roomId, booking.reservationStage]);

  async function handleBookingConfirm(dayCheckin: string, dayCheckout: string) {
    if (!selectedListing) return;
    await booking.createBookingFromListing({
      host: selectedListing.ownerWallet,
      roomId: selectedListing.roomId,
      amount: selectedListing.escrowAmount,
      dayCheckin,
      dayCheckout,
    });
    setSelectedListing(null);
  }

  async function trackReservation() {
    await booking.getBooking();
  }

  const hasActiveBooking =
    Boolean(booking.bookingId) &&
    (booking.reservationStage === "Reserved" || booking.reservationStage === "Checked In");

  return (
    <AppShell
      address={wallet.address}
      onConnect={connectWallet}
      role="guest"
      navItems={NAV_ITEMS}
      sidebarNote="Browse escrow-protected stays, reserve with your wallet, and track settlement on-chain."
      headerTitle="Decentralized booking marketplace"
    >
      <section id="listings" className="space-y-5">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-amber-100/70">Available stays</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Browse escrow-protected properties
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
            Every listing is backed by a Soroban smart contract. Your deposit is held in escrow until
            check-in is confirmed — no intermediaries, no hidden fees.
          </p>
        </div>
        <ListingGrid
          listings={listings}
          onReserve={setSelectedListing}
          activeBookingRoomId={hasActiveBooking ? booking.roomId : undefined}
        />
      </section>

      <section id="reservations" className="space-y-5">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-amber-100/70">Your reservation</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Track your protected stay
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
            Your booking ID is your on-chain proof. Use it to verify escrow state, track lifecycle
            stages, and confirm settlement.
          </p>
        </div>
        <ReservationStatusCard
          liveTone={booking.liveTone}
          createResult={booking.createResult}
          createStatus={booking.createStatus}
          bookingId={booking.bookingId}
          isLoading={booking.isLoading}
          getBooking={trackReservation}
        />
        <ReservationLookup
          bookingId={booking.bookingId}
          setBookingId={booking.setBookingId}
          response={booking.response}
          isLoading={booking.isLoading}
          lookupResult={booking.lookupResult}
          lookupValue={booking.lookupValue}
          getBooking={trackReservation}
        />
      </section>

      <EscrowLifecycle
        bookingId={booking.bookingId}
        lifecycleStatus={activeEscrow.lifecycleStatus}
        lifecycleAction={activeEscrow.lifecycleAction}
        lifecycleResult={activeEscrow.lifecycleResult}
        lifecycleTone={activeEscrow.lifecycleTone}
        reservationStage={booking.reservationStage}
        userRole="guest"
        confirmCheckIn={activeEscrow.confirmCheckIn}
        completeStay={activeEscrow.completeStay}
        cancelReservation={activeEscrow.cancelReservation}
      />

      {selectedListing && (
        <BookingModal
          listing={selectedListing}
          walletAddress={wallet.address}
          isCreating={booking.isCreating}
          onConfirm={handleBookingConfirm}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </AppShell>
  );
}
