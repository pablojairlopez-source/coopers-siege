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

Fase 5.1-1/2: máquina de estados de ataque compartida (PC y táctil) y nueva disposición de controles móviles.

## Comandos para retomar

```powershell
$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"
git status; git log --oneline -10
npm test
```

## Decisiones de arquitectura

(se completan a medida que avanza la 5.1)

## Bloqueadores conocidos

- Sin dispositivo físico: S23 Ultra, plegables y tablets se prueban por emulación (Playwright).
