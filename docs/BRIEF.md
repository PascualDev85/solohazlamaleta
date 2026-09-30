# SOLO HAZ LA MALETA — Documento maestro (Blueprint 1.0 → 1.4 consolidado)

> **Punto cero del proyecto.** Contrato estratégico y funcional. Todo lo que se construya debe poder justificarse contra este documento.
> Versión: 1.6 · Fecha: 30 de septiembre de 2026 · Próxima revisión: mes 6 desde el lanzamiento.
> Documentos de apoyo: `docs/1.5_producto_mi_viaje.md`, `docs/1.6_modelo_datos.md`, `docs/1.6.4_json_islandia.md`, `docs/1.7_arquitectura.md`, `docs/1.7.1_repository_domain.md`, `docs/1.7.2_data_contract.md`, `docs/redes.md`.

---

## 🔴 DECISIONES CERRADAS — NO MODIFICAR SIN NUEVA VALIDACIÓN

| # | Decisión | Validada con |
|---|---|---|
| 1 | **Nombre: Solo Haz la Maleta.** Claim: *"Nosotros hacemos el trabajo difícil."* | Test de posicionamiento (1.3). Pendiente: prueba con 10 personas antes de comprar dominio |
| 2 | **Es una plataforma de viajes, no un blog.** La unidad es el viaje, no el artículo | 1.0 |
| 3 | **Cuatro principios: Comprobado · Vivido · Adaptado · Con criterio** | 1.1 y 1.3 |
| 4 | **Etiquetas de verificación obligatorias y visibles**: Vivido / Comprobado / Estimado, siempre con fecha | 1.1, 1.3 |
| 5 | **Mallorca = laboratorio SEO. Roma = escaparate de producto. Tailandia = contrapeso de tráfico. Islandia = cuarto pilar** | 1.2 (Keyword Planner + Trends + SERP) |
| 6 | **Estrategia SEO: colas largas → grupos temáticos → autoridad → búsquedas grandes.** Nunca al revés | 1.2 |
| 7 | **Ritmo: 2 guías + 2-3 satélites al mes.** Máximo | Tiempo disponible (~6 h/semana) |
| 8 | **El calendario se adapta al tiempo disponible; la estrategia SEO no se acelera artificialmente para cumplir una fecha** | Regla de proyecto |
| 9 | **V1 sin cuentas de usuario.** El resultado se lleva en PDF y mapa | 1.0 |
| 10 | **V1 no reserva, no vende paquetes, no compara precios** | 1.0 |
| 11 | **Padres mayores: funcionalidad de producto, no eje editorial ni bandera de marca** | 1.2 (volumen 0 en las variantes por destino) |
| 12 | **Ritmo de viaje: modificador interno. Nunca una página** | 1.2 (volumen 0 en las cinco variantes) |
| 13 | **Una intención de búsqueda, una URL.** Las variantes de días, grupo o ritmo viven dentro de la página cuando responden a la misma intención. Solo se crea URL propia cuando hay intención de búsqueda propia y volumen demostrado | 1.2 (evitar canibalización) |
| 14 | **Canal de ofertas desde el sur: canal de adquisición (Telegram y redes), no pilar editorial** | 1.2 (intención transaccional, SERP de Ryanair y Skyscanner) |
| 15 | **Familias con niños: fuera de la V1** (hay demanda, pero está saturado y sin experiencia propia) | 1.2 |
| 16 | **Monetización: afiliación contextual desde el día uno; productos propios solo con señales de demanda** | 1.0, 1.4 |
| 17 | **La IA es infraestructura interna.** No se publica nada generado sin revisión humana. Sin imágenes generadas por IA | 1.0, 1.1 |
| 18 | **Idioma: español. Mercado: España** | 1.0 |
| 19 | **"Mi viaje" es el producto; el PDF es una salida.** El concepto del producto no cambia aunque evolucionen los formatos | 1.4 |
| 20 | **"Adapta este viaje" desde V1** como MVP de personalización, sin construir planificador | 1.4 |
| 21 | **Las respuestas de adaptación se guardan estructuradas** por destino desde el primer día. Son datos de producto, no logs | 1.4 |
| 22 | **Competencia directa en español existe.** Spain Seeker tiene posicionamiento casi idéntico. La oportunidad está en combinar experiencia real + verificación + criterio + adaptación + ejecución | 1.4 (benchmarking) |
| 23 | **Precio del primer producto: a validar.** Rango orientativo 5-15 €. No se fija antes de tener el producto terminado | 1.4 |
| 24 | **El primer producto se lanza por señales de demanda**, no por número de suscriptores. Señales: clics de afiliado, descargas de mapa, uso de "Adapta este viaje", solicitudes, lista de espera | 1.4 |
| 25 | **Tiempo estimado de producción por guía: 3-5 h** hasta medir el proceso real. No optimizar antes de medir | 1.4 |
| 26 | **No construir planificador hasta que los datos de adaptación lo justifiquen** | 1.4 |
| 27 | **No construir comunidad en V1** | 1.4 |

