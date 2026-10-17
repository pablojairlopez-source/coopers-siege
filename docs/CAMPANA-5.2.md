# Cooper's Siege 5.2 — «El Torneo del Universo»

Documento de diseño y seguimiento de la versión 5.2. Rama: `feature/coopers-siege-5-2-torneo` (desde `origin/main` `16c8bf4`, 5.1 publicada). Sin merge ni despliegue sin autorización del usuario.

## Línea base

`npm test` en `16c8bf4` (17-10-2026): 8/8 suites en verde (LAN 6v6 original, LAN 5.1, escenarios ×17, gore, HUD, controles, música, mezcla).

## Subfases

| Fase | Contenido | Estado |
|---|---|---|
| 5.2-A | Rama, línea base, este documento, continuidad | ✅ |
| 5.2-B | Arsenal: bazuca y granada común infinitas; arsenal inicial estándar; igualdad humano/bot | ✅ |
| 5.2-C | Huesitos: suministros que caen del cielo, recompensas por categoría, IA y LAN | ✅ |
| 5.2-D | Campaña: 17 capítulos × 2 batallas, guardado, derrota/reintento | ✅ |
| 5.2-E | Jefes gigantes: escala 2×, 250–400 HP, habilidades con enfriamiento, IA temática | ✅ |
| 5.2-F | Historia en 4 actos y diálogo cinematográfico con retratos 3D | ✅ |
| 5.2-G | Interfaz de campaña: recorrido, galería de jefes, trofeo 3D, final y créditos | ✅ |
| 5.2-H | Pruebas nuevas, progresión de 34 estados, balance | ✅ |
| Entrega | Capturas, CHANGELOG, vista previa S23, PR sin merge | ✅ |
| 5.2-I | Auditoría física gigante, aparición y rescate seguros en 17 mapas (`116bd43`) | ✅ |
| 5.2-J | IA con trayectorias y rutas reales, escopeta, historial y guardado (`5362225`) | ✅ |
| 5.2-K | Medición independiente y entrega de auditoría; ver `AUDITORIA-5.2.md` | ✅ |

## Fase B — Arsenal

- **Infinitas para todos:** bazuca (`rocket`), granada común (`grenade`) y bate (`bat`, reutilizable). Humanos, bots, enemigos de campaña y jefes.
- **Limitadas:** granadas especiales (polar, adhesiva, racimo, sagrada) y el resto.
- **Arsenal inicial estándar:** bazuca ∞, granada ∞, escopeta 2, mina 2, bate ∞; resto 0 (sin superarmas).
- **Personalizadas:** «Abundante» (el arsenal clásico de 5.1 ×2, con bazuca y granada ∞) e «Infinita» se conservan.
- **Equidad:** el inventario es por equipo; humano y bot pasan por la misma comprobación (`CS5.arsenal.canFire`) y el mismo consumo (`CS5.arsenal.consume`). La IA nunca elige un arma agotada (si lo intentara, `shoot()` la rechaza y la IA recurre a la bazuca).
- Módulo: `src/gameplay/inventory-balance.js`.

## Fase C — Huesitos (suministros)

- Configuración en `src/gameplay/supply-config.js` (intervalo de rondas, máximo simultáneo, caducidad, probabilidades, topes).
- Caen del cielo con paracaídas cada 2–4 rondas (sorteo determinista), con gravedad, deriva por viento, colisión con el terreno, nunca dentro de la roca; si el suelo bajo un huesito se destruye, vuelve a caer; si cae al agua, se pierde.
- Se recogen en vuelo o en el suelo tocándolos con cualquier pug. Recompensa: categoría (comunes 75 %, potentes 20 %, legendarias 5 %) y después arma y cantidad; si se supera el tope del equipo, se vuelve a sortear. Nunca bazuca ni granada común.
- LAN: aparición determinista (semilla de la partida + ronda), identificadores únicos, recogida y sorteo decididos por el anfitrión (versus: mensaje `supply_pick`; cooperativo: viaja en la instantánea), una sola recogida válida por identificador.
- IA: detecta huesitos, valora distancia, desnivel, agua y peligro (minas, proyectiles) y camina hacia ellos antes de disparar; no conoce el contenido.
- Módulo: `src/gameplay/supply-drops.js`.

## Fases D–G — Campaña

