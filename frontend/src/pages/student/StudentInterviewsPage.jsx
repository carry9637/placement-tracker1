import { FiCalendar } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { studentService } from "../../services/studentService";
import { formatDate } from "../../utils/studentMetrics";

export function StudentInterviewsPage() {
  const interviews = useAsyncData(() => studentService.getInterviews({ limit: 50, sort: "date" }), []);

  return (
    <PageContainer eyebrow="Interview timeline" title="Interviews" description="Your scheduled and completed interview rounds.">
      {interviews.loading ? <SkeletonLoader rows={5} /> : interviews.error ? <ErrorState description={interviews.error} /> : interviews.data?.length ? (
        <div className="space-y-4">
          {interviews.data.map((interview) => (
            <GlassCard key={interview._id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><FiCalendar /></div>
                  <div>
                    <h2 className="font-semibold text-white">{interview.application?.job?.title}</h2>
                    <p className="mt-1 text-sm text-slate-400">{interview.type} round - {formatDate(interview.date)}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{interview.result}</span>
              </div>
              {interview.feedback ? <p className="mt-4 rounded-2xl bg-slate-950/45 p-4 text-sm text-slate-300">{interview.feedback}</p> : null}
            </GlassCard>
          ))}
        </div>
      ) : <EmptyState title="No interviews yet" description="Interview rounds will appear here when mentors schedule them." />}
    </PageContainer>
  );
}
