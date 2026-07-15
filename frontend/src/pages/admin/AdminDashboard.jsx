import { FiBriefcase, FiCalendar, FiClipboard, FiDollarSign, FiFlag, FiHome, FiTrendingUp, FiUsers } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { MetricCard } from "../../components/student/MetricCard";
import { StatusBadge } from "../../components/student/StatusBadge";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { adminService } from "../../services/adminService";
import { compactDate, getPackageStats, getUniqueStudentsFromApplications } from "../../utils/adminMetrics";

export function AdminDashboard() {
  const dashboard = useAsyncData(async () => {
    const [companies, jobs, applications, interviews, recruiters, drives] = await Promise.all([
      adminService.getCompanies({ limit: 1 }),
      adminService.getJobs({ limit: 100 }),
      adminService.getApplications({ limit: 100 }),
      adminService.getInterviews({ limit: 100 }),
      adminService.getUsers({ role: "recruiter", limit: 1 }),
      adminService.getPlacementDrives({ limit: 100 }),
    ]);

    const applicationItems = applications.data || [];
    const jobItems = jobs.data || [];
    const driveItems = drives.data || [];
    const students = getUniqueStudentsFromApplications(applicationItems);
    const placedStudents = getUniqueStudentsFromApplications(applicationItems.filter((application) => application.status === "offer-accepted"));
    const packageStats = getPackageStats(jobItems);
    const recentActivities = applicationItems
      .flatMap((application) =>
        (application.timeline || []).map((activity) => ({
          ...activity,
          application,
        }))
      )
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
      .slice(0, 6);

    return {
      data: {
        totals: {
          students: students.length,
          companies: companies.meta?.total || 0,
          jobs: jobs.meta?.total || 0,
          applications: applications.meta?.total || 0,
          interviews: interviews.meta?.total || 0,
          recruiters: recruiters.meta?.total || 0,
          drives: drives.meta?.total || 0,
          placementPercentage: students.length ? Math.round((placedStudents.length / students.length) * 100) : 0,
          activeDrives: driveItems.filter((drive) => ["published", "registration-open", "in-progress"].includes(drive.status)).length,
          highestPackage: packageStats.highest,
          averagePackage: packageStats.average,
        },
        recentActivities,
      },
    };
  }, []);

  const totals = dashboard.data?.totals;

  return (
    <PageContainer eyebrow="Admin dashboard" title="Placement operations" description="Real-time placement metrics from the existing backend APIs.">
      {dashboard.loading ? (
        <SkeletonLoader rows={6} />
      ) : dashboard.error ? (
        <ErrorState description={dashboard.error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Placement %" value={`${totals.placementPercentage}%`} helper="Accepted offers from applicants" icon={FiTrendingUp} />
            <MetricCard label="Students" value={totals.students} helper="Derived from applications" icon={FiUsers} />
            <MetricCard label="Companies" value={totals.companies} helper="Placement partners" icon={FiHome} />
            <MetricCard label="Recruiters" value={totals.recruiters} helper="Company HR accounts" icon={FiUsers} />
            <MetricCard label="Active drives" value={totals.activeDrives} helper={`${totals.drives} campus hiring drives`} icon={FiFlag} />
            <MetricCard label="Jobs" value={totals.jobs} helper="All job records" icon={FiBriefcase} />
            <MetricCard label="Applications" value={totals.applications} helper="Submitted pipelines" icon={FiClipboard} />
            <MetricCard label="Interviews" value={totals.interviews} helper="Scheduled rounds" icon={FiCalendar} />
            <MetricCard label="Highest package" value={totals.highestPackage} helper="From disclosed job salary" icon={FiDollarSign} />
            <MetricCard label="Average package" value={totals.averagePackage} helper="From disclosed job salary" icon={FiDollarSign} />
          </div>

          <GlassCard className="mt-6">
            <h2 className="mb-4 font-semibold text-white">Recent activities</h2>
            <div className="space-y-3">
              {dashboard.data.recentActivities.length ? (
                dashboard.data.recentActivities.map((activity, index) => (
                  <div key={`${activity.changedAt}-${index}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {activity.application?.student?.name || "Student"} - {activity.application?.job?.title || "Application"}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {activity.note || "Status updated"} on {compactDate(activity.changedAt)}
                      </p>
                    </div>
                    <StatusBadge status={activity.status} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No placement activity yet.</p>
              )}
            </div>
          </GlassCard>
        </>
      )}
    </PageContainer>
  );
}
