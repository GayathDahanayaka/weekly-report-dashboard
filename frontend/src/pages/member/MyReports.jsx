import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import ReportForm from '../../components/reports/ReportForm';
import ReportHistoryList from '../../components/reports/ReportHistoryList';
import { Loader, ErrorBanner } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

export default function MyReports() {
  useDocumentTitle('My Reports');
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingReport, setEditingReport] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, reportsRes] = await Promise.all([
        axiosInstance.get('/projects'),
        axiosInstance.get('/reports/me'),
      ]);
      setProjects(projectsRes.data.projects);
      setReports(reportsRes.data.reports);
    } catch (err) {
      setError('Could not load your reports. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const buildPayload = (form) => ({
    ...form,
    hoursWorked: form.hoursWorked ? Number(form.hoursWorked) : null,
  });

  // Save without submitting - stays as "draft" (or keeps current status if just editing content)
  const handleSaveDraft = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      if (editingReport) {
        await axiosInstance.put(`/reports/${editingReport._id}`, buildPayload(form));
      } else {
        await axiosInstance.post('/reports', buildPayload(form));
      }
      showToast('Draft saved');
      setEditingReport(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this report.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save content, then submit (moves status to submitted/late)
  const handleSubmitReport = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      let reportId = editingReport?._id;
      if (reportId) {
        await axiosInstance.put(`/reports/${reportId}`, buildPayload(form));
      } else {
        const { data } = await axiosInstance.post('/reports', buildPayload(form));
        reportId = data.report._id;
      }
      await axiosInstance.post(`/reports/${reportId}/submit`);
      showToast('Report submitted');
      setEditingReport(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit this report.');
    } finally {
      setSubmitting(false);
    }
  };

  const myProjects = projects.filter(
    (p) => !p.assignedMembers?.length || p.assignedMembers.some((m) => m._id === user?.id)
  );

  return (
    <AppLayout title="My Reports" subtitle="One entry per week, same fields every time.">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
        <ReportForm
          projects={myProjects}
          editingReport={editingReport}
          onSaveDraft={handleSaveDraft}
          onSubmitReport={handleSubmitReport}
          onCancelEdit={() => setEditingReport(null)}
          submitting={submitting}
        />
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">
            History — {reports.length} {reports.length === 1 ? 'entry' : 'entries'}
          </p>
          {loading ? (
            <Loader label="Loading your reports…" />
          ) : (
            <ReportHistoryList reports={reports} onEdit={setEditingReport} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
