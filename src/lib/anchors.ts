// Ids that one component sets and others link to. Built in one place so a
// link can never point at an id that is spelled differently.

/** The day card's heading: the target of the day strip, the guide index and the glance. Unpadded: "dia-3". */
export function dayAnchorId(day: number): string {
  return `dia-${day}`
}

/** A campsite card in "Dónde dormir": the target of "Noche → …" on the day card. */
export function campsiteAnchorId(placeId: string): string {
  return `dormir-${placeId}`
}

/** The hub's "Lo práctico" section: the guides point there instead of repeating it (1.13 §3). */
export const HUB_PRACTICAL_ID = 'practico'

/** Link from a guide to a section of its hub, built from the guide's `hub` path ("/islandia/"). */
export function hubSectionHref(hub: string, sectionId: string): string {
  const path = hub.endsWith('/') ? hub : `${hub}/`
  return `${path}#${sectionId}`
}

/** The hub's other sections, linked from its index and from the guides' closing (1.9 B.11). */
export const HUB_GUIDES_ID = 'nuestra-guia'
export const HUB_SEE_ID = 'que-ver'
export const HUB_WHEN_ID = 'cuando-ir'
export const HUB_MOVING_ID = 'moverse'
export const HUB_FAQ_ID = 'faq'
