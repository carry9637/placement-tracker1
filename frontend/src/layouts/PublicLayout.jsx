import { Outlet } from "react-router-dom";
import { Footer } from "../components/common/Footer";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#020617,#111827_50%,#020617)]" />
      <Outlet />
      <Footer />
    </div>
  );
}
