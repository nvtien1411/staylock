import type { PropertyCard } from "@/app/types/property";
import { glassCard } from "@/app/components/ui/constants";
import { getExplorerUrl, shortAddress } from "@/app/lib/soroban/format";

type PropertyGridProps = {
  properties: PropertyCard[];
};

export function PropertyGrid({ properties }: PropertyGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {properties.length === 0 ? (
        <div className={`${glassCard} p-7 md:col-span-2 xl:col-span-3`}>
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Portfolio</p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">Your property collection will appear here.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">Create your first property to see a live hosting card with owner wallet, room ID, and reservation-ready status.</p>
        </div>
      ) : (
        properties.map((property) => (
          <article key={`${property.transactionHash}-${property.id}`} className={`${glassCard} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.085]`}>
            <div className="h-40 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.32),transparent_14%),linear-gradient(135deg,rgba(251,191,36,0.4),rgba(8,47,73,0.65),rgba(12,10,9,1))]" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Room #{property.id}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">{property.name}</h3>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">Live</span>
              </div>
              <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-stone-500">Owner</span>
                  <span className="font-mono text-stone-200">{shortAddress(property.owner)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-stone-500">Status</span>
                  <span className="text-emerald-100">{property.status}</span>
                </div>
              </div>
              {property.transactionHash && (
                <a href={getExplorerUrl(property.transactionHash)} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-stone-200 transition hover:bg-white/[0.08]">
                  View listing proof
                </a>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