---

## A. Visión y objetivo

Construir un **activo digital de viajes** que convierta información dispersa en decisiones y viajes ejecutables, con audiencia propia y varias fuentes de ingresos.

- **Año 1:** construir base, autoridad temática y audiencia. Ingresos simbólicos.
- **Año 2:** ingreso complementario real y primeros productos propios.
- **Restricción permanente:** ~6 h/semana. Todo lo repetitivo se automatiza; lo que no se puede automatizar es lo que da valor.

---

## B. Usuario

Viajero independiente español, aproximadamente **28-45 años**, que viaja **en pareja, con amigos o con su familia** (incluidos padres mayores). Planifica por su cuenta, no compra paquetes, quiere aprovechar bien unos días limitados de vacaciones. Usa el móvil durante el viaje.

---

## C. Problema

Exceso de información dispersa y dificultad para convertirla en un viaje coherente. Quince pestañas abiertas, reels sin contexto, blogs con la vida del autor antes del itinerario, precios sin fecha y ninguna respuesta a la pregunta real: **¿qué hago yo, con mis días, mi gente y mi presupuesto?**

---

## D. Propuesta de valor

> **Nosotros hacemos el trabajo difícil.**
> Guías de viaje con precios comprobados, presupuesto real y versiones según cómo viajes.

La cadena de valor del producto:

```
Información → Comprobación → Criterio → Adaptación → Decisión → Viaje
```

Frase interna de referencia (útil para explicar el proyecto):
> *ChatGPT te hace un itinerario en diez segundos. Nosotros te decimos cuál de esos sitios cierra los lunes, cuánto cuesta de verdad y qué quitaríamos si solo tienes tres días.*

---

## E. Posicionamiento

**Los cuatro principios:**

1. **Comprobado.** Cada dato sensible lleva fecha y fuente. "Comprobado" no significa verdad permanente: significa comprobado **en esa fecha**.
2. **Vivido.** Cuando hemos estado, se dice. Cuando no, también. La guía editorial es legítima si se etiqueta.
3. **Adaptado.** El mismo destino cambia según quién viaja, cuántos días, qué ritmo y qué presupuesto. En V1 se resuelve **editorialmente**, no con algoritmo.
4. **Con criterio.** No listamos todo lo que se puede hacer: ayudamos a decidir qué merece el tiempo disponible. El criterio se firma y se distingue visualmente de los datos.

**Lo que NO defendemos como diferencial** (el mercado ya lo hace): publicar presupuestos, publicar itinerarios día a día, personalizar rápido.

**Contra quién competimos de verdad:** no contra los blogs grandes (ganan en autoridad) ni contra la IA (gana en velocidad), sino contra la **desconfianza**: precios viejos, recomendaciones interesadas y contenido generado sin haber pisado el sitio.

---

## F. Marca y comunicación

```
SOLO HAZ LA MALETA
Nosotros hacemos el trabajo difícil.
Guías de viaje con precios comprobados, presupuesto real y versiones según cómo viajes.

VIVIDO · Estuvimos aquí · marzo 2026
COMPROBADO · Comprobado · septiembre 2026
ESTIMADO · Estimación · septiembre 2026
```

- **Tono:** cercano, directo, sin épica. Primera persona. Cero relleno antes del itinerario.
- **Marca personal sin cara** (al menos al principio): fotos propias, criterio firmado, página "Sobre mí" con los viajes reales.
- **Principio editorial de cabecera:** *no estamos aquí para decirte todo lo que puedes hacer, sino para ayudarte a decidir qué merece tu tiempo.*
- **Frases prohibidas:** "la guía definitiva", "todo lo que necesitas saber", "los mejores X imprescindibles".
- **Pendiente antes de comprar dominio:** prueba con 10 personas. Pregunta literal: *"Si ves una web que se llama Solo Haz la Maleta, sin saber nada más, ¿qué crees que ofrece? ¿Qué esperarías encontrar dentro?"* Clasificar respuestas en: agencia/reservas · guías para organizar · itinerarios preparados · blog · otro. Si domina "agencia/reservas", el claim necesita más trabajo.

