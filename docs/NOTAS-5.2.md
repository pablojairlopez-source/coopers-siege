# Cooper's Siege 5.2 — Notas de entrega

Rama `feature/coopers-siege-5-2-torneo`. Diseño y registro por fases: [`CAMPANA-5.2.md`](CAMPANA-5.2.md).

Auditoría independiente posterior a `0d816fe`: [`AUDITORIA-5.2.md`](AUDITORIA-5.2.md). Física gigante, IA de campaña, última carga de escopeta, historial tras recarga, fallo de guardado y margen del quejido ligero corregidos. Las cifras de entrega originales se conservan abajo como historial; consultar la auditoría para las mediciones finales. 15/15 suites aprobadas.

## Cómo jugar lo nuevo

- **Campaña:** menú principal → **🏆 CAMPAÑA — EL TORNEO DEL UNIVERSO** (en móvil apaisado también el botón compacto «🏆 CAMPAÑA» de la fila superior). Elige un capítulo desbloqueado en el recorrido y pulsa **JUGAR**. Cada capítulo: diálogos → batalla 1 (3 contra 5) → diálogo → presentación del jefe → jefe → victoria. Si pierdes, **REINTENTAR** repite esa misma batalla; la batalla 1 ganada no se repite.
- **Diálogos:** toca la caja, pulsa `Espacio` o `Enter` (o **Siguiente**) para completar el texto y avanzar; **Omitir** o `Esc` salta la escena; **Historial** o `H` muestra todo lo leído.
- **Jefes:** al empezar su turno anuncian una habilidad con una **zona roja** y la ejecutan en su turno siguiente. Sal de la zona, protégete o causa **40 de daño** al jefe antes de que actúe para interrumpirla. La barra superior muestra su vida, la fase (Cooper Cero) y la habilidad preparada.
- **Huesitos:** tócalos con cualquier pug, en el aire o en el suelo. Selector «Huesitos» en «Personalizar nombres y arsenal» (normales 2–4 rondas, frecuentes 1–2, escasos 4–6, desactivados).
- **Ajustes de campaña:** dificultad, accesorio y pelaje de la escuadra, exportar/importar progreso, nueva campaña (pide confirmación) e historial de diálogos.

## Archivos de configuración

| Archivo | Qué se ajusta |
|---|---|
| `src/gameplay/inventory-balance.js` | Armas infinitas y arsenal estándar |
| `src/gameplay/supply-config.js` | Frecuencias, máximo simultáneo, caducidad, física, probabilidades 75/20/5, armas, cantidades y topes de los huesitos |
| `src/campaign/chapters.js` | Mapa, variante, rivales, jefe (vida 250–400, habilidades, estilo de IA, aspecto), fases de Cooper Cero, vida de los esbirros (`botHp`), daño de interrupción |
| `src/campaign/story.js` | Todos los textos de la historia |

## Arquitectura

- `CS5.arsenal` (inventario por equipo; `canFire`/`consume`/`grant`) lo usan `shoot()`, `selectWeapon()` y la IA (`aiChooseWeapon` en `index.html`).
- `CS5.supply` (huesitos): `reset` en `newMatch`, `onTurn` al final de `nextTurn`, `step` en `step()`, `onExplosion` en `explode()`, `draw` en `overlay()`. Autoridad: partida local o anfitrión LAN (`authority()`); versus envía `supply_pick`; cooperativo lleva `supplies` en `coop_state`.
- `CS5.bosses`: `setup` (tamaño/caja de impacto 2×, `mass`, `maxHp`), `onTurnStart` (anuncio), `aiTurn`/`execute`, `onDamage` (interrupción y fases), `rescue` (agua), `draw` (aura y zona). Ayudantes en `index.html`: `pugHit`, `pugCY`, `pugScale`; `damage()` ignora `c._immune` (el jefe no se daña con sus propias habilidades).
- `CS5.campaign`: guardado `coopers-siege-campaign-v1` (validado por `sanitize`), flujo, interfaz. `newMatch` llama a `applySettings` y `setupMatch` cuando `app.campaign` está activo; `showMatchResult` → `onMatchEnd`; la pausa dramática → `reveal`.
- `CS5.dialogue`, `CS5.portraits`, `CS5.view3d`: un renderizador WebGL propio fuera de pantalla que reutiliza `drawPug` para retratos (con caché) y para `CS5.trophy`.

