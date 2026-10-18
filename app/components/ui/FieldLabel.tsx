type FieldLabelProps = {
  label: string;
  hint?: string;
  required?: boolean;
};

export function FieldLabel({ label, hint, required }: FieldLabelProps) {
  return (
    <span className="mb-2 flex items-center justify-between gap-3 text-xs font-medium tracking-wide text-stone-300">
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        {required && <span className="text-amber-400">*</span>}
      </span>
      {hint && (
        <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-stone-500">
          {hint}
        </span>
      )}
    </span>
  );
}
