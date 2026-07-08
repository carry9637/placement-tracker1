import { useMemo, useState } from "react";
import { FiEdit2, FiMessageSquare, FiSearch, FiTrash2 } from "react-icons/fi";
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
import { mentorService } from "../../services/mentorService";
import { formatMentorDateTime, getAssignedStudents } from "../../utils/mentorMetrics";

const emptyDraft = { student: "", application: "", note: "", rating: 3, visibility: "admin-visible" };

export function MentorNotesPage() {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [editingNoteId, setEditingNoteId] = useState("");
  const [workingId, setWorkingId] = useState("");

  const applications = useAsyncData(() => mentorService.getApplications({ limit: 100, sort: "-updatedAt" }), []);
  const notes = useAsyncData(() => mentorService.getNotes({ limit: 100, sort: "-updatedAt" }), []);
  const students = getAssignedStudents(applications.data || []);
  const selectedStudent = students.find((student) => student._id === draft.student);
  const studentApplications = selectedStudent?.applicationRecords || [];

  const visibleNotes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (notes.data || []).filter((note) => {
      if (!search) return true;
      return (
        note.student?.name?.toLowerCase().includes(search) ||
        note.student?.email?.toLowerCase().includes(search) ||
        note.note?.toLowerCase().includes(search) ||
        note.application?.job?.title?.toLowerCase().includes(search)
      );
    });
  }, [notes.data, query]);

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingNoteId("");
  };

  const saveNote = async () => {
    if (!draft.student) {
      toast.error("Select a student");
      return;
    }
    if (draft.note.trim().length < 5) {
      toast.error("Note must be at least 5 characters");
      return;
    }

    const payload = {
      student: draft.student,
      application: draft.application || null,
      note: draft.note,
      rating: Number(draft.rating),
      visibility: draft.visibility,
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
      resetDraft();
      notes.reload();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  const editNote = (note) => {
    const studentId = note.student?._id || note.student || "";
    setEditingNoteId(note._id);
    setDraft({
      student: studentId,
      application: note.application?._id || note.application || "",
      note: note.note,
      rating: note.rating,
      visibility: note.visibility,
    });
  };

  const deleteNote = async (noteId) => {
    setWorkingId(noteId);
    try {
      await mentorService.deleteNote(noteId);
      toast.success("Note deleted");
      notes.reload();
      if (editingNoteId === noteId) resetDraft();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setWorkingId("");
    }
  };

  return (
    <PageContainer eyebrow="Mentor notes" title="Notes timeline" description="Create, edit, delete, and audit mentor notes across assigned students.">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <FiMessageSquare className="text-cyan-300" />
            <h2 className="font-semibold text-white">{editingNoteId ? "Edit note" : "Create note"}</h2>
          </div>
          {applications.loading ? (
            <SkeletonLoader rows={4} />
          ) : applications.error ? (
            <ErrorState description={applications.error} />
          ) : (
            <div className="space-y-3">
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-300">Student</span>
                <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={draft.student} onChange={(event) => setDraft((value) => ({ ...value, student: event.target.value, application: "" }))}>
                  <option value="">Select assigned student</option>
                  {students.map((student) => <option key={student._id} value={student._id}>{student.name}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-300">Application</span>
                <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={draft.application} onChange={(event) => setDraft((value) => ({ ...value, application: event.target.value }))} disabled={!draft.student}>
                  <option value="">General student note</option>
                  {studentApplications.map((application) => (
                    <option key={application._id} value={application._id}>{application.job?.title || "Application"}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Note</span>
                <textarea className="min-h-32 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10" value={draft.note} onChange={(event) => setDraft((value) => ({ ...value, note: event.target.value }))} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Rating" type="number" min="1" max="5" value={draft.rating} onChange={(event) => setDraft((value) => ({ ...value, rating: event.target.value }))} />
                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-300">Visibility</span>
                  <select className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white" value={draft.visibility} onChange={(event) => setDraft((value) => ({ ...value, visibility: event.target.value }))}>
                    <option value="admin-visible">Admin visible</option>
                    <option value="student-visible">Student visible</option>
                    <option value="mentor-only">Mentor only</option>
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button icon={FiMessageSquare} disabled={Boolean(workingId)} onClick={saveNote}>{editingNoteId ? "Update note" : "Create note"}</Button>
                {editingNoteId ? <Button variant="ghost" onClick={resetDraft}>Cancel</Button> : null}
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <Input icon={FiSearch} placeholder="Search notes" value={query} onChange={(event) => setQuery(event.target.value)} />
            <span className="text-sm text-slate-400">{visibleNotes.length} notes</span>
          </div>

          {notes.loading ? (
            <SkeletonLoader rows={6} />
          ) : notes.error ? (
            <ErrorState description={notes.error} />
          ) : visibleNotes.length ? (
            <div className="space-y-3">
              {visibleNotes.map((note) => (
                <div key={note._id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-white">{note.student?.name || "Student"}</p>
                      <p className="mt-1 text-xs text-slate-500">{note.application?.job?.title || "General note"} - {formatMentorDateTime(note.updatedAt || note.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Rating {note.rating}/5</span>
                      <Button variant="ghost" className="min-h-9 px-3" icon={FiEdit2} onClick={() => editNote(note)}>Edit</Button>
                      <Button variant="danger" className="min-h-9 px-3" icon={FiTrash2} disabled={workingId === note._id} onClick={() => deleteNote(note._id)}>Delete</Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{note.note}</p>
                  <p className="mt-3 text-xs text-slate-500">{note.visibility}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No notes found" description="Create notes to build a mentor history for assigned students." />
          )}
        </GlassCard>
      </div>
    </PageContainer>
  );
}