---

## G. Producto V1

**El producto central es "Mi viaje".** El PDF, el mapa y el presupuesto son salidas del producto, no el producto en sí. Esta distinción permite evolucionar los formatos sin cambiar el concepto ni el nombre.

**La guía gratuita incluye:**
- Caja de resumen comprensible sin desplazarse en móvil.
- Selector de ritmo (equilibrado / intensivo / tranquilo).
- Mapa interactivo con paradas por día + enlace de ruta de Google Maps + KML.
- Presupuesto estructurado por conceptos, con base de cálculo, fecha y distinción entre gasto real y estimación.
- Criterio editorial firmado, visualmente distinto de los datos.
- Etiquetas Vivido / Comprobado / Estimado con fecha en cada dato sensible.
- PDF sin registro.

**"Adapta este viaje" — MVP de personalización desde V1:**
Formulario con campos: destino, días, grupo (pareja / amigos / familia / padres), ritmo, prioridades y presupuesto orientativo. Resultado: PDF de la variante más cercana enviado por email + alta en newsletter (doble confirmación). Las respuestas se almacenan **estructuradas** desde el primer día:

```json
{
  "destination": "roma",
  "trip_days": 3,
  "group_type": "couple",
  "pace": "balanced",
  "budget": "medium",
  "priorities": ["history", "food"],
  "created_at": "2026-10-15"
}
```

Estos datos no son logs: son el input que decidirá si construir el planificador y qué variables debe tener.

**Frontera entre los tres niveles del producto:**
- **Guía gratuita:** presenta información, posibilidades y criterio. El lector ve todas las opciones y decide.
- **"Adapta este viaje":** MVP de personalización. Identifica, a partir de las respuestas del formulario, qué variante ya existente encaja mejor con ese usuario. Devuelve una recomendación, no un viaje nuevo.
- **"Mi viaje":** producto de ejecución. Convierte la variante elegida en un viaje estructurado y listo para llevar a cabo: itinerario definitivo, mapa filtrado, presupuesto adaptado, checklist, enlaces de reserva y avisos prácticos.

El salto de gratis a pago no es de cantidad de información, sino de decisión tomada: la guía da las posibilidades, Mi viaje las convierte en una decisión concreta ya preparada.

**El esquema JSON de adaptación es conceptual.** Los campos y valores mostrados en el documento no constituyen el contrato técnico definitivo. Se validarán durante el Blueprint 1.5 antes de implementar el almacenamiento.

**Qué NO incluye en V1:** cuentas de usuario, guardado, edición, colaboración, reservas, comparador de precios, personalización algorítmica, planificador, comunidad.

---

## H. Arquitectura de contenidos

**Grupos temáticos por destino**: hub + guías + satélites, enlazados entre sí.

```
/{destino}/                        Hub
/{destino}/{slug}/                 Guía o satélite
/basicos/{tema}/                   Transversal (seguro, equipaje, vuelos)
/ofertas/{slug}/                   Oferta temporal (noindex)
/ir/{id}                           Afiliado (noindex, nofollow, sponsored)
/print/{destino}/{slug}/           Imprimible (noindex)
/sobre-mi/ /aviso-legal/ /privacidad/ /afiliacion/
```

**Tres tipos de página, con papeles distintos:**

| Tipo | Ejemplos | Papel |
|---|---|---|
| **Autoridad** | Qué ver en Roma · Viajar a Tailandia | Construyen el grupo temático. Posicionan tarde |
| **Intención** | Roma en 3/4 días · Mallorca en 3/5 días · Tailandia 10/15 días | El producto. Tráfico medio |
| **Comercial** | Dónde alojarse en Roma · Alquilar coche en Mallorca · Alquiler de camper en Islandia · Seguro de viaje | Donde está el dinero. Se publican **desde el principio** |

**Módulo estándar en todos los destinos:** "¿Cuándo viajar?" ("mejor época para viajar a X" es de las consultas más buscadas en todos los destinos medidos). No como enciclopedia del clima, sino resolviendo: *¿cuándo tiene sentido que vayas tú?*

