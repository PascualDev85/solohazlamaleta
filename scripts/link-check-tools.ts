// Pure helpers for the internal link check (scripts/link-check.ts). No I/O
// here, so the rule is unit-tested on its own.

const ENTITIES: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' }
const decode = (text: string) => text.replace(/&(amp|quot|#39|lt|gt);/g, (entity) => ENTITIES[entity])

/** The href of every <a> in the page, entities decoded. */
export function anchorHrefs(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi)].map((match) => decode(match[1] ?? match[2]))
}

/** Every id in the page. */
export function elementIds(html: string): Set<string> {
  return new Set([...html.matchAll(/\sid=(?:"([^"]*)"|'([^']*)')/gi)].map((match) => decode(match[1] ?? match[2])))
}

// Any origin works: it only resolves relative links against the page's path.
const BASE = 'http://site.invalid'

/**
 * Broken internal links of the given pages: a page or file that is not in
 * the build, an id the target page lacks, or a page path without its
 * trailing slash. External links are not checked.
 * `pages` maps each built page's URL path ("/islandia/") to its HTML;
 * `files` holds the paths of the other built files ("/favicon.svg").
 */
export function brokenLinks(pages: Map<string, string>, files: Set<string>, checked: string[]): string[] {
  const ids = new Map<string, Set<string>>()
  const idsOf = (page: string) => {
    if (!ids.has(page)) ids.set(page, elementIds(pages.get(page) ?? ''))
    return ids.get(page)!
  }

  const broken: string[] = []
  for (const page of checked) {
    for (const href of anchorHrefs(pages.get(page) ?? '')) {
      const url = new URL(href, BASE + page)
      if (url.origin !== BASE) continue
      const report = (reason: string) => broken.push(`${page} → ${href}: ${reason}`)
      const path = decodeURIComponent(url.pathname)
      const id = decodeURIComponent(url.hash.slice(1))
      const isFile = /\.[a-z0-9]+$/i.test(path)

      if (isFile) {
        if (!files.has(path) && !pages.has(path)) report('no such file')
      } else if (!path.endsWith('/')) {
        report('no trailing slash')
      } else if (!pages.has(path)) {
        report('no such page')
      } else if (id && !idsOf(path).has(id)) {
        report(`no id "${id}" there`)
      }
    }
  }
  return broken
}
