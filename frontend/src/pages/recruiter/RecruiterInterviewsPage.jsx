import { useState } from "react";
import { FiCalendar, FiEdit2, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { recruiterService } from "../../services/recruiterService";
import { formatRecruiterDateTime, interviewTypeOptions } from "../../utils/recruiterMetrics";

export function RecruiterInterviewsPage() {
  const [workingId, setWorkingId] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({ applicationId: "", date: "", type: "technical" });
  const [editingDraft, setEditingDraft] = useState({ interviewId: "", date: "", type: "technical" });
  const [feedbackDraft, setFeedbackDraft] = useState({ interviewId: "", score: "", result: "passed", feedback: "" });
  const interviews = useAsyncData(() => recruiterService.getInterviews({ limit: 100, sort: "date" }), []);
  const applications = useAsyncData(() => recruiterService.getApplications({ limit: 100, sort: "-updatedAt" }), []);
  const loading = interviews.loading || applications.loading;
  const error = interviews.error || applications.error;
  const schedulableApplications = (applications.data || []).filter((application) => ["shortlisted", "recruiter-review", "interview-round-1", "interview-round-2", "hr-round"].includes(application.status));

  const refresh = () => {
    interviews.reload();
    applications.reload();
  };

  const scheduleInterview = async () => {
    if (!scheduleDraft.applicationId || !scheduleDraft.date) {
      toast.error("Candidate and interview date are required");
      return;
    }

    setWorkingId("new");
    try {
      await recruiterService.createInterview({
        application: scheduleDraft.applicationId,
        date: new Date(scheduleDraft.date).toISOString(),
        type: scheduleDraft.type,
      });
      toast.success("Interview scheduled");
      setScheduleDraft({ applicationId: "", date: "", type: "technical" });
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const updateInterview = async (interview) => {
    if (!editingDraft.date) {
      toast.error("Interview date is required");
      return;
    }

    setWorkingId(interview._id);
    try {
      await recruiterService.updateInterview(interview._id, {
        date: new Date(editingDraft.date).toISOString(),
        type: editingDraft.type,
      });
      toast.success("Interview updated");
      setEditingDraft({ interviewId: "", date: "", type: "technical" });
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const submitFeedback = async (interview) => {
    if (!feedbackDraft.feedback.trim()) {
      toast.error("Feedback is required");
      return;
    }

    setWorkingId(interview._id);
    try {
      await recruiterService.updateInterviewFeedback(interview._id, {
        score: feedbackDraft.score === "" ? null : Number(feedbackDraft.score),
        result: feedbackDraft.result,
        feedback: feedbackDraft.feedback,
      });
      toast.success("Feedback saved");
      setFeedbackDraft({ interviewId: "", score: "", result: "passed", feedback: "" });
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Recruiter" title="Interviews" description="Schedule company rounds, update interview details, and submit structured feedback.">
      <GlassCard className="mb-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Candidate</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={scheduleDraft.applicationId} onChange={(event) => setScheduleDraft((value) => ({ ...value, applicationId: event.target.value }))}>
              <option value="">Select application</option>
              {schedulableApplications.map((application) => <option key={application._id} value={application._id}>{application.student?.name} - {application.job?.title}</option>)}
            </select>
          </label>
          <Input label="Date" type="datetime-local" value={scheduleDraft.date} onChange={(event) => setScheduleDraft((value) => ({ ...value, date: event.target.value }))} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Type</span>
            <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={scheduleDraft.type} onChange={(event) => setScheduleDraft((value) => ({ ...value, type: event.target.value }))}>
              {interviewTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <Button icon={FiCalendar} disabled={workingId === "new"} onClick={scheduleInterview}>Schedule</Button>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <SkeletonLoader rows={6} />
      ) : error ? (
        <ErrorState description={error} />
      ) : interviews.data?.length ? (
        <div className="space-y-3">
          {interviews.data.map((interview) => (
            <GlassCard key={interview._id} className="p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{interview.application?.student?.name || "Candidate"}</h2>
                  <p className="mt-1 text-sm text-slate-400">{interview.application?.job?.title || "Role"} - {interview.type}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatRecruiterDateTime(interview.date)}</p>
                </div>
                <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{interview.result}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" icon={FiEdit2} onClick={() => setEditingDraft({ interviewId: interview._id, date: interview.date ? new Date(interview.date).toISOString().slice(0, 16) : "", type: interview.type })}>Edit details</Button>
                <Button variant="secondary" icon={FiMessageSquare} onClick={() => setFeedbackDraft({ interviewId: interview._id, score: interview.score ?? "", result: interview.result === "pending" ? "passed" : interview.result, feedback: interview.feedback || "" })}>Feedback</Button>
              </div>

              {editingDraft.interviewId === interview._id ? (
                <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-slate-950/45 p-3 md:grid-cols-[1fr_180px_auto]">
                  <Input label="Date" type="datetime-local" value={editingDraft.date} onChange={(event) => setEditingDraft((value) => ({ ...value, date: event.target.value }))} />
                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-300">Type</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={editingDraft.type} onChange={(event) => setEditingDraft((value) => ({ ...value, type: event.target.value }))}>
                      {interviewTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <div className="flex items-end gap-2">
                    <Button disabled={workingId === interview._id} onClick={() => updateInterview(interview)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingDraft({ interviewId: "", date: "", type: "technical" })}>Cancel</Button>
                  </div>
                </div>
              ) : null}

              {feedbackDraft.interviewId === interview._id ? (
                <div className="mt-4 grid gap-3 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 lg:grid-cols-[120px_160px_1fr_auto]">
                  <Input label="Score" type="number" min="0" max="100" value={feedbackDraft.score} onChange={(event) => setFeedbackDraft((value) => ({ ...value, score: event.target.value }))} />
                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-300">Result</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={feedbackDraft.result} onChange={(event) => setFeedbackDraft((value) => ({ ...value, result: event.target.value }))}>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="on-hold">On hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                  <Input label="Feedback" value={feedbackDraft.feedback} onChange={(event) => setFeedbackDraft((value) => ({ ...value, feedback: event.target.value }))} />
                  <div className="flex items-end gap-2">
                    <Button disabled={workingId === interview._id} onClick={() => submitFeedback(interview)}>Save</Button>
                    <Button variant="ghost" onClick={() => setFeedbackDraft({ interviewId: "", score: "", result: "passed", feedback: "" })}>Cancel</Button>
                  </div>
                </div>
              ) : null}
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No interviews yet" description="Schedule interviews for shortlisted or recruiter-review candidates." />
      )}
    </PageContainer>
  );
}
