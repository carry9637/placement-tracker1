import { FiBarChart2, FiBriefcase, FiCalendar, FiFileText, FiUsers } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { MetricCard } from "../../components/student/MetricCard";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { adminService } from "../../services/adminService";
import { compactDate, getUniqueStudentsFromApplications } from "../../utils/adminMetrics";

export function AdminReportsPage() {
  const reports = useAsyncData(async () => {
    const [applications, interviews, companies, drives, mentors] = await Promise.all([
      adminService.getApplications({ limit: 500, sort: "-updatedAt" }),
      adminService.getInterviews({ limit: 500, sort: "-date" }),
      adminService.getCompanies({ limit: 200 }),
      adminService.getPlacementDrives({ limit: 200 }),
      adminService.getUsers({ role: "mentor", limit: 200 }),
    ]);

    const applicationItems = applications.data || [];
    const students = getUniqueStudentsFromApplications(applicationItems);
    const placed = applicationItems.filter((application) => ["selected", "offer-released", "offer-accepted", "offer-received"].includes(application.status));
    const rejected = applicationItems.filter((application) => application.status === "rejected");
    const placementRate = students.length ? Math.round((new Set(placed.map((application) => application.student?._id)).size / students.length) * 100) : 0;

    return {
      data: {
        applications: applicationItems,
        interviews: interviews.data || [],
        companies: companies.data || [],
        drives: drives.data || [],
        mentors: mentors.data || [],
        students,
        placed,
        rejected,
        placementRate,
      },
    };
  }, []);

  const data = reports.data;

  return (
    <PageContainer eyebrow="Admin reports" title="Placement reports" description="Operational reports for placement, students, mentors, companies, and interviews.">
      {reports.loading ? (
        <SkeletonLoader rows={6} />
      ) : reports.error ? (
        <ErrorState description={reports.error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Placement rate" value={`${data.placementRate}%`} helper="Students with selected or offer status" icon={FiBarChart2} />
            <MetricCard label="Students" value={data.students.length} helper="Students with applications" icon={FiUsers} />
            <MetricCard label="Placed" value={data.placed.length} helper="Selected or offered applications" icon={FiBriefcase} />
            <MetricCard label="Rejected" value={data.rejected.length} helper="Rejected applications" icon={FiFileText} />
            <MetricCard label="Interviews" value={data.interviews.length} helper="Scheduled rounds" icon={FiCalendar} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Company report</h2>
              {data.companies.length ? (
                <div className="space-y-3">
                  {data.companies.slice(0, 8).map((company) => (
                    <div key={company._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{company.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{company.industry} - {company.location || "No location"}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No companies" description="Company reports appear after partner companies are added." />}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Drive report</h2>
              {data.drives.length ? (
                <div className="space-y-3">
                  {data.drives.slice(0, 8).map((drive) => (
                    <div key={drive._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{drive.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{drive.status} - Registration {compactDate(drive.registrationDeadline)}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No drives" description="Drive reports appear after placement drives are created." />}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Mentor report</h2>
              {data.mentors.length ? (
                <div className="space-y-3">
                  {data.mentors.slice(0, 8).map((mentor) => (
                    <div key={mentor._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{mentor.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{mentor.email}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No mentors" description="Mentor reports appear after mentor accounts are onboarded." />}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Interview report</h2>
              {data.interviews.length ? (
                <div className="space-y-3">
                  {data.interviews.slice(0, 8).map((interview) => (
                    <div key={interview._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{interview.application?.student?.name || "Student"}</p>
                      <p className="mt-1 text-sm text-slate-400">{interview.type} - {interview.result} - {compactDate(interview.date)}</p>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No interviews" description="Interview reports appear after rounds are scheduled." />}
            </GlassCard>
          </div>
        </>
      )}
    </PageContainer>
  );
}
