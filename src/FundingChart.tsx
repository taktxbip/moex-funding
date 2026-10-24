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
  value: number
}

type FundingChartProps = {
  title: string
  data: ChartPoint[]
  color: string
  valueLabel?: string
  smooth?: boolean
}

function formatValue(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })
}

export function FundingChart({
  title,
  data,
  color,
  valueLabel = 'rate',
  smooth = true,
}: FundingChartProps) {
  const latest = data.at(-1)?.value

  return (
    <article className="chart-panel">
      <header className="chart-header">
        <h3>{title}</h3>
        {latest !== undefined && (
          <span className="chart-rate" style={{ color }}>
            {formatValue(latest)}
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
                width={56}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--text-h)',
                }}
                labelStyle={{ color: 'var(--muted)' }}
                formatter={(value) => [formatValue(Number(value)), valueLabel]}
              />
              <Line
                type={smooth ? 'monotone' : 'linear'}
                dataKey="value"
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
