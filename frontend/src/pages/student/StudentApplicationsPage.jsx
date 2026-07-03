import { useState } from "react";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { StatusBadge } from "../../components/student/StatusBadge";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { studentService } from "../../services/studentService";
import { formatDate } from "../../utils/studentMetrics";

export function StudentApplicationsPage() {
  const [status, setStatus] = useState("");
  const applications = useAsyncData(() => studentService.getApplications({ status, limit: 50 }), [status]);

  const withdraw = async (applicationId) => {
    try {
      await studentService.withdrawApplication(applicationId);
      toast.success("Application withdrawn");
      applications.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <PageContainer eyebrow="Application tracker" title="Applications" description="Track your submitted applications and their full backend timeline.">
      <GlassCard className="mb-6">
        <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white sm:w-72" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview-scheduled">Interview Scheduled</option>
          <option value="offer-received">Offer Received</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </GlassCard>

      {applications.loading ? <SkeletonLoader rows={6} /> : applications.error ? <ErrorState description={applications.error} /> : applications.data?.length ? (
        <div className="space-y-4">
          {applications.data.map((application) => (
            <GlassCard key={application._id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{application.job?.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{application.job?.company?.name} - Applied {formatDate(application.appliedAt)}</p>
                </div>
                <StatusBadge status={application.status} />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {(application.timeline || []).slice(-3).map((item, index) => (
                  <div key={`${item.changedAt}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <StatusBadge status={item.status} />
                    <p className="mt-3 text-sm text-slate-300">{item.note}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(item.changedAt)}</p>
                  </div>
                ))}
              </div>
              {!["withdrawn", "rejected", "offer-received"].includes(application.status) ? (
                <Button variant="danger" className="mt-5" onClick={() => withdraw(application._id)}>Withdraw application</Button>
              ) : null}
            </GlassCard>
          ))}
        </div>
      ) : <EmptyState title="No applications yet" description="Apply to open jobs to start building your history." />}
    </PageContainer>
  );
}
