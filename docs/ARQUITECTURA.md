# Arquitectura de información

Bloque 1. Pendiente de tu visto bueno antes de tocar código.

Referencias estudiadas: **japonismo.com** (arquitectura y SEO) y
**bucketlistly.blog** (tratamiento visual y de datos).

---

## Lo que aprendí de japonismo, y lo que no vale aquí

Lo que sí copiamos:

- **"Empieza aquí"** como puerta para quien llega sin saber por dónde empezar.
- **Dos niveles de destino** con un mapa como entrada alternativa.
- **Los "básicos" son páginas propias**, no párrafos repetidos dentro de cada
  guía. Este es el hallazgo importante: en japonismo, cada guía enlaza a
  seguro, transporte e internet, y esas páginas acumulan enlaces internos
  desde todo el sitio. Es lo que las hace rankear, y es exactamente donde vive
  la monetización sin resultar agresiva.
- **Enlazado denso** entre guías, destinos y básicos.

Lo que **no** se puede copiar tal cual: japonismo es un solo país, así que su
jerarquía es País → regiones → ciudades. Nosotros tenemos muchos destinos sin
relación entre sí. Nuestro segundo nivel no son regiones de un país: es el
propio destino.

De bucketlistly: tipografía grande, foto protagonista en cuadrícula, y los
datos de viaje tratados como contenido. Eso es Bloque 2, pero condiciona la
arquitectura en un punto: **las plantillas de listado tienen que estar
pensadas para foto**, aunque hoy no haya ninguna.

---

## 1. Mapa del sitio

```
/                                  Home
/empieza-aqui/                     Cómo usar el sitio y planificar
/destinos/                         Índice de destinos + mapa interactivo

/{destino}/                        Hub de destino
/{destino}/{slug-guia}/            Guía de itinerario
/{destino}/{slug-articulo}/        Artículo satélite

/basicos/                          Índice de básicos
/basicos/{tema}/                   Básico reutilizable

/print/{destino}/{slug}/           Imprimible (noindex) → PDF
/ir/{id}                           Redirección de afiliado (noindex, nofollow)
/ofertas/{slug}/                   Oferta temporal (noindex) — fase posterior

/sobre-mi/  /afiliacion/  /privacidad/  /aviso-legal/
```

Slugs en español sin acentos. Barra final siempre.

**Qué añado al esquema del brief §4 y por qué:**

| Ruta nueva | Por qué |
|---|---|
| `/empieza-aqui/` | Es la página que convierte a un visitante perdido en lector. En japonismo es el segundo ítem del menú, por delante del blog. |
| `/destinos/` | Sin un índice, cada hub queda huérfano y solo se llega por búsqueda. Además es donde vive el mapa. |
| `/basicos/` y `/basicos/{tema}/` | El patrón que sostiene el SEO y la monetización de japonismo. No estaba en el brief. |

---

## 2. Menú y pie

### Menú principal

Cinco entradas. Más agobia en móvil, y el sitio es de lectura.

```
Empieza aquí   ·   Destinos   ·   Guías   ·   Básicos   ·   Sobre mí
```

- **Empieza aquí** — página única.
- **Destinos** — desplegable con los destinos que existan, más "Ver todos"
  con el mapa. Mientras haya menos de cinco, enlace directo a `/destinos/`.
- **Guías** — listado de todas las guías de itinerario, filtrable por
  duración y por grupo.
- **Básicos** — desplegable con los seis temas.
- **Sobre mí** — en el menú, no solo en el pie. Es la prueba de autoría y
  sostiene la credibilidad de todo lo demás; enterrarla en el pie es
  desaprovecharla.

### Pie

Tres columnas en escritorio, apiladas en móvil:

```
Destinos          Básicos             El proyecto
─────────         ─────────           ─────────
(los que haya)    Vuelos desde el sur  Sobre mí
Ver todos         Seguro de viaje      Afiliación
                  Alquiler de coche    Privacidad
                  Presupuesto          Aviso legal
                  Viajar con mayores   Contacto
                  Qué llevar
```

---

## 3. Los básicos

Seis páginas, reutilizables entre destinos. Cada una se escribe una vez y la
enlazan todas las guías que la necesiten.

| Básico | Por qué existe | Monetiza |
|---|---|---|
| `/basicos/vuelos-desde-el-sur/` | SVQ, AGP, XRY y cómo llegar a MAD. **Nadie más lo cubre bien** y es tu público declarado. | Travelpayouts |
| `/basicos/seguro-de-viaje/` | Todo viajero lo busca una vez. | IATI |
| `/basicos/alquiler-de-coche/` | La mitad de tus rutas son en coche o camper. | Alquiladoras |
| `/basicos/presupuesto/` | Cómo calculamos el gasto y por qué publicamos cifras reales. Es una página de método, y refuerza la marca. | — |
| `/basicos/viajar-con-mayores/` | **Tu diferenciador nº 3.** Casi nadie lo hace bien: accesibilidad, ritmo, distancias, dónde sentarse. | — |
| `/basicos/que-llevar/` | Encaja con el nombre de la marca. Es la página que la gente comparte. | Afiliados de equipaje |

**Por qué son páginas y no texto repetido:** repetir el mismo párrafo sobre
seguros en veinte guías es contenido duplicado y no rankea. Una página que
recibe veinte enlaces internos, sí.

---

## 4. Modelo de enlazado interno

