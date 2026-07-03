import { FiAlertTriangle } from "react-icons/fi";
import { GlassCard } from "../ui/GlassCard";

export function ErrorState({ title = "Something needs attention", description = "The interface is ready, but this state is waiting for real data." }) {
  return (
    <GlassCard className="border-rose-400/20 bg-rose-500/5">
      <div className="flex gap-3">
        <FiAlertTriangle className="mt-1 h-5 w-5 shrink-0 text-rose-300" />
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </GlassCard>
  );
}
