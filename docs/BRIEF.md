# BRIEF — Solo Haz la Maleta

> Documento de contexto para Claude Code. Léelo entero antes de escribir código.
> Autor del proyecto: David (desarrollador: Vue, Node/Express, Python, n8n).
> Idioma del producto: español. Idioma del código y commits: inglés.

---

## 1. Qué es el proyecto

**Solo Haz la Maleta** es una web de viajes con marca personal (sin cara al principio) cuya promesa es:

> **"Yo planifico el viaje. Tú solo haz la maleta."**

Ofrece **guías de viaje ya planificadas** (itinerario día a día, mapa, presupuesto real, qué reservar y cuándo) basadas en viajes reales del autor, **adaptadas al tipo de grupo** (pareja, amigos, familia con personas mayores). Más adelante añade un **canal de ofertas de vuelos desde el sur de España** (Sevilla, Málaga, Jerez) y Madrid para largo recorrido, donde cada oferta enlaza a la guía del destino ya montada.

### Restricciones que mandan sobre todo lo demás
- **Tiempo del autor: ~6 h/semana de media.** Todo lo que se pueda automatizar, se automatiza. Nada que requiera grabar o editar vídeo.
- **Coste mínimo.** Infraestructura: el VPS que ya existe (~7 €/mes) + servicios en plan gratuito. Solo pago por uso de APIs.
- **Calidad y experiencia real por encima de volumen.** 30 guías buenas > 300 genéricas. Google penaliza el contenido masivo de relleno.

### Diferenciación (no perderla nunca de vista)
1. Experiencia real y verificable (viajes hechos, 8 años viviendo en Mallorca).
2. Itinerarios accionables (mapa, ruta, PDF, Google Maps, checklist de reservas), no artículos largos.
3. Adaptación por tipo de grupo (sobre todo "con personas mayores", casi nadie lo hace bien).
4. Motor propio (Reel2Trips) que genera borradores y personaliza itinerarios.

---

## 2. Arquitectura general

Dos piezas separadas, unidas por **un único esquema de guía**:

```
┌──────────────────────────────┐        ┌──────────────────────────────────┐
│  WEB PÚBLICA (repo nuevo)    │        │  MOTOR (repo reel2trip, refactor) │
│  Astro + islas Vue           │        │  FastAPI, Python 3.11             │
│  Estática → Cloudflare Pages │        │  Docker en el VPS                 │
│  Guías = ficheros de datos   │◀──────▶│  Genera borradores, personaliza,  │
│  validados por el esquema    │ esquema│  genera PDF                       │
└──────────────┬───────────────┘        └───────────────▲──────────────────┘
               │ formulario "Adapta este viaje"          │
               ▼                                         │
        ┌─────────────────────────────┐                  │
        │  n8n (Docker en el VPS)     │──────────────────┘
        │  webhooks, emails, ofertas  │──▶ MailerLite/Brevo (email + newsletter)
        └─────────────────────────────┘──▶ Telegram (ofertas, fase posterior)
```

### Decisiones cerradas
| Tema | Decisión | Motivo |
|---|---|---|
| Web | **Astro** + componentes **Vue** solo donde haya interactividad (mapa, selector de grupo, formulario) | Web de contenido: HTML estático, mínimo JS, Content Collections con esquema |
| Hosting web | **Cloudflare Pages** (plan gratuito) | Sin cold start, CDN, gratis |
| Motor | Reutilizar **módulos limpios** de Reel2Trip; **no** reutilizar `main.py` ni `templates/result.html` | Son la parte difícil de mantener |
| Hosting motor + n8n | **VPS existente**, Docker Compose, junto al proyecto de finanzas (aislado) | Coste cero adicional, sin cold start |
| Base de datos | Supabase (plan gratuito, ya en uso) | Ya integrado |
| Email | **MailerLite o Brevo** (plan gratuito), integrado vía n8n | Gratis para empezar |
| Transcripción | **Groq (Whisper grande)** en lugar de faster-whisper `tiny` local | Precisión con nombres de lugares en español; el VPS no puede con Whisper local |
| LLM | `claude-sonnet-5` para generación de guías; `claude-haiku-4-5` para tareas ligeras | Actualizar `planner.py:548` de entrada |
| Analítica | Umami o Plausible (sin cookies) + Google Search Console | Sin banner de cookies, ligero |
| PDF | Playwright imprimiendo una ruta `/print/` de la propia guía | Diseño idéntico a la web desde el mismo dato |

