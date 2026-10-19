# Changelog

## Transferencia manual de guardados PC / itch.io / Android (en revisión)

- Gestor bilingüe de partidas visible desde el menú y campaña: exportar, importar con comparación y confirmación, compartir JSON en móvil y recuperar copia anterior.
- El guardado local v1 se conserva. Copia secundaria de la última versión válida, diagnóstico de almacenamiento inaccesible/corrupto y verificación de escritura tras importar.
- Archivos exportados con capítulo y fecha; instrucciones claras para transferir entre itch.io y GitHub Pages sin cuenta ni nube. La transferencia es manual, no cross-save automático.
- Nueva prueba `tests/save-transfer.cjs`; simulación aislada de la lógica de guardado aprobada. Suite Node/Playwright completa pendiente.

## Pantalla inicial de selección de idioma (pendiente de revisión)

- Al abrir o recargar el juego aparece una bienvenida a pantalla completa con Español (Latinoamérica) y English; se requiere pulsar CONTINUAR / CONTINUE antes de entrar al menú.
- La selección anterior aparece marcada, o se sugiere el idioma del navegador en la primera visita. La elección se guarda al confirmar, sin saltar la bienvenida en cargas posteriores.
- Se conserva el sistema i18n y el selector 🌐 ES / EN dentro del juego; no cambia el formato de guardado, IDs, mecánicas, IA, inventario, audio ni protocolo LAN.
- Nueva suite `tests/startup-language.cjs` y adaptación exclusiva del entorno de pruebas para confirmar automáticamente la bienvenida en suites históricas; se requiere validación ejecutando `npm test` y probando en S23 Ultra físico.

## Localización es-419 / en-US (en revisión)

- 1620 recursos por idioma: menús, HUD, 28 armas, 17 mapas, editores, LAN, música y campaña. Revisión de español neutro y adaptación inglesa de 106 escenas/319 intervenciones, créditos y frases de fase.
- Selector en vivo con preferencia independiente; conserva estado de combate, progreso, línea y avance del diálogo, historial y reproducción musical. Formato de guardado 5.2 intacto.
- QA específica de catálogos, parámetros, plurales, respaldo, guardados antiguos, 34 estados por idioma, LAN con idiomas opuestos, capturas móviles y rendimiento. Sin cambios de equilibrio, física ni red.
- Cabeceras de campaña/editor con espacio reservado para el selector; mapas con nombres completos; etiquetas de munición en singular/plural y metadatos actualizados a 28 armas/17 mapas.

## 5.2 · El Torneo del Universo (rama `feature/coopers-siege-5-2-torneo`)

### Arsenal
- **Bazuca y granada común infinitas** para humanos, bots, enemigos de campaña y jefes (el bate sigue siendo reutilizable). Las granadas especiales (polar, adhesiva, racimo, sagrada) y el resto de armas son limitadas.
- **Arsenal inicial estándar**: bazuca ∞, granada ∞, escopeta 2, mina 2, bate ∞; el resto empieza a 0 (sin superarmas al inicio). «Abundante» (arsenal clásico ×2) e «Infinita» se conservan para partidas personalizadas.
- **Igualdad total humano/bot**: inventario por equipo, mismas comprobaciones y mismo consumo (`CS5.arsenal`); la IA solo elige armas con munición y usa lo que consigue en los huesitos.

### Huesitos (suministros del cielo)
- Caen en paracaídas cada 2–4 rondas (configurable: normales, frecuentes, escasos o desactivados), con gravedad, deriva por viento, colisión, recogida en vuelo o en el suelo, caducidad, máximo simultáneo; nunca quedan dentro de la roca, vuelven a caer si se destruye el suelo y salen despedidos con las explosiones.
- Premio sorteado al recogerlo: común 75 %, potente 20 %, legendario 5 %; arma y cantidad según `src/gameplay/supply-config.js`, con topes y re-sorteo. Nunca bazuca ni granada común. Insignia «NUEVO» en el arsenal.
- Los bots los detectan, valoran distancia y peligro y caminan a por ellos sin conocer el contenido.
- LAN: aparición determinista, identificadores únicos, una sola recogida válida y sorteo decidido por el anfitrión (versus por mensaje, cooperativo en la instantánea).

