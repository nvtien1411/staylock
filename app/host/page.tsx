"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/app/components/layout/AppShell";
import { ListingGrid } from "@/app/components/listings/ListingGrid";
import { ReservationLookup } from "@/app/components/reservation/ReservationLookup";
import { EscrowLifecycle } from "@/app/components/escrow/EscrowLifecycle";
import { useWallet } from "@/app/hooks/useWallet";
import { useBooking } from "@/app/hooks/useBooking";
import { useEscrow } from "@/app/hooks/useEscrow";
import { useListings, addListing, buildListing } from "@/app/lib/listingStore";
import { isVerifiedHost, approveHost } from "@/app/lib/verifiedHosts";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { shortAddress } from "@/app/lib/soroban/format";

const HOST_NAV = [
  { label: "Create Listing", href: "#create" },
  { label: "My Listings", href: "#listings" },
  { label: "Reservations", href: "#reservations" },
  { label: "Escrow", href: "#escrow" },
];

// Simulated review duration in ms — long enough to feel real, short enough for demos.
const REVIEW_DURATION_MS = 22000;

export default function HostPage() {
  const wallet = useWallet();
  const booking = useBooking({ address: wallet.address });
  const activeEscrow = useEscrow({
    address: wallet.address,
    bookingId: booking.bookingId,
    roomId: booking.roomId,
    reservationStage: booking.reservationStage,
    refreshBooking: booking.refreshBooking,
  });

  const allListings = useListings();
  const ownedListings = allListings.filter((l) => l.ownerWallet === wallet.address);

  // Local state tracks whether this wallet was just approved in this session.
  // isVerifiedHost() is the source of truth; this just triggers re-renders.
  const [hostUnlocked, setHostUnlocked] = useState(false);
  const isHost = hostUnlocked || isVerifiedHost(wallet.address);

  async function connectWallet() {
    const address = await wallet.connectWallet();
    if (address) {
      booking.seedWallet(address);
      // Re-check host status after connecting (handles localStorage-persisted approvals)
      if (isVerifiedHost(address)) setHostUnlocked(true);
    }
  }

  function handleApproved() {
    approveHost(wallet.address);
    setHostUnlocked(true);
  }

  async function trackReservation() {
    await booking.getBooking();
  }

  return (
    <AppShell
      address={wallet.address}
      onConnect={connectWallet}
      role="host"
      navItems={HOST_NAV}
      sidebarNote="Manage your properties, review reservations, and release settlement — all from your wallet."
      headerTitle="Host portal"
    >
      {!wallet.address ? (
        <WalletRequired onConnect={connectWallet} />
      ) : !isHost ? (
        <HostAccessDenied address={wallet.address} onApproved={handleApproved} />
      ) : (
        <HostContent
          address={wallet.address}
          booking={booking}
          activeEscrow={activeEscrow}
          ownedListings={ownedListings}
          trackReservation={trackReservation}
        />
      )}
    </AppShell>
  );
}

// ─── Access states ────────────────────────────────────────────────────────────

function WalletRequired({ onConnect }: { onConnect: () => void }) {
  return (
    <div className={`${glassCard} p-8 text-center`}>
      <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">Host portal</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">Connect your wallet to continue</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
        The host portal requires a verified host wallet. Connect Freighter to check your access.
      </p>
      <button
        onClick={onConnect}
        className="mt-6 rounded-full bg-amber-300 px-8 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/15 transition-all duration-200 hover:bg-amber-200"
      >
        Connect Wallet
      </button>
    </div>
  );
}

type ReviewState = "idle" | "reviewing" | "approved";

