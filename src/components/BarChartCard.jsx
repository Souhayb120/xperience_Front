import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// The admin dashboard charts. data = [{ label, count }], biggest first.

// Xperience chart colours: teal, lime, coral, ocean, amber... (SKILL _theme.md)
const COLORS = ['#0f5c56', '#a4c23e', '#e8704f', '#3a8f86', '#d9a441', '#1e4f63', '#7fb5a8', '#c98b6b', '#6d7f3a', '#a9bab4']

// a dark tooltip card instead of the default white box
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { label, count } = payload[0].payload
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>{count} offre{count > 1 ? 's' : ''}</span>
    </div>
  )
}

function ChartCard({ title, total, children, empty }) {
  return (
    <section className="card chart-card" aria-label={title}>
      <header className="chart-head">
        <h2>{title}</h2>
        <span className="chart-total">{total} offre{total > 1 ? 's' : ''}</span>
      </header>
      {empty ? <p className="empty">Aucune offre pour le moment.</p> : children}
    </section>
  )
}

const sum = (data) => data.reduce((n, d) => n + d.count, 0)

// vertical bars with a cobalt gradient and the number on top of each bar
export default function BarChartCard({ title, data }) {
  return (
    <ChartCard title={title} total={sum(data)} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a8f86" />
              <stop offset="100%" stopColor="#0f5c56" />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} interval={0}
                 tick={{ fontSize: 12 }} />
          <YAxis hide allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15, 118, 110, 0.08)', radius: 10 }} />
          <Bar dataKey="count" fill="url(#barGradient)" radius={[10, 10, 10, 10]} maxBarSize={44}
               animationDuration={900}>
            <LabelList dataKey="count" position="top" style={{ fontSize: 13, fontWeight: 700, fill: 'var(--ink)' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// a donut with the total in the middle and a legend with each share in %
export function DonutChartCard({ title, data }) {
  const total = sum(data)
  return (
    <ChartCard title={title} total={total} empty={data.length === 0}>
      <div className="donut">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="label" innerRadius="62%" outerRadius="92%"
                   paddingAngle={3} cornerRadius={6} stroke="none" animationDuration={900}>
                {data.map((d, i) => <Cell key={d.label} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center" aria-hidden="true">
            <strong>{total}</strong>
            <span>offres</span>
          </div>
        </div>
        <ul className="donut-legend">
          {data.map((d, i) => (
            <li key={d.label}>
              <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="legend-label">{d.label}</span>
              <strong>{Math.round((d.count / total) * 100)} %</strong>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
