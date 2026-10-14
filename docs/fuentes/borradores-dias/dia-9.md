# Día 9 — Mývatn y Krafla (borrador de tramos y textos)

Punto de partida: **Camping Laugar** (overnight del día 8). Fin: **Camping Systragil** (overnight del día 9).
Paradas de ruta (no `not_visited`), en su orden: Krafla (cráter Víti) → Hverir / Námafjall → Hverfjall → Dimmuborgir → Mirador del lago Mývatn → Jarðgangalaug.

## Tramos

| # | De → a | km | min | Fuente |
|---|---|---|---|---|
| 1 | Camping Laugar → Krafla (cráter Víti) | ≈ 38 | ≈ 33 | estimado (27,2 km en línea recta × 1,4 por el rodeo del lago y el desvío por la 863; 70 km/h) |
| 2 | Krafla → Hverir / Námafjall | 11 | 12 | notas "(12m)" |
| 3 | Hverir → Hverfjall | 6 | 20 | notas "(20m)" |
| 4 | Hverfjall → Dimmuborgir | 4 | 10 | notas "(10m)" |
| 5 | Dimmuborgir → Mirador del lago Mývatn | 6 | 8 | notas "(8m)" |
| 6a | Mirador → Goðafoss (de paso, sin parar) | ≈ 34 | ≈ 29 | estimado (26,8 km × 1,25; 70 km/h) |
| 6b | Goðafoss → Jarðgangalaug | 29 | 30 | notas DIA 9 "(30m)", medido desde Goðafoss |
| 7 | Jarðgangalaug → Camping Systragil | ≈ 11 | ≈ 9 | estimado (7,6 km × 1,4 por el túnel de Vaðlaheiði; 70 km/h) |
| | **Total** | **138 → 140** | **151 → 150** | |

`drive: { km: 140, minutes: 150 }`. Las distancias de los tramos con tiempo de las notas son haversine × 1,25; el total se redondea a 5 km y 5 min.

Comentario propuesto para el YAML:

> Camping Laugar → Krafla, cráter Víti (≈ 38 km, ≈ 33 min) → Hverir / Námafjall (11, 12 min) → Hverfjall (6, 20 min) → Dimmuborgir (4, 10 min) → Mirador del lago Mývatn (6, 8 min) → Jarðgangalaug, pasando por Goðafoss (63, ≈ 29 + 30 min) → Camping Systragil (≈ 11, ≈ 9 min). Total ≈ 138 km → 140; 151 min → 150. Tiempos de las notas del autor salvo los marcados ≈. Estimación pendiente de confirmar por el autor.

## travel_to_next_min (todos `travel_to_next_mode: "coche"`)

| Parada | min |
|---|---|
| krafla_viti | 12 |
| hverir_namafjall | 20 |
| hverfjall | 10 |
| dimmuborgir | 8 |
| myvatn_viewpoint | 59 (≈ 29 hasta Goðafoss + 30 de las notas) |
| jardgangalaug | última parada, sin valor |

## Nombres cortos propuestos

| place_id | name | short_name |
|---|---|---|
| krafla_viti | Krafla (cráter Víti) | Krafla (o "Víti", 2 caracteres menos) |
| hverir_namafjall | Hverir / Námafjall | Hverir |
| myvatn_viewpoint | Mirador panorámico del lago Mývatn | Mývatn |
| skutustadagigar | Pseudocráteres de Skútustaðagígar | Skútustaðagígar |
| jardgangalaug | Jarðgangalaug (poza termal) | Jarðgangalaug |

Hverfjall, Dimmuborgir y Leirhnjúkur se quedan con su `name`. Línea de ruta resultante: "Krafla → Hverir → Hverfjall → Dimmuborgir → Mývatn → Jarðgangalaug" = 66 caracteres, 3 filas a 350 px. El objetivo para 6 paradas son 2 filas (≈ 56) y no se alcanza: los nombres islandeses no se pueden recortar más.

## skip_reason

