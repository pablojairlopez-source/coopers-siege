# Traspaso entre agentes (Claude Code ⇄ Codex)

> Fuente de continuidad subordinada a Git. Antes de continuar: `git status`, `git log --oneline -10`, leer este archivo, `PROGRESO_DESARROLLO.md` y `docs/CAMPANA-5.2.md`.

## Último traspaso

- **Fecha:** 17-10-2026
- **Agente:** Claude Code (Opus)
- **Rama:** `feature/coopers-siege-5-2-torneo` (desde `origin/main` `16c8bf4`, 5.1 publicada), publicada en `origin`.
- **Último commit confirmado:** «Fase 5.2-D/E/F/G» (ver `git log -1`).
- **Cambios sin commit:** ninguno.
- **Subfase actual:** 5.2-D a 5.2-G completadas (campaña, jefes, historia, interfaz). `npm test` 12/12.

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

5.2-H y entrega: simulación de balance (`node tests/balance.cjs`), rendimiento móvil emulado, capturas en `docs/screenshots/5.2`, CHANGELOG/README/`docs/NOTAS-5.2.md`, vista previa por raw.githack de la rama y PR sin merge.

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
