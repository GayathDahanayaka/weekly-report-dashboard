import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import SummaryCards from '../../components/dashboard/SummaryCards';
import TrendChart from '../../components/dashboard/TrendChart';
import StatusChart from '../../components/dashboard/StatusChart';
import WorkloadChart from '../../components/dashboard/WorkloadChart';
import HoursChart from '../../components/dashboard/HoursChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import TeamStatusPanel from '../../components/dashboard/TeamStatusPanel';
import FilterBar from '../../components/dashboard/FilterBar';
import ReportsTable from '../../components/dashboard/ReportsTable';
import Modal from '../../components/common/Modal';
import ReportDetail from '../../components/dashboard/ReportDetail';
import { ErrorBanner, DashboardSkeleton } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosInstance';
import { toLocalDateString } from '../../utils/reportStatus';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Parsing "YYYY-MM-DDT00:00:00" (no Z) is interpreted as LOCAL time by the
// spec, which keeps the calendar day correct - unlike "YYYY-MM-DD" alone,
// which parses as UTC and can display as the previous day locally.
function labelFor(value) {
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// The week list is built from whatever weeks actually have report data in
// the database, plus the current calendar week so it's always selectable
// even before anyone has submitted. This guarantees the value picked here
// can only ever be a value that also exists on a real report - no more
// client/server date-math mismatches.
function buildWeekOptions(realWeeks) {
  const currentMonday = toLocalDateString(mondayOf(new Date()));
  const values = new Set([currentMonday, ...realWeeks]);
  return Array.from(values)
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({
      value,
      label: value === currentMonday ? `This week — ${labelFor(value)}` : `Week of ${labelFor(value)}`,
    }));
}

export default function TeamDashboard() {
  useDocumentTitle('Team Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [weekOptions, setWeekOptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [statusByMember, setStatusByMember] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [hours, setHours] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({ week: '', member: '', project: '', from: '', to: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projectsRes, membersRes, weeksRes, workloadRes, hoursRes, activityRes, trendRes] = await Promise.all([
          axiosInstance.get('/projects'),
          axiosInstance.get('/dashboard/members'),
          axiosInstance.get('/dashboard/weeks'),
          axiosInstance.get('/dashboard/workload-by-project'),
          axiosInstance.get('/dashboard/hours-by-member'),
          axiosInstance.get('/dashboard/activity'),
          axiosInstance.get('/dashboard/trend'),
        ]);
        setProjects(projectsRes.data.projects);
        setMembers(membersRes.data.members);
        const options = buildWeekOptions(weeksRes.data.weeks);
        setWeekOptions(options);
        setFilters((f) => ({ ...f, week: options[0].value }));
        setWorkload(workloadRes.data.data);
        setHours(hoursRes.data.data);
        setActivity(activityRes.data.reports);
        setTrend(trendRes.data.trend);
      } catch (err) {
        setError('Could not load the dashboard. Try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Re-fetch everything tied to the selected week whenever it changes
  useEffect(() => {
    if (!filters.week) return;
    const loadWeekData = async () => {
      try {
        const [summaryRes, statusRes, statusListRes] = await Promise.all([
          axiosInstance.get(`/dashboard/summary?weekStart=${filters.week}`),
          axiosInstance.get(`/dashboard/status-by-member?weekStart=${filters.week}`),
          axiosInstance.get(`/reports/status?weekStart=${filters.week}`),
        ]);
        setSummary(summaryRes.data);
        setStatusByMember(statusRes.data.data);
        setStatusList(statusListRes.data.statusList);
      } catch {
        setError('Could not load data for the selected week.');
      }
    };
    loadWeekData();
  }, [filters.week]);

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
  }, [filters.member, filters.project, filters.from, filters.to]);

  const weekLabel = weekOptions.find((w) => w.value === filters.week)?.label || '';

  if (loading) {
    return (
      <AppLayout title="Team Dashboard" subtitle="Pick a week to inspect the team's activity.">
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Team Dashboard" subtitle="Pick a week to inspect the team's activity.">
      <ErrorBanner message={error} />
      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="grid grid-cols-1 gap-6">
          <TrendChart data={trend} />
          <WorkloadChart data={workload} />
          <HoursChart data={hours} />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <StatusChart data={statusByMember} />
          <TeamStatusPanel statusList={statusList} weekLabel={weekLabel} />
          <ActivityFeed reports={activity} />
        </div>
      </div>

      <p className="font-display text-xl text-ink mb-1">All reports</p>
      <p className="text-xs text-ink-faint mb-4">Click a row to see the full report.</p>
      <FilterBar projects={projects} members={members} filters={filters} setFilters={setFilters} weekOptions={weekOptions} />
      <ReportsTable reports={reports} onRowClick={setSelectedReport} />

      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)}>
        <ReportDetail report={selectedReport} />
      </Modal>
    </AppLayout>
  );
}
