import { test } from 'node:test'
import assert from 'node:assert'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ENGINE_GUIDE_SOURCES, isPublished, guidePath } from '../../engine/index.ts'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'
import { sitemapFilter } from '../../astro.config.mjs'

const SITE = 'https://solohazlamaleta.com'
const LEGACY_GUIDES_DIR = 'src/content/guides'

test('no engine guide that is not published reaches the sitemap', async () => {
  for (const source of ENGINE_GUIDE_SOURCES) {
    const guide = await loadCompiledGuide(source.guide, source.places)
    if (isPublished(guide)) continue
    assert.strictEqual(
      sitemapFilter(SITE + guidePath(guide)), false,
      `${guidePath(guide)} is "${guide.status}" (noindex) but would be listed in the sitemap`,
    )
  }
})

test('the Islandia guide, still "reviewed", stays out of the sitemap', () => {
  assert.strictEqual(sitemapFilter(`${SITE}/islandia/islandia-en-camper-13-dias/`), false)
})

test('no legacy guide marked meta.draft reaches the sitemap', async () => {
  for (const file of (await readdir(LEGACY_GUIDES_DIR)).filter((f) => f.endsWith('.json'))) {
    const { meta } = JSON.parse(await readFile(join(LEGACY_GUIDES_DIR, file), 'utf-8'))
    if (!meta.draft) continue
    const path = `/${meta.destination}/${file.replace(/\.json$/, '')}/`
    assert.strictEqual(sitemapFilter(SITE + path), false, `${path} is a draft but would be listed in the sitemap`)
  }
})

test('print views, affiliate redirects, offers and the 404 page stay out; ordinary pages go in', () => {
  assert.strictEqual(sitemapFilter(`${SITE}/print/islandia/`), false)
  assert.strictEqual(sitemapFilter(`${SITE}/ir/camper/`), false)
  assert.strictEqual(sitemapFilter(`${SITE}/ofertas/`), false)
  assert.strictEqual(sitemapFilter(`${SITE}/404/`), false)
  assert.strictEqual(sitemapFilter(`${SITE}/404.html`), false)
  assert.strictEqual(sitemapFilter(`${SITE}/`), true)
  assert.strictEqual(sitemapFilter(`${SITE}/sobre-mi/`), true)
})
