import { getCollection } from 'astro:content'
import { loadCompiledGuide } from './engine-guide.ts'
import {
  ENGINE_GUIDE_SOURCES, fromLegacyGuide, fromCompiledGuide, sortGuideList,
} from './guide-list.ts'
import type { GuideListItem } from './guide-list.ts'

/**
 * Every guide the site renders, legacy collection and engine alike, in the
 * landing page's order. Shared by the home and the 404 page so both list the
 * same guides. Kept out of guide-list.ts because astro:content only resolves
 * inside Astro, and tests/lib imports that module under plain node.
 */
export async function loadGuideList(): Promise<GuideListItem[]> {
  const legacyGuides = await getCollection('guides')
  const engineGuides = await Promise.all(
    ENGINE_GUIDE_SOURCES.map((source) => loadCompiledGuide(source.guide, source.places)),
  )
  return sortGuideList([
    ...legacyGuides.map((guide) => fromLegacyGuide(guide.id, guide.data)),
    ...engineGuides.map(fromCompiledGuide),
  ])
}
