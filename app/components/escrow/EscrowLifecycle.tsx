"use client";

import { useState } from "react";
import {
  Lock,
  CheckCircle2,
  Sparkles,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { LifecycleAction, ReservationStage } from "@/app/types/booking";
import { lifecycleStages } from "@/app/components/dashboard/data";
import { glassCard } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage } from "@/app/lib/soroban/format";

function getStageIndex(stage: ReservationStage) {
  return lifecycleStages.findIndex((item) => item.stage === stage);
}

function getStageLabelVi(stage: ReservationStage) {
  switch (stage) {
    case "Reserved":
      return "Đã khóa ký quỹ";
    case "Checked In":
      return "Đã nhận phòng";
    case "Completed":
      return "Đã hoàn tất & giải ngân";
    case "Cancelled":
      return "Đã hủy đặt phòng";
    default:
      return stage;
  }
}

type EscrowLifecycleProps = {
  bookingId: string;
  lifecycleStatus: string;
  lifecycleAction: LifecycleAction;
  lifecycleResult: Record<string, unknown> | null;
  lifecycleTone: { label: string; color: string; dot: string };
  reservationStage: ReservationStage;
  userRole: "guest" | "host";
  confirmCheckIn: () => void;
  completeStay: () => void;
  cancelReservation: () => void;
};

