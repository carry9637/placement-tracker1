import { useNavigate } from "react-router-dom";
import { FiBell, FiLogOut, FiMenu, FiSearch } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { Breadcrumb } from "../common/Breadcrumb";
import { Button } from "../ui/Button";

export function TopNavbar({ role, onMobileMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/65 backdrop-blur-2xl">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={onMobileMenu} aria-label="Open menu">
          <FiMenu />
        </button>
        <div className="hidden lg:block">
          <Breadcrumb items={[role, "dashboard"]} />
        </div>
        <div className="ml-auto hidden min-w-0 flex-1 max-w-md items-center rounded-xl border border-white/10 bg-white/[0.055] px-3 sm:flex">
          <FiSearch className="h-4 w-4 text-slate-500" />
          <input className="h-10 w-full bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search workspace" />
        </div>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium text-white">{user?.name || "Student"}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <Button variant="ghost" className="min-h-10 px-3" aria-label="Notifications">
          <FiBell />
        </Button>
        <Button variant="ghost" className="min-h-10 px-3" onClick={handleLogout} aria-label="Logout">
          <FiLogOut />
        </Button>
      </div>
    </header>
  );
}