## Pruebas (runner de npm test: 15 suites)

LAN 6v6 original · LAN 5.1 · escenarios ×17 · gore · HUD · controles · **arsenal 5.2** · **huesitos 5.2** · **campaña 5.2** · **narrativa 5.2** · música · mezcla. Última ejecución completa de auditoría: 15/15 en verde con node tests/run-all.cjs. Se añaden boss-physics, campaign-ai y campaign-audit.

- `tests/weapons.cjs`: arsenal estándar idéntico (humano/CPU, 2–4 equipos), bazuca y granada ∞, limitadas 2 → 0, agotadas no se eligen ni disparan, IA con inventarios aleatorios nunca planifica ni dispara un arma agotada, modos abundante/infinito.
- `tests/supplies.cjs`: intervalo 2–4 rondas, 102 caídas en los 17 mapas (87 en suelo, el resto al agua) sin quedar nunca dentro de la roca, re-caída al destruir el suelo, recogida humana en el suelo y en vuelo, bot que camina hasta el huesito, caducidad, máximo simultáneo, distribución sobre 20 000 sorteos (74,7 / 20,1 / 5,2 %), nunca bazuca/granada, topes con re-sorteo y respaldo curativo, canje único, explosión, LAN versus (el invitado no decide; inventario sincronizado; mensajes repetidos no duplican) y cooperativo.
- `tests/campaign.cjs`: los **34 estados** en orden por el flujo real, 5 bots de la variante correcta con cosméticos variados y reproducibles, jefes 2× con 250–400 HP, Roco en 16–17, arsenal estándar en ambos bandos, derrota y reintento (batalla 1 y jefe), guardado tras recargar, exportar/importar y saneado, final con trofeo, créditos y poscréditos; las 31 habilidades de los 17 jefes, interrupción, fases de Cooper Cero, rescate del agua y turno real de la IA del jefe sin gastar munición.
- `tests/narrative.cjs`: ≥ 6 conversaciones y ≥ 16 líneas por capítulo (307 líneas, ninguna repetida), retratos 3D de 40 personajes distintos, expresión, avanzar/omitir/historial sin bloqueos, persistencia de diálogos vistos, diseño en S23 Ultra, plegable, tablet y PC (dentro de pantalla, sin tapar el retrato, botones ≥ 36 px).
- Pruebas existentes adaptadas sin cambiar aserciones: `lan-coop.cjs` (una línea de preparación que concede un premio curativo, que ya no está en el arsenal inicial) y `controls.cjs` (concede una granada polar antes de probar «cancelar no gasta»).

## Balance (simulación CPU contra CPU, `node tests/balance.cjs`)

La escuadra del jugador la juega la misma IA que los rivales, así que mide el equilibrio entre bandos, no la habilidad humana (un humano además esquiva zonas e interrumpe habilidades). Capítulos 1, 4, 8, 11, 13 y 17 × 6 semillas, dificultad normal.

| Versión | Batalla 1: victorias de la escuadra | Tablas (90 turnos) | Jefe: victorias de la escuadra | Turnos medios jefe | Habilidades por combate |
|---|---|---|---|---|---|
| v1 (esbirros 100 HP, escuadra en un extremo) | 3 % | 25/36 | 22 % | 19,6 | 3,2 |
| v2 (esbirros 60 HP) | 8 % | 26/36 | 22 % | 19,6 | 3,2 |
| **v3 (rivales intercalados + la IA se acerca si no tiene disparo)** | **28 %** (45 % de las decididas) | 14/36 | **36 %** | 24,3 | 3,9 |
| **v4 (auditoría Codex: trayectorias y navegación reales, física gigante)** | **50 %** | **0/36** | **22 %** | **19,8** | **2,9** |

