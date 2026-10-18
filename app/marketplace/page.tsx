"use client";

import { useMemo, useState } from "react";
import {
  Compass,
  ShieldCheck,
  Lock,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { AppShell } from "@/app/components/layout/AppShell";
import { ListingGrid } from "@/app/components/listings/ListingGrid";
import { BookingModal } from "@/app/components/listings/BookingModal";
import { ReservationStatusCard } from "@/app/components/reservation/ReservationStatusCard";
import { ReservationLookup } from "@/app/components/reservation/ReservationLookup";
import { EscrowLifecycle } from "@/app/components/escrow/EscrowLifecycle";
import { useWallet } from "@/app/hooks/useWallet";
import { useBooking } from "@/app/hooks/useBooking";
import { useEscrow } from "@/app/hooks/useEscrow";
import { useListings } from "@/app/lib/listingStore";
import type { Listing, ListingAvailability } from "@/app/types/listing";

const NAV_ITEMS = [
  { label: "Khám phá phòng", href: "#listings" },
  { label: "Đặt phòng của tôi", href: "#reservations" },
  { label: "Tiến trình ký quỹ", href: "#escrow" },
];

export default function MarketplacePage() {
  const wallet = useWallet();
  const booking = useBooking({ address: wallet.address });
  const activeEscrow = useEscrow({
    address: wallet.address,
    bookingId: booking.bookingId,
    roomId: booking.roomId,
    reservationStage: booking.reservationStage,
    refreshBooking: booking.refreshBooking,
  });

  const rawListings = useListings();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  async function connectWallet() {
    const address = await wallet.connectWallet();
    if (address) booking.seedWallet(address);
  }

  // Cập nhật trạng thái phòng từ dữ liệu lưu trữ + trạng thái booking đang hoạt động
  const listings = useMemo<Listing[]>(() => {
    return rawListings.map((listing) => {
      if (booking.roomId && listing.roomId === booking.roomId) {
        let availability: ListingAvailability = "Available";
        if (booking.reservationStage === "Reserved" || booking.reservationStage === "Checked In") {
          availability = "Reserved";
        } else if (booking.reservationStage === "Completed") {
          availability = "Completed";
        }
        return { ...listing, availability };
      }
      return listing;
    });
  }, [rawListings, booking.roomId, booking.reservationStage]);

  async function handleBookingConfirm(dayCheckin: string, dayCheckout: string) {
    if (!selectedListing) return;
    await booking.createBookingFromListing({
      host: selectedListing.ownerWallet,
      roomId: selectedListing.roomId,
      amount: selectedListing.escrowAmount,
      dayCheckin,
      dayCheckout,
    });
    setSelectedListing(null);
  }

  async function trackReservation() {
    await booking.getBooking();
  }

  const hasActiveBooking =
    Boolean(booking.bookingId) &&
    (booking.reservationStage === "Reserved" || booking.reservationStage === "Checked In");

  return (
    <AppShell
      address={wallet.address}
      onConnect={connectWallet}
      role="guest"
      navItems={NAV_ITEMS}
      sidebarNote="Khám phá các biệt thự được bảo chứng ký quỹ, đặt phòng trực tiếp bằng ví và theo dõi quyết toán minh bạch."
      headerTitle="Thị trường du lịch & nghỉ dưỡng thông minh"
    >
      {/* Banner chào mừng Thượng lưu */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0e15] via-[#10131d] to-[#08090d] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Giao thức ký quỹ hợp đồng thông minh Soroban &middot; Mạng Stellar</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug sm:leading-tight text-balance">
            Đặt phòng nghỉ thượng lưu với niềm tin tuyệt đối
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed text-stone-300 max-w-2xl">
            Mỗi chỗ nghỉ trên StayLock đều được bảo vệ bằng hợp đồng ký quỹ mật mã. Khi bạn đặt phòng
            qua ví Freighter, tiền cọc được giữ an toàn on-chain cho tới khi nhận phòng thành
            công—hoàn toàn không phí hoa hồng trung gian, không lo tranh chấp.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-400 font-medium">
            <span className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              0% phí hoa hồng nền tảng
            </span>
            <span className="text-stone-600">&middot;</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Lock className="h-4 w-4 text-amber-400" />
              Ký quỹ phi lưu ký (Non-custodial)
            </span>
            <span className="text-stone-600">&middot;</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              Chủ nhà xác thực bằng chữ ký ví
            </span>
          </div>
        </div>
      </section>

      {/* Danh mục Chỗ nghỉ có sẵn */}
      <section id="listings" className="space-y-6 pt-2">
        <div className="max-w-3xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Chỗ nghỉ đã xác thực
            </span>
            <span className="text-xs text-stone-500">Việt Nam &amp; quốc tế</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance leading-snug">
            Bộ sưu tập biệt thự &amp; chỗ nghỉ kiến trúc cao cấp
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-400">
            Chọn điểm đến bên dưới để khóa tiền cọc ký quỹ an toàn bằng ví Freighter của bạn.
          </p>
        </div>

        <ListingGrid
          listings={listings}
          onReserve={setSelectedListing}
          activeBookingRoomId={hasActiveBooking ? booking.roomId : undefined}
        />
      </section>

      {/* Khu vực Theo dõi Đặt phòng */}
      <section id="reservations" className="space-y-6 pt-4 border-t border-white/[0.06]">
        <div className="max-w-3xl space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Theo dõi chuyến đi
            </span>
            <span className="text-xs text-stone-500">Sổ cái on-chain</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance leading-snug">
            Theo dõi &amp; xác thực đặt phòng của bạn
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-400">
            Tra cứu trạng thái đặt phòng trực tiếp từ hợp đồng thông minh Soroban và xem chi tiết
            khoản tiền cọc đang được bảo chứng.
          </p>
        </div>

        <ReservationStatusCard
          liveTone={booking.liveTone}
          createResult={booking.createResult}
          createStatus={booking.createStatus}
          bookingId={booking.bookingId}
          isLoading={booking.isLoading}
          getBooking={trackReservation}
        />

        <ReservationLookup
          bookingId={booking.bookingId}
          setBookingId={booking.setBookingId}
          response={booking.response}
          isLoading={booking.isLoading}
          lookupResult={booking.lookupResult}
          lookupValue={booking.lookupValue}
          getBooking={trackReservation}
        />
      </section>

      {/* Tiến trình Vòng đời Ký quỹ */}
      <section id="escrow" className="pt-4 border-t border-white/[0.06]">
        <EscrowLifecycle
          bookingId={booking.bookingId}
          lifecycleStatus={activeEscrow.lifecycleStatus}
          lifecycleAction={activeEscrow.lifecycleAction}
          lifecycleResult={activeEscrow.lifecycleResult}
          lifecycleTone={activeEscrow.lifecycleTone}
          reservationStage={booking.reservationStage}
          userRole="guest"
          confirmCheckIn={activeEscrow.confirmCheckIn}
          completeStay={activeEscrow.completeStay}
          cancelReservation={activeEscrow.cancelReservation}
        />
      </section>

      {/* Cửa sổ Modal Đặt Phòng */}
      {selectedListing && (
        <BookingModal
          listing={selectedListing}
          walletAddress={wallet.address}
          isCreating={booking.isCreating}
          onConfirm={handleBookingConfirm}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </AppShell>
  );
}
