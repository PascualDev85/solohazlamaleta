# Despliegue en Cloudflare Pages

Guía para publicar la web en una sesión de unos 30 minutos. En orden. Cada paso
lleva su tiempo estimado.

Lo que no he podido comprobar en la documentación oficial va marcado
**«comprobar en pantalla»**: el panel de Cloudflare cambia a menudo de nombres.

Fuentes al final. Todas consultadas el **2026-10-20**.

---

## 0. Antes de empezar (5 min)

### Qué necesitas

- Una **cuenta gratuita de Cloudflare** (dash.cloudflare.com). Si no la tienes,
  créala antes: no cuenta en los 30 minutos.
- **Acceso a GitHub** con permiso para dar acceso al repo
  `pascualdev85/solohazlamaleta`.
- El dominio `solohazlamaleta.com`, **solo si ya lo has registrado**. No hace
  falta para hoy: la web funciona en un subdominio `*.pages.dev`.

### Qué NO tienes que tocar

- **El VPS.** Nada de este despliegue vive ahí. Cloudflare compila y sirve la
  web en sus servidores. No hay que entrar por SSH, ni abrir puertos, ni copiar
  claves, ni instalar nada en el VPS. Así se cumple la regla de oro: finanzas ni
  se entera.
- **El código.** Este documento no pide cambiar nada del repo para el primer
  despliegue.

### Un aviso sobre `main`

Hoy `main` está casi vacío: solo tiene el brief y las decisiones (último commit
del 2026-09-22, sin `package.json`). La web entera está en `develop`. Si eliges
`main` como rama de producción tal cual, **el primer build de producción
fallará**.

Dos salidas. **Decidido el 20 de octubre de 2026: la A** (el autor deja la elección en la recomendada).

- **A (recomendada).** Abre en GitHub un PR de `develop` → `main` y mérgealo tú.
  Así producción ya tiene la web desde el primer día. Ojo: con `main` publicado
  la web se ve en `<proyecto>.pages.dev`, aunque nadie la conozca. Las guías
  siguen en borrador con `noindex`.
- **B.** Configura `develop` como rama de producción solo por ahora. Cuando
  mergees a `main`, la cambias (paso 2.7). Más simple hoy, un paso más después.

### Lo que el build necesita

- **Node 24** (lo que usa el proyecto, CLAUDE.md, y lo que usa la CI).
  Importante: el sistema de build v3 de Cloudflare trae **Node 22.16.0 por
  defecto** y **no lee** el campo `engines` de `package.json`. Hay que
  decírselo con una variable (paso 2.5).
- **Ninguna otra variable de entorno.** Lo he comprobado: `npm run build` en
  `develop` termina bien con el entorno vacío (7 páginas, ~1 minuto). El código
  no lee secretos ni claves en el build.

---

## 1. Conectar GitHub con Cloudflare Pages (5 min)

1. Entra en dash.cloudflare.com.
2. En el menú, ve a **Workers & Pages**.
3. Pulsa **Create application** → **Pages** → **Connect to Git**.
   - Comprobar en pantalla: Cloudflare puede enseñarte primero la opción de
     **Workers**. Busca la pestaña o el enlace de **Pages**: es la que queremos.
4. Elige **GitHub**. Se abre GitHub para autorizar a Cloudflare.
   - Recomendado: en GitHub, da acceso **solo** al repositorio
     `solohazlamaleta`, no a todos (comprobar en pantalla el texto exacto:
     «Only select repositories» o similar).
5. De vuelta en Cloudflare, selecciona el repo y pulsa
   **Install & Authorize** y luego **Begin setup**.

Lo que ves al final: la pantalla **Set up builds and deployments**.

---

## 2. Configurar el build (5 min)

En **Set up builds and deployments**, rellena:

| Campo | Valor |
|---|---|
| 2.1 **Project name** | `solohazlamaleta` (da el subdominio `solohazlamaleta.pages.dev`; si está cogido, Cloudflare te dirá otro) |
| 2.2 **Production branch** | `main` (salida A) o `develop` (salida B) |
| 2.3 **Framework preset** | `Astro` |
| 2.4 **Build command** | `npm run build` (el preset de Astro ya lo pone) |
| 2.4 **Build output directory** | `dist` (el preset de Astro ya lo pone) |
| **Root directory (advanced)** | déjalo vacío: el proyecto está en la raíz del repo |

2.5. Abre **Environment variables (optional)** y añade:

| Variable | Valor |
|---|---|
| `NODE_VERSION` | `24` |

