# Brief para el borrador de un día de la guía de Islandia (solo lectura del repo)

Repo: /Users/meta/Desktop/solo_haz_la_maleta (rama feature/checkpoint3-diseno-v6-dias-5-13). NO modifiques ningún fichero del repo. Solo escribes dos ficheros en la carpeta de salida que se te indica. No hagas git. No ejecutes npm. Conversación en español.

## Fuentes que debes leer
1. `content/guides/islandia/islandia-en-camper-13-dias.yaml`: el bloque de tu día (`      - day: N`) y, para el punto de partida, el `overnight` del día anterior. Los días 1 a 4 están terminados y son el modelo: fíjate en `drive` con su comentario de tramos, `travel_to_next_min` + `travel_to_next_mode: "coche"`, `skip_reason` en las paradas `not_visited`, y en que los campos derivados no se escriben a mano.
2. `content/places/islandia.yaml`: los lugares de tus paradas (lat/lng, name, short_name, description, notes) y los campings (`camp_*`).
3. `docs/fuentes/mi-ruta-islandia.md`: las notas del autor. Ojo: el fichero tiene dos planes. El que vale es el de "Opción 2: Sentido anti-horario" (desde la línea 141, "Página 4"). Allí "DIA k" de las notas corresponde al día k+1 de la guía (DÍA 1 de las notas = día 2 de la guía: Þingvellir, Géiser, Gullfoss… Camping Árnes). Comprueba la correspondencia por los nombres de las paradas, no te fíes solo del número. Entre paréntesis "(Xm)" junto a una parada es el tiempo de conducción desde la parada anterior; "Ruta XXXkm Xh XXm" es la estimación del plan para todo el día; "??" marca sitios dudosos; "P Gratis" es el parking.
4. `docs/1.6_modelo_datos.md` §2.2 (frontera description/notes) y `docs/1.7.2_data_contract.md` §3 (DaySource) por si dudas de un campo.

## Qué calculas para tu día N
- **Tramos y conducción**: punto de partida = el camping del `overnight` del día N-1 (si es `null`, la noche fue fuera de camping: empieza en la primera parada de ruta, sin tramo inicial, y dilo). Paradas de ruta = las que NO son `not_visited`, en su orden. Fin = el camping del `overnight` del día N (si es `null`, termina en la última parada; el día 13 termina en el aeropuerto de Keflavík, 63.985, -22.605). Distancia por tramo: haversine entre coordenadas × 1,25 de factor de carretera (× 1,4 si hay pista de grava o desvío evidente), redondea el total a 5 km. Minutos por tramo: usa el "(Xm)" de las notas cuando exista para ese tramo; si no, distancia / 70 km/h (/ 50 en grava), redondeados. Total de minutos redondeado a 5.
- **travel_to_next_min** para cada parada de ruta menos la última, en minutos enteros, con `travel_to_next_mode: "coche"` (o `"a pie"` si está al lado).
- **short_name** para cada lugar de tus paradas que no lo tenga y cuyo nombre sea largo o lleve paréntesis: el nombre propio escueto, como los existentes ("Jökulsárlón", "Vestrahorn", "Dettifoss"). La línea de ruta de la tarjeta es "A → B → C…" en un móvil de 350 px: con hasta 6 paradas debe caber en 2 filas (unos 56 caracteres en total), con 7 u 8 en 3 filas (unos 84), con 9 o más en 4 filas (unos 112). Ajusta los nombres cortos para cumplirlo.
- **skip_reason** para cada parada `not_visited` que no lo tenga: una o dos frases en la voz del autor ("quedó fuera por tiempo", "estaba en el plan como dudosa"…), prudentes, sin inventar motivos concretos que no estén en las notas (nada de meteorología ni cierres si no lo dicen). Si las notas marcan el sitio con "??", dilo así: estaba en el plan como opción dudosa.
- **Revisión editorial** de `description` y `notes` de tus lugares: `description` dice qué es el lugar, objetivo y atemporal, sin superlativos sin fuente ni opiniones; el acceso y la logística van en `notes`; las `notes` de lugares no confirmados por el autor terminan con "Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar." Propón el texto corregido cuando algo lo incumpla. No propongas cambios de estilo porque sí.
- **Avisos**: orden de paradas que no cuadre con las notas, paradas de las notas que no están en el YAML (solo lístalas; no se añaden), `overnight` que no cuadre con "Dormir en…" de las notas, nombres en inglés que convendría traducir.
- NO propongas `photo`, `highlight`, `parking`, `maps_url`, `our_take` ni `variant_note`: son del autor.

## Salida (exactamente dos ficheros en la carpeta de salida)
`dia-N.json` con esta forma exacta (JSON válido, sin comentarios):
{
  "day": N,
  "start": {"place_id": "camp_x" | null, "note": "..."},
  "end": {"place_id": "camp_y" | null, "note": "..."},
  "legs": [{"from": "...", "to": "...", "km": 12, "minutes": 15, "source": "notas|estimado"}],
  "drive": {"km": 210, "minutes": 205},
  "drive_comment": "una línea para el comentario YAML con los tramos, p. ej. 'Camping X → A (12 km, 15 min) → B (…) → Camping Y (…). Tiempos de las notas del autor salvo los marcados ≈.'",
  "travel": [{"place_id": "...", "travel_to_next_min": 15, "travel_to_next_mode": "coche"}],
  "short_names": {"place_id": "Nombre corto"},
  "skip_reasons": {"place_id": "texto"},
  "place_text_fixes": [{"place_id": "...", "field": "description|notes", "text": "texto corregido completo", "why": "motivo breve"}],
  "warnings": ["..."]
}
`dia-N.md`: un informe corto en español para el autor: tabla de tramos y km, qué has estimado y de dónde sale cada cifra, los nombres cortos propuestos, los skip_reason, y los avisos.
