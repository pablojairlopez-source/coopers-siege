// Regresiones de auditoría: historial después de recargar y fallo real del almacenamiento.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve();let browser;
 try{
  browser=await launch({gpu:false});const context=await browser.newContext(VIEWPORTS.s23ultra),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  await page.evaluate(()=>{const C=CS5.campaign;C.load();C.markSeen('c4.bossIntro');C.markSeen('prologue');C.markSeen('__proto__');C.markSeen('desconocida');});
  await page.reload();await page.waitForFunction(()=>window.PocketSiege);
  await page.evaluate(()=>{CS5.campaign.load();CS5.campaign.open();CS5.campaign.action('history',{});});
  assert.equal(await page.locator('.dlg-history').isVisible(),true);
  assert.ok(await page.locator('.dlg-history li').count()>5,'reconstruir historial persistido');
  assert.ok((await page.locator('.dlg-history').innerText()).includes('Faraón Costilla'),'nombre de jefe del capítulo correcto');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#dialogue').isVisible(),false,'Escape desde recorrido cierra el historial');
  for(let k=0;k<3;k++){
   await page.evaluate(()=>CS5.campaign.action('history',{}));await page.locator('.dlg-history-close').tap();
   assert.equal(await page.locator('#dialogue').isVisible(),false,'cerrar por toque sin acumular manejadores');
  }
  const store=await page.evaluate(()=>{
   const C=CS5.campaign,old=Storage.prototype.setItem,oldToast=toast,messages=[];
   toast=(...args)=>messages.push(args[0]);Storage.prototype.setItem=()=>{throw new DOMException('Cuota agotada','QuotaExceededError');};
   let first,second;try{first=C.store();second=C.store();}finally{Storage.prototype.setItem=old;toast=oldToast;}
   const exported=JSON.parse(C.exportData()),recover=C.store();return {first,second,messages,seen:exported.seen,recover};
  });
  assert.equal(store.first,false);assert.equal(store.second,false);assert.equal(store.messages.length,1,'un aviso ante fallo real de guardado');
  assert.ok(store.messages[0].includes('Exporta'));assert.ok(store.seen.includes('c4.bossIntro'),'exportación sigue disponible');assert.equal(store.recover,true);
  const shotgun=await page.evaluate(()=>{
   const C=CS5.campaign;C.startBattle(1,1);const results=[];
   for(const team of [0,1]){
    app.team=team;app.active=app.chars.find(c=>c.team===team);app.teams[team].ammo.shotgun=1;
    app.weapon='shotgun';app.shotCount=0;setPhase('aim');const first=shoot();
    app.projectiles=[];setPhase('aim');app.weapon='rocket';const other=shoot();
    app.weapon='shotgun';const second=shoot();const left=app.teams[team].ammo.shotgun;
    results.push({first,second,other,left});
   }
   C.leaveBattle();return results;
  });
  for(const r of shotgun)assert.deepEqual(r,{first:true,second:true,other:false,left:0},'última carga da dos disparos, sin cambiar a bazuca entre ellos');
  assert.deepEqual(errors,[]);console.log('✔ Auditoría: historial persistido con nombre correcto, Escape/toque en S23 Ultra y recuperación tras fallo de guardado');
 }finally{if(browser)await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
