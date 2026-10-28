# Deberes del autor

Lo que solo puedes hacer tú, junto en una lista. Puesta al día el 2026-10-22
por la tarde, después de las mezclas del día: #69 (portada completa), #71
(precios verificados), #45 (404), #73 (hub, con las decisiones recomendadas)
y, si han terminado, #57 (repaso) y #74 (arreglos previos al despliegue).

Los tiempos son estimaciones en minutos. Lo que no está claro si sigue
pendiente va marcado **comprobar**.

---

## Ahora mismo

1. **Mezclar #72 (`develop` → `main`) y desplegar** (5 min + `docs/DESPLIEGUE.md`).
   Claude no puede mezclar en `main`: el modo automático lo trata como un
   despliegue a producción. Antes, en Cloudflare: `NODE_VERSION = 24`,
   preset Astro, `npm run build`, salida `dist`, rama de producción `main`.
   Si un check de Lighthouse sale en rojo con `/buscar/` en 96, es ruido de
   la máquina de la CI (en local da 100): relanza el job.
2. **Tras el despliegue** (7 min): las comprobaciones de `DESPLIEGUE.md` §4,
   con la 404 de §4.2 bis (`/no-existe/` dice «Te has salido del mapa»).
3. **Repasar con calma los textos aprobados de forma provisional** (30 min),
   antes de publicar la guía de Islandia: la portada y el hub. Están
   marcados en el YAML del hub como «Approved provisionally by the author on
   2026-10-22».

---

## Hecho el 28 de octubre

- **#75**: dependencias de la semana (Astro 7.4.1 y tres más; una vulnerabilidad moderada menos).
- **#50**: coordenadas y fichas de Maps de Grafarkirkja, Landbrotalaug y Stuðlagil, mezcladas tal
  cual. Sus dos preguntas siguen abiertas (4.1).
- **#56**: la lista de comprobación del 21, como histórico.
- **#77**: los 67 lugares con la fecha general caducada, verificados en fuentes oficiales
  (`docs/fuentes/verificacion-lugares-2026-10-28.md`). Lo que más cambia en la guía:
  - **Gullfoss** cobra el aparcamiento: 1.080 ISK cada 4 h.
  - **Aparcamientos de pago** en Gluggafoss, Hengifoss, Hafnarhólmi, Skaftafell (Svartifoss) y
    Djúpalónssandur. Este último paga la tarifa nueva del Parque Nacional de Snæfellsjökull.
  - **Glaumbær** cobra entrada (2.200 ISK) y **Víðimýrarkirkja** abre por dentro en verano.
  - **Keldur** cierra en septiembre y la **cueva de Fardagafoss** se ha derrumbado.
  - Los avisos de datos caducados pasan de 90 a 75.

Pendiente de esto:

- [ ] **Tasa nueva en proyecto** (vigilar, 0 min hoy): cobro a los no residentes en Geysir,
      Gullfoss y Þingvellir desde mayo de 2027, de 3.000 a 4.500 ISK. Si se aprueba, cambia el
      día 2 y el presupuesto.
- [ ] **Duraciones que no cuadran con la oficial** (5 min): Leirhnjúkur 45 min frente a 1-3 h.
      Hengifoss y Glymur ya llevan el dato oficial en sus notas.
- [ ] **35 lugares sin fuente oficial**: siguen avisando de caducados. La lista está en el documento
      del 28. Se cierran a mano o en el próximo viaje.
- [ ] **#76, Macedonia del Norte**: otra guía de la rutina semanal en el formato antiguo, como #54 y
      #12. No se ha tocado, y va con la misma pregunta: ¿se adapta la rutina al formato del motor?

## 1-2. Portada y hub: hecho el 22 de octubre

- **Portada, menú, buscador v2, postales 3D, fotos nítidas, áreas de toque y
  texto al 150 %**: en `develop` con #69. Textos de la portada como estaban
  (tu visto bueno del 22, «de momento»).
- **Precios de campings y aparcamientos**: verificados en fuentes oficiales
  desde tu ordenador y mezclados en #71. Detalle en
  `docs/fuentes/verificacion-2026-10-22.md`.
