# Repaso antes del despliegue — 2026-10-21

Revisión de todo lo que tiene que estar bien el día que se publique la web en
Cloudflare Pages (salida A de `docs/DESPLIEGUE.md`: PR de `develop` a `main`,
se despliega `main`). **No cambia nada de la web**: solo este documento.

Base revisada: `origin/develop` en `b288e69`. `npm ci`, `npm run build`
(7 páginas, CSP para 7) y `npm test` (295/295) en verde.

Cómo se ha probado, además de leer `dist/`:

- **`wrangler pages dev`** (wrangler 4, el mismo motor de rutas y cabeceras que
  Pages) sobre dos builds: el de `develop` y el de una **mezcla local de las
  cuatro PR** (#26 + #35 + #31 + #45, conflictos resueltos a mano solo para la
  prueba; ver bloque 5).
- **Chromium (Playwright)** contra esos servidores, mirando la consola: ningún
  error de Content-Security-Policy en ninguna página.
- La documentación oficial de Cloudflare (`headers`, `redirects`,
  `serving-pages`) leída desde su fuente, el repo `cloudflare/cloudflare-docs`
  (rama `production`), porque `developers.cloudflare.com` no resuelve desde la
  sesión. Lista de HSTS precargada de Chromium para `.dev`.

**Actualización del 22 de octubre.** Desde este repaso, `develop` avanzó a
`4bad0f1`: entró **#31** (portada, con la #69) y una página `/buscar/`, que
lleva `noindex` y está fuera del sitemap (`astro.config.mjs`). **#26, #35 y #45
siguen sin mezclar** y `develop` sigue sin `404.html`, así que lo grave de abajo
sigue en pie. El conflicto de #45 ahora es con `develop` (`git merge-tree
origin/develop origin/feature/404-v2` choca). El resto del documento describe
`b288e69` y no se ha vuelto a probar.

---

## Grave: arriba del todo

**Con `develop` tal cual, cualquier URL que no existe devuelve la portada con
200.** No hay `dist/404.html`, y Cloudflare Pages, si no hay `404.html` en la
raíz, trata el proyecto como una SPA y sirve `/` para toda ruta desconocida
(`serving-pages.mdx`, «Single-page application (SPA) rendering»). Probado con
wrangler:

| Petición (build de `develop`) | Respuesta |
|---|---|
| `/no-existe/` | **200**, título de la portada, sin CSP |
| `/ir/booking-inexistente/` | **200**, la portada (con `X-Robots-Tag: noindex`) |
| `/islandia` (el hub aún no existe) | **200**, la portada |

Efecto: «soft 404» para Google, enlaces rotos que parecen funcionar, un id de
afiliado mal escrito que manda a la portada sin avisar. **La PR #45 lo arregla**
(con ella, las tres dan **404** con la página propia y `noindex`). Conclusión:
**#45 tiene que entrar antes del PR `develop` → `main`.**

Lo demás que se pedía vigilar está bien: **ninguna página de afiliado
indexable** (hoy no se genera ninguna, y `/ir/*` lleva `X-Robots-Tag`, meta
`noindex` y `Disallow`), **ningún borrador en el sitemap** (tampoco el hub tras
#26) y **la CSP no rompe nada** (consola limpia en todas las páginas, también
con las islas Vue de la guía de Islandia).

---

## 1. Indexación

| Punto | Estado | Prueba |
|---|---|---|
| `robots.txt`: `Allow: /`, `Disallow` de `/print/`, `/ir/`, `/ofertas/`, `Sitemap:` absoluto | listo | `cat dist/robots.txt` |
| `Sitemap:` apunta a `https://solohazlamaleta.com/sitemap-index.xml` (dominio escrito a mano) | revisar | Correcto si el dominio es ese. Si cambia, tocar también `public/robots.txt` (lo dice DESPLIEGUE §3) |
| `sitemap-index.xml` → `sitemap-0.xml` | listo | `cat dist/sitemap-index.xml` |
| Sitemap de `develop`: portada, `/afiliacion/`, `/aviso-legal/`, `/privacidad/`, `/sobre-mi/` | listo | `grep -o '<loc>[^<]*' dist/sitemap-0.xml` — coincide con DESPLIEGUE §4.1 |
| Borradores fuera del sitemap (`/alsacia/ruta-pueblos-y-vinos/` draft, `/islandia/islandia-en-camper-13-dias/` `reviewed`) | listo | `astro.config.mjs` (`excludedPaths` sale del mismo estado que el `noindex`); `tests/config/sitemap.test.ts` |
| `/ir/`, `/print/`, `/ofertas/` fuera del sitemap | listo | `sitemapFilter` en `astro.config.mjs` |
| Legales en el sitemap (`/aviso-legal/`, `/privacidad/`, `/afiliacion/`) | revisar | Indexables y en el sitemap. No hace daño; es una decisión del autor si quiere quitarlos (no es necesario para desplegar) |
| `noindex, nofollow` en los dos borradores | listo | `grep -o '<meta name="robots"[^>]*>' dist/*/*/index.html` |
| Páginas publicables sin `noindex` (portada, legales, sobre mí) | listo | Script de metadatos (ver «Comandos») |
| Canónica absoluta, con barra final, en las 7 páginas | listo | `grep -o '<link rel="canonical"[^>]*>' dist/**/index.html` |
| Enlaces internos con barra final | listo | Ningún `href="/…"` sin barra en `dist/` (salvo ficheros) |
| Canónicas, `og:url` y `og:image` apuntan a `solohazlamaleta.com` aunque se sirva en `pages.dev` | revisar | Mientras el dominio no exista, la portada y legales son indexables en `pages.dev` con canónica a un dominio que no responde, y las vistas previas de enlaces no tienen imagen. Hoy no importa (nada que posicionar); deja de pasar al activar el dominio |
| `pages.dev` de producción indexable una vez haya dominio | falta (después) | DESPLIEGUE §3 «Tarea para después»: regla `https://:project.pages.dev/*` con `X-Robots-Tag: noindex` en `public/_headers`. **Solo cuando el dominio esté activo**, o la web entera quedaría `noindex` |
| `/ir/` con `Disallow` y `noindex` a la vez | listo | Google no rastrea `/ir/` y no verá el `noindex`, pero los enlaces llevan `nofollow` y no hay enlaces externos: suficiente |

