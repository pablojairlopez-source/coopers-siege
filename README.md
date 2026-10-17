# Cooper's Siege

Juego de artillería por turnos protagonizado por pugs, para navegador en PC y celular.

## Jugar

https://pablojairlopez-source.github.io/coopers-siege/

## Controles (5.1)

**Smartphone** (horizontal): a la izquierda, el **arsenal** en la esquina inferior y las flechas **‹ ›** encima; a la derecha, **ATACAR** en la esquina inferior y **SALTAR** encima.

1. Toca **ATACAR** una vez: entras en el apuntado (aparecen la trayectoria, el ángulo y el pad **ÁNGULO**). Este toque nunca dispara.
2. Ajusta el ángulo arrastrando el pad **ÁNGULO** (pulgar izquierdo) o arrastrando sobre el escenario.
3. **Mantén ATACAR** para cargar la potencia; mientras cargas puedes deslizar el dedo arriba/abajo sobre el botón para afinar el ángulo.
4. **Suelta** para disparar. **✕ CANCELAR** sale sin gastar munición ni turno.

El salto solo se hace con el botón **SALTAR** (deslizar hacia arriba ya no salta). Caminar tocando los bordes del escenario y pellizcar para hacer zoom siguen disponibles.

**PC**: `A`/`D` caminar · `Espacio` saltar · `F`, `Enter` o el botón ATACAR para apuntar · `W`/`S` o `↑`/`↓` ángulo (con `Mayús`, más fino) · **mantén `Espacio`** para cargar y suéltalo para disparar · `Esc`, `X` o clic derecho cancelan · `Q` arsenal · `Tab` cambiar de pug.
Dentro del apuntado `Espacio` nunca salta: solo carga y dispara (una vez por pulsación).

## Novedades de 5.2 · El Torneo del Universo

- **Campaña** de 17 capítulos × 2 batallas: tu escuadra (Cooper, Pipa y Bongo) contra cinco rivales y después contra el **jefe gigante** de cada mundo, con habilidades anunciadas que se pueden esquivar o interrumpir. Historia en cuatro actos con diálogos y **retratos 3D**, guardado automático, galería de jefes y la **Cooper's Cup** en 3D.
- **Bazuca y granada común infinitas** para todos; arsenal inicial estándar (escopeta 2, mina 2, bate) e igualdad total entre humanos y bots.
- **Huesitos**: suministros que caen del cielo con armas comunes, potentes o legendarias, también en LAN.
 técnicas: [`docs/NOTAS-5.2.md`](docs/NOTAS-5.2.md).

## Novedades de 5.1

- Controles rediseñados con una máquina de estados común a PC y táctil (reposo → apuntando → cargando).
- Mezcla de audio nueva: buses de música, efectos, voces y ambiente con limitador; música −4 dB y sonoridad igualada entre las 18 piezas; disparos y explosiones en capas; quejidos de dolor y lamento de muerte audibles.
- Cinco piezas reescritas (Caldera Roja, Última Estrella, Catedral Gótica, Dulce Caos y Fundición Omega) con varias melodías, contracantos e instrumentación por sección.
- Mapa 17, **Jardín de Espinas**: zarzas colosales sobre un mar de nubes, con banda sonora original.

## Novedades de 5.0

- 16 escenarios el doble de anchos, cada uno con su trazado, sus materiales, su escenografía pintada y su gradación de color.
- Pugs expresivos, destrucción 2.0, banda sonora adaptativa en 8 estados y HUD compacto para móviles.

Detalle completo en [`CHANGELOG.md`](CHANGELOG.md); notas técnicas de 5.1 en [`docs/NOTAS-5.1.md`](docs/NOTAS-5.1.md).

## Archivos

- `index.html`: juego principal.
- `src/`: módulos (escenarios, render, personajes, efectos, audio y controles), cargados con rutas relativas sin proceso de build.
- `tests/`: pruebas automatizadas y herramientas de captura y medición (Playwright).
- `docs/`: auditoría, comparativas, notas, capturas y mediciones.
- `AGENTS.md`, `CLAUDE.md`, `PROGRESO_DESARROLLO.md`, `docs/HANDOFF.md`: continuidad entre agentes de desarrollo.
- `.nojekyll`: publicación directa de los archivos con GitHub Pages.

## Cooperativo LAN: 6 contra 6

1. Abre el juego en ambos dispositivos y selecciona **Red LAN**.
2. El anfitrión elige **Cooperativo contra CPU · 6 vs 6**, escenario, dificultad y tiempo por turno, y pulsa **Crear Sala**.
3. El otro jugador introduce el código y pulsa **Unirse**. El anfitrión inicia la batalla cuando estén conectados.

Los jugadores comparten un equipo aliado de seis pugs: tres por persona. Alternan sus turnos contra una escuadra de seis bots, y el cambio de criatura se limita a los pugs del jugador en turno. Si un jugador pierde sus tres pugs, su compañero continúa. La victoria se decide por equipo.

El anfitrión simula la física y la CPU, y sincroniza posiciones, proyectiles, vida, munición, cráteres, pausas y resultados. Las salas con código usan servicios públicos para encontrarse; las opciones P2P permiten intercambiar los pases manualmente. Ambos dispositivos deben usar la misma versión del juego.

## Ejecutar localmente

El juego es estático, pero carga módulos de `src/`, así que hay que servirlo por HTTP (abrir `index.html` con doble clic no basta en todos los navegadores). Cualquier servidor estático vale, por ejemplo:

```sh
npx http-server -p 8080 .
```

y abrir http://localhost:8080/.

## Pruebas

Requiere Node.js y los navegadores de Playwright:

```sh
npm install
npx playwright install chromium
npm test
```

`npm test` ejecuta doce suites: LAN 6v6 (original), LAN 5.1, escenarios, daño y gore, HUD responsivo, controles, arsenal 5.2, huesitos, campaña (34 estados), narrativa, banda sonora y mezcla de audio. Otras herramientas:

- `node tests/balance.cjs`: simulación de balance de la campaña (CPU contra CPU).
- `node tests/shots-52.cjs <carpeta> desktop,s23ultra,fold`: capturas de las novedades de 5.2.

- `npm run test:visual`: capturas de los 17 mapas en escritorio y Galaxy S23 Ultra emulado.
- `node tests/controls-shots.cjs <carpeta> s23ultra,fold,desktop`: capturas de los controles en reposo y apuntando.
- `npm run test:perf`: tiempos de frame en reposo y con explosiones.
- `npm run music:export`: exporta las 18 piezas a WAV en `test-results/music` para escucharlas.
- `node tests/calibrate-music.cjs`: recalibra la sonoridad de la banda sonora tras cambiar una composición.
- `node tests/export-preview-audio.cjs 180`: exporta las seis piezas nuevas o revisadas de 5.1 como WebM/Opus en `test-results/preview-audio` (y `tests/check-preview-audio.cjs` comprueba que suenan completas).

## Publicación

En **Settings → Pages**, seleccionar **Deploy from a branch**, rama **main** y carpeta **/ (root)**.

Para publicar, fusionar los cambios en `main` (incluida la carpeta `src/`). GitHub Pages publicará la actualización automáticamente; todas las rutas son relativas.
