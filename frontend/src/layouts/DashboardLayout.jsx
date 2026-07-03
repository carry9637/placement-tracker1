import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "../components/navigation/Sidebar";
import { TopNavbar } from "../components/navigation/TopNavbar";
import { Footer } from "../components/common/Footer";
import { roleNavigation } from "../config/navigation";

export function DashboardLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = roleNavigation[role] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(129,140,248,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a_45%,#020617)]" />
      <div className="flex">
        <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div className="min-w-0 flex-1">
          <TopNavbar role={role} onMobileMenu={() => setMobileOpen(true)} />
          <Outlet />
          <Footer />
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="h-full w-80 border-r border-white/10 bg-slate-950 p-4"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 text-lg font-semibold">PlacementOS</div>
              <div className="space-y-2">
                {items.map((item) => (
                  <a key={item.path} href={item.path} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-white/10">
                    <item.icon />
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
