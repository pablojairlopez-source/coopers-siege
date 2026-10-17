# Cooper's Siege 5.0 — Fase A: auditoría y línea base

Base auditada: `origin/main` @ `c8ced21` («Agregar cooperativo LAN 6v6 y ajustar audio y proyectiles»).
Rama de trabajo: `feature/coopers-siege-5-nextgen`.

## 1. Arquitectura actual

Todo el juego vive en `index.html` (≈ 9 300 líneas, 1,2 MB, de los cuales ≈ 640 KB son un MP3 en base64).
No hay build: GitHub Pages sirve el archivo tal cual.

| Sistema | Ubicación (aprox.) | Descripción |
|---|---|---|
| Presets gráficos y resolución | `graphicsPresets`, `applyGraphicsPreset`, `monitorGraphicsFPS` | 4 niveles + automático; ajusta DPR, partículas, segmentos, rayos. Ya baja de nivel si cae el FPS. |
| Mundo y terreno | `W=1536`, `H=768`, `WATER=695`, `class Terrain` | Máscara binaria `Uint8Array(W*H)`, generada con una fórmula por mapa; textura pintada píxel a píxel en CPU (`Terrain.paint`). |
| Renderizador | `class DepthRenderer` | WebGL 2 (fallback WebGL 1 y Canvas 2D). Una sola pasada *forward*: terreno frontal texturizado, paredes extruidas por *chunks*, props 3D, objetos (pugs/proyectiles) generados en CPU cada frame, agua con shader propio. PBR GGX simplificado, niebla y ACES parcial en el fragment shader. Sin *framebuffers*, sin post-proceso, sin sombras reales. |
| Fondo | `drawPixelScenery`, `makeSceneLayer`, `drawExpandedLayer` | Canvas 2D detrás del WebGL: degradado de cielo + 3–5 capas de parallax hechas con triángulos/bloques isométricos. |
| Efectos / overlay | `overlay`, `drawCombatFX`, `drawWeather` | Canvas 2D encima del WebGL: partículas, humo, sangre, HUD de apuntado. |
| Personajes | `buildPugRig`, `drawPug`, `drawPugExtrasRig` | Malla procedural (elipsoides/cápsulas) reconstruida en CPU con caché por estado. 7 variantes, 13 accesorios, 8 equipos de espalda. |
| Sangre / gore | `class LiquidBloodEngine` (PBF 2D, 1 600 partículas), `gore`, decals en canvas | 5 niveles de gore. |
| Física / armas | `step`, `stepProjectile`, `detonate`, `characterPhysics` | Paso fijo 1/60 s. 28 armas. Guía de trayectoria con el mismo integrador. |
| IA | `planAI`, `updateAI`, `simulateRocket` | Búsqueda por simulación de disparos. |
| Música | `musicThemes` (16), `adaptiveMusic`, `scheduleAdventureMusic`, `menuLoopEngine` | Un único secuenciador común; cada mapa solo cambia escala, acordes, frase y timbres. Menú: MP3 embebido. |
| Editor | `studio*`, `setupPugPreview` | Editor de terreno (máscara RLE) y de pugs con vista 3D girable. |
| Red | `lanNet` | BroadcastChannel + MQTT sobre WebSocket + WebRTC; versus y cooperativo 6v6 con el anfitrión como autoridad (sincroniza máscara RLE del terreno). |
| Pruebas | `tests/lan-coop.cjs` (Playwright) | LAN 6v6, autoridad, terreno, trayectorias, audio. **Pasa** en la línea base. |

> Nota: el juego tiene **16 escenarios**, no 10 como dice el brief. Se tratan los 16.

## 2. Problemas detectados

### Gráficos
1. **Fondos genéricos**: los 16 mapas reutilizan el mismo lenguaje de triángulos facetados y bloques; solo cambia la paleta. Neón, castillo y fábrica son variaciones de bloques isométricos.
2. **Terreno plano**: el interior es un color liso con bandas onduladas; no hay material, relieve, raíces, rocas, vegetación ni oclusión en cuevas.
3. **Cuevas idénticas**: todos los mapas recortan tres elipses en las mismas posiciones (`250 + i·430`).
4. **Sin post-proceso**: ni bloom real, ni gradación de color por mapa, ni viñeta; las explosiones (en canvas 2D) no iluminan su entorno más que con un *wash* genérico.
5. **Escala**: con zoom base se ve casi todo el mapa (1536 u de ancho); poco espacio táctico.

