# Cooper's Siege — guía para Codex (y cualquier agente)

Este archivo es el equivalente de `CLAUDE.md` para Codex. Las reglas son las mismas: si cambias una, cambia la otra.

## Antes de empezar (obligatorio)

1. `git status`, `git branch --show-current`, `git log --oneline -10`.
2. Leer `docs/HANDOFF.md` (estado técnico del último traspaso) y `PROGRESO_DESARROLLO.md` (plan y checklist).
3. Si el árbol tiene cambios sin commit que no son tuyos, **no los descartes**: puede ser trabajo a medias del otro agente. Revísalos con `git diff` y continúa desde ahí o documenta qué hacer.
4. No trabajar a la vez que otro agente en el mismo árbol.

Los archivos de continuidad están subordinados al estado real del código y de Git: si discrepan, manda Git.

## Reglas del proyecto

- `main` publica la versión actual en GitHub Pages (carpeta raíz, sin build). **Nunca merge, push ni despliegue a `main`** sin autorización explícita del usuario.
- Rama de trabajo 5.2: `feature/coopers-siege-5-2-torneo` (la misma para Claude Code y Codex). Diseño y seguimiento: `docs/CAMPANA-5.2.md`.
- 5.2 fusionada en `origin/main` mediante PR #3 (`0f8cc74`). Trabajo actual: localización en `feature/coopers-siege-i18n-es419-en`, desde esa base; plan en `docs/LOCALIZACION.md`. No usar la rama histórica 5.2 para cambios nuevos.
- Prohibido sin autorización: `git reset --hard`, `git clean -fd`, `git push --force`.
- Commits pequeños con prefijo de fase («Fase i18n-X: …» en la actualización actual; históricamente «Fase 5.2-X: …»). Al cerrar cada subfase: tests pertinentes, actualizar `PROGRESO_DESARROLLO.md` y `docs/HANDOFF.md`, commit y push de la rama.
- No eliminar funcionalidades: 28 armas, terreno destructible, IA, editor de escenarios y de pugs, CPU, local, LAN versus y cooperativo LAN 6v6.
- En LAN el anfitrión es la autoridad. Lo cosmético usa `effectsRandom`; lo que cambia terreno o vida debe ser determinista.
- Audio 100 % original y procedural (Web Audio). Las referencias musicales del usuario son dirección artística: no copiar melodías, frases ni progresiones distintivas; no descargar audio de YouTube.
- No declarar una prueba como superada sin ejecutarla.
- Textos de UI, comentarios y commits en español.
- Localización autorizada: la UI y narrativa tienen recursos completos `es-419` y `en-US`; comentarios, commits y continuidad permanecen en español. Los idiomas no cambian IDs, guardados, RNG, reglas ni paquetes LAN.

## Arquitectura y pruebas

Ver `CLAUDE.md` (secciones «Arquitectura» y «Entorno y pruebas»); es la referencia común. Resumen:

- `index.html` (script clásico, CRLF) + `src/**` (scripts clásicos que comparten el ámbito global; se cargan antes del script principal, salvo `src/i18n/presentation.js`, que conecta las vistas después).
- Node portátil: `$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"`.
- `npm test` ejecuta todas las suites (`tests/run-all.cjs`). La prueba original `tests/lan-coop.cjs` no cambia sus aserciones.
- Ahorro de tokens: buscar funciones concretas en `index.html` (≈ 9 300 líneas) en vez de leerlo entero.
