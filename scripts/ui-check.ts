// UI checks in a real browser, against the built site:
//   node scripts/ui-check.ts <base-url> <page>
// They guard what unit tests cannot see: the layers of the overlay panels,
// the lines of the day cards on small phones and the panels by keyboard.
// Each check names what broke.
import { chromium } from 'playwright'
import { DURATION_HINT, PANELS, dayCardLineIssues, focusStep, headerOverlap, panelState, scrollAnimationIssues, siteHeaderIssues } from './ui-shared.ts'

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
//    (a drive line): the route in two rows, more on long days (see
//    dayCardLineIssues); facts, night, each stop's name and its practical
//    line in one. The site header too: one row, 44px links, never sticky.
for (const width of [350, 360, 375, 390, 414]) {
  const tab = await browser.newPage({ viewport: { width, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  const bad = [...(await tab.evaluate(dayCardLineIssues)), ...(await tab.evaluate(siteHeaderIssues))]
  for (const b of bad) fail(`${width}px: ${b}`)
  await tab.close()
}

// 3. Scroll-driven animations survive the minified build (see scrollAnimationIssues).
{
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  for (const b of await tab.evaluate(scrollAnimationIssues)) fail(b)
  await tab.close()
}

// 4. The panels by keyboard alone, on a phone and on a desktop: Tab to the
//    opener, Enter opens it, focus goes inside, Esc closes it and puts focus
//    back on the opener; and while closed, nothing inside it takes focus on
//    the way through the page. Same for a visit-time bubble.
//    A failure listed in KNOWN_KEYBOARD_ISSUES is reported but does not fail
//    the run: the author decides on the fix (see its reason).
const KNOWN_KEYBOARD_ISSUES: { target: string; width?: number; check: string; reason: string }[] = [
  {
    // Found 2026-10-20. Tab onto the first stop of a new day scrolls the rail
    // to that card, and the carousel script then smooth-scrolls the day strip
    // to its number (~200 ms). RouteDays' scroll listener closes every open
    // bubble on any scroll, so an Enter pressed during that glide opens the
    // bubble and closes it again. After a pause it opens fine. It depends on
    // timing, so not every run hits it (390px nearly always, 1280px sometimes).
    target: DURATION_HINT.name,
    check: 'Enter right after Tab does not open it',
    reason: 'the day strip\'s smooth scroll after Tab closes it (RouteDays scroll listener); opens after a pause',
  },
]
const MAX_TABS = 1500
const known = (target: string, width: number, check: string) =>
  KNOWN_KEYBOARD_ISSUES.find((k) => k.target === target && (k.width ?? width) === width && k.check === check)
const knownSeen: string[] = []
const keyboardFail = (target: string, width: number, check: string, detail: string) => {
  const k = known(target, width, check)
  if (k) knownSeen.push(`${width}px ${target}: ${check} (${detail}) — known: ${k.reason}`)
  else fail(`${width}px keyboard, ${target}: ${check} (${detail})`)
}
const closedPanels = [...PANELS.map((p) => p.panel), '.day-sheet', '[popover]', DURATION_HINT.panel]
for (const width of [390, 1280]) {
  const tab = await browser.newPage({ viewport: { width, height: 844 } })
  // A full walk through the page, every panel closed: none of them may take focus.
  await tab.goto(url, { waitUntil: 'networkidle' })
  const strays = new Set<string>()
  for (let i = 0; i < MAX_TABS; i++) {
    await tab.keyboard.press('Tab')
    const step = await tab.evaluate(focusStep, { target: 'none', closed: closedPanels })
    if (step.repeat) break
    if (step.inClosed) strays.add(`${step.label} in ${step.inClosed}`)
  }
  for (const s of strays) keyboardFail('página', width, 'a closed panel takes focus', s)

  for (const { name, open, panel } of [...PANELS, DURATION_HINT]) {
    await tab.goto(url, { waitUntil: 'networkidle' })
    if ((await tab.locator(open).count()) === 0) continue
    let reached = false
    for (let i = 0; i < MAX_TABS && !reached; i++) {
      await tab.keyboard.press('Tab')
      const step = await tab.evaluate(focusStep, { target: open, closed: [] })
      reached = step.isTarget
      if (step.repeat) break
    }
    if (!reached) {
      keyboardFail(name, width, 'opener not reachable with Tab', open)
      continue
    }
    // Enter at once, as a quick typist would; then, if that did not open it,
    // again once any scroll set off by the Tab has settled.
    await tab.keyboard.press('Enter')
    await tab.waitForTimeout(300)
    let opened = await tab.evaluate(panelState, { open, panel })
    if (!opened.isOpen) {
      keyboardFail(name, width, 'Enter right after Tab does not open it', panel)
      await tab.waitForTimeout(1000)
      if (!(await tab.evaluate(panelState, { open, panel })).focusOnOpener) continue
      await tab.keyboard.press('Enter')
      await tab.waitForTimeout(300)
      opened = await tab.evaluate(panelState, { open, panel })
    }
    if (!opened.isOpen) {
      keyboardFail(name, width, 'Enter does not open it', panel)
      continue
    }
    if (!opened.focusInside) keyboardFail(name, width, 'focus does not move inside', panel)
    await tab.keyboard.press('Escape')
    await tab.waitForTimeout(300)
    const closed = await tab.evaluate(panelState, { open, panel })
    if (closed.isOpen) keyboardFail(name, width, 'Escape does not close it', panel)
    else if (!closed.focusOnOpener) keyboardFail(name, width, 'focus does not return to the opener', open)
  }
  await tab.close()
}

await browser.close()

for (const k of knownSeen) console.warn(`Known keyboard issue (not failing): ${k}`)

if (failures.length) {
  console.error('UI checks failed:\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log(`UI checks passed for ${url}`)
