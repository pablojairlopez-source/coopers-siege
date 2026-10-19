// Ejecuta todas las suites en orden y resume el resultado (npm test).
// La prueba original de LAN (tests/lan-coop.cjs) se conserva sin cambios en sus aserciones.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const suites=[
 ['LAN 6v6 (original)','lan-coop.cjs'],
 ['LAN 5.1: controles nuevos y mapa 17','lan-51.cjs'],
 ['Escenarios ampliados','smoke.cjs'],
 ['Daño, gore y destrucción','effects.cjs'],
 ['HUD responsivo','ui.cjs'],
 ['Controles 5.1 (táctil y teclado)','controls.cjs'],
 ['Arsenal 5.2 e igualdad humano/bot','weapons.cjs'],
 ['Huesitos 5.2 (suministros, IA y LAN)','supplies.cjs'],
 ['Campaña 5.2 (34 estados, jefes, guardado, final)','campaign.cjs'],
 ['Guardados: transferencia manual PC/Android','save-transfer.cjs'],
 ['Física 2× de jefes en 17 mapas','boss-physics.cjs'],
 ['IA campaña: trayectorias, rutas y equidad','campaign-ai.cjs'],
 ['Auditoría campaña: historial, guardado y escopeta','campaign-audit.cjs'],
 ['Narrativa y diálogo 5.2','narrative.cjs'],
 ['Banda sonora y efectos','music.cjs',['10']],
 ['Mezcla de audio 5.1','audio-mix.cjs'],
 ['Bienvenida de idioma obligatoria','startup-language.cjs'],
 ['Servicio de idiomas','i18n-core.cjs'],
 ['Catálogos y estructura bilingüe','i18n-catalogs.cjs'],
 ['Cambio en vivo y guardados bilingües','i18n-browser.cjs'],
 ['LAN con idiomas distintos','i18n-lan.cjs'],
 ['Guardados 5.2 y progresión bilingüe','i18n-saves.cjs']
];
const results=[];
for(const [name,file,args=[]] of suites){
 const t0=Date.now();
 const r=spawnSync(process.execPath,[path.join(__dirname,file),...args],{stdio:'inherit'});
 results.push({name,ok:r.status===0,s:((Date.now()-t0)/1000).toFixed(0)});
}
console.log('\nResumen:');
for(const r of results)console.log(`${r.ok?'✔':'✘'} ${r.name} (${r.s} s)`);
if(results.some(r=>!r.ok))process.exitCode=1;
