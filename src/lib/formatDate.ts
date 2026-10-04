/** `timeZone: 'UTC'` avoids shifting an ISO date (parsed as UTC midnight) back a day in negative-offset timezones. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}

/** Full date in words: "4 de octubre de 2026". */
export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}

/** Short month and year for dates sitting next to a price: "sept 2025". */
export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}
