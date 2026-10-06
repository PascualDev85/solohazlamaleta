# Backlog

Tareas pequeñas, cada una abarcable en una sesión corta. Ordenadas por lo que
desbloquea antes. Marca la casilla al cerrarlas.

Las que llevan **(tuya)** dependen de ti y nadie más puede hacerlas.

---

## Bloquea la automatización — urgente

- [ ] **(tuya) Mergear el PR #2 a `develop`.** Las notas de viaje viven en
      `docs/fuentes/`, que solo existe en esa rama. La rutina que estructura
      guías trabaja sobre `develop`, así que el 23 de septiembre se ejecutó,
      no encontró las notas y se paró sin hacer nada — correctamente, porque
      se negó a inventar. Hasta que ese PR entre en `develop`, la rutina
      seguirá sin poder trabajar. Vuelve a dispararse los miércoles.

## Bloquean la publicación

- [ ] **(tuya)** Rellenar Alsacia con lo que viviste → ver
      [PENDIENTE-ALSACIA.md](PENDIENTE-ALSACIA.md). Sin esto la guía no sale
      de borrador.
- [ ] **(tuya)** Confirmar el año del viaje. Ahora consta `2025-12` en
      `meta.tripDone.date` porque lo asumí yo.
- [ ] **(tuya)** Datos identificativos en `privacidad` y `aviso-legal`.
      Obligatorio antes de recoger el primer correo.
- [ ] **(tuya)** Escribir `sobre-mi` en primera persona. Es la página que
      sostiene la credibilidad del proyecto entero.
- [ ] **(tuya)** Paleta, tipografía e icono de marca. Los colores actuales
      cumplen contraste pero son provisionales.
- [ ] **(tuya)** Fotos propias de Alsacia, verticales y horizontales.

## Web — pendientes de la auditoría de QA

- [ ] `.skip-link` usa `left: -9999px`. Cambiar al mixin `visually-hidden`
      que ya existe en `_mixins.scss`, para que las herramientas de auditoría
      no lo marquen como elemento fuera del viewport.
- [ ] Avisar de que el enlace de Google Maps abre en pestaña nueva. En móvil
      es lo que más desorienta.
- [ ] `<article class="guide">` no tiene reglas CSS propias. O se usa, o se
      quita del marcado.
- [ ] La ruta `/ir/{id}` nunca se ha ejecutado: todos los partners están
      inactivos, así que no genera ninguna página. **Está sin probar.**
      Activar un partner de prueba y verificar que sale
      `rel="sponsored nofollow"` y `noindex`.

## Web — funcionalidad

- [ ] Enlace a `/sobre-mi/` en la cabecera, no solo en el pie. La prueba de
      autoría debe estar por encima del pliegue.
- [ ] Descarga KML por guía, para importar en Google My Maps (§6).
- [ ] Página hub de destino (`/{destino}/`). Ahora mismo no existe y las
      guías cuelgan de una ruta sin índice.
- [ ] Enlazado interno automático hub ↔ guías ↔ relacionadas, generado desde
      el dato y no mantenido a mano.
- [ ] Datos estructurados `Article` y `BreadcrumbList` (§7). El `FAQPage` ya
      está y sí corresponde a contenido visible.
- [ ] Optimización de imágenes con `astro:assets` cuando haya fotos.

## Web — rendimiento (cuando la guía de Islandia esté completa)

Medido el 2026-10-06 en la rama `feature/checkpoint3-diseno-v4`: Lighthouse
móvil 100/100/100, LCP 1,9 s, CLS 0, 0 ms de bloqueo, 170 KB en 21
peticiones. Nada es urgente; se revisa con la página terminada, no antes.

- [ ] **Tamaño del DOM**: 2.022 elementos (Lighthouse avisa hacia 1.500).
      Crece porque cada día lleva en el HTML todas sus paradas y su panel
      "Ver día completo". Con 13 días va bien; medir de nuevo con todos los
      días rellenos (fotos, "Lo mejor del día") y aligerar si hace falta.
- [ ] **Fuentes**: 98 KB, casi el 60 % del peso. Recortarlas a los caracteres
      usados (subsetting) ahorraría unos 40–50 KB.
- [x] **CSS que bloquea el primer pintado** (2026-10-06): todo el CSS va
      incrustado en el HTML (`build.inlineStylesheets: 'always'` en
      `astro.config.mjs`). La guía pasó de 99 a 100 estable en móvil; LCP de
      las páginas pequeñas 1,2 → 1,1 s.

## Infraestructura

- [ ] Conectar Cloudflare Pages al repo y desplegar `develop` a un dominio de
      pruebas.
- [ ] **(tuya)** Registrar `solohazlamaleta.com`. `astro.config.mjs` ya lo da
      por hecho.
- [ ] Analítica sin cookies (Umami o Plausible).
- [ ] Alta en Search Console cuando haya dominio.

## Diseño

- [x] Dirección visual: tipografía editorial con Instrument Serif
      autoalojada (15 KB, precargada), itinerario como línea de tiempo,
      paleta verificada en claro y oscuro. Lighthouse sigue en 100.
- [ ] Revisar la dirección cuando existan fotos propias: la maqueta actual
      está pensada para sostenerse sin ellas.

## Contenido posterior

- [ ] Enmendar D6 en `DECISIONES.md`: decía Mallorca primero y vamos con
      Alsacia. Está justificado (es el viaje que puedes escribir ya), pero
      conviene dejarlo escrito en vez de saltárselo en silencio.
- [ ] Mallorca sigue siendo la mejor apuesta de posicionamiento: long tail,
      8 años de experiencia real, competencia desactualizada.

---

## Cómo trabajar esto

Gitflow: rama desde `develop`, PR contra `develop`. `main` y `develop` están
protegidas y exigen `build` y `lighthouse` en verde.

```bash
git checkout develop && git pull
git checkout -b feature/lo-que-sea
# ...
gh pr create --base develop
```

Los agentes están en `.claude/agents/`. Antes de mergear cualquier cosa que
toque páginas, pásala por `qa`.