Slugs en español sin acentos. Sin fechas en la URL. Antes de crear una página, comprobar que ninguna existente responde a esa intención.

---

## I. Estrategia SEO

**Secuencia obligatoria:** colas largas → grupos temáticos → autoridad → búsquedas grandes.

**Reglas:**
- Una intención, una URL. Variantes de días y de grupo, dentro de la página.
- Las páginas por cala o lugar concreto **solo si Search Console muestra impresiones reales**. Por defecto, páginas **por zona** con cada lugar como sección.
- Señales de experiencia visibles: fechas, fotos propias, criterio, "Sobre mí".
- Datos estructurados: Article, BreadcrumbList, FAQPage; TouristTrip o ItemList en itinerarios.
- Lighthouse ≥ 95. HTML estático. Imágenes optimizadas.

**Jerarquía de fuentes de datos:**
- **Keyword Planner = hipótesis** (volúmenes redondeados y agrupados; sobreestima: "alquiler camper islandia" marcaba 5.000 y Trends no ve el término).
- **Google Trends = tendencia y estacionalidad** (interés relativo, no volumen).
- **Search Console = comportamiento real.** Manda sobre las dos anteriores en cuanto haya datos.

**Aviso estructural:** el interés general medido en Google baja en casi todos los términos analizados desde 2023. Depender solo de Google es un riesgo; de ahí el peso de Pinterest, redes y correo.

---

## J. Destinos iniciales

| Destino | Papel | Por qué | Cuándo publicar |
|---|---|---|---|
| **Mallorca** | Laboratorio SEO | 8 años viviendo allí; universo de colas largas; alta intención comercial; estacionalidad predecible | **Oct-dic** (la curva sube en abril y explota en jul) |
| **Roma** | Escaparate de producto | Máxima demanda pero SERP durísima; se busca todo el año | **Nov**, antes del pico de ene-mar |
| **Tailandia** | Contrapeso de tráfico y autoridad | Experiencia real; ventana de planificación sep y ene-mar | **Oct** |
| **Islandia** | Cuarto pilar | Experiencia real, pero demanda menor y en descenso (-50% desde 2022) | **Nov-dic**, para el pico de enero |

**Después:** Budapest, Oporto y Malta, que son las búsquedas que más suben desde Sevilla (+80%, +60%, +70%).

**Primeras páginas por bloque** (orden indicativo, sujeto al ritmo real):
1. Mallorca: alquilar coche (+ colas largas: aeropuerto, Palma, sin franquicia) · calas por zona · Mallorca en 3/5 días · dónde alojarse
2. Roma: Roma en 3/4 días · dónde alojarse en Roma · cuánto cuesta un viaje a Roma · satélites (Museos Vaticanos, Trastevere, Roma gratis)
3. Tailandia: Tailandia en 10/15 días · mejor época · cuánto cuesta · seguro de viaje
4. Islandia: Islandia en 7/10 días (variante camper dentro) · cuánto cuesta · qué necesito · alquiler de camper

---

## K. Modelo editorial

**Flujo de producción:**
```
Investigación automática (motor + APIs)
 → Borrador automático con huecos marcados como PENDIENTE
 → Aportación humana (60-90 min): criterio, comida, presupuesto real, errores, fotos
 → Verificación (máx. 5 datos comprobables por guía) y sellado con fecha
 → Publicación: web, PDF, mapa, KML, piezas sociales
 → Mantenimiento: aviso a los 12 meses; precios de temporada, antes de cada temporada
```

**Estándar de verificación:**

| Estado | Qué significa |
|---|---|
| Vivido | Estuvimos allí, con mes y año |
| Comprobado | Dato contrastado en fuente oficial, con fecha |
| Estimado | Cálculo propio a partir de precios consultados, con fecha |

**Máximo inicial de 5 verificaciones manuales prioritarias por guía** (entradas principales, transporte clave, alojamiento de referencia, actividad estrella, requisitos de entrada). El resto de datos sensibles deben conservar fuente y fecha cuando corresponda, pero no requieren comprobación manual en cada publicación.

