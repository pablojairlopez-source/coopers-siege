# Traspaso entre agentes (Claude Code ⇄ Codex)

> Fuente de continuidad subordinada a Git. Antes de continuar: `git status`, `git log --oneline -10`, leer este archivo y `PROGRESO_DESARROLLO.md`.

## Último traspaso

- **Fecha:** 17-10-2026
- **Agente:** Claude Code (Opus) — auditoría independiente previa a la publicación
- **Rama:** `feature/coopers-siege-5-1-controls-audio-thorns` (desde `origin/main` `e5466e5`), publicada en `origin`.
- **Último commit confirmado:** el de «Auditoría 5.1» (ver `git log -1`); antes «Fase 5.1-6/8» `697c7d7`. Commits de la 5.1: 5.1-0 `d7b695f`, 5.1-1/2 `4999b2a`, 5.1-5 `d5e9238`, 5.1-3 `5a61408`, 5.1-4 `532f1f9`, 5.1-6/8 (entrega).
- **Cambios sin commit:** ninguno.
- **PR #2:** fusionada en `main` con autorización del usuario; 5.1 publicada en GitHub Pages. Futuros cambios: rama nueva y PR, sin merge sin autorización.

## Estado

Subfases 0–6 y 8 completas. `npm test`: 8/8 suites en verde (LAN original, LAN 5.1, escenarios ×17, gore, HUD, controles, música, mezcla).

## Línea base (antes de 5.1)

`npm test` en `e5466e5`: 5/5 suites en verde.

## Auditoría 5.1

Informe en `docs/AUDITORIA-5.1.md`. Corregido: pellizco falso con un dedo en un botón (`e.targetTouches`), quejido por veneno, recorte suave de seguridad tras el limitador (pico extremo 1,09 → 0,959), sonido de caída en las nubes del mapa 17 y etiqueta de versión 5.1. La vista previa (`preview/`, servida por raw.githack) se retiró antes del merge. Para regenerar la música escuchable: `node tests/export-preview-audio.cjs 180` y `node tests/check-preview-audio.cjs 180` (salida en `test-results/preview-audio`). Ojo: en renders sin conexión hay que omitir las limpiezas por `setTimeout` de los instrumentos (ver auditoría, defecto 6).

## Próxima tarea exacta

5.1 publicada. Esperar la prueba del usuario en su S23 Ultra. Ajustes probables tras su prueba en un S23 Ultra real: tamaños/posición de botones (variables `--t51-*` en `src/ui/controls.css`), niveles de mezcla (`scheduleAdventureMusic` en `index.html`) o pasajes musicales (`src/audio/songs.js`, después `node tests/calibrate-music.cjs 30` dos veces).

## Comandos para retomar

```powershell
$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"
git status; git log --oneline -10
npm test
node tests/controls-shots.cjs test-results/controls s23ultra,fold,desktop
node tests/export-music.cjs 180 B test-results/music-5.1 volcano,thorns
```

## Decisiones de arquitectura

- **Controles (5.1-1/2):** máquina de estados `CS5.attack` en `src/input/attack-controls.js` (`idle → aiming → charging`), común a teclado, ratón y táctil. Solo toca `app.angle`, `app.power`, `app.charging` y llama a `shoot()`: la autoridad LAN no cambia. `setPhase` y `resetTouchState` llaman a `CS5.attack.reset()`. Disposición en `src/ui/controls.css` (selectores con `body` delante para ganar a los `!important` de 5.0). W/S/↑/↓ ajustan la *elevación* en [-85°, 90°] sin cruzar la vertical (no cambian `c.dir`, que no se sincroniza en LAN coop). El salto por deslizamiento se eliminó; el salto táctil es `#touchJump` (máx. uno cada 180 ms). Comportamiento exacto: `docs/NOTAS-5.1.md`.
- **Audio (5.1-5):** `audio.buildMix(c)` crea los buses (música con paso alto + estante grave −3 dB + `musicDuck`; efectos; voces; ambiente) → compresor de bus (−12 dB, 2,5:1) → limitador (−3 dB, 20:1). Niveles en `scheduleAdventureMusic`: música 0,44 (menú 0,21), efectos 0,74, voces 0,45, ambiente 0,36. `audio.duck(depth,hold)` lo pide `sfx.js`. Sonoridad por canción con `CS5.musicTrim` (`src/audio/loudness.js`, generado). Quejidos: `damage()` → `sound('hurt', daño/20)`; `pugDeath` → `sound('death')` antes de `nuclear`.
- **Música (5.1-3):** el compositor admite `melody` como lista, `literal:true`, `counterMelody`, `inst` y `tempo` por sección; `mel('…')` es la notación compacta de `songs.js`. Referencias de YouTube: solo se leyó el título; no se escuchó el audio.
- **Mapa 17 (5.1-4):** índice 16, id `thorns`; espinas solo visuales/terreno (sin daño por contacto). Escenografía en `src/rendering/scenery-thorns.js`.

## Bloqueadores conocidos

- Sin dispositivo físico: S23 Ultra, plegables y tablets se prueban por emulación (Playwright).
- Escucha humana pendiente de las piezas revisadas.
