import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage } from "@/app/lib/soroban/format";
import { PlusCircle, ExternalLink, ShieldCheck } from "lucide-react";

type PropertyCreationCardProps = {
  propertyName: string;
  setPropertyName: (value: string) => void;
  propertyStatus: string;
  isCreatingProperty: boolean;
  propertyTone: { label: string; color: string; dot: string };
  propertyResult: Record<string, unknown> | null;
  createRoom: () => void;
};

export function PropertyCreationCard({
  propertyName,
  setPropertyName,
  propertyStatus,
  isCreatingProperty,
  propertyTone,
  propertyResult,
  createRoom,
}: PropertyCreationCardProps) {
  const propertyExplorerUrl = getExplorerUrl(propertyResult?.transactionHash);

  return (
    <section className={`${glassCard} p-6 sm:p-7 space-y-6`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Đăng ký chỗ nghỉ
          </span>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Niêm yết phòng trên sổ cái on-chain
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Thêm phòng hoặc biệt thự được bảo chứng bằng hợp đồng ký quỹ thông minh Soroban.
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${propertyTone.color}`}>
          {propertyTone.label}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <FieldLabel label="Tên phòng / biệt thự" hint="tiêu đề niêm yết" required />
          <input
            value={propertyName}
            onChange={(event) => setPropertyName(event.target.value)}
            placeholder="Ví dụ: Biệt thự biển Mỹ Khê"
            className={inputClass}
          />
        </label>
        <button
          onClick={createRoom}
          disabled={isCreatingProperty}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-6 py-3 text-xs font-semibold text-stone-950 shadow-md shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{isCreatingProperty ? "Đang xuất bản..." : "Tạo phòng mới"}</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${propertyTone.dot}`} />
          <p className="text-xs text-stone-200 font-medium">
            {statusMessage(propertyResult, propertyStatus)}
          </p>
        </div>
        {propertyExplorerUrl && (
          <a
            href={propertyExplorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/30 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/30"
          >
            <span>Xem xác nhận phòng trên Stellar Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </section>
  );
}
