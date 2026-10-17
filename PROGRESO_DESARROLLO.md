# Progreso de Cooper's Siege

**5.1 publicada**: PR #2 fusionada en `main` con autorización del usuario y desplegada en GitHub Pages (antes, 5.0 con la PR #1). Rama de desarrollo: `feature/coopers-siege-5-1-controls-audio-thorns`. Estado técnico de traspaso: `docs/HANDOFF.md`; notas: `docs/NOTAS-5.1.md`.

## 5.1 — Controles, audio y Jardín de Espinas

| Subfase | Estado | Resumen |
|---|---|---|
| 0 · Rama, línea base, continuidad | ✅ | `AGENTS.md`, `docs/HANDOFF.md`; `npm test` 5/5 en verde en `e5466e5` |
| 1 · Controles smartphone | ✅ | Armas a la izquierda, ATACAR + SALTAR a la derecha, sin salto por deslizamiento, apuntado en dos pasos |
| 2 · Controles PC | ✅ | A/D, W/S ángulo, SPACE contextual (saltar / cargar y disparar), cancelar sin gastar munición |
| 5 · Mezcla de audio | ✅ | Buses, limitador, música −4 dB, sonoridad igualada (dispersión 9,5 → 0,9 dB), disparos/explosiones con cuerpo, quejidos audibles |
| 3 · Revisión musical | ✅ | Caldera Roja, Última Estrella, Catedral Gótica, Dulce Caos, Fundición Omega |
| 4 · Mapa 17 Jardín de Espinas | ✅ | Trazado, corteza y espinas, escenografía, decorados 3D, ambiente y música propia |
| 6 · Pruebas | ✅ | `npm test` 8/8: + controles, mezcla, LAN 5.1; smoke con 17 mapas; capturas y rendimiento |
| 9 · Auditoría independiente | ✅ | 5 defectos comprobados y corregidos (`docs/AUDITORIA-5.1.md`); la vista previa y la música (`preview/`) se usaron para revisar en el móvil y se retiraron antes del merge |
| 8 · Entrega | ✅ | README, CHANGELOG, `docs/NOTAS-5.1.md`, capturas en `docs/screenshots/5.1/`, PR (sin merge) |

## Pendiente
- Validación en un Galaxy S23 Ultra físico (comodidad de controles, audio por altavoz, rendimiento).
- Escucha humana de las piezas revisadas y de «Bruma entre Zarzas».
- Heredado de 5.0: pico único ~80–110 ms en la primera supernova de la sesión (PC); variantes ciborg y fantasma sin expresiones nuevas.
- Futuras versiones: merge a `main` y publicación solo con autorización del usuario.

## Registro de sesiones
- Sesión 1: fases A–D (5.0).
- Sesión 2: documentos de continuidad; fases E, F y G (5.0).
- Sesión 3: ronda de pendientes; merge a main y publicación (autorizados).
- Sesión 4 (Claude Code, 17-10-2026): 5.1 completa y PR abierta.
- Sesión 5 (Claude Code, 17-10-2026): auditoría independiente, correcciones, vista previa; se retiró `preview/` y se fusionó la PR #2 en `main` (autorizado).
