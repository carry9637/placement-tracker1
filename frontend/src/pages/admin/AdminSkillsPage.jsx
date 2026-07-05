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

const emptySkill = { name: "", category: "other", level: "beginner", isActive: true };
const categories = ["programming", "frontend", "backend", "database", "devops", "cloud", "data", "ai-ml", "soft-skill", "domain", "other"];
const levels = ["beginner", "intermediate", "advanced", "expert"];

export function AdminSkillsPage() {
  const [query, setQuery] = useState({ search: "", category: "", level: "", page: 1 });
  const [editing, setEditing] = useState(null);
  const skills = useAsyncData(() => adminService.getSkills({ ...query, limit: 10, sort: "name" }), [query]);
  const { register, handleSubmit, reset, formState } = useForm({ defaultValues: emptySkill });

  const openCreate = () => { setEditing({ mode: "create" }); reset(emptySkill); };
  const openEdit = (skill) => { setEditing({ mode: "edit", skill }); reset({ ...emptySkill, ...skill }); };
  const save = async (values) => {
    try {
      if (editing.mode === "edit") await adminService.updateSkill(editing.skill._id, values);
      else await adminService.createSkill(values);
      toast.success(editing.mode === "edit" ? "Skill updated" : "Skill created");
      setEditing(null);
      skills.reload();
    } catch (error) { toast.error(getApiErrorMessage(error)); }
  };
  const remove = async (skill) => {
    if (!window.confirm(`Delete ${skill.name}?`)) return;
    try { await adminService.deleteSkill(skill._id); toast.success("Skill deleted"); skills.reload(); }
    catch (error) { toast.error(getApiErrorMessage(error)); }
  };

  return (
    <PageContainer eyebrow="Admin" title="Skills" description="Maintain the skill catalog used by jobs and readiness screens." actions={<Button icon={FiPlus} onClick={openCreate}>Create skill</Button>}>
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Input icon={FiSearch} placeholder="Search skills" value={query.search} onChange={(event) => setQuery((value) => ({ ...value, search: event.target.value, page: 1 }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.category} onChange={(event) => setQuery((value) => ({ ...value, category: event.target.value, page: 1 }))}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.level} onChange={(event) => setQuery((value) => ({ ...value, level: event.target.value, page: 1 }))}>
            <option value="">All levels</option>
            {levels.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
      </GlassCard>

      {skills.loading ? <SkeletonLoader rows={6} /> : skills.error ? <ErrorState description={skills.error} /> : skills.data?.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {skills.data.map((skill) => (
            <GlassCard key={skill._id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-white">{skill.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{skill.category} - {skill.level}</p>
                </div>
                <div className="flex gap-2"><Button variant="secondary" icon={FiEdit2} onClick={() => openEdit(skill)}>Edit</Button><Button variant="danger" icon={FiTrash2} onClick={() => remove(skill)}>Delete</Button></div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : <EmptyState title="No skills found" description="Create skills for job requirements and readiness tracking." />}

      <Modal
        open={Boolean(editing)}
        title={editing?.mode === "edit" ? "Edit skill" : "Create skill"}
        onClose={() => setEditing(null)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="admin-skill-form" disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save skill"}</Button>
          </div>
        }
      >
        <form id="admin-skill-form" className="space-y-4" onSubmit={handleSubmit(save)}>
          <Input label="Name" {...register("name", { required: "Name is required" })} error={formState.errors.name?.message} />
          <label><span className="mb-2 block text-sm font-medium text-slate-300">Category</span><select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("category")}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label><span className="mb-2 block text-sm font-medium text-slate-300">Level</span><select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" {...register("level")}>{levels.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
        </form>
      </Modal>
    </PageContainer>
  );
}
