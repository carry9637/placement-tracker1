import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiBriefcase, FiFileText, FiMessageSquare, FiStar, FiTarget } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { StatusBadge } from "../../components/student/StatusBadge";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { recruiterService } from "../../services/recruiterService";
import { statusLabels } from "../../utils/studentMetrics";
import {
  formatRecruiterDate,
  formatRecruiterDateTime,
  getCandidateReadinessScore,
  getLatestMentorRecommendation,
} from "../../utils/recruiterMetrics";

export function RecruiterCandidateDetailsPage() {
  const { applicationId } = useParams();
  const application = useAsyncData(() => recruiterService.getApplication(applicationId), [applicationId]);
  const interviews = useAsyncData(() => recruiterService.getInterviews({ application: applicationId, limit: 50, sort: "date" }), [applicationId]);
  const loading = application.loading || interviews.loading;
  const error = application.error || interviews.error;
  const candidateApplication = application.data;
  const candidate = candidateApplication?.student;
  const profile = candidate?.profile || {};
  const resume = profile.resume || {};
  const mentorRecommendation = getLatestMentorRecommendation(candidateApplication);
  const readiness = getCandidateReadinessScore(candidateApplication, interviews.data || []);

  return (
    <PageContainer
      eyebrow="Candidate details"
      title={candidate?.name || "Candidate"}
      description="Company-scoped profile, placement readiness, mentor signal, timeline, and interview history."
      actions={<Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15" to="/recruiter/applications"><FiArrowLeft />Back</Link>}
    >
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : error ? (
        <ErrorState description={error} />
      ) : !candidateApplication ? (
        <EmptyState title="Candidate not found" description="The candidate may not belong to your company pipeline." />
      ) : (
        <div className="space-y-6">
          <GlassCard>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{candidate?.name || "Candidate"}</h2>
                <p className="mt-1 text-sm text-slate-400">{candidate?.email}</p>
                <p className="mt-3 text-sm text-slate-300">{profile.headline || "No headline added"}</p>
              </div>
              <StatusBadge status={candidateApplication.status} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiBriefcase className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">Role</p>
                <p className="mt-1 font-medium text-white">{candidateApplication.job?.title || "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiTarget className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">Readiness</p>
                <p className="mt-1 font-medium text-white">{readiness}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiStar className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">CGPA</p>
                <p className="mt-1 font-medium text-white">{profile.cgpa ?? "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <FiFileText className="mb-3 text-cyan-200" />
                <p className="text-sm text-slate-400">Resume</p>
                <p className="mt-1 break-words font-medium text-white">{resume.fileName || "Not uploaded"}</p>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Profile</h2>
              <div className="space-y-3 text-sm text-slate-300">
                <p>College: {profile.college || "Not set"}</p>
                <p>Branch: {profile.branch || "Not set"}</p>
                <p>Graduation year: {profile.graduationYear || "Not set"}</p>
                <p>Location: {profile.location || "Not set"}</p>
                <p>LinkedIn: {profile.linkedin || "Not set"}</p>
                <p>GitHub: {profile.github || "Not set"}</p>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Skills for this role</h2>
              {(candidateApplication.job?.requiredSkills || []).length ? (
                <div className="flex flex-wrap gap-2">
                  {candidateApplication.job.requiredSkills.map((skill) => (
                    <span key={skill._id || skill.name} className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 ring-1 ring-cyan-300/20">
                      {skill.name} {skill.level ? `- ${skill.level}` : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState title="No skills listed" description="This job does not expose required skills yet." />
              )}
            </GlassCard>
          </div>

          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <FiMessageSquare className="text-cyan-200" />
              <h2 className="font-semibold text-white">Mentor recommendation</h2>
            </div>
            {mentorRecommendation ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm leading-6 text-slate-300">{mentorRecommendation.note}</p>
                <p className="mt-3 text-xs text-slate-500">Rating {mentorRecommendation.rating}/5 - {formatRecruiterDate(mentorRecommendation.createdAt)}</p>
              </div>
            ) : (
              <EmptyState title="No mentor recommendation" description="Visible mentor notes and recommendations will appear here." />
            )}
          </GlassCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Placement timeline</h2>
              {(candidateApplication.timeline || []).length ? (
                <div className="space-y-3">
                  {candidateApplication.timeline.map((item, index) => (
                    <div key={`${item.status}-${item.changedAt || index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-medium text-white">{statusLabels[item.status] || item.status}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.note || "Status updated"}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatRecruiterDateTime(item.changedAt)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No timeline yet" description="Application movement will appear here." />
              )}
            </GlassCard>

            <GlassCard>
              <h2 className="mb-4 font-semibold text-white">Interview history</h2>
              {(interviews.data || []).length ? (
                <div className="space-y-3">
                  {interviews.data.map((interview) => (
                    <div key={interview._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{interview.type}</p>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{interview.result}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{formatRecruiterDateTime(interview.date)}</p>
                      {interview.feedback ? <p className="mt-3 text-sm text-slate-300">{interview.feedback}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No interviews yet" description="Scheduled company interviews will appear here." />
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
