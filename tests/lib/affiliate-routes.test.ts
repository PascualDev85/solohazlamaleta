import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { affiliateRoutes } from '../../src/lib/affiliate-routes.ts'
import type { AffiliateRegistryFile } from '../../src/lib/affiliate-routes.ts'

const fixture: AffiliateRegistryFile = JSON.parse(await readFile('tests/fixtures/affiliates.json', 'utf-8'))

test('an active partner builds one route per link, with the id <partner>-<key>', () => {
  assert.deepStrictEqual(affiliateRoutes(fixture), [
    {
      params: { id: 'test-partner-camper' },
      props: { url: 'https://example.com/camper?ref=test', partnerName: 'Socio de prueba' },
    },
  ])
})

test('an inactive partner builds no route, even with links', () => {
  const ids = affiliateRoutes(fixture).map((route) => route.params.id)
  assert.ok(!ids.some((id) => id.startsWith('test-inactive')), `inactive partner routed: ${ids.join(', ')}`)
})

