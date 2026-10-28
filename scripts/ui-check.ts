// UI checks in a real browser, against the built site:
//   node scripts/ui-check.ts <base-url> <page>
// They guard what unit tests cannot see: the layers of the overlay panels,
// the lines of the day cards on small phones and at 150% text, every page
// under the HTTP headers it will ship with, the panels by keyboard, the
// landing page's search and the tap areas. Each check names what broke. Run after `npm run build`:
// check 5 reads dist/_headers.
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import {
  DURATION_HINT,
  PANELS,
  SITE_MENU,
  TAP_MIN,
  TAP_TARGETS,
  dayCardLineIssues,
  dayCardTextScaleIssues,
  focusStep,
  headerOverlap,
  hitRun,
  panelState,
  scrollAnimationIssues,
  siteHeaderIssues,
  siteMenuIssues,
  tapCandidateBox,
  tapTargetHits,
  tapTargetIssue,
  tapTargetMeasure, photoMeasures, photoSharpnessIssue } from './ui-shared.ts'
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

// 2b. The same cards with the browser's text size at 150% (WCAG 1.4.4): the
//     lines take more rows, as they should, but nothing is cut and nothing
//     runs over other text (see dayCardTextScaleIssues). The size is set the
//     way a reader sets it, as the browser's default font size, through CDP.
//     Reduced motion, so the desktop carousel's 3D turn does not skew the boxes.
for (const width of [350, 360, 375, 390, 414, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' })
  const tab = await context.newPage()
  const cdp = await context.newCDPSession(tab)
  await cdp.send('Page.setFontSizes', { fontSizes: { standard: 24, fixed: 20 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  const root = await tab.evaluate(() => getComputedStyle(document.documentElement).fontSize)
  if (root !== '24px') fail(`${width}px at 150% text: the text size did not apply (root ${root})`)
  else for (const b of await tab.evaluate(dayCardTextScaleIssues)) fail(`${width}px at 150% text: ${b}`)
  await context.close()
}

// 3. The site header on desktop too (one row: links, or the menu button when
//    they do not fit), and the open menu on a phone: inside the screen, 44px links.
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
  // The panel opens with a 300ms scale-up: measure its links once it has
  // finished, not after a fixed wait that a slow runner can outrun.
  await tab.evaluate(() => Promise.all(document.querySelector('.site-menu')!.getAnimations({ subtree: true }).map((a) => a.finished)))
  for (const b of await tab.evaluate(siteMenuIssues)) fail(`${width}px: ${b}`)
  await tab.keyboard.press('Escape')
  await tab.close()
}

// 4. Scroll-driven animations survive the minified build (see scrollAnimationIssues),
//    on the page under test and on the home page.
for (const target of new Set([url, new URL('/', base).href])) {
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(target, { waitUntil: 'networkidle' })
  for (const b of await tab.evaluate(scrollAnimationIssues)) fail(`${new URL(target).pathname}: ${b}`)
  await tab.close()
}

// 5. Every built page under the headers Cloudflare Pages will send
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

// 6. The panels by keyboard alone, on a phone and on a desktop: Tab to the
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

// 7. The landing page's search window, by keyboard: Tab to the big field,
//    Enter opens the window with focus in its input, typing filters the
//    results, and one Escape closes it (even with text typed) and puts focus
//    back on the field.
{
  const home = new URL('/', base).href
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(home, { waitUntil: 'networkidle' })
  const opener = tab.locator('.home-search')
  if ((await opener.count()) > 0) {
    let reached = false
    for (let i = 0; i < 60 && !reached; i++) {
      await tab.keyboard.press('Tab')
      reached = await tab.evaluate(() => document.activeElement?.matches('.home-search') ?? false)
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
      await tab.waitForTimeout(500)
      const shown = await tab.locator('[data-search-dialog] [data-search-group="place"] [data-search-option]:not([hidden])').count()
      if (shown !== 1) fail(`home search: "gullfoss" shows ${shown} places, expected 1`)
      const said = await tab.locator('[data-search-dialog] [data-search-status]').textContent()
      if (said?.trim() !== '1 resultado: 1 lugar') fail(`home search: the status line says "${said?.trim()}", expected "1 resultado: 1 lugar"`)
      await tab.keyboard.press('Escape')
      await tab.waitForTimeout(200)
      const closed = await tab.evaluate(() => ({
        open: document.querySelector<HTMLDialogElement>('[data-search-dialog]')?.open,
        onOpener: document.activeElement?.matches('.home-search'),
      }))
      if (closed.open || !closed.onOpener) fail(`home search: one Escape does not close it and return focus (${JSON.stringify(closed)})`)
    }
  }
  await tab.close()
}

// 7b. The search window as a combobox (ARIA 1.2): the field names its
//     listbox, typos find their place (exact matches first), the arrows move
//     the active option (aria-activedescendant) and Enter opens it.
{
  const home = new URL('/', base).href
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(home, { waitUntil: 'networkidle' })
  if ((await tab.locator('.home-search').count()) > 0) {
    await tab.locator('.home-search').click()
    await tab.waitForTimeout(300)
    const input = tab.locator('[data-search-dialog] [data-search-input]')
    const combobox = await input.evaluate((el) => ({
      role: el.getAttribute('role'),
      listbox: document.getElementById(el.getAttribute('aria-controls') ?? '')?.getAttribute('role'),
      expanded: el.getAttribute('aria-expanded'),
      suggestions: document.querySelectorAll('[data-search-dialog] [data-search-suggest]:not([hidden]) [role="option"]').length,
    }))
    if (combobox.role !== 'combobox' || combobox.listbox !== 'listbox' || combobox.expanded !== 'true') {
      fail(`home search: the field is not a combobox controlling a listbox (${JSON.stringify(combobox)})`)
    }
    if (combobox.suggestions < 3) fail(`home search: before typing it suggests ${combobox.suggestions} options, expected destinations and places`)

    const firstPlace = async (query: string) => {
      await input.fill(query)
      await tab.waitForTimeout(100)
      return (await tab.locator('[data-search-dialog] [data-search-group="place"] [data-search-name]:visible').first().textContent())?.trim()
    }
    for (const [query, expected] of [['gulfos', 'Gullfoss'], ['jokulsarlom', 'Jökulsárlón'], ['skogafos', 'Skógafoss']]) {
      const found = await firstPlace(query)
      if (found !== expected) fail(`home search: the typo "${query}" finds "${found}" first, expected "${expected}"`)
    }
    const marked = await tab.locator('[data-search-dialog] [data-search-group="place"] mark').first().textContent()
    if (!marked) fail('home search: the matched letters are not marked')

    await input.fill('presupuesto islandia')
    await tab.waitForTimeout(100)
    const budget = await tab.locator('[data-search-dialog] [data-search-group="section"] [role="option"]:visible').first().getAttribute('href')
    if (!budget?.endsWith('#presupuesto')) fail(`home search: "presupuesto islandia" leads to ${budget}, expected the guide's #presupuesto`)

    await input.fill('foss')
    await tab.waitForTimeout(100)
    const step = async (key: string) => {
      await tab.keyboard.press(key)
      return tab.evaluate(() => {
        const field = document.querySelector('[data-search-dialog] [data-search-input]')!
        const id = field.getAttribute('aria-activedescendant')
        const option = id ? document.getElementById(id) : null
        return { id, focusInField: document.activeElement === field, selected: option?.getAttribute('aria-selected'), href: option?.getAttribute('href') }
      })
    }
    const down = await step('ArrowDown')
    const second = await step('ArrowDown')
    const up = await step('ArrowUp')
    if (!down.id || down.selected !== 'true' || !down.focusInField) fail(`home search: ArrowDown does not activate the first result (${JSON.stringify(down)})`)
    if (second.id === down.id) fail('home search: a second ArrowDown does not move to the next result')
    if (up.id !== down.id) fail('home search: ArrowUp does not go back')
    await step('ArrowDown')
    const target = (await step('ArrowUp')).href
    await Promise.all([tab.waitForURL((u) => u.href.includes('#dia-'), { timeout: 5000 }).catch(() => {}), tab.keyboard.press('Enter')])
    const landed = new URL(tab.url())
    if (`${landed.pathname}${landed.hash}` !== target) fail(`home search: Enter on the active result goes to ${landed.pathname}${landed.hash}, expected ${target}`)
  }
  await tab.close()
}

// 7c. /buscar/?q=… starts with the search done: a shared link or a bookmark.
{
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(new URL('/buscar/?q=gullfoss', base).href, { waitUntil: 'networkidle' })
  const state = await tab.evaluate(() => ({
    value: document.querySelector<HTMLInputElement>('[data-search-input]')?.value,
    places: [...document.querySelectorAll<HTMLElement>('[data-search-group="place"] [data-search-option]')].filter((el) => !el.hidden).map((el) => el.querySelector('[data-search-name]')?.textContent),
    suggesting: document.querySelectorAll('[data-search-suggest]:not([hidden])').length,
  }))
  if (state.value !== 'gullfoss' || state.places.length !== 1 || state.places[0] !== 'Gullfoss' || state.suggesting) {
    fail(`/buscar/?q=gullfoss does not start filtered to Gullfoss (${JSON.stringify(state)})`)
  }
  await tab.close()
}

// 8. The header's search button on the home page, by keyboard, on a phone and
//    on a desktop: the header passes its checks there too, Tab reaches the
//    button, Enter opens the same search window with focus in its field, and
//    Escape closes it and puts focus back on the button. Without the window
//    (any other page) it is a plain link to /buscar/.
for (const width of [390, 1280]) {
  const home = new URL('/', base).href
  const tab = await browser.newPage({ viewport: { width, height: 844 } })
  await tab.goto(home, { waitUntil: 'networkidle' })
  for (const b of await tab.evaluate(siteHeaderIssues)) fail(`home ${width}px: ${b}`)
  let reached = false
  for (let i = 0; i < 30 && !reached; i++) {
    await tab.keyboard.press('Tab')
    reached = await tab.evaluate(() => document.activeElement?.matches('.site-search') ?? false)
  }
  if (!reached) fail(`home ${width}px: the header search button is not reachable with Tab`)
  else {
    await tab.keyboard.press('Enter')
    await tab.waitForTimeout(300)
    const state = await tab.evaluate(() => ({
      url: location.pathname,
      open: document.querySelector<HTMLDialogElement>('[data-search-dialog]')?.open,
      inInput: document.activeElement?.matches('[data-search-dialog] [data-search-input]'),
    }))
    if (!state.open || !state.inInput) fail(`home ${width}px: Enter on the header search button does not open the window with focus in its field (${JSON.stringify(state)})`)
    await tab.keyboard.press('Escape')
    await tab.waitForTimeout(200)
    const closed = await tab.evaluate(() => ({
      open: document.querySelector<HTMLDialogElement>('[data-search-dialog]')?.open,
      onButton: document.activeElement?.matches('.site-search'),
    }))
    if (closed.open || !closed.onButton) fail(`home ${width}px: Escape does not close the window and return focus to the header button (${JSON.stringify(closed)})`)
  }
  await tab.close()
}
{
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await tab.goto(url, { waitUntil: 'networkidle' })
  const href = await tab.locator('.site-search').getAttribute('href')
  if (href !== '/buscar/') fail(`${new URL(url).pathname}: the header search button does not link to /buscar/ (${href})`)
  await tab.close()
}

// 9. Tap areas on a 390px phone: every link, button and <summary> on screen
//    takes at least 44×44px of taps, counting the invisible ::before/::after
//    layers that widen it and cutting what a neighbour or a clipping box
//    covers (hit-tested point by point). Twice: as the page loads, and with
//    every "Ver N paradas más" and campsite card open. Links in running text
//    and the commented TAP_EXCEPTIONS pass (see tapTargetIssue). One line per
//    kind of target, with its smallest size. Reduced motion keeps the day
//    cards flat, so a box is the same wherever the carousel stands.
{
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await tab.goto(url, { waitUntil: 'networkidle' })
  const small = new Map<string, { width: number; height: number; at: Set<number>; text: string }>()
  for (const unfold of [false, true]) {
    if (unfold) await tab.evaluate(() => document.querySelectorAll<HTMLDetailsElement>('.day-card__more, .camp__details').forEach((d) => (d.open = true)))
    const count = await tab.locator(TAP_TARGETS).count()
    for (let index = 0; index < count; index++) {
      const m = await tab.evaluate(tapTargetMeasure, { selector: TAP_TARGETS, index })
      if (!m) continue
      const area = tapCandidateBox(m)
      const hits = await tab.evaluate(tapTargetHits, { selector: TAP_TARGETS, index, area })
      const width = hitRun(hits.row, hits.rowFrom)
      const height = hitRun(hits.col, hits.colFrom)
      if (!tapTargetIssue({ label: m.label, inText: m.inText, width, height })) continue
      const seen = small.get(m.label) ?? { width, height, at: new Set<number>(), text: m.text }
      small.set(m.label, { ...seen, width: Math.min(seen.width, width), height: Math.min(seen.height, height), at: seen.at.add(index) })
    }
  }
  for (const [label, s] of small) {
    fail(`390px tap area, ${tapTargetIssue({ label, inText: false, width: s.width, height: s.height }, TAP_MIN, [])} (${s.at.size}×, e.g. "${s.text}")`)
    }
  await tab.close()
}

// 10. Photos as sharp as they are shown: on a 3x phone and a 2x desktop,
//     every photo of the home page and the guide comes as a file at least
//     90 % of its shown width × the pixel ratio, capped at 2x (see
//     photoSharpnessIssue). A photo whose largest file is already served is
//     only reported: it needs a bigger original.
for (const path of ['/', new URL(url).pathname]) {
  for (const [width, height, dpr] of [[390, 844, 3], [1440, 900, 2]]) {
    const tab = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr })
    await tab.goto(new URL(path, base).href, { waitUntil: 'networkidle' })
    await tab.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 100))
      }
    })
    await tab.waitForTimeout(500)
    for (const measure of await tab.evaluate(photoMeasures)) {
      const issue = photoSharpnessIssue(measure)
      if (!issue) continue
      if (issue.startsWith('warning: ')) console.warn(`${path} ${width}px@${dpr}x photo ${issue}`)
      else fail(`${path} ${width}px@${dpr}x photo ${issue}`)
    }
    await tab.close()
  }
}

// 11. No layout shift while the search page starts (CLS was 0.12 on a slow
//     CI runner, 2026-10-28: the script revealed the field and the
//     suggestions and hid the results after the first paint). A 390px
//     phone on Lighthouse's slow network with the CPU slowed 6x, every
//     layout shift summed: under 0.01.
for (const path of ['/buscar/', '/']) {
  const tab = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const cdp = await tab.context().newCDPSession(tab)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 })
  // Lighthouse's mobile network: 150 ms round trip, 1.6 Mbps down.
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 })
  await tab.addInitScript(() => {
    const w = window as unknown as { __cls: number }
    w.__cls = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) w.__cls += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await tab.goto(new URL(path, base).href, { waitUntil: 'networkidle' })
  await tab.waitForTimeout(1000)
  const cls = await tab.evaluate(() => (window as unknown as { __cls: number }).__cls)
  if (cls >= 0.01) fail(`${path}: layout shift while loading on a slow phone (CLS ${cls.toFixed(3)})`)
  await tab.close()
}

await browser.close()

if (failures.length) {
  console.error('UI checks failed:\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log(`UI checks passed for ${url}`)
