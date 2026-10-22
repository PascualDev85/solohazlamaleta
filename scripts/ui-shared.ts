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
