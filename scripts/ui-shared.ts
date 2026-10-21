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
 * first, so every stop counts.
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
    for (const n of day.querySelectorAll<HTMLElement>('.day-stop__name')) if (n.scrollWidth > n.clientWidth + 0.5) out.push(`${id}: stop name overflows (${n.textContent?.trim()})`)
    for (const p of day.querySelectorAll<HTMLElement>('.day-stop__practical')) if (p.scrollWidth > p.clientWidth + 0.5) out.push(`${id}: practical line overflows`)
  }
  return out
}

/**
 * The site header on a phone: brand and links in one row (no hamburger, so
 * nothing may wrap), every link at least 44px tall, nothing pushing the page
 * sideways, and not fixed or sticky (it would cover anchors and fight the
 * guide's floating index pill). Returns what broke.
 */
export function siteHeaderIssues() {
  const issues: string[] = []
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return ['site header missing']
  const position = getComputedStyle(header).position
  if (position === 'fixed' || position === 'sticky') issues.push(`site header is ${position}`)
  const links = [...header.querySelectorAll<HTMLElement>('a')]
  const tops = new Set(links.map((a) => Math.round(a.getBoundingClientRect().top)))
  if (tops.size > 1) issues.push('site header wraps onto a second row')
  for (const a of links) {
    const box = a.getBoundingClientRect()
    if (box.height < 44) issues.push(`site header link "${a.textContent?.trim()}" is ${Math.round(box.height)}px tall (< 44)`)
    if (box.right > document.documentElement.clientWidth) issues.push(`site header link "${a.textContent?.trim()}" overflows the viewport`)
  }
  if (!header.querySelector('nav[aria-label="Principal"]')) issues.push('main navigation landmark missing')
  return issues
}

/**
 * The scroll-driven animations must survive the production build. The
 * minifier folds "animation" and "animation-timeline" into one shorthand that
 * carries the timeline; no browser accepts that, so it drops the declaration
 * and the effect silently disappears (the day cards' 3D turn and the glance's
 * "Hasta el día 13" fade did, until 2026-10-16; dev builds, unminified, still
 * showed them). Two checks: no shorthand in the page's own CSS carries a
 * timeline, and the elements that should animate really have an animation.
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
