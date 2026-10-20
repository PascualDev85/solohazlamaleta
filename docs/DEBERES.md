# Deberes del autor

Lo que solo puedes hacer tú, junto en una lista. Generado el 2026-10-20
desde las PR abiertas (#12, #23, #25, #26, #31, #35, #43 a #48), las issues
#36 y #41, las PR mezcladas desde el 15 de octubre, los informes de
`docs/fuentes/` y la salida de `npm run day:status` y
`npm run content:validate` sobre `develop` (`dc83129`).

Los tiempos son estimaciones en minutos. Si una fuente daba un tiempo, se usa
ese. Lo que no está claro si sigue pendiente va marcado **comprobar**.

---

## Si solo tienes 30 minutos

1. **Mergear #23 (doc 1.13)** (10 min). Está en verde y sin conflictos. #25 y #26 cuelgan de ella. Antes, corrige sus tres incoherencias (ver abajo) o mérgela tal cual y déjalas para luego.
2. **Decidir el título del hub en #26** (5 min). H1 "Viajar a Islandia" o "Islandia", y si el `<title>` lleva "| Solo Haz la Maleta". Es lo que dejan abierto a la vez #25 y #26, y sin esto ninguna de las dos se cierra.
3. **Contestar tres preguntas de memoria** (5 min). ¿Fuisteis a Sky Lagoon? ¿"Menos gente en septiembre" es algo que visteis? En Stuðlagil, ¿el punto bueno es el parking del puente o el mirador? Desbloquea el día 13, el "Cuándo ir" del hub y la peor coordenada del día 8.
4. **Elegir la rama de producción de Cloudflare (#48)** (2 min). Recomendada: opción A, una PR `develop` → `main` y desplegar `main`. Sin esto no se puede seguir el paso a paso del despliegue (~31 min otro día).
5. **Corregir las 3 coordenadas peores** (8 min). Grafarkirkja (37,8 km), Landbrotalaug (25 km) y Stuðlagil (18,3 km). Las tres están en `content/places/islandia.yaml`. El botón "Mapa" las usa, y bloquean el mapa (C3.5) y la publicación.

---

## PR que esperan tu revisión

En este orden. Las cinco primeras dependen unas de otras, así que hay que ir en cadena.

### 1. #23 · Doc 1.13: guía, hub y satélites (10 min)

En verde y sin conflictos. Esta noche se puso al día con `develop` sin problemas. No es borrador.

- [ ] Texto de la PR desfasado: aún habla de la "decisión abierta §5", pero el documento ya dice "Decidido el 15 de octubre: opción (a)". Actualízalo o ignóralo: manda el documento.
- [ ] §8 paso 2: enumera 10 PR, pero la nota dice "las once PR abiertas". Sobra una de las dos cifras.
- [ ] §6 "Cuándo ir" dice "menos gente". **¿Lo visteis?** Si no, quítalo. **Recomendado:** quitarlo, porque el repo solo dice que Skaftafell y Hellissandur estaban llenos.

### 2. #25 · Investigación SEO del grupo Islandia (15 min, más Keyword Planner)

Borrador. Su base es #23 y no tiene CI propia. Esta noche se puso al día sin conflictos. Es una hipótesis: las cifras salen de Keyword Planner (ver "Datos que tiene que comprobar").

- [ ] **"Ruta de 7 días" como página propia** choca con la regla de no duplicar páginas por días, y además es una ruta que no hicisteis. **Recomendado:** pasarla a "no merece página". La otra opción es dejarla como excepción tuya.
- [ ] **Límite de la satélite "Costa sur".** **Recomendado:** los días 3 y 4 en la satélite, y los días 5 y 6 como bloque final "si sigues hacia el este".
- [ ] Orden de las satélites: Presupuesto, Campings, Alquilar camper y Costa sur antes que Círculo Dorado. ¿Te vale?
- [ ] Unificar "20+ lugares" y "23 lugares" para la costa sur.

### 3. #26 · Hub `/islandia/`, versión 1 (45-60 min)

Borrador, en verde. Esta noche tuvo conflictos con #28 y #34; ya están resueltos y el hub sigue en `noindex`. Pone `status: reviewed`, pero **tú no lo has revisado**.

Decisiones:

- [ ] **H1 y `<title>`** (ver "Si solo tienes 30 minutos"). #36 recomienda "Viajar a Islandia".
- [ ] **Fotos en móvil:** recorte 16:9, que da Lighthouse 100 (**recomendado** en #36), o fotos grandes, que dan 99.
- [ ] **Foto de portada del hub:** ahora es Gullfoss, que es también la del día 2. Si tienes una más "de destino", cambia `cover_image` en `content/guides/islandia/islandia.yaml`.
- [ ] **Enmiendas del modelo:** `practical.currency`, `when_to_go` y la regla "hub con `variants` da error". Valídalas o cámbialas.
- [ ] **Qué preguntas del FAQ llevan `schema: true`.** Hoy solo la del 4x4.
- [ ] **Cómo sale el hub de borrador:** con un `HUB_SOURCES` aparte o atado al estado de la guía principal. La rutina no recomienda ninguna.
- [ ] **Enlace "Islandia" en la cabecera del sitio:** #29 lo dejó para cuando existiera el hub.
- [ ] Datos sensibles sin fecha de verificación: fianza "1.000-2.000 €", prohibición de pernoctar fuera del camping y "Mosskógar solo efectivo". Opciones: un `verified_at` en `practical` o mostrar la fecha de la guía.

Los textos del hub están en "Textos que tiene que escribir".

### 4. #35 · Lo práctico de la guía, al hub (5 min)

Borrador. Su base es #26, así que no tiene CI. Al mergear #26, reapúntala a `develop`.

- [ ] Texto del enlace al hub: "Documentos, enchufes y apps: en la guía de Islandia →". **Recomendado:** "en Viajar a Islandia" y añadir "moneda".
- [ ] Cuándo se publica el hub: la FAQ del 4x4 queda solo en una página `noindex`.

### 5. #31 · Portada v2 (15-20 min)

Borrador, en verde. Esta noche se puso al día sin conflictos y atendió la revisión (`a7c32cb`).

- [ ] Revisar los textos (ver "Textos que tiene que escribir", portada).
- [ ] **Foto de cabecera solo en escritorio:** elige la foto o déjala sin foto.
- [ ] **Alineación de la cabecera en escritorio:** la marca queda pegada al borde y el titular, más adentro. La decisión se comparte con la cabecera de #29.
- [ ] Más adelante, antes de la tercera guía: un `alt` de `cover_image` en el modelo y un nombre visible del destino ("JAPON" saldría sin tilde).

### 6. #45 · Página 404 (5 min)

Borrador, en verde. Cubre el punto 5 de #43.

- [ ] Revisar los textos: "Página no encontrada — Solo Haz la Maleta", "Esta página no existe o ya no está.", "Te has salido del mapa", "Volver a la portada", "O sigue por una guía" y "{destino} · {días} días".

### 7. #46 · Prueba de `/ir/{id}` (3 min)

Borrador, en verde. Solo añade tests.

- [ ] Aceptar que un test importe `astro`, cosa que la tabla de `CLAUDE.md` no prevé para `tests/`.
- [ ] El enlace de afiliado no abre en pestaña nueva. ¿Te vale así?

### 8. #47 · Tests de teclado y tope de tamaño del HTML (5 min)

Borrador, en verde.

- [ ] **Fallo de teclado sin arreglar:** con Tab y después Enter, el bocadillo de duración no se abre porque el scroll del carrusel lo cierra. Hay dos arreglos posibles: ignorar el scroll de `.route__days` y `.route__rail`, o cerrar solo si el bocadillo sale de la vista. Elige uno.

### 9. #43 · Cabeceras HTTP y CSP por página (5 min, más 15 el día del despliegue)

Borrador, en verde. Chocará con #44 en `package.json` y `CLAUDE.md`: merge primero una de las dos.

- [ ] ¿Añadir `X-Robots-Tag` también a `/print/` y `/ofertas/`? Opcional, son dos líneas.
- [ ] El día del despliegue, sigue la lista de la PR. Comprueba la CSP con `curl -sI`, que el comando de build sea `npm run build` y que no haya nada de Cloudflare que inyecte scripts (Rocket Loader, Zaraz…). HSTS va en el panel, cuando el dominio sirva por HTTPS.

### 10. #44 · Fuentes: no se recortan, comprobación de cobertura en la CI (3 min)

Borrador, en verde. La revisión ya está atendida.

- [ ] Las flechas → y ≈ de las etiquetas en Nunito se pintan con la fuente del sistema. Opciones: dejarlo así, o cambiarlas por texto o por un SVG. La rutina no recomienda ninguna.

### 11. #48 · Guía de despliegue en Cloudflare Pages (5 min de lectura, ~31 min al hacerlo)

Borrador, en verde. Solo es documentación.

- [ ] **Rama de producción.** **Recomendado:** A (`develop` → `main` primero).
- [ ] **Analítica.** **Recomendado:** Umami Cloud gratis. Plan B: Cloudflare Web Analytics, que solo cuenta visitas. Luego hay que permitirla en la CSP de #43 y contarla en `/privacidad/`.

### 12. #12 · Guía de Egipto (30-60 min)

No es borrador en GitHub, pero lleva `meta.draft: true`. Va 108 commits por detrás de `develop`. Usa el esquema antiguo (`src/content/`).

- [ ] **¿Pasa al motor antes de seguir?** Es la decisión que más trabajo ahorra o añade.
- [ ] Día 8: `travelToNextMin` 75 tras el Museo de la Civilización. ¿Es 15?
- [ ] Día 4: Templo de Luxor a las 19:30 con 135 min, cuando los templos cierran a las 17:00.
- [ ] Días 6 y 7: el globo y Orange Bay. Se añaden como parada o se quitan del título y del resumen.
- [ ] Quitar los nombres de guía y conductores (Mustafá, Saleh, Labib) y los pagos por PayPal.
- [ ] Los datos y textos van en "Datos" y "Textos".

### Issue #41 · TypeScript 7 (1 min)

No hay PR: la rutina lo probó en local y `astro check` no admite TS 7.

- [ ] Aceptar la recomendación: seguir en `typescript ^6.0.3` y dejar la issue abierta hasta que `@astrojs/check` admita la 7 o salga TS 7.1 estable.

### Issue #36 · Parte del 16 de octubre (1 min)

- [ ] Ciérrala. Sus integraciones entraron con #37 y #38, y lo que sigue abierto está en esta lista.

---

## Textos que tiene que escribir

Son preguntas para ti. Las respuestas no están escritas.

### Guía de Islandia, por día

Fichero: `content/guides/islandia/islandia-en-camper-13-dias.yaml`. Los bloques del panel "Ver día completo" son:

- `days[].overnight_note`: la noche;
- `days[].our_take`: lo que haríamos distinto;
- `days[].plan_b`: el plan B;
- `stops[].skip_reason`: lo que no hicimos;
- `stops[].variant_note`: la experiencia en cada parada.

Las preguntas salen de `docs/fuentes/informe-paneles-y-nombres.md`.

**"Lo mejor del día" (`days[].highlight`), días 4 a 13** (3 min por día, 30 en total)

- [ ] Una frase por día: lo que más os gustó. Los días 1 a 3 ya la tienen.

**La noche (`days[].overnight_note`), los 13 días** (20 min)

- [ ] Primero decide si escribes una o dos frases por camping o solo en las noches que tuvieron algo que contar.
- [ ] Días 6 y 7, noches fuera de camping (`overnight: null`): ¿dónde dormisteis y por qué? El campo está vacío.

**Recortes de paneles demasiado largos** (≈ 15 min)

- [ ] Día 6 (336 palabras): deja la advertencia de Rauðafell en una frase. Quita de `our_take` la frase de los renos, que repite el `skip_reason` de Þjóðvegur.
- [ ] Día 3 (304): quita de `our_take` la descripción de la pista de Háifoss, que ya está en su parada.
- [ ] Día 9 (249): "Hverir huele mal…" repite la experiencia. Sustitúyelo: **¿qué haríais distinto de verdad en Mývatn**, por ejemplo con Krafla?

**Bloques que faltan** (5 min por día)

- [ ] **Día 1:** ¿cómo fue la primera noche en Þingvellir? ¿Dejasteis algo de Reikiavik para otro día? ¿Qué haríais si llueve? (`plan_b`)
- [ ] **Día 2:** ¿por qué evitaríais el camping de Árnes? ¿Ponéis Kerið en "Lo que no hicimos", con el motivo de que lo cambiasteis por Reykjadalur?
- [ ] **Día 5:** ¿qué tal la noche en Skaftafell? Si cancelan el trekking por el tiempo, ¿qué haríais? (`plan_b`)
- [ ] **Día 7:** ¿qué contaríais de Vök Baths y de Seyðisfjörður? Tiene siete paradas y solo 36 palabras. ¿Plan B con mal tiempo en los fiordos?
- [ ] **Día 10:** ¿qué haríais distinto? ¿Cómo fue la noche en Lambeyri? ¿Dejasteis algo fuera en Tröllaskagi? ¿Qué haríais si no se puede salir a ver ballenas?
- [ ] **Día 11** (el más corto, 53 palabras): ¿qué haríais distinto? ¿Qué tal la noche en Hellissandur? ¿Hubo alguna parada prevista que no hicisteis? ¿Plan B si llueve?
- [ ] **Día 13:** no tiene experiencia. Si fuisteis a Sky Lagoon, escribid una o dos frases sobre cómo fue.

**Otras dudas de contenido de los días 5 a 13** (10 min, **comprobar**: vienen de #14, que ya entró en `develop`)

- [ ] Djúpavogskörin: ¿es una poza termal?
- [ ] El túnel de Vaðlaheiði: es de peaje.
- [ ] ¿Hubo paseo por Reikiavik el día 13?
- [ ] Mígandifoss.
- [ ] El trekking de Svínafellsjökull: ¿5 h o 6 h? Icelandia lo da por suspendido.
- [ ] Las noches 5, 8, 10 y 11 no cuadran con las notas del viaje.

### Hub `/islandia/` (#26)

Fichero: `content/guides/islandia/islandia.yaml` (en la rama de #26). Los textos los redactó la rutina con datos del repo: revisa que suenen a ti. (20 min)

- [ ] `summary.tagline`: la frase del hub, y la línea de cabecera en dos partes, marcada como "borrador mío".
- [ ] `when_to_go`: el repo solo tiene septiembre. ¿Luz y temperaturas de otras épocas, solo si las vivisteis? ¿Se enseña el `best_season: "Junio a septiembre"` de la guía?
- [ ] `transport.local`: "Coche, autobús o excursiones: no los probamos".
- [ ] `faq`: las 7 respuestas nuevas.
- [ ] El texto "Solo hemos ido en septiembre…" está escrito a mano en `src/pages/islandia/index.astro`. La revisión propone sacarlo de `tripMonth`.

### Portada (#31)

Fichero: `src/pages/index.astro` (rama de #31). (10 min)

- [ ] Bloque "Por qué estas guías son distintas" (variable `reasons`): "Viajes hechos, no copiados", "Con criterio, no un listado", "Cifras sin maquillar" y "Gratis y completas".
- [ ] Línea bajo el claim: "Guías de viajes que hemos hecho, con la ruta día a día lista para abrir en Google Maps y qué reservar y cuándo. Gratis y completas, sin pedirte el correo."
- [ ] Meta description: "Itinerarios día a día con la ruta lista para Google Maps y qué reservar y cuándo. De viajes hechos, no copiados."
- [ ] Píldoras de la tarjeta: "13 días", "2.248 € por persona", "Lo hicimos" y "Borrador".

### Sobre mí

Fichero: `src/pages/sobre-mi.astro`. Hoy pone "PENDIENTE AUTOR". (45 min)

- [ ] ¿Quiénes sois, qué viajes habéis hecho y por qué alguien debería fiarse de vuestras rutas? En primera persona. Es la página que sostiene la credibilidad del proyecto, y #16 la quería como `author` del schema Article.

### Legales

(20 min)

- [ ] `src/pages/aviso-legal.astro`: nombre o razón social, NIF, domicilio y correo de contacto, como pide la LSSI-CE.
- [ ] `src/pages/privacidad.astro`: nombre o razón social, NIF y dirección de contacto para ejercer los derechos. Repásala con la normativa antes de recoger un solo correo.
- [ ] `src/pages/afiliacion.astro`: la lista de programas, solo cuando os deis de alta. Ahora no corre prisa.

### Egipto (#12)

Fichero: `src/content/guides/egipto-en-8-dias.json`. (20 min)

- [ ] `meta.tripDone`: ¿con quién fue el viaje, "los 4"? ¿Familia o amigos? Tiene que ser uno de los `groups` (`couple`, `friends`, `family_seniors`).
- [ ] `summary.budgetPerPerson`: ¿el resumen de gastos es por persona o para los cuatro? Hoy vale 0 y publicaría "0 €".
- [ ] `lodging`: falta la noche 3 (Asuán, tras Abu Simbel).
- [ ] ¿Qué hicisteis al final en las tardes libres de Asuán y de Luxor?
- [ ] Dónde comer y los ajustes por grupo, marcados `PENDIENTE AUTOR`.

### Alsacia

- [ ] **Comprobar** qué sigue abierto en `docs/PENDIENTE-ALSACIA.md` y el año del viaje (`meta.tripDone.date`, hoy `2025-12`, que es una suposición). Ninguna PR de esta semana lo toca.

---

## Datos que tiene que comprobar fuera

### Coordenadas de Islandia

Las propuestas están en `docs/fuentes/coordenadas-por-confirmar.md`, cada una con su enlace de mapa. Se corrigen en `content/places/islandia.yaml` (`lat`, `lng`), y después hay que quitar el aviso de `notes`. En `develop` siguen las coordenadas "actuales" del informe: no se ha corregido ninguna. `day:status` cuenta 74 lugares pendientes.

Las erróneas (más de 2 km), de la más desviada a la menos (2 min cada una, unos 55 en total):

| Desvío | Día | Lugar (`place_id`) |
|---|---|---|
| 37,8 km | 11 | Grafarkirkja (`grafarkirkja`) |
| 25,0 km | 12 | Landbrotalaug (`landbrotalaug`) |
| 18,3 km | 8 | Stuðlagil (`studlagil`): ¿parking del puente o mirador? |
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

- [ ] Las 27 de la tabla (55 min).
- [ ] Las 28 "REVISAR" (150 m a 2 km) del mismo informe (1 min cada una, unos 30 en total).
- [ ] Las 6 sin verificar (15 min): Seljavallalaug (parking), playa de Vík, Svínafellsjökull, mirador de Rauðafell, Þjóðvegur (zona de renos) y el mirador del lago Mývatn. ¿Cuál era?
- [ ] Cuando estén todas, borra el informe.

### Conducción y duraciones (15 min)

- [ ] `drive` de los días 4 y 6 a 11: `day:status` los marca "estimada". Confírmalos y quita el comentario "Estimación pendiente de confirmar por el autor.".
- [ ] Duraciones de los días 5 a 13: quita `# duraciones estimadas` y esos días de `estimatedDays`.

### Precios y datos de más de 12 meses

`npm run content:validate` da 100 avisos.

- [ ] **Precio de los 10 campings**, verificado hace más de 12 meses (`entry.price`): Þingvellir, Árnes, Skógafoss, Svínafell, Skaftafell, Laugar, Systragil, Lambeyri, Hellissandur y Mosskógar (2 min cada uno, 20 en total).
- [ ] **87 lugares con `verified_at` caducado.** Empieza por los que tienen precio de entrada (`entry.price`, 2 min cada uno): Múlagljúfur, Fjallsárlón, Jökulsárlón, Vestrahorn (también el horario), Fardagafoss, Gufufoss, Rjúkandifoss, Stuðlagil, Dettifoss, Grjótagjá, Krafla, Hverir, Hverfjall, Dimmuborgir, el mirador de Mývatn, Goðafoss, Grafarkirkja, Glaumbær, Víðimýrarkirkja, Kolugljúfur, Kirkjufell, Svörtuloft, Djúpalónssandur, Hellnar, Arnarstapi, Rauðfeldsgjá, Búðakirkja, Ytri Tunga y Landbrotalaug.
- [ ] Dos avisos de estilo (2 min): "una de las cascadas más" en la `description` de `gullfoss`, y "espectacular" en las `notes` de `seljalandsfoss`, que va en la guía y no en el lugar.
- [ ] Un aviso de estructura (2 min): el día 1 tiene `drive` y una parada de ruta (`reykjavik`) sin `travel_to_next_min`.
- [ ] Hub (#26): fianza "1.000-2.000 €" y "Mosskógar solo efectivo", sin fecha (5 min).

### Tasa por kilómetro (5 min)

- [ ] Verifica en island.is los 6,95 ISK/km desde el 1 de enero de 2026. Ahora solo lo dicen empresas de alquiler. Bloquea la satélite de Presupuesto y la pregunta del FAQ del hub (#25 y #26).

### Sky Lagoon (1 min)

- [ ] ¿Fuisteis? Sale en las notas del día 13, pero no en el registro de lugares. Lo piden el panel del día 13 y la satélite de baños termales (#25).

### Egipto, precios que no cuadran (10 min)

- [ ] Hatshepsut: 6,40 € o 6,70 €.
- [ ] Museo de la Civilización: 13 € o 9,20 €.
- [ ] Globo en Luxor: 25-30 € o 100-120 €. ¿En qué moneda?
- [ ] Orange Bay: 20 € o 80-100 €.
- [ ] Torre de El Cairo: "10 € ??".
- [ ] Regreso de Memnón: "1,15 min" (¿1 h 15?).
- [ ] Ningún precio lleva fecha (`checkedAt`).

### Keyword Planner y Trends (30-60 min)

Sale de #25 (`docs/fuentes/seo-islandia-grupo.md` §5). En Keyword Planner, entra en "Obtener volumen de búsquedas y previsiones" y elige España, español y los últimos 12 meses. Pega cada bloque tal cual. Repite con Latinoamérica solo las que pasen en España. Apunta el resultado en la plantilla del 1.11 §5.

Umbrales:

- Confirma con 500 o más en la principal, o 1.000 o más sumando el bloque.
- Entre 100 y 500, se escribe solo si Trends muestra curva propia.
- Con menos de 100 en la principal y menos de 300 en el bloque, se queda como sección.
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

Si "que ver en islandia" supera con mucho a "viajar a islandia", se invierte el título del hub. Si "islandia en septiembre" pasa de 500, su página vuelve a P2.

- [ ] **Trends** (España, 5 años): "islandia", "viaje islandia" y "camper islandia", para ver la estacionalidad (10 min).
- [ ] Después, decide si Islandia o Mallorca hace de laboratorio SEO (1.11 §10).

### Para hacer en el móvil (15 min)

- [ ] **Comprobar** en un iPhone real lo que WebKit en Linux no ve:
  - la pastilla del índice con la barra de Safari;
  - las hojas inferiores frente al indicador de inicio;
  - la vista en horizontal con la muesca;
  - el cierre del bocadillo.

---

## Fotos que faltan

La guía de Islandia tiene foto en los días 1 a 3. Faltan los días 4 a 13 (`day:status`). Por cada día (3 min, unos 30 en total), haz esto:

1. Elige una foto vertical tuya.
2. Lanza el comando. `--name` es el nombre del fichero y `--caption` el lugar que sale en la foto.
3. Escribe el `alt` en el YAML. El comando lo deja vacío a propósito, así que el build falla hasta que describas la foto.

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

- [ ] Foto de portada del hub, si tienes una mejor que Gullfoss (#26). Cambia `cover_image`.
- [ ] Foto de la cabecera de la portada en escritorio, si la quieres (#31).
- [ ] Imagen Open Graph horizontal de 1200×630 con el encuadre que elijas (propuesta de #16, **comprobar**).
- [ ] Fotos propias de Alsacia, verticales y horizontales.

---

## Ya hecho

Desde el 15 de octubre entraron en `develop` los días 4 a 13 (#9, #14), las secciones, el SEO y la accesibilidad (#13, #15, #16, #17), `npm run photo` y `day:status` (#19), los avisos editoriales (#20), la portada con Islandia (#21) y el informe de paneles (#30).
También el contraste, la cabecera, la comprobación de tipos y el `noindex` derivado de `status` (#27 a #34), las dependencias sin vulnerabilidades altas (#10, #40, que cierra #11) y el enlace de salto (#42).
