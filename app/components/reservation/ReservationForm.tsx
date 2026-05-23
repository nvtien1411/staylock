import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";

type ReservationFormProps = {
  traveler: string;
  setTraveler: (value: string) => void;
  host: string;
  setHost: (value: string) => void;
  roomId: string;
  setRoomId: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  dayCheckin: string;
  setDayCheckin: (value: string) => void;
  dayCheckout: string;
  setDayCheckout: (value: string) => void;
  isCreating: boolean;
  createBooking: () => void;
};

export function ReservationForm({
  traveler,
  setTraveler,
  host,
  setHost,
  roomId,
  setRoomId,
  amount,
  setAmount,
  dayCheckin,
  setDayCheckin,
  dayCheckout,
  setDayCheckout,
  isCreating,
  createBooking,
}: ReservationFormProps) {
  return (
    <section className={`${glassCard} p-5 sm:p-7`}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-100/70">Reservation experience</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Reserve your stay</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">Create a protected reservation in seconds. Your wallet approval secures the escrow deposit without exposing the complexity underneath.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-stone-300">3-step secure flow</span>
      </div>

      <div className="mb-7 grid gap-3 md:grid-cols-3">
        {["Guest details", "Stay details", "Secure deposit"].map((step, index) => (
          <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs text-amber-100/70">Step {index + 1}</p>
            <p className="mt-1 font-semibold text-white">{step}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <FieldLabel label="Guest Wallet" hint="auto-filled" />
          <input value={traveler} onChange={(event) => setTraveler(event.target.value)} placeholder="Guest wallet address" className={inputClass} />
        </label>
        <label>
          <FieldLabel label="Property Owner" hint="wallet" />
          <input value={host} onChange={(event) => setHost(event.target.value)} placeholder="Owner wallet address" className={inputClass} />
        </label>
        <label>
          <FieldLabel label="Room / Villa ID" hint="stay" />
          <input type="number" min="0" value={roomId} onChange={(event) => setRoomId(event.target.value)} placeholder="1024" className={inputClass} />
        </label>
        <label>
          <FieldLabel label="Escrow Deposit" hint="stroops" />
          <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="125000000" className={inputClass} />
        </label>
        <label>
          <FieldLabel label="Check-in Day" hint="day" />
          <input type="number" min="0" value={dayCheckin} onChange={(event) => setDayCheckin(event.target.value)} placeholder="20260520" className={inputClass} />
        </label>
        <label>
          <FieldLabel label="Check-out Day" hint="day" />
          <input type="number" min="0" value={dayCheckout} onChange={(event) => setDayCheckout(event.target.value)} placeholder="20260524" className={inputClass} />
        </label>
      </div>

      <button
        onClick={createBooking}
        disabled={isCreating}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-stone-50 via-amber-100 to-amber-300 px-8 py-4 text-base font-black text-stone-950 shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-300/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreating ? "Securing reservation..." : "Reserve Stay"}
      </button>
    </section>
  );
}
