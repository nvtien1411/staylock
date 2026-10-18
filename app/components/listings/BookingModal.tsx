"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Building,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import type { Listing } from "@/app/types/listing";
import { inputClass } from "@/app/components/ui/constants";
import { shortAddress } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";
import { DEFAULT_FALLBACK_IMAGE } from "@/app/lib/listings";

type BookingModalProps = {
  listing: Listing;
  walletAddress: string;
  isCreating: boolean;
  onConfirm: (dayCheckin: string, dayCheckout: string) => void;
  onClose: () => void;
};

function xlmToDisplay(xlm: number) {
  return xlm % 1 === 0 ? `${xlm} XLM` : `${xlm.toFixed(2)} XLM`;
}

function stroopsToXlm(stroops: string) {
  try {
    const val = BigInt(stroops);
    const whole = val / BigInt(10000000);
    const rem = val % BigInt(10000000);
    const dec = rem.toString().padStart(7, "0").replace(/0+$/, "");
    return `${whole}${dec ? `.${dec}` : ""} XLM`;
  } catch {
    return `${stroops} stroops`;
  }
}

function dateToDay(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function BookingModal({
  listing,
  walletAddress,
  isCreating,
  onConfirm,
  onClose,
}: BookingModalProps) {
  const [modalImg, setModalImg] = useState(listing.imageUrl || DEFAULT_FALLBACK_IMAGE);
  const [modalImgFailed, setModalImgFailed] = useState(false);
  const [checkinDate, setCheckinDate] = useState(addDays(today(), 1));
  const [checkoutDate, setCheckoutDate] = useState(addDays(today(), 5));
  const [showContractDetails, setShowContractDetails] = useState(false);

  function handleImageError() {
    if (modalImg !== DEFAULT_FALLBACK_IMAGE) {
      setModalImg(DEFAULT_FALLBACK_IMAGE);
    } else {
      setModalImgFailed(true);
    }
  }

  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkoutDate).getTime() - new Date(checkinDate).getTime()) / 86400000
    )
  );
  const totalStayXlm = listing.nightlyPriceXlm * nights;

  function handleConfirm() {
    if (!walletAddress) return;
    const dayCheckin = dateToDay(checkinDate);
    const dayCheckout = dateToDay(checkoutDate);
    onConfirm(dayCheckin, dayCheckout);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      {/* Lớp nền tối mờ */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

      {/* Thẻ cửa sổ Modal */}
      <div
        className="relative my-8 w-full max-w-xl overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c0e15] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.1)] transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner ảnh bìa */}
        <div className="relative h-40 w-full overflow-hidden bg-[#12151f]">
          {!modalImgFailed ? (
            <img
              src={modalImg}
              alt={listing.title}
              onError={handleImageError}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(circle at 28% 20%, rgba(255,255,255,0.28), transparent 14%), linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-[#0c0e15]/60 to-black/40" />

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-black/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Tiêu đề trên banner */}
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              {listing.location}
            </span>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white drop-shadow">
              {listing.title}
            </h2>
          </div>
        </div>

        {/* Thân Modal */}
        <div className="p-6 space-y-6">
          {/* Cảnh báo chưa kết nối ví */}
          {!walletAddress && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-200">
              <Wallet className="h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="font-semibold text-amber-100">Chưa kết nối ví Freighter</p>
                <p className="mt-0.5 text-amber-200/80">
                  Vui lòng kết nối ví Freighter để cấp quyền khóa tiền cọc ký quỹ trên chuỗi.
                </p>
              </div>
            </div>
          )}

          {/* Chọn ngày lưu trú */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Thời gian lưu trú
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Calendar className="h-3 w-3 text-amber-400" />
                  Ngày nhận phòng (check-in)
                </span>
                <input
                  type="date"
                  value={checkinDate}
                  min={addDays(today(), 1)}
                  onChange={(e) => setCheckinDate(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="flex items-center gap-1 text-[11px] text-stone-400">
                  <Calendar className="h-3 w-3 text-amber-400" />
                  Ngày trả phòng (check-out)
                </span>
                <input
                  type="date"
                  value={checkoutDate}
                  min={addDays(checkinDate, 1)}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          {/* Bảng phân tách chi phí minh bạch */}
          <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>
                Tiền phòng ({nights} đêm &times; {xlmToDisplay(listing.nightlyPriceXlm)})
              </span>
              <span className="font-semibold text-white">{xlmToDisplay(totalStayXlm)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Tiền cọc ký quỹ on-chain</span>
              </div>
              <span className="font-semibold text-amber-300">
                {stroopsToXlm(listing.escrowAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Ước tính phí mạng Stellar</span>
              <span className="font-mono text-[11px] text-stone-300">&lt; 0.0001 XLM</span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Phí hoa hồng nền tảng
              </span>
              <span className="font-bold">0.00 XLM (0%)</span>
            </div>

            <div className="border-t border-white/[0.08] pt-3 flex items-baseline justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">
                  Tổng cọc ký quỹ ủy quyền
                </p>
                <p className="text-xl font-bold tracking-tight text-white">
                  {stroopsToXlm(listing.escrowAmount)}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  Bảo chứng bằng Soroban
                </span>
              </div>
            </div>
          </div>

          {/* Ghi chú bảo đảm ký quỹ */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-3.5 text-xs text-stone-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <p className="leading-relaxed">
              Tiền cọc của bạn được khóa an toàn bên trong hợp đồng thông minh Soroban. Chủ nhà không thể
              rút tiền cho đến khi bạn xác nhận đã nhận phòng an toàn.
            </p>
          </div>

          {/* Ngăn kéo xem chi tiết thông số kỹ thuật on-chain */}
          <div>
            <button
              onClick={() => setShowContractDetails(!showContractDetails)}
              className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-stone-400 transition hover:bg-white/[0.05] hover:text-stone-200"
            >
              <span>Xem thông số kỹ thuật hợp đồng trên chuỗi</span>
              {showContractDetails ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showContractDetails && (
              <div className="mt-2 space-y-2 rounded-xl border border-white/[0.06] bg-black/40 p-4 text-[11px] font-mono">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Mã phòng:</span>
                  <span className="text-white">#{listing.roomId}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Ví chủ nhà thụ hưởng:</span>
                  <span className="text-white">{shortAddress(listing.ownerWallet)}</span>
                </div>
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

          {/* Nút hành động */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirm}
              disabled={isCreating || !walletAddress}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                  <span>Đang ký duyệt &amp; khóa ký quỹ trên Stellar...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>
                    {walletAddress ? "Xác nhận & khóa tiền cọc ký quỹ" : "Vui lòng kết nối ví trước"}
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-stone-500">
              Yêu cầu chữ ký xác nhận ví Freighter &middot; Stellar Soroban &middot; Phi lưu ký (non-custodial)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
