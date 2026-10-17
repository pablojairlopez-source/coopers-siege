// Medición de rendimiento: tiempo de frame (render + simulación) en reposo y
// durante una cadena de explosiones grandes, por escenario y perfil.
// Perfiles: "pc" (GPU real, sin límite de CPU) y "android" (S23 Ultra emulado:
// DPR 3.5 y CPU 4× más lenta mediante CDP). La emulación NO sustituye a un
// dispositivo físico: sirve para comparar versiones entre sí.
// Uso: node tests/perf.cjs [salida.json] [mapas] [perfiles]
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,gpuInfo,VIEWPORTS,ROOT}=require('./lib/harness.cjs');

const PROFILES={
 pc:{vp:'desktop',cpu:1,preset:'ultra'},
 android:{vp:'s23ultra',cpu:4,preset:'auto'}
};

function stats(samples){
 const s=[...samples].sort((a,b)=>a-b),avg=s.reduce((a,b)=>a+b,0)/s.length;
 const pct=p=>s[Math.min(s.length-1,Math.floor(p*s.length))];
 return {frames:s.length,avgMs:+avg.toFixed(2),p50Ms:+pct(.5).toFixed(2),p95Ms:+pct(.95).toFixed(2),maxMs:+s[s.length-1].toFixed(2),fpsEquivalent:+(1000/avg).toFixed(1)};
}

(async()=>{
 const outFile=path.resolve(ROOT,process.argv[2]||'test-results/perf.json');
 // 5.2: un mapa «cNbM» mide la batalla M del capítulo N de la campaña (jefe, huesitos, aura y zona).
const maps=(process.argv[3]||'0,2,7').split(',').map(v=>/^c\d+b[12]$/.test(v)?v:Number(v));
 const profiles=(process.argv[4]||'pc,android').split(',');
 const srv=await serve(),browser=await launch(),errors=[],result={date:new Date().toISOString(),runs:[]};
 try{
  for(const name of profiles){
   const prof=PROFILES[name];
   const ctx=await browser.newContext(VIEWPORTS[prof.vp]);
   // La medición controla los frames: se desactiva el bucle rAF propio del juego.
   await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
   const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
   const cdp=await ctx.newCDPSession(page);
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:prof.cpu});
   await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
   result.gpu=result.gpu||await gpuInfo(page);
   for(const m of maps){
    const run=await page.evaluate(async({m,preset})=>{
     const P=PocketSiege;P.applyGraphicsPreset(preset,false);
     if(typeof m==='string'){const [ch,b]=m.slice(1).split('b').map(Number);CS5.campaign.load();CS5.campaign.startBattle(ch,b);const boss=P.state.chars.find(c=>c.boss);if(boss)CS5.bosses.announce(boss,boss.boss.abilities[0]);CS5.supply.spawn(rng(5));}
     else{P.mainMenu();P.selectMap(m);document.getElementById('modeCPU').click();P.newMatch(777+m);}
     for(let i=0;i<120;i++)P.step(1/60);
     const nextFrame=()=>new Promise(r=>requestAnimationFrame(r));
     const measure=async(n,each)=>{const out=[];for(let i=0;i<n;i++){await nextFrame();const t0=performance.now();each&&each(i);P.step(1/60);P.render(performance.now()/1000);
      // Fuerza a la GPU a terminar para medir trabajo real y no solo encolado.
      const g=P.renderer?.g;if(g)g.readPixels(0,0,1,1,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array(4));
      out.push(performance.now()-t0);}return out;};
     await measure(20);
     const idle=await measure(180);
     const s=P.state,c=s.active;
     const heap0=performance.memory?.usedJSHeapSize||0;
     const boom=await measure(240,i=>{if(i%30===0){const x=200+((i*137)%Math.max(400,(P.terrain.mask.length/768)-400));P.explode(x,430,i%60===0?123:70,60,-1,i%60===0?'super':'normal');}});
     const heap1=performance.memory?.usedJSHeapSize||0;
     return {map:typeof m==='string'?m:P.maps[m].id,preset:preset,backend:P.renderer?.backend,idle,boom,heapMB:+(heap1/1048576).toFixed(1),heapGrowthMB:+((heap1-heap0)/1048576).toFixed(1),particles:s.fx.length,blood:P.bloodFluid?.count||0};
    },{m,preset:prof.preset});
    const entry={profile:name,map:run.map,preset:run.preset,backend:run.backend,idle:stats(run.idle),explosions:stats(run.boom),heapMB:run.heapMB,heapGrowthMB:run.heapGrowthMB,particlesAtEnd:run.particles,bloodAtEnd:run.blood};
    result.runs.push(entry);
    console.log(`${name.padEnd(8)} ${run.map.padEnd(10)} reposo ${entry.idle.avgMs} ms (p95 ${entry.idle.p95Ms}) · explosiones ${entry.explosions.avgMs} ms (p95 ${entry.explosions.p95Ms}, máx ${entry.explosions.maxMs}) · heap ${entry.heapMB} MB`);
   }
   await ctx.close();
  }
 }finally{await browser.close();await srv.close();}
 fs.mkdirSync(path.dirname(outFile),{recursive:true});
 fs.writeFileSync(outFile,JSON.stringify(result,null,1));
 if(errors.length){console.error('Errores de página:\n'+[...new Set(errors)].join('\n'));process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1;});
