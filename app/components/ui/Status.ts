export function getStatusTone(status: string, busy: boolean) {
  const normalized = status.toLowerCase();

  if (
    busy ||
    normalized.includes("preparing") ||
    normalized.includes("waiting") ||
    normalized.includes("submitting") ||
    normalized.includes("loading") ||
    normalized.includes("finalizing") ||
    normalized.includes("updating")
  ) {
    return {
      label: "Đang xử lý",
      color: "border-amber-400/30 bg-amber-400/10 text-amber-200 shadow-sm shadow-amber-500/10",
      dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse",
      title: "Đang bảo chứng & khóa cọc ký quỹ",
    };
  }

  if (
    normalized.includes("success") ||
    normalized.includes("submitted") ||
    normalized.includes("verified") ||
    normalized.includes("created") ||
    normalized.includes("confirmed") ||
    normalized.includes("completed")
  ) {
    return {
      label: "Đã xác nhận",
      color: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 shadow-sm shadow-emerald-500/10",
      dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      title: "Đã xác nhận trên chuỗi Stellar",
    };
  }

  if (
    normalized.includes("error") ||
    normalized.includes("rejected") ||
    normalized.includes("connect your wallet") ||
    normalized.includes("fill all") ||
    normalized.includes("enter")
  ) {
    return {
      label: "Cần chú ý",
      color: "border-rose-400/30 bg-rose-400/10 text-rose-200 shadow-sm shadow-rose-500/10",
      dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
      title: "Yêu cầu kiểm tra & thao tác",
    };
  }

  return {
    label: "Sẵn sàng",
    color: "border-white/10 bg-white/[0.05] text-stone-300",
    dot: "bg-stone-400 shadow-[0_0_6px_rgba(214,211,209,0.5)]",
    title: "Sẵn sàng tạo đặt phòng",
  };
}
