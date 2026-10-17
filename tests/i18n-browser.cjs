const assert=require('node:assert/strict'),fs=require('node:fs');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{const srv=await serve(),browser=await launch({gpu:false});try{
 const context=await browser.newContext({...VIEWPORTS.desktop,locale:'en-US'});
 await context.addInitScript(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
 assert.equal(await page.evaluate(()=>CS5.i18n.locale),'en-US');
 assert.equal(await page.locator('#startButton').innerText(),'START BATTLE ↗');
 await page.evaluate(()=>CS5.i18n.setLanguage('es-419'));assert.match(await page.locator('#startButton').innerText(),/COMENZAR BATALLA/);
 await page.reload();await page.waitForFunction(()=>window.PocketSiege);assert.equal(await page.evaluate(()=>CS5.i18n.locale),'es-419');
 const result=await page.evaluate(()=>{
  const I=CS5.i18n,C=CS5.campaign,D=CS5.dialogue,failures=[],check=(ok,n)=>{if(!ok)failures.push(n);};
  C.load();C.open();
  // Los 34 estados y las diez formas de progreso se importan en ambos sentidos.
  let saves=0;
  for(let stage=0;stage<=34;stage++){
   const save=C.defaultSave();for(let n=1;n<=17;n++){save.progress[n]={b1:stage>=(n-1)*2+1,b2:stage>=n*2};}save.finished=stage===34;save.trophy=stage===34;save.victories=stage;save.defeats=2;save.difficulty='hard';save.squad.cooper.accessory='crown';save.seen=['prologue','c1.intro'];
   for(const lang of ['en-US','es-419']){I.setLanguage(lang);check(C.importData(JSON.stringify(save)),'import '+stage);check(C.stateIndex()===stage,'estado '+stage);const stored=localStorage.getItem('coopers-siege-campaign-v1'),json=C.exportData();I.setLanguage(lang==='en-US'?'es-419':'en-US');check(localStorage.getItem('coopers-siege-campaign-v1')===stored,'no escribir save '+stage);check(C.exportData()===json,'sin mutar save '+stage);check(!json.includes('en-US')&&!json.includes('es-419'),'idioma independiente');saves++;}
  }
  // Todas las escenas cambian en el mismo índice y no producen historial o progreso extra.
  let scenes=0;
  for(const [id,lines]of Object.entries(CS5.campaignStory.schema.scenes)){
   const chapter=Number(/^c(\d+)/.exec(id)?.[1])||17;I.setLanguage('es-419');D.play(id,CS5.campaignStory[id],{chapter},()=>{});D.next();
   const history=D.history.length,seen=JSON.stringify(C.save.seen),count=D.i;I.setLanguage('en-US');
   check(D.i===count&&D.ui.text.textContent===CS5.campaignStory[id][count][2],'diálogo '+id);check(D.history.length===history&&JSON.stringify(C.save.seen)===seen,'efectos diálogo '+id);D.finish(false);scenes++;
  }
  C.closeResult();C.hideHub();C.startBattle(4,2);for(let i=0;i<90;i++)PocketSiege.step(1/60);app.paused=true;
  const snapshot=()=>JSON.stringify({phase:app.phase,paused:app.paused,timer:app.timer,turn:app.turn,round:app.round,seed,chars:app.chars,teams:app.teams,projectiles:app.projectiles,supplies:app.supplies,campaign:C.save,active:C.active,attack:CS5.attack.state,angle:app.angle,power:app.power,target:app.target});
  const before=snapshot(),mask=terrain.mask.slice(),song=CS5.composer.song,step=audio.step;
  for(let i=0;i<20;i++)I.setLanguage(i%2?'en-US':'es-419');
  check(snapshot()===before,'estado combate idéntico');check(terrain.mask.every((v,i)=>v===mask[i]),'terreno idéntico');check(CS5.composer.song===song&&audio.step===step,'música sin reinicio');
  check(document.getElementById('weaponName').textContent==='Bazooka','HUD');check(document.querySelector('.bb-name b').textContent==='Pharaoh Rib','jefe en vivo');
  C.showBossCard(17,()=>{});I.setLanguage('es-419');check(C.resultEl.textContent.includes('Cooper Cero'),'tarjeta ES');I.setLanguage('en-US');check(C.resultEl.textContent.includes('Cooper Zero'),'tarjeta EN');
  C.showResult(false);I.setLanguage('es-419');check(C.resultEl.textContent.includes('DERROTA'),'resultado ES');I.setLanguage('en-US');check(C.resultEl.textContent.includes('DEFEAT'),'resultado EN');
  C.closeResult();C.showHub('settings');I.setLanguage('es-419');check(C.body.textContent.includes('Gorra'),'accesorios ES');I.setLanguage('en-US');check(C.body.textContent.includes('Cap'),'accesorios EN');
  return {failures,saves,scenes,warnings:[...I.warnings]};
 });
 console.log(result);assert.deepEqual(result.failures,[]);assert.deepEqual(result.warnings,[]);assert.deepEqual(errors,[]);
 await context.close();
 // Detección sin preferencia para los dos idiomas y respaldo de idiomas no compatibles.
 for(const [locale,expected]of [['es-MX','es-419'],['es-ES','es-419'],['en-GB','en-US'],['fr-FR','es-419']]){const p=await browser.newPage({...VIEWPORTS.desktop,locale});await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);assert.equal(await p.evaluate(()=>CS5.i18n.locale),expected);await p.close();}
 console.log('✔ Navegador bilingüe: detección, persistencia, 70 importaciones, 106 escenas y cambio sin alterar combate, terreno, audio ni guardado');
 }finally{await browser.close();await srv.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
