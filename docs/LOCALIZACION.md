# Localización bilingüe es-419 / en-US

Base: versión 5.2 publicada, `origin/main` `0f8cc74` (PR #3). Rama: `feature/coopers-siege-i18n-es419-en`. Se conservan los 17 mundos, 28 armas, 34 combates, IA, terreno, gore, audio procedural y modos CPU/local/LAN. No fusionar ni publicar sin autorización.

## Uso

Abrir **🌐 ES / EN** y elegir **Español (Latinoamérica)** o **English**. Disponible en menú, combate, pausa, arsenal, campaña, diálogos, historial, jefes, resultados, final y editores. En combate ocupa el espacio central inferior entre controles; cabeceras y modales reservan espacio. En vertical se conserva la recomendación de girar el teléfono.

Primera visita: `navigator.language` español → es-419, inglés → en-US, otros → es-419. La elección explícita se guarda en `coopers-siege-language-v1`. Con almacenamiento bloqueado se puede cambiar durante la sesión. Nombres escritos por jugadores, proyectos importados, códigos LAN, URLs, teclas y marcas se conservan literalmente. [Glosario maestro](GLOSARIO.md).

## Fases y cobertura

| Fase | Resultado |
|---|---|
| A · Auditoría | 3059 candidatas AST/HTML iniciales; clasificación de código/notación e inventario por claves |
| B · Servicio | Recursos locales, parámetros, plurales, respaldo, caché y preferencia independiente |
| C · es-419 | Revisión integral; 119 recursos originales corregidos respecto del manifiesto |
| D · en-US | 1620 claves; 1520 valores distintos del español y 100 términos compartidos/invariantes |
| E · Integración | HTML, canvas, HUD, mapas, armas, editores, música, LAN y campaña |
| F · Cambio en vivo | Refresco de vistas conservando estado y avance del diálogo |
| G · QA | Regresión, guardados antiguos, campañas bilingües, LAN mixto, capturas y rendimiento |
| H · Entrega | Documentación, evidencia visual, commits/push y PR sin merge |

**1620 claves por idioma**. Se cuentan recursos, no palabras; los plurales tienen variantes dentro de una clave. Las 119 correcciones se comparan con el texto original en `manifest.json`, sin contar como corrección la mera extracción. Los 1520 valores ingleses distintos excluyen 100 nombres/términos compartidos.

| Módulo | es-419 | en-US |
|---|---:|---:|
| HTML y accesibilidad | 490 | 490 |
| Juego, HUD y menús dinámicos | 181 | 181 |
| Campaña, reparto, jefes e interfaz de diálogos | 335 | 335 |
| Historia, créditos y frases de fase | 337 | 337 |
| Mapas: nombres, etiquetas y descripciones | 51 | 51 |
| Armas: nombres y dos descripciones | 84 | 84 |
| Música: títulos, géneros, estados y secciones | 62 | 62 |
| Controles de ataque | 16 | 16 |
| Suministros | 7 | 7 |
| Servicio y detalles adicionales | 57 | 57 |
| **Total** | **1620** | **1620** |

Historia: **106 escenas y 319 intervenciones** — prólogo, seis conversaciones por capítulo, final, poscréditos y derrota — más ocho pares de créditos y dos frases de fase. Las pruebas contrastan escena, orden, hablante, expresión y cantidad con 5.2.

`node tools/i18n-audit.cjs --check`: ningún residual pendiente y 19 apariciones de invariantes revisadas (marca, teclas, URL, unidades y nombres técnicos). La auditoría de HTML/JS/templates se complementa con navegador y capturas; no demuestra por sí sola todos los caminos posibles del juego.

## Arquitectura

- `src/i18n/i18n.js`: `CS5.i18n`, detección/persistencia, `t`, `textHTML`, `html`, `number`, plurales con `Intl.PluralRules`, caché y `onChange`. Una clave ausente usa español y avisa una vez; los parámetros ausentes tienen respaldo visible y diagnóstico, sin mostrar claves crudas.
- `es-419.js` / `en-US.js`: interfaz y metadatos. `story-es-419.js` / `story-en-US.js`: narrativa. Recursos estáticos cargados antes del juego, sin servicios externos de traducción.
- `src/campaign/story.js`: esquema estable escena/hablante/expresión/clave. Filas localizadas creadas una vez por idioma, según se necesitan.
- Mapas, armas, habilidades y música usan getters de presentación; IDs, índices, estadísticas y partituras permanecen iguales.
- `presentation.js`: refresca vistas al cambiar idioma. Invalida firmas de HUD/arsenal; reconstruye el arsenal al abrirlo. Mantiene controles y lienzos de mapas. No llama a `newMatch`, `selectMap`, pausa, física ni reinicios de audio.
- `dialogue.js`: conserva escena, índice y avance proporcional; una línea completa permanece completa. Historial por escena/índice/contexto. Traducir no añade filas, marca escenas ni ejecuta continuaciones. Los créditos conservan su animación.
- Avisos/textos flotantes conservan duración. `toast` mantiene su API original de texto; `toastLocalized` permite refrescarlo.

`t` devuelve texto; `textHTML` escapa el resultado completo para insertarlo en HTML. `html` permite marcado de catálogo confiable y escapa parámetros. Los nombres personalizados se escapan al generar HTML.

No hay búsquedas por frases, observadores DOM, detección de idioma por frame ni reconstrucción del motor. Las claves se resuelven con caché; las cadenas sin parámetros evitan interpolación. Las búsquedas DOM/refrescos completos de vistas se limitan al cambio explícito. Los analizadores Acorn/parse5 son dependencias de desarrollo, no del navegador.

## Reglas editoriales

Español: tú para una persona, ustedes para el grupo; vocabulario claro sin conjugaciones de vosotros ni modismos innecesarios. Computadora, mouse, refrigerador, sándwich, pastel, corbatín, tomar impulso y presionar/tocar según el dispositivo. Se conserva irreverencia, gore y personalidad.

Inglés: adaptación en-US, instrucciones cortas, **cookies**, **ammo**, **health**, **Supply Bones**, **Bazooka** y nomenclatura del glosario. Los nombres artísticos se adaptan sin cambiar unidades. Cooper sigue glotón, Pipa sarcástica, Bongo distraído, Roco competitivo y Huesón teatral. Revelaciones y pistas permanecen en su escena original.

Ejemplo de humor adaptado: «Nada de amontonarse» / Bongo habla de montones de galletas; inglés «No bunching up» / Bongo habla de bananas. Se conservan función cómica e instrucción táctica mediante juegos de palabras naturales.

## Añadir textos o idiomas

1. Crear una clave estable por módulo, por ejemplo `campaign.settings.resume`; nunca usar la traducción como ID o condición.
2. Añadir ambos recursos y los mismos parámetros; para cantidades variables usar `{count}` y variantes `{one, other}`.
3. HTML estático: `data-i18n`, `data-i18n-title`, `data-i18n-aria-label`, etc. No marcar un contenedor con hijos interactivos como texto plano.
4. JS/canvas: `t`; texto en templates HTML: `textHTML`. Nombres dinámicos: getter o refresco explícito de vista.
5. Historia: claves en ambos recursos y filas del esquema; mantener IDs existentes para historial/guardados.
6. Ejecutar `node tests/i18n.cjs`, auditoría y pruebas de la pantalla afectada. Si cambia distribución, `npm run test:i18n:visual`.

Los extractores/pares editoriales de `tools/` documentan la migración inicial; **no se reaplican sobre una versión ya migrada**. El mantenimiento normal edita catálogos/esquema. `i18n-report.cjs` regenera conteos y glosario.

Para otro idioma: ampliar `supported`, normalización/respaldo y selector; registrar los catálogos completos, revisar plurales y ampliar QA. No crear otro HTML/motor ni migrar partidas por añadir idioma.

## Guardados y LAN

Campaña: misma clave `coopers-siege-campaign-v1`, formato y versión 1. Idioma independiente; sin campos traducidos en progresión ni nueva versión de guardado. Importación antigua con el mismo saneamiento.

Se ejecutaron los diez casos solicitados: empezar ES/continuar EN, ganar EN/volver ES, guardar/cargar entre idiomas, exportar/importar, cambiar en diálogo, antes del jefe y después de vencerlo, cerrar/reabrir Chromium, importar un guardado generado por el código real de 5.2 y recorrer los 34 estados en ambos idiomas. **70 importaciones y 68 victorias** comprobadas; esto no equivale a jugar manualmente 68 combates completos.

LAN conserva anfitrión autoritativo, mensajes, semillas, propiedad, munición, terreno y simulación. Coop 6v6 probado con idiomas opuestos y cambio durante partida. Las suites originales de BroadcastChannel, WebRTC y versus/cooperativo mantienen sus aserciones. Las pruebas históricas fijan navegador en español para conservar sus expectativas de texto.

## QA y rendimiento

Ejecutado `node tests/run-all.cjs` (entry point de `npm test`): **20/20 suites aprobadas**. Incluye las 15 anteriores de LAN, escenarios, destrucción, HUD, controles, armas, suministros, campaña, física, IA, auditoría, narrativa y audio, y cinco de localización. Entrada específica: `node tests/i18n.cjs`, con auditoría estática.

`tests/i18n-visual.cjs`: 22 pantallas × 2 idiomas × 6 perfiles (PC, S23 horizontal, plegable, tableta, Android compacto, teléfono vertical). Comprueba límites, selector, solapes con controles visibles, diálogos, marcadores y errores JS. Capturas a DPR 1 para comparar composición; controles originales y medición de S23 usan DPR 3.5. Imágenes/logs completos en `test-results/i18n/`; comparaciones representativas en `docs/i18n/`.

Rendimiento: copia de `0f8cc74` por `git archive`, sin cambiar rama, semilla 5222, calidad Equilibrado (`medium`, validada), tres rondas en orden alternado y 120 frames por ronda tras calentamiento. GPU sincronizada, una actualización HUD por frame, microprueba de HUD aparte, 30 cambios de idioma por ronda y memoria retenida mediante CDP después de GC. PC sin reducción de CPU; S23 emulado a CPU 4× y DPR 3.5. Resultados finales en [QA-LOCALIZACION.md](QA-LOCALIZACION.md). El render incluye variabilidad de GPU; no se atribuye toda diferencia a i18n ni se promete una tasa de FPS del teléfono físico.

## Validación humana pendiente

- Galaxy S23 Ultra físico en Samsung Internet/Chrome: barras del navegador, áreas seguras, selector nativo, multitáctil y sesión prolongada con temperatura/batería.
- LAN entre dispositivos físicos y red doméstica: las pruebas entre páginas no sustituyen esa red ni sus routers.
- Lectura editorial externa por hablantes nativos y ritmo de todos los diálogos en el dispositivo. Los recursos/estructura están comprobados; la revisión estilística final se beneficia de esa lectura.

No se conocen defectos funcionales abiertos al cierre. No se ha fusionado ni desplegado la rama.
