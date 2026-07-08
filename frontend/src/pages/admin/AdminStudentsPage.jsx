import { useState } from "react";
import { FiCalendar, FiCheck, FiMessageSquare, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { StatusBadge } from "../../components/student/StatusBadge";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { adminService } from "../../services/adminService";
import { compactDate, getUniqueStudentsFromApplications } from "../../utils/adminMetrics";

export function AdminStudentsPage() {
  const [query, setQuery] = useState({ search: "", status: "", page: 1 });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [workingId, setWorkingId] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState({ applicationId: "", date: "", type: "technical" });
  const [feedbackDraft, setFeedbackDraft] = useState({ interviewId: "", score: "", result: "passed", feedback: "" });
  const applications = useAsyncData(() => adminService.getApplications({ status: query.status, limit: 100 }), [query.status]);
  const interviews = useAsyncData(() => adminService.getInterviews({ limit: 100, sort: "date" }), []);
  const mentors = useAsyncData(() => adminService.getUsers({ role: "mentor", isActive: true, limit: 100, sort: "name" }), []);
  const students = getUniqueStudentsFromApplications(applications.data || []).filter((student) => {
    const search = query.search.trim().toLowerCase();
    if (!search) return true;
    return student.name?.toLowerCase().includes(search) || student.email?.toLowerCase().includes(search);
  });
  const pageSize = 8;
  const visibleStudents = students.slice((query.page - 1) * pageSize, query.page * pageSize);
  const hasNextPage = query.page * pageSize < students.length;

  const refreshWorkflow = () => {
    applications.reload();
    interviews.reload();
  };

  const syncSelectedApplication = (nextApplication) => {
    setSelectedStudent((student) => {
      if (!student) return student;

      const applicationRecords = (student.applicationRecords || [])
        .map((application) => (application._id === nextApplication._id ? nextApplication : application))
        .sort((a, b) => new Date(b.updatedAt || b.appliedAt || 0) - new Date(a.updatedAt || a.appliedAt || 0));

      return {
        ...student,
        applicationRecords,
        latestApplication: applicationRecords[0],
        lastActivityAt: applicationRecords[0]?.updatedAt || applicationRecords[0]?.appliedAt,
      };
    });
  };

  const updateStatus = async (application, status, note) => {
    setWorkingId(application._id);
    try {
      const response = await adminService.updateApplicationStatus(application._id, { status, note });
      syncSelectedApplication(response.data);
      toast.success("Application status updated");
      refreshWorkflow();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const assignMentor = async (studentId, mentorId) => {
    if (!mentorId) return;

    setWorkingId(studentId);
    try {
      await adminService.assignMentor(studentId, { mentor: mentorId });
      toast.success("Mentor assigned");
      refreshWorkflow();
      setSelectedStudent((student) => (student ? { ...student, assignedMentor: (mentors.data || []).find((mentor) => mentor._id === mentorId) } : student));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const scheduleInterview = async (application) => {
    if (!scheduleDraft.date) {
      toast.error("Interview date is required");
      return;
    }

    setWorkingId(application._id);
    try {
      await adminService.createInterview({
        application: application._id,
        date: new Date(scheduleDraft.date).toISOString(),
        type: scheduleDraft.type,
      });
      toast.success("Interview scheduled");
      setScheduleDraft({ applicationId: "", date: "", type: "technical" });
      refreshWorkflow();
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
      await adminService.updateInterviewFeedback(interview._id, {
        score: feedbackDraft.score === "" ? null : Number(feedbackDraft.score),
        result: feedbackDraft.result,
        feedback: feedbackDraft.feedback,
      });
      toast.success("Interview feedback saved");
      setFeedbackDraft({ interviewId: "", score: "", result: "passed", feedback: "" });
      refreshWorkflow();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const getApplicationInterviews = (applicationId) =>
    (interviews.data || []).filter((interview) => {
      const interviewApplicationId = interview.application?._id || interview.application;
      return interviewApplicationId === applicationId;
    });

  return (
    <PageContainer eyebrow="Admin" title="Student management" description="View students from real application data and inspect their application profile.">
      <GlassCard className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <Input icon={FiSearch} placeholder="Search students" value={query.search} onChange={(event) => setQuery((value) => ({ ...value, search: event.target.value, page: 1 }))} />
          <select className="h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={query.status} onChange={(event) => setQuery((value) => ({ ...value, status: event.target.value, page: 1 }))}>
            <option value="">All application statuses</option>
            <option value="applied">Applied</option>
            <option value="under-review">Under Review</option>
            <option value="mentor-assigned">Mentor Assigned</option>
            <option value="mentoring-scheduled">Mentoring Scheduled</option>
            <option value="mentoring-completed">Mentoring Completed</option>
            <option value="mentor-recommended">Mentor Recommended</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="recruiter-review">Recruiter Review</option>
            <option value="interview-round-1">Interview Round 1</option>
            <option value="interview-round-2">Interview Round 2</option>
            <option value="hr-round">HR Round</option>
            <option value="selected">Selected</option>
            <option value="offer-released">Offer Released</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </GlassCard>

      {applications.loading ? <SkeletonLoader rows={6} /> : applications.error ? <ErrorState description={applications.error} /> : visibleStudents.length ? (
        <div className="space-y-3">
          {visibleStudents.map((student) => (
            <GlassCard key={student._id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold text-white">{student.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{student.email} - {student.applications} applications</p>
                  <p className="mt-2 text-xs text-slate-500">Last activity {compactDate(student.lastActivityAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={student.latestApplication?.status} />
                  <Button variant="secondary" onClick={() => setSelectedStudent(student)}>View profile</Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : <EmptyState title="No students found" description="Students appear here after they submit applications." />}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" disabled={query.page <= 1} onClick={() => setQuery((value) => ({ ...value, page: value.page - 1 }))}>Previous</Button>
        <Button variant="secondary" disabled={!hasNextPage} onClick={() => setQuery((value) => ({ ...value, page: value.page + 1 }))}>Next</Button>
      </div>

      <Modal open={Boolean(selectedStudent)} title={selectedStudent?.name || "Student profile"} onClose={() => setSelectedStudent(null)} size="wide">
        {selectedStudent ? (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p>Email: {selectedStudent.email}</p>
              <p className="mt-2">Role: {selectedStudent.role}</p>
              <p className="mt-2">Applications: {selectedStudent.applications}</p>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Assigned mentor</span>
                <select
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white"
                  value={selectedStudent.assignedMentor?._id || selectedStudent.assignedMentor || ""}
                  disabled={mentors.loading || workingId === selectedStudent._id}
                  onChange={(event) => assignMentor(selectedStudent._id, event.target.value)}
                >
                  <option value="">Select mentor</option>
                  {(mentors.data || []).map((mentor) => <option key={mentor._id} value={mentor._id}>{mentor.name}</option>)}
                </select>
              </label>
            </div>

            <div className="space-y-3">
              {(selectedStudent.applicationRecords || []).map((application) => {
                const applicationInterviews = getApplicationInterviews(application._id);
                const canSchedule = ["shortlisted", "recruiter-review", "interview-round-1", "interview-round-2", "hr-round"].includes(application.status);
                const hasInterviewFeedback = applicationInterviews.some((interview) => interview.result !== "pending" || interview.feedback);
                const isClosed = ["offer-received", "offer-released", "offer-accepted", "offer-declined", "rejected", "withdrawn"].includes(application.status);

                return (
                  <div key={application._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-medium text-white">{application.job?.title || "No job title"}</p>
                        <p className="mt-1 text-xs text-slate-500">Applied {compactDate(application.appliedAt)}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    {!isClosed ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {application.status === "applied" ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "under-review", "Moved to admin review")}
                          >
                            Start review
                          </Button>
                        ) : null}
                        {application.status === "under-review" ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "mentor-assigned", "Mentor assigned for guidance")}
                          >
                            Mark mentor assigned
                          </Button>
                        ) : null}
                        {application.status === "mentor-recommended" ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "shortlisted", "Shortlisted after mentor recommendation")}
                          >
                            Shortlist
                          </Button>
                        ) : null}
                        {application.status === "shortlisted" ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "recruiter-review", "Moved to recruiter review")}
                          >
                            Recruiter review
                          </Button>
                        ) : null}
                        {application.status === "recruiter-review" ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "interview-round-1", "Interview round 1 started")}
                          >
                            Round 1
                          </Button>
                        ) : null}
                        {application.status === "interview-round-1" && hasInterviewFeedback ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "interview-round-2", "Interview round 2 started")}
                          >
                            Round 2
                          </Button>
                        ) : null}
                        {application.status === "interview-round-2" && hasInterviewFeedback ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "hr-round", "HR round started")}
                          >
                            HR round
                          </Button>
                        ) : null}
                        {application.status === "hr-round" && hasInterviewFeedback ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "selected", "Candidate selected")}
                          >
                            Selected
                          </Button>
                        ) : null}
                        {application.status === "selected" ? (
                          <Button
                            variant="secondary"
                            icon={FiCheck}
                            disabled={workingId === application._id}
                            onClick={() => updateStatus(application, "offer-released", "Offer released")}
                          >
                            Release offer
                          </Button>
                        ) : null}
                        {canSchedule ? (
                          <Button
                            variant="secondary"
                            icon={FiCalendar}
                            disabled={workingId === application._id}
                            onClick={() => setScheduleDraft({ applicationId: application._id, date: "", type: "technical" })}
                          >
                            Schedule interview
                          </Button>
                        ) : null}
                        <Button
                          variant="danger"
                          icon={FiX}
                          disabled={workingId === application._id}
                          onClick={() => updateStatus(application, "rejected", "Rejected after admin review")}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : null}

                    {scheduleDraft.applicationId === application._id ? (
                      <div className="mt-4 grid gap-3 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 md:grid-cols-[1fr_180px_auto]">
                        <Input
                          label="Interview date"
                          type="datetime-local"
                          value={scheduleDraft.date}
                          onChange={(event) => setScheduleDraft((value) => ({ ...value, date: event.target.value }))}
                        />
                        <label>
                          <span className="mb-2 block text-sm font-medium text-slate-300">Type</span>
                          <select
                            className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white"
                            value={scheduleDraft.type}
                            onChange={(event) => setScheduleDraft((value) => ({ ...value, type: event.target.value }))}
                          >
                            <option value="technical">Technical</option>
                            <option value="hr">HR</option>
                            <option value="managerial">Managerial</option>
                            <option value="aptitude">Aptitude</option>
                            <option value="group-discussion">Group discussion</option>
                            <option value="other">Other</option>
                          </select>
                        </label>
                        <div className="flex items-end gap-2">
                          <Button disabled={workingId === application._id} onClick={() => scheduleInterview(application)}>Save</Button>
                          <Button variant="ghost" onClick={() => setScheduleDraft({ applicationId: "", date: "", type: "technical" })}>Cancel</Button>
                        </div>
                      </div>
                    ) : null}

                    {applicationInterviews.length ? (
                      <div className="mt-4 space-y-3">
                        {applicationInterviews.map((interview) => (
                          <div key={interview._id} className="rounded-xl border border-white/10 bg-slate-900/55 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-white">{interview.type} round - {compactDate(interview.date)}</p>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{interview.result}</span>
                            </div>
                            {interview.feedback ? <p className="mt-3 text-sm text-slate-400">{interview.feedback}</p> : null}
                            {feedbackDraft.interviewId === interview._id ? (
                              <div className="mt-3 grid gap-3 md:grid-cols-[120px_160px_1fr_auto]">
                                <Input
                                  label="Score"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={feedbackDraft.score}
                                  onChange={(event) => setFeedbackDraft((value) => ({ ...value, score: event.target.value }))}
                                />
                                <label>
                                  <span className="mb-2 block text-sm font-medium text-slate-300">Result</span>
                                  <select
                                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white"
                                    value={feedbackDraft.result}
                                    onChange={(event) => setFeedbackDraft((value) => ({ ...value, result: event.target.value }))}
                                  >
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                    <option value="on-hold">On hold</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </label>
                                <Input
                                  label="Feedback"
                                  value={feedbackDraft.feedback}
                                  onChange={(event) => setFeedbackDraft((value) => ({ ...value, feedback: event.target.value }))}
                                />
                                <div className="flex items-end gap-2">
                                  <Button disabled={workingId === interview._id} onClick={() => submitFeedback(interview)}>Save</Button>
                                  <Button variant="ghost" onClick={() => setFeedbackDraft({ interviewId: "", score: "", result: "passed", feedback: "" })}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                className="mt-3"
                                variant="secondary"
                                icon={FiMessageSquare}
                                onClick={() => setFeedbackDraft({
                                  interviewId: interview._id,
                                  score: interview.score ?? "",
                                  result: interview.result === "pending" ? "passed" : interview.result,
                                  feedback: interview.feedback || "",
                                })}
                              >
                                Add feedback
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs text-slate-500">
                        No interview is scheduled for this application.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <ErrorState title="Resume not exposed by current APIs" description="The existing application API returns student identity fields only. Resume viewing can be enabled when a user/profile admin endpoint is added." />
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
