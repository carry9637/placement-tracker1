import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { studentService } from "../../services/studentService";
import { formatDate } from "../../utils/studentMetrics";

export function StudentJobsPage() {
  const [filters, setFilters] = useState({ search: "", workMode: "", jobType: "", sort: "deadline" });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const jobs = useAsyncData(() => studentService.getJobs({ ...filters, limit: 30 }), [filters]);

  const applyJob = async (job) => {
    setApplying(true);
    try {
      await studentService.applyJob({ job: job._id, remarks: "Applied from student portal" });
      toast.success("Application submitted");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setApplying(false);
    }
  };

  return (
    <PageContainer eyebrow="Job marketplace" title="Browse jobs" description="Search, filter, inspect details, and apply to open roles.">
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]">
          <Input icon={FiSearch} placeholder="Search jobs" value={filters.search} onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={filters.workMode} onChange={(event) => setFilters((value) => ({ ...value, workMode: event.target.value }))}>
            <option value="">All modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={filters.jobType} onChange={(event) => setFilters((value) => ({ ...value, jobType: event.target.value }))}>
            <option value="">All types</option>
            <option value="internship">Internship</option>
            <option value="full-time">Full time</option>
            <option value="contract">Contract</option>
          </select>
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={filters.sort} onChange={(event) => setFilters((value) => ({ ...value, sort: event.target.value }))}>
            <option value="deadline">Deadline</option>
            <option value="-createdAt">Newest</option>
            <option value="title">Title</option>
          </select>
        </div>
      </GlassCard>

      {jobs.loading ? <SkeletonLoader rows={6} /> : jobs.error ? <ErrorState description={jobs.error} /> : jobs.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.data.map((job) => (
            <GlassCard key={job._id} hover>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{job.company?.name} - {job.location}</p>
                  <p className="mt-3 text-sm text-slate-500">Deadline {formatDate(job.deadline)}</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">{job.workMode}</span>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-slate-400">{job.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setSelectedJob(job)}>Details</Button>
                <Button onClick={() => applyJob(job)} disabled={applying}>{applying ? "Applying..." : "Apply"}</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : <EmptyState title="No open jobs found" description="Try adjusting your search or filters." />}

      <Modal open={Boolean(selectedJob)} title={selectedJob?.title} onClose={() => setSelectedJob(null)}>
        {selectedJob ? (
          <div className="space-y-4 text-sm text-slate-300">
            <p>{selectedJob.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.05] p-3">Company: {selectedJob.company?.name}</div>
              <div className="rounded-xl bg-white/[0.05] p-3">Type: {selectedJob.jobType}</div>
              <div className="rounded-xl bg-white/[0.05] p-3">Mode: {selectedJob.workMode}</div>
              <div className="rounded-xl bg-white/[0.05] p-3">Deadline: {formatDate(selectedJob.deadline)}</div>
            </div>
            <Button className="w-full" onClick={() => applyJob(selectedJob)} disabled={applying}>{applying ? "Applying..." : "Apply now"}</Button>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
