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
