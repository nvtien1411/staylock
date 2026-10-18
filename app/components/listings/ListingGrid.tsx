"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Listing } from "@/app/types/listing";
import { ListingCard } from "./ListingCard";

const ITEMS_PER_PAGE = 6;

type ListingGridProps = {
  listings: Listing[];
  onReserve: (listing: Listing) => void;
  activeBookingRoomId?: string;
  isHostView?: boolean;
};

export function ListingGrid({
  listings,
  onReserve,
  activeBookingRoomId,
  isHostView = false,
}: ListingGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "Available" | "Reserved">("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const totalAvailable = listings.filter((l) => l.availability === "Available").length;
  const totalReserved = listings.filter((l) => l.availability === "Reserved").length;

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.hostName.toLowerCase().includes(q)
      );
    }

    if (availabilityFilter !== "all") {
      result = result.filter((l) => l.availability === availabilityFilter);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.nightlyPriceXlm - b.nightlyPriceXlm);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.nightlyPriceXlm - a.nightlyPriceXlm);
    }

    return result;
  }, [listings, searchQuery, availabilityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));

  // Đưa về trang 1 khi từ khóa tìm kiếm, bộ lọc hoặc sắp xếp thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, availabilityFilter, sortBy]);

  // Đảm bảo trang hiện tại luôn nằm trong phạm vi hợp lệ
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Cắt danh sách đúng 6 phòng mỗi trang
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredListings, currentPage]);

  function goToPage(page: number) {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Danh sách các số trang hiển thị
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <div ref={gridTopRef} className="space-y-6">
      {/* Thanh công cụ Tìm kiếm & Bộ lọc */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/70 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Ô nhập tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo thành phố, tên biệt thự, tiện ích..."
              className="w-full rounded-xl border border-white/[0.08] bg-black/40 py-2.5 pl-10 pr-9 text-xs text-stone-100 placeholder:text-stone-500 outline-none transition-all duration-200 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Phím lọc nhanh */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc tình trạng phòng */}
            <div suppressHydrationWarning className="flex rounded-xl border border-white/[0.08] bg-black/40 p-1">
              <button
                suppressHydrationWarning
                onClick={() => setAvailabilityFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  availabilityFilter === "all"
                    ? "bg-white/[0.12] text-white"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Tất cả ({listings.length})
              </button>
              <button
                suppressHydrationWarning
                onClick={() => setAvailabilityFilter("Available")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  availabilityFilter === "Available"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Còn trống ({totalAvailable})
              </button>
              <button
                suppressHydrationWarning
                onClick={() => setAvailabilityFilter("Reserved")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  availabilityFilter === "Reserved"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Đã đặt ({totalReserved})
              </button>
            </div>

            {/* Sắp xếp giá */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs text-stone-300 outline-none transition focus:border-amber-400/50"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Thanh trạng thái dữ liệu phòng */}
        <div suppressHydrationWarning className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <div suppressHydrationWarning className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Lưu trú đã xác thực on-chain
            </span>
            <span>&middot;</span>
            <span suppressHydrationWarning>
              {filteredListings.length > 0 ? (
                <>
                  Hiển thị {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredListings.length)} trên {filteredListings.length} chỗ nghỉ
                  {totalPages > 1 && (
                    <span className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-stone-300">
                      Trang {currentPage}/{totalPages}
                    </span>
                  )}
                </>
              ) : (
                "0 chỗ nghỉ"
              )}
            </span>
          </div>
          <span className="font-mono text-stone-500">
            {isHostView ? "Chế độ quản lý chủ nhà" : "Ký quỹ Stellar Soroban đang kích hoạt"}
          </span>
        </div>
      </div>

      {/* Lưới danh sách phòng */}
      {filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/50 p-12 text-center">
          <Search className="mx-auto h-8 w-8 text-stone-600 mb-3" />
          <h3 className="text-base font-semibold text-stone-200">Không tìm thấy phòng phù hợp</h3>
          <p className="mt-1 text-xs text-stone-500">
            Hãy thử tìm với tên thành phố khác hoặc bỏ bớt các bộ lọc đang chọn.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setAvailabilityFilter("all");
              setSortBy("default");
            }}
            className="mt-4 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs font-semibold text-stone-300 transition hover:bg-white/[0.1] hover:text-white"
          >
            Thiết lập lại bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onReserve={onReserve}
                isActiveBooking={!isHostView && listing.roomId === activeBookingRoomId}
                isHostView={isHostView}
              />
            ))}
          </div>

          {/* Thanh điều hướng phân trang (hiển thị khi có hơn 6 phòng) */}
          {totalPages > 1 && (
            <nav
              suppressHydrationWarning
              aria-label="Phân trang danh sách phòng"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0e15]/70 p-4 shadow-lg backdrop-blur-xl sm:flex-row"
            >
              {/* Chỉ số thông tin trang */}
              <div suppressHydrationWarning className="text-xs text-stone-400 font-medium text-center sm:text-left">
                Trang <span className="font-semibold text-amber-300">{currentPage}</span> /{" "}
                <span className="font-semibold text-white">{totalPages}</span> &middot; Tổng cộng{" "}
                <span className="font-semibold text-white">{filteredListings.length}</span> chỗ nghỉ (tối đa 6 phòng/trang)
              </div>

              {/* Các nút bấm phân trang */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-amber-400/40 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/[0.08] disabled:hover:bg-black/40 disabled:hover:text-stone-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Trang trước</span>
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-stone-500 font-mono">
                          &hellip;
                        </span>
                      );
                    }
                    const isCurrent = page === currentPage;
                    return (
                      <button
                        key={`page-${page}`}
                        onClick={() => goToPage(Number(page))}
                        aria-label={`Đến trang ${page}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`flex h-8 min-w-[2rem] px-2 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                          isCurrent
                            ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                            : "border border-white/[0.08] bg-black/40 text-stone-300 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang tiếp theo"
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-amber-400/40 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/[0.08] disabled:hover:bg-black/40 disabled:hover:text-stone-300"
                >
                  <span className="hidden sm:inline">Trang tiếp</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
