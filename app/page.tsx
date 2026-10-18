"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Compass,
  Building2,
  CheckCircle2,
  Wallet,
  Clock,
  ExternalLink,
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
  X,
  Layers,
} from "lucide-react";
import { metrics, escrowSteps } from "@/app/components/dashboard/data";
import { CONTRACT_ID } from "@/app/lib/soroban/config";
import { shortAddress } from "@/app/lib/soroban/format";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Cơ chế ký quỹ bằng hợp đồng thông minh Soroban hoạt động như thế nào?",
      a: "Khi bạn đặt phòng, tiền cọc sẽ được hợp đồng thông minh Soroban trên mạng Stellar khóa an toàn. Cả khách du lịch, chủ nhà lẫn StayLock đều không thể đơn phương rút tiền. Khi bạn nhận phòng và hoàn tất kỳ nghỉ, hợp đồng tự động giải ngân cho chủ nhà; trường hợp hủy phòng hợp lệ, tiền cọc được hoàn trả ngay lập tức về ví của bạn.",
    },
    {
      q: "Tôi cần sử dụng ví nào để đặt phòng hoặc làm chủ nhà tại Việt Nam?",
      a: "StayLock tích hợp gốc với Freighter, tiện ích ví trình duyệt hàng đầu dành cho mạng Stellar. Khi cài đặt Freighter, việc ký duyệt đặt cọc, xác nhận nhận phòng hay nhận thanh toán chỉ mất 1-click chuột—không cần mật khẩu, không cần số điện thoại hay tài khoản ngân hàng trung gian.",
    },
    {
      q: "Tại sao StayLock không thu bất kỳ phí hoa hồng nào (0.00%)?",
      a: "Các nền tảng du lịch Web2 truyền thống thường trừ 15% đến 25% tổng giá trị đặt phòng của chủ nhà và thu thêm phí dịch vụ từ khách để duy trì bộ máy cồng kềnh. StayLock vận hành hoàn toàn tự động bằng hợp đồng thông minh Soroban với chi phí mạng chưa đến 0.0001 XLM (vài đồng VND), giúp chủ nhà giữ trọn vẹn 100% doanh thu.",
    },
    {
      q: "Quy trình hủy phòng và nhận lại tiền cọc diễn ra thế nào?",
      a: "Trước khi xác nhận nhận phòng, khách có thể chủ động hủy đặt phòng trực tiếp trên bảng điều khiển Vòng đời Ký quỹ. Hợp đồng thông minh sẽ tự động hoàn trả số tiền cọc về ví của bạn ngay tức thì trên blockchain, không cần chờ đợi xét duyệt 5-10 ngày làm việc như các cổng thanh toán ngân hàng.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07080b] text-stone-100 selection:bg-amber-500/30 selection:text-amber-100">
      {/* Hiệu ứng ánh sáng môi trường đa tầng */}
      <div className="pointer-events-none fixed left-[-15rem] top-[-15rem] h-[50rem] w-[50rem] rounded-full bg-amber-500/10 blur-[140px] animate-pulse-slow" />
      <div className="pointer-events-none fixed right-[-15rem] top-32 h-[45rem] w-[45rem] rounded-full bg-sky-500/8 blur-[150px] animate-pulse-slow" />
      <div className="pointer-events-none fixed bottom-[-10rem] left-[25%] h-[40rem] w-[40rem] rounded-full bg-amber-600/5 blur-[130px]" />
      <div className="pointer-events-none fixed inset-0 bg-noise opacity-40" />

      {/* Thùng chứa chính */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-6 sm:px-8 lg:px-10">
        {/* Thanh Header Kính mờ */}
        <header className="sticky top-5 z-40 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 px-4 py-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#08090d]">
                <Lock className="h-5 w-5 text-amber-300 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">StayLock</span>
                <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-amber-300">
                  Chuẩn Stellar
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-stone-400 sm:block">
                Ký quỹ du lịch phi tập trung
              </p>
            </div>
          </Link>

          {/* Các liên kết điều hướng */}
          <nav className="hidden items-center gap-6 text-xs font-semibold text-stone-300 md:flex">
            <a href="#how-it-works" className="transition hover:text-white">
              Quy trình ký quỹ
            </a>
            <a href="#comparison" className="transition hover:text-white">
              Ưu điểm StayLock
            </a>
            <a href="#faq" className="transition hover:text-white">
              Hỏi &amp; đáp
            </a>
            <Link href="/marketplace" className="transition hover:text-amber-300">
              Khám phá phòng
            </Link>
          </nav>

          {/* Nút hành động */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/host"
              className="hidden rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-stone-200 transition hover:bg-white/[0.08] hover:text-white sm:inline-flex"
            >
              Cổng chủ nhà
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-5 py-2 text-xs font-bold text-stone-950 shadow-md shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              <span>Đặt phòng ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Khối Hero chính */}
        <section className="grid gap-12 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Giao thức ký quỹ thông minh Soroban &middot; Mạng Stellar</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold leading-[1.15] sm:leading-[1.12] tracking-tight text-white text-balance">
                Giao thức <span className="gold-text-gradient">ký quỹ du lịch</span> cho kỳ nghỉ thượng lưu
              </h1>
              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-stone-300">
                Loại bỏ 15% – 25% phí hoa hồng đại lý và rủi ro giam tiền. StayLock bảo vệ khách du
                lịch và chủ biệt thự tại Việt Nam bằng cơ chế khóa cọc phi lưu ký và quyết toán tự
                động trên chuỗi.
              </p>
            </div>

            {/* Các nút bấm kêu gọi hành động */}
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-7 py-3.5 text-xs font-bold text-stone-950 shadow-xl shadow-amber-500/25 transition hover:brightness-105 active:scale-[0.98]"
              >
                <Compass className="h-4 w-4" />
                <span>Khám phá biệt thự &amp; chỗ nghỉ</span>
              </Link>
              <Link
                href="/host"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-[#0c0e15]/80 px-7 py-3.5 text-xs font-bold text-stone-200 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Building2 className="h-4 w-4" />
                <span>Đăng ký làm chủ nhà xác thực</span>
              </Link>
            </div>

            {/* Các chỉ số bảo chứng */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
              <div>
                <p className="text-lg font-bold text-white">0.00%</p>
                <p className="text-[11px] text-stone-400">Phí hoa hồng nền tảng</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-300">&lt; 5 giây</p>
                <p className="text-[11px] text-stone-400">Tốc độ đồng thuận sổ cái</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">100%</p>
                <p className="text-[11px] text-stone-400">Phi lưu ký (Non-custodial)</p>
              </div>
            </div>
          </div>

          {/* Mô phỏng Két Ký Quỹ Trực Quan */}
          <div className="relative rounded-3xl border border-white/[0.1] bg-[#0c0e15]/90 p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.08)] backdrop-blur-2xl">
            {/* Header trạng thái */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                    Két ký quỹ hợp đồng Soroban
                  </p>
                  <p className="text-xs font-mono font-medium text-stone-200">
                    CDMSD7...SGLJ3RO
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Đã khóa tiền cọc
              </span>
            </div>

            {/* Hình ảnh biệt thự mô phỏng */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                  alt="Biệt thự biển Mỹ Khê"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                      <MapPin className="h-3 w-3" /> Sơn Trà, Đà Nẵng, Việt Nam
                    </span>
                    <h3 className="text-base font-bold text-white drop-shadow">
                      Biệt thự biển Mỹ Khê
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    4.98
                  </div>
                </div>
              </div>

              {/* Thông số ký quỹ */}
              <div className="grid grid-cols-3 gap-2 p-3 text-center text-xs">
                <div className="rounded-xl bg-white/[0.03] p-2.5">
                  <p className="text-[10px] text-stone-500">Tiền cọc cất giữ</p>
                  <p className="mt-0.5 font-bold text-amber-300">12.5 XLM</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-2.5">
                  <p className="text-[10px] text-stone-500">Thời gian</p>
                  <p className="mt-0.5 font-bold text-white">4 đêm</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-2.5">
                  <p className="text-[10px] text-stone-500">Trạng thái</p>
                  <p className="mt-0.5 font-bold text-emerald-400">Đã bảo chứng</p>
                </div>
              </div>
            </div>

            {/* Mã lệnh trích xuất sổ cái */}
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/50 p-3.5 font-mono text-[11px] text-stone-400 space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span>Hợp đồng Soroban:</span>
                <span className="text-amber-200/90">{shortAddress(CONTRACT_ID)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-500">
                <span>Đơn vị Stroops khóa:</span>
                <span className="text-stone-300">125,000,000</span>
              </div>
              <div className="flex items-center justify-between text-stone-500">
                <span>Điều kiện giải ngân:</span>
                <span className="text-emerald-300">khach_nhan_phong == true</span>
              </div>
            </div>
          </div>
        </section>

        {/* Khối Thống kê Chỉ số Sổ cái */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/70 p-6 shadow-lg backdrop-blur-xl"
            >
              <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-stone-400 font-medium">{label}</p>
            </div>
          ))}
        </section>

        {/* Quy trình hoạt động 3 bước */}
        <section id="how-it-works" className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Quy trình tự động hóa
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug sm:leading-tight text-balance">
              StayLock bảo vệ chuyến đi của bạn như thế nào?
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-400 text-balance max-w-xl mx-auto">
              3 cột mốc mật mã khép kín đảm bảo chủ nhà nhận tiền đúng hạn và du khách không bao giờ lo bị mất tiền cọc.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {escrowSteps.map(([number, title, description], i) => (
              <div
                key={title}
                className="group relative rounded-3xl border border-white/[0.08] bg-[#0c0e15]/80 p-7 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-amber-400/30 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider text-amber-400">
                    Bước {number}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] text-xs font-bold text-stone-400 group-hover:text-amber-300 transition">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-stone-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bảng so sánh StayLock vs Nền tảng Web2 truyền thống */}
        <section id="comparison" className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Lợi thế vượt trội
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-snug sm:leading-tight text-balance">
              StayLock so với nền tảng đặt phòng truyền thống
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-400 text-balance max-w-xl mx-auto">
              Tại sao ký quỹ hợp đồng thông minh là bước tiến tất yếu thay thế các đại lý du lịch trung gian.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#0c0e15]/80 shadow-2xl backdrop-blur-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/40 text-stone-400 text-[11px] uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Tiêu chí</th>
                  <th className="p-4 sm:p-5 text-stone-500">Đại lý truyền thống (Airbnb / OTA)</th>
                  <th className="p-4 sm:p-5 text-amber-300 font-bold bg-amber-400/[0.05]">Giao thức StayLock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-stone-300">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Phí hoa hồng nền tảng</td>
                  <td className="p-4 sm:p-5 text-rose-300">15% &ndash; 25% phí trừ trực tiếp</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-amber-400/[0.05]">
                    0.00% (Giữ trọn 100% doanh thu)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Nơi giữ tiền cọc ký quỹ</td>
                  <td className="p-4 sm:p-5">Tài khoản trung gian của công ty</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-200 bg-amber-400/[0.05]">
                    Hợp đồng Soroban phi lưu ký
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Thời gian nhận tiền của chủ nhà</td>
                  <td className="p-4 sm:p-5">24 &ndash; 48 giờ sau khi khách check-in</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-amber-400/[0.05]">
                    Tức thì khi hoàn tất trả phòng
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Tài khoản &amp; định danh</td>
                  <td className="p-4 sm:p-5">Tài khoản, mật khẩu, nguy cơ lộ KYC</td>
                  <td className="p-4 sm:p-5 font-bold text-white bg-amber-400/[0.05]">
                    Chữ ký tự chủ từ ví Freighter
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Giải quyết khiếu nại cọc</td>
                  <td className="p-4 sm:p-5">Phán quyết từ nhân viên hỗ trợ</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-amber-400/[0.05]">
                    Quy tắc minh bạch được mã hóa trên chuỗi
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2 Khối cho Chủ nhà & Khách du lịch */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Dành cho Chủ nhà */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e15]/80 p-8 shadow-xl backdrop-blur-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                Dành cho chủ bất động sản
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Trở thành chủ nhà xác thực
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-400">
                Đăng biệt thự, homestay, hay căn hộ nghỉ dưỡng của bạn tại Việt Nam. Hợp đồng thông
                minh sẽ tự động quản lý việc giữ cọc, kiểm tra check-in và quyết toán tiền phòng về ví.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  ["Định danh bằng ví", "Ví Stellar chính là hồ sơ chủ nhà của bạn. Không cần mật khẩu."],
                  ["Ký quỹ cọc an toàn", "Tiền cọc của khách được khóa sẵn trên chuỗi trước khi khách tới."],
                  ["Không mất phí trung gian", "Giữ lại toàn bộ 100% doanh thu mỗi đêm nghỉ."],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-stone-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/host"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-xs font-bold text-stone-950 shadow-md shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              <span>Vào cổng quản lý chủ nhà</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Dành cho Khách du lịch */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0e15]/80 p-8 shadow-xl backdrop-blur-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Dành cho du khách
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Đặt chỗ nghỉ với niềm tin tuyệt đối
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-400">
                Lựa chọn từ các căn biệt thự kiến trúc độc đáo tại Đà Nẵng, Sa Pa, Phú Quốc, Hội An...
                Khoản cọc của bạn được hợp đồng giữ an toàn và chỉ giải ngân sau khi nhận phòng.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  ["Chỗ nghỉ đã xác thực", "Mỗi phòng đều thuộc quyền sở hữu của một ví chủ nhà uy tín."],
                  ["Ký duyệt 1-click Freighter", "Đặt phòng an toàn tuyệt đối mà không cần nhập thẻ tín dụng."],
                  ["Theo dõi sổ cái trực tiếp", "Mã đặt phòng chính là bằng chứng on-chain của bạn."],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3 text-xs">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-stone-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.05] py-3.5 text-xs font-bold text-white transition hover:bg-white/[0.1] active:scale-[0.98]"
            >
              <span>Xem toàn bộ danh sách phòng</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Khối Hỏi & Đáp (FAQ) */}
        <section id="faq" className="space-y-6 max-w-3xl mx-auto w-full">
          <div className="text-center space-y-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Câu hỏi thường gặp
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              Giải đáp thắc mắc về ký quỹ
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/70 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white transition hover:text-amber-300"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-amber-300 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-stone-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/[0.06] p-5 text-xs sm:text-sm leading-relaxed text-stone-400 bg-black/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Chân trang Footer */}
        <footer className="mt-8 flex flex-col gap-6 rounded-3xl border border-white/[0.08] bg-[#0c0e15]/90 p-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 font-bold text-xs">
                SL
              </span>
              <p className="font-bold text-white text-sm">StayLock Protocol</p>
            </div>
            <p className="text-[11px] text-stone-400">
              Giao thức đặt phòng nghỉ dưỡng ký quỹ phi tập trung trên mạng Stellar Soroban.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-stone-400">
            <Link href="/marketplace" className="hover:text-amber-300 transition">
              Thị trường phòng
            </Link>
            <Link href="/host" className="hover:text-amber-300 transition">
              Khu vực chủ nhà
            </Link>
            <span className="font-mono text-stone-500">Hợp đồng: {shortAddress(CONTRACT_ID)}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
