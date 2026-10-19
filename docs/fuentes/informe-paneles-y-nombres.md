# Paneles "Ver día completo" y nombres de parada: informe para el autor

> Informe de trabajo (no es contenido publicado). Rutina del 16 de octubre de 2026, sobre `origin/develop` en `69a2e78` (build local con `npm ci && npm run build`).
> No cambia contenido ni código: solo mide y propone. Las decisiones son del autor.

## Resumen

- **Paneles que pasan de 150 palabras: 4 claros (días 3, 6, 8 y 9) y 2 al límite (días 12 y 4).** El día 6 (336) y el día 3 (304) doblan el límite. En los cuatro, buena parte del exceso no es "lo que vivimos": son datos de acceso y visita, una advertencia legal y frases **repetidas entre bloques del mismo panel**.
- **Nombres de parada que desbordan: 0.** Ni a 350, 375, 390 o 414 px, ni siquiera a 320. La propuesta P2 de la auditoría (PR #17) ya está resuelta en develop: los commits `f54f90c` y `068c713` (14 oct.) acortaron los nombres. El más justo deja 30 px libres a 350 px y 6 px a 320 px.
- **Lo más rápido (≈ 15 min):** en el día 6, dejar la advertencia de Rauðafell en una frase y quitar la frase de los renos repetida en "Lo que haríamos distinto"; en el día 3, quitar de "Lo que haríamos distinto" la descripción de la pista (ya está en la experiencia de Háifoss); en el día 9, quitar "Hverir huele mal…" (repite la experiencia). Con eso el día 6 baja a unas 265 palabras, el 3 a unas 280 y el 9 a unas 230. Llegar a 150 ya pide mover texto a satélites que todavía no existen (ver §1.2).
- **Lo que más falta en los paneles cortos:** la noche (ningún día tiene `overnight_note` con texto) y el plan B (solo los días 2 y 3). En §1.3 van las preguntas concretas.

---

## 1. Paneles por día

### Cómo se contó

Texto visible de cada `#dia-N-completo` en `dist/islandia/islandia-en-camper-13-dias/index.html`. Dos cifras:

- **Texto del autor**: solo la prosa (sin títulos de bloque ni nombres de parada). Es la que se compara con el límite.
- **Panel entero**: con títulos y nombres, lo que lee la persona.

Bloques según 1.13 §4: **E** experiencia por parada · **N** la noche · **F** lo que no hicimos · **D** lo que haríamos distinto · **B** plan B. El bloque 6 ("Más sobre <zona> →") no se cuenta: todavía no existe ninguna satélite, así que hoy no debe aparecer.

| Día | Texto del autor | Panel entero | Tiene | Le falta | ¿> 150? |
|---|---|---|---|---|---|
| 1 · Llegada y Reikiavik | 122 | 130 | E, D | N, F, B | No |
| 2 · Círculo Dorado | 133 | 143 | E, D, B | N, F | No |
| 3 · Cascadas del sur | **304** | 323 | E, F, D, B | N | **Sí, el doble** |
| 4 · Sur de Islandia | 147 | 172 | E, F, D | N, B | Al límite (pasa con títulos) |
| 5 · Trekking en el glaciar | 124 | 141 | E, F, D | N, B | No |
| 6 · Jökulsárlón, Diamond Beach y Vestrahorn | **336** | 358 | E, F, D | N, B | **Sí, más del doble** |
| 7 · Fiordos del este | 111 | 126 | E, F, D | N, B | No |
| 8 · Cañones y cascadas del este | **194** | 211 | E, F, D | N, B | **Sí** |
| 9 · Mývatn y Krafla | **249** | 269 | E, F, D | N, B | **Sí** |
| 10 · Goðafoss, Akureyri y Tröllaskagi | 102 | 107 | E | N, F, D, B | No |
| 11 · Camino al oeste | 53 | 57 | E | N, F, D, B | No |
| 12 · Snæfellsnes | 151 | 163 | E | N, F, D, B | Al límite |
| 13 · Regreso a Reikiavik | 89 | 100 | F, D | E, N, B | No |

Media del texto del autor: 163 palabras (1.13 §4 decía 120; la diferencia es que ahora están escritos los días 5–13).

### 1.2 Los que pasan: qué es "guía de zona" y adónde iría

Las satélites de zona son las del 1.11 §3: **Círculo Dorado** (día 2), **Costa sur** (días 3–6), **Fiordos del este** (días 7–8), **Mývatn** (día 9), **Snæfellsnes** (día 12). Algunas frases encajan mejor en una satélite práctica (Campings, Baños termales).

Se marcan dos tipos de recorte: **(R)** repetido dentro del mismo panel, se puede quitar ya sin perder nada; **(Z)** guía de zona, se queda hasta que exista su satélite y entonces se mueve.

**Día 6 (336)**

| Cita | Tipo | Destino |
|---|---|---|
| Rauðafell: "en Islandia está prohibido pernoctar en camper fuera de los campings y hay multas… Quedarse solo es legal con permiso del propietario del terreno…" (≈ 65 palabras) | Norma general, no vivencia | Satélite **Campings de Islandia** (sección acampada libre, como propone `seo-islandia-grupo.md`) y FAQ del hub. En el panel bastaría una frase: "Está prohibido y no lo recomendamos: si las auroras te pillan en ruta, sigue luego hasta un camping". Al ser una norma, lleva fecha de verificación donde acabe |
| "No vimos ningún reno en el tramo donde suelen estar — no lo contaríamos como parada en sí…" (en "Lo que haríamos distinto") | **(R)** Repite casi literal el motivo de Þjóðvegur en "Lo que no hicimos" | Quitar del bloque D |
| "Diamond Beach y Jökulsárlón son dos sitios distintos separados por la Ring Road: cruzar con cuidado entre ambos" | (Z) Consejo de visita | **Costa sur** |
| Jökulsárlón: "Desde Jökulsárlón salen excursiones en barca para ver de cerca cómo caen los icebergs al mar" | (Z) Oferta del lugar, no la hicisteis | **Costa sur** |
| Múlagljúfur: "Desde el parking al mirador son unos 45 minutos de ida y otros 45 de vuelta" | (Z) Dato de visita; la parada ya pinta su tiempo | **Costa sur** |

**Día 3 (304)**

| Cita | Tipo | Destino |
|---|---|---|
| D: "la pista hasta el parking de Háifoss es irregular, con una camper sin 4x4 hay que ir con cuidado y se pierde mucho tiempo en el acceso" | **(R)** Ya está en la experiencia de Háifoss | Quitar del bloque D |
| F, Gluggafoss: "Es una de las paradas que haríamos a cambio de Háifoss" y Seljavallalaug: "Si se deja fuera el desvío a Háifoss, cabe antes de dormir en Skógafoss" | **(R)** El bloque D ya dice que cambiaríais Háifoss por Keldur, Gluggafoss y Seljavallalaug | Dejar el cambio en un solo sitio (mejor en D) |
| D: "Seljalandsfoss se puede hacer con calma por la mañana" | (Z) Consejo general de visita | **Costa sur** |
| F, Gluggafoss: "Queda de paso en la carretera 261, cerca de Nauthúsagil" | (Z) Ubicación | **Costa sur** |
| F, Seljavallalaug: "Entre el camino a pie y el baño son más de una hora" | (Z) Dato de visita | **Costa sur** o **Baños termales** |

**Día 9 (249)**

| Cita | Tipo | Destino |
|---|---|---|
| D: "Hverir huele mal por el azufre pero es de los paisajes más marcianos del viaje" | **(R)** La experiencia de Hverir ya dice "parece de otro planeta, como estar en Marte". Además no es "lo que haríamos distinto" | Quitar, o cambiarlo por algo que sí haríais distinto (ver pregunta en §1.3) |
| Hverfjall: "1,5 km entre ida y vuelta, unos 15 minutos, bastante empinada" | (Z) Ficha de la ruta | **Mývatn** |
| Dimmuborgir: "Hay varios senderos; hicimos el más largo" | (Z) a medias; "hicimos el más largo" es vivencia | **Mývatn** (la lista de senderos) |
| Hverir: "Toda la zona es un recorrido bastante largo con fumarolas" | (Z) Descripción del lugar | **Mývatn** |
| Jarðgangalaug: "donde el agua está más fresca que río arriba pero aun así calentita" | (Z) Cómo es la poza | **Baños termales** |

**Día 8 (194)**

| Cita | Tipo | Destino |
|---|---|---|
| Grjótagjá: "(aquí se rodó una escena de la serie)" | (Z) Curiosidad, de lo que 1.13 §4 deja fuera | **Mývatn** (Grjótagjá está junto al lago, aunque la visitasteis el día 8) |
| Dettifoss: "Creemos que el lado oeste es mejor, pero si tienes tiempo, merece la pena ver los dos lados" | (Z) Guía de visita | **Mývatn**: el 1.11 asigna el día 8 a Fiordos del este, pero Dettifoss queda más cerca de Mývatn. A decidir |
| D: "Stuðlagil desde el lado este no cruza el río… las fotos más espectaculares se ven desde el otro lado" | (Z) Consejo de visita | **Fiordos del este** |

**Al límite**

- **Día 12 (151):** todo es experiencia, nueve paradas. Lo más de guía de zona: Arnarstapi "todo se recorre andando… el puente de piedra (Gatklettur)" y Ytri Tunga "uno de los sitios para ver focas de cerca" → **Snæfellsnes**. Hoy no hace falta recortar.
- **Día 4 (147, 172 con títulos):** pasa por los cinco títulos de "Lo que no hicimos". Cuatro motivos dicen lo mismo ("quedó fuera por tiempo"). No es guía de zona; si queréis bajarlo, se puede juntar en una línea al escribir el contenido.

### 1.3 Los que no llegan: preguntas para el autor

No escribo el texto: son preguntas para que lo escribáis vosotros. Solo bloques que faltan según 1.13 §4.

**Para todos (la noche):** ningún día tiene nota de la noche. ¿Queréis una o dos frases por camping o solo en los que tuvieron algo que contar?

- **Día 1 (122).** ¿Cómo fue la primera noche en el camping de Þingvellir, llegando tan cansados? ¿Hubo algo de Reikiavik que quisierais ver y dejarais para otro día? Si llueve el primer día en Reikiavik, ¿qué haríais?
- **Día 2 (133).** ¿Por qué evitaríais el camping de Árnes? (El informe de SEO lo da como "cuál evitar", pero el panel no lo dice.) Kerið solo sale en "Lo que haríamos distinto": ¿queréis que esté en "Lo que no hicimos" con su motivo (lo cambiasteis por Reykjadalur)?
- **Día 5 (124).** ¿Qué tal la noche en Skaftafell? Si cancelan el trekking por el tiempo, ¿qué haríais ese día?
- **Día 7 (111).** Esa noche fue fuera de camping (`overnight: null`): ¿dónde dormisteis y por qué? Siete paradas y solo 36 palabras de experiencia: ¿qué contaríais de Vök Baths y de Seyðisfjörður? Si hace mal tiempo en los fiordos, ¿cuál es el plan B?
- **Día 10 (102).** ¿Qué haríais distinto el día 10? ¿Cómo fue la noche en Lambeyri? ¿Dejasteis algo fuera en Tröllaskagi? Si el mar no deja salir a ver ballenas en Hauganes, ¿qué haríais?
- **Día 11 (53).** Es el panel más corto. ¿Qué haríais distinto en este día de carretera? ¿Qué tal la noche en Hellissandur? ¿Hubo alguna parada prevista que no hicisteis? ¿Plan B si llueve?
- **Día 13 (89).** No tiene experiencia. Las notas del día mencionan Sky Lagoon y no está en el registro de lugares: ¿fuisteis? Si fue así, ¿una o dos frases de cómo fue?
- **Día 9 (si quitáis "Hverir huele mal…"):** ¿qué haríais distinto de verdad en Mývatn, por ejemplo con Krafla, que no repetiríais?

---

## 2. Nombres de parada que no caben

### Cómo se midió

Playwright 1.63 con el Chromium preinstalado (`/opt/pw-browsers/chromium-1194`, por `executablePath`), contra `astro preview` del build. A 320, 350, 375, 390 y 414 px de ancho: se abren todos los "Ver N paradas más" (70 paradas visibles de 70), se espera a que carguen las fuentes (Nunito) y, para cada `.day-stop__name`, se compara el ancho real del texto (un `Range` sobre el nombre) con el ancho de su caja, y el borde derecho del texto con el borde izquierdo de `.day-stop__time`. Hasta 414 px el nombre va en una línea (`white-space: nowrap`).

### Resultado: ninguno desborda

| Anchura | Paradas medidas | Nombres que desbordan | Montados sobre el tiempo |
|---|---|---|---|
| 320 px | 70 | 0 | 0 |
| 350 px | 70 | 0 | 0 |
| 375 px | 70 | 0 | 0 |
| 390 px | 70 | 0 | 0 |
| 414 px | 70 | 0 | 0 |

Los nombres que citaba la auditoría ya no están así: "Laguna Glaciar Jökulsárlón y Diamond Beach" es ahora "Jökulsárlón" y "Eystrahorn (Silla Roja / Red Chair)" es "Eystrahorn (Silla Roja)". La auditoría se hizo sobre una rama anterior a `f54f90c` ("stop names that fit one line") y `068c713` ("shorter stop names").

### Los más justos (vigilar si se añaden paradas o cambia la letra)

No hace falta cambiarlos. Si un día hiciera falta, estas serían las propuestas:

| Día | `place_id` | Nombre actual | Margen a 350 / 320 px | Propuesta 1 | Propuesta 2 |
|---|---|---|---|---|---|
| 6 | `fjallsarlon` | Laguna Glaciar Fjallsárlón | 30 / 6 px | Fjallsárlón (ya es su `short_name`) | Laguna Fjallsárlón |
| 12 | `djupalonssandur` | Playa de Djúpalónssandur | 30 / 6 px | Djúpalónssandur (su `short_name`) | — (no hay forma más corta fiel) |
| 12 | `raudfeldsgja` | Garganta de Rauðfeldsgjá | 31 / 7 px | Rauðfeldsgjá (su `short_name`) | Cañón Rauðfeldsgjá |
| 2 | `reykjadalur` | Reykjadalur (valle termal) | 36 / 12 px | Reykjadalur, y "valle termal" pasa a la primera frase de la descripción | Valle de Reykjadalur |
| 5 | `trekking_glaciar_svinafellsjokull` | Trekking en Svínafellsjökull | 39 / 14 px | Trekking en el glaciar (su `short_name`) | Glaciar Svínafellsjökull |

Nota: según la auditoría, `test:ui` solo revisa los días con datos de conducción, así que un día sin ellos puede desbordar sin que el test avise. Esta medición con Playwright cubre los 13 días.
