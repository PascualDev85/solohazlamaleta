# Backlog

Tareas pequeñas, cada una abarcable en una sesión corta. Ordenadas por lo que
desbloquea antes. Marca la casilla al cerrarlas.

Las que llevan **(tuya)** dependen de ti y nadie más puede hacerlas.

Última revisión: 2026-10-15. El estado detallado está en [ESTADO.md](ESTADO.md).

---

## Bloquea la automatización — urgente

- [x] **(tuya) Mergear el PR #2 a `develop`.** Las notas de viaje viven en
      `docs/fuentes/`, que solo existía en esa rama. La rutina que estructura
      guías trabaja sobre `develop`, así que el 23 de septiembre se ejecutó,
      no encontró las notas y se paró sin hacer nada (correctamente: se negó
      a inventar). (PR #2, mergeado el 2026-09-28; la rutina ya trabaja: abrió
      #12 el 2026-10-14)

## Guía de Islandia — desbloquea el cierre del Checkpoint 3

- [ ] **(tuya)** Revisar y mergear el día 4 (PR #9). Es la base de #13, #14,
      #16 y #17. Antes, cerrar lo que dejó abierto la revisión automática:
      - [ ] `our_take` del día 4: solo habla de Skógafoss y es texto visible.
      - [ ] `drive` del día 4: 210 min frente a 205 en el comentario y 206 en
            los tramos. Dejar un solo número.
      - [ ] Foss á Síðu: está como `visited` pero "la vimos desde el coche".
      - [ ] ¿Skool Beans y The Soup Company son un sitio o dos?
- [ ] **(tuya)** Decidir cómo cabe la línea de la noche de los días 11 y 12.
      Es lo que deja en rojo la CI de #14. Opciones:
      (a) `short_name` de los campings sin "Camping";
      (b) cambiar el diseño de esa línea;
      (c) aceptar dos filas en días largos.
- [ ] **(tuya)** Aprobar o cambiar la nueva regla de filas de la línea de
      ruta en #14 (3 desde 6 paradas, 4 desde 9, 6 desde 12). La revisión
      sugiere otro formato para el día 12, porque 6 filas ya son una lista.
- [ ] **(tuya)** Decidir los nombres acortados en #14 para que quepan en una
      línea, sobre todo "Jökulsárlón" (antes "Laguna Glaciar Jökulsárlón y
      Diamond Beach").
- [ ] **(tuya)** El `name` de los campings. En #14 se pasan a español
      ("Camping Skaftafell", "Camping Laugar"…). En el registro siguen
      "Camping Svínafell (Skaftafell)" frente a "Camping Skaftafell", y el
      `short_name` con "Camping" es el que no cabe en la línea de la noche.
- [ ] **(tuya)** Mergear #13 (secciones en móvil) y después #15 (escritorio).
- [ ] Arreglar en #13 los selectores Sass `& + &` dentro de
      `[data-design="v2"]`, que nunca coinciden: el hueco entre zonas de
      "Dónde dormir", la línea entre los pasos de "Cómo llegamos", el
      `padding-top` tras los chips de noche y la separación entre partes de
      "Nuestro criterio". Cuesta unos 60 B: ojo al margen de bytes de la guía.
- [ ] **(tuya)** Revisar y mergear #16 (SEO) y #17 (accesibilidad).

### Contenido de Islandia, por día (tuya)

Días 1–3 revisados y en `develop`; día 4 revisado en PR #9; días 5–13 en
borrador en PR #14. El detalle está en la tabla de [ESTADO.md](ESTADO.md).

- [ ] **(tuya)** Foto de cada día y su `alt`, días 4 a 13.
- [ ] **(tuya)** "Lo mejor del día" (`highlight`), días 4 a 13.
- [ ] **(tuya)** Parkings (`parking`) que faltan: día 5 (0/3), 6 (3/6),
      7 (2/7), 9 (5/6), 10 (1/5), 11 (3/5) y 12 (9/12).
- [ ] **(tuya)** Fichas de Google Maps (`maps_url`): día 2 (1/4) y días
      5 a 12 (ninguna).
- [ ] **(tuya)** Confirmar las coordenadas con el informe
      `docs/fuentes/coordenadas-por-confirmar.md` (rama de #14):
      - 27 erróneas, 28 por revisar y 6 sin verificar;
      - las peores son Grafarkirkja (37,8 km), Stuðlagil (18,3 km),
        Landbrotalaug, Lækjavík y Víðimýrarkirkja;
      - el informe se borra cuando estén confirmadas.
      Bloquea el mapa (C3.5) y publicar.
- [ ] **(tuya)** Confirmar las duraciones de los días 5–13. Después, quitar
      los comentarios `# duraciones estimadas` y esos días de `estimatedDays`.
- [ ] **(tuya)** Confirmar el `drive` de cada día y quitar "Estimación
      pendiente de confirmar por el autor.".
- [ ] **(tuya)** Notas de las noches 6 y 7 (`overnight_note`).
- [ ] **(tuya)** Revisar las noches 5, 8, 10 y 11, que no cuadran con las
      notas del viaje.
- [ ] **(tuya)** Dudas de contenido de #14:
      - Djúpavogskörin (¿poza termal?);
      - el túnel de Vaðlaheiði (de peaje);
      - Sky Lagoon;
      - si hubo paseo por Reikiavik el día 13;
      - Mígandifoss;
      - el trekking de Svínafellsjökull (5 h o 6 h, y Icelandia lo da por
        suspendido).
- [ ] Datos de acceso en prosa sin fecha propia ("aparcamiento gratuito" en
      `notes`, el horario de Glaumbær). Pasarlos a
      `parking: { price: 0, verified_at }` cuando se confirmen.
- [ ] Día 5: el trekking lleva `travel_to_next_min: 25` en "coche", pero son
      ≈ 5 de coche + ≈ 20 de sendero. Resolver antes de publicar.

## Bloquean la publicación

- [ ] **(tuya)** Rellenar Alsacia con lo que viviste → ver
      [PENDIENTE-ALSACIA.md](PENDIENTE-ALSACIA.md). Sin esto la guía no sale
      de borrador.
- [ ] **(tuya)** Confirmar el año del viaje de Alsacia. Ahora consta
      `2025-12` en `meta.tripDone.date` porque lo asumí yo.
- [ ] **(tuya)** Datos identificativos en `privacidad` y `aviso-legal`.
      Obligatorio antes de recoger el primer correo.
- [ ] **(tuya)** Escribir `sobre-mi` en primera persona. Es la página que
      sostiene la credibilidad del proyecto entero. Además, #16 propone
      enlazarla como `author` del schema Article.
- [ ] **(tuya)** Paleta, tipografía e icono de marca. Los colores actuales
      cumplen contraste pero son provisionales. De ellos dependen
      `theme-color` y `apple-touch-icon` (#16).
- [ ] **(tuya)** Fotos propias de Alsacia, verticales y horizontales.
- [ ] **(tuya)** Egipto (#12) está en el esquema antiguo (`src/content/`).
      Decidir si pasa al motor antes de seguir. Antes de quitar el `draft`:
      - la cronología del día 8 (`travelToNextMin` 75 → ¿15?);
      - el Templo de Luxor a las 19:30;
      - el globo y Orange Bay sin parada;
      - los precios sin fecha;
      - quitar los nombres de guías y conductores y los pagos de PayPal.

## Web — pendientes de la auditoría de QA

- [x] `.skip-link` ya no usa `left: -9999px`: se oculta con el mixin
      `visually-hidden` hasta que recibe el foco (2026-10-19).
- [x] Avisar de que el enlace de Google Maps abre en pestaña nueva. En móvil
      es lo que más desorienta. (Guía de Islandia: texto oculto "se abre en
      una pestaña nueva" en `DayStop` y `CampsiteCard`, `857b758`/`3efd081`.
      En Alsacia: a confirmar)
- [x] `<article class="guide">` no tenía reglas CSS propias. Ahora las tiene:
      `[data-design="v2"] .guide` en `src/styles/v2/_guide.scss`
      (`d3d7e4d`).
- [x] La ruta `/ir/{id}` nunca se ha ejecutado en el repo: todos los
      partners están inactivos, así que no genera ninguna página. #16 la probó
      activando un afiliado temporal (sin commitear): salen `noindex` y
      `rel="sponsored nofollow noopener"`. Falta una prueba que quede en el
      repo. (2026-10-20: `tests/pages/affiliate-route.test.ts` renderiza la
      página real con un afiliado de prueba de `tests/fixtures/`, y
      `affiliateRoutes` en `src/lib/affiliate-routes.ts` tiene sus tests)

## Web — accesibilidad y dispositivos

Salen de las PR #9, #14 y #17.

- [ ] **(tuya)** Soporte de 320 px (Galaxy S9+): por debajo de la escala de
      diseño de 350 px, las líneas de las tarjetas saltan de fila. Decidir si
      se amplía la escala o se queda como aviso.
- [ ] Objetivos táctiles de menos de 44 px. #17 amplía a 44 px la "i", el
      enlace Mapa, el de la noche y "Gratis". Quedan:
      - los días de la tira (36×36);
      - "Ver N paradas más" (36);
      - "Lo mejor del día" (24–29);
      - Mapa/Web del camping (28);
      - las migas (32);
      - el título de la ruta (30).
      Ampliarlos cambia el espaciado visible (propuesta P5 de #17).
- [ ] **(tuya)** Contraste de "Hasta el día 13": 4,16:1, falla 1.4.3. Subir
      la opacidad a 0,68 daría ~6,7:1 (P1 de #17).
- [ ] Nombres de parada largos que se montan sobre el tiempo de visita a
      ≤ 414 px en los días 5–13 (P2 de #17). Puede quedar resuelto con los
      nombres acortados de #14: comprobarlo tras el merge.
- [ ] **(tuya)** Propuestas de #17 sin aplicar:
      - texto de las tarjetas que no crece con la fuente del navegador (P3);
      - `prefers-contrast: more` (P4);
      - cabecera en las tarjetas de camping (P6);
      - nombre del título de la ruta (P7).
- [ ] **(tuya)** Probar en un iPhone real:
      - la pastilla del índice con la barra de Safari;
      - las hojas inferiores frente al indicador de inicio;
      - la vista en horizontal con la muesca;
      - el cierre del bocadillo.
- [x] Bocadillo de `free_nearby` (#9): "Mapa" solo si el parking gratis
      tiene su `maps_url`, `role="note"` y sin el `id` que no usaba nadie
      (2026-10-19).

## Web — funcionalidad

- [ ] Enlace a `/sobre-mi/` en la cabecera, no solo en el pie. La prueba de
      autoría debe estar por encima del pliegue.
- [ ] Descarga KML por guía, para importar en Google My Maps (§6).
- [ ] Página hub de destino (`/{destino}/`). Ahora mismo no existe y las
      guías cuelgan de una ruta sin índice. Para Islandia, el 1.10 §6 la deja
      fuera del Checkpoint 3 y el 1.11 §8 la condiciona a validar antes las
      palabras clave.
- [ ] Enlazado interno automático hub ↔ guías ↔ relacionadas, generado desde
      el dato y no mantenido a mano.
- [x] Datos estructurados `Article` y `BreadcrumbList` (§7). El `FAQPage` ya
      está y sí corresponde a contenido visible. (Guía de Islandia,
      `64ca097`; #16 quita la miga a `/islandia/`, que da 404, y completa
      Article)
- [ ] **(tuya)** Propuestas SEO de #16:
      - `datePublished` (campo `published_at` en el modelo);
      - `author`, cuando exista `sobre-mi`;
      - imagen OG horizontal de 1200×630, con el encuadre elegido por ti;
      - `TouristTrip` ligero al salir de borrador.
- [x] Optimización de imágenes con `astro:assets` cuando haya fotos.
      (`getImage` en `GuidePhoto.astro` y en la página de Islandia,
      `d3d7e4d`)
- [ ] La portada no lista la guía de Islandia: solo se llega por URL. Hay una
      rutina programada para el 2026-10-15
      (`feature/landing-lists-engine-guides`).

## Web — rendimiento (cuando la guía de Islandia esté completa)

Medido el 2026-10-06 en la rama `feature/checkpoint3-diseno-v4`: Lighthouse
móvil 100/100/100, LCP 1,9 s, CLS 0, 0 ms de bloqueo, 170 KB en 21
peticiones. Nada es urgente; se revisa con la página terminada, no antes.

- [ ] **Margen de bytes del HTML de la guía**: con #13 queda a ~100 bytes del
      umbral (~43,8 KB comprimidos) a partir del cual Lighthouse móvil baja a
      99. Cualquier PR que añada marcado o CSS a la guía tiene que
      compensarlo.
- [ ] **Tamaño del DOM**: 2.022 elementos (Lighthouse avisa hacia 1.500).
      Crece porque cada día lleva en el HTML todas sus paradas y su panel
      "Ver día completo". Con 13 días va bien; medir de nuevo con todos los
      días rellenos (fotos, "Lo mejor del día") y aligerar si hace falta.
- [x] **Fuentes** (medido 2026-10-20, PR `perf/font-subsetting`): no se
      recortan. Ya son el subconjunto latino de Google (≈ 200 caracteres:
      Latin-1 y unas comillas y rayas), 118,5 KB las cuatro del v2. Con el
      margen mínimo para el contenido futuro (Latin Extended-A, →, ≈…) pesan
      ~146 KB (+23 %), y Literata y Fraunces no se reproducen idénticas desde
      las fuentes originales (cambia el render). Recortar solo a los ~110
      caracteres de hoy ahorraría ~40 KB, pero rompería con el primer nombre
      nuevo. Queda `npm run fonts:check` en la CI para que ningún carácter
      caiga en una fuente del sistema sin que se note. Detalle en el PR.
- [x] **CSS que bloquea el primer pintado** (2026-10-06): todo el CSS va
      incrustado en el HTML (`build.inlineStylesheets: 'always'` en
      `astro.config.mjs`). La guía pasó de 99 a 100 estable en móvil; LCP de
      las páginas pequeñas 1,2 → 1,1 s.

## CI y herramientas

- [x] Lighthouse 100 en móvil y escritorio como gate de la CI, y tests
      unitarios en la CI. (PR #7, 2026-10-06)
- [x] `test:ui` en la CI: capas de los paneles y líneas de las tarjetas.
      (PR #8, 2026-10-07)
- [ ] `test:devices` (iPhone con WebKit y Android con Chromium) en la CI.
      Está en #9; entra con su merge.
- [ ] El job `devices` repite `npm ci` y `build` y usa `npx --yes wait-on`
      sin versión fija. Coste menor de CI (revisión de #9).
- [ ] `scripts/ui-devices.ts` descarta en silencio los modelos que la versión
      de Playwright no conoce; `homeIndicator` no se lee. Revisar tras #10,
      que sube Playwright a 1.64.
- [ ] `scripts/ui-shared.ts`: el docblock de `dayCardLineIssues` quedó
      cortado.
- [ ] **(tuya)** Mergear #10 (dependencias) y decidir sobre la issue #11
      (`http-cache-semantics`, `sharp`).
- [ ] Las rutinas de caducidad (D8) y de estructurar guías, y el paso de
      "guía inválida" de la auditoría de dependencias, leen
      `src/content/guides/*.json` (esquema antiguo). La de caducidad no revisa
      la guía de Islandia (YAML del motor). Decidir si se adaptan.
- [ ] El build avisa de unos 90 lugares con `verified_at` caducado (nota de
      #16). Las revisiones de #9 y #14 señalan además lugares con
      `verified_at: 2025-09-15` que aún no se han verificado.

## Infraestructura

- [ ] Conectar Cloudflare Pages al repo y desplegar `develop` a un dominio de
      pruebas.
- [ ] **(tuya)** Registrar `solohazlamaleta.com`. `astro.config.mjs` ya lo da
      por hecho.
- [ ] Analítica sin cookies (Umami o Plausible).
- [ ] Alta en Search Console cuando haya dominio.

## Diseño

- [x] Dirección visual: tipografía editorial con Instrument Serif
      autoalojada (15 KB, precargada), itinerario como línea de tiempo,
      paleta verificada en claro y oscuro. Lighthouse sigue en 100.
- [ ] Revisar la dirección cuando existan fotos propias: la maqueta actual
      está pensada para sostenerse sin ellas.
- [ ] **(tuya)** Decisiones de #15 (escritorio):
      - datos del viaje en 4×1 o en 2×2;
      - `align-items: start` en las tarjetas de camping;
      - "Cómo elegimos" y "Errores y trampas" a dos columnas desde `lg`.
- [ ] **(tuya)** Mapa de la guía (C3.5). Bloqueado por las coordenadas.

## Contenido posterior

- [ ] Enmendar D6: decía Mallorca primero y vamos con Alsacia (y ahora con
      Islandia). Está justificado (es el viaje que puedes escribir ya), pero
      conviene dejarlo escrito en vez de saltárselo en silencio. Las
      decisiones viven ahora en `docs/BRIEF.md`.
- [ ] **(tuya)** Decidir Islandia o Mallorca como laboratorio SEO (1.11 §10),
      con los datos de Keyword Planner de ambos destinos.
- [ ] Mallorca sigue siendo la mejor apuesta de posicionamiento: long tail,
      8 años de experiencia real, competencia desactualizada.

---

## Cómo trabajar esto

Gitflow: rama desde `develop`, PR contra `develop`. `main` y `develop` están
protegidas y exigen `build` y `lighthouse` en verde.

```bash
git checkout develop && git pull
git checkout -b feature/lo-que-sea
# ...
gh pr create --base develop
```

Los agentes están en `.claude/agents/`. Antes de mergear cualquier cosa que
toque páginas, pásala por `qa`.
