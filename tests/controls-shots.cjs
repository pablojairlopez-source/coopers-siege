// Capturas de la disposición de controles 5.1 (reposo y apuntando) en varias pantallas.
// Uso: node tests/controls-shots.cjs <carpeta> [s23ultra,fold,desktop]
const fs=require('node:fs'),path=require('node:path');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
const out=process.argv[2]||'test-results/controls';
const list=(process.argv[3]||'s23ultra,desktop').split(',');
const EXTRA={smallphone:{viewport:{width:640,height:360},deviceScaleFactor:3,isMobile:true,hasTouch:true},foldClosed:{viewport:{width:882,height:344},deviceScaleFactor:2.6,isMobile:true,hasTouch:true},tablet:{viewport:{width:1180,height:820},deviceScaleFactor:2,isMobile:true,hasTouch:true}};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const srv=await serve(),browser=await launch();
 try{
  for(const name of list){
   const ctx=await browser.newContext(VIEWPORTS[name]||EXTRA[name]);
   const page=await ctx.newPage();
   await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
   await page.evaluate(m=>{const P=PocketSiege;P.mainMenu();P.selectMap(m);document.getElementById('modeCPU').click();P.newMatch(5);for(const t of app.teams)t.human=true;for(let i=0;i<300&&app.phase!=='aim';i++)P.step(1/60);app.timer=999;},Number(process.env.MAP||0));
   await page.waitForTimeout(900);
   await page.screenshot({path:path.join(out,`${name}-reposo.jpg`),quality:82});
   await page.evaluate(()=>{CS5.attack.enter();CS5.attack.beginCharge('test');app.power=72;updateHUD();});
   await page.waitForTimeout(400);
   await page.screenshot({path:path.join(out,`${name}-apuntando.jpg`),quality:82});
   await ctx.close();console.log('ok',name);
  }
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
