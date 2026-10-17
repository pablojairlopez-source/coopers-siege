// Capturas comparativas de todos los escenarios (menú + combate) en escritorio y
// Galaxy S23 Ultra emulado. Uso:
//   node tests/visual.cjs [carpeta-salida] [viewport,...] [mapa,...]
// Ej.: node tests/visual.cjs docs/screenshots/after desktop,s23ultra
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');

(async()=>{
 const out=path.resolve(ROOT,process.argv[2]||'test-results/screens');
 const vps=(process.argv[3]||'desktop,s23ultra').split(',');
 const onlyMaps=process.argv[4]?process.argv[4].split(',').map(Number):null;
 fs.mkdirSync(out,{recursive:true});
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  for(const vp of vps){
   const ctx=await browser.newContext(VIEWPORTS[vp]);
   const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push(`${vp}: ${e.message}`));
   await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
   await page.waitForTimeout(600);
   const shot=file=>page.screenshot({path:path.join(out,file),type:'jpeg',quality:78,scale:'css'});
   await shot(`${vp}-menu.jpg`);
   const count=await page.evaluate(()=>PocketSiege.maps.length);
   for(let m=0;m<count;m++){
    if(onlyMaps&&!onlyMaps.includes(m))continue;
    await page.evaluate(m=>{
     PocketSiege.mainMenu();PocketSiege.selectMap(m);
     document.getElementById('modeCPU').click();
     PocketSiege.newMatch(4242+m);
    },m);
    // Deja asentarse a los pugs y que la cámara llegue a su posición.
    await page.evaluate(()=>{for(let i=0;i<150;i++)PocketSiege.step(1/60);});
    await page.waitForTimeout(900);
    const id=await page.evaluate(m=>PocketSiege.maps[m].id,m);
    await shot(`${vp}-map${String(m).padStart(2,'0')}-${id}.jpg`);
   }
   await ctx.close();
  }
 }finally{await browser.close();await srv.close();}
 if(errors.length){console.error('Errores de página:\n'+errors.join('\n'));process.exitCode=1;}
 else console.log(`Capturas guardadas en ${path.relative(ROOT,out)}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