- Comprobar en pantalla: la documentación dice que acepta «cualquier versión»,
  pero no aclara si basta con `24` o hay que dar una exacta. Si el log del
  build no muestra Node 24, pon una versión completa (por ejemplo, la que te
  dé `node -v` en tu ordenador si es una 24.x).
- Por qué importa: `npm run build` ejecuta scripts `.ts` con Node directamente
  (lo hará también `scripts/write-headers.ts` de la rama de cabeceras). Con el
  Node 22.16 por defecto eso puede fallar.

2.6. Pulsa **Save and Deploy**.

Lo que ves: el log del build en directo. Instala dependencias, ejecuta
`astro build` y sube `dist`. Debe terminar en unos minutos con una URL del tipo
`https://solohazlamaleta.pages.dev`. Pulsa **Continue to project**.

- Si el log tarda mucho en instalar y menciona descargar navegadores de
  Playwright, añade también `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` = `1` en
  **Settings** → **Environment variables** y vuelve a desplegar. Comprobar en
  pantalla: en local `npm ci` no descarga navegadores.
- Si es un error de DNS al abrir la URL justo después: espera unos minutos, es
  normal (lo dice la documentación).

### 2.7. Rama de vista previa: `develop` (3 min)

Por defecto, Cloudflare despliega **todas** las ramas que no son de producción
como vista previa, y cada PR del repo recibe su propia URL. Este repo tiene
muchas ramas, y el plan gratuito permite **500 builds al mes**. Mejor limitarlo:

1. En el proyecto: **Settings** → **Builds & deployments**.
2. En las ramas de vista previa (**Configure Preview deployments**, comprobar
   en pantalla el nombre exacto), elige **Custom branches**.
3. En **Include Preview branches**, escribe `develop`. Deja vacío el de
   excluir.
4. Guarda.

Resultado: `develop` tendrá siempre su versión en
`https://develop.solohazlamaleta.pages.dev` (alias de rama). Esas URLs de vista
previa llevan `X-Robots-Tag: noindex` automáticamente.

Si elegiste la salida B, el día que mergees a `main`: mismo sitio,
**Configure Production deployments**, cambia la rama a `main` y guarda.

Opcional: las vistas previas son **públicas** por defecto. Si quieres que solo
las veas tú: **Settings** → **General** → **Enable access policy**.

---

## 3. Dominio (5 min hoy, 15 min el día que lo registres)

### Mientras no tengas dominio

Usa `https://solohazlamaleta.pages.dev`. Funciona igual. No hay que cambiar
nada en el código.

Dos cosas que debes saber:

- El sitemap y `robots.txt` apuntan ya a `https://solohazlamaleta.com`, porque
  `astro.config.mjs` lo tiene en `site`. En `pages.dev` eso no rompe nada.
- La dirección de producción `*.pages.dev` **sí es indexable** (solo las vistas
  previas llevan `noindex` automático). Hoy da igual: las dos guías están en
  borrador con `noindex` y fuera del sitemap. Cuando tengas el dominio,
  conviene que `pages.dev` no compita con él: ver «Tarea para después».

### El día que registres `solohazlamaleta.com`

Para usar el dominio raíz (`solohazlamaleta.com`, sin `www`), Cloudflare exige
que el dominio sea una **zona de tu cuenta de Cloudflare**, es decir, que sus
**nameservers** apunten a Cloudflare.

1. Registra el dominio. Lo más sencillo: registrarlo en el propio Cloudflare
   (Registrar), porque ya queda como zona. Comprobar en pantalla el precio.
   Si lo registras en otro sitio, en Cloudflare añade el dominio como sitio
   (plan **Free**) y cambia los nameservers en tu registrador por los dos que
   te dé Cloudflare. El cambio puede tardar horas.
2. En **Workers & Pages** → tu proyecto → **Custom domains**.
3. Pulsa **Set up a domain**, escribe `solohazlamaleta.com` y **Continue**.
   Cloudflare crea el registro DNS solo.
4. Repite con `www.solohazlamaleta.com`. Comprobar en pantalla si te ofrece
   redirigir `www` al dominio raíz; si no, se hace con una regla de redirección
   (Bulk Redirects o Redirect Rules). El canónico es **sin `www`**, como
   `astro.config.mjs`.
5. Espera a que el dominio salga como **Active**. El certificado HTTPS es
   automático.

No añadas el registro CNAME a mano antes de hacer los pasos 2-3: la
documentación avisa de que entonces el dominio da error 522.

### Si el dominio acaba siendo otro

Cambia una sola línea en `astro.config.mjs`:

```js
site: 'https://el-otro-dominio.com',
```

