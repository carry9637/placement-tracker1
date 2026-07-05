import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { roleNavigation } from "../../config/navigation";
import { theme } from "../../config/theme";
import { Button } from "../ui/Button";

export function Sidebar({ role, collapsed, onToggle }) {
  const items = roleNavigation[role] || [];

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 280 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="sticky top-0 hidden h-screen shrink-0 border-r border-white/10 bg-slate-950/70 p-4 backdrop-blur-2xl lg:block"
    >
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${theme.gradients.primary} text-sm font-black text-slate-950`}>
              P
            </div>
            {!collapsed ? <span className="text-sm font-semibold text-white">{theme.appName}</span> : null}
          </div>
          <Button variant="ghost" className="min-h-9 px-3" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </Button>
        </div>

        <nav className="space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(103,232,249,0.12)]"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          {!collapsed ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Workspace</p>
              <p className="mt-2 text-sm text-slate-300">Demo shell ready for real API integration.</p>
            </>
          ) : (
            <div className="h-8 rounded-xl bg-cyan-300/20" />
          )}
        </div>
      </div>
    </motion.aside>
  );
}
