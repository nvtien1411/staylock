import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage } from "@/app/lib/soroban/format";

type PropertyCreationCardProps = {
  propertyName: string;
  setPropertyName: (value: string) => void;
  propertyStatus: string;
  isCreatingProperty: boolean;
  propertyTone: { label: string; color: string; dot: string };
  propertyResult: Record<string, unknown> | null;
  createRoom: () => void;
};

export function PropertyCreationCard({
  propertyName,
  setPropertyName,
  propertyStatus,
  isCreatingProperty,
  propertyTone,
  propertyResult,
  createRoom,
}: PropertyCreationCardProps) {
  const propertyExplorerUrl = getExplorerUrl(propertyResult?.transactionHash);

  return (
    <section className={`${glassCard} p-5 sm:p-7`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-stone-500">Property creation</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight">Create your first property</h3>
          <p className="mt-3 text-sm leading-6 text-stone-400">Add a stay guests can reserve with a protected deposit and a premium trust experience.</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${propertyTone.color}`}>{propertyTone.label}</span>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <FieldLabel label="Property Name" hint="listing" />
          <input value={propertyName} onChange={(event) => setPropertyName(event.target.value)} placeholder="Amalfi Glass Villa" className={inputClass} />
        </label>
        <button
          onClick={createRoom}
          disabled={isCreatingProperty}
          className="rounded-2xl border border-amber-200/20 bg-amber-200/10 px-6 py-3.5 text-sm font-bold text-amber-50 transition-all duration-300 hover:-translate-y-1 hover:border-amber-100/50 hover:bg-amber-200/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreatingProperty ? "Publishing..." : "Create Property"}
        </button>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full shadow-lg ${propertyTone.dot}`} />
          <p className="text-sm text-stone-300">{statusMessage(propertyResult, propertyStatus)}</p>
        </div>
        {propertyExplorerUrl && (
          <a href={propertyExplorerUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100">
            View property confirmation
          </a>
        )}
      </div>
    </section>
  );
}
