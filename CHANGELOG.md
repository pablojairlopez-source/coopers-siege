# Changelog

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
