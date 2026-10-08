// The guide on current Apple and Android phones, against the built site:
//   node scripts/ui-devices.ts <base-url> [<page>]
// iPhones run in WebKit (Safari's engine), Android phones in Chromium, each
// with Playwright's device descriptor: viewport, pixel density, touch, user
// agent. It is the closest free stand-in for real phones, not a replacement:
// WebKit on Linux is not iOS Safari (system fonts, toolbars, safe areas,
// gestures). Each check names the device and what broke; touch targets under
// 44×44 px are only warnings. Screenshots go to ui-devices/ for review by eye.
//
// UI_DEVICES_ENGINE=chromium runs every profile in Chromium, for machines
// that cannot install WebKit; the report says so on every iPhone row.
import { chromium, devices, webkit, type Browser, type BrowserContextOptions, type Page } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import { PANELS, dayCardLineIssues, headerOverlap } from './ui-shared.ts'

const [base, page = '/islandia/islandia-en-camper-13-dias/'] = process.argv.slice(2)
if (!base) {
  console.error('Usage: node scripts/ui-devices.ts <base-url> [<page>]')
  process.exit(2)
}
const url = new URL(page, base).href
const SHOTS = 'ui-devices'
const forced = process.env.UI_DEVICES_ENGINE === 'chromium'

type Engine = 'webkit' | 'chromium'
interface Device {
  name: string
  engine: Engine
  options: BrowserContextOptions
  /** No home button: iOS reserves a strip at the bottom (safe area). */
  homeIndicator: boolean
}

// Current phones only: iPhone SE 3 (2022) and iPhone 12 onwards; Android from
// the Pixel 5 and Galaxy S9+ era onwards, plus a generic small Android.
const IPHONES = [
  'iPhone SE (3rd gen)', 'iPhone 12', 'iPhone 13', 'iPhone 13 Mini', 'iPhone 14', 'iPhone 14 Pro',
  'iPhone 14 Pro Max', 'iPhone 15', 'iPhone 15 Pro Max', 'iPhone 16', 'iPhone 16e', 'iPhone 16 Pro',
  'iPhone 16 Pro Max', 'iPhone 17', 'iPhone 17 Pro Max',
]
const ANDROIDS = ['Pixel 5', 'Pixel 7', 'Pixel 8 Pro', 'Pixel 9', 'Galaxy S9+', 'Galaxy S24', 'Galaxy A55']

const descriptor = (name: string): BrowserContextOptions => {
  const { defaultBrowserType: _, ...options } = devices[name]
  return options
}
const DEVICES: Device[] = [
  ...IPHONES.filter((n) => devices[n]).map((name) => ({ name, engine: 'webkit' as const, options: descriptor(name), homeIndicator: !name.includes('SE') })),
  ...ANDROIDS.filter((n) => devices[n]).map((name) => ({ name, engine: 'chromium' as const, options: descriptor(name), homeIndicator: true })),
  {
    name: 'Android 360×800 @3x',
    engine: 'chromium',
    options: { ...descriptor('Galaxy S24'), viewport: { width: 360, height: 800 }, screen: { width: 360, height: 800 }, deviceScaleFactor: 3 },
    homeIndicator: true,
  },
]

// The day cards' type scale is designed for 350px and up (_day-card.scss):
// below that, their lines are reported as warnings, not failures.
const LINES_MIN_WIDTH = 350
const TOUCH_MIN = 44

const failures: string[] = []
const warnings: string[] = []
const rows: { device: Device; engine: string; result: string }[] = []
const smallTargets = new Map<string, { w: number; h: number; devices: Set<string> }>()

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const settle = (tab: Page, ms = 350) => tab.waitForTimeout(ms)

// Document wider than the viewport: the page scrolls sideways.
const overflow = (tab: Page) =>
  tab.evaluate(() => {
    const doc = document.documentElement
    if (doc.scrollWidth <= doc.clientWidth) return null
    // Name the widest offender, so the failure says where to look.
    let worst = ''
    let right = doc.clientWidth
    for (const el of document.body.querySelectorAll<HTMLElement>('*')) {
      const r = el.getBoundingClientRect()
      if (r.right > right + 0.5 && getComputedStyle(el).position !== 'fixed') {
        right = r.right
        worst = `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`
      }
    }
    return `${doc.scrollWidth}px > ${doc.clientWidth}px${worst ? ` (${worst})` : ''}`
  })