export function EscrowLifecycle({
  bookingId,
  lifecycleStatus,
  lifecycleAction,
  lifecycleResult,
  lifecycleTone,
  reservationStage,
  userRole,
  confirmCheckIn,
  completeStay,
  cancelReservation,
}: EscrowLifecycleProps) {
  const [copiedTx, setCopiedTx] = useState(false);
  const activeStageIndex = getStageIndex(reservationStage);
  const txHash = typeof lifecycleResult?.transactionHash === "string" ? lifecycleResult.transactionHash : "";
  const lifecycleExplorerUrl = getExplorerUrl(txHash);
  const isTerminal = reservationStage === "Completed" || reservationStage === "Cancelled";
  const canCancel = !isTerminal && reservationStage === "Reserved";

  function copyTx() {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  }

  const stageIcons = {
    Reserved: Lock,
    "Checked In": CheckCircle2,
    Completed: Sparkles,
    Cancelled: XCircle,
  };

  return (
    <section id="escrow" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Cột trái: Tiến trình Vòng đời Ký quỹ */}
      <div className={`${glassCard} flex flex-col justify-between p-6 sm:p-7 space-y-6`}>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  Giao thức Soroban
                </span>
                <span className="text-xs text-stone-500 font-mono">Quy trình tự động hóa</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                Tiến trình vòng đời ký quỹ (Escrow)
              </h2>
            </div>
            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${lifecycleTone.color}`}
            >
              {lifecycleAction ? "Đang cập nhật trên chuỗi..." : getStageLabelVi(reservationStage)}
            </span>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-stone-400">
            {userRole === "host"
              ? "Tiền cọc được hợp đồng thông minh Soroban khóa an toàn ngay khi có khách đặt. Xác nhận hoàn tất lưu trú khi khách trả phòng để nhận tiền chuyển thẳng về ví."
              : "Tiền cọc của bạn hoàn toàn phi lưu ký (non-custodial) trong suốt chuyến đi. Xác nhận khi đến nơi, và khi trả phòng tiền sẽ tự động giải ngân cho chủ nhà."}
          </p>
        </div>

        {/* Các thẻ từng giai đoạn */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {lifecycleStages.map((item, index) => {
            const isActive = item.stage === reservationStage;
            const isPast =
              reservationStage !== "Cancelled" && activeStageIndex >= 0 && index < activeStageIndex;
            const isCancelledCard = item.stage === "Cancelled";
            const Icon = stageIcons[item.stage] || Lock;

            const cardTone = isActive
              ? isCancelledCard
                ? "border-rose-400/40 bg-rose-500/15 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-400/30"
                : "border-amber-400/50 bg-amber-500/15 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40"
              : isPast
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "border-white/[0.06] bg-black/30 text-stone-400";

            return (
              <div
                key={item.stage}
                className={`relative rounded-2xl border p-4.5 transition-all duration-300 ${cardTone}`}
              >
                {/* Chỉ số bước & biểu tượng */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider opacity-60">
                    BƯỚC 0{index + 1}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                      isActive
                        ? isCancelledCard
                          ? "bg-rose-500/30 text-rose-200"
                          : "bg-amber-400/30 text-amber-200"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/[0.04] text-stone-600"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <h3 className="mt-3.5 text-sm font-bold text-white tracking-tight">
                  {getStageLabelVi(item.stage)}
                </h3>
                <p className="mt-0.5 text-xs font-semibold opacity-90">{item.title}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-stone-400 opacity-80 line-clamp-3">
                  {item.description}
                </p>

                {isActive && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Giai đoạn hiện tại</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cam kết kỹ thuật */}
        <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Chuyển đổi trạng thái mật mã được bảo chứng bởi Soroban VM</span>
          </span>
          <span className="font-mono text-stone-500">Chuẩn Mainnet Stellar</span>
        </div>
      </div>

      {/* Cột phải: Bảng Điều Khiển Hành Động */}
      <div className={`${glassCard} flex flex-col justify-between p-6 sm:p-7 space-y-6`}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                Bảng điều khiển
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-white">
                {bookingId ? `Mã đặt phòng #${bookingId}` : "Chưa chọn đặt phòng"}
              </h3>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${lifecycleTone.color}`}
            >
              {lifecycleTone.label}
            </span>
          </div>

          {/* Hộp trạng thái hiện tại */}
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/40 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${lifecycleTone.dot}`} />
              <p className="text-xs font-medium text-stone-200">
                {statusMessage(lifecycleResult, lifecycleStatus)}
              </p>
            </div>

            {/* Chi tiết Tx Hash giao dịch */}
            {txHash && (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
                  <span>Giao dịch đã xác nhận</span>
                  <span>Đồng thuận sổ cái OK</span>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-lg bg-black/40 px-2.5 py-1.5 font-mono text-xs text-emerald-200">
                  <span className="truncate">{txHash}</span>
                  <button
                    onClick={copyTx}
                    title="Sao chép Tx Hash"
                    className="shrink-0 p-1 text-emerald-300 hover:text-white"
                  >
                    {copiedTx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {lifecycleExplorerUrl && (
                  <a
                    href={lifecycleExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/30 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/30"
                  >
                    <span>Xem trên Stellar Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Các nút hành động theo phân quyền */}
        <div className="space-y-3">
          {/* Khách: Xác nhận Check-in */}
          {userRole === "guest" && (
            <button
              onClick={confirmCheckIn}
              disabled={Boolean(lifecycleAction) || !bookingId || reservationStage !== "Reserved"}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-xs font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {lifecycleAction === "checkin" ? "Đang xác nhận nhận phòng..." : "Xác nhận đã đến & nhận phòng"}
              </span>
            </button>
          )}

          {/* Chủ nhà: Quyết toán hoàn tất */}
          {userRole === "host" && (
            <button
              onClick={completeStay}
              disabled={Boolean(lifecycleAction) || !bookingId || reservationStage !== "Checked In"}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3.5 text-xs font-semibold text-stone-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {lifecycleAction === "checkout" ? "Đang giải ngân ký quỹ..." : "Hoàn tất kỳ nghỉ & giải ngân tiền cọc"}
              </span>
            </button>
          )}

          {/* Khách: Hủy phòng & Hoàn tiền cọc */}
          {canCancel && (
            <button
              onClick={cancelReservation}
              disabled={Boolean(lifecycleAction) || !bookingId}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 py-3 text-xs font-semibold text-rose-200 transition-all duration-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <XCircle className="h-4 w-4" />
              <span>
                {lifecycleAction === "cancel" ? "Đang xử lý hủy phòng..." : "Hủy đặt phòng & hoàn tiền cọc về ví"}
              </span>
            </button>
          )}

          {/* Thông báo nếu đã ở trạng thái cuối */}
          {isTerminal && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-center text-xs text-stone-400">
              Đặt phòng này đã kết thúc toàn bộ vòng đời on-chain.
            </div>
          )}

          {!canCancel && !isTerminal && userRole === "guest" && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-center text-[11px] text-stone-500">
              Không thể hủy đặt phòng sau khi đã xác nhận nhận phòng an toàn.
            </div>
          )}

          {!bookingId && (
            <p className="text-center text-[11px] text-stone-500">
              Chọn một phòng hoặc nhập mã đặt phòng phía trên để thao tác.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
