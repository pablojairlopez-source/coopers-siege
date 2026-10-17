# Traspaso entre agentes (Claude Code ⇄ Codex)

> Fuente de continuidad subordinada a Git. Antes de continuar: `git status`, `git log --oneline -10`, leer este archivo, `PROGRESO_DESARROLLO.md`, `docs/CAMPANA-5.2.md` y `docs/NOTAS-5.2.md`.

## Último traspaso

### Auditoría Codex en curso · 17-10-2026

Partida desde `0d816fe`, árbol limpio y remoto confirmado. Subfase física terminada: `Terrain.bodyClear/support/footSolid/surface/spot` admiten escala; los normales conservan el muestreo original. El jefe usa cuerpo 36×52 y pie de 36 px, con detección de obstáculos finos. Aparición, teletransporte, fase, carga y rescate validan el espacio 2×; el rescate busca otra plataforma si la original desapareció. Sin cambios al generador ni a las colisiones de proyectiles.

Ejecutadas y aprobadas `tests/boss-physics.cjs` (17 mapas × 3 semillas, 51 apariciones, 102 rescates y geometría sintética) y `tests/campaign.cjs` (34 estados y habilidades). Nueva suite añadida a `npm test`. IA/balance y auditoría general siguen en curso; no presentar aún como entrega final.

- **Fecha:** 17-10-2026
- **Agente:** Claude Code (Opus)
- **Rama:** `feature/coopers-siege-5-2-torneo` (desde `origin/main` `16c8bf4`, 5.1 publicada), publicada en `origin`.
- **Último commit confirmado:** «Entrega 5.2» (ver `git log -1`). Fases: 5.2-A `e3ad118`, 5.2-B `0a5efdc`, 5.2-C `66195cb`, 5.2-D/E/F/G `2632f67`; 5.2-H y entrega en el commit siguiente.
- **Cambios sin commit:** ninguno.
- **PR:** abierta hacia `main` **sin merge**. No fusionar ni desplegar sin autorización del usuario.

## Estado

5.2 completa: arsenal, huesitos, campaña de 17 capítulos con jefes, historia y diálogo con retratos 3D, interfaz, trofeo, pruebas, balance, capturas y vista previa. `npm test`: 12/12 en verde.

## Archivos principales

- `src/gameplay/inventory-balance.js`, `supply-config.js`, `supply-drops.js`.
- `src/campaign/chapters.js`, `story.js`, `bosses.js`, `dialogue.js`, `trophy.js`, `campaign.js`.
- `src/ui/campaign.css`, `src/ui/dialogue.css`; `src/audio/sfx.js` (sonidos nuevos); `src/characters/pug-anim.js` (poses de expresión para retratos).
- `index.html`: ayudantes `pugHit`/`pugCY`/`pugScale`, IA `aiChooseWeapon`, enganches de huesitos, jefes y campaña, botón de campaña, ayuda 5.2, versión 5.2.
- Pruebas nuevas: `tests/weapons.cjs`, `supplies.cjs`, `campaign.cjs`, `narrative.cjs`; herramientas `tests/balance.cjs`, `tests/shots-52.cjs`; `tests/perf.cjs` admite `cNbM` (batallas de campaña).

## Errores conocidos / pendientes

- Validación en un S23 Ultra físico pendiente (la vista previa de raw.githack sirve para ello).
- Colisión de los jefes con el terreno a escala 1× (solo visual en túneles estrechos).

## Próxima tarea exacta

Esperar la prueba del usuario en la vista previa (https://raw.githack.com/pablojairlopez-source/coopers-siege/feature/coopers-siege-5-2-torneo/index.html) y sus comentarios en la PR. Ajustes probables: textos en `src/campaign/story.js`, vida y habilidades en `src/campaign/chapters.js` (después `node tests/balance.cjs`), probabilidades en `src/gameplay/supply-config.js`, tamaños de diálogo en `src/ui/dialogue.css`. Merge solo con autorización explícita.

## Comandos para retomar

```powershell
$env:PATH="$env:LOCALAPPDATA\coopers-tools\node-v24.22.0-win-x64;$env:PATH"
git status; git log --oneline -10
npm test
node tests/shots-52.cjs test-results/shots-52 desktop,s23ultra,fold
node tests/balance.cjs test-results/balance.json 1,4,8,11,13,17 6
node tests/perf.cjs test-results/perf.json 0,2,c4b2,c17b2 pc,android
```

## Decisiones de arquitectura

- **Arsenal:** `CS5.arsenal` es la única puerta de consumo y comprobación (humanos, bots, jefes). JSON convierte `Infinity` en `null`: `normalize` lo restaura en el invitado LAN.
- **Huesitos:** semillas sin estado (`hashSeed(seed, ronda/id)`) para que la aparición y el premio sean deterministas en ambos lados; solo la autoridad detecta la recogida.
- **Jefes:** habilidades anunciadas un turno antes y ejecutadas en el siguiente turno del jefe; interrumpibles con 40 de daño. `c._immune` evita que el jefe se dañe con sus propias explosiones síncronas. Caer al agua: −45 y vuelve a su plataforma (`rescue`).
- **Campaña:** `app.campaign` activa `applySettings` (CPU, 45 s, huesitos normales, dificultad guardada) y `setupMatch` (roster, arsenal estándar, terreno sin el editor). La aproximación de la IA cuando no tiene disparo solo se usa en campaña, para no alterar el resto de modos (ni los tiempos de la prueba LAN original).
- **Retratos y trofeo:** contexto WebGL propio fuera de pantalla (`CS5.view3d`), copiado a lienzos 2D; sin WebGL se usa el dibujo 2D.
- **Herencia 5.1:** controles `CS5.attack`; buses de audio; LAN cooperativo = anfitrión simula; versus = ambos simulan con la misma semilla.

## Bloqueadores conocidos

- Sin dispositivo físico: S23 Ultra, plegables y tablets se prueban por emulación (Playwright).
