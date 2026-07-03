import { motion } from "framer-motion";

export function GlassCard({ children, className = "", hover = false }) {
  const Component = hover ? motion.div : "div";
  const motionProps = hover ? { whileHover: { y: -4, scale: 1.01 } } : {};

  return (
    <Component
      className={`rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
