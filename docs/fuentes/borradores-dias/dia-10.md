# Día 10 — Goðafoss, Akureyri y la costa de Tröllaskagi

Punto de partida: **Camping Systragil** (overnight del día 9). Fin: **Camping Lambeyri** (overnight del día 10 en el YAML; ver avisos). Las notas del autor de este día (DÍA 9 de la "Opción 2") arrancan en Laugar/CJA camping y terminan en Hólar u Hofsós, así que el primer y el último tramo no tienen tiempo en las notas y van estimados.

## Tramos y conducción

| Tramo | km | min | Origen de la cifra |
|---|---:|---:|---|
| Camping Systragil → Goðafoss | ≈ 20 | ≈ 17 | estimado (haversine 16,1 km × 1,25; a 70 km/h) |
| Goðafoss → Akureyri | ≈ 31 | ≈ 26 | estimado (24,6 × 1,25; a 70 km/h). En las notas los 30 + 15 + 13 min pasan por Jarðgangalaug y Christmas House, que no son paradas del día |
| Akureyri → Hauganes | 35 | 30 | notas "(30m)"; km estimados (27,6 × 1,25) |
| Hauganes → Mígandifoss | 24 | 22 | notas "(22m)"; km estimados (18,9 × 1,25) |
| Mígandifoss → Siglufjörður | 21 | 26 | notas "(26m)"; km estimados (17,0 × 1,25) |
| Siglufjörður → Hofsós (paso, no es parada) | 46 | 55 | notas "(55m)"; km estimados (36,4 × 1,25, con Hofsós en 65.8936, -19.4106 de referencia) |
| Hofsós → Camping Lambeyri | ≈ 60 | ≈ 51 | estimado (47,8 × 1,25; a 70 km/h) |
| **Total** | **235** | **225** | 235,4 km → 235; 227 min → 225 |

Sin tramos de grava ni desvíos evidentes: factor 1,25 en todos. Para comparar: las notas estimaban "Ruta 216 km 3h 25m" para un día que terminaba en Hólar/Hofsós con dos desvíos más (Jarðgangalaug y Christmas House); el nuestro sigue ≈ 50 km más hasta Lambeyri.

Comentario propuesto para el YAML (una línea):

> Camping Systragil → Goðafoss (≈ 20 km, ≈ 17 min) → Akureyri (≈ 31, ≈ 26 min) → Hauganes (35, 30 min) → Mígandifoss (24, 22 min) → Siglufjörður (21, 26 min) → Camping Lambeyri, pasando por Hofsós (105, 55 + ≈ 51 min). Total ≈ 235 km; 227 min → 225. Minutes from the author's notes except those marked ≈ (estimates: the notes start at Laugar and end at Hólar/Hofsós). Estimación pendiente de confirmar por el autor.

`drive: { km: 235, minutes: 225 }`

## travel_to_next_min (todas en coche)

| Parada | travel_to_next_min |
|---|---:|
| godafoss | 26 |
| akureyri | 30 |
| hauganes | 22 |
| migandifoss | 26 |
| siglufjordur | — (última parada) |

## Nombres cortos propuestos

- `hauganes`: **"Hauganes"** (name: "Avistamiento de ballenas en Hauganes").
- `akureyri` y `siglufjordur` no lo necesitan: el name ya es escueto.

Línea de ruta resultante: "Goðafoss → Akureyri → Hauganes → Mígandifoss → Siglufjörður" = 59 caracteres, 3 por encima de los ~56 de dos filas a 350 px. Son nombres propios sin margen de recorte; conviene comprobarlo en la tarjeta real.

## skip_reason

Ninguna: las cinco paradas del día 10 son `visited`.

## Revisión editorial (description / notes)

- **migandifoss / description**: la actual dice "Cascada en la zona de Héðinsfjörður, en la ruta por los túneles de montaña hacia Siglufjörður". Mezcla acceso con qué es el lugar, y "Héðinsfjörður" no cuadra con las coordenadas del fichero (66.0333, -18.6667, entre Dalvík y Ólafsfjörður) ni con los tiempos de las notas (22 min desde Hauganes, 26 hasta Siglufjörður). Propuesta: "Cascada que cae por un acantilado hacia el mar en la costa oeste del fiordo de Eyjafjörður, entre Dalvík y Ólafsfjörður, en la península de Tröllaskagi." **El autor debe confirmar la ubicación.**
- **migandifoss / notes**: "Junto a la carretera 82 (Ólafsfjarðarvegur), de camino a los túneles hacia Ólafsfjörður y Siglufjörður. Se ve bien desde un terraplén junto a la carretera, sin necesidad de bajar; si apetece, se puede bajar para verla más de cerca. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."
- **siglufjordur / description**: quitar el acceso ("accesible por túneles excavados en la montaña"). Propuesta: "Pueblo pesquero en el extremo norte de la península de Tröllaskagi, antiguo centro de la industria del arenque en Islandia."
- **siglufjordur / notes**: "Se llega por los túneles de montaña desde Ólafsfjörður o por la carretera 76 desde Skagafjörður. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."
- `godafoss`, `akureyri`, `hauganes`, `camp_systragil` y `camp_lambeyri`: sin cambios. Goðafoss y Akureyri cierran las notes con "Coordenadas y datos de referencia general, pendientes de confirmar…" en vez de la fórmula exacta; es solo estilo, no se propone cambio.

## Avisos

1. **overnight no cuadra con las notas.** El YAML duerme en `camp_lambeyri` (Laugarhvammur, cerca de Varmahlíð); las notas dicen "Dormir en Holar Campground (40m) o Hofsós Camping Ground". Lambeyri queda ≈ 50 km / ≈ 50 min más allá de Hofsós, y el día 11 vuelve al norte hasta Grafarkirkja (junto a Hofsós). Confirmar dónde se durmió: afecta al último tramo del día 10 y al primero del día 11.
2. **Paradas de las notas que no están en el YAML** (solo se listan): "Christmas House ?? (Pueblo Santa Claus)" entre Goðafoss y Akureyri, y "Hofsós Sundlaug" (baño en la piscina) después de Siglufjörður. Jarðgangalaug (?? en las notas) sí está en el YAML, pero en el día 9, visitada de camino al camping la noche anterior, como dice su variant_note.
3. **Orden de paradas**: coincide con las notas.
4. **Goðafoss → Akureyri** va estimado directo (≈ 26 min); por la Ring Road real será algo más.
5. **Siglufjörður → Lambeyri**: 55 min de las notas hasta Hofsós más ≈ 51 estimados; la carretera 76 bordea la costa y la cifra real puede ser algo mayor. Las coordenadas de Hofsós usadas como paso no están en `content/places`.
6. **Línea de ruta** de 59 caracteres (límite orientativo 56 para 5 paradas).
7. **Mígandifoss**: description y coordenadas se contradicen (ver revisión editorial).
8. **Nombre en inglés**: `camp_systragil` se llama "Systragil Camping Ground" (el short_name ya es "Camping Systragil"); convendría que name fuese también "Camping Systragil", como el resto de campings.
