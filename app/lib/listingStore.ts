"use client";

import { useEffect, useState } from "react";
import {
  DEMO_HOST_WALLET,
  MOCK_LISTINGS,
  SAMPLE_STAY_IMAGES,
  DEFAULT_FALLBACK_IMAGE,
  getStableSampleImage,
} from "@/app/lib/listings";
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
  image_url?: string | null;
};

const STORAGE_KEY = "staylock_custom_listings_v1";

function loadStoredListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        ...item,
        imageUrl: item.imageUrl || getStableSampleImage(item.roomId || item.id),
      }));
    }
  } catch (e) {
    console.warn("Failed to parse custom listings from storage", e);
  }
  return [];
}

function saveStoredListings(listings: Listing[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (e) {
    console.warn("Failed to save custom listings to storage", e);
  }
}

// Khởi tạo danh sách kết hợp mock và danh sách do host tạo
let _listings: Listing[] = [...MOCK_LISTINGS];
let _initialized = false;
let _isHydrated = false;

function initListings() {
  if (_initialized) return;
  const custom = loadStoredListings();
  if (custom.length > 0) {
    const mockFiltered = MOCK_LISTINGS.filter(
      (m) => !custom.some((c) => c.id === m.id || c.roomId === m.roomId)
    );
    _listings = [...custom, ...mockFiltered];
  }
  _initialized = true;
}

const _subscribers = new Set<() => void>();

function notify() {
  _subscribers.forEach((cb) => cb());
}

function toListing(row: ListingRow): Listing {
  const roomId = row.room_id;
  const id = row.id;
  const imageUrl = row.image_url || getStableSampleImage(roomId || id);

  return {
    id,
    roomId,
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
    imageUrl,
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
    image_url: listing.imageUrl || getStableSampleImage(listing.roomId || listing.id),
  };
}

export function getListings(): Listing[] {
  return _listings;
}

async function fetchListings() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

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
  // Đảm bảo phòng luôn có ảnh mẫu lưu trú được gán
  if (!listing.imageUrl) {
    listing.imageUrl = getStableSampleImage(listing.roomId || listing.id);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("listings").insert(toRow(listing));
      if (error) {
        if (error.message?.includes("image_url")) {
          // Bỏ qua trường image_url nếu schema Supabase chưa có cột này
          const rowFallback: any = toRow(listing);
          delete rowFallback.image_url;
          await supabase.from("listings").insert(rowFallback);
        } else {
          console.warn("Supabase insert warning:", error.message);
        }
      }
    } catch (err) {
      console.warn("Supabase insert caught:", err);
    }
  }

  // Lưu trữ ổn định trên client storage để giữ nguyên trạng thái khi tải lại trang
  const currentCustom = loadStoredListings();
  const nextCustom = [
    listing,
    ...currentCustom.filter((x) => x.id !== listing.id && x.roomId !== listing.roomId),
  ];
  saveStoredListings(nextCustom);

  _listings = [listing, ..._listings.filter((item) => item.id !== listing.id)];
  notify();
}

export async function updateListingAvailability(
  roomId: string,
  availability: Listing["availability"],
  bookingId?: string,
) {
  const supabase = getSupabaseClient();
  if (supabase) {
    const patch: Record<string, unknown> = { availability };
    if (bookingId !== undefined) patch.active_booking_id = bookingId || null;

    const { error } = await supabase
      .from("listings")
      .update(patch)
      .eq("room_id", roomId);

    if (error) throw error;
  }

  _listings = _listings.map((l) =>
    l.roomId === roomId
      ? { ...l, availability, ...(bookingId !== undefined ? { activeBookingId: bookingId || undefined } : {}) }
      : l,
  );

  // Cập nhật lại trong persistent storage
  const currentCustom = loadStoredListings();
  if (currentCustom.some((c) => c.roomId === roomId)) {
    saveStoredListings(
      currentCustom.map((l) =>
        l.roomId === roomId
          ? { ...l, availability, ...(bookingId !== undefined ? { activeBookingId: bookingId || undefined } : {}) }
          : l
      )
    );
  }

  notify();
}

function subscribe(cb: () => void): () => void {
  _subscribers.add(cb);
  return () => { _subscribers.delete(cb); };
}

export function useListings(): Listing[] {
  // During SSR and initial client hydration, always return MOCK_LISTINGS to prevent hydration mismatch.
  // Once hydrated (or on subsequent client-side renders), return the up-to-date getListings().
  const [listings, setListings] = useState<Listing[]>(() => {
    return _isHydrated ? getListings() : MOCK_LISTINGS;
  });

  useEffect(() => {
    _isHydrated = true;
    initListings();
    setListings(getListings());

    const unsubscribe = subscribe(() => setListings(getListings()));

    fetchListings().catch((error) => {
      console.error("Failed to load listings from Supabase", error);
    });

    const supabase = getSupabaseClient();
    if (!supabase) {
      return unsubscribe;
    }

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
  imageUrl?: string;
}): Listing {
  const idx = _gradientIndex % GRADIENTS.length;
  _gradientIndex++;
  const [gradientFrom, gradientTo] = GRADIENTS[idx];
  const timestamp = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  const roomId = String(timestamp);

  // Tự động gán một ảnh mẫu lưu trú từ danh sách ảnh có sẵn
  const assignedImage = params.imageUrl || getStableSampleImage(roomId, _gradientIndex);

  return {
    id: `listing-${timestamp}-${suffix}`,
    roomId,
    ownerWallet: params.ownerWallet,
    escrowAmount: params.escrowAmount,
    nightlyPriceXlm: params.nightlyPriceXlm,
    title: params.title,
    location: params.location,
    description: params.description,
    amenities: ["Bảo chứng ký quỹ Soroban", "Xác thực on-chain", "Khóa ví Freighter"],
    hostName: params.hostName || params.ownerWallet.slice(0, 8),
    hostSince: new Date().getFullYear().toString(),
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    availability: "Available",
    gradientFrom,
    gradientTo,
    imageUrl: assignedImage,
    rating: 4.96,
    reviewCount: 1,
  };
}

export { DEMO_HOST_WALLET };
