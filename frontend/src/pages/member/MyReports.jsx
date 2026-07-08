import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import ReportForm from '../../components/reports/ReportForm';
import ReportHistoryList from '../../components/reports/ReportHistoryList';
import { Loader, ErrorBanner } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';

export default function MyReports() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (form) => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/reports', {
        ...form,
        hoursWorked: form.hoursWorked ? Number(form.hoursWorked) : null,
      });
      await axiosInstance.post(`/reports/${data.report._id}/submit`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="My Reports" subtitle="One entry per week, same fields every time.">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-[1fr_1.1fr] gap-8 items-start">
        <ReportForm projects={projects} onSubmit={handleSubmit} submitting={submitting} />
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">
            History — {reports.length} {reports.length === 1 ? 'entry' : 'entries'}
          </p>
          {loading ? <Loader label="Loading your reports…" /> : <ReportHistoryList reports={reports} />}
        </div>
      </div>
    </AppLayout>
  );
}
