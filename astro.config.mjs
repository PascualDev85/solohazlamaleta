// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

import {
  ENGINE_GUIDE_SOURCES, loadGuide, loadPlaces, buildPlaceRegistry, validateGuide, compileGuide, unpublishedGuidePaths,
} from './engine/index.ts';

const GUIDES_DIR = 'src/content/guides';

/**
 * URL paths of the legacy collection's drafts (`meta.draft`), which carry
 * `noindex` and must therefore stay out of the sitemap. Listing a noindex
 * page in a sitemap sends search engines contradictory instructions, so the
 * two rules are derived from the same source here.
 */
function draftGuidePaths() {
  return readdirSync(GUIDES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      slug: file.replace(/\.json$/, ''),
      data: JSON.parse(readFileSync(join(GUIDES_DIR, file), 'utf8')),
    }))
    .filter((guide) => guide.data.meta?.draft)
    .map((guide) => `/${guide.data.meta.destination}/${guide.slug}/`);
}

/**
 * Engine guides that are not `published`, compiled the same way their pages
 * are (load → validate → compile). Their pages derive `noindex` from the same
 * status with the same helper (isPublished), so the two cannot disagree.
 * Warnings are left to the page build, which prints them; errors stop here,
 * since a guide whose status cannot be read must not reach the sitemap.
 * No affiliate registry yet, as in src/lib/engine-guide.ts.
 */
async function unpublishedEngineGuidePaths() {
  const guides = [];
  for (const source of ENGINE_GUIDE_SOURCES) {
    const { registry: places, errors: placeErrors } = buildPlaceRegistry(
      /** @type {unknown[]} */ (await loadPlaces(source.places)),
    );
    const affiliates = { get: () => undefined };
    const result = validateGuide(await loadGuide(source.guide), places, affiliates);
    const errors = [...placeErrors, ...result.errors];
    if (errors.length > 0 || !result.guide) {
      throw new Error(`La guía "${source.guide}" no pasa la validación:\n${errors.join('\n')}`);
    }
    guides.push(compileGuide(result.guide, places, affiliates));
  }
  return unpublishedGuidePaths(guides);
}

/** Everything that carries `noindex`, so it must stay out of the sitemap too. */
const excludedPaths = [...draftGuidePaths(), ...(await unpublishedEngineGuidePaths())];

/**
 * Which pages go in the sitemap. Exported for tests/config/sitemap.test.ts.
 * @param {string} page
 */
export function sitemapFilter(page) {
  const path = new URL(page).pathname;

  // Print views, affiliate redirects and offers are never indexed.
  if (path.startsWith('/print/') || path.startsWith('/ir/') || path.startsWith('/ofertas/')) {
    return false;
  }

  return !excludedPaths.includes(path);
}

export default defineConfig({
  site: 'https://solohazlamaleta.com',
  trailingSlash: 'always',
  build: {
    // Inline every page's CSS (about 10 KB gzipped on the heaviest page)
    // instead of linking it. A linked stylesheet blocks the first paint, and
    // on the guide that delay pushed the cover photo (the LCP element) past
    // Lighthouse's 100 threshold on mobile. The site is a handful of static
    // pages, so the lost cross-page CSS caching costs little.
    inlineStylesheets: 'always',
  },
  integrations: [
    vue(),
    sitemap({ filter: sitemapFilter }),
  ],
});
