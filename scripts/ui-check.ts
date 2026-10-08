// UI checks in a real browser, against the built site:
//   node scripts/ui-check.ts <base-url> <page>
// They guard what unit tests cannot see: the layers of the overlay panels and
// the lines of the day cards on small phones. Each check names what broke.
import { chromium } from 'playwright'
import { PANELS, dayCardLineIssues, headerOverlap } from './ui-shared.ts'

const [base, page = '/'] = process.argv.slice(2)
if (!base) {
  console.error('Usage: node scripts/ui-check.ts <base-url> [<page>]')
  process.exit(2)
}
const url = new URL(page, base).href
const failures: string[] = []
const fail = (message: string) => failures.push(message)

const browser = await chromium.launch()

// 1. Overlay panels: once their body has scrolled, nothing from it may paint
//    over the sticky header (the glance's day coins did, 2026-10-07).
{
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  for (const { open, panel, head } of PANELS) {
    const trigger = tab.locator(open).first()
    if ((await trigger.count()) === 0) continue
    await trigger.evaluate((el: HTMLElement) => el.click())
    await tab.waitForTimeout(300)
    const result = await tab.evaluate(headerOverlap, { panel, head })
    if (result.scrolled && result.bad.length) fail(`${panel}: content paints over its sticky header (${result.bad[0]})`)
    await tab.keyboard.press('Escape')
    await tab.waitForTimeout(200)
  }
  await tab.close()
}

// 2. Day cards on phones from 350 to 414px wide, for every day with route data
//    (a drive line): the route in two rows at most; facts, night, each stop's
//    name and its practical line in one.
for (const width of [350, 360, 375, 390, 414]) {
  const tab = await browser.newPage({ viewport: { width, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  const bad = await tab.evaluate(dayCardLineIssues)
  for (const b of bad) fail(`${width}px: ${b}`)
  await tab.close()
}

await browser.close()

if (failures.length) {
  console.error('UI checks failed:\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log(`UI checks passed for ${url}`)
