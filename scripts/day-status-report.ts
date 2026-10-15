// Pure helpers for scripts/day-status.ts: what each day still needs from the
// author before it can be called done. Inputs are the guide and places as the
// engine loads them, plus the two YAML texts, read only for their comments
// (the loader drops comments, and some pending marks live there).

// Above this many characters a name crowds the day's route line, so it wants a short_name.
export const LONG_NAME_CHARS = 16

const DURATIONS_PENDING = /duraci[oó]n(es)? estimadas?,? pendientes? de confirmar/i
const DRIVE_PENDING = /estimaci[oó]n pendiente de confirmar/i
const COORDS_PENDING = /pendientes? de confirmar/i

export interface PlaceLike {
  place_id: string
  name: string
  short_name?: string
  maps_url?: string
  parking?: unknown
  notes?: string
}

export interface StopLike {
  place_id: string
  visit_status?: string
  skip_reason?: string
  duration_note?: string
}

export interface DayLike {
  day: number
  title: string
  stops: StopLike[]
  photo?: { src?: string; alt?: string }
  highlight?: string
  drive?: unknown
  overnight?: string | null
}

export type PhotoState = 'ok' | 'missing' | 'no_alt'
export type OvernightState = 'camp' | 'outside' | 'missing' | 'not_needed'

export interface StopStatus {
  place_id: string
  name: string
  skipped: boolean
  /** What the stop still lacks, in Spanish, ready to print. */
  missing: string[]
  coords_pending: boolean
  duration_note?: string
}

export interface DayStatus {
  day: number
  title: string
  photo: PhotoState
  highlight: boolean
  drive: boolean
  drive_confirmed: boolean
  overnight: OvernightState
  /** place_id of the night's campsite, when there is one. */
  overnight_camp?: string
  overnight_coords_pending: boolean
  durations_confirmed: boolean
  stops: StopStatus[]
  /** Everything left to close the day, one line each. */
  pending: string[]
  done: boolean
}

export interface Summary {
  days: number
  done: number[]
  pending: { day: number; count: number }[]
  /** Unique places (stops and campsites) whose coordinates wait for the author. */
  coords_pending: string[]
}

const indentOf = (line: string) => line.length - line.trimStart().length

/**
 * Days left as estimates in the guide's comments: `durations` when the day's
 * block says "duraciones estimadas, pendiente de confirmar"; `drive` when the
 * comment right above its `drive:` says "estimación pendiente de confirmar".
 * Only the first block found per day counts (the first variant).
 */
export function estimatesFromComments(guideText: string): { durations: Set<number>; drive: Set<number> } {
  const lines = guideText.split('\n')
  const durations = new Set<number>()
  const drive = new Set<number>()
  const seen = new Set<number>()
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\s*)- day: (\d+)\s*(#.*)?$/)
    if (!match) continue
    const day = Number(match[2])
    if (seen.has(day)) continue
    seen.add(day)
    const dashIndent = match[1].length
    let comments: string[] = []
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j]
      if (line.trim() !== '' && indentOf(line) <= dashIndent) break
      if (line.trimStart().startsWith('#')) {
        if (DURATIONS_PENDING.test(line)) durations.add(day)
        comments.push(line)
        continue
      }
      if (indentOf(line) === dashIndent + 2 && line.trimStart().startsWith('drive:') && comments.some((c) => DRIVE_PENDING.test(c))) {
        drive.add(day)
      }
      comments = []
    }
  }
  return { durations, drive }
}

/**
 * place_ids marked as pending in the places file's comments: either the
 * comment lines right above the block, or a `# ---` section header whose
 * text says so (it covers every block until the next header).
 */
export function placesPendingByComment(placesText: string): Set<string> {
  const lines = placesText.split('\n')
  const result = new Set<string>()
  let sectionPending = false
  let above: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('#')) {
      if (line.startsWith('# ---') && !lines[i - 1]?.startsWith('# ---')) {
        // A new section: its header is this run of `# ---` lines plus any comments right after.
        let header = ''
        for (let j = i; j < lines.length && lines[j].startsWith('#'); j++) header += ` ${lines[j]}`
        sectionPending = COORDS_PENDING.test(header)
      }
      above.push(line)
      continue
    }
    const match = line.match(/^- place_id: *([\w-]+)/)
    if (match && (sectionPending || above.some((c) => COORDS_PENDING.test(c)))) result.add(match[1])
    above = []
  }
  return result
}

function coordsPending(place: PlaceLike, byComment: Set<string>): boolean {
  return byComment.has(place.place_id) || COORDS_PENDING.test(place.notes ?? '')
}

export function stopStatus(stop: StopLike, place: PlaceLike | undefined, byComment: Set<string>): StopStatus {
  const skipped = stop.visit_status === 'not_visited'
  if (!place) {
    return { place_id: stop.place_id, name: stop.place_id, skipped, missing: ['lugar inexistente en places'], coords_pending: false }
  }
  const missing: string[] = []
  const pending = coordsPending(place, byComment)
  if (skipped) {
    if (!stop.skip_reason?.trim()) missing.push('skip_reason')
  } else {
    if (place.parking === undefined) missing.push('parking')
    if (!place.maps_url) missing.push('ficha de mapa')
  }
  if (pending) missing.push('coordenadas')
  if (place.name.length > LONG_NAME_CHARS && !place.short_name) missing.push('short_name')
  return {
    place_id: place.place_id,
    name: place.short_name ?? place.name,
    skipped,
    missing,
    coords_pending: pending,
    ...(stop.duration_note ? { duration_note: stop.duration_note } : {}),
  }
}