**Fecha de comprobación del dato y fecha de revisión del contenido son conceptos independientes y se almacenan por separado.** `data_verified_at` pertenece al dato individual; `content_reviewed_at` pertenece a la página o guía completa. Una página puede revisarse hoy y contener un precio comprobado hace tres meses: son fechas distintas con significados distintos. Esto permitirá en el futuro detectar automáticamente datos que necesitan nueva comprobación sin revisar toda la guía.

**Presupuesto:** siempre estructurado por conceptos, con base de cálculo explícita, qué incluye y qué no, fecha, y distinción entre gasto real y estimación.

**Proporción primer año:** al menos 3 de cada 4 contenidos de destino publicados en V1 y V2 basados en experiencia real. "Contenido de destino" son guías de itinerario y artículos satélite; no aplica a páginas transversales (seguros, equipaje, vuelos). Las guías editoriales llevan etiqueta explícita y deben cumplir el estándar de fuentes contrastadas. Esta regla es editorial, no una validación automática del sistema.

**Prohibido:** publicar sobre destinos sin haber estado sin etiquetarlo, copiar o incrustar contenido de terceros, imágenes generadas por IA, detalles sensoriales inventados.

---

## L. Monetización

### Dos productos, no uno

**Producto A — La plataforma editorial (gratuita).**
Canal de adquisición, no el negocio. Guías completas, itinerarios, presupuestos, mapas. Todo gratis, sin registro ni muros de pago. Monetiza vía afiliación contextual.

**Producto B — Mi viaje (de pago, fase 2).**
El mismo contenido convertido en un kit de ejecución del viaje. El PDF, el mapa, el presupuesto y el checklist son salidas del producto, no el producto en sí. El producto es el viaje estructurado y ejecutable.

### Escalera de activación

| Fase | Palanca | Cuándo |
|---|---|---|
| 1 | **Afiliación contextual**: tours (~8%), alojamiento (~4%), seguros, alquiler de coche y camper, eSIM | Desde el día 1 |
| 2 | **Newsletter + canal de ofertas** (Telegram) — activo propio | Desde el día 1; canal antes de enero |
| 3 | **"Mi viaje" — primer producto de pago**, precio orientativo 5-15 € (a validar con el producto terminado) | Cuando existan señales de demanda: clics de afiliado, descargas de mapa, uso de "Adapta este viaje", solicitudes directas, lista de espera |
| 4 | **Packs de mapas** (modelo Salt in our Hair) | Fase 2, si los datos lo validan |
| 5 | **Suscripción** acceso múltiple | Solo con catálogo + audiencia establecida |
| 6 | Patrocinios, marketplaces | Año 2 |

**El primer producto no es una enciclopedia.** Es una sola ruta concreta (Roma 3 días, por ejemplo) a precio de validación. Se escala cuando haya testimonios y señales de demanda.

**Referentes de precio contrastados:** Ire de Viaje desde 3,99 €, Spain Seeker desde 5,99 €, Comiviajeros China 14,99 €. El precio depende de la profundidad, no del número de páginas.

**Reglas de afiliación:** enlace donde el lector ya decidió que lo necesita; aviso visible; sin banners; registro central en `affiliates.yaml` con redirección `/ir/{id}`.

**Páginas que más pagan (validadas):** alquilar coche en Mallorca (pujas de 1,00-3,26 €), dónde alojarse en Roma, seguro de viaje Tailandia (0,85-2,80 €), alquiler de camper en Islandia.

**Pendiente:** consulta fiscal antes de los primeros ingresos.

---

## M. Distribución

| Canal | Papel | Formato |
|---|---|---|
| **SEO** | Motor a medio plazo | Colas largas primero |
| **Pinterest** | Tráfico a largo plazo, respuesta rápida | 4-6 pines distintos por guía, espaciados; palabras clave en imagen, título, descripción y tablero |
| **Instagram y TikTok** | Descubrimiento | Reels de ruta animada (formato firma), carruseles de itinerario, listas, presupuesto |
| **Telegram (submarca del sur)** | Adquisición | Ofertas desde Sevilla, Málaga y Jerez, enlazando a la guía del destino |
| **Correo** | Activo propio, no depende de algoritmos | "Adapta este viaje a ti" (doble confirmación) + newsletter semanal |

Todo el contenido social se genera desde el fichero de guía y pasa por cola de revisión. Solo contenido propio, sin marcas de agua de otras plataformas. Detalle en `docs/redes.md`.

---

## M2. Benchmarking y competencia (1.4)

