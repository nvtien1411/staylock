type FieldLabelProps = {
  label: string;
  hint: string;
};

export function FieldLabel({ label, hint }: FieldLabelProps) {
  return (
    <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
      <span>{label}</span>
      <span className="normal-case tracking-normal text-stone-600">{hint}</span>
    </span>
  );
}
