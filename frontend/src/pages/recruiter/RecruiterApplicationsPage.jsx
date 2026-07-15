import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiCheck, FiEye, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { StatusBadge } from "../../components/student/StatusBadge";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { recruiterService } from "../../services/recruiterService";
import { applicationStatusOptions, formatRecruiterDate, interviewModeOptions, interviewTypeOptions } from "../../utils/recruiterMetrics";

const emptyScheduleDraft = {
  applicationId: "",
  date: "",
  type: "technical",
  mode: "online",
  meetingLink: "",
  interviewerName: "",
  round: "",
  instructions: "",
};

export function RecruiterApplicationsPage() {
  const [query, setQuery] = useState({ search: "", status: "", page: 1 });
  const [workingId, setWorkingId] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState(emptyScheduleDraft);
  const applications = useAsyncData(() => recruiterService.getApplications({ status: query.status, limit: 100, sort: "-updatedAt" }), [query.status]);
  const filteredApplications = (applications.data || []).filter((application) => {
    const search = query.search.trim().toLowerCase();
    if (!search) return true;
    return [application.student?.name, application.student?.email, application.job?.title].some((value) => value?.toLowerCase().includes(search));
  });
  const pageSize = 8;
  const visibleApplications = filteredApplications.slice((query.page - 1) * pageSize, query.page * pageSize);
  const hasNextPage = query.page * pageSize < filteredApplications.length;

  const refresh = () => applications.reload();

  const updateStatus = async (application, status, note) => {
    setWorkingId(application._id);
    try {
      await recruiterService.updateApplicationStatus(application._id, { status, note });
      toast.success("Application updated");
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const scheduleInterview = async (application) => {
    if (!scheduleDraft.date) {
      toast.error("Interview date is required");
      return;
    }

    setWorkingId(application._id);
    try {
      await recruiterService.createInterview({
        application: application._id,
        date: new Date(scheduleDraft.date).toISOString(),
        type: scheduleDraft.type,
        mode: scheduleDraft.mode,
        meetingLink: scheduleDraft.meetingLink,
        interviewerName: scheduleDraft.interviewerName,
        round: scheduleDraft.round,
        instructions: scheduleDraft.instructions,
      });
      toast.success("Interview scheduled");
      setScheduleDraft(emptyScheduleDraft);
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Recruiter" title="Applications" description="Review candidates who applied to your company's jobs.">
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <Input icon={FiSearch} placeholder="Search candidates or jobs" value={query.search} onChange={(event) => setQuery((value) => ({ ...value, search: event.target.value, page: 1 }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.status} onChange={(event) => setQuery((value) => ({ ...value, status: event.target.value, page: 1 }))}>
            {applicationStatusOptions.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}
          </select>
        </div>
      </GlassCard>

      {applications.loading ? (
        <SkeletonLoader rows={6} />
      ) : applications.error ? (
        <ErrorState description={applications.error} />
      ) : visibleApplications.length ? (
        <div className="space-y-3">
          {visibleApplications.map((application) => {
            const canSchedule = ["shortlisted", "recruiter-review", "interview-round-1", "interview-round-2", "hr-round"].includes(application.status);

            return (
              <GlassCard key={application._id} className="p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <h2 className="font-semibold text-white">{application.student?.name || "Candidate"}</h2>
                    <p className="mt-1 text-sm text-slate-400">{application.student?.email} - {application.job?.title || "Role"}</p>
                    <p className="mt-2 text-xs text-slate-500">Applied {formatRecruiterDate(application.appliedAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={application.status} />
                    <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 hover:ring-cyan-300/30" to={`/recruiter/candidates/${application._id}`}>
                      <FiEye className="h-4 w-4" />
                      Candidate
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.status === "shortlisted" ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateStatus(application, "recruiter-review", "Recruiter review started")}>Start review</Button>
                  ) : null}
                  {application.status === "recruiter-review" ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateStatus(application, "interview-round-1", "Interview round 1 started")}>Round 1</Button>
                  ) : null}
                  {application.status === "interview-round-1" ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateStatus(application, "interview-round-2", "Interview round 2 started")}>Round 2</Button>
                  ) : null}
                  {application.status === "interview-round-2" ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateStatus(application, "hr-round", "HR round started")}>HR round</Button>
                  ) : null}
                  {application.status === "hr-round" ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateStatus(application, "selected", "Recommended for hire by recruiter")}>Recommend hire</Button>
                  ) : null}
                  {canSchedule ? (
                    <Button variant="secondary" icon={FiCalendar} disabled={workingId === application._id} onClick={() => setScheduleDraft({ ...emptyScheduleDraft, applicationId: application._id })}>Schedule</Button>
                  ) : null}
                  {!["offer-released", "offer-accepted", "offer-declined", "rejected", "withdrawn"].includes(application.status) ? (
                    <Button variant="danger" icon={FiX} disabled={workingId === application._id} onClick={() => updateStatus(application, "rejected", "Rejected by recruiter")}>Reject</Button>
                  ) : null}
                </div>

                {scheduleDraft.applicationId === application._id ? (
                  <div className="mt-4 grid gap-3 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 md:grid-cols-3">
                    <Input label="Interview date" type="datetime-local" value={scheduleDraft.date} onChange={(event) => setScheduleDraft((value) => ({ ...value, date: event.target.value }))} />
                    <label>
                      <span className="mb-2 block text-sm font-medium text-slate-300">Type</span>
                      <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={scheduleDraft.type} onChange={(event) => setScheduleDraft((value) => ({ ...value, type: event.target.value }))}>
                        {interviewTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="mb-2 block text-sm font-medium text-slate-300">Mode</span>
                      <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={scheduleDraft.mode} onChange={(event) => setScheduleDraft((value) => ({ ...value, mode: event.target.value }))}>
                        {interviewModeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <Input label="Interview round" value={scheduleDraft.round} onChange={(event) => setScheduleDraft((value) => ({ ...value, round: event.target.value }))} />
                    <Input label="Interviewer" value={scheduleDraft.interviewerName} onChange={(event) => setScheduleDraft((value) => ({ ...value, interviewerName: event.target.value }))} />
                    <Input label="Meeting link" value={scheduleDraft.meetingLink} onChange={(event) => setScheduleDraft((value) => ({ ...value, meetingLink: event.target.value }))} />
                    <label className="md:col-span-3">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Instructions</span>
                      <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10" value={scheduleDraft.instructions} onChange={(event) => setScheduleDraft((value) => ({ ...value, instructions: event.target.value }))} />
                    </label>
                    <div className="flex items-end gap-2 md:col-span-3">
                      <Button disabled={workingId === application._id} onClick={() => scheduleInterview(application)}>Save</Button>
                      <Button variant="ghost" onClick={() => setScheduleDraft(emptyScheduleDraft)}>Cancel</Button>
                    </div>
                  </div>
                ) : null}
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No applications found" description="Candidates appear here after students apply to your company's jobs." />
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" disabled={query.page <= 1} onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}>Previous</Button>
        <Button variant="secondary" disabled={!hasNextPage} onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}>Next</Button>
      </div>
    </PageContainer>
  );
}
