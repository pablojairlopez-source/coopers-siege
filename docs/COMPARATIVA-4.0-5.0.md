# Comparativa Cooper's Siege 4.0 → 5.0

## Capturas antes / después
- Escritorio, mapas 0–7: [`screenshots/comparativa-escritorio-1.jpg`](screenshots/comparativa-escritorio-1.jpg)
- Escritorio, mapas 8–15: [`screenshots/comparativa-escritorio-2.jpg`](screenshots/comparativa-escritorio-2.jpg)
- Galaxy S23 Ultra (emulado), mapas 0–5: [`screenshots/comparativa-s23ultra.jpg`](screenshots/comparativa-s23ultra.jpg)
- Los 16 mapas de 5.0: [`screenshots/5.0-mapas.jpg`](screenshots/5.0-mapas.jpg)
- Capturas individuales: `screenshots/4.0/` y `screenshots/5.0/` (escritorio 1366×768 y S23 Ultra emulado 915×412).

## Tabla resumen

| Aspecto | 4.0 | 5.0 |
|---|---|---|
| Ancho del mundo | 1536 u | 3072 u (2×), trazado propio por mapa con variación por semilla |
| Fondos | Triángulos y bloques genéricos (misma forma en todos los mapas) | Escenografía pintada por mapa con hito, 3 capas de parallax y vida ambiental |
| Terreno | Color liso con bandas; 3 cuevas idénticas en todos los mapas | Materiales por mapa, vetas, cristales, raíces, decoración de superficie, oclusión |
| Post-proceso | No | Gradación por mapa, viñeta, bloom |
| Pugs | Parpadeo ocasional | 10 expresiones, mirada, muelle de panza, reacciones con inercia |
| Explosiones | Destello, chispas, humo en esferas | Onda expansiva, escombros del material, brasas, chamuscado por arma, cráteres irregulares |
| Música | Un único planificador para los 16 mapas; menú con MP3 derivado de *Stickerbush Symphony* | 17 piezas originales, cada una con su género y su forma; 8 estados adaptativos |
| Efectos de sonido | Tonos y siseos genéricos | 19 familias de armas, 16 materiales de explosión, voces de pugs, ambientes por mapa |
| Tamaño de `index.html` | 1,25 MB | ~580 KB (+ módulos en `src/`) |
| HUD en S23 Ultra emulado | Barra superior ~70 px, minimapa ~150 px de alto | Barra 38 px, minimapa de una fila; HUD cubre el 11,8 % de la pantalla |
| Pruebas | 1 suite (LAN 6v6) | 5 suites en `npm test` |

## Rendimiento

Medido con `tests/perf.cjs` en la **misma sesión** para 4.0 y 5.0 (las cifras absolutas varían entre sesiones según el estado del equipo; por eso 4.0 se midió dos veces, antes y después de 5.0). Mediana del tiempo de frame (simulación + render + sincronización de GPU), en ms. Datos: `docs/perf/remedicion-4.0-a.json`, `remedicion-4.0-b.json`, `final-5.0.json`.

| Perfil | Mapa | 4.0 reposo | 5.0 reposo | 4.0 explosiones (máx) | 5.0 explosiones (máx) |
|---|---|---|---|---|---|
| PC (RTX 5080 Laptop, Ultra) | Archipiélago | 13,3 / 19,1 | 17,3 | 25,0 / 32,2 (85 / 87) | 30,8 (138) |
| PC | Caldera Roja | 5,7 / 6,5 | 9,5 | 25,1 / 24,8 (66 / 68) | 26,8 (52) |
| PC | Puerto Tempestad | 17,2 / 18,4 | 15,8 | 27,1 / 33,7 (49 / 59) | 16,2 (31) |
| Android emulado (S23 Ultra, CPU ×4) | Archipiélago | 23,4 / 19,7 | 17,4 | 41,4 / 33,7 (303 / 153) | 26,8 (89) |
| Android emulado | Caldera Roja | 17,3 / 11,0 | 9,9 | 35,6 / 26,3 (98 / 62) | 23,5 (53) |
| Android emulado | Puerto Tempestad | 31,7 / 20,1 | 16,8 | 45,4 / 31,5 (118 / 56) | 23,8 (55) |

Lectura:
- **Móvil (emulado):** 5.0 es más fluida que 4.0 en reposo y con explosiones, y sus picos son mucho menores (89 ms frente a 153–303 ms), pese a tener mapas el doble de grandes y mucho más contenido visual.
- **PC:** en el rango de 4.0. Caldera Roja en reposo es ~3 ms más lenta (más capas de fondo y materiales) y Archipiélago tuvo un pico aislado de 138 ms durante la cadena de explosiones; queda anotado como pendiente.
- Memoria JS: 69–117 MB en 5.0 frente a 38–82 MB en 4.0 (capas de fondo pintadas y lienzos del doble de ancho).

## Limitaciones de la medición
- No hay un Galaxy S23 Ultra físico: el perfil «android» emula viewport, DPR 3,5, pantalla táctil y CPU 4× más lenta con CDP, pero la GPU es la del PC. Sirve para comparar versiones, no como cifra absoluta del teléfono.
- El navegador de pruebas es Chromium headless con GPU real (ANGLE/D3D11).
