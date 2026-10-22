# Recon: portada y buscador (Salt in our Hair + BucketListly)

Fecha: 2026-10-21. Alcance: **solo la portada y el buscador**, para un híbrido
en Solo Haz la Maleta (Astro estático, diseño v2). Se toman **estructura y
patrones de uso**; no se copian textos, fotos, código ni marca de ninguna de
las dos webs. Las capturas de referencia están en `replica/screens/`, fuera
de git (el repo es público) y nunca se publican.

## Fuentes

| Fuente | URL | Qué dio |
|---|---|---|
| Portada de Salt in our Hair | https://www.saltinourhair.com/ | Estructura, cabecera, buscador, secciones, pie, JSON-LD |
| Portada de BucketListly | https://www.bucketlistly.blog/ | Estructura y textos de secciones (lectura de la página). Sus capturas automáticas muestran una verificación de seguridad: no se ha intentado saltar |

## Pantallas

| ID | Pantalla | Cómo se llega | Para qué | Componentes | Estados vistos |
|---|---|---|---|---|---|
| S01 | Portada Salt | `/` | Inspirar y llevar a una guía | Cabecera transparente sobre foto, H1 + entradilla, buscador grande, chips "Trending", carrusel "Where we'd go right now", chips de países, selector de mes + mapa, tienda, "Hi, we're…" con cifras, destinos por región con nº de guías, pie con columnas | Móvil, escritorio, banner de cookies (315 socios) |
| S02 | Buscador Salt (panel) | Clic en el buscador de la portada o en la lupa de la cabecera | Encontrar destino o guía | Panel a pantalla completa, campo con borrar, resultados al instante en tarjetas (foto, país, título, subtítulo), contador "35 destinations & guides", filtros (región, mes, tipo de viaje, duración), cerrar | Escribiendo ("ice" → 35 resultados), móvil con "More filters" plegado |
| S03 | Portada BucketListly | `/` | Presentar al autor y sus guías | Barra superior con redes, nav con desplegables, "Plan a Trip", panel "Explore", hero con retrato + H1 + insignia "Based in…", vídeo, "Explore by Country" con nº de guías, bloque de cifras, vídeos, "As featured on", "Most popular", "Recent posts" (17, paginado), newsletter con regalo, pie con 4 columnas y modo oscuro | Solo lectura |

## Flujos

```
F01 Lector busca un destino desde la portada (Salt)
    S01 buscador -> S02 escribe "ice" -> ve 35 tarjetas al instante -> abre una guía
    clics: 1 (abrir) + teclear + 1 (resultado) = 2
    bordes: sin resultados, borrar búsqueda, cerrar con Escape, filtros
F02 Lector explora por país (ambas)
    S01/S03 tarjeta de país con nº de guías -> página del destino -> guía
F03 Lector conoce a los autores (ambas)
    bloque "Hola, somos…" con cifras -> Sobre nosotros
```

## Componentes repetidos

- **Tarjeta de destino/guía:** foto vertical, nombre encima en blanco, una línea de gancho o "N guías".
- **Chip:** país con bandera, mes, filtro.
- **Encabezado de sección:** antetítulo en mayúsculas y color ("HAND-PICKED BY US") + H2.
- **Bloque de cifras:** 3 números grandes con su etiqueta.
- **Buscador:** campo redondeado grande con botón; panel con resultados en rejilla.
- **Pie:** columnas de enlaces (guías por destino, sobre nosotros, legales, redes).

## SEO observado

- Salt: `<title>` con marca + promesa; H1 descriptivo ("Travel guides, itineraries & tips"); un H2 por sección; JSON-LD `WebPage`, `WebSite` con `SearchAction` (`?s=`), `Organization` y `Person` ×2 (los autores).
- BucketListly: `<title>` con marca + temas; H1 = frase del autor; H3 en cada tarjeta; paginación de entradas recientes.

## Qué no se clona (y por qué)

| Qué | Motivo |
|---|---|
| Fotos, textos, logotipos, iconos de bandera de las dos webs | Son suyos. Se usan las fotos del autor (`src/assets/guides/`) y huecos marcados "foto pendiente" |
| Tienda y precios | No hay producto de pago en la Fase 1 (BRIEF, fase 5) |
| Newsletter con regalo, barra de redes, "As featured on" | Fase 3; no hay prensa ni redes que mostrar; y nada de pedir el correo para dar contenido |
| Banner de cookies, publicidad | Regla dura: sin cookies de terceros ni banners |
| Filtros del buscador (región, mes, tipo, duración) | BRIEF §P excluye filtros avanzados en la V1; con el catálogo de hoy no aportan |
| Mapa del mundo del selector de mes | El mapa está prohibido hasta C3.5 con coordenadas confirmadas |
| Selector "dónde ir en [mes]" | No hay dato de temporada por destino en el modelo; con 1-2 destinos queda vacío. Para cuando haya catálogo |
| Vídeos | No hay vídeos propios |
| Modo oscuro | Fuera del alcance de la portada; afecta a todo el sitio |

## Tamaño

1 portada + 1 panel de búsqueda + pie. Sin datos nuevos en el modelo: todo sale
del motor (guías, destino, días, lugares, estado). Talla **S**.
Lo difícil: (1) el panel de búsqueda sin dependencias, sin `fetch` (CSP
`default-src 'none'`) y con bytes contados; (2) Lighthouse 100 con foto grande
arriba; (3) que nada prometa más de lo que hay (2 destinos, 1 guía completa).