---

## 3. Marca, público y contenido

- **Marca:** Solo Haz la Maleta. Dominio previsto: `solohazlamaleta.com` (+ `.es`). Usuario en redes: `@solohazlamaleta`. Hashtag propio: `#solohazlamaleta`.
- **Voz:** primera persona, cercana, práctica ("lo hicimos así", "lo que haríamos distinto"). Sin cara, pero con presencia real (fotos propias, anécdotas, datos de gasto reales).
- **Público:** viajeros hispanohablantes que quieren el viaje resuelto. Para ofertas: quien sale del sur de España.
- **Aeropuertos de referencia:** SVQ (Sevilla), AGP (Málaga), XRY (Jerez) para Europa; MAD (Madrid) para largo recorrido, con "cómo llegar desde el sur".

### Plan editorial — fase 1 (lanzamiento)
Priorizado por análisis de competencia en Google (pendiente confirmar volúmenes con Keyword Planner):

1. **Roma, Florencia y Pisa por libre en 7 días** — mucha demanda; en Google dominan paquetes de agencias, pocas guías independientes.
2. **Islandia en camper 2 semanas (13 días)** — casi todo lo existente es de 10 días; alto valor por visita (alquiler de camper, tours).
3. **Mallorca en camper: ruta y dónde dormir legalmente** — competencia desactualizada e información contradictoria sobre pernocta.
4. **Mallorca local, búsquedas concretas** (3-4 artículos satélite): calas sin gente en agosto, calas sin coche, qué hacer en invierno/si llueve, excursiones en barco por zona. + página "Mallorca en 5 días" como hub.

### Fases editoriales posteriores
- **Fase 2 (largo recorrido):** Tailandia 17 días, Egipto 1 semana, Budapest + Praga (publicar antes del viaje de primavera 2027, actualizar después como "probado").
- **Fase 3 (escapadas):** París, Londres, Bélgica, Algarve, Alsacia, Ámsterdam, Macedonia del Norte. Con enfoques concretos, no guías genéricas.

### Reglas de contenido
- Los reels/TikToks son **fuente interna de investigación**. Nunca se publican, copian ni incrustan en la web.
- Cada dato sensible (precio, horario, norma, acceso) lleva **fecha de verificación**.
- Nada de texto IA sin revisar. El motor genera borradores; el autor revisa y añade la parte personal.
- Fotos propias siempre que sea posible.

---

## 4. Estructura de URLs

```
/                                   Home
/{destino}/                         Página hub de destino (país, región o isla)
/{destino}/{slug-guia}/             Guía de itinerario
/{destino}/{slug-articulo}/         Artículo satélite
/print/{destino}/{slug}/            Versión imprimible (noindex) → PDF
/ir/{id}                            Redirección de afiliado (noindex, nofollow)
/ofertas/{slug}/                    Oferta temporal (noindex) — fase posterior
/sobre-mi/  /aviso-legal/  /privacidad/  /afiliacion/
```

Ejemplos: `/italia/roma-florencia-pisa-7-dias/`, `/islandia/camper-2-semanas/`, `/mallorca/calas-sin-gente/`.

Reglas: slugs en español sin acentos; **nunca** páginas separadas para variantes de días de la misma ciudad (una sola "Roma en 3, 4 o 5 días"); las rutas combinadas sí son páginas propias.

---

## 5. Esquema de guía (el contrato)

**Fuente de verdad:** modelo Pydantic en el motor → exportado a JSON Schema → usado para generar el esquema de Content Collections de Astro (p. ej. `json-schema-to-zod`). Si una guía no cumple el esquema, **la web no compila**.

Campos mínimos (ajustar nombres al implementar, mantener la estructura):