async function checkDevice(browser: Browser, device: Device, engineLabel: string) {
  const { name } = device
  const width = device.options.viewport!.width
  const fail = (m: string) => failures.push(`${name}: ${m}`)
  const warn = (m: string) => warnings.push(`${name}: ${m}`)
  const before = failures.length
  const context = await browser.newContext({ ...device.options, reducedMotion: 'reduce' })
  const tab = await context.newPage()
  const shot = (part: string) => `${SHOTS}/${slug(name)}-${part}.png`

  try {
    await tab.goto(url, { waitUntil: 'networkidle' })

    // 6a. The cover loads on every device.
    const hero = await tab.evaluate(() => {
      const img = document.querySelector<HTMLImageElement>('.guide-hero__photo')
      return img ? img.complete && img.naturalWidth > 0 : null
    })
    if (hero === false) fail('la portada (.guide-hero__photo) no carga')
    await tab.screenshot({ path: shot('portada') })

    // 1. No sideways scroll on load, nor after unfolding days 1 to 3.
    const onLoad = await overflow(tab)
    if (onLoad) fail(`desbordamiento horizontal al cargar: ${onLoad}`)
    for (const day of [1, 2, 3]) {
      const more = tab.locator(`article[aria-labelledby="dia-${day}"] .day-card__more > summary`)
      if ((await more.count()) === 0) continue
      await more.scrollIntoViewIfNeeded()
      await settle(tab)
      await more.tap()
      await settle(tab)
      const open = await more.evaluate((s) => (s.parentElement as HTMLDetailsElement).open)
      if (!open) fail(`"Ver paradas más" del día ${day} no se despliega al tocar`)
    }
    const unfolded = await overflow(tab)
    if (unfolded) fail(`desbordamiento horizontal con las paradas de los días 1 a 3 desplegadas: ${unfolded}`)

    // 2. Day card lines (days with drive data only).
    const lines = await tab.evaluate(dayCardLineIssues)
    if (width >= LINES_MIN_WIDTH) for (const l of lines) fail(`tarjeta de día: ${l}`)
    else for (const l of lines) warn(`tarjeta de día a ${width}px, bajo la escala de diseño (${LINES_MIN_WIDTH}px): ${l}`)

    // 4. The time bubble on Háifoss (day 3): opens on tap, stays inside its
    //    card, closes on a tap elsewhere. The bubble closes itself on any
    //    scroll, so the stop is brought into view first.
    const hike = tab.locator('article[aria-labelledby="dia-3"] .day-stop', { hasText: 'Háifoss' }).locator('.day-stop__hike').first()
    if ((await hike.count()) === 0) fail('no encuentro el bocadillo del tiempo de Háifoss (día 3)')
    else {
      await hike.scrollIntoViewIfNeeded()
      await settle(tab, 600)
      await hike.tap()
      await settle(tab)
      const bubble = await hike.evaluate((s) => {
        const hint = s.parentElement as HTMLDetailsElement
        const b = hint.querySelector('.day-stop__bubble')!.getBoundingClientRect()
        const c = hint.closest('.day-card')!.getBoundingClientRect()
        const inside = b.left >= c.left - 0.5 && b.right <= c.right + 0.5 && b.top >= c.top - 0.5 && b.bottom <= c.bottom + 0.5
        return { open: hint.open, inside, b: `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}×${Math.round(b.height)}` }
      })
      if (!bubble.open) fail('el bocadillo del tiempo de Háifoss no se abre al tocar')
      else {
        if (!bubble.inside) fail(`el bocadillo del tiempo de Háifoss se sale de la tarjeta (${bubble.b})`)
        // Outside the bubble, on screen: the stop's own name, just beside it.
        const other = await tab.locator('article[aria-labelledby="dia-3"] .day-stop', { hasText: 'Háifoss' }).locator('.day-stop__name').first().boundingBox()
        // Note whether the tap reaches the document as a click: iOS only
        // synthesises one on elements it considers clickable.
        await tab.evaluate(() => {
          const w = window as unknown as { __clicked: string | null }
          w.__clicked = null
          document.addEventListener('click', (e) => (w.__clicked = (e.target as Element).className || (e.target as Element).tagName), { once: true, capture: true })
        })
        if (other) await tab.touchscreen.tap(other.x + 4, other.y + other.height / 2)
        await settle(tab)
        const still = await hike.evaluate((s) => (s.parentElement as HTMLDetailsElement).open)
        const clicked = await tab.evaluate(() => (window as unknown as { __clicked: string | null }).__clicked)
        if (still) fail(`el bocadillo del tiempo de Háifoss no se cierra al tocar fuera (${clicked ? `el toque llegó como click a ${clicked}` : 'el toque no generó ningún click en el documento'})`)
      }
    }

    // 6b. Day card photos load once reached (they are lazy and skipped by
    //     content-visibility until then).
    const photos = tab.locator('.day-card__photo')
    for (let i = 0; i < (await photos.count()); i++) {
      const photo = photos.nth(i)
      await photo.scrollIntoViewIfNeeded()
      const loaded = await photo
        .evaluate((img: HTMLImageElement) => new Promise<boolean>((done) => {
          const ok = () => img.complete && img.naturalWidth > 0
          if (ok()) return done(true)
          const t0 = performance.now()
          const poll = () => (ok() ? done(true) : performance.now() - t0 > 8000 ? done(false) : setTimeout(poll, 100))
          poll()
        }))
      if (!loaded) fail(`la foto ${i + 1} de las tarjetas no carga al llegar a ella (${await photo.getAttribute('src')})`)
    }

    // Day 1 with its stops unfolded, once its photo has loaded.
    const day1 = tab.locator('article[aria-labelledby="dia-1"]')
    await day1.scrollIntoViewIfNeeded()
    await settle(tab)
    // A card taller than the screen is captured by growing the viewport, and
    // content-visibility then skips the photo for that frame: render it for
    // the capture only (the photos were checked above).
    await day1.evaluate((el) => el.querySelector<HTMLElement>('.day-card__figure')?.style.setProperty('content-visibility', 'visible'))
    await day1.screenshot({ path: shot('dia-1') })

    // 5a. The index pill: scrolled down and back up a little, it shows, clear
    //     of the bottom edge.
    await tab.evaluate(() => scrollTo(0, 2400))
    await settle(tab, 300)
    await tab.evaluate(() => scrollTo(0, 2000))
    await settle(tab, 600)
    const dock = await tab.evaluate(() => {
      const d = document.querySelector<HTMLElement>('.guide-index__dock')
      if (!d) return null
      const r = d.getBoundingClientRect()
      return { away: d.hasAttribute('data-away'), gap: innerHeight - r.bottom, left: r.left, right: innerWidth - r.right }
    })
    if (dock) {
      if (dock.away) fail('la pastilla del índice no vuelve al desplazar hacia arriba')
      else if (dock.gap < 8) fail(`la pastilla del índice queda pegada o tapada por el borde inferior (${Math.round(dock.gap)}px)`)
      if (dock.left < 0 || dock.right < 0) fail('la pastilla del índice se sale por un lado')
    }

    // 3. The three panels: open from their trigger, fit the screen with header
    //    and close button whole, keep the header on top while scrolling, close
    //    with their close button.
    const popover = await tab.evaluate(() => typeof HTMLElement.prototype.showPopover === 'function')
    if (!popover) fail(`${engineLabel} no soporta popover nativo: los paneles (índice, ruta, día completo) no pueden abrirse`)
    for (const p of popover ? PANELS : []) {
      const trigger = tab.locator(p.open).first()
      if ((await trigger.count()) === 0) {
        fail(`panel ${p.name}: no encuentro el botón que lo abre (${p.open})`)
        continue
      }
      await trigger.scrollIntoViewIfNeeded()
      await settle(tab, 300)
      // The pill hides while scrolling down; bring it back before tapping it.
      if (p.panel === '.guide-index') await tab.evaluate(() => document.querySelector('.guide-index__dock')?.removeAttribute('data-away'))
      await settle(tab, 400)
      await trigger.tap()
      await settle(tab, 300)
      // The sheet rises with a transition: measure once it has ended (2 s at
      // most, so one that never ends still shows up as cut).
      await tab.evaluate(async (panel) => {
        const el = document.querySelector<HTMLElement>(panel)!
        const done = Promise.all(el.getAnimations().map((a) => a.finished.catch(() => null)))
        await Promise.race([done, new Promise((r) => setTimeout(r, 2000))])
      }, p.panel)
      const fit = await tab.evaluate(({ panel, head, close }) => {
        const el = document.querySelector<HTMLElement>(panel)!
        if (!el.matches(':popover-open')) return null
        const vw = innerWidth
        const vh = innerHeight
        const out: string[] = []
        const box = (sel: string, label: string) => {
          const r = document.querySelector(sel)!.getBoundingClientRect()
          if (r.top < -0.5 || r.left < -0.5 || r.right > vw + 0.5 || r.bottom > vh + 0.5) out.push(`${label} cortado (${Math.round(r.left)},${Math.round(r.top)}–${Math.round(r.right)},${Math.round(r.bottom)} en ${vw}×${vh})`)
        }
        box(panel, 'el panel')
        box(head, 'la cabecera')
        box(close, 'el botón de cerrar')
        return out
      }, p)
      if (fit === null) {
        fail(`panel ${p.name}: no se abre al tocar ${p.open}`)
        continue
      }
      for (const f of fit) fail(`panel ${p.name}: ${f}`)

      if (p.panel === '.route-glance') {
        // 5b. "Hasta el día 13": the pill at the foot of the glance, clear of
        //     the bottom edge.
        const more = await tab.evaluate(() => {
          const pill = document.querySelector('.route-glance__more-pill')
          if (!pill) return null
          const r = pill.getBoundingClientRect()
          return { gap: innerHeight - r.bottom, text: pill.textContent?.trim() }
        })
        if (more && more.gap < 4) fail(`panel de la ruta: el aviso "${more.text}" queda pegado o tapado por el borde inferior (${Math.round(more.gap)}px)`)
        await tab.screenshot({ path: shot('ruta') })
      }

      const layer = await tab.evaluate(headerOverlap, { panel: p.panel, head: p.head })
      if (layer.scrolled && layer.bad.length) fail(`panel ${p.name}: el contenido pinta encima de la cabecera fija (${layer.bad[0]})`)

      await tab.locator(p.close).first().tap()
      await settle(tab, 500)
      const closed = await tab.evaluate((panel) => !document.querySelector(panel)!.matches(':popover-open'), p.panel)
      if (!closed) {
        fail(`panel ${p.name}: no se cierra con el botón de cerrar`)
        await tab.keyboard.press('Escape')
      }
    }

    // 7. Touch targets under 44×44 px: a list for the author, not a failure.
    //    Links inside running text are exempt (WCAG 2.5.8, inline).
    const small = await tab.evaluate((min) => {
      const out: { sel: string; w: number; h: number }[] = []
      for (const el of document.querySelectorAll<HTMLElement>('main a[href], main button, main summary, .guide-index__dock')) {
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) continue
        if (getComputedStyle(el).display === 'inline' && el.closest('p, li, dd, td') && el.closest('p, li, dd, td')!.textContent!.trim() !== el.textContent!.trim()) continue
        if (r.width >= min && r.height >= min) continue
        // Its own classes, or the nearest classed ancestor's first one.
        const tag = el.tagName.toLowerCase()
        const owner = el.parentElement?.closest('[class]')
        const sel = el.classList.length ? `${tag}.${[...el.classList].join('.')}` : `${owner ? '.' + owner.classList[0] + ' ' : ''}${tag}`
        out.push({ sel, w: Math.round(r.width), h: Math.round(r.height) })
      }
      return out
    }, TOUCH_MIN)
    for (const s of small) {
      const seen = smallTargets.get(s.sel) ?? { w: s.w, h: s.h, devices: new Set<string>() }
      seen.w = Math.min(seen.w, s.w)
      seen.h = Math.min(seen.h, s.h)
      seen.devices.add(name)
      smallTargets.set(s.sel, seen)
    }
  } catch (error) {
    fail(`la comprobación se interrumpió: ${(error as Error).message.split('\n')[0]}`)
  } finally {
    await context.close()
  }
  rows.push({ device, engine: engineLabel, result: failures.length > before ? `FALLO (${failures.length - before})` : 'OK' })
}

