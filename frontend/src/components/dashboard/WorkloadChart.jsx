import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WorkloadChart({ data }) {
  return (
    <div className="border border-line bg-paper-card rounded-sm p-6">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">Workload by project</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid stroke="#e8e3d6" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="projectName" width={110} tick={{ fontSize: 11, fill: '#16213e' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #d9d2c2', fontSize: 12 }} />
          <Bar dataKey="reportCount" fill="#2b3a67" radius={[0, 2, 2, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
