export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Reports submitted', value: summary?.totalReportsSubmitted ?? '—' },
    { label: 'Compliance rate', value: summary ? `${summary.complianceRate}%` : '—' },
    { label: 'Open blockers', value: summary?.openBlockers ?? '—' },
    { label: 'Team size', value: summary?.totalMembers ?? '—' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => (
        <div key={c.label} className="border border-line bg-paper-card rounded-sm p-5 relative">
          <span className="absolute top-3 right-4 font-mono text-[10px] text-ink-faint">
            {String(i + 1).padStart(2, '0')}
          </span>
          <p className="font-display text-3xl text-ink tabular">{c.value}</p>
          <p className="text-xs uppercase tracking-wide text-ink-faint mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
