# Día 12 — Snæfellsnes (borrador para el autor)

Correspondencia con las notas: "DIA 11" (Kirkjufell, Ólafsvík, Djúpalónssandur, Lóndrangar, Hellnar, Arnarstapi, Rauðfeldsgjá, Búðakirkja, Ytri Tunga, Raudhals, Landbrotalaug) más el principio del "DÍA 12" (Raudhals si no dio tiempo, dormir en Mosskógar). Salida: Camping Hellissandur (overnight del día 11). Fin: Camping Mosskógar.

## Tramos y conducción

| # | Tramo | Km | Min | De dónde sale |
|---|---|---|---|---|
| 1 | Camping Hellissandur → Kirkjufell | 34 | ≈ 29 | Estimado (las notas salían de Grundarfjörður) |
| 2 | Kirkjufell → Ólafsvík | 25 | 20 | Notas |
| 3 | Ólafsvík → Faro de Svörtuloft | 21 | ≈ 25 | Estimado, pista: × 1,4 y 50 km/h |
| 4 | Svörtuloft → Djúpalónssandur | 19 | ≈ 23 | Estimado, pista: × 1,4 y 50 km/h |
| 5 | Djúpalónssandur → Lóndrangar | 3 | 8 | Notas |
| 6 | Lóndrangar → Hellnar | 15 | ≈ 13 | Estimado (las notas dicen 6m, imposible para 15 km) |
| 7 | Hellnar → Arnarstapi | 3 | ≈ 3 | Estimado (las notas dicen 17m) |
| 8 | Arnarstapi → Rauðfeldsgjá | 3 | ≈ 3 | Estimado (las notas dicen 25m) |
| 9 | Rauðfeldsgjá → Búðakirkja | 14 | 15 | Notas |
| 10 | Búðakirkja → Ytri Tunga | 6 | ≈ 5 | Estimado (en las notas, Bjarnarfoss en medio) |
| 11 | Ytri Tunga → Landbrotalaug | 28 | ≈ 24 | Estimado |
| 12 | Landbrotalaug → Raudhals | 36 | ≈ 31 | Estimado |
| 13 | Raudhals → Camping Mosskógar | 99 | ≈ 85 | Estimado |
| | **Total** | **≈ 305** | **284 → 285** | |

Km: haversine entre coordenadas × 1,25 (× 1,4 en los dos tramos de Svörtuloft). **`drive` propuesto: `km: 305`, `minutes: 285`.**

## `travel_to_next_min`

Kirkjufell 20 · Ólafsvík 25 · Svörtuloft 23 · Djúpalónssandur 8 · Londrangar 13 · Hellnar 3 · Arnarstapi 3 · Rauðfeldsgjá 15 · Búðakirkja 5 · Ytri Tunga 24 · Landbrotalaug 31 (todos en coche). Raudhals es la última.

## Nombres cortos

Kirkjufell, Svörtuloft, Djúpalónssandur, Hellnar, Rauðfeldsgjá, Ytri Tunga, Landbrotalaug, Raudhals. Ólafsvík, Londrangar, Arnarstapi y Búðakirkja ya son escuetos. Aun así, la línea de 12 paradas son 156 caracteres: no cabe en 4 filas. Ver avisos.

## `skip_reason`

No hay paradas `not_visited` en este día.

## Revisión editorial de lugares

1. **kirkjufell · description y notes**: "una de las más fotografiadas" / "la más fotografiada de Islandia", superlativos sin fuente. Description sin el superlativo; notes con el acceso (carretera 54, a la salida de Grundarfjörður).
2. **olafsvik, djupalonssandur, londrangar, hellnar, budakirkja · notes**: repetían la description. Se sustituyen por el acceso (parkings gratis de vuestras notas, sendero a Dritvík, sendero costero Arnarstapi–Hellnar).
3. **raudfeldsgja · notes**: copiaban vuestra experiencia ("muy fotogénica", "no se puede ascender"), que ya está en el variant_note. Se deja el acceso y el calzado.
4. **raudhals · description**: decía "en el sur de Islandia"; vuestras coordenadas lo sitúan en el oeste, junto a Snæfellsnes.
5. Todas las notes de lugares no confirmados terminan ahora con la frase canónica.

## Avisos

- **Noche del día 11 en Hellissandur**: las notas dormían en Grundarfjörður. Desde Hellissandur el día empieza yendo ≈ 34 km al este hasta Kirkjufell y volviendo. ¿Fue ese el orden real?
- **Tiempos de las notas desplazados** entre Lóndrangar y Rauðfeldsgjá (6m para 15 km; 17m y 25m para 3 km): parecen tiempos de visita o estar una línea movidos. Se ha estimado.
- **Paradas de las notas que no están en la guía**: Ingjalshóll Church, el barco Sæljós GK-2, el food truck FRISTA (Arnarstapi) y Bjarnarfoss ??. **Svörtuloft** está en la guía y no en las notas.
- **Raudhals**: 20 min en el YAML y "(2h 15)" en las notas. Confirmar la duración.
- **Último tramo**: Raudhals → Mosskógar ≈ 99 km / 85 min por la regla; por carretera serán más (túnel de Hvalfjörður, de peaje).
- **Grafías**: "Londrangar" → "Lóndrangar"; "Raudhals" → "Rauðháls". Se dejan; decide tú.
- **Nombres de campings**: "Hellissandur Camping" y "Mosskógar Camping" pasan a "Camping Hellissandur" y "Camping Mosskógar".
- **Línea de ruta**: con 12 paradas no cabe en 4 filas con ningún nombre corto real.
