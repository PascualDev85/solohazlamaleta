# Día 7 — Fiordos del este (DIA 6 de las notas, sentido anti-horario)

## Punto de partida y final

- **Inicio:** la noche del día 6 fue fuera de camping (`overnight: null`; según el `variant_note` de Rauðafell, durmieron en ese mirador). El día empieza en la primera parada de ruta, **Breiðdalsvík**, sin tramo inicial. Como referencia, no contado: Rauðafell → Breiðdalsvík ≈ 10 km. El "(45m)" de Breiðdalsvík en las notas era el tramo desde Djúpivogur (el camping del plan) y no se usa.
- **Final:** la noche del día 7 también fue fuera de camping (`overnight: null`). El día termina en la última parada de ruta, **Vök Baths**. Las notas preveían dormir en Camp Egilsstaðir o Hallormsstaðaskógur; no se añade tramo final.

## Tramos y conducción

Paradas de ruta (las no `not_visited`, en su orden): Breiðdalsvík → Stöðvarfjörður → Reyðarfjörður → Fardagafoss → Gufufoss → Seyðisfjörður → Vök Baths.

| Tramo | Haversine | Factor | km | min | Fuente del tiempo |
|---|---|---|---|---|---|
| Breiðdalsvík → Stöðvarfjörður | 7,2 | × 1,4 (la 96 rodea el cabo Kambanes) | 10 | 15 | notas "(15m)" |
| Stöðvarfjörður → Reyðarfjörður | 28,7 | × 1,4 (la 96 entra en Fáskrúðsfjörður) | 40 | 40 | notas "(40m)" |
| Reyðarfjörður → Fardagafoss | 27,3 | × 1,25 | 34 | 55 | notas "(55m)" |
| Fardagafoss → Gufufoss | 18,6 | × 1,25 | 23 | 18 | notas "(18m)" |
| Gufufoss → Seyðisfjörður | 1,5 | × 1,25 | 2 | 4 | notas "(4m)" |
| Seyðisfjörður → Vök Baths | 20,7 | × 1,25 | 26 | 30 | notas "(30m)" (en las notas va tras Vestdalsfossar, que está pegado a Seyðisfjörður) |
| **Total** | | | **135,6 → 135** | **162 → 160** | |

`drive: { km: 135, minutes: 160 }`. Todos los minutos salen de las notas; ningún tramo estimado por velocidad. Los km salen de las coordenadas del YAML (haversine × factor), redondeando el total a 5.

Comentario YAML propuesto:

> Breiðdalsvík (night before outside any campsite, no first leg) → Stöðvarfjörður (10 km, 15 min) → Reyðarfjörður (40, 40 min) → Fardagafoss (34, 55 min) → Gufufoss (23, 18 min) → Seyðisfjörður (2, 4 min) → Vök Baths (26, 30 min). Total ≈ 135 km; 162 min → 160. Minutes from the author's notes; km from coordinates (× 1.4 on the two fjord legs, × 1.25 elsewhere), probably short on the fjord roads. Night outside any campsite: the day ends at Vök Baths. Estimación pendiente de confirmar por el autor.

**Ojo con los km:** la regla haversine se queda corta en los fiordos. Por carretera real estimo unos 160–165 km (Breiðdalsvík → Stöðvarfjörður ≈ 19, → Reyðarfjörður ≈ 50 por Fáskrúðsfjörður y el túnel, → Fardagafoss ≈ 35, → Gufufoss ≈ 24, → Seyðisfjörður ≈ 2, → Vök ≈ 33). El plan de las notas decía "Ruta 220km 3h 10min" desde Djúpivogur, que incluía unos 60 km del primer tramo: cuadra más con 160 que con 135. Pendiente de que lo confirmes.

## travel_to_next

| Parada | travel_to_next_min | modo |
|---|---|---|
| breiddalsvik | 15 | coche |
| stodvarfjordur | 40 | coche |
| reydarfjordur | 55 | coche |
| fardagafoss | 18 | coche |
| gufufoss | 4 | coche |
| seydisfjordur | 30 | coche |
| vok_baths | — (última parada de ruta) | |

## Nombres cortos propuestos

- `vok_baths`: **"Vök"** (la marca oficial es "Vök Baths"; se deja como `name`).

