# Backlog

Tareas pequeñas, cada una abarcable en una sesión corta. Ordenadas por lo que
desbloquea antes. Marca la casilla al cerrarlas.

Las que llevan **(tuya)** dependen de ti y nadie más puede hacerlas.

Última revisión: 2026-10-21. El estado detallado está en [ESTADO.md](ESTADO.md).
Lo tuyo, junto y por orden, en [DEBERES.md](DEBERES.md).

---

## Bloquea la automatización — urgente

- [x] **(tuya) Mergear el PR #2 a `develop`.** Las notas de viaje viven en
      `docs/fuentes/`, que solo existía en esa rama. La rutina que estructura
      guías trabaja sobre `develop`, así que el 23 de septiembre se ejecutó,
      no encontró las notas y se paró sin hacer nada (correctamente: se negó
      a inventar). (PR #2, mergeado el 2026-09-28; la rutina ya trabaja: abrió
      #12 el 2026-10-14)

## Guía de Islandia — desbloquea el cierre del Checkpoint 3

- [x] **(tuya)** Revisar y mergear el día 4 (PR #9). Es la base de #13, #14,
      #16 y #17. Antes, cerrar lo que dejó abierto la revisión automática:
      (PR #9, mergeado el 2026-10-15)
      - [ ] `our_take` del día 4: solo habla de Skógafoss y es texto visible.
            (Sigue igual en `develop` a 2026-10-20)
      - [ ] `drive` del día 4: 210 min frente a 205 en el comentario y 206 en
            los tramos. Dejar un solo número. (Sigue: `minutes: 210` y el
            comentario dice "203 min → 205")
      - [ ] Foss á Síðu: está como `visited` pero "la vimos desde el coche".
            (Ahora lleva `duration_note` "solo desde la carretera"; comprobar
            si basta)
      - [x] ¿Skool Beans y The Soup Company son un sitio o dos? (Uno: "Skool
            Beans Cafe", ficha confirmada por el autor el 2026-10-08)
- [x] **(tuya)** Decidir cómo cabe la línea de la noche de los días 11 y 12.
      Es lo que deja en rojo la CI de #14. Opciones:
      (a) `short_name` de los campings sin "Camping";
      (b) cambiar el diseño de esa línea;
      (c) aceptar dos filas en días largos.
      (Opción a, `8094987`; entró con #14 el 2026-10-15)
- [x] **(tuya)** Aprobar o cambiar la nueva regla de filas de la línea de
      ruta en #14 (3 desde 6 paradas, 4 desde 9, 6 desde 12). La revisión
      sugiere otro formato para el día 12, porque 6 filas ya son una lista.
      (Entró con #14, mergeado el 2026-10-15)
- [x] **(tuya)** Decidir los nombres acortados en #14 para que quepan en una
      línea, sobre todo "Jökulsárlón" (antes "Laguna Glaciar Jökulsárlón y
      Diamond Beach"). (Entró con #14; el informe de #30 mide 0 nombres que
      desborden, incluso a 320 px)
- [ ] **(tuya)** El `name` de los campings. En #14 se pasan a español
      ("Camping Skaftafell", "Camping Laugar"…). En el registro siguen
      "Camping Svínafell (Skaftafell)" frente a "Camping Skaftafell", y el
      `short_name` con "Camping" es el que no cabe en la línea de la noche.
      (Los `short_name` ya van sin "Camping". Queda solo decidir si
      "Camping Svínafell (Skaftafell)" se queda así)
- [x] **(tuya)** Mergear #13 (secciones en móvil) y después #15 (escritorio).
      (PR #13 y #15, mergeados el 2026-10-15)
- [x] Arreglar en #13 los selectores Sass `& + &` dentro de
      `[data-design="v2"]`, que nunca coinciden: el hueco entre zonas de
      "Dónde dormir", la línea entre los pasos de "Cómo llegamos", el
      `padding-top` tras los chips de noche y la separación entre partes de
      "Nuestro criterio". Cuesta unos 60 B: ojo al margen de bytes de la guía.
      (PR #27, mergeado el 2026-10-16)
- [x] **(tuya)** Revisar y mergear #16 (SEO) y #17 (accesibilidad).
      (PR #16 y #17, mergeados el 2026-10-15)

### Hub, satélites y portada — PR abiertas (tuya)

Salen de las PR #25, #26, #31, #35 y #45. Cada una tiene una hoja de
decisiones del 2026-10-21. Orden de mezcla: #25 → #26 → #35 → #31 → #45. El
detalle, en [DEBERES.md](DEBERES.md).

- [x] **(tuya)** Mergear #23 (doc 1.13). (Mezclado el 2026-10-20)
- [x] **(tuya)** H1 y `<title>` del hub. (Decidido el 2026-10-20: H1
      "Islandia" y `<title>` "Viajar a Islandia: qué ver, cuándo ir y lo
      práctico". Aplicado en #26; en #25, cambio mecánico pendiente)
- [x] **(tuya)** "Menos gente en septiembre". (2026-10-20: mucha en el
      Círculo Dorado y el sur, poca del este hacia el norte. Está en el hub,
      #26, y en el 1.13)
- [ ] **(tuya)** #25 (SEO): decidir "Ruta de 7 días", que choca con la regla
      de no duplicar por días. También el límite de la satélite "Costa sur" y
      el orden de las satélites. (En #25, hoja de decisiones)
- [ ] **(tuya)** #26 (hub): las fotos 16:9 en móvil, la foto de portada, las
      enmiendas del modelo, qué FAQ llevan `schema: true`, cómo sale el hub de
      borrador y el enlace "Islandia" en la cabecera. Además, revisar sus
      textos. (En #26, hoja de decisiones, 8 preguntas)
- [ ] `practical` (fianza, "Mosskógar solo efectivo") sin `verified_at`, en el
      hub y en `islandia.yaml` (#26, #35). (Pregunta 1 de la hoja de #26. La
      rutina `feature/practical-verified-at` del 2026-10-21 no dejó rama)
- [ ] **(tuya)** #35: el texto del enlace al hub. Al mergear #26, reapuntarla a
      `develop` para que pase la CI. (En #35, hoja de decisiones)
- [ ] #35: `href="/islandia/#practico"` escrito a mano; usar `guide.hub`.
      (Hecho en #35, `hubSectionHref`, falta mezclar)
- [ ] **(tuya)** #31 (portada v2): revisar los textos, la foto de cabecera en
      escritorio y la alineación de la cabecera en escritorio. (En #31, hoja
      de decisiones)
- [ ] Antes de la tercera guía: `alt` de `cover_image` en el modelo y un nombre
      visible del destino con tildes (#31).

### Contenido de Islandia, por día (tuya)

Días 1–3 revisados y en `develop`; día 4 revisado en PR #9; días 5–13 en
borrador en PR #14. El detalle está en la tabla de [ESTADO.md](ESTADO.md).
(Desde el 2026-10-15 los 13 días están en `develop`, con #9 y #14. Qué falta
en cada uno, siempre al día: `npm run day:status`)

- [ ] **(tuya)** Foto de cada día y su `alt`, días 4 a 13.
- [ ] **(tuya)** "Lo mejor del día" (`highlight`), días 4 a 13.
- [ ] **(tuya)** Parkings (`parking`) que faltan: día 5 (0/3), 6 (3/6),
      7 (2/7), 9 (5/6), 10 (1/5), 11 (3/5) y 12 (9/12).
- [ ] **(tuya)** Fichas de Google Maps (`maps_url`): día 2 (1/4) y días
      5 a 12 (ninguna).
- [ ] **(tuya)** Confirmar las coordenadas con el informe
      `docs/fuentes/coordenadas-por-confirmar.md` (rama de #14; en `develop`
      desde el 2026-10-15, sin ninguna corregida todavía; `day:status`
      cuenta 74 lugares):
      - 27 erróneas, 28 por revisar y 6 sin verificar;
      - las peores son Grafarkirkja (37,8 km), Stuðlagil (18,3 km),
        Landbrotalaug, Lækjavík y Víðimýrarkirkja; (Grafarkirkja,
        Landbrotalaug y Stuðlagil, en #50; quedan 24 erróneas)
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
      - ~~Sky Lagoon~~ (no fueron, 2026-10-20);
      - si hubo paseo por Reikiavik el día 13;
      - Mígandifoss;
      - el trekking de Svínafellsjökull (5 h o 6 h, y Icelandia lo da por
        suspendido).
- [ ] **(tuya)** Paneles "Ver día completo" (informe de #30,
      `docs/fuentes/informe-paneles-y-nombres.md`):
      - recortar los días 6, 3 y 9, que repiten frases dentro del panel
        (≈ 15 min);
      - contestar las preguntas de los días 1, 2, 5, 7, 10, 11 y 13 (la
        noche, lo que haríamos distinto y el plan B).
- [x] **(tuya)** ¿Fuisteis a Sky Lagoon? Lo piden el panel del día 13 y la
      satélite de baños termales (#25). (No: queda fuera, 2026-10-20; ya
      reflejado en #25)
- [ ] **(tuya)** #50: ¿la "ruta de unos 5 km, unos 45 minutos de ida" de
      Stuðlagil cuenta desde el parking de la ficha o desde el del primer
      puente? ¿Confirmas los `drive` de los días 8 y 11 (+12 y +27 km en línea
      recta con las coordenadas buenas)? (En #50)
- [ ] Aviso de `content:validate`: el día 1 tiene `drive` y la parada
      `reykjavik` sin `travel_to_next_min`.
- [ ] **(tuya)** Dos avisos de estilo de `content:validate`: "una de las
      cascadas más" en `gullfoss`, y "espectacular" en las `notes` de
      `seljalandsfoss`.
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
      Además faltan `meta.tripDone` (con quién fue el viaje) y si el
      presupuesto es por persona. La rama va 108 commits por detrás de
      `develop` (a 2026-10-20).

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
- [ ] Objetivos táctiles de menos de 44 px. (La rutina `a11y/touch-targets`
      del 2026-10-21 no dejó rama) #17 amplía a 44 px la "i", el
      enlace Mapa, el de la noche y "Gratis". Quedan:
      - los días de la tira (36×36);
      - "Ver N paradas más" (36);
      - "Lo mejor del día" (24–29);
      - Mapa/Web del camping (28);
      - las migas (32);
      - el título de la ruta (30).
      Ampliarlos cambia el espaciado visible (propuesta P5 de #17).
- [x] **(tuya)** Contraste de "Hasta el día 13": 4,16:1, falla 1.4.3. Subir
      la opacidad a 0,68 daría ~6,7:1 (P1 de #17). (PR #33, a 5:1,
      mergeado el 2026-10-16)
- [x] Nombres de parada largos que se montan sobre el tiempo de visita a
      ≤ 414 px en los días 5–13 (P2 de #17). Puede quedar resuelto con los
      nombres acortados de #14: comprobarlo tras el merge. (Comprobado en el
      informe de #30: 0 de 70 desbordan, de 320 a 414 px)
- [x] Fallo de teclado que encontró #47: con Tab y después Enter, el
      bocadillo de duración no se abría. (Arreglado 2026-10-20 en la
      integración de #43–#49: la causa real era que el evento de scroll del
      propio Tab llega un fotograma tarde, después del Enter. Ahora un scroll
      solo cierra el bocadillo si ha movido su icono en pantalla,
      `closesHintOnScroll` en `src/lib/hint-scroll.ts`. La excepción
      `KNOWN_KEYBOARD_ISSUES` desapareció: `test:ui` lo exige)
- [ ] La sombra de la marca del hero en móvil está a 4,33:1 (sugerencia
      opcional de #33, en #36). Comprobar.
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

- [x] Enlace a `/sobre-mi/` en la cabecera, no solo en el pie. La prueba de
      autoría debe estar por encima del pliegue. (PR #29, cabecera con
      "Guías" y "Sobre mí", mergeado el 2026-10-16)
- [ ] Descarga KML por guía, para importar en Google My Maps (§6).
- [ ] Página hub de destino (`/{destino}/`). Ahora mismo no existe y las
      guías cuelgan de una ruta sin índice. Para Islandia, el 1.10 §6 la deja
      fuera del Checkpoint 3 y el 1.11 §8 la condiciona a validar antes las
      palabras clave. (El hub `/islandia/` está en #26, en borrador. Con el
      1.13 (#23, mezclado el 2026-10-20) entra en el Checkpoint 3)
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
- [x] La portada no lista la guía de Islandia: solo se llega por URL. Hay una
      rutina programada para el 2026-10-15
      (`feature/landing-lists-engine-guides`). (PR #21, mergeado el
      2026-10-15. La portada v2 está en #31)
- [ ] **(tuya)** Página 404 propia (#45, en borrador): revisar sus textos.
      Sin ella, Cloudflare Pages sirve `/` en las rutas que no existen. (En
      #45, hoja de decisiones; va la última de la cadena)
- [ ] **(tuya)** Buscador sencillo en `/buscar/`, versión mínima (pedido el
      2026-10-20). (En #52, borrador. Validarlo frente al BRIEF §P, que excluye
      un buscador complejo en la V1, y decidir si lista ya los borradores)
- [ ] Menú del sitio en móvil (hamburguesa), pedido el 2026-10-20. (La rutina
      `feature/site-menu` del 2026-10-21 no dejó rama ni PR)

## Web — rendimiento (cuando la guía de Islandia esté completa)

Medido el 2026-10-06 en la rama `feature/checkpoint3-diseno-v4`: Lighthouse
móvil 100/100/100, LCP 1,9 s, CLS 0, 0 ms de bloqueo, 170 KB en 21
peticiones. Nada es urgente; se revisa con la página terminada, no antes.

- [ ] **Margen de bytes del HTML de la guía**: con #13 queda a ~100 bytes del
      umbral (~43,8 KB comprimidos) a partir del cual Lighthouse móvil baja a
      99. Cualquier PR que añada marcado o CSS a la guía tiene que
      compensarlo. (Ya no aplica tal cual: desde #23/1.13 §5, decidido el
      2026-10-15, la CI acepta 99 en móvil solo para la guía de 13 días,
      `4276f2b`. El tope fijo con `npm run size:check` entró con #47 el
      2026-10-20)
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
- [ ] **(tuya)** → y ≈ en las etiquetas de Nunito se pintan con la fuente
      del sistema (#44). Dejarlo así o cambiarlos por texto o un SVG.
- [x] **CSS que bloquea el primer pintado** (2026-10-06): todo el CSS va
      incrustado en el HTML (`build.inlineStylesheets: 'always'` en
      `astro.config.mjs`). La guía pasó de 99 a 100 estable en móvil; LCP de
      las páginas pequeñas 1,2 → 1,1 s.

## CI y herramientas

La rutina `chore/ci-tools` del 2026-10-21 no dejó rama ni PR: lo de aquí
sigue como estaba.

- [x] Lighthouse 100 en móvil y escritorio como gate de la CI, y tests
      unitarios en la CI. (PR #7, 2026-10-06)
- [x] `test:ui` en la CI: capas de los paneles y líneas de las tarjetas.
      (PR #8, 2026-10-07)
- [x] `test:devices` (iPhone con WebKit y Android con Chromium) en la CI.
      Está en #9; entra con su merge. (PR #9, mergeado el 2026-10-15)
- [x] Comprobación de tipos (`astro check`) en la CI. (PR #28, mergeado el
      2026-10-16)
- [ ] **(tuya)** TypeScript 7 (issue #41): `astro check` no lo admite. La
      recomendación es seguir en `^6.0.3` y dejar la issue abierta hasta que
      `@astrojs/check` admita la 7 o salga TS 7.1 estable.
- [x] Tests de teclado en los paneles y tope de tamaño del HTML
      (`size:check`): #47, mezclado el 2026-10-20.
- [ ] El job `devices` repite `npm ci` y `build` y usa `npx --yes wait-on`
      sin versión fija. Coste menor de CI (revisión de #9).
- [ ] `scripts/ui-devices.ts` descarta en silencio los modelos que la versión
      de Playwright no conoce; `homeIndicator` no se lee. Revisar tras #10,
      que sube Playwright a 1.64.
- [ ] `scripts/ui-shared.ts`: el docblock de `dayCardLineIssues` quedó
      cortado.
- [x] **(tuya)** Mergear #10 (dependencias) y decidir sobre la issue #11
      (`http-cache-semantics`, `sharp`). (#10 mergeado el 2026-10-16; #40
      deja 0 vulnerabilidades altas y cierra #11, 2026-10-19)
- [ ] Las rutinas de caducidad (D8) y de estructurar guías, y el paso de
      "guía inválida" de la auditoría de dependencias, leen
      `src/content/guides/*.json` (esquema antiguo). La de caducidad no revisa
      la guía de Islandia (YAML del motor). Decidir si se adaptan.
- [ ] El build avisa de unos 90 lugares con `verified_at` caducado (nota de
      #16). Las revisiones de #9 y #14 señalan además lugares con
      `verified_at: 2025-09-15` que aún no se han verificado.
      (`content:validate` en `develop`, 2026-10-20 y 2026-10-21: 87 lugares
      con datos caducados y el precio de los 10 campings verificado hace más
      de 12 meses. La rutina `docs/verificacion-datos-islandia` del
      2026-10-21 no dejó rama)

## Infraestructura

Paso a paso para desplegar, dominio, analítica y Search Console:
[DESPLIEGUE.md](DESPLIEGUE.md).

- [ ] Conectar Cloudflare Pages al repo y desplegar `develop` a un dominio de
      pruebas. (Paso a paso en `docs/DESPLIEGUE.md`, unos 31 min. Rama de
      producción decidida el 2026-10-20: opción A, PR `develop` → `main` y se
      despliega `main`. La rutina `docs/repaso-despliegue` del 2026-10-21 no
      dejó rama)
- [x] Cabeceras HTTP y CSP por página (#43). Tiene una lista de
      comprobaciones para el día del despliegue y HSTS se activa en el panel.
      (Mezclado con la integración #51, 2026-10-20)
- [ ] **(tuya)** Mover el repo local fuera del Escritorio: iCloud lo
      sincroniza y crea copias " 2" de los ficheros (visto el 2026-10-20).
- [ ] **(tuya)** Registrar `solohazlamaleta.com`. `astro.config.mjs` ya lo da
      por hecho.
- [ ] Analítica sin cookies (Umami o Plausible). (#48 recomienda Umami Cloud
      gratis. Hay que permitirla en la CSP de #43 y contarla en
      `/privacidad/`)
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
      con los datos de Keyword Planner de ambos destinos. (2026-10-20:
      Mallorca, todavía no)
- [ ] **(tuya)** Keyword Planner y Trends con los bloques de #25
      (`docs/fuentes/seo-islandia-grupo.md` §5). Están listos para pegar en
      [DEBERES.md](DEBERES.md).
- [ ] **(tuya)** Verificar en island.is la tasa de 6,95 ISK/km (#25, #26).
      Bloquea la satélite de Presupuesto.
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
