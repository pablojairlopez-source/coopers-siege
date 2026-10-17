// 5.2 — Capturas de las novedades. Uso: node tests/shots-52.cjs <salida> [desktop,s23ultra] [escenas]
// Escenas: supply (huesito en vuelo y posado), y las de campaña cuando existen (CS5.campaign.shots).
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
const out=process.argv[2]||'test-results/shots-52';
const views=(process.argv[3]||'desktop,s23ultra').split(',');
const only=process.argv[4]?process.argv[4].split(','):null;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  for(const v of views){
   const ctx=await browser.newContext(VIEWPORTS[v]||VIEWPORTS.desktop);
   const page=await ctx.newPage();page.on('pageerror',e=>errors.push(v+': '+e.message));
   await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);await page.waitForTimeout(400);
   const scenes=await page.evaluate(()=>['supply',...Object.keys(window.CS5?.campaignShots||{})]);
   for(const name of scenes){
    if(only&&!only.includes(name))continue;
    if(name==='supply'){
     await page.evaluate(()=>{const P=PocketSiege,s=P.state;P.mainMenu();P.selectMap(0);document.getElementById('modeCPU').click();P.newMatch(512);for(let i=0;i<80;i++)P.step(1/60);const c=s.active;
      const a=CS5.supply.spawn(rng(3));a.x=c.x+70;a.y=c.y-120;const b=CS5.supply.spawn(rng(4));const f=P.terrain.surface(c.x-90,c.y-60);b.x=c.x-90;b.y=f?f.y:c.y;b.state='ground';b.chute=false;
      CS5.supply.pick=()=>null;s.timer=999;});
     await page.waitForTimeout(700);
    }else{
     await page.evaluate(n=>CS5.campaignShots[n](),name);await page.waitForTimeout(900);
    }
    const file=path.join(out,`${v}-${name}.jpg`);await page.screenshot({path:file,type:'jpeg',quality:82});console.log(file);
   }
   await ctx.close();
  }
  if(errors.length){console.error(errors);process.exitCode=1;}
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
