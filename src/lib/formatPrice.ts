/**
 * Prices in Spanish format (1.234,56 €), not toFixed's "1234.56": the pages
 * are in Spanish. `useGrouping: true` is explicit and required: this Node/ICU
 * build does not group thousands for the "es-ES" locale by default
 * (verified: `Intl.NumberFormat('es-ES').format(4495.21)` gives "4495,21",
 * not "4.495,21", while "de-DE" groups the same number correctly with no
 * extra options).
 */
function priceFormat(currency: string, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, useGrouping: true, ...options })
}

/** A price with the currency's own decimals: "4.495,21 €", "4.500 ISK". For the budget, where cents add up. */
export function formatPrice(amount: number, currency: string): string {
  return priceFormat(currency).format(amount)
}

/** A price to the whole unit: "2.248 €". For figures read at a glance (trip facts, parking, a night's camping). */
export function formatWholePrice(amount: number, currency: string): string {
  return priceFormat(currency, { maximumFractionDigits: 0 }).format(amount)
}
