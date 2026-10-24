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

const tickers = Object.values(idToTicker)

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

function emptySeries(): Record<string, ChartPoint[]> {
  return Object.fromEntries(tickers.map((ticker) => [ticker, []]))
}

function groupByTicker(records: FundingRecord[]): Record<string, ChartPoint[]> {
  const grouped = emptySeries()

  for (const record of records) {
    const ticker = idToTicker[record.ticker_id]
    if (!ticker) continue
    grouped[ticker].push({
      day: record.day,
      label: formatDayLabel(record.day),
      value: record.rate,
    })
  }

  for (const ticker of tickers) {
    grouped[ticker].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    )
  }

  return grouped
}

function toCumulative(
  series: Record<string, ChartPoint[]>,
): Record<string, ChartPoint[]> {
  const cumulative = emptySeries()

  for (const ticker of tickers) {
    let sum = 0
    cumulative[ticker] = series[ticker].map((point) => {
      sum += point.value
      return { ...point, value: sum }
    })
  }

  return cumulative
}

type Theme = 'day' | 'night'

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'day' ? 'day' : 'night'
}

function App() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [daily, setDaily] = useState<Record<string, ChartPoint[]> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (theme === 'day') document.documentElement.dataset.theme = 'day'
    else delete document.documentElement.dataset.theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as FundingRecord[]
        if (!cancelled) setDaily(groupByTicker(data))
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

  const cumulative = daily ? toCumulative(daily) : null

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="brand">MOEX</p>
          <h1>Funding rates</h1>
          <p className="subtitle">Daily and cumulative history for perpetual futures</p>
        </div>
        <div className="theme-switch" role="group" aria-label="Theme">
          <button
            type="button"
            aria-pressed={theme === 'day'}
            onClick={() => setTheme('day')}
          >
            Day
          </button>
          <button
            type="button"
            aria-pressed={theme === 'night'}
            onClick={() => setTheme('night')}
          >
            Night
          </button>
        </div>
      </header>

      {loading && <p className="status">Loading…</p>}
      {error && <p className="status status-error">Error: {error}</p>}

      {daily && cumulative && (
        <div className="ticker-list">
          {tickers.map((ticker) => (
            <section key={ticker} className="ticker-section">
              <h2 className="ticker-title" style={{ color: tickerColors[ticker] }}>
                {ticker}
              </h2>
              <div className="chart-row">
                <FundingChart
                  title="Daily"
                  data={daily[ticker]}
                  color={tickerColors[ticker]}
                  valueLabel="rate"
                  smooth={false}
                />
                <FundingChart
                  title="Cumulative"
                  data={cumulative[ticker]}
                  color={tickerColors[ticker]}
                  valueLabel="cumulative"
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
