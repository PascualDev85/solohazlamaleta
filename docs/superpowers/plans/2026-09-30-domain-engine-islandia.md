# Plan de implementación: motor de dominio (fixture de Islandia)

> **Para agentes de ejecución:** SUB-SKILL REQUERIDO: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan sintaxis de checkbox (`- [ ]`) para seguimiento.

**Objetivo:** implementar el motor de dominio (`schemas/`, `engine/`, `scripts/validate-content.ts`, `tests/`) definido en los Blueprints de arquitectura, y el fixture real de Islandia (`content/places/islandia.yaml`, `content/guides/islandia/islandia-en-camper-13-dias.yaml`), de forma que `npm run content:validate` termine con exit 0 y sin errores para la guía real y parcial de Islandia (solo días 1, 2, 9, 10, 11, 12) — sin que Astro, Vue ni ninguna capa de presentación participen.

**Arquitectura:** cadena de dependencias estricta y unidireccional `content → load → schemas → engine → (presentación, más adelante)`. `GuideSource`/`PlaceSource` (validados con Zod, lo que escribe el autor) se compilan en `CompiledGuide`/`CompiledPlace` (lo que consume cada output — web, PDF, email). Hay tres capas de validación que se ejecutan en orden: esquema (Zod) → referencias (`place_id`/`affiliate_id` existen) → reglas de contenido (reglas de negocio como que `experience{}` exige `visit_status: visited`). Nada de esto toca `src/`.

**Stack técnico:** TypeScript ejecutado nativamente por Node 24 (sin `tsx`/`ts-node` — verificado que `node script.ts` funciona sin flags). `zod@^4.6.5` para los esquemas. `yaml@^2.9.1` para parsear los ficheros de contenido (verificado: parsea `2024-08-15` como string, no como `Date`). `node:test` + `node:assert` como test runner (sin `vitest` — evita una dependencia nueva no justificada; verificado que funciona nativamente con ficheros `.test.ts`).

**Spec:** `docs/1.7.1_repository_domain.md` (estructura del repositorio, límites de módulos, sistema de errores) y `docs/1.7.2_data_contract.md` (contrato exacto de campos de `GuideSource`/`CompiledGuide`, esqueletos de esquemas Zod, reglas de compilación, tabla de tests de invariantes). Datos reales del viaje: `docs/1.6.4_json_islandia.md`. Definición de invariantes: `docs/1.6_modelo_datos.md` (líneas 856-871 para I1, I5, I6, I14, I15, I16). Quien ejecute el plan debería hojear estos documentos una vez; este plan ya extrae cada campo/tipo/regla necesarios.

## Restricciones globales

- **No tocar `src/`, `astro.config.mjs`, `src/content/schema.ts`, ni la guía de Alsacia.** Quedan fuera de alcance y deben seguir intactos al final (`git status` sobre esas rutas debe salir limpio).
- **No crear `data/affiliates.yaml` ni `loadAffiliates` en `engine/load`.** Según `docs/1.7.1_repository_domain.md` §5, el registro de afiliados "se añade cuando sea necesario (antes de Fase 4)" — no ahora. El fixture de Islandia de este plan contiene deliberadamente **cero** referencias a `affiliate_id` (se omiten booking, ítems de checklist con afiliado y `practical.insurance_affiliate_id`) para que el código de resolución de afiliados exista y esté probado, pero el fixture real no lo ejercita todavía.
- **Nada de abstracciones antes de que se necesiten** (regla de arquitectura de CLAUDE.md): solo `schemas/enums.ts`, `schemas/place.ts`, `schemas/guide.ts`, `schemas/index.ts` — nada de `schemas/variant.ts`, etc. Solo `engine/load`, `engine/validate`, `engine/compile` — nada de `engine/budget/`, `engine/adaptation/`, `engine/maps/`, `engine/pdf/` (eso es Fase 2+).
- **Código y commits en inglés; contenido visible para el usuario (contenido editorial YAML, mensajes de consola) en español.**
- **Todo consumidor externo importa desde `engine` (barrel `engine/index.ts`), nunca desde rutas internas** como `engine/compile/guide`.
- **El contenido es honesto y parcial.** La guía de Islandia solo incluye los días con `visit_status` confirmado. Los días 3-8 no aparecen — no se rellenan con contenido inventado ni con `unknown`. Nada de narrativa en primera persona inventada (`variant_note`, `our_take`) para paradas o días donde el material fuente (`docs/1.6.4_json_islandia.md`) no aporta una anécdota real, aunque `visit_status: visited` permita técnicamente la voz en primera persona sin generar advertencia.
- **Node ≥ 22.12** (según `engines` de `package.json`; este entorno usa v24.16.0, confirmado compatible con ejecución de TypeScript sin flags).

## Foco de revisión

- **Validez de una guía parcial:** la guía solo tiene 6 de sus 13 días nominales. Alguien podría asumir que "parcial" significa "inválida" — debe validar con 0 errores. Cubierto por la Tarea 13 (`tests/compiler/compile.test.ts` comprueba que el fixture real compila exactamente con los 6 días redactados, no 13).
- **El mismo `place_id` reutilizado en varios días debe resolver de forma idéntica, sin divergir ni duplicarse.** Cubierto por el test de I1 en la Tarea 9 (dos paradas que comparten `place_id` resuelven a objetos `CompiledPlace` con valores de campo idénticos).
- **Ítems de presupuesto mixtos (real/estimado) deben derivar `type: 'mixed'`, sin caer por defecto en `'real'`.** Cubierto por los tests de presupuesto de la Tarea 8.
- **Una parada `not_visited` con lenguaje en primera persona en `variant_note` debe generar WARNING, nunca ERROR, y nunca debe bloquear la compilación.** Es fácil implementarlo por error como un error duro. Cubierto por el test de reglas de contenido de la Tarea 10.
- **`total_reference` debe aplicar el `basis` propio de cada ítem (per_person / per_room / per_group), nunca asumir `per_person` para todos.** Un ítem `per_room` con un número de viajeros que no divide exacto debe redondear hacia arriba (`Math.ceil`), no hacia abajo ni de forma exacta. Cubierto por los tests de `applyBasis` de la Tarea 8.

---

### Tarea 1: Configuración del proyecto — dependencias y ejecución nativa de TypeScript

**Ficheros:**
- Modificar: `package.json`

**Interfaces:**
- Produce: `zod` y `yaml` disponibles como dependencias para el resto de tareas. Un slot vacío para el script `npm run content:validate` (la implementación real llega en la Tarea 14).

- [ ] **Paso 1: Instalar las dos dependencias nuevas**

```bash
npm install zod@^4.6.5 yaml@^2.9.1
```

- [ ] **Paso 2: Verificar que la ejecución nativa de TypeScript sigue funcionando en este proyecto**

```bash
mkdir -p /tmp/plan-probe && cat > /tmp/plan-probe/probe.ts <<'EOF'
interface Foo { a: number }
const f: Foo = { a: 1 }
console.log(f.a)
EOF
node /tmp/plan-probe/probe.ts
rm -rf /tmp/plan-probe
```

Esperado: imprime `1` sin errores, sin necesidad de flags.

- [ ] **Paso 3: Verificar que el diff de `package.json` es mínimo**

Ejecutar: `git diff package.json`
Esperado: solo se añaden `zod` y `yaml` bajo `dependencies`, nada más cambia (ningún cambio ajeno al lockfile).

- [ ] **Paso 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add zod and yaml for the domain engine"
```

---

### Tarea 2: `schemas/enums.ts` y `schemas/place.ts`

**Ficheros:**
- Crear: `schemas/enums.ts`
- Crear: `schemas/place.ts`
- Test: `tests/schemas/place.test.ts`

**Interfaces:**
- Produce: `PlaceType`, `ContentType`, `GuideStatus`, `GuideType`, `VisitStatus`, `PlanningStatus`, `Pace`, `BudgetLevel`, `BudgetBasis`, `BudgetItemType`, `TravelMode`, `NoteTarget`, `AffiliateCategory`, `Hills`, `BudgetCategory` (todos `z.ZodEnum`, en `schemas/enums.ts`). `EntrySchema`, `HoursSchema`, `PlaceSourceSchema`, y los tipos `PlaceSource`, `Entry`, `Hours` (en `schemas/place.ts`).

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/schemas/place.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { PlaceSourceSchema } from '../../schemas/place.ts'

test('valid minimal place parses', () => {
  const result = PlaceSourceSchema.safeParse({
    place_id: 'thingvellir',
    name: 'Þingvellir',
    destination: 'islandia',
    lat: 64.2559,
    lng: -21.13,
    type: 'park',
    verified_at: '2024-08-15',
  })
  assert.strictEqual(result.success, true)
})

test('review_interval defaults to 12 when omitted', () => {
  const result = PlaceSourceSchema.parse({
    place_id: 'x',
    name: 'X',
    destination: 'islandia',
    lat: 1,
    lng: 1,
    type: 'other',
    verified_at: '2024-01-01',
  })
  assert.strictEqual(result.review_interval, 12)
})

test('invalid type is rejected', () => {
  const result = PlaceSourceSchema.safeParse({
    place_id: 'x',
    name: 'X',
    destination: 'islandia',
    lat: 1,
    lng: 1,
    type: 'not-a-real-type',
    verified_at: '2024-01-01',
  })
  assert.strictEqual(result.success, false)
})

test('entry and hours can each carry an independent verified_at', () => {
  const result = PlaceSourceSchema.parse({
    place_id: 'vestrahorn',
    name: 'Vestrahorn',
    destination: 'islandia',
    lat: 64.2448,
    lng: -14.9836,
    type: 'monument',
    verified_at: '2024-08-15',
    entry: { price: 900, currency: 'ISK', verified_at: '2024-08-15' },
    hours: { open: '08:00', close: '22:00', verified_at: '2024-07-01' },
  })
  assert.strictEqual(result.entry?.verified_at, '2024-08-15')
  assert.strictEqual(result.hours?.verified_at, '2024-07-01')
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/schemas/place.test.ts`
Esperado: FALLA — `Cannot find module '../../schemas/place.ts'`

- [ ] **Paso 3: Escribir `schemas/enums.ts`**

```ts
import { z } from 'zod'

export const PlaceType = z.enum([
  'monument', 'museum', 'park', 'food',
  'transport', 'accommodation', 'activity',
  'viewpoint', 'area', 'other',
])

export const ContentType = z.enum(['experience', 'editorial'])
export const GuideStatus = z.enum(['draft', 'reviewed', 'published', 'archived'])
export const GuideType = z.enum(['itinerary', 'satellite', 'hub'])
export const VisitStatus = z.enum(['visited', 'not_visited', 'unknown'])
export const PlanningStatus = z.enum(['required', 'optional'])
export const Pace = z.enum(['intensivo', 'equilibrado', 'tranquilo'])
export const BudgetLevel = z.enum(['ajustado', 'medio', 'comodo'])
export const BudgetBasis = z.enum(['per_person', 'per_room', 'per_group'])
export const BudgetItemType = z.enum(['real', 'estimado'])
export const TravelMode = z.enum(['a pie', 'metro', 'bus', 'taxi', 'tren', 'coche', 'barco'])
export const NoteTarget = z.enum(['email', 'pdf', 'both'])
export const Hills = z.enum(['none', 'some', 'many'])

export const AffiliateCategory = z.enum([
  'tour', 'accommodation', 'transport',
  'insurance', 'rental', 'ticket', 'other',
])

export const BudgetCategory = z.enum([
  'vuelos', 'alojamiento', 'transporte', 'entradas',
  'comidas', 'seguro', 'otro',
])
```

- [ ] **Paso 4: Escribir `schemas/place.ts`**

```ts
import { z } from 'zod'
import { PlaceType } from './enums.ts'

export const EntrySchema = z.object({
  price: z.number(),
  currency: z.string(),
  booking_required: z.boolean().optional(),
  advance_notice: z.string().optional(),
  url_booking: z.string().url().optional(),
  verified_at: z.string(),
  notes: z.string().optional(),
})

export const HoursSchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
  days_closed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  verified_at: z.string(),
})

export const PlaceSourceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  destination: z.string(),
  lat: z.number(),
  lng: z.number(),
  type: PlaceType,
  verified_at: z.string(),
  review_interval: z.number().optional().default(12),
  source_url: z.string().url().optional(),
  entry: EntrySchema.optional(),
  hours: HoursSchema.optional(),
  notes: z.string().optional(),
})

export type PlaceSource = z.infer<typeof PlaceSourceSchema>
export type Entry = z.infer<typeof EntrySchema>
export type Hours = z.infer<typeof HoursSchema>
```