- Menú: «CAMPAÑA — EL TORNEO DEL UNIVERSO». 17 capítulos × 2 batallas = 34.
- Batalla 1: Cooper, Pipa y Bongo contra 5 bots de la misma variante con cosméticos reproducibles (semilla del capítulo). Batalla 2: jefe gigante (≈2× lineal, 250–400 HP).
- Derrota: pantalla de derrota y reintento de la misma batalla; no se pierde progreso ni se repite la batalla 1 ya ganada.
- Datos: `src/campaign/chapters.js` (mapas, variantes, jefes, habilidades), `src/campaign/story.js` (diálogos), `src/campaign/campaign.js` (estado, guardado, flujo), `src/campaign/bosses.js` (habilidades e IA), `src/campaign/dialogue.js` (diálogo y retratos), `src/campaign/trophy.js` (trofeo 3D), `src/ui/campaign.css`, `src/ui/dialogue.css`.
- Guardado: `localStorage['coopers-siege-campaign-v1']` versionado; exportar/importar JSON.

### Capítulos

| # | Mapa | Variante | Jefe |
|---|---|---|---|
| 1 | Archipiélago Sol | Normal | Capitán Brisa |
| 2 | Bosque Umbrío | Zombie | Musgo el Inmortal |
| 3 | Valle Cerezos | Normal | Shogun Pocky |
| 4 | Dunas de Anubis | Esqueleto | Faraón Costilla |
| 5 | Puerto Tempestad | Cíborg | Almirante Tuerca |
| 6 | Bastión Dorado | Normal | Rey Bigotín |
| 7 | Aurora Polar | Fantasma | Dama Escarcha |
| 8 | Distrito Neón | Cíborg | DJ Circuito |
| 9 | Órbita Violeta | Alienígena | Zog-7 |
| 10 | Abismo Atlantis | Fantasma | Guardián Abisal |
| 11 | Caldera Roja | Demonio | General Brasa |
| 12 | Kilómetro Cero | Zombie | Doctor Zarpazo |
| 13 | Fundición Omega | Cíborg | PROTO-PUG 9000 |
| 14 | Dulce Caos | Normal | Chef Glaseado |
| 15 | Catedral Gótica | Demonio | Obispo Mordisco |
| 16 | Jardín de Espinas | Fantasma | Guardián Zarza |
| 17 | Última Estrella | Fantasma | Cooper Cero (400 HP, fases) |

## Decisiones

- El arsenal estándar ya no incluye el premio curativo. La prueba original `tests/lan-coop.cjs` usaba uno en el turno del invitado: se añadió **una línea de preparación** (el anfitrión concede un premio curativo al equipo, como haría un huesito) **sin tocar ninguna aserción**.
- `tests/controls.cjs` buscaba un arma «cargable, sin objetivo y limitada» del arsenal inicial; en el arsenal estándar no existe ninguna, así que la prueba concede antes una granada polar al equipo.

## Registro

- 17-10-2026 · Claude Code (Opus) · 5.2-A: rama creada, línea base 8/8, documento creado.
- 17-10-2026 · Claude Code (Opus) · 5.2-B: `CS5.arsenal`; IA que elige solo entre armas con munición (`aiChooseWeapon`), cajas de impacto escalables (`pugHit`, `pugCY`, `pugScale`) y resistencia al empuje (`mass`) para los jefes; `tests/weapons.cjs`. `npm test` 9/9.
- 17-10-2026 · Claude Code (Opus) · 5.2-C: `CS5.supply` + `CS5.supplyConfig`; selector «Huesitos» (normales/frecuentes/escasos/desactivados) también enviado en `match_start`; insignia «NUEVO» en el arsenal; sonidos `supplyDrop/Land/Expire`, `pickup`; `tests/supplies.cjs`; `tests/shots-52.cjs` (capturas). `npm test` 10/10.
- 17-10-2026 · Claude Code (Opus) · 5.2-D/E/F/G: `src/campaign/{chapters,story,bosses,dialogue,trophy,campaign}.js`, `src/ui/dialogue.css`, estilos de campaña; botón «CAMPAÑA — EL TORNEO DEL UNIVERSO» (y acceso compacto en móvil apaisado); `tests/campaign.cjs` (34 estados) y `tests/narrative.cjs`. `npm test` 12/12.
- 17-10-2026 · Claude Code (Opus) · 5.2-H y entrega: balance en tres iteraciones (esbirros 60 HP, colocación intercalada, aproximación de la IA en campaña), tarjeta de jefe y resultados en dos columnas en móvil, texto progresivo por tiempo real, defectos corregidos (diálogos vistos sin cargar la campaña, retrato sin guardado, retratos duplicados de jefes demonio), rendimiento emulado, capturas, CHANGELOG, README y `docs/NOTAS-5.2.md`.
