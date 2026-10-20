// Every character the built site paints must be in one of the self-hosted
// fonts: node scripts/font-coverage.ts [<dist-dir>]
// The fonts are subsets (see src/styles/v2/_fonts.scss), so a new letter in a
// guide (a Czech "ř", a Turkish "ğ") would silently fall back to a system font.
// This reads the cmap of every woff2 in <dist>/fonts (no font library: woff2
// is brotli, which node:zlib decodes) and fails on any character in the HTML
// text, CSS `content` strings (inline or in .css files) or scripts that none
// of them covers. Helpers in scripts/font-coverage-tools.ts.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { SYSTEM_FALLBACK, cssContent, paintedText, scriptText, uncovered, woff2Cmap } from './font-coverage-tools.ts'

const dist = process.argv[2] ?? 'dist'

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

const fontFiles = walk(join(dist, 'fonts')).filter((file) => file.endsWith('.woff2'))
if (fontFiles.length === 0) {
  console.error(`No woff2 fonts in ${join(dist, 'fonts')}: run the build first.`)
  process.exit(2)
}
const covered = new Set<number>()
for (const file of fontFiles) for (const code of woff2Cmap(readFileSync(file), file)) covered.add(code)

const sources = walk(dist).filter((file) => /\.(html|css|js)$/.test(file))
const missing = new Map<string, string>()
const fallbacks = new Set<string>()
for (const file of sources) {
  const raw = readFileSync(file, 'utf8')
  const text = file.endsWith('.html') ? paintedText(raw, file) : file.endsWith('.css') ? cssContent(raw) : scriptText(raw)
  for (const char of uncovered(text, covered)) {
    if (SYSTEM_FALLBACK.has(char)) fallbacks.add(char)
    else if (!missing.has(char)) missing.set(char, relative(dist, file))
  }
}

const hex = (char: string) => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`
console.log(`${fontFiles.length} fonts cover ${covered.size} code points; ${sources.length} built files checked.`)
for (const char of fallbacks) console.log(`  allowed system fallback: ${char} ${hex(char)} (${SYSTEM_FALLBACK.get(char)})`)
if (missing.size > 0) {
  console.error(`\n${missing.size} character(s) no self-hosted font covers:`)
  for (const [char, file] of missing) console.error(`  ${char} ${hex(char)}, first in ${file}`)
  console.error('\nRe-subset the fonts with them (see src/styles/v2/_fonts.scss) or change the text.')
  process.exit(1)
}
console.log('Every painted character is covered.')
