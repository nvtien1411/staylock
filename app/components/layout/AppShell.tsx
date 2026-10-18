"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Compass,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  Building2,
  Lock,
  Layers,
  Sparkles,
  Home,
  CheckCircle2,
} from "lucide-react";
import { shortAddress, getExplorerUrl } from "@/app/lib/soroban/format";
import { CONTRACT_ID } from "@/app/lib/soroban/config";

type AppShellProps = {
  address: string;
  onConnect: () => void;
  role: "guest" | "host";
  navItems: Array<{ label: string; href: string }>;
  sidebarNote: string;
  headerTitle: string;
  children: ReactNode;
};

export function AppShell({
  address,
  onConnect,
  role,
  navItems,
  sidebarNote,
  headerTitle,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const walletExplorerUrl = address
    ? `https://stellar.expert/explorer/testnet/account/${address}`
    : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07080b] text-stone-100 selection:bg-amber-500/30 selection:text-amber-100">
      {/* Hiệu ứng ánh sáng môi trường đa tầng */}
      <div className="pointer-events-none fixed left-[-15rem] top-[-15rem] h-[45rem] w-[45rem] rounded-full bg-amber-500/10 blur-[130px] animate-pulse-slow" />
      <div className="pointer-events-none fixed right-[-15rem] top-24 h-[40rem] w-[40rem] rounded-full bg-sky-500/8 blur-[140px] animate-pulse-slow" />
      <div className="pointer-events-none fixed bottom-[-10rem] left-[30%] h-[35rem] w-[35rem] rounded-full bg-amber-600/5 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-noise opacity-40" />

      {/* Khung bố cục chính */}
      <div className="relative mx-auto grid w-full max-w-[96rem] gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[16.5rem_1fr] lg:px-8">
        {/* Sidebar bên trái */}
        <aside className="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
            {/* Logo thương hiệu */}
            <div className="space-y-6">
              <Link
                href="/"
                className="group flex items-center gap-3.5 rounded-xl p-1 transition-all duration-200"
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20">
                  <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#08090d]">
                    <Lock className="h-5 w-5 text-amber-300 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold tracking-tight text-white">StayLock</span>
                    <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-amber-300">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-stone-400">Ký quỹ du lịch thông minh</p>
                </div>
              </Link>

              {/* Chuyển đổi phân quyền */}
              <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-black/25 p-1.5">
                <Link
                  href="/marketplace"
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    role === "guest"
                      ? "bg-gradient-to-r from-amber-400/20 to-amber-400/10 text-amber-200 shadow-sm border border-amber-400/30"
                      : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Compass className={`h-4 w-4 ${role === "guest" ? "text-amber-300" : "text-stone-500"}`} />
                    Khách du lịch
                  </span>
                  {role === "guest" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                  )}
                </Link>

                <Link
                  href="/host"
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    role === "host"
                      ? "bg-gradient-to-r from-amber-400/20 to-amber-400/10 text-amber-200 shadow-sm border border-amber-400/30"
                      : "text-stone-400 hover:bg-white/[0.04] hover:text-stone-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Building2 className={`h-4 w-4 ${role === "host" ? "text-amber-300" : "text-stone-500"}`} />
                    Cổng chủ nhà
                  </span>
                  {role === "host" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                  )}
                </Link>
              </div>

              {/* Mục điều hướng trang */}
              <div className="space-y-1">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                  Điều hướng nhanh
                </p>
                <nav className="flex flex-col gap-1 pt-1">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                    >
                      <span>{item.label}</span>
                      <span className="text-stone-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-amber-300">
                        &rarr;
                      </span>
                    </a>
                  ))}
                  <Link
                    href="/"
                    className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-400 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Home className="h-3.5 w-3.5 text-stone-500" />
                      Trang giới thiệu
                    </span>
                    <span className="text-stone-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-amber-300">
                      &#8599;
                    </span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Thông tin bảo chứng dưới cùng */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <div className="rounded-xl border border-white/[0.06] bg-black/25 p-3.5 text-xs text-stone-400">
                <div className="flex items-center gap-2 text-amber-200/90 font-medium mb-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                  <span>Ký quỹ Soroban on-chain</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-400">{sidebarNote}</p>
              </div>

              {/* Rút gọn hợp đồng */}
              <div className="flex items-center justify-between px-2 text-[10px] text-stone-500 font-mono">
                <span>Hợp đồng:</span>
                <span className="text-stone-400">{shortAddress(CONTRACT_ID)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Khu vực nội dung chính */}
        <div className="min-w-0 space-y-6">
          {/* Thanh Header trên cùng */}
          <header className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0e15]/80 px-5 py-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
            {/* Tiêu đề & phân loại */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  {role === "host" ? "Khu vực chủ nhà" : "Thị trường lưu trú"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  Mạng Stellar Testnet
                </span>
              </div>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                {headerTitle}
              </h1>
            </div>

            {/* Các thao tác ví & liên kết */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Phím chuyển nhanh trên mobile */}
              <div className="flex items-center gap-1 sm:hidden">
                <Link
                  href="/marketplace"
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    role === "guest"
                      ? "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                      : "text-stone-400 bg-white/[0.04]"
                  }`}
                >
                  Khách
                </Link>
                <Link
                  href="/host"
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    role === "host"
                      ? "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                      : "text-stone-400 bg-white/[0.04]"
                  }`}
                >
                  Chủ nhà
                </Link>
              </div>

              {/* Thông tin ví đã kết nối */}
              {address ? (
                <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/40 p-1 backdrop-blur-md">
                  <div className="flex items-center gap-2 px-2.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="font-mono text-xs font-medium text-stone-200">
                      {shortAddress(address)}
                    </span>
                  </div>

                  <button
                    onClick={copyAddress}
                    title="Sao chép toàn bộ địa chỉ ví"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-stone-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {walletExplorerUrl && (
                    <a
                      href={walletExplorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Xem trên Stellar Expert Explorer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-stone-400 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ) : null}

              {/* Nút Kết nối ví */}
              <button
                onClick={onConnect}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-md transition-all duration-200 ${
                  address
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                    : "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-stone-950 shadow-amber-500/20 hover:brightness-105 active:scale-[0.98]"
                }`}
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>{address ? "Đã kết nối ví Freighter" : "Kết nối ví Freighter"}</span>
              </button>
            </div>
          </header>

          {/* Phần nội dung trang */}
          <main className="space-y-8">{children}</main>

          {/* Footer chân trang */}
          <footer className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-5 text-xs text-stone-500 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300 text-xs font-bold">
                SL
              </span>
              <span>StayLock &copy; 2026 &middot; Giao thức ký quỹ du lịch thông minh trên Stellar</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-stone-400">
              <Link href="/" className="hover:text-stone-200 transition">
                Giới thiệu
              </Link>
              <Link href="/marketplace" className="hover:text-stone-200 transition">
                Danh sách phòng
              </Link>
              <Link href="/host" className="hover:text-stone-200 transition">
                Khu vực chủ nhà
              </Link>
              <span className="font-mono text-stone-500">Stellar &middot; Soroban Smart Escrow</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
