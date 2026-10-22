import { getCollection } from 'astro:content'
import { loadCompiledGuide } from './engine-guide.ts'
import { ENGINE_GUIDE_SOURCES, fromCompiledGuide, fromLegacyGuide } from './guide-list.ts'
import type { MenuGuide } from './site-menu.ts'

let guides: Promise<MenuGuide[]> | undefined

/**
 * Every guide the home lists, as the site menu needs it. Loaded once per
 * build: every page renders the header, and compiling the engine guide for
 * each would repeat its work and its warnings.
 */
export function loadMenuGuides(): Promise<MenuGuide[]> {
  guides ??= (async () => {
    const legacy = (await getCollection('guides')).map((g) => ({ ...fromLegacyGuide(g.id, g.data), hub: null }))
    const engine = (await Promise.all(ENGINE_GUIDE_SOURCES.map((s) => loadCompiledGuide(s.guide, s.places)))).map((g) => ({
      ...fromCompiledGuide(g),
      hub: g.hub,
    }))
    return [...legacy, ...engine]
  })()
  return guides
}
