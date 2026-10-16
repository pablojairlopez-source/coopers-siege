# Cooper's Siege

Juego de artillería por turnos protagonizado por pugs, para navegador en PC y celular.

## Jugar

https://pablojairlopez-source.github.io/coopers-siege/

## Archivos

- `index.html`: juego completo, conservado del HTML original.
- `.nojekyll`: publicación directa de los archivos con GitHub Pages.

## Cooperativo LAN: 6 contra 6

1. Abre el juego en ambos dispositivos y selecciona **Red LAN**.
2. El anfitrión elige **Cooperativo contra CPU · 6 vs 6**, escenario, dificultad y tiempo por turno, y pulsa **Crear Sala**.
3. El otro jugador introduce el código y pulsa **Unirse**. El anfitrión inicia la batalla cuando estén conectados.

Los jugadores comparten un equipo aliado de seis pugs: tres por persona. Alternan sus turnos contra una escuadra de seis bots, y el cambio de criatura se limita a los pugs del jugador en turno. Si un jugador pierde sus tres pugs, su compañero continúa. La victoria se decide por equipo.

El anfitrión simula la física y la CPU, y sincroniza posiciones, proyectiles, vida, munición, cráteres, pausas y resultados. Las salas con código usan servicios públicos para encontrarse; las opciones P2P permiten intercambiar los pases manualmente. Ambos dispositivos deben usar la versión actual del juego.

## Audio y proyectiles

La música del menú y la de los escenarios tienen niveles compensados por separado. Los controles Maestro, Música y Efectos se guardan en el navegador. La estela usa las mismas coordenadas que el modelo del proyectil y llega hasta su posición actual; la guía de tiro calcula el vuelo con el paso fijo de la simulación.

## Pruebas

Requiere Node.js y los navegadores de Playwright:

```sh
npm install
npx playwright install chromium
npm test
```

La prueba abre dos clientes y verifica conexión LAN, reparto 3 + 3 contra 6, control de cada jugador, ataques de la CPU, disparos únicos, pausas, terreno, victoria compartida, compatibilidad con los otros modos, trayectoria y guardado del volumen. Usa BroadcastChannel local para que las pruebas no dependan de los brokers públicos.

## Publicación

En **Settings → Pages**, seleccionar **Deploy from a branch**, rama **main** y carpeta **/ (root)**.

Para actualizar el juego, reemplazar `index.html` y guardar los cambios en `main`. GitHub Pages publicará la actualización automáticamente.
