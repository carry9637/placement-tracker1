import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit2, FiPlus, FiSearch } from "react-icons/fi";
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
import { adminService } from "../../services/adminService";
import { compactDate } from "../../utils/adminMetrics";

const emptyDrive = {
  name: "",
  company: "",
  registrationDeadline: "",
  status: "draft",
  branches: "",
  batch: "",
  minCgpa: "",
  notes: "",
  rounds: "Aptitude, Technical, HR",
};

const normalizeDrivePayload = (values) => ({
  name: values.name,
  company: values.company,
  registrationDeadline: values.registrationDeadline,
  status: values.status,
  eligibility: {
    branches: values.branches.split(",").map((item) => item.trim()).filter(Boolean),
    batch: values.batch.split(",").map((item) => Number(item.trim())).filter(Boolean),
    minCgpa: values.minCgpa === "" ? null : Number(values.minCgpa),
    notes: values.notes,
  },
  interviewRounds: values.rounds.split(",").map((name, index) => ({
    name: name.trim(),
    order: index + 1,
    mode: "online",
  })).filter((round) => round.name),
});

export function AdminDrivesPage() {
  const [query, setQuery] = useState({ search: "", status: "", page: 1 });
  const [editing, setEditing] = useState(null);
  const drives = useAsyncData(() => adminService.getPlacementDrives({ ...query, limit: 8, sort: "-createdAt" }), [query]);
  const companies = useAsyncData(() => adminService.getCompanies({ limit: 100, sort: "name" }), []);
  const { register, handleSubmit, reset, formState } = useForm({ defaultValues: emptyDrive });

  const openCreate = () => {
    setEditing({ mode: "create" });
    reset(emptyDrive);
  };

  const openEdit = (drive) => {
    setEditing({ mode: "edit", drive });
    reset({
      ...emptyDrive,
      name: drive.name || "",
      company: drive.company?._id || drive.company || "",
      registrationDeadline: drive.registrationDeadline ? new Date(drive.registrationDeadline).toISOString().slice(0, 10) : "",
      status: drive.status || "draft",
      branches: (drive.eligibility?.branches || []).join(", "),
      batch: (drive.eligibility?.batch || []).join(", "),
      minCgpa: drive.eligibility?.minCgpa ?? "",
      notes: drive.eligibility?.notes || "",
      rounds: (drive.interviewRounds || []).map((round) => round.name).join(", "),
    });
  };

  const save = async (values) => {
    try {
      const payload = normalizeDrivePayload(values);
      if (editing.mode === "edit") await adminService.updatePlacementDrive(editing.drive._id, payload);
      else await adminService.createPlacementDrive(payload);
      toast.success(editing.mode === "edit" ? "Placement drive updated" : "Placement drive created");
      setEditing(null);
      drives.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <PageContainer eyebrow="Admin" title="Placement drives" description="Manage campus drives, eligibility rules, batches, registration windows, and interview rounds." actions={<Button icon={FiPlus} onClick={openCreate}>Create drive</Button>}>
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input icon={FiSearch} placeholder="Search drives" value={query.search} onChange={(event) => setQuery((value) => ({ ...value, search: event.target.value, page: 1 }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.status} onChange={(event) => setQuery((value) => ({ ...value, status: event.target.value, page: 1 }))}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="registration-open">Registration Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </GlassCard>

      {drives.loading ? (
        <SkeletonLoader rows={6} />
      ) : drives.error ? (
        <ErrorState description={drives.error} />
      ) : drives.data?.length ? (
        <div className="space-y-3">
          {drives.data.map((drive) => (
            <GlassCard key={drive._id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{drive.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{drive.company?.name || "Company"} - Registration {compactDate(drive.registrationDeadline)}</p>
                  <p className="mt-2 text-xs text-slate-500">Branches {(drive.eligibility?.branches || []).join(", ") || "All"} - CGPA {drive.eligibility?.minCgpa ?? "Any"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{drive.status}</span>
                  <Button variant="secondary" icon={FiEdit2} onClick={() => openEdit(drive)}>Edit</Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No placement drives found" description="Create a drive before publishing drive-specific jobs." />
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" disabled={query.page <= 1} onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}>Previous</Button>
        <Button variant="secondary" disabled={!drives.meta?.hasNextPage} onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}>Next</Button>
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing?.mode === "edit" ? "Edit placement drive" : "Create placement drive"}
        onClose={() => setEditing(null)}
        size="wide"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="admin-drive-form" disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save drive"}</Button>
          </div>
        }
      >
        <form id="admin-drive-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(save)}>
          <Input label="Drive name" className="md:col-span-2" {...register("name", { required: "Drive name is required" })} error={formState.errors.name?.message} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Company</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("company", { required: "Company is required" })}>
              <option value="">Select company</option>
              {(companies.data || []).map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}
            </select>
          </label>
          <Input label="Registration deadline" type="date" {...register("registrationDeadline", { required: "Registration deadline is required" })} error={formState.errors.registrationDeadline?.message} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Status</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="registration-open">Registration Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <Input label="Minimum CGPA" type="number" step="0.01" min="0" max="10" {...register("minCgpa")} />
          <Input label="Branches" placeholder="CSE, ECE, IT" {...register("branches")} />
          <Input label="Batch" placeholder="2026, 2027" {...register("batch")} />
          <Input label="Interview rounds" className="md:col-span-2" placeholder="Aptitude, Technical, HR" {...register("rounds")} />
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-300">Eligibility notes</span>
            <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10" {...register("notes")} />
          </label>
        </form>
      </Modal>
    </PageContainer>
  );
}
