# Día 6 — Jökulsárlón, Diamond Beach y Vestrahorn (borrador para el autor)

Correspondencia con las notas: "DIA 5" del plan antihorario (Múlagljúfur, Fjallsárlón, Jökulsárlón y Diamond Beach, Vestrahorn, renos, Silla Roja, Lækjavík, Djúpavogskörin). Salida: Camping Skaftafell (overnight del día 5). Fin: noche fuera de camping (`overnight: null`), en el mirador de Rauðafell: sin tramo final.

## Tramos y conducción

| # | Tramo | Km | Min | De dónde sale |
|---|---|---|---|---|
| 1 | Camping Skaftafell → Múlagljúfur | 37 | ≈ 40 | Haversine 29,3 × 1,25. Minutos: 35 de las notas (medidos desde Svínafell) + ≈ 5 por salir de Skaftafell |
| 2 | Múlagljúfur → Fjallsárlón | 7 | 12 | Haversine 5,4 × 1,25; minutos de las notas |
| 3 | Fjallsárlón → Jökulsárlón y Diamond Beach | 13 | 12 | Haversine 10,2 × 1,25; minutos de las notas |
| 4 | Jökulsárlón → Vestrahorn | 78 | 72 | Haversine 62,0 × 1,25; minutos de las notas (1h 12m) |
| 5 | Vestrahorn → Eystrahorn | 12 | ≈ 10 | Haversine 9,6 × 1,25; a 70 km/h |
| 6 | Eystrahorn → mirador de Rauðafell (pasando por la zona de renos, Lækjavík y Djúpavogskörin, no visitados) | 74 | ≈ 64 | Haversine 59,5 × 1,25; a 70 km/h |
| | **Total** | **≈ 221 → 220** | **210** | |

**`drive` propuesto: `km: 220`, `minutes: 210`.** Las notas daban 240 km y 3 h 35 min, pero de Svínafell a Djúpivogur.

## `travel_to_next_min`

Múlagljúfur 12 · Fjallsárlón 12 · Jökulsárlón 72 · Vestrahorn 10 · Eystrahorn 64 (todos en coche). Rauðafell es la última parada.

## Nombres cortos

Múlagljúfur, Fjallsárlón, Jökulsárlón, Vestrahorn, Eystrahorn, Rauðafell. Línea de ruta: 77 caracteres, 3 filas en 350 px (tocan 2 a 6 paradas). Son los nombres propios escuetos: no hay forma más corta.

## `skip_reason`

- **Þjóðvegur (zona de renos):** "Pasamos por el tramo donde suele haber renos, pero no vimos ninguno. No es una parada en sí: es un tramo de carretera con posibilidad de avistamiento." (sale de vuestro `our_take`).
- **Lækjavík:** "Estaba en el plan como opción dudosa, solo si íbamos bien de tiempo, y quedó fuera." (notas: "??", "si vamos bien de tiempo").
- **Djúpavogskörin:** "Estaba en el plan con la duda de si la poza estaría abierta, y quedó fuera." (notas: "comprobar si está abierto").

## Revisión editorial de lugares

1. **mulagljufur · notes**: repetían la description. → acceso: 45 min de ida y 45 de vuelta hasta los miradores (de vuestro variant_note).
2. **fjallsarlon · notes**: repetían la description. → "A unos 12 minutos en coche de Jökulsárlón por la Ring Road."
3. **vestrahorn · notes**: "uno de los paisajes más fotografiados de Islandia" es un superlativo sin fuente. → se entra por el Viking Café, donde se paga.
4. **eystrahorn · notes**: repetían la description. → parada rápida con parking gratis.
5. **thjodvegur_renos**: sin description; se separa qué es (description) de lo práctico (notes).
6. **laekjavik**: sin description; "playa negra con una roca" sale de vuestras notas.
7. **djupavogskorin**: el registro decía "formaciones rocosas"; vuestras notas hablan de una poza termal. Propuesta: "Poza de agua termal junto al mar, cerca de Djúpivogur." **Confirmar.**

## Avisos

- **Silla Roja / Eystrahorn**: el lugar mezcla la montaña Eystrahorn y la "Red Chair"; las coordenadas de la Silla Roja de vuestras notas (64.3417, -14.9282) quedan a ≈ 10 km de las del registro. La zona de renos también (≈ 7 km). Confirmar parada y coordenadas.
- **Orden**: las notas van Vestrahorn → renos (20m) → Silla Roja (28m); el YAML pone Eystrahorn antes de los renos, que es el orden geográfico con cualquiera de las coordenadas. Por eso esos tiempos de las notas no se usan.
- **Último tramo corto**: la Ring Road rodea Álftafjörður y Hamarsfjörður; por carretera serán bastantes más de 74 km.
- **Duración de Múlagljúfur**: 110 min en el YAML, 45 + 45 de caminata en vuestro texto, "(2h 30m)" en las notas.
- **Noche**: fuera de camping, en Rauðafell. Las notas decían Djúpivogur o Fossardalur. `overnight_note` vacío: es vuestro.
- **Nombre en inglés**: "Rauðafell mountain view point" → "Mirador de Rauðafell".
