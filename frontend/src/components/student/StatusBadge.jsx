import { statusLabels } from "../../utils/studentMetrics";

const tones = {
  applied: "bg-sky-400/10 text-sky-200 ring-sky-300/20",
  "under-review": "bg-blue-400/10 text-blue-200 ring-blue-300/20",
  "mentor-assigned": "bg-cyan-400/10 text-cyan-200 ring-cyan-300/20",
  "mentoring-scheduled": "bg-indigo-400/10 text-indigo-200 ring-indigo-300/20",
  "mentoring-completed": "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
  "mentor-recommended": "bg-teal-400/10 text-teal-200 ring-teal-300/20",
  shortlisted: "bg-cyan-400/10 text-cyan-200 ring-cyan-300/20",
  "recruiter-review": "bg-violet-400/10 text-violet-200 ring-violet-300/20",
  "interview-round-1": "bg-indigo-400/10 text-indigo-200 ring-indigo-300/20",
  "interview-round-2": "bg-purple-400/10 text-purple-200 ring-purple-300/20",
  "hr-round": "bg-fuchsia-400/10 text-fuchsia-200 ring-fuchsia-300/20",
  selected: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
  "offer-released": "bg-green-400/10 text-green-200 ring-green-300/20",
  "offer-accepted": "bg-lime-400/10 text-lime-200 ring-lime-300/20",
  "offer-declined": "bg-orange-400/10 text-orange-200 ring-orange-300/20",
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
