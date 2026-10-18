"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Calendar,
  Lock,
  Wallet,
  Building,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  XCircle,
} from "lucide-react";
import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { shortAddress } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";
import {
  asBookingRecord,
  pickBookingField,
  reservationStageFromStatus,
  getBookingStatusValue,
} from "@/app/types/booking";

type ReservationLookupProps = {
  bookingId: string;
  setBookingId: (value: string) => void;
  response: string;
  isLoading: boolean;
  lookupResult: Record<string, unknown> | null;
  lookupValue: unknown;
  getBooking: () => void;
};

function fieldText(value: unknown, fallback = "—") {
  if (typeof value === "string" && value) {
    return value;
  }
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function formatAddress(value: unknown) {
  const address = fieldText(value, "");
  return address ? shortAddress(address) : "—";
}

function formatDate(value: unknown) {
  const text = fieldText(value, "");

  if (/^\d{8}$/.test(text)) {
    const year = Number(text.slice(0, 4));
    const month = Number(text.slice(4, 6));
    const day = Number(text.slice(6, 8));
    const date = new Date(Date.UTC(year, month - 1, day));

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    }
  }

  return text || "—";
}

function formatAmount(value: unknown) {
  const text = fieldText(value, "");

  try {
    const stroops = BigInt(text);
    const stroopsPerXlm = BigInt(10000000);
    const whole = stroops / stroopsPerXlm;
    const remainder = stroops % stroopsPerXlm;
    const decimals = remainder.toString().padStart(7, "0").replace(/0+$/, "");

    return `${whole}${decimals ? `.${decimals}` : ""} XLM`;
  } catch {
    return text ? `${text} XLM` : "—";
  }
}

