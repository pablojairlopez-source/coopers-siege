// Memoria de los lienzos de la escenografía (capas pintadas) que quedan en caché
// tras recorrer varios mapas, y de un mapa por nivel de calidad.
// Uso: node tests/memory.cjs
const {serve,launch}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve(),browser=await launch(),page=await browser.newPage();
 try{
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const r=await page.evaluate(()=>{
   const size=S=>[...S.layers.map(l=>l.cv),S.landmark?.cv,S.skyCv,...S.clouds.map(c=>c.cv)].filter(Boolean).reduce((s,c)=>s+c.width*c.height*4,0)/1048576;
   const perLevel={};for(const lvl of [0,1,2,3])perLevel[['Económico','Equilibrado','Alto','Ultra'][lvl]]=+size(CS5.scenery.prepare(0,lvl)).toFixed(1);
   // Recorre 6 mapas en Ultra y suma lo que queda retenido en la caché.
   const retained=new Set();for(let m=0;m<6;m++)CS5.scenery.prepare(m,3);
   let total=0;for(let m=0;m<16;m++){const S=CS5.scenery.cacheEntry?.(m,3);if(S&&!retained.has(S)){retained.add(S);total+=size(S);}}
   return {perLevel,retainedMB:+total.toFixed(1),entries:retained.size,terrainMB:+((3072*768*4*2+3072*768)/1048576).toFixed(1)};
  });
  console.log('Escenografía de un mapa por calidad (MB):',JSON.stringify(r.perLevel));
  console.log(`Retenido en caché tras recorrer 6 mapas en Ultra: ${r.retainedMB} MB en ${r.entries} mapas · terreno (lienzo + imagen + máscara): ${r.terrainMB} MB`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
