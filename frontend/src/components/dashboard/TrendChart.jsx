import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data }) {
  const chartData = data.map((d) => ({
    week: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reports: d.reportsCount,
  }));

  return (
    <div className="border border-line bg-paper-card rounded-sm p-6">
      <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-4">Reports over time</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#e8e3d6" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={{ stroke: '#d9d2c2' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5a6791' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 2, border: '1px solid #d9d2c2', fontSize: 12 }} />
          <Line type="monotone" dataKey="reports" stroke="#c9a227" strokeWidth={2} dot={{ fill: '#16213e', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
