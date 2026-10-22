// Links between a hub and its guides, built from the data (each guide's `hub`
// path and `type`), never written by hand (BACKLOG: internal linking).
import { guidePath, isPublished } from '../../engine/index.ts'
import type { CompiledGuide } from '../../engine/index.ts'
import {
  HUB_FAQ_ID, HUB_GUIDES_ID, HUB_MOVING_ID, HUB_PRACTICAL_ID, HUB_SEE_ID, HUB_WHEN_ID, hubSectionHref,
} from './anchors.ts'

export type LinkPage = Pick<CompiledGuide, 'slug' | 'destination' | 'hub' | 'type' | 'status' | 'title'>

/** A guide or satellite of a hub, with its page URL. */
export type HubMember<T extends LinkPage = LinkPage> = T & { url: string }

export interface HubSection {
  id: string
  label: string
  icon: string
}

export interface Link {
  href: string
  label: string
}

/**
 * Whether a page is public (indexed, in the sitemap). The hub is noindex for
 * now whatever its status (1.13 §6): how it goes public is still the author's
 * call (#26, decision 2), and when it is made this is the line to change.
 */
export function isPagePublished(page: Pick<CompiledGuide, 'type' | 'status'>): boolean {
  return page.type !== 'hub' && isPublished(page)
}

/** What is not published is never linked from what is. */
export function canLink(from: Pick<CompiledGuide, 'type' | 'status'>, to: Pick<CompiledGuide, 'type' | 'status'>): boolean {
  return isPagePublished(to) || !isPagePublished(from)
}

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`)

/** The hub's data file, from a guide's `hub` path: "/islandia/" → content/guides/islandia/islandia.yaml. */
export function hubSourcePath(hub: string): string {
  const slug = hub.split('/').filter(Boolean).at(-1)
  return `content/guides/${slug}/${slug}.yaml`
}

/** The guides and satellites whose `hub` is this hub and that it may link to, in source order. */
export function hubMembers<T extends LinkPage>(
  hub: LinkPage,
  pages: T[],
): { guides: HubMember<T>[]; satellites: HubMember<T>[] } {
  const members = pages
    .filter((page) => page.type !== 'hub' && withSlash(page.hub) === withSlash(hub.hub) && canLink(hub, page))
    .map((page) => ({ ...page, url: guidePath(page) }))
  return {
    guides: members.filter((page) => page.type === 'itinerary'),
    satellites: members.filter((page) => page.type === 'satellite'),
  }
}

type HubContent = Partial<Pick<CompiledGuide, 'when_to_go' | 'practical' | 'transport' | 'faq'>>

/**
 * The hub's sections in page order, only those with content (1.11 §9: no
 * empty sections). "Nuestra guía" and "Qué ver" come from the hub's guides,
 * so the caller says whether they render.
 */
export function hubSections(hub: HubContent, derived: { guides: boolean; see: boolean }): HubSection[] {
  return [
    { id: HUB_GUIDES_ID, label: 'Nuestra guía', icon: 'route', visible: derived.guides },
    { id: HUB_SEE_ID, label: 'Qué ver', icon: 'pin', visible: derived.see },
    { id: HUB_WHEN_ID, label: 'Cuándo ir', icon: 'booking', visible: (hub.when_to_go?.length ?? 0) > 0 },
    { id: HUB_PRACTICAL_ID, label: 'Lo práctico', icon: 'practical', visible: Boolean(hub.practical) },
    { id: HUB_MOVING_ID, label: 'Cómo moverse', icon: 'transport', visible: (hub.transport?.local?.length ?? 0) > 0 },
    { id: HUB_FAQ_ID, label: 'Preguntas sobre Islandia', icon: 'faq', visible: (hub.faq?.length ?? 0) > 0 },
  ]
    .filter((section) => section.visible)
    .map(({ visible: _, ...section }) => section)
}

/**
 * The guide's closing, "Si estás preparando <destino>" (1.9 B.11): the hub,
 * its destination sections and the hub's satellites. Not "Nuestra guía" nor
 * "Qué ver": both lead back to this guide. Null when the guide may not link
 * to the hub.
 */
export function guideClosing(
  guide: LinkPage,
  hub: LinkPage & HubContent,
  pages: LinkPage[],
): { hubHref: string; links: Link[] } | null {
  if (!canLink(guide, hub)) return null
  const sections = hubSections(hub, { guides: false, see: false }).map((section) => ({
    href: hubSectionHref(hub.hub, section.id),
    label: section.label,
  }))
  const satellites = hubMembers(hub, pages)
    .satellites.filter((satellite) => canLink(guide, satellite))
    .map((satellite) => ({ href: satellite.url, label: satellite.title }))
  return { hubHref: withSlash(hub.hub), links: [...sections, ...satellites] }
}
