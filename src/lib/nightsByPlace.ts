/** The part of a compiled day that "Dónde dormir" needs: which campsite, if any, the night was spent in. */
export interface NightOfDay {
  day: number
  /** A campsite, null for a night outside any campsite, absent when the day has no night. */
  overnight?: { place_id: string } | null
}

/** Day numbers per campsite, so each campsite card can say "Noche 3 · Día 3" and link back to its day. */
export function nightsByPlace(days: NightOfDay[]): Map<string, number[]> {
  const nights = new Map<string, number[]>()
  for (const day of days) {
    if (!day.overnight) continue
    const list = nights.get(day.overnight.place_id) ?? []
    list.push(day.day)
    nights.set(day.overnight.place_id, list)
  }
  return nights
}

/** How many nights were in a campsite and how many outside (overnight: null). A day without a night counts for neither. */
export function nightCounts(days: NightOfDay[]): { campsite: number; outside: number } {
  let campsite = 0
  let outside = 0
  for (const day of days) {
    if (day.overnight) campsite++
    else if (day.overnight === null) outside++
  }
  return { campsite, outside }
}
