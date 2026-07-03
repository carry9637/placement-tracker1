import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { PageContainer } from "../../components/common/PageContainer";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAuth } from "../../hooks/useAuth";
import { useAsyncData } from "../../hooks/useAsyncData";
import { studentService } from "../../services/studentService";
import { getReadinessScore } from "../../utils/studentMetrics";

export function StudentReadinessPage() {
  const { user } = useAuth();
  const applications = useAsyncData(() => studentService.getApplications({ limit: 50 }), []);
  const interviews = useAsyncData(() => studentService.getInterviews({ limit: 50 }), []);
  const skills = useAsyncData(() => studentService.getSkills({ limit: 100 }), []);
  const loading = applications.loading || interviews.loading || skills.loading;
  const error = applications.error || interviews.error || skills.error;
  const score = getReadinessScore({ user, applications: applications.data || [], interviews: interviews.data || [], skills: skills.data || [] });
  const profile = user?.profile || {};
  const chartData = [
    { subject: "Profile", value: ["phone", "college", "branch", "cgpa", "github"].filter((field) => profile[field]).length * 20 },
    { subject: "Resume", value: profile.resume?.fileName ? 100 : 0 },
    { subject: "Applications", value: Math.min((applications.data || []).length * 20, 100) },
    { subject: "Interviews", value: Math.min((interviews.data || []).length * 34, 100) },
    { subject: "Skills", value: Math.min((skills.data || []).length * 12, 100) },
  ];

  return (
    <PageContainer eyebrow="Placement readiness" title="Readiness score" description="A computed score based on your current profile, resume, applications, interviews, and skill catalog exposure.">
      {loading ? <SkeletonLoader rows={5} /> : error ? <ErrorState description={error} /> : (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <GlassCard className="grid place-items-center text-center">
            <div className="grid h-48 w-48 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10">
              <div>
                <p className="text-5xl font-semibold text-white">{score}%</p>
                <p className="mt-2 text-sm text-cyan-200">ready</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,.12)" />
                  <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
                  <Radar dataKey="value" stroke="#67e8f9" fill="#67e8f9" fillOpacity={0.28} />
                  <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
}
