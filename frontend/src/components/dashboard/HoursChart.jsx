import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HoursChart({ data }) {
  return (
    <div className="border border-line bg-paper-card rounded-sm p-6">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">Hours logged by member</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid stroke="#e8e3d6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={{ stroke: '#d9d2c2' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #d9d2c2', fontSize: 12 }} />
          <Bar dataKey="totalHours" fill="#c9a227" radius={[2, 2, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
