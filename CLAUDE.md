# Solo Haz la Maleta

Web de guías de viaje ya planificadas. Promesa: *"Nosotros hacemos el
trabajo difícil. Tú solo haz la maleta."*

## Antes de trabajar, lee

1. **`docs/BRIEF.md`** — el proyecto completo (documento maestro, versión 1.6).
   Contrato estratégico y funcional. Documento original, no editar salvo
   nueva validación.
2. Para decisiones técnicas, además:
   - `docs/1.5_producto_mi_viaje.md` — producto "Mi viaje"
   - `docs/1.6_modelo_datos.md` — modelo de datos e invariantes
   - `docs/1.6.4_json_islandia.md` — ejemplo JSON conceptual (Islandia)
   - `docs/1.7_arquitectura.md` — principios de arquitectura
   - `docs/1.7.1_repository_domain.md` — estructura del repo y límites de módulos
   - `docs/1.7.2_data_contract.md` — tipos exactos, esquemas Zod y reglas de compilación
   - `docs/redes.md` — estrategia de redes sociales

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
(ver Roadmap en `docs/BRIEF.md`, sección O).

Criterio de cierre: una guía de ejemplo se renderiza desde su fichero de datos ·
Lighthouse ≥ 95 · el build falla con una guía inválida.

**Checkpoint en curso: Checkpoint 3 — diseño de la guía**, según
`docs/1.10_checkpoint3_diseno.md` (sub-checkpoints C3.1–C3.5). Misma fase, alcance
reducido: PDF, Mi viaje, pagos y adaptación siguen fuera. **Excepción al "sin
mapa":** el mapa solo se permite en el sub-checkpoint C3.5, y únicamente cuando
el autor haya confirmado las coordenadas. Hasta entonces sigue prohibido.

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

## Reglas duras de arquitectura — no hacer

(De `docs/1.7_arquitectura.md` y `docs/1.7.1_repository_domain.md`.)

1. No inventar decisiones de arquitectura no documentadas en los ficheros 1.6-1.7.2.
2. No añadir dependencias sin justificación explícita en el mensaje del commit.
3. No crear abstracciones antes de que las necesite código real.
4. Si el código contradice una decisión de arquitectura ya cerrada, se corrige
   el código — nunca se modifica el documento en silencio.
5. P22 (integración Python ↔ TypeScript para FastAPI) sigue abierto — no decidirlo.
6. No implementar Adaptación, Pago, PDF, Supabase ni n8n en la Fase 1.

## Límites de módulos (motor/engine, fase posterior)

Ver detalle en `docs/1.7.1_repository_domain.md`.

| Módulo | Puede importar | No puede importar |
|---|---|---|
| `content/` | nada | nada |
| `schemas/` | zod | cualquier otra cosa |
| `engine/` | schemas, node built-ins | astro, vue, APIs de navegador, supabase |
| `src/` (Astro/Vue) | engine | content directamente, supabase |
| `scripts/` | engine, schemas | src, astro |
| `tests/` | engine, schemas | src, astro |

Los consumidores externos siempre importan desde `engine` (la API pública),
nunca desde rutas internas como `engine/compile/algo`.

## Reglas de datos

- `content/` es la fuente de verdad editorial. No es una base de datos.
- `CompiledGuide` es lo que consume la aplicación. `GuideSource` es lo que
  escribe el autor. Nunca mezclarlos.
- Los campos marcados `D` (Derivado) los calcula el compilador. Nunca se
  escriben a mano en el YAML.
- `place_id` desaparece en `CompiledStop` (se resuelve a `place: CompiledPlace`).
- `affiliate_id` desaparece donde aparezca (se resuelve a `affiliate: CompiledAffiliate`).

## Invariantes clave (de `docs/1.6_modelo_datos.md` — sin excepciones)

- I5: `place_id` inexistente → ERROR de compilación.
- I6: `affiliate_id` inexistente → ERROR de compilación.
- I14: `experience{}` con `visit_status != visited` → ERROR de compilación.
- I16: `actual_price_paid` (PARADA) ≠ `entry.price` (LUGAR) — coexisten de forma independiente.

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
