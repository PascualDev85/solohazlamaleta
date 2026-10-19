// Pure helpers for scripts/add-photo.ts: naming, warnings, the YAML block and
// its insertion into a day. No file system and no sharp here, so they can be
// tested on their own.

// Day cards are 4:5 and look soft below this width on a 2x phone screen.
export const MIN_CARD_WIDTH = 1200
// Same bounds as the photos already in src/assets/guides/.
export const MAX_WIDTH = 1920
export const MAX_HEIGHT = 2400

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// Letters NFD does not split into base + accent.
const LETTER_MAP: Record<string, string> = { þ: 'th', ð: 'd', æ: 'ae', ø: 'o', œ: 'oe', ß: 'ss', ł: 'l', đ: 'd' }

/** Project slug: lowercase, no accents, words joined by single hyphens. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[þðæøœßłđ]/g, (c) => LETTER_MAP[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Slug from a file path: its name without folders or extension. */
export function slugFromFileName(path: string): string {
  const base = path.split(/[\\/]/).pop() ?? ''
  return slugify(base.replace(/\.[^.]+$/, ''))
}

/** True for names straight out of a camera or phone (IMG_1234, DSC01234, PXL_2025...). */
export function looksLikeCameraName(slug: string): boolean {
  return /^(img|dsc|dscn|dji|pxl|gopr|mvimg|photo|image)-?\d/.test(slug)
}

/** `<destination>-<slug>.jpg`, without repeating the destination if the slug already starts with it. */
export function outputFileName(destination: string, slug: string): string {
  const name = slug.startsWith(`${destination}-`) ? slug : `${destination}-${slug}`
  return `${name}.jpg`
}

/** What the day's `photo.src` holds: relative to src/assets/guides/. */
export function photoSrc(destination: string, fileName: string): string {
  return `${destination}/${fileName}`
}

/** Output size of the existing resize: fit inside 1920×2400, never enlarged. */
export function fitInside(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_WIDTH / width, MAX_HEIGHT / height)
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/** Warnings about the original, measured after applying its EXIF rotation. */
export function sizeWarnings(width: number, height: number): string[] {
  const warnings: string[] = []
  if (width < MIN_CARD_WIDTH) {
    warnings.push(`La foto mide ${width} px de ancho: por debajo de ${MIN_CARD_WIDTH} px se verá blanda en la tarjeta del día.`)
  }
  if (width > height) {
    warnings.push(`La foto es horizontal (${width}×${height}): la tarjeta del día es 4:5 vertical y recortará los laterales. Mejor una vertical o cuadrada.`)
  }
  return warnings
}

/** First EXIF date in the raw EXIF block ("2025:09:14 10:22:31") as `YYYY-MM`. */
export function exifMonth(exif: Uint8Array | undefined): string | undefined {
  if (!exif) return undefined
  const text = new TextDecoder('latin1').decode(exif)
  const match = text.match(/((?:19|20)\d{2}):(0[1-9]|1[0-2]):\d{2} \d{2}:\d{2}:\d{2}/)
  return match ? `${match[1]}-${match[2]}` : undefined
}

/** "2025-09" → "septiembre de 2025". */
export function spanishMonth(yearMonth: string): string | undefined {
  const match = yearMonth.match(/^(\d{4})-(\d{2})/)
  if (!match) return undefined
  const month = MONTHS[Number(match[2]) - 1]
  return month ? `${month} de ${match[1]}` : undefined
}

/** "<Lugar>, <mes de año>", or just the place when the date is unknown. */
export function suggestCaption(place: string, yearMonth: string | undefined): string {
  const when = yearMonth ? spanishMonth(yearMonth) : undefined
  return when ? `${place}, ${when}` : place
}

function quote(text: string): string {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/** The `photo:` block, indented for a day of the guide (8 spaces by default). */
export function photoYamlBlock(src: string, caption?: string, indent = '        '): string {
  const lines = [`${indent}photo:`, `${indent}  src: ${src}`, `${indent}  alt: ""`]
  if (caption) lines.push(`${indent}  caption: ${quote(caption)}`)
  return lines.join('\n')
}

const indentOf = (line: string) => line.length - line.trimStart().length

/**
 * Inserts the photo block into day `day` of the guide's YAML text, after its
 * `summary` (or `title`), keeping every comment and line untouched. Text edit
 * on purpose: re-serializing the YAML would reflow the author's file.
 * Only the first variant's days are touched (the first `- day: N` found).
 */
export function insertDayPhoto(guideText: string, day: number, src: string, caption?: string): string {
  const lines = guideText.split('\n')
  const start = lines.findIndex((line) => new RegExp(`^\\s*- day: ${day}\\s*(#.*)?$`).test(line))
  if (start === -1) throw new Error(`No existe el día ${day} en la guía.`)

  const dashIndent = indentOf(lines[start])
  const keyIndent = dashIndent + 2
  let end = start + 1
  while (end < lines.length) {
    const line = lines[end]
    if (line.trim() !== '' && indentOf(line) <= dashIndent) break
    end++
  }

  const keyLine = (key: string) =>
    lines.findIndex((line, i) => i > start && i < end && indentOf(line) === keyIndent && line.trimStart().startsWith(`${key}:`))
  if (keyLine('photo') !== -1) throw new Error(`El día ${day} ya tiene foto: no se toca.`)

  const anchor = keyLine('summary') !== -1 ? keyLine('summary') : start
  // The block goes before the next key, and before any comments sitting on it
  // or the blank lines that close the day.
  let insertAt = anchor + 1
  while (insertAt < end && !(indentOf(lines[insertAt]) <= keyIndent && lines[insertAt].trim() !== '')) insertAt++
  while (insertAt - 1 > anchor && (lines[insertAt - 1].trim() === '' || lines[insertAt - 1].trimStart().startsWith('#'))) insertAt--

  const block = photoYamlBlock(src, caption, ' '.repeat(keyIndent))
  return [...lines.slice(0, insertAt), block, ...lines.slice(insertAt)].join('\n')
}
