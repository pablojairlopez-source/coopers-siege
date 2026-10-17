# Progreso de Cooper's Siege 5.0

**5.0 publicada.** PR #1 fusionado en `main` (`e30568f`, 17-10-2026) con autorización del usuario y desplegado en GitHub Pages; verificado en https://pablojairlopez-source.github.io/coopers-siege/ (título 5.0, módulos de `src/` cargados, sin errores). Rama de desarrollo: `feature/coopers-siege-5-nextgen`.

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

## Ronda de pendientes (sesión 3) — hecho
- [x] Variantes con marcas ajenas renombradas (ciborg, fantasma) y etiqueta del mapa Fundición.
- [x] Coste de los rayos de luz: cacheados a media resolución (explosiones en PC ~18 ms; Caldera Roja en reposo 5,9 ms, igual que 4.0).
- [x] Memoria de la escenografía: 22,5 → 17,1 MB por mapa en Ultra; caché de 3 → 2 mapas (65 → 32 MB).
- [x] Precarga de sprites y efectos al iniciar la partida y de la escenografía del mapa.
- [x] `tests/pug-poses.cjs` usa `#pugVariant`; nuevo `tests/memory.cjs`.

## Pendiente
- Pico único de ~80–110 ms la primera vez en la sesión que estalla una supernova en Archipiélago (PC). No se reproduce al repetirla (22 ms); probablemente inicialización interna del navegador/GPU. No resuelto con la precarga de sprites y efectos.
- Las variantes ciborg y fantasma tienen cara propia y aún no muestran las expresiones nuevas (sí el resto de animaciones).
- Probar en un Galaxy S23 Ultra físico: todas las mediciones móviles son emuladas.
- Merge a `main` y publicación en GitHub Pages: solo con autorización del usuario.
## Registro de sesiones
- Sesión 1: fases A–D.
- Sesión 2: documentos de continuidad; fases E, F y G.
- Sesión 3: ronda de pendientes; merge a main y publicación en GitHub Pages (autorizados).