Los demás lugares (Breiðdalsvík, Stöðvarfjörður, Reyðarfjörður, Fardagafoss, Gufufoss, Seyðisfjörður) no tienen forma corta sin inventarla. Con 7 paradas de ruta la línea debe caber en 3 filas (≈ 84 caracteres): sin nombres cortos suma 98, con "Vök" 92. Es probable que necesite 4 filas y que `npm run test:ui` lo marque. Es decisión tuya: aceptar la cuarta fila o replantear si los tres pueblos de los fiordos cuentan como paradas de ruta separadas.

## skip_reason

- `vestdalsfossar` (nuevo): "Estaba en el plan como opción dudosa, justo después de Seyðisfjörður, y quedó fuera. Según nuestras notas, la cascada y la vista al fiordo están a unos 5 minutos a pie del parking, por si quieres añadirla."
- `borgarfjardarhofn`: ya lo tiene (frailecillos fuera de época); no toco nada.

## Revisión editorial de lugares

| Lugar | Campo | Qué pasa | Propuesta |
|---|---|---|---|
| breiddalsvik | notes | Frase de cierre no canónica ("Coordenadas y datos de referencia general…") | "Pequeño pueblo pesquero del este de Islandia, al fondo del fiordo Breiðdalsvík. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." |
| stodvarfjordur | notes | Ídem | "Pueblo de pescadores del este, conocido por el museo de minerales Petra. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." |
| reydarfjordur | notes | Ídem | "Pueblo industrial en el fondo del fiordo más largo del este de Islandia. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." |
| seydisfjordur | description | Dato impreciso: la calle arcoíris no toma el nombre de la iglesia; la calle lleva hasta ella | "Pueblo del este de Islandia construido alrededor de un fiordo estrecho, con arquitectura de principios del siglo XX y puerto del ferry hacia las Islas Feroe y Dinamarca. Su iglesia azul, Seyðisfjarðarkirkja, está al final de la calle arcoíris pintada en el suelo." |
| seydisfjordur | notes | Repetía la description; cierre no canónico | "Hay aparcamiento gratuito dentro del pueblo. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." |
| vestdalsfossar | description | No tiene; lo que lo describía estaba en notes | "Conjunto de cascadas en el valle de Vestdalur, a la entrada de Seyðisfjörður, con vistas al fiordo." |
| vestdalsfossar | notes | Mezclaba qué es con el acceso | "Se llega con una caminata corta desde el parking, unos 5 minutos según las notas del autor. Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." |

Sin cambios: fardagafoss, gufufoss, borgarfjardarhofn y vok_baths cumplen (description objetiva, acceso en notes, cierre canónico).

## Avisos

1. **Orden:** en las notas, Vestdalsfossar (??) va entre Seyðisfjörður y Vök Baths; en el YAML está en `order: 9`, después de Vök Baths (`order: 8`). Como es `not_visited` no afecta a la ruta, pero si quieres que el panel del día siga el plan, iría en `order: 7` y Vök Baths pasaría a `order: 9`.
2. **Borgarfjarðarhöfn** (`order: 7`, `not_visited`) no aparece en las notas del DIA 6. Ya tiene `skip_reason`; solo lo señalo.
3. Todas las paradas de las notas existen en el YAML; ninguna que añadir.
4. **overnight:** las notas decían "Dormir en Camp Egilsstadir … o Hallormsstadhaskogur"; el YAML tiene `overnight: null` (confirmado). `overnight_note` está vacío y es tuyo.
5. **Duraciones de visita sospechosas:** `breiddalsvik: 45`, `stodvarfjordur: 15` y `reydarfjordur: 40` coinciden exactamente con los "(45m) (15m) (40m)" de las notas, que son tiempos de conducción, no de visita. Parece que se copiaron como `duration_min`; conviene revisarlas.
6. **Km probablemente cortos** (ver arriba): real ≈ 160–165 km frente a los 135 del método.
7. **Línea de ruta** de 4 filas probable (ver "Nombres cortos").
8. **Nombres en inglés:** "Vök Baths" es la marca oficial; se deja como `name` con `short_name: "Vök"`. No hay otros nombres en inglés en las paradas del día.
