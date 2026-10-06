// Lighthouse quality gate: every listed page must score 100 in performance,
// accessibility, best practices and SEO, on mobile and on desktop.
//
//   node scripts/lighthouse-check.ts <base-url> <page> [<page>...]
//   e.g. node scripts/lighthouse-check.ts http://localhost:4321 / /islandia/islandia-en-camper-13-dias/
//
// Each page is measured RUNS times per device and judged on the median, so a
// single noisy run never decides. Run it after `npm run build`, from the repo
// root, with the site served at <base-url>. Draft pages carry noindex on purpose: for
// them only the "is crawlable" audit is skipped; the rest of SEO still counts.
// Set CHROME_PATH to use a specific Chrome (e.g. Playwright's) locally.
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { findFailures, median, type PageResult } from './lighthouse-scores.ts'

const THRESHOLD = 100
const RUNS = 3
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const DEVICES = ['mobile', 'desktop'] as const

const [base, ...pages] = process.argv.slice(2)
if (!base || pages.length === 0) {
  console.error('Usage: node scripts/lighthouse-check.ts <base-url> <page> [<page>...]')
  process.exit(2)
}

const outDir = mkdtempSync(join(tmpdir(), 'lighthouse-'))

/** Reads the built page from dist/ (run after `npm run build`), no network. */
function isNoindex(page: string): boolean {
  const html = readFileSync(join('dist', page, 'index.html'), 'utf8')
  return /<meta[^>]+name="robots"[^>]+noindex/i.test(html)
}

function runLighthouse(url: string, device: string, skipCrawlable: boolean): Record<string, number> {
  const out = join(outDir, 'report.json')
  const args = [
    '--yes', 'lighthouse', url, '--quiet', '--output=json', `--output-path=${out}`,
    `--only-categories=${CATEGORIES.join(',')}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ]
  if (device === 'desktop') args.push('--preset=desktop')
  if (skipCrawlable) args.push('--skip-audits=is-crawlable')
  execFileSync('npx', args, { stdio: 'ignore' })
  const report = JSON.parse(readFileSync(out, 'utf8'))
  return Object.fromEntries(CATEGORIES.map((c) => [c, Math.round(report.categories[c].score * 100)]))
}

const results: PageResult[] = []
for (const page of pages) {
  const url = new URL(page, base).href
  const skipCrawlable = isNoindex(page)
  for (const device of DEVICES) {
    const runs: Record<string, number[]> = Object.fromEntries(CATEGORIES.map((c) => [c, []]))
    for (let i = 0; i < RUNS; i++) {
      const scores = runLighthouse(url, device, skipCrawlable)
      for (const c of CATEGORIES) runs[c].push(scores[c])
    }
    results.push({ page, device, runs })
    const line = CATEGORIES.map((c) => `${c} ${median(runs[c])}`).join(' · ')
    console.log(`${page} (${device})${skipCrawlable ? ' [noindex]' : ''}: ${line}`)
  }
}

const failures = findFailures(results, THRESHOLD)
if (failures.length > 0) {
  console.error(`\nBelow ${THRESHOLD}:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log(`\nAll pages at ${THRESHOLD}, mobile and desktop.`)
