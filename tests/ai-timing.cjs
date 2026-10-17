// Medición del coste de planificar un turno; ejecutar sin otras pruebas en paralelo.
const fs=require('node:fs'),path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');
(async()=>{const srv=await serve();let browser;try{
 browser=await launch({gpu:false});const ctx=await browser.newContext(VIEWPORTS.s23ultra);
 await ctx.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 const page=await ctx.newPage(),cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
 const runs=await page.evaluate(()=>{
  const out=[],C=CS5.campaign;C.load();C.save.difficulty='normal';
  for(const n of [1,4,8,11,13,17])for(const battle of [1,2]){
   C.startBattle(n,battle);const times=[];for(let i=0;i<10;i++){
    const c=app.chars[i%app.chars.length];app.active=c;app.team=c.team;
    const t=performance.now();PocketSiege.planAI();times.push(performance.now()-t);
   }
   times.sort((a,b)=>a-b);out.push({n,battle,avgMs:+(times.reduce((a,b)=>a+b,0)/times.length).toFixed(2),p95Ms:+times[9].toFixed(2)});C.leaveBattle();
  }return out;
 });
 const result={date:new Date().toISOString(),profile:'S23 Ultra emulado, CPU 4×, sin render',runs};
 const file=path.resolve(ROOT,process.argv[2]||'test-results/ai-timing.json');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(result,null,1));console.log(JSON.stringify(result));
}finally{if(browser)await browser.close();await srv.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
