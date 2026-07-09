import StatusStamp from '../common/StatusStamp';
import { EmptyState } from '../common/Loader';
import { displayStatus } from '../../utils/reportStatus';

function formatRange(start, end) {
  const opts = { month: 'short', day: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-US', opts)} – ${new Date(end).toLocaleDateString('en-US', opts)}`;
}

export default function ReportHistoryList({ reports, onEdit }) {
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
        <article
          key={r._id}
          className="card-hover border border-line bg-paper-card rounded-sm p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink-faint tabular">{formatRange(r.weekStartDate, r.weekEndDate)}</p>
              <p className="text-sm text-ink font-medium mt-0.5">{r.projectId?.name || 'No project'}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusStamp status={displayStatus(r)} size="sm" />
              <button
                onClick={() => onEdit(r)}
                className="text-xs text-ink-faint hover:text-ink underline underline-offset-2 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <p className="text-sm text-ink-faint leading-relaxed">
            <span className="text-ink font-medium">Completed — </span>
            {r.tasksCompleted}
          </p>

          {r.blockers ? (
            <p className="text-sm text-danger leading-relaxed mt-2 bg-danger-soft/60 border border-danger/20 rounded-sm px-2.5 py-1.5">
              <span className="font-medium">Blocker — </span>
              {r.blockers}
            </p>
          ) : (
            <p className="text-xs text-ink-faint/70 mt-2 italic">No blockers reported</p>
          )}
        </article>
      ))}
    </div>
  );
}
