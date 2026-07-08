import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/apiClient";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async (values) => {
    try {
      const user = await login({ email: values.email, password: values.password });
      toast.success("Signed in successfully");
      navigate(location.state?.from || `/${user.role}/dashboard`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <GlassCard className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Welcome back</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to PlacementOS</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" icon={FiMail} {...register("email", { required: "Email is required" })} error={formState.errors.email?.message} />
          <Input label="Password" type="password" icon={FiLock} {...register("password", { required: "Password is required" })} error={formState.errors.password?.message} />
          <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <Link to="/forgot-password" className="hover:text-white">Forgot password?</Link>
          <Link to="/register" className="hover:text-white">Create account</Link>
        </div>
      </GlassCard>
    </main>
  );
}
