"use client";

import { useState } from "react";
import {
  Users,
  BedDouble,
  Bath,
  ShieldCheck,
  Star,
  Sparkles,
  MapPin,
  Lock,
} from "lucide-react";
import type { Listing } from "@/app/types/listing";
import { glassCard } from "@/app/components/ui/constants";
import { shortAddress } from "@/app/lib/soroban/format";
import { DEFAULT_FALLBACK_IMAGE } from "@/app/lib/listings";

type ListingCardProps = {
  listing: Listing;
  onReserve: (listing: Listing) => void;
  isActiveBooking: boolean;
  isHostView?: boolean;
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

export function ListingCard({
  listing,
  onReserve,
  isActiveBooking,
  isHostView = false,
}: ListingCardProps) {
  const [imgSrc, setImgSrc] = useState(listing.imageUrl || DEFAULT_FALLBACK_IMAGE);
  const [imageError, setImageError] = useState(false);
  const isReserved = listing.availability === "Reserved";
  const isCompleted = listing.availability === "Completed";
  const isUnavailable = isReserved || isCompleted;

  const rating = listing.rating ?? 4.95;
  const reviewCount = listing.reviewCount ?? 28;

  function handleImageError() {
    if (imgSrc !== DEFAULT_FALLBACK_IMAGE) {
      setImgSrc(DEFAULT_FALLBACK_IMAGE);
    } else {
      setImageError(true);
    }
  }

  return (
    <article
      className={`${glassCard} group relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-white/[0.18] hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_0_24px_-4px_rgba(245,158,11,0.1)] ${
        isUnavailable && !isHostView ? "opacity-75" : ""
      }`}
    >
      <div>
        {/* Ảnh bìa / Phần hiển thị trực quan */}
        <div className="relative h-56 w-full overflow-hidden bg-[#0c0e15]">
          {!imageError ? (
            <img
              src={imgSrc}
              alt={listing.title}
              onError={handleImageError}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="h-full w-full transition-transform duration-700 group-hover:scale-105"
              style={{
                background: `radial-gradient(circle at 28% 20%, rgba(255,255,255,0.25), transparent 18%), linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
              }}
            />
          )}

          {/* Lớp phủ chuyển màu giúp tăng tương phản */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-[#0c0e15]/40 to-black/30" />

          {/* Nhãn trạng thái & Đánh giá trên ảnh */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
            {/* Huy hiệu tình trạng phòng */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-md ${
                isReserved
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-200"
                  : isCompleted
                  ? "border-stone-400/30 bg-stone-500/20 text-stone-300"
                  : "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isReserved
                    ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                    : isCompleted
                    ? "bg-stone-400"
                    : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]"
                }`}
              />
              {isReserved ? "Đã đặt cọc" : isCompleted ? "Đã hoàn tất" : "Còn phòng trống"}
            </span>

            {/* Điểm đánh giá */}
            <div className="flex items-center gap-1 rounded-full border border-white/[0.12] bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-stone-400 font-normal">({reviewCount})</span>
            </div>
          </div>

          {/* Vị trí & Tiêu đề trên ảnh */}
          <div className="absolute bottom-3 inset-x-4">
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-300/90">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{listing.location}</span>
            </div>
            <h3 className="mt-0.5 text-lg font-bold tracking-tight text-white drop-shadow-sm">
              {listing.title}
            </h3>
          </div>
        </div>

        {/* Nội dung thân thẻ */}
        <div className="p-5 space-y-4">
          {/* Mô tả */}
          <p className="text-xs leading-relaxed text-stone-400 line-clamp-2">
            {listing.description}
          </p>

          {/* Thông số phòng: Số khách, Số giường, Số phòng tắm */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-black/30 p-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-300">
              <Users className="h-3.5 w-3.5 text-amber-400/80" />
              <span className="font-semibold text-white">{listing.maxGuests}</span>
              <span className="text-[10px] text-stone-500">khách</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-300 border-x border-white/[0.06]">
              <BedDouble className="h-3.5 w-3.5 text-amber-400/80" />
              <span className="font-semibold text-white">{listing.bedrooms}</span>
              <span className="text-[10px] text-stone-500">phòng ngủ</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-300">
              <Bath className="h-3.5 w-3.5 text-amber-400/80" />
              <span className="font-semibold text-white">{listing.bathrooms}</span>
              <span className="text-[10px] text-stone-500">phòng tắm</span>
            </div>
          </div>

          {/* Danh sách tiện ích */}
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-stone-300"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[11px] text-stone-500">
                +{listing.amenities.length - 3} tiện ích
              </span>
            )}
          </div>

          {/* Giá thuê & Ký quỹ an toàn */}
          <div className="rounded-xl border border-white/[0.08] bg-black/35 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-stone-400">Giá mỗi đêm</p>
                <p className="text-base font-bold text-white tracking-tight">
                  {xlmToDisplay(listing.nightlyPriceXlm)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Lock className="h-2.5 w-2.5 text-amber-400" />
                  <p className="text-[11px] font-medium text-amber-300/90">
                    Tiền cọc ký quỹ
                  </p>
                </div>
                <p className="text-xs font-semibold text-amber-200">
                  {stroopsToXlm(listing.escrowAmount)}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[11px] text-stone-400">
              <span className="truncate">Chủ nhà: {listing.hostName}</span>
              <span className="font-mono text-[10px] text-stone-500">
                {shortAddress(listing.ownerWallet)}
              </span>
            </div>
          </div>

          {/* Đang có đặt phòng của người dùng */}
          {isActiveBooking && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 py-2 text-xs font-semibold text-amber-200 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: "4s" }} />
              <span>Chuyến đi hiện tại của bạn</span>
            </div>
          )}
        </div>
      </div>

      {/* Nút hành động */}
      <div className="p-5 pt-0">
        {!isHostView ? (
          <button
            onClick={() => onReserve(listing)}
            disabled={isUnavailable}
            className={`w-full rounded-xl py-3 text-xs font-semibold transition-all duration-200 shadow-md ${
              isUnavailable
                ? "cursor-not-allowed border border-white/[0.08] bg-white/[0.02] text-stone-500"
                : "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-stone-950 shadow-amber-500/15 hover:brightness-105 active:scale-[0.98]"
            }`}
          >
            {isReserved ? "Phòng đang có khách" : isCompleted ? "Kỳ nghỉ đã kết thúc" : "Đặt phòng ký quỹ"}
          </button>
        ) : (
          <div
            className={`w-full rounded-xl border py-2.5 text-center text-xs font-medium ${
              isReserved
                ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                : isCompleted
                ? "border-stone-500/30 bg-stone-500/10 text-stone-400"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            }`}
          >
            {isReserved ? "Đang có khách — Chờ quyết toán" : isCompleted ? "Lưu trú đã hoàn tất" : "Đang mở nhận đặt phòng"}
          </div>
        )}
      </div>
    </article>
  );
}
