// Lighthouse quality gate: every listed page must score 100 in performance,
// accessibility, best practices and SEO, on mobile and on desktop, save the
// exceptions below, each one decided by the author.
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
import { findFailures, median, type PageResult, type ThresholdException } from './lighthouse-scores.ts'

const THRESHOLD = 100

// The 13-day guide in full is ~45 KB of compressed HTML. Lighthouse's
// simulated network then needs one more round trip for the document (the
// window ends near 43.8 KB), which costs 1 point of mobile performance with
// nothing else changed. The author accepted 99 for this page only on
// 2026-10-15 rather than move the day panels out of the HTML (docs/1.13 §5).
//
// The home page's pile of postcards in CSS 3D (components/home/HeroPostcards.astro)
// leaves its mobile performance at 99: the simulated LCP lands one round trip
// later (~1.96 s against ~1.88 s), with the three photos behind the front one
// lazy and low priority. On 2026-10-21 the author asked for 3D on the home
// page only if it keeps 99 or more on mobile and desktop; desktop stays at 100.
//
// Photo quality went up on 2026-10-22 (AVIF 52, the LCP photo 42; see
// GuidePhoto): the author found the photos soft and chose sharpness. The
// Islandia hub then gives 99 on mobile in every run (desktop 100); the
// author kept the quality ("de momento lo dejamos así").
const EXCEPTIONS: ThresholdException[] = [
  { page: '/islandia/islandia-en-camper-13-dias/', device: 'mobile', category: 'performance', threshold: 99 },
  { page: '/', device: 'mobile', category: 'performance', threshold: 99 },
  { page: '/islandia/', device: 'mobile', category: 'performance', threshold: 99 },
]
const RUNS = 3
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const DEVICES = ['mobile', 'desktop'] as const

const [base, ...pages] = process.argv.slice(2)
if (!base || pages.length === 0) {
  console.error('Usage: node scripts/lighthouse-check.ts <base-url> <page> [<page>...]')
  process.exit(2)
}

const outDir = mkdtempSync(join(tmpdir(), 'lighthouse-'))

/**
 * Reads the built page from dist/ (run after `npm run build`), no network.
 * A page given as a file (/404.html) is read as is; a directory URL, from its index.html.
 */
function isNoindex(page: string): boolean {
  const file = page.endsWith('.html') ? join('dist', page) : join('dist', page, 'index.html')
  const html = readFileSync(file, 'utf8')
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

const failures = findFailures(results, THRESHOLD, EXCEPTIONS)
if (failures.length > 0) {
  console.error(`\nBelow ${THRESHOLD}:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log(`\nAll pages at ${THRESHOLD}, mobile and desktop${EXCEPTIONS.length ? ' (save the exceptions listed in the script)' : ''}.`)
