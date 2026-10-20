// HTML size budget: the gzipped HTML of every page in dist/ must stay under
// its cap (PAGE_BUDGETS in scripts/html-size.ts, from docs/1.13 §5).
//   node scripts/html-size-check.ts [<dist-dir>]
// Run it after `npm run build`. It prints every page's size and what is left,
// so growth shows before it costs a Lighthouse point.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { formatTable, gzipSize, measure, overBudget, pageFromFile } from './html-size.ts'

const [dir = 'dist'] = process.argv.slice(2)
const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.html'))
if (files.length === 0) {
  console.error(`No HTML in ${dir}/: run \`npm run build\` first.`)
  process.exit(2)
}

const sizes = measure(files.map((f) => ({ page: pageFromFile(f), bytes: gzipSize(readFileSync(join(dir, f))) })))
console.log(formatTable(sizes))

const over = overBudget(sizes)
if (over.length > 0) {
  console.error(`\nOver the HTML size budget (docs/1.13 §5):\n  ${over.join('\n  ')}`)
  process.exit(1)
}
console.log(`\nAll ${sizes.length} pages under their HTML size budget.`)
