type Props = { label: string; value: string; helper?: string };

export function StatCard({ label, value, helper }: Props) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </article>
  );
}
