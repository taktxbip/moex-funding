import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const API_URL = 'http://185.255.178.30:3040/funding-history'
const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'funding-history.json',
)

const res = await fetch(API_URL)
if (!res.ok) {
  throw new Error(`Failed to fetch funding history: HTTP ${res.status}`)
}

const data = await res.json()
await mkdir(dirname(outPath), { recursive: true })
await writeFile(outPath, JSON.stringify(data, null, 2) + '\n')
console.log(`Wrote ${data.length} records to public/funding-history.json`)
