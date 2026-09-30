# Plan de implementación: Astro + primera guía real (Checkpoint 2)

> **Para agentes de ejecución:** SUB-SKILL REQUERIDO: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para seguimiento.

**Objetivo:** conectar el motor de dominio ya cerrado (`engine/`, `schemas/`) a Astro y producir una única página estática real, `/islandia/islandia-en-camper-13-dias/`, sin tocar nada del sistema de guías de Alsacia ya existente.

**Arquitectura:** `content/*.yaml → engine (load→validate→compile) → CompiledGuide → src/lib/engine-guide.ts → página Astro estática → HTML`. `engine-guide.ts` es el único punto de contacto entre `src/` y `engine/`, un orquestador puro sin lógica de negocio. `src/lib/maps.ts` aporta un enlace de Google Maps por parada (nunca por día, para no tocar el límite de waypoints de Google).

**Tech Stack:** Astro (páginas `.astro`, sin islas Vue en este checkpoint), TypeScript ejecutado nativamente por Node 24 para los tests (`node --test`), sin Playwright — la página se verifica con `npm run build` + comprobaciones sobre el HTML/sitemap generados + revisión visual manual.

**Spec:** `docs/1.8_presentacion_astro.md` — el plan argumenta desde esa spec; quien ejecute este plan debe leer ambos documentos.

## Restricciones globales

- **No tocar** `src/content/schema.ts`, `src/content.config.ts`, `src/pages/[destino]/[slug].astro`, `src/lib/guide.ts`, ni la guía/datos de Alsacia (`src/content/guides/ruta-pueblos-y-vinos.json`). Son un modelo de datos distinto e incompatible (1.8 §2); esta página es nueva y separada.
- **`astro.config.mjs` sí se puede tocar**, pero solo para añadir la exclusión de esta página del sitemap (es config de sitio compartida, no algo propio de Alsacia).
- **`engine-guide.ts` es un orquestador puro**: solo `load → validate → compile`. Ninguna decisión de negocio (qué variante mostrar, cómo filtrar paradas) vive ahí — eso es del motor.
- **`placeMapUrl` no vive en `engine-guide.ts`** — utilidad de presentación sin relación con el motor, en su propio fichero `src/lib/maps.ts`.
- **Enlace de mapa por parada, nunca por día** — Google Maps Directions limita los waypoints (~9-10) y el día 11 tiene 8 paradas; un enlace de ruta completa del día podría superarlo sin que nada lo avise en build.
- **Presupuesto: se muestra `total_reference`, nunca `total_base`** — confirmado en `engine/types.ts` y 1.7.2 §5. `total_reference` es "el total para el grupo de referencia" (aplica `basis` con `base_travelers`); `total_base` es solo una suma simple interna sin aplicar `basis`.
- **`budget_per_person` mostrará 2247.61 €, no 2247.62 €.** Verificado: `4495.21 / 2 = 2247.605`, y `(2247.605).toFixed(2)` da `"2247.61"` en Node. La cifra "2.247,62 €" de `docs/1.6.4_json_islandia.md` es anterior a la corrección del desvío de redondeo del Checkpoint 1 (que hizo que el total a 2 viajeros cuadrase exacto en 4495.21). No hay combinación de redondeos que haga coincidir el total y el por-persona a la vez — es una diferencia de 1 céntimo esperada, no un error de esta página.
- **FAQ estructurado: solo los elementos con `schema: true`** entran en el JSON-LD `FAQPage`. La sección visible de FAQ muestra todas las preguntas igual, sin filtrar.
- **`noindex: true`** en esta página mientras el contenido esté pendiente de revisión final del autor — y su ruta exacta debe excluirse también del sitemap (`@astrojs/sitemap` no detecta `noindex` automáticamente).
- **Analítica:** no se instala nada en este plan. No existe ya ningún script de analítica en el repo (comprobado: `grep` sobre `src/` y `astro.config.mjs` no encuentra `plausible|fathom|analytics|gtag|umami`). Instalar Plausible/Fathom requiere una cuenta real y un dominio verificado que no se pueden fabricar aquí — queda como paso manual del autor, anotado en la Tarea 5, nunca como un ID de tracking inventado en el código.
- **Código y commits en inglés; contenido visible para el usuario en español.**

