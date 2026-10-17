# Traspaso entre agentes (Claude Code ⇄ Codex)

> Fuente de continuidad subordinada a Git. Antes de continuar: `git status`, `git log --oneline -10`, leer este archivo, `PROGRESO_DESARROLLO.md` y `docs/CAMPANA-5.2.md`.

## Último traspaso

- **Fecha:** 17-10-2026
- **Agente:** Claude Code (Opus)
- **Rama:** `feature/coopers-siege-5-2-torneo` (desde `origin/main` `16c8bf4`, 5.1 publicada), publicada en `origin`.
- **Último commit confirmado:** «Fase 5.2-B» (ver `git log -1`).
- **Cambios sin commit:** ninguno.
- **Subfase actual:** 5.2-B completada (arsenal). `npm test` 9/9 (nueva suite `tests/weapons.cjs`).

## Cambios de esta subfase

- `docs/CAMPANA-5.2.md`: diseño, tabla de capítulos, decisiones y registro.
- `CLAUDE.md`, `AGENTS.md`, `PROGRESO_DESARROLLO.md`: rama 5.2 y prefijo de commits «Fase 5.2-X».

## Pruebas

- Línea base en `16c8bf4`: `npm test` 8/8 en verde.

## Errores conocidos

- Ninguno nuevo.

## Pendientes

Subfases 5.2-B a 5.2-H y entrega (ver `docs/CAMPANA-5.2.md`).

## Próxima tarea exacta

5.2-C: integrar `src/gameplay/supply-config.js` y `src/gameplay/supply-drops.js` (`CS5.supply`) en `index.html`: `reset` en `newMatch`, `onTurn` al final de `nextTurn`, `step` en `step()`, `onExplosion` en `explode()`, `draw` en `overlay()`, `supplies` en la instantánea cooperativa, mensaje `supply_pick` en versus; sonidos nuevos en `sfx.js`; selector «Huesitos» en el menú; prueba `tests/supplies.cjs`.

## Comandos para retomar

```powershell
$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"
git status; git log --oneline -10
npm test
```

## Decisiones de arquitectura (heredadas de 5.1)

- **Controles:** máquina de estados `CS5.attack` (`src/input/attack-controls.js`), común a teclado, ratón y táctil.
- **Audio:** buses música/efectos/voces/ambiente → compresor → limitador → recorte suave. Sonidos nuevos: añadir casos en `sfx.play` (`src/audio/sfx.js`); en LAN cooperativo `audio.sound` del anfitrión se replica solo al invitado.
- **LAN:** cooperativo = el anfitrión simula todo y envía instantáneas (`coop_state`); versus = ambos simulan con la misma semilla y el jugador activo envía `sync`/`shoot`.
- **Mapa 17:** índice 16, id `thorns`.

## Bloqueadores conocidos

- Sin dispositivo físico: S23 Ultra, plegables y tablets se prueban por emulación (Playwright).
