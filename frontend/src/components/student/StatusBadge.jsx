import { statusLabels } from "../../utils/studentMetrics";

const tones = {
  applied: "bg-sky-400/10 text-sky-200 ring-sky-300/20",
  shortlisted: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/20",
  "assessment-scheduled": "bg-amber-400/10 text-amber-200 ring-amber-300/20",
  "assessment-completed": "bg-lime-400/10 text-lime-200 ring-lime-300/20",
  "interview-scheduled": "bg-indigo-400/10 text-indigo-200 ring-indigo-300/20",
  "interview-completed": "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
  "offer-received": "bg-green-400/10 text-green-200 ring-green-300/20",
  rejected: "bg-rose-400/10 text-rose-200 ring-rose-300/20",
  withdrawn: "bg-slate-400/10 text-slate-300 ring-slate-300/20",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${tones[status] || "bg-white/10 text-slate-300 ring-white/10"}`}>
      {statusLabels[status] || status}
    </span>
  );
}
