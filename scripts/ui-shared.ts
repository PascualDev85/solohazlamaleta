// In-page checks shared by scripts/ui-check.ts and scripts/ui-devices.ts.
// The check functions run inside the browser (page.evaluate), so they must
// stay self-contained: no imports, no closures over module scope. The
// selectors are plain strings, built here in Node.

/** One day's slide: its <article> is labelled by the day heading, id "dia-N". */
export const daySlide = (day: number) => `article[aria-labelledby="dia-${day}"]`

/** The overlay panels and what opens them. Selectors in the page's own terms. */
export const PANELS = [
  { name: 'ruta de un vistazo', open: '.route__title', panel: '.route-glance', head: '.route-glance__head', close: '.route-glance__close' },
  { name: 'índice', open: '.guide-index__dock', panel: '.guide-index', head: '.guide-index__head', close: '.guide-index__close' },
  {
    name: 'día completo (día 3)',
    open: `${daySlide(3)} .day-card__full`,
    panel: `${daySlide(3)} .day-sheet`,
    head: `${daySlide(3)} .day-sheet__head`,
    close: `${daySlide(3)} .day-sheet__close`,
  },
] as const

/**
 * Scrolls an open panel's body and probes a dense grid over its sticky header:
 * once the body has scrolled, nothing from it may paint over the header (the
 * glance's day coins did, 2026-10-07). Returns whether it scrolled and the
 * first strays found.
 */
export function headerOverlap({ panel, head }: { panel: string; head: string }) {
  const p = document.querySelector<HTMLElement>(panel)!
  const h = document.querySelector<HTMLElement>(head)!
  p.scrollTop = 400
  const r = h.getBoundingClientRect()
  const bad: string[] = []
  // A stray element can be as narrow as a day coin. Inset past the panel's
  // rounded corners, where the page shows through.
  for (let x = r.left + 28; x < r.right - 28; x += 6) {
    for (const y of [r.top + 6, r.top + r.height / 2, r.bottom - 4]) {
      const hit = document.elementFromPoint(x, y)
      if (hit && !h.contains(hit)) bad.push(`${hit.className || hit.tagName} at ${Math.round(x)},${Math.round(y)}`)
    }
  }
  return { scrolled: p.scrollTop > 0, bad }
}

/**
 * The lines of every day card with route data (a drive line, so three facts):
 * the route in two rows at most, three on a long day (six route stops or
 * more), four from nine and six from twelve (the author set two/three/four on
 * 2026-10-08; widened 2026-10-14 for days 9 and 12, see below); facts, night,
 * each stop's name and its practical line in one. Opens "Ver N paradas más"
 * first (and leaves them open), so every stop counts. Days with fewer than
 * three facts have no drive data yet and are skipped, not reviewed. Runs in
 * the page (pass it to `page.evaluate`) and returns one line per problem,
 * prefixed with the day's heading id, e.g. "dia-3: route in 4 rows"; empty
 * when everything fits.
 */
