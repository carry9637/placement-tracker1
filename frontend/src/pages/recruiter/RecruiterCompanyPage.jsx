import { FiBriefcase, FiGlobe, FiMapPin, FiUsers } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { MetricCard } from "../../components/student/MetricCard";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useAuth } from "../../hooks/useAuth";
import { recruiterService } from "../../services/recruiterService";
import { formatRecruiterDate, getRecruiterCompanyId } from "../../utils/recruiterMetrics";

export function RecruiterCompanyPage() {
  const { user } = useAuth();
  const companyId = getRecruiterCompanyId(user);
  const company = useAsyncData(() => companyId ? recruiterService.getCompany(companyId) : Promise.resolve({ data: null }), [companyId]);
  const jobs = useAsyncData(() => recruiterService.getJobs({ limit: 100 }), []);
  const applications = useAsyncData(() => recruiterService.getApplications({ limit: 100 }), []);
  const loading = company.loading || jobs.loading || applications.loading;
  const error = company.error || jobs.error || applications.error;

  return (
    <PageContainer eyebrow="Recruiter" title="My Company" description="View the company profile and hiring footprint assigned to your recruiter account.">
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : error ? (
        <ErrorState description={error} />
      ) : !company.data ? (
        <EmptyState title="No company assigned" description="An admin must approve your recruiter account and assign a company before hiring tools are available." />
      ) : (
        <div className="space-y-6">
          <GlassCard>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{company.data.industry}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{company.data.name}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{company.data.description || "Company description has not been added yet."}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ring-1 ${company.data.isActive ? "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20" : "bg-slate-400/10 text-slate-300 ring-slate-300/20"}`}>
                {company.data.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiMapPin className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">Location</p>
                <p className="mt-1 font-medium text-white">{company.data.location || "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiGlobe className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">Website</p>
                <p className="mt-1 break-all font-medium text-white">{company.data.website || "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiUsers className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">Recruiter</p>
                <p className="mt-1 font-medium text-white">{user?.name || "Recruiter"}</p>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Company jobs" value={(jobs.data || []).length} helper="Visible to your account" icon={FiBriefcase} />
            <MetricCard label="Applicants" value={(applications.data || []).length} helper="Applied to company jobs" icon={FiUsers} />
            <MetricCard label="Member since" value={formatRecruiterDate(company.data.createdAt)} helper="Company record created" icon={FiGlobe} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
