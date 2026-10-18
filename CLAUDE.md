# Cooper's Siege — guía para Claude

Juego de artillería por turnos con pugs (navegador, PC y móvil). Se publica con GitHub Pages desde `main` (carpeta raíz, sin build).

## Reglas del proyecto

- La versión 5.1 está publicada desde `main` (PR #2 fusionado con autorización del usuario; 5.0 fue la PR #1). Los cambios nuevos van en una rama propia y llegan a `main` por PR. **Nunca hacer merge ni push a `main`** sin autorización explícita del usuario.
- Estado y siguientes pasos: **leer `docs/HANDOFF.md` y `PROGRESO_DESARROLLO.md` al empezar** (tras `git status` y `git log`) y actualizarlos al terminar cada subfase. Codex usa `AGENTS.md` con las mismas reglas: mantener ambos coherentes. Rama 5.2 (en desarrollo): `feature/coopers-siege-5-2-torneo`; diseño y seguimiento en `docs/CAMPANA-5.2.md`.
- Si hay cambios sin commit que no son tuyos, pueden ser del otro agente: no descartarlos. Prohibido sin autorización: `git reset --hard`, `git clean -fd`, force push.
- Un commit identificable por fase («Fase X: …»); commits intermedios permitidos con el mismo prefijo.
- No eliminar funcionalidades: 28 armas, terreno destructible, IA, editor de escenarios y de pugs, CPU, local, LAN versus y cooperativo LAN 6v6.
- En LAN el anfitrión es la autoridad. Lo cosmético usa `effectsRandom` y nunca debe alterar el combate ni el terreno. Lo que cambia el terreno o la vida debe ser determinista (solo de `random` o de los argumentos).
- No usar música ni melodías protegidas. Todo el audio es original y procedural (Web Audio).
- No declarar una prueba como superada sin ejecutarla.
- Textos de UI, comentarios y commits en español.
- 5.2 fusionada en `origin/main` mediante PR #3 (`0f8cc74`). Trabajo actual: localización en `feature/coopers-siege-i18n-es419-en`, desde esa base; plan en `docs/LOCALIZACION.md`. No usar la rama histórica 5.2 para cambios nuevos.
- Localización autorizada: la UI y narrativa tienen recursos completos `es-419` y `en-US`; comentarios, commits y continuidad permanecen en español. Los idiomas no cambian IDs, guardados, RNG, reglas ni paquetes LAN.

## Arquitectura

- `index.html`: juego principal (≈ 9 300 líneas, script clásico). Expone `window.PocketSiege` (API de pruebas) y `window.CooperLAN`.
- `src/**`: subsistemas como *scripts* clásicos con rutas relativas, cargados **antes** del script principal, salvo `src/i18n/presentation.js`, que conecta las vistas después. Comparten el ámbito global (`app`, `terrain`, `maps`, `W`…), así que los módulos anteriores al juego solo pueden usarlos en tiempo de ejecución, no al cargar.
  - `levels/art-direction.js`: dirección de arte por mapa (materiales, paleta, gradación, rayos).
  - `levels/terrain-gen.js`: trazado de los 16 mapas (mundo `W=3072`, `H=768`, `WATER=695`) y `CS5.safeSpawns`.
  - `rendering/terrain-materials.js`: pintor de materiales del terreno (incluye chamuscados).
  - `rendering/scenery-kit.js`, `rendering/scenery.js`: fondos pintados por mapa con parallax.
  - `rendering/post.js`: gradación, viñeta y bloom (solo del canvas WebGL).
  - `rendering/props3d.js`: decorados 3D por mapa.
  - `characters/pug-anim.js`: expresiones y animación procedural (solo visual).
  - `effects/destruction.js`: onda expansiva, escombros, brasas, chamuscados.
  - `audio/*`: motor musical y composiciones por mapa (Fase E).
- `VIEW_W=1536` es el encuadre de referencia de la cámara (el ancho del mundo de 4.0).

## Entorno y pruebas

Node no está instalado en el sistema: hay una copia portátil en `%LOCALAPPDATA%\coopers-tools\node-v24.22.0-win-x64`. En PowerShell:

```
$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"
```

- `npm test`: LAN 6v6, autoridad, terreno, trayectorias y volumen (prueba original; no cambiar sus aserciones).
- `node tests/smoke.cjs`: los 16 mapas × 2 semillas, apariciones seguras.
- `node tests/effects.cjs`: niveles de gore y cráteres deterministas.
- `node tests/visual.cjs <salida> desktop,s23ultra [mapas]`: capturas. `tests/contact-sheet.cjs`: hoja de contactos.
- `node tests/perf.cjs <salida.json> [mapas] [pc,android]`: tiempos de frame (el perfil android es una emulación).
- `node tests/pug-poses.cjs`, `tests/craters.cjs`: capturas de expresiones y cráteres.
- `test-results/` está ignorado; las capturas de referencia van en `docs/screenshots/`.

Las ediciones de `index.html` usan finales de línea CRLF: al reemplazar bloques de varias líneas con PowerShell, convertir a `\r\n`.