export function dayStatus(
  day: DayLike,
  places: (placeId: string) => PlaceLike | undefined,
  options: { isLastDay: boolean; durationsEstimated: boolean; driveEstimated?: boolean; pendingByComment: Set<string> },
): DayStatus {
  const photo: PhotoState = !day.photo ? 'missing' : day.photo.alt?.trim() ? 'ok' : 'no_alt'
  const highlight = Boolean(day.highlight?.trim())
  const drive = day.drive !== undefined && day.drive !== null
  const overnight: OvernightState =
    day.overnight === null ? 'outside'
      : typeof day.overnight === 'string' ? 'camp'
        : options.isLastDay ? 'not_needed' : 'missing'
  const camp = typeof day.overnight === 'string' ? places(day.overnight) : undefined
  const overnightCoordsPending = camp ? coordsPending(camp, options.pendingByComment) : false
  const stops = day.stops.map((stop) => stopStatus(stop, places(stop.place_id), options.pendingByComment))

  const pending: string[] = []
  if (photo === 'missing') pending.push('foto')
  if (photo === 'no_alt') pending.push('alt de la foto')
  if (!highlight) pending.push('lo mejor del día')
  if (!drive) pending.push('conducción')
  else if (options.driveEstimated) pending.push('conducción por confirmar')
  if (overnight === 'missing') pending.push('noche')
  if (overnightCoordsPending) pending.push(`coordenadas del camping (${camp!.short_name ?? camp!.name})`)
  if (options.durationsEstimated) pending.push('duraciones por confirmar')
  for (const stop of stops) {
    for (const item of stop.missing) pending.push(`${stop.name}: ${item}`)
  }

  return {
    day: day.day,
    title: day.title,
    photo,
    highlight,
    drive,
    drive_confirmed: drive && !options.driveEstimated,
    overnight,
    ...(typeof day.overnight === 'string' ? { overnight_camp: day.overnight } : {}),
    overnight_coords_pending: overnightCoordsPending,
    durations_confirmed: !options.durationsEstimated,
    stops,
    pending,
    done: pending.length === 0,
  }
}

export function summarize(statuses: DayStatus[]): Summary {
  const coords = new Set<string>()
  for (const status of statuses) {
    for (const stop of status.stops) if (stop.coords_pending) coords.add(stop.place_id)
    if (status.overnight_coords_pending && status.overnight_camp) coords.add(status.overnight_camp)
  }
  return {
    days: statuses.length,
    done: statuses.filter((s) => s.done).map((s) => s.day),
    pending: statuses.filter((s) => !s.done).map((s) => ({ day: s.day, count: s.pending.length })),
    coords_pending: [...coords],
  }
}

const PHOTO_CELL: Record<PhotoState, string> = { ok: '✓', missing: 'falta', no_alt: 'sin alt' }
const OVERNIGHT_CELL: Record<OvernightState, string> = { camp: '✓ camping', outside: '✓ fuera', missing: 'falta', not_needed: '—' }
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const check = (ok: boolean) => (ok ? '✓' : 'falta')

/** Pads to a width in characters (code points), so "Þ" or "✓" count as one. */
function pad(text: string, width: number): string {
  return text + ' '.repeat(Math.max(0, width - [...text].length))
}

export function formatTable(rows: string[][]): string {
  const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => [...row[col]].length)))
  const line = (row: string[]) => row.map((cell, col) => pad(cell, widths[col])).join('  ').trimEnd()
  return [line(rows[0]), widths.map((w) => '─'.repeat(w)).join('  '), ...rows.slice(1).map(line)].join('\n')
}

/** The plain-text report: table, then what is left per open day, then the summary. */
export function formatReport(statuses: DayStatus[], summary: Summary): string {
  const header = ['Día', 'Foto', 'Lo mejor', 'Conducción', 'Noche', 'Duraciones', 'Paradas', 'Pendientes']
  const rows = statuses.map((s) => {
    const openStops = s.stops.filter((stop) => stop.missing.length > 0).length
    return [
      String(s.day),
      PHOTO_CELL[s.photo],
      check(s.highlight),
      s.drive ? (s.drive_confirmed ? '✓' : 'estimada') : 'falta',
      OVERNIGHT_CELL[s.overnight],
      s.durations_confirmed ? '✓' : 'estimadas',
      openStops === 0 ? `✓ ${s.stops.length}` : `${openStops} de ${s.stops.length}`,
      s.done ? '✓ cerrado' : String(s.pending.length),
    ]
  })
  const out = [formatTable([header, ...rows])]

  for (const s of statuses) {
    const notes = s.stops.filter((stop) => stop.duration_note)
    if (s.done && notes.length === 0) continue
    out.push('', `Día ${s.day} · ${s.title}${s.done ? ' — cerrado' : ` — ${plural(s.pending.length, 'pendiente', 'pendientes')}`}`)
    for (const item of s.pending) out.push(`  · ${item}`)
    for (const stop of notes) out.push(`  i ${stop.name}: duration_note "${stop.duration_note}"`)
  }

  const open = summary.pending.map((p) => `día ${p.day} (${p.count})`).join(', ')
  out.push(
    '',
    `Días cerrados: ${summary.done.length} de ${summary.days}${summary.done.length ? ` (${summary.done.join(', ')})` : ''}`,
    `Días con pendientes: ${summary.pending.length}${open ? ` — ${open}` : ''}`,
    `Coordenadas pendientes: ${plural(summary.coords_pending.length, 'lugar', 'lugares')}`,
  )
  return out.join('\n')
}