// 5c. Safe area, once: on iPhones without a home button the bottom edge holds
//     the home indicator. env(safe-area-inset-*) is 0 unless the viewport
//     declares viewport-fit=cover, so both are needed for the fixed pill and
//     the glance's foot to clear it. Emulators always report 0, hence a check
//     of the page's own declarations.
async function checkSafeArea(browser: Browser) {
  const tab = await browser.newPage()
  await tab.goto(url, { waitUntil: 'domcontentloaded' })
  const found = await tab.evaluate(() => {
    const meta = document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? ''
    const rules: CSSStyleRule[] = []
    const walk = (list: CSSRuleList) => {
      for (const r of list) {
        if (r instanceof CSSStyleRule) rules.push(r)
        if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules)
      }
    }
    for (const sheet of document.styleSheets) walk(sheet.cssRules)
    const uses = (part: string) => rules.some((r) => r.selectorText?.includes(part) && r.style.cssText.includes('safe-area-inset-bottom'))
    return { cover: /viewport-fit\s*=\s*cover/.test(meta), dock: uses('guide-index__dock'), more: uses('route-glance__more') }
  })
  await tab.close()
  if (!found.cover) failures.push('área segura: el viewport no declara viewport-fit=cover, así que env(safe-area-inset-bottom) vale 0 en iPhone')
  if (!found.dock) failures.push('área segura: la pastilla del índice (.guide-index__dock) no usa env(safe-area-inset-bottom)')
  if (!found.more) failures.push('área segura: el aviso del panel de la ruta (.route-glance__more) no usa env(safe-area-inset-bottom)')
}

