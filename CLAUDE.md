# Solo Haz la Maleta

Web de guías de viaje ya planificadas. Promesa: *"Yo planifico el viaje.
Tú solo haz la maleta."*

## Antes de trabajar, lee

1. **`docs/BRIEF.md`** — el proyecto completo. Documento original, no editar.
2. **`docs/DECISIONES.md`** — cambios acordados sobre el brief.
   **Donde contradiga al brief, manda DECISIONES.md.**

## Idioma

- Producto, contenido y conversación: **español**.
- Código, nombres de variables, commits y comentarios: **inglés**.

## Restricciones que mandan sobre todo lo demás

- **~6 h/semana del autor.** Si algo añade trabajo manual recurrente, no vale.
- **Coste mínimo.** VPS existente (~7 €/mes) + planes gratuitos. Solo pago por
  uso de APIs.
- **Calidad sobre volumen.** 30 guías buenas > 300 genéricas.

## Stack

- Web: **Astro** estático + islas **Vue** solo donde hay interactividad.
- Hosting: **Cloudflare Pages**.
- Contenido: ficheros de datos validados por esquema **Zod**. Si una guía no
  cumple el esquema, el build falla.
- Motor (fase posterior, repo aparte): FastAPI / Python 3.11.

## Fase actual

**F1 — Web base mínima.** Sin PDF, sin selector de grupo, sin mapa
(ver D1 en `docs/DECISIONES.md`).

Criterio de cierre: una guía de ejemplo se renderiza desde su fichero de datos ·
Lighthouse ≥ 95 · el build falla con una guía inválida.

## Reglas duras — no hacer

- No esconder las guías tras email ni pago. La guía web completa es gratis y
  sin pedir nada.
- No generar guías en masa sin revisión humana.
- No publicar, copiar ni incrustar reels o TikToks de terceros.
- No crear páginas duplicadas por variantes de días o de grupo: van dentro de
  la guía.
- No añadir banners de publicidad ni cookies de terceros.
- Enlaces de afiliado **solo en contexto**, y siempre vía `/ir/{id}` con
  `rel="sponsored nofollow"`.
- Todo dato sensible (precio, horario, norma, acceso) lleva fecha de
  verificación.

## Seguridad — regla de oro

El VPS aloja un proyecto de **finanzas personales con datos bancarios**.
Nada de este proyecto puede leer, tocar ni degradar finanzas. No mezclar redes,
volúmenes ni credenciales.

Aplica también a las sesiones de trabajo: `claude-mem` captura el resultado de
cada llamada a herramienta en una memoria **compartida entre proyectos**. No
abrir ficheros de finanzas desde este proyecto.

## Convenciones

- Slugs en español sin acentos: `/mallorca/calas-sin-gente/`.
- URLs siempre con barra final.
- `noindex` en `/print/`, `/ir/`, `/ofertas/`.
- Secretos en `.env`, nunca en el repo.
- Node ≥ 20.12 (el proyecto usa v24).

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción (falla si una guía es inválida)
npm run preview    # previsualizar el build
```
