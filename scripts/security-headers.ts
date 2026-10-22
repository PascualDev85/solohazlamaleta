// Pure helpers for the per-page Content-Security-Policy that
// scripts/write-headers.ts appends to dist/_headers after `astro build`.
// No file I/O here, so the policy rules are unit-tested on their own.
//
// The built HTML is Astro's own output, regular enough to read with regular
// expressions; anything the policy would block (an inline event handler, a
// third-party script) is reported instead of silently allowed.
import { createHash } from 'node:crypto'

/** What a built page loads or runs inline, as the policy needs to know it. */
export interface PageAssets {
  /** Bodies of inline executable scripts (JSON-LD and other data blocks excluded). */
  inlineScripts: string[]
  /** Bodies of inline <style> elements. */
  inlineStyles: string[]
  /** Whether the page loads its own script or stylesheet files. */
  selfScripts: boolean
  selfStyles: boolean
  /** A style="" attribute anywhere (the budget bars set one). */
  styleAttributes: boolean
  /** A data: image, inline or in CSS (the stops' SVG icons are). */
  dataImages: boolean
}

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
const STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
const TAG = /<[a-z][^>]*>/gi
const attr = (attrs: string, name: string) =>
  new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(attrs)?.slice(1).find((v) => v !== undefined)

/** Script types a browser executes; anything else (application/ld+json) is data. */
const isExecutable = (type: string | undefined) =>
  type === undefined || type === '' || type === 'module' || /^(text|application)\/(java|ecma)script$/i.test(type)

/** Only same-origin paths ("/x", "./x", "x"), never "//host" or "scheme:". */
const isSameOrigin = (url: string) => !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(url.trim())

/**
 * Reads a built page and lists what its policy must allow, plus `problems`:
 * whatever a strict policy would block, which must be fixed in the page, not
 * allowed in the policy.
 */
