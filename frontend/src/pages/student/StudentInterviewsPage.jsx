import { FiCalendar, FiExternalLink } from "react-icons/fi";
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
                    <p className="mt-1 text-sm text-slate-400">{interview.round || interview.type} - {formatDate(interview.date)}</p>
                    <p className="mt-2 text-xs text-slate-500">Time: {interview.time || "Not set"} - Mode: {interview.mode || "Not set"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{interview.result}</span>
              </div>
              <div className="mt-4 grid gap-3 rounded-2xl bg-slate-950/45 p-4 text-sm text-slate-300 md:grid-cols-2">
                <p>Interview status: {interview.result}</p>
                <p>Next round: {interview.round || interview.type}</p>
                <p>Interviewer: {interview.interviewerName || "Not set"}</p>
                <p>Meeting link: {interview.meetingLink || "Not set"}</p>
              </div>
              {interview.meetingLink ? (
                <a className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white" href={interview.meetingLink} target="_blank" rel="noreferrer">
                  <FiExternalLink className="h-4 w-4" />
                  Join meeting
                </a>
              ) : null}
              {interview.instructions ? <p className="mt-4 rounded-2xl bg-slate-950/45 p-4 text-sm text-slate-300">{interview.instructions}</p> : null}
              {interview.feedback ? <p className="mt-4 rounded-2xl bg-slate-950/45 p-4 text-sm text-slate-300">{interview.feedback}</p> : null}
            </GlassCard>
          ))}
        </div>
      ) : <EmptyState title="No interviews yet" description="Interview rounds will appear here when mentors schedule them." />}
    </PageContainer>
  );
}