**Spain Seeker** es el referente más cercano en posicionamiento. Opera en inglés y parcialmente en español con guías de España. Su propuesta: "Real editorial judgment — not endless lists. Structured plans so the trip actually works." Precio: desde 5,99 € (3 días) hasta 9,99 € (7 días). **El hueco no es que el espacio esté vacío; es que nadie combina en español experiencia real + verificación fechada + criterio editorial + adaptación + ejecución.**

**Comiviajeros** valida el mercado de pago en español: acaba de lanzar su guía de China a 14,99 € con compradores reales. Su narrativa de venta es la más cercana a la nuestra: "El problema no es encontrar información. Es saber qué hacer con ella." No copiar el modelo (destino complejo, guía de 150 páginas); sí copiar la estructura narrativa de la página de venta.

**Tabla de referentes:**

| Referente | Gratis | Producto de pago | Precio | Lo que adoptamos |
|---|---|---|---|---|
| Spain Seeker | Itinerarios web | Guías con criterio y orden | 5,99-9,99 € | Posicionamiento editorial como producto |
| Comiviajeros | Blog completo | PDF estructurado + planner + checklists | 14,99 € | Narrativa de venta · distinción blog vs. guía |
| Ire de Viaje | Versión gratuita de cada guía | Guía premium ejecutable | 3,99 €+ | Probar antes de comprar |
| Salt in our Hair | Contenido web | Packs de mapas + ebooks | ~10-15 $ | Packs de mapas como producto ligero (fase 2) |
| Earth Trekkers | Todo gratis | Solo afiliación | — | La estructura de contenido, no el modelo |

**Lo que NO copiamos:** destinos complejos como primer producto; suscripción sin catálogo; guías genéricas de 60-100 páginas; depender 100% de redes sin web propia; construir planificador antes de validar.

---

## N. Métricas y criterios de éxito y fracaso

**Expectativas por canal (horizontes, no garantías):**

| Canal | Primeras señales |
|---|---|
| Pinterest, redes, Telegram | Semanas |
| Search Console (impresiones) | 1-3 meses |
| Colas largas (Mallorca, Islandia, Tailandia) | 3-6 meses |
| Búsquedas medias | 6-12 meses |
| Qué ver en Roma, alquilar coche en Mallorca | 12+ meses |

**Aviso estacional:** Mallorca se publica en otoño pero su tráfico no llega hasta abril. Roma y Tailandia se publican en paralelo precisamente para tener señales durante esa espera.

**Métricas del embudo:** visitas → altas en newsletter (1,5-3%) → apertura (>35%) → clics de afiliado → ventas.

**Experimento de variantes**, cuatro niveles: exposición → interacción → consumo → conversión. **No se decide nada hasta 500 sesiones en páginas con selector o hasta la fecha límite fijada.** Se compara la conversión de quien usa la variante frente a quien no; un 12% de uso que convierte el triple es mejor señal que un 30% que no convierte.

**Criterio de fracaso (mes 6):** si las páginas de Mallorca no acumulan impresiones crecientes en Search Console ni han entrado en el top 30 de ninguna cola larga, el problema no es el tiempo: es el enfoque, y se revisa.

---

## O. Roadmap por fases

**Fase 0 — Preparación (manual):** prueba del nombre con 10 personas · dominios · usuarios en redes · tableros de Pinterest · altas de afiliados · Search Console · elegir MailerLite o Brevo.

**Fase 1 — Base técnica (semanas 1-6):** arquitectura, sistema de diseño, componentes, esquema de guía, una guía de ejemplo completa. Sin publicar aún a ritmo.

**Fase 2 — Primeros contenidos (meses 2-3):** 2 guías + 2-3 satélites al mes, según el calendario de J. En paralelo, piezas sociales y primeros pines.

**Fase 3 — Automatización (meses 3-4):** motor (borrador, personalización, PDF), n8n, formulario "Adapta este viaje", newsletter, generador de piezas sociales, canal de Telegram antes de enero.

**Fase 4 — Medir y decidir (meses 4-6):** Search Console manda. Revisión del mes 6 con los criterios de N. Análisis de los datos de "Adapta este viaje": ¿qué variables selecciona la gente? ¿qué destinos piden más adaptación?

**Fase 5 — Producto de pago (cuando haya señales de demanda):** "Mi viaje" en formato PDF de pago para una sola ruta. Precio a validar (orientativo 5-15 €). Primeros testimonios. Escalar solo si convierte.

