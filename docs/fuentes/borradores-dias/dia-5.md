# Día 5 — Trekking en el glaciar (borrador para el autor)

Correspondencia con las notas: "DIA 4" del plan antihorario (trekking por el glaciar, Svínafellsjökull, Svartifoss por el sendero S2). Punto de partida: Camping Svínafell (overnight del día 4). Fin: Camping Skaftafell (overnight del día 5 en el YAML).

## Tramos y conducción

| # | Tramo | Km | Min | De dónde sale |
|---|---|---|---|---|
| 1 | Camping Svínafell → base del trekking | ≈ 5 | ≈ 5 | Haversine 3,8 km × 1,25 = 4,8 km; a 70 km/h ≈ 4 min |
| 2 | Base del trekking → Camping Skaftafell (aparcamiento del S2) | ≈ 5 | ≈ 5 | Haversine 4,3 km × 1,25 = 5,4 km; a 70 km/h ≈ 5 min |
| 3 | Camping Skaftafell → Hundafoss | a pie | ≈ 20 | Sendero S2, en subida (estimado) |
| 4 | Hundafoss → Svartifoss | a pie | ≈ 10 | Sendero S2, 0,4 km en línea recta (estimado) |
| 5 | Svartifoss → Camping Skaftafell | a pie | ≈ 30 | Vuelta por el S2 (estimado; entra en los 90 min de la visita) |

**`drive` propuesto: `km: 10`, `minutes: 15`.**

- Km: 4,8 + 5,4 = 10,2 → 10 (redondeo a 5). Los tramos a pie no suman.
- Minutos: por tramos salen ≈ 10, pero las notas del autor dan 15 min para la misma carretera (Skaftafell ↔ Svínafell: "Dormir en Camping Svínafelli a 15m"; las notes del camping dicen 12 min). Como los dos tramos de coche cubren justo esa carretera, propongo 15 como cifra prudente. Ninguna cifra viene de un "(Xm)" de las notas para un tramo concreto: toda la conducción es estimada.
- Comentario YAML propuesto: `Camping Svínafell → base del trekking (≈ 5 km, ≈ 5 min) → Camping Skaftafell (≈ 5 km, ≈ 5 min); Hundafoss y Svartifoss se hacen a pie desde el camping por el sendero S2 (no suman km). Total ≈ 10 km; ≈ 10 min por tramos, 15 min según las notas del autor (Skaftafell ↔ Svínafell, 15 m) → 15. Estimación pendiente de confirmar por el autor.`

## `travel_to_next_min`

| Parada | Siguiente | Min | Modo |
|---|---|---|---|
| trekking_glaciar_svinafellsjokull | hundafoss | 25 | coche (≈ 5 min de coche hasta Skaftafell + ≈ 20 min de sendero) |
| hundafoss | svartifoss | 10 | a pie |
| svartifoss | — | — | última parada de ruta; la vuelta al camping (≈ 30 min a pie) queda dentro de los 90 min |

svinafellsjokull es `not_visited`: sin `travel_to_next`.

## Nombres cortos

- `trekking_glaciar_svinafellsjokull` → **"Trekking en el glaciar"**. Línea de ruta de la tarjeta: "Trekking en el glaciar → Hundafoss → Svartifoss" = 47 caracteres, cabe en 2 filas (límite 56 con 3 paradas). Si se prefiere más corto, "Trekking glaciar" (41 en total).
- `svinafellsjokull`: nombre de 16 caracteres sin paréntesis y no entra en la línea de ruta (no visitado). No necesita short_name.

## `skip_reason`

Nada que proponer: la única parada `not_visited` (svinafellsjokull) ya tiene el texto del autor.

## Revisión editorial de lugares

1. **trekking_glaciar_svinafellsjokull · description** — "el más extenso de Europa" es un superlativo sin fuente (según se mida por volumen o por superficie cambia el puesto). Propuesta: "Excursión guiada con crampones sobre la lengua glaciar de Svínafellsjökull, una de las salidas del casquete Vatnajökull, en el Parque Nacional de Vatnajökull."
2. **trekking_glaciar_svinafellsjokull · notes** — repetían la description y fijaban "5 horas" cuando el variant_note dice 6 h y `duration_min` es 360. Propuesta: "Se contrata con un operador; el punto de encuentro y la duración dependen de la excursión elegida (la del autor fue de unas 6 horas, con base cerca de Skaftafell). Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."
3. **svartifoss · notes** — la primera frase repetía la description; el acceso (desde dónde y por qué sendero) es lo que va en notes. Propuesta: "Se llega a pie desde el aparcamiento de Skaftafell por el sendero señalizado S2, en subida, pasando por Hundafoss. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."
4. **svinafellsjokull · notes** (opcional) — añade el acceso de las notas del autor ("5 m andando estacionamiento"): "Mirador a unos 5 minutos a pie del aparcamiento, sin necesidad de excursión guiada. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar."

hundafoss: description y notes correctas, sin cambios. Los dos campings: textos correctos.

## Avisos

- **overnight no cuadra con las notas**: el plan decía "Dormir en Camping Svínafelli a 15m" (repetir noche); el YAML pone `camp_skaftafell`. La lista de alojamientos de la guía registra Svínafell pagado el 2025-09-16 y Skaftafell el 2025-09-17, así que el YAML refleja lo que pasó. Se mantiene `camp_skaftafell`; confirmar.
- **Orden de paradas**: notas trekking → Svínafellsjökull → Svartifoss; YAML trekking → Hundafoss → Svartifoss → Svínafellsjökull (no visitado). Como el mirador se descartó, la ruta real no cambia.
- **Paradas**: Hundafoss está en el YAML y no en las notas (mismo sendero S2; se mantiene). Ninguna parada de las notas falta en el YAML.
- **Duración del trekking**: 5 h en el plan y en las notes del lugar, 6 h en el variant_note y en `duration_min` (360). Unificar tras confirmar.
- **Coordenadas de la base del trekking** aproximadas (junto al aparcamiento de Svínafellsjökull): si el operador recogía en el centro de visitantes de Skaftafell o en Svínafell, los tramos cambian (siempre por debajo de 15 km en total).
- **travel_to_next del trekking**: 25 min mezcla coche y sendero porque el modo admite un solo valor. Alternativa: 5 min "coche" y contar la subida dentro de la visita a Hundafoss/Svartifoss.
- **Nombre en inglés**: `camp_skaftafell` se llama "Skaftafell Campground"; convendría "Camping Skaftafell" (ya es su short_name). Afecta a "Dónde dormir", no solo a este día.
