# Cooper's Siege — guía para Claude

Juego de artillería por turnos con pugs (navegador, PC y móvil). Se publica con GitHub Pages desde `main` (carpeta raíz, sin build).

## Reglas del proyecto

- La versión 5.0 se desarrolla en `feature/coopers-siege-5-nextgen`. **Nunca hacer merge ni push a `main`** sin autorización explícita del usuario. PR en borrador: #1.
- Estado y siguientes pasos: **leer `PROGRESO_DESARROLLO.md` al empezar** y actualizarlo al terminar cada bloque de trabajo.
- Un commit identificable por fase («Fase X: …»); commits intermedios permitidos con el mismo prefijo.
- No eliminar funcionalidades: 28 armas, terreno destructible, IA, editor de escenarios y de pugs, CPU, local, LAN versus y cooperativo LAN 6v6.
- En LAN el anfitrión es la autoridad. Lo cosmético usa `effectsRandom` y nunca debe alterar el combate ni el terreno. Lo que cambia el terreno o la vida debe ser determinista (solo de `random` o de los argumentos).
- No usar música ni melodías protegidas. Todo el audio es original y procedural (Web Audio).
- No declarar una prueba como superada sin ejecutarla.
- Textos de UI, comentarios y commits en español.

## Arquitectura

- `index.html`: juego principal (≈ 9 300 líneas, script clásico). Expone `window.PocketSiege` (API de pruebas) y `window.CooperLAN`.
- `src/**`: subsistemas 5.0 como *scripts* clásicos con rutas relativas, cargados **antes** del script principal. Comparten el ámbito global (`app`, `terrain`, `maps`, `W`…), así que solo pueden usarlos en tiempo de ejecución, no al cargar.
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
