/**
 * A single "ver en Maps" link per stop — never a multi-waypoint day route.
 * Google Maps Directions caps waypoints around 9-10, and some Islandia days
 * (e.g. day 11, with 8 stops) are close enough to that limit that a day-level
 * route link is the wrong contract to offer.
 */
export function placeMapUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
