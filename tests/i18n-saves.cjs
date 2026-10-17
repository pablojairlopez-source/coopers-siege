const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),path=require('node:path');
const {chromium}=require('playwright');const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{const srv=await serve(),browser=await launch({gpu:false});try{
 const p=await browser.newPage({...VIEWPORTS.desktop,locale:'en-US'});await p.addInitScript(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);
 const data=await p.evaluate(()=>CS5.campaignData.chapters.map(c=>({n:c.n,boss:{id:c.boss.id}})));
 const old={CS5:{campaignData:{chapters:data,cast:Object.fromEntries(['cooper','pipa','bongo','roco'].map(id=>[id,{accessory:'cap',fur:'#d9ae78'}]))}}};
 vm.runInNewContext(cp.execFileSync('git',['show','0f8cc74:src/campaign/campaign.js'],{encoding:'utf8'}),{window:old});const legacy=old.CS5.campaign.defaultSave();legacy.progress[1]={b1:true,b2:true};legacy.progress[2]={b1:true,b2:false};legacy.last={chapter:2,battle:2,won:false};legacy.seen=['prologue','c1.intro'];legacy.victories=3;
 fs.mkdirSync('test-results/i18n',{recursive:true});fs.writeFileSync('test-results/i18n/legacy-52.json',JSON.stringify(legacy,null,1));
 const result=await p.evaluate(legacy=>{
  const C=CS5.campaign,I=CS5.i18n,failures=[];I.setLanguage('en-US');if(!C.importData(JSON.stringify(legacy))||C.stateIndex()!==3)failures.push('5.2 import');
  const complete=[];
  for(const lang of ['es-419','en-US']){
   C.reset();I.setLanguage(lang);C.ensureUI();
   for(let n=1;n<=17;n++)for(let battle=1;battle<=2;battle++){
    C.closeResult();C.startBattle(n,battle);const index=(n-1)*2+battle;
    // Se determina el resultado mediante la misma entrada usada por las pruebas históricas.
    for(const ch of app.chars)if(ch.team===1)ch.hp=-1;PocketSiege.checkWinner(true);C.reveal();
    if(C.stateIndex()!==index)failures.push(lang+':'+index);
    const save=C.exportData(),stored=localStorage.getItem('coopers-siege-campaign-v1');I.setLanguage(lang==='es-419'?'en-US':'es-419');
    if(save!==C.exportData()||stored!==localStorage.getItem('coopers-siege-campaign-v1'))failures.push('switch victory '+index);
    I.setLanguage(lang);complete.push(index);
   }
  }
  // Historial: refrescar idioma no duplica filas ni altera escenas vistas.
  CS5.dialogue.play('c1.intro',CS5.campaignStory['c1.intro'],{chapter:1});CS5.dialogue.next();CS5.dialogue.showHistory(true);const count=CS5.dialogue.history.length;I.setLanguage('en-US');if(!CS5.dialogue.ui.histList.textContent.includes(CS5.campaignStory['c1.intro'][0][2])||CS5.dialogue.history.length!==count)failures.push('history');CS5.dialogue.finish(false);
  return {failures,complete:complete.length,warnings:[...I.warnings]};
 },legacy);console.log(result);assert.deepEqual(result.failures,[]);assert.deepEqual(result.warnings,[]);assert.equal(result.complete,68);
 }catch(error){await srv.close();throw error;}finally{await browser.close();}
 // Perfil persistente real: cerrar Chromium y volver a abrir el mismo directorio.
 const dir=path.resolve('test-results/i18n/profile-'+process.pid),opts={headless:true,locale:'es-MX',...(process.env.TEST_BROWSER_PATH?{executablePath:process.env.TEST_BROWSER_PATH}:{}),args:['--autoplay-policy=no-user-gesture-required']};
 let persistent=await chromium.launchPersistentContext(dir,opts);try{let p=await persistent.newPage();await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);await p.evaluate(()=>CS5.i18n.setLanguage('en-US'));await persistent.close();persistent=await chromium.launchPersistentContext(dir,opts);p=await persistent.newPage();await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);assert.equal(await p.evaluate(()=>CS5.i18n.locale),'en-US');}finally{await persistent.close();await srv.close();}
 console.log('✔ Guardado real 5.2, 68 victorias/34 estados por idioma, historial y preferencia tras cerrar/reabrir Chromium');
})().catch(e=>{console.error(e);process.exitCode=1;});
