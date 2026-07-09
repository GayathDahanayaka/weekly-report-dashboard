import StatusStamp from '../common/StatusStamp';
import { displayStatus } from '../../utils/reportStatus';

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

export default function ReportDetail({ report }) {
  if (!report) return null;

  const rows = [
    { label: 'Tasks completed', value: report.tasksCompleted },
    { label: 'Tasks planned for next week', value: report.tasksPlanned },
    { label: 'Blockers / challenges', value: report.blockers || 'None reported' },
    { label: 'Notes or links', value: report.notes || '—' },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="font-display text-xl text-ink">{report.userId?.name}</p>
          <p className="text-sm text-ink-faint">{report.projectId?.name}</p>
        </div>
        <StatusStamp status={displayStatus(report)} />
      </div>

      <div className="grid grid-cols-2 gap-4 my-5 pb-5 border-b border-line-soft font-mono text-xs">
        <div>
          <p className="text-ink-faint uppercase tracking-wide mb-1">Week</p>
          <p className="text-ink tabular">{formatDate(report.weekStartDate)} – {formatDate(report.weekEndDate)}</p>
        </div>
        <div>
          <p className="text-ink-faint uppercase tracking-wide mb-1">Hours worked</p>
          <p className="text-ink tabular">{report.hoursWorked ?? '—'}</p>
        </div>
        <div>
          <p className="text-ink-faint uppercase tracking-wide mb-1">Submitted</p>
          <p className="text-ink tabular">{report.submittedAt ? formatDate(report.submittedAt) : 'Not yet'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-xs uppercase tracking-wide text-ink-faint font-medium mb-1">{r.label}</p>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