```yaml
meta:
  slug, destination, title, description (SEO), type: itinerary|satellite|hub
  days: int | [int]            # p.ej. [3,4,5] para variantes en una misma página
  trip_done: "2024-05"         # cuándo lo hizo el autor (null si no aplica)
  updated_at, cover_image, gallery[]
summary:
  for_who, budget_per_person {min, max, currency}, best_season,
  getting_around, base_area, pace: relaxed|medium|intense
groups: [couple, friends, family_seniors]   # grupos soportados por la guía
days:
  - day: 1
    title, summary, physical_level {walking_km, hills: none|some|many}
    stops:
      - name, lat, lng, duration_min, kind (sight|food|transport|stay|activity),
        start_time?, travel_to_next_min?, booking {affiliate_id, advance_notice}?,
        notes, verified_at?
    food[]: name, area, price_level, notes
    local_tip                    # "lo que haríamos distinto"
    plan_b                       # si llueve / cerrado
    group_adjustments:
      couple: text?   friends: text?   family_seniors: text?
lodging:
  zones[]: name, pros[], cons[], picks[] {name, price_level, affiliate_id}
transport: arrival_from {SVQ, AGP, XRY, MAD}, local[], passes[]
budget_breakdown: flights, lodging, transport, tickets, food, total, notes, verified_at
booking_checklist[]: item, when (p.ej. "2 meses antes"), affiliate_id?
pitfalls[]                     # errores y trampas para turistas
practical: insurance_affiliate_id, documents, plugs, tips, apps[]
faq[]: q, a
related[]: slugs
```

Validaciones obligatorias: coordenadas dentro del país del destino, `affiliate_id` existente en el registro de afiliados, `verified_at` no mayor de 12 meses (aviso, no error).

---

## 6. Plantilla de la guía de itinerario (orden en página)

1. **Cabecera:** título, foto propia, "Lo hicimos en {trip_done} · Actualizado {updated_at}".
2. **Aviso de afiliación** (una línea, enlace a `/afiliacion/`).
3. **Caja de resumen** + botones **Descargar PDF** y **Abrir en Google Maps**.
4. **Selector de grupo** (isla Vue): pareja / amigos / familia con mayores. Muestra los `group_adjustments` del grupo elegido en cada día. Por defecto: sin selección = itinerario base.
5. **Mapa interactivo** (isla Vue + Leaflet/MapLibre, tiles OSM): paradas coloreadas por día, filtro por día.
6. **Itinerario día a día** (con reservas en contexto, comida, consejo propio, plan B, ajustes por grupo).
7. Dónde dormir · 8. Cómo llegar y moverse · 9. Presupuesto real · 10. Qué reservar y cuándo · 11. Errores y trampas · 12. Lo práctico
13. **CTA de captación:** "Adapta este viaje a ti" (formulario, ver §8).
14. **FAQ** (con datos estructurados) · 15. Guías relacionadas · 16. Firma del autor.

**Google Maps:** un enlace de ruta por día (respetar el límite de paradas intermedias de las URLs de Google Maps; dividir si hace falta) + descarga **KML** para importar en Google My Maps.

**Otros tipos de página:** hub de destino (resumen, mapa general, guías, práctico) y satélite (resumen, contenido, mapa si aplica, enlace a guía principal, FAQ).

---

## 7. SEO y rendimiento (requisitos)

- HTML estático; JS solo en islas. Objetivo **Lighthouse ≥ 95** en rendimiento, accesibilidad, buenas prácticas y SEO.
- `sitemap.xml`, `robots.txt`, canonical, Open Graph/Twitter cards.
- Schema.org: `Article`, `BreadcrumbList`, `FAQPage`; `TouristTrip`/`ItemList` para itinerarios si aporta.
- Imágenes optimizadas (`astro:assets`, AVIF/WebP, tamaños responsivos, `alt` descriptivo).
- Enlazado interno automático: hub ↔ guías ↔ satélites ↔ relacionadas.
- `noindex` en `/print/`, `/ir/`, `/ofertas/`.

---

## 8. Monetización y captación

### Escalera de valor
1. **Gratis sin pedir nada:** la guía web completa + lista de Google Maps. **Nunca** esconder la guía tras email o pago.
2. **Gratis a cambio de email — "Adapta este viaje a ti":** formulario (fechas, grupo, ritmo, intereses) → PDF personalizado por email en minutos.
3. **Newsletter semanal automatizada:** ofertas desde el sur + guía de la semana (n8n la monta, el autor revisa).
4. **De pago, 7-15 € (fase posterior, con ~500-1.000 suscriptores):** guías premium solo donde hay conocimiento difícil de encontrar (p. ej. "Mi Mallorca: 60 sitios", "Kit Islandia en camper"). Venta vía Payhip o Stripe + marketplaces (ShareThatTrip, Rexby) como canal extra.
5. **De pago, 25-60 € (cuando haya demanda):** viaje planificado a medida, plazas limitadas.

