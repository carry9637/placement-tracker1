import { useState } from "react";
import { FiCheckCircle, FiMessageSquare, FiThumbsUp } from "react-icons/fi";
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
import { formatMentorDateTime } from "../../utils/mentorMetrics";

export function MentorInterviewsPage() {
  const [workingId, setWorkingId] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState({ applicationId: "", note: "", rating: 4, visibility: "admin-visible" });
  const applications = useAsyncData(() => mentorService.getApplications({ limit: 100, sort: "-updatedAt" }), []);
  const sessions = (applications.data || []).filter((application) => ["mentoring-scheduled", "mentoring-completed", "mentor-recommended"].includes(application.status));

  const updateStatus = async (application, status, note) => {
    setWorkingId(application._id);
    try {
      await mentorService.updateApplicationStatus(application._id, { status, note });
      toast.success("Session updated");
      applications.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const saveFeedback = async (application) => {
    if (feedbackDraft.note.trim().length < 5) {
      toast.error("Feedback must be at least 5 characters");
      return;
    }

    setWorkingId(`feedback-${application._id}`);
    try {
      await mentorService.createNote({
        student: application.student._id,
        application: application._id,
        note: feedbackDraft.note,
        rating: Number(feedbackDraft.rating),
        visibility: feedbackDraft.visibility,
      });
      toast.success("Session feedback saved");
      setFeedbackDraft({ applicationId: "", note: "", rating: 4, visibility: "admin-visible" });
      applications.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Mentor sessions" title="Guidance sessions" description="Track mentoring sessions, resume review feedback, mock guidance, and recommendations.">
      {applications.loading ? (
        <SkeletonLoader rows={6} />
      ) : applications.error ? (
        <ErrorState description={applications.error} />
      ) : sessions.length ? (
        <div className="space-y-4">
          {sessions.map((application) => (
            <GlassCard key={application._id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{application.student?.name || "Student"}</h2>
                  <p className="mt-1 text-sm text-slate-400">{application.job?.title || "Application"} - {application.job?.company?.name || "Company"}</p>
                  <p className="mt-2 text-xs text-cyan-200">Last updated {formatMentorDateTime(application.updatedAt)}</p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {application.status === "mentoring-scheduled" ? (
                  <Button variant="secondary" icon={FiCheckCircle} disabled={workingId === application._id} onClick={() => updateStatus(application, "mentoring-completed", "Mentoring session completed")}>
                    Mark completed
                  </Button>
                ) : null}
                {application.status === "mentoring-completed" ? (
                  <Button variant="secondary" icon={FiThumbsUp} disabled={workingId === application._id} onClick={() => updateStatus(application, "mentor-recommended", "Recommended by mentor")}>
                    Recommend
                  </Button>
                ) : null}
                <Button variant="ghost" icon={FiMessageSquare} onClick={() => setFeedbackDraft({ applicationId: application._id, note: "", rating: 4, visibility: "admin-visible" })}>
                  Add feedback
                </Button>
              </div>

              {feedbackDraft.applicationId === application._id ? (
                <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/45 p-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Session feedback</span>
                    <textarea className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10" value={feedbackDraft.note} onChange={(event) => setFeedbackDraft((value) => ({ ...value, note: event.target.value }))} />
                  </label>
                  <div className="mt-3 grid gap-3 md:grid-cols-[120px_200px_auto]">
                    <Input label="Rating" type="number" min="1" max="5" value={feedbackDraft.rating} onChange={(event) => setFeedbackDraft((value) => ({ ...value, rating: event.target.value }))} />
                    <label>
                      <span className="mb-2 block text-sm font-medium text-slate-300">Visibility</span>
                      <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={feedbackDraft.visibility} onChange={(event) => setFeedbackDraft((value) => ({ ...value, visibility: event.target.value }))}>
                        <option value="admin-visible">Admin visible</option>
                        <option value="student-visible">Student visible</option>
                        <option value="mentor-only">Mentor only</option>
                      </select>
                    </label>
                    <div className="flex items-end gap-2">
                      <Button disabled={Boolean(workingId)} onClick={() => saveFeedback(application)}>Save</Button>
                      <Button variant="ghost" onClick={() => setFeedbackDraft({ applicationId: "", note: "", rating: 4, visibility: "admin-visible" })}>Cancel</Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No mentoring sessions yet" description="Schedule mentoring from the guidance queue after Admin assigns students to you." />
      )}
    </PageContainer>
  );
}
