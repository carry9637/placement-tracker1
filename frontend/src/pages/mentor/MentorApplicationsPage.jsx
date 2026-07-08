import { useState } from "react";
import { FiCheck, FiMessageSquare, FiSearch, FiThumbsUp } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { StatusBadge } from "../../components/student/StatusBadge";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { mentorService } from "../../services/mentorService";
import { formatMentorDate } from "../../utils/mentorMetrics";

const statusOptions = [
  ["", "All guidance statuses"],
  ["mentor-assigned", "Mentor Assigned"],
  ["mentoring-scheduled", "Mentoring Scheduled"],
  ["mentoring-completed", "Mentoring Completed"],
  ["mentor-recommended", "Mentor Recommended"],
];

export function MentorApplicationsPage() {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [workingId, setWorkingId] = useState("");
  const [commentDraft, setCommentDraft] = useState({ applicationId: "", note: "", rating: 3, visibility: "admin-visible" });

  const applications = useAsyncData(() => mentorService.getApplications({ status: filters.status, limit: 100, sort: "-updatedAt" }), [filters.status]);

  const visibleApplications = (applications.data || []).filter((application) => {
    const search = filters.search.trim().toLowerCase();
    if (!search) return true;
    return (
      application.student?.name?.toLowerCase().includes(search) ||
      application.student?.email?.toLowerCase().includes(search) ||
      application.job?.title?.toLowerCase().includes(search) ||
      application.job?.company?.name?.toLowerCase().includes(search)
    );
  });

  const updateGuidanceStatus = async (application, status, note) => {
    setWorkingId(application._id);
    try {
      await mentorService.updateApplicationStatus(application._id, { status, note });
      toast.success("Guidance status updated");
      applications.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const saveComment = async (application) => {
    if (commentDraft.note.trim().length < 5) {
      toast.error("Comment must be at least 5 characters");
      return;
    }

    setWorkingId(`comment-${application._id}`);
    try {
      await mentorService.createNote({
        student: application.student._id,
        application: application._id,
        note: commentDraft.note,
        rating: Number(commentDraft.rating),
        visibility: commentDraft.visibility,
      });
      toast.success("Mentor note added");
      setCommentDraft({ applicationId: "", note: "", rating: 3, visibility: "admin-visible" });
      applications.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Mentor guidance" title="Guidance queue" description="Guide assigned students with mentoring sessions, notes, and recommendations. Recruitment decisions stay with Admin and future Recruiter workflows.">
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <Input icon={FiSearch} placeholder="Search student, company, or job" value={filters.search} onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}>
            {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </GlassCard>

      {applications.loading ? (
        <SkeletonLoader rows={6} />
      ) : applications.error ? (
        <ErrorState description={applications.error} />
      ) : visibleApplications.length ? (
        <div className="space-y-4">
          {visibleApplications.map((application) => {
            const canSchedule = application.status === "mentor-assigned";
            const canComplete = application.status === "mentoring-scheduled";
            const canRecommend = application.status === "mentoring-completed";

            return (
              <GlassCard key={application._id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{application.student?.name || "Student"}</h2>
                    <p className="mt-1 text-sm text-slate-400">{application.job?.title || "Application"} - {application.job?.company?.name || "Company"}</p>
                    <p className="mt-2 text-xs text-slate-500">Applied {formatMentorDate(application.appliedAt)}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {(application.timeline || []).slice(-3).map((item, index) => (
                    <div key={`${item.changedAt}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <StatusBadge status={item.status} />
                      <p className="mt-3 text-sm text-slate-300">{item.note || "Status updated"}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatMentorDate(item.changedAt)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {canSchedule ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateGuidanceStatus(application, "mentoring-scheduled", "Mentoring session scheduled")}>
                      Schedule mentoring
                    </Button>
                  ) : null}
                  {canComplete ? (
                    <Button variant="secondary" icon={FiCheck} disabled={workingId === application._id} onClick={() => updateGuidanceStatus(application, "mentoring-completed", "Mentoring session completed")}>
                      Complete mentoring
                    </Button>
                  ) : null}
                  {canRecommend ? (
                    <Button variant="secondary" icon={FiThumbsUp} disabled={workingId === application._id} onClick={() => updateGuidanceStatus(application, "mentor-recommended", "Recommended by mentor for recruiter/admin review")}>
                      Recommend
                    </Button>
                  ) : null}
                  <Button variant="ghost" icon={FiMessageSquare} onClick={() => setCommentDraft({ applicationId: application._id, note: "", rating: 3, visibility: "admin-visible" })}>
                    Add note
                  </Button>
                </div>

                {commentDraft.applicationId === application._id ? (
                  <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/45 p-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Mentor note</span>
                      <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10" value={commentDraft.note} onChange={(event) => setCommentDraft((value) => ({ ...value, note: event.target.value }))} />
                    </label>
                    <div className="mt-3 grid gap-3 md:grid-cols-[120px_200px_auto]">
                      <Input label="Rating" type="number" min="1" max="5" value={commentDraft.rating} onChange={(event) => setCommentDraft((value) => ({ ...value, rating: event.target.value }))} />
                      <label>
                        <span className="mb-2 block text-sm font-medium text-slate-300">Visibility</span>
                        <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={commentDraft.visibility} onChange={(event) => setCommentDraft((value) => ({ ...value, visibility: event.target.value }))}>
                          <option value="admin-visible">Admin visible</option>
                          <option value="student-visible">Student visible</option>
                          <option value="mentor-only">Mentor only</option>
                        </select>
                      </label>
                      <div className="flex items-end gap-2">
                        <Button disabled={Boolean(workingId)} onClick={() => saveComment(application)}>Save</Button>
                        <Button variant="ghost" onClick={() => setCommentDraft({ applicationId: "", note: "", rating: 3, visibility: "admin-visible" })}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No guidance items found" description="Admin-assigned students will appear here after mentor assignment." />
      )}
    </PageContainer>
  );
}
