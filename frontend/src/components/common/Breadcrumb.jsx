import { FiChevronRight, FiHome } from "react-icons/fi";

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500">
      <FiHome className="h-4 w-4" />
      {items.map((item) => (
        <span key={item} className="flex items-center gap-2">
          <FiChevronRight className="h-3 w-3" />
          <span className="text-slate-300">{item}</span>
        </span>
      ))}
    </nav>
  );
}
