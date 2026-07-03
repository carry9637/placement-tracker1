import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { studentService } from "../../services/studentService";

const levelScore = { beginner: 25, intermediate: 55, advanced: 80, expert: 100 };

export function StudentSkillsPage() {
  const skills = useAsyncData(() => studentService.getSkills({ limit: 100, sort: "category" }), []);
  const chartData = (skills.data || []).map((skill) => ({ name: skill.name, score: levelScore[skill.level] || 25 }));

  return (
    <PageContainer eyebrow="Skill progress" title="Skills" description="Global placement skill catalog from the backend, shown as progress bands for readiness planning.">
      {skills.loading ? <SkeletonLoader rows={5} /> : skills.error ? <ErrorState description={skills.error} /> : skills.data?.length ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <GlassCard>
            <h2 className="mb-4 font-semibold text-white">Skill level chart</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(0, 12)}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }} />
                  <Bar dataKey="score" fill="#67e8f9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          <div className="space-y-3">
            {skills.data.map((skill) => (
              <GlassCard key={skill._id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-white">{skill.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{skill.category}</p>
                  </div>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">{skill.level}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ) : <EmptyState title="No skills available" description="Admin-created skills will appear here." />}
    </PageContainer>
  );
}
