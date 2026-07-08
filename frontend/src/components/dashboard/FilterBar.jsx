import { Select, Input } from '../common/Input';

export default function FilterBar({ projects, members, filters, setFilters, weekOptions }) {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-6 pb-6 border-b border-line">
      <div className="w-full sm:w-48">
        <label className="block text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">Week</label>
        <Select value={filters.week} onChange={(e) => setFilters({ ...filters, week: e.target.value })}>
          {weekOptions.map((w) => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-44">
        <label className="block text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">Member</label>
        <Select value={filters.member} onChange={(e) => setFilters({ ...filters, member: e.target.value })}>
          <option value="">All members</option>
          {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
        </Select>
      </div>
      <div className="w-full sm:w-44">
        <label className="block text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">Project</label>
        <Select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>
      </div>
      <div className="w-full sm:w-40">
        <label className="block text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">From</label>
        <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
      </div>
      <div className="w-full sm:w-40">
        <label className="block text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">To</label>
        <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
      </div>
      <button
        onClick={() => setFilters({ ...filters, member: '', project: '', from: '', to: '' })}
        className="text-xs text-ink-faint hover:text-ink underline underline-offset-2 mb-2.5"
      >
        Clear filters
      </button>
    </div>
  );
}
