# Verificación de precios de Islandia (2026-10-22)

Hecha desde el ordenador del autor, porque la red de la nube bloqueaba las webs oficiales
(PR #56). **Solo fuentes oficiales o del propio negocio**: webs de los campings, del parque
nacional, del ayuntamiento o del operador del aparcamiento (Parka, Checkit, Sannir). Nada de
agregadores ni blogs. Lo que no tiene fuente oficial queda como está y sigue avisando en
`npm run content:validate`.

**Criterio para los aparcamientos:** se guarda el precio de un turismo o camper de **hasta 5
plazas registradas**. Varias zonas cobran más con 6 a 9 plazas (se indica abajo); depende del
permiso de circulación de la camper. Pagar por la app o la web de Parka añade 89 ISK de comisión.

## Campings (`entry.price`: 2 adultos + camper, sin electricidad, ISK por noche)

| Lugar | Antes | Ahora | Desglose | Fuente |
|---|---:|---:|---|---|
| Þingvellir | 4.400 | **4.000** | 2 × 1.800 + 400 de tasa | https://www.thingvellir.is/en/service/camping/ |
| Árnes | 4.400 | 4.400 | 2 × 2.000 + 400 la 1.ª noche; 4.000 las siguientes | https://reisa.is/arnes/ (web del operador) |
| Skógafoss | 4.000 | **4.200** | 2 × 2.100; no dice si incluye la tasa (serían 4.600) | https://skogafosscamping.is/ |
| Svínafell | 5.000 | 5.000 | 2 × 2.300 + tasa (400 estándar), verano 2026 | https://svinafell.com/ |
| Skaftafell | 5.500 | **5.600** | 2 × 2.800, tasa incluida | https://www.vatnajokulsthjodgardur.is/en/communities--businesses/pricelist |
| Laugar | 4.800 | 4.800 | 2 × 2.200 + 400, 2026 | https://reisa.is/laugar/ (web del operador) |
| Systragil | 4.200 | **4.400** | 2 × 2.000 + 400, verano 2026 | https://systragil.is/ |
| Hellissandur | 4.000 | **5.000** | 2 × 2.500, tasa incluida, 2026 | https://www.snb.is/static/files/gjaldskrar/2026/tjaldsvaedi-gjaldskra-2026-2026.pdf |
| Lambeyri | 5.500 | sin cambio | Sin web oficial (solo agregadores) | — |
| Mosskógar | 5.000 | sin cambio | Sin web oficial (solo agregadores) | — |

El `price_paid` de la guía (lo que se pagó en 2025) es histórico y no se toca.

## Aparcamientos y entradas

| Lugar | Antes | Ahora | Detalle | Fuente |
|---|---:|---:|---|---|
| Geysir | 1.000 | **1.080** | 1-7 plazas, 8 h, baños incluidos | https://parka.is/pay/geysir/ |
| Seljalandsfoss | 1.000 | **900** | Por día, baños incluidos | https://www.checkit.is/en-gb/seljalandsfoss |
| Skógafoss | 1.000 / 8 h | 1.000 / **5 h** | 6-9 plazas: 1.300 | https://parka.is/pay/skogafoss/ |
| Dyrhólaey | 1.000 | **750** | 6-9 plazas: 1.000; válido 24 h | https://parka.is/pay/dyrholaey/ |
| Jökulsárlón | 1.200 | **1.110** | Un pago para los 3 aparcamientos hasta medianoche; 6-9 plazas: 1.440; mitad si ese día se pagó en Skaftafell | https://www.vatnajokulsthjodgardur.is/en/communities--businesses/pricelist |
| Ytri Tunga | 1.100 | **900** | 6-9 plazas: 1.100. `entry.price` pasa de 1.100 a 0: era el precio del aparcamiento repetido | https://www.checkit.is/en-gb/selafjaran |
| Þingvellir | 1.000 | 1.000 | Todo el día; 6-9 plazas: 1.200 | https://www.thingvellir.is/en/service/parking-service/ |
| Reykjadalur | 1.000 | 1.000 / 5 h | | https://parka.is/pay/reykjadalur/ |
| Kvernufoss | 750 | 750 | Hasta 7 plazas, por día | https://parka.is/pay/kvernufoss/ |
| Reynisfjara | 1.000 | 1.000 / 4 h | | https://parka.is/pay/reynisfjara/ |
| Fjaðrárgljúfur | 1.000 | 1.000 | 6-9 plazas: 1.300 | https://parka.is/pay/fjadrargljufur/ |
| Múlagljúfur | 1.000 | 1.000 / 4 h | | https://parka.is/pay/mulagljufur/ |
| Stuðlagil (Klaustursel) | 1.000 | 1.000 | 6-9 plazas: 1.300 | https://parka.is/pay/studlagil-klaustursel/ |
| Hverir / Námafjall | 1.400 | 1.400 | Día completo | https://www.sannir.is/hv |
| Hverfjall | 1.200 | 1.200 | Baños incluidos | https://parka.is/pay/hverfjall/ |
| Kirkjufell | 1.400 | 1.400 | Día completo | https://www.sannir.is/kf |

En la guía, el consejo de Dyrhólaey pasa de «1.000 ISK» a «750 ISK hasta 5 plazas y 1.000 de 6 a 9».
Se mantiene lo vivido por el autor: el mismo ticket vale para Lágey y Háey.

**Horario de Vestrahorn:** 07:30-22:00 el café y la taquilla, y de 22:00 a 07:30 taquilla de
autoservicio (https://www.vestrahorn.is/about). Antes ponía 08:00-22:00.

## Sin confirmar (no se ha tocado)

- **Vestrahorn, entrada:** la web dice 1.200 ISK en el pie y 1.100 en tres páginas. Se queda en 1.100.
- **Krafla / Víti:** sin página oficial; solo blogs.
- **DC-3 de Eyvindarholt:** es aparcamiento de pago (Parka), pero sin precio publicado.
- **Gljúfrafoss:** ninguna fuente oficial dice que comparta el ticket de Seljalandsfoss.
- **Baños de Hverir (300 ISK):** no aparecen en la web del operador.
- **Entradas gratuitas** (Þingvellir, Geysir, Seljalandsfoss…): las páginas oficiales hablan del
  aparcamiento y no dicen nada de la entrada, así que sus `entry.verified_at` siguen caducados.
- **Camping Skógafoss:** la web dice que ahora solo hay agua fría y váteres, sin electricidad; la
  ficha del lugar habla de duchas de pago. Conviene revisarlo.
- **Lambeyri:** es el de Skagafjörður (Laugarhvammur, cerca de Varmahlíð), no el de Tálknafjörður.
