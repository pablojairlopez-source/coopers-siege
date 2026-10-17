# Cooper's Siege 5.1 — Notas técnicas y de validación

## Controles: comportamiento exacto

Máquina de estados `CS5.attack` (`src/input/attack-controls.js`), común a teclado, ratón y táctil:

| Estado | Entrada | Resultado |
|---|---|---|
| reposo | ATACAR (toque/clic), `F`, `Enter` | pasa a **apuntando**; nunca dispara |
| reposo | `Espacio`, botón SALTAR | salto (máx. uno cada 180 ms; un toque = un salto) |
| apuntando | `W`/`S`, `↑`/`↓`, pad ÁNGULO, arrastre en el escenario | cambia el ángulo; la guía predictiva se redibuja |
| apuntando | mantener `Espacio` / `F` / `Enter` / ATACAR | pasa a **cargando** (potencia 15→100→15, oscilante) |
| apuntando | `Espacio`, botón SALTAR | **no** salta |
| cargando | soltar la **misma** tecla o el **mismo** dedo | `shoot()` una sola vez → reposo |
| cargando | `pointercancel` / pérdida de captura | vuelve a apuntando sin disparar |
| apuntando o cargando | `Esc`, `X`, clic derecho, ✕ CANCELAR | reposo; sin `shoot()`: no gasta munición ni turno |
| cualquiera | fin de turno, pausa, cambio de pug, pérdida de foco | reposo |

- Repeticiones de teclado, un segundo dedo sobre ATACAR y `pointerup` duplicados se ignoran.
- Armas sin carga (bate, botiquín, escudo…): mantener y soltar ataca. Armas con objetivo: si no hay objetivo, soltar vuelve a apuntando y pide marcarlo.
- El ángulo con `W`/`S` es la elevación relativa a la orientación del pug, en [-85°, 90°] sin cruzar la vertical. Para apuntar hacia atrás se gira con `A`/`D` o se arrastra en el escenario / dial. No se cambia `c.dir` desde el ángulo porque en LAN cooperativo la orientación la simula el anfitrión.
- Al expirar el tiempo durante la carga se dispara con la potencia actual (comportamiento de 5.0).
- LAN: los controles solo cambian `app.angle`, `app.power` y `app.charging` y llaman a `shoot()`; en el invitado cooperativo `shoot()` envía la acción y el anfitrión dispara (autoridad sin cambios).

Disposición (`src/ui/controls.css`): arsenal en la esquina inferior izquierda, ‹ › encima, pad ÁNGULO a su derecha (solo al apuntar); ATACAR en la esquina inferior derecha, SALTAR encima con ≥ 12 px de separación, ✕ a la izquierda de SALTAR. Márgenes con `env(safe-area-inset-*)`. Movimiento y SALTAR se ocultan sin pantalla táctil.

## Audio

- Buses: música (paso alto 32 Hz + estante −3 dB a 150 Hz + ducking) · efectos · voces · ambiente → compresor de bus (−12 dB, 2,5:1) → limitador (−3 dB, 20:1).
- Niveles: música 0,44 (antes 0,70; −4 dB), menú 0,21, efectos 0,74, voces 0,45, ambiente 0,36, todos por los deslizadores Maestro/Música/Efectos.
- Por qué no se oían los quejidos: pico 0,22 tras un filtro paso banda estrecho, sonaban en el mismo instante que la explosión que los causaba, el compresor por defecto aplastaba la mezcla y la música iba ~5 dB por encima de los efectos. La muerte no tenía voz. Ahora: síntesis de formantes en 4 niveles, 70 ms de retardo respecto al estallido, bus propio. En LAN cooperativo el anfitrión encola el sonido y el invitado lo reproduce una vez (probado en `tests/lan-51.cjs`).
- Sonoridad por pieza igualada con `CS5.musicTrim` (dispersión 9,5 dB → 0,9 dB, medida con ponderación K aproximada).

## Música y referencias

- De los dos enlaces de YouTube (Dulce Caos y Fundición Omega) solo se pudo leer el **título** de la página («Kirby 64: The Crystal Shards – File Select Theme» y «– Factory Inspection»); **no se escuchó el audio**. Las piezas siguen la dirección escrita por el usuario y rasgos generales del género. Todo es composición original.
- Catedral Gótica: rock gótico original; no usa la melodía, las frases ni la progresión de *Bloody Tears*.
- Jardín de Espinas: evoca cualidades atmosféricas (pads, campanas, arpegios, bajo ambiental, capas que entran y salen) sin tomar melodía, armonía ni arreglo de *Stickerbush Symphony*.
- Métrica en `tests/music.cjs`: frases escritas distintas oídas en los 3 primeros minutos — piezas revisadas 9–14, el resto 3.
- Para escucharlas: `node tests/export-music.cjs 180 B test-results/music-5.1 volcano,supernova,factory,inferno,candy,thorns`.

## Jardín de Espinas

- Índice 16, id `thorns`. Trazado determinista por semilla (`terrain-gen.js`): cuatro troncos de zarza sobre un abismo de nubes, puentes de dos hebras retorcidas, plataformas de raíces y flores con tallo. Caer al abismo elimina, como el agua.
- Las espinas son silueta y terreno destructible; **no hacen daño por contacto** (decisión: evitar riesgos de equilibrio y de sincronía LAN).
- Escenografía en `src/rendering/scenery-thorns.js`, material `bark` + decoración `thorns`, decorados 3D en `props3d.js`, ambiente y material sonoro `wood` en `sfx.js`.

## Qué se probó y cómo

Emulado (Playwright + Chromium, sin dispositivo físico): S23 Ultra 915×412, teléfono pequeño 640×360, plegable cerrado 882×344 y abierto 904×832, tablet 1180×820 y escritorio 1366×768; toques reales del navegador y eventos de puntero sintéticos (multitouch, `pointercancel`); teclado real. Rendimiento con CPU ×4 más lenta como «android» (`docs/perf/final-5.1.json`).

Necesita validación en un dispositivo real:
- Comodidad y alcance de los pulgares en el S23 Ultra y en un plegable; zonas seguras con muesca/cámara perforada.
- Desbloqueo de audio en Chrome/Samsung Internet para Android y el nivel percibido por altavoz del móvil (la mezcla se midió sin conexión).
- Rendimiento real en el S23 Ultra.
- Escucha humana de las piezas revisadas: las métricas no sustituyen al oído.
