import { FiBriefcase, FiCalendar, FiCheckCircle, FiTarget } from "react-icons/fi";
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

  const loading = applications.loading || interviews.loading || skills.loading;
  const error = applications.error || interviews.error || skills.error;
  const applicationItems = applications.data || [];
  const interviewItems = interviews.data || [];
  const skillItems = skills.data || [];
  const stats = getApplicationStats(applicationItems);
  const readiness = getReadinessScore({ user, applications: applicationItems, interviews: interviewItems, skills: skillItems });
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
            <MetricCard label="Applications" value={stats.total} helper={`${stats.active} active pipelines`} icon={FiBriefcase} />
            <MetricCard label="Interviews" value={interviewItems.length} helper="Scheduled and completed rounds" icon={FiCalendar} />
            <MetricCard label="Offers" value={stats.offers} helper="Offer received status" icon={FiCheckCircle} />
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

          <GlassCard className="mt-6">
            <h2 className="mb-4 font-semibold text-white">Notifications</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-300">Application updates are enabled.</div>
              <div className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-300">Interview reminders are enabled.</div>
              <div className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-300">Readiness insights update from your activity.</div>
            </div>
          </GlassCard>
        </>
      )}
    </PageContainer>
  );
}