await rm(SHOTS, { recursive: true, force: true })
await mkdir(SHOTS, { recursive: true })

const launchers = { webkit, chromium }
for (const engine of ['webkit', 'chromium'] as Engine[]) {
  const list = DEVICES.filter((d) => d.engine === engine)
  const real = forced ? 'chromium' : engine
  const label = forced && engine === 'webkit' ? 'chromium (sustituye a webkit)' : real
  let browser: Browser
  try {
    browser = await launchers[real].launch()
  } catch (error) {
    failures.push(`${engine}: el navegador no arranca, ${list.length} dispositivos sin probar (${(error as Error).message.split('\n')[0]})`)
    for (const device of list) rows.push({ device, engine: label, result: 'SIN PROBAR' })
    continue
  }
  if (engine === 'chromium') await checkSafeArea(browser)
  for (const device of list) await checkDevice(browser, device, label)
  await browser.close()
}

// The report: a table of devices, then failures and warnings.
console.log(`\nDispositivos (${url}):`)
for (const { device, engine, result } of rows) {
  const { width, height } = device.options.viewport!
  console.log(`  ${device.name.padEnd(22)} ${`${width}×${height}`.padEnd(9)} @${String(device.options.deviceScaleFactor).padEnd(6)} ${engine.padEnd(9)} ${result}`)
}
for (const [sel, { w, h, devices: on }] of [...smallTargets].sort()) {
  warnings.push(`objetivo táctil menor de ${TOUCH_MIN}×${TOUCH_MIN}px: ${sel} (${w}×${h}px como mínimo, en ${on.size} de ${rows.length} dispositivos)`)
}
if (warnings.length) console.log('\nAvisos:\n' + warnings.map((w) => `  - ${w}`).join('\n'))
console.log(`\nCapturas en ${SHOTS}/`)
if (failures.length) {
  console.error('\nDevice checks failed:\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
console.log(`\nDevice checks passed for ${url}`)
