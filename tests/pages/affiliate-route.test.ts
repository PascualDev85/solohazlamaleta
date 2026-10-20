// Renders the real src/pages/ir/[id].astro with a test-only affiliate
// registry (tests/fixtures/affiliates.json), swapped in for
// src/data/affiliates.json inside this test's own Vite server. Nothing is
// built to dist/, so the test partner never reaches the published site.
import { test, after } from 'node:test'
import assert from 'node:assert'
import { fileURLToPath } from 'node:url'
import { createServer, type Plugin } from 'vite'
import { getViteConfig } from 'astro/config'
import { sitemapFilter } from '../../astro.config.mjs'

const SITE = 'https://solohazlamaleta.com'
const FIXTURE = fileURLToPath(new URL('../fixtures/affiliates.json', import.meta.url))
const REAL_REGISTRY = fileURLToPath(new URL('../../src/data/affiliates.json', import.meta.url))

const useFixtureRegistry: Plugin = {
  name: 'test-affiliate-fixture',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
    return resolved?.id === REAL_REGISTRY ? FIXTURE : null
  },
}

const config = await getViteConfig({
  plugins: [useFixtureRegistry],
  logLevel: 'silent',
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
}, { logLevel: 'silent' })({ command: 'serve', mode: 'test' })
const server = await createServer({ ...config, configFile: false })
after(() => server.close())

const page = await server.ssrLoadModule('/src/pages/ir/[id].astro')
const { experimental_AstroContainer: AstroContainer } = await server.ssrLoadModule('astro/container')
const container = await AstroContainer.create()

type Route = { params: { id: string }; props: { url: string; partnerName: string } }
const routes: Route[] = page.getStaticPaths()

async function render(route: Route): Promise<string> {
  return container.renderToString(page.default, { params: route.params, props: route.props })
}

test('only the active test partner gets a page; the inactive one gets none', () => {
  assert.deepStrictEqual(routes.map((route) => route.params.id), ['test-partner-camper'])
})

test('the redirect page carries noindex', async () => {
  const html = await render(routes[0])
  assert.match(html, /<meta name="robots" content="noindex, nofollow"\s*\/?>/)
})

test('it redirects to the partner URL and links to it as sponsored, nofollow and noopener', async () => {
  const html = await render(routes[0])
  assert.match(html, /<meta http-equiv="refresh" content="0; url=https:\/\/example\.com\/camper\?ref=test"/)

  const links = [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => tag)
  assert.strictEqual(links.length, 1, `expected one link, got: ${links.join(' ')}`)
  assert.match(links[0], /href="https:\/\/example\.com\/camper\?ref=test"/)
  const rel = links[0].match(/rel="([^"]*)"/)?.[1].split(/\s+/) ?? []
  for (const value of ['sponsored', 'nofollow', 'noopener']) {
    assert.ok(rel.includes(value), `rel="${rel.join(' ')}" lacks ${value}`)
  }
})

test('the redirect page stays out of the sitemap', () => {
  for (const route of routes) {
    assert.strictEqual(sitemapFilter(`${SITE}/ir/${route.params.id}/`), false)
  }
})
