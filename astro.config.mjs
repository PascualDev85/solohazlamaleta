// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

const GUIDES_DIR = 'src/content/guides';

/**
 * URL paths that carry `noindex` and must therefore stay out of the sitemap.
 * Listing a noindex page in a sitemap sends search engines contradictory
 * instructions, so the two rules are derived from the same source here.
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

const excludedPaths = draftGuidePaths();

export default defineConfig({
  site: 'https://solohazlamaleta.com',
  trailingSlash: 'always',
  integrations: [
    vue(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;

        // Print views, affiliate redirects and offers are never indexed.
        if (path.startsWith('/print/') || path.startsWith('/ir/') || path.startsWith('/ofertas/')) {
          return false;
        }

        return !excludedPaths.includes(path);
      },
    }),
  ],
});