Y la línea `Sitemap:` de `public/robots.txt`, que lleva el dominio escrito a
mano. Nada más. Hazlo en una rama y PR, como siempre.

### Tarea para después (no hoy)

Cuando el dominio esté activo, que `solohazlamaleta.pages.dev` no se indexe.
La documentación de Cloudflare da dos vías: redirigir `pages.dev` al dominio
con **Bulk Redirects**, o añadir en `public/_headers` una regla
`https://:project.pages.dev/*` con `X-Robots-Tag: noindex`. La segunda es un
cambio de código: que lo haga una rutina en su rama.

---

## 4. Qué comprobar justo después (7 min)

Hazlo contra la URL real (`pages.dev` o el dominio).

### 4.1. Borradores con `noindex` y fuera del sitemap (2 min)

Hoy (2026-10-22) hay dos guías sin publicar, y el hub va con su guía:

- `/alsacia/ruta-pueblos-y-vinos/` (borrador)
- `/islandia/islandia-en-camper-13-dias/` (estado `reviewed`, aún no
  `published`)
- `/islandia/`, el hub: `noindex` mientras ninguna guía suya esté publicada
  (`isHubPublished`)
- `/buscar/` y la 404 llevan `noindex` siempre

1. Abre cada una. Clic derecho → **Ver código fuente**. Busca (Ctrl+F)
   `noindex`. Debe aparecer `<meta name="robots" content="noindex, nofollow">`.
2. Abre `/sitemap-0.xml`. Deben salir solo: portada, `/afiliacion/`,
   `/aviso-legal/`, `/privacidad/` y `/sobre-mi/`. **Ninguna guía, ni el hub,
   ni `/buscar/`.** (Es lo que sale hoy en el build local.)
3. Abre `/robots.txt`. Debe bloquear `/print/`, `/ir/` y `/ofertas/`.

Si una guía en borrador aparece en el sitemap o sin `noindex`: no sigas,
vuelve a la versión anterior (paso 7) y avisa.

### 4.2. Cabeceras de `_headers` (3 min)