- [ ] **Paso 5: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/schemas/place.test.ts`
Esperado: PASA (4 tests)

- [ ] **Paso 6: Commit**

```bash
git add schemas/enums.ts schemas/place.ts tests/schemas/place.test.ts
git commit -m "Add enums and PlaceSource schema"
```

---

### Tarea 3: `schemas/guide.ts` y `schemas/index.ts`

**Ficheros:**
- Crear: `schemas/guide.ts`
- Crear: `schemas/index.ts`
- Test: `tests/schemas/guide.test.ts`

**Interfaces:**
- Consume: enums de `schemas/enums.ts` (Tarea 2).
- Produce: `StopSourceSchema`, `DaySourceSchema`, `VariantSourceSchema`, `BudgetSourceSchema`, `AdaptationNoteSourceSchema`, `GuideSourceSchema`, y los tipos `GuideSource`, `VariantSource`, `DaySource`, `StopSource`, `BudgetSource`, `BudgetItemSource`, `AdaptationNoteSource`, `FaqItem`. `schemas/index.ts` re-exporta todo de `enums.ts`, `place.ts`, `guide.ts`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/schemas/guide.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { GuideSourceSchema, StopSourceSchema } from '../../schemas/guide.ts'

function minimalGuide(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'test-guide',
    destination: 'islandia',
    hub: '/islandia/',
    type: 'itinerary',
    content_type: 'experience',
    status: 'reviewed',
    title: 'Test',
    description: 'A short description.',
    updated_at: '2026-01-01',
    cover_image: '/img.jpg',
    summary: { tagline: 'Test tagline' },
    ...overrides,
  }
}

test('minimal valid guide parses', () => {
  const result = GuideSourceSchema.safeParse(minimalGuide())
  assert.strictEqual(result.success, true)
})

test('description over 155 chars is rejected', () => {
  const result = GuideSourceSchema.safeParse(
    minimalGuide({ description: 'x'.repeat(156) }),
  )
  assert.strictEqual(result.success, false)
})

test('stop visit_status defaults to unknown', () => {
  const stop = StopSourceSchema.parse({
    place_id: 'x',
    order: 1,
    duration_min: 30,
    planning_status: 'required',
  })
  assert.strictEqual(stop.visit_status, 'unknown')
})

test('stop with experience block parses when visit_status is visited', () => {
  const result = StopSourceSchema.safeParse({
    place_id: 'x',
    order: 1,
    duration_min: 30,
    planning_status: 'required',
    visit_status: 'visited',
    experience: { visited_at: '2024-08' },
  })
  assert.strictEqual(result.success, true)
})

test('guide with a full variant/day/stop tree parses', () => {
  const result = GuideSourceSchema.safeParse(
    minimalGuide({
      base_travelers: 2,
      variants: [
        {
          id: 'intensivo',
          name: 'Full route',
          description: 'desc',
          days: [
            {
              day: 1,
              title: 'Day one',
              stops: [
                { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
              ],
            },
          ],
        },
      ],
      budget: {
        currency: 'EUR',
        includes: ['x'],
        excludes: ['y'],
        items: [
          { category: 'vuelos', label: 'Flights', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' },
        ],
      },
    }),
  )
  assert.strictEqual(result.success, true, JSON.stringify('error' in result ? result.error?.issues : []))
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/schemas/guide.test.ts`
Esperado: FALLA — `Cannot find module '../../schemas/guide.ts'`

- [ ] **Paso 3: Escribir `schemas/guide.ts`**

```ts
import { z } from 'zod'
import {
  VisitStatus, PlanningStatus, TravelMode, Hills, Pace, BudgetLevel,
  BudgetBasis, BudgetItemType, BudgetCategory, NoteTarget,
  ContentType, GuideStatus, GuideType,
} from './enums.ts'

const ExperienceSchema = z.object({
  visited_at: z.string(),
  actual_price_paid: z.object({
    amount: z.number(),
    currency: z.string(),
    notes: z.string().optional(),
  }).optional(),
})

const BookingSchema = z.object({
  affiliate_id: z.string(),
  advance_notice: z.string().optional(),
})

export const StopSourceSchema = z.object({
  place_id: z.string(),
  order: z.number().int().positive(),
  duration_min: z.number().int().positive(),
  planning_status: PlanningStatus,
  visit_status: VisitStatus.optional().default('unknown'),
  start_time: z.string().optional(),
  travel_to_next_min: z.number().int().optional(),
  travel_to_next_mode: TravelMode.optional(),
  variant_note: z.string().optional(),
  experience: ExperienceSchema.optional(),
  booking: BookingSchema.optional(),
})

const PhysicalLevelSchema = z.object({
  walking_km: z.number().optional(),
  hills: Hills.optional(),
})

const FoodItemSchema = z.object({
  name: z.string(),
  area: z.string().optional(),
  price_level: z.string().optional(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
})

export const DaySourceSchema = z.object({
  day: z.number().int().positive(),
  title: z.string(),
  summary: z.string().optional(),
  physical_level: PhysicalLevelSchema.optional(),
  stops: z.array(StopSourceSchema),
  food: z.array(FoodItemSchema).optional(),
  our_take: z.string().optional(),
  plan_b: z.string().optional(),
  seniors_note: z.string().optional(),
})

const BudgetItemSourceSchema = z.object({
  category: BudgetCategory,
  label: z.string(),
  amount: z.number(),
  basis: BudgetBasis,
  travelers_per_room: z.number().int().positive().optional(),
  type: BudgetItemType,
  verified_at: z.string(),
  notes: z.string().optional(),
})

const BudgetDeltaSchema = z.object({
  items: z.array(BudgetItemSourceSchema),
})

export const VariantSourceSchema = z.object({
  id: Pace,
  name: z.string(),
  description: z.string(),
  days: z.array(DaySourceSchema),
  budget_delta: BudgetDeltaSchema.optional(),
  pace_notes: z.string().optional(),
})

export const BudgetSourceSchema = z.object({
  currency: z.string(),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
  items: z.array(BudgetItemSourceSchema),
  notes: z.string().optional(),
})

const AccommodationPickSchema = z.object({
  name: z.string(),
  price_level: z.string().optional(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
  affiliate_id: z.string().optional(),
})

const AccommodationZoneSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  best_for: z.array(z.string()).optional(),
  picks: z.array(AccommodationPickSchema).optional(),
})

const AccommodationSourceSchema = z.object({
  notes: z.string().optional(),
  zones: z.array(AccommodationZoneSchema),
})

const TransportArrivalSchema = z.object({
  from_airport: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
})

const TransportLocalSchema = z.object({
  mode: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
})

const TransportSourceSchema = z.object({
  arrival: z.array(TransportArrivalSchema).optional(),
  local: z.array(TransportLocalSchema).optional(),
  passes: z.array(z.string()).optional(),
})

const ChecklistItemSourceSchema = z.object({
  label: z.string(),
  when: z.string(),
  priority: z.string().optional(),
  affiliate_id: z.string().optional(),
  notes: z.string().optional(),
  group_note: z.string().optional(),
})

const PracticalSourceSchema = z.object({
  insurance_affiliate_id: z.string().optional(),
  documents: z.array(z.string()).optional(),
  plugs: z.string().optional(),
  apps: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
})

const FaqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
  schema: z.boolean().optional(),
})

const AdaptationNoteConditionsSchema = z.object({
  priorities: z.array(z.string()).optional(),
  group_type: z.array(z.string()).optional(),
  budget: z.array(BudgetLevel).optional(),
  pace: z.array(Pace).optional(),
  trip_days: z.array(z.number()).optional(),
})

export const AdaptationNoteSourceSchema = z.object({
  id: z.string(),
  conditions: AdaptationNoteConditionsSchema,
  text: z.string(),
  target: NoteTarget,
  priority: z.number().optional(),
})

const SummarySourceSchema = z.object({
  tagline: z.string(),
  best_season: z.string().optional(),
  getting_around: z.string().optional(),
  base_area: z.string().optional(),
  pace_default: Pace.optional(),
})

export const GuideSourceSchema = z.object({
  slug: z.string(),
  destination: z.string(),
  hub: z.string(),
  type: GuideType,
  content_type: ContentType,
  status: GuideStatus,
  trip_done: z.string().optional(),
  title: z.string(),
  description: z.string().max(155),
  updated_at: z.string(),
  cover_image: z.string(),
  gallery: z.array(z.string()).optional(),
  days: z.number().int().optional(),
  base_travelers: z.number().int().positive().optional(),
  summary: SummarySourceSchema,
  variants: z.array(VariantSourceSchema).optional(),
  budget: BudgetSourceSchema.optional(),
  accommodation: AccommodationSourceSchema.optional(),
  transport: TransportSourceSchema.optional(),
  booking_checklist: z.array(ChecklistItemSourceSchema).optional(),
  our_criteria: z.array(z.string()).optional(),
  pitfalls: z.array(z.string()).optional(),
  terrain_tips: z.array(z.string()).optional(),
  practical: PracticalSourceSchema.optional(),
  adaptation_notes: z.array(AdaptationNoteSourceSchema).optional(),
  faq: z.array(FaqItemSchema).optional(),
  related: z.array(z.string()).optional(),
})

export type GuideSource = z.infer<typeof GuideSourceSchema>
export type VariantSource = z.infer<typeof VariantSourceSchema>
export type DaySource = z.infer<typeof DaySourceSchema>
export type StopSource = z.infer<typeof StopSourceSchema>
export type BudgetSource = z.infer<typeof BudgetSourceSchema>
export type BudgetItemSource = z.infer<typeof BudgetItemSourceSchema>
export type AdaptationNoteSource = z.infer<typeof AdaptationNoteSourceSchema>
export type FaqItem = z.infer<typeof FaqItemSchema>
```

- [ ] **Paso 4: Escribir `schemas/index.ts`**

```ts
export * from './enums.ts'
export * from './place.ts'
export * from './guide.ts'
```

- [ ] **Paso 5: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/schemas/guide.test.ts`
Esperado: PASA (5 tests)

- [ ] **Paso 6: Commit**

```bash
git add schemas/guide.ts schemas/index.ts tests/schemas/guide.test.ts
git commit -m "Add GuideSource schema tree and schemas barrel"
```

---

### Tarea 4: `engine/load`

**Ficheros:**
- Crear: `engine/load/index.ts`
- Test: `tests/engine/load.test.ts`

**Interfaces:**
- Produce: `loadGuide(path: string): Promise<unknown>`, `loadPlaces(path: string): Promise<unknown>` — leen un fichero YAML y lo parsean, sin validar, sin lógica de negocio.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/engine/load.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadGuide, loadPlaces } from '../../engine/load/index.ts'

test('loadGuide parses a YAML file into an object', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'engine-load-'))
  const path = join(dir, 'guide.yaml')
  await writeFile(path, 'slug: test\ntitle: "Test Guide"\n')

  const result = await loadGuide(path) as Record<string, unknown>
  assert.strictEqual(result.slug, 'test')
  assert.strictEqual(result.title, 'Test Guide')

  await rm(dir, { recursive: true })
})

test('loadPlaces parses a YAML list into an array', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'engine-load-'))
  const path = join(dir, 'places.yaml')
  await writeFile(path, '- place_id: a\n  name: A\n- place_id: b\n  name: B\n')

  const result = await loadPlaces(path) as unknown[]
  assert.strictEqual(result.length, 2)

  await rm(dir, { recursive: true })
})

test('loadGuide rejects when the file does not exist', async () => {
  await assert.rejects(() => loadGuide('/nonexistent/path.yaml'))
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/engine/load.test.ts`
Esperado: FALLA — `Cannot find module '../../engine/load/index.ts'`

- [ ] **Paso 3: Escribir `engine/load/index.ts`**

```ts
import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

export async function loadGuide(path: string): Promise<unknown> {
  const raw = await readFile(path, 'utf-8')
  return parse(raw)
}

export async function loadPlaces(path: string): Promise<unknown> {
  const raw = await readFile(path, 'utf-8')
  return parse(raw)
}
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/engine/load.test.ts`
Esperado: PASA (3 tests)

- [ ] **Paso 5: Commit**

```bash
git add engine/load/index.ts tests/engine/load.test.ts
git commit -m "Add engine/load: read YAML with no business logic"
```

---

### Tarea 5: `content/places/islandia.yaml` — el registro real de lugares

**Ficheros:**
- Crear: `content/places/islandia.yaml`
- Test: `tests/content/places.test.ts`

**Interfaces:**
- Consume: `loadPlaces` (Tarea 4), `PlaceSourceSchema` (Tarea 2).
- Produce: 26 lugares reales del viaje real del autor a Islandia en 2024, cada uno parseable por `PlaceSourceSchema`. Lo consume la Tarea 6 en adelante como fuente de datos del `PlaceRegistry`.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/content/places.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { loadPlaces } from '../../engine/load/index.ts'
import { PlaceSourceSchema } from '../../schemas/place.ts'

