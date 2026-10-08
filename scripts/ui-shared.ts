// In-page checks shared by scripts/ui-check.ts and scripts/ui-devices.ts.
// Each function runs inside the browser (page.evaluate), so it must stay
// self-contained: no imports, no closures over module scope.

/** The overlay panels and what opens them. Selectors in the page's own terms. */
export const PANELS = [
  { name: 'ruta de un vistazo', open: '.route__title', panel: '.route-glance', head: '.route-glance__head', close: '.route-glance__close' },
  { name: 'índice', open: '.guide-index__dock', panel: '.guide-index', head: '.guide-index__head', close: '.guide-index__close' },
  {
    name: 'día completo (día 3)',
    open: 'article[aria-labelledby="dia-3"] .day-card__full',
    panel: 'article[aria-labelledby="dia-3"] .day-sheet',
    head: 'article[aria-labelledby="dia-3"] .day-sheet__head',
    close: 'article[aria-labelledby="dia-3"] .day-sheet__close',
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
 * the route in two rows at most; facts, night, each stop's name and its
 * practical line in one. Opens "Ver N paradas más" first, so every stop counts.
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
    if (route && rows(route) > 2) out.push(`${id}: route in ${rows(route)} rows`)
    if (rows(facts) > 1) out.push(`${id}: facts wrap`)
    const night = day.querySelector('.day-card__night')
    if (night && rows(night) > 1) out.push(`${id}: night wraps`)
    for (const n of day.querySelectorAll<HTMLElement>('.day-stop__name')) if (n.scrollWidth > n.clientWidth + 0.5) out.push(`${id}: stop name overflows (${n.textContent?.trim()})`)
    for (const p of day.querySelectorAll<HTMLElement>('.day-stop__practical')) if (p.scrollWidth > p.clientWidth + 0.5) out.push(`${id}: practical line overflows`)
  }
  return out
}