export function inspectPage(html: string): { assets: PageAssets; problems: string[] } {
  const assets: PageAssets = {
    inlineScripts: [], inlineStyles: [], selfScripts: false, selfStyles: false, styleAttributes: false, dataImages: false,
  }
  const problems: string[] = []

  for (const [, attrs, body] of html.matchAll(SCRIPT)) {
    if (!isExecutable(attr(attrs, 'type'))) continue
    const src = attr(attrs, 'src')
    if (src === undefined) assets.inlineScripts.push(body)
    else if (isSameOrigin(src)) assets.selfScripts = true
    else problems.push(`third-party script: ${src}`)
  }
  for (const [, body] of html.matchAll(STYLE)) assets.inlineStyles.push(body)

  for (const [tag] of html.replace(SCRIPT, '').replace(STYLE, '').matchAll(TAG)) {
    const handler = /\s(on[a-z]+)\s*=/i.exec(tag)
    if (handler) problems.push(`inline event handler (${handler[1]}): ${tag.slice(0, 80)}`)
    if (/\s(href|src|action|formaction)\s*=\s*["']?\s*javascript:/i.test(tag)) problems.push(`javascript: URL: ${tag.slice(0, 80)}`)
    if (/\sstyle\s*=/i.test(tag)) assets.styleAttributes = true
    if (/^<link\b/i.test(tag) && /\srel\s*=\s*["']?stylesheet/i.test(tag)) {
      const href = attr(tag, 'href') ?? ''
      if (isSameOrigin(href)) assets.selfStyles = true
      else problems.push(`third-party stylesheet: ${href}`)
    }
    if (/^<(img|source|video|audio|iframe|embed|object)\b/i.test(tag)) {
      for (const name of ['src', 'srcset', 'data']) {
        const value = attr(tag, name)
        if (value === undefined) continue
        // Only srcset is a list; a data: URL in src has commas of its own.
        const urls = name === 'srcset' ? value.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]) : [value.trim()]
        for (const url of urls) {
          if (/^data:image\//i.test(url)) assets.dataImages = true
          else if (!isSameOrigin(url)) problems.push(`third-party ${tag.slice(1).split(/[\s>]/)[0]}: ${url}`)
        }
      }
    }
  }

  const css = assets.inlineStyles.join('\n')
  for (const [, url] of css.matchAll(/url\(\s*["']?([^"')\s]+)/gi)) {
    if (/^data:image\//i.test(url)) assets.dataImages = true
    else if (!isSameOrigin(url) && !url.startsWith('#')) problems.push(`third-party CSS resource: ${url}`)
  }
  if (/@import\b/i.test(css)) problems.push('CSS @import in an inline style')

  return { assets, problems }
}

/** CSP hash source of an inline script or style body, exactly as served. */
export function hashSource(body: string): string {
  return `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`
}

const unique = (values: string[]) => [...new Set(values)]

/**
 * The page's policy: nothing by default, then exactly what it uses.
 * - Scripts: the hash of each inline script, 'self' only if it loads files.
 * - Styles: inline <style> by hash (style-src-elem); style="" attributes
 *   cannot be hashed without 'unsafe-hashes', so style-src-attr allows them
 *   inline only on pages that have one. style-src is the fallback for
 *   browsers without the -elem/-attr split (Safari < 15.4, Firefox < 108):
 *   'unsafe-inline' there, since hashes would switch it off and drop the
 *   attributes.
 * - Images and fonts from the site itself; data: images where CSS uses them.
 * - No frames, no plugins, no forms, no <base>, never framed.
 */
export function buildPolicy(assets: PageAssets): string {
  const list = (sources: string[]) => (sources.length ? sources.join(' ') : "'none'")
  const scripts = unique([...(assets.selfScripts ? ["'self'"] : []), ...assets.inlineScripts.map(hashSource)])
  const styles = unique([...(assets.selfStyles ? ["'self'"] : []), ...assets.inlineStyles.map(hashSource)])
  return [
    "default-src 'none'",
    `script-src ${list(scripts)}`,
    "style-src 'self' 'unsafe-inline'",
    `style-src-elem ${list(styles)}`,
    `style-src-attr ${assets.styleAttributes ? "'unsafe-inline'" : "'none'"}`,
    `img-src 'self'${assets.dataImages ? ' data:' : ''}`,
    "font-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ')
}

/** URL path a built file answers at: "islandia/x/index.html" → "/islandia/x/". */
export function pagePath(file: string): string {
  const path = '/' + file.split('\\').join('/').replace(/^\/+/, '')
  return path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path
}

/** Cloudflare Pages limits for _headers: 100 rules, 2,000 characters a line. */
export const MAX_RULES = 100
export const MAX_LINE = 2000

/** Marks where the generated rules start, so a second run replaces them. */
export const GENERATED_MARKER = '# --- Generated by scripts/write-headers.ts: one CSP rule per page ---'

/**
 * The _headers file with one Content-Security-Policy rule per page appended
 * after the hand-written ones (anything after the marker is replaced).
 * Throws when the result breaks Cloudflare's limits, which would otherwise
 * drop rules silently on deploy.
 */
export function withPolicies(headers: string, pages: { path: string; policy: string }[]): string {
  const base = headers.split(GENERATED_MARKER)[0].trimEnd()
  const rules = [...pages]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, policy }) => `${path}\n  Content-Security-Policy: ${policy}`)
  const text = `${base}\n\n${GENERATED_MARKER}\n\n${rules.join('\n\n')}\n`

  const total = parseHeaders(text).length
  if (total > MAX_RULES) throw new Error(`_headers has ${total} rules; Cloudflare Pages reads at most ${MAX_RULES}`)
  const long = text.split('\n').find((line) => line.length > MAX_LINE)
  if (long) throw new Error(`_headers line over ${MAX_LINE} characters: ${long.slice(0, 80)}…`)
  return text
}

/** One rule of a _headers file: a path pattern and its headers. */
export interface HeaderRule {
  path: string
  headers: [string, string][]
}

/** Reads a _headers file: comments and blank lines skipped, indented lines are headers. */
export function parseHeaders(text: string): HeaderRule[] {
  const rules: HeaderRule[] = []
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    if (!/^\s/.test(line)) {
      rules.push({ path: line.trim(), headers: [] })
      continue
    }
    const colon = line.indexOf(':')
    if (colon === -1 || rules.length === 0) throw new Error(`Bad _headers line: ${line}`)
    rules.at(-1)!.headers.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()])
  }
  return rules
}

/**
 * The headers Cloudflare Pages would send for a path: those of every
 * matching rule, a header set twice joined with ", ". Supports the patterns
 * this site uses: exact paths and a trailing "*" splat.
 */
export function headersFor(rules: HeaderRule[], path: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const rule of rules) {
    const matches = rule.path.endsWith('*') ? path.startsWith(rule.path.slice(0, -1)) : path === rule.path
    if (!matches) continue
    for (const [name, value] of rule.headers) {
      const key = name.toLowerCase()
      out[key] = out[key] === undefined ? value : `${out[key]}, ${value}`
    }
  }
  return out
}
