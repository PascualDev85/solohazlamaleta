# Día 6 — Jökulsárlón, Diamond Beach y Vestrahorn

Borrador de conducción, nombres cortos, motivos de salto y revisión editorial. Nada del repo se ha tocado.

## Punto de partida y final

- **Salida:** Camping Skaftafell (`camp_skaftafell`, overnight del día 5). Ojo: las notas del autor dormían ese día en Svínafell, así que su "(35m)" hasta Múlagljúfur está medido desde Svínafell.
- **Final:** noche fuera de camping (`overnight: null`). El día termina en la última parada, el mirador de Rauðafell, donde el `variant_note` cuenta que os quedasteis a dormir por las auroras. Las notas preveían dormir en Djúpivogur Camping Ground o Fossardalur Campsite. `overnight_note` está vacío y es tuyo.

## Tramos

| # | Tramo | km | min | Origen de los minutos |
|---|---|---|---|---|
| 1 | Camping Skaftafell → Múlagljúfur | 41 | ≈ 45 | Estimado: 35 de las notas (desde Svínafell) + ≈ 10 Skaftafell → Svínafell |
| 2 | Múlagljúfur → Fjallsárlón | 8 | 12 | Notas |
| 3 | Fjallsárlón → Jökulsárlón y Diamond Beach | 13 | 12 | Notas |
| 4 | Jökulsárlón → Vestrahorn | 87 | 72 | Notas (1h 12m) |
| 5 | Vestrahorn → Eystrahorn (Silla Roja) | 14 | 28 | Notas, según la interpretación del orden (ver avisos) |
| 6 | Eystrahorn → mirador de Rauðafell, pasando por la zona de renos, Lækjavík y Djúpavogskörin | 83 | ≈ 71 | 20 + 32 + 4 de las notas + ≈ 15 estimados Djúpavogskörin → Rauðafell |
| | **Total** | **245** | **240** | Notas: 240 km / 3h 35m, pero de Svínafell a Djúpivogur |

**Propuesta para `drive`:** `km: 245`, `minutes: 240`.

**Comentario YAML propuesto:**
`Camping Skaftafell → Múlagljúfur (41 km, ≈ 45 min) → Fjallsárlón (8, 12 min) → Jökulsárlón y Diamond Beach (13, 12 min) → Vestrahorn (87, 72 min) → Eystrahorn (14, 28 min) → mirador de Rauðafell, pasando por la zona de renos, Lækjavík y Djúpavogskörin (83, 20 + 32 + 4 + ≈ 15 min). Total ≈ 245 km; 240 min. Tiempos de las notas del autor salvo los marcados ≈. Noche fuera de camping: el día acaba en la última parada.`

### Cómo salen los km

Haversine entre las coordenadas del YAML, × 1,25 en carretera y × 1,4 donde hay pista de grava o un rodeo evidente:

- × 1,4 en los tramos 1 y 2 (pista hasta el parking de Múlagljúfur), 4 y 5 (pista de Stokksnes hasta Vestrahorn y vuelta) y 6 (rodeo del fiordo de Berufjörður).
- × 1,25 en el tramo 3.
- Total 245,0 km → 245. Minutos 240, ya múltiplo de 5.

Los tramos 5 y 6 probablemente se quedan cortos en km: la carretera rodea Höfn por el túnel de Almannaskarð y después el fiordo, y el haversine no lo recoge del todo. Los minutos, que vienen de las notas, sí.

## `travel_to_next_min` (solo paradas de ruta, modo "coche")

| place_id | min |
|---|---|
| mulagljufur | 12 |
| fjallsarlon | 12 |
| jokulsarlon | 72 |
| vestrahorn | 28 |
| eystrahorn | 71 |

Rauðafell es la última parada y no lleva. Si quieres seguir el patrón del día 4 (tiempos también en las paradas no visitadas del tramo): eystrahorn → renos 20, renos → laekjavik 32, laekjavik → djupavogskorin 4 (notas) y djupavogskorin → raudafell ≈ 15 (estimado).

## Nombres cortos propuestos

| place_id | Nombre actual | short_name |
|---|---|---|
| mulagljufur | Cañón de Múlagljúfur | Múlagljúfur |
| fjallsarlon | Laguna Glaciar Fjallsárlón | Fjallsárlón |
| jokulsarlon | Laguna Glaciar Jökulsárlón y Diamond Beach | Jökulsárlón |
| vestrahorn | Vestrahorn y Stokksnes | Vestrahorn |
| eystrahorn | Eystrahorn (Silla Roja / Red Chair) | Eystrahorn |
| thjodvegur_renos | Þjóðvegur (zona de renos) | Zona de renos |
| raudafell | Rauðafell mountain view point | Rauðafell |

