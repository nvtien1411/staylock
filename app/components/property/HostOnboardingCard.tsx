import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { glassCard, inputClass } from "@/app/components/ui/constants";
import { getExplorerUrl, statusMessage } from "@/app/lib/soroban/format";
import { UserCheck, ExternalLink, ShieldCheck } from "lucide-react";

type HostOnboardingCardProps = {
  address: string;
  hostName: string;
  setHostName: (value: string) => void;
  isAddingHost: boolean;
  isHostOnboarded: boolean;
  hostTone: { label: string; color: string; dot: string };
  hostResult: Record<string, unknown> | null;
  hostStatus: string;
  addHost: () => void;
};

export function HostOnboardingCard({
  address,
  hostName,
  setHostName,
  isAddingHost,
  isHostOnboarded,
  hostTone,
  hostResult,
  hostStatus,
  addHost,
}: HostOnboardingCardProps) {
  const hostExplorerUrl = getExplorerUrl(hostResult?.transactionHash);

  return (
    <section className={`${glassCard} p-6 sm:p-7 space-y-6`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Hồ sơ chủ nhà
          </span>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">Bắt đầu đón khách cùng StayLock</h3>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Đăng ký hồ sơ chủ nhà xác thực để nhận giải ngân ký quỹ tự động về ví.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
            isHostOnboarded ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : hostTone.color
          }`}
        >
          {isHostOnboarded ? "Chủ nhà xác thực" : hostTone.label}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <FieldLabel label="Địa chỉ ví chủ nhà" hint="đã kết nối" />
          <input
            value={address || "Vui lòng kết nối ví để tiếp tục"}
            readOnly
            className={`${inputClass} cursor-default font-mono text-stone-300`}
          />
        </label>
        <label className="block">
          <FieldLabel label="Tên thương hiệu / chủ nhà" hint="hồ sơ công khai" required />
          <input
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
            placeholder="Ví dụ: Danang Coastal Stays"
            className={inputClass}
          />
        </label>
      </div>

      <button
        onClick={addHost}
        disabled={isAddingHost}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 py-3.5 text-xs font-semibold text-stone-950 shadow-md shadow-amber-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserCheck className="h-4 w-4" />
        <span>{isAddingHost ? "Đang đăng ký thông tin chủ nhà..." : "Trở thành chủ nhà xác thực"}</span>
      </button>

      <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${hostTone.dot}`} />
          <p className="text-xs text-stone-200 font-medium">
            {statusMessage(hostResult, hostStatus)}
          </p>
        </div>
        {hostExplorerUrl && (
          <a
            href={hostExplorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/30 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/30"
          >
            <span>Xem xác nhận chủ nhà trên Stellar Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </section>
  );
}