### Afiliados
- **Registro central** `affiliates.(json|yaml)`: `id`, `partner`, `url`, `description`, `active`. Todas las salidas pasan por `/ir/{id}` (rel="sponsored nofollow").
- Partners previstos: Booking (hoteles), GetYourGuide (tours, ≥8 %), Civitatis, IATI (seguros), alquiler de camper en Islandia y Mallorca, alquiler de coches, Travelpayouts (vuelos, fase ofertas).
- Enlaces **solo en contexto** (la reserva del Vaticano en el día del Vaticano). Sin banners de publicidad al inicio.

### Flujo "Adapta este viaje" (lead magnet)
```
Formulario (isla Vue, web estática)
  → POST webhook n8n (validación + honeypot + rate limit)
  → Alta en MailerLite/Brevo con DOBLE OPT-IN + etiquetas (destino, grupo, fechas)
  → Tras confirmar: n8n llama al motor /personalize (guía base + parámetros)
  → Motor devuelve itinerario ajustado → /pdf → PDF
  → Email con el PDF + enlace a la guía
```
Asíncrono: el visitante nunca espera en pantalla.

### RGPD (obligatorio antes de recoger un solo email)
Consentimiento explícito (casilla no premarcada), doble opt-in, política de privacidad, aviso legal, página de afiliación, baja en un clic, registro del consentimiento. Sin cookies de terceros.

---

## 9. El motor (refactor de Reel2Trip)

Repo: `github.com/PascualDev85/reel2trip`. Estado: FastAPI monolito (~5.300 líneas, 11 módulos planos), 458 tests mockeados pasando, desplegado en Render free.

### Limpieza previa (antes de tocar nada)
1. Resolver el working tree sucio: `templates/index.html` (+90 líneas, modo influencer) y `tests/test_influencer_routes.py` sin trackear → commit en rama o descartar (preguntar al autor).
2. Borrar `fly.toml` y `railway.toml` (restos de evaluación).
3. Crear tag `v0-pre-refactor`.
4. Verificar sincronía con `origin` (el último `git fetch` se colgó por credenciales).

### Qué se reutiliza tal cual
`database.py`, geocoding con caché, `mapper.py`, scraper, `reality_checker.py`, `content_analyzer.py`, `influencer_scanner.py`, y sus tests.

### Qué NO se reutiliza
`main.py` como orquestador (rutas + SSE + background tasks + rate limiting mezclados) y `templates/result.html` (129 KB inline). La web pública no depende de ellos.

### Cambios
- Reorganizar en paquete (`engine/`) sin romper tests existentes.
- Transcripción → Groq (Whisper grande). Mantener caché de transcripciones.
- `planner.py:548` → `claude-sonnet-5`.
- Modelo Pydantic de la guía (§5) + comando para exportar JSON Schema.
- **API interna nueva** (protegida con token, solo accesible desde n8n / red interna):
  - `POST /draft-guide` — destino, días, fuentes (URLs de reels, notas) → fichero de guía válido (borrador).
  - `POST /personalize` — guía base + fechas, grupo, ritmo, intereses → itinerario ajustado.
  - `POST /pdf` — guía (o itinerario personalizado) → PDF (Playwright sobre la ruta `/print/` o plantilla equivalente).
- **CLI** `engine draft-guide --destination ... --days ... --sources ...` que escribe el fichero directamente en el repo de la web (flujo de contenido del autor).
- Tests para todo lo nuevo, en la misma línea (mockeados, rápidos).

### Flujo de contenido
`engine draft-guide` → fichero en `web/src/content/guides/` → el autor revisa y completa (consejos, comida, fotos, presupuesto real) → commit → despliegue automático en Cloudflare Pages.

---

## 10. Infraestructura en el VPS

El VPS ya aloja el **proyecto de finanzas personales con datos bancarios sensibles**. Regla de oro: **nada de este proyecto puede leer, tocar ni degradar finanzas.**

### Paso 0 — comprobar recursos (antes de desplegar)
Ejecutar `free -h && nproc && df -h / && docker stats --no-stream` y decidir:
- **≥ 2 GB RAM libres tras finanzas:** n8n + motor en el VPS.
- **Menos:** n8n en el VPS y motor fuera (plan B: VPS pequeño aparte ~4-5 €/mes, o instancia de pago que no duerma). Consultar al autor antes.

