import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type ChartPoint = {
  day: string
  label: string
  rate: number
}

type FundingChartProps = {
  ticker: string
  data: ChartPoint[]
  color: string
}

function formatRate(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })
}

export function FundingChart({ ticker, data, color }: FundingChartProps) {
  const latest = data.at(-1)?.rate

  return (
    <article className="chart-panel">
      <header className="chart-header">
        <h2>{ticker}</h2>
        {latest !== undefined && (
          <span className="chart-rate" style={{ color }}>
            {formatRate(latest)}
          </span>
        )}
      </header>
      <div className="chart-body">
        {data.length === 0 ? (
          <p className="chart-empty">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={formatRate}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--muted)' }}
                formatter={(value) => [formatRate(Number(value)), 'rate']}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={color}
                strokeWidth={2}
                dot={{ r: data.length < 3 ? 4 : 0, fill: color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  )
}
