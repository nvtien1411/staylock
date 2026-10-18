import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";

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
    <section className={`${glassCard} p-6 sm:p-8 space-y-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Đặt phòng giao thức trực tiếp
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Khởi tạo ký quỹ tùy chỉnh
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Khóa tiền cọc ký quỹ với các thông số tùy biến trực tiếp vào hợp đồng thông minh Soroban.
          </p>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-stone-300">
          Stellar Soroban v21
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <FieldLabel label="Ví khách du lịch" hint="địa chỉ ví G..." required />
          <input
            value={traveler}
            onChange={(event) => setTraveler(event.target.value)}
            placeholder="Địa chỉ ví khách (G...)"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Ví chủ nhà thụ hưởng" hint="chủ phòng" required />
          <input
            value={host}
            onChange={(event) => setHost(event.target.value)}
            placeholder="Địa chỉ ví chủ nhà (G...)"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Mã phòng / chỗ nghỉ" hint="dạng số" required />
          <input
            type="number"
            min="0"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            placeholder="1001"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Tiền cọc ký quỹ" hint="stroops (1 XLM = 10,000,000)" required />
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="125000000"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Ngày nhận phòng" hint="Định dạng YYYYMMDD" required />
          <input
            type="number"
            min="0"
            value={dayCheckin}
            onChange={(event) => setDayCheckin(event.target.value)}
            placeholder="20260520"
            className={inputClass}
          />
        </label>
        <label className="block">
          <FieldLabel label="Ngày trả phòng" hint="Định dạng YYYYMMDD" required />
          <input
            type="number"
            min="0"
            value={dayCheckout}
            onChange={(event) => setDayCheckout(event.target.value)}
            placeholder="20260524"
            className={inputClass}
          />
        </label>
      </div>

      <button
        onClick={createBooking}
        disabled={isCreating}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-xs font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        <span>{isCreating ? "Đang xác thực ký quỹ trên Stellar..." : "Ký duyệt & khóa tiền cọc ký quỹ"}</span>
      </button>
    </section>
  );
}
