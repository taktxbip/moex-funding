import { useEffect, useState } from 'react'
import { FundingChart, type ChartPoint } from './FundingChart'
import './App.css'

// Dev: Vite proxies to the live API. Prod (GitHub Pages): static JSON baked at build time
// (API is HTTP + no CORS, so the browser cannot call it from https://*.github.io).
const API_URL = import.meta.env.DEV
  ? '/api/funding-history'
  : `${import.meta.env.BASE_URL}funding-history.json`

const idToTicker: Record<number, string> = {
  1: 'USDRUBF',
  2: 'EURRUBF',
  3: 'CNYRUBF',
  4: 'GLDRUBF',
}

const tickerColors: Record<string, string> = {
  USDRUBF: '#3ecf8e',
  EURRUBF: '#5b9fd4',
  CNYRUBF: '#e8b84a',
  GLDRUBF: '#c9a06a',
}

type FundingRecord = {
  id: number
  ticker_id: number
  rate: number
  day: string
}

function formatDayLabel(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function groupByTicker(records: FundingRecord[]): Record<string, ChartPoint[]> {
  const grouped: Record<string, ChartPoint[]> = {
    USDRUBF: [],
    EURRUBF: [],
    CNYRUBF: [],
    GLDRUBF: [],
  }

  for (const record of records) {
    const ticker = idToTicker[record.ticker_id]
    if (!ticker) continue
    grouped[ticker].push({
      day: record.day,
      label: formatDayLabel(record.day),
      rate: record.rate,
    })
  }

  for (const ticker of Object.keys(grouped)) {
    grouped[ticker].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    )
  }

  return grouped
}

function App() {
  const [series, setSeries] = useState<Record<string, ChartPoint[]> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as FundingRecord[]
        if (!cancelled) setSeries(groupByTicker(data))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <p className="brand">MOEX</p>
        <h1>Funding rates</h1>
        <p className="subtitle">Daily history for perpetual futures</p>
      </header>

      {loading && <p className="status">Loading…</p>}
      {error && <p className="status status-error">Error: {error}</p>}

      {series && (
        <div className="chart-grid">
          {Object.keys(idToTicker).map((id) => {
            const ticker = idToTicker[Number(id)]
            return (
              <FundingChart
                key={ticker}
                ticker={ticker}
                data={series[ticker]}
                color={tickerColors[ticker]}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default App
