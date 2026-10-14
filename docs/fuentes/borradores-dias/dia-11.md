# Día 11 — Camino al oeste: iglesias de turba y Kolugljúfur

Corresponde al **DÍA 10** de las notas (Opción 2, anti-horario): Grafarkirkja → Glaumbær → Fosslaug → Víðimýrarkirkja → Kolugljúfur → Erpsstaðir ?? → Selvallafoss ?? → Kolgrafarfjörður, "Dormir en Campground Grundarfjörður", "Ruta 375km 5h 10m". La correspondencia está comprobada por los nombres de las paradas.

- **Salida**: Camping Lambeyri (overnight del día 10). Ojo: las notas arrancaban desde Hofsós/Hólar, así que el "(5m)" de Grafarkirkja no vale y el primer tramo se estima.
- **Llegada**: Camping Hellissandur (overnight del YAML). Las notas dicen Grundarfjörður. Ver avisos.
- No hay paradas `not_visited` este día: no hace falta ningún `skip_reason`.

## Tramos

| # | Tramo | km | min | Origen del tiempo |
|---|---|---|---|---|
| 1 | Camping Lambeyri → Grafarkirkja | 41 | 35 | estimado (haversine 33 km × 1,25 / 70 km/h) |
| 2 | Grafarkirkja → Glaumbær | 29 | 36 | notas "(36m)" |
| 3 | Glaumbær → Víðimýrarkirkja | 17 | 15 | estimado; las notas van por Fosslaug (15 + 11 min) |
| 4 | Víðimýrarkirkja → Kolugljúfur | 73 | 70 | notas "(1h 10m)" |
| 5 | Kolugljúfur → Kolgrafarfjörður | 183 | 165 | notas pasando por Erpsstaðir (1h 20m + 1h 25m); factor 1,4 por el rodeo por Hrútafjörður y Dalir |
| 6 | Kolgrafarfjörður → Camping Hellissandur | 37 | 32 | estimado (haversine 29,7 km × 1,25 / 70 km/h) |
| | **Total** | **380** (379,9) | **355** (353) | |

Propuesta de `drive`: `km: 380`, `minutes: 355`.

Comentario YAML propuesto:

`# Camping Lambeyri → Grafarkirkja (≈ 41 km, ≈ 35 min) → Glaumbær (29, 36 min) → Víðimýrarkirkja (17, ≈ 15 min) → Kolugljúfur (73, 70 min) → Kolgrafarfjörður, pasando por Erpsstaðir (183, 80 + 85 min) → Camping Hellissandur (37, ≈ 32 min). Total ≈ 380 km; 353 min → 355. Tiempos de las notas del autor salvo los marcados ≈. Estimación pendiente de confirmar por el autor.`

Contraste con las notas: 375 km / 5h 10m desde Hofsós hasta Grundarfjörður. Nuestra cifra sale parecida en km (sube por acabar en Hellissandur, 37 km más allá) y algo más en minutos (el ida y vuelta a Grafarkirkja desde Lambeyri).

## travel_to_next_min

| Parada | travel_to_next_min | modo |
|---|---|---|
| grafarkirkja | 36 | coche |
| glaumbaer | 15 | coche |
| vidimyrarkirkja | 70 | coche |
| kolugljufur | 165 | coche |
| kolgrafarfjordur | — (última) | |

## Nombres cortos propuestos

| place_id | name actual | short_name |
|---|---|---|
| glaumbaer | Glaumbær Farm | Glaumbær |
| vidimyrarkirkja | Víðimýrarkirkja | Víðimýri |
| kolugljufur | Cañón de Kolugljúfur | Kolugljúfur |

Grafarkirkja y Kolgrafarfjörður se quedan como están (nombre propio de una palabra). La línea de ruta queda en 67 caracteres: 3 filas en 350 px, no las 2 que tocan con 5 paradas. Solo bajaría a 2 filas con "Gröf" por Grafarkirkja (59, y aun así justo). Decisión del autor.

## skip_reason

Ninguno: las cinco paradas están `visited`.

## Revisión editorial de lugares (texto completo en `dia-11.json`)

- **grafarkirkja / description**: "Höfðaströnd" no es una península (es la costa este de Skagafjörður) y "una de las más antiguas" se deja como dato atribuido (es la iglesia más antigua conservada según el Museo Nacional de Islandia, que la custodia).
- **grafarkirkja / notes**: repetía la description y traía opinión ("Muy paisajística"). Se cambia por acceso: carretera 76 al sur de Hofsós, camino corto a pie, solo por fuera. Datos de referencia general, a confirmar.
- **glaumbaer / notes**: repetía la description sin acceso. Se indica carretera 75 y que el interior depende del horario de museo (el autor llegó antes de abrir).
- **vidimyrarkirkja / description**: "una de las mejor conservadas" es superlativo sin fuente; se sustituye por quién la custodia (Museo Nacional) y la ubicación.
- **vidimyrarkirkja / notes**: repetía la description; se pone el acceso (a pie de la Ring Road en Varmahlíð, parking y baños).
- **kolugljufur / notes**: repetía la description; se añade el desvío (≈ 6 km por la 715 hasta el puente, ambas orillas, miradores sin barandilla). A confirmar.
- **kolgrafarfjordur / notes**: repetía la description; se dice qué es la parada en la práctica (puente de la 54). A confirmar.
- En glaumbaer, vidimyrarkirkja y kolgrafarfjordur las notes terminaban con "Coordenadas y datos de referencia general…"; en los textos propuestos se usa la frase estándar "Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."
- No se toca: description de glaumbaer, kolugljufur y kolgrafarfjordur (correctas y objetivas).

## Avisos

1. **overnight no cuadra**: YAML `camp_hellissandur`; notas "Dormir en Campground Grundarfjörður". Hellissandur está ~35 km más al oeste, pasado Kirkjufell y Ólafsvík, y el DÍA 11 de las notas (día 12 de la guía) arranca en Kirkjufell "(15m)", que cuadra con Grundarfjörður. Si se durmió en Hellissandur, el día 12 empieza volviendo ~25 km al este. Confirmar.
2. **Punto de partida y orden**: el día 10 acaba en Lambeyri (cerca de Varmahlíð), no en Hólar/Hofsós como planeaban las notas. Desde Lambeyri, Grafarkirkja supone subir ~40 km al norte y volver, pasando por delante de Glaumbær y Víðimýri. El orden del YAML coincide con las notas; confirmar que se hizo así.
3. **Paradas de las notas que no están en el YAML** (solo se listan): Fosslaug (cascada y hot spring, entre Glaumbær y Víðimýrarkirkja), Erpsstaðir ?? (helado, de paso hacia Snæfellsnes) y Selvallafoss ??.
4. **Coordenadas de grafarkirkja** (65.6270, -19.9500) parecen erróneas: caen en el interior, al oeste de Sauðárkrókur; la iglesia está en Höfðaströnd, al sur de Hofsós (aprox. 65.86, -19.40). Con esa corrección el tramo 1 sube a ≈ 55 km / 45 min y el día a ≈ 395 km. Las otras cuatro coordenadas también son aproximadas (todas marcadas como pendientes): los km cambiarán al confirmarlas.
5. **Tramo 5**: los 165 min suman los de las notas pasando por Erpsstaðir; si no se paró allí, el real pudo ser algo menor.
6. **Nombre en inglés**: "Glaumbær Farm" → "Granja de Glaumbær".
7. **Línea de ruta**: 3 filas en vez de 2 (ver nombres cortos).
8. **glaumbaer sin `hours`**: el autor llegó antes de abrir; conviene añadir el horario cuando lo confirme (campo del autor, no se propone aquí).
