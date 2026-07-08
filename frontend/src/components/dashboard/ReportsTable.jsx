import StatusStamp from '../common/StatusStamp';
import { EmptyState } from '../common/Loader';

export default function ReportsTable({ reports }) {
  if (!reports.length) {
    return <EmptyState title="No reports match these filters" hint="Try widening the date range or clearing a filter." />;
  }

  return (
    <div className="border border-line bg-paper-card rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {['Member', 'Week', 'Project', 'Hours', 'Status'].map((h) => (
              <th key={h} className="px-5 py-3 text-xs uppercase tracking-wide text-ink-faint font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r._id} className="border-b border-line-soft last:border-0 hover:bg-paper-dim/40">
              <td className="px-5 py-3 text-ink font-medium">{r.userId?.name}</td>
              <td className="px-5 py-3 text-ink-faint font-mono text-xs tabular">
                {new Date(r.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td className="px-5 py-3 text-ink-faint">{r.projectId?.name}</td>
              <td className="px-5 py-3 text-ink-faint font-mono tabular">{r.hoursWorked ?? '—'}</td>
              <td className="px-5 py-3"><StatusStamp status={r.status} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
