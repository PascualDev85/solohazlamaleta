// Adds a day photo the way the existing ones were added: EXIF rotation applied,
// fit inside 1920×2400 without enlarging, JPEG 85 (mozjpeg), no metadata, saved
// as src/assets/guides/<destination>/<destination>-<slug>.jpg.
//
//   npm run photo -- <file> <destination> [--name <slug>] [--caption <place>] [--day N] [--force] [--guide <yaml>]
//   e.g. npm run photo -- ~/Fotos/IMG_2041.jpg islandia --name dettifoss --caption Dettifoss --day 8
//
// Prints the `photo:` block ready to paste. With --day N it writes it into day
// N of the destination's guide (only if that day has no photo yet), with an
// empty `alt` on purpose: the schema rejects it, so the build fails until the
// author describes the photo.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { parseArgs } from 'node:util'
import sharp from 'sharp'
import { loadGuide } from '../engine/index.ts'
import {
  MAX_HEIGHT, MAX_WIDTH, exifMonth, fitInside, insertDayPhoto, looksLikeCameraName, outputFileName,
  photoSrc, photoYamlBlock, sizeWarnings, slugFromFileName, slugify, suggestCaption,
} from './photo-tools.ts'

const USAGE = 'Uso: npm run photo -- <fichero> <destino> [--name <slug>] [--caption <lugar>] [--day N] [--force] [--guide <yaml>]'
const ASSETS_DIR = 'src/assets/guides'
const GUIDES_DIR = 'content/guides'

type DayLike = { day: number; photo?: unknown }
type GuideLike = { trip_done?: string; variants?: { days?: DayLike[] }[] }

function fail(message: string, code = 1): never {
  console.error(`✘ ${message}`)
  process.exit(code)
}

const { values, positionals } = (() => {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        name: { type: 'string' },
        caption: { type: 'string' },
        day: { type: 'string' },
        guide: { type: 'string' },
        force: { type: 'boolean', default: false },
      },
    })
  } catch (error) {
    fail(`${(error as Error).message}\n${USAGE}`, 2)
  }
})()

const [input, destination] = positionals
if (!input || !destination || positionals.length > 2) fail(USAGE, 2)
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(destination)) fail(`El destino "${destination}" no es un slug válido (p. ej. islandia).`, 2)
if (!existsSync(input)) fail(`No encuentro el fichero ${input}.`)
const day = values.day === undefined ? undefined : Number(values.day)
if (day !== undefined && !(Number.isInteger(day) && day > 0)) fail(`--day espera un número de día (recibido "${values.day}").`, 2)

const slug = values.name ? slugify(values.name) : slugFromFileName(input)
if (!slug) fail('No puedo sacar un nombre del fichero: pásalo con --name <slug>.', 2)

function findGuide(): string | undefined {
  if (values.guide) return values.guide
  const dir = join(GUIDES_DIR, destination)
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.yaml')) : []
  if (files.length === 1) return join(dir, files[0])
  if (day !== undefined) {
    fail(files.length === 0
      ? `No hay ninguna guía en ${dir}/.`
      : `Hay ${files.length} guías en ${dir}/: elige una con --guide <ruta>.`)
  }
  return undefined
}

async function readImage() {
  const isHeic = ['.heic', '.heif'].includes(extname(input).toLowerCase())
  try {
    const meta = await sharp(input).metadata()
    // Decoding a pixel proves sharp can read it: HEIC files often pass metadata() and fail here.
    await sharp(input).resize(8).toBuffer()
    return meta
  } catch (error) {
    if (isHeic || /heif|hevc/i.test((error as Error).message)) {
      fail(
        'sharp no puede leer HEIC (el formato del iPhone): su versión precompilada no lleva el códec HEVC por patentes.\n' +
        '  Exporta la foto como JPEG y vuelve a lanzar el comando:\n' +
        '  · en el iPhone: Ajustes → Cámara → Formatos → "Más compatible", o compártela por AirDrop/correo como JPEG;\n' +
        '  · en el Mac: sips -s format jpeg foto.heic --out foto.jpg',
      )
    }
    fail(`No puedo leer ${input} como imagen (JPEG, PNG, WebP o AVIF): ${(error as Error).message}`)
  }
}

const meta = await readImage()
if (meta.width === undefined || meta.height === undefined) fail(`No puedo leer el tamaño de ${input}.`)
// EXIF orientations 5–8 rotate the photo by 90°: width and height swap.
const rotated = (meta.orientation ?? 1) >= 5
const width = rotated ? meta.height : meta.width
const height = rotated ? meta.width : meta.height

const fileName = outputFileName(destination, slug)
const outDir = join(ASSETS_DIR, destination)
const outPath = join(outDir, fileName)
const src = photoSrc(destination, fileName)
if (existsSync(outPath) && !values.force) fail(`Ya existe ${outPath}. Elige otro --name o usa --force para sobrescribirla.`)

const guidePath = day !== undefined || values.caption ? findGuide() : undefined
const guide = guidePath ? ((await loadGuide(guidePath)) as GuideLike) : undefined

// Check the day before writing anything, so a refused --day leaves no stray file.
if (day !== undefined) {
  const target = guide?.variants?.[0]?.days?.find((d) => d.day === day)
  if (!target) fail(`La guía ${guidePath} no tiene día ${day}.`)
  if (target.photo !== undefined) fail(`El día ${day} ya tiene foto en ${guidePath}: no la toco. Quita su bloque photo si quieres cambiarla.`)
}

mkdirSync(outDir, { recursive: true })
// sharp writes no EXIF, XMP or ICC unless asked to (withMetadata/keepIccProfile).
await sharp(input)
  .rotate()
  .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(outPath)

const out = fitInside(width, height)
console.log(`✔ ${outPath} (${width}×${height} → ${out.width}×${out.height}, JPEG 85, sin metadatos)`)

const warnings = sizeWarnings(width, height)
if (!values.name && looksLikeCameraName(slug)) {
  warnings.push(`El nombre "${slug}" parece el de la cámara: usa --name <lugar> para que diga qué se ve (p. ej. --name gullfoss).`)
}
for (const warning of warnings) console.warn(`⚠ ${warning}`)

let caption: string | undefined
if (values.caption) {
  const month = exifMonth(meta.exif) ?? guide?.trip_done
  caption = suggestCaption(values.caption, month)
  if (!month) console.warn('⚠ No sé de qué mes es la foto (sin fecha EXIF ni trip_done): completa el caption a mano.')
}

if (day === undefined) {
  console.log('\nBloque para pegar en el día (escribe tú el alt):\n')
  console.log(photoYamlBlock(src, caption))
} else {
  const text = readFileSync(guidePath!, 'utf8')
  const updated = insertDayPhoto(text, day, src, caption)
  writeFileSync(guidePath!, updated)
  // Re-read through the engine loader: if the insert did not land where
  // expected, put the guide back as it was.
  const reloaded = (await loadGuide(guidePath!)) as GuideLike
  const photo = reloaded.variants?.[0]?.days?.find((d) => d.day === day)?.photo as { src?: string } | undefined
  if (photo?.src !== src) {
    writeFileSync(guidePath!, text)
    fail(`No he podido insertar la foto en el día ${day}; la guía queda como estaba. Pega el bloque a mano:\n${photoYamlBlock(src, caption)}`)
  }
  console.log(`✔ Bloque photo añadido al día ${day} de ${guidePath}:\n`)
  console.log(photoYamlBlock(src, caption))
}

console.log(
  '\n→ Falta el alt: describe lo que se ve en la foto. Hasta que lo escribas, el build falla a propósito ' +
  '(el esquema exige un alt no vacío).',
)
