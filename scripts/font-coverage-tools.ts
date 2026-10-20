// Pure helpers for the font coverage check (scripts/font-coverage.ts): read the
// characters a woff2 covers and the characters a built page paints. No file
// I/O here, so both sides are unit-tested on their own.
import { brotliDecompressSync } from 'node:zlib'

// Painted by a system font on purpose: neither the subsets nor upstream Nunito
// have them (Literata does upstream). New entries need a reason.
export const SYSTEM_FALLBACK = new Map([
  ['→', 'arrow in Nunito labels; upstream Nunito has no U+2192'],
  ['≈', 'drive time in Nunito; dropped by the latin subset'],
])

// WOFF2 table directory: https://www.w3.org/TR/WOFF2/#table_dir_format
const KNOWN_TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep']

/** Code points a woff2 font maps to a glyph. `label` names it in errors. */
export function woff2Cmap(buf: Buffer, label: string): Set<number> {
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${label}: not a woff2 file`)
  const numTables = buf.readUInt16BE(12)
  const compressedSize = buf.readUInt32BE(20)
  let pos = 48
  const base128 = () => {
    let value = 0
    for (let i = 0; i < 5; i++) {
      const byte = buf[pos++]
      value = value * 128 + (byte & 0x7f)
      if (!(byte & 0x80)) return value
    }
    throw new Error(`${label}: bad UIntBase128`)
  }
  let offset = 0
  let cmap: { offset: number; length: number } | undefined
  for (let i = 0; i < numTables; i++) {
    const flags = buf[pos++]
    const index = flags & 0x3f
    const tag = index === 63 ? buf.toString('latin1', pos, (pos += 4)) : KNOWN_TAGS[index]
    const version = flags >> 6
    const length = base128()
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0
    const stored = transformed ? base128() : length
    if (tag === 'cmap') cmap = { offset, length }
    offset += stored
  }
  if (!cmap) throw new Error(`${label}: no cmap table`)
  const data = brotliDecompressSync(buf.subarray(pos, pos + compressedSize))
  return parseCmap(data.subarray(cmap.offset, cmap.offset + cmap.length))
}

// Unicode subtables only, formats 4 and 12; a code point counts when it maps
// to a real glyph (not .notdef).
function parseCmap(cmap: Buffer): Set<number> {
  const codes = new Set<number>()
  const numTables = cmap.readUInt16BE(2)
  for (let i = 0; i < numTables; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8)
    const encoding = cmap.readUInt16BE(6 + i * 8)
    if (!(platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10)))) continue
    const sub = cmap.subarray(cmap.readUInt32BE(8 + i * 8))
    const format = sub.readUInt16BE(0)
    if (format === 4) {
      const segCount = sub.readUInt16BE(6) / 2
      const ends = 14
      const starts = ends + segCount * 2 + 2
      const deltas = starts + segCount * 2
      const rangeOffsets = deltas + segCount * 2
      for (let s = 0; s < segCount; s++) {
        const start = sub.readUInt16BE(starts + s * 2)
        const end = sub.readUInt16BE(ends + s * 2)
        const delta = sub.readUInt16BE(deltas + s * 2)
        const rangeOffset = sub.readUInt16BE(rangeOffsets + s * 2)
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let glyph = 0
          if (rangeOffset === 0) glyph = (c + delta) & 0xffff
          else {
            const at = rangeOffsets + s * 2 + rangeOffset + (c - start) * 2
            const raw = sub.readUInt16BE(at)
            glyph = raw === 0 ? 0 : (raw + delta) & 0xffff
          }
          if (glyph !== 0) codes.add(c)
        }
      }
    } else if (format === 12) {
      const groups = sub.readUInt32BE(12)
      for (let g = 0; g < groups; g++) {
        const start = sub.readUInt32BE(16 + g * 12)
        const end = sub.readUInt32BE(20 + g * 12)
        const glyph = sub.readUInt32BE(24 + g * 12)
        for (let c = start; c <= end; c++) if (glyph + (c - start) !== 0) codes.add(c)
      }
    }
  }
  return codes
}

// Astro only writes these; any other named entity stops the check rather than
// hide the character it stands for.
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
export const decode = (text: string, file: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (_, body: string) => {
    if (body[0] === '#') return String.fromCodePoint(body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : Number(body.slice(1)))
    if (body in NAMED) return NAMED[body]
    throw new Error(`${file}: unknown entity &${body}; add it to NAMED in scripts/font-coverage-tools.ts`)
  })

/** The strings of a stylesheet's `content` declarations. */
export const cssContent = (css: string) =>
  [...css.matchAll(/content:\s*(?:"([^"]*)"|'([^']*)')/g)].map(([, double, single]) => double ?? single ?? '').join(' ')

/** Non-ASCII characters of a script, for scripts that write text. */
export const scriptText = (js: string) => js.replace(/[\x00-\x7f]/g, '')

// Painted text of a page: text nodes, CSS `content` strings and, for scripts
// that write text, every non-ASCII character in them. Not painted with the
// web fonts, so left out: <title> (the browser tab) and data scripts such as
// JSON-LD.
export function paintedText(html: string, file: string): string {
  const parts: string[] = []
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, ' ')
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs: string, js: string) => {
      const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1].toLowerCase()
      if (!type || type === 'module' || type.includes('javascript')) parts.push(scriptText(js))
      return ' '
    })
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
      parts.push(cssContent(css))
      return ' '
    })
    .replace(/<[^>]*>/g, ' ')
  parts.push(decode(body, file))
  return parts.join(' ')
}

/** Characters of `text` that no font covers, in order of first use. */
export function uncovered(text: string, covered: Set<number>): string[] {
  const missing = new Set<string>()
  for (const char of text) {
    if (/[\s\p{Cc}\p{Cf}]/u.test(char) || covered.has(char.codePointAt(0)!)) continue
    missing.add(char)
  }
  return [...missing]
}