### Audio
1. **Repetición**: los 16 temas pasan por el mismo planificador (pad cada compás, arpegio en corcheas, bajo en 0/6/10, bombo en 0/10). Tempos entre 74 y 86 BPM: todos suenan a la misma pieza tranquila.
2. **Forma corta**: 32 compases con 4 «movimientos» de 8 compases; los motivos son de 32 pasos.
3. **Riesgo de derechos de autor**: el tema del menú es un MP3 descrito en el propio código como homenaje a «Stickerbush Symphony» (*Donkey Kong Country 2*). El brief prohíbe melodías protegidas: hay que sustituirlo por una composición original. Además pesa ≈ 640 KB dentro del HTML.

### Rendimiento (ver `docs/perf/baseline-4.0.json`)
Medido con `tests/perf.cjs`. Cada frame incluye simulación + render + `readPixels` (sincroniza la GPU).

| Perfil | Mapa | Reposo (ms/frame) | Explosiones grandes (ms/frame, p95 / máx) |
|---|---|---|---|
| PC (RTX 5080 Laptop, D3D11, Ultra) | tropic | 3,19 | 19,6 (25,5 / 55,6) |
| PC | volcano | 3,12 | 14,0 (24,5 / 36,6) |
| PC | harbor | 3,08 | 20,3 (29,7 / 31,1) |
| Android emulado (S23 Ultra, DPR 3,5, CPU ×4 más lenta, Auto) | tropic | 18,3 | 32,2 (39,8 / 133,5) |
| Android emulado | volcano | 9,1 | 25,0 (33,9 / 55,4) |
| Android emulado | harbor | 19,0 | 29,6 (40,2 / 63,7) |

Conclusión: en reposo hay margen; **el coste se dispara en las explosiones** (×5–6), con picos de 55 ms en PC y 133 ms en el móvil emulado. Es un problema previo que la 5.0 debe corregir antes de añadir más efectos.

## 3. Decisión de motor

**Se mantiene y amplía el motor propio (WebGL 2 + Canvas 2D). No se migra a Three.js ni Babylon.js.**

- La simulación (terreno de máscara, proyectiles, IA) es determinista y está acoplada a la LAN; un motor nuevo obligaría a reescribir las 9 000 líneas con un riesgo enorme para el 6v6 y las pruebas.
- El cuello de botella visual no es el motor sino el contenido (fondos, materiales, terreno) y la falta de post-proceso, que sí se pueden añadir al renderizador actual.
- Three.js añadiría ≈ 600 KB y una segunda forma de dibujar los mismos objetos; no aporta nada que justifique el riesgo.
- WebGPU no es necesario: WebGL 2 está disponible en todos los objetivos (incluido Chrome Android) y se conserva el fallback.

## 4. Estrategia de modularización

Migración **progresiva y sin build**: los sistemas nuevos o reescritos van en `src/**` como *scripts* clásicos con rutas relativas, cargados antes del script principal. Comparten el ámbito global con `index.html`, así que pueden sustituir sistemas por partes sin romper la API que usan las pruebas (`window.PocketSiege`, `CooperLAN`). Los *assets* binarios salen del HTML a `assets/`.

## 5. Plan por fases

| Fase | Contenido |
|---|---|
| B | Escenarios 2× más anchos (cámara, minimapa, generación con semilla, migración de mapas del editor, LAN), terreno con materiales por mapa, fondos pintados en capas con dirección de arte propia para los 16 mapas, post-proceso (bloom, gradación por mapa, viñeta). |
| C | Pugs: ojos con parpadeo y mirada, expresiones (miedo, dolor, alegría, derrota), rebote de panza con inercia, reacciones al apuntar/disparar/aterrizar, mejor editor. |
| D | Daño progresivo visible, reacciones por arma y dirección, decals y sangre mejorados, explosiones con onda expansiva, escombros por material y cráteres irregulares, *pooling* y límites. |
| E | Motor musical nuevo: composición por mapa con forma larga (≥ 2–4 min), compases, grooves e instrumentación propios; 8 estados adaptativos; tema de menú original que reemplaza al MP3. Efectos de sonido por familia de armas y ambientes. |
| F | Corregir los picos de las explosiones, escalado adaptativo, UI táctil/S23 Ultra, presets. |
| G | Pruebas (Playwright), capturas antes/después, mediciones finales, PR. |

## 6. Herramientas añadidas en esta fase

- `tests/lib/harness.cjs`: servidor estático del repo, lanzador de Chromium con GPU real (ANGLE/D3D11) y viewports (escritorio, S23 Ultra emulado, plegable, panorámico).
- `tests/visual.cjs`: capturas de menú y de los 16 mapas en combate.
- `tests/perf.cjs`: medición de tiempo de frame en reposo y con explosiones, por perfil.
- Capturas de referencia: `docs/screenshots/4.0/`.

Limitación: no hay un Galaxy S23 Ultra físico; el perfil «android» es una **emulación** (viewport, DPR, UA táctil y CPU ralentizada con CDP) y la GPU sigue siendo la del PC. Sirve para comparar versiones, no como cifra absoluta del teléfono.
