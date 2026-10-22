import type { CompiledGuide } from './types.ts'

/**
 * Engine guides the site builds, as paths for the load → validate → compile
 * pipeline. Explicit while there is a single engine guide: a glob over
 * content/guides would be the first discovery mechanism, and it is not
 * needed yet. Lives in the engine so that both the landing page (src/) and
 * the sitemap (astro.config.mjs, which cannot import src/) read one list;
 * the hub finds its guides and satellites in it too (src/lib/hubLinks.ts).
 */
export const ENGINE_GUIDE_SOURCES: { guide: string; places: string }[] = [
  {
    guide: 'content/guides/islandia/islandia-en-camper-13-dias.yaml',
    places: 'content/places/islandia.yaml',
  },
]

/**
 * Whether a guide is public: indexed and in the sitemap. Only `published`
 * is; `draft`, `reviewed` and `archived` all stay out of search engines.
 * The data contract (1.7.2) lists the four values without saying which are
 * indexed, so this is the rule the landing page already applied to mark
 * drafts (PR #21): anything not yet `published` is a draft.
 */
export function isPublished(guide: Pick<CompiledGuide, 'status'>): boolean {
  return guide.status === 'published'
}

/** The guide's page URL path, with the trailing slash the site always uses. */
export function guidePath(guide: Pick<CompiledGuide, 'destination' | 'slug'>): string {
  return `/${guide.destination}/${guide.slug}/`
}

/** URL paths of the guides that must carry noindex and stay out of the sitemap. */
export function unpublishedGuidePaths(guides: Pick<CompiledGuide, 'status' | 'destination' | 'slug'>[]): string[] {
  return guides.filter((guide) => !isPublished(guide)).map(guidePath)
}

/**
 * A hub is public once any guide under it (by its `hub` path) is published:
 * 1.13 §6 keeps it noindex "mientras la guía sea borrador". One switch, the
 * guides' own status, for both its page and the sitemap.
 */
export function isHubPublished(hub: string, guides: Pick<CompiledGuide, 'status' | 'hub'>[]): boolean {
  return guides.some((guide) => guide.hub === hub && isPublished(guide))
}

/** The hubs none of whose guides is published yet: noindex, and out of the sitemap. */
export function unpublishedHubPaths(guides: Pick<CompiledGuide, 'status' | 'hub'>[]): string[] {
  const hubs = [...new Set(guides.map((guide) => guide.hub).filter(Boolean))]
  return hubs.filter((hub) => !isHubPublished(hub, guides))
}
