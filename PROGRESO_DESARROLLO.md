# Progreso de Cooper's Siege 5.0

Rama: `feature/coopers-siege-5-nextgen` · PR en borrador: #1 · Base: `origin/main` @ `c8ced21`.

## Estado por fase

| Fase | Estado | Commit | Resumen |
|---|---|---|---|
| A · Auditoría y línea base | ✅ | `37eee0b` | `docs/AUDITORIA-5.0.md`, capturas 4.0, `tests/perf.cjs`, `tests/visual.cjs` |
| B · Renovación gráfica y escenarios | ✅ | `32bd114` | Mapas 3072 u, trazados por mapa, materiales, escenografía, post-proceso, decorados 3D |
| C · Pugs y animaciones | ✅ | `07e64d6` | 10 expresiones, mirada, parpadeo, muelle de panza, poses del editor |
| D · Daño y destrucción | ✅ | `708fc07` | Onda expansiva, escombros, chamuscados, cráteres irregulares, frame tras explosión 57→15 ms |
| E · Música y sonido | ✅ | `b2c6768` + siguiente | 17 piezas originales, compositor adaptativo, efectos por arma/material, ambientes |
| F · Optimización móvil y UI | ⏳ | — | Ver abajo |
| G · Pruebas e integración | ⏳ | — | Ver abajo |

## Fase E — tareas
- [ ] Motor de composición propio (`src/audio/`): forma larga por secciones, compases y grooves propios, instrumentos sintetizados por mapa, reverb.
- [ ] 16 composiciones distintas (una por mapa) + tema de menú original.
- [ ] Eliminar el MP3 embebido derivado de *Stickerbush Symphony* (≈ 640 KB en `index.html`).
- [ ] 8 estados adaptativos: menú, inicio, exploración, combate, peligro, últimos pugs, victoria, derrota.
- [ ] Efectos de sonido por familia de armas, explosiones según distancia, voces de pugs, ambientes por mapa.
- [ ] Conservar `scheduleAdventureMusic`, `#volMusic` y la compensación menú/escenario que comprueba `npm test`.

## Fase F — tareas
- [ ] Investigar el pico aislado de ~158 ms en Android emulado (explosiones en tropic).
- [ ] Bomba ácida: `updateCombatFX` destruye terreno con `effectsRandom` → posible desincronización en LAN versus.
- [ ] HUD compacto en S23 Ultra horizontal (ocupa demasiado), minimapa, marca «5.0».

## Fase G — tareas
- [ ] Capturas finales en `docs/screenshots/5.0/`, comparativa, mediciones finales.
- [ ] Changelog, instrucciones, PR lista para revisión (sin merge).

## Mediciones de referencia (mediana por frame, `tests/perf.cjs`)
| Perfil | 4.0 reposo | 4.0 explosiones | Tras D reposo | Tras D explosiones |
|---|---|---|---|---|
| PC tropic | 3,19 | 19,6 | 3,44 | 12,9 |
| Android emulado tropic | 18,3 | 32,2 (máx 133) | 14,2 | 26,5 (máx 158) |

## Problemas conocidos
- Bomba ácida y LAN versus (ver Fase F).
- Pico aislado de frame en Android emulado.
- El selector de variante en `tests/pug-poses.cjs` no cambia la variante (id incorrecto); solo afecta a la captura.

## Registro de sesiones
- Sesión 1: fases A–D.
- Sesión 2: documentos de continuidad; Fase E completa; inicio de la Fase F.
