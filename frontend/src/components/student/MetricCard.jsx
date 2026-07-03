import { GlassCard } from "../ui/GlassCard";

export function MetricCard({ label, value, helper, icon: Icon }) {
  return (
    <GlassCard hover className="min-h-32">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
          {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
        </div>
        {Icon ? <div className="rounded-xl bg-cyan-300/10 p-3 text-cyan-200"><Icon /></div> : null}
      </div>
    </GlassCard>
  );
}
