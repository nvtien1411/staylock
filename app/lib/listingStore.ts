"use client";

import { useEffect, useState } from "react";
import { DEMO_HOST_WALLET, MOCK_LISTINGS } from "@/app/lib/listings";
import { getSupabaseClient } from "@/app/lib/supabase/client";
import type { Listing } from "@/app/types/listing";

type ListingRow = {
  id: string;
  room_id: string;
  owner_wallet: string;
  escrow_amount: string;
  nightly_price_xlm: number | string;
  title: string;
  location: string;
  description: string;
  amenities: string[] | null;
  host_name: string;
  host_since: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  availability: Listing["availability"];
  active_booking_id: string | null;
  gradient_from: string;
  gradient_to: string;
};

let _listings: Listing[] = [...MOCK_LISTINGS];
const _subscribers = new Set<() => void>();

function notify() {
  _subscribers.forEach((cb) => cb());
}

function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    roomId: row.room_id,
    ownerWallet: row.owner_wallet,
    escrowAmount: row.escrow_amount,
    nightlyPriceXlm: Number(row.nightly_price_xlm),
    title: row.title,
    location: row.location,
    description: row.description,
    amenities: row.amenities ?? [],
    hostName: row.host_name,
    hostSince: row.host_since,
    maxGuests: row.max_guests,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    availability: row.availability,
    activeBookingId: row.active_booking_id ?? undefined,
    gradientFrom: row.gradient_from,
    gradientTo: row.gradient_to,
  };
}

function toRow(listing: Listing): ListingRow {
  return {
    id: listing.id,
    room_id: listing.roomId,
    owner_wallet: listing.ownerWallet,
    escrow_amount: listing.escrowAmount,
    nightly_price_xlm: listing.nightlyPriceXlm,
    title: listing.title,
    location: listing.location,
    description: listing.description,
    amenities: listing.amenities,
    host_name: listing.hostName,
    host_since: listing.hostSince,
    max_guests: listing.maxGuests,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    availability: listing.availability,
    active_booking_id: listing.activeBookingId ?? null,
    gradient_from: listing.gradientFrom,
    gradient_to: listing.gradientTo,
  };
}

export function getListings(): Listing[] {
  return _listings;
}

async function fetchListings() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Table missing or RLS blocking — keep showing mock listings so the UI stays functional
    console.warn("Supabase listings fetch failed:", error.message);
    return;
  }

  _listings = (data as ListingRow[] | null)?.map(toListing) ?? [];
  notify();
}

export async function addListing(listing: Listing) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("listings").insert(toRow(listing));

  if (error) {
    console.warn("Supabase insert failed:", error.message);
    throw error;
  }

  _listings = [listing, ..._listings.filter((item) => item.id !== listing.id)];
  notify();
}

export async function updateListingAvailability(
  roomId: string,
  availability: Listing["availability"],
  bookingId?: string,
) {
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = { availability };
  if (bookingId !== undefined) patch.active_booking_id = bookingId || null;

  const { error } = await supabase
    .from("listings")
    .update(patch)
    .eq("room_id", roomId);

  if (error) throw error;

  _listings = _listings.map((l) =>
    l.roomId === roomId
      ? { ...l, availability, ...(bookingId !== undefined ? { activeBookingId: bookingId || undefined } : {}) }
      : l,
  );
  notify();
}

function subscribe(cb: () => void): () => void {
  _subscribers.add(cb);
  return () => { _subscribers.delete(cb); };
}

export function useListings(): Listing[] {
  const [listings, setListings] = useState<Listing[]>(getListings);

  useEffect(() => {
    const unsubscribe = subscribe(() => setListings(getListings()));

    fetchListings().catch((error) => {
      console.error("Failed to load listings from Supabase", error);
    });

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("staylock-listings")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => {
        fetchListings().catch((error) => {
          console.error("Failed to refresh listings from Supabase", error);
        });
      })
      .subscribe();

    return () => {
      unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, []);

  return listings;
}

const GRADIENTS: Array<[string, string]> = [
  ["rgba(245,158,11,0.55)", "rgba(8,47,73,0.9)"],
  ["rgba(167,139,250,0.5)", "rgba(30,27,75,0.9)"],
  ["rgba(251,146,60,0.5)", "rgba(67,20,7,0.9)"],
  ["rgba(147,197,253,0.45)", "rgba(15,23,42,0.9)"],
  ["rgba(52,211,153,0.45)", "rgba(6,78,59,0.9)"],
  ["rgba(251,191,36,0.5)", "rgba(30,58,138,0.9)"],
];

let _gradientIndex = GRADIENTS.length;

export function buildListing(params: {
  title: string;
  location: string;
  nightlyPriceXlm: number;
  escrowAmount: string;
  description: string;
  ownerWallet: string;
  hostName: string;
}): Listing {
  const idx = _gradientIndex % GRADIENTS.length;
  _gradientIndex++;
  const [gradientFrom, gradientTo] = GRADIENTS[idx];
  const timestamp = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);

  return {
    id: `listing-${timestamp}-${suffix}`,
    roomId: String(timestamp),
    ownerWallet: params.ownerWallet,
    escrowAmount: params.escrowAmount,
    nightlyPriceXlm: params.nightlyPriceXlm,
    title: params.title,
    location: params.location,
    description: params.description,
    amenities: [],
    hostName: params.hostName || params.ownerWallet.slice(0, 8),
    hostSince: new Date().getFullYear().toString(),
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    availability: "Available",
    gradientFrom,
    gradientTo,
  };
}

export { DEMO_HOST_WALLET };
