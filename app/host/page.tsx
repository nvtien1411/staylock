"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Lock,
  PlusCircle,
  Layers,
  Eye,
  RefreshCw,
  Wallet,
  XCircle,
  Compass,
  Check,
} from "lucide-react";
import { AppShell } from "@/app/components/layout/AppShell";
import { ListingGrid } from "@/app/components/listings/ListingGrid";
import { ReservationLookup } from "@/app/components/reservation/ReservationLookup";
import { EscrowLifecycle } from "@/app/components/escrow/EscrowLifecycle";
import { useWallet } from "@/app/hooks/useWallet";
import { useBooking } from "@/app/hooks/useBooking";
import { useEscrow } from "@/app/hooks/useEscrow";
import { useListings, addListing, buildListing } from "@/app/lib/listingStore";
import { isVerifiedHost, approveHost } from "@/app/lib/verifiedHosts";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { shortAddress } from "@/app/lib/soroban/format";
import type { Listing } from "@/app/types/listing";

const HOST_NAV = [
  { label: "Đăng phòng mới", href: "#create" },
  { label: "Phòng của tôi", href: "#listings" },
  { label: "Khách đặt phòng", href: "#reservations" },
  { label: "Quyết toán ký quỹ", href: "#escrow" },
];

const REVIEW_DURATION_MS = 22000;

export default function HostPage() {
  const wallet = useWallet();
  const booking = useBooking({ address: wallet.address });
  const activeEscrow = useEscrow({
    address: wallet.address,
    bookingId: booking.bookingId,
    roomId: booking.roomId,
    reservationStage: booking.reservationStage,
    refreshBooking: booking.refreshBooking,
  });

  const allListings = useListings();
  const ownedListings = allListings.filter((l) => l.ownerWallet === wallet.address);

  const [hostUnlocked, setHostUnlocked] = useState(false);
  const isHost = hostUnlocked || isVerifiedHost(wallet.address);

  async function connectWallet() {
    const address = await wallet.connectWallet();
    if (address) {
      booking.seedWallet(address);
      if (isVerifiedHost(address)) setHostUnlocked(true);
    }
  }

  function handleDemoConnect() {
    const address = wallet.setDemoAddress();
    booking.seedWallet(address);
    setHostUnlocked(true);
  }

  function handleApproved() {
    approveHost(wallet.address);
    setHostUnlocked(true);
  }

  async function trackReservation() {
    await booking.getBooking();
  }

  return (
    <AppShell
      address={wallet.address}
      onConnect={connectWallet}
      role="host"
      navItems={HOST_NAV}
      sidebarNote="Quản lý bất động sản nghỉ dưỡng, kiểm tra khách đặt và giải ngân tiền cọc trực tiếp về ví của bạn."
      headerTitle="Không gian quản lý chủ nhà"
    >
      {!wallet.address ? (
        <WalletRequired onConnect={connectWallet} onDemoConnect={handleDemoConnect} />
      ) : !isHost ? (
        <HostAccessDenied address={wallet.address} onApproved={handleApproved} />
      ) : (
        <HostContent
          address={wallet.address}
          booking={booking}
          activeEscrow={activeEscrow}
          ownedListings={ownedListings}
          trackReservation={trackReservation}
        />
      )}
    </AppShell>
  );
}

// ─── Trạng thái truy cập ────────────────────────────────────────────────────────────

