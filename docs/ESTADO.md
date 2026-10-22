# Estado del proyecto

Última actualización: 2026-10-22

**2026-10-22:** puesto al día con lo que dejaron la tarde del 21 (las seis
rutinas relanzadas, #55 a #59 y #61, la portada v3, #60, y Tailandia, #54) y
la noche del 21 al 22 (#62 a #69), los comentarios de las PR hasta las 05:30
del 22 y la salida de `npm run day:status` y `npm run content:validate` en
`develop` (`b288e69`, sin cambios desde el 20: no se ha mezclado nada). Lo
que te toca, por orden, en [DEBERES.md](DEBERES.md).

**2026-10-21 (histórico):** puesto al día con lo que entró el 20 de octubre (#23 y la
integración #51, con #43, #44, #46, #47, #48 y #49), las PR abiertas (#12,
#25, #26, #31, #35, #45, #50 y #52), las hojas de decisiones y revisiones de
la noche del 20 al 21 y la salida de `npm run day:status` y
`npm run content:validate` en `develop` (`b288e69`). Lo que te toca, por
orden, en [DEBERES.md](DEBERES.md).

**2026-10-20 (histórico):** puesto al día con las PR mergeadas desde el 15 de octubre (#9,
#10, #13 a #22, #24, #27 a #30, #32 a #34, #37 a #40 y #42), las PR abiertas
(#12, #23, #25, #26, #31, #35 y #43 a #48), las issues #36 y #41 y la salida
de `npm run day:status` y `npm run content:validate` en `develop` (`dc83129`).
Lo que te toca, por orden, en [DEBERES.md](DEBERES.md).

Reconstruido desde el historial de `develop` y de las ramas
`feature/checkpoint3-diseno-v6*`, las PR #6 a #17, la issue #11 y los
documentos 1.10, 1.11 y 1.12. Lo que no se puede demostrar con esas fuentes
va marcado **(a confirmar)**.

---

## Dónde está todo

- **Repo:** https://github.com/PascualDev85/solohazlamaleta
- **Ramas:** `main` (producción) · `develop` (integración; último merge: PR #8,
  2026-10-07) · ramas `feature/checkpoint3-diseno-v6-*` con el trabajo en curso.
  (A 2026-10-21: último merge en `develop`, PR #51, 2026-10-20. Las ramas
  `…-v6-*` ya están mergeadas. `main` sigue casi vacía; producción será
  `main` tras una PR `develop` → `main`, opción A de `docs/DESPLIEGUE.md`.
  A 2026-10-22, igual: lo de la noche del 21 al 22 está junto en la
  integración #69, en borrador)
- **Guía de Islandia (motor nuevo):**
  `content/guides/islandia/islandia-en-camper-13-dias.yaml` y
  `content/places/islandia.yaml`, validados por `schemas/` y compilados por
  `engine/`. Página: `src/pages/islandia/islandia-en-camper-13-dias.astro`
  → `/islandia/islandia-en-camper-13-dias/`, en `noindex` y fuera del sitemap.
  (Desde #34, el `noindex` y el sitemap se derivan de `status`)
- **Hub de Islandia:** `content/guides/islandia/islandia.yaml` (`type: hub`)
  → `/islandia/`, en la PR #26, en borrador.
- **Informes para el autor en `docs/fuentes/`:** `coordenadas-por-confirmar.md`
  (entró con #14) e `informe-paneles-y-nombres.md` (#30). El de SEO,
  `seo-islandia-grupo.md`, está en la PR #25. El doc 1.13 entró con #23.
- **Despliegue:** `docs/DESPLIEGUE.md` (#48), Cloudflare Pages paso a paso.
- **Guía de Alsacia (sistema antiguo):** `src/content/guides/ruta-pueblos-y-vinos.json`,
  borrador. Lo que falta, en [PENDIENTE-ALSACIA.md](PENDIENTE-ALSACIA.md).
- **Notas de viaje del autor:** `docs/fuentes/` (Islandia, Egipto, Tailandia,
  Macedonia del Norte).
- **Contratos (no se editan desde las rutinas):** `docs/BRIEF.md` (incluye las
  decisiones cerradas: `DECISIONES.md` se fusionó en él en `1853c72`,
  2026-09-30) y los documentos `docs/1.x`. El marco del trabajo actual está en
  `docs/1.10_checkpoint3_diseno.md`, `docs/1.11_islandia_estructura_contenidos.md`
  y `docs/1.12_direccion_guia_islandia.md`.

### PR abiertas (a 2026-10-22)

CI = build, lighthouse y devices en el head actual. Las PR encadenadas no
tienen CI porque su base no es `develop`. Ninguna PR tiene revisiones
humanas; la revisión automática de la noche no puso bloqueantes.

| PR | Rama | Qué | Estado | CI |
|---|---|---|---|---|
| [#12](https://github.com/PascualDev85/solohazlamaleta/pull/12) | `feature/guia-egipto` | Guía de Egipto en el esquema antiguo | Lista para revisar; por detrás de `develop` | ✅ build y lighthouse del 14 de octubre, sobre una base antigua |
| [#25](https://github.com/PascualDev85/solohazlamaleta/pull/25) | `docs/seo-islandia-grupo` | Investigación SEO del grupo Islandia | Borrador; hoja del 21 sin contestar (3 preguntas) | ✅ |
| [#26](https://github.com/PascualDev85/solohazlamaleta/pull/26) | `feature/hub-islandia` | Hub `/islandia/`, v1 | Borrador; hoja del 21 sin contestar (8 preguntas y textos) | ✅ |
| [#31](https://github.com/PascualDev85/solohazlamaleta/pull/31) | `feature/landing-v2` | Portada v2 | Borrador; va dentro de #60 y de #69 | ✅ |
| [#35](https://github.com/PascualDev85/solohazlamaleta/pull/35) | `feature/guia-al-hub` | Lo práctico de la guía, al hub | Borrador, sobre #26; hoja del 21 (2 preguntas) | sin CI (base #26) |
| [#45](https://github.com/PascualDev85/solohazlamaleta/pull/45) | `feature/404-v2` | Página 404 propia | Borrador; hoja del 21 (1 pregunta y textos). Imprescindible antes del despliegue (#57); chocará con la portada y con #26 | ✅ |
| [#50](https://github.com/PascualDev85/solohazlamaleta/pull/50) | `content/coordenadas-2026-10-20` | Coordenadas de Grafarkirkja, Landbrotalaug y Stuðlagil | Lista; 2 preguntas | ✅ |
| [#52](https://github.com/PascualDev85/solohazlamaleta/pull/52) | `feature/site-search` | Buscador mínimo en `/buscar/` | Borrador; va dentro de #60 y de #69 | ✅ |
| [#53](https://github.com/PascualDev85/solohazlamaleta/pull/53) | `docs/deberes-2026-10-21` | Deberes, ESTADO y BACKLOG del 21 | Borrador; la sustituye la PR de hoy | ✅ |
| [#54](https://github.com/PascualDev85/solohazlamaleta/pull/54) | `feature/guia-tailandia` | Guía de Tailandia en el esquema antiguo (rutina semanal) | No es borrador; `draft: true` en el dato. Pregunta: ¿se adapta la rutina al motor? | ✅ |
| [#55](https://github.com/PascualDev85/solohazlamaleta/pull/55) | `feature/practical-verified-at` | Aviso de datos sensibles sin fecha en `practical` | Borrador, sobre #26; pide validar la enmienda 1.7.2 | sin CI (base #26) |
| [#56](https://github.com/PascualDev85/solohazlamaleta/pull/56) | `docs/verificacion-datos-islandia` | Lista de verificación de 98 datos caducados de Islandia | Borrador; 0 verificados: la red bloquea las webs oficiales | ✅ |
| [#57](https://github.com/PascualDev85/solohazlamaleta/pull/57) | `docs/repaso-despliegue` | Repaso antes del despliegue | Borrador; lo grave: sin #45, toda URL inexistente da la portada con 200 | ✅ |
| [#58](https://github.com/PascualDev85/solohazlamaleta/pull/58) | `chore/ci-tools` | CI: un solo build, dispositivos desconocidos fallan, 0 avisos de tipos | Borrador; dentro de #69 | ✅ |
| [#59](https://github.com/PascualDev85/solohazlamaleta/pull/59) | `feature/site-menu` | Menú del sitio en móvil | Borrador; dentro de #62 y de #69 | ✅ |
| [#60](https://github.com/PascualDev85/solohazlamaleta/pull/60) | `feature/landing-v3` | Portada v3 (Salt in our Hair + BucketListly), con #31 y #52 | Borrador; H1 y textos por decidir | ✅ |
| [#61](https://github.com/PascualDev85/solohazlamaleta/pull/61) | `a11y/touch-targets` | Áreas de toque de 44 px y contraste del hero | Borrador; dentro de #69 | ✅ |
| [#62](https://github.com/PascualDev85/solohazlamaleta/pull/62) | `feature/landing-menu` | Portada con menú y lupa en la cabecera | Borrador, sobre #60 | sin CI (base #60) |
| [#63](https://github.com/PascualDev85/solohazlamaleta/pull/63) | `design/landing-craft` | Diseño de la portada y pie nuevo | Borrador, sobre #62; textos por revisar | sin CI (base #62) |
| [#64](https://github.com/PascualDev85/solohazlamaleta/pull/64) | `perf/guide-bytes` | Bytes de la guía de 13 días | Borrador; −366 B, **no llega a 100** en móvil (sigue 99). Pregunta editorial | ✅ |
| [#65](https://github.com/PascualDev85/solohazlamaleta/pull/65) | `feature/hub-links` | Enlaces hub ↔ guías desde el dato y `links:check` | Borrador, sobre #35; 3 textos | sin CI (base #35) |
| [#66](https://github.com/PascualDev85/solohazlamaleta/pull/66) | `feature/landing-search-v2` | Buscador v2 (sin filtros) | Borrador, sobre #63; 2 textos | sin CI (base #63) |
| [#67](https://github.com/PascualDev85/solohazlamaleta/pull/67) | `a11y/text-scale-contrast` | Texto que crece con la fuente (P3) y `prefers-contrast: more` (P4) | Borrador; dentro de #69 | ✅ |
| [#68](https://github.com/PascualDev85/solohazlamaleta/pull/68) | `design/landing-motion` | Postales en 3D (CSS) y transiciones | Borrador, sobre #66; portada móvil a 99 con excepción nueva | sin CI (base #66) |
| [#69](https://github.com/PascualDev85/solohazlamaleta/pull/69) | `integration/2026-10-22` | Integración: #58, #61, la cadena de la portada, #67 y #64 | Borrador; lo que hay que mirar primero | ✅ |

Cadena de la portada: #60 → #62 → #63 → #66 → #68, y todo junto en #69. Si
se mezcla #69, GitHub da por mezcladas #58, #61, #60, #52, #31, #59, #62,
#63, #66, #68, #67 y #64.

Cadena del hub: **#25 → #26 → #35 y #55 → #65 → #45.**

Issues abiertas: #36 (se puede cerrar) y #41 (TypeScript 7; esperar). Sin
comentarios nuevos.

### Lo que dejaron la tarde del 21 y la noche del 21 al 22

| Hora | Tarea | Resultado |
|---|---|---|
| tarde del 21 | CI y herramientas (`chore/ci-tools`) | ✅ [#58](https://github.com/PascualDev85/solohazlamaleta/pull/58), CI en verde |
| tarde del 21 | Repaso previo al despliegue (`docs/repaso-despliegue`) | ✅ [#57](https://github.com/PascualDev85/solohazlamaleta/pull/57). Encuentra que sin #45 toda URL inexistente da la portada con 200 |
| tarde del 21 | Áreas de toque (`a11y/touch-targets`) | ✅ [#61](https://github.com/PascualDev85/solohazlamaleta/pull/61), avisos de dispositivos de 11 a 0 |
| tarde del 21 | Fecha en "Lo práctico" (`feature/practical-verified-at`, sobre #26) | ✅ [#55](https://github.com/PascualDev85/solohazlamaleta/pull/55): solo el aviso; la fecha espera a la enmienda 1.7.2 |
| tarde del 21 | Menú hamburguesa (`feature/site-menu`) | ✅ [#59](https://github.com/PascualDev85/solohazlamaleta/pull/59) |
| tarde del 21 | Datos caducados (`docs/verificacion-datos-islandia`) | ⚠️ [#56](https://github.com/PascualDev85/solohazlamaleta/pull/56): la lista está, pero **0 de 98 datos verificados** (la red bloquea las webs oficiales) |
| tarde del 21 | Portada híbrida (`feature/landing-v3`) | ✅ [#60](https://github.com/PascualDev85/solohazlamaleta/pull/60), con #52 y #31 |
| 22:00 | Menú y lupa en la portada (`feature/landing-menu`) | ✅ [#62](https://github.com/PascualDev85/solohazlamaleta/pull/62) |
| 23:30 | Diseño de la portada (`design/landing-craft`) | ✅ [#63](https://github.com/PascualDev85/solohazlamaleta/pull/63). La skill impeccable no se pudo instalar (el proxy la bloquea): reglas aplicadas a mano |
| 00:00 | Guía a 100 en móvil (`perf/guide-bytes`) | ⚠️ [#64](https://github.com/PascualDev85/solohazlamaleta/pull/64): **no llega**, se queda en 99 |
| 01:00 | Texto al 150 % y contraste (`a11y/text-scale-contrast`) | ✅ [#67](https://github.com/PascualDev85/solohazlamaleta/pull/67) |
| 01:30 | Buscador v2 (`feature/landing-search-v2`) | ✅ [#66](https://github.com/PascualDev85/solohazlamaleta/pull/66) |
| 02:00 | Enlaces del hub (`feature/hub-links`, sobre #35) | ✅ [#65](https://github.com/PascualDev85/solohazlamaleta/pull/65) |
| 03:30 | Animaciones y 3D (`design/landing-motion`) | ✅ [#68](https://github.com/PascualDev85/solohazlamaleta/pull/68): portada móvil a 99, con una excepción nueva en `lighthouse-check.ts`. Tenía una carrera en `test:ui` que se arregló en #69 |
| 05:30 | Integración (`integration/2026-10-22`) | ✅ [#69](https://github.com/PascualDev85/solohazlamaleta/pull/69), CI en verde |

Ninguna tarea falló por el límite de uso: todas dejaron rama y PR.

### PR abiertas (a 2026-10-21, histórico)

Todas tienen la base en `develop` salvo #35, que cuelga de #26. CI = build,
lighthouse y devices en el head actual. Las hojas de decisiones son del 21 de
octubre.

| PR | Rama | Qué | Estado | CI |
|---|---|---|---|---|
| [#12](https://github.com/PascualDev85/solohazlamaleta/pull/12) | `feature/guia-egipto` | Guía de Egipto en el esquema antiguo | Lista para revisar; muy por detrás de `develop` | ✅ del 14 de octubre, sobre una base antigua |
| [#25](https://github.com/PascualDev85/solohazlamaleta/pull/25) | `docs/seo-islandia-grupo` | Investigación SEO del grupo Islandia | Borrador; [hoja de decisiones](https://github.com/PascualDev85/solohazlamaleta/pull/25#issuecomment-6305016984), 3 preguntas | ✅ (ya apunta a `develop`) |
| [#26](https://github.com/PascualDev85/solohazlamaleta/pull/26) | `feature/hub-islandia` | Hub `/islandia/`, v1; H1 "Islandia" ya aplicado | Borrador; [hoja](https://github.com/PascualDev85/solohazlamaleta/pull/26#issuecomment-6305017210), 8 preguntas y textos | ✅ |
| [#31](https://github.com/PascualDev85/solohazlamaleta/pull/31) | `feature/landing-v2` | Portada en el diseño v2 | Borrador; [hoja](https://github.com/PascualDev85/solohazlamaleta/pull/31#issuecomment-6305017608), 2 preguntas y textos | ✅ |
| [#35](https://github.com/PascualDev85/solohazlamaleta/pull/35) | `feature/guia-al-hub` | Lo práctico de la guía, al hub; enlace con `hubSectionHref` | Borrador, sobre #26; [hoja](https://github.com/PascualDev85/solohazlamaleta/pull/35#issuecomment-6305017425), 2 preguntas | sin CI (su base no es `develop`) |
| [#45](https://github.com/PascualDev85/solohazlamaleta/pull/45) | `feature/404-v2` | Página 404 propia | Borrador; [hoja](https://github.com/PascualDev85/solohazlamaleta/pull/45#issuecomment-6305017813), 1 pregunta y textos; chocará con #26 y #31 | ✅ |
| [#50](https://github.com/PascualDev85/solohazlamaleta/pull/50) | `content/coordenadas-2026-10-20` | Coordenadas y fichas de Maps de Grafarkirkja, Landbrotalaug y Stuðlagil | Lista; 2 preguntas (Stuðlagil y `drive` de los días 8 y 11) | ✅ |
| [#52](https://github.com/PascualDev85/solohazlamaleta/pull/52) | `feature/site-search` | Buscador mínimo en `/buscar/` y "Buscar" en la cabecera | Borrador, de la noche del 20 al 21; pendiente de validar frente al BRIEF §P | ✅ |

Orden de mezcla de las hojas: **#25 → #26 → #35 → #31 → #45.**

Issues abiertas: [#36](https://github.com/PascualDev85/solohazlamaleta/issues/36)
(parte del 16 de octubre, se puede cerrar) y
[#41](https://github.com/PascualDev85/solohazlamaleta/issues/41) (TypeScript
7; la recomendación es esperar).

### Lo que dejó la noche del 20 al 21 (histórico)

| Hora | Tarea | Resultado |
|---|---|---|
| 23:00 | CI y herramientas (`chore/ci-tools`) | Sin rama ni PR en el remoto. No se sabe si no se ejecutó o falló |
| 23:30 | Repaso previo al despliegue (`docs/repaso-despliegue`) | Sin rama ni PR |
| 00:00 | Áreas de toque de 44 px (`a11y/touch-targets`) | Sin rama ni PR |
| 00:30 | Fecha en "Lo práctico" del hub (`feature/practical-verified-at`) | Sin rama ni PR |
| 01:00 | Menú del sitio en móvil (`feature/site-menu`) | Sin rama ni PR (#52 confirma que no existía a las 03:47) |
| 01:30 | Datos caducados de Islandia (`docs/verificacion-datos-islandia`) | Sin rama ni PR |
| 02:30 | Hojas de decisiones | ✅ Comentarios en #25, #26, #35, #31 y #45, y un resumen en #26 |
| 03:30 | Buscador sencillo (`feature/site-search`) | ✅ #52, borrador, CI en verde |

Además, la revisión nocturna de PR comentó #25, #26, #31, #35, #45 y #50 (sin
bloqueantes).

### PR abiertas (a 2026-10-20)

(Histórico. #23 se mezcló el 20 de octubre y #43, #44, #46, #47 y #48 entraron
con la integración #51.)

Todas tenían la base en `develop` salvo #25, que cuelga de #23, y #35, que
cuelga de #26. CI = build, lighthouse y devices en el head actual.

| PR | Rama | Qué | Estado | CI |
|---|---|---|---|---|
| [#12](https://github.com/PascualDev85/solohazlamaleta/pull/12) | `feature/guia-egipto` | Guía de Egipto en el esquema antiguo | Lista para revisar; 108 commits por detrás de `develop` | ✅ del 14 de octubre, sobre una base antigua |
| [#23](https://github.com/PascualDev85/solohazlamaleta/pull/23) | `docs/1.13-guia-hub-satelites` | Doc 1.13: guía, hub y satélites | Lista; puesta al día el 19 de octubre sin conflictos | ✅ |
| [#25](https://github.com/PascualDev85/solohazlamaleta/pull/25) | `docs/seo-islandia-grupo` | Investigación SEO del grupo Islandia | Borrador, sobre #23 | sin CI (su base no es `develop`) |
| [#26](https://github.com/PascualDev85/solohazlamaleta/pull/26) | `feature/hub-islandia` | Hub `/islandia/`, v1 | Borrador; el 19 de octubre tuvo conflictos con #28 y #34, ya resueltos | ✅ |
| [#31](https://github.com/PascualDev85/solohazlamaleta/pull/31) | `feature/landing-v2` | Portada en el diseño v2 | Borrador; revisión atendida en `a7c32cb` | ✅ |
| [#35](https://github.com/PascualDev85/solohazlamaleta/pull/35) | `feature/guia-al-hub` | Lo práctico de la guía, al hub | Borrador, sobre #26 | sin CI (su base no es `develop`) |
| [#43](https://github.com/PascualDev85/solohazlamaleta/pull/43) | `feature/http-headers` | `_headers` y CSP por página generada en el build | Mezclado 2026-10-20 | ✅ |
| [#44](https://github.com/PascualDev85/solohazlamaleta/pull/44) | `perf/font-subsetting` | El recorte de fuentes no se aplica; `fonts:check` en la CI | Mezclado 2026-10-20 | ✅ |
| [#45](https://github.com/PascualDev85/solohazlamaleta/pull/45) | `feature/404-v2` | Página 404 propia | Borrador | ✅ |
| [#46](https://github.com/PascualDev85/solohazlamaleta/pull/46) | `test/affiliate-route` | Prueba de `/ir/{id}` con un afiliado de prueba | Mezclado 2026-10-20 | ✅ |
| [#47](https://github.com/PascualDev85/solohazlamaleta/pull/47) | `test/keyboard-and-size-budget` | Tests de teclado y tope de tamaño del HTML; el fallo de teclado que encontró quedó arreglado en la integración | Mezclado 2026-10-20 | ✅ |
| [#48](https://github.com/PascualDev85/solohazlamaleta/pull/48) | `docs/despliegue` | `docs/DESPLIEGUE.md`, Cloudflare Pages paso a paso | Mezclado 2026-10-20 | ✅ |

No hay PR de TypeScript 7: la rutina lo probó en local y no abrió PR, porque
`astro check` no lo admite (issue #41).

Orden de merge que se deduce de las dependencias: **#23 → #25 → #26 → #35**.

Issues abiertas:

- [#36](https://github.com/PascualDev85/solohazlamaleta/issues/36), el parte
  del 16 de octubre. Sus integraciones entraron con #37 y #38, y lo que queda
  son las PR abiertas de la tabla.
- [#41](https://github.com/PascualDev85/solohazlamaleta/issues/41), TypeScript
  6 → 7. La recomendación es esperar.

La #11 está cerrada por #40.

### PR abiertas (a 2026-10-15)

(Histórico. Todas las de esta tabla menos #12 se mergearon el 15 y el 16 de
octubre.)

| PR | Rama | Qué | Estado | CI en su head |
|---|---|---|---|---|
| [#9](https://github.com/PascualDev85/solohazlamaleta/pull/9) | `…-v6-dia-4` | Día 4 (Skógafoss → Svínafell) con parkings, mapas y tiempos del autor; `free_nearby`; `test:devices`; área segura; bocadillo con `pointerdown` | Borrador | ✅ build, lighthouse, devices (`f491206`) |
| [#10](https://github.com/PascualDev85/solohazlamaleta/pull/10) | `fix/deps-2026-10-12` | Parches y menores: astro 7.3.8, sass, zod, pdfjs-dist, playwright 1.64 | Lista | ✅ build, lighthouse |
| [#12](https://github.com/PascualDev85/solohazlamaleta/pull/12) | `feature/guia-egipto` | Guía de Egipto estructurada desde las notas, borrador, **en el esquema antiguo** (`src/content/`, JSON) | Lista para revisar | ✅ build, lighthouse |
| [#13](https://github.com/PascualDev85/solohazlamaleta/pull/13) | `…-v6-secciones` | Diseño móvil de las siete secciones tras la ruta | Borrador | ✅ build, lighthouse, devices |
| [#14](https://github.com/PascualDev85/solohazlamaleta/pull/14) | `…-v6-dias-5-13` | Días 5 a 13: conducción, tramos, nombres cortos, descartes, textos; informe de coordenadas | Borrador | ✅ build · ❌ lighthouse (`test:ui`) · ❌ devices |
| [#15](https://github.com/PascualDev85/solohazlamaleta/pull/15) | `…-v6-escritorio` | Diseño de escritorio de las secciones tras la ruta (solo CSS) | Borrador, depende de #13 | ✅ build, lighthouse, devices |
| [#16](https://github.com/PascualDev85/solohazlamaleta/pull/16) | `…-v6-seo` | Auditoría SEO técnica: `noopener`, BreadcrumbList, Article, Open Graph, canonical de `/ir/` | Borrador | ✅ build, lighthouse, devices |
| [#17](https://github.com/PascualDev85/solohazlamaleta/pull/17) | `…-v6-a11y` | Auditoría WCAG 2.2 AA y arreglos sin cambio visual | Borrador | ✅ build, lighthouse, devices |

Las ramas de #13, #14, #16 y #17 salen de la del día 4, y la de #15 sale de
la de #13: hasta que #9 entre en `develop`, sus diffs llevan también los
commits de #9 (y #15 los de #13). Orden de merge que se deduce de esas
dependencias: **#9 → #13 → #15**, y después #16, #17 y #14. Si #16 y #17
chocan entre sí al rebasarlas: **(a confirmar)**.

Issue abierta: [#11](https://github.com/PascualDev85/solohazlamaleta/issues/11)
— `npm audit`: 2 vulnerabilidades altas sin actualizar
(`http-cache-semantics`, `sharp`), abierta por la auditoría de dependencias el
2026-10-12.

## Qué hay hecho

| | Estado |
|---|---|
| Repo, gitflow, `.gitignore` | ✅ |
| Brief y decisiones versionados (decisiones fusionadas en `BRIEF.md`, `1853c72`) | ✅ |
| Agentes especialistas, reducidos de nueve a tres (PR #3, 2026-09-28) | ✅ |
| Convenciones: SOLID, gitflow, definición de terminado | ✅ |
| Astro 7 + Vue + sitemap, TypeScript estricto | ✅ |
| Arquitectura de Sass y render completo del esquema antiguo (PR #2, 2026-09-28) | ✅ |
| Arquitectura de información y documentos 1.5–1.9 (PR #4 y #5, 2026-09-30) | ✅ |
| Motor de dominio (`engine/`): carga YAML, tres capas de validación, compilación, presupuesto, invariantes I1–I17 con tests | ✅ (PR #6) |
| Guía de Islandia renderizada desde el motor (Checkpoint 2) | ✅ (PR #6, 2026-10-03) |
| Checkpoint 3 — C3.1 bloque de experiencia, índice, sin "Vivido" | ✅ (`4a691c6`) |
| Checkpoint 3 — C3.2 día como unidad, parada compacta, frescura del dato | ✅ en `develop` (v2–v6: `857b758`, `dfceaff`, `5c7f08b`, `3efd081`) |
| Checkpoint 3 — C3.3 presupuesto en tabla y "Lo que dejamos fuera" | ✅ (`3efd081`, PR #8) |
| Checkpoint 3 — C3.4 fotos | 🟡 portada (`3dcd013`) y días 1–3 con foto; días 4–13 sin foto (sigue igual a 2026-10-20; `npm run photo`, #19) |
| Checkpoint 3 — C3.5 mapa | ⬜ bloqueado por las coordenadas (1.10 §5); 74 lugares pendientes según `day:status` (2026-10-20) |
| Checkpoint 3 v6 — modelo de campings y criterio, días 1–3, ruta de un vistazo | ✅ (PR #8, 2026-10-07) |
| Días 1–3 de Islandia revisados con el autor | ✅ (`e8fff2e`, en `develop`) |
| Día 4 con parkings, mapas y tiempos del autor | ✅ PR #9, 2026-10-15 |
| Días 5–13 integrados en borrador | ✅ PR #14, 2026-10-15 (campings sin "Camping" en `short_name`, `8094987`); el contenido sigue en borrador |
| Diseño móvil y de escritorio de las secciones tras la ruta | ✅ PR #13 y #15, 2026-10-15; hueco y línea recuperados en PR #27 |
| Auditorías SEO técnica y WCAG 2.2 AA | ✅ PR #16 y #17, 2026-10-15; contraste de la pastilla en PR #33, enlace de salto en PR #42 |
| CI: tests, build, guía inválida, Lighthouse 100 móvil y escritorio, `test:ui` | ✅ en `develop` (PR #7 y #8) |
| CI: job `devices` (`test:devices`, iPhone con WebKit y Android con Chromium) | ✅ PR #9, 2026-10-15 |
| CI: comprobación de tipos (`astro check`) | ✅ PR #28, 2026-10-16 |
| CI: Lighthouse acepta 99 en móvil solo para la guía de 13 días (1.13 §5) | ✅ `4276f2b` |
| Herramientas del autor: `npm run photo` y `npm run day:status` | ✅ PR #19, 2026-10-15 |
| Avisos de calidad editorial (`WARNING`) en la validación | ✅ PR #20, 2026-10-15 |
| Portada que lista las guías del motor | ✅ PR #21, 2026-10-15; portada v2 en PR #31 (borrador) |
| Cabecera del sitio con "Guías" y "Sobre mí" | ✅ PR #29, 2026-10-16 |
| Borrador de una sola fuente: `noindex` y sitemap derivados de `status` | ✅ PR #34, 2026-10-16 |
| `DayCard` partido en `DaySheet` y SCSS en tres ficheros | ✅ PR #32, 2026-10-16 |
| Dependencias al día, 0 vulnerabilidades altas | ✅ PR #10 (2026-10-16) y #40 (2026-10-19, cierra #11) |
| Hub `/islandia/` | 🟡 en PR #26 (borrador), con #35 encima; hojas de decisiones del 2026-10-21 |
| Doc 1.13 (guía, hub y satélites) e investigación SEO | ✅ 1.13 mezclado el 2026-10-20 (#23); 🟡 SEO en PR #25 |
| Cabeceras HTTP, prueba de `/ir/`, tests de teclado, guía de despliegue | ✅ mezclados el 2026-10-20 con la integración #51 (#43, #44, #46, #47, #48; la 404 sigue en PR #45) |
| Fallo de teclado del bocadillo de duración | ✅ arreglado en #51, 2026-10-20 |
| Buscador mínimo `/buscar/` | 🟡 en PR #52 (borrador), pendiente de validar frente al BRIEF §P |
| Menú del sitio en móvil | ⬜ pedido el 2026-10-20; la rutina de la noche no dejó rama |
| Páginas legales (pendientes de tus datos) | ✅ |
| `/ir/[id]` y registro de afiliados | ✅ (sin partners activos; prueba en `tests/pages/affiliate-route.test.ts`) |
| `robots.txt`, sitemap, canonical, Open Graph | ✅ |
| Guía de Alsacia como borrador con variantes | ✅ |
| Guía de Egipto como borrador (esquema antiguo) | 🟡 en PR #12 |

### El modelo de datos, tal como está

Las enmiendas están documentadas en `docs/1.7.2_data_contract.md`:

- **Campings como lugares** (Enmienda 1.12, 2026-10-06): un camping es un
  lugar `type: accommodation` con `facilities`, `entry` (precio actual con
  fecha) y `source_url`; lo nuestro (lo que pagamos, la opinión, la noche) va
  en `accommodation.picks[]`, que referencia el `place_id`.
- **`overnight` por `place_id`** (Enmienda 1.12): nunca un nombre. `null` =
  noche fuera de camping (decisión del autor, 2026-10-07). Inexistente o de
  otro tipo → error de validación.
- **`how_we_choose` y `route_decisions`** sustituyen a `our_criteria`
  (Enmienda 1.12). `route_decisions` son pares `{ decision, reason }`; los
  descartes de parada siguen en `skip_reason`.
- **Tiempos de visita:** `duration_max_min` (rango, 2026-10-06) y
  `duration_note` (qué incluye el límite superior; bocadillo en la tarjeta,
  2026-10-07).
- **Parking:** `parking` estructurado con fecha (Enmienda C3, 2026-10-04),
  `period_hours` (2026-10-06), `shared_with` (aparcamiento de otro lugar,
  p. ej. Gljúfrafoss con Seljalandsfoss, 2026-10-07) y `free_nearby`
  (aparcamiento gratuito al lado de uno de pago, 2026-10-08). **`free_nearby`
  solo existe en la rama del día 4 (PR #9)**; el resto está en `develop`.
  (Desde el 2026-10-15, con #9, también `free_nearby` está en `develop`)
- **Tarjeta de día** (Enmienda C3, 2026-10-04): `photo`, `highlight`, `drive`,
  `overnight` en el día y `short_name` en el lugar.

### Verificado, no supuesto

En `develop` (`b288e69`), el 2026-10-21, en la rutina de deberes:

```
npm ci                    exit 0
npm run content:validate  pasa; 100 avisos, los mismos que el 2026-10-20
npm run day:status        0 de 13 días cerrados; 74 lugares con coordenadas
                          pendientes (71 cuando entre #50); foto y "lo mejor
                          del día" faltan en 4–13
```

En `develop` (`dc83129`), el 2026-10-20 (histórico):

```
npm ci                    exit 0
npm run content:validate  pasa; 100 avisos: 87 lugares con datos caducados,
                          10 campings con precio de hace más de 12 meses,
                          2 de estilo (gullfoss, seljalandsfoss) y 1 del día 1
                          (parada reykjavik sin travel_to_next_min)
npm run day:status        0 de 13 días cerrados; 74 lugares con coordenadas
                          pendientes; foto y "lo mejor del día" faltan en 4–13
```

De las PR puestas al día con `develop` la noche del 19 de octubre (no se ha
repetido aquí): tienen typecheck limpio, 260–275 tests en verde, Lighthouse a
100 salvo la guía de 13 días en móvil (99, excepción del 1.13 §5) y `test:ui`
en verde.

Lo que sigue es del 2026-10-15 y queda como histórico:

En `develop` (`c68ff44`), el 2026-10-15, en esta sesión:

```
npm test                  158 tests, 158 en verde
npm run build             exit 0, 7 páginas
```

De la CI y de las PR (no repetido aquí):

```
Lighthouse                100 / 100 / 100 / 100, móvil y escritorio, mediana de 3,
                          en /, Alsacia e Islandia (gate de la CI desde PR #7)
guía inválida             la CI comprueba que el build falla
test:ui                   en verde en develop y en #9, #13, #15, #16, #17;
                          en rojo en #14 (línea de la noche de los días 11 y 12)
test:devices              15 iPhone (WebKit) + 8 Android (Chromium) en la CI;
                          en verde en #9, #13, #15, #16, #17; en rojo en #14
guía borrador             noindex presente y fuera del sitemap
```

Con las secciones nuevas (PR #13) el HTML de la guía queda a ~100 bytes del
umbral de unos 43,8 KB comprimidos a partir del cual Lighthouse móvil baja a
99. Cualquier PR que añada marcado o CSS a la guía tiene que compensarlo.

### Comprobaciones de interfaz y dispositivos

- **`npm run test:ui`** (`scripts/ui-check.ts`, en `develop`): capas de los
  paneles y líneas de las tarjetas de día en móviles de 350 a 414 px, en
  Chromium. Las comprobaciones comunes viven en `scripts/ui-shared.ts` (en la
  rama del día 4).
- **`npm run test:devices`** (`scripts/ui-devices.ts`, en PR #9): 23 perfiles
  de Playwright. Comprueba que no haya scroll horizontal, las líneas de las
  tarjetas, los tres paneles, el bocadillo del tiempo, el área segura y la
  carga de fotos, y avisa de objetivos táctiles < 44 px. Sube capturas como
  artefacto `ui-devices`.
- **Regla de filas de la línea de ruta:** 2 filas; 3 desde 7 paradas (decisión
  del autor, 2026-10-08, `1297f88`); en PR #14 pasa a 3 desde 6, 4 desde 9 y
  6 desde 12, **pendiente de que la apruebes**.
- **Avisos que siguen abiertos:**
  - 320 px (Galaxy S9+), por debajo de la escala de diseño de 350 px.
  - Objetivos táctiles de menos de 44 px. PR #17 amplía a 44 px la "i", el
    enlace Mapa, el de la noche y "Gratis"; el resto queda como su propuesta P5.
- **Limitación:** WebKit en Linux no es Safari de iOS. Quedan por mirar en un
  iPhone real la pastilla del índice con la barra de Safari, las hojas
  inferiores frente al indicador de inicio, la vista horizontal con la muesca
  y el cierre del bocadillo (comentario en PR #9).

---

## Lo primero al volver (2026-10-22)

La lista completa, con tiempos, está en [DEBERES.md](DEBERES.md). En corto:

1. **Mirar la portada de #69 en el móvil y decidir sus textos** (60 min):
   el H1, "Hola, somos David y Natalia" frente a `/sobre-mi/` en singular,
   el día de muestra, la cifra, el buscador y el pie. Y decidir si se mezcla
   #69 entera o PR a PR.
2. **Contestar las hojas de decisiones del hub y la 404 y mezclar #25 → #26
   → #35 y #55 → #65 → #45** (65 min). #31 ya va dentro de la portada.
3. **Despliegue con el repaso de #57** (50 min): #45 antes de `main`,
   `NODE_VERSION = 24` en Cloudflare, la PR `develop` → `main` y
   `docs/DESPLIEGUE.md`.
4. **Contenido y datos:** #50, las coordenadas, los textos y fotos de los
   días 4 a 13, y los 98 datos caducados de #56, que la rutina no pudo
   comprobar porque la red de la nube bloquea las webs oficiales.
5. **Tailandia (#54):** ¿se adapta la rutina semanal al formato del motor?

Nada se ha mezclado desde el 20: `develop` sigue en `b288e69`.

### Guía de Islandia: qué falta por día (2026-10-22)

Salida de `npm run day:status` en `develop` (`b288e69`): igual que el 21,
porque `develop` no ha cambiado. 74 lugares con coordenadas pendientes, 0 de
13 días cerrados. `npm run content:validate` da los mismos 100 avisos.

| Día | Foto | Lo mejor | Conducción | Noche | Duraciones | Paradas | Pend. |
|---|---|---|---|---|---|---|---|
| 1 | ✅ | ✅ | ✅ | camping | ✅ | ✅ (2) | 1 |
| 2 | ✅ | ✅ | ✅ | camping | ✅ | 3 de 4 | 5 |
| 3 | ✅ | ✅ | ✅ | camping | ✅ | 5 de 9 | 6 |
| 4 | ❌ | ❌ | estimada | camping | ✅ | 5 de 14 | 9 |
| 5 | ❌ | ❌ | ✅ | camping | estimadas | 4 de 4 | 14 |
| 6 | ❌ | ❌ | estimada | fuera | estimadas | 9 de 9 | 21 |
| 7 | ❌ | ❌ | estimada | fuera | estimadas | 9 de 9 | 26 |
| 8 | ❌ | ❌ | estimada | camping | estimadas | 5 de 5 | 14 |
| 9 | ❌ | ❌ | estimada | camping | estimadas | 8 de 8 | 19 |
| 10 | ❌ | ❌ | estimada | camping | estimadas | 5 de 5 | 19 |
| 11 | ❌ | ❌ | estimada | camping | estimadas | 5 de 5 | 17 |
| 12 | ❌ | ❌ | ✅ | camping | estimadas | 12 de 12 | 29 |
| 13 | ❌ | ❌ | ✅ | — | estimadas | 1 de 2 | 4 |

Cuando entre #50, el día 8 (Stuðlagil), el 11 (Grafarkirkja) y el 12
(Landbrotalaug) pierden la coordenada pendiente, y el total baja a 71 lugares.

## Lo primero al volver (2026-10-21, histórico)

La lista completa, con tiempos, está en [DEBERES.md](DEBERES.md). En corto:

1. **Contestar las hojas de decisiones y mezclar #25 → #26 → #35 → #31 →
   #45** (70 min). Es lo que deja publicables el hub, la portada y la 404.
   Si solo hay 15 minutos: #26 preguntas 1, 2 y 8, y #35 pregunta 1.
2. **Despliegue:** la rama de producción ya está decidida (A). Falta abrir la
   PR `develop` → `main` y seguir `docs/DESPLIEGUE.md` (~31 min).
3. **Menú y buscador:** validar #52 frente al BRIEF §P y decidir si
   `/buscar/` lista ya los borradores. El menú no tiene PR: la rutina no
   dejó rama.
4. **#50:** las dos preguntas (desde qué parking cuentan los 5 km de
   Stuðlagil y los `drive` de los días 8 y 11) y mezclarla.
5. **Contenido de Islandia:** las 24 coordenadas erróneas que quedan, fotos y
   "lo mejor del día" de los días 4 a 13, las noches y los paneles.

Seis de las ocho rutinas de la noche no dejaron rama ni PR (ver "Lo que dejó
la noche del 20 al 21"). Recomendación pendiente: mover el repo local fuera
del Escritorio, porque iCloud crea copias " 2" de los ficheros.

### Guía de Islandia: qué falta por día (2026-10-21, histórico)

Salida de `npm run day:status` en `develop` (`b288e69`), igual que el
2026-10-20. Todos los días están en `develop`.
"Paradas" cuenta las paradas con algo pendiente (parking, ficha de mapa o
coordenadas) frente al total del día; ✅ quiere decir que no queda ninguna.
"Pend." es el total de pendientes del día.

| Día | Foto | Lo mejor | Conducción | Noche | Duraciones | Paradas | Pend. |
|---|---|---|---|---|---|---|---|
| 1 | ✅ | ✅ | ✅ | camping | ✅ | ✅ (2) | 1 |
| 2 | ✅ | ✅ | ✅ | camping | ✅ | 3 de 4 | 5 |
| 3 | ✅ | ✅ | ✅ | camping | ✅ | 5 de 9 | 6 |
| 4 | ❌ | ❌ | estimada | camping | ✅ | 5 de 14 | 9 |
| 5 | ❌ | ❌ | ✅ | camping | estimadas | 4 de 4 | 14 |
| 6 | ❌ | ❌ | estimada | fuera | estimadas | 9 de 9 | 21 |
| 7 | ❌ | ❌ | estimada | fuera | estimadas | 9 de 9 | 26 |
| 8 | ❌ | ❌ | estimada | camping | estimadas | 5 de 5 | 14 |
| 9 | ❌ | ❌ | estimada | camping | estimadas | 8 de 8 | 19 |
| 10 | ❌ | ❌ | estimada | camping | estimadas | 5 de 5 | 19 |
| 11 | ❌ | ❌ | estimada | camping | estimadas | 5 de 5 | 17 |
| 12 | ❌ | ❌ | ✅ | camping | estimadas | 12 de 12 | 29 |
| 13 | ❌ | ❌ | ✅ | — | estimadas | 1 de 2 | 4 |

Ningún día tiene texto en `overnight_note`. Según el informe de #30, los
paneles de los días 3, 6, 8 y 9 pasan de 150 palabras.

Cuando entre #50, el día 8 (Stuðlagil), el 11 (Grafarkirkja) y el 12
(Landbrotalaug) pierden la coordenada pendiente, y el total baja a 71 lugares.

## Lo primero al volver (2026-10-20)

(Histórico. El 20 de octubre se mezclaron #23 y la integración #51, y se
decidieron el H1 y el `<title>` del hub, Sky Lagoon, la gente en septiembre y
la rama de producción.)

La lista completa, con tiempos, está en [DEBERES.md](DEBERES.md). En corto:

1. **Revisar la cadena #23 → #25 → #26 → #35.** Es el doc 1.13, el SEO, el
   hub y lo práctico al hub. La decisión que más desbloquea es el H1 y el
   `<title>` del hub, que dejan abiertos a la vez #25 y #26.
2. **Despliegue:** elegir la rama de producción (#48; la recomendada es la A,
   `develop` → `main`) y después seguir `docs/DESPLIEGUE.md`. Las cabeceras de
   #43 y la 404 de #45 conviene tenerlas antes.
3. **Contenido de Islandia:** coordenadas (las 27 erróneas primero), fotos y
   "lo mejor del día" de los días 4 a 13, las noches (`overnight_note`) y las
   preguntas del informe de paneles (#30).
4. **Datos de fuera:** Keyword Planner y Trends (bloques de #25), tasa por km
   en island.is, Sky Lagoon y los precios de los campings.
5. **Más pequeñas:** #31 (textos de portada), #45, → y ≈ de #44 y la issue
   #41 (seguir en TS 6).

## Lo primero al volver (2026-10-15)

(Histórico. #9, #13, #14, #15, #16, #17 y #10 se mergearon el 15 y el 16 de
octubre. La línea de la noche se resolvió con la opción (a). Lo que sigue
abierto de aquí está en la sección de arriba y en [DEBERES.md](DEBERES.md).)

### 1. Mergear el día 4 (PR #9)

La CI está en verde y es la base de #13, #14, #16 y #17. Antes, los puntos
abiertos de la revisión automática del 2026-10-15:

- El `our_take` del día 4 sigue hablando solo de Skógafoss.
- El `drive` del día 4 pone 210 min; el comentario dice 205 y los tramos
  suman 206.
- Foss á Síðu: está como `visited` (10 min), pero su nota dice "la vimos
  desde el coche".
- El enlace "Mapa de ese parking" cae al parking de pago si falta
  `free_nearby.maps_url`.

### 2. Decidir lo que deja la PR #14 en rojo

La línea de la noche de los días 11 y 12 no cabe en una fila a 350–375 px en
el Chromium de la CI. Hay tres opciones:

- (a) `short_name` de los campings sin "Camping";
- (b) cambiar el diseño de esa línea;
- (c) aceptar dos filas en días largos.

Además: la nueva regla de filas y el nombre "Jökulsárlón" (antes "Laguna
Glaciar Jökulsárlón y Diamond Beach").

### 3. Revisar y mergear el resto de PR en borrador

#13 → #15 (secciones móvil y escritorio), #16 (SEO) y #17 (accesibilidad).
Cada una deja propuestas sin aplicar que necesitan tu decisión: ver
[BACKLOG.md](BACKLOG.md). En #13 hay una regresión: el selector de Sass
`& + &` dentro de `[data-design="v2"]` nunca coincide, así que se pierde el
hueco entre zonas de "Dónde dormir". #15 lo documenta y no lo restaura.

### 4. #10 (dependencias) y #12 (Egipto)

- **#10** está en verde. Sube Playwright a 1.64, y los jobs `test:ui` y
  `devices` dependen de sus perfiles de dispositivo: conviene ver la CI de #9
  después de mergearla.
- **#12** usa el esquema antiguo, no el motor. Decide si Egipto debe pasar al
  motor antes de seguir.

### 5. Lo que solo puedes hacer tú

Lo de la guía de Islandia, día a día, en la tabla de abajo. Además:

- [ ] Datos identificativos en `privacidad` y `aviso-legal`.
      **Bloquea recoger el primer correo.**
- [ ] `sobre-mi` escrita en primera persona (también la pide #16 para el
      `author` del schema Article).
- [ ] Paleta, tipografía e icono de marca (`theme-color` y
      `apple-touch-icon` dependen de ello).
- [ ] Decidir Islandia o Mallorca como laboratorio SEO (1.11 §10), con los
      datos de Keyword Planner.

### Guía de Islandia: qué falta por día (2026-10-15, histórico)

Datos de la rama de #14, que incluye el día 4. Las columnas "Parking" y
"Ficha de mapa" cuentan las paradas visitadas con `parking` y con `maps_url`
en su lugar. "Coord. pend." cuenta los lugares visitados cuyas `notes` dicen
"pendiente de confirmar".

| Día | Dónde está | Foto | Lo mejor del día | Parking | Ficha de mapa | Coord. pend. | Duraciones |
|---|---|---|---|---|---|---|---|
| 1 | `develop`, revisado | ✅ | ✅ | 2/2 | 2/2 | 0 | confirmadas |
| 2 | `develop`, revisado | ✅ | ✅ | 4/4 | 1/4 | 1 | confirmadas |
| 3 | `develop`, revisado | ✅ | ✅ | 6/6 | 6/6 | 2 | confirmadas |
| 4 | PR #9, revisado | ❌ | ❌ | 9/9 | 9/9 | 0 | confirmadas el 2026-10-08 **(a confirmar:** el YAML aún mezcla textos de estimación) |
| 5 | PR #14, borrador | ❌ | ❌ | 0/3 | 0/3 | 3 | estimadas |
| 6 | PR #14, borrador | ❌ | ❌ | 3/6 | 0/6 | 4 | estimadas |
| 7 | PR #14, borrador | ❌ | ❌ | 2/7 | 0/7 | 7 | estimadas |
| 8 | PR #14, borrador | ❌ | ❌ | 4/4 | 0/4 | 4 | estimadas |
| 9 | PR #14, borrador | ❌ | ❌ | 5/6 | 0/6 | 5 | estimadas |
| 10 | PR #14, borrador | ❌ | ❌ | 1/5 | 0/5 | 5 | estimadas |
| 11 | PR #14, borrador | ❌ | ❌ | 3/5 | 0/5 | 5 | estimadas |
| 12 | PR #14, borrador | ❌ | ❌ | 9/12 | 0/12 | 10 | estimadas |
| 13 | PR #14, borrador | ❌ | ❌ | 1/1 | 1/1 | 0 | estimadas |

Además, en los días 5 a 13 (PR #14):

- Confirmar el `drive` de cada día y quitar "Estimación pendiente de
  confirmar por el autor.".
- Notas de las noches 6 y 7 (`overnight_note`).
- Noches que no cuadran con las notas: 5, 8, 10 y 11.
- Djúpavogskörin (¿poza termal?), el túnel de Vaðlaheiði, Sky Lagoon y si
  hubo paseo por Reikiavik el día 13.

El informe `docs/fuentes/coordenadas-por-confirmar.md` (en la rama de #14,
`136b7ae`) revisa 74 lugares:

| Estado | Lugares |
|---|---|
| OK | 13 |
| Revisar | 28 |
| Erróneos (> 2 km) | 27 |
| Sin verificar | 6 |

Los más graves son Grafarkirkja (37,8 km) y Stuðlagil (18,3 km). No se
publica sin corregirlos: el botón "Mapa" usa esas coordenadas.

---

## Pendientes técnicos

### Protección de ramas

`main` y `develop` exigen PR con los checks `build` y `lighthouse` en verde, y
no admiten force-push ni borrado. Si `devices` se añade como check obligatorio
cuando entre #9: **(a confirmar)**.

### Tareas programadas en la nube

Rutinas de este proyecto, independientes de tu equipo. Horas en UTC. Se
gestionan en https://claude.ai/code/routines.

**Recurrentes:**

| Rutina | Cuándo | Qué hace |
|---|---|---|
| Revisión nocturna de PRs | Cada día, 01:00 | Revisa cada PR abierta con cambios nuevos frente a `CLAUDE.md` y deja un comentario. Solo lee y comenta. Es la que firma las "Revisión automática" de las PR. |
| Auditoría de dependencias | Lunes, 06:00 | `npm audit`, `npm outdated` y build, y comprueba que el esquema rechaza una guía inválida. Abre una PR para parches y menores (#10) y una issue para mayores o vulnerabilidades (#11). Nunca mergea. |
| Estructurar una guía desde las notas | Miércoles, 06:00 | Estructura (no redacta, D2) el primer destino con notas y sin guía, en borrador. El 2026-10-14 abrió #12 (Egipto). |
| Caducidad de datos (D8) | Día 1 de cada mes, 06:00 | Solo lectura: busca datos caducados o sin fecha y `PENDIENTE AUTOR` en guías publicadas, y abre una issue si hay hallazgos. |

**Puntuales, programadas para la madrugada del 2026-10-15:**

| Rutina | Hora | Qué hace |
|---|---|---|
| Herramientas del autor | 02:30 | `npm run photo` (añadir una foto a un día) y `npm run day:status` (qué falta por día). Rama `feature/author-tools`. |
| Avisos de calidad editorial | 03:30 | Avisos (`WARNING`) en la validación de contenido. Rama `feature/content-quality-warnings`. |
| Revisión de calidad del código de la guía | 04:30 | Informe y refactors sin cambio de HTML. Rama `refactor/guide-code-quality`. |
| Portada | 05:30 | Que la portada liste la guía de Islandia desde el motor. Rama `feature/landing-lists-engine-guides`. |

Hay también dos recordatorios de seguimiento de las sesiones que abrieron #16
y #17, y esta misma rutina de estado y backlog.

**Ojo:** la auditoría de dependencias (paso de la guía inválida), la de
caducidad y la de estructurar guías leen `src/content/guides/*.json`, el
esquema antiguo. La guía de Islandia vive en el motor (YAML), así que la
rutina de caducidad no la revisa. Si eso es intencionado: **(a confirmar)**.

### Otros

- [ ] Conectar Cloudflare Pages al repo y desplegar `develop` a un dominio de
      pruebas. (Paso a paso en `docs/DESPLIEGUE.md`, #48. Rama de producción
      decidida el 2026-10-20: opción A, PR `develop` → `main` y se despliega
      `main`)
- [ ] Analítica sin cookies (Umami o Plausible). (#48 recomienda Umami Cloud
      gratis)
- [ ] Dominio `solohazlamaleta.com`: `astro.config.mjs` ya lo da por hecho.
- [x] Issue #11: `http-cache-semantics` y `sharp`. (PR #40, 2026-10-19)
- [ ] El build avisa de unos 90 lugares con `verified_at` caducado (nota de
      #16). (87 a 2026-10-20, más el precio de los 10 campings)
- [ ] Issue #41: TypeScript 7 bloqueado por `astro check`. Seguir en 6.

---

## Cómo usar los agentes

Están en `.claude/agents/`. Se invocan por nombre:

| Agente | Para qué |
|---|---|
| `architect` | Esquema, estructura, dependencias y decisiones técnicas, y la implementación de lo que decide |
| `qa` | Verificar ejecutando, antes de mergear nada |
| `seo` | Palabras clave, datos estructurados, enlazado interno |

Se redujeron a tres el 2026-09-28 (PR #3). Los otros siete (`frontend-dev`,
`junior-dev`, `product-owner`, `marketing`, `social-content`, `devops` y
`ui-designer`) describían un equipo que no existe: el trabajo lo hace una
persona con ~6 h/semana, y mantener tantas definiciones sincronizadas era
coste sin retorno. Están en el historial de git si alguna vez hacen falta.

`_SHARED.md` tiene gitflow, el estándar de código y la definición de terminado.

El trabajo largo sin el equipo encendido no lo hacen estos agentes, que se
ejecutan en local, sino las rutinas en la nube de la sección anterior.
