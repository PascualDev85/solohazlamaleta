// Keyboard focus inside an open panel (native popover with role="dialog").
// A popover does not hold focus: Tab walks out of it onto the page behind the
// backdrop while it stays open, and Chromium also jumps out of the panel from
// a <summary> (the index's "La ruta" group), so the rows after it could not be
// reached. While a panel is open, Tab and Shift+Tab cycle through its own
// controls; Esc and the close button still close it and return focus natively.

/** Where Tab goes from `current` in a list of `length` controls, wrapping at both ends. */
export function cycleIndex(current: number, length: number, back: boolean): number {
  if (length === 0) return -1
  if (current < 0) return back ? length - 1 : 0
  return (current + (back ? length - 1 : 1)) % length
}

const TABBABLE = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

export function keepFocusIn(panel: HTMLElement) {
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !panel.matches(':popover-open')) return
    // Only what is on screen: links inside a closed <details> have no boxes,
    // and the glance's "Hasta el día" pill turns hidden at the list's end.
    const controls = [...panel.querySelectorAll<HTMLElement>(TABBABLE)].filter(
      (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
    )
    const next = controls[cycleIndex(controls.indexOf(document.activeElement as HTMLElement), controls.length, event.shiftKey)]
    if (!next) return
    event.preventDefault()
    next.focus()
  })
}
