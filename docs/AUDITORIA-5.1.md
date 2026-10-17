# Auditoría independiente de Cooper's Siege 5.1 (antes de publicar)

Fecha: 17-10-2026 · Rama `feature/coopers-siege-5-1-controls-audio-thorns` · Revisión sobre `697c7d7`.

Método: además de las pruebas existentes, una sonda en Chromium real con **toques multitáctiles por CDP** (no eventos sintéticos), teclado real con botones enfocados y repeticiones, **AudioContext en vivo**, render sin conexión por la cadena de mezcla del juego en un **caso extremo**, 8 semillas × 16 pugs en el mapa 17, el editor de escenarios y LAN versus/cooperativo.

## Defectos comprobados y corregidos

| # | Área | Defecto (comprobado) | Corrección | Prueba que lo cubre |
|---|---|---|---|---|
| 1 | Multitáctil | El escenario detectaba el pellizco con `e.touches`, que incluye los dedos apoyados en ATACAR, SALTAR o ‹ ›. Caminar con un dedo y tocar el escenario con otro hacía zoom (×1,31 en la sonda) y cancelaba el apuntado por arrastre; cargar ATACAR y tocar el escenario también hacía zoom. | Se cuentan solo los dedos que tocan el escenario (`e.targetTouches`). | `controls.cjs` (toques CDP reales) |
| 2 | Voces | El veneno resta vida sin pasar por `damage()` y no producía quejido. | Quejido ligero en cada tic de veneno. | `audio-mix.cjs` |
| 3 | Saturación | Caso extremo (volúmenes al 100 %, varias supernovas, dos nubes nucleares y cinco gritos a la vez): pico 1,09 y muestras recortadas; el limitador de Web Audio deja pasar transitorios muy rápidos. | Recorte suave de seguridad tras el limitador: lineal hasta 0,85 y nunca por encima de 0,96. Pico tras la corrección: 0,959. | `audio-mix.cjs` |
| 4 | Mapa 17 | Caer al abismo de nubes sonaba a chapuzón de agua. | Sonido de soplo de nubes en Jardín de Espinas. | sonda manual |
| 5 | Versión | El menú y el título seguían diciendo «5.0»: en el móvil no se podía saber si se probaba la 5.1. | Título, insignia, ventana de la banda sonora («18 composiciones») y título al compartir actualizados a 5.1. | sonda manual |

### Defecto en las herramientas (no en el juego)

| 6 | Exportación de música | Los instrumentos desconectan sus nodos con `setTimeout` contado desde `currentTime`. En un render sin conexión todo se programa en t = 0; si el render va más lento que el tiempo real, esas limpiezas cortaban notas futuras y los WAV/WebM salían con largos silencios (comprobado al decodificar: hasta 18 de 19 tramos de 10 s en silencio). En el juego la programación es en tiempo real y no ocurre. | Las herramientas sin conexión (`export-preview-audio.cjs`, `export-music.cjs`, `tests/lib/loudness.cjs`) omiten esas limpiezas mientras programan. La medición de sonoridad no cambia (dispersión 0,9 dB). | `tests/check-preview-audio.cjs` |

Los WAV de 3 minutos generados antes en `test-results/music-5.1` (solo locales) estaban afectados; los archivos que se publicaron en `preview/audio/` para la revisión eran la versión corregida y verificada (la carpeta se retiró antes del merge; se regeneran en `test-results/preview-audio`).

## Verificado sin defectos

- **ESPACIO nunca salta durante el ataque**: ni al cargar, ni con repeticiones de tecla, ni con un botón enfocado (ESPACIO sobre el arsenal enfocado no lo abre y salta solo en reposo), ni manteniendo ESPACIO desde un salto y entrando después en el apuntado (no empieza a cargar). `Enter` sobre ATACAR enfocado entra una sola vez en el apuntado.
- **Multitáctil**: ATACAR + pad ÁNGULO con dos dedos (ángulo +25°, sigue cargando, un disparo); ATACAR + toque en el escenario tras la corrección (sigue cargando, un disparo, sin zoom).
- **Dolor y muerte se ejecutan de verdad**: con AudioContext en marcha se sintetizan quejido ligero, medio, fuerte y el lamento de muerte (contadores de `CS5.sfx.stats`). Buses activos con los volúmenes por defecto: voces 0,326, efectos 0,531, música 0,291.
- **Sonoridad**: 18 piezas con dispersión 0,9 dB; disparos +6 a +13 dB, explosiones +14 a +16 dB y quejidos +4 a +15 dB sobre la música en combate; sin recorte con los volúmenes por defecto.
- **Mapa 17**: 8 semillas × 16 pugs (4 equipos × 4): todas las apariciones sobre suelo firme, fuera del abismo, sin solaparse (separación mínima ≥ 168 u) y sin muertes al asentarse. Canción, dirección de arte, escenografía, paleta, decorados 3D, tarjeta del menú y miniatura presentes. Editor: cambiar al tema 17, dibujar, guardar y jugar el terreno propio funciona.
- **LAN**: cooperativo 6v6 en el mapa 17 con el invitado usando F → mantener ESPACIO → soltar: un solo disparo autoritativo con su ángulo y arma; cancelar no dispara; quejido y lamento llegan una vez al invitado. **Versus** en el mapa 17: terreno idéntico y quien tiene el turno dispara con el teclado → el rival ve exactamente un disparo.

## Observaciones sin cambio (no son defectos de 5.1 o son decisiones)

- El límite anti-acumulación deja como máximo 3 quejidos en 0,15 s: si una explosión hiere a más de tres pugs a la vez, solo suenan tres (intencionado).
- La potencia oscila 15 → 100 → 15 mientras se carga (comportamiento de 5.0 conservado).
- Las espinas del mapa 17 no hacen daño por contacto (decisión documentada en `docs/NOTAS-5.1.md`).
- Las miniaturas del menú usan el mismo estilo para todos los mapas.

## Pruebas ejecutadas tras las correcciones

`npm test`: 8/8 suites en verde (ver resultados en `docs/HANDOFF.md`). Las tres pruebas nuevas fallarían sin las correcciones: zoom con dos dedos, sin quejido por veneno y pico 1,09.

## Qué sigue necesitando el dispositivo real

Comodidad de pulgares y zonas seguras en el S23 Ultra, desbloqueo del audio y nivel por el altavoz del teléfono, rendimiento real y la escucha de las piezas. Para eso se publicó temporalmente una vista previa y un reproductor de música en `preview/`, retirados antes del merge.
