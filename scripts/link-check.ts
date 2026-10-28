// Internal links of a page group: every link of the pages under <prefix>
// points at a page or file that is in the build and, with a #fragment, at an
// id that page has; page links keep the trailing slash.
//   node scripts/link-check.ts [<dist-dir>] [<prefix>]
// Run it after `npm run build`. Exits 1 and lists the broken links.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pageFromFile } from './html-size.ts'
import { brokenLinks } from './link-check-tools.ts'

const [dir = 'dist', prefix = '/islandia/'] = process.argv.slice(2)
const all = readdirSync(dir, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile())
const relative = (entry: (typeof all)[number]) => join(entry.parentPath, entry.name).slice(dir.length).replace(/^[\\/]+/, '')

const pages = new Map<string, string>()
const files = new Set<string>()
for (const entry of all) {
  const file = relative(entry)
  if (file.endsWith('.html')) pages.set(pageFromFile(file), readFileSync(join(dir, file), 'utf8'))
  else files.add(`/${file.split(/[\\/]+/).join('/')}`)
}

const checked = [...pages.keys()].filter((page) => page.startsWith(prefix)).sort()
if (checked.length === 0) {
  console.error(`No pages under ${prefix} in ${dir}/: run \`npm run build\` first.`)
  process.exit(2)
}

const broken = brokenLinks(pages, files, checked)
if (broken.length > 0) {
  console.error(`Broken internal links:\n  ${broken.join('\n  ')}`)
  process.exit(1)
}
console.log(`Every internal link of ${checked.length} pages under ${prefix} resolves:\n  ${checked.join('\n  ')}`)
