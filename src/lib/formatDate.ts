/** `timeZone: 'UTC'` avoids shifting an ISO date (parsed as UTC midnight) back a day in negative-offset timezones. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}

/** Numeric day/month/year: "04/10/2026". */
export function formatNumericDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}