### Campaña «El Torneo del Universo»
- 17 capítulos × 2 batallas: 3 pugs (Cooper, Pipa, Bongo) contra 5 bots de la misma variante con cosméticos reproducibles, y después un **jefe gigante** (2× de tamaño y caja de impacto, 250–400 HP, resistencia al empuje, 1–2 habilidades con enfriamiento que se anuncian con una zona marcada y se pueden interrumpir con 40 de daño). Cooper Cero (400 HP) tiene tres fases según su vida.
- IA de jefe temática: cíborg precisión, demonio fuego y agresividad, fantasma desplazamiento, zombi resistencia, esqueleto estrategia, alienígena energía.
- Historia en cuatro actos con Cooper, Pipa, Bongo, el Maestro Huesón, Roco y Cooper Cero: prólogo con la carta de invitación, seis conversaciones por capítulo, gran giro en el Jardín de Espinas, final con la liberación de Cooper Cero, el Cooper's Trophy auténtico (título final «COOPER'S TROPHY — CAMPEONES DEL UNIVERSO»), créditos y escena poscréditos.
- Diálogo cinematográfico con **retratos 3D** generados con el modelo del pug (variante, colores, accesorios y expresión), texto progresivo con sonido, avanzar, omitir e historial.
- Recorrido de 17 escenarios por actos, galería de jefes derrotados, presentación del jefe, pantallas de victoria y derrota (reintento de la misma batalla sin perder progreso), **trofeo 3D dorado** con figura de pug y celebración.
- Guardado automático versionado, continuar, nueva campaña con confirmación, exportar e importar el progreso, dificultad y personalización de la escuadra.

### Pruebas
- Nuevas suites en `npm test`: `weapons.cjs`, `supplies.cjs`, `campaign.cjs` (progresión de los 34 estados), `narrative.cjs`. Herramientas: `tests/balance.cjs` (simulación CPU contra CPU) y `tests/shots-52.cjs` (capturas).

### Auditoría independiente de 5.2
- IA de campaña con trayectoria real de bazuca y granada, tiros descendentes y rutas con saltos; mismo arsenal, vida y precisión por dificultad. En la muestra de 36 batallas contra bots: 14 → 0 límites de 90 turnos y 52,1 → 26,5 turnos medios.
- Física de terreno a 2× para los jefes, aparición y rescate seguros, incluidos túneles, techos y terreno destruido. Física normal, generador y colisiones de proyectiles conservados.
- Corregidos segundo tiro de la última carga de escopeta, historial tras recargar/cierre, aviso de almacenamiento fallido y margen del quejido ligero sobre la música.
- 15/15 suites; nuevas regresiones de física, IA y continuidad. Limitaciones humanas y caso residual de Catedral Gótica documentados en `docs/AUDITORIA-5.2.md`.

## 5.1 · Controles, audio y Jardín de Espinas (rama `feature/coopers-siege-5-1-controls-audio-thorns`)

### Controles
- Smartphone: arsenal en la esquina inferior izquierda y flechas ‹ › encima; ATACAR en la esquina inferior derecha y nuevo botón **SALTAR** encima, separados; márgenes de zona segura; arsenal que se abre desde la izquierda.
- Eliminado el salto por deslizamiento hacia arriba; el salto táctil es solo el botón SALTAR (un toque = un salto).
- Apuntado en dos pasos: el primer toque de ATACAR solo apunta (trayectoria, ángulo y pad ÁNGULO); mantener carga y soltar dispara; ✕ CANCELAR no gasta munición ni turno; `pointercancel` vuelve a apuntar sin disparar; multitouch para caminar y cargar a la vez.
- PC: `A`/`D`, `Espacio` contextual (saltar fuera del ataque; cargar y disparar al soltar dentro), `W`/`S` y flechas para la elevación con límites, `Mayús` para ajuste fino, `Esc`/`X`/clic derecho para cancelar.
- Máquina de estados común (`src/input/attack-controls.js`); la autoridad LAN y la guía predictiva no cambian.

