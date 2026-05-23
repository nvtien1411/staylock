import Link from "next/link";
import { metrics, escrowSteps } from "@/app/components/dashboard/data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070604] text-stone-50">
      <div className="absolute left-[-20rem] top-[-20rem] h-[40rem] w-[40rem] rounded-full bg-amber-300/10 blur-3xl" />
      <div className="absolute right-[-18rem] top-20 h-[36rem] w-[36rem] rounded-full bg-sky-300/8 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-xs font-bold text-stone-950">
              SL
            </div>
            <div>
              <p className="text-sm font-semibold text-white">StayLock</p>
              <p className="hidden text-xs text-stone-500 sm:block">Escrow-backed travel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/host" className="hidden rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.09] sm:inline-flex">
              Host Portal
            </Link>
            <Link href="/marketplace" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
              Browse Stays
            </Link>
          </div>
        </header>

        <section className="grid gap-10 pt-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-3.5 py-1.5 text-xs text-amber-200">
              Escrow-backed confidence for modern travel
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Book premium stays with trust built in
              </h1>
              <p className="max-w-xl text-base leading-7 text-stone-400">
                StayLock protects guests and property owners with wallet-native reservations, locked
                deposits, and settlement that feels effortless.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/marketplace" className="rounded-full bg-amber-300 px-6 py-3 text-center text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-200">
                Browse Stays
              </Link>
              <a href="#trust" className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-center text-sm text-stone-300 transition hover:bg-white/[0.09]">
                How it works
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
            <div className="rounded-xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500">Protected stay</p>
                  <h2 className="mt-1.5 text-xl font-semibold">Amalfi Glass Villa</h2>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Verified</span>
              </div>
              <div className="mt-5 h-52 rounded-xl bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.3),transparent_14%),linear-gradient(135deg,rgba(245,158,11,0.5),rgba(8,47,73,0.9)_52%,rgba(12,10,9,1))] shadow-lg shadow-black/30" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[["Deposit", "12.5 XLM"], ["Nights", "4"], ["Escrow", "Active"]].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-white/[0.05] p-3">
                    <p className="text-xs text-stone-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          {metrics.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-1.5 text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </section>

        <section id="trust" className="grid gap-4 md:grid-cols-3">
          {escrowSteps.map(([number, title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-white/[0.08]">
              <p className="text-xs font-semibold text-amber-300/80">{number}</p>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
            </div>
          ))}
        </section>

        <section id="host" className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-7 shadow-lg shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-amber-300/70">For property owners</p>
            <h2 className="mt-3 text-2xl font-bold">Become a host</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-400">
              List your property on StayLock and let the Soroban smart contract handle escrow,
              check-in verification, and settlement without a middleman.
            </p>
            <div className="mt-6 space-y-2">
              {[
                ["Your wallet is your identity", "No accounts, no passwords. Your Stellar wallet is your host profile."],
                ["Escrow-backed reservations", "Deposits are locked on-chain until check-in is confirmed."],
                ["Trustless settlement", "Funds release automatically on checkout — no manual processing."],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-stone-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/host" className="mt-6 inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-5 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-200/15">
              Apply for Host Access
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-7 shadow-lg shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-stone-500">For guests</p>
            <h2 className="mt-3 text-2xl font-bold">Book with confidence</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-400">
              Every reservation is secured by a Soroban smart contract. Your deposit is protected
              until check-in is confirmed.
            </p>
            <div className="mt-6 space-y-2">
              {[
                ["Browse verified listings", "Every property is owned by a verified host wallet."],
                ["Reserve with your wallet", "One Freighter approval secures your stay and locks the escrow."],
                ["Track on-chain", "Your booking ID is your on-chain proof, verifiable by anyone."],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-stone-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/marketplace" className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-200">
              Browse Stays
            </Link>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/[0.07] py-7 text-xs text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>StayLock — escrow-backed travel on Stellar</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/marketplace" className="transition hover:text-stone-400">Marketplace</Link>
            <Link href="/host" className="transition hover:text-stone-400">Host Portal</Link>
            <span>Built on Stellar + Soroban</span>
            <span>Freighter ready</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
