# Cooper's Siege — Guardado local y transferencia manual de partidas

**Alcance:** sin cuenta, sin servidor y sin sincronización en la nube. El guardado existente `coopers-siege-campaign-v1` y su formato JSON v1 siguen siendo compatibles.

## Cómo transferir una campaña

1. En el dispositivo de origen, abre Cooper's Siege → **💾 Guardar / transferir partida** (o **Campaña → 💾 Partidas**).
2. Pulsa **Exportar partida (.json)**. Descargará un archivo `coopers-siege-chNN-AAAA-MM-DD.json`. En Android también está **Compartir archivo**, cuando el navegador admita compartir archivos.
3. Envía ese JSON al otro dispositivo mediante mensajería, correo, USB u otro medio de tu elección.
4. En el dispositivo de destino, abre el juego (itch.io o GitHub Pages), selecciona **Importar partida (.json)** y elige el archivo.
5. **Comprueba** capítulo, batallas completadas y fecha tanto de la partida local como de la recibida. Pulsa **Reemplazar y guardar** solo cuando estés de acuerdo.
6. Cierra y vuelve a abrir el juego para verificar que el avance persista. Al regresar al primer dispositivo, repite la exportación/importación.

**Esto es transferencia manual, no sincronización automática.** Abrir el juego desde itch.io o GitHub Pages puede crear almacenamientos separados. El modo privado, la configuración del navegador o las restricciones de iframe pueden impedir la persistencia. Si ocurre, el gestor muestra la alerta y conviene exportar el JSON antes de cerrar. Si itch.io restringe descargas dentro del marco, intenta su opción de abrir el juego en pantalla completa o en una ventana independiente, cuando esté disponible.

## Prevención de pérdidas silenciosas

- Se mantiene la clave principal `coopers-siege-campaign-v1`.
- En cada guardado, después de confirmar por lectura que la versión actual se pudo almacenar, se intenta conservar la última versión principal **válida** en `coopers-siege-campaign-v1-backup`.
- Si el guardado principal falta o está corrupto, `load()` intenta recuperar la copia válida; el estado `recovered` se señala en el gestor y en la campaña.
- Si el principal está corrupto y no existe copia válida, la carga **no sobrescribe** automáticamente los datos ilegibles: requiere importar una partida válida o iniciar una campaña nueva mediante la acción explícita de reinicio.
- La escritura fallida devuelve `false`. La importación **solo informa éxito si el nuevo contenido se escribió y se leyó de vuelta**, y revierte el estado en memoria si no se pudo persistir.
- Los cambios en vida, física, mapas, RNG, LAN, dificultad y mecánicas no forman parte de esta actualización.

**Limitaciones:** la copia local usa el mismo origen y almacenamiento que el archivo principal; **no protege contra la eliminación completa de datos del sitio, una limpieza total del navegador ni las políticas de almacenamiento de terceros**. Solo el archivo JSON exportado manualmente proporciona una copia fuera del navegador. No se puede recuperar una campaña que ya se perdió sin respaldo.

## Experiencia de importación y exportación

- Acceso visible desde el menú principal y el recorrido de campaña (en ambos idiomas).
- Exportación de un clic con nombre distintivo que incluye fecha y capítulo.
- Compartir JSON mediante la API Web Share cuando está disponible; descarga como alternativa.
- Importación mediante selector de archivo `.json`, limitada a 1 MB, con saneado del mismo esquema JSON v1.
- Vista previa comparativa de la partida actual y la entrante antes de sobrescribir; siempre exige confirmación, incluso si el archivo parece más avanzado.
- Restauración explícita de una copia anterior cuando existe una válida.
- Avisos visibles de lectura corrupta, recuperación, permisos bloqueados e importación fallida.

## Verificación y pruebas

- `node tests/save-transfer.cjs`: transferencia del JSON de un contexto de navegador PC a otro con perfil Android, cancelación, confirmación, persistencia tras recarga, recuperación de copia y fallo real de escritura.
- `npm test`: regresión completa del juego, campaña, LAN, i18n y controles.
- Se ejecutó **una simulación aislada** de nueve casos con la lógica real del módulo de campaña, incluidos copia anterior, archivo corrupto, recuperación y rechazo de escrituras. Pasó.
- **Pendiente ejecutar las pruebas reales con Node/Playwright en un clon local conectado al repositorio.** También pendientes itch.io real, Galaxy S23 Ultra físico, Chrome/Samsung Internet, permisos de descargas del iframe y transferencia completa entre dos aparatos.
- Ningún resultado de la suite completa se declara aprobado sin haberlo ejecutado.

## GitHub y publicación

Rama `feature/coopers-siege-save-transfer`, creada a partir de `main` después de integrar la PR #5 del selector inicial. Preparar PR para revisión; **no fusionar con `main` ni publicar en GitHub Pages o itch.io sin autorización**.

Para la siguiente etapa, se puede estudiar Cloud Save con un servicio de backend, pero **no se implementa ninguna función de cuenta ni servidor en esta fase**.
