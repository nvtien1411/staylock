import { activity } from "./data";
import { glassCard } from "@/app/components/ui/constants";

export function ActivityFeed() {
  return (
    <section id="activity" className={`${glassCard} p-5 sm:p-6`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Activity</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Live network confidence</h2>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-100">Realtime-style feed</span>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {activity.map(([title, detail, meta]) => (
          <div key={title} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs text-stone-500">{detail}</p>
            </div>
            <p className="text-right text-xs text-amber-100/80">{meta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
