import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'
import {
  slugify, slugFromFileName, looksLikeCameraName, outputFileName, photoSrc, fitInside, sizeWarnings,
  exifMonth, spanishMonth, suggestCaption, photoYamlBlock, insertDayPhoto,
} from '../../scripts/photo-tools.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'

test('slugify drops accents, Icelandic letters and spaces, joining words with single hyphens', () => {
  assert.strictEqual(slugify('Foss á Síðu'), 'foss-a-sidu')
  assert.strictEqual(slugify('Þórufoss'), 'thorufoss')
  assert.strictEqual(slugify('  Jökulsárlón  _ Diamond Beach!! '), 'jokulsarlon-diamond-beach')
  assert.strictEqual(slugify('Reikiavik, Skólavörðustígur'), 'reikiavik-skolavordustigur')
})

test('slugFromFileName uses the file name without folders or extension', () => {
  assert.strictEqual(slugFromFileName('/home/me/Fotos/Gullfoss Lluvia.HEIC'), 'gullfoss-lluvia')
  assert.strictEqual(slugFromFileName('C:\\fotos\\IMG_2041.jpg'), 'img-2041')
})

test('looksLikeCameraName spots names straight out of a phone or camera', () => {
  assert.ok(looksLikeCameraName('img-2041'))
  assert.ok(looksLikeCameraName('pxl-20250914-102231'))
  assert.ok(!looksLikeCameraName('gullfoss'))
})

test('outputFileName prefixes the destination once', () => {
  assert.strictEqual(outputFileName('islandia', 'gullfoss'), 'islandia-gullfoss.jpg')
  assert.strictEqual(outputFileName('islandia', 'islandia-gullfoss'), 'islandia-gullfoss.jpg')
  assert.strictEqual(photoSrc('islandia', 'islandia-gullfoss.jpg'), 'islandia/islandia-gullfoss.jpg')
})

test('fitInside keeps 1920×2400 as the bound and never enlarges', () => {
  assert.deepStrictEqual(fitInside(3024, 4032), { width: 1800, height: 2400 })
  assert.deepStrictEqual(fitInside(4000, 3000), { width: 1920, height: 1440 })
  assert.deepStrictEqual(fitInside(659, 879), { width: 659, height: 879 })
})

test('sizeWarnings flags narrow and landscape originals, and nothing for a good vertical one', () => {
  assert.deepStrictEqual(sizeWarnings(1800, 2400), [])
  assert.deepStrictEqual(sizeWarnings(2000, 2000), [])
  const [narrow] = sizeWarnings(1000, 1250)
  assert.match(narrow, /1000 px de ancho/)
  const landscape = sizeWarnings(4000, 3000)
  assert.strictEqual(landscape.length, 1)
  assert.match(landscape[0], /horizontal/)
  assert.strictEqual(sizeWarnings(900, 600).length, 2)
})

test('exifMonth reads the first EXIF date as YYYY-MM', () => {
  const exif = new TextEncoder().encode('Exif\0\0MM\0*....2025:09:14 10:22:31\0')
  assert.strictEqual(exifMonth(exif), '2025-09')
  assert.strictEqual(exifMonth(new TextEncoder().encode('no date here')), undefined)
  assert.strictEqual(exifMonth(undefined), undefined)
})

test('suggestCaption writes "<Lugar>, <mes> de <año>", or just the place without a date', () => {
  assert.strictEqual(spanishMonth('2025-09'), 'septiembre de 2025')
  assert.strictEqual(suggestCaption('Gullfoss', '2025-09'), 'Gullfoss, septiembre de 2025')
  assert.strictEqual(suggestCaption('Gullfoss', undefined), 'Gullfoss')
})

test('photoYamlBlock leaves alt empty for the author and quotes the caption', () => {
  assert.strictEqual(
    photoYamlBlock('islandia/islandia-gullfoss.jpg', 'Gullfoss, "el dorado"'),
    [
      '        photo:',
      '          src: islandia/islandia-gullfoss.jpg',
      '          alt: ""',
      '          caption: "Gullfoss, \\"el dorado\\""',
    ].join('\n'),
  )
  assert.ok(!photoYamlBlock('islandia/x.jpg').includes('caption'))
})

const SAMPLE = `variants:
  - id: intensivo
    days:
      - day: 1
        title: "Uno"
        summary: "Resumen
          en dos líneas"
        # Night outside any campsite.
        overnight: null
        stops: []

      - day: 2
        title: "Dos"
        photo:
          src: islandia/dos.jpg
          alt: "Algo"
        stops: []

      - day: 3
        title: "Tres"

  - id: tranquilo
`

test('insertDayPhoto puts the block after the summary, before the comment on the next key', () => {
  const out = insertDayPhoto(SAMPLE, 1, 'islandia/islandia-uno.jpg', 'Uno, septiembre de 2025')
  const lines = out.split('\n')
  const at = lines.indexOf('        photo:')
  assert.strictEqual(lines[at - 1], '          en dos líneas"')
  assert.strictEqual(lines[at + 4], '        # Night outside any campsite.')
  const day = parse(out).variants[0].days[0]
  assert.deepStrictEqual(day.photo, { src: 'islandia/islandia-uno.jpg', alt: '', caption: 'Uno, septiembre de 2025' })
  assert.strictEqual(day.overnight, null)
})

test('insertDayPhoto keeps the block inside a day that ends the variant', () => {
  const out = insertDayPhoto(SAMPLE, 3, 'islandia/tres.jpg')
  const parsed = parse(out)
  assert.deepStrictEqual(parsed.variants[0].days[2].photo, { src: 'islandia/tres.jpg', alt: '' })
  assert.strictEqual(parsed.variants[1].id, 'tranquilo')
})

test('insertDayPhoto refuses a day that already has a photo, or does not exist', () => {
  assert.throws(() => insertDayPhoto(SAMPLE, 2, 'islandia/x.jpg'), /ya tiene foto/)
  assert.throws(() => insertDayPhoto(SAMPLE, 9, 'islandia/x.jpg'), /No existe el día 9/)
})

test('insertDayPhoto on the real guide changes only the target day, adding four lines', async () => {
  const text = await readFile(GUIDE_PATH, 'utf8')
  const out = insertDayPhoto(text, 8, 'islandia/islandia-dettifoss.jpg', 'Dettifoss, septiembre de 2025')
  assert.strictEqual(out.split('\n').length, text.split('\n').length + 4)
  const before = parse(text).variants[0].days
  const after = parse(out).variants[0].days
  assert.strictEqual(after[7].photo.src, 'islandia/islandia-dettifoss.jpg')
  delete after[7].photo
  assert.deepStrictEqual(after, before)
})
