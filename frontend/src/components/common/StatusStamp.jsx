const STYLES = {
  submitted: { color: '#2f6f4f', label: 'Submitted' },
  late: { color: '#b3261e', label: 'Late' },
  pending: { color: '#a9820a', label: 'Pending' },
  draft: { color: 'var(--color-ink-faint)', label: 'Draft' },
};

// A rotated double-ring stamp, like an ink stamp on a paper timesheet.
export default function StatusStamp({ status, size = 'md' }) {
  const s = STYLES[status] || STYLES.draft;
  const dims = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-widest border-2 rounded-sm -rotate-2 ${dims}`}
      style={{ color: s.color, borderColor: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
