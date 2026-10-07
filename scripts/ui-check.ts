// UI checks in a real browser, against the built site:
//   node scripts/ui-check.ts <base-url> <page>
// They guard what unit tests cannot see: the layers of the overlay panels and
// the lines of the day cards on small phones. Each check names what broke.
import { chromium } from 'playwright'

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
  const panels = [
    { open: '.route__title', panel: '.route-glance', head: '.route-glance__head' },
    { open: '.guide-index__dock', panel: '.guide-index', head: '.guide-index__head' },
    { open: 'article[aria-labelledby="dia-3"] .day-card__full', panel: 'article[aria-labelledby="dia-3"] .day-sheet', head: 'article[aria-labelledby="dia-3"] .day-sheet__head' },
  ]
  for (const { open, panel, head } of panels) {
    const trigger = tab.locator(open).first()
    if ((await trigger.count()) === 0) continue
    await trigger.evaluate((el: HTMLElement) => el.click())
    await tab.waitForTimeout(300)
    const result = await tab.evaluate(({ panel, head }) => {
      const p = document.querySelector<HTMLElement>(panel)!
      const h = document.querySelector<HTMLElement>(head)!
      p.scrollTop = 400
      const r = h.getBoundingClientRect()
      const bad: string[] = []
      // A dense grid over the header: a stray element can be as narrow as a day
      // coin. Inset past the panel's rounded corners, where the page shows through.
      for (let x = r.left + 28; x < r.right - 28; x += 6) {
        for (const y of [r.top + 6, r.top + r.height / 2, r.bottom - 4]) {
          const hit = document.elementFromPoint(x, y)
          if (hit && !h.contains(hit)) bad.push(`${hit.className || hit.tagName} at ${Math.round(x)},${Math.round(y)}`)
        }
      }
      return { scrolled: p.scrollTop > 0, bad }
    }, { panel, head })
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
  const bad = await tab.evaluate(() => {
    document.querySelectorAll<HTMLDetailsElement>('.day-card__more').forEach((d) => (d.open = true))
    const rows = (el: Element) => new Set([...el.children].map((c) => (c as HTMLElement).offsetTop)).size
    const out: string[] = []
    for (const day of document.querySelectorAll<HTMLElement>('.day')) {
      const id = day.getAttribute('aria-labelledby')
      const facts = day.querySelector('.day-card__facts')
      if (!facts || facts.children.length < 3) continue // no drive data yet: not reviewed
      const route = day.querySelector('.day-card__route')
      if (route && rows(route) > 2) out.push(`${id}: route in ${rows(route)} rows`)
      if (rows(facts) > 1) out.push(`${id}: facts wrap`)
      const night = day.querySelector('.day-card__night')
      if (night && rows(night) > 1) out.push(`${id}: night wraps`)
      for (const n of day.querySelectorAll<HTMLElement>('.day-stop__name')) if (n.scrollWidth > n.clientWidth + 0.5) out.push(`${id}: stop name overflows (${n.textContent?.trim()})`)
      for (const p of day.querySelectorAll<HTMLElement>('.day-stop__practical')) if (p.scrollWidth > p.clientWidth + 0.5) out.push(`${id}: practical line overflows`)
    }
    return out
  })
  for (const b of bad) fail(`${width}px: ${b}`)
  await tab.close()
}

await browser.close()

if (failures.length) {
  console.error('UI checks failed:\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log(`UI checks passed for ${url}`)
