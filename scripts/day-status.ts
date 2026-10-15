// What each day of the Islandia guide still needs from the author to close it:
// photo, highlight, drive (and whether it is still an estimate), night,
// confirmed durations, and per stop parking, map card, pending coordinates,
// skip_reason and short_name.
//
//   npm run day:status            all days
//   npm run day:status -- 4       only day 4
//   npm run day:status -- --json  the same, as JSON
//
// Data comes through the engine loader and schemas. The YAML text is read only
// for comments (estimated durations and drive, and the pending marks over
// place blocks), which the loader drops.
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { loadGuide, loadPlaces, buildPlaceRegistry, validateGuide } from '../engine/index.ts'
import type { AffiliateRegistry } from '../engine/index.ts'
import {
  dayStatus, estimatesFromComments, formatReport, placesPendingByComment, summarize,
  type DayLike, type PlaceLike,
} from './day-status-report.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const PLACES_PATH = 'content/places/islandia.yaml'
const USAGE = 'Uso: npm run day:status [-- N] [--json]'

type GuideLike = { summary?: { pace_default?: string }; variants?: { id: string; days: DayLike[] }[] }

const { values, positionals } = (() => {
  try {
    return parseArgs({ allowPositionals: true, options: { json: { type: 'boolean', default: false } } })
  } catch (error) {
    console.error(`${(error as Error).message}\n${USAGE}`)
    process.exit(2)
  }
})()
const only = positionals[0] === undefined ? undefined : Number(positionals[0])
if (positionals.length > 1 || (only !== undefined && !(Number.isInteger(only) && only > 0))) {
  console.error(USAGE)
  process.exit(2)
}

const rawGuide = await loadGuide(GUIDE_PATH)
const rawPlaces = (await loadPlaces(PLACES_PATH)) as unknown[]
const { registry, errors: placeErrors } = buildPlaceRegistry(rawPlaces)
if (placeErrors.length > 0) {
  console.error(`✘ Errores en ${PLACES_PATH}:\n  ${placeErrors.join('\n  ')}`)
  process.exit(1)
}

// A guide that does not validate yet (say, a photo whose alt is still empty) is
// exactly when this report is useful: show the errors and go on with the
// loaded data, which has the same shape.
const noAffiliates: AffiliateRegistry = { get: () => undefined }
const result = validateGuide(rawGuide, registry, noAffiliates)
if (result.errors.length > 0) {
  console.error(`⚠ La guía no valida (npm run content:validate); el estado se calcula igualmente:\n  ${result.errors.join('\n  ')}\n`)
}
const guide = (result.guide ?? rawGuide) as GuideLike

const variant = guide.variants?.find((v) => v.id === guide.summary?.pace_default) ?? guide.variants?.[0]
if (!variant) {
  console.error('✘ La guía no tiene variantes con días.')
  process.exit(1)
}

const [guideText, placesText] = await Promise.all([readFile(GUIDE_PATH, 'utf8'), readFile(PLACES_PATH, 'utf8')])
const estimated = estimatesFromComments(guideText)
const pendingByComment = placesPendingByComment(placesText)
const lastDay = Math.max(...variant.days.map((d) => d.day))
const places = (id: string) => registry.get(id) as PlaceLike | undefined

const days = variant.days.filter((d) => only === undefined || d.day === only)
if (days.length === 0) {
  console.error(`✘ No existe el día ${only} (la guía va del 1 al ${lastDay}).`)
  process.exit(1)
}

const statuses = days.map((day) =>
  dayStatus(day, places, {
    isLastDay: day.day === lastDay,
    durationsEstimated: estimated.durations.has(day.day),
    driveEstimated: estimated.drive.has(day.day),
    pendingByComment,
  }),
)
const summary = summarize(statuses)

if (values.json) {
  console.log(JSON.stringify({ guide: GUIDE_PATH, variant: variant.id, days: statuses, summary }, null, 2))
} else {
  console.log(`${GUIDE_PATH} · variante ${variant.id}\n`)
  console.log(formatReport(statuses, summary))
}
