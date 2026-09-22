# Decisiones que modifican el brief

Fecha: 2026-09-22 · Acordado tras la revisión crítica de `BRIEF.md`.

`BRIEF.md` se conserva íntegro como documento original. **Donde este fichero
contradiga al brief, manda este fichero.**

---

## D1 — Orden de fases invertido: publicar antes de automatizar

**Brief:** F1 web → F2 motor → F3 infra → F4 captación → F4b redes → F5 contenido.

**Ahora:**

```
F1   Web base MÍNIMA — sin PDF, sin selector de grupo, sin mapa.
     Esquema Zod + layout + SEO + legales + /ir/.
F5'  2 guías de Mallorca publicadas, escritas a mano.
     → PUNTO DE MEDIDA: ¿hay tráfico? ¿hay altas de email?
F1b  Mapa, selector de grupo, PDF estático en CI.
F4   Captación con personalización determinista (sin motor).
F4b' Solo Pinterest + carruseles estáticos.
F2   Motor como estructurador, con 5+ guías ya escritas a mano.
F3   Infraestructura, solo si F2 la necesita.
```

**Motivo:** el riesgo del proyecto no es técnico, es de demanda. El orden del
brief construye motor, infra y pipeline social antes de saber si alguien quiere
las guías. Con ~6 h/semana eso son meses antes de la primera señal.

---

## D2 — El motor estructura, no redacta

**Brief §9:** `POST /draft-guide` genera un borrador de guía desde reels.

**Ahora:** `/draft-guide` es un **estructurador**. El autor aporta las paradas y
las notas; el motor rellena coordenadas, tiempos, orden y campos del esquema.
No redacta el itinerario.

**Motivo:** un LLM redactando desde transcripciones produce exactamente el
contenido genérico que §12 prohíbe, y choca con la diferenciación nº 1
(experiencia real y verificable). Corregir alucinaciones plausibles sobre 40
paradas cuesta más que escribir desde notas propias.

**Sigue aportando valor el motor en:** extracción de paradas candidatas desde
reels (ya lo hace Reel2Trip), geocoding, estructuración al esquema, PDF y
piezas sociales.

---

## D3 — Personalización determinista, sin LLM

**Brief §8:** `/personalize` ajusta el itinerario con el motor.

**Ahora:** la personalización es una transformación de datos: filtrar y
reordenar paradas por `pace` y `physical_level`, recortar días, inyectar el
bloque `group_adjustments` del grupo elegido. El esquema §5 ya contiene todo lo
necesario. Sin LLM en el camino.

**Motivo:** el PDF personalizado llega al buzón del lead sin revisión humana. Un
museo cerrado los lunes o 12 km a pie para "familia con mayores" es un fallo
justo en el segmento donde el proyecto dice diferenciarse. Determinista es
instantáneo, gratis, testeable y no alucina.

---

## D4 — Playwright fuera del camino caliente

**Brief:** PDF generado bajo demanda con Playwright en el VPS.

**Ahora:** el PDF de la guía base es **estático** (no cambia por visitante). Se
genera en CI / build de Cloudflare Pages y se sirve como fichero.

**Motivo:** Chromium consume ~300-500 MB por render. VPS de 7 € + finanzas +
n8n + FastAPI + Playwright no cabe, y el plan B (segundo VPS) rompe la
restricción de coste mínimo.

---

## D5 — n8n fuera del VPS de finanzas (a decidir en F3)

**Brief §10:** n8n y motor en el VPS existente, en redes Docker separadas.

**Ahora:** planteamiento por defecto es **no** poner n8n público en la máquina
que aloja los datos bancarios. Opciones: VPS dedicado de 4-5 €/mes o el plan
gratuito de n8n cloud.

**Motivo:** n8n ejecuta código arbitrario (nodos Function), almacena las
credenciales de todo y queda expuesto por webhooks. Redes Docker separadas no
protegen si n8n cae y comparte host con finanzas.

**Si finalmente va en el mismo VPS, mínimos no negociables:** usuario no-root,
`no-new-privileges`, **el socket de Docker nunca montado en n8n**, webhooks tras
Caddy con firma y rate limit.

---

## D6 — Plan editorial: Mallorca primero

**Brief §3:** 1) Roma-Florencia-Pisa, 2) Islandia camper, 3) Mallorca camper,
4) satélites de Mallorca.

**Ahora:** 1) Mallorca (camper + satélites), 2) Islandia camper 13 días,
3) Roma-Florencia-Pisa más adelante.

**Motivo:** "Roma 7 días" es de las keywords más competidas en viajes en
español; un dominio nuevo no rankea ahí en 12-18 meses. Mallorca es long tail,
con autoridad genuina (8 años viviendo allí), fotos ya existentes y competencia
desactualizada. Es donde se puede ganar en 3-6 meses.

---

## D7 — Redes: Pinterest y carruseles, sin vídeo

**Brief §10b:** catálogo F1-F6 incluyendo reels animados con Remotion/ffmpeg.

**Ahora:** F4b' se reduce a **F5 (pines) + F1 (carruseles estáticos)**. Remotion
fuera del alcance.

**Motivo:** para viajes en español Pinterest da más tráfico web que IG/TikTok y
no requiere cámara ni edición — encaja con la restricción "nada que requiera
grabar o editar vídeo". El reel animado es el formato más caro de construir y el
peor alineado con esa restricción.

**Cadencia del brief revisada a la baja:** ~30 piezas/semana con "1 h/semana de
revisión" no es realista.

---

## D8 — Nueva fase: mantenimiento del dato

No existe en el brief. 30 guías con precios, horarios y normas son 30 activos
que caducan. Sin un proceso de re-verificación, a los 18 meses "verificable"
pasa de diferenciador a pasivo.

**Alcance:** aviso automático de `verified_at` caducados, re-comprobación de
precios, badge visible en la página.

---

## D9 — Cambios en el esquema (§5)

Resolver antes de escribir el Zod:

| Campo | Cambio | Motivo |
|---|---|---|
| `days: int \| [int]` | Añadir `variants: { "3": [dayIds], "4": [...] }` | El brief no dice qué días se caen en la versión corta |
| `lang` | Añadir | Cuesta cero ahora; migrar a i18n después es caro |
| `affiliate_id` | Referenciar por `partner` + tipo, resolver en el registro | Acopla contenido a monetización: cambiar de partner obligaría a editar N guías |
| coste por parada | Añadir | `budget_breakdown` global no es derivable ni auditable |
| `source` por dato sensible | Añadir | Sin procedencia, re-verificar a los 12 meses es rehacer la investigación |
| `verified_at` caducado | Warning en build + **badge visible en la página** | El brief se contradice: §5 dice aviso, F1 dice que el build falla |

---

## D10 — Fuente de verdad del esquema, de momento en la web

**Brief §5:** Pydantic en el motor → JSON Schema → Zod.

**Ahora:** el esquema se escribe como **Zod en Astro**, siguiendo §5 con los
cambios de D9. Cuando llegue F2, el Pydantic se deriva de él.

**Motivo:** D1 mueve el motor al final. El contrato se define ya y el motor se
adapta.

---

## D11 — Legal desde el día 1

El aviso de afiliación y la política de privacidad entran en F1, no en F4.
Tienen que existir el primer día que haya tráfico.
