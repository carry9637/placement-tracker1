import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { adminService } from "../../services/adminService";
import { compactDate, moneyRange } from "../../utils/adminMetrics";

const emptyJob = {
  title: "",
  company: "",
  placementDrive: "",
  location: "",
  workMode: "hybrid",
  jobType: "internship",
  status: "open",
  deadline: "",
  description: "",
  requiredSkills: [],
  salary: { min: "", max: "", currency: "INR", period: "stipend", isDisclosed: false },
};

const normalizeJobPayload = (values) => ({
  ...values,
  placementDrive: values.placementDrive || null,
  requiredSkills: Array.isArray(values.requiredSkills) ? values.requiredSkills : [values.requiredSkills].filter(Boolean),
  salary: {
    ...values.salary,
    min: values.salary?.min === "" ? null : Number(values.salary.min),
    max: values.salary?.max === "" ? null : Number(values.salary.max),
    isDisclosed: Boolean(values.salary?.isDisclosed),
  },
});

export function AdminJobsPage() {
  const [query, setQuery] = useState({ search: "", status: "", workMode: "", jobType: "", page: 1 });
  const [editing, setEditing] = useState(null);
  const jobs = useAsyncData(() => adminService.getJobs({ ...query, limit: 8, sort: "-createdAt" }), [query]);
  const companies = useAsyncData(() => adminService.getCompanies({ limit: 100, sort: "name" }), []);
  const drives = useAsyncData(() => adminService.getPlacementDrives({ limit: 100, sort: "-createdAt" }), []);
  const skills = useAsyncData(() => adminService.getSkills({ limit: 100, sort: "name" }), []);
  const { control, register, handleSubmit, reset, formState } = useForm({ defaultValues: emptyJob });

  const openCreate = () => {
    setEditing({ mode: "create" });
    reset(emptyJob);
  };

  const openEdit = (job) => {
    setEditing({ mode: "edit", job });
    reset({
      ...emptyJob,
      ...job,
      company: job.company?._id || job.company,
      placementDrive: job.placementDrive?._id || job.placementDrive || "",
      requiredSkills: (job.requiredSkills || []).map((skill) => skill._id || skill),
      deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : "",
      salary: {
        ...emptyJob.salary,
        ...job.salary,
        min: job.salary?.min ?? "",
        max: job.salary?.max ?? "",
      },
    });
  };

  const save = async (values) => {
    try {
      const payload = normalizeJobPayload(values);
      if (editing.mode === "edit") await adminService.updateJob(editing.job._id, payload);
      else await adminService.createJob(payload);
      toast.success(editing.mode === "edit" ? "Job updated" : "Job created");
      setEditing(null);
      jobs.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete ${job.title}?`)) return;
    try {
      await adminService.deleteJob(job._id);
      toast.success("Job deleted");
      jobs.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <PageContainer eyebrow="Admin" title="Jobs" description="Manage placement jobs, eligibility, company assignment, and required skills." actions={<Button icon={FiPlus} onClick={openCreate}>Create job</Button>}>
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-4">
          <Input icon={FiSearch} placeholder="Search jobs" value={query.search} onChange={(event) => setQuery((value) => ({ ...value, search: event.target.value, page: 1 }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.status} onChange={(event) => setQuery((value) => ({ ...value, status: event.target.value, page: 1 }))}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.workMode} onChange={(event) => setQuery((value) => ({ ...value, workMode: event.target.value, page: 1 }))}>
            <option value="">All modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.jobType} onChange={(event) => setQuery((value) => ({ ...value, jobType: event.target.value, page: 1 }))}>
            <option value="">All types</option>
            <option value="internship">Internship</option>
            <option value="full-time">Full time</option>
            <option value="part-time">Part time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </GlassCard>

      {jobs.loading ? (
        <SkeletonLoader rows={6} />
      ) : jobs.error ? (
        <ErrorState description={jobs.error} />
      ) : jobs.data?.length ? (
        <div className="space-y-3">
          {jobs.data.map((job) => (
            <GlassCard key={job._id} className="p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{job.company?.name} - {job.location} - {job.workMode} - {job.jobType}</p>
                  <p className="mt-2 text-xs text-slate-500">{job.placementDrive?.name ? `${job.placementDrive.name} - ` : ""}Deadline {compactDate(job.deadline)} - {moneyRange(job.salary)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{job.status}</span>
                  <Button variant="secondary" icon={FiEdit2} onClick={() => openEdit(job)}>Edit</Button>
                  <Button variant="danger" icon={FiTrash2} onClick={() => remove(job)}>Delete</Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No jobs found" description="Create a job after adding at least one company." />
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" disabled={query.page <= 1} onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}>Previous</Button>
        <Button variant="secondary" disabled={!jobs.meta?.hasNextPage} onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}>Next</Button>
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing?.mode === "edit" ? "Edit job" : "Create job"}
        onClose={() => setEditing(null)}
        size="wide"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="admin-job-form" disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save job"}</Button>
          </div>
        }
      >
        <form id="admin-job-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(save)}>
          <Input label="Title" className="md:col-span-2" {...register("title", { required: "Title is required" })} error={formState.errors.title?.message} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Company</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("company", { required: "Company is required" })}>
              <option value="">Select company</option>
              {(companies.data || []).map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}
            </select>
            {formState.errors.company ? <span className="mt-2 block text-xs text-rose-300">{formState.errors.company.message}</span> : null}
          </label>
          <Input label="Location" {...register("location", { required: "Location is required" })} error={formState.errors.location?.message} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Placement drive</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("placementDrive")}>
              <option value="">No drive</option>
              {(drives.data || []).map((drive) => <option key={drive._id} value={drive._id}>{drive.name}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Work mode</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("workMode")}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Job type</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("jobType")}>
              <option value="internship">Internship</option>
              <option value="full-time">Full time</option>
              <option value="part-time">Part time</option>
              <option value="contract">Contract</option>
            </select>
          </label>
          <Input label="Deadline" type="date" {...register("deadline", { required: "Deadline is required" })} error={formState.errors.deadline?.message} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Status</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("status")}>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <Input label="Salary min" type="number" {...register("salary.min")} />
          <Input label="Salary max" type="number" {...register("salary.max")} />
          <div className="md:col-span-2">
            <Controller
              name="requiredSkills"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Required skills"
                  value={field.value || []}
                  onChange={field.onChange}
                  options={(skills.data || []).map((skill) => ({
                    value: skill._id,
                    label: skill.name,
                    meta: `${skill.category} - ${skill.level}`,
                  }))}
                  placeholder="Type to search skills"
                  emptyText="No skills available"
                />
              )}
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" className="h-4 w-4 accent-cyan-300" {...register("salary.isDisclosed")} /> Salary disclosed</label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10"
              {...register("description", { required: "Description is required", minLength: { value: 20, message: "Description must be at least 20 characters" } })}
            />
            {formState.errors.description ? <span className="mt-2 block text-xs text-rose-300">{formState.errors.description.message}</span> : null}
          </label>
        </form>
      </Modal>
    </PageContainer>
  );
}