### Despliegue
- Docker Compose con **Caddy** (HTTPS automático) como único punto expuesto.
- **Redes Docker separadas:** finanzas en su red; n8n y motor en otra. Sin acceso cruzado a la base de datos de finanzas.
- **Límites de CPU y memoria** por contenedor (`deploy.resources.limits` / `mem_limit`).
- n8n: autenticación activada; solo los webhooks públicos expuestos; panel restringido (IP o auth adicional).
- Motor: sin exposición pública; solo accesible desde n8n por red interna (o, si hace falta exponerlo, con token y rate limit).
- Secretos en `.env` fuera del repo; nunca en imágenes.
- **Backups automáticos** diarios de volúmenes (n8n, finanzas) con rotación y copia fuera del VPS.
- Actualizaciones de seguridad del sistema y de las imágenes.
- Retirar el despliegue de Render cuando el motor funcione en el VPS.

---

## 10b. Redes sociales (resumen — detalle completo en `docs/ANALISIS_REDES_SOLO_HAZ_LA_MALETA.md`)

### Principio
Todo el contenido social se **genera desde el fichero de la guía**, sin cámara ni edición manual, y pasa por una **cola de revisión** antes de publicarse. Solo contenido propio (fotos y clips del autor, mapas generados). Nada de contenido de terceros, marcas de agua de otras plataformas ni imágenes generadas por IA.

### Catálogo de formatos
| ID | Formato | Objetivo | Redes | Tamaños |
|---|---|---|---|---|
| F1 | Carrusel "Itinerario" (portada, mapa de ruta, 1 diapositiva por día, presupuesto/errores, cierre con CTA) | Guardados, clics | IG, TikTok modo foto | 1080×1350 (IG), 1080×1920 (TikTok) |
| F2 | Reel "Ruta animada" (la ruta se dibuja sobre el mapa, fotos en cada parada, 15-30 s) | Descubrimiento | IG Reels, TikTok, Shorts, pin de vídeo | 1080×1920 |
| F3 | Lista ("5 calas sin gente…", "7 errores…") | Descubrimiento + guardados | IG, TikTok | 4:5 / 9:16 |
| F4 | "Presupuesto real" (cifras que aparecen hasta el total) | Compartidos | IG, TikTok | 9:16 |
| F5 | Pines (4-6 diseños distintos por guía: mapa, foto+título, checklist, presupuesto, vídeo) | Tráfico web a largo plazo | Pinterest | 1000×1500 |
| F6 | Tarjeta de oferta | Clics a guía | Telegram, historias | 1080×1080 / 1080×1920 |

### Reglas de diseño
- Diseñar primero en 9:16 y adaptar a 4:5.
- Infografías legibles en móvil: 5-7 paradas numeradas por imagen como máximo, texto grande.
- **Palabras clave dentro de la imagen** (TikTok y Pinterest indexan el texto de las diapositivas).
- Estilo de marca fijo (paleta, tipografía, icono de maleta). **Sin logos ni marcas de agua superpuestos en contenido publicado en TikTok vía API.**
- Música libre de derechos incrustada en los vídeos generados.

### Requisitos para el esquema de guía (§5)
Añadir un bloque `social` opcional por guía: `hooks[]` (textos de gancho), `highlight_stops[]` (5-7 paradas para la infografía), `media[]` con fotos/clips marcados por parada y orientación (`vertical|horizontal`), `pinterest_keywords[]`, `boards[]`.

### Pipeline
```
Guía (JSON) → generador de piezas
   · Imágenes: plantillas HTML/CSS → PNG con Playwright (4:5, 9:16, 2:3)
   · Vídeos: Remotion o ffmpeg (F2, F3, F4)
→ Cola de revisión en n8n (aviso por Telegram con Aprobar / Rechazar / Editar)
→ Publicación
   · Instagram: API oficial (reels y carruseles), cuenta profesional
   · TikTok: modo borrador (MEDIA_UPLOAD), el autor añade sonido en tendencia y publica
     (la publicación directa queda en privado hasta pasar auditoría de TikTok)
   · Pinterest: API oficial, programado y espaciado (nunca muchas variantes a la misma URL el mismo día)
   · YouTube Shorts: opcional, reutilizando F2/F3
   · Telegram: bot del canal (ofertas)
```
Evaluar un programador autoalojado (p. ej. Postiz) en el VPS solo si el consumo de recursos lo permite.

### Cadencia objetivo
IG 3-4/semana · TikTok 3-5/semana (mismo contenido) · Pinterest 1-3 pines nuevos/día programados · Shorts 2/semana. Revisión del autor: ~1 h/semana.