## 2. Cabeceras (`dist/_headers`)

| Punto | Estado | Prueba |
|---|---|---|
| `public/_headers` ya está en `develop` (DESPLIEGUE §4.2 dice que no) | revisar | `git log origin/develop -- public/_headers`. El texto de DESPLIEGUE §4.2 está desfasado: la comprobación vale ya el primer día |
| Base en `/*`: `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `COOP`, `Permissions-Policy` | listo | `curl -I` contra wrangler: presentes en todas las respuestas |
| Una regla de CSP por página, con hashes del HTML real (7 en `develop`, 9 tras las PR) | listo | `grep -c Content-Security-Policy dist/_headers`; `scripts/write-headers.ts` |
| La CSP no bloquea nada | listo | Chromium sin errores en `/`, `/islandia/`, guía de Islandia, Alsacia, `/sobre-mi/`, `/afiliacion/` |
| Límites de Cloudflare: 100 reglas, 2.000 caracteres por línea | listo | Hoy 11 reglas (13 tras las PR); línea más larga 476 caracteres. `withPolicies` hace fallar el build si se pasa (`scripts/security-headers.ts`, `MAX_RULES`/`MAX_LINE`) |
| Cada página `/ir/{id}` sumará su propia regla de CSP | revisar | `write-headers.ts` genera una regla por HTML. Con ~85 enlaces de afiliado activos el build fallará por el límite de 100. Arreglo futuro: una sola regla `/ir/*` para la CSP de esas páginas (todas son iguales). No bloquea hoy: no hay socios activos |
| Cabeceras repetidas entre reglas (se unirían con coma) | listo | Cada cabecera la pone una sola regla; `X-Robots-Tag` solo en `/ir/*` |
| `/_astro/*`: `public, max-age=31536000, immutable` | listo | `curl -I localhost:8788/_astro/<fichero>.avif` |
| `/fonts/*`: `max-age=2592000` (sin hash en el nombre) | listo | `curl -I localhost:8788/fonts/nunito-latin-var.woff2` |
| HTML: `public, max-age=0, must-revalidate` (lo pone Pages) | listo | `curl -I localhost:8788/` |
| `/ir/*`: `X-Robots-Tag: noindex, nofollow` | listo | `curl -I localhost:8789/ir/booking-inexistente/` |
| La página 404 se sirve **sin CSP** | revisar | La regla generada es `/404.html`, pero Pages sirve el 404 en la URL pedida (`/no-existe/`), que no casa con ninguna regla. Además `/404.html` redirige 308 a `/404`, así que esa regla nunca se aplica. Riesgo bajo: la 404 no tiene scripts. No se puede arreglar por ruta (una CSP en `/*` se sumaría a las de cada página y las rompería) |
| `_headers` no se sirve como fichero | listo | `curl localhost:8788/_headers` no lo devuelve |
| HSTS en `*.pages.dev` | listo | Todo `.dev` está en la lista HSTS precargada de los navegadores (`"name": "dev", "mode": "force-https", "include_subdomains": true` en `transport_security_state_static.json` de Chromium) |
| HSTS en `solohazlamaleta.com` | falta (autor) | No está en `_headers` (correcto: se activa en el panel). Cloudflare → dominio → **SSL/TLS → Edge Certificates → HSTS**. Empezar con `max-age` corto y sin `preload`. Comprobar en pantalla |
| Node del build | falta (autor) | `npm run build` ejecuta `node scripts/write-headers.ts`. Node solo ejecuta `.ts` sin opciones desde la 22.18; el build v3 de Cloudflare trae 22.16 por defecto y no lee `engines`. **`NODE_VERSION=24` es obligatorio** (DESPLIEGUE §2.5). Si el log no muestra Node 24, el build fallará justo después de `astro build`. (`engines` dice `>=22.12.0`, que no es verdad para este script: arreglable en código) |

## 3. Rutas

| Punto | Estado | Prueba |
|---|---|---|
| 404 en `develop` | **falta** | No existe: modo SPA, todo devuelve la portada con 200 (ver «Grave») |
| 404 de la PR #45 | listo (al mezclar) | wrangler sobre la mezcla: `/no-existe/` → **404**, `Cache-Control: no-store`, título «Página no encontrada», `noindex, nofollow`, todas las rutas de assets absolutas (vale a cualquier profundidad) |
| `/404` responde 200 con la página 404 | revisar | Efecto de cómo Pages quita `.html`. Lleva `noindex` y no está en el sitemap: inofensivo |
| `/ir/{id}` existente | listo (sin uso) | `src/pages/ir/[id].astro`: meta refresh a 0 s, `noindex`, enlace con `rel="sponsored nofollow noopener"`. Hoy no se genera ninguno: todos los socios de `src/data/affiliates.json` tienen `active: false` |
| `/ir/{id}` inexistente | falta → listo con #45 | En `develop`: 200 con la portada. Con #45: 404 propio + `X-Robots-Tag: noindex` |
| Sin barra final → con barra | listo | Pages redirige solo: `/islandia/islandia-en-camper-13-dias` → **308** a `…/`; `/islandia` → 308 a `/islandia/` (con el hub) |
| `/index.html`, `/sobre-mi/index.html` | listo | 308 a `/` y `/sobre-mi/` |
| `_redirects` | listo (no hace falta) | No existe y no se necesita: la barra final la resuelve Pages. Además `_redirects` **no admite redirecciones de dominio** (tabla «Domain-level redirects ❌» en `redirects.mdx`) |
| `www` → sin `www` | falta (autor) | No se puede en `_redirects`. Panel: añadir `www.solohazlamaleta.com` como dominio del proyecto y una **Redirect Rule** o **Bulk Redirect** 301 a `https://solohazlamaleta.com/` conservando ruta y query (DESPLIEGUE §3 paso 4) |
| `http` → `https` | falta (autor) | En `pages.dev` ya lo fuerza el navegador (HSTS de `.dev`). Para el dominio: **SSL/TLS → Edge Certificates → Always Use HTTPS** activado. Comprobar en pantalla |
| Enlaces de afiliado fuera de `/ir/` | listo | Los 83 enlaces externos de la guía de Islandia son Google Maps y webs oficiales (`rel="noopener"`), ninguno de afiliado |

## 4. Metadatos

| Punto | Estado | Prueba |
|---|---|---|
| `lang="es"` en todas las páginas | listo | Script de metadatos |
| `title` en todas | listo | Igual |
| Título de legales y sobre mí sin la marca («Afiliación», «Aviso legal», «Sobre mí») | revisar | En la pestaña y en Google salen solos. Añadir « — Solo Haz la Maleta» como la 404. Arreglable en código |
| `description` en todas | listo | Longitudes: portada 139 (112 con #31), guías 126–143, hub 148 |
| Descripciones cortas en `/aviso-legal/` (47), `/sobre-mi/` (76), 404 (35) | revisar | No bloquea; mejorable |
| Open Graph (`og:title`, `og:description`, `og:type`, `og:url`) | listo | En todas; la guía de Islandia con `og:type=article` |
| `og:image` en portada, legales, Alsacia y 404 | falta | Solo la guía de Islandia (y el hub tras #26) llevan imagen. Compartir la portada da una tarjeta sin foto. Arreglable en código: imagen por defecto |
| Proporción de las imágenes OG | revisar | Guía 1200×1600 y hub 1200×1500 (vertical). Con `summary_large_image` las redes recortan a ~1,91:1. Mejor una versión 1200×630 |
| `og:image` con nombre con hash (`/_astro/…`) | listo | Cambia en cada build, pero siempre existe la del build servido |
| JSON-LD válido (se parsea) | listo | Guía: `BreadcrumbList`, `Article`, `FAQPage`. Hub (#26): `BreadcrumbList`, `FAQPage`. Portada (#31): `WebSite` |
| `Article` sin `author` ni `datePublished` | revisar | Google los recomienda. Tiene `dateModified` 2026-10-04 y `publisher`. Arreglable en código |
| Migas de la guía | listo con #35 | En `develop` van Inicio → guía; con #35, Inicio → Islandia → guía, enlazando el hub |
| JSON-LD en legales, sobre mí y Alsacia | revisar | No llevan. No es necesario |

## 5. Las PR que entran antes de desplegar

| PR | Qué cambia para el despliegue | Estado | Prueba |
|---|---|---|---|
| **#26** hub `/islandia/` (`feature/hub-islandia`) | Página nueva. `noindex, nofollow` **escrito a mano** en la página y `HUB_PATHS = ['/islandia/']` en `astro.config.mjs` para sacarlo del sitemap. Su CSP propia (un script con hash). `og:image` y JSON-LD | listo | Build de la rama: 8 páginas; hub fuera de `sitemap-0.xml`; `noindex` presente |
| … riesgo del `noindex` del hub | El día que se publique la guía, hay que quitar **dos** cosas a mano (la meta de la página y `HUB_PATHS`); si se quita solo una, el hub queda `noindex` en el sitemap o indexable fuera de él | revisar | `git diff origin/develop...origin/feature/hub-islandia -- astro.config.mjs`. Mejor derivarlo del estado, como las guías |
| **#35** guía → hub (`feature/guia-al-hub`) | Base `feature/hub-islandia`, no `develop`: tras mezclar #26 hay que cambiar su base a `develop`. Enlaza la miga «Islandia» al hub y mueve preguntas al hub | listo | Build de la rama: 8 páginas, CSP para 8; un `href="/islandia/"` en la guía |
| **#31** portada v2 (`feature/landing-v2`) | Cambia `index.astro`: añade JSON-LD `WebSite`, descripción nueva. Sin cambios en sitemap ni cabeceras | listo | Build de la rama: 7 páginas |
| **#45** 404 v2 (`feature/404-v2`) | Crea `dist/404.html` → **acaba con el modo SPA** (ver «Grave»). Excluye `/404/` del sitemap; añade la 404 a Lighthouse | listo, **imprescindible** | wrangler: `/no-existe/` → 404 |
| **#31 y #45 chocan** | Las dos tocan `src/pages/index.astro` (#45 lo pasa a `loadGuideList()`, #31 lo reescribe) y la línea `lighthouse` de `package.json` (también #26). **Conflicto** al mezclar la segunda | revisar | `git merge` de las cuatro en local: conflictos en esos dos ficheros. Para la prueba se tomó la portada de #31 y la unión de rutas de Lighthouse |
| Las cuatro juntas | 9 páginas, 13 reglas en `_headers`, sitemap igual que hoy (5 URLs, ni guías ni hub ni 404), CSP sin errores en consola | listo | Build de la mezcla + wrangler + Chromium |

---

## Lo que falta, por orden

### Puede hacerlo Claude (en ramas y PR, antes o después del despliegue)

1. **Mezclar #45 antes del PR `develop` → `main`.** Sin ella, toda URL inexistente
   da la portada con 200. Resolver al mezclar el conflicto con #31 en
   `src/pages/index.astro` y `package.json`.
2. **Orden de mezcla sugerido**, el que propone la PR #53 en `docs/BACKLOG.md`: #25 (solo
   documentación) → #26 → cambiar la base de #35 a `develop` y mezclarla →
   #31 → #45 (resolviendo el conflicto). Volver a pasar build, tests y
   Lighthouse tras cada una.
3. **Actualizar `docs/DESPLIEGUE.md`**: §4.2 ya no está pendiente
   (`_headers` está en `develop`), añadir la comprobación de la 404 en §4 y la
   lista del sitemap con el hub fuera.
4. **`og:image` por defecto** para portada, legales y Alsacia, y versiones
   1200×630 de las de guía y hub.
5. **Títulos con la marca** en legales y sobre mí; descripciones más largas en
   aviso legal y sobre mí.
6. **`author` y `datePublished` en el `Article`** de la guía.
7. **`engines` de `package.json`** a la versión que de verdad ejecuta el build
   (Node ≥ 22.18, o 24 como la CI).
8. Más adelante: **una sola regla de CSP para `/ir/*`** antes de activar
   muchos enlaces de afiliado (límite de 100 reglas); **derivar el `noindex`
   del hub de su estado**; y, **cuando el dominio esté activo**, la regla
   `https://:project.pages.dev/*` con `X-Robots-Tag: noindex`.

### Tiene que hacerlo el autor (panel de Cloudflare o dominio)

1. **`NODE_VERSION = 24`** en las variables del proyecto antes del primer build
   (DESPLIEGUE §2.5) y comprobar en el log que sale Node 24. Sin eso, el build
   falla en `write-headers.ts`.
2. **Mezclar el PR `develop` → `main`** cuando estén dentro #26, #35, #31 y #45
   (salida A).
3. Tras el primer despliegue, las comprobaciones de DESPLIEGUE §4, **más**:
   abrir `https://<proyecto>.pages.dev/no-existe/` y ver la página «Página no
   encontrada» (no la portada).
4. **El día del dominio:**
   - `solohazlamaleta.com` y `www.solohazlamaleta.com` en **Custom domains**.
   - Redirección 301 de `www` a sin `www` (**Redirect Rules** o **Bulk
     Redirects**): no se puede hacer desde `_redirects`.
   - **Always Use HTTPS** activado.
   - **HSTS** en SSL/TLS → Edge Certificates, empezando con `max-age` corto y
     sin `preload`.
   - Avisar a Claude para la regla `noindex` de `pages.dev`.
5. Decidir si los legales (`/aviso-legal/`, `/privacidad/`, `/afiliacion/`)
   siguen en el sitemap (hoy sí; vale tal cual).

---

## Comandos usados

```bash
npm ci && npm run build && npm test
grep -o '<loc>[^<]*' dist/sitemap-0.xml
grep -E '^/' dist/_headers                 # reglas de _headers
# Metadatos de cada página (title, description, canonical, robots, OG, JSON-LD):
# un script de Node de un solo uso que lee dist/**/index.html
# Rutas y cabeceras como en Cloudflare Pages:
npx wrangler@4 pages dev dist --port 8788
curl -sD - -o /dev/null http://localhost:8788/no-existe/
# Mezcla local de las PR, solo para la prueba (no se ha subido):
git worktree add --detach ../wt-all origin/feature/guia-al-hub
git -C ../wt-all merge origin/feature/landing-v2
git -C ../wt-all merge origin/feature/404-v2   # conflicto en index.astro y package.json
```
