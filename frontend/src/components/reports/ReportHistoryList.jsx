import StatusStamp from '../common/StatusStamp';
import { EmptyState } from '../common/Loader';

function formatRange(start, end) {
  const opts = { month: 'short', day: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-US', opts)} – ${new Date(end).toLocaleDateString('en-US', opts)}`;
}

export default function ReportHistoryList({ reports }) {
  if (!reports.length) {
    return (
      <EmptyState
        title="No entries yet"
        hint="Your submitted weekly reports will appear here, most recent first."
      />
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <article key={r._id} className="border border-line bg-paper-card rounded-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-xs text-ink-faint tabular">{formatRange(r.weekStartDate, r.weekEndDate)}</p>
              <p className="text-sm text-ink font-medium mt-0.5">{r.projectId?.name || 'No project'}</p>
            </div>
            <StatusStamp status={r.status} size="sm" />
          </div>
          <p className="text-sm text-ink-faint leading-relaxed">
            <span className="text-ink font-medium">Completed — </span>
            {r.tasksCompleted}
          </p>
          {r.blockers && (
            <p className="text-sm text-danger/90 leading-relaxed mt-1.5">
              <span className="font-medium">Blocker — </span>
              {r.blockers}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