export function dayCardLineIssues() {
  document.querySelectorAll<HTMLDetailsElement>('.day-card__more').forEach((d) => (d.open = true))
  const rows = (el: Element) => new Set([...el.children].map((c) => (c as HTMLElement).offsetTop)).size
  const out: string[] = []
  for (const day of document.querySelectorAll<HTMLElement>('.day')) {
    const id = day.getAttribute('aria-labelledby')
    const facts = day.querySelector('.day-card__facts')
    if (!facts || facts.children.length < 3) continue // no drive data yet: not reviewed
    const route = day.querySelector('.day-card__route')
    // Two rows; three from six route stops; four from nine (day 4 has nine);
    // six from twelve. Widened 2026-10-14 from "three from seven" and "four
    // from nine and up": day 9 (six stops: Krafla → Hverir → Hverfjall →
    // Dimmuborgir → Mývatn → Jarðgangalaug) and day 12 (twelve stops around
    // Snæfellsnes) are already at their shortest real names and still need
    // more rows at 350px (day 12 takes six in CI's Chromium, which sets the
    // text a little wider than older builds). Icelandic names have no shorter
    // form to invent.
    const n = route ? route.children.length : 0
    const maxRouteRows = n >= 12 ? 6 : n >= 9 ? 4 : n >= 6 ? 3 : 2
    if (route && rows(route) > maxRouteRows) out.push(`${id}: route in ${rows(route)} rows`)
    if (rows(facts) > 1) out.push(`${id}: facts wrap`)
    const night = day.querySelector('.day-card__night')
    if (night && rows(night) > 1) out.push(`${id}: night wraps`)
    // A name may wrap (at a larger text size it has to), so its one line is
    // measured by height: more than one and a half lines tall is two.
    for (const n of day.querySelectorAll<HTMLElement>('.day-stop__name')) {
      if (n.offsetHeight > parseFloat(getComputedStyle(n).lineHeight) * 1.5) out.push(`${id}: stop name wraps (${n.textContent?.trim()})`)
    }
    // The practical line may wrap too (a larger text size needs it), so its
    // text is counted in rows, not only checked for overflow.
    for (const p of day.querySelectorAll<HTMLElement>('.day-stop__practical')) {
      if (p.scrollWidth > p.clientWidth + 0.5) out.push(`${id}: practical line overflows`)
      else {
        const centres: number[] = []
        const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT)
        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
          if (!t.textContent?.trim() || t.parentElement?.closest('.visually-hidden, .day-stop__bubble')) continue
          const range = document.createRange()
          range.selectNodeContents(t)
          for (const b of range.getClientRects()) if (b.width > 0) centres.push((b.top + b.bottom) / 2)
        }
        centres.sort((a, b) => a - b)
        if (centres.length && centres[centres.length - 1] - centres[0] > parseFloat(getComputedStyle(p).fontSize) / 2) out.push(`${id}: practical line wraps`)
      }
    }
  }
  return out
}

/**
 * The day cards at a larger browser text size (test:ui sets 150%). The lines
 * may take more rows than at the default size, as they should; what must not
 * happen is text that is cut or that runs over other text. For every day, with
 * every stop and "Lo mejor del día" open: nothing runs out of the card's sides
 * (it clips), no line overflows its own box, the parts of a line never
 * overlap, and the shade at the photo's foot is never taller than the photo
 * (its first line would be cut off at the top).
 */
export function dayCardTextScaleIssues() {
  document.querySelectorAll<HTMLDetailsElement>('.day-card__more, .day-card__highlight').forEach((d) => (d.open = true))
  const out: string[] = []
  const name = (el: Element) => `${el.className || el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 40)}"`
  const overlap = (a: DOMRect, b: DOMRect) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5
  for (const day of document.querySelectorAll<HTMLElement>('.day')) {
    const id = day.getAttribute('aria-labelledby')
    const card = day.querySelector<HTMLElement>('.day-card')
    if (!card) continue
    const edge = card.getBoundingClientRect()
    const seen = new Set<string>()
    for (const el of card.querySelectorAll<HTMLElement>('*')) {
      if (el.closest('.visually-hidden, .day-card__figure, .day-stop__bubble')) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || (r.left >= edge.left - 0.5 && r.right <= edge.right + 0.5)) continue
      const label = name(el)
      if (!seen.has(label)) out.push(`${id}: runs out of the card (${label})`)
      seen.add(label)
    }
    for (const el of card.querySelectorAll<HTMLElement>('.day-card__route, .day-card__facts, .day-card__night, .day-stop__name, .day-stop__practical')) {
      if (el.scrollWidth > el.clientWidth + 0.5) out.push(`${id}: overflows its line (${name(el)})`)
    }
    const lines = '.day-card__route, .day-card__facts, .day-card__night, .day-card__extras, .day-stop__body, .day-stop__head, .day-stop__practical, .day-stop__parking'
    for (const line of card.querySelectorAll<HTMLElement>(lines)) {
      const parts = [...line.children].filter((c) => !c.classList.contains('visually-hidden')).map((c) => [c, c.getBoundingClientRect()] as const)
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          if (parts[i][1].width && parts[j][1].width && overlap(parts[i][1], parts[j][1])) out.push(`${id}: ${name(parts[i][0])} overlaps ${name(parts[j][0])}`)
        }
      }
    }
    const media = card.querySelector('.day-card__media')?.getBoundingClientRect()
    const shade = card.querySelector('.day-card__overlay')?.getBoundingClientRect()
    if (media && shade && shade.top < media.top - 0.5) out.push(`${id}: the photo's shade is taller than the photo (${Math.round(media.top - shade.top)}px cut)`)
  }
  return out
}

