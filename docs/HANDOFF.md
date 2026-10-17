# Traspaso entre agentes (Claude Code ⇄ Codex)

> Fuente de continuidad subordinada a Git. Antes de continuar: `git status`, `git log --oneline -10`, leer este archivo y `PROGRESO_DESARROLLO.md`.

## Último traspaso

- **Fecha:** 17-10-2026
- **Agente:** Claude Code (Opus)
- **Rama:** `feature/coopers-siege-5-1-controls-audio-thorns` (creada desde `origin/main` `e5466e5`)
- **Último commit confirmado:** ver `git log -1` (este archivo se actualiza en cada commit de subfase)
- **Cambios sin commit:** ninguno al cerrar la subfase.

## Línea base (antes de 5.1)

`npm test` en `e5466e5`: 5/5 suites en verde — LAN 6v6 (9 s), escenarios ampliados 32 partidas (18 s), daño/gore (5 s), HUD responsivo 4 pantallas (5 s), banda sonora 17 piezas (11 s).

## Estado de la 5.1

Ver checklist en `PROGRESO_DESARROLLO.md`.

## Próxima tarea exacta

Fase 5.1-3: ampliar el compositor (varias melodías por sección, contracanto propio, cambio de instrumentación por sección) y reescribir Caldera Roja, Última Estrella, Catedral Gótica, Dulce Caos y Fundición Omega en `src/audio/songs.js`. Después recalibrar: `node tests/calibrate-music.cjs 30`.

## Comandos para retomar

```powershell
$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"
git status; git log --oneline -10
npm test
```

## Decisiones de arquitectura

- **Controles (5.1-1/2):** máquina de estados `CS5.attack` en `src/input/attack-controls.js` (`idle → aiming → charging`), común a teclado, ratón y táctil. Solo toca `app.angle`, `app.power`, `app.charging` y llama a `shoot()`: la autoridad LAN no cambia. `setPhase` y `resetTouchState` llaman a `CS5.attack.reset()`. Disposición en `src/ui/controls.css` (selectores con `body` delante para ganar a los `!important` de 5.0). W/S/↑/↓ ajustan la *elevación* en [-85°, 90°] sin cruzar la vertical (no cambian `c.dir`, que no se sincroniza en LAN coop). El salto por deslizamiento se eliminó; el salto táctil es `#touchJump` (máx. uno cada 180 ms). Prueba: `tests/controls.cjs` (en `npm test`).

- **Audio (5.1-5):** `audio.buildMix(c)` crea los buses (música con paso alto + estante grave −3 dB + `musicDuck`; efectos; voces; ambiente) → compresor de bus suave (−12 dB, 2,5:1) → limitador (−3 dB, 20:1). Niveles en `scheduleAdventureMusic`: música 0,44 (antes 0,70; menú 0,21), efectos 0,74, voces 0,45, ambiente 0,36, todos × deslizadores. `audio.duck(depth,hold)` lo pide `sfx.js` en explosiones grandes. Sonoridad por canción igualada con `CS5.musicTrim` (`src/audio/loudness.js`, generado por `tests/calibrate-music.cjs`). Quejidos: `damage()` llama `sound('hurt', daño/20)`; `sfx.painKind` → ligero <15, medio <35, fuerte ≥35; `pugDeath` llama `sound('death')` antes de `nuclear`. Las voces tenían pico 0,22 tras un paso banda y sonaban en el mismo instante que la explosión (enmascaradas) y la muerte no tenía voz. Límite de voces por tipo en `sfx.js` (`LIMITS`). Prueba: `tests/audio-mix.cjs`.

## Bloqueadores conocidos

- Sin dispositivo físico: S23 Ultra, plegables y tablets se prueban por emulación (Playwright).
