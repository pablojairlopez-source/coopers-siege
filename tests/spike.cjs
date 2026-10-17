// Investigación de picos de frame: CPU ralentizada (perfil móvil emulado) y
// desglose por función de los frames más lentos durante una cadena de explosiones.
// Uso: node tests/spike.cjs [mapa=0] [cpu=4]
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const map=Number(process.argv[2]||0),cpu=Number(process.argv[3]||4);
 const srv=await serve(),browser=await launch();
 try{
  const ctx=await browser.newContext(VIEWPORTS.s23ultra);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const r=await page.evaluate(async map=>{
   const P=PocketSiege;P.applyGraphicsPreset('auto',false);P.mainMenu();P.selectMap(map);document.getElementById('modeCPU').click();P.newMatch(777+map);
   for(let i=0;i<120;i++)P.step(1/60);
   const cur={};const wrap=(obj,name,label)=>{const f=obj[name];if(typeof f!=='function')return;obj[name]=function(...a){const t0=performance.now();try{return f.apply(this,a);}finally{cur[label]=(cur[label]||0)+performance.now()-t0;}};};
   const R=P.renderer;
   wrap(R,'sync','gl.sync');wrap(R,'buildProps3D','props3d');wrap(R,'buildSideChunk','sideChunk');wrap(R,'draw','gl.draw');
   for(const n of ['drawPug','overlay','background','drawLightShafts','lightRayEndpoints','drawMinimap','updateCombatFX','flushPendingBloodStains','syncGoreTerrain','explode','updateHUD','drawPixelScenery','drawWeather','drawCombatFX'])wrap(window,n,n);
   wrap(P.terrain,'paint','terrain.paint');wrap(P.terrain,'destroy','terrain.destroy');wrap(P.bloodFluid,'step','blood.step');wrap(CS5.post,'frame','bloom');wrap(CS5.fx,'beforeExplosion','fx.before');wrap(CS5.scenery,'draw','scenery');
   const frames=[];const nf=()=>new Promise(r=>requestAnimationFrame(r));
   for(let i=0;i<240;i++){await nf();for(const k in cur)delete cur[k];const t0=performance.now();
    if(i%30===0){const x=200+((i*137)%Math.max(400,(P.terrain.mask.length/768)-400));P.explode(x,430,i%60===0?123:70,60,-1,i%60===0?'super':'normal');}
    const t1=performance.now();P.step(1/60);const t2=performance.now();P.render(performance.now()/1000);const g=P.renderer.g;g.readPixels(0,0,1,1,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array(4));const t3=performance.now();
    frames.push({i,total:t3-t0,explode:t1-t0,step:t2-t1,render:t3-t2,parts:{...cur}});}
   frames.sort((a,b)=>b.total-a.total);
   return frames.slice(0,6).map(f=>({frame:f.i,total:+f.total.toFixed(1),explode:+f.explode.toFixed(1),step:+f.step.toFixed(1),render:+f.render.toFixed(1),top:Object.entries(f.parts).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,v])=>k+' '+v.toFixed(1)).join(', ')}));
  },map);
  for(const f of r)console.log(JSON.stringify(f));
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
