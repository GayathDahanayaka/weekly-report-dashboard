import { useState } from 'react';
import { Field, Input, Textarea, Select } from '../common/Input';
import Button from '../common/Button';

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

export default function ReportForm({ projects, onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(emptyForm);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-paper-card border border-line rounded-sm p-7 ruled-bg">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-6">
        New entry — same fields for every team member
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
        <Field label="Week start">
          <Input type="date" required value={form.weekStartDate} onChange={set('weekStartDate')} />
        </Field>
        <Field label="Week end">
          <Input type="date" required value={form.weekEndDate} onChange={set('weekEndDate')} />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Project / category">
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

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-6">
        <Field label="Hours worked" hint="Optional">
          <Input type="number" min="0" step="0.5" value={form.hoursWorked} onChange={set('hoursWorked')} placeholder="0" />
        </Field>
        <Field label="Notes or links" hint="Optional">
          <Input value={form.notes} onChange={set('notes')} placeholder="https://…" />
        </Field>
      </div>

      <Button type="submit" variant="accent" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save & submit report'}
      </Button>
    </form>
  );
}
