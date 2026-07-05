import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { adminService } from "../../services/adminService";

const emptyCompany = { name: "", website: "", description: "", industry: "", location: "", logo: "", isActive: true };

export function AdminCompaniesPage() {
  const [query, setQuery] = useState({ search: "", page: 1 });
  const [editing, setEditing] = useState(null);
  const companies = useAsyncData(() => adminService.getCompanies({ ...query, limit: 8, sort: "name" }), [query]);
  const { register, handleSubmit, reset, formState } = useForm({ defaultValues: emptyCompany });

  const openCreate = () => {
    setEditing({ mode: "create" });
    reset(emptyCompany);
  };

  const openEdit = (company) => {
    setEditing({ mode: "edit", company });
    reset({ ...emptyCompany, ...company });
  };

  const save = async (values) => {
    try {
      if (editing.mode === "edit") await adminService.updateCompany(editing.company._id, values);
      else await adminService.createCompany(values);
      toast.success(editing.mode === "edit" ? "Company updated" : "Company created");
      setEditing(null);
      companies.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const remove = async (company) => {
    if (!window.confirm(`Delete ${company.name}?`)) return;
    try {
      await adminService.deleteCompany(company._id);
      toast.success("Company deleted");
      companies.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <PageContainer eyebrow="Admin" title="Companies" description="Create, search, edit, and delete placement partner companies." actions={<Button icon={FiPlus} onClick={openCreate}>Create company</Button>}>
      <GlassCard className="mb-6">
        <Input icon={FiSearch} placeholder="Search companies" value={query.search} onChange={(event) => setQuery({ search: event.target.value, page: 1 })} />
      </GlassCard>

      {companies.loading ? (
        <SkeletonLoader rows={6} />
      ) : companies.error ? (
        <ErrorState description={companies.error} />
      ) : companies.data?.length ? (
        <div className="space-y-3">
          {companies.data.map((company) => (
            <GlassCard key={company._id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{company.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{company.industry} - {company.location || "No location"}</p>
                  {company.website ? <a className="mt-2 block text-xs text-cyan-300" href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : null}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" icon={FiEdit2} onClick={() => openEdit(company)}>Edit</Button>
                  <Button variant="danger" icon={FiTrash2} onClick={() => remove(company)}>Delete</Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No companies found" description="Create a company to begin posting jobs." />
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" disabled={query.page <= 1} onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}>Previous</Button>
        <Button variant="secondary" disabled={!companies.meta?.hasNextPage} onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}>Next</Button>
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing?.mode === "edit" ? "Edit company" : "Create company"}
        onClose={() => setEditing(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="admin-company-form" disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save company"}</Button>
          </div>
        }
      >
        <form id="admin-company-form" className="space-y-4" onSubmit={handleSubmit(save)}>
          <Input label="Name" {...register("name", { required: "Name is required" })} error={formState.errors.name?.message} />
          <Input label="Industry" {...register("industry", { required: "Industry is required" })} error={formState.errors.industry?.message} />
          <Input label="Location" {...register("location")} />
          <Input label="Website" {...register("website")} />
          <Input label="Logo URL" {...register("logo")} />
          <Input label="Description" {...register("description")} />
        </form>
      </Modal>
    </PageContainer>
  );
}
