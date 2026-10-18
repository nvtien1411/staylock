"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Lock,
} from "lucide-react";
import { glassCard } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage, shortAddress } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";

type ReservationStatusCardProps = {
  liveTone: { label: string; color: string; dot: string; title: string };
  createResult: Record<string, unknown> | null;
  createStatus: string;
  bookingId: string;
  isLoading: boolean;
  getBooking: () => void;
};

export function ReservationStatusCard({
  liveTone,
  createResult,
  createStatus,
  bookingId,
  isLoading,
  getBooking,
}: ReservationStatusCardProps) {
  const [showChainDetails, setShowChainDetails] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  const createdBookingId = createResult?.bookingId ?? (bookingId || undefined);
  const transactionHash = typeof createResult?.transactionHash === "string" ? createResult.transactionHash : undefined;
  const explorerUrl = getExplorerUrl(transactionHash);
  const showBookingId = typeof createdBookingId === "string" || typeof createdBookingId === "number";
  const hasResult = Boolean(createResult?.success);

  function copyCode() {
    if (!createdBookingId) return;
    navigator.clipboard.writeText(String(createdBookingId));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  function copyTx() {
    if (!transactionHash) return;
    navigator.clipboard.writeText(transactionHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  }

  return (
    <section className={`${glassCard} p-6 sm:p-7 space-y-5`}>
      {/* Thanh tiêu đề */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Hoạt động on-chain
            </span>
            <span className="text-stone-500 text-xs">&middot;</span>
            <span className="text-xs text-stone-400">Trạng thái ký quỹ thực tế</span>
          </div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {liveTone.title}
          </h3>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${liveTone.color}`}
        >
          {liveTone.label}
        </span>
      </div>

      {/* Khung trạng thái chính */}
      <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${liveTone.dot}`} />
          <p className="text-xs sm:text-sm text-stone-200 font-medium">
            {statusMessage(createResult, createStatus)}
          </p>
        </div>

        {/* Khối Mã Đặt Phòng Nổi Bật */}
        {showBookingId && (
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 via-white/[0.03] to-amber-500/10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-amber-200/80 font-bold">
                  Mã định danh đặt phòng trên chuỗi
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-2xl font-black text-white">
                    #{String(createdBookingId)}
                  </p>
                  <button
                    onClick={copyCode}
                    title="Sao chép mã đặt phòng"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.1] bg-black/40 text-stone-300 transition hover:bg-black/70 hover:text-white"
                  >
                    {copiedCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={getBooking}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-5 py-2.5 text-xs font-semibold text-stone-950 shadow-md shadow-amber-500/15 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{isLoading ? "Đang truy vấn sổ cái..." : "Kiểm tra trong trình tra cứu"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Khung xác nhận giao dịch thành công */}
        {transactionHash && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đồng thuận sổ cái Stellar thành công
              </span>
              <span>Đã xác thực</span>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg bg-black/40 px-2.5 py-1.5 font-mono text-xs text-emerald-200">
              <span className="truncate">{transactionHash}</span>
              <button
                onClick={copyTx}
                title="Sao chép mã giao dịch (Tx Hash)"
                className="shrink-0 p-1 text-emerald-300 hover:text-white"
              >
                {copiedTx ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {explorerUrl && (
              <a
                href={explorerUrl}
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

      {/* Ngăn kéo xem chi tiết bằng chứng mật mã */}
      {hasResult && (
        <div>
          <button
            onClick={() => setShowChainDetails(!showChainDetails)}
            className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-stone-400 transition hover:bg-white/[0.05] hover:text-stone-200"
          >
            <span>Xác minh bằng chứng mật mã hợp đồng</span>
            {showChainDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showChainDetails && (
            <div className="mt-2 space-y-2 rounded-xl border border-white/[0.08] bg-black/40 p-4 text-[11px] font-mono">
              {showBookingId && (
                <div className="flex items-center justify-between text-stone-400">
                  <span>Mã đặt phòng:</span>
                  <span className="text-white">#{String(createdBookingId)}</span>
                </div>
              )}
              {transactionHash && (
                <div className="flex items-center justify-between text-stone-400">
                  <span>Mã giao dịch:</span>
                  <span className="text-emerald-300 truncate max-w-[200px] sm:max-w-xs">{transactionHash}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-stone-400">
                <span>Hợp đồng Soroban:</span>
                <span className="text-amber-300">{shortAddress(CONTRACT_ID)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Mạng đồng thuận:</span>
                <span className="text-white">Stellar Testnet</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
