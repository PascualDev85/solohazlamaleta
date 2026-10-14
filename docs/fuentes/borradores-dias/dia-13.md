# Día 13 — Regreso a Reikiavik y entrega de la camper

Último día de la ruta: sin `overnight`. Sale del Camping Mosskógar (noche del día 12) y termina en el aeropuerto de Keflavík (63.985, -22.605), donde se entrega la camper. La única parada de ruta es Reikiavik; Glymur queda como `not_visited` y ya tiene su `skip_reason`.

## Tramos y conducción

| Tramo | km | min | Origen |
|---|---|---|---|
| Camping Mosskógar → Reikiavik (parking de Perlan) | 20 | 17 | estimado |
| Reikiavik → Aeropuerto de Keflavík (entrega de la camper) | 46 | 40 | estimado |
| **Total (`drive`)** | **65** | **55** | |

Cómo salen las cifras: las notas del autor no dan ningún tiempo para este día (el «(40m)» del DÍA 12 de las notas es Þórufoss → Reikiavik, un tramo que no se hace), así que los dos tramos son haversine × 1,25 y minutos a 70 km/h. Haversine: 15,6 km y 37,1 km; con factor de carretera, 19,5 y 46,3 km (65,8 → 65 km redondeando a 5). Minutos: 17 + 40 = 57 → 55 redondeando a 5.

Comentario propuesto para el YAML, encima de `drive`:

> Camping Mosskógar → Reikiavik (≈ 20 km, ≈ 17 min) → Aeropuerto de Keflavík, entrega de la camper (≈ 46 km, ≈ 40 min). Todo estimado: las notas del autor no dan tiempos para este día.

Dos matices sobre estas estimaciones: las `notes` del propio camping dicen «a media hora de Reikiavik», y por la carretera 36 y la Ring Road el tramo real ronda los 25 km, así que 20 km / 17 min es el mínimo. Reikiavik → aeropuerto por la 41 son unos 50 km y 45 min. Si el autor lo recuerda así, puede subir `drive` a ≈ 75 km / 75 min. El tiempo de limpiar y entregar la camper no es conducción y no entra.

## travel_to_next_min

Ninguno: Reikiavik es la única parada de ruta (la última), y el tramo al aeropuerto va en `drive`, no en una parada.

## Nombres cortos

No hace falta ninguno: `reykjavik.name` es «Reikiavik» (corto y sin paréntesis) y `glymur` ya tiene `short_name`. La línea de ruta de la tarjeta será solo «Reikiavik».

## skip_reason

Ninguno nuevo: `glymur` ya lo tiene y encaja con el `our_take` del día (vuelo cerca, camper que entregar, sin prisas).

## Revisión editorial de lugares

- **glymur.description** — ahora: «Una de las cascadas más altas de Islandia, en el fondo del fiordo de Hvalfjörður.» Es un superlativo sin fuente. Propuesta: «Cascada del río Botnsá, con unos 198 metros de caída, en el fondo del fiordo de Hvalfjörður.» La cifra es objetiva y dice lo mismo; el acceso sigue en `notes`, que ya acaba con la frase de coordenadas pendientes.
- **reykjavik** y **camp_mosskogar**: `description` y `notes` cumplen la frontera (qué es / cómo se llega). Sin cambios.

## Avisos

1. **Correspondencia con las notas.** El día 13 de la guía reúne el DÍA 12 de las notas (Glymur, Þórufoss, Reikiavik, dormir en Mosskógar) y el DÍA 13 (Sky Lagoon, entregar camper e ir al vuelo). Cuadra: Þórufoss se hizo ya el día 1 y Mosskógar es el `overnight` del día 12. El día 13 no lleva `overnight`, correcto para el último día.
2. **Paradas de las notas que no están en el YAML** (solo se listan, no se añaden): Sky Lagoon (DÍA 13) y «Fosslaug geothermic pool», que aparece en la línea del DÍA 13 pero es un sitio del norte ya listado en el DÍA 10; parece un apunte suelto. Los puntos de Reikiavik de las notas (Laugavegur, Höfði, Viajero del Sol, Þúfa, Tjörnin) son rincones de la ciudad, no lugares aparte.
3. **¿Hubo parada en Reikiavik?** El `our_take` dice «nos levantamos más tarde para descansar y fuimos directos a entregar la camper», pero la parada `reykjavik` está como `visited` con 90 min. Si no hubo parada, el día se quedaría sin paradas de ruta y la línea de ruta de la tarjeta saldría vacía: conviene que el autor confirme qué pasó y cuánto duró. El arranque «Después de este día no hicimos nada más» también se lee raro en el último día; quizá quería decir «después del día 12».
4. **Duración sin confirmar.** El comentario «# duración estimada, pendiente de confirmar» sigue ahí: los 90 min de Reikiavik no están confirmados.
5. **glymur.notes** dice «hasta la base»; el sendero habitual de Glymur sube por el cañón hasta los miradores sobre la cascada, no hasta su base. Confirmar antes de publicar; no he tocado el texto.
6. **Nombre en inglés, opcional.** `camp_mosskogar.name` es «Mosskógar Camping» (igual que «Laugar Camping», «Hellissandur Camping», «Skaftafell Campground», «Systragil Camping Ground»), frente a los «Camping X» del resto. El `short_name` ya es «Camping Mosskógar», así que la tarjeta no cambia; unificar es cosa del autor.