const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

test('islandia.yaml loads and every entry matches PlaceSourceSchema', async () => {
  const raw = await loadPlaces(PLACES_PATH) as unknown[]
  assert.strictEqual(raw.length, 26)

  for (const entry of raw) {
    const result = PlaceSourceSchema.safeParse(entry)
    assert.strictEqual(
      result.success,
      true,
      `place failed schema: ${JSON.stringify(entry)} — ${JSON.stringify('error' in result ? result.error?.issues : [])}`,
    )
  }
})

test('every place_id is unique', async () => {
  const raw = await loadPlaces(PLACES_PATH) as { place_id: string }[]
  const ids = raw.map((p) => p.place_id)
  assert.strictEqual(new Set(ids).size, ids.length)
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/content/places.test.ts`
Esperado: FALLA — ENOENT, `content/places/islandia.yaml` no existe

- [ ] **Paso 3: Escribir `content/places/islandia.yaml`**

Datos reales de `docs/1.6.4_json_islandia.md` §1 (7 lugares) más 19 lugares reales y públicamente conocidos de Islandia, necesarios para los días 9-12 (tabla de `visit_status` del §6 de ese documento), restringidos a las paradas marcadas como `visited` + `required` en esa tabla. Las coordenadas de los lugares conocidos de la Ring Road / Snæfellsnes son geografía pública; las tres menos seguras (`migandifoss`, `grafarkirkja`, `kolugljufur`) llevan una nota explícita marcándolas como aproximadas, pendientes de confirmación del autor antes de publicar.

```yaml
- place_id: thingvellir
  name: Parque Nacional de Þingvellir
  destination: islandia
  lat: 64.2559
  lng: -21.1300
  type: park
  verified_at: 2024-08-15
  source_url: https://www.thingvellir.is
  entry:
    price: 0
    currency: ISK
    notes: "Gratuito. Solo se paga el parking (~750 ISK/hora en 2024)."
    verified_at: 2024-08-15
  notes: "Parking P3 para ver la grieta tectónica y el lago Þingvallavatn. La grieta separa las placas euroasiática y norteamericana."

- place_id: geysir
  name: Área geotérmica Geysir (Strokkur)
  destination: islandia
  lat: 64.3100
  lng: -20.3021
  type: monument
  verified_at: 2024-08-15
  entry:
    price: 0
    currency: ISK
    verified_at: 2024-08-15
  notes: "El Strokkur erupciona cada 5-10 minutos. No hace falta esperar más de 20 min para verlo."

- place_id: gullfoss
  name: Cascada Gullfoss
  destination: islandia
  lat: 64.3270
  lng: -20.1210
  type: monument
  verified_at: 2024-08-15
  entry:
    price: 0
    currency: ISK
    verified_at: 2024-08-15
  notes: "Mejor desde el mirador inferior. Con lluvia, el spray moja completamente."

- place_id: seljalandsfoss
  name: Cascada Seljalandsfoss
  destination: islandia
  lat: 63.6156
  lng: -19.9887
  type: monument
  verified_at: 2024-08-15
  entry:
    price: 0
    currency: ISK
    verified_at: 2024-08-15
  notes: "Se puede rodear por detrás: espectacular pero te empapas. A 500 metros está Gljúfrafoss, escondida en una grieta de roca."

- place_id: skogafoss
  name: Cascada Skógafoss
  destination: islandia
  lat: 63.5320
  lng: -19.5116
  type: monument
  verified_at: 2024-08-15
  entry:
    price: 0
    currency: ISK
    verified_at: 2024-08-15
  notes: "Subir por las escaleras de la derecha para el mirador superior."

- place_id: jokulsarlon
  name: Laguna Glaciar Jökulsárlón y Diamond Beach
  destination: islandia
  lat: 64.0481
  lng: -16.1796
  type: monument
  verified_at: 2024-08-15
  entry:
    price: 0
    currency: ISK
    notes: "Laguna y Diamond Beach: gratuito. Excursiones zodiac/barca: precio aparte."
    verified_at: 2024-08-15
  notes: "Diamond Beach (playa negra con icebergs) está al otro lado de la Ring Road. Cruzar con cuidado."

- place_id: vestrahorn
  name: Vestrahorn y Stokksnes
  destination: islandia
  lat: 64.2448
  lng: -14.9836
  type: monument
  verified_at: 2024-08-15
  entry:
    price: 900
    currency: ISK
    notes: "~900 ISK/persona en 2024 (~6 €). Incluye acceso a la playa y al asentamiento vikingo."
    verified_at: 2024-08-15
  hours:
    open: "08:00"
    close: "22:00"
    verified_at: 2024-07-01
  notes: "El asentamiento vikingo es de atrezo de película. Uno de los paisajes más fotografiados de Islandia."

- place_id: godafoss
  name: Cascada Goðafoss
  destination: islandia
  lat: 65.6817
  lng: -17.5506
  type: monument
  verified_at: 2024-08-15
  notes: "Cascada en herradura junto a la Ring Road, cerca de Mývatn."

- place_id: akureyri
  name: Akureyri
  destination: islandia
  lat: 65.6885
  lng: -18.0878
  type: area
  verified_at: 2024-08-15
  notes: "Capital del norte de Islandia, al fondo del fiordo Eyjafjörður."

- place_id: hauganes
  name: Avistamiento de ballenas en Hauganes
  destination: islandia
  lat: 65.8973
  lng: -18.4166
  type: activity
  verified_at: 2024-08-15
  notes: "Pueblo pesquero al norte de Akureyri, salidas de avistamiento de ballenas en el fiordo Eyjafjörður."

- place_id: migandifoss
  name: Cascada Mígandifoss
  destination: islandia
  lat: 66.0333
  lng: -18.6667
  type: monument
  verified_at: 2024-08-15
  notes: "Cascada de la zona de Héðinsfjörður, en la ruta por los túneles hacia Siglufjörður. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."

- place_id: siglufjordur
  name: Siglufjörður
  destination: islandia
  lat: 66.1500
  lng: -18.9100
  type: area
  verified_at: 2024-08-15
  notes: "Antiguo pueblo arenquero en el extremo norte de la península de Tröllaskagi, accesible por túneles."

- place_id: grafarkirkja
  name: Grafarkirkja
  destination: islandia
  lat: 65.6270
  lng: -19.9500
  type: monument
  verified_at: 2024-08-15
  notes: "Pequeña iglesia de turba, una de las más antiguas de Islandia, en la península de Höfðaströnd. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."

- place_id: glaumbaer
  name: Glaumbær Farm
  destination: islandia
  lat: 65.5375
  lng: -19.5000
  type: museum
  verified_at: 2024-08-15
  notes: "Museo etnográfico en una granja tradicional de turba en Skagafjörður."

- place_id: vidimyrarkirkja
  name: Víðimýrarkirkja
  destination: islandia
  lat: 65.4200
  lng: -19.4200
  type: monument
  verified_at: 2024-08-15
  notes: "Iglesia de turba de 1834, una de las mejor conservadas de Islandia."

- place_id: kolugljufur
  name: Cañón de Kolugljúfur
  destination: islandia
  lat: 65.3800
  lng: -20.6700
  type: viewpoint
  verified_at: 2024-08-15
  notes: "Cañón excavado por el río Víðidalsá, con varias cascadas. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."

- place_id: kolgrafarfjordur
  name: Kolgrafarfjörður
  destination: islandia
  lat: 64.9300
  lng: -23.2600
  type: area
  verified_at: 2024-08-15
  notes: "Fiordo en la costa norte de la península de Snæfellsnes, de camino a Grundarfjörður."

- place_id: kirkjufell
  name: Mirador de Kirkjufell
  destination: islandia
  lat: 64.9377
  lng: -23.3084
  type: viewpoint
  verified_at: 2024-08-15
  notes: "La montaña más fotografiada de Islandia, junto a la cascada Kirkjufellsfoss, cerca de Grundarfjörður."

- place_id: olafsvik
  name: Ólafsvík
  destination: islandia
  lat: 64.8945
  lng: -23.7141
  type: area
  verified_at: 2024-08-15
  notes: "Pueblo pesquero en la costa norte de la península de Snæfellsnes."

- place_id: djupalonssandur
  name: Playa de Djúpalónssandur
  destination: islandia
  lat: 64.7642
  lng: -23.9066
  type: park
  verified_at: 2024-08-15
  notes: "Playa de guijarros negros dentro del Parque Nacional de Snæfellsjökull, con restos de un naufragio y piedras de fuerza tradicionales."

- place_id: londrangar
  name: Londrangar
  destination: islandia
  lat: 64.7444
  lng: -23.9130
  type: viewpoint
  verified_at: 2024-08-15
  notes: "Aparcamiento y mirador de dos formaciones rocosas volcánicas junto al mar."

- place_id: hellnar
  name: Mirador de Hellnar
  destination: islandia
  lat: 64.7500
  lng: -23.9600
  type: viewpoint
  verified_at: 2024-08-15
  notes: "Pequeño pueblo con acantilados y colonias de aves marinas, en la costa sur de Snæfellsnes."

- place_id: arnarstapi
  name: Arnarstapi
  destination: islandia
  lat: 64.7717
  lng: -23.6260
  type: area
  verified_at: 2024-08-15
  notes: "Pueblo costero con la ruta de acantilados hacia Hellnar y la estatua de Bárður Snæfellsás."

- place_id: raudfeldsgja
  name: Garganta de Rauðfeldsgjá
  destination: islandia
  lat: 64.7690
  lng: -23.5850
  type: activity
  verified_at: 2024-08-15
  notes: "Grieta estrecha en la montaña que se puede recorrer a pie, cerca de Arnarstapi. Lleva agua en el fondo, calzado adecuado necesario."

- place_id: budakirkja
  name: Búðakirkja
  destination: islandia
  lat: 64.8270
  lng: -23.3850
  type: monument
  verified_at: 2024-08-15
  notes: "Iglesia negra de madera de 1848 junto al pueblo de Búðir."

- place_id: reykjavik
  name: Reikiavik
  destination: islandia
  lat: 64.1466
  lng: -21.9426
  type: area
  verified_at: 2024-08-15
  notes: "Capital de Islandia, punto de partida y cierre de la ruta por la Ring Road."
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/content/places.test.ts`
Esperado: PASA (2 tests)

- [ ] **Paso 5: Commit**

```bash
git add content/places/islandia.yaml tests/content/places.test.ts
git commit -m "Add the real Islandia place registry (26 places, days 1-2 and 9-12)"
```

---

### Tarea 6: `content/guides/islandia/islandia-en-camper-13-dias.yaml` — la guía real

**Ficheros:**
- Crear: `content/guides/islandia/islandia-en-camper-13-dias.yaml`
- Test: `tests/content/guide.test.ts`

**Interfaces:**
- Consume: `loadGuide` (Tarea 4), `GuideSourceSchema` (Tarea 3), `content/places/islandia.yaml` (Tarea 5, para comprobar que cada `place_id` referenciado existe en el registro — una comprobación ligera, no la capa completa de validación de referencias, que llega en la Tarea 10).
- Produce: la guía real y parcial (solo días 1, 2, 9, 10, 11, 12), honesta sobre la ausencia de los días 3-8. Cero referencias a `affiliate_id` en todo el fichero.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/content/guide.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { loadGuide, loadPlaces } from '../../engine/load/index.ts'
import { GuideSourceSchema } from '../../schemas/guide.ts'

const GUIDE_PATH = new URL('../../content/guides/islandia/islandia-en-camper-13-dias.yaml', import.meta.url).pathname
const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

test('the real Islandia guide matches GuideSourceSchema', async () => {
  const raw = await loadGuide(GUIDE_PATH)
  const result = GuideSourceSchema.safeParse(raw)
  assert.strictEqual(
    result.success,
    true,
    JSON.stringify('error' in result ? result.error?.issues : []),
  )
})

test('the guide only contains days 1, 2, 9, 10, 11 and 12', async () => {
  const raw = await loadGuide(GUIDE_PATH) as { variants: { days: { day: number }[] }[] }
  const days = raw.variants[0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 9, 10, 11, 12])
})

test('every stop place_id exists in the place registry', async () => {
  const rawGuide = await loadGuide(GUIDE_PATH) as { variants: { days: { stops: { place_id: string }[] }[] }[] }
  const rawPlaces = await loadPlaces(PLACES_PATH) as { place_id: string }[]
  const placeIds = new Set(rawPlaces.map((p) => p.place_id))

  for (const variant of rawGuide.variants) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        assert.ok(placeIds.has(stop.place_id), `missing place_id: ${stop.place_id}`)
      }
    }
  }
})

test('the guide has no source-written derived fields (places, budget.type, etc.)', async () => {
  const raw = await loadGuide(GUIDE_PATH) as Record<string, unknown>
  assert.strictEqual('places' in raw, false)
  const budget = raw.budget as Record<string, unknown> | undefined
  assert.strictEqual(budget && 'type' in budget, false)
  assert.strictEqual(budget && 'total_base' in budget, false)
  assert.strictEqual(budget && 'total_reference' in budget, false)
})

test('the guide has no affiliate_id references anywhere', async () => {
  const raw = await loadGuide(GUIDE_PATH)
  assert.strictEqual(JSON.stringify(raw).includes('affiliate_id'), false)
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/content/guide.test.ts`
Esperado: FALLA — ENOENT, el fichero de la guía no existe

- [ ] **Paso 3: Escribir `content/guides/islandia/islandia-en-camper-13-dias.yaml`**

Datos reales transcritos de `docs/1.6.4_json_islandia.md` (días 1-2 completos, incluyendo el `variant_note`/`our_take`/`plan_b` real) más los días 9-12 construidos a partir de la tabla de `visit_status` del §6 de ese documento, restringidos a paradas marcadas `required` + `visited` (las paradas `not_visited` y `optional` de esa tabla se dejan fuera honestamente, en vez de rellenarlas). Sin narrativa inventada en primera persona para las paradas de los días 9-12 — solo hechos estructurales (lugar, orden, una estimación de duración razonable, estado).

```yaml
slug: islandia-en-camper-13-dias
destination: islandia
hub: /islandia/
type: itinerary
content_type: experience
status: reviewed
trip_done: "2024"
title: "Islandia en camper: ruta de 13 días por la Ring Road"
description: "Ruta por Islandia en camper (13 días, antihoraria) con presupuesto real: 4.495 € entre dos personas, campings reales y lo que haríamos distinto."
updated_at: 2026-09-30
cover_image: /images/islandia/kirkjufell.jpg
days: 13
base_travelers: 2

summary:
  tagline: "13 días recorriendo Islandia en camper, con el sur como aperitivo y el norte como premio"
  best_season: "Junio-agosto (días largos); septiembre (auroras, menos gente)"
  getting_around: "Camper alquilado. Ring Road como eje principal. Sin F-roads."
  base_area: "Sin base fija; camping diferente cada noche"
  pace_default: intensivo

budget:
  currency: EUR
  includes:
    - "Vuelos MAD-KEF-MAD (por persona)"
    - "Alquiler camper 13 días (por persona)"
    - "Gasolina Islandia (por persona)"
    - "Campings 13 noches (por persona)"
    - "Excursiones incluyendo trekking en glaciar (por persona)"
    - "Supermercado Islandia (por persona)"
    - "Seguro de viaje (por persona)"
    - "Extras, comidas fuera y parkings Islandia (por persona)"
  excludes:
    - "Guardería de mascotas (gasto personal no del viaje)"
    - "Gasolina y gastos en España hasta el aeropuerto"
  notes: "Presupuesto real 2024. El camper y la gasolina son las partidas más grandes. Cocinar en el camper reduce mucho el gasto de comidas."
  items:
    - category: vuelos
      label: "Vuelos MAD → KEF → MAD"
      amount: 285.56
      basis: per_person
      type: real
      verified_at: 2024-01-15
    - category: transporte
      label: "Alquiler camper 13 días"
      amount: 991.30
      basis: per_person
      type: real
      verified_at: 2024-01-15
      notes: "1.982,60 € total / 2 personas. Incluía seguro básico."
    - category: transporte
      label: "Gasolina en Islandia"
      amount: 180.97
      basis: per_person
      type: real
      verified_at: 2024-08-20
      notes: "La gasolina es cara. Llenar siempre en ciudades; hay tramos largos sin gasolineras."
    - category: alojamiento
      label: "Campings (13 noches)"
      amount: 153.29
      basis: per_person
      type: real
      verified_at: 2024-08-20
      notes: "Media ~11,8 €/persona/noche."
    - category: entradas
      label: "Excursiones (trekking glaciar y otras)"
      amount: 251.33
      basis: per_person
      type: real
      verified_at: 2024-08-20
      notes: "La excursión en glaciar es la más cara y la más impresionante. No la recortaríamos."
    - category: comidas
      label: "Supermercado en Islandia"
      amount: 67.84
      basis: per_person
      type: real
      verified_at: 2024-08-20
      notes: "Comprar en Bonus (la cadena más barata). Cocinar en el camper = ahorro enorme."
    - category: seguro
      label: "Seguro de viaje"
      amount: 33.45
      basis: per_person
      type: real
      verified_at: 2024-01-15
    - category: otro
      label: "Extras, comidas fuera y parkings Islandia"
      amount: 283.88
      basis: per_person
      type: real
      verified_at: 2024-08-20

variants:
  - id: intensivo
    name: "Ruta completa (como la hicimos)"
    description: "Los 13 días tal como los planificamos. Días de hasta 340 km con muchas paradas. Hay que madrugar."
    days:
      - day: 1
        title: "Círculo Dorado"
        summary: "Þingvellir, Géiser y Gullfoss. El trío clásico para entrar en calor."
        physical_level:
          walking_km: 8
          hills: some
        stops:
          - place_id: thingvellir
            order: 1
            duration_min: 70
            planning_status: required
            visit_status: visited
            start_time: "09:00"
            travel_to_next_min: 50
            travel_to_next_mode: "coche"
            variant_note: "En intensivo: parking P3, paseo por la grieta y el lago, sin perder tiempo."
          - place_id: geysir
            order: 2
            duration_min: 50
            planning_status: required
            visit_status: visited
            start_time: "10:40"
            travel_to_next_min: 10
            travel_to_next_mode: "coche"
          - place_id: gullfoss
            order: 3
            duration_min: 60
            planning_status: required
            visit_status: visited
            start_time: "11:40"
        our_take: "Si tuviéramos que quitar algo del Círculo Dorado, quitaríamos Þingvellir el primer día y lo dejaríamos para el último, con más calma. El Géiser y Gullfoss son más impactantes como primera impresión."
        plan_b: "Si llueve: Gullfoss desde el mirador cubierto sigue mereciendo. El Géiser no depende del tiempo."

      - day: 2
        title: "Cascadas del sur"
        summary: "Seljalandsfoss y Skógafoss. Impermeable obligatorio."
        physical_level:
          walking_km: 6
          hills: none
        stops:
          - place_id: seljalandsfoss
            order: 1
            duration_min: 45
            planning_status: required
            visit_status: visited
            start_time: "09:30"
            travel_to_next_min: 30
            travel_to_next_mode: "coche"
          - place_id: skogafoss
            order: 2
            duration_min: 60
            planning_status: required
            visit_status: visited
            start_time: "11:00"
            variant_note: "Subir las escaleras de la derecha para el mirador superior."
        our_take: "Estas dos cascadas se pueden hacer con calma en media jornada y seguir ruta hacia el este."
        plan_b: "La lluvia mejora estas cascadas (más caudal). No es mal plan si llueve."

      - day: 9
        title: "Goðafoss, Akureyri y la costa de Tröllaskagi"
        summary: "De la zona de Mývatn a la costa norte, con parada para avistamiento de ballenas y cruce por túneles hacia Siglufjörður."
        stops:
          - place_id: godafoss
            order: 1
            duration_min: 40
            planning_status: required
            visit_status: visited
          - place_id: akureyri
            order: 2
            duration_min: 60
            planning_status: required
            visit_status: visited
          - place_id: hauganes
            order: 3
            duration_min: 180
            planning_status: required
            visit_status: visited
          - place_id: migandifoss
            order: 4
            duration_min: 30
            planning_status: required
            visit_status: visited
          - place_id: siglufjordur
            order: 5
            duration_min: 60
            planning_status: required
            visit_status: visited

      - day: 10
        title: "Camino al oeste: iglesias de turba y Kolugljúfur"
        summary: "Cruce de Skagafjörður hacia la península de Snæfellsnes, con paradas en iglesias de turba históricas y el cañón de Kolugljúfur."
        stops:
          - place_id: grafarkirkja
            order: 1
            duration_min: 20
            planning_status: required
            visit_status: visited
          - place_id: glaumbaer
            order: 2
            duration_min: 45
            planning_status: required
            visit_status: visited
          - place_id: vidimyrarkirkja
            order: 3
            duration_min: 20
            planning_status: required
            visit_status: visited
          - place_id: kolugljufur
            order: 4
            duration_min: 45
            planning_status: required
            visit_status: visited
          - place_id: kolgrafarfjordur
            order: 5
            duration_min: 20
            planning_status: required
            visit_status: visited

      - day: 11
        title: "Snæfellsnes: Kirkjufell, Djúpalónssandur y Arnarstapi"
        summary: "Día completo recorriendo la península de Snæfellsnes, de Kirkjufell hasta los acantilados del sur."
        stops:
          - place_id: kirkjufell
            order: 1
            duration_min: 45
            planning_status: required
            visit_status: visited
          - place_id: olafsvik
            order: 2
            duration_min: 30
            planning_status: required
            visit_status: visited
          - place_id: djupalonssandur
            order: 3
            duration_min: 45
            planning_status: required
            visit_status: visited
          - place_id: londrangar
            order: 4
            duration_min: 30
            planning_status: required
            visit_status: visited
          - place_id: hellnar
            order: 5
            duration_min: 30
            planning_status: required
            visit_status: visited
          - place_id: arnarstapi
            order: 6
            duration_min: 45
            planning_status: required
            visit_status: visited
          - place_id: raudfeldsgja
            order: 7
            duration_min: 30
            planning_status: required
            visit_status: visited
          - place_id: budakirkja
            order: 8
            duration_min: 20
            planning_status: required
            visit_status: visited

      - day: 12
        title: "Regreso a Reikiavik"
        summary: "Última etapa de la Ring Road, cierre del círculo en la capital."
        stops:
          - place_id: reykjavik
            order: 1
            duration_min: 90
            planning_status: required
            visit_status: visited

accommodation:
  notes: "En camper, el alojamiento son campings. Se elige según la posición al final de cada jornada."
  zones:
    - name: "Sur de Islandia"
      description: "Campings más completos y mejor infraestructura."
      pros: ["Duchas incluidas en muchos", "Bien ubicados cerca de los atractivos"]
      cons: ["Más llenos en temporada alta"]
      best_for: [couple, friends]
      picks:
        - name: "Hellissandur Camping (Snæfellsnes)"
          price_level: bajo
          notes: "26 €/persona en 2024. Duchas incluidas."
          verified_at: 2024-08-15
        - name: "Camping Svínafelli (Skaftafell)"
          price_level: bajo
          notes: "Bien ubicado para glaciar y Jökulsárlón."
          verified_at: 2024-08-15
    - name: "Norte de Islandia"
      description: "Campings más pequeños y tranquilos."
      pros: ["Menos gente", "Más baratos"]
      cons: ["Duchas no siempre incluidas"]
      best_for: [couple, friends]
      picks:
        - name: "Camping Myvatn"
          price_level: bajo
          notes: "Bien ubicado para el lago y la zona geotérmica."
          verified_at: 2024-08-15

transport:
  arrival:
    - from_airport: MAD
      description: "Vuelo a Reikiavik (KEF). El camper se recoge en el aeropuerto o en la ciudad. El aeropuerto está a 50 km de Reikiavik."
      notes: "Llegamos a la 1:30 de la madrugada y dormimos directamente en un camping cercano al aeropuerto."
      verified_at: 2024-08-01
  local:
    - mode: "camper"
      description: "Ring Road (Ruta 1) rodea toda la isla, asfaltada. Velocidad máx. 90 km/h en carretera, 30 km/h en pistas de grava. F-roads (pistas del interior): prohibidas para campers estándar."
      notes: "App Gas Map Iceland para encontrar gasolineras baratas. Llenar siempre al pasar por una ciudad."
      verified_at: 2024-08-15

booking_checklist:
  - label: "Alquiler del camper"
    when: "3-6 meses antes"
    priority: alta
    notes: "Los buenos campers se agotan meses antes del verano."

our_criteria:
  - "El trekking en el glaciar (502 € entre los dos) es lo más caro y lo más impresionante. No lo recortaríamos."
  - "Cocinar en el camper es lo que hace viable el presupuesto. Comer fuera en Islandia puede ser 3-4 veces más caro que en España."
  - "Las F-roads están prohibidas para campers estándar. No intentarlo aunque parezca transitable."
  - "Si tuviéramos que quitar algo, empezaríamos por las paradas que no dieron tiempo en el plan original."

pitfalls:
  - "No entrar en F-roads: el GPS de la empresa lo detecta y la penalización puede ser mayor que el deducible del seguro."
  - "Llenar gasolina siempre al pasar por una ciudad. Los tramos remotos pueden tener 150 km sin gasolinera."
  - "Las puertas del camper pueden dañarse con el viento. Posicionar siempre el vehículo como escudo antes de abrir."
  - "Los campings sin ducha son más baratos pero en agosto la temperatura nocturna puede bajar a 5-8°C."

terrain_tips:
  - "App Vedur (tiempo oficial islandés): el tiempo cambia en minutos."
  - "App Gas Map Iceland para gasolineras más baratas."
  - "Diamond Beach y Jökulsárlón están separadas por la Ring Road: son dos sitios distintos, cruzar con cuidado."
  - "Gljúfrafoss está a 500 metros de Seljalandsfoss, poca gente llega."

practical:
  documents:
    - "DNI o pasaporte (Islandia es espacio Schengen)"
    - "Carnet de conducir (el español es válido)"
    - "Tarjeta de crédito con margen para fianza del camper (puede ser 1.000-2.000 €)"
  plugs: "Tipo F (igual que España). Sin adaptador."
  apps:
    - "Vedur (tiempo oficial)"
    - "Gas Map Iceland (gasolineras baratas)"
    - "Maps.me (offline: imprescindible sin cobertura)"
    - "Safe Travel Iceland (alertas de seguridad vial)"

faq:
  - q: "¿Cuánto cuesta viajar a Islandia en camper 13 días?"
    a: "En nuestra experiencia de 2024 (2 personas): 4.495 € en total, unos 2.248 € por persona. Incluye vuelos, camper, gasolina, campings, excursiones, supermercado y seguro."
    schema: true
  - q: "¿Qué ruta es mejor, horaria o antihoraria?"
    a: "Nosotros hicimos la antihoraria (sur primero) y nos gustó: el sur tiene los atractivos más impactantes como aperitivo. El norte tiene menos turistas para el final."
    schema: true
  - q: "¿Hace falta 4x4 para la Ring Road?"
    a: "No. La Ring Road está asfaltada y se hace sin problema con un camper estándar. El 4x4 solo es necesario para las F-roads, prohibidas para campers de alquiler estándar."
    schema: true

adaptation_notes:
  - id: parents_road_conditions
    conditions:
      group_type: [parents]
    text: "Para viajar con personas mayores en camper por Islandia conviene reducir los días más largos de conducción (el norte tiene etapas de 300-400 km) partiéndolos en dos. Los campings con mejor infraestructura (duchas, aseos) son especialmente importantes."
    target: both
    priority: 1
  - id: budget_ajustado_camper
    conditions:
      budget: [ajustado]
    text: "Para reducir el presupuesto: cocinar en el camper casi siempre (ahorro estimado 40-70 €/persona), comprar exclusivamente en Bonus, elegir campings sin ducha cuando no sea imprescindible."
    target: both
    priority: 1
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/content/guide.test.ts`
Esperado: PASA (5 tests)

- [ ] **Paso 5: Commit**

```bash
git add content/guides/islandia/islandia-en-camper-13-dias.yaml tests/content/guide.test.ts
git commit -m "Add the real, partial Islandia guide (days 1, 2, 9-12)"
```

---

### Tarea 7: `engine/types.ts` y `engine/compile/place.ts`

**Ficheros:**
- Crear: `engine/types.ts`
- Crear: `engine/compile/place.ts`
- Test: `tests/engine/compile-place.test.ts`

**Interfaces:**
- Consume: `PlaceSource`, `GuideSource` (de `schemas/`, Tareas 2-3).
- Produce: todas las interfaces `Compiled*` (`CompiledPlace`, `CompiledAffiliate`, `CompiledStop`, `CompiledDay`, `CompiledVariant`, `CompiledBudget`, `CompiledSummary`, `CompiledGuide`, `CompiledAccommodation`, `CompiledTransport`, `CompiledChecklistItem`, `CompiledPractical`), más `PlaceRegistry`, `AffiliateRegistry`, `AffiliateRegistryEntry` (todo en `engine/types.ts`). `resolvePlace(place, now?): CompiledPlace` y `resolveAffiliate(entry): CompiledAffiliate` (en `engine/compile/place.ts`) — los consumen las Tareas 9 y 11.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/engine/compile-place.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { resolvePlace, resolveAffiliate } from '../../engine/compile/place.ts'
import type { PlaceSource } from '../../schemas/place.ts'

const basePlace: PlaceSource = {
  place_id: 'x',
  name: 'X',
  destination: 'islandia',
  lat: 1,
  lng: 1,
  type: 'other',
  verified_at: '2024-01-01',
  review_interval: 12,
}

test('a recently verified place is not stale', () => {
  const now = new Date('2024-06-01')
  const compiled = resolvePlace(basePlace, now)
  assert.strictEqual(compiled.is_stale, false)
  assert.deepStrictEqual(compiled.stale_fields, [])
})

test('a place verified more than review_interval months ago is stale', () => {
  const now = new Date('2026-01-01')
  const compiled = resolvePlace(basePlace, now)
  assert.strictEqual(compiled.is_stale, true)
  assert.ok(compiled.stale_fields.includes('verified_at'))
})

test('entry.verified_at is checked independently of the place-level verified_at', () => {
  const place: PlaceSource = {
    ...basePlace,
    verified_at: '2024-08-15',
    entry: { price: 900, currency: 'ISK', verified_at: '2020-01-01' },
  }
  const now = new Date('2024-09-01')
  const compiled = resolvePlace(place, now)
  assert.strictEqual(compiled.is_stale, true)
  assert.deepStrictEqual(compiled.stale_fields, ['entry.price'])
})

test('resolveAffiliate builds the /ir/{id} redirect url', () => {
  const compiled = resolveAffiliate({
    id: 'iati-seguro-europa',
    partner: 'IATI',
    category: 'insurance',
    description: 'Seguro de viaje',
    active: true,
    verified_at: '2024-01-01',
  })
  assert.strictEqual(compiled.redirect_url, '/ir/iati-seguro-europa')
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/engine/compile-place.test.ts`
Esperado: FALLA — `Cannot find module '../../engine/compile/place.ts'`

- [ ] **Paso 3: Escribir `engine/types.ts`**

```ts
import type { PlaceSource, GuideSource, AdaptationNoteSource, FaqItem, BudgetItemSource } from '../schemas/index.ts'

export type { GuideSource, PlaceSource }

export interface PlaceRegistry {
  get(placeId: string): PlaceSource | undefined
}

export interface AffiliateRegistryEntry {
  id: string
  partner: string
  category: string
  destination?: string
  description: string
  active: boolean
  verified_at: string
}

export interface AffiliateRegistry {
  get(affiliateId: string): AffiliateRegistryEntry | undefined
}

export interface CompiledPlace extends PlaceSource {
  is_stale: boolean
  stale_fields: string[]
}

export interface CompiledAffiliate {
  id: string
  partner: string
  category: string
  destination?: string
  redirect_url: string
  description: string
  active: boolean
  verified_at: string
}

export interface CompiledStop {
  place: CompiledPlace
  order: number
  duration_min: number
  planning_status: 'required' | 'optional'
  visit_status: 'visited' | 'not_visited' | 'unknown'
  start_time?: string
  travel_to_next_min?: number
  travel_to_next_mode?: string
  variant_note?: string
  experience?: {
    visited_at: string
    actual_price_paid?: { amount: number; currency: string; notes?: string }
  }
  booking?: {
    affiliate: CompiledAffiliate
    advance_notice?: string
  }
}

export interface CompiledDay {
  day: number
  title: string
  summary?: string
  physical_level?: { walking_km?: number; hills?: 'none' | 'some' | 'many' }
  stops: CompiledStop[]
  n_stops: number
  food?: object[]
  our_take?: string
  plan_b?: string
  seniors_note?: string
}

export interface CompiledVariant {
  id: 'intensivo' | 'equilibrado' | 'tranquilo'
  name: string
  description: string
  days: CompiledDay[]
  n_stops_total: number
  all_places: CompiledPlace[]
  budget_delta?: {
    items: BudgetItemSource[]
    total: number
  }
  pace_notes?: string
}

export interface CompiledBudget {
  currency: string
  includes: string[]
  excludes: string[]
  items: BudgetItemSource[]
  notes?: string
  type: 'real' | 'estimado' | 'mixed'
  verified_at: string
  total_base: number
  total_reference: number
}

export interface CompiledSummary {
  tagline: string
  best_season?: string
  getting_around?: string
  base_area?: string
  pace_default?: 'intensivo' | 'equilibrado' | 'tranquilo'
  budget_per_person?: number
}

// TODO: expand in sprint de alojamiento — resolve affiliate_id when data/affiliates.yaml exists
export type CompiledAccommodation = GuideSource['accommodation']

// TODO: expand in sprint de transporte
export type CompiledTransport = GuideSource['transport']

// TODO: expand in sprint de checklist — resolve affiliate_id when data/affiliates.yaml exists
export type CompiledChecklistItem = NonNullable<GuideSource['booking_checklist']>[number]

// TODO: expand in sprint de contenido práctico — resolve insurance_affiliate_id when data/affiliates.yaml exists
export type CompiledPractical = GuideSource['practical']

export interface CompiledGuide {
  slug: string
  destination: string
  hub: string
  type: 'itinerary' | 'satellite' | 'hub'
  content_type: 'experience' | 'editorial'
  status: 'draft' | 'reviewed' | 'published' | 'archived'
  trip_done?: string
  title: string
  description: string
  updated_at: string
  cover_image: string
  gallery?: string[]
  days?: number
  base_travelers?: number
  our_criteria?: string[]
  pitfalls?: string[]
  terrain_tips?: string[]
  practical?: CompiledPractical
  adaptation_notes?: AdaptationNoteSource[]
  faq?: FaqItem[]
  related?: string[]

  summary: CompiledSummary
  variants?: CompiledVariant[]
  budget?: CompiledBudget
  accommodation?: CompiledAccommodation
  transport?: CompiledTransport
  booking_checklist?: CompiledChecklistItem[]

  places: CompiledPlace[]
  has_experience: boolean
  compiled_at: string
}
```

- [ ] **Paso 4: Escribir `engine/compile/place.ts`**

```ts
import type { PlaceSource } from '../../schemas/index.ts'
import type { CompiledPlace, CompiledAffiliate, AffiliateRegistryEntry } from '../types.ts'

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30

function monthsSince(dateStr: string, now: Date): number {
  const then = new Date(dateStr)
  return (now.getTime() - then.getTime()) / MS_PER_MONTH
}

export function resolvePlace(place: PlaceSource, now: Date = new Date()): CompiledPlace {
  const reviewInterval = place.review_interval ?? 12
  const staleFields: string[] = []

  if (monthsSince(place.verified_at, now) > reviewInterval) {
    staleFields.push('verified_at')
  }
  if (place.entry && monthsSince(place.entry.verified_at, now) > reviewInterval) {
    staleFields.push('entry.price')
  }
  if (place.hours && monthsSince(place.hours.verified_at, now) > reviewInterval) {
    staleFields.push('hours')
  }

  return {
    ...place,
    is_stale: staleFields.length > 0,
    stale_fields: staleFields,
  }
}

export function resolveAffiliate(affiliate: AffiliateRegistryEntry): CompiledAffiliate {
  return {
    id: affiliate.id,
    partner: affiliate.partner,
    category: affiliate.category,
    destination: affiliate.destination,
    redirect_url: `/ir/${affiliate.id}`,
    description: affiliate.description,
    active: affiliate.active,
    verified_at: affiliate.verified_at,
  }
}
```

- [ ] **Paso 5: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/engine/compile-place.test.ts`
Esperado: PASA (4 tests)

- [ ] **Paso 6: Commit**

```bash
git add engine/types.ts engine/compile/place.ts tests/engine/compile-place.test.ts
git commit -m "Add compiled model types and place/affiliate resolution"
```

---

### Tarea 8: `engine/compile/budget.ts`

**Ficheros:**
- Crear: `engine/compile/budget.ts`
- Test: `tests/engine/compile-budget.test.ts`

**Interfaces:**
- Consume: `BudgetSource`, `BudgetItemSource` (Tarea 3), `CompiledBudget` (Tarea 7).
- Produce: `applyBasis(item, travelers): number`, `compileBudget(source, baseTravelers): CompiledBudget` — los consume la Tarea 11.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/engine/compile-budget.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { applyBasis, compileBudget } from '../../engine/compile/budget.ts'
import type { BudgetItemSource, BudgetSource } from '../../schemas/guide.ts'

test('applyBasis: per_person multiplies by traveler count', () => {
  const item: BudgetItemSource = { category: 'vuelos', label: 'x', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' }
  assert.strictEqual(applyBasis(item, 2), 200)
})

test('applyBasis: per_group ignores traveler count', () => {
  const item: BudgetItemSource = { category: 'transporte', label: 'x', amount: 100, basis: 'per_group', type: 'real', verified_at: '2024-01-01' }
  assert.strictEqual(applyBasis(item, 5), 100)
})

test('applyBasis: per_room rounds up when travelers do not divide evenly', () => {
  const item: BudgetItemSource = { category: 'alojamiento', label: 'x', amount: 100, basis: 'per_room', travelers_per_room: 2, type: 'real', verified_at: '2024-01-01' }
  assert.strictEqual(applyBasis(item, 3), 200) // ceil(3/2) = 2 rooms
})

test('compileBudget: total_base ignores basis, total_reference applies it', () => {
  const source: BudgetSource = {
    currency: 'EUR',
    includes: [],
    excludes: [],
    items: [
      { category: 'vuelos', label: 'a', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' },
      { category: 'transporte', label: 'b', amount: 50, basis: 'per_group', type: 'real', verified_at: '2024-02-01' },
    ],
  }
  const compiled = compileBudget(source, 2)
  assert.strictEqual(compiled.total_base, 150)
  assert.strictEqual(compiled.total_reference, 250) // 100*2 + 50
})

test('compileBudget: type is real when every item is real', () => {
  const source: BudgetSource = {
    currency: 'EUR', includes: [], excludes: [],
    items: [{ category: 'vuelos', label: 'a', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-01-01' }],
  }
  assert.strictEqual(compileBudget(source, 1).type, 'real')
})

test('compileBudget: type is mixed when items disagree', () => {
  const source: BudgetSource = {
    currency: 'EUR', includes: [], excludes: [],
    items: [
      { category: 'vuelos', label: 'a', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-01-01' },
      { category: 'entradas', label: 'b', amount: -1, basis: 'per_person', type: 'estimado', verified_at: '2024-02-01' },
    ],
  }
  assert.strictEqual(compileBudget(source, 1).type, 'mixed')
})

test('compileBudget: verified_at is the earliest of all items', () => {
  const source: BudgetSource = {
    currency: 'EUR', includes: [], excludes: [],
    items: [
      { category: 'vuelos', label: 'a', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-08-20' },
      { category: 'seguro', label: 'b', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-01-15' },
    ],
  }
  assert.strictEqual(compileBudget(source, 1).verified_at, '2024-01-15')
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/engine/compile-budget.test.ts`
Esperado: FALLA — `Cannot find module '../../engine/compile/budget.ts'`

- [ ] **Paso 3: Escribir `engine/compile/budget.ts`**

```ts
import type { BudgetItemSource, BudgetSource } from '../../schemas/index.ts'
import type { CompiledBudget } from '../types.ts'

export function applyBasis(item: BudgetItemSource, travelers: number): number {
  switch (item.basis) {
    case 'per_person':
      return item.amount * travelers
    case 'per_room': {
      const perRoom = item.travelers_per_room ?? 1
      return item.amount * Math.ceil(travelers / perRoom)
    }
    case 'per_group':
      return item.amount
  }
}

export function compileBudget(source: BudgetSource, baseTravelers: number): CompiledBudget {
  const uniqueTypes = new Set(source.items.map((item) => item.type))
  const type: CompiledBudget['type'] = uniqueTypes.size === 1 ? source.items[0].type : 'mixed'

  const verifiedAt = [...source.items].map((item) => item.verified_at).sort()[0]

  const totalBase = source.items.reduce((sum, item) => sum + item.amount, 0)
  const totalReference = source.items.reduce(
    (sum, item) => sum + applyBasis(item, baseTravelers),
    0,
  )

  return {
    currency: source.currency,
    includes: source.includes,
    excludes: source.excludes,
    items: source.items,
    notes: source.notes,
    type,
    verified_at: verifiedAt,
    total_base: totalBase,
    total_reference: totalReference,
  }
}
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/engine/compile-budget.test.ts`
Esperado: PASA (7 tests)

- [ ] **Paso 5: Commit**

```bash
git add engine/compile/budget.ts tests/engine/compile-budget.test.ts
git commit -m "Add budget compilation: total_base, total_reference, type, verified_at"
```

---

### Tarea 9: `engine/compile/itinerary.ts` — paradas, días, variantes

**Ficheros:**
- Crear: `engine/compile/itinerary.ts`
- Test: `tests/engine/compile-itinerary.test.ts`

**Interfaces:**
- Consume: `resolvePlace`, `resolveAffiliate` (Tarea 7), `PlaceRegistry`, `AffiliateRegistry` (Tarea 7), `StopSource`/`DaySource`/`VariantSource` (Tarea 3).
- Produce: `compileStop(stop, places, affiliates, now?): CompiledStop`, `compileDay(day, places, affiliates, now?): CompiledDay`, `compileVariant(variant, places, affiliates, now?): CompiledVariant` — los consume la Tarea 11.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/engine/compile-itinerary.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { compileStop, compileDay, compileVariant } from '../../engine/compile/itinerary.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'
import type { PlaceSource } from '../../schemas/index.ts'

const places: Record<string, PlaceSource> = {
  a: { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', review_interval: 12, entry: { price: 10, currency: 'EUR', verified_at: '2024-01-01' } },
}

const placeRegistry: PlaceRegistry = { get: (id) => places[id] }
const emptyAffiliates: AffiliateRegistry = { get: () => undefined }
const now = new Date('2024-06-01')

test('compileStop resolves place_id to a CompiledPlace', () => {
  const compiled = compileStop(
    { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(compiled.place.place_id, 'a')
  assert.strictEqual('place_id' in compiled, false)
})

test('compileStop throws when place_id does not exist (I5)', () => {
  assert.throws(() =>
    compileStop(
      { place_id: 'missing', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      placeRegistry, emptyAffiliates, now,
    ),
  )
})

test('I1: the same place_id in two different stops resolves to equal CompiledPlace values', () => {
  const stop1 = compileStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }, placeRegistry, emptyAffiliates, now)
  const stop2 = compileStop({ place_id: 'a', order: 2, duration_min: 45, planning_status: 'required', visit_status: 'visited' }, placeRegistry, emptyAffiliates, now)
  assert.deepStrictEqual(stop1.place, stop2.place)
})

test('I16: actual_price_paid (stop) and entry.price (place) coexist independently', () => {
  const compiled = compileStop(
    {
      place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited',
      experience: { visited_at: '2024-05', actual_price_paid: { amount: 6, currency: 'EUR' } },
    },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(compiled.experience?.actual_price_paid?.amount, 6)
  assert.strictEqual(compiled.place.entry?.price, 10)
  assert.notStrictEqual(compiled.experience?.actual_price_paid?.amount, compiled.place.entry?.price)
})

test('compileDay computes n_stops', () => {
  const day = compileDay(
    { day: 1, title: 'D1', stops: [
      { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      { place_id: 'a', order: 2, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
    ] },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(day.n_stops, 2)
})

test('compileVariant computes n_stops_total and deduplicated all_places', () => {
  const variant = compileVariant(
    {
      id: 'intensivo', name: 'V', description: 'd',
      days: [
        { day: 1, title: 'D1', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
        { day: 2, title: 'D2', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
      ],
    },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(variant.n_stops_total, 2)
  assert.strictEqual(variant.all_places.length, 1)
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/engine/compile-itinerary.test.ts`
Esperado: FALLA — `Cannot find module '../../engine/compile/itinerary.ts'`

- [ ] **Paso 3: Escribir `engine/compile/itinerary.ts`**

```ts
import type { StopSource, DaySource, VariantSource } from '../../schemas/index.ts'
import type { CompiledStop, CompiledDay, CompiledVariant, CompiledPlace, PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { resolvePlace, resolveAffiliate } from './place.ts'

export function compileStop(
  stop: StopSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledStop {
  const place = places.get(stop.place_id)
  if (!place) {
    throw new Error(`place_id inexistente: ${stop.place_id}`)
  }

  const compiled: CompiledStop = {
    place: resolvePlace(place, now),
    order: stop.order,
    duration_min: stop.duration_min,
    planning_status: stop.planning_status,
    visit_status: stop.visit_status ?? 'unknown',
    start_time: stop.start_time,
    travel_to_next_min: stop.travel_to_next_min,
    travel_to_next_mode: stop.travel_to_next_mode,
    variant_note: stop.variant_note,
    experience: stop.experience,
  }

  if (stop.booking) {
    const affiliate = affiliates.get(stop.booking.affiliate_id)
    if (!affiliate) {
      throw new Error(`affiliate_id inexistente: ${stop.booking.affiliate_id}`)
    }
    compiled.booking = {
      affiliate: resolveAffiliate(affiliate),
      advance_notice: stop.booking.advance_notice,
    }
  }

  return compiled
}

export function compileDay(
  day: DaySource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledDay {
  const stops = day.stops.map((stop) => compileStop(stop, places, affiliates, now))
  return {
    day: day.day,
    title: day.title,
    summary: day.summary,
    physical_level: day.physical_level,
    stops,
    n_stops: stops.length,
    food: day.food,
    our_take: day.our_take,
    plan_b: day.plan_b,
    seniors_note: day.seniors_note,
  }
}

function uniquePlaces(places: CompiledPlace[]): CompiledPlace[] {
  const seen = new Map<string, CompiledPlace>()
  for (const place of places) {
    if (!seen.has(place.place_id)) {
      seen.set(place.place_id, place)
    }
  }
  return [...seen.values()]
}

export function compileVariant(
  variant: VariantSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledVariant {
  const days = variant.days.map((day) => compileDay(day, places, affiliates, now))
  const allStopPlaces = days.flatMap((day) => day.stops.map((stop) => stop.place))

  return {
    id: variant.id,
    name: variant.name,
    description: variant.description,
    days,
    n_stops_total: days.reduce((sum, day) => sum + day.n_stops, 0),
    all_places: uniquePlaces(allStopPlaces),
    budget_delta: variant.budget_delta
      ? {
          items: variant.budget_delta.items,
          total: variant.budget_delta.items.reduce((sum, item) => sum + item.amount, 0),
        }
      : undefined,
    pace_notes: variant.pace_notes,
  }
}
```

- [ ] **Paso 4: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/engine/compile-itinerary.test.ts`
Esperado: PASA (6 tests)

- [ ] **Paso 5: Commit**

```bash
git add engine/compile/itinerary.ts tests/engine/compile-itinerary.test.ts
git commit -m "Add stop/day/variant compilation (I1, I5, I16)"
```

---

### Tarea 10: `engine/validate/` — las tres capas de validación

**Ficheros:**
- Crear: `engine/validate/schema.ts`
- Crear: `engine/validate/references.ts`
- Crear: `engine/validate/content-rules.ts`
- Crear: `engine/validate/index.ts`
- Test: `tests/engine/validate.test.ts`

**Interfaces:**
- Consume: `GuideSourceSchema`, `PlaceSourceSchema` (Tareas 2-3), `PlaceRegistry`, `AffiliateRegistry` (Tarea 7).
- Produce: `validateGuideSchema(raw)`, `validatePlaceSchema(raw)` (schema.ts); `validateReferences(guide, places, affiliates): string[]` (references.ts); `validateContentRules(guide): { errors: string[]; warnings: string[] }` (content-rules.ts); `validateGuide(raw, places, affiliates): { errors: string[]; warnings: string[]; guide?: GuideSource }` (index.ts, el orquestador público) — lo consume la Tarea 14 y se re-exporta desde `engine/index.ts` en la Tarea 11.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/engine/validate.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { validateGuide } from '../../engine/validate/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'

const places: PlaceRegistry = { get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01' } : undefined) }
const affiliates: AffiliateRegistry = {
  get: (id) => (id === 'active-one' ? { id: 'active-one', partner: 'X', category: 'tour', description: 'd', active: true, verified_at: '2024-01-01' }
    : id === 'inactive-one' ? { id: 'inactive-one', partner: 'X', category: 'tour', description: 'd', active: false, verified_at: '2024-01-01' }
    : undefined),
}

function guideWithStop(stop: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    summary: { tagline: 'tag' },
    variants: [{ id: 'intensivo', name: 'V', description: 'd', days: [{ day: 1, title: 'D1', stops: [stop] }] }],
    ...overrides,
  }
}

test('I5: missing place_id produces an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'missing', order: 1, duration_min: 30, planning_status: 'required' }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('missing')))
})

test('I6: missing affiliate_id produces an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', booking: { affiliate_id: 'missing-affiliate' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('missing-affiliate')))
})

test('I6: inactive affiliate_id produces an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', booking: { affiliate_id: 'inactive-one' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('inactivo')))
})

test('I6: active affiliate_id produces no error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', booking: { affiliate_id: 'active-one' } }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
})

test('I14: experience{} with visit_status visited is valid', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited', experience: { visited_at: '2024-01' } }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
})

test('I14: experience{} with visit_status not_visited is an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'not_visited', experience: { visited_at: '2024-01' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('experience')))
})

test('I14: experience{} with visit_status unknown is an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'unknown', experience: { visited_at: '2024-01' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('experience')))
})

test('a not_visited stop with first-person variant_note warns, does not error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'not_visited', variant_note: 'Nosotros hicimos esta parte del camino sin prisa.' }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
  assert.ok(result.warnings.length > 0)
})

test('status: draft is an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }, { status: 'draft' }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('draft')))
})

test('schema-invalid input produces an error and no guide', () => {
  const result = validateGuide({ nonsense: true }, places, affiliates)
  assert.ok(result.errors.length > 0)
  assert.strictEqual(result.guide, undefined)
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/engine/validate.test.ts`
Esperado: FALLA — `Cannot find module '../../engine/validate/index.ts'`

- [ ] **Paso 3: Escribir `engine/validate/schema.ts`**

```ts
import { GuideSourceSchema, PlaceSourceSchema } from '../../schemas/index.ts'

export function validateGuideSchema(raw: unknown) {
  return GuideSourceSchema.safeParse(raw)
}

export function validatePlaceSchema(raw: unknown) {
  return PlaceSourceSchema.safeParse(raw)
}
```

- [ ] **Paso 4: Escribir `engine/validate/references.ts`**

```ts
import type { GuideSource } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../types.ts'

export function validateReferences(
  guide: GuideSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
): string[] {
  const errors: string[] = []

  for (const variant of guide.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        if (!places.get(stop.place_id)) {
          errors.push(`[ERROR] place_id inexistente: "${stop.place_id}" (variante ${variant.id}, día ${day.day})`)
        }
        if (stop.booking) {
          const affiliate = affiliates.get(stop.booking.affiliate_id)
          if (!affiliate) {
            errors.push(`[ERROR] affiliate_id inexistente: "${stop.booking.affiliate_id}" (variante ${variant.id}, día ${day.day})`)
          } else if (!affiliate.active) {
            errors.push(`[ERROR] affiliate_id inactivo: "${stop.booking.affiliate_id}" (variante ${variant.id}, día ${day.day})`)
          }
        }
      }
    }
  }

  for (const item of guide.booking_checklist ?? []) {
    if (item.affiliate_id) {
      const affiliate = affiliates.get(item.affiliate_id)
      if (!affiliate) {
        errors.push(`[ERROR] affiliate_id inexistente en booking_checklist: "${item.affiliate_id}"`)
      } else if (!affiliate.active) {
        errors.push(`[ERROR] affiliate_id inactivo en booking_checklist: "${item.affiliate_id}"`)
      }
    }
  }

  return errors
}
```

- [ ] **Paso 5: Escribir `engine/validate/content-rules.ts`**

```ts
import type { GuideSource } from '../../schemas/index.ts'

export interface ContentRuleResult {
  errors: string[]
  warnings: string[]
}

const FIRST_PERSON = /\b(nosotros|nuestro|nuestra|hicimos|vimos)\b/i

export function validateContentRules(guide: GuideSource): ContentRuleResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (guide.status === 'draft') {
    errors.push('[ERROR] status: draft no puede compilarse en build de producción')
  }

  for (const variant of guide.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        const visitStatus = stop.visit_status ?? 'unknown'

        if (stop.experience && visitStatus !== 'visited') {
          errors.push(
            `[ERROR] experience{} en parada con visit_status: ${visitStatus} (variante ${variant.id}, día ${day.day}, place_id ${stop.place_id})`,
          )
        }

        if (stop.variant_note && FIRST_PERSON.test(stop.variant_note) && visitStatus !== 'visited') {
          warnings.push(
            `[WARNING] primera persona en variant_note sin visit_status: visited (día ${day.day}, place_id ${stop.place_id})`,
          )
        }
      }
    }
  }

  if (guide.content_type === 'experience' && !guide.trip_done) {
    warnings.push('[WARNING] content_type: experience sin trip_done')
  }

  return { errors, warnings }
}
```

- [ ] **Paso 6: Escribir `engine/validate/index.ts`**

```ts
import type { GuideSource } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { validateGuideSchema } from './schema.ts'
import { validateReferences } from './references.ts'
import { validateContentRules } from './content-rules.ts'

export interface ValidationResult {
  errors: string[]
  warnings: string[]
  guide?: GuideSource
}

export function validateGuide(
  raw: unknown,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
): ValidationResult {
  const schemaResult = validateGuideSchema(raw)
  if (!schemaResult.success) {
    return {
      errors: schemaResult.error.issues.map(
        (issue) => `[ERROR] esquema inválido en ${issue.path.join('.')}: ${issue.message}`,
      ),
      warnings: [],
    }
  }

  const guide = schemaResult.data
  const referenceErrors = validateReferences(guide, places, affiliates)
  const contentRules = validateContentRules(guide)

  return {
    errors: [...referenceErrors, ...contentRules.errors],
    warnings: contentRules.warnings,
    guide,
  }
}
```

- [ ] **Paso 7: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/engine/validate.test.ts`
Esperado: PASA (10 tests)

- [ ] **Paso 8: Commit**

```bash
git add engine/validate tests/engine/validate.test.ts
git commit -m "Add the three validation layers: schema, references, content rules"
```

---

### Tarea 11: `engine/compile/guide.ts` y el barrel público `engine/index.ts`

**Ficheros:**
- Crear: `engine/compile/guide.ts`
- Crear: `engine/compile/index.ts`
- Crear: `engine/index.ts`
- Test: `tests/engine/compile-guide.test.ts`

**Interfaces:**
- Consume: `compileVariant` (Tarea 9), `compileBudget` (Tarea 8), `GuideSource` (Tarea 3).
- Produce: `compileGuide(source, places, affiliates, now?): CompiledGuide` — el orquestador de más alto nivel. `engine/index.ts` re-exporta la API pública completa según `docs/1.7.1_repository_domain.md` §9, la consumen todas las tareas posteriores y `scripts/validate-content.ts` (Tarea 14).

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/engine/compile-guide.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { compileGuide } from '../../engine/compile/guide.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'
import type { GuideSource } from '../../schemas/index.ts'

const places: PlaceRegistry = {
  get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01' } : undefined),
}
const emptyAffiliates: AffiliateRegistry = { get: () => undefined }
const now = new Date('2024-06-01')

function minimalSource(overrides: Partial<GuideSource> = {}): GuideSource {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    base_travelers: 2,
    summary: { tagline: 'tag' },
    variants: [{
      id: 'intensivo', name: 'V', description: 'd',
      days: [
        { day: 1, title: 'D1', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
        { day: 2, title: 'D2', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
      ],
    }],
    ...overrides,
  }
}

test('places is the deduplicated union of every stop place across all variants', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.strictEqual(compiled.places.length, 1)
})

test('has_experience is true when content_type is experience and trip_done is set', () => {
  const compiled = compileGuide(minimalSource({ trip_done: '2024' }), places, emptyAffiliates, now)
  assert.strictEqual(compiled.has_experience, true)
})

test('has_experience is false when trip_done is missing', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.strictEqual(compiled.has_experience, false)
})

test('compiled_at is set to the given now as an ISO string', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.strictEqual(compiled.compiled_at, now.toISOString())
})

test('summary.budget_per_person is derived from budget.total_reference / base_travelers', () => {
  const source = minimalSource({
    budget: {
      currency: 'EUR', includes: [], excludes: [],
      items: [{ category: 'vuelos', label: 'a', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' }],
    },
  })
  const compiled = compileGuide(source, places, emptyAffiliates, now)
  assert.strictEqual(compiled.summary.budget_per_person, 100) // 200 total_reference / 2 travelers
})

test('a guide with only days 1 and 2 (no days 3-13) is a valid, partial CompiledGuide', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.deepStrictEqual(compiled.variants?.[0].days.map((d) => d.day), [1, 2])
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que falla**

Ejecutar: `node --test tests/engine/compile-guide.test.ts`
Esperado: FALLA — `Cannot find module '../../engine/compile/guide.ts'`

- [ ] **Paso 3: Escribir `engine/compile/guide.ts`**

```ts
import type { GuideSource } from '../../schemas/index.ts'
import type { CompiledGuide, CompiledPlace, PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { compileVariant } from './itinerary.ts'
import { compileBudget } from './budget.ts'

function uniquePlaces(places: CompiledPlace[]): CompiledPlace[] {
  const seen = new Map<string, CompiledPlace>()
  for (const place of places) {
    if (!seen.has(place.place_id)) {
      seen.set(place.place_id, place)
    }
  }
  return [...seen.values()]
}

export function compileGuide(
  source: GuideSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledGuide {
  const variants = source.variants?.map((variant) => compileVariant(variant, places, affiliates, now))
  const budget = source.budget ? compileBudget(source.budget, source.base_travelers ?? 1) : undefined
  const allPlaces = uniquePlaces((variants ?? []).flatMap((variant) => variant.all_places))

  return {
    slug: source.slug,
    destination: source.destination,
    hub: source.hub,
    type: source.type,
    content_type: source.content_type,
    status: source.status,
    trip_done: source.trip_done,
    title: source.title,
    description: source.description,
    updated_at: source.updated_at,
    cover_image: source.cover_image,
    gallery: source.gallery,
    days: source.days,
    base_travelers: source.base_travelers,
    our_criteria: source.our_criteria,
    pitfalls: source.pitfalls,
    terrain_tips: source.terrain_tips,
    practical: source.practical,
    adaptation_notes: source.adaptation_notes,
    faq: source.faq,
    related: source.related,

    summary: {
      ...source.summary,
      budget_per_person:
        budget && source.base_travelers ? budget.total_reference / source.base_travelers : undefined,
    },
    variants,
    budget,
    accommodation: source.accommodation,
    transport: source.transport,
    booking_checklist: source.booking_checklist,

    places: allPlaces,
    has_experience: source.content_type === 'experience' && source.trip_done != null,
    compiled_at: now.toISOString(),
  }
}
```

- [ ] **Paso 4: Escribir `engine/compile/index.ts`**

```ts
export { compileGuide } from './guide.ts'
```

- [ ] **Paso 5: Escribir `engine/index.ts`**

```ts
export { loadGuide, loadPlaces } from './load/index.ts'
export { validateGuide } from './validate/index.ts'
export { validatePlaceSchema } from './validate/schema.ts'
export { compileGuide } from './compile/index.ts'
export type { GuideSource, CompiledGuide, PlaceRegistry, AffiliateRegistry, AffiliateRegistryEntry } from './types.ts'
```

Nota: `validatePlaceSchema` se exporta aquí (además de `validateGuide`) porque `scripts/validate-content.ts` (Tarea 14) necesita validar cada lugar del registro antes de construirlo, y según la regla de límites de módulos, ese script — un consumidor externo de `engine` — debe importar solo desde este barrel, nunca directamente de `engine/validate/schema.ts`.

- [ ] **Paso 6: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/engine/compile-guide.test.ts`
Esperado: PASA (6 tests)

- [ ] **Paso 7: Commit**

```bash
git add engine/compile/guide.ts engine/compile/index.ts engine/index.ts tests/engine/compile-guide.test.ts
git commit -m "Add compileGuide orchestrator and the public engine barrel"
```

---

### Tarea 12: `tests/validation/invariants.test.ts` — la suite de invariantes con nombre

**Ficheros:**
- Crear: `tests/validation/invariants.test.ts`

**Interfaces:**
- Consume: `validateGuide`, `compileGuide` (desde `engine`, es decir, el barrel de la Tarea 11 — según la regla de límites de módulos, este test importa solo desde `../../engine` y `../../schemas`, nunca desde rutas internas como `engine/compile/guide`).
- Produce: nada que consuman otras tareas — es el entregable explícito y nombrado que pedía la tarea original: un fichero que documenta y demuestra I1, I5, I6, I14, I15, I16 contra la API pública real.

- [ ] **Paso 1: Escribir el fichero de test (esta tarea ES el test — no hay un paso de implementación aparte, porque los seis invariantes ya están implementados por las Tareas 7-11; esto es la suite de aceptación)**

Crear `tests/validation/invariants.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { validateGuide, compileGuide } from '../../engine/index.ts'
import { PlaceSourceSchema } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry, GuideSource } from '../../engine/index.ts'

const places: PlaceRegistry = {
  get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', entry: { price: 10, currency: 'EUR', verified_at: '2024-01-01' } } : undefined),
}
const emptyAffiliates: AffiliateRegistry = { get: () => undefined }
const now = new Date('2024-06-01')

function guideWithStop(stop: Record<string, unknown>): GuideSource {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    summary: { tagline: 'tag' },
    variants: [{ id: 'intensivo', name: 'V', description: 'd', days: [{ day: 1, title: 'D1', stops: [stop] as never } as never] }],
  } as GuideSource
}

test('I1 — un LUGAR existe una sola vez globalmente: el mismo place_id en dos paradas resuelve al mismo lugar', () => {
  const compiled = compileGuide(
    guideWithStop({}), // placeholder replaced below
    places, emptyAffiliates, now,
  )
  const source: GuideSource = {
    ...guideWithStop({}),
    variants: [{
      id: 'intensivo', name: 'V', description: 'd',
      days: [{
        day: 1, title: 'D1',
        stops: [
          { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
          { place_id: 'a', order: 2, duration_min: 45, planning_status: 'required', visit_status: 'visited' },
        ],
      }],
    }],
  }
  const result = compileGuide(source, places, emptyAffiliates, now)
  const [stop1, stop2] = result.variants![0].days[0].stops
  assert.deepStrictEqual(stop1.place, stop2.place)
  void compiled
})

test('I5 — place_id inexistente impide compilar (ERROR, no advertencia)', () => {
  const source = guideWithStop({ place_id: 'no-existe', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.some((e) => e.includes('no-existe')))
})

test('I6 — affiliate_id inexistente impide compilar (ERROR, no advertencia)', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited',
    booking: { affiliate_id: 'no-existe' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.some((e) => e.includes('no-existe')))
})

test('I14 — experience{} con visit_status: visited es válido', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required',
    visit_status: 'visited', experience: { visited_at: '2024-05' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.strictEqual(result.errors.length, 0)
})

test('I14 — experience{} con visit_status: not_visited es ERROR', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required',
    visit_status: 'not_visited', experience: { visited_at: '2024-05' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.length > 0)
})

test('I14 — experience{} con visit_status: unknown es ERROR', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required',
    visit_status: 'unknown', experience: { visited_at: '2024-05' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.length > 0)
})

test('I15 — el estado de visita pertenece a PARADA, nunca a LUGAR', () => {
  const parsed = PlaceSourceSchema.parse({
    place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1,
    type: 'other', verified_at: '2024-01-01',
    visit_status: 'visited', // not a real field on PlaceSource — Zod strips unknown keys
  } as never)
  assert.strictEqual('visit_status' in parsed, false)
})

test('I16 — actual_price_paid (PARADA) y entry.price (LUGAR) coexisten sin sobrescribirse', () => {
  const source: GuideSource = {
    ...guideWithStop({}),
    variants: [{
      id: 'intensivo', name: 'V', description: 'd',
      days: [{
        day: 1, title: 'D1',
        stops: [{
          place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited',
          experience: { visited_at: '2024-05', actual_price_paid: { amount: 6, currency: 'EUR' } },
        }],
      }],
    }],
  }
  const compiled = compileGuide(source, places, emptyAffiliates, now)
  const stop = compiled.variants![0].days[0].stops[0]
  assert.strictEqual(stop.experience?.actual_price_paid?.amount, 6)
  assert.strictEqual(stop.place.entry?.price, 10)
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/validation/invariants.test.ts`
Esperado: PASA (8 tests). Si alguno falla, el bug está en la implementación de las Tareas 7-11, no en este test — corrige el código del motor, no la aserción.

- [ ] **Paso 3: Commit**

```bash
git add tests/validation/invariants.test.ts
git commit -m "Add the named invariant regression suite: I1, I5, I6, I14, I15, I16"
```

---

### Tarea 13: `tests/compiler/compile.test.ts` — la regresión real de extremo a extremo

**Ficheros:**
- Crear: `tests/compiler/compile.test.ts`

**Interfaces:**
- Consume: `loadGuide`, `loadPlaces`, `validateGuide`, `compileGuide` (desde `engine`), los ficheros reales `content/places/islandia.yaml` y `content/guides/islandia/islandia-en-camper-13-dias.yaml` (Tareas 5-6) — según `docs/1.7.1_repository_domain.md` §6, se usan los datos reales del viaje directamente, sin copia artificial en `tests/fixtures/`.
- Produce: nada que consuman otras tareas — es el test de aceptación que corresponde al criterio de cierre en `docs/1.7.1_repository_domain.md` §18.

- [ ] **Paso 1: Escribir el test**

Crear `tests/compiler/compile.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert'
import { loadGuide, loadPlaces, validateGuide, compileGuide } from '../../engine/index.ts'
import { PlaceSourceSchema } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/index.ts'
import type { PlaceSource } from '../../schemas/index.ts'

const GUIDE_PATH = new URL('../../content/guides/islandia/islandia-en-camper-13-dias.yaml', import.meta.url).pathname
const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

async function buildPlaceRegistry(): Promise<PlaceRegistry> {
  const raw = await loadPlaces(PLACES_PATH) as unknown[]
  const map = new Map<string, PlaceSource>()
  for (const entry of raw) {
    map.set(PlaceSourceSchema.parse(entry).place_id, PlaceSourceSchema.parse(entry))
  }
  return { get: (id) => map.get(id) }
}

const emptyAffiliates: AffiliateRegistry = { get: () => undefined }

test('the real Islandia guide loads, validates with zero errors, and compiles', async () => {
  const places = await buildPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)

  const result = validateGuide(rawGuide, places, emptyAffiliates)
  assert.deepStrictEqual(result.errors, [])
  assert.ok(result.guide)

  const compiled = compileGuide(result.guide!, places, emptyAffiliates)
  assert.strictEqual(compiled.slug, 'islandia-en-camper-13-dias')
})

test('the compiled guide keeps exactly the 6 authored days, not all 13', async () => {
  const places = await buildPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  const days = compiled.variants![0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 9, 10, 11, 12])
})

test('places is the deduplicated union of all 26 real places', async () => {
  const places = await buildPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.places.length, 26)
})

test('budget compiles with the real 2024 figures: total_base equals the sum of per-person amounts', async () => {
  const places = await buildPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.ok(compiled.budget)
  assert.ok(Math.abs(compiled.budget!.total_base - 2247.62) < 0.01)
  assert.strictEqual(compiled.budget!.type, 'real')
})

test('has_experience is true for this real, lived guide', async () => {
  const places = await buildPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.has_experience, true)
})
```

- [ ] **Paso 2: Ejecutar el test y comprobar que pasa**

Ejecutar: `node --test tests/compiler/compile.test.ts`
Esperado: PASA (5 tests). Si `total_base` no coincide con `2247.62`, revisa las cantidades transcritas en el YAML de la Tarea 6 contra la tabla de presupuesto de `docs/1.6.4_json_islandia.md` (sección "Presupuesto real del viaje").

- [ ] **Paso 3: Commit**

```bash
git add tests/compiler/compile.test.ts
git commit -m "Add the real Islandia end-to-end compile regression test"
```

---

### Tarea 14: `scripts/validate-content.ts` y `npm run content:validate`

**Ficheros:**
- Crear: `scripts/validate-content.ts`
- Modificar: `package.json`

**Interfaces:**
- Consume: `loadGuide`, `loadPlaces`, `validateGuide`, `compileGuide` (desde `engine`), `validatePlaceSchema` (desde el mismo barrel `engine/index.ts`, tal como lo dejó la Tarea 11).
- Produce: una CLI que termina con exit 0 si no hay errores, y exit 1 si hay al menos uno, según `docs/1.7.1_repository_domain.md` §15 y el formato exacto de salida por consola del §18.

- [ ] **Paso 1: Escribir `scripts/validate-content.ts`**

```ts
import { loadGuide, loadPlaces, validateGuide, compileGuide, validatePlaceSchema } from '../engine/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../engine/index.ts'
import type { PlaceSource } from '../schemas/index.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const PLACES_PATH = 'content/places/islandia.yaml'

function buildPlaceRegistry(rawPlaces: unknown[]): { registry: PlaceRegistry; errors: string[] } {
  const errors: string[] = []
  const map = new Map<string, PlaceSource>()

  for (const raw of rawPlaces) {
    const result = validatePlaceSchema(raw)
    if (!result.success) {
      errors.push(`[ERROR] esquema de lugar inválido: ${result.error.issues.map((i) => i.message).join(', ')}`)
      continue
    }
    map.set(result.data.place_id, result.data)
  }

  return { registry: { get: (id) => map.get(id) }, errors }
}

function buildEmptyAffiliateRegistry(): AffiliateRegistry {
  return { get: () => undefined }
}

async function main() {
  console.log('Validando contenido...\n')

  const rawPlaces = (await loadPlaces(PLACES_PATH)) as unknown[]
  const rawGuide = await loadGuide(GUIDE_PATH)

  console.log('✔ Guides loaded: 1')
  console.log(`✔ Places loaded: ${rawPlaces.length}`)

  const { registry: places, errors: placeErrors } = buildPlaceRegistry(rawPlaces)
  const affiliates = buildEmptyAffiliateRegistry()

  if (placeErrors.length > 0) {
    console.error('\n✘ Errores en el esquema de lugares:')
    for (const error of placeErrors) console.error(`  ${error}`)
    process.exitCode = 1
    return
  }

  const result = validateGuide(rawGuide, places, affiliates)

  if (result.errors.length > 0) {
    console.error('\n✘ Errores de validación:')
    for (const error of result.errors) console.error(`  ${error}`)
    process.exitCode = 1
    return
  }
  console.log('✔ Schema valid')
  console.log('✔ References valid')
  console.log('✔ Content rules valid')

  if (result.warnings.length > 0) {
    console.warn('\n⚠ Avisos:')
    for (const warning of result.warnings) console.warn(`  ${warning}`)
  }

  try {
    const compiled = compileGuide(result.guide!, places, affiliates)
    console.log('✔ Compilation successful')
    console.log(
      `\nContent validation passed. (${compiled.places.length} lugares únicos, ${compiled.variants?.[0]?.n_stops_total ?? 0} paradas)`,
    )
  } catch (error) {
    console.error('\n✘ Error de compilación:', (error as Error).message)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('Error inesperado:', error)
  process.exitCode = 1
})
```

- [ ] **Paso 2: Añadir el script de npm**

En `package.json`, añadir bajo `"scripts"`:

```json
"content:validate": "node scripts/validate-content.ts"
```

- [ ] **Paso 3: Ejecutarlo y comprobar el exit code 0**

```bash
npm run content:validate; echo "exit: $?"
```

Salida esperada, terminando con `Content validation passed. (26 lugares únicos, 21 paradas)` y `exit: 0`.

- [ ] **Paso 4: Comprobar que falla correctamente con contenido malo (prueba manual, luego revertir)**

```bash
cp content/places/islandia.yaml /tmp/islandia-backup.yaml
sed -i '' 's/place_id: thingvellir/place_id: thingvellir-broken/' content/places/islandia.yaml
npm run content:validate; echo "exit: $?"
```

Esperado: exit code 1, con un error de `place_id inexistente` mencionando `thingvellir`.

```bash
cp /tmp/islandia-backup.yaml content/places/islandia.yaml
rm /tmp/islandia-backup.yaml
npm run content:validate; echo "exit: $?"
```

Esperado: vuelve a exit 0.

- [ ] **Paso 5: Commit**

```bash
git add scripts/validate-content.ts package.json
git commit -m "Add scripts/validate-content.ts and npm run content:validate"
```

---

### Tarea 15: Verificación final

**Ficheros:** ninguno (solo verificación)

- [ ] **Paso 1: Ejecutar la suite de tests completa**

```bash
node --test
```

Ejecutar sin argumentos desde la raíz del proyecto — el test runner de Node descubre automáticamente y de forma recursiva cada fichero `*.test.ts` bajo el directorio de trabajo (verificado: pasar una ruta de directorio como `tests/` explícitamente NO funciona y da error `MODULE_NOT_FOUND`; omitir el argumento sí funciona).

Esperado: todos los tests de todos los ficheros pasan (schemas, engine/load, engine/compile-*, engine/validate, content/places, content/guide, validation/invariants, compiler/compile).

- [ ] **Paso 2: Ejecutar el validador de contenido**

```bash
npm run content:validate; echo "exit: $?"
```

Esperado: `exit: 0`, terminando en `Content validation passed.`

- [ ] **Paso 3: Comprobar que `src/` y la guía de Alsacia siguen completamente intactos**

```bash
git status --short src/ astro.config.mjs
```

Esperado: sin salida (limpio).

- [ ] **Paso 4: Comprobar que el build de Astro existente sigue funcionando**

```bash
npm run build
```

Esperado: éxito exactamente igual que antes (el motor de dominio todavía no está conectado a Astro — esto solo comprueba que nada se ha roto).

- [ ] **Paso 5: Commit final si queda algo pendiente**

```bash
git status --short
```

Si está limpio, no hay nada que hacer. Si no, añade y commitea lo que falte con un mensaje que describa qué es.
