import type { Guide } from '../content/schema';

/** Google Maps caps a directions URL at an origin, a destination and 23 waypoints. */
const MAX_WAYPOINTS = 23;

type Stop = Guide['days'][number]['stops'][number];

/**
 * Directions links for one day's stops. A day with more stops than Google
 * accepts is split into several legs rather than silently truncated, since a
 * dropped stop is a traveller standing in the wrong street.
 */
export function directionsUrls(stops: Stop[]): string[] {
  if (stops.length < 2) return [];

  const coords = stops.map((stop) => `${stop.lat},${stop.lng}`);
  const perLeg = MAX_WAYPOINTS + 2;
  const legs: string[] = [];

  for (let start = 0; start < coords.length - 1; start += perLeg - 1) {
    const leg = coords.slice(start, start + perLeg);
    if (leg.length < 2) break;

    const params = new URLSearchParams({
      api: '1',
      origin: leg[0],
      destination: leg[leg.length - 1],
    });

    const waypoints = leg.slice(1, -1);
    if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'));

    legs.push(`https://www.google.com/maps/dir/?${params.toString()}`);
  }

  return legs;
}

/** Total cost of everything priced on a day, or null when nothing is priced. */
export function dayCost(stops: Stop[]): number | null {
  const priced = stops.filter((stop) => stop.cost);
  if (priced.length === 0) return null;

  return priced.reduce((total, stop) => total + (stop.cost?.amount ?? 0), 0);
}

/**
 * Whether this day was part of the trip the author actually made, rather than
 * adapted from it. Derived, never stored: marking each day by hand would be
 * recurring work, and recurring work is a defect in this project.
 */
export function wasLived(guide: Guide, dayNumber: number): boolean {
  const trip = guide.meta.tripDone;
  if (!trip) return false;

  return (guide.variants[String(trip.days)] ?? []).includes(dayNumber);
}

/** Whether a group's adjustments describe the trip as lived, or an adaptation. */
export function groupWasLived(guide: Guide, group: string): boolean {
  return guide.meta.tripDone?.group === group;
}

export const GROUP_LABELS: Record<string, string> = {
  couple: 'En pareja',
  friends: 'Con amigos',
  family_seniors: 'En familia con mayores',
};

export const PACE_LABELS: Record<string, string> = {
  relaxed: 'tranquilo',
  medium: 'medio',
  intense: 'intenso',
};

export const HILLS_LABELS: Record<string, string> = {
  none: 'sin cuestas',
  some: 'algunas cuestas',
  many: 'muchas cuestas',
};

export const PRICE_LABELS: Record<string, string> = {
  low: '€',
  mid: '€€',
  high: '€€€',
};
