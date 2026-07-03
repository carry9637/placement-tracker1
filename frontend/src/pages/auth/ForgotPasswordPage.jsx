import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = () => toast.info("Password reset UI is ready for backend wiring");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <GlassCard className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Account recovery</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Enter your email and the production flow will send a secure reset link.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" icon={FiMail} {...register("email", { required: "Email is required" })} error={formState.errors.email?.message} />
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
        <Link to="/login" className="mt-6 block text-sm text-slate-400 hover:text-white">Back to login</Link>
      </GlassCard>
    </main>
  );
}
