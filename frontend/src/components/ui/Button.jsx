import { motion } from "framer-motion";

const variants = {
  primary: "bg-cyan-200 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.18)] hover:bg-white",
  secondary: "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15 hover:ring-cyan-300/30",
  ghost: "bg-transparent text-slate-300 hover:bg-white/10 hover:text-white",
  danger: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/25 hover:bg-rose-500/25",
};

export function Button({ children, variant = "primary", className = "", icon: Icon, type = "button", ...props }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </motion.button>
  );
}
