import { test } from 'node:test'
import assert from 'node:assert'
import { devices } from 'playwright'
import { ANDROIDS, IPHONES, descriptorsFor } from '../../scripts/device-profiles.ts'

const catalog = {
  'iPhone 15': { viewport: { width: 393, height: 659 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'ua', defaultBrowserType: 'webkit' as const },
  'Pixel 7': { viewport: { width: 412, height: 839 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'ua', defaultBrowserType: 'chromium' as const },
}

test('descriptorsFor returns each descriptor in order, without defaultBrowserType', () => {
  const out = descriptorsFor(['Pixel 7', 'iPhone 15'], catalog, '1.0.0')
  assert.deepStrictEqual(out.map((d) => d.name), ['Pixel 7', 'iPhone 15'])
  assert.deepStrictEqual(out[1].options.viewport, { width: 393, height: 659 })
  assert.ok(!('defaultBrowserType' in out[0].options))
  assert.ok(!('defaultBrowserType' in out[1].options))
})

test('descriptorsFor fails on a model the catalog does not know, naming every one and the version', () => {
  assert.throws(
    () => descriptorsFor(['iPhone 15', 'iPhone 99', 'Pixel 7', 'Pixel 42'], catalog, '1.64.0'),
    (error: Error) => {
      assert.match(error.message, /"iPhone 99", "Pixel 42"/)
      assert.match(error.message, /1\.64\.0/)
      assert.doesNotMatch(error.message, /"iPhone 15"/)
      return true
    },
  )
})

test('descriptorsFor does not take inherited keys for models', () => {
  assert.throws(() => descriptorsFor(['toString'], catalog, '1.0.0'), /"toString"/)
})

test('every model scripts/ui-devices.ts asks for exists in the installed Playwright', () => {
  assert.doesNotThrow(() => descriptorsFor([...IPHONES, ...ANDROIDS], devices, 'installed'))
})
