import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/apiClient";
import { formatDate } from "../../utils/studentMetrics";

export function StudentProfilePage() {
  const { user, updateProfile, uploadResume } = useAuth();
  const { register, handleSubmit, reset, formState } = useForm();

  useEffect(() => {
    reset({
      name: user?.name || "",
      profile: {
        phone: user?.profile?.phone || "",
        headline: user?.profile?.headline || "",
        location: user?.profile?.location || "",
        college: user?.profile?.college || "",
        branch: user?.profile?.branch || "",
        graduationYear: user?.profile?.graduationYear || "",
        cgpa: user?.profile?.cgpa || "",
        portfolio: user?.profile?.portfolio || "",
        linkedin: user?.profile?.linkedin || "",
        github: user?.profile?.github || "",
        readinessGoal: user?.profile?.readinessGoal || "",
      },
    });
  }, [reset, user]);

  const onSubmit = async (values) => {
    try {
      await updateProfile(values);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const onResumeChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadResume(file);
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <PageContainer eyebrow="Student profile" title="Profile and resume" description="Keep your placement profile sharp for applications and mentor reviews.">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <GlassCard>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Input label="Full name" {...register("name", { required: "Name is required" })} error={formState.errors.name?.message} />
            <Input label="Phone" {...register("profile.phone")} />
            <Input label="Headline" className="md:col-span-2" {...register("profile.headline")} />
            <Input label="Location" {...register("profile.location")} />
            <Input label="College" {...register("profile.college")} />
            <Input label="Branch" {...register("profile.branch")} />
            <Input label="Graduation year" type="number" {...register("profile.graduationYear")} />
            <Input label="CGPA" type="number" step="0.01" {...register("profile.cgpa")} />
            <Input label="Portfolio" {...register("profile.portfolio")} />
            <Input label="LinkedIn" {...register("profile.linkedin")} />
            <Input label="GitHub" {...register("profile.github")} />
            <Input label="Readiness goal" className="md:col-span-2" {...register("profile.readinessGoal")} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </GlassCard>

        <GlassCard>
          <h2 className="font-semibold text-white">Resume upload</h2>
          <p className="mt-2 text-sm text-slate-400">Upload PDF, DOC, or DOCX. The backend stores file metadata for now.</p>
          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center hover:bg-white/[0.07]">
            <FiUpload className="mb-3 h-8 w-8 text-cyan-300" />
            <span className="text-sm font-medium text-white">Choose resume</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onResumeChange} />
          </label>
          {user?.profile?.resume?.fileName ? (
            <div className="mt-5 rounded-2xl bg-slate-950/50 p-4">
              <p className="text-sm font-medium text-white">{user.profile.resume.fileName}</p>
              <p className="mt-1 text-xs text-slate-500">Uploaded {formatDate(user.profile.resume.uploadedAt)}</p>
            </div>
          ) : null}
        </GlassCard>
      </div>
    </PageContainer>
  );
}
