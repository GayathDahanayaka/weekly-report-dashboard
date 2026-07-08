import { useEffect, useState } from 'react';
import { Field, Input, Textarea, Select } from '../common/Input';
import Button from '../common/Button';
import { mondayOf, toLocalDateString } from '../../utils/reportStatus';

const emptyForm = {
  projectId: '',
  weekStartDate: '',
  weekEndDate: '',
  tasksCompleted: '',
  tasksPlanned: '',
  blockers: '',
  hoursWorked: '',
  notes: '',
};

function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export default function ReportForm({ projects, editingReport, onSaveDraft, onSubmitReport, onCancelEdit, submitting }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingReport) {
      setForm({
        projectId: editingReport.projectId?._id || editingReport.projectId || '',
        weekStartDate: toDateInput(editingReport.weekStartDate),
        weekEndDate: toDateInput(editingReport.weekEndDate),
        tasksCompleted: editingReport.tasksCompleted || '',
        tasksPlanned: editingReport.tasksPlanned || '',
        blockers: editingReport.blockers || '',
        hoursWorked: editingReport.hoursWorked ?? '',
        notes: editingReport.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingReport]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const setWeekStart = (e) => {
    const picked = e.target.value;
    let start = '';
    let end = '';
    if (picked) {
      const monday = mondayOf(picked);
      start = toLocalDateString(monday);
      const endDate = new Date(monday.getTime());
      endDate.setDate(endDate.getDate() + 6);
      end = toLocalDateString(endDate);
    }
    setForm({ ...form, weekStartDate: start, weekEndDate: end });
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    await onSaveDraft(form);
    if (!editingReport) setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmitReport(form);
    setForm(emptyForm);
  };

  return (
    <form className="bg-paper-card border border-line rounded-sm p-5 sm:p-7 ruled-bg">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs uppercase tracking-widest text-ink-faint font-mono">
          {editingReport ? `Editing ${editingReport.status} entry` : 'New entry — same fields for every team member'}
        </p>
        {editingReport && (
          <button type="button" onClick={onCancelEdit} className="text-xs text-ink-faint hover:text-ink underline underline-offset-2">
            Cancel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-5">
        <Field label="Week start" hint="Auto-adjusts to that week's Monday, so every member's weeks line up">
          <Input type="date" required value={form.weekStartDate} onChange={setWeekStart} />
        </Field>
        <Field label="Week end" hint="Calculated automatically">
          <Input type="date" required value={form.weekEndDate} readOnly disabled className="opacity-70 cursor-not-allowed" />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Project / category" hint="Only projects you're assigned to appear here">
          <Select required value={form.projectId} onChange={set('projectId')}>
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Tasks completed">
          <Textarea required value={form.tasksCompleted} onChange={set('tasksCompleted')} placeholder="What did you finish this week?" />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Tasks planned for next week">
          <Textarea required value={form.tasksPlanned} onChange={set('tasksPlanned')} placeholder="What's next?" />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Blockers / challenges" hint="Leave blank if none">
          <Textarea value={form.blockers} onChange={set('blockers')} placeholder="Anything slowing you down?" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-6">
        <Field label="Hours worked" hint="Optional">
          <Input type="number" min="0" step="0.5" value={form.hoursWorked} onChange={set('hoursWorked')} placeholder="0" />
        </Field>
        <Field label="Notes or links" hint="Optional">
          <Input value={form.notes} onChange={set('notes')} placeholder="https://…" />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="ghost" onClick={handleSaveDraft} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save as draft'}
        </Button>
        <Button type="button" variant="accent" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : editingReport?.status && editingReport.status !== 'draft' ? 'Save & re-submit' : 'Submit report'}
        </Button>
      </div>
    </form>
  );
}