function HostAccessDenied({
  address,
  onApproved,
}: {
  address: string;
  onApproved: () => void;
}) {
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleRequestAccess() {
    if (reviewState !== "idle") return;
    setReviewState("reviewing");
    setProgress(0);

    // Animate progress bar over the review duration
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, (elapsed / REVIEW_DURATION_MS) * 100);
      setProgress(pct);
    }, 200);

    // Auto-approve after the review duration
    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setReviewState("approved");
      // Brief pause on 100% before transitioning
      setTimeout(onApproved, 1200);
    }, REVIEW_DURATION_MS);
  }

  if (reviewState === "approved") {
    return (
      <div className={`${glassCard} p-8 text-center`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/15 text-3xl">
          ✓
        </div>
        <p className="mt-5 text-xs uppercase tracking-widest text-emerald-300/70">Approved</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Host access granted</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400">
          You can now create escrow-backed listings and manage reservations. Opening your host
          workspace…
        </p>
        <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-pulse rounded-full bg-emerald-300" />
        </div>
      </div>
    );
  }

  if (reviewState === "reviewing") {
    return (
      <div className={`${glassCard} p-8`}>
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/10">
            <span className="animate-spin text-xl">⟳</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-100/70">Under review</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Reviewing your application</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400">
              We&apos;re verifying your wallet and reviewing your host application. This typically
              takes a moment. You&apos;ll be notified as soon as your access is confirmed.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-mono text-xs text-stone-400">
                {shortAddress(address).slice(0, 4)}
              </div>
              <div>
                <p className="text-xs text-stone-500">Applicant wallet</p>
                <p className="font-mono text-sm text-stone-200">{shortAddress(address)}</p>
              </div>
            </div>
            <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
              In review
            </span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Verification progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-100 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {[
              ["Wallet signature verified", progress > 15],
              ["Identity check in progress", progress > 40],
              ["Property eligibility review", progress > 65],
              ["Host profile preparation", progress > 85],
            ].map(([label, done]) => (
              <div key={label as string} className="flex items-center gap-3 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-300" : "bg-stone-600"}`} />
                <span className={done ? "text-stone-300" : "text-stone-600"}>{label as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // idle state
  return (
    <div className={`${glassCard} p-8`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/10 text-2xl">
          ⊘
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-rose-300/70">Access restricted</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Host access required</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400">
            The wallet <span className="font-mono text-stone-200">{shortAddress(address)}</span> is
            not registered as a verified host. Host access is curated to maintain marketplace
            quality.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="rounded-full bg-amber-300 px-6 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/15 transition-all duration-200 hover:bg-amber-200"
            >
              Browse as Guest
            </Link>
            <a
              href="#apply"
              className="rounded-full border border-white/10 bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/[0.1]"
            >
              Apply to Host
            </a>
          </div>
        </div>
      </div>

      <div id="apply" className="mt-8 rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] p-6">
        <p className="text-xs uppercase tracking-widest text-amber-100/70">Become a host</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">Apply for host access</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400">
          StayLock hosts are verified wallet owners who list escrow-backed properties. Host status
          is granted after review to ensure marketplace quality and guest trust.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Submit your wallet", "Your Stellar wallet becomes your host identity — no accounts needed."],
            ["02", "Verification review", "The StayLock team reviews your application and property details."],
            ["03", "Start listing", "Once verified, create escrow-backed listings guests can trust."],
          ].map(([num, title, desc]) => (
            <div key={num} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-black text-amber-100/70">{num}</p>
              <p className="mt-2 font-bold text-white">{title}</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-mono text-xs text-stone-400">
            {shortAddress(address).slice(0, 4)}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-stone-500">Your wallet</p>
            <p className="mt-0.5 truncate font-mono text-sm text-stone-200">{address}</p>
          </div>
          <button
            onClick={handleRequestAccess}
            className="ml-auto shrink-0 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-bold text-amber-100 transition hover:bg-amber-200/20"
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Host content ─────────────────────────────────────────────────────────────

type HostContentProps = {
  address: string;
  booking: ReturnType<typeof useBooking>;
  activeEscrow: ReturnType<typeof useEscrow>;
  ownedListings: ReturnType<typeof useListings>;
  trackReservation: () => void;
};

function HostContent({ address, booking, activeEscrow, ownedListings, trackReservation }: HostContentProps) {
  return (
    <>
      <CreateListingForm address={address} />

      <section id="listings" className="space-y-5">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-amber-100/70">Your listings</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Active property inventory
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
            Live occupancy state for all properties you own. Reserved listings are locked until the
            guest checks in or cancels.
          </p>
        </div>
        {ownedListings.length === 0 ? (
          <div className={`${glassCard} p-7`}>
            <p className="text-xs uppercase tracking-widest text-stone-500">No listings yet</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">
              Create your first listing above
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Once you publish a listing it will appear here and immediately become available in the
              guest marketplace.
            </p>
          </div>
        ) : (
          <ListingGrid listings={ownedListings} onReserve={() => {}} isHostView />
        )}
      </section>

      <section id="reservations" className="space-y-5">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-amber-100/70">Reservation management</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Manage active stays
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
            Look up a reservation by booking ID to review its on-chain state and complete the stay
            once the guest has checked in.
          </p>
        </div>
        <HostReservationQueue
          ownedListings={ownedListings}
          activeBookingId={booking.bookingId}
          onLoad={(id) => { booking.setBookingId(id); void booking.refreshBooking(id); }}
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
        userRole="host"
        confirmCheckIn={activeEscrow.confirmCheckIn}
        completeStay={activeEscrow.completeStay}
        cancelReservation={activeEscrow.cancelReservation}
      />
    </>
  );
}

// ─── Host reservation queue ───────────────────────────────────────────────────

type HostReservationQueueProps = {
  ownedListings: ReturnType<typeof useListings>;
  activeBookingId: string;
  onLoad: (bookingId: string) => void;
};

function HostReservationQueue({ ownedListings, activeBookingId, onLoad }: HostReservationQueueProps) {
  const pendingReservations = ownedListings.filter(
    (l) => l.activeBookingId && (l.availability === "Reserved" || l.availability === "Completed"),
  );

  if (pendingReservations.length === 0) {
    return (
      <div className={`${glassCard} p-5 sm:p-6`}>
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-stone-600" />
          <p className="text-sm text-stone-500">No active reservations on your listings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${glassCard} p-5 sm:p-6`}>
      <p className="text-xs uppercase tracking-widest text-amber-100/70">Incoming reservations</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pendingReservations.map((listing) => {
          const isLoaded = activeBookingId === listing.activeBookingId;
          const isCompleted = listing.availability === "Completed";
          return (
            <div
              key={listing.id}
              className={`rounded-xl border p-4 transition-all duration-200 ${
                isLoaded
                  ? "border-amber-200/35 bg-amber-200/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{listing.title}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">{listing.location}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    isCompleted
                      ? "border-stone-500/30 bg-stone-500/10 text-stone-400"
                      : "border-amber-200/30 bg-amber-200/10 text-amber-100"
                  }`}
                >
                  {isCompleted ? "Completed" : "Reserved"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-stone-500">
                  #{listing.activeBookingId}
                </p>
                <button
                  onClick={() => onLoad(listing.activeBookingId!)}
                  disabled={isLoaded}
                  className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-200/20 disabled:cursor-default disabled:opacity-50"
                >
                  {isLoaded ? "Loaded" : "Load"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Create listing form ──────────────────────────────────────────────────────

function xlmToStroops(xlm: string): string {
  try {
    const val = parseFloat(xlm);
    if (isNaN(val) || val <= 0) return "";
    return String(Math.round(val * 10_000_000));
  } catch {
    return "";
  }
}

function CreateListingForm({ address }: { address: string }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [nightly, setNightly] = useState("");
  const [deposit, setDeposit] = useState("");
  const [description, setDescription] = useState("");
  const [hostName, setHostName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (isPublishing) return;
    setError("");
    if (!title.trim() || !location.trim() || !nightly || !deposit || !description.trim()) {
      setError("Fill in all required fields.");
      return;
    }
    const nightlyNum = parseFloat(nightly);
    if (isNaN(nightlyNum) || nightlyNum <= 0) {
      setError("Enter a valid nightly price.");
      return;
    }
    const escrowAmount = xlmToStroops(deposit);
    if (!escrowAmount) {
      setError("Enter a valid escrow deposit amount.");
      return;
    }

    const listing = buildListing({
      title: title.trim(),
      location: location.trim(),
      nightlyPriceXlm: nightlyNum,
      escrowAmount,
      description: description.trim(),
      ownerWallet: address,
      hostName: hostName.trim() || shortAddress(address),
    });

    try {
      setIsPublishing(true);
      await addListing(listing);
      setSubmitted(true);
      setTitle("");
      setLocation("");
      setNightly("");
      setDeposit("");
      setDescription("");
      setHostName("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error("Failed to publish listing", err);
      setError("Unable to publish listing. Check Supabase configuration and try again.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section id="create" className={`${glassCard} p-5 sm:p-7`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-100/70">New listing</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Create a listing</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
            Your connected wallet is automatically set as the listing owner and escrow recipient. No
            manual address entry required.
          </p>
        </div>
        {submitted && (
          <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-100">
            Published to marketplace
          </span>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          <p className="text-xs text-stone-400">
            Listing owner: <span className="font-mono text-stone-200">{shortAddress(address)}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <FieldLabel label="Property Title" hint="required" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Amalfi Glass Villa"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Location" hint="required" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Amalfi Coast, Italy"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Host / Property Name" hint="optional" />
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Casa Meridian"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Nightly Price" hint="XLM" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={nightly}
            onChange={(e) => setNightly(e.target.value)}
            placeholder="12.5"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Escrow Deposit" hint="XLM" />
          <input
            type="number"
            min="0"
            step="0.01"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="12.5"
            className={inputClass}
          />
        </label>
        <label className="block md:col-span-2">
          <FieldLabel label="Description" hint="required" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property, its highlights, and what makes it special..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button
        onClick={handleCreate}
        disabled={isPublishing}
        className="mt-6 w-full rounded-xl bg-amber-300 px-8 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/15 transition-all duration-200 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPublishing ? "Publishing Listing..." : "Publish Listing to Marketplace"}
      </button>
    </section>
  );
}
