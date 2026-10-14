# Día 8 — Cañones y cascadas del este (borrador de tramos y revisión)

Correspondencia con las notas: "DIA 7" del plan anti-horario (Hengifoss ??, Rjúkandifoss, Studlagil east side, Dettifoss y Selfoss, Grjótagjá; "Dormir en Camping Myvatn"; "Ruta 320km 4h 40min").

## Punto de partida y fin

- **Inicio:** la noche del día 7 fue fuera de camping (`overnight: null`), así que el día empieza en la primera parada de ruta, **Rjúkandifoss**, sin tramo inicial.
- **Fin:** **Camping Laugar** (`camp_laugar`, overnight del día 8 en el YAML). Ver aviso: las notas ponían Camping Mývatn para esta noche.

## Tramos

| # | Tramo | km | min | Origen del tiempo |
|---|---|---|---|---|
| 1 | Rjúkandifoss → Stuðlagil (lado este) | 41 | 26 | notas "(26m)" |
| 2 | Stuðlagil → Dettifoss y Selfoss (lado oeste) | 95 | 110 | notas "(1h 50m)" |
| 3 | Dettifoss → Grjótagjá | 43 | ≈ 37 | estimado (43 km / 70 km/h); las notas dicen "(10m)", imposible |
| 4 | Grjótagjá → Camping Laugar | 30 | ≈ 26 | estimado (30 km / 70 km/h); las notas daban 11 min a Camping Mývatn, otro camping |
| | **Total** | **209 → 210** | **199 → 200** | |

Cómo salen los km: haversine entre las coordenadas del YAML de lugares × factor de carretera. Tramos 1, 2 y 3 con × 1,4 (desvío por la 923 hasta el aparcamiento este de Stuðlagil, en parte de grava, y desvío de ida y vuelta por la 862 hasta Dettifoss); tramo 4 con × 1,25.

- Tramo 1: 29,2 km en línea recta × 1,4 = 40,9.
- Tramo 2: 68,0 × 1,4 = 95,2.
- Tramo 3: 30,4 × 1,4 = 42,6.
- Tramo 4: 24,1 × 1,25 = 30,1.

`drive`: `km: 210`, `minutes: 200`.

Comentario propuesto para el YAML:

> Rjúkandifoss (sin tramo inicial: la noche del día 7 fue fuera de camping) → Stuðlagil, lado este (41 km, 26 min) → Dettifoss y Selfoss, lado oeste (95, 110 min) → Grjótagjá (43, ≈ 37 min) → Camping Laugar (30, ≈ 26 min). Total ≈ 209 km → 210; 199 min → 200. Tiempos de las notas del autor salvo los marcados ≈. Estimación pendiente de confirmar por el autor.

## travel_to_next

| Parada | travel_to_next_min | modo |
|---|---|---|
| rjukandifoss | 26 | coche |
| studlagil | 110 | coche |
| dettifoss_selfoss | 37 | coche |

Grjótagjá es la última parada de ruta y, según el brief, no lo lleva. El día 4 sí lo pone en la última parada (hacia el camping); si se prefiere ese modelo, Grjótagjá llevaría 26. Hengifoss (not_visited, al final del bloque) no lleva nada.

## Nombres cortos propuestos

| place_id | name actual | short_name |
|---|---|---|
| studlagil | Cañón de Stuðlagil (lado este) | Stuðlagil |
| dettifoss_selfoss | Dettifoss (lado oeste) y Selfoss | Dettifoss |

Línea de ruta resultante (solo paradas visitadas): "Rjúkandifoss → Stuðlagil → Dettifoss → Grjótagjá", 48 caracteres, cabe en 2 filas (límite ≈ 56). Con "Dettifoss y Selfoss" serían 58 y se pasaría. Rjúkandifoss, Grjótagjá y Hengifoss no necesitan nombre corto.

## skip_reason propuesto

- **hengifoss:** "Estaba en el plan como opción dudosa, con una caminata de unas dos horas y media, y al final quedó fuera."

## Revisión editorial de description / notes

1. **dettifoss_selfoss · description** — "una de las cascadas más potentes de Europa" es un superlativo sin fuente, y "Accesibles juntas desde el lado oeste" es acceso (ya está en notes). Propuesta:
   > Dos cascadas del río Jökulsá á Fjöllum, en el Parque Nacional de Vatnajökull: Dettifoss, de unos 100 m de ancho y 44 m de caída, y Selfoss, río arriba, más baja y ancha.
2. **grjotagja · description** (cambio menor) — la prohibición de bañarse es una norma y ya está en notes; en description se deja la historia:
   > Cueva de lava con una poza de agua termal en su interior, cerca del lago Mývatn. Fue un lugar de baño hasta que las erupciones de Krafla (1975-1984) elevaron la temperatura del agua.
3. **hengifoss · description** — el lugar no tiene description; hoy lo descriptivo está en notes con un superlativo sin fuente ("una de las cascadas más altas de Islandia"). Propuesta:
   > Cascada de 128 m de caída en el río Hengifossá, sobre el lago Lagarfljót. Su pared muestra capas de basalto separadas por franjas de arcilla roja.
4. **hengifoss · notes** — se deja solo acceso y logística:
   > Caminata de ida y vuelta de unas 2-3 horas desde el aparcamiento, con subida continua; a mitad de camino se pasa junto a Litlanesfoss, con columnas de basalto. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar.

rjukandifoss y studlagil cumplen la frontera; no se propone cambio. Camping Laugar, correcto.

## Avisos

1. **Orden de paradas.** En las notas Hengifoss es la primera parada del día (desde Egilsstaðir); en el YAML va en `order: 5`, después de Grjótagjá, en el otro extremo del día. Como está `not_visited` no afecta a los tramos, pero para seguir el criterio del día 4 (las no visitadas se quedan en su posición de ruta) debería ir en `order: 1`.
2. **Tramo Dettifoss → Grjótagjá.** Las notas ponen "(10m)", que no cuadra con el tramo real (vuelta por la 862 a la Ring Road y después hacia Mývatn, unos 45-55 km). Se ha usado una estimación de 37 min.
3. **Overnight.** Las notas dicen "Dormir en Camping Myvatn a 11m" para este día y "Laugar Camping o CJA camping" para el siguiente; el YAML pone `camp_laugar` en el día 8 y `camp_systragil` en el 9. Parece que el viaje real adelantó una noche: confirmar. Además, `camp_laugar` lleva `verified_at: 2025-09-15`, anterior a la fecha de este día (la comida del día lleva 2025-09-18).
4. **Coordenadas de studlagil** (65.3064, -15.5597) sospechosas: el cañón está en el río Jökla al sur de la Ring Road, aproximadamente 65.17 N, -15.31 O (aparcamiento del lado este, Klaustursel). Con esas coordenadas el tramo a Dettifoss saldría de unos 120 km en vez de 95 y el día de unos 235 km. Las notes ya las marcan como pendientes.
5. **Coordenadas de hengifoss** (65.1028, -14.6167) también parecen desplazadas (el aparcamiento está sobre 65.07 N, -14.88 O). Solo afecta a una parada not_visited.
6. **Total de las notas** ("Ruta 320km 4h 40min") incluye Hengifoss y la salida desde el camping de Egilsstaðir, que no están en la ruta real; por eso nuestros 210 km / 200 min son bastante menores.
7. **Nombres en inglés:** ninguno en los lugares del día. En las notas Grjótagjá figura como "Cueva del Señor de los Anillos"; la `variant_note` del autor ya lo corrige a Juego de Tronos.
8. **Paradas de las notas que no están en el YAML:** ninguna.
