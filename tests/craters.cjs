// Captura de cráteres: lanza varias explosiones en un mapa y fotografía el resultado.
// Uso: node tests/craters.cjs <mapa> <salida.jpg> [viewport]
const path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');
(async()=>{
 const map=Number(process.argv[2]||0),settle=Number(process.env.SETTLE||40),out=path.resolve(ROOT,process.argv[3]||'test-results/craters.jpg'),vp=process.argv[4]||'desktop';
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS[vp]),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  await page.evaluate(({m,settle})=>{const P=PocketSiege;P.mainMenu();P.selectMap(m);document.getElementById('modeCPU').click();P.newMatch(99);for(let i=0;i<120;i++)P.step(1/60);
   const a=P.state.active;for(let k=0;k<4;k++){const x=a.x+120+k*70,s=P.terrain.surface(x,200,false);if(s)P.explode(x,s.y+10,k===2?90:55,40,-1);}
   for(let i=0;i<settle;i++)P.step(1/60);},{m:map,settle});
  await page.waitForTimeout(700);await page.screenshot({path:out,type:'jpeg',quality:82,scale:'css'});
 }finally{await browser.close();await srv.close();}
 if(errors.length){console.error(errors);process.exitCode=1;}else console.log('ok',path.relative(ROOT,out));
})().catch(e=>{console.error(e);process.exitCode=1;});
