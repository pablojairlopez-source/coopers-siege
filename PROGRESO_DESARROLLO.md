# Progreso de Cooper's Siege

## Actualización bilingüe es-419 / en-US

Base confirmada: `origin/main` `0f8cc74`, PR #3 fusionada. Rama `feature/coopers-siege-i18n-es419-en`, creada con árbol limpio tras `git fetch origin`. Encargo completo leído. Plan A–H y glosario: `docs/LOCALIZACION.md`.

- A en curso: inventario AST/HTML, 3059 candidatas iniciales (incluye identificadores y notación musical que se excluirán editorialmente); 17 capítulos y 307 intervenciones de campaña, además de créditos y frases auxiliares.
- Línea base completa ejecutada: 15/15 suites aprobadas con `node tests/run-all.cjs`, Chrome local y `TEST_BROWSER_PATH`.
- Servicio i18n inicial y catálogos locales implementados; `node tests/i18n-core.cjs` aprobado (detección, preferencia, parámetros, plurales, respaldo, HTML seguro). Aún no conectado al juego ni declarado localización completa.
- Sin cambios de mecánicas, guardados, IA, probabilidades, física ni protocolo LAN.

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
