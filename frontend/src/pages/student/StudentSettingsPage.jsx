import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/apiClient";

export function StudentSettingsPage() {
  const { user, updateProfile } = useAuth();
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      email: Boolean(user?.profile?.notifications?.email ?? true),
      interviews: Boolean(user?.profile?.notifications?.interviews ?? true),
      applications: Boolean(user?.profile?.notifications?.applications ?? true),
    },
  });

  const onSubmit = async (values) => {
    try {
      await updateProfile({ profile: { notifications: values } });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <PageContainer eyebrow="Settings" title="Student settings" description="Manage notification preferences for placement updates.">
      <GlassCard className="max-w-2xl">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {[
            ["email", "Email notifications"],
            ["interviews", "Interview reminders"],
            ["applications", "Application status updates"],
          ].map(([field, label]) => (
            <label key={field} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <span className="font-medium text-white">{label}</span>
              <input type="checkbox" className="h-5 w-5 accent-cyan-300" {...register(field)} />
            </label>
          ))}
          <Button type="submit" disabled={formState.isSubmitting}>{formState.isSubmitting ? "Saving..." : "Save settings"}</Button>
        </form>
      </GlassCard>
    </PageContainer>
  );
}