## Foco de revisión

- **`noindex` debe funcionar en los dos sitios a la vez** (la meta-etiqueta en el HTML y la exclusión del sitemap) — son dos mecanismos independientes; actualizar solo uno de los dos deja la página parcialmente indexable. Cubierto en la Tarea 5 comprobando ambos sobre el build real.
- **Ningún `affiliate_id` debe resolverse en silencio** — si el motor regresase y dejase pasar una referencia a afiliado sin registro real, `engine-guide.ts` debe seguir lanzando, no devolver `undefined` en el `CompiledGuide`. Cubierto en la Tarea 2 con una aserción explícita sobre la guía real.
- **El JSON-LD de FAQ debe filtrar por `schema: true`, no incluir todas las preguntas** — como las 3 preguntas reales de Islandia tienen `schema: true`, un bug que incluyera todas pasaría inadvertido por conteo; hay que comprobar específicamente el contenido, no solo la cantidad. Cubierto en la Tarea 4 (verificación del build).
- **Los enlaces de mapa deben ser de un único punto, nunca de varios waypoints** — una regresión a "enlace por día" no fallaría en build, solo en el navegador del lector el día con más paradas. El test de `placeMapUrl` fija el contrato de un único punto; la Tarea 4 comprueba que la página usa esa función por parada.
- **El número de presupuesto mostrado debe ser `total_reference` (4495.21 €), no `total_base` (2247.605 €) ni ningún otro** — un `total_base` por error seguiría siendo *un* número plausible, así que hay que fijar el valor exacto, no solo que exista. Cubierto en la Tarea 2 con una aserción sobre el valor exacto.

---

### Tarea 1: `src/lib/maps.ts`

**Ficheros:**
- Crear: `src/lib/maps.ts`
- Test: `tests/lib/maps.test.ts`

**Interfaces:**
- Produce: `placeMapUrl(lat: number, lng: number): string` — lo consume la Tarea 4 (la página).

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/lib/maps.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { placeMapUrl } from '../../src/lib/maps.ts'

test('placeMapUrl builds a single-point Google Maps search URL', () => {
  const url = placeMapUrl(64.2559, -21.13)
  assert.strictEqual(url, 'https://www.google.com/maps/search/?api=1&query=64.2559,-21.13')
})

