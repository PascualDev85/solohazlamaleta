# Estado del proyecto

Última actualización: 2026-09-22

---

## Dónde está todo

- **Repo:** https://github.com/PascualDev85/solohazlamaleta (privado)
- **PR abierto:** [#1 — F1: project foundation, specialist agents and the guide schema](https://github.com/PascualDev85/solohazlamaleta/pull/1)
- **Ramas:** `main` (producción) · `develop` (integración) · `feature/agents-and-conventions` (el trabajo de F1)

## Qué hay hecho

| | Estado |
|---|---|
| Repo, gitflow, `.gitignore` | ✅ |
| Brief y decisiones versionados | ✅ |
| 9 agentes especialistas | ✅ |
| Convenciones: SOLID, gitflow, definición de terminado | ✅ |
| Astro 7 + Vue + sitemap, TypeScript estricto | ✅ |
| Esquema de guía con los huecos de D9 cerrados | ✅ |
| Layout, plantilla de guía, componentes | ✅ |
| Páginas legales (pendientes de tus datos) | ✅ |
| `/ir/[id]` y registro de afiliados | ✅ |
| `robots.txt`, sitemap, canonical, Open Graph | ✅ |
| CI en GitHub Actions | ✅ |
| Guía de Alsacia como borrador con variantes | ✅ |

### Verificado, no supuesto

```
build con guía válida     exit 0, 6 páginas
build con guía inválida   exit 1, mensaje accionable
Lighthouse home           100 / 100 / 100 / 100
guía borrador             noindex presente y fuera del sitemap
```

---

## Lo primero al volver

### 1. Revisar y mergear el PR #1

```bash
cd ~/Desktop/solo_haz_la_maleta
git pull
gh pr view 1 --web
```

### 2. Decidir si Alsacia sigue

La guía existe como **borrador explícito**: `draft: true`, `tripDone: null`, y
todo precio, horario y recomendación marcado `PENDIENTE AUTOR`. Solo están
rellenos nombres y coordenadas, que son verificables en un mapa.

No se inventó nada porque no has hecho ese viaje y el proyecto vende
experiencia de primera mano. Rellenarlo con datos plausibles habría producido
justo el contenido genérico que prohíbe `CLAUDE.md`.

La decisión D6 sigue diciendo **Mallorca primero**: es donde tienes 8 años de
experiencia real, fotos propias y competencia desactualizada, y donde puedes
rankear en 3-6 meses. Alsacia es un dominio nuevo compitiendo sin ventaja.
La estructura de Alsacia ya está montada y sirve igual cuando la quieras.

### 3. Completar lo que solo puedes hacer tú

- [ ] Datos identificativos en `privacidad` y `aviso-legal`.
      **Bloquea recoger el primer correo.**
- [ ] `sobre-mi` escrita en primera persona. Es la página que sostiene la
      credibilidad del proyecto entero.
- [ ] Paleta, tipografía e icono de marca. Los colores de
      `src/styles/tokens.css` son provisionales.

---

## Pendientes técnicos

### Protección de ramas — no se pudo activar

GitHub reserva la protección de ramas a **Pro** en repositorios privados.
Ahora mismo `main` y `develop` aceptan push directo. Opciones:

1. Hacer el repo público. Gratis, y no hay nada sensible: los secretos están
   fuera del repo. Es lo que haría.
2. GitHub Pro, 4 $/mes.
3. Dejarlo y respetar gitflow por disciplina. Funciona hasta que dejas de
   respetarlo.

### Otros

- [ ] Conectar Cloudflare Pages al repo y desplegar `develop` a un dominio de
      pruebas.
- [ ] Analítica sin cookies (Umami o Plausible).
- [ ] Dominio `solohazlamaleta.com` — `astro.config.mjs` ya lo da por hecho.

---

## Cómo usar los agentes

Están en `.claude/agents/`. Se invocan por nombre:

| Agente | Para qué |
|---|---|
| `architect` | Esquema, estructura, dependencias, decisiones técnicas |
| `frontend-dev` | Páginas, componentes, islas Vue |
| `junior-dev` | Tareas pequeñas y bien especificadas |
| `qa` | Verificar antes de mergear |
| `product-owner` | Aceptar o rechazar una fase |
| `seo` | Keywords, datos estructurados, enlazado |
| `marketing` | Escalera de valor, captación, afiliados, RGPD |
| `social-content` | Pinterest y carruseles (D7: sin vídeo) |
| `devops` | CI/CD, Cloudflare, VPS, aislamiento de finanzas |

Cada uno lleva sus límites escritos, para que deleguen en vez de invadirse.
`_SHARED.md` tiene gitflow, el estándar de código y la definición de terminado.

---

## Lo que no se pudo hacer, y por qué

Pediste agentes trabajando con el PC apagado. **No es posible**: los subagentes
de Claude Code se ejecutan en el proceso local, no en un servidor. Apagar el
portátil los apaga. Tampoco puedo encadenar sesiones automáticamente cuando una
se agota, ni hacer que los agentes se coordinen entre ellos sin alguien
orquestando.

Lo que sí se hizo: aprovechar la sesión con el equipo encendido para dejar F1
construido, verificado y en un PR que puedes revisar de una sentada.
