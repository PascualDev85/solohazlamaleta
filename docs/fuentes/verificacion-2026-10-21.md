# Verificación de datos caducados — Islandia en camper (2026-10-21)

Guía: `content/guides/islandia/islandia-en-camper-13-dias.yaml` · Lugares: `content/places/islandia.yaml`
Origen de la lista: `npm run content:validate` en `develop` (b288e69) el 2026-10-21 → **87 lugares** con
`verified_at` o `entry.price` caducados (más de 12 meses, `engine/compile/place.ts`) y **10 campings** con el
precio verificado hace más de 12 meses (`engine/validate/quality-rules.ts`). En total, 97 lugares.

> **Estado: no se ha podido verificar ningún dato.** Esta sesión corre en un entorno en la nube cuya
> política de red bloquea las webs oficiales: `thingvellir.is`, `vatnajokulsthjodgardur.is`,
> `island.is` y `parka.is` devuelven *403 / connect_rejected* desde el proxy, y la herramienta de
> lectura web no resuelve ningún dominio. Solo funciona el buscador, que devuelve resúmenes de copias
> indexadas (a veces de hace años) y, sobre todo, de agregadores y blogs. Ni lo uno ni lo otro vale
> como fuente de un precio, así que **ningún valor de este documento está estimado ni copiado de un
> agregador**: todo queda como «no encontrado» y el documento sirve de lista de comprobación.
>
> Para que la próxima ejecución pueda hacerlo sola: añadir esos dominios (y las webs de los campings)
> en *Allowed domains* de la configuración de red del entorno
> (<https://code.claude.com/docs/en/cloud-environments#network-access>).

## Resumen

| Prioridad | Datos | Igual | Cambiado | No encontrado |
|---|---:|---:|---:|---:|
| 1 · Precio de los 10 campings | 10 | 0 | 0 | 10 |
| 2 · Entradas y aparcamientos de pago | 20 | 0 | 0 | 20 |
| 3 · Tasas de carretera o vehículo | 0 | — | — | — |
| 4 · Horarios | 1 | 0 | 0 | 1 |
| 5 · Resto de lugares caducados | 67 | 0 | 0 | 67 |
| **Total** | **98** | **0** | **0** | **98** |

Los 98 datos corresponden a 97 lugares: Vestrahorn cuenta en la prioridad 2 (entrada) y en la 4 (horario).
Quedan **98 datos por verificar**; las prioridades 1 y 2 están preparadas con su fuente oficial donde
se ha podido localizar.

### Cómo confirmarlo en pocos minutos

1. Abre la URL de cada fila (o la web del camping) y compara con la columna «Valor en la guía».
2. Si coincide → en el YAML, cambia solo las fechas (`verified_at` del lugar y, si lo tiene, `entry.verified_at`).
3. Si ha cambiado → cambia el valor y las fechas. Recuerda que la nota de los campings dice «Precio de
   2025»; si actualizas el precio, actualiza también ese año.
4. `npm run content:validate` debe dejar de avisar de ese lugar.

O pide en una sesión «aplica la verificación de Islandia con estos valores: …» y se hace el cambio.

---

## Prioridad 1 · Precio de los campings

Todos guardan `entry.price` por noche **para 2 personas y camper sin electricidad**, en ISK. La guía
también tiene `price_paid` por noche en `accommodation` (lo que se pagó en 2025): eso es histórico, no caduca
y no se toca.

| Lugar | Día | Valor en la guía | `verified_at` | Valor hoy | Fuente · fecha de consulta | Veredicto |
|---|---|---|---|---|---|---|
| `camp_thingvellir` — Camping Þingvellir | 1 (noche) | `entry.price: 4400` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | <https://www.thingvellir.is/en/service/camping/> (bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_arnes` — Camping Árnes | 2 (noche) | `entry.price: 4400` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_skogafoss` — Camping Skógafoss | 3 (noche) | `entry.price: 4000` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_svinafell` — Camping Svínafell (Skaftafell) | 4 (noche) | `entry.price: 5000` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_skaftafell` — Camping Skaftafell | 5 (noche) | `entry.price: 5500` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | <https://www.vatnajokulsthjodgardur.is/en/areas/skaftafell/tjaldsvaedid-i-skaftafelli> (bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_laugar` — Camping Laugar | 8 (noche) | `entry.price: 4800` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_systragil` — Camping Systragil | 9 (noche) | `entry.price: 4200` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_lambeyri` — Camping Lambeyri | 10 (noche) | `entry.price: 5500` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_hellissandur` — Camping Hellissandur | 11 (noche) | `entry.price: 4000` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `camp_mosskogar` — Camping Mosskógar | 12 (noche) | `entry.price: 5000` ISK (Precio de 2025 por noche para 2 personas y camper sin electricidad.) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |

**Pistas para el autor (no son verificación):**

- **Þingvellir.** El buscador muestra una copia indexada de <https://www.thingvellir.is/en/service/camping/>
  que el propio buscador fecha en unos 17 meses (≈ mayo de 2025): 1.800 ISK por adulto (18-66) y noche
  + 400 ISK de tasa de alojamiento por unidad. Con esa tarifa, 2 adultos + camper serían 4.000 ISK, no
  los 4.400 de la guía; puede que la copia sea anterior a la tarifa de 2025. Hay que mirarlo en la web.
- **Skaftafell.** La tarifa del parque está en <https://www.vatnajokulsthjodgardur.is/en/communities--businesses/pricelist>.
  La copia indexada que ve el buscador tiene unos 1.300 días (≈ 2023), así que su cifra no sirve.
- **Árnes, Skógafoss, Svínafell y Laugar.** Se buscó su web propia y solo aparecen agregadores, cuyas
  cifras no se recogen aquí. **Systragil, Lambeyri, Hellissandur y Mosskógar** no se llegaron a buscar.
  Si el autor conoce la web o el teléfono de cada camping, conviene guardarlo como `source_url` en el
  lugar: la próxima verificación será mucho más rápida.

## Prioridad 2 · Entradas y aparcamientos de pago

En casi todos estos lugares el **aparcamiento ya está verificado** (`parking.verified_at` de octubre
de 2026). Lo caducado es el `verified_at` del lugar y el bloque `entry` (casi siempre `price: 0` con la
cifra del aparcamiento repetida en `entry.notes`). Confirmar que la entrada sigue siendo gratuita y que
la nota coincide con el aparcamiento basta para cerrarlos.

| Lugar | Día | Valor en la guía | `verified_at` | Valor hoy | Fuente · fecha de consulta | Veredicto |
|---|---|---|---|---|---|---|
| `thingvellir` — P.N. de Þingvellir | 2 | `entry.price: 0` ISK («Gratuito. Aparcamiento de pago, 1.000 ISK. Hay baños.») · verificado 2025-09-12<br>`parking.price: 1000` ISK · verificado 2026-10-04 (vigente) | 2025-09-12 | — | <https://www.thingvellir.is> (bloqueada) · 2026-10-21 | **No encontrado** |
| `geysir` — Geysir (Strokkur) | 2 | `entry.price: 0` ISK («Parking de pago, 1.000 ISK. Hay baños.») · verificado 2025-09-12<br>`parking.price: 1000` ISK · verificado 2026-10-04 (vigente) | 2025-09-12 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `reykjadalur` — Reykjadalur (valle termal) | 2 | `parking.price: 1000` ISK / 5 h · verificado 2026-10-06 (vigente) | 2025-09-12 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `seljalandsfoss` — Seljalandsfoss | 3 | `entry.price: 0` ISK («Parking de pago, 1.000 ISK. Hay baños.») · verificado 2025-09-13<br>`parking.price: 1000` ISK · verificado 2026-10-04 (vigente) | 2025-09-13 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `gljufrafoss` — Gljúfrafoss (Gljúfrabúi) | 3 | `parking.price: 1000` ISK · verificado 2026-10-07 (vigente) | 2025-09-13 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `dc3_eyvindarholt` — DC-3 de Eyvindarholt | 3 | `entry.price: 0` ISK («Gratuito. Aparcamiento de pago, unos 1.000 ISK (6-7 €). Hay baños.») · verificado 2025-09-13<br>`parking.price: 1000` ISK · verificado 2026-10-04 (vigente) | 2025-09-13 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `skogafoss` — Skógafoss | 4 | `entry.price: 0` ISK («Parking de pago, 1.000 ISK por 8 horas. Hay baños.») · verificado 2025-09-13<br>`parking.price: 1000` ISK / 8 h · verificado 2026-10-08 (vigente) | 2025-09-13 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `kvernufoss` — Kvernufoss | 4 | `parking.price: 750` ISK · verificado 2026-10-08 (vigente) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `dyrholaey` — Dyrhólaey | 4 | `parking.price: 1000` ISK · verificado 2026-10-08 (vigente) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `reynisfjara` — Playa de Reynisfjara | 4 | `parking.price: 1000` ISK · verificado 2026-10-08 (vigente) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `fjadrargljufur` — Fjaðrárgljúfur | 4 | `parking.price: 1000` ISK · verificado 2026-10-08 (vigente) | 2025-09-15 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `jokulsarlon` — Jökulsárlón | 6 | `entry.price: 0` ISK («Laguna y Diamond Beach: gratuito. Hay 3 aparcamientos en la zona; pagando uno (1.200 ISK) se puede usar cualquiera de los tres. Baños gratuitos y cafeterías cerca. Excursiones en barca/zódiac hasta el borde del glaciar: precio aparte.») · verificado 2025-09-16<br>`parking.price: 1200` ISK · verificado 2026-10-04 (vigente) | 2025-09-16 | — | <https://www.vatnajokulsthjodgardur.is/en/news/vatnajokull-national-parks-new-tariff---area-fees> (bloqueada) · 2026-10-21 | **No encontrado** |
| `vestrahorn` — Vestrahorn y Stokksnes | 6 | `entry.price: 1100` ISK («1.100 ISK/persona en 2025, en el recinto del Viking Café. Incluye acceso a la playa y al asentamiento vikingo.») · verificado 2025-09-16 | 2025-09-16 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `mulagljufur` — Cañón de Múlagljúfur | 6 | `entry.price: 0` ISK («Parking de pago, 1.000 ISK. Hay baños y se puede rellenar agua.») · verificado 2025-09-16<br>`parking.price: 1000` ISK · verificado 2026-10-04 (vigente) | 2025-09-16 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `studlagil` — Stuðlagil (lado este) | 8 | `entry.price: 0` ISK («Parking de pago, 1.000 ISK. Hay baños.») · verificado 2025-09-18<br>`parking.price: 1000` ISK · verificado 2026-10-04 (vigente) | 2025-09-18 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `krafla_viti` — Krafla (cráter Víti) | 9 | `entry.price: 1200` ISK («Parking de pago; subió de 800 ISK (lo que pagó el autor en 2025) a 1.200 ISK. No hay baños.») · verificado 2025-09-19<br>`parking.price: 1200` ISK · verificado 2026-10-04 (vigente) | 2025-09-19 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `hverir_namafjall` — Hverir / Námafjall | 9 | `entry.price: 0` ISK («Parking de pago, 1.400 ISK. Baños de pago, 300 ISK.») · verificado 2025-09-19<br>`parking.price: 1400` ISK · verificado 2026-10-04 (vigente) | 2025-09-19 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `hverfjall` — Hverfjall | 9 | `entry.price: 1200` ISK («Parking de pago, 1.200 ISK. Baños incluidos, amplios y limpios.») · verificado 2025-09-19<br>`parking.price: 1200` ISK · verificado 2026-10-04 (vigente) | 2025-09-19 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `kirkjufell` — Mirador de Kirkjufell | 12 | `entry.price: 1400` ISK («Parking de pago junto a la cascada (Kirkjufell Waterfall Viewpoint), 1.400 ISK. Hay un mirador alternativo gratuito (Kirkjufell Viewpoint) a unos 500 m, con un paseo de unos 15 minutos a pie para evitar el pago.») · verificado 2025-09-22<br>`parking.price: 1400` ISK · verificado 2026-10-04 (vigente) | 2025-09-22 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |
| `ytri_tunga` — Playa de Ytri Tunga | 12 | `entry.price: 1100` ISK («Parking de pago, 1.100 ISK. Baño pequeño y sucio.») · verificado 2025-09-22<br>`parking.price: 1100` ISK · verificado 2026-10-04 (vigente) | 2025-09-22 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |

**Observaciones del cotejo interno (sin fuente externa, solo coherencia del propio YAML):**

- `krafla_viti`: `entry.price: 1200` con la nota «Parking de pago». El precio es del aparcamiento, que ya
  tiene su propio `parking.price: 1200`. Si la entrada es gratuita, el valor correcto de `entry.price`
  sería `0`. Lo decide el autor.
- `hverfjall`, `kirkjufell` y `ytri_tunga`: mismo caso, `entry.price` igual al precio del aparcamiento.
- `vestrahorn`: aquí `entry.price: 1100` sí es una entrada (recinto del Viking Café), por persona.
- `jokulsarlon` y `svartifoss` (Skaftafell) están dentro del P.N. Vatnajökull, que cobra tasa de zona por
  vehículo: <https://www.vatnajokulsthjodgardur.is/en/news/vatnajokull-national-parks-new-tariff---area-fees>.
  `svartifoss` no tiene bloque `parking` en el YAML; si la guía debe mencionar el aparcamiento de
  Skaftafell, es un dato nuevo, no una verificación.
- Baños de pago (Goðafoss, Fjallsárlón, Hjálparfoss, Hverir) están en `entry.notes`; van con su lugar.

## Prioridad 3 · Tasas de carretera o de vehículo

La guía **no menciona ninguna tasa de carretera ni de vehículo** (se ha buscado *peaje*, *túnel*,
*tasa*, *toll*, *Vaðlaheiðargöng* e *island.is* en la guía y en los lugares). No hay nada que verificar.

Aviso para el autor, sin verificar: la ruta pasa entre Mývatn y Akureyri, donde está el túnel de peaje
Vaðlaheiðargöng. Si la guía debe decirlo, es contenido nuevo y necesita su fuente oficial.

## Prioridad 4 · Horarios

| Lugar | Día | Valor en la guía | `verified_at` | Valor hoy | Fuente · fecha de consulta | Veredicto |
|---|---|---|---|---|---|---|
| `vestrahorn` — Vestrahorn y Stokksnes | 6 | `hours`: 08:00-22:00 | 2025-09-16 | — | Sin `source_url`; no consultada (red bloqueada) · 2026-10-21 | **No encontrado** |

Ningún otro lugar caducado tiene bloque `hours`.

## Prioridad 5 · Resto de lugares caducados

Solo caduca el `verified_at` general del lugar (estado, acceso, notas), salvo donde se indica también
`entry.price`. Ninguno tiene precio de pago. Se listan para que el autor los dé por buenos de un vistazo.

| Lugar | Día | Caducado | `verified_at` | Fuente en el YAML | Veredicto |
|---|---|---|---|---|---|
| `reykjavik` — Reikiavik | 1, 13 | `verified_at` | 2025-09-11 | — | **No encontrado** |
| `thorufoss` — Þórufoss | 1 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-11 | — | **No encontrado** |
| `gullfoss` — Gullfoss | 2 | `verified_at` + `entry.price: 0` («Parking gratuito. Hay baños.») | 2025-09-12 | — | **No encontrado** |
| `haifoss` — Háifoss | 3 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-13 | — | **No encontrado** |
| `nauthusagil` — Nauthúsagil | 3 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-13 | — | **No encontrado** |
| `hjalparfoss` — Hjálparfoss | 3 | `verified_at` + `entry.price: 0` («Parking gratuito. Baño de pago, 250 ISK en 2025.») | 2025-09-13 | — | **No encontrado** |
| `keldur` — Keldur (granja de turba) | 3 (no visitado) | `verified_at` | 2025-09-13 | <https://thjodminjasafn.is/en/soguleg-husasofn/keldur> | **No encontrado** |
| `gluggafoss` — Gluggafoss (Merkjárfoss) | 3 (no visitado) | `verified_at` | 2025-09-13 | — | **No encontrado** |
| `seljavallalaug` — Piscina de Seljavallalaug | 3 (no visitado) | `verified_at` + `entry.price: 0` | 2025-09-13 | — | **No encontrado** |
| `iglesia_vik` — Iglesia de Vík | 4 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `gigjagja` — Gígjagjá (la "cueva de Yoda") | 4 (no visitado) | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `laufskalavarda` — Laufskálavarða | 4 (no visitado) | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `eldhraun` — Eldhraun | 4 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `systrafoss` — Systrafoss | 4 (no visitado) | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `foss_a_sidu` — Foss á Síðu | 4 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `lomagnupur` — Lómagnúpur | 4 (no visitado) | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `skool_beans` — Skool Beans Cafe | 4 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `playa_vik` — Playa de Vík (Víkurfjara) | 4 (no visitado) | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `trekking_glaciar_svinafellsjokull` — Trekking en Svínafellsjökull | 5 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `svartifoss` — Svartifoss | 5 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `svinafellsjokull` — Svínafellsjökull | 5 (no visitado) | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `hundafoss` — Hundafoss | 5 | `verified_at` | 2025-09-15 | — | **No encontrado** |
| `fjallsarlon` — Laguna Glaciar Fjallsárlón | 6 | `verified_at` + `entry.price: 0` («Parking gratuito. Baños de pago, 200 ISK en 2025.») | 2025-09-16 | — | **No encontrado** |
| `eystrahorn` — Eystrahorn (Silla Roja) | 6 | `verified_at` | 2025-09-16 | — | **No encontrado** |
| `thjodvegur_renos` — Þjóðvegur (zona de renos) | 6 (no visitado) | `verified_at` | 2025-09-16 | — | **No encontrado** |
| `laekjavik` — Lækjavík | 6 (no visitado) | `verified_at` | 2025-09-16 | — | **No encontrado** |
| `djupavogskorin` — Djúpavogskörin | 6 (no visitado) | `verified_at` | 2025-09-16 | — | **No encontrado** |
| `raudafell` — Mirador de Rauðafell | 6 | `verified_at` | 2025-09-16 | — | **No encontrado** |
| `breiddalsvik` — Breiðdalsvík | 7 | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `stodvarfjordur` — Stöðvarfjörður | 7 | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `reydarfjordur` — Reyðarfjörður | 7 | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `fardagafoss` — Fardagafoss | 7 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-17 | — | **No encontrado** |
| `gufufoss` — Gufufoss | 7 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-17 | — | **No encontrado** |
| `seydisfjordur` — Seyðisfjörður | 7 | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `vok_baths` — Vök Baths | 7 | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `vestdalsfossar` — Vestdalsfossar | 7 (no visitado) | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `borgarfjardarhofn` — Borgarfjarðarhöfn | 7 (no visitado) | `verified_at` | 2025-09-17 | — | **No encontrado** |
| `rjukandifoss` — Rjúkandifoss | 8 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-18 | — | **No encontrado** |
| `dettifoss_selfoss` — Dettifoss y Selfoss | 8 | `verified_at` + `entry.price: 0` («Parking grande y gratuito. Baños limpios.») | 2025-09-18 | — | **No encontrado** |
| `grjotagja` — Grjótagjá | 8 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-18 | — | **No encontrado** |
| `hengifoss` — Hengifoss | 8 (no visitado) | `verified_at` | 2025-09-18 | — | **No encontrado** |
| `dimmuborgir` — Dimmuborgir | 9 | `verified_at` + `entry.price: 0` («Parking gratuito. Hay baños.») | 2025-09-19 | — | **No encontrado** |
| `myvatn_viewpoint` — Mirador del lago Mývatn | 9 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-19 | — | **No encontrado** |
| `leirhnjukur` — Leirhnjúkur | 9 (no visitado) | `verified_at` | 2025-09-19 | — | **No encontrado** |
| `skutustadagigar` — Pseudocráteres de Skútustaðagígar | 9 (no visitado) | `verified_at` | 2025-09-19 | — | **No encontrado** |
| `jardgangalaug` — Jarðgangalaug | 9 | `verified_at` | 2025-09-19 | — | **No encontrado** |
| `godafoss` — Goðafoss | 10 | `verified_at` + `entry.price: 0` («Parking gratuito en el lado este. Entrada a los baños de pago, 200-300 ISK según precios actuales.») | 2025-09-20 | — | **No encontrado** |
| `akureyri` — Akureyri | 10 | `verified_at` | 2025-09-20 | — | **No encontrado** |
| `hauganes` — Ballenas en Hauganes | 10 | `verified_at` | 2025-09-20 | — | **No encontrado** |
| `migandifoss` — Mígandifoss | 10 | `verified_at` | 2025-09-20 | — | **No encontrado** |
| `siglufjordur` — Siglufjörður | 10 | `verified_at` | 2025-09-20 | — | **No encontrado** |
| `grafarkirkja` — Grafarkirkja | 11 | `verified_at` + `entry.price: 0` («Gratuito, pero actualmente cerrada por dentro.») | 2025-09-21 | — | **No encontrado** |
| `glaumbaer` — Granja de Glaumbær | 11 | `verified_at` + `entry.price: 0` («Parking gratuito. Hay baños.») | 2025-09-21 | — | **No encontrado** |
| `vidimyrarkirkja` — Víðimýrarkirkja | 11 | `verified_at` + `entry.price: 0` («Parking gratuito. Hay baños. Solo se puede ver por fuera.») | 2025-09-21 | — | **No encontrado** |
| `kolugljufur` — Cañón de Kolugljúfur | 11 | `verified_at` + `entry.price: 0` («Parking gratuito a ambos lados del puente. No hay baños.») | 2025-09-21 | — | **No encontrado** |
| `kolgrafarfjordur` — Kolgrafarfjörður | 11 | `verified_at` | 2025-09-21 | — | **No encontrado** |
| `olafsvik` — Ólafsvík | 12 | `verified_at` | 2025-09-22 | — | **No encontrado** |
| `djupalonssandur` — Playa de Djúpalónssandur | 12 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-22 | — | **No encontrado** |
| `londrangar` — Londrangar | 12 | `verified_at` | 2025-09-22 | — | **No encontrado** |
| `hellnar` — Mirador de Hellnar | 12 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-22 | — | **No encontrado** |
| `arnarstapi` — Arnarstapi | 12 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-22 | — | **No encontrado** |
| `raudfeldsgja` — Garganta de Rauðfeldsgjá | 12 | `verified_at` + `entry.price: 0` («Parking gratuito. No hay baños.») | 2025-09-22 | — | **No encontrado** |
| `budakirkja` — Búðakirkja | 12 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-22 | — | **No encontrado** |
| `svortuloft` — Faro de Svörtuloft | 12 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-22 | — | **No encontrado** |
| `landbrotalaug` — Landbrotalaug | 12 | `verified_at` + `entry.price: 0` («Parking gratuito.») | 2025-09-22 | — | **No encontrado** |
| `raudhals` — Volcán Raudhals | 12 | `verified_at` | 2025-09-22 | — | **No encontrado** |
| `glymur` — Glymur | 13 (no visitado) | `verified_at` | 2025-09-23 | — | **No encontrado** |

---

## Cambios de YAML propuestos

**Ninguno.** No hay ningún dato con veredicto «igual» o «cambiado», así que no se propone cambiar nada
en `content/`.

Cuando el autor confirme un dato, el cambio tiene esta forma (ejemplo con Þingvellir, **no aplicar
sin confirmar**):

```yaml
# content/places/islandia.yaml — camp_thingvellir
# «igual»: solo las fechas
  verified_at: 2026-10-DD
  entry:
    price: 4400
    verified_at: 2026-10-DD
# «cambiado»: valor, nota con el año y fechas
  verified_at: 2026-10-DD
  entry:
    price: <nuevo valor en ISK>
    verified_at: 2026-10-DD
    notes: "Precio de 2026 por noche para 2 personas y camper sin electricidad."
```
