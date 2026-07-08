import { useState } from "react";
import { FiEdit2, FiFileText, FiMessageSquare, FiSearch, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { StatusBadge } from "../../components/student/StatusBadge";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getApiErrorMessage } from "../../services/apiClient";
import { mentorService } from "../../services/mentorService";
import {
  formatMentorDate,
  getAssignedStudents,
  getReadinessScoreForStudent,
  getSkillSignals,
  getStudentInterviews,
} from "../../utils/mentorMetrics";

const emptyNote = { note: "", rating: 3, visibility: "admin-visible", application: "" };

const resumeSize = (size) => {
  if (!size) return "Size unavailable";
  return `${Math.max(size / 1024, 1).toFixed(1)} KB`;
};

export function MentorStudentsPage() {
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [noteDraft, setNoteDraft] = useState(emptyNote);
  const [editingNoteId, setEditingNoteId] = useState("");
  const [workingId, setWorkingId] = useState("");

  const applications = useAsyncData(() => mentorService.getApplications({ limit: 100, sort: "-updatedAt" }), []);
  const interviews = useAsyncData(() => mentorService.getInterviews({ limit: 100, sort: "date" }), []);
  const notes = useAsyncData(() => mentorService.getNotes({ limit: 100, sort: "-updatedAt" }), []);
  const skills = useAsyncData(() => mentorService.getSkills({ limit: 100, sort: "category" }), []);

  const loading = applications.loading || interviews.loading || notes.loading || skills.loading;
  const error = applications.error || interviews.error || notes.error || skills.error;
  const students = getAssignedStudents(applications.data || []).filter((student) => {
    const value = query.trim().toLowerCase();
    if (!value) return true;
    return student.name?.toLowerCase().includes(value) || student.email?.toLowerCase().includes(value);
  });
  const selectedStudent = students.find((student) => student._id === selectedStudentId) || null;
  const selectedNotes = (notes.data || []).filter((note) => note.student?._id === selectedStudent?._id);
  const selectedInterviews = getStudentInterviews(selectedStudent, interviews.data || []);
  const selectedSkills = getSkillSignals(selectedStudent?.applicationRecords || [], skills.data || []);
  const readinessScore = getReadinessScoreForStudent({
    student: selectedStudent,
    applications: selectedStudent?.applicationRecords || [],
    interviews: selectedInterviews,
    skills: skills.data || [],
  });

  const resetNoteDraft = () => {
    setNoteDraft(emptyNote);
    setEditingNoteId("");
  };

  const saveNote = async () => {
    if (!selectedStudent) return;
    if (noteDraft.note.trim().length < 5) {
      toast.error("Note must be at least 5 characters");
      return;
    }

    const payload = {
      student: selectedStudent._id,
      note: noteDraft.note,
      rating: Number(noteDraft.rating),
      visibility: noteDraft.visibility,
      application: noteDraft.application || null,
    };

    setWorkingId(editingNoteId || "new-note");
    try {
      if (editingNoteId) {
        await mentorService.updateNote(editingNoteId, payload);
        toast.success("Note updated");
      } else {
        await mentorService.createNote(payload);
        toast.success("Note created");
      }
      resetNoteDraft();
      notes.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const editNote = (note) => {
    setEditingNoteId(note._id);
    setNoteDraft({
      note: note.note,
      rating: note.rating,
      visibility: note.visibility,
      application: note.application?._id || note.application || "",
    });
  };

  const deleteNote = async (noteId) => {
    setWorkingId(noteId);
    try {
      await mentorService.deleteNote(noteId);
      toast.success("Note deleted");
      notes.reload();
      if (editingNoteId === noteId) resetNoteDraft();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Assigned students" title="Student guidance" description="Review profiles, resumes, readiness, applications, and mentor note history.">
      <GlassCard className="mb-6">
        <Input icon={FiSearch} placeholder="Search assigned students" value={query} onChange={(event) => setQuery(event.target.value)} />
      </GlassCard>

      {loading ? (
        <SkeletonLoader rows={6} />
      ) : error ? (
        <ErrorState description={error} />
      ) : students.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {students.map((student) => {
            const studentInterviews = getStudentInterviews(student, interviews.data || []);
            const score = getReadinessScoreForStudent({
              student,
              applications: student.applicationRecords || [],
              interviews: studentInterviews,
              skills: skills.data || [],
            });

            return (
              <GlassCard key={student._id} hover>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{student.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{student.email}</p>
                    <p className="mt-2 text-xs text-slate-500">{student.applications} applications - {studentInterviews.length} interviews</p>
                  </div>
                  <StatusBadge status={student.latestApplication?.status} />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Placement readiness</span>
                    <span>{score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300" style={{ width: `${score}%` }} />
                  </div>
                </div>
                <Button className="mt-5" variant="secondary" onClick={() => setSelectedStudentId(student._id)}>View profile</Button>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No assigned students found" description="Students appear here after they submit applications for mentor review." />
      )}

      <Modal open={Boolean(selectedStudent)} title={selectedStudent?.name || "Student profile"} onClose={() => { setSelectedStudentId(""); resetNoteDraft(); }} size="xl">
        {selectedStudent ? (
          <div className="space-y-6 text-sm text-slate-300">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <h3 className="font-semibold text-white">Profile</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <p>Email: {selectedStudent.email}</p>
                  <p>Phone: {selectedStudent.profile?.phone || "Not set"}</p>
                  <p>College: {selectedStudent.profile?.college || "Not set"}</p>
                  <p>Branch: {selectedStudent.profile?.branch || "Not set"}</p>
                  <p>Graduation: {selectedStudent.profile?.graduationYear || "Not set"}</p>
                  <p>CGPA: {selectedStudent.profile?.cgpa || "Not set"}</p>
                  <p className="sm:col-span-2">Headline: {selectedStudent.profile?.headline || "Not set"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center gap-2 text-white">
                  <FiFileText className="text-cyan-300" />
                  <h3 className="font-semibold">Resume</h3>
                </div>
                {selectedStudent.profile?.resume?.fileName ? (
                  <div className="mt-4 space-y-2">
                    <p>{selectedStudent.profile.resume.fileName}</p>
                    <p className="text-xs text-slate-500">{resumeSize(selectedStudent.profile.resume.size)}</p>
                    <p className="text-xs text-slate-500">Uploaded {formatMentorDate(selectedStudent.profile.resume.uploadedAt)}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-slate-500">No resume uploaded yet.</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-center">
                <p className="text-5xl font-semibold text-white">{readinessScore}%</p>
                <p className="mt-2 text-sm text-cyan-100">placement readiness</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <h3 className="font-semibold text-white">Skills</h3>
                {selectedSkills.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span key={skill._id} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                        {skill.name} - {skill.level}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-slate-500">No skill signals found for this student yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <h3 className="font-semibold text-white">Applications</h3>
              <div className="mt-4 space-y-3">
                {(selectedStudent.applicationRecords || []).map((application) => (
                  <div key={application._id} className="rounded-xl border border-white/10 bg-slate-900/55 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{application.job?.title || "No job title"}</p>
                        <p className="mt-1 text-xs text-slate-500">{application.job?.company?.name || "Company"} - Applied {formatMentorDate(application.appliedAt)}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    {application.remarks ? <p className="mt-3 text-slate-400">{application.remarks}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <FiMessageSquare className="text-cyan-300" />
                  <h3 className="font-semibold text-white">{editingNoteId ? "Edit note" : "Create note"}</h3>
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Note</span>
                    <textarea
                      className="min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10"
                      value={noteDraft.note}
                      onChange={(event) => setNoteDraft((value) => ({ ...value, note: event.target.value }))}
                      placeholder="Capture coaching context or application comments"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Rating" type="number" min="1" max="5" value={noteDraft.rating} onChange={(event) => setNoteDraft((value) => ({ ...value, rating: event.target.value }))} />
                    <label>
                      <span className="mb-2 block text-sm font-medium text-slate-300">Visibility</span>
                      <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={noteDraft.visibility} onChange={(event) => setNoteDraft((value) => ({ ...value, visibility: event.target.value }))}>
                        <option value="admin-visible">Admin visible</option>
                        <option value="student-visible">Student visible</option>
                        <option value="mentor-only">Mentor only</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-300">Application</span>
                    <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={noteDraft.application} onChange={(event) => setNoteDraft((value) => ({ ...value, application: event.target.value }))}>
                      <option value="">General student note</option>
                      {(selectedStudent.applicationRecords || []).map((application) => (
                        <option key={application._id} value={application._id}>{application.job?.title || "Application"}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button icon={FiMessageSquare} disabled={Boolean(workingId)} onClick={saveNote}>{editingNoteId ? "Update note" : "Create note"}</Button>
                    {editingNoteId ? <Button variant="ghost" onClick={resetNoteDraft}>Cancel</Button> : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <h3 className="font-semibold text-white">Note timeline</h3>
                {selectedNotes.length ? (
                  <div className="mt-4 space-y-3">
                    {selectedNotes.map((note) => (
                      <div key={note._id} className="rounded-xl border border-white/10 bg-slate-900/55 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-white">Rating {note.rating}/5 - {note.visibility}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatMentorDate(note.updatedAt || note.createdAt)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" className="min-h-9 px-3" icon={FiEdit2} onClick={() => editNote(note)}>Edit</Button>
                            <Button variant="danger" className="min-h-9 px-3" icon={FiTrash2} disabled={workingId === note._id} onClick={() => deleteNote(note._id)}>Delete</Button>
                          </div>
                        </div>
                        <p className="mt-3 text-slate-300">{note.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No notes yet" description="Create the first mentor note for this student." />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
