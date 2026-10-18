# Progreso de Cooper's Siege

## Actualización bilingüe es-419 / en-US

Base publicada de 5.2: origin/main `0f8cc74`, PR #3 fusionada. Rama `feature/coopers-siege-i18n-es419-en`, creada desde esa base con árbol limpio y referencias actualizadas. Codex trabajó solo en este árbol. No hacer merge ni desplegar sin autorización.

Localización terminada: **1620 claves por idioma**, **119 recursos originales corregidos en español**, **1520 valores ingleses adaptados distintos** y 100 compartidos. Historia completa: 17 capítulos, 106 escenas, 319 intervenciones, créditos y frases de fase. Guardado de campaña v1, mecánicas, IDs, semillas, IA, inventario, terreno y protocolo LAN conservados.

Servicio/catálogos en `src/i18n/`; esquema narrativo estable en `src/campaign/story.js`. Selector 🌐 ES / EN disponible en todas las pantallas; preferencia independiente, cambio sin reiniciar combate, audio ni diálogo. Se conservan índice/avance, historial y callbacks. Los textos flotantes y avisos se actualizan sin reiniciar su duración.

QA: **20/20 suites** originales y nuevas, más repetición de las suites afectadas. **70 importaciones**, guardado generado con código real 5.2, **68 victorias/34 estados por idioma**, reinicio de Chromium e idiomas opuestos en LAN aprobados. **264 capturas** (22 pantallas × dos idiomas × seis perfiles) y auditoría residual sin pendientes. Pruebas/mediciones y límites: [QA-LOCALIZACION.md](docs/QA-LOCALIZACION.md); arquitectura/cobertura: [LOCALIZACION.md](docs/LOCALIZACION.md); nomenclatura completa: [GLOSARIO.md](docs/GLOSARIO.md).

Rendimiento final, tres rondas alternadas: frame medio Android emulado 13,012 ms (5.2), 12,959 ms (es-419) y 13,150 ms (en-US). HUD adicional ≈0,010 ms, memoria retenida adicional ≈0,53 MB y peor p95 del cambio puntual 38,2 ms. GPU RTX 5080 Laptop, CPU 4× y DPR 3.5; no es una medición del teléfono físico ni prueba causal de cada diferencia.

Pendiente humano: Galaxy S23 Ultra físico (Chrome/Samsung Internet, selector nativo, barras/áreas seguras, multitáctil y sesiones largas), LAN entre aparatos/red real y lectura editorial externa. No se conocen defectos funcionales abiertos de localización en los recorridos probados. Capturas representativas y métricas versionadas en `docs/i18n/`; originales/logs en `test-results/i18n/`.

Fases A–H completas. [PR #4](https://github.com/pablojairlopez-source/coopers-siege/pull/4) abierta hacia main, sin merge. [Vista previa bilingüe verificada](https://raw.githack.com/pablojairlopez-source/coopers-siege/2f7aa2e4f727fac8d55914fadd1d2409df998721/index.html), fijada al commit de código/QA `2f7aa2e`; el cierre H posterior solo documenta la entrega. Carga HTTP 200, cambio por selector ES/EN y persistencia tras recargar aprobados en Chromium con perfil S23, sin errores JS ni recursos del juego fallidos. Si aparece el aviso del proveedor, pulsar **Open the page**. El dominio tiene almacenamiento separado; importar el progreso exportado de 5.2 para probarlo allí.

Commits publicados de implementación: `b6d3920` (A/B), `bb4464f` (C/F), `9237488` (G: guardados/LAN) y `2f7aa2e` (G: QA visual/rendimiento); consultar `git log` para el cierre H. Main permanece en `0f8cc74`; no se publicó GitHub Pages. No repetir extracción ni implementar otra campaña. Para nuevos textos, editar catálogos/esquema y ejecutar la suite específica y las pruebas de la vista afectada. Se conservan las limitaciones históricas de balance de 5.2 descritas más abajo.

Lo que sigue conserva el registro histórico de 5.2; su estado de publicación queda supersedido por la base confirmada de esta actualización.

**5.1 publicada** en `main` (PR #2). **5.2 «El Torneo del Universo» en desarrollo** en la rama `feature/coopers-siege-5-2-torneo`. Estado técnico: `docs/HANDOFF.md`; diseño y seguimiento: `docs/CAMPANA-5.2.md`.

## 5.2 — El Torneo del Universo

| Subfase | Estado | Resumen |
|---|---|---|
| A · Rama, línea base, continuidad | ✅ | `npm test` 8/8 en `16c8bf4`; `docs/CAMPANA-5.2.md` |
| B · Arsenal infinito y equidad | ✅ | Bazuca y granada común ∞; arsenal inicial estándar |
| C · Huesitos | ✅ | Suministros con física, recompensas y LAN autoritativa |
| D · Campaña | ✅ | 17 capítulos × 2 batallas, guardado |
| E · Jefes | ✅ | Escala 2×, 250–400 HP, habilidades |
| F · Historia y diálogo | ✅ | 4 actos, retratos 3D |
| G · Interfaz de campaña | ✅ | Recorrido, galería, trofeo, final |
| H · Pruebas y balance | ✅ | `npm test` 12/12; balance documentado en `docs/NOTAS-5.2.md` |
| Entrega | ✅ | Capturas, CHANGELOG, README, notas, vista previa raw.githack, PR sin merge |
| I · Auditoría de física gigante | ✅ | Cuerpo y apoyo 2×; aparición y rescate seguros en 17 mapas; commit `116bd43` |
| J · Auditoría IA, inventario y continuidad | ✅ | Predicción real de bazuca/granada, tiros descendentes, rutas con saltos; última carga de escopeta, historial persistido, aviso de fallo de guardado y margen del quejido ligero |
| K · Medición y entrega de auditoría | ✅ | Comparación por semilla real, simulación estricta a 60 Hz, rendimiento y PR #3; ver `docs/AUDITORIA-5.2.md` |

## Pendiente heredado de 5.1
- Auditoría independiente (Codex, 17-10-2026): 15/15 suites aprobadas. Batalla 1: 0/36 límites y 26,5 turnos medios frente a 14/36 y 52,1 de base; física gigante verificada en 17 mapas. La muestra estricta adicional conserva un caso largo en Catedral Gótica, documentado con semilla. Datos y límites: docs/AUDITORIA-5.2.md.
- Validación en un Galaxy S23 Ultra físico; escucha humana de las piezas revisadas.

## Registro de sesiones
- Sesiones 1–3: 5.0 completa y publicada.
- Sesión 4 (Claude Code, 17-10-2026): 5.1 completa y PR abierta.
- Sesión 5 (Claude Code, 17-10-2026): auditoría 5.1 y publicación (PR #2, autorizada).
- Sesión 6 (Claude Code, 17-10-2026): 5.2 completa (A–H y entrega), PR abierta sin merge.

- Sesión 7 (Codex, 17-10-2026): auditoría independiente, subfases I–K, commits y push a la rama 5.2, PR #3 actualizada sin merge; prueba física en S23 Ultra pendiente.
