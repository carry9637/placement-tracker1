import { FiBarChart2, FiBriefcase } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { PageContainer } from "../../components/common/PageContainer";
import { ErrorState } from "../../components/feedback/ErrorState";

const adminCards = ["Companies", "Jobs", "Students", "Reports"];

export function AdminDashboard() {
  return (
    <PageContainer
      eyebrow="Admin command"
      title="Placement operations"
      description="Monitor company pipelines, student readiness, job activity, and reporting surfaces."
      actions={<Button icon={FiBriefcase}>Create job</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminCards.map((label) => (
          <GlassCard key={label}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">--</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-cyan-300" />
            <h2 className="font-semibold text-white">Company pipeline</h2>
          </div>
          <div className="space-y-3">
            <p className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-400">Admin data will be API-backed when the admin module is implemented.</p>
          </div>
        </GlassCard>
        <ErrorState title="Reports are placeholder-only" description="Charts and exports will connect once business APIs are wired." />
      </div>
    </PageContainer>
  );
}