/**
 * The site header: the brand, then the links in one row or the menu button
 * (always on phones; on desktop when the links do not fit, see
 * src/lib/site-menu.ts), never both. All of it in one row, every link and the
 * button at least 44px tall (the button 44px wide too), nothing pushing the
 * page sideways, and not fixed or sticky (it would cover anchors and fight
 * the guide's floating index pill). The search button shows on every width,
 * 44×44 and named "Buscar", before the menu button and after the row's last
 * link. The menu's own links live in a closed popover and are checked by
 * siteMenuIssues. Returns what broke.
 */
export function siteHeaderIssues() {
  const issues: string[] = []
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return ['site header missing']
  const position = getComputedStyle(header).position
  if (position === 'fixed' || position === 'sticky') issues.push(`site header is ${position}`)
  const shown = (el: Element | null): el is HTMLElement => !!el && el.getClientRects().length > 0
  const menu = header.querySelector('.site-menu')
  const links = [...header.querySelectorAll<HTMLElement>('a')].filter((a) => shown(a) && !menu?.contains(a))
  const button = header.querySelector<HTMLElement>('.site-menu__open')
  const search = header.querySelector<HTMLElement>('.site-search')
  const rowLinks = links.filter((a) => a.closest('.site-nav') && a !== search)
  if (shown(button) && rowLinks.length) issues.push('site header shows both the link row and the menu button')
  if (!shown(button) && !rowLinks.length) issues.push('site header shows neither the link row nor the menu button')
  const targets = shown(button) ? [...links, button] : links
  const tops = new Set(targets.map((el) => Math.round(el.getBoundingClientRect().top)))
  if (tops.size > 1) issues.push('site header wraps onto a second row')
  for (const el of targets) {
    const box = el.getBoundingClientRect()
    const name = el.getAttribute('aria-label') ?? el.textContent?.trim()
    if (box.height < 44) issues.push(`site header link "${name}" is ${Math.round(box.height)}px tall (< 44)`)
    if ((el === button || el === search) && box.width < 44) issues.push(`${name} button is ${Math.round(box.width)}px wide (< 44)`)
    if (box.right > document.documentElement.clientWidth) issues.push(`site header link "${name}" overflows the viewport`)
  }
  if (button && button.getAttribute('aria-label') !== 'Menú') issues.push('menu button is not named "Menú"')
  if (!shown(search)) issues.push('site header shows no search button')
  else {
    if (search.getAttribute('aria-label') !== 'Buscar') issues.push('search button is not named "Buscar"')
    const left = search.getBoundingClientRect().left
    if (shown(button) && left > button.getBoundingClientRect().left) issues.push('search button is not left of the menu button')
    if (rowLinks.some((a) => a.getBoundingClientRect().left > left)) issues.push('search button is not at the end of the link row')
    if (rowLinks.some((a) => a.getAttribute('href') === '/buscar/')) issues.push('the link row repeats "Buscar" next to the search button')
  }
  if (!header.querySelector('nav[aria-label="Principal"]')) issues.push('main navigation landmark missing')
  return issues
}

/**
 * The open site menu: inside the viewport, every link at least 44px tall,
 * a "Guías" link, and a close button. Run with the menu open.
 */