function getStageLabelVi(stage: string) {
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

export function ReservationLookup({
  bookingId,
  setBookingId,
  response,
  isLoading,
  lookupResult,
  lookupValue,
  getBooking,
}: ReservationLookupProps) {
  const [showChainDetails, setShowChainDetails] = useState(false);
  const booking = asBookingRecord(lookupValue ?? lookupResult);
  const rawStatus = getBookingStatusValue(booking);
  const stage = reservationStageFromStatus(rawStatus);
  const status = stage;
  const isCancelled = stage === "Cancelled";
  const traveler = pickBookingField(booking, [
    "traveler",
    "guest",
    "guest_wallet",
    "traveler_address",
  ]);
  const host = pickBookingField(booking, ["host", "owner", "property_owner", "host_address"]);
  const room = pickBookingField(booking, ["room_name", "roomName", "room", "room_id", "roomId"]);
  const amount = pickBookingField(booking, [
    "amount",
    "deposit",
    "escrow_amount",
    "escrowAmount",
  ]);
  const checkin = pickBookingField(booking, [
    "day_checkin",
    "dayCheckin",
    "checkin",
    "check_in",
    "checkIn",
  ]);
  const checkout = pickBookingField(booking, [
    "day_checkout",
    "dayCheckin",
    "checkout",
    "check_out",
    "checkOut",
  ]);
  const lifecycleSteps = [
    { key: "Reserved", label: "Đã đặt cọc" },
    { key: "Checked In", label: "Đã nhận phòng" },
    { key: "Completed", label: "Đã hoàn tất" },
  ];

  function isCompletedStep(stepKey: string) {
    if (isCancelled) return false;
    if (stepKey === "Reserved") return true;
    if (stepKey === "Checked In") return stage === "Checked In" || stage === "Completed";
    return stage === "Completed";
  }

  return (
    <section id="track" className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      {/* Ô nhập tra cứu */}
      <div className={`${glassCard} flex flex-col justify-between p-6 sm:p-7 space-y-6`}>
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Tra cứu ký quỹ
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Theo dõi đặt phòng</h2>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            Truy vấn trạng thái hợp đồng thông minh Soroban theo thời gian thực bằng mã định danh đặt
            phòng.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block">
              <FieldLabel label="Mã đặt phòng" hint="dạng số" required />
              <div className="relative">
                <input
                  id="booking-id"
                  type="number"
                  min="0"
                  value={bookingId}
                  onChange={(event) => setBookingId(event.target.value)}
                  placeholder="Ví dụ: 1001 hoặc 1002"
                  className={inputClass}
                />
              </div>
            </label>

            {/* Phím tắt tra cứu nhanh */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">
                Phím tắt tra cứu nhanh
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["1001", "1002", "1003"].map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setBookingId(id);
                    }}
                    className="rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-1 text-xs font-mono text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                  >
                    #{id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={getBooking}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-xs font-semibold text-stone-950 shadow-md shadow-amber-500/15 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
              <span>Đang truy vấn sổ cái Stellar...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Kiểm tra hồ sơ on-chain</span>
            </>
          )}
        </button>
      </div>

      {/* Thẻ hiển thị hồ sơ on-chain */}
      <div className={`${glassCard} flex flex-col justify-between p-6 sm:p-7 space-y-6`}>
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                Xác thực sổ cái
              </p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                {lookupResult
                  ? `Hồ sơ đặt phòng #${bookingId || "—"}`
                  : "Chờ nhập mã đặt phòng"}
              </h3>
            </div>
            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                isLoading
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                  : lookupResult
                  ? isCancelled
                    ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  : "border-white/[0.08] bg-white/[0.03] text-stone-400"
              }`}
            >
              {isLoading ? "Đang truy vấn..." : lookupResult ? getStageLabelVi(status) : "Sẵn sàng"}
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/40 p-5">
            {lookupResult ? (
              <div className="space-y-5">
                {/* Phần Boarding Pass */}
                <div className="rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-white/[0.03] to-cyan-500/10 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                        Hợp đồng ký quỹ thông minh
                      </span>
                      <h4 className="mt-1 text-xl font-bold text-white tracking-tight">
                        Đặt phòng #{bookingId || "—"}
                      </h4>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                        isCancelled
                          ? "border-rose-400/30 bg-rose-500/20 text-rose-200"
                          : "border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {getStageLabelVi(status)}
                    </span>
                  </div>

                  {/* 4 Khối thông tin chi tiết */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 space-y-1">
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-500">
                        <User className="h-3 w-3 text-amber-400" />
                        Ví khách du lịch
                      </span>
                      <p className="font-mono text-xs font-medium text-stone-100">
                        {formatAddress(traveler)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 space-y-1">
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-500">
                        <Building className="h-3 w-3 text-amber-400" />
                        Ví chủ nhà thụ hưởng
                      </span>
                      <p className="font-mono text-xs font-medium text-stone-100">
                        {formatAddress(host)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3.5 space-y-1">
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-500">
                        <Calendar className="h-3 w-3 text-amber-400" />
                        Thời gian lưu trú
                      </span>
                      <p className="text-xs font-semibold text-white">
                        {formatDate(checkin)} &rarr; {formatDate(checkout)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 space-y-1">
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                        <Lock className="h-3 w-3" />
                        Tiền cọc ký quỹ khóa
                      </span>
                      <p className="text-base font-bold text-amber-200">
                        {formatAmount(amount)}
                      </p>
                    </div>
                  </div>

                  {/* Tên phòng */}
                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/30 p-3 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Phòng lưu trú:</span>
                    <span className="font-semibold text-white">
                      {fieldText(room, "Đang ghi nhận trên sổ cái")}
                    </span>
                  </div>
                </div>

                {/* Danh sách kiểm tra tiến độ */}
                <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-3">
                    Tiến trình xác thực
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {lifecycleSteps.map((step) => {
                      const complete = isCompletedStep(step.key);
                      return (
                        <div
                          key={step.key}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium ${
                            complete
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-white/[0.06] bg-black/20 text-stone-500"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              complete
                                ? "bg-emerald-400 text-stone-950"
                                : "bg-white/[0.06] text-stone-600"
                            }`}
                          >
                            {complete ? "✓" : "·"}
                          </span>
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ngăn kéo xem chi tiết kỹ thuật */}
                <div>
                  <button
                    onClick={() => setShowChainDetails(!showChainDetails)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-medium text-stone-400 transition hover:bg-white/[0.05] hover:text-stone-200"
                  >
                    <span>Xem thông số kỹ thuật sổ cái on-chain</span>
                    {showChainDetails ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {showChainDetails && (
                    <div className="mt-2 space-y-2 rounded-xl border border-white/[0.06] bg-black/50 p-4 text-[11px] font-mono">
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Địa chỉ hợp đồng:</span>
                        <span className="text-amber-300">{shortAddress(CONTRACT_ID)}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Đơn vị stroops gốc:</span>
                        <span className="text-white">{fieldText(amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-400">
                        <span>Mạng sổ cái đồng thuận:</span>
                        <span className="text-white">Stellar Testnet</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search className="mx-auto h-8 w-8 text-stone-600 mb-2" />
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {response}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
