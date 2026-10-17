// Ejecuta todas las suites en orden y resume el resultado (npm test).
// La prueba original de LAN (tests/lan-coop.cjs) se conserva sin cambios en sus aserciones.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const suites=[
 ['LAN 6v6 (original)','lan-coop.cjs'],
 ['Escenarios ampliados','smoke.cjs'],
 ['Daño, gore y destrucción','effects.cjs'],
 ['HUD responsivo','ui.cjs'],
 ['Banda sonora y efectos','music.cjs',['10']]
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
