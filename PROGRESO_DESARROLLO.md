# Progreso de Cooper's Siege 5.0

Rama: `feature/coopers-siege-5-nextgen` · PR #1 (lista para revisión, **sin merge**) · Base: `origin/main` @ `c8ced21`.

## Estado por fase

| Fase | Estado | Commits | Resumen |
|---|---|---|---|
| A · Auditoría y línea base | ✅ | `37eee0b` | `docs/AUDITORIA-5.0.md`, capturas 4.0, herramientas de medición |
| B · Renovación gráfica y escenarios | ✅ | `32bd114` | Mapas 3072 u, trazados por mapa, materiales, escenografía, post-proceso, decorados 3D |
| C · Pugs y animaciones | ✅ | `07e64d6` | 10 expresiones, mirada, parpadeo, muelle de panza, poses del editor |
| D · Daño y destrucción | ✅ | `708fc07` | Onda expansiva, escombros, chamuscados, cráteres irregulares, frame tras explosión 57→15 ms |
| E · Música y sonido | ✅ | `b2c6768`, `eb89302` | 17 piezas originales, 8 estados adaptativos, efectos por arma y material, ambientes; MP3 derivado de *Stickerbush Symphony* eliminado |
| F · Optimización móvil y UI | ✅ | `c74b633`, `0b450ea` | Repintado diferido, minimapa desde la máscara, determinismo LAN del ácido/fuego, HUD compacto |
| G · Pruebas e integración | ✅ | ver `git log` | `npm test` con 5 suites, capturas 5.0, comparativas, mediciones en la misma sesión, changelog, README |

Documentos de entrega: `CHANGELOG.md`, `docs/COMPARATIVA-4.0-5.0.md`, `docs/AUDITORIA-5.0.md`, `docs/screenshots/`, `docs/perf/`.

## Pendiente / ideas para siguientes sesiones
- PC: Caldera Roja ~3 ms más lenta en reposo que 4.0 y un pico aislado de 138 ms en la cadena de explosiones de Archipiélago (`tests/perf.cjs`). Investigar con `node tests/spike.cjs 0 1`.
- El primer frame tras iniciar una partida tarda (construcción de la escenografía y de las paredes 3D). En el flujo normal el menú ya construye la escenografía del mapa elegido, pero podría precargarse también al cambiar de preset.
- Memoria JS mayor que 4.0 (69–117 MB frente a 38–82 MB) por las capas de fondo pintadas; se podría reducir la resolución de las capas lejanas en Económico/Equilibrado.
- Las variantes de pug «Fantasma (Boo Mario Galaxy)» y «Mecha T-800 (Terminator)» citan marcas ajenas en el nombre visible; conviene renombrarlas.
- `tests/pug-poses.cjs` no cambia la variante (el selector es `#pugVariant`); solo afecta a las capturas.
- Probar en un Galaxy S23 Ultra físico: todas las mediciones móviles son emuladas.
- Merge a `main` y publicación en GitHub Pages: solo con autorización del usuario.

## Registro de sesiones
- Sesión 1: fases A–D.
- Sesión 2: documentos de continuidad; fases E, F y G.
