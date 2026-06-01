import { useState } from "react";
import type { Listing } from "@/app/types/listing";
import { ListingCard } from "./ListingCard";

type ListingGridProps = {
  listings: Listing[];
  onReserve: (listing: Listing) => void;
  activeBookingRoomId?: string;
  isHostView?: boolean;
};

export function ListingGrid({ listings, onReserve, activeBookingRoomId, isHostView = false }: ListingGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const available = listings.filter((l) => l.availability === "Available").length;
  const reserved = listings.filter((l) => l.availability === "Reserved").length;

  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * itemsPerPage;
  const visibleListings = listings.slice(startIndex, startIndex + itemsPerPage);

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
        {visibleListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onReserve={onReserve}
            isActiveBooking={!isHostView && listing.roomId === activeBookingRoomId}
            isHostView={isHostView}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-500">
            Showing <span className="font-semibold text-stone-400">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-stone-400">
              {Math.min(startIndex + itemsPerPage, listings.length)}
            </span>{" "}
            of <span className="font-semibold text-stone-400">{listings.length}</span> properties
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-default disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === activePage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-full text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-amber-300 text-stone-950 shadow-md shadow-amber-500/10"
                        : "border border-white/5 bg-transparent text-stone-400 hover:bg-white/[0.06] hover:text-stone-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-default disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