export function siteMenuIssues() {
  const menu = document.querySelector<HTMLElement>('.site-menu')
  if (!menu) return ['site menu missing']
  if (!menu.matches(':popover-open')) return ['site menu is not open']
  const issues: string[] = []
  const box = menu.getBoundingClientRect()
  if (box.left < 0 || box.right > document.documentElement.clientWidth || box.top < 0) issues.push('site menu sticks out of the viewport')
  const links = [...menu.querySelectorAll<HTMLElement>('a')]
  if (!links.some((a) => a.textContent?.trim() === 'Guías')) issues.push('site menu has no "Guías" link')
  if (!links.some((a) => a.textContent?.trim() === 'Buscar')) issues.push('site menu has no "Buscar" link')
  for (const a of links) {
    const h = a.getBoundingClientRect().height
    if (h < 44) issues.push(`site menu link "${a.textContent?.trim()}" is ${Math.round(h)}px tall (< 44)`)
  }
  if (!menu.querySelector('.site-menu__close')) issues.push('site menu has no close button')
  return issues
}

/** The site menu as a keyboard target: its button opens the popover. */
export const SITE_MENU = { name: 'menú del sitio', open: '.site-menu__open', panel: '.site-menu' } as const

/**
 * The scroll-driven animations must survive the production build. The
 * minifier folds "animation" and "animation-timeline" into one shorthand that
 * carries the timeline; no browser accepts that, so it drops the declaration
 * and the effect silently disappears (the day cards' 3D turn and the glance's
 * "Hasta el día 13" fade did, until 2026-10-16; dev builds, unminified, still
 * showed them). Two checks: no shorthand in the page's own CSS carries a
 * timeline, and the elements that should animate really have an animation
 * (the guide's day cards, the home page's postcards).
 */
export function scrollAnimationIssues() {
  const bad: string[] = []
  const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n')
  for (const m of css.matchAll(/animation:([^;}]*)/g)) {
    if (/\b(view|scroll)\(/.test(m[1])) bad.push(`animation shorthand carries a timeline: "${m[1].slice(0, 80)}"`)
  }
  // Only where the browser supports scroll timelines and motion is allowed.
  const supported = CSS.supports('animation-timeline: view()')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (supported && !reduced) {
    const card = document.querySelector<HTMLElement>('.route__rail > .day')
    if (card && getComputedStyle(card).animationName === 'none') bad.push('day cards have no 3D turn animation')
    // The home page's postcards, on phones: they tip back as the hero scrolls away.
    const pile = document.querySelector<HTMLElement>('.postcards__stack')
    if (pile && matchMedia('(max-width: 47.99rem)').matches && getComputedStyle(pile).animationName === 'none') {
      bad.push('the hero postcards have no scroll animation')
    }
  }
  return bad
}

/**
 * A stop's visit-time bubble (a <details> whose mark is .day-stop__hike), the
 * one keyboard target that is not a popover. Its opener is the mark itself,
 * its panel the <details> around it. The first one on screen is tested: the
 * first in the page (day 3) sits in a folded stop, out of the tab order.
 */
export const DURATION_HINT = { name: 'bocadillo de duration_note', open: '.day-stop__hike', panel: '.day-stop__hint' } as const

/**
 * Where keyboard focus is, for a Tab walk. `closed` lists the panels that
 * must never take focus while closed: popovers that are not open, and the
 * bubble of a <details> hint that is shut. Returns a short label of the
 * focused element (or null on <body>), whether it is the first match of
 * `target` that is on screen (has boxes), whether it was seen before in this
 * walk (the walk has wrapped) and, if it sits in a closed panel, which one.
 */
