import { FiCalendar, FiMessageSquare } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { PageContainer } from "../../components/common/PageContainer";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { EmptyState } from "../../components/feedback/EmptyState";

export function MentorDashboard() {
  return (
    <PageContainer
      eyebrow="Mentor studio"
      title="Student guidance queue"
      description="A calm workspace for reviews, mock interviews, and readiness decisions."
      actions={<Button icon={FiMessageSquare}>Add note</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <GlassCard>
          <h2 className="mb-4 font-semibold text-white">Assigned students</h2>
          <EmptyState title="Mentor data not connected yet" description="The mentor module will receive API-backed student queues in a later module." />
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <FiCalendar className="text-cyan-300" />
            <h2 className="font-semibold text-white">Review rhythm</h2>
          </div>
          <SkeletonLoader rows={4} />
        </GlassCard>
      </div>
    </PageContainer>
  );
}