### Métricas
IG: guardados y envíos por DM · TikTok: finalización · Pinterest: clics salientes · Web: visitas desde redes → altas en newsletter. Revisión mensual para doblar lo que funciona.

---

## 11. Fases de trabajo y criterios de aceptación

> Trabajar fase a fase. No empezar una fase sin cerrar la anterior. Cada fase termina con tests en verde y un resumen para el autor.

**F0 — Preparación (manual, el autor)**
Registrar dominios; reservar `@solohazlamaleta` en Instagram, TikTok, YouTube, Pinterest y Telegram; buscar la marca en OEPM/EUIPO; alta en Search Console y en programas de afiliados; cuenta en MailerLite o Brevo; validar volúmenes con Google Keyword Planner; ordenar fotos por viaje.

**F1 — Web base**
Proyecto Astro + Vue, esquema de guía, layouts y componentes (§6), páginas legales, SEO técnico (§7), analítica, registro de afiliados y `/ir/`, despliegue en Cloudflare Pages.
✅ Una guía de ejemplo completa se renderiza desde su fichero de datos · Lighthouse ≥ 95 · build falla con una guía inválida.

**F2 — Motor**
Limpieza del repo, reorganización, Groq, `claude-sonnet-5`, modelo Pydantic + export de esquema, API interna, CLI, PDF.
✅ `engine draft-guide` genera un fichero que la web valida y renderiza · 458 tests + nuevos en verde.

**F3 — Infraestructura**
Paso 0, Compose con Caddy, n8n y motor, aislamiento, límites, backups.
✅ Finanzas sigue funcionando igual · el motor responde solo desde n8n · backup restaurado con éxito en prueba.

**F4 — Captación**
Formulario "Adapta este viaje", flujo n8n completo, doble opt-in, email con PDF, newsletter automatizada (borrador semanal para revisión).
✅ Prueba de punta a punta: formulario → confirmación → PDF recibido · baja en un clic funciona.

**F4b — Redes sociales (§10b)**
Bloque `social` en el esquema, generador de piezas (F1-F5), cola de revisión en n8n, publicación en Instagram y Pinterest por API y borradores en TikTok. Las 2-3 primeras semanas: piezas generadas automáticamente pero publicadas a mano para aprender antes de automatizar la publicación.
✅ Desde una guía se generan en un solo comando todas las piezas en sus tamaños · el flujo aprobar → publicar funciona en Instagram y Pinterest · el borrador llega a TikTok.

**F5 — Contenido fase 1**
Las 4 líneas del plan editorial (§3), con revisión del autor.

**F6 — Canal de ofertas (posterior)**
n8n monitoriza precios (Travelpayouts u otra API) desde SVQ/AGP/XRY (+ MAD largo recorrido), detecta bajadas, genera publicación (texto + carrusel estático, sin vídeo) enlazando a la guía del destino → cola de revisión → Telegram / Instagram.

**F7 — Productos de pago (posterior)**
Guías premium y servicio a medida (§8).

---

## 12. Lo que NO hay que hacer

- No montar la web pública sobre Render free ni sobre el motor.
- No esconder las guías tras email o pago.
- No generar guías en masa sin revisión humana.
- No publicar, copiar ni incrustar contenido de reels/TikToks de terceros.
- No mezclar redes, volúmenes ni credenciales con el proyecto de finanzas.
- No añadir banners de publicidad ni cookies de terceros al inicio.
- No crear páginas duplicadas por variantes de días o de grupo (van dentro de la guía).

---

## 13. Pendientes del autor (bloquean o condicionan fases)

- [ ] Proveedor y características exactas del VPS (se resuelve en el Paso 0 de F3).
- [ ] Registrar dominios y reservar usuarios en redes.
- [ ] Confirmar volúmenes de búsqueda de la fase 1 (Keyword Planner).
- [ ] Altas en programas de afiliados.
- [ ] Elegir MailerLite o Brevo.
- [ ] Decidir qué hacer con el modo influencer sin commitear de Reel2Trip.
- [ ] Consultar la fiscalidad de los ingresos por afiliación y venta de guías antes de empezar a facturar.
- [ ] Pasar Instagram a cuenta profesional y crear la app de desarrollador de Meta, TikTok y Pinterest.
- [ ] Reunir fotos y clips propios por viaje (vertical y horizontal) para el generador de piezas.
- [ ] Definir paleta, tipografía e icono de marca (necesario antes de las plantillas).