- **leirhnjukur**: "Estaba en el plan como primera parada, justo antes del cráter Víti, con un recorrido completo de unos 45 minutos; quedó fuera porque ese día en Krafla no se podía aguantar fuera del coche." (Se apoya en el variant_note de Víti. Versión neutra si se prefiere: "Estaba en el plan como primera parada, justo antes del cráter Víti, pero quedó fuera.")
- **skutustadagigar**: "Estaba en el plan como opción dudosa, al final del recorrido por el lago, y quedó fuera." (Marcado "??" en las notas.)

## Revisión de textos de lugares

- **hverir_namafjall · notes**: las notes actuales incluyen una instrucción interna ("Lugar agrupado (un solo place_id…): al confirmar coordenadas, deben ser las del parking…") que vería el lector. Pasarla a un comentario YAML y dejar: "Área geotérmica con fumarolas y pozas de barro hirviendo, junto a la montaña Námafjall. Desde el aparcamiento de Hverir sale una ruta circular de unos 3 km que sube a Námafjall, con vistas a las fumarolas y a la caldera de Krafla. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."
- **leirhnjukur · description** (no tiene): "Campo de lava y zona geotérmica al pie del volcán Krafla, con fumarolas, pozas de barro hirviendo y coladas de las erupciones de 1975-1984, los llamados fuegos de Krafla."
- **leirhnjukur · notes**: "Recorrido circular completo de unos 45 minutos desde el aparcamiento, a un par de minutos en coche del cráter Víti. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." (45 min y 2 min salen de las notas.)
- **skutustadagigar · description** (no tiene): "Grupo de pseudocráteres en la orilla sur del lago Mývatn, formados por explosiones de vapor cuando una colada de lava cubrió terreno encharcado. No son volcanes: no tienen conducto propio de magma." Las notes se quedan como están.
- **jardgangalaug · description**: quitar "natural" (no está en las notas y el nombre, jarðgöng = túnel, apunta a que el agua caliente sale del túnel de Vaðlaheiði; confirmar) y mover la frase de la temperatura a notes: "Poza termal junto al fiordo Eyjafjörður, frente a Akureyri, en el curso de un arroyo de agua caliente que cae en una cascada de unos 15 metros hacia el mar."
- **jardgangalaug · notes**: las coordenadas no llevan comentario de confirmación, así que falta la frase final: "Aparcamiento muy limitado, en un apartadero de la carretera para pocos coches. El agua está más caliente río arriba, cerca de donde brota, y más templada junto a la cascada. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."

Krafla (cráter Víti), Hverfjall, Dimmuborgir y el mirador de Mývatn: sin cambios.

## Avisos

1. **Punto de partida**: el overnight del día 8 es camp_laugar, pero las notas (DIA 7) decían dormir en el camping de Mývatn. Con Laugar el día empieza desandando ≈ 38 km hacia Krafla; con Mývatn serían ≈ 12 km. Confirmar la noche 8: cambia el día 9 en unos 25 km y 20 min.
2. **Overnight**: las notas (DIA 8) decían "Laugar Camping o CJA camping a 20m"; el YAML pone camp_systragil y el variant_note de Jarðgangalaug lo confirma. Se respeta el YAML.
3. **Orden**: Leirhnjúkur está en order 6 (not_visited), pero en las notas era la primera parada, a 2 min de Víti. Convendría moverlo a order 1, como hacen las paradas no visitadas del día 4, que conservan su sitio geográfico.
4. **Jarðgangalaug** sale en las notas en el DIA 9 (día 10 de la guía) con "??"; en la guía está en el día 9, al final, y cuadra con su variant_note. Su "(30m)" se mide desde Goðafoss, por eso el tramo se parte en dos.
5. **Túnel de Vaðlaheiði** (de peaje): el tramo a Jarðgangalaug y la vuelta a Systragil lo cruzan a la ida y a la vuelta, salvo que se pasara por Víkurskarð. Confirmar: afecta a km y a lo que se pagó.
6. **Línea de ruta**: 66 caracteres, 3 filas, por encima del objetivo de 2 filas para 6 paradas (ver arriba).
7. **Paradas de las notas que faltan en el YAML**: ninguna; las 7 del DIA 8 están. Goðafoss (DIA 9) está en el día 10.
8. **Nombres en inglés**: "Laugar Camping" y "Systragil Camping Ground" (sus short_name ya están en español). Nada más en las paradas del día.
