// Guardado local y transferencia de campañas entre navegadores independientes.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const server=await serve(),browser=await launch({gpu:false}),errors=[];
 try{
  const first=await browser.newContext({...VIEWPORTS.desktop,acceptDownloads:true});
  const pc=await first.newPage();pc.on('pageerror',e=>errors.push(e.message));
  await pc.goto(server.url);
  await pc.waitForFunction(()=>window.PocketSiege&&document.getElementById('saveManagerButton'));
  await pc.evaluate(()=>{
   const C=CS5.campaign;C.load();
   C.save.progress[1]={b1:true,b2:false};C.store();
   C.save.progress[1]={b1:true,b2:true};C.save.chapter=2;C.store();
  });
  assert.equal(await pc.evaluate(()=>JSON.parse(CS5.campaign.backupData()).progress[1].b2),false,'copia anterior conservada');
  await pc.locator('#saveManagerButton').click();
  assert.equal(await pc.locator('.save-transfer').isVisible(),true,'gestor accesible desde menú');
  const exportPromise=pc.waitForEvent('download');
  await pc.locator('[data-transfer="export"]').click();
  const download=await exportPromise;
  assert.match(download.suggestedFilename(),/^coopers-siege-ch02-\d{4}-\d\d-\d\d\.json$/);
  const fs=require('node:fs'),json=fs.readFileSync(await download.path(),'utf8');
  assert.equal(JSON.parse(json).progress[1].b2,true);
  // Navegador A y B tienen almacenamientos independientes: simula traslado de archivo.
  const second=await browser.newContext({...VIEWPORTS.s23ultra,acceptDownloads:true});
  const phone=await second.newPage();phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(server.url);
  await phone.waitForFunction(()=>window.PocketSiege&&document.getElementById('saveManagerButton'));
  await phone.locator('#saveManagerButton').tap();
  assert.equal(await phone.locator('.save-transfer').isVisible(),true);
  await phone.locator('#saveTransferInput').setInputFiles({name:'coopers-siege.json',mimeType:'application/json',buffer:Buffer.from(json)});
  assert.equal(await phone.locator('#saveTransferModal').isVisible(),true,'siempre confirmar antes de importar');
  assert.equal(await phone.evaluate(()=>CS5.campaign.stateIndex()),0,'vista previa no modifica progreso');
  await phone.locator('[data-transfer="cancel"]').click();
  assert.equal(await phone.evaluate(()=>CS5.campaign.stateIndex()),0,'cancelar conserva el guardado');
  await phone.locator('#saveTransferInput').setInputFiles({name:'coopers-siege.json',mimeType:'application/json',buffer:Buffer.from(json)});
  await phone.locator('[data-transfer="confirm"]').click();
  assert.equal(await phone.evaluate(()=>CS5.campaign.stateIndex()),2,'importación confirmada');
  await phone.reload();await phone.waitForFunction(()=>window.PocketSiege);
  assert.equal(await phone.evaluate(()=>{CS5.campaign.load();return CS5.campaign.stateIndex();}),2,'persistencia tras recargar');
  // Un JSON inválido no cambia la campaña.
  await phone.evaluate(()=>{CS5.campaign.open();CS5.campaign.screen='saves';CS5.campaign.renderHub();});
  await phone.locator('#saveTransferInput').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"wrong"}')});
  assert.equal(await phone.evaluate(()=>CS5.campaign.stateIndex()),2,'importación inválida rechazada');
  // Imposibilidad de escribir: la API informa fallo y no dice que se guardó.
  const blocked=await phone.evaluate(()=>{
   const C=CS5.campaign,old=Storage.prototype.setItem,original=C.exportData();
   Storage.prototype.setItem=()=>{throw new DOMException('denied','QuotaExceededError');};
   let accepted;try{accepted=C.importData(JSON.stringify(C.defaultSave()));}
   finally{Storage.prototype.setItem=old;}
   return {accepted,same:original===C.exportData()};
  });
  assert.equal(blocked.accepted,false);assert.equal(blocked.same,true);
  // Recuperación desde copia anterior si la primaria se corrompe.
  const recovered=await pc.evaluate(()=>{
   const C=CS5.campaign,key='coopers-siege-campaign-v1';
   localStorage.setItem(key,'{INVALID');
   C.load();return{state:C.storageState,done:C.stateIndex()};
  });
  assert.equal(recovered.state,'recovered');assert.equal(recovered.done,1);
  await first.close();await second.close();
  assert.deepEqual(errors,[]);
  console.log('✔ Guardados: exportación, importación con confirmación, copia anterior, Android y fallo de escritura');
 }finally{await browser.close();await server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