export function focusStep({ target, closed }: { target: string; closed: string[] }) {
  const w = window as unknown as { __kbSeen?: WeakSet<Element> }
  const seen = (w.__kbSeen ??= new WeakSet())
  const el = document.activeElement
  if (!el || el === document.body) return { label: null, isTarget: false, repeat: false, inClosed: null }
  const label = `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : ''}`
  const repeat = seen.has(el)
  seen.add(el)
  let inClosed: string | null = null
  for (const selector of closed) {
    const panel = el.closest(selector)
    if (!panel) continue
    const shut = panel instanceof HTMLDetailsElement ? !panel.open : panel.hasAttribute('popover') && !panel.matches(':popover-open')
    // A <details> keeps its <summary> in the tab order on purpose: only what
    // the summary reveals counts as inside the closed panel.
    const isSummary = panel instanceof HTMLDetailsElement && el.closest('summary')?.parentElement === panel
    if (shut && !isSummary) {
      inClosed = selector
      break
    }
  }
  const first = [...document.querySelectorAll(target)].find((t) => t.getClientRects().length > 0)
  return { label, isTarget: el === first, repeat, inClosed }
}

/**
 * The state of a keyboard target after a key press: whether its panel is
 * open, whether focus is inside it, and whether focus is on the opener (the
 * first match of `open` on screen). For the bubble, the panel is the
 * <details> around the opener, so its mark counts as inside (the bubble holds
 * no control of its own); for a popover, the first match of `panel`.
 */
export function panelState({ open, panel }: { open: string; panel: string }) {
  const opener = [...document.querySelectorAll(open)].find((t) => t.getClientRects().length > 0)
  const box = opener?.closest(panel) ?? document.querySelector<HTMLElement>(panel)
  if (!box) return { found: false, isOpen: false, focusInside: false, focusOnOpener: false }
  const isOpen = box instanceof HTMLDetailsElement ? box.open : box.matches(':popover-open')
  const active = document.activeElement
  return { found: true, isOpen, focusInside: !!active && box.contains(active), focusOnOpener: !!opener && active === opener }
}

// --- Touch targets (WCAG 2.5.5 AAA: 44×44 px) ---------------------------------

/** What a tap can land on: every link, button and <summary>. */
export const TAP_TARGETS = 'a[href], button, summary'

/** The smallest tap area, in CSS px (WCAG 2.5.5, Apple's and Android's guidance). */
export const TAP_MIN = 44

export type Box = { left: number; top: number; right: number; bottom: number }

/**
 * Small targets that stay small on purpose, matched against a target's label
 * (its tag and classes, or its nearest classed ancestor's first class). Each one says why. Links inside running text are not
 * listed: they are exempt by rule (WCAG 2.5.5 "inline"), see tapTargetIssue.
 */
//
// Empty since 2026-10-21: every target on the guide reaches 44×44. Two stay out
// of the check without being listed, because they are not on screen while it
// runs (see tapTargetMeasure): the skip link, off screen until it takes
// keyboard focus, and the index pill, which hides on a scroll down (its 48px
// is checked by test:devices).
export const TAP_EXCEPTIONS: { label: RegExp; why: string }[] = []

/**
 * One target as measured in the page (tapTargetMeasure): its own border box,
 * its padding box (the containing block of its positioned ::before/::after),
 * and the resolved insets of those pseudo-elements when they are absolutely
 * positioned against it.
 */
export type TapMeasure = {
  label: string
  text: string
  inText: boolean
  box: Box
  padding: Box
  layers: { top: number; right: number; bottom: number; left: number }[]
}

/**
 * The area a tap could reach, to hit-test: the element's box grown by any
 * ::before/::after layer positioned against it (an invisible layer with
 * negative insets is how the guide widens a tap area without moving the
 * drawing), plus `slack` px on every side. A layer's box is its containing
 * block (the padding box) minus its insets; Chromium's hit area can sit a
 * border width off that (a 36px coin with a 1px border and -6px insets
 * takes 48px, not 46), so the slack lets the hit-test find the real edge.
 */