**Fase 6 — Catálogo y suscripción (año 2):** varios destinos, acceso múltiple, posible suscripción. Solo con audiencia y catálogo establecidos.

**Fase 7 — Planificador (cuando los datos lo justifiquen):** constructor de ruta basado en los patrones reales detectados en "Adapta este viaje". No antes.

---

## P. Qué NO construir en la V1

- Cuentas de usuario, inicio de sesión, guardado en la nube.
- Personalización algorítmica de itinerarios o planificador de rutas.
- Reservas, pasarela de viajes, comparador de precios.
- Aplicación móvil.
- Buscador interno complejo, filtros avanzados, comparadores de destinos.
- Páginas separadas por variante de días o de grupo.
- Páginas individuales por cala o lugar sin datos de Search Console.
- Publicidad de banners.
- Contenido masivo: nada de decenas de páginas generadas sin revisión.
- Suscripción de acceso múltiple (solo con catálogo + audiencia establecida).
- Comunidad de viajeros o experiencias de usuarios.
- Producto de pago antes de tener señales de demanda.
- Un segundo pilar de producto (el proyecto de finanzas se mantiene aparte y aislado).

---

## Q. Principios que Claude Code debe respetar

1. **Este documento manda.** Si una petición contradice una decisión cerrada, avisar antes de implementarla.
2. **Móvil primero**, siempre. La mayoría del tráfico será móvil.
3. **Minimalismo y legibilidad** por encima de la exhibición técnica: si un elemento no ayuda a planificar el viaje, fuera.
4. **Un solo esquema de guía** como contrato entre el motor y la web. Si una guía no lo cumple, la web no compila.
5. **Nada de texto incrustado en los componentes**: todo sale del fichero de datos.
6. **Rendimiento antes que funcionalidades.** Lighthouse ≥ 95 es requisito, no aspiración.
7. **Trabajo por bloques, con revisión humana** al final de cada uno. No avanzar sin visto bueno.
8. **Preguntar** cuando una decisión dependa del gusto o de información no disponible; no suponerla.
9. **Aislamiento del servidor:** el proyecto de finanzas no se toca. Redes y volúmenes Docker separados, límites de recursos, copias de seguridad.
10. **Código y commits en inglés; todo el texto visible, en español.**
11. **Verificación y etiquetas no son opcionales:** el esquema exige fecha en los datos sensibles y estado (vivido / comprobado / estimado).
12. **Nada de contenido de relleno** en las páginas de ejemplo: datos verosímiles de destinos reales.

---

## R. Modelo de datos (1.6) — Referencia para Claude Code

> Detalle completo en `docs/1.6_modelo_datos.md` y `docs/1.6.4_json_islandia.md`.

### Principio rector

**El fichero de guía es la única fuente de verdad editorial. Web, PDF gratuito, mapa, email de adaptación y Mi viaje son outputs del mismo dato. Se escribe una vez; se usa en todos los outputs.**

### Regla transversal

> Los datos derivados se calculan. Las referencias se validan. Los datos sensibles se verifican individualmente.

### Jerarquía de entidades

```
GUÍA (type: itinerary | satellite | hub)
├── META · RESUMEN · CRITERIO · PRÁCTICO · FAQ
├── VARIANTE (intensivo | equilibrado | tranquilo)
│     └── DÍA
│           └── PARADA ──────────► LUGAR GLOBAL (place_id)
├── PRESUPUESTO (items con basis por_person | per_room | per_group)
├── ALOJAMIENTO · TRANSPORTE · CHECKLIST
└── ADAPTATION_NOTES (condiciones declarativas + texto editorial)

Fuera del fichero editorial:
RESPUESTA_ADAPTACION · COMPRA · AFILIADOS (registro central) · ANALÍTICA
```

### Convenciones de campo

| Nivel | Significado |
|---|---|
| **R** | Required: sin esto la guía no compila |
| **Rc** | Recommended: la guía funciona pero el sistema avisa |
| **O** | Optional: legítimo que no exista |
| **D** | Derived: calculado por el sistema; el autor nunca lo edita |
| **N/A** | No aplica para este type |

### Campos derivados (el autor nunca los escribe)

