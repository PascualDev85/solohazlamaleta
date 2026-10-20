// Pure helpers for the HTML size budget (scripts/html-size-check.ts).
// No I/O here, so the budget rule and the table are unit-tested on their own.
import { gzipSync } from 'node:zlib'

/**
 * Compressed HTML budget per page, in bytes (1 KB = 1000 bytes, as in the
 * doc). Lighthouse's simulated network sends the document in TCP windows:
 * past ~43.8 KB of gzipped HTML it needs one more round trip, FCP and LCP
 * rise 150 ms and mobile performance drops from 100 to 99; the next window
 * ends near 102 KB (docs/1.13_guia_hub_satelites.md §5).
 * Every page stays under the first window, so it keeps its 100. The 13-day
 * guide already passed it (45.4 KB on 2026-10-15) and the author accepted 99
 * on mobile for it alone (1.13 §5, option a): its cap is 95 KB, a margin
 * under the next window, past which it would lose another point.
 */
export const DEFAULT_BUDGET = 43_800
export const PAGE_BUDGETS: Record<string, number> = {
  '/islandia/islandia-en-camper-13-dias/': 95_000,
}

/** Gzip at level 6, the level the 1.13 §5 measures were taken with. */
export function gzipSize(html: string | Uint8Array): number {
  return gzipSync(html, { level: 6 }).length
}

/** The page's URL path from its file under dist/: "a/b/index.html" → "/a/b/". */
export function pageFromFile(file: string): string {
  const path = file.split(/[\\/]+/).filter(Boolean).join('/')
  if (path === 'index.html') return '/'
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'index.html'.length)}`
  return `/${path}`
}

export interface PageSize {
  page: string
  /** Gzipped bytes. */
  bytes: number
  budget: number
  /** Bytes left under the budget; negative when over it. */
  left: number
}

/** Each page's size against its budget, sorted by page. */
export function measure(
  pages: { page: string; bytes: number }[],
  budgets: Record<string, number> = PAGE_BUDGETS,
  fallback: number = DEFAULT_BUDGET,
): PageSize[] {
  return pages
    .map(({ page, bytes }) => {
      const budget = budgets[page] ?? fallback
      return { page, bytes, budget, left: budget - bytes }
    })
    .sort((a, b) => a.page.localeCompare(b.page))
}

/** The pages over their budget, as readable lines. Empty means pass. */
export function overBudget(sizes: PageSize[]): string[] {
  return sizes.filter((s) => s.left < 0).map((s) => `${s.page}: ${kb(s.bytes)} > ${kb(s.budget)} (${-s.left} bytes over)`)
}

/** Bytes as KB with one decimal, the way the doc writes them: 43800 → "43.8 KB". */
export function kb(bytes: number): string {
  return `${(bytes / 1000).toFixed(1)} KB`
}

/** A plain-text table: page, size, budget, what is left and how much of it is used. */
export function formatTable(sizes: PageSize[]): string {
  const rows = [
    ['Page', 'Gzip', 'Budget', 'Left', 'Used'],
    ...sizes.map((s) => [s.page, kb(s.bytes), kb(s.budget), kb(s.left), `${Math.round((s.bytes / s.budget) * 100)}%`]),
  ]
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)))
  return rows.map((r) => r.map((cell, i) => (i === 0 ? cell.padEnd(widths[i]) : cell.padStart(widths[i]))).join('  ')).join('\n')
}
