import { FiCalendar, FiClipboard, FiMessageSquare, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { MetricCard } from "../../components/student/MetricCard";
import { StatusBadge } from "../../components/student/StatusBadge";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { mentorService } from "../../services/mentorService";
import {
  formatMentorDateTime,
  getAssignedStudents,
  getMentorDashboardStats,
  getRecentMentorActivity,
} from "../../utils/mentorMetrics";

export function MentorDashboard() {
  const dashboard = useAsyncData(async () => {
    const [applications, interviews, notes] = await Promise.all([
      mentorService.getApplications({ limit: 100, sort: "-updatedAt" }),
      mentorService.getInterviews({ limit: 20, sort: "date" }),
      mentorService.getNotes({ limit: 100, sort: "-updatedAt" }),
    ]);

    const applicationItems = applications.data || [];
    const interviewItems = interviews.data || [];
    const noteItems = notes.data || [];

    return {
      data: {
        applications: applicationItems,
        interviews: interviewItems,
        notes: noteItems,
        students: getAssignedStudents(applicationItems),
        stats: getMentorDashboardStats({ applications: applicationItems, interviews: interviewItems, notes: noteItems }),
        activity: getRecentMentorActivity({ applications: applicationItems, notes: noteItems }),
      },
    };
  }, []);

  const data = dashboard.data;
  const upcomingInterviews = (data?.applications || [])
    .filter((application) => application.status === "mentoring-scheduled")
    .slice(0, 4);

  return (
    <PageContainer
      eyebrow="Mentor dashboard"
      title="Guidance command center"
      description="Track assigned students, active reviews, interviews, and notes from the live placement workflow."
      actions={
        <>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15" to="/mentor/students">
            <FiUsers className="h-4 w-4" />
            Students
          </Link>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-200 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.18)] transition hover:bg-white" to="/mentor/applications">
            <FiClipboard className="h-4 w-4" />
            Review queue
          </Link>
        </>
      }
    >
      {dashboard.loading ? (
        <SkeletonLoader rows={6} />
      ) : dashboard.error ? (
        <ErrorState description={dashboard.error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Assigned students" value={data.stats.students} helper="From mentor review queue" icon={FiUsers} />
            <MetricCard label="Active applications" value={data.stats.activeApplications} helper="Open guidance work" icon={FiClipboard} />
            <MetricCard label="Recommended" value={data.stats.shortlisted} helper="Mentor recommendations" icon={FiTrendingUp} />
            <MetricCard label="Sessions" value={data.stats.upcomingInterviews} helper="Mentoring scheduled" icon={FiCalendar} />
            <MetricCard label="Notes" value={data.stats.notes} helper="Mentor timeline" icon={FiMessageSquare} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <GlassCard>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-white">Assigned students</h2>
                <Link to="/mentor/students" className="text-sm text-cyan-200 hover:text-white">View all</Link>
              </div>
              {data.students.length ? (
                <div className="space-y-3">
                  {data.students.slice(0, 5).map((student) => (
                    <div key={student._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{student.email} - {student.applications} applications</p>
                      </div>
                      <StatusBadge status={student.latestApplication?.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No assigned students yet" description="Students appear here after applications enter the mentor review queue." />
              )}
            </GlassCard>

            <GlassCard>
              <div className="mb-4 flex items-center gap-2">
                <FiCalendar className="text-cyan-300" />
                <h2 className="font-semibold text-white">Today's sessions</h2>
              </div>
              {upcomingInterviews.length ? (
                <div className="space-y-3">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{interview.student?.name || "Student"}</p>
                      <p className="mt-1 text-sm text-slate-400">{interview.job?.title || "Mentoring session"}</p>
                      <p className="mt-2 text-xs text-cyan-200">{formatMentorDateTime(interview.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No sessions scheduled" description="Assigned guidance sessions will appear here." />
              )}
            </GlassCard>
          </div>

          <GlassCard className="mt-6">
            <h2 className="mb-4 font-semibold text-white">Recent mentor activities</h2>
            {data.activity.length ? (
              <div className="space-y-3">
                {data.activity.map((activity) => (
                  <div key={activity.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{activity.description}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatMentorDateTime(activity.at)}</p>
                    </div>
                    {activity.status ? <StatusBadge status={activity.status} /> : <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Rating {activity.rating}/5</span>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No activity yet" description="Workflow updates and notes will build the mentor timeline." />
            )}
          </GlassCard>
        </>
      )}
    </PageContainer>
  );
}