### Audio
- Buses independientes de música, efectos, voces y ambiente con compresor suave y limitador (antes un compresor de −24 dB/12:1 aplastaba la mezcla).
- Música −4 dB, control de graves y ducking discreto en explosiones grandes; sonoridad igualada entre piezas (dispersión 9,5 → 0,9 dB).
- Disparos con transitorio, golpe grave y cola; explosiones en cinco capas (chasquido, sub-grave, cuerpo, escombros, retumbo) con segundo golpe en supernova, misiles y ataques orbitales.
- Quejidos de dolor por síntesis de formantes en tres niveles (ligero, medio, fuerte) y lamento de muerte; ahora audibles. Límite de voces simultáneas por tipo.

### Música
- Compositor: varias melodías por sección, melodías escritas literales, contracantos escritos e instrumentación por sección.
- Reescritas: «Furia de la Caldera» (Caldera Roja), «Réquiem para un Sol» desarrollado (Última Estrella), «Vigilia de los Colmillos» (Catedral Gótica), «Desfile de Caramelos» (Dulce Caos) e «Inspección de Engranajes» (Fundición Omega). Nueva: «Bruma entre Zarzas».
- 13 instrumentos y 14 percusiones nuevas (coro oscuro, metales graves, bajo eléctrico, guitarra saturada, piano de juguete, kazoo, xilófono, vibráfono, kalimba, pistones, engranajes…).

### Escenario
- Mapa 17, **Jardín de Espinas**: troncos de zarza sobre un mar de nubes, puentes de ramas trenzadas con espinas, plataformas de raíces, flores gigantes, escenografía propia con la Gran Zarza, pétalos y polen, decorados 3D y ambiente sonoro.

### Pruebas
- Nuevas suites en `npm test`: `controls.cjs` (6 pantallas, táctil y teclado), `audio-mix.cjs` (mezcla real sin conexión), `lan-51.cjs` (LAN con controles nuevos y mapa 17). `music.cjs` mide frases escritas distintas en 3 minutos; `smoke.cjs` cubre los 17 mapas.

## 5.0 · Next Gen (rama `feature/coopers-siege-5-nextgen`, PR #1)

### Escenarios y gráficos (Fase B)
- Mundo de **3072 × 768 u** (el doble de ancho que 4.0) con un trazado propio para cada uno de los 16 mapas: archipiélago con canales, azoteas con metro, conos volcánicos con cráter, picos y cuevas de hielo, islas flotantes, murallas almenadas, asteroides, muelles sobre pilotes, arcos de raíces, pasos elevados rotos, terrazas con río, pirámides con cámara, domos submarinos, plataformas industriales, agujas góticas y pisos de pastel.
- Variaciones deterministas por semilla de partida (idénticas en LAN sin enviarlas) y apariciones seguras repartidas por todo el mapa.
- Materiales procedurales del terreno por mapa: capas, patrones (arenisca, ladrillo, basalto, hielo, placas, bizcocho…), vetas incandescentes, cristales, raíces, fósiles, ventanas, tuberías, oclusión ambiental y decoración de superficie (hierba, nieve, coral, glaseado).
- Escenografía pintada por mapa: cielo propio, un hito (volcán en erupción, monte Fuji, pirámides, faro con haz giratorio, catedral, planeta anillado, estrella moribunda…), 3 capas de parallax y vida ambiental (aves, coches voladores, peces, medusas, brasas, luciérnagas, murciélagos).
- Post-proceso: gradación de color por mapa, tinte de sombras y luces, viñeta y bloom del render 3D. Rayos de luz regulados por mapa.
- Decorados 3D propios de cada escenario.
- Cámara para mapas grandes: anticipa la puntería, abre el plano para seguir al proyectil y se detiene en el impacto; zoom de vista completa; paneo en el menú; minimapa 4:1.
- Editor de escenarios con lienzo 4:1; los terrenos guardados en 4.0 se migran automáticamente.

