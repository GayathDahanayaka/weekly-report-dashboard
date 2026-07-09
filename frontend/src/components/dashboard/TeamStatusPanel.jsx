import StatusStamp from '../common/StatusStamp';

export default function TeamStatusPanel({ statusList, weekLabel }) {
  return (
    <div className="border border-line bg-paper-card rounded-sm p-6">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-1">Submission status</p>
      <p className="text-sm text-ink-faint mb-1">{weekLabel}</p>
      <p className="text-xs text-ink-faint mb-4">Late = not submitted by the end of the report week.</p>
      <ul className="divide-y divide-line-soft">
        {statusList.map((s) => (
          <li key={s.userId} className="py-2.5 flex items-center justify-between">
            <span className="text-sm text-ink">{s.name}</span>
            <StatusStamp status={s.status} size="sm" />
          </li>
        ))}
        {!statusList.length && (
          <li className="py-2.5 text-sm text-ink-faint">No team members yet.</li>
        )}
      </ul>
    </div>
  );
}
