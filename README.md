# Cooper's Siege

Juego de artillería por turnos protagonizado por pugs, para navegador en PC y celular.

## Jugar

https://pablojairlopez-source.github.io/coopers-siege/

## Novedades de 5.0

- 16 escenarios el doble de anchos, cada uno con su trazado, sus materiales, su escenografía pintada y su gradación de color.
- Pugs expresivos: miradas, parpadeos, miedo, dolor, mareo, alegría y tristeza, y rebote de panza con inercia.
- Destrucción 2.0: ondas expansivas, escombros del material real, chamuscados según el arma y cráteres irregulares.
- Banda sonora original: 17 piezas procedurales (una por mapa y el tema del menú) que se adaptan al combate en 8 estados, más efectos por arma y material y ambientes por mapa.
- HUD compacto para móviles en horizontal y plegables.

Detalle completo en [`CHANGELOG.md`](CHANGELOG.md) y comparativa con capturas y mediciones en [`docs/COMPARATIVA-4.0-5.0.md`](docs/COMPARATIVA-4.0-5.0.md).

## Archivos

- `index.html`: juego principal.
- `src/`: módulos de 5.0 (escenarios, render, personajes, efectos y audio), cargados con rutas relativas sin proceso de build.
- `tests/`: pruebas automatizadas y herramientas de captura y medición (Playwright).
- `docs/`: auditoría, comparativa, capturas y mediciones.
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

`npm test` ejecuta cinco suites: LAN 6v6, escenarios, daño y gore, HUD responsivo, y banda sonora y efectos. Otras herramientas:

- `npm run test:visual`: capturas de los 16 mapas en escritorio y Galaxy S23 Ultra emulado.
- `npm run test:perf`: tiempos de frame en reposo y con explosiones.
- `npm run music:export`: exporta las 17 piezas a WAV en `test-results/music` para escucharlas.

## Publicación

En **Settings → Pages**, seleccionar **Deploy from a branch**, rama **main** y carpeta **/ (root)**.

Para publicar, fusionar los cambios en `main` (incluidas las carpetas `src/` y `assets/` si existen). GitHub Pages publicará la actualización automáticamente; todas las rutas son relativas.