### Pugs (Fase C)
- 10 expresiones mezcladas suavemente: reposo, concentración, carga, sorpresa, miedo, dolor, mareo, alegría, tristeza y sueño.
- Mirada que sigue al proyectil, al pug activo o la puntería; parpadeo natural; cejas, párpados, boca, lágrimas, sudor y rubor.
- Rebote de panza con muelle (squash & stretch) en aterrizajes, golpes, disparos y al recibir el turno; balanceo con inercia según la dirección del impacto; cola expresiva.
- Editor: poses Miedo, Dolor, Mareo, Derrota y Sueño; zoom con dos dedos; giro con inercia.

### Daño y destrucción (Fase D)
- Onda expansiva, halo de luz teñido por arma, polvo a ras de suelo, escombros con el color real del material, brasas con estela, humo con volutas.
- Chamuscado del borde del cráter según el arma (carbón, escarcha, ácido, plasma, oro, vacío) y cráteres de borde irregular deterministas.
- Hollín caricaturesco en los pugs alcanzados por explosiones.
- Los 5 niveles de gore se conservan; «Ninguno» sigue sin generar sangre.

### Música y sonido (Fase E)
- **17 composiciones originales procedurales** (una por mapa + «Himno de Cooper» en el menú), cada una con género, compás, escala, instrumentación y forma propios. Ninguna repite 16 compases idénticos antes de 2,5 min; la mayoría tarda entre 16 y 35 min.
- Música adaptativa en 8 estados (menú, exploración, combate, peligro, clímax, último aliento, victoria, derrota) con capas, transiciones y saltos de sección en el compás.
- ~40 instrumentos y percusiones sintetizados con Web Audio, reverb por convolución y eco sincronizado.
- **Eliminado** el MP3 embebido derivado de *Stickerbush Symphony* (DKC2) y los textos que lo citaban: `index.html` pasa de 1,25 MB a ~580 KB.
- Efectos por familia de armas (19), explosiones por material (16) y distancia, voces de los pugs y ambientes continuos por mapa.

### Rendimiento y móvil (Fases D y F)
- Frame tras una explosión en PC: de ~57 ms a ~15 ms (mallas de pugs independientes del terreno, paredes 3D por chunk, decorados y sangre solo donde cambian).
- Cráteres al instante y repintado fino repartido en franjas de 3 ms por frame; superficie y minimapa recalculados solo donde hace falta.
- Bloom solo del render WebGL (muestrear el canvas 2D costaba ~8 ms/frame); fondo rasterizado a menor densidad.
- HUD compacto en móvil horizontal (S23 Ultra emulado: barra de 38 px, minimapa de una fila) y sin solapes en plegables.

### Ronda de pendientes antes del merge
- Variantes renombradas sin marcas ajenas: «Pug ciborg (endoesqueleto cromado)» y «Pug fantasma (espectro risueño)»; etiqueta del mapa Fundición Omega: «Fábrica cibernética».
- Rayos de luz cacheados a media resolución: explosiones en PC de 27–31 ms a ~18 ms de mediana.
- Escenografía con menos memoria: 17 MB por mapa en Ultra (antes 22,5) y caché de 2 mapas (32 MB frente a 65).
- Precarga de sprites y efectos al empezar la partida.
- `tests/pug-poses.cjs` cambia de variante correctamente; `tests/memory.cjs` mide la memoria de la escenografía.

### Correcciones
- LAN versus: el charco de ácido y el fuego en el suelo usaban azar cosmético para destruir terreno y hacer daño, lo que podía desincronizar a los dos jugadores. Ahora usan un generador determinista por efecto.

### Pruebas
- `npm test` ejecuta 5 suites: LAN 6v6 (original, sin cambios en sus aserciones), escenarios, gore y destrucción, HUD responsivo, banda sonora y efectos.
- Herramientas: capturas (`tests/visual.cjs`), comparativas, rendimiento (`tests/perf.cjs`, `tests/spike.cjs`) y exportación de la música a WAV.
