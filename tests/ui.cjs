// HUD responsivo: en escritorio, S23 Ultra (emulado), plegable y panorámico los
// elementos clave son visibles, caben en pantalla, no se solapan entre sí y la
// interfaz no tapa demasiada escena. También comprueba el aviso de girar el móvil.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve(),browser=await launch(),errors=[],report=[];
 try{
  for(const vp of ['desktop','s23ultra','fold','ultrawide']){
   const ctx=await browser.newContext(VIEWPORTS[vp]);
   await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
   const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
   const r=await page.evaluate(()=>{
    const P=PocketSiege;P.mainMenu();P.selectMap(3);document.getElementById('modeCPU').click();P.newMatch(5);for(let i=0;i<90;i++)P.step(1/60);P.resize();P.render(performance.now()/1000);
    const ids=['.match-info','#teamHealth','.wind-pill','.hud-buttons','#minimapWrap','#weaponsButton','#fireButton'];
    const W=innerWidth,H=innerHeight,boxes=[];
    for(const s of ids){const e=document.querySelector(s);if(!e)continue;const b=e.getBoundingClientRect(),st=getComputedStyle(e);if(st.display==='none'||st.visibility==='hidden'||b.width===0)continue;boxes.push({s,x:b.left,y:b.top,w:b.width,h:b.height});}
    const out=boxes.filter(b=>b.x<-1||b.y<-1||b.x+b.w>W+1||b.y+b.h>H+1).map(b=>b.s);
    const overlaps=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j],ox=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),oy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(ox>2&&oy>2)overlaps.push(a.s+' × '+b.s);}
    const area=boxes.reduce((s,b)=>s+b.w*b.h,0)/(W*H);
    const fire=boxes.find(b=>b.s==='#fireButton');
    return {W,H,visible:boxes.map(b=>b.s),out,overlaps,coverage:+area.toFixed(3),fireH:fire?Math.round(fire.h):0};
   });
   report.push({vp,...r});
   await ctx.close();
  }
  // Retrato en móvil: aviso de girar el dispositivo.
  const pctx=await browser.newContext({...VIEWPORTS.s23ultra,viewport:{width:412,height:915}});
  const pp=await pctx.newPage();await pp.goto(srv.url);await pp.waitForFunction(()=>window.PocketSiege);
  const rotate=await pp.evaluate(()=>!document.getElementById('rotateHint').hidden);
  await pctx.close();
  for(const r of report){
   console.log(`${r.vp.padEnd(10)} ${r.W}×${r.H} · cobertura HUD ${(r.coverage*100).toFixed(1)}% · ATACAR ${r.fireH}px · solapes: ${r.overlaps.join('; ')||'ninguno'}`);
   assert.ok(r.visible.includes('#fireButton')&&r.visible.includes('#weaponsButton')&&r.visible.includes('.match-info'),`${r.vp}: controles visibles`);
   assert.deepEqual(r.out,[],`${r.vp}: todo dentro de la pantalla`);
   assert.deepEqual(r.overlaps,[],`${r.vp}: sin solapes`);
   assert.ok(r.coverage<.2,`${r.vp}: el HUD tapa ${(r.coverage*100).toFixed(1)}% de la pantalla`);
   assert.ok(r.fireH>=36,`${r.vp}: botón ATACAR cómodo (${r.fireH}px)`);
  }
  assert.ok(rotate,'aviso de girar el móvil en vertical');
  assert.deepEqual(errors,[]);
  console.log('PASS ui: HUD sin solapes, dentro de pantalla y con cobertura < 20% en 4 pantallas; aviso de rotación en vertical.');
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
