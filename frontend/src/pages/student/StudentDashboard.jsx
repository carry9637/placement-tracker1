import { FiBell, FiBriefcase, FiCalendar, FiCheckCircle, FiTarget } from "react-icons/fi";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageContainer } from "../../components/common/PageContainer";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { GlassCard } from "../../components/ui/GlassCard";
import { MetricCard } from "../../components/student/MetricCard";
import { StatusBadge } from "../../components/student/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useAsyncData } from "../../hooks/useAsyncData";
import { studentService } from "../../services/studentService";
import { formatDate, getApplicationStats, getReadinessScore, statusLabels } from "../../utils/studentMetrics";

const chartColors = ["#67e8f9", "#34d399", "#fbbf24", "#818cf8", "#fb7185", "#94a3b8"];

export function StudentDashboard() {
  const { user } = useAuth();
  const applications = useAsyncData(() => studentService.getApplications({ limit: 50 }), []);
  const interviews = useAsyncData(() => studentService.getInterviews({ limit: 20, sort: "date" }), []);
  const skills = useAsyncData(() => studentService.getSkills({ limit: 100 }), []);
  const jobs = useAsyncData(() => studentService.getJobs({ limit: 4, sort: "deadline" }), []);
  const notifications = useAsyncData(() => studentService.getNotifications({ limit: 5 }), []);

  const loading = applications.loading || interviews.loading || skills.loading || jobs.loading || notifications.loading;
  const error = applications.error || interviews.error || skills.error || jobs.error || notifications.error;
  const applicationItems = applications.data || [];
  const interviewItems = interviews.data || [];
  const skillItems = skills.data || [];
  const stats = getApplicationStats(applicationItems);
  const readiness = getReadinessScore({ user, applications: applicationItems, interviews: interviewItems, skills: skillItems });
  const profile = user?.profile || {};
  const profileCompletion = Math.round((["phone", "headline", "college", "branch", "graduationYear", "cgpa", "github", "linkedin"].filter((field) => profile[field]).length / 8) * 100);
  const upcomingInterviews = interviewItems.filter((interview) => interview.result === "pending" && new Date(interview.date) >= new Date()).slice(0, 3);
  const statusChart = Object.entries(stats.byStatus).map(([status, value]) => ({ name: statusLabels[status] || status, value }));
  const recentActivities = applicationItems.flatMap((application) =>
    (application.timeline || []).map((item) => ({
      ...item,
      job: application.job?.title,
    }))
  ).sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)).slice(0, 5);

  return (
    <PageContainer eyebrow="Student dashboard" title={`Welcome back, ${user?.name || "Student"}`} description="Live view of your placement journey from real backend data.">
      {loading ? <SkeletonLoader rows={5} /> : error ? <ErrorState description={error} /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Readiness score" value={`${readiness}%`} helper="Profile, resume, applications, interviews" icon={FiTarget} />
            <MetricCard label="Profile" value={`${profileCompletion}%`} helper={profile.resume?.fileName ? "Resume uploaded" : "Resume pending"} icon={FiCheckCircle} />
            <MetricCard label="Applications" value={stats.total} helper={`${stats.active} active pipelines`} icon={FiBriefcase} />
            <MetricCard label="Interviews" value={interviewItems.length} helper="Scheduled and completed rounds" icon={FiCalendar} />
            <MetricCard label="Offers" value={stats.offers} helper="Released or accepted offers" icon={FiBell} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Application mix</h2>
              {statusChart.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                        {statusChart.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="text-sm text-slate-400">Apply to jobs to build your pipeline chart.</p>}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Recent activity</h2>
              <div className="space-y-3">
                {recentActivities.length ? recentActivities.map((activity, index) => (
                  <div key={`${activity.changedAt}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <StatusBadge status={activity.status} />
                      <span className="text-xs text-slate-500">{formatDate(activity.changedAt)}</span>
                    </div>
                    <p className="mt-3 text-sm text-white">{activity.job}</p>
                    <p className="mt-1 text-sm text-slate-400">{activity.note}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">No application activity yet.</p>}
              </div>
            </GlassCard>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Upcoming interviews</h2>
              <div className="space-y-3">
                {upcomingInterviews.length ? upcomingInterviews.map((interview) => (
                  <div key={interview._id} className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-300">
                    <p className="font-medium text-white">{interview.application?.job?.title || "Interview"}</p>
                    <p className="mt-1 text-slate-400">{formatDate(interview.date)} - {interview.type}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">No upcoming interviews yet.</p>}
              </div>
            </GlassCard>
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Recommended jobs</h2>
              <div className="space-y-3">
                {(jobs.data || []).length ? jobs.data.map((job) => (
                  <div key={job._id} className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-300">
                    <p className="font-medium text-white">{job.title}</p>
                    <p className="mt-1 text-slate-400">{job.company?.name || "Company"} - {formatDate(job.deadline)}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">Open jobs will appear here as recommendations.</p>}
              </div>
            </GlassCard>
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Recent notifications</h2>
              <div className="space-y-3">
                {(notifications.data || []).length ? notifications.data.map((notification) => (
                  <div key={notification._id} className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-300">
                    <p className="font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-slate-400">{notification.message}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">No notifications yet.</p>}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </PageContainer>
  );
}
