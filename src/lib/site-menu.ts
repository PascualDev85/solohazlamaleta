// The site menu: which destinations it lists and where each one links. Built
// from the data at build time, so a new guide or hub needs no menu edit.

/** What the menu needs of one guide, whichever source it comes from. */
export interface MenuGuide {
  destination: string
  url: string
  /** The destination hub's path (engine guides). Legacy guides have none. */
  hub?: string | null
  draft: boolean
}

export interface MenuLink {
  href: string
  label: string
}

export interface SiteLink extends MenuLink {
  children: MenuLink[]
}

/** The URL path of a page file under src/pages, or null for a dynamic route ([param]). */
export function pagePathFromFile(file: string): string | null {
  const route = file.replace(/^.*\/pages\//, '').replace(/\.astro$/, '')
  if (route.includes('[')) return null
  const path = route === 'index' ? '' : route.replace(/(^|\/)index$/, '')
  return path ? `/${path}/` : '/'
}

/** "islandia" → "Islandia". Slugs carry no accents: a destination that needs one will need its name in the data. */
const destinationLabel = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')

/**
 * One entry per destination, alphabetical. A destination links to its hub
 * when that page exists, otherwise to its guide (the first given, published
 * before drafts). A draft only shows where the page already shows it: its own
 * page, its hub and the catalogue (`catalogPath`, the home's list).
 */
export function menuDestinations(
  guides: MenuGuide[],
  { currentPath, pagePaths, catalogPath = '/' }: { currentPath: string; pagePaths: Set<string>; catalogPath?: string },
): MenuLink[] {
  const shown = guides.filter((g) => !g.draft || currentPath === catalogPath || currentPath === g.url || (!!g.hub && currentPath === g.hub))
  const byDestination = new Map<string, MenuLink>()
  for (const guide of [...shown.filter((g) => !g.draft), ...shown.filter((g) => g.draft)]) {
    const hub = guide.hub && pagePaths.has(guide.hub) ? guide.hub : null
    const current = byDestination.get(guide.destination)
    if (!current) byDestination.set(guide.destination, { href: hub ?? guide.url, label: destinationLabel(guide.destination) })
    else if (hub) current.href = hub
  }
  return [...byDestination.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'))
}

/** The site's links, with the destinations under "Guías" (the home's guide list). */
export function siteLinks(navLinks: MenuLink[], destinations: MenuLink[], guidesHref = '/#guias'): SiteLink[] {
  return navLinks.map((link) => ({ href: link.href, label: link.label, children: link.href === guidesHref ? destinations : [] }))
}

/**
 * Whether the links fit in the desktop header's one row next to the brand.
 * Counted in characters: at the narrowest desktop (768px) the brand and 40
 * characters of links, with their padding, fill the row in both designs.
 */
export function inlineFits(links: SiteLink[], maxChars = 40): boolean {
  const chars = links.reduce((sum, link) => sum + link.label.length + link.children.reduce((s, c) => s + c.label.length, 0), 0)
  return chars <= maxChars
}
