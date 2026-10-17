// Prueba rápida de humo: arranca cada escenario, comprueba que el terreno se
// genera con suelo para todos los pugs, que nadie aparece en el agua y que no hay
// errores de página. Uso: node tests/smoke.cjs
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');

(async()=>{
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const report=await page.evaluate(()=>{
   const P=PocketSiege,out=[];
   for(let m=0;m<P.maps.length;m++){
    for(const seed of [11,2026]){
     P.mainMenu();P.selectMap(m);document.getElementById('modeCPU').click();
     document.getElementById('teamCount').value='4';document.getElementById('memberCount').value='3';
     P.newMatch(seed);
     for(let i=0;i<90;i++)P.step(1/60);
     const s=P.state,W=P.terrain.mask.length/768;
     const xs=s.chars.map(c=>Math.round(c.x));
     out.push({m,seed,W,chars:s.chars.length,alive:s.chars.filter(c=>c.hp>0).length,minGap:Math.min(...xs.slice().sort((a,b)=>a-b).map((x,i,a)=>i?x-a[i-1]:1e9)),maxY:Math.max(...s.chars.map(c=>c.y)),spread:Math.max(...xs)-Math.min(...xs)});
     P.render(performance.now()/1000);
    }
   }
   return out;
  });
  for(const r of report){
   assert.equal(r.W,3072,'mundo ampliado');
   assert.equal(r.chars,12,`mapa ${r.m}: 12 pugs`);
   assert.equal(r.alive,12,`mapa ${r.m} semilla ${r.seed}: ningún pug muere al aparecer`);
   assert.ok(r.maxY<680,`mapa ${r.m}: nadie aparece en el agua (${r.maxY})`);
   assert.ok(r.spread>1200,`mapa ${r.m}: los pugs se reparten por el mapa ampliado (${r.spread})`);
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS smoke: ${report.length} partidas en ${new Set(report.map(r=>r.m)).size} escenarios ampliados, sin errores.`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