`public/_headers` está en `develop` desde el 20 de octubre (#43). El build le
añade la CSP de cada página (`scripts/write-headers.ts`, por eso hace falta
`NODE_VERSION = 24`).

1. Abre la web en Chrome. Pulsa F12 → pestaña **Network** (Red).
2. Recarga la página (F5). Pulsa en la primera fila (el documento HTML).
3. En **Headers** → **Response Headers**, deben salir, entre otras:
   - `x-content-type-options: nosniff`
   - `referrer-policy: strict-origin-when-cross-origin`
   - `x-frame-options: DENY`
   - `content-security-policy: default-src 'none'; …`
4. Pulsa un fichero de `/_astro/`: debe llevar
   `cache-control: public, max-age=31536000, immutable`.
5. Pestaña **Console**: no debe haber errores rojos de
   «Content Security Policy». Si los hay, algo de la página está bloqueado.

### 4.2 bis. La 404 (1 min)

Abre `/no-existe/`. Tiene que salir **«Te has salido del mapa»**, no la
portada. Si sale la portada, `404.html` no está en el despliegue y Cloudflare
ha entrado en modo SPA: cualquier URL inventada devolvería la portada con un
200. Prueba también `/ir/no-existe/`.

### 4.3. Lighthouse contra la URL real (2 min)

1. En Chrome, F12 → pestaña **Lighthouse**.
2. Marca **Mobile**, las cuatro categorías, y pulsa **Analyze page load**.
3. Repite con **Desktop**.
4. Hazlo en la portada y en las dos guías.

Objetivo: lo que exige la CI, 100 en todo (la guía de Islandia en móvil, ≥ 99).
El criterio de cierre de F1 es ≥ 95. Haz la prueba en una ventana de incógnito
y sin extensiones: las extensiones bajan la nota.

Normal en borradores: **SEO** marca «Page is blocked from indexing». Es el
`noindex` haciendo su trabajo.

---

## 5. Medir sin cookies, gratis (decidir: 5 min; instalar: otro día)

Lo que pide el 1.11 §9.5: analítica sin cookies, con **eventos** para los
clics a `/ir/`, la entrada desde satélites a la guía y el uso de «Adapta este
viaje».

| | Cloudflare Web Analytics | Umami Cloud (gratis) | Umami en tu servidor | Plausible |
|---|---|---|---|---|
| **Coste** | 0 € | 0 € (plan Hobby; comprobar límites en umami.is/pricing) | 0 € de licencia + servidor | Desde ~9 $/mes (no hay plan gratis en la nube); gratis solo si lo alojas tú |
| **Cookies** | No, según Cloudflare | No, según Umami | No | No, según Plausible |
| **Eventos personalizados (clics a `/ir/`)** | **No** («Not yet», FAQ oficial) | **Sí**: atributo `data-umami-event` en el enlace, sin escribir JavaScript | Sí, igual | Sí: clase `plausible-event-name=…` o clics salientes automáticos |
| **Mantenimiento para ti** | Ninguno: un botón | Casi ninguno | Alto: servidor, PostgreSQL, copias, actualizaciones | Ninguno en la nube; alto si lo alojas tú |
| **Encaje con el proyecto** | Solo visitas; no cumple §9.5 | Cumple §9.5 gratis | **Descartado**: el único servidor es el VPS de finanzas | Cumple §9.5, pero cuesta dinero cada mes |

Datos de la tabla:

- Cloudflare: gratis, sin cookies ni `localStorage` según su web; **no admite
  eventos personalizados**; guarda datos 6 meses. Hay una revisión externa
  (ctrl.blog) que dice que el script sí deja una cookie; comprobar en pantalla
  si te importa.
- Umami: «no cookies» en su repositorio oficial; el código del script lee el
  atributo `data-umami-event`. El plan gratis de la nube lo dan las webs de
  terceros como **100.000 eventos al mes**; el número de webs y la retención
  varían según la fuente. Comprobar en pantalla en umami.is/pricing.
- Plausible: eventos por clase CSS en su documentación oficial. Precio y
  ausencia de plan gratis, según webs de terceros (no he podido abrir
  plausible.io). Comprobar en pantalla.

### Recomendación: **Umami Cloud, plan gratuito**

Por qué:

- Es la única opción **gratis** que cumple §9.5: cuenta los clics a `/ir/`
  como eventos. Cloudflare Web Analytics no puede, y medir clics de afiliación
  es lo que decide qué páginas valen la pena.
- **Cero mantenimiento**: no hay servidor tuyo. Encaja con las 6 h/semana.
- **No toca el VPS.** Alojar Umami tú mismo obligaría a usar el VPS de
  finanzas: lo prohíbe la regla de oro.
- Si un día se queda corto, el siguiente paso es Plausible de pago, no un
  servidor propio.

Plan B, si quieres algo hoy mismo: activar Cloudflare Web Analytics
(**Metrics** → **Enable**) para ver visitas. Pero no da eventos, así que no
sustituye a Umami.

### Antes de instalar nada (aviso técnico, para la rutina que lo haga)

- **La CSP lo bloqueará.** La rama `feature/http-headers` genera una
  Content-Security-Policy estricta (`default-src 'none'`, scripts solo propios o
  por hash, sin `connect-src`). Cualquier analítica necesita que
  `scripts/security-headers.ts` permita su script y su dominio de envío.
  Cloudflare documenta exactamente qué añadir para el suyo
  (`script-src … https://static.cloudflareinsights.com/beacon.min.js` y
  `connect-src 'self'`). Para Umami: comprobar en su documentación el dominio
  del script y del envío.
- **El clic se mide en la guía, no en `/ir/`.** Las páginas `/ir/` redirigen
  al instante (`meta refresh` a 0 segundos), así que no da tiempo a contar la
  visita. El evento va en el enlace `<a href="/ir/…">` de la guía.
- **Lighthouse.** Un script de terceros puede bajar la nota. La CI exige 100:
  hay que comprobarlo en la rama antes de mergear.
- **Privacidad.** Actualizar `/privacidad/` diciendo qué herramienta se usa.

---

## 6. Search Console: el día que quites el primer `noindex`, no antes (15 min)

Hoy no hay nada que indexar: todas las guías están en borrador. Darte de alta
ahora solo te enseña un panel vacío.

El día que publiques la primera guía (estado `published`, sin `noindex`):

1. Ve a search.google.com/search-console y **añade una propiedad**.
2. Elige **Dominio** (no «Prefijo de URL») y escribe `solohazlamaleta.com`.
   Cubre `www`, sin `www`, `http` y `https` a la vez.
3. Google te da un registro **TXT**. Comprobar en pantalla: puede detectar que
   el DNS está en Cloudflare y ofrecerte hacerlo solo. Si no, en Cloudflare →
   tu dominio → **DNS** → **Records** → **Add record**: tipo `TXT`, nombre `@`,
   contenido el que te dé Google. Guarda.
4. Vuelve a Search Console y pulsa **Verificar**. Con Cloudflare suele ser
   inmediato; si falla, espera un rato y vuelve a pulsar (no edites el
   registro).
5. Menú **Sitemaps**: envía `https://solohazlamaleta.com/sitemap-index.xml`.
6. **Inspección de URLs**: pega la URL de la guía publicada y pulsa
   **Solicitar indexación**. Una vez, no hace falta repetir.

Después, nada más: el BRIEF da 1-3 meses para ver las primeras impresiones.

---

## 7. Si algo sale mal: volver a la versión anterior (2 min)

1. **Workers & Pages** → tu proyecto → **Deployments**.
2. En **All deployments**, busca la última versión que funcionaba.
3. Pulsa el menú de **tres puntos** de esa fila → **Rollback to this
   deployment** → confirma.

El cambio es **instantáneo**. Límites:

- Solo vale para despliegues **de producción** que se hayan construido bien.
  Las vistas previas no sirven como destino.
- Después puedes volver a una versión más nueva igual.
- El rollback no cambia el repo: el siguiente push a la rama de producción
  vuelve a desplegar. Arregla el fallo en una rama antes de mergear.

Si el build falla, no pasa nada en la web: sigue la versión anterior. Mira el
log en **Deployments** → el despliegue fallido → **View build** (comprobar en
pantalla el nombre del botón). Un fallo de esquema (guía inválida) sale ahí
igual que en la CI.

---

## Resumen de tiempos

| Paso | Tiempo |
|---|---|
| 0. Antes de empezar | 5 min |
| 1. Conectar GitHub | 5 min |
| 2. Configurar el build (+ ramas de vista previa) | 8 min |
| 3. Dominio (hoy solo `pages.dev`) | 1 min |
| 4. Comprobaciones | 7 min |
| 5. Elegir analítica | 5 min |
| **Total hoy** | **~31 min** |
| Más adelante: dominio | 15 min + espera de DNS |
| Más adelante: Search Console | 15 min |

---

## Fuentes (consultadas el 2026-10-20)

La web `developers.cloudflare.com` no se podía abrir desde la sesión donde se
escribió esto. Leí las mismas páginas desde su **fuente oficial**, el repositorio
`cloudflare/cloudflare-docs` (rama `production`), del que se genera esa web:

- Git integration (conectar, configurar, primer deploy):
  https://developers.cloudflare.com/pages/get-started/git-integration/
- Build image (Node 22.16.0 por defecto en v3, `NODE_VERSION`, no lee `engines`):
  https://developers.cloudflare.com/pages/configuration/build-image/
- Preset de Astro (`npm run build`, `dist`):
  https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
- Preview deployments (alias de rama, acceso):
  https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Branch deployment controls (**Custom branches**):
  https://developers.cloudflare.com/pages/configuration/branch-build-controls/
- Custom domains (zona obligatoria para el dominio raíz, error 522):
  https://developers.cloudflare.com/pages/configuration/custom-domains/
- Headers (`_headers`, límites, `X-Robots-Tag` en `pages.dev`):
  https://developers.cloudflare.com/pages/configuration/headers/
- Serving Pages (`noindex` automático en vistas previas):
  https://developers.cloudflare.com/pages/configuration/serving-pages/
- Rollbacks:
  https://developers.cloudflare.com/pages/configuration/rollbacks/
- Limits (500 builds/mes en Free):
  https://developers.cloudflare.com/pages/platform/limits/
- Web Analytics en Pages y FAQ (sin eventos, CSP, retención):
  https://developers.cloudflare.com/pages/how-to/web-analytics/ ·
  https://developers.cloudflare.com/web-analytics/faq/
- Cloudflare Web Analytics, «sin cookies»: https://www.cloudflare.com/web-analytics/
  (vía buscador) · crítica: https://www.ctrl.blog/entry/review-cloudflare-analytics/
- Umami (sin cookies, requisitos, `data-umami-event`):
  https://github.com/umami-software/umami (README y `src/tracker/index.ts`)
- Umami Cloud, plan gratis (fuentes de terceros, comprobar):
  https://canivibecodeit.com/umami-cloud ·
  https://digijaws.com/reviews/umami-review/
- Plausible, eventos personalizados:
  https://plausible.io/docs/custom-event-goals (desde `plausible/docs` en GitHub)
- Plausible, precios (fuentes de terceros, comprobar):
  https://seline.com/blog/plausible-analytics-pricing ·
  https://saaspricehub.io/questions/how-much-does-plausible-cost
- Search Console, propiedad de dominio por TXT (fuentes de terceros):
  https://www.jcchouinard.com/dns-domain-verification-in-google-search-console/ ·
  https://marketingsyrup.com/how-to-verify-domain-property-in-google-search-console-via-dns/
