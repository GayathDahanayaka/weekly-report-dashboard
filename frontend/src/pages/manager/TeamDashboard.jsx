import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import SummaryCards from '../../components/dashboard/SummaryCards';
import TrendChart from '../../components/dashboard/TrendChart';
import StatusChart from '../../components/dashboard/StatusChart';
import WorkloadChart from '../../components/dashboard/WorkloadChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import FilterBar from '../../components/dashboard/FilterBar';
import ReportsTable from '../../components/dashboard/ReportsTable';
import { Loader, ErrorBanner } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';

function currentWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

export default function TeamDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [statusByMember, setStatusByMember] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ member: '', project: '', from: '', to: '' });
  const weekStart = currentWeekStart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          projectsRes, membersRes, summaryRes, trendRes, statusRes, workloadRes, activityRes,
        ] = await Promise.all([
          axiosInstance.get('/projects'),
          axiosInstance.get('/dashboard/members'),
          axiosInstance.get(`/dashboard/summary?weekStart=${weekStart}`),
          axiosInstance.get('/dashboard/trend'),
          axiosInstance.get(`/dashboard/status-by-member?weekStart=${weekStart}`),
          axiosInstance.get('/dashboard/workload-by-project'),
          axiosInstance.get('/dashboard/activity'),
        ]);
        setProjects(projectsRes.data.projects);
        setMembers(membersRes.data.members);
        setSummary(summaryRes.data);
        setTrend(trendRes.data.trend);
        setStatusByMember(statusRes.data.data);
        setWorkload(workloadRes.data.data);
        setActivity(activityRes.data.reports);
      } catch (err) {
        setError('Could not load the dashboard. Try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      const params = new URLSearchParams();
      if (filters.member) params.set('member', filters.member);
      if (filters.project) params.set('project', filters.project);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const { data } = await axiosInstance.get(`/reports?${params.toString()}`);
      setReports(data.reports);
    };
    loadReports();
  }, [filters]);

  if (loading) {
    return (
      <AppLayout title="Team Dashboard" subtitle="Week of the current Monday.">
        <Loader label="Loading dashboard…" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Team Dashboard" subtitle="This week's activity across the team.">
      <ErrorBanner message={error} />
      <SummaryCards summary={summary} />

      <div className="grid grid-cols-2 gap-6 mb-8">
        <TrendChart data={trend} />
        <StatusChart data={statusByMember} />
      </div>
      <div className="grid grid-cols-[1.3fr_1fr] gap-6 mb-10">
        <WorkloadChart data={workload} />
        <ActivityFeed reports={activity} />
      </div>

      <p className="font-display text-xl text-ink mb-1">All reports</p>
      <FilterBar projects={projects} members={members} filters={filters} setFilters={setFilters} />
      <ReportsTable reports={reports} />
    </AppLayout>
  );
}
