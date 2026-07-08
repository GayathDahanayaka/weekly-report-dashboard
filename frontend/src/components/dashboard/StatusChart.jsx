import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const COLORS = { submitted: '#2f6f4f', late: '#b3261e', pending: '#a9820a' };

export default function StatusChart({ data }) {
  return (
    <div className="border border-line bg-paper-card rounded-sm p-6">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">Status by member</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid stroke="#e8e3d6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={{ stroke: '#d9d2c2' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #d9d2c2', fontSize: 12 }} />
          <Bar dataKey={() => 1} radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.status] || '#5a6791'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3">
        {Object.entries(COLORS).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-ink-faint capitalize">
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
