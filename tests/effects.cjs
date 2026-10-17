// Daño, gore y destrucción: niveles de gore (Ninguno desactiva toda la sangre),
// escala por nivel, cráteres irregulares deterministas, chamuscado y escombros.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const r=await page.evaluate(()=>{
   const P=PocketSiege,gore={};
   for(const lvl of ['none','low','medium','high','demonic']){
    P.setGoreLevel(lvl,false);P.mainMenu();P.selectMap(0);document.getElementById('modeCPU').click();P.newMatch(7);
    for(let i=0;i<60;i++)P.step(1/60);
    const c=P.state.chars[1];P.explode(c.x,c.y-10,60,200,-1);for(let i=0;i<30;i++)P.step(1/60);
    gore[lvl]=P.bloodFluid.count+P.state.fx.filter(f=>['blood','bloodMist','pugbit'].includes(f.kind)).length;
   }
   // Cráter irregular y determinista: la misma explosión produce exactamente la misma máscara.
   const mask=()=>{P.mainMenu();P.selectMap(2);P.newMatch(31);const t=P.terrain,x=1500,s=t.surface(x,200,false);P.explode(x,s.y+20,80,10,-1);return {sum:t.mask.reduce((a,v,i)=>(a+v*(i%65521))>>>0,0),scorch:t.scorches.length,chunks:P.state.fx.filter(f=>f.kind==='chunk').length,shock:P.state.fx.some(f=>f.kind==='shock')};};
   const a=mask(),b=mask();
   // El borde no es un círculo perfecto: hay puntos a 0,98 r que quedan sólidos y otros a 1,05 r que no.
   P.mainMenu();P.selectMap(2);P.newMatch(32);const t=P.terrain,cx=1500,cy=t.surface(cx,200,false).y+40;t.mask.fill(1,(cy-150)*3072,(cy+150)*3072);t.destroy(cx,cy,80);
   let inside=0,outside=0;for(let k=0;k<360;k++){const an=k/360*Math.PI*2;if(t.solid(cx+Math.cos(an)*78.5,cy+Math.sin(an)*78.5))inside++;if(!t.solid(cx+Math.cos(an)*84,cy+Math.sin(an)*84))outside++;}
   return {gore,a,b,inside,outside};
  });
  assert.equal(r.gore.none,0,'Ninguno no genera sangre');
  assert.ok(r.gore.low>0&&r.gore.low<r.gore.medium&&r.gore.medium<r.gore.high&&r.gore.high<r.gore.demonic,`la sangre escala con el nivel ${JSON.stringify(r.gore)}`);
  assert.equal(r.a.sum,r.b.sum,'cráter determinista');
  assert.ok(r.a.scorch>=1&&r.a.chunks>0&&r.a.shock,'chamuscado, escombros y onda expansiva');
  assert.ok(r.inside>0&&r.outside>0,`borde irregular (${r.inside} dentro, ${r.outside} fuera)`);
  assert.deepEqual(errors,[]);
  console.log('PASS effects: gore por nivel '+JSON.stringify(r.gore)+', cráter irregular determinista, chamuscado y escombros.');
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
