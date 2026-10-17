// Captura el editor de pugs con cada pose/expresión y variante.
// Uso: node tests/pug-poses.cjs <carpeta-salida> [variantes]
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');
(async()=>{
 const out=path.resolve(ROOT,process.argv[2]||'test-results/poses');fs.mkdirSync(out,{recursive:true});
 const variants=(process.argv[3]||'normal').split(',');
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop),page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  await page.evaluate(()=>{document.getElementById('characterEditorButton').click();document.getElementById('pugAutoRotate').checked=false;document.getElementById('pugRotation').value='-25';pugPreview.zoom=2.3;});
  await page.waitForTimeout(500);
  const stage=page.locator('#pugPreview3D');
  for(const v of variants){
   await page.evaluate(v=>{const s=document.getElementById('pugVariant');if(s){s.value=v;s.dispatchEvent(new Event('change'));s.dispatchEvent(new Event('input'));}},v);
   for(const pose of ['idle','aim','celebrate','scared','hurt','dizzy','sad','sleepy']){
    await page.evaluate(p=>document.querySelector(`[data-pose="${p}"]`).click(),pose);
    await page.waitForTimeout(450);
    const b=await stage.boundingBox();
    await page.screenshot({path:path.join(out,`${v}-${pose}.jpg`),type:'jpeg',quality:85,clip:{x:b.x+b.width*.28,y:b.y+b.height*.06,width:b.width*.44,height:b.height*.66}});
   }
  }
 }finally{await browser.close();await srv.close();}
 if(errors.length){console.error(errors);process.exitCode=1;}else console.log('ok');
})().catch(e=>{console.error(e);process.exitCode=1;});