function WalletRequired({
  onConnect,
  onDemoConnect,
}: {
  onConnect: () => void;
  onDemoConnect: () => void;
}) {
  return (
    <div className={`${glassCard} p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
        <Wallet className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Yêu cầu xác thực
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
          Kết nối ví chủ nhà của bạn
        </h2>
        <p className="mx-auto max-w-md text-xs sm:text-sm leading-relaxed text-stone-400">
          Cổng thông tin chủ nhà StayLock hoạt động hoàn toàn phi lưu ký (non-custodial). Ví Freighter
          của bạn chính là định danh chủ nhà và nơi nhận giải ngân ký quỹ trực tiếp.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onConnect}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-8 py-3.5 text-xs font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98]"
        >
          <Wallet className="h-4 w-4" />
          <span>Kết nối ví Freighter</span>
        </button>

        <button
          onClick={onDemoConnect}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-xs font-semibold text-stone-300 hover:bg-white/[0.08] hover:text-white transition-all"
        >
          <span>Dùng ví chủ nhà mẫu (Demo Host)</span>
        </button>
      </div>

      <div className="border-t border-white/[0.06] pt-6 flex items-center justify-center gap-6 text-[11px] text-stone-500">
        <span>Không cần mật khẩu</span>
        <span>&middot;</span>
        <span>100% phi lưu ký</span>
        <span>&middot;</span>
        <span>Giải ngân trực tiếp</span>
      </div>
    </div>
  );
}

type ReviewState = "idle" | "reviewing" | "approved";

function HostAccessDenied({
  address,
  onApproved,
}: {
  address: string;
  onApproved: () => void;
}) {
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleRequestAccess() {
    if (reviewState !== "idle") return;
    setReviewState("reviewing");
    setProgress(0);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, (elapsed / REVIEW_DURATION_MS) * 100);
      setProgress(pct);
    }, 200);

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      setReviewState("approved");
      setTimeout(onApproved, 1200);
    }, REVIEW_DURATION_MS);
  }

  if (reviewState === "approved") {
    return (
      <div className={`${glassCard} p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <Check className="h-8 w-8" />
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Xác thực hoàn tất
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white">Quyền chủ nhà đã được cấp</h2>
        <p className="mx-auto max-w-md text-xs sm:text-sm leading-relaxed text-stone-400">
          Ví của bạn đã được đăng ký thành công vào danh bạ chủ nhà StayLock. Đang khởi tạo không gian
          quản lý...
        </p>
        <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (reviewState === "reviewing") {
    return (
      <div className={`${glassCard} p-6 sm:p-8 max-w-2xl mx-auto space-y-6`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
            <RefreshCw className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              Đang kiểm tra hồ sơ
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Đang xác minh thông tin chủ nhà
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-stone-400">
              Đang xác minh chữ ký ví trên sổ cái Stellar và kiểm tra điều kiện niêm yết phòng. Quy
              trình mô phỏng sẽ hoàn tất trong giây lát.
            </p>
          </div>
        </div>

        {/* Khung tiến độ */}
        <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] font-mono text-xs text-amber-300">
                {shortAddress(address).slice(0, 4)}
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">Ví ứng viên</p>
                <p className="font-mono text-xs text-stone-200">{shortAddress(address)}</p>
              </div>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
              Hoàn thành {Math.round(progress)}%
            </span>
          </div>

          {/* Thanh phần trăm */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Các mục kiểm tra */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            {[
              ["Xác thực chữ ký mật mã ví thành công", progress > 15],
              ["Kiểm tra tài khoản mạng Stellar Testnet", progress > 40],
              ["Đăng ký người thụ hưởng hợp đồng ký quỹ", progress > 65],
              ["Hoàn tất thông tin chủ nhà được xác thực", progress > 85],
            ].map(([label, done]) => (
              <div key={label as string} className="flex items-center gap-2.5 text-xs">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    done
                      ? "bg-emerald-400 text-stone-950 font-bold"
                      : "bg-white/[0.06] text-stone-600"
                  }`}
                >
                  {done ? "✓" : "·"}
                </span>
                <span className={done ? "text-stone-200 font-medium" : "text-stone-500"}>
                  {label as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái chờ xin cấp quyền
  return (
    <div className={`${glassCard} p-6 sm:p-8 space-y-6 max-w-4xl mx-auto`}>
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300">
              Yêu cầu quyền chủ nhà
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white text-balance">
            Đăng ký làm chủ nhà được xác thực
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-stone-400 max-w-2xl">
            Địa chỉ ví <span className="font-mono text-stone-200">{shortAddress(address)}</span>{" "}
            hiện chưa có trong danh bạ chủ nhà đã được xác thực. Hãy đăng ký ngay bên dưới để mở khóa tính
            năng đăng phòng và nhận giải ngân cọc tự động.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleRequestAccess}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 shadow-md shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Yêu cầu xác thực chủ nhà tức thì</span>
            </button>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-stone-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Xem dưới tư cách khách du lịch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Lợi ích nổi bật */}
      <div className="grid gap-4 sm:grid-cols-3 border-t border-white/[0.06] pt-6">
        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <Wallet className="h-4 w-4" />
            <span>01. Định danh bằng ví</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Ví Stellar chính là hồ sơ chủ nhà của bạn. Không cần tài khoản, mật khẩu hay thủ tục rườm rà.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <Lock className="h-4 w-4" />
            <span>02. Tiền cọc được bảo chứng</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Tiền đặt cọc của khách được khóa an toàn trong hợp đồng thông minh, hoàn toàn không lo quỵt tiền.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>03. Quyết toán 0% phí</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Tiền chuyển thẳng về ví của bạn ngay khi khách trả phòng, giữ trọn 100% doanh thu.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Nội dung khu vực chủ nhà ─────────────────────────────────────────────────────────────

type HostContentProps = {
  address: string;
  booking: ReturnType<typeof useBooking>;
  activeEscrow: ReturnType<typeof useEscrow>;
  ownedListings: Listing[];
  trackReservation: () => void;
};

function HostContent({
  address,
  booking,
  activeEscrow,
  ownedListings,
  trackReservation,
}: HostContentProps) {
  const pendingReservationsCount = ownedListings.filter(
    (l) => l.availability === "Reserved" || l.availability === "Completed"
  ).length;

  return (
    <div className="space-y-8">
      {/* Khung thống kê chỉ số chủ nhà */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Phòng đang niêm yết</span>
            <Building2 className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">
            {ownedListings.length}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">Đang hiển thị trên thị trường</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Đặt phòng đang xử lý</span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">
            {pendingReservationsCount}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">Chờ nhận phòng / giải ngân</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Chứng nhận uy tín</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-300">Chủ nhà Xác thực</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-stone-500 truncate">
            {shortAddress(address)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Hoa hồng nền tảng</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-400 tracking-tight">0.00%</p>
          <p className="mt-1 text-[11px] text-stone-500">100% doanh thu về thẳng ví chủ nhà</p>
        </div>
      </div>

      {/* Form tạo tin phòng mới */}
      <CreateListingForm address={address} />

      {/* Danh sách phòng sở hữu */}
      <section id="listings" className="space-y-5">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Kho chỗ nghỉ của bạn
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            Danh sách phòng của bạn ({ownedListings.length})
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-400 max-w-2xl">
            Các phòng do ví của bạn sở hữu. Khi khách đặt phòng, khoản tiền ký quỹ sẽ được hợp đồng
            Soroban tự động bảo chứng.
          </p>
        </div>

        {ownedListings.length === 0 ? (
          <div className={`${glassCard} p-10 text-center space-y-3`}>
            <Building2 className="mx-auto h-8 w-8 text-stone-600" />
            <h3 className="text-base font-semibold text-stone-200">Chưa có chỗ nghỉ nào được tạo</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Sử dụng biểu mẫu phía trên để niêm yết phòng đầu tiên. Phòng sẽ xuất hiện ngay lập tức trên
              thị trường du lịch.
            </p>
          </div>
        ) : (
          <ListingGrid listings={ownedListings} onReserve={() => {}} isHostView />
        )}
      </section>

      {/* Hàng đợi khách đặt phòng */}
      <section id="reservations" className="space-y-5">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Quản lý lưu trú
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            Khách đặt phòng &amp; quyết toán ký quỹ
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-400 max-w-2xl">
            Chọn một lượt đặt phòng từ hàng đợi để kiểm tra trạng thái trên chuỗi và kích hoạt giải ngân
            tiền cọc khi khách trả phòng.
          </p>
        </div>

        <HostReservationQueue
          ownedListings={ownedListings}
          activeBookingId={booking.bookingId}
          onLoad={(id) => {
            booking.setBookingId(id);
            void booking.refreshBooking(id);
          }}
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

      {/* Bảng điều khiển vòng đời giải ngân */}
      <EscrowLifecycle
        bookingId={booking.bookingId}
        lifecycleStatus={activeEscrow.lifecycleStatus}
        lifecycleAction={activeEscrow.lifecycleAction}
        lifecycleResult={activeEscrow.lifecycleResult}
        lifecycleTone={activeEscrow.lifecycleTone}
        reservationStage={booking.reservationStage}
        userRole="host"
        confirmCheckIn={activeEscrow.confirmCheckIn}
        completeStay={activeEscrow.completeStay}
        cancelReservation={activeEscrow.cancelReservation}
      />
    </div>
  );
}

// ─── Hàng đợi đặt phòng của chủ nhà ───────────────────────────────────────────────────

type HostReservationQueueProps = {
  ownedListings: Listing[];
  activeBookingId: string;
  onLoad: (bookingId: string) => void;
};

function HostReservationQueue({
  ownedListings,
  activeBookingId,
  onLoad,
}: HostReservationQueueProps) {
  const pendingReservations = ownedListings.filter(
    (l) => l.activeBookingId && (l.availability === "Reserved" || l.availability === "Completed")
  );

  if (pendingReservations.length === 0) {
    return (
      <div className={`${glassCard} p-6`}>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-stone-500" />
          <p className="text-xs text-stone-400">
            Hiện chưa có khách đặt phòng nào đang chờ xử lý trên các phòng của bạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${glassCard} p-6 space-y-4`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
          Hàng đợi khách đang đặt ({pendingReservations.length})
        </p>
        <span className="text-xs text-stone-500">Nhấn &ldquo;Kích hoạt xử lý&rdquo; để quản lý quyết toán</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pendingReservations.map((listing) => {
          const isLoaded = activeBookingId === listing.activeBookingId;
          const isCompleted = listing.availability === "Completed";

          return (
            <div
              key={listing.id}
              className={`rounded-2xl border p-4.5 transition-all duration-200 ${
                isLoaded
                  ? "border-amber-400/50 bg-amber-400/10 shadow-lg ring-1 ring-amber-400/40"
                  : "border-white/[0.08] bg-black/40 hover:border-white/[0.14]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{listing.title}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-400">{listing.location}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                    isCompleted
                      ? "border-stone-500/30 bg-stone-500/10 text-stone-400"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                  }`}
                >
                  {isCompleted ? "Đã xong" : "Đã đặt cọc"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="font-mono text-xs text-stone-400">
                  #{listing.activeBookingId}
                </span>

                <button
                  onClick={() => onLoad(listing.activeBookingId!)}
                  disabled={isLoaded}
                  className="rounded-xl border border-amber-400/30 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/25 disabled:cursor-default disabled:opacity-50"
                >
                  {isLoaded ? "Đang chọn" : "Kích hoạt xử lý"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Form tạo tin phòng mới ─────────────────────────────────────────────────────────

function xlmToStroops(xlm: string): string {
  try {
    const val = parseFloat(xlm);
    if (isNaN(val) || val <= 0) return "";
    return String(Math.round(val * 10_000_000));
  } catch {
    return "";
  }
}

function CreateListingForm({ address }: { address: string }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [nightly, setNightly] = useState("");
  const [deposit, setDeposit] = useState("");
  const [description, setDescription] = useState("");
  const [hostName, setHostName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (isPublishing) return;
    setError("");
    if (!title.trim() || !location.trim() || !nightly || !deposit || !description.trim()) {
      setError("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
      return;
    }
    const nightlyNum = parseFloat(nightly);
    if (isNaN(nightlyNum) || nightlyNum <= 0) {
      setError("Vui lòng nhập giá phòng hợp lệ tính bằng XLM.");
      return;
    }
    const escrowAmount = xlmToStroops(deposit);
    if (!escrowAmount) {
      setError("Vui lòng nhập số tiền cọc ký quỹ hợp lệ tính bằng XLM.");
      return;
    }

    const listing = buildListing({
      title: title.trim(),
      location: location.trim(),
      nightlyPriceXlm: nightlyNum,
      escrowAmount,
      description: description.trim(),
      ownerWallet: address,
      hostName: hostName.trim() || shortAddress(address),
    });

    try {
      setIsPublishing(true);
      await addListing(listing);
      setSubmitted(true);
      setTitle("");
      setLocation("");
      setNightly("");
      setDeposit("");
      setDescription("");
      setHostName("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Failed to publish listing", err);
      setError("Không thể đăng phòng. Vui lòng kiểm tra kết nối cơ sở dữ liệu và thử lại.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section id="create" className={`${glassCard} p-6 sm:p-8 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Cổng đăng tin
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            Niêm yết chỗ nghỉ ký quỹ thông minh
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-400 max-w-2xl">
            Đăng chỗ nghỉ mới lên thị trường phi tập trung. Địa chỉ ví của bạn sẽ tự động được cấu
            hình làm người nhận tiền ký quỹ khi kỳ nghỉ hoàn tất.
          </p>
        </div>

        {submitted && (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-200 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Đã đăng thành công lên thị trường
          </span>
        )}
      </div>

      {/* Thông tin ví chủ sở hữu */}
      <div className="rounded-xl border border-white/[0.06] bg-black/40 px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-stone-400">Ví chủ nhà thụ hưởng:</span>
          <span className="font-mono text-stone-200">{shortAddress(address)}</span>
        </div>
        <span className="text-[11px] text-stone-500">Tự động cấu hình</span>
      </div>

      {/* Lưới các trường nhập liệu */}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <FieldLabel label="Tên biệt thự / chỗ nghỉ" hint="bắt buộc" required />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Biệt thự biển Mỹ Khê"
            className={inputClass}
          />
        </label>

        <label className="block">
          <FieldLabel label="Địa điểm / thành phố" hint="thành phố, tỉnh" required />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ví dụ: Sơn Trà, Đà Nẵng, Việt Nam"
            className={inputClass}
          />
        </label>

        <label className="block">
          <FieldLabel label="Tên thương hiệu / chủ nhà" hint="tùy chọn" />
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Ví dụ: Danang Coastal Stays"
            className={inputClass}
          />
        </label>

        <label className="block">
          <FieldLabel label="Giá thuê mỗi đêm (XLM)" hint="số lượng" required />
          <input
            type="number"
            min="0"
            step="0.01"
            value={nightly}
            onChange={(e) => setNightly(e.target.value)}
            placeholder="15.0"
            className={inputClass}
          />
        </label>

        <label className="block">
          <FieldLabel label="Tiền cọc ký quỹ yêu cầu (XLM)" hint="khóa on-chain" required />
          <input
            type="number"
            min="0"
            step="0.01"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="15.0"
            className={inputClass}
          />
        </label>

        <label className="block md:col-span-2">
          <FieldLabel label="Mô tả chỗ nghỉ &amp; điểm nổi bật" hint="bắt buộc" required />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả các đặc điểm nổi bật, tầm nhìn biển, tiện ích sang trọng và trải nghiệm độc đáo..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3.5 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={isPublishing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPublishing ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
            <span>Đang xuất bản lên thị trường &amp; sổ cái...</span>
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4" />
            <span>Đăng chỗ nghỉ lên thị trường</span>
          </>
        )}
      </button>
    </section>
  );
}
