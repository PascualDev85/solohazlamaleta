// The phones scripts/ui-devices.ts checks, and their Playwright descriptors.
// A model the installed Playwright does not know stops the run: dropping it
// in silence would shrink the check without anyone noticing.
import type { BrowserContextOptions } from 'playwright'

// Current phones only: iPhone SE 3 (2022) and iPhone 12 onwards; Android from
// the Pixel 5 and Galaxy S9+ era onwards. scripts/ui-devices.ts adds a
// generic small Android.
export const IPHONES = [
  'iPhone SE (3rd gen)', 'iPhone 12', 'iPhone 13', 'iPhone 13 Mini', 'iPhone 14', 'iPhone 14 Pro',
  'iPhone 14 Pro Max', 'iPhone 15', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16e', 'iPhone 16 Pro',
  'iPhone 16 Pro Max', 'iPhone 17', 'iPhone 17 Pro Max',
]
export const ANDROIDS = ['Pixel 5', 'Pixel 7', 'Pixel 8 Pro', 'Pixel 9', 'Galaxy S9+', 'Galaxy S24', 'Galaxy A55']

type Descriptor = BrowserContextOptions & { defaultBrowserType?: string }

/**
 * The context options of each named model in `catalog` (Playwright's
 * `devices`), in the order given and without `defaultBrowserType`, which is
 * not a context option. Throws naming every model the catalog lacks and the
 * Playwright `version`, so the fix (rename it or upgrade) is plain.
 */
export function descriptorsFor(names: readonly string[], catalog: Record<string, Descriptor>, version: string) {
  const unknown = names.filter((name) => !Object.hasOwn(catalog, name))
  if (unknown.length) {
    throw new Error(`Playwright ${version} no conoce ${unknown.length === 1 ? 'este dispositivo' : 'estos dispositivos'}: ${unknown.map((n) => `"${n}"`).join(', ')}. Corrige el nombre en scripts/device-profiles.ts o actualiza Playwright.`)
  }
  return names.map((name) => {
    const { defaultBrowserType: _, ...options } = catalog[name]
    return { name, options: options as BrowserContextOptions }
  })
}