test('placeMapUrl works with negative coordinates on both axes', () => {
  const url = placeMapUrl(-33.87, -151.21)
  assert.strictEqual(url, 'https://www.google.com/maps/search/?api=1&query=-33.87,-151.21')
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/lib/maps.test.ts`
Esperado: FALLA — `Cannot find module '../../src/lib/maps.ts'`

- [ ] **Paso 3: Escribir `src/lib/maps.ts`**

```ts
/**
 * A single "ver en Maps" link per stop — never a multi-waypoint day route.
 * Google Maps Directions caps waypoints around 9-10, and some Islandia days
 * (e.g. day 11, with 8 stops) are close enough to that limit that a day-level
 * route link is the wrong contract to offer.
 */
export function placeMapUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/lib/maps.test.ts`
Esperado: PASA (2 tests)

- [ ] **Paso 5: Commit**

```bash
git add src/lib/maps.ts tests/lib/maps.test.ts
git commit -m "Add placeMapUrl: one Google Maps link per stop, never per day"
```

---

### Tarea 2: `src/lib/engine-guide.ts`

**Ficheros:**
- Crear: `src/lib/engine-guide.ts`
- Test: `tests/lib/engine-guide.test.ts`

**Interfaces:**
- Consume: `loadGuide`, `loadPlaces`, `buildPlaceRegistry`, `validateGuide`, `compileGuide` y los tipos `CompiledGuide`, `AffiliateRegistry` de `engine/index.ts` (ya existentes, Checkpoint 1).
- Produce: `loadCompiledGuide(guidePath: string, placesPath: string): Promise<CompiledGuide>` — lo consume la Tarea 4 (la página).

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/lib/engine-guide.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const PLACES_PATH = 'content/places/islandia.yaml'

test('loadCompiledGuide compiles the real Islandia guide successfully', async () => {
  const compiled = await loadCompiledGuide(GUIDE_PATH, PLACES_PATH)

  assert.strictEqual(compiled.slug, 'islandia-en-camper-13-dias')
  assert.strictEqual(compiled.variants?.[0].days.length, 7)
})

test('the real guide shows total_reference, not total_base, as the trip total (4495.21 EUR for 2 travelers)', async () => {
  const compiled = await loadCompiledGuide(GUIDE_PATH, PLACES_PATH)

  assert.ok(compiled.budget)
  assert.ok(Math.abs(compiled.budget!.total_reference - 4495.21) < 0.001)
})

test('the real guide source has no affiliate_id anywhere, and no compiled stop has a booking (so the empty AffiliateRegistry never gets exercised silently)', async () => {
  // Checking the compiled output alone is not enough: a resolved affiliate
  // renames the field to `affiliate`, so a string search for "affiliate_id"
  // on the CompiledGuide would pass even if resolution happened. Check the
  // source YAML for the raw key, and the compiled stops for the structural
  // field that resolution would have populated.
  const rawYaml = await readFile(GUIDE_PATH, 'utf-8')
  assert.strictEqual(rawYaml.includes('affiliate_id'), false)

  const compiled = await loadCompiledGuide(GUIDE_PATH, PLACES_PATH)
  for (const variant of compiled.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        assert.strictEqual(stop.booking, undefined)
      }
    }
  }
})

test('loadCompiledGuide throws when a stop references a place_id missing from the registry', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'engine-guide-'))
  const placesPath = join(dir, 'places.yaml')
  const brokenPlaces = (await readFile(PLACES_PATH, 'utf-8')).replace(
    'place_id: thingvellir\n',
    'place_id: thingvellir-broken\n',
  )
  await writeFile(placesPath, brokenPlaces)

  await assert.rejects(
    () => loadCompiledGuide(GUIDE_PATH, placesPath),
    /thingvellir/,
  )

  await rm(dir, { recursive: true })
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/lib/engine-guide.test.ts`
Esperado: FALLA — `Cannot find module '../../src/lib/engine-guide.ts'`

- [ ] **Paso 3: Escribir `src/lib/engine-guide.ts`**

```ts
import {
  loadGuide, loadPlaces, buildPlaceRegistry, validateGuide, compileGuide,
} from '../../engine/index.ts'
import type { CompiledGuide, AffiliateRegistry } from '../../engine/index.ts'

/**
 * Temporary: data/affiliates.yaml does not exist yet (1.7.1 §5, deferred to
 * before Fase 4). This registry's get() always returns undefined, which
 * means any affiliate_id referenced anywhere in a guide fails validation
 * ([ERROR] affiliate_id inexistente) instead of resolving silently as
 * undefined in the CompiledGuide. That is deliberate fail-safe behavior,
 * not a gap: if a guide is ever edited to reference an affiliate before the
 * real registry exists, the build must fail, and it does.
 */
function emptyAffiliateRegistry(): AffiliateRegistry {
  return { get: () => undefined }
}

/**
 * The only point of contact between src/ and engine/. Pure orchestration —
 * load, validate, compile — no business logic. Which variant to show, how
 * to filter stops, any calculation: that belongs in the engine, never here.
 */
export async function loadCompiledGuide(guidePath: string, placesPath: string): Promise<CompiledGuide> {
  const rawPlaces = (await loadPlaces(placesPath)) as unknown[]
  const { registry: places, errors: placeErrors } = buildPlaceRegistry(rawPlaces)
  if (placeErrors.length > 0) {
    throw new Error(`Errores en el registro de lugares (${placesPath}):\n${placeErrors.join('\n')}`)
  }

  const rawGuide = await loadGuide(guidePath)
  const affiliates = emptyAffiliateRegistry()
  const result = validateGuide(rawGuide, places, affiliates)

  if (result.errors.length > 0) {
    throw new Error(`La guía "${guidePath}" no pasa la validación:\n${result.errors.join('\n')}`)
  }
  for (const warning of result.warnings) {
    console.warn(`[${guidePath}] ${warning}`)
  }

  return compileGuide(result.guide!, places, affiliates)
}
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/lib/engine-guide.test.ts`
Esperado: PASA (4 tests)

- [ ] **Paso 5: Commit**

```bash
git add src/lib/engine-guide.ts tests/lib/engine-guide.test.ts
git commit -m "Add loadCompiledGuide: the only contact point between src/ and engine/"
```

---

### Tarea 3: excluir la página nueva del sitemap en `astro.config.mjs`

**Ficheros:**
- Modificar: `astro.config.mjs`

**Interfaces:**
- No produce ni consume nada que otras tareas necesiten — es configuración de sitio.

- [ ] **Paso 1: Leer el estado actual del fichero**

```bash
cat astro.config.mjs
```

Confirmar que la función `draftGuidePaths()` y la constante `excludedPaths` siguen donde se leyeron al escribir este plan (líneas 16-27 en el momento de escribir este plan; si han cambiado, adaptar el siguiente paso a su ubicación real).

- [ ] **Paso 2: Añadir la exclusión manual**

Modificar `astro.config.mjs` reemplazando:

```js
const excludedPaths = draftGuidePaths();
```

por:

```js
/**
 * Pages outside the legacy `guides` content collection that are still
 * noindex and must stay out of the sitemap too. @astrojs/sitemap does not
 * inspect each page's own <meta name="robots"> tag, so this has to be
 * listed by hand.
 */
const MANUALLY_EXCLUDED_PATHS = [
  '/islandia/islandia-en-camper-13-dias/',
];

const excludedPaths = [...draftGuidePaths(), ...MANUALLY_EXCLUDED_PATHS];
```

- [ ] **Paso 3: Verificar que el fichero sigue siendo JS válido**

```bash
node --check astro.config.mjs
```

Esperado: sin salida, sin error (exit 0).

- [ ] **Paso 4: Commit**

```bash
git add astro.config.mjs
git commit -m "Exclude the noindex Islandia page from the sitemap"
```

(La comprobación real de que la página no aparece en el sitemap generado se hace en la Tarea 5, después de que la página exista y `npm run build` la genere.)

---

### Tarea 4: `src/pages/islandia/islandia-en-camper-13-dias.astro`

**Ficheros:**
- Crear: `src/pages/islandia/islandia-en-camper-13-dias.astro`

**Interfaces:**
- Consume: `loadCompiledGuide` (Tarea 2), `placeMapUrl` (Tarea 1), `BaseLayout` (ya existente, sin cambios).
- No produce nada que otra tarea consuma — es la página final.

No hay test automatizado de renderizado (1.8 §12 — no hay Playwright en el proyecto). La verificación de esta tarea es que `npm run build` la genere sin errores; la comprobación detallada del HTML generado se hace en la Tarea 5.

- [ ] **Paso 0: Verificar que `BaseLayout.astro` acepta el slot `head` antes de escribir la página**

```bash
grep -n 'slot' src/layouts/BaseLayout.astro
```

Esperado: `<slot name="head" />` dentro de `<head>` (confirmado al escribir este plan, en la línea 44 de `src/layouts/BaseLayout.astro`). Los tres `<script type="application/ld+json" ... slot="head" />` del Paso 1 dependen de que ese slot exista — si no existiera, los scripts JSON-LD acabarían en el `<body>` en vez de en `<head>`, silenciosamente (Astro no avisa de un slot sin destino, simplemente no lo renderiza donde se esperaba). Comprobar esto ahora, no después del build.

- [ ] **Paso 1: Escribir la página completa**

Crear `src/pages/islandia/islandia-en-camper-13-dias.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { loadCompiledGuide } from '../../lib/engine-guide.ts';
import { placeMapUrl } from '../../lib/maps.ts';

const guide = await loadCompiledGuide(
  'content/guides/islandia/islandia-en-camper-13-dias.yaml',
  'content/places/islandia.yaml',
);

const variant = guide.variants?.[0];

/** Only the FAQ items the author marked fit for rich results go into the JSON-LD — the visible FAQ section below shows every question regardless. */
const faqForSchema = (guide.faq ?? []).filter((item) => item.schema === true);

const pageUrl = new URL(Astro.url.pathname, Astro.site).href;

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: new URL('/', Astro.site).href },
    { '@type': 'ListItem', position: 2, name: 'Islandia', item: new URL('/islandia/', Astro.site).href },
    { '@type': 'ListItem', position: 3, name: guide.title, item: pageUrl },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: guide.title,
  description: guide.description,
  dateModified: guide.updated_at,
};

const faqJsonLd =
  faqForSchema.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqForSchema.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null;
---

<BaseLayout title={guide.title} description={guide.description} image={guide.cover_image} noindex>
  <script type="application/ld+json" is:inline set:html={JSON.stringify(breadcrumbJsonLd)} slot="head" />
  <script type="application/ld+json" is:inline set:html={JSON.stringify(articleJsonLd)} slot="head" />
  {faqJsonLd && (
    <script type="application/ld+json" is:inline set:html={JSON.stringify(faqJsonLd)} slot="head" />
  )}

  <article class="guide">
    <h1>{guide.title}</h1>

    {guide.has_experience && guide.trip_done ? (
      <p class="guide__dateline">Lo hicimos en {guide.trip_done}.</p>
    ) : (
      <p class="guide__dateline">Actualizado {guide.updated_at}</p>
    )}

    <section class="guide__summary" aria-labelledby="resumen">
      <h2 id="resumen">En resumen</h2>
      <dl>
        <dt>Resumen</dt>
        <dd>{guide.summary.tagline}</dd>
        {guide.summary.best_season && (
          <>
            <dt>Mejor época</dt>
            <dd>{guide.summary.best_season}</dd>
          </>
        )}
        {guide.summary.getting_around && (
          <>
            <dt>Cómo moverse</dt>
            <dd>{guide.summary.getting_around}</dd>
          </>
        )}
        {guide.summary.base_area && (
          <>
            <dt>Base</dt>
            <dd>{guide.summary.base_area}</dd>
          </>
        )}
        {/*
          guide.summary.budget_per_person = total_reference / base_travelers = 4495.21 / 2 = 2247.605,
          que con toFixed(2) muestra "2247.61 €", no "2247.62 €" (la cifra por persona citada en
          docs/1.6.4_json_islandia.md). Es una diferencia de 1 céntimo, inherente a haber corregido
          el desvío de redondeo del total a 2 viajeros en el Checkpoint 1 — no hay una combinación de
          redondeos que haga coincidir exactamente el total (4495.21) y el por-persona (2247.62) a la
          vez. Verificado, no es un bug de esta página.
        */}
        {guide.summary.budget_per_person != null && (
          <>
            <dt>Presupuesto</dt>
            <dd>{guide.summary.budget_per_person.toFixed(2)} € por persona</dd>
          </>
        )}
      </dl>
    </section>

    {variant && (
      <section aria-labelledby="itinerario">
        <h2 id="itinerario">Día a día</h2>
        {variant.days.map((day) => (
          <section class="guide__day" aria-labelledby={`dia-${day.day}`}>
            <span class="guide__daynum" aria-hidden="true">{day.day}</span>
            <h3 id={`dia-${day.day}`}>
              <span class="visually-hidden">Día {day.day}. </span>
              {day.title}
            </h3>

            {day.summary && <p>{day.summary}</p>}

            <ol class="guide__stops">
              {day.stops.map((stop) => (
                <li>
                  <span class="guide__stopname">
                    {stop.place.name}
                    {stop.visit_status === 'visited' && <span class="badge badge--lived">Vivido</span>}
                  </span>
                  <span class="guide__stop-meta">
                    {' · '}
                    {stop.duration_min} min
                    {stop.start_time && ` · desde las ${stop.start_time}`}
                  </span>

                  <p>
                    <a
                      class="guide__route"
                      href={placeMapUrl(stop.place.lat, stop.place.lng)}
                      rel="noopener"
                      target="_blank"
                    >
                      Ver en Google Maps
                      <span class="visually-hidden">(se abre en una pestaña nueva)</span>
                    </a>
                  </p>

                  {stop.variant_note && <p class="guide__note">{stop.variant_note}</p>}

                  <p class="guide__verified">
                    Comprobado {stop.place.verified_at}
                    {stop.place.is_stale && ' · dato antiguo, puede haber cambiado'}
                  </p>
                </li>
              ))}
            </ol>

            {day.our_take && (
              <div class="guide__tip">
                <h4>Lo que haríamos distinto</h4>
                <p>{day.our_take}</p>
              </div>
            )}

            {day.plan_b && (
              <div class="guide__tip">
                <h4>Plan B</h4>
                <p>{day.plan_b}</p>
              </div>
            )}
          </section>
        ))}
      </section>
    )}

    {guide.accommodation && guide.accommodation.zones.length > 0 && (
      <section aria-labelledby="dormir">
        <h2 id="dormir">Dónde dormir</h2>
        {guide.accommodation.notes && <p>{guide.accommodation.notes}</p>}
        {guide.accommodation.zones.map((zone) => (
          <div class="guide__zone">
            <h3>{zone.name}</h3>
            {zone.pros && zone.pros.length > 0 && (
              <p><strong>A favor:</strong> {zone.pros.join(' · ')}</p>
            )}
            {zone.cons && zone.cons.length > 0 && (
              <p><strong>En contra:</strong> {zone.cons.join(' · ')}</p>
            )}
            {zone.picks && zone.picks.length > 0 && (
              <ul>
                {zone.picks.map((pick) => (
                  <li>
                    {pick.name}
                    {pick.notes && <span class="guide__stop-meta">{' · '}{pick.notes}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    )}

    {guide.transport && (
      <section aria-labelledby="llegar">
        <h2 id="llegar">Cómo llegar y moverse</h2>
        {guide.transport.arrival?.map((arrival) => (
          <p><strong>Desde {arrival.from_airport}:</strong> {arrival.description}</p>
        ))}
        {guide.transport.local?.map((local) => (
          <p><strong>{local.mode}:</strong> {local.description}</p>
        ))}
      </section>
    )}

    {guide.budget && (
      <section aria-labelledby="presupuesto">
        <h2 id="presupuesto">Presupuesto real</h2>
        <p class="guide__budget-total">
          <strong>{guide.budget.total_reference.toFixed(2)} € en total</strong>
          {guide.base_travelers && ` para ${guide.base_travelers} viajeros`}
        </p>
        <ul>
          {guide.budget.items.map((item) => (
            <li>
              {item.label}: {item.amount.toFixed(2)} €{' '}
              ({item.basis === 'per_person' ? 'por persona' : item.basis === 'per_room' ? 'por habitación' : 'por grupo'})
            </li>
          ))}
        </ul>
        {guide.budget.includes.length > 0 && (
          <p><strong>Incluye:</strong> {guide.budget.includes.join(' · ')}</p>
        )}
        {guide.budget.excludes.length > 0 && (
          <p><strong>No incluye:</strong> {guide.budget.excludes.join(' · ')}</p>
        )}
        {guide.budget.notes && <p>{guide.budget.notes}</p>}
      </section>
    )}

    {guide.booking_checklist && guide.booking_checklist.length > 0 && (
      <section aria-labelledby="reservar">
        <h2 id="reservar">Qué reservar y cuándo</h2>
        <ul class="guide__checklist">
          {guide.booking_checklist.map((item) => (
            <li><strong>{item.when}:</strong> {item.label}</li>
          ))}
        </ul>
      </section>
    )}

    {guide.our_criteria && guide.our_criteria.length > 0 && (
      <section aria-labelledby="criterio">
        <h2 id="criterio">Nuestro criterio</h2>
        <ul>
          {guide.our_criteria.map((item) => <li>{item}</li>)}
        </ul>
      </section>
    )}

    {((guide.pitfalls && guide.pitfalls.length > 0) || (guide.terrain_tips && guide.terrain_tips.length > 0)) && (
      <section aria-labelledby="errores">
        <h2 id="errores">Errores y trampas</h2>
        <ul>
          {guide.pitfalls?.map((item) => <li>{item}</li>)}
          {guide.terrain_tips?.map((item) => <li>{item}</li>)}
        </ul>
      </section>
    )}

    {guide.practical && (
      <section aria-labelledby="practico">
        <h2 id="practico">Lo práctico</h2>
        {guide.practical.documents && guide.practical.documents.length > 0 && (
          <>
            <h4>Documentos</h4>
            <ul>{guide.practical.documents.map((item) => <li>{item}</li>)}</ul>
          </>
        )}
        {guide.practical.plugs && <p><strong>Enchufes:</strong> {guide.practical.plugs}</p>}
        {guide.practical.apps && guide.practical.apps.length > 0 && (
          <>
            <h4>Apps</h4>
            <ul>{guide.practical.apps.map((item) => <li>{item}</li>)}</ul>
          </>
        )}
      </section>
    )}

    {guide.faq && guide.faq.length > 0 && (
      <section aria-labelledby="faq">
        <h2 id="faq">Preguntas frecuentes</h2>
        <dl class="guide__faq">
          {guide.faq.map((item) => (
            <>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </>
          ))}
        </dl>
      </section>
    )}
  </article>
</BaseLayout>
```

- [ ] **Paso 2: Ejecutar el build y comprobar que la página se genera**

```bash
npm run build
```

Esperado: build en verde (exit 0), y entre las rutas generadas aparece `islandia/islandia-en-camper-13-dias/index.html` (revisar la salida del comando, que lista las rutas generadas).

Si el build falla, leer el mensaje de error: si viene de `loadCompiledGuide` (menciona "no pasa la validación" o "Errores en el registro de lugares"), el problema está en el contenido YAML o en cómo esta tarea llama a `engine-guide.ts`, no en el motor (que ya está probado). Si es un error de sintaxis Astro/TypeScript, revisar el fichero `.astro` contra el código de este paso.

- [ ] **Paso 3: Commit**

```bash
git add src/pages/islandia/islandia-en-camper-13-dias.astro
git commit -m "Add the Islandia guide page, wired to the real domain engine"
```

---

### Tarea 5: Verificación final del Checkpoint 2

**Ficheros:** ninguno (solo verificación).

- [ ] **Paso 1: Ejecutar toda la suite de tests**

```bash
node --test
```

Esperado: todos los tests pasan (los del motor, más los nuevos de `tests/lib/`).

- [ ] **Paso 2: Build limpio**

```bash
rm -rf dist
npm run build
```

Esperado: exit 0, sin warnings de Astro sobre la página nueva.

- [ ] **Paso 3: Comprobar que el `noindex` funciona en los dos sitios (Foco de revisión)**

```bash
grep -o 'noindex[^"]*' dist/islandia/islandia-en-camper-13-dias/index.html
```

Esperado: aparece `noindex, nofollow` (viene de `BaseLayout.astro`, ya existente, disparado por la prop `noindex`).

```bash
grep -c 'islandia-en-camper-13-dias' dist/sitemap-0.xml
```

Esperado: `0` — la página no debe aparecer en el sitemap generado. Si el resultado no es `0`, la Tarea 3 no se aplicó correctamente (revisar `MANUALLY_EXCLUDED_PATHS` en `astro.config.mjs`) o la ruta generada no coincide exactamente con la listada ahí.

- [ ] **Paso 4: Comprobar el filtrado de FAQ estructurado (Foco de revisión)**

```bash
grep -o '"@type":"Question"' dist/islandia/islandia-en-camper-13-dias/index.html | wc -l
```

Esperado: `3` (las tres preguntas reales de `content/guides/islandia/islandia-en-camper-13-dias.yaml` tienen `schema: true`). Si este número cambiase en el futuro por editar el YAML, debe coincidir exactamente con el número de preguntas marcadas `schema: true`, no con el total de preguntas.

- [ ] **Paso 5: Comprobar que los enlaces de mapa son de un único punto (Foco de revisión)**

El número de paradas puede cambiar si se edita el YAML (ahora mismo son 25 — Skógafoss aparece dos veces, día 2 y día 3 — no 24, que es el número de *lugares únicos*, distinto; ver `npm run content:validate`). Por eso esta comprobación no usa un número fijo: compara contra lo que reporta `content:validate` en el momento de ejecutar el plan.

```bash
STOPS_EXPECTED=$(npm run content:validate 2>&1 | grep -oE '[0-9]+ paradas' | grep -oE '^[0-9]+')
STOPS_IN_PAGE=$(grep -o 'maps/search/?api=1&query=[0-9.,-]*' dist/islandia/islandia-en-camper-13-dias/index.html | wc -l | tr -d ' ')
echo "esperadas: $STOPS_EXPECTED — en la página: $STOPS_IN_PAGE"
[ "$STOPS_EXPECTED" = "$STOPS_IN_PAGE" ] && echo "OK" || echo "MISMATCH"
grep -c 'maps/dir/' dist/islandia/islandia-en-camper-13-dias/index.html
```

Esperado: `OK`, y el último `grep -c` devuelve `0` (ninguna ocurrencia de `maps/dir/`, que indicaría una ruta multi-waypoint, lo que se decidió evitar explícitamente).

- [ ] **Paso 6: Lighthouse**

Ejecutar Lighthouse (Chrome DevTools o `npx lighthouse http://localhost:4321/islandia/islandia-en-camper-13-dias/ --view` con `npm run preview` levantado en otra terminal) sobre la página. Esperado: Rendimiento, Accesibilidad, Buenas prácticas y SEO ≥ 95, tal como exige CLAUDE.md.

- [ ] **Paso 7: Pasos manuales pendientes — NO automatizables, para el autor**

Estos dos puntos no se pueden completar en este plan y deben quedar explícitamente pendientes, no simulados ni saltados:

1. **Revisión visual en desktop y móvil** — parte obligatoria del criterio de cierre (1.8 §13). Abrir `npm run preview` y revisar la página renderizada en un viewport de escritorio y uno móvil real o emulado. Ningún test automatizado de este plan sustituye este paso.
2. **Analítica de pageview** — instalar Plausible o Fathom (sin cookies) a nivel de sitio es una decisión del autor que requiere una cuenta real y un dominio verificado; no se ha fabricado ningún ID de tracking placeholder en este plan. Queda fuera de este checkpoint tal como decidió el autor (1.8 §10) hasta que exista esa cuenta.

- [ ] **Paso 8: Confirmar que nada del sistema de Alsacia cambió**

```bash
git status --short src/content/ src/pages/[destino]/ src/lib/guide.ts
```

Esperado: sin salida (limpio) — ninguno de esos ficheros ha cambiado en esta rama.

- [ ] **Paso 9: Commit final si queda algo pendiente**

```bash
git status --short
```

Si está limpio, nada que hacer. Si no, añadir y comitear lo que falte con un mensaje que describa qué es.
