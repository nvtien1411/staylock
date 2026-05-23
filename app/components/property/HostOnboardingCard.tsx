import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage } from "@/app/lib/soroban/format";

type HostOnboardingCardProps = {
  address: string;
  hostName: string;
  setHostName: (value: string) => void;
  isAddingHost: boolean;
  isHostOnboarded: boolean;
  hostTone: { label: string; color: string; dot: string };
  hostResult: Record<string, unknown> | null;
  hostStatus: string;
  addHost: () => void;
};

export function HostOnboardingCard({
  address,
  hostName,
  setHostName,
  isAddingHost,
  isHostOnboarded,
  hostTone,
  hostResult,
  hostStatus,
  addHost,
}: HostOnboardingCardProps) {
  const hostExplorerUrl = getExplorerUrl(hostResult?.transactionHash);

  return (
    <section className={`${glassCard} p-5 sm:p-7`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-stone-500">Host onboarding</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight">Start hosting on StayLock</h3>
          <p className="mt-3 text-sm leading-6 text-stone-400">Open your protected property channel and prepare your stays for secure reservations.</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${isHostOnboarded ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : hostTone.color}`}>
          {isHostOnboarded ? "Verified host" : hostTone.label}
        </span>
      </div>

      <div className="mt-7 space-y-5">
        <label className="block">
          <FieldLabel label="Host Wallet" hint="connected" />
          <input value={address || "Connect wallet to continue"} readOnly className={`${inputClass} cursor-default text-stone-300`} />
        </label>
        <label className="block">
          <FieldLabel label="Host Name" hint="public profile" />
          <input value={hostName} onChange={(event) => setHostName(event.target.value)} placeholder="Casa Meridian Collective" className={inputClass} />
        </label>
      </div>

      <button
        onClick={addHost}
        disabled={isAddingHost}
        className="mt-7 w-full rounded-2xl bg-gradient-to-r from-stone-50 via-amber-100 to-amber-300 px-8 py-4 text-base font-black text-stone-950 shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-300/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAddingHost ? "Creating host profile..." : "Become a Host"}
      </button>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full shadow-lg ${hostTone.dot}`} />
          <p className="text-sm text-stone-300">{statusMessage(hostResult, hostStatus)}</p>
        </div>
        {hostExplorerUrl && (
          <a href={hostExplorerUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-emerald-200 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100">
            View host confirmation
          </a>
        )}
      </div>
    </section>
  );
}