- **404 propia**: en `develop` con #45.
- **Hub `/islandia/`**: en `develop` con #73, que une #25, #26, #35, #55 y #65
  y aplica la opción recomendada de las 8 preguntas de la hoja de #26:
  - «Lo práctico» lleva fecha de comprobación (`practical.verified_at`,
    2025-09-15). **Avisa de caducado** hasta que vuelvas a mirar la fianza,
    «Mosskógar solo efectivo» y la norma de pernoctar (5 min).
  - El hub se publica a la vez que su guía (un solo interruptor).
  - Las enmiendas del modelo constan como validadas en 1.7.2.
  - El hub da 99 en móvil por la calidad de las fotos, como la portada y la
    guía.

Pendiente de estas secciones:

- [ ] **#64**: ¿recorte editorial en «Nuestro criterio» para que la guía
      llegue a 100 en móvil? (5 min). Hoy se queda en 99, dentro de su mínimo.
- [ ] **¿Vuestra camper tenía 6 o más plazas registradas?** (1 min). En
      varias zonas cambia el precio del aparcamiento (ver #71).
- [ ] **Foto de Reikiavik** en más resolución (el original mide 659 px).
- [ ] **Modo oscuro de las postales** (#68): comprobar cuando haya tema
      oscuro.

---

## 3. Despliegue (50 min)

Rama de producción: **opción A**, `develop` → `main`, y se despliega `main`.
`main` solo tenía el primer commit (el del brief): **#72** la pone al día.

- [ ] **`NODE_VERSION = 24`** en las variables del proyecto de Cloudflare,
      antes del primer build (2 min). Sin eso, el build falla en
      `write-headers.ts`.
- [ ] **Mezclar #72** (3 min) cuando tenga la CI en verde.
- [ ] **Seguir `docs/DESPLIEGUE.md`** (~31 min): conectar GitHub, configurar
      el build, `pages.dev`, las comprobaciones (§4, con la 404 en §4.2 bis)
      y elegir la analítica. Recomendado: Umami Cloud gratis; luego hay que
      permitirla en la CSP y contarla en `/privacidad/`.
- [ ] **¿Siguen los legales en el sitemap?** (1 min). El repaso dice que vale
      tal cual.
- [ ] **El día del dominio**, más adelante: `solohazlamaleta.com` y `www` en
      Custom domains, redirección 301 de `www` (Redirect Rules), Always Use
      HTTPS, HSTS con `max-age` corto y sin `preload`, y avisar a Claude para
      la regla `noindex` de `pages.dev`.

Sin hacer del repaso (necesitan decisión o modelo nuevo): `og:image` por
defecto (hace falta una imagen de marca) y `author`/`datePublished` en el
`Article` de la guía (el modelo no tiene `published_at`).

---


## 4. Contenido y datos

### 4.1. #50 · Coordenadas de Grafarkirkja, Landbrotalaug y Stuðlagil (5 min)

Mezclada el 28 de octubre. Siguen abiertas sus dos preguntas:

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

### 4.4. Precios y datos de más de 12 meses

Hecho el 22 (#71): 10 campings, 20 aparcamientos y entradas y el horario de
Vestrahorn, contra webs oficiales. `content:validate` pasa de 97 a 89 avisos
de caducidad, más uno nuevo: «Lo práctico» del hub (ver 1).

- [ ] **Sin fuente oficial**, queda en tu mano (2 min cada uno): campings
      Lambeyri y Mosskógar (no tienen web), Krafla/Víti, DC-3 de
      Eyvindarholt, si Gljúfrafoss comparte ticket con Seljalandsfoss, baños
      de Hverir (300 ISK) y la entrada de Vestrahorn (la web dice 1.200 y
      1.100).
- [ ] **Camping Skógafoss** (2 min): su web dice que ahora solo hay agua
      fría y váteres; la ficha habla de duchas de pago.
- [ ] **`entry.price` repetido del aparcamiento** en Krafla, Hverfjall y
      Kirkjufell: ¿a 0, como ya se hizo con Ytri Tunga? (2 min)
- [ ] **Entradas gratuitas sin confirmar** (Þingvellir, Geysir,
      Seljalandsfoss…): las webs solo hablan del aparcamiento; su
      `entry.verified_at` sigue caducado.
- [ ] **El resto de lugares con `verified_at` caducado** (unos 67): solo la
      fecha general del lugar. La lista, en `docs/fuentes/verificacion-2026-10-21.md`
      (#56), prioridad 5.


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
