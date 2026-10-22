# Deberes del autor

Lo que solo puedes hacer tú, junto en una lista. Generado el 2026-10-22
desde la lista del 21 (#53), las PR abiertas (#12, #25, #26, #31, #35, #45,
#50, #52 y #54 a #69), sus comentarios hasta las 05:30 del 22 y la salida de
`npm run day:status` y `npm run content:validate` sobre `develop`
(`b288e69`, sin cambios desde el 20).

Los tiempos son estimaciones en minutos. Si una hoja de decisiones o una PR
da su tiempo, se usa ese. Lo que no está claro si sigue pendiente va marcado
**comprobar**.

El orden: primero mirar la portada y decidir sus textos; después las hojas de
decisiones del hub y la 404; después el despliegue, con el repaso previo
(#57); al final el contenido y los datos caducados (#56).

---

## Si solo tienes 30 minutos

1. **Mirar la portada de #69 en el móvil** (15 min). Es la integración de
   anoche y lleva la portada más avanzada (#68) con el menú, el buscador v2,
   las áreas de toque y el texto al 150 %. Cómo verla, en el punto 1.1.
2. **El H1 de la portada y "Hola, somos David y Natalia"** (5 min). Ver 1.2.
3. **¿Mezclas #69 entera o PR a PR?** (2 min). Ver 1.6.
4. **#26, preguntas 1, 2 y 8** (8 min). La fecha de "Lo práctico", cómo sale
   el hub de `noindex` y la frase "Solo hemos ido en septiembre…".

Las respuestas, en cada PR, con el formato "1A 2B…". Lo que no contestes
con la opción recomendada no cambia nada.

---

## 1. La portada (60 min)

Anoche la portada avanzó en cadena, cada PR sobre la anterior:
[#60](https://github.com/PascualDev85/solohazlamaleta/pull/60) (portada v3,
con #52 y #31 dentro) →
[#62](https://github.com/PascualDev85/solohazlamaleta/pull/62) (menú de #59 y
lupa en la cabecera) →
[#63](https://github.com/PascualDev85/solohazlamaleta/pull/63) (diseño) →
[#66](https://github.com/PascualDev85/solohazlamaleta/pull/66) (buscador v2) →
[#68](https://github.com/PascualDev85/solohazlamaleta/pull/68) (postales en 3D
y transiciones). Después,
[#69](https://github.com/PascualDev85/solohazlamaleta/pull/69) lo juntó todo
con #58 (CI), #61 (áreas de toque), #67 (texto al 150 % y alto contraste) y
#64 (bytes de la guía). **#69 es lo que hay que mirar:** CI en verde (build,
lighthouse y devices). #62, #63, #66 y #68 no tienen CI porque su base no es
`develop`.

Ninguna PR de la cadena trae hoja de decisiones con opciones: las preguntas
van en el cuerpo de cada una. La revisión automática de anoche comentó #60,
#62, #63 y #66, sin bloqueantes.

### 1.1. Mirarla en el móvil (20 min)

En local, con el móvil en la misma wifi:
`git fetch && git switch integration/2026-10-22 && npm install && npm run dev -- --host`,
y abrir en el móvil la dirección "Network" que imprime.

- [ ] **Las postales en 3D** (#68): salen en abanico al cargar y se inclinan
      con el scroll. Con movimiento reducido no se mueven.
- [ ] **El buscador** (#66): la lupa de la cabecera abre la misma ventana en
      todas las páginas, y el foco vuelve a la lupa al cerrar (#62).
- [ ] **El menú** (#59, #62): esquinas de 28 px, miniatura de Islandia y la
      "A" tintada de Alsacia. Se cierra tocando fuera y con ×.
- [ ] **La guía de Islandia**: la tira de días, las paradas y "Mapa" con las
      áreas de 44 px (#61), y el hero algo más oscuro.
- [ ] **Texto grande y alto contraste** (#67): cómo probarlo en el iPhone y
      en Android, al final de su cuerpo. A 16 px y sin la preferencia, la
      guía se ve igual que en `develop`.
- [ ] **En un iPhone real**, sobre todo: WebKit no se probó en local en
      ninguna de estas PR; solo lo pasa la CI.

### 1.2. Textos de la portada (15 min)

Todos en `src/pages/index.astro` de #69, salvo los del buscador.

- [ ] **H1** (#60, pregunta 1): "Guías de viaje ya planificadas, día a día",
      con el claim debajo. #60 lo recomienda por SEO; en #31 el H1 era el
      claim.
- [ ] **"Por David y Natalia: rutas de viajes que hemos hecho…"**, la línea
      bajo el H1 (#63).
- [ ] **"Hola, somos David y Natalia"** (#60): va en plural y `/sobre-mi/`
      en singular. Decide cuál vale para las dos.
- [ ] **"Dentro de cada guía"** es ahora el día 2 real de Islandia con notas
      al margen (#63): "Así es un día de la guía de Islandia, tal cual está en
      la guía." y sus cuatro coletillas ("Un toque en «Mapa» y la tienes…",
      "Alquiler del camper, 3-6 meses antes", "2.248 € por persona" y "el
      parking de Þingvellir, 1.000 ISK, en octubre de 2026"). La revisión
      avisa de que la muestra sale de una guía en `noindex` sin marcarla como
      borrador.
- [ ] **La cifra:** "Hasta hoy, 18 días de ruta planificados y 82 lugares,
      cada uno con su día, en 2 destinos." Cuenta también la guía de Alsacia,
      que es borrador.
- [ ] **Columnas del pie:** "Destinos", "El proyecto" y "Legal" (#63).

### 1.3. El buscador (5 min)

- [ ] **¿Cabe en la V1 frente al BRIEF §P?** Era la pregunta de #52. #66 lo
      deja sin filtros ni comparadores; la decisión sigue siendo tuya.
- [ ] **Borradores en los resultados:** #60 ya los lista marcados
      "Borrador" (era la segunda pregunta de #52). Confírmalo.
- [ ] **"Lugares destacados" o "En nuestras fotos"**, el nombre del grupo de
      sugerencias (#66).
- [ ] **El texto de ayuda** "Sin tildes y con alguna errata también vale:
      «gulfos», «presupuesto islandia»" ocupa dos líneas en el móvil (#66).

### 1.4. Diseño y detalles (8 min)

- [ ] **El pie con filas de 44 px** (#69, commit `56d69ac`): se hizo para que
      no se pisaran las áreas de toque y cambia un poco su aspecto. ¿Vale o
      prefieres otra solución?
- [ ] **El papel de las postales en modo oscuro** (#68): un hueso apagado. El
      modo oscuro aún no tiene interruptor.
- [ ] **Contraste de las áreas de toque** (#61): medido sobre la línea de
      texto (su criterio) o sobre la caja de 44 px.
- [ ] **¿Firma al pie del menú?** (#59).
- [ ] **La hoja de #31** (foto en la cabecera de escritorio y su alineación)
      es anterior a #60. **Comprobar** si sigue aplicando en #69.
- [ ] Para saber: con las postales, la portada en móvil da 99 de rendimiento
      (desktop 100). #68 añadió la portada a las excepciones de
      `scripts/lighthouse-check.ts` (mínimo 99, solo móvil y rendimiento),
      citando tu condición del 21: 3D solo con 99 o más.

### 1.5. #64 · Bytes de la guía (5 min)

Recorta 366 B pero **no llega a 100 en móvil**: la guía sigue en 99, con la
excepción de siempre. Para bajar del umbral faltan unos 1,9 KB.

- [ ] **¿Dejas en "Nuestro criterio" solo el nombre y el día de las paradas
      descartadas?** Es la recomendación (−2,3 KB) y es un cambio editorial.
      Si dices que sí, se mide en la CI y, si da 100, se quita la excepción.
      La otra salida es aceptar 99.

### 1.6. Mezclar #69 o PR a PR (5 min)

- [ ] **Si mezclas #69**, GitHub dará por mezcladas #58, #61, #60, #52, #31,
      #59, #62, #63, #66, #68, #67 y #64. Sácala de borrador y mezcla.
- [ ] **Si prefieres revisarlas por separado**, cierra #69 sin mezclar. Ojo:
      el commit de #69 que arregla `test:ui` ("UI check: measure the open site
      menu once its animation ends") tiene que ir con #68, o su CI fallará.
- [ ] Queda fuera y sin PR: en la guía, a 768 px, los enlaces de la cabecera
      salen blanco sobre blanco (lo vio #59). ¿Se lanza un arreglo?

---

## 2. Hub y 404: las hojas de decisiones (65 min)

Las hojas de #25, #26, #35 y #45 (21 oct) siguen sin contestar y sin commits
nuevos; todas en verde salvo #35, sin CI por su base. Cada hoja trae las
preguntas cerradas, la opción recomendada en primer lugar, el cambio exacto
y los textos citados tal cual. El resumen está en
[#26](https://github.com/PascualDev85/solohazlamaleta/pull/26#issuecomment-6305020998).
#31 ya no está en esta cadena: va dentro de la portada (punto 1).

**Orden de mezcla: #25 → #26 → #35 y #55 → #65 → #45.** #35 y #55 cuelgan de
#26 y se reapuntan a `develop` al mezclarla; #65 cuelga de #35. #45 va la
última porque choca con la portada (`src/pages/index.astro`) y con #26
(`package.json`): una sesión de Claude la pone al día antes (~15 min de CI).
**#45 tiene que entrar antes del despliegue** (punto 3).

Ya decidido el 20 oct, no se vuelve a preguntar: el H1 del hub "Islandia" y
el `<title>` "Viajar a Islandia: qué ver, cuándo ir y lo práctico" (aplicados
en #26), Sky Lagoon fuera (aplicado en #25) y la línea de "gente" de "Cuándo
ir" (aplicada en #26).

### 2.1. #25 · Investigación SEO del grupo Islandia (10 min)

[Hoja](https://github.com/PascualDev85/solohazlamaleta/pull/25#issuecomment-6305016984).
Solo es un documento. Ya apunta a `develop`.

- [ ] Cambio mecánico, sin decisión: el §3 aún propone el `<title>` con
      "| Solo Haz la Maleta" y el H1 "Viajar a Islandia". Se alinea con lo
      decidido el 20 oct.
- [ ] **1. "Ruta de 7 días" como página propia.** Recomendada A: pasarla a
      "no merece página" (regla dura de variantes de días y ruta no vivida).
- [ ] **2. Límite de la satélite "Costa sur".** Recomendada A: días 3 y 4, y
      los días 5 y 6 como bloque final.
- [ ] **3. Orden de las satélites.** Recomendada A: aceptarlo como hipótesis
      hasta tener Keyword Planner.
- [ ] Cifra a unificar: "20+ lugares" → "23 lugares" (línea 22).

Keyword Planner no bloquea la mezcla.

### 2.2. #26 · Hub `/islandia/` (35 min)

[Hoja](https://github.com/PascualDev85/solohazlamaleta/pull/26#issuecomment-6305017210).
8 preguntas (8 min), los textos (20 min) y quitar el borrador y mezclar
(7 min).

- [ ] **1. Fecha de "Lo práctico"** (fianza, "Mosskógar solo efectivo",
      pernoctar). Recomendada A: un `verified_at` en `practical` que se pinta
      como "Comprobado …". Necesita la fecha en que lo comprobaste. El paso
      previo ya está en [#55](https://github.com/PascualDev85/solohazlamaleta/pull/55)
      (ver 2.4): un aviso en el build, no la fecha.
- [ ] **2. Cómo sale el hub de `noindex`.** Recomendada A: atarlo al estado
      de la guía principal (un solo interruptor).
- [ ] **3. Fotos en móvil.** Recomendada A: recorte 16:9 y miniaturas (100).
- [ ] **4. Foto de portada del hub.** Recomendada A: Gullfoss de momento.
- [ ] **5. Las tres enmiendas del modelo.** Recomendada A: validarlas tal
      cual.
- [ ] **6. Qué preguntas van al FAQPage.** Recomendada A: solo la del 4x4.
- [ ] **7. Enlace "Islandia" en la cabecera.** Recomendada A: todavía no.
      Ojo: la hoja es anterior a la portada. En #69 la cabecera ya lleva la
      lupa y el menú de #59, que lista los destinos desde el dato, y #62 quita
      el encogimiento de #52 por debajo de 400 px.
- [ ] **8. "Solo hemos ido en septiembre…".** Recomendada A: sacarla de
      `tripMonth`.
- [ ] Leer los textos de la hoja: cabecera, meta description, datos rápidos,
      entradilla de "Qué ver", "Cuándo ir", "Cómo moverse", moneda y las 7
      respuestas nuevas del FAQ.
- [ ] Al acabar, borrar los avisos de borrador de `islandia.yaml` (líneas
      13-14, 27, 35-36 y 79-80) y sacar la PR de borrador.

### 2.3. #35 · Lo práctico de la guía, al hub (5 min)

[Hoja](https://github.com/PascualDev85/solohazlamaleta/pull/35#issuecomment-6305017425).
Sin CI hasta que se reapunte a `develop` tras mezclar #26.

- [ ] **1. Texto del enlace.** Recomendada A: "Documentos, enchufes, apps y
      moneda: en la página de Islandia →".
- [ ] **2. FAQ del 4x4 y BreadcrumbList hacia una página `noindex`.**
      Recomendada A: aceptarlo; las dos páginas se publican a la vez.
- [ ] Reapuntar a `develop` (Edit, en la base de la PR) y mezclar con la CI
      en verde.

El enlace ya sale del dato (`hubSectionHref`), no hay que hacer nada más ahí.

### 2.4. #55 · Aviso de datos sensibles sin fecha en "Lo práctico" (5 min)

Borrador sobre #26 (sin CI hasta que se reapunte a `develop`). Solo avisa en
el build, no lo hace fallar. Hoy avisan 3 entradas: la fianza del camper
(1.000–2.000 €) en el hub y en la guía, y "solo efectivo" en Mosskógar.

- [ ] **Validar la enmienda 1.7.2 que propone** (3 min): que
      `practical.documents[]` y `tips[]` admitan `string | {text, verified_at}`,
      y `verified_at` opcional en `practical.currency` y en `faq[]`. Hasta que
      la valides, la fianza y Mosskógar no tienen dónde llevar fecha. Va con
      la pregunta 1 de #26.
- [ ] Reapuntar a `develop` tras mezclar #26 y mezclar con la CI en verde
      (2 min).

### 2.5. #65 · Enlaces hub ↔ guías desde el dato (5 min)

Borrador sobre #35 (que va sobre #26): sin CI hasta llegar a `develop`. Añade
además `npm run links:check` para el grupo Islandia.

- [ ] **Leer tres textos** (2 min): "Si estás preparando Islandia", "Más
      rutas por Islandia" y "Más sobre Islandia".
- [ ] Va atado a la pregunta 2 de #26: si la guía se publica con el hub aún
      en `noindex`, el cierre de la guía hacia el hub desaparece.
- [ ] Reapuntar a `develop` cuando entre #35 y mezclar con la CI en verde
      (3 min).

### 2.6. #45 · Página 404 (5 min)

[Hoja](https://github.com/PascualDev85/solohazlamaleta/pull/45#issuecomment-6305017813).

- [ ] **1. El destino sale en minúsculas** ("islandia · 13 días").
      Recomendada A: mayúscula inicial solo con CSS.
- [ ] Leer los 7 textos cortos de la hoja.
- [ ] Antes de mezclar, pedir a una sesión de Claude que la ponga al día con
      `develop` (ya con #26 y la portada). Choca con la portada en
      `src/pages/index.astro` y en `package.json`.
- [ ] Opcional, de la revisión automática: fijar una convención para los
      `<title>` (la 404 y la portada llevan "— Solo Haz la Maleta"; el hub,
      no).

---

## 3. Despliegue (50 min)

La rama de producción ya está decidida: **opción A**, una PR `develop` →
`main` y se despliega `main` (`docs/DESPLIEGUE.md`).
[#57](https://github.com/PascualDev85/solohazlamaleta/pull/57) (borrador, CI
en verde) es el repaso previo: `docs/fuentes/repaso-despliegue-2026-10-21.md`.
No da minutos; los de abajo son estimaciones.

- [ ] **Leer el repaso y mezclar #57** (10 min). Solo añade ese documento.
- [ ] **Lo grave del repaso:** hoy `develop` no tiene `404.html`, así que
      Cloudflare Pages sirve la portada con 200 en cualquier URL que no
      exista. **#45 lo arregla y tiene que entrar antes de la PR `develop` →
      `main`** (punto 2.6).
- [ ] **`NODE_VERSION = 24`** en las variables del proyecto de Cloudflare,
      antes del primer build (2 min). Sin eso, el build falla en
      `write-headers.ts`. Comprueba en el log que sale Node 24.
- [ ] **Abrir y mezclar la PR `develop` → `main`** (3 min), con la portada,
      el hub y la 404 ya dentro.
- [ ] **Seguir `docs/DESPLIEGUE.md`** (~31 min): conectar GitHub, configurar
      el build, `pages.dev`, las comprobaciones y elegir la analítica.
      Recomendado en el documento: Umami Cloud gratis; luego hay que
      permitirla en la CSP y contarla en `/privacidad/`.
- [ ] **Tras el primer despliegue** (1 min): abrir
      `https://<proyecto>.pages.dev/no-existe/` y ver "Página no encontrada",
      no la portada.
- [ ] **¿Siguen los legales en el sitemap?** (1 min). Hoy `/aviso-legal/`,
      `/privacidad/` y `/afiliacion/` están dentro; el repaso dice que vale
      tal cual.
- [ ] Opcional (2 min): `X-Robots-Tag` también en `/print/` y `/ofertas/`
      (lo dejó abierto #43).
- [ ] **El día del dominio**, más adelante: `solohazlamaleta.com` y `www` en
      Custom domains, redirección 301 de `www` (Redirect Rules), Always Use
      HTTPS, HSTS con `max-age` corto y sin `preload`, y avisar a Claude para
      la regla `noindex` de `pages.dev`.

Lo que el repaso deja para Claude (actualizar `DESPLIEGUE.md`, `og:image`
por defecto, `engines` de Node, etc.) está en el BACKLOG.

---

## 4. Contenido y datos

### 4.1. #50 · Coordenadas de Grafarkirkja, Landbrotalaug y Stuðlagil (5 min)

No es borrador, CI en verde, sin conflictos. Trae las coordenadas y fichas de
Maps de tus enlaces del 20 oct.

- [ ] **Stuðlagil:** la nota dice "ruta de unos 5 km, unos 45 minutos de
      ida". ¿Cuenta desde el parking de la ficha (lado este, tras cruzar el
      puente y seguir 2,4 km) o desde el del primer puente?
- [ ] **`drive` de los días 8 y 11:** con las coordenadas buenas salen unos
      +12 km y +27 km en línea recta. ¿Los confirmas o los cambias?
- [ ] Opcional, de la revisión automática: el dato de acceso de Stuðlagil
      ("cruzar el puente y seguir 2,4 km") no tiene fecha propia, y el
      `verified_at` de los tres lugares sigue en septiembre de 2025.

### 4.2. Coordenadas de Islandia (85 min)

Las propuestas están en `docs/fuentes/coordenadas-por-confirmar.md`, cada una
con su enlace de mapa. Se corrigen en `content/places/islandia.yaml` (`lat`,
`lng`) y después hay que quitar el aviso de `notes`. `day:status` cuenta 74
lugares pendientes en `develop`; con #50, 71.

Las erróneas (más de 2 km) que no están en #50, de la más desviada a la menos
(2 min cada una, unos 50 en total):

| Desvío | Día | Lugar (`place_id`) |
|---|---|---|
| 15,9 km | 6 | Lækjavík (`laekjavik`) |
| 13,4 km | 11 | Víðimýrarkirkja (`vidimyrarkirkja`) |
| 12,6 km | 8 | Hengifoss (`hengifoss`) |
| 10,4 km | 12 | Ytri Tunga (`ytri_tunga`) |
| 8,2 km | 11 | Glaumbær (`glaumbaer`) |
| 7,5 km | 11 | Kolgrafarfjörður (`kolgrafarfjordur`) |
| 7,3 km | 10 | Mígandifoss (`migandifoss`) |
| 7,0 km | 11 | Kolugljúfur (`kolugljufur`) |
| 6,6 km | 8 | Rjúkandifoss (`rjukandifoss`) |
| 6,5 km | 12 | Londrangar (`londrangar`) |
| 6,4 km | 4 | Laufskálavarða (`laufskalavarda`) |
| 6,2 km | 6 | Eystrahorn (`eystrahorn`): ¿la silla roja es el punto que interesa? |
| 5,9 km | 10 | Hauganes (`hauganes`) |
| 5,2 km | 2 | Reykjadalur (`reykjadalur`) |
| 4,7 km | 7 | Vök Baths (`vok_baths`) |
| 4,3 km | 5 | Trekking en Svínafellsjökull (`trekking_glaciar_svinafellsjokull`): confirma el punto de encuentro |
| 4,3 km | 7 | Gufufoss (`gufufoss`) |
| 4,1 km | 12 | Rauðfeldsgjá (`raudfeldsgja`) |
| 3,8 km | 6 | Múlagljúfur (`mulagljufur`) |
| 3,6 km | 7 | Borgarfjarðarhöfn (`borgarfjardarhofn`) |
| 3,0 km | 6 | Djúpavogskörin (`djupavogskorin`) |
| 2,5 km | 7 | Seyðisfjörður (`seydisfjordur`) |
| 2,3 km | 7 | Fardagafoss (`fardagafoss`) |
| 2,2 km | 13 | Glymur (`glymur`) |

- [ ] Las 24 de la tabla (50 min). Con un enlace de Google Maps tuyo por
      lugar basta, como en #50.
- [ ] Las 28 "REVISAR" (150 m a 2 km) del mismo informe (1 min cada una,
      unos 30 en total).
- [ ] Las 6 sin verificar (15 min): Seljavallalaug (parking), playa de Vík,
      Svínafellsjökull, mirador de Rauðafell, Þjóðvegur (zona de renos) y el
      mirador del lago Mývatn. ¿Cuál era?
- [ ] Cuando estén todas, borra el informe.

### 4.3. Conducción y duraciones (15 min)

- [ ] `drive` de los días 4 y 6 a 11: `day:status` los marca "estimada".
      Confírmalos y quita el comentario "Estimación pendiente de confirmar
      por el autor.". Los días 8 y 11, junto con la pregunta de #50.
- [ ] Duraciones de los días 5 a 13: quita `# duraciones estimadas` y esos
      días de `estimatedDays`.

### 4.4. Precios y datos de más de 12 meses (#56)

`npm run content:validate` da 100 avisos (igual que ayer).

[#56](https://github.com/PascualDev85/solohazlamaleta/pull/56) (borrador, CI
en verde) deja la lista de comprobación en
`docs/fuentes/verificacion-2026-10-21.md`: 98 datos de 97 lugares, por
prioridad (10 campings, 20 entradas y parkings, 1 horario y 67 lugares más).
**No verificó ninguno**: el proxy de la nube bloquea `thingvellir.is`,
`vatnajokulsthjodgardur.is`, `island.is` y `parka.is`. Cada fila trae la URL
oficial donde la encontró. No da minutos; los de abajo son estimaciones.

- [ ] **¿Abres esos dominios en *Allowed domains* del entorno de la nube?**
      (5 min). Así una próxima ejecución puede comprobarlos sola. Si no, se
      hacen a mano con la lista de #56.
- [ ] **`entry.price` usado como precio del parking** en `krafla_viti`,
      `hverfjall`, `kirkjufell` e `ytri_tunga`: ¿debería ser 0? (3 min)
- [ ] Þingvellir: una copia indexada da 4.000 ISK frente a los 4.400 de la
      guía. Compruébalo en la web oficial (2 min, va con el primer punto de
      abajo).
- [ ] 8 de los 10 campings no tienen `source_url`. Si lo tienes a mano,
      añádelo al comprobar el precio.

- [ ] **Precio de los 10 campings**, verificado hace más de 12 meses
      (`entry.price`): Þingvellir, Árnes, Skógafoss, Svínafell, Skaftafell,
      Laugar, Systragil, Lambeyri, Hellissandur y Mosskógar (2 min cada uno,
      20 en total).
- [ ] **87 lugares con `verified_at` caducado.** Empieza por los que tienen
      precio de entrada (`entry.price`, 2 min cada uno): Múlagljúfur,
      Fjallsárlón, Jökulsárlón, Vestrahorn (también el horario), Fardagafoss,
      Gufufoss, Rjúkandifoss, Stuðlagil, Dettifoss, Grjótagjá, Krafla, Hverir,
      Hverfjall, Dimmuborgir, el mirador de Mývatn, Goðafoss, Grafarkirkja,
      Glaumbær, Víðimýrarkirkja, Kolugljúfur, Kirkjufell, Svörtuloft,
      Djúpalónssandur, Hellnar, Arnarstapi, Rauðfeldsgjá, Búðakirkja, Ytri
      Tunga y Landbrotalaug.
- [ ] Dos avisos de estilo (2 min): "una de las cascadas más" en la
      `description` de `gullfoss`, y "espectacular" en las `notes` de
      `seljalandsfoss`, que va en la guía y no en el lugar.
- [ ] Un aviso de estructura (2 min): el día 1 tiene `drive` y una parada de
      ruta (`reykjavik`) sin `travel_to_next_min`.

### 4.5. Textos de la guía de Islandia, por día

Fichero: `content/guides/islandia/islandia-en-camper-13-dias.yaml`. Los
bloques del panel "Ver día completo" son `days[].overnight_note` (la noche),
`days[].our_take` (lo que haríamos distinto), `days[].plan_b`,
`stops[].skip_reason` (lo que no hicimos) y `stops[].variant_note` (la
experiencia en cada parada). Las preguntas salen de
`docs/fuentes/informe-paneles-y-nombres.md`.

**"Lo mejor del día" (`days[].highlight`), días 4 a 13** (3 min por día, 30
en total)

- [ ] Una frase por día: lo que más os gustó. Los días 1 a 3 ya la tienen.

**La noche (`days[].overnight_note`), los 13 días** (20 min)

- [ ] Primero decide si escribes una o dos frases por camping o solo en las
      noches que tuvieron algo que contar.
- [ ] Días 6 y 7, noches fuera de camping (`overnight: null`): ¿dónde
      dormisteis y por qué?

**Recortes de paneles demasiado largos** (≈ 15 min)

- [ ] Día 6 (336 palabras): deja la advertencia de Rauðafell en una frase.
      Quita de `our_take` la frase de los renos, que repite el `skip_reason`
      de Þjóðvegur.
- [ ] Día 3 (304): quita de `our_take` la descripción de la pista de Háifoss,
      que ya está en su parada.
- [ ] Día 9 (249): "Hverir huele mal…" repite la experiencia. ¿Qué haríais
      distinto de verdad en Mývatn, por ejemplo con Krafla?

**Bloques que faltan** (5 min por día, 30 en total)

- [ ] **Día 1:** ¿cómo fue la primera noche en Þingvellir? ¿Dejasteis algo de
      Reikiavik para otro día? ¿Qué haríais si llueve? (`plan_b`)
- [ ] **Día 2:** ¿por qué evitaríais el camping de Árnes? ¿Ponéis Kerið en
      "Lo que no hicimos", con el motivo de que lo cambiasteis por
      Reykjadalur?
- [ ] **Día 5:** ¿qué tal la noche en Skaftafell? Si cancelan el trekking por
      el tiempo, ¿qué haríais? (`plan_b`)
- [ ] **Día 7:** ¿qué contaríais de Vök Baths y de Seyðisfjörður? Tiene siete
      paradas y solo 36 palabras. ¿Plan B con mal tiempo en los fiordos?
- [ ] **Día 10:** ¿qué haríais distinto? ¿Cómo fue la noche en Lambeyri?
      ¿Dejasteis algo fuera en Tröllaskagi? ¿Qué haríais si no se puede salir
      a ver ballenas?
- [ ] **Día 11** (el más corto, 53 palabras): ¿qué haríais distinto? ¿Qué tal
      la noche en Hellissandur? ¿Hubo alguna parada prevista que no hicisteis?
      ¿Plan B si llueve?
- [ ] **Día 13:** no tiene experiencia. Sky Lagoon queda fuera (no fuisteis):
      ¿hay algo del último día que contar?

**Otras dudas de contenido de los días 5 a 13** (10 min, **comprobar**:
vienen de #14)

- [ ] Djúpavogskörin: ¿es una poza termal?
- [ ] El túnel de Vaðlaheiði: es de peaje.
- [ ] ¿Hubo paseo por Reikiavik el día 13?
- [ ] Mígandifoss.
- [ ] El trekking de Svínafellsjökull: ¿5 h o 6 h? Icelandia lo da por
      suspendido.
- [ ] Las noches 5, 8, 10 y 11 no cuadran con las notas del viaje.

### 4.6. Fotos que faltan (30 min)

La guía de Islandia tiene foto en los días 1 a 3. Faltan los días 4 a 13
(`day:status`). Por cada día (3 min):

1. Elige una foto vertical tuya.
2. Lanza el comando. `--name` es el nombre del fichero y `--caption` el lugar
   que sale en la foto.
3. Escribe el `alt` en el YAML. El comando lo deja vacío a propósito, así que
   el build falla hasta que describas la foto.

```bash
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 4
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 5
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 6
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 7
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 8
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 9
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 10
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 11
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 12
npm run photo -- <foto.jpg> islandia --name <lugar-sin-acentos> --caption "<Lugar>" --day 13
```

Por ejemplo: `npm run photo -- ~/Fotos/IMG_2041.jpg islandia --name dettifoss --caption Dettifoss --day 8`.

Además:

- [ ] Imagen Open Graph horizontal de 1200×630 con el encuadre que elijas
      (propuesta de #16, **comprobar**).
- [ ] Fotos propias de Alsacia, verticales y horizontales.

### 4.7. Datos de fuera

**Tasa por kilómetro** (5 min)

- [ ] Verifica en island.is los 6,95 ISK/km desde el 1 de enero de 2026.
      Ahora solo lo dicen empresas de alquiler. Bloquea la satélite de
      Presupuesto y la pregunta del FAQ del hub (#25).

**Keyword Planner y Trends** (30-60 min)

Sale de #25 (`docs/fuentes/seo-islandia-grupo.md` §5). No bloquea mezclar
#25. En Keyword Planner, entra en "Obtener volumen de búsquedas y
previsiones" y elige España, español y los últimos 12 meses. Pega cada bloque
tal cual. Repite con Latinoamérica solo las que pasen en España. Apunta el
resultado en la plantilla del 1.11 §5.

Umbrales:

- Confirma con 500 o más en la principal, o 1.000 o más sumando el bloque.
- Entre 100 y 500, se escribe solo si Trends muestra curva propia.
- Con menos de 100 en la principal y menos de 300 en el bloque, se queda como
  sección.
- En los bloques de zona, los umbrales bajan a la mitad.

```
cuánto cuesta viajar a islandia
presupuesto viaje islandia
islandia presupuesto camper
cuanto cuesta un viaje a islandia 2 semanas
islandia precio viaje
es caro viajar a islandia
```

```
campings islandia
camping islandia camper
donde dormir en islandia en camper
acampada libre islandia
camping card islandia
campings islandia abiertos
```

```
alquilar camper islandia
alquiler camper islandia
camper islandia precio
camper 4x4 islandia
islandia sin 4x4
```

```
que ver en la costa sur de islandia
costa sur islandia
cascadas sur islandia
reynisfjara
skogafoss
seljalandsfoss
```

```
aguas termales islandia
piscinas naturales islandia
aguas termales gratis islandia
reykjadalur
vok baths
seljavallalaug
```

```
circulo dorado islandia
que ver en el circulo dorado
circulo dorado islandia por libre
circulo dorado en un dia
```

```
viajar a islandia
que ver en islandia
guia de islandia
mejor epoca para viajar a islandia
cuantos dias para ver islandia
islandia en septiembre
```

Si "que ver en islandia" supera con mucho a "viajar a islandia", se invierte
el título del hub. Si "islandia en septiembre" pasa de 500, su página vuelve a
P2.

- [ ] **Trends** (España, 5 años): "islandia", "viaje islandia" y "camper
      islandia", para ver la estacionalidad (10 min).
- [ ] El laboratorio SEO (1.11 §10): el 20 oct decidiste que Mallorca,
      todavía no.

**Para hacer en el móvil** (15 min)

- [ ] **Comprobar** en un iPhone real lo que WebKit en Linux no ve: la
      pastilla del índice con la barra de Safari, las hojas inferiores frente
      al indicador de inicio, la vista en horizontal con la muesca y el cierre
      del bocadillo.

### 4.8. Páginas propias

**Sobre mí** (45 min). Fichero: `src/pages/sobre-mi.astro`. Hoy pone
"PENDIENTE AUTOR".

- [ ] ¿Quiénes sois, qué viajes habéis hecho y por qué alguien debería fiarse
      de vuestras rutas? En primera persona. Es la página que sostiene la
      credibilidad del proyecto, y #16 la quería como `author` del schema
      Article.

**Legales** (20 min)

- [ ] `src/pages/aviso-legal.astro`: nombre o razón social, NIF, domicilio y
      correo de contacto, como pide la LSSI-CE.
- [ ] `src/pages/privacidad.astro`: nombre o razón social, NIF y dirección de
      contacto para ejercer los derechos. Si eliges Umami, cuéntala aquí.
- [ ] `src/pages/afiliacion.astro`: la lista de programas, solo cuando os deis
      de alta. Ahora no corre prisa.

### 4.9. Egipto (#12) (60-90 min)

No es borrador en GitHub, pero lleva `meta.draft: true`. Usa el esquema
antiguo (`src/content/`) y va muy por detrás de `develop`.

- [ ] **¿Pasa al motor antes de seguir?** Es la decisión que más trabajo
      ahorra o añade.
- [ ] Día 8: `travelToNextMin` 75 tras el Museo de la Civilización. ¿Es 15?
- [ ] Día 4: Templo de Luxor a las 19:30 con 135 min, cuando los templos
      cierran a las 17:00.
- [ ] Días 6 y 7: el globo y Orange Bay. Se añaden como parada o se quitan
      del título y del resumen.
- [ ] Quitar los nombres propios de guía y conductores y los pagos por
      PayPal (la revisión de #53 pidió no repetirlos en los documentos).
- [ ] `meta.tripDone`: ¿con quién fue el viaje? Tiene que ser uno de los
      `groups` (`couple`, `friends`, `family_seniors`).
- [ ] `summary.budgetPerPerson`: ¿por persona o para los cuatro? Hoy vale 0.
- [ ] `lodging`: falta la noche 3 (Asuán, tras Abu Simbel).
- [ ] ¿Qué hicisteis al final en las tardes libres de Asuán y de Luxor?
- [ ] Dónde comer y los ajustes por grupo, marcados `PENDIENTE AUTOR`.
- [ ] Precios que no cuadran (10 min): Hatshepsut (6,40 € o 6,70 €), Museo de
      la Civilización (13 € o 9,20 €), globo en Luxor (25-30 € o 100-120 €,
      ¿en qué moneda?), Orange Bay (20 € o 80-100 €), Torre de El Cairo
      ("10 € ??"), regreso de Memnón ("1,15 min") y ningún precio con fecha.

### 4.10. Tailandia (#54) (5 min para decidir)

[#54](https://github.com/PascualDev85/solohazlamaleta/pull/54) la abrió la
rutina semanal de estructurar guías, que ya existía. Igual que Egipto (#12),
usa el **esquema antiguo** (`src/content/`), con `draft: true`. No es
borrador en GitHub; CI en verde.

- [ ] **¿Se adapta la rutina al formato del motor** (YAML de
      `content/guides/` y `content/places/`) antes de que estructure más
      guías? Es la misma pregunta que Egipto y la del BACKLOG sobre las
      rutinas que leen `src/content/guides/*.json`.
- [ ] La revisión automática pregunta si Tailandia es prioridad ahora: no
      está en el orden de D6.
- [ ] Si sigue adelante, lo que pide: confirmar los transportes Bangkok →
      Chiang Mai → Phi Phi y Ao Nang → Lipe, revisar coordenadas, aclarar el
      horario del día 11 ("12:00/12:30–07:30/20:00"), elegir qué se hizo los
      días 1 y 5 y ubicar Wat Ratchapradit, Wat Lok Moli y Wang Bua Ban.

### 4.11. Alsacia

- [ ] **Comprobar** qué sigue abierto en `docs/PENDIENTE-ALSACIA.md` y el año
      del viaje (`meta.tripDone.date`, hoy `2025-12`, que es una suposición).

---

## 5. Más pequeñas

- [ ] **Mover el repo fuera del Escritorio** (5 min). iCloud sincroniza el
      Escritorio y crea copias " 2" de los ficheros en tu carpeta local del
      repo. Recomendación pendiente: moverlo a una carpeta que no se
      sincronice. Antes de borrar ninguna copia " 2", mira que no tenga
      cambios que no estén en el original.
- [ ] **→ y ≈ en las etiquetas de Nunito** (#44, ya mezclada) se pintan con
      la fuente del sistema (2 min). Dejarlo así o cambiarlas por texto o por
      un SVG. La rutina no recomienda ninguna.
- [ ] **Issue #41, TypeScript 7** (1 min). Aceptar la recomendación: seguir en
      `typescript ^6.0.3` y dejar la issue abierta.
- [ ] **Issue #36, parte del 16 de octubre** (1 min). Ciérrala: lo que sigue
      abierto está en esta lista.
- [ ] **#53, la lista de ayer** (1 min). Esta PR la sustituye: ciérrala sin
      mezclar.

---

## Ya hecho

**Noche del 21 al 22:** la cadena de la portada (#62, #63, #66 y #68), los
bytes de la guía (#64, se queda en 99), el texto al 150 % y el alto
contraste (#67), los enlaces hub ↔ guías (#65) y la integración #69. Todas
dejaron rama y PR en borrador. La revisión automática comentó las PR
abiertas, sin bloqueantes.

**Tarde del 21:** se relanzaron las seis rutinas que habían fallado por el
límite de uso y todas dejaron PR: CI (#58), repaso del despliegue (#57),
áreas de toque (#61), aviso de fechas en "Lo práctico" (#55), menú (#59) y
datos caducados (#56, sin verificar ninguno por la red). Pediste la portada
híbrida (#60) y dijiste "Mallorca, todavía no". La rutina semanal abrió
Tailandia (#54).

**20 de octubre:** entraron en `develop` el doc 1.13 (#23) y la integración
#51, con las cabeceras HTTP y la CSP por página (#43), la comprobación de
fuentes (#44), la prueba de `/ir/{id}` (#46), los tests de teclado y el tope
de tamaño (#47), la guía de despliegue (#48) y los deberes del 20 (#49).
Quedaron decididos el H1 y el `<title>` del hub, Sky Lagoon fuera, la gente
en septiembre, la rama de producción (A) y que Mallorca espera.

**Antes:** desde el 15 de octubre entraron los días 4 a 13 (#9, #14), las
secciones, el SEO y la accesibilidad (#13, #15, #16, #17), `npm run photo` y
`day:status` (#19), los avisos editoriales (#20), la portada con Islandia
(#21), el informe de paneles (#30), el contraste, la cabecera, la comprobación
de tipos y el `noindex` derivado de `status` (#27 a #34), las dependencias sin
vulnerabilidades altas (#10, #40) y el enlace de salto (#42).