export function tapCandidateBox(m: Pick<TapMeasure, 'box' | 'padding' | 'layers'>, slack = 4): Box {
  const out = { ...m.box }
  for (const l of m.layers) {
    out.left = Math.min(out.left, m.padding.left + l.left)
    out.top = Math.min(out.top, m.padding.top + l.top)
    out.right = Math.max(out.right, m.padding.right - l.right)
    out.bottom = Math.max(out.bottom, m.padding.bottom - l.bottom)
  }
  return { left: out.left - slack, top: out.top - slack, right: out.right + slack, bottom: out.bottom + slack }
}

/**
 * The length of the unbroken run of hits around `from`, in samples. Hits come
 * from hit-testing one line across the candidate box: whatever paints on top
 * (a neighbour's layer, a clipping scroller, a sticky bar) cuts the run.
 */
export function hitRun(hits: boolean[], from: number): number {
  if (!hits[from]) return 0
  let a = from
  let b = from
  while (a > 0 && hits[a - 1]) a--
  while (b < hits.length - 1 && hits[b + 1]) b++
  return b - a + 1
}

/**
 * The verdict for one target: null when it passes (at least `min` × `min` of
 * effective area), when it is a link inside running text, or when it is in
 * TAP_EXCEPTIONS; otherwise what is wrong.
 */
export function tapTargetIssue(t: { label: string; inText: boolean; width: number; height: number }, min = TAP_MIN, exceptions = TAP_EXCEPTIONS): string | null {
  if (t.width >= min && t.height >= min) return null
  if (t.inText) return null
  if (exceptions.some((e) => e.label.test(t.label))) return null
  return `${t.label}: ${Math.round(t.width)}×${Math.round(t.height)}px tap area (< ${min}×${min})`
}

/**
 * In the page: the `index`-th TAP_TARGETS match, scrolled to the middle of the
 * screen (and its carousel slide, inline), measured for tapCandidateBox.
 * Null when it is not on screen (a closed panel or <details>).
 */
export function tapTargetMeasure({ selector, index }: { selector: string; index: number }) {
  const el = document.querySelectorAll<HTMLElement>(selector)[index]
  // checkVisibility also sees through a closed <details>, whose content keeps
  // its boxes in Chromium (content-visibility: hidden).
  if (!el || !el.checkVisibility({ visibilityProperty: true })) return null
  if (el.closest('[popover]:not(:popover-open), [inert]')) return null
  el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
  const r = el.getBoundingClientRect()
  if (r.width === 0 || r.height === 0) return null
  // Still off screen after scrolling (see TAP_EXCEPTIONS).
  if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return null
  const s = getComputedStyle(el)
  const px = (v: string) => parseFloat(v) || 0
  const box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
  const padding = {
    left: r.left + px(s.borderLeftWidth),
    top: r.top + px(s.borderTopWidth),
    right: r.right - px(s.borderRightWidth),
    bottom: r.bottom - px(s.borderBottomWidth),
  }
  const layers: { top: number; right: number; bottom: number; left: number }[] = []
  // A positioned pseudo-element only belongs to this element's area when the
  // element is its containing block.
  if (s.position !== 'static') {
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(el, pseudo)
      if (p.content === 'none' || p.content === 'normal' || p.position !== 'absolute' || p.pointerEvents === 'none' || p.display === 'none') continue
      const inset = [p.top, p.right, p.bottom, p.left].map((v) => parseFloat(v))
      if (inset.some((v) => Number.isNaN(v))) continue
      layers.push({ top: inset[0], right: inset[1], bottom: inset[2], left: inset[3] })
    }
  }
  // A link inside running text: inline, in a paragraph or list item that has
  // more text than the link itself.
  const block = el.closest('p, li, dd, td')
  const inText = s.display === 'inline' && !!block && block.textContent!.trim() !== el.textContent!.trim()
  // Its own classes, or the nearest classed ancestor's first one.
  const tag = el.tagName.toLowerCase()
  const owner = el.parentElement?.closest('[class]')
  const label = el.classList.length ? `${tag}.${[...el.classList].join('.')}` : `${owner ? '.' + owner.classList[0] + ' ' : ''}${tag}`
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
  return { label, text, inText, box, padding, layers }
}

