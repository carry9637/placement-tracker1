import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiSend, FiX } from "react-icons/fi";
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
import { recruiterService } from "../../services/recruiterService";
import { formatRecruiterDate } from "../../utils/recruiterMetrics";

export function RecruiterOffersPage() {
  const [workingId, setWorkingId] = useState("");
  const applications = useAsyncData(() => recruiterService.getApplications({ limit: 100, sort: "-updatedAt" }), []);
  const offerApplications = (applications.data || []).filter((application) => ["selected", "offer-released", "offer-accepted", "offer-declined"].includes(application.status));

  const updateStatus = async (application, status, note) => {
    setWorkingId(application._id);
    try {
      await recruiterService.updateApplicationStatus(application._id, { status, note });
      toast.success(status === "offer-released" ? "Offer released" : "Application updated");
      applications.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Recruiter" title="Offers" description="Release offers for selected candidates and track acceptance outcomes.">
      {applications.loading ? (
        <SkeletonLoader rows={6} />
      ) : applications.error ? (
        <ErrorState description={applications.error} />
      ) : offerApplications.length ? (
        <div className="space-y-3">
          {offerApplications.map((application) => (
            <GlassCard key={application._id} className="p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{application.student?.name || "Candidate"}</h2>
                  <p className="mt-1 text-sm text-slate-400">{application.job?.title || "Role"} - {application.student?.email}</p>
                  <p className="mt-2 text-xs text-slate-500">Last activity {formatRecruiterDate(application.updatedAt || application.appliedAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={application.status} />
                  <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15" to={`/recruiter/candidates/${application._id}`}>
                    <FiEye className="h-4 w-4" />
                    Candidate
                  </Link>
                  {application.status === "selected" ? (
                    <Button icon={FiSend} disabled={workingId === application._id} onClick={() => updateStatus(application, "offer-released", "Offer released by recruiter")}>Release offer</Button>
                  ) : null}
                  {application.status === "selected" ? (
                    <Button variant="danger" icon={FiX} disabled={workingId === application._id} onClick={() => updateStatus(application, "rejected", "Rejected before offer release")}>Reject</Button>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No offer-ready candidates" description="Candidates appear here after they are marked selected in the recruiter workflow." />
      )}
    </PageContainer>
  );
}