| Campo | Entidad | Cómo se calcula |
|---|---|---|
| `places` | GUÍA | `unique(place_id de todas las PARADAS de todas las VARIANTES)` |
| `n_stops_total` | VARIANTE | `count(PARADAS de todos los DÍAS)` |
| `budget.type` | PRESUPUESTO | `real` / `estimado` / `mixed` según items |
| `budget.verified_at` | PRESUPUESTO | Fecha más antigua entre todos los `item.verified_at` |
| `budget.total_approx` | PRESUPUESTO | `sum(items[].amount)` según basis de cada item |
| `budget_delta.total` | VARIANTE | `sum(delta.items[].amount)` |
| `summary.budget_per_person` | GUÍA | Derivado de `budget` dividido entre viajeros base |
| `RESPUESTA.converted_to_purchase` | RESPUESTA | `true` si existe COMPRA con ese `adaptation_id` |

### Cálculo de Mi viaje (motor)

```
para cada item de presupuesto:
  si basis = per_person:  coste = amount × n_travelers
  si basis = per_room:    coste = amount × ceil(n_travelers / travelers_per_room)
  si basis = per_group:   coste = amount

total_viaje     = sum(costes) + sum(budget_delta.items de la variante)
total_per_person = total_viaje / n_travelers
```

### Invariantes del modelo (restricciones de implementación, sin excepciones)

| ID | Invariante |
|---|---|
| I1 | Un LUGAR existe una sola vez globalmente. Ninguna guía lo copia. |
| I2 | Una PARADA nunca duplica datos intrínsecos de LUGAR (precio, horario, coords, URL oficial). |
| I3 | `places` es siempre derivado. |
| I4 | Los totales de presupuesto son siempre derivados. |
| I5 | Un `place_id` inexistente impide compilar. Error, no advertencia. |
| I6 | Un `affiliate_id` inexistente impide compilar. Error, no advertencia. |
| I7 | Los datos sensibles (precio, horario) tienen su propio `verified_at`. |
| I8 | `adaptation_notes` es contenido editorial. El motor solo aplica IDs, nunca genera el texto. |
| I9 | COMPRA almacena referencias, nunca contenido editorial. |
| I10 | El motor selecciona y calcula; nunca genera información factual. |
| I11 | El email del usuario pertenece al proveedor de email, nunca al modelo de producto. |
| I12 | Web, PDF, mapa y Mi viaje consumen la misma fuente editorial. |
| I13 | La base de cálculo del presupuesto (`basis`) se declara en cada item. El motor no asume `per_person` si no está explícito. |
| I14 | La experiencia propia solo puede derivarse de `visit_status: visited` en PARADA. Los `not_visited` pueden aparecer como planificación, descarte o criterio, nunca como experiencia propia. Los `unknown` no generan afirmaciones en primera persona hasta confirmar. |
| I15 | El estado de visita pertenece a PARADA, nunca a LUGAR. Un mismo lugar puede ser `visited` en una guía y `not_visited` en otra. |
| I16 | Los datos históricos del viaje no sobrescriben los datos actuales de LUGAR. Precio pagado en 2024 vive en PARADA; precio actual verificado vive en LUGAR con su propio `verified_at`. |

---

## Pendientes antes de arrancar

- [x] Prueba del nombre con 10 personas — **hecha.** Resultado: 5/6 leen "agencia o viaje organizado". Segunda prueba pendiente con el bloque completo (nombre + claim + subtítulo).
- [ ] Segunda prueba del nombre con el bloque completo. Criterio: 7/10 deben leer "guías para organizarme yo".
- [ ] Comprar `solohazlamaleta.com` y `.es`; reservar usuarios en redes (una vez aprobada la segunda prueba).
- [ ] Buscar la marca en OEPM y EUIPO.
- [ ] Altas en programas de afiliación (Booking, GetYourGuide, Civitatis, IATI, alquiler de camper Islandia/Mallorca, Travelpayouts).
- [ ] Elegir MailerLite o Brevo.
- [ ] Comprobar recursos del VPS y decidir si se comparte con finanzas.
- [ ] Consulta fiscal antes de los primeros ingresos.
- [ ] Definir paleta y tipografías (3 propuestas de Claude Code).
- [x] Modelo de datos 1.6 (entidades, campos, relaciones, invariantes, JSON conceptual) — **cerrado.** Ver `docs/1.6_modelo_datos.md` y `docs/1.6.4_json_islandia.md`.
- [x] Revisión de consistencia completa del Documento Maestro (1.0→1.6) — **revisada y cerrada.**