Todo automático, derivado del dato. Nada que mantener a mano, porque el
trabajo manual recurrente es un defecto en este proyecto.

```
Guía ──────────► Hub de su destino          (desde meta.destination)
Guía ──────────► Guías relacionadas          (desde related[])
Guía ──────────► Básicos que necesita        (desde basics[], campo nuevo)
Guía ──────────► /empieza-aqui/              (una vez, en la cabecera)

Hub  ──────────► Sus guías y satélites       (consulta por destino)
Hub  ──────────► Básicos del destino         (desde basics[] del hub)

Básico ────────► Guías que lo enlazan        (índice inverso, calculado)
Satélite ──────► Su guía principal           (desde parentGuide)
```

**El índice inverso es la pieza clave.** Cada básico lista automáticamente las
guías que lo mencionan: "Usamos este seguro en Islandia, Egipto y Tailandia".
Se calcula recorriendo las guías en el build, sin escribir un enlace a mano, y
es lo que da autoridad a las páginas que monetizan.

---

## 5. Colecciones de contenido

Aquí propongo un cambio sobre lo que hay.

**Hoy** existe una sola colección `guides` con `meta.type` a
`itinerary | satellite | hub`. Eso obliga a que un hub declare `days[]`,
`variants` y `groups`, que no tiene ni necesita.

**Propongo cuatro colecciones:**

| Colección | Qué es | Campos propios |
|---|---|---|
| `guides` | Itinerarios día a día | El esquema actual, sin `type` |
| `destinations` | Hubs de destino | Intro, mejor época, cómo llegar, `basics[]`, coordenadas para el mapa |
| `articles` | Satélites | Cuerpo, `parentGuide`, mapa opcional, FAQ |
| `basics` | Los seis básicos | Cuerpo, `affiliate`, a qué destinos aplica |

Ventajas: cada esquema valida lo suyo y el build sigue rompiéndose con datos
inválidos; las consultas son directas; y un hub deja de arrastrar campos que
no usa.

Coste: migrar la guía de Alsacia y ajustar la ruta `[destino]/[slug]`. Es
barato ahora, con una sola guía; caro dentro de veinte.

**Campo nuevo en el esquema de guía:** `basics: string[]`, con los básicos que
esa guía necesita. De ahí salen los enlaces contextuales y el índice inverso.

---

## 6. Sobre partir de una plantilla de Astro

**Recomendación: no.** Contras que pesan más que los pros:

- Ya tenemos base propia verificada: Lighthouse 100 en las cuatro categorías,
  arquitectura Sass por capas, esquema que rompe el build con datos inválidos
  y CI que lo comprueba. Adoptar una plantilla es tirar eso.
- AstroPaper, Dante y compañía son plantillas de **blog**: contenido en
  Markdown, sin esquema fuerte. Nuestro contenido son ficheros de datos
  validados. Es un modelo distinto.
- Una plantilla trae decisiones de diseño de otro y dependencias que no
  elegimos, y el proyecto tiene que sostenerse con seis horas semanales.

A favor tendría llegar antes a algo bonito. Pero ya estamos más allá de ese
punto.

---

## Enmiendas acordadas

### Datos reales para el sitio, verosímiles solo para maquetar — DECIDIDO

La guía de ejemplo es **Alsacia con datos reales**. Enseña el sistema
funcionando sobre contenido de verdad, que es más fuerte que cualquier
maqueta.

Los datos verosímiles siguen siendo útiles para revisar el diseño: hacen falta
guías con presupuesto, comida, FAQ y alojamiento rellenos para ver esas
secciones, y Alsacia todavía no los tiene. Pero un fichero inventado dentro de
`src/content/guides/` es una guía publicable a un descuido de distancia.

**Solución: viven fuera de la colección de contenido.**

```
src/fixtures/*.json        Datos verosímiles, nunca son contenido
/_muestra/                 Página de revisión de diseño, noindex
```

No los carga Content Collections, así que **no pueden generar una página de
guía ni entrar en el sitemap aunque alguien se equivoque**. La separación es
estructural, no una convención que haya que recordar. La página `/_muestra/`
sirve además de escaparate del sistema de diseño para el Bloque 2.

### Formulario "Adapta este viaje a ti" — SE INTEGRA

Se construye e integra en la plantilla de guía.

Aviso que no cambia la decisión pero condiciona el lanzamiento: **no puede
recoger un solo correo hasta que `privacidad` y `aviso-legal` lleven tus datos
identificativos reales**. Hasta entonces se monta completo pero con el envío
desactivado y un aviso visible en desarrollo. Es requisito legal, no una
preferencia.

### Mapa interactivo — PENDIENTE DE TU DECISIÓN

Leaflet o MapLibre con teselas son del orden de 150 KB de JavaScript en la
página que más importa, y el propio encargo exige Lighthouse ≥ 95 en las
cuatro categorías. Las dos cosas tiran en direcciones opuestas.

Opciones:

1. **Mapa interactivo solo en `/destinos/`**, y en las guías el enlace a
   Google Maps que ya funciona. Protege el rendimiento donde importa.
2. **Mapa interactivo también en la guía**, cargado con `client:visible` y
   solo al hacer clic sobre una imagen estática. Se puede llegar a 95, pero
   hay que cuidarlo.
3. **Mapa en ambos sitios sin restricciones.** Es lo que pide el brief §6, y
   costará rendimiento.
