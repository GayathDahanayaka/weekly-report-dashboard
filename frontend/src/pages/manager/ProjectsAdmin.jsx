import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Field, Input, Textarea } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Loader, ErrorBanner, EmptyState } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [projectsRes, membersRes] = await Promise.all([
        axiosInstance.get('/projects'),
        axiosInstance.get('/dashboard/members'),
      ]);
      setProjects(projectsRes.data.projects);
      setMembers(membersRes.data.members);
    } catch {
      setError('Could not load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await axiosInstance.put(`/projects/${editingId}`, form);
      } else {
        await axiosInstance.post('/projects', form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description || '' });
    setEditingId(p._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? Reports linked to it will keep their reference.')) return;
    try {
      await axiosInstance.delete(`/projects/${id}`);
      await load();
    } catch {
      setError('Could not delete project.');
    }
  };

  const toggleMember = async (project, memberId) => {
    const current = project.assignedMembers?.map((m) => m._id) || [];
    const next = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    try {
      await axiosInstance.put(`/projects/${project._id}/assign`, { memberIds: next });
      await load();
    } catch {
      setError('Could not update assignment.');
    }
  };

  return (
    <AppLayout title="Projects" subtitle="Categories your team tags weekly reports with.">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 items-start">
        <form onSubmit={handleSubmit} className="border border-line bg-paper-card rounded-sm p-6 lg:sticky lg:top-9">
          <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-5">
            {editingId ? 'Edit project' : 'New project'}
          </p>
          <div className="space-y-4 mb-5">
            <Field label="Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Client A" />
            </Field>
            <Field label="Description" hint="Optional">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="accent" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add project'}
            </Button>
            {editingId && <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>

        <div>
          {loading ? (
            <Loader label="Loading projects…" />
          ) : projects.length === 0 ? (
            <EmptyState title="No projects yet" hint="Add your first project or category on the left." />
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p._id} className="border border-line bg-paper-card rounded-sm p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-ink font-medium">{p.name}</p>
                      {p.description && <p className="text-sm text-ink-faint mt-1">{p.description}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => handleEdit(p)}>Edit</Button>
                      <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => handleDelete(p._id)}>Delete</Button>
                    </div>
                  </div>

                  <button
                    onClick={() => setAssigningId(assigningId === p._id ? null : p._id)}
                    className="text-xs text-accent-dark underline underline-offset-2"
                  >
                    {assigningId === p._id ? 'Hide team assignment' : `Team (${p.assignedMembers?.length || 0} assigned)`}
                  </button>

                  {assigningId === p._id && (
                    <div className="mt-3 pt-3 border-t border-line-soft flex flex-wrap gap-2">
                      {members.length === 0 && <p className="text-xs text-ink-faint">No members registered yet.</p>}
                      {members.map((m) => {
                        const isAssigned = p.assignedMembers?.some((am) => am._id === m._id);
                        return (
                          <button
                            key={m._id}
                            onClick={() => toggleMember(p, m._id)}
                            className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                              isAssigned
                                ? 'border-ink bg-ink text-paper'
                                : 'border-line text-ink-faint hover:border-ink'
                            }`}
                          >
                            {m.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
