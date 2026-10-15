/** The day as the strip, the index, the glance and the sheet show it: "03", so every coin is the same width. */
export function twoDigitDay(day: number): string {
  return String(day).padStart(2, '0')
}
