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

Medido con `tests/perf.cjs` en la **misma sesión** para 4.0 y 5.0 (las cifras absolutas varían entre sesiones según el estado del equipo; por eso 4.0 se midió dos veces, antes y después de 5.0). Mediana del tiempo de frame (simulación + render + sincronización de GPU), en ms. Datos: `docs/perf/remedicion-4.0-a.json`, `remedicion-4.0-b.json`, `final-5.0.json` (5.0 medido de nuevo tras la ronda de pendientes).

| Perfil | Mapa | 4.0 reposo | 5.0 reposo | 4.0 explosiones (máx) | 5.0 explosiones (máx) |
|---|---|---|---|---|---|
| PC (RTX 5080 Laptop, Ultra) | Archipiélago | 13,3 / 19,1 | 14,6 | 25,0 / 32,2 (85 / 87) | 18,7 (108*) |
| PC | Caldera Roja | 5,7 / 6,5 | 5,9 | 25,1 / 24,8 (66 / 68) | 18,7 (41) |
| PC | Puerto Tempestad | 17,2 / 18,4 | 19,5 | 27,1 / 33,7 (49 / 59) | 17,5 (33) |
| Android emulado (S23 Ultra, CPU ×4) | Archipiélago | 23,4 / 19,7 | 16,7 | 41,4 / 33,7 (303 / 153) | 27,1 (89) |
| Android emulado | Caldera Roja | 17,3 / 11,0 | 10,2 | 35,6 / 26,3 (98 / 62) | 23,4 (56) |
| Android emulado | Puerto Tempestad | 31,7 / 20,1 | 17,8 | 45,4 / 31,5 (118 / 56) | 24,4 (55) |

\* Pico único de inicialización: aparece solo la primera vez en la sesión que estalla una supernova; la misma explosión repetida tarda ~22 ms.

Lectura:
- **Móvil (emulado):** 5.0 es más fluida que 4.0 en reposo y con explosiones, y sus picos son mucho menores (89 ms frente a 153–303 ms), pese a tener mapas el doble de grandes y mucho más contenido visual.
- **PC:** con explosiones, 5.0 es más rápida que 4.0 en los tres mapas (17,5–18,7 ms frente a 24,8–33,7). En reposo queda dentro del rango de 4.0 (Caldera Roja 5,9 frente a 5,7–6,5; Archipiélago y Puerto, con lluvia, ~15–20 ms en ambas versiones). Los rayos de luz se cachean a media resolución desde la ronda de pendientes.
- **Memoria de la escenografía:** 17,1 MB por mapa en Ultra (5,2 MB en Económico); la caché retiene como máximo 2 mapas (32 MB tras recorrer 6 mapas, antes 65 MB). Se mide con `node tests/memory.cjs`.
## Limitaciones de la medición
- No hay un Galaxy S23 Ultra físico: el perfil «android» emula viewport, DPR 3,5, pantalla táctil y CPU 4× más lenta con CDP, pero la GPU es la del PC. Sirve para comparar versiones, no como cifra absoluta del teléfono.
- El navegador de pruebas es Chromium headless con GPU real (ANGLE/D3D11).
