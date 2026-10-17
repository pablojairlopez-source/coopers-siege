# Localización bilingüe — plan y continuidad

Base: `origin/main` `0f8cc74`, versión 5.2 fusionada mediante PR #3. Rama: `feature/coopers-siege-i18n-es419-en`. Encargo completo leído del adjunto del usuario; no se reduce su alcance. No fusionar ni publicar sin autorización.

## Fases

| Fase | Estado | Alcance |
|---|---|---|
| A · Auditoría y glosario | En curso | HTML, cadenas dinámicas, canvas, datos, 17 capítulos, editores y LAN |
| B · Servicio i18n | Pendiente | Claves por módulo, parámetros, plurales, respaldo, preferencia independiente |
| C · Español es-419 | Pendiente | Revisión editorial completa, tú/ustedes, vocabulario neutro |
| D · Inglés en-US | Pendiente | Adaptación narrativa íntegra y terminología consistente |
| E · Integración | Pendiente | Menú, HUD, canvas, campaña, editores, audio y red |
| F · Cambio en vivo | Pendiente | Selectores accesibles en todas las pantallas; mantener diálogo/estado |
| G · QA | Pendiente | Claves/parámetros, 34 estados × 2 idiomas, guardados 5.2, LAN mixto, móvil, capturas y rendimiento |
| H · Entrega | Pendiente | Documentación, commits/push, PR abierta sin merge y vista previa de rama |

## Decisiones iniciales

- Catálogos locales `es-419` y `en-US`, sin solicitudes de traducción ni dependencias de ejecución externas.
- Un único motor y un único HTML; claves técnicas estables, nunca traducciones usadas como identificadores.
- La localización se aplica en límites de presentación. Guardados, inventarios, RNG, física y paquetes LAN conservan sus datos e identificadores originales.
- Cambio de idioma mediante notificación explícita a las vistas; sin recorrer/observar el DOM ni buscar traducciones dentro del bucle de frames.
- Historia con las mismas escenas, hablantes, expresiones y número de intervenciones; historial referido por escena/índice.
- Interpolación de texto y HTML separadas; valores dinámicos escapados al generar HTML.
- Analizadores de JavaScript/HTML solo para desarrollo permiten inventario y auditoría reproducibles; no se cargan en el juego.

## Glosario inicial

| Categoría | es-419 | en-US |
|---|---|---|
| Campaña | El Torneo del Universo | The Tournament of the Universe |
| Trofeo | Cooper's Trophy | Cooper's Trophy |
| Protagonistas | Cooper, Pipa, Bongo, Roco | Cooper, Pipa, Bongo, Roco |
| Presentador | Maestro Huesón | Master Bones |
| Primer campeón | Cooper Cero | Cooper Zero |
| Faraón | Faraón Costilla | Pharaoh Rib |
| Suministros | Huesitos | Supply Bones |
| Arma básica | Bazuca | Bazooka |
| Granada básica | Granada | Grenade |
| Inventario | Arsenal | Arsenal |

Las equivalencias definitivas, cobertura, pruebas y limitaciones se completan durante las fases siguientes.
