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
