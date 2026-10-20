// Appends a Content-Security-Policy rule per page to dist/_headers, with the
// hashes of the scripts and styles each page carries inline. Runs after
// `astro build` (see the "build" script), so the hashes always match the
// HTML that ships:
//   node scripts/write-headers.ts [<dist-dir>]
// Fails the build when a page holds something a strict policy would block
// (an inline event handler, a third-party script or image).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { buildPolicy, inspectPage, pagePath, withPolicies } from './security-headers.ts'

const dist = process.argv[2] ?? 'dist'
const headersFile = join(dist, '_headers')

const htmlFiles = (readdirSync(dist, { recursive: true, encoding: 'utf8' }))
  .filter((file) => file.endsWith('.html'))
  .map((file) => join(dist, file))

const pages: { path: string; policy: string }[] = []
const problems: string[] = []
for (const file of htmlFiles) {
  const path = pagePath(relative(dist, file))
  const page = inspectPage(readFileSync(file, 'utf8'))
  problems.push(...page.problems.map((problem) => `${path}: ${problem}`))
  pages.push({ path, policy: buildPolicy(page.assets) })
}

if (problems.length) {
  console.error(`The Content-Security-Policy would block parts of these pages:\n${problems.map((p) => `  - ${p}`).join('\n')}`)
  process.exit(1)
}

writeFileSync(headersFile, withPolicies(readFileSync(headersFile, 'utf8'), pages))
console.log(`${headersFile}: Content-Security-Policy for ${pages.length} pages`)
