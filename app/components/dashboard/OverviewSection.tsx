import { glassCard } from "@/app/components/ui/constants";
import { metrics, escrowSteps } from "./data";

export function OverviewSection() {
  return (
    <section id="overview" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className={`${glassCard} overflow-hidden p-6 sm:p-8`}>
        <div className="inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-sm text-amber-100 shadow-lg shadow-amber-500/10">
          Escrow-protected stays on Stellar
        </div>
        <h2 className="mt-6 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
          Book premium stays with trust built in.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
          Browse verified properties, reserve with your Freighter wallet, and let the Soroban smart contract hold your deposit until check-in is confirmed.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
              <p className="text-2xl font-black tracking-tight text-white">{value}</p>
              <p className="mt-1 text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${glassCard} p-6 sm:p-8`}>
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">How it works</p>
        <div className="mt-5 space-y-4">
          {escrowSteps.map(([number, title, description]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="text-sm font-black text-amber-100/80">{number}</p>
              <h3 className="mt-3 text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
