export function getStatusTone(status: string, busy: boolean) {
  const normalized = status.toLowerCase();

  if (busy || normalized.includes("preparing") || normalized.includes("waiting") || normalized.includes("submitting") || normalized.includes("loading") || normalized.includes("finalizing") || normalized.includes("updating")) {
    return {
      label: "In progress",
      color: "border-amber-200/30 bg-amber-200/10 text-amber-100",
      dot: "bg-amber-200 shadow-amber-200/60",
      title: "Securing your reservation",
    };
  }

  if (normalized.includes("success") || normalized.includes("submitted") || normalized.includes("verified") || normalized.includes("created") || normalized.includes("confirmed") || normalized.includes("completed")) {
    return {
      label: "Confirmed",
      color: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
      dot: "bg-emerald-300 shadow-emerald-300/60",
      title: "Reservation submitted",
    };
  }

  if (normalized.includes("error") || normalized.includes("rejected") || normalized.includes("connect your wallet") || normalized.includes("fill all") || normalized.includes("enter")) {
    return {
      label: "Needs attention",
      color: "border-rose-300/30 bg-rose-300/10 text-rose-100",
      dot: "bg-rose-300 shadow-rose-300/60",
      title: "Action required",
    };
  }

  return {
    label: "Ready",
    color: "border-white/10 bg-white/[0.06] text-stone-200",
    dot: "bg-stone-300 shadow-stone-300/50",
    title: "Ready to reserve",
  };
}
