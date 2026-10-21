// UI checks in a real browser, against the built site:
//   node scripts/ui-check.ts <base-url> <page>
// They guard what unit tests cannot see: the layers of the overlay panels,
// the lines of the day cards on small phones, every page under the HTTP
// headers it will ship with, and the panels by keyboard. Each check names
// what broke. Run after `npm run build`: check 4 reads dist/_headers.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { DURATION_HINT, PANELS, dayCardLineIssues, focusStep, headerOverlap, panelState, scrollAnimationIssues, siteHeaderIssues } from './ui-shared.ts'
import { SITE_MENU, siteMenuIssues } from './ui-shared.ts'
import { headersFor, parseHeaders } from './security-headers.ts'

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

// 2b. The site header on desktop too (one row: links, or the menu button when
//     they do not fit), and the open menu on a phone: inside the screen, 44px links.
for (const width of [768, 1280]) {
  const tab = await browser.newPage({ viewport: { width, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  for (const b of await tab.evaluate(siteHeaderIssues)) fail(`${width}px: ${b}`)
  await tab.close()
}
for (const width of [350, 390]) {
  const tab = await browser.newPage({ viewport: { width, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  await tab.locator(SITE_MENU.open).click()
  await tab.waitForTimeout(300)
  for (const b of await tab.evaluate(siteMenuIssues)) fail(`${width}px: ${b}`)
  await tab.keyboard.press('Escape')
  await tab.close()
}

// 3. Scroll-driven animations survive the minified build (see scrollAnimationIssues).
{
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  for (const b of await tab.evaluate(scrollAnimationIssues)) fail(b)
  await tab.close()
}

// 4. Every built page under the headers Cloudflare Pages will send
//    (dist/_headers, Content-Security-Policy included). `astro preview` sends
//    none, so they are added to each response here. Not one CSP or
//    Permissions-Policy complaint in the console, and on the guide the
//    scripts still run: carousel, panels and the time bubbles.
{
  const rules = parseHeaders(readFileSync('dist/_headers', 'utf8'))
  const paths = rules.filter((rule) => rule.headers.some(([name]) => name === 'Content-Security-Policy')).map((rule) => rule.path)
  if (!paths.includes(new URL(url).pathname)) fail(`${new URL(url).pathname}: no Content-Security-Policy in dist/_headers`)
  for (const path of paths) {
    const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const complaints: string[] = []
    tab.on('console', (message) => {
      if (message.type() === 'error' || /Content.Security.Policy|Permissions.Policy/i.test(message.text())) complaints.push(message.text())
    })
    tab.on('pageerror', (error) => complaints.push(error.message))
    await tab.addInitScript(() => {
      addEventListener('securitypolicyviolation', (e) => console.error(`CSP violation: ${e.effectiveDirective} blocked ${e.blockedURI || 'inline'}`))
    })
    await tab.route('**/*', async (route) => {
      const response = await route.fetch()
      const headers = headersFor(rules, new URL(route.request().url()).pathname)
      await route.fulfill({ response, headers: { ...response.headers(), ...headers } })
    })
    const response = await tab.goto(new URL(path, base).href, { waitUntil: 'networkidle' })
    if (!response?.headers()['content-security-policy']) fail(`${path}: the policy was not applied`)

    if (path === new URL(url).pathname) {
      // The bundled module script: it unhides the arrows and moves the day.
      const arrows = tab.locator('.route__arrows').first()
      if ((await arrows.count()) > 0) {
        if (await arrows.evaluate((el: HTMLElement) => el.hidden)) fail(`${path}: carousel script did not run (arrows still hidden)`)
        // Arrows only show on wide screens; a scripted click is enough here.
        await tab.locator('.route__arrow[data-step="1"]').first().evaluate((el: HTMLElement) => el.click())
        await tab.waitForTimeout(800)
        const current = await tab.locator('.route__days a[aria-current="step"]').first().textContent()
        if (current?.trim() !== '02') fail(`${path}: carousel arrow did not move to day 2 (current: ${current?.trim()})`)
      }
      // The inline script that lets the overview slide in.
      if ((await tab.locator('.guide-overview').count()) > 0 && (await tab.locator('.guide-overview.reveal').count()) === 0) {
        fail(`${path}: inline overview script did not run (no .reveal)`)
      }
      // Panels open (popover) and close with Escape.
      for (const { name, open, panel } of PANELS) {
        const trigger = tab.locator(open).first()
        if ((await trigger.count()) === 0) continue
        await trigger.evaluate((el: HTMLElement) => el.click())
        await tab.waitForTimeout(300)
        if (!(await tab.locator(panel).first().evaluate((el) => el.matches(':popover-open')))) fail(`${path}: panel "${name}" does not open`)
        await tab.keyboard.press('Escape')
        await tab.waitForTimeout(200)
      }
      // A time bubble opens on tap and closes on a tap elsewhere, or on a
      // page scroll that moves it (script).
      const hint = tab.locator('.day-stop__hint:visible').first()
      if ((await hint.count()) > 0) {
        await hint.scrollIntoViewIfNeeded()
        await hint.locator('summary').click()
        const opened = await hint.evaluate((el: HTMLDetailsElement) => el.open)
        await tab.locator('h1').first().dispatchEvent('pointerdown')
        const closed = await hint.evaluate((el: HTMLDetailsElement) => !el.open)
        if (!opened || !closed) fail(`${path}: time bubble (opened: ${opened}, closed by a tap elsewhere: ${closed})`)
        await hint.locator('summary').click()
        await tab.mouse.wheel(0, 120)
        await tab.waitForTimeout(300)
        if (await hint.evaluate((el: HTMLDetailsElement) => el.open)) fail(`${path}: time bubble stays open after a page scroll`)
      }
    }
    for (const complaint of [...new Set(complaints)]) fail(`${path}: console: ${complaint}`)
    await tab.close()
  }
}

// 5. The panels by keyboard alone, on a phone and on a desktop: Tab to the
//    opener, Enter opens it, focus goes inside, Esc closes it and puts focus
//    back on the opener; and while closed, nothing inside it takes focus on
//    the way through the page. Same for a visit-time bubble.
const MAX_TABS = 1500
const keyboardFail = (target: string, width: number, check: string, detail: string) =>
  fail(`${width}px keyboard, ${target}: ${check} (${detail})`)
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

  for (const { name, open, panel } of [...PANELS, DURATION_HINT, SITE_MENU]) {
    await tab.goto(url, { waitUntil: 'networkidle' })
    if ((await tab.locator(open).count()) === 0) continue
    // The menu button only shows where the header row does not fit.
    if (open === SITE_MENU.open && !(await tab.locator(open).isVisible())) continue
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

// 6. The landing page's search window, by keyboard: Tab to the big field,
//    Enter opens the window with focus in its input, typing filters the
//    results, and one Escape closes it (even with text typed) and puts focus
//    back on the field.
{
  const home = new URL('/', base).href
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(home, { waitUntil: 'networkidle' })
  const opener = tab.locator('[data-search-open]')
  if ((await opener.count()) > 0) {
    let reached = false
    for (let i = 0; i < 60 && !reached; i++) {
      await tab.keyboard.press('Tab')
      reached = await tab.evaluate(() => document.activeElement?.matches('[data-search-open]') ?? false)
    }
    if (!reached) fail('home search: the field is not reachable with Tab')
    else {
      await tab.keyboard.press('Enter')
      await tab.waitForTimeout(300)
      const state = await tab.evaluate(() => ({
        open: document.querySelector<HTMLDialogElement>('[data-search-dialog]')?.open,
        inInput: document.activeElement?.matches('[data-search-dialog] [data-search-input]'),
      }))
      if (!state.open || !state.inInput) fail(`home search: Enter does not open the window with focus in its field (${JSON.stringify(state)})`)
      await tab.keyboard.type('gullfoss')
      await tab.waitForTimeout(200)
      const shown = await tab.locator('[data-search-dialog] [data-search-place]:not([hidden])').count()
      if (shown !== 1) fail(`home search: "gullfoss" shows ${shown} places, expected 1`)
      await tab.keyboard.press('Escape')
      await tab.waitForTimeout(200)
      const closed = await tab.evaluate(() => ({
        open: document.querySelector<HTMLDialogElement>('[data-search-dialog]')?.open,
        onOpener: document.activeElement?.matches('[data-search-open]'),
      }))
      if (closed.open || !closed.onOpener) fail(`home search: one Escape does not close it and return focus (${JSON.stringify(closed)})`)
    }
  }
  await tab.close()
}

await browser.close()

if (failures.length) {
  console.error('UI checks failed:\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log(`UI checks passed for ${url}`)
