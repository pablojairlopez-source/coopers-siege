// Comparación reproducible con copia de 5.2 extraída por git archive, sin cambiar de rama.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS,gpuInfo}=require('./lib/harness.cjs');
const stats=a=>{const s=a.slice().sort((x,y)=>x-y);return {n:a.length,mean:+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(3),p50:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)]};};
(async()=>{const base=await serve(path.resolve('test-results/i18n/base')),current=await serve(),browser=await launch(),out={base:'0f8cc74',date:new Date().toISOString(),runs:[]},errors=[];try{
 for(const [profile,viewport,cpu]of [['pc',VIEWPORTS.desktop,1],['android',VIEWPORTS.s23ultra,4]]){
  for(const version of ['5.2','es-419','en-US']){
   const ctx=await browser.newContext({...viewport,deviceScaleFactor:1,locale:'es-CL'});await ctx.addInitScript(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});await p.goto(version==='5.2'?base.url:current.url);await p.waitForFunction(()=>window.PocketSiege);out.gpu??=await gpuInfo(p);
   const run=await p.evaluate(async version=>{
    if(version!=='5.2')CS5.i18n.setLanguage(version);PocketSiege.applyGraphicsPreset('balanced',false);document.getElementById('modeLocal').click();PocketSiege.newMatch(5222);for(let i=0;i<120;i++)PocketSiege.step(1/60);app.paused=true;
    const frames=[],hud=[],next=()=>new Promise(r=>requestAnimationFrame(r));
    for(let i=0;i<100;i++){await next();let t=performance.now();PocketSiege.render(i/60);const g=PocketSiege.renderer.g;if(g)g.readPixels(0,0,1,1,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array(4));if(i>=20)frames.push(performance.now()-t);t=performance.now();for(let k=0;k<100;k++)updateHUD();if(i>=20)hud.push((performance.now()-t)/100);}
    const switches=[];if(version!=='5.2')for(let i=0;i<30;i++){const t=performance.now();CS5.i18n.setLanguage(CS5.i18n.locale==='es-419'?'en-US':'es-419');switches.push(performance.now()-t);}
    return {frames,hud,switches,heap:performance.memory?.usedJSHeapSize||null};
   },version);out.runs.push({profile,cpuThrottle:cpu,version,frameMs:stats(run.frames),hudMs:stats(run.hud),switchMs:run.switches.length?stats(run.switches):null,heapMB:run.heap?+(run.heap/1048576).toFixed(2):null});await ctx.close();
  }
 }
 fs.writeFileSync('test-results/i18n/performance.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));assert.deepEqual(errors,[]);
 }finally{await browser.close();await base.close();await current.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