Lækjavík y Djúpavogskörin se quedan como están. Línea de ruta resultante (seis paradas de ruta): "Múlagljúfur → Fjallsárlón → Jökulsárlón → Vestrahorn → Eystrahorn → Rauðafell", unos 77 caracteres. Con seis paradas el objetivo son dos filas (≈ 56), y aquí saldrán tres en un móvil de 350 px. Son nombres propios: no veo cómo recortarlos sin perderlos.

## `skip_reason` propuestos

- **thjodvegur_renos:** "No es una parada en sí, sino un tramo de carretera donde a veces se ven renos. Pasamos por él y no vimos ninguno." (sale de tu `our_take`).
- **laekjavik:** "Estaba en el plan como opción dudosa y, en un día tan largo, quedó fuera." (marcado "??" en las notas).
- **djupavogskorin:** "Estaba en el plan con la duda de si la poza seguía abierta, y al final quedó fuera." (las notas dicen "mirar la poza" y "comprobar si está abierto").

## Revisión editorial de los lugares

- **vestrahorn / description:** quitar "un clásico de la fotografía de paisaje en Islandia" (valoración sin fuente). Texto propuesto en el JSON.
- **vestrahorn / notes:** quitar "uno de los paisajes más fotografiados de Islandia" (superlativo sin fuente) y dejar el acceso (recinto del Viking Café, poblado vikingo de atrezo). Añadir la frase de coordenadas si no las has confirmado: no hay `maps_url` ni comentario de confirmación.
- **jokulsarlon / notes:** mismo caso, falta la frase de coordenadas si no están confirmadas. Si ya lo están, descartar.
- **eystrahorn / description:** el texto actual atribuye la silla roja a la montaña; la silla está en el mirador desde el que se ve la montaña. Se quita el "Red Chair" en inglés.
- **eystrahorn / notes:** repetía "junto a la carretera" dos veces; mismo contenido, ordenado como acceso.
- **djupavogskorin / notes:** el YAML dice "formaciones rocosas junto al mar"; tus notas hablan de una poza termal. Propongo "Pequeña poza de agua caliente junto al mar, a las afueras de Djúpivogur. Según las notas del autor, hay que comprobar si sigue abierta." Confírmalo antes de aplicarlo.
- **raudafell / description:** "vistas abiertas al cielo nocturno" es el contexto de la parada (las auroras), que ya cuenta el `variant_note`; la description debe decir qué es el lugar: "Mirador a pie de carretera junto a la montaña Rauðafell, en el este de Islandia."
- Sin cambios: mulagljufur, fjallsarlon, laekjavik, thjodvegur_renos (solo les faltaría una `description`, que es opcional).

## Avisos

1. **Punto de partida distinto al de las notas.** La guía duerme el día 5 en Skaftafell; las notas, en Svínafell. Por eso el primer tramo es estimado (45 min).
2. **Orden Renos / Silla Roja.** En las notas la zona de renos va antes que la Silla Roja; en la guía, Eystrahorn va antes que los renos. El orden de la guía es el geográfico (los propios pines de las notas sitúan la Silla Roja entre Vestrahorn y los renos). Los "(Xm)" de las notas parecen seguir el orden geográfico y no el de la lista: Vestrahorn → Silla Roja 28, Silla Roja → renos 20, renos → Lækjavík 32, Lækjavík → Djúpavogskörin 4. Así los he usado. Confírmalo.
3. **Coordenadas que no cuadran con tus pines.** `eystrahorn` en el YAML (64.3028, -14.8350) está a unos 6 km de tu pin (64.3417, -14.9282, repetido en la página 9). `thjodvegur_renos` en el YAML (64.4500, -14.6500) está a unos 7 km de tu pin (64.4445, -14.5087). He calculado con el YAML; con tus pines el tramo Vestrahorn → Eystrahorn serían ≈ 16 km en vez de 14. No propongo coordenadas: son tuyas.
4. **Overnight.** Las notas decían Djúpivogur Camping Ground o Fossardalur Campsite; la guía tiene `overnight: null` (noche en el mirador). Cuadra con lo vivido, no con el plan. Ninguno de los dos campings existe en el YAML y no se añade nada. `overnight_note` sigue vacío.
5. **Rauðafell no está en las notas** (el DIA 5 acaba en Djúpavogskörin): es parada del viaje real, con coordenadas aproximadas. El último tramo es el menos fiable del día.
6. **Paradas de las notas sin place_id:** ninguna.
7. **Línea de ruta a tres filas** (ver nombres cortos).
8. **Nombres en inglés:** "Rauðafell mountain view point" → "Mirador de Rauðafell"; "Eystrahorn (Silla Roja / Red Chair)" → "Eystrahorn (Silla Roja)"; "Skaftafell Campground" → "Camping Skaftafell".
9. **Djúpavogskörin:** confirmar si es una poza termal (como dicen tus notas) o formaciones rocosas (como dice el YAML).
10. El comentario `# duraciones estimadas, pendiente de confirmar` del día 6 sigue vigente: no toco las `duration_min`.
