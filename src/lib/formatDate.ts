/** `timeZone: 'UTC'` avoids shifting an ISO date (parsed as UTC midnight) back a day in negative-offset timezones. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}
