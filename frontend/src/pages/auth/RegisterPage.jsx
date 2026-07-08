import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiMail, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/apiClient";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values);
      toast.success("Account created");
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <GlassCard className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Start clean</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create your workspace</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full name" icon={FiUser} {...register("name", { required: "Name is required" })} error={formState.errors.name?.message} />
          <Input label="Email" icon={FiMail} {...register("email", { required: "Email is required" })} error={formState.errors.email?.message} />
          <Input label="Password" type="password" {...register("password", { required: "Password is required" })} error={formState.errors.password?.message} />
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Already onboarded? <Link to="/login" className="text-white hover:text-cyan-200">Sign in</Link>
        </p>
      </GlassCard>
    </main>
  );
}
