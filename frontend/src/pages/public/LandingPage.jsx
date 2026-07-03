import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiBriefcase, FiCheckCircle, FiShield } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { theme } from "../../config/theme";

const capabilities = [
  { label: "JWT protected", value: "Auth" },
  { label: "Student routes", value: "Live" },
  { label: "API connected", value: "Ready" },
  { label: "Responsive UI", value: "100%" },
];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs text-cyan-200 backdrop-blur-xl">
            <FiCheckCircle />
            Premium placement operating system
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {theme.appName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{theme.tagline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login">
              <Button icon={FiArrowRight}>Open dashboard</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Create workspace</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Role aware", FiShield],
              ["Pipeline first", FiBriefcase],
              ["Readiness based", FiCheckCircle],
            ].map(([label, Icon]) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="text-cyan-300" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <GlassCard className="relative overflow-hidden p-6">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.gradients.primary}`} />
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Placement pulse</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Live readiness view</h2>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Healthy</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((item) => (
                <GlassCard key={item.label} hover className="p-4">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-2xl font-semibold text-white">{item.value}</span>
                    <span className="text-xs text-cyan-300">Module 7</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </main>
  );
}