/**
 * In the page, right after tapTargetMeasure (nothing has scrolled since):
 * hit-tests the two lines through the middle of the candidate box, one point
 * per CSS px, and returns whether each point lands on the target (or inside
 * it), plus where the target's own centre falls in each line.
 */
export function tapTargetHits({ selector, index, area }: { selector: string; index: number; area: Box }) {
  const el = document.querySelectorAll<HTMLElement>(selector)[index]
  const r = el.getBoundingClientRect()
  const cx = (r.left + r.right) / 2
  const cy = (r.top + r.bottom) / 2
  const on = (x: number, y: number) => {
    const hit = document.elementFromPoint(x, y)
    return !!hit && (hit === el || el.contains(hit))
  }
  const row: boolean[] = []
  const col: boolean[] = []
  // One sample in the middle of every CSS px of the area, so a box n px long
  // gives n samples wherever it starts.
  for (let x = area.left + 0.5; x < area.right; x++) row.push(on(x, cy))
  for (let y = area.top + 0.5; y < area.bottom; y++) col.push(on(cx, y))
  const at = (centre: number, start: number, n: number) => Math.min(n - 1, Math.max(0, Math.floor(centre - start)))
  return { row, col, rowFrom: at(cx, area.left, row.length), colFrom: at(cy, area.top, col.length) }
}

/** What the sharpness check knows of one photo on screen. */
export interface PhotoMeasure {
  label: string
  /** CSS pixels it is drawn at. */
  shownWidth: number
  dpr: number
  /** Pixel width of the file the browser picked. */
  fileWidth: number
  /** Pixel width of the original photo (data-source-width on the <img>). */
  sourceWidth: number
}

/** Screens past 2x gain little a reader can see; the bar stops there, so phones are not sent 3x files. */
export const PHOTO_MAX_DPR = 2
/** A file this close to the needed width still reads sharp. */
export const PHOTO_MIN_RATIO = 0.9

/**
 * Whether a photo is served softer than it is shown: its file narrower than
 * 90 % of the width shown × the pixel ratio (capped at 2x). When the
 * original itself is narrower than that and the file is about its full width,
 * the limit is the photo, not the page: that comes back as a "warning: …"
 * line instead. Null when sharp.
 */
export function photoSharpnessIssue(p: PhotoMeasure): string | null {
  const ratio = Math.min(p.dpr, PHOTO_MAX_DPR)
  const needs = Math.round(p.shownWidth * ratio * PHOTO_MIN_RATIO)
  if (p.fileWidth >= needs) return null
  const line = `${p.label}: ${p.fileWidth}px file shown at ${Math.round(p.shownWidth)}px × ${ratio} (needs ${needs}px)`
  const sourceLimited = p.sourceWidth < needs && p.fileWidth >= p.sourceWidth * 0.95
  return sourceLimited ? `warning: ${line}; the original is ${p.sourceWidth}px, a bigger original is needed` : line
}

/**
 * In the page: every photo on screen in <main>, with the file the browser
 * picked (decoded again without srcset to read its real width) and the
 * original's width from data-source-width. Scroll first so lazy ones load.
 * A photo without the attribute counts its file as the original.
 */
export async function photoMeasures(): Promise<PhotoMeasure[]> {
  const imgs = [...document.querySelectorAll<HTMLImageElement>('main img')].filter((img) => img.currentSrc && img.getBoundingClientRect().width > 0)
  return Promise.all(imgs.map(async (img) => {
    const probe = new Image()
    probe.src = img.currentSrc
    await probe.decode().catch(() => {})
    const label = `${img.className || img.parentElement?.className || 'img'} (${img.currentSrc.split('/').pop()?.split('.')[0]})`
    return {
      label,
      shownWidth: img.getBoundingClientRect().width,
      dpr: devicePixelRatio,
      fileWidth: probe.naturalWidth,
      sourceWidth: Number(img.dataset.sourceWidth) || probe.naturalWidth,
    }
  }))
}
