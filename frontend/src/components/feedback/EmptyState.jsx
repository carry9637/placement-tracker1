import { FiInbox } from "react-icons/fi";
import { GlassCard } from "../ui/GlassCard";

export function EmptyState({ title = "No records yet", description = "Your workspace will show items here when data is available." }) {
  return (
    <GlassCard className="grid place-items-center py-12 text-center">
      <FiInbox className="mb-4 h-8 w-8 text-cyan-300" />
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
    </GlassCard>
  );
}
