# Auditoría independiente 5.2 · Codex · 17-10-2026

Se parte de `0d816fe` en `feature/coopers-siege-5-2-torneo`, con árbol limpio y remoto confirmado. Se conservan las fases A–H. `main` no se modifica y la PR #3 permanece abierta sin merge.

## Causas y correcciones

### Combates largos

La IA anterior solo exploraba ángulos de 12° a 84°, apuntaba al rival más cercano y simulaba una bazuca incluso cuando elegía granada. La salida simulada tampoco coincidía exactamente con la real. En un cráter, un enemigo inferior o una pared cercana podía repetir ataques ineficaces. La aproximación exigía desniveles menores de 10 px y recorría como máximo 128 px, sin planificar saltos.

`src/gameplay/campaign-ai.js` añade un planificador exclusivo de campaña, compartido por los dos bandos:

- Evalúa ambas direcciones, tiros descendentes, daño útil, remates y riesgo para aliados. La granada tiene su propia predicción de mecha y rebotes.
- Bazuca y granada usan la salida real, gravedad, viento, subpasos y colisiones del juego; la predicción no cambia terreno ni inventario. Las armas obtenidas de huesitos siguen pasando por el inventario y las preferencias del jefe.
- Cuando falta un ataque útil, ensaya hasta tres segundos de marcha y saltos con `characterPhysics` sobre una copia. Descarta agua, minas y caídas dañinas; utiliza los mismos impulsos y velocidad que el jugador.
- Vuelve a apuntar después de moverse. Conserva el error de puntería de cada dificultad y el multiplicador del jefe.

No se cambia `botHp` (60), vida de jefes, daño de armas, arsenal inicial ni premios. Bazuca y granada común siguen siendo ilimitadas. El planificador anterior se conserva para CPU libre y LAN.

### Colisión gigante

`bodyClear`, apoyo del pie, aterrizaje, techo, recuperación de intersecciones, búsqueda de superficie y destino de teletransporte reciben la escala. El cuerpo físico de 18×26 pasa a 36×52, con detección de obstáculos finos. Los pugs de 1× conservan su muestreo anterior.

La aparición del jefe, fase, carga y rescate verifican espacio 2×. Si su plataforma fue destruida, el rescate encuentra otro apoyo válido; no crea terreno. Los huesitos también evalúan el camino del jefe a escala 2×. No se cambian el generador ni el código de colisión de proyectiles.

### Defectos adicionales

- **Escopeta:** la última carga se consumía tras el primer tiro y bloqueaba el segundo. La CPU podía intentar sustituirlo por una bazuca. Una carga ahora permite completar los dos disparos; el segundo no admite cambiar de arma. Regla común para humanos y bots.
- **Historial:** tras recargar, las escenas vistas seguían guardadas pero el historial se vaciaba. Ahora se reconstruye de esos identificadores, con el hablante del capítulo correcto, ignorando identificadores desconocidos. Escape y el botón táctil cierran el historial desde el recorrido, sin acumular manejadores.
- **Guardado:** un fallo real de `localStorage` ya no se oculta. Se avisa una vez y se mantiene disponible la exportación; un guardado posterior correcto elimina el estado de error.
- **Audio:** una ejecución de la suite detectó un quejido ligero solo 1,9 dB sobre la música (mínimo exigido: 2 dB). Su nivel pasa de 0,62 a 0,72 para dar margen a las variaciones de vocal y tono, sin rebajar las aserciones ni cambiar las composiciones.

## Verificación

- `tests/boss-physics.cjs`: túnel estrecho, pared y techo de un píxel, salto libre y limitado por techo, caída sobre el borde exterior del pie; 17 mapas × 3 semillas, 51 apariciones y 102 rescates, incluido suelo destruido. La física no altera la máscara del mapa.
- `tests/campaign-ai.cjs`: 24 trayectorias contrastadas con `stepProjectile` real (ambos tamaños, bazuca/granada, tiros ascendentes/descendentes, 30/60 Hz), salto sobre obstáculo, riesgo de agua, ruta reproducible sin alterar RNG/terreno/vida/inventario y 408 planes en las tres dificultades.
- `tests/campaign-audit.cjs`: recarga real del historial, nombres de jefes, Escape y toque en S23 Ultra emulado, fallo de cuota y recuperación, última carga de escopeta para ambos bandos.
- Suites heredadas: suministros y autoridad LAN, inventarios, 34 transiciones por el flujo real, derrota/reintento, guardado/exportación/importación, retratos, diálogos, controles multitáctiles y teclado, escenarios, destrucción, música y mezcla.

## Balance y rendimiento

La ejecución independiente del protocolo histórico reproduce **14/36** límites de 90 turnos y **52,1** turnos medios en batalla 1; jefes: 24,3 turnos. Datos en `perf/auditoria-5.2-reproduccion.json`.

La revisión final (`perf/auditoria-5.2-final.json`), mismos capítulos 1/4/8/11/13/17 × 6 semillas por batalla, dificultad normal y paso de 1/30 s, registra:

| Medida | Reproducción original | Revisión final |
|---|---:|---:|
| Batalla 1: límite de 90 turnos | 14/36 | 0/36 |
| Batalla 1: turnos medios | 52,1 | 26,5 |
| Batalla 1: victorias de la escuadra CPU | 10/36 (28 %) | 18/36 (50 %) |
| Jefes: límite de 90 turnos | 0/36 | 0/36 |
| Jefes: turnos medios | 24,3 | 19,8 |
| Jefes: victorias de la escuadra CPU | 13/36 (36 %) | 8/36 (22 %) |

En los 72 combates finales: **cero bloqueos y cero cambios de turno forzados**. El límite de 90 turnos pertenece al instrumento de medida; no es una condición de victoria añadida al juego. La simulación también puede registrar empate por eliminación mutua (`winner=-1`, ambas vidas a cero), distinto de llegar al límite. Los jefes resultan más exigentes para la escuadra CPU; no se modifica su vida para compensarlo. La capacidad humana de esquivar anuncios e interrumpirlos necesita validación jugando.

El runner registra `matchSeed`, cambios de turno forzados y bloqueos; `BALANCE_STRICT=1` nunca elimina proyectiles ni fuerza el turno. `BALANCE_REF` carga código histórico mediante rutas del navegador, sin cambiar de rama; `BALANCE_SEEDS_FROM` permite repetir exactamente los mundos de otra ejecución.

Las primeras mediciones de frames se ejecutaron junto a las simulaciones y se consideran exploratorias. La medición de entrega se ejecuta sin otras pruebas en paralelo. `tests/ai-timing.cjs` mide por separado el coste de planificar, que las pruebas habituales de renderizado no representan bien.

## Validación humana pendiente

La emulación no sustituye al Galaxy S23 Ultra físico: probar respuesta multitáctil, cancelación del ataque, legibilidad y desplazamiento del historial, pantalla completa/rotación, pausas al pensar la CPU, temperatura y rendimiento sostenido. También queda la escucha humana de música y mezcla. CPU contra CPU mide duración y equilibrio entre algoritmos; no estima una tasa de victoria humana ni sustituye jugar las 34 batallas.
