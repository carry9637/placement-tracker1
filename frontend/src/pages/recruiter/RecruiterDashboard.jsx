import { Link } from "react-router-dom";
import { FiBriefcase, FiCalendar, FiClipboard, FiSend, FiUsers } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { MetricCard } from "../../components/student/MetricCard";
import { StatusBadge } from "../../components/student/StatusBadge";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { recruiterService } from "../../services/recruiterService";
import { formatRecruiterDateTime, getRecruiterStats } from "../../utils/recruiterMetrics";

export function RecruiterDashboard() {
  const jobs = useAsyncData(() => recruiterService.getJobs({ limit: 100, sort: "-createdAt" }), []);
  const applications = useAsyncData(() => recruiterService.getApplications({ limit: 100, sort: "-updatedAt" }), []);
  const interviews = useAsyncData(() => recruiterService.getInterviews({ limit: 50, sort: "date" }), []);
  const notifications = useAsyncData(() => recruiterService.getNotifications({ limit: 5 }), []);
  const loading = jobs.loading || applications.loading || interviews.loading || notifications.loading;
  const error = jobs.error || applications.error || interviews.error || notifications.error;
  const stats = getRecruiterStats({
    jobs: jobs.data || [],
    applications: applications.data || [],
    interviews: interviews.data || [],
  });
  const reviewQueue = (applications.data || []).filter((application) => ["shortlisted", "recruiter-review"].includes(application.status)).slice(0, 5);
  const upcomingInterviews = (interviews.data || []).filter((interview) => interview.result === "pending").slice(0, 5);

  return (
    <PageContainer eyebrow="Recruiter dashboard" title="Company hiring workspace" description="Review your company pipeline, interviews, offers, and candidate activity.">
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Active jobs" value={stats.activeJobs} helper="Open or draft roles" icon={FiBriefcase} />
            <MetricCard label="Applicants" value={stats.applicants} helper="Company-scoped candidates" icon={FiUsers} />
            <MetricCard label="Pending review" value={stats.pendingReview} helper="Shortlisted or recruiter review" icon={FiClipboard} />
            <MetricCard label="Interviews" value={stats.interviewsPending} helper="Pending interview rounds" icon={FiCalendar} />
            <MetricCard label="Offers" value={stats.offers} helper="Released or responded" icon={FiSend} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <GlassCard>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-white">Review queue</h2>
                <Link className="text-sm font-semibold text-cyan-200 hover:text-white" to="/recruiter/applications">View all</Link>
              </div>
              {reviewQueue.length ? (
                <div className="space-y-3">
                  {reviewQueue.map((application) => (
                    <Link key={application._id} to={`/recruiter/candidates/${application._id}`} className="block rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-white">{application.student?.name || "Candidate"}</p>
                          <p className="mt-1 text-sm text-slate-400">{application.job?.title || "Role"} - {application.student?.email}</p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState title="No candidates waiting" description="Shortlisted candidates for your company will appear here." />
              )}
            </GlassCard>

            <GlassCard>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-white">Upcoming interviews</h2>
                <Link className="text-sm font-semibold text-cyan-200 hover:text-white" to="/recruiter/interviews">Manage</Link>
              </div>
              {upcomingInterviews.length ? (
                <div className="space-y-3">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{interview.application?.student?.name || "Candidate"}</p>
                      <p className="mt-1 text-sm text-slate-400">{interview.type} - {formatRecruiterDateTime(interview.date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No interviews scheduled" description="Schedule rounds from Applications or Interviews." />
              )}
            </GlassCard>
          </div>

          <GlassCard>
            <h2 className="mb-4 font-semibold text-white">Recent notifications</h2>
            {(notifications.data || []).length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {notifications.data.map((notification) => (
                  <div key={notification._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <p className="font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No notifications yet" description="Company applicant and offer updates will appear here." />
            )}
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
}
