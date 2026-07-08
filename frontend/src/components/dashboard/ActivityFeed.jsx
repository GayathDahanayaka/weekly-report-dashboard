import StatusStamp from '../common/StatusStamp';

export default function ActivityFeed({ reports }) {
  return (
    <div className="border border-line bg-paper-card rounded-sm p-6">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">Recent activity</p>
      <ul className="divide-y divide-line-soft">
        {reports.slice(0, 6).map((r) => (
          <li key={r._id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-ink truncate">
                <span className="font-medium">{r.userId?.name}</span> — {r.projectId?.name}
              </p>
              <p className="text-xs text-ink-faint font-mono">
                {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
            </div>
            <StatusStamp status={r.status} size="sm" />
          </li>
        ))}
        {!reports.length && <li className="py-3 text-sm text-ink-faint">No activity yet.</li>}
      </ul>
    </div>
  );
}
