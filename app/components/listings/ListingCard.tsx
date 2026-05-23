import type { Listing } from "@/app/types/listing";
import { glassCard } from "@/app/components/ui/constants";
import { shortAddress } from "@/app/lib/soroban/format";

type ListingCardProps = {
  listing: Listing;
  onReserve: (listing: Listing) => void;
  isActiveBooking: boolean;
  isHostView?: boolean;
};

function xlmToDisplay(xlm: number) {
  return xlm % 1 === 0 ? `${xlm} XLM` : `${xlm.toFixed(2)} XLM`;
}

export function ListingCard({ listing, onReserve, isActiveBooking, isHostView = false }: ListingCardProps) {
  const isReserved = listing.availability === "Reserved";
  const isCompleted = listing.availability === "Completed";
  const isUnavailable = isReserved || isCompleted;

  return (
    <article className={`${glassCard} overflow-hidden transition-all duration-200 ${isUnavailable && !isHostView ? "opacity-70" : "hover:bg-white/[0.085]"}`}>
      <div
        className="relative h-44"
        style={{
          background: `radial-gradient(circle at 28% 20%, rgba(255,255,255,0.28), transparent 14%), linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
        }}
      >
        <div className="absolute inset-0 flex items-end p-4">
          <div className="flex w-full items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">{listing.location}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-white">{listing.title}</h3>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
              isReserved
                ? "border-amber-200/40 bg-amber-200/20 text-amber-100"
                : isCompleted
                  ? "border-stone-300/30 bg-stone-300/10 text-stone-300"
                  : "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
            }`}>
              {isReserved ? "Reserved" : isCompleted ? "Completed" : "Available"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-stone-400 line-clamp-2">{listing.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {listing.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs text-stone-300">
              {amenity}
            </span>
          ))}
          {listing.amenities.length > 3 && (
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs text-stone-500">
              +{listing.amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3">
          <div>
            <p className="text-xs text-stone-500">Nightly rate</p>
            <p className="mt-0.5 text-base font-semibold text-white">{xlmToDisplay(listing.nightlyPriceXlm)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-500">Host</p>
            <p className="mt-0.5 text-sm font-semibold text-stone-200">{listing.hostName}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] py-2">
            <p className="text-xs text-stone-500">Guests</p>
            <p className="mt-0.5 text-sm font-bold text-white">{listing.maxGuests}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] py-2">
            <p className="text-xs text-stone-500">Beds</p>
            <p className="mt-0.5 text-sm font-bold text-white">{listing.bedrooms}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] py-2">
            <p className="text-xs text-stone-500">Baths</p>
            <p className="mt-0.5 text-sm font-bold text-white">{listing.bathrooms}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-600" />
            <p className="font-mono text-xs text-stone-500">{shortAddress(listing.ownerWallet)}</p>
          </div>
          {isActiveBooking && (
            <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100">
              Your booking
            </span>
          )}
        </div>

        {!isHostView && (
          <button
            onClick={() => onReserve(listing)}
            disabled={isUnavailable}
            className={`mt-5 w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
              isUnavailable
                ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-stone-500"
                : "bg-amber-300 text-stone-950 shadow-lg shadow-amber-500/15 hover:bg-amber-200"
            }`}
          >
            {isReserved ? "Currently Reserved" : isCompleted ? "Stay Completed" : "Reserve Stay"}
          </button>
        )}

        {isHostView && (
          <div className={`mt-5 w-full rounded-xl border px-6 py-3 text-center text-sm font-medium ${
            isReserved
              ? "border-amber-200/20 bg-amber-200/10 text-amber-100"
              : isCompleted
                ? "border-stone-300/20 bg-stone-300/10 text-stone-400"
                : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          }`}>
            {isReserved ? "Occupied — awaiting check-in" : isCompleted ? "Stay completed" : "Open for reservations"}
          </div>
        )}
      </div>
    </article>
  );
}
