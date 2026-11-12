import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// A card with a horizontal bar chart. data = [{ label, count }], biggest first.
export default function BarChartCard({ title, data }) {
  return (
    <section className="card stack" aria-label={title}>
      <h2 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>{title}</h2>
      {data.length === 0 ? (
        <p className="empty">Aucune offre pour le moment.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="#e5e9f2" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 13 }} />
            <Tooltip formatter={(value) => [`${value} offre(s)`, '']} separator="" cursor={{ fill: '#f2f5fc' }} />
            <Bar dataKey="count" fill="#1f4fd1" radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}
