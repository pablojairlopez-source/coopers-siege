# Traspaso entre agentes (Claude Code ⇄ Codex)

## Trabajo actual · Localización bilingüe

El usuario confirma y Git verifica la fusión de PR #3: `origin/main` `0f8cc74`. Árbol inicialmente limpio; referencias actualizadas sin descartar trabajo. Rama nueva `feature/coopers-siege-i18n-es419-en` creada desde esa base. Claude está sin disponibilidad; Codex trabaja solo en este árbol.

Encargo completo leído del adjunto del usuario. Plan A–H, decisiones y glosario en `docs/LOCALIZACION.md`. Inventario con Acorn/parse5 (solo desarrollo): 3059 candidatas antes de clasificar notación musical/IDs/código. Línea base ejecutada: 15/15 suites aprobadas. Servicio centralizado inicial y catálogos mínimos en `src/i18n/`; `tests/i18n-core.cjs` aprobado. Aún no conectado al motor. Próximo paso: extracción por claves técnicas, revisión es-419 y adaptación íntegra en-US, integración y cambio en vivo sin alterar guardados ni estado. No repetir la línea base salvo cambios que lo justifiquen.

No hacer merge ni publicar. El traspaso histórico que sigue describe la auditoría ya integrada en 5.2, no el estado actual de la PR #3.

> Continuidad subordinada a Git. Antes de continuar: estado, rama, últimos diez commits y lectura de AGENTS/CLAUDE/PROGRESO/CAMPANA/NOTAS.

## Último traspaso · 17-10-2026 · Codex

- Rama: feature/coopers-siege-5-2-torneo. Partida de 0d816fe, árbol limpio y remoto confirmado; fases A–H conservadas.
- Física gigante: commit 116bd43. IA y auditoría: 5362225. Medidas y documentación: commit de subfase K posterior (consultar git log).
- PR #3: https://github.com/pablojairlopez-source/coopers-siege/pull/3, abierta hacia main. No hacer merge ni publicar sin autorización explícita.
- Estado: implementación y auditoría terminadas; pendiente prueba humana en Galaxy S23 Ultra físico. Detalle y limitaciones: docs/AUDITORIA-5.2.md.

## Cambios de auditoría

- Terrain.bodyClear/support/footSolid/surface/spot reciben escala. Cuerpo físico gigante 36×52, pie de 36 px, obstáculos finos. Muestreo normal 1× conservado. Aparición, teletransporte, fase, carga y rescate validan 2×; si desaparece la plataforma se busca otro apoyo. No se cambia el generador ni la colisión de proyectiles.
- src/gameplay/campaign-ai.js: exclusivo de campaña, compartido por ambos bandos; bazuca y granada con trayectoria real, tiros descendentes, daño útil/remates y cuidado de aliados; aproximación y saltos simulados con copias de characterPhysics. Mantiene precisión por dificultad, HP y arsenal. CPU libre y LAN conservan el planificador anterior.
- Última carga de escopeta: dos tiros con una carga, sin cambiar de arma en medio, para humano/CPU.
- Historial reconstruido tras recargar desde escenas vistas, cierre con Escape/toque, sin manejadores acumulados; aviso ante fallo real del almacenamiento, exportación disponible. Quejido ligero con más margen sobre la música.

## Pruebas y mediciones

- 15/15 suites aprobadas en una ejecución completa de node tests/run-all.cjs, el runner de npm test. Incluye LAN original sin cambiar aserciones, suministros, inventarios, los 34 estados, retratos/diálogos, controles en seis pantallas y audio.
- Nuevas: boss-physics (17 mapas × 3 semillas, 51 apariciones, 102 rescates y geometría sintética), campaign-ai (24 trayectorias reales y 408 planes equitativos), campaign-audit (historial persistido, almacenamiento y escopeta).
- Reproducción histórica: 14/36 batallas 1 alcanzan 90 turnos; media 52,1. Revisión final: 0/36, media 26,5 y 50 % victorias de escuadra CPU. Jefes: 19,8 turnos y 22 % victorias CPU. Cero turnos forzados/bloqueos en 72 combates. Comparación adicional con 0d816fe sobre las mismas 72 semillas reales: docs/perf/auditoria-5.2-base-pareada.json.
- Validación adicional de 34 combates a 60 Hz, 17 mapas, sin forzar turnos: un límite en batalla 1 (Catedral Gótica); jefes sin límites ni bloqueos físicos.
- Datos, coste del planificador y frames: docs/perf/auditoria-5.2-*.json. Capturas S23 Ultra: docs/screenshots/5.2-auditoria/.
- Medición aislada Android/CPU 4×: planificación 5,89–17,22 ms medios por caso, máximo 30 ms; explosiones 17,11–43,55 ms medios, pico 401,7 ms en Caldera. No garantiza 60 FPS; validar rendimiento sostenido en el teléfono físico.
- En este entorno no había npm ni Chromium de Playwright disponible en la ruta prevista: se utilizó Node 24.19.0 del runtime y Chrome local con TEST_BROWSER_PATH. No declarar el teléfono físico como probado.

## Limitaciones / próxima tarea

1. Prueba final humana en Galaxy S23 Ultra: multitáctil, cancelar, rotación/pantalla completa, diálogos/historial, pausas al pensar la CPU, temperatura/rendimiento sostenido y escucha. La emulación no sustituye estas comprobaciones.
2. Catedral Gótica, batalla 1, semilla 4217271691 a 60 Hz: dos supervivientes a unos 2287 px; la IA no encuentra camino seguro en su horizonte de tres segundos. Repetición confirmada, sin regalar armas ni forzar ganador. Reproducir con BALANCE_SEEDS_FROM=docs/perf/auditoria-5.2-17-mapas.json, BALANCE_STRICT=1, BALANCE_HZ=60, node tests/balance.cjs test-results/catedral.json 15 1.
3. Jefes más exigentes para CPU: 22 % de victorias. Un humano puede esquivar/interrumpir; valorar dificultad jugando antes de ajustar cifras.
4. Predicción física de bazuca/granada verificada; los premios especiales conservan heurísticas según arma, sin simular todas sus mecánicas futuras. No hay prueba exhaustiva de todas las semillas ni de todas las destrucciones posibles.

## Repetir verificaciones

Con Node/npm y Playwright configurados: npm test. Alternativa idéntica: node tests/run-all.cjs. Si falta Chromium, TEST_BROWSER_PATH puede apuntar al Chrome local.

- node tests/balance.cjs test-results/balance.json 1,4,8,11,13,17 6
- BALANCE_REF=0d816fe y BALANCE_SEEDS_FROM=docs/perf/auditoria-5.2-final.json para comparar código anterior sin cambiar de rama.
- BALANCE_STRICT=1 y BALANCE_HZ=60 para no descartar proyectiles ni forzar turnos.
- node tests/perf.cjs test-results/perf.json 0,2,c4b2,c17b2 pc,android (sin otras pruebas simultáneas).
- node tests/ai-timing.cjs test-results/ia.json (S23 Ultra emulado, CPU 4×).

## Decisiones conservadas de A–H

CS5.arsenal unifica consumo y comprobación; normalize restaura Infinity tras JSON LAN. Huesitos con semilla derivada y recogida autoritativa. Habilidades de jefe anunciadas un turno antes e interrumpibles con 40 de daño; rescate pierde 45 HP. Guardado versionado en coopers-siege-campaign-v1. Retratos/trofeo comparten renderizador fuera de pantalla, con respaldo 2D. LAN cooperativo: anfitrión simula; versus: misma semilla.