Cambios aplicados: `botHp` 60 (5 × 60 = 300, igual que la escuadra), colocación intercalada como en las partidas normales y, solo en campaña, aproximación de la IA cuando no tiene disparo útil. Datos: `docs/perf/balance-5.2-*.json`. En «fácil» y «difícil» la dificultad cambia la puntería de ambos bandos en esta simulación (fácil: jefe 42 %; difícil: 75 %), así que esos números no representan la experiencia de un humano.

v4 conserva HP, precisión por dificultad, arsenal estándar y suministros. Batalla 1 pasa de 52,1 a 26,5 turnos medios. Los 72 combates finales terminan sin bloqueos ni turnos forzados. Los jefes son más exigentes para la escuadra CPU; valorar dificultad humana esquivando e interrumpiendo habilidades. Datos y comparación por semilla real: `docs/perf/auditoria-5.2-*.json`.

## Rendimiento (emulado, `docs/perf/final-5.2.json`)

Android emulado (S23 Ultra, CPU 4× más lenta): reposo 8,7–16,3 ms y explosiones 17,7–25,7 ms de media en tropical, volcán, caramelo, espinas y jefes de los capítulos 4 y 17 (5.1: 10–17 / 21–30 ms). Distrito Neón varía entre 12 y 17 ms en reposo de una ejecución a otra (`neon-variacion-5.2.json`); sus batallas de campaña quedan dentro de ese margen. El huesito no usa `shadowBlur` (caro en lienzos 2D móviles).

## Capturas

Auditoría posterior: `docs/perf/auditoria-5.2-rendimiento.json` (medición aislada, Chrome 155). Android/CPU 4×: reposo 8,85–24,79 ms; explosiones 17,11–43,55 ms medios, pico 401,7 ms en Caldera Roja. Planificación de IA: 5,89–17,22 ms medios por caso, máximo observado 30 ms. No comparar directamente con los tiempos históricos anteriores ni asumir 60 FPS en el teléfono; detalles en `AUDITORIA-5.2.md`.

`docs/screenshots/5.2/` (escritorio, S23 Ultra y plegable): huesito en paracaídas, recorrido, diálogo con retrato 3D, presentación de Cooper Cero, combate contra el Faraón Costilla con zona anunciada y barra de jefe, batalla 1, derrota, galería de jefes y trofeo.

## Vista previa para el Galaxy S23 Ultra

Sin tocar la versión publicada: https://raw.githack.com/pablojairlopez-source/coopers-siege/feature/coopers-siege-5-2-torneo/index.html (raw.githack sirve la rama por HTTPS; la primera vez puede mostrar un aviso con «Open the page»). Se actualiza con cada push de la rama.

## Pendiente / limitaciones

- (Resuelto) Diálogos de ejemplo del encargo integrados literalmente: presentación del torneo (`c1.intro`), Faraón Costilla (`c4.bossIntro`), revelación (`c16.intro`), carta de invitación (`prologue`), advertencia de Caldera Roja con la interrupción de Huesón (`c11.victory`), frase final de Huesón y respuesta de Cooper (`finale`), título «COOPER'S TROPHY — CAMPEONES DEL UNIVERSO» y botón «CAMPAÑA — EL TORNEO DEL UNIVERSO».
- Validación humana en un S23 Ultra físico (controles, legibilidad de los diálogos, rendimiento real). Caso residual de combate largo en Catedral Gótica y exigencia de los jefes para CPU: ver AUDITORIA-5.2.md.
- (Resuelto en auditoría Codex) Física de jefes a 2× también contra el terreno, aparición, teletransporte y rescate; pruebas de túneles/paredes/techos/saltos/caídas y 51 apariciones/102 rescates en los 17 mapas.
- Música: el jefe final usa la pieza de «Última Estrella» en estado de clímax (la música adaptativa pasa sola a clímax con un único rival) más rugidos y estribillos de fase; no hay una pieza nueva para el jefe final.
