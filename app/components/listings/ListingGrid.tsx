import type { Listing } from "@/app/types/listing";
import { ListingCard } from "./ListingCard";

type ListingGridProps = {
  listings: Listing[];
  onReserve: (listing: Listing) => void;
  activeBookingRoomId?: string;
  isHostView?: boolean;
};

export function ListingGrid({ listings, onReserve, activeBookingRoomId, isHostView = false }: ListingGridProps) {
  const available = listings.filter((l) => l.availability === "Available").length;
  const reserved = listings.filter((l) => l.availability === "Reserved").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <p className="text-sm text-stone-400">
              <span className="font-semibold text-white">{available}</span> available
            </p>
          </div>
          {reserved > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              <p className="text-sm text-stone-400">
                <span className="font-semibold text-white">{reserved}</span> reserved
              </p>
            </div>
          )}
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs text-stone-400">
          {isHostView ? "Your inventory" : "Escrow-protected stays"}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onReserve={onReserve}
            isActiveBooking={!isHostView && listing.roomId === activeBookingRoomId}
            isHostView={isHostView}
          />
        ))}
      </div>
    </div>
  );
}
