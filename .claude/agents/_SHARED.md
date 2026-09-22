# Contexto común a todos los agentes

> Este fichero es referencia. Cada agente lo tiene resumido en su propia
> definición; aquí está la versión larga.

## Antes de nada

Lee `CLAUDE.md`, `docs/BRIEF.md` y `docs/DECISIONES.md`.
Donde DECISIONES.md contradiga al brief, manda DECISIONES.md.

## Idioma

- Contenido de producto y comunicación con el autor: **español**.
- Código, variables, ramas, commits, PRs y comentarios: **inglés**.

## Reglas que nadie puede romper

1. **Nada de datos inventados.** Precio, horario, norma o acceso sin fuente
   verificable no se escribe. Si no lo sabes, deja el campo pendiente.
2. **Experiencia real.** El proyecto vende viajes hechos por el autor. No
   escribas en primera persona sobre algo que el autor no ha vivido.
3. **Revisión humana.** Ningún contenido se publica sin que el autor lo
   apruebe. Los borradores se marcan como tales.
4. **Nada de finanzas.** El VPS aloja un proyecto de finanzas personales con
   datos bancarios. No leas, toques ni referencies nada de ese proyecto.
5. **Secretos fuera del repo.** Nunca commitees `.env`, tokens ni claves.

## Gitflow

```
main                      producción, protegida, solo merges desde release/*
develop                   integración, base de todo el trabajo
feature/<área>-<qué>      trabajo nuevo → PR a develop
fix/<qué>                 corrección → PR a develop
release/<versión>         estabilización → PR a main y back-merge a develop
hotfix/<qué>              urgencia sobre main → PR a main y a develop
```

- Una rama por tarea. Nunca commitear directo a `main` ni a `develop`.
- Commits en inglés, imperativo, sin punto final:
  `Add guide schema validation`, no `Added validation.`
- Un commit hace una cosa. Si el mensaje necesita "y", son dos commits.
- PR con descripción de qué cambia y por qué, y cómo verificarlo.

## Estándar de código

**SOLID, pero legible por un junior.** Si hay que elegir entre elegante y
obvio, gana obvio.

- Nombres que se explican solos. `guideBySlug`, no `gbs` ni `data2`.
- Funciones cortas, una responsabilidad. Si no cabe en pantalla, divídela.
- Sin abstracciones prematuras: no crees una interfaz para una sola
  implementación.
- Sin listeza. Nada de ternarios anidados ni encadenados crípticos.
- Comentarios que expliquen **por qué**, nunca **qué**. El qué lo dice el
  código.
- TypeScript estricto. Nada de `any`.
- Errores explícitos: falla pronto y con un mensaje que diga qué hacer.

## Definición de terminado

No digas que algo está hecho sin haberlo verificado ejecutándolo.

- [ ] `npm run build` pasa
- [ ] Tests en verde
- [ ] Lighthouse ≥ 95 si tocaste páginas
- [ ] Sin secretos en el diff
- [ ] PR abierto contra `develop`
