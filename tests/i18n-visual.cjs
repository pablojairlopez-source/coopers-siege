// Capturas comparables y controles de límites en dos idiomas y cinco perfiles.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
const profiles={desktop:VIEWPORTS.desktop,s23ultra:{...VIEWPORTS.s23ultra,deviceScaleFactor:1},fold:{...VIEWPORTS.fold,deviceScaleFactor:1},tablet:{viewport:{width:1180,height:820},deviceScaleFactor:1,isMobile:true,hasTouch:true},compact:{viewport:{width:640,height:360},deviceScaleFactor:1,isMobile:true,hasTouch:true},portrait:{viewport:{width:412,height:915},deviceScaleFactor:1,isMobile:true,hasTouch:true}};
const scenes=['menu','language','map','setup','combat','arsenal','supply','journey','dialogue','bosscard','victory','defeat','gallery','trophy','finale','credits','settings','editor','error','help','lan','music'];
(async()=>{const srv=await serve(),browser=await launch(),errors=[],checks=[],out=path.resolve('test-results/i18n/shots');fs.mkdirSync(out,{recursive:true});try{
 for(const [profile,vp]of Object.entries(profiles))for(const lang of ['es-419','en-US']){
  const context=await browser.newContext({...vp,locale:lang});await context.addInitScript(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});const page=await context.newPage();page.on('pageerror',e=>errors.push(profile+':'+e.message));await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  for(const scene of scenes){
   await page.evaluate(({scene,lang})=>{
    const C=CS5.campaign,D=CS5.dialogue;D.done=null;if(D.open)D.finish(false);D.showHistory(false);C.closeResult();C.hideHub();C.active=null;app.campaign=null;
    for(const id of ['trophyCelebration','campaignCredits'])document.getElementById(id)?.remove();if(studio.open)closeStudio();mainMenu();for(const id of ['pause','help','lanModal','lyriaModal','inventory'])if($(id))$(id).hidden=true;
    $('languagePicker').open=false;C.load();C.save=C.defaultSave();CS5.i18n.setLanguage(lang);
    const complete=()=>{for(let n=1;n<=17;n++)C.save.progress[n]={b1:true,b2:true};C.save.bosses=CS5.campaignData.chapters.map(ch=>ch.boss.id);C.save.finished=C.save.trophy=true;};
    const battle=()=>{C.startBattle(1,1);for(let i=0;i<80;i++)PocketSiege.step(1/60);app.paused=true;updateHUD();};
    if(scene==='language')$('languagePicker').open=true;
    if(scene==='map')selectMap(16);
    if(scene==='setup')document.querySelector('#menu details').open=true;
    if(['combat','arsenal','supply'].includes(scene))battle();
    if(scene==='arsenal'){$('inventory').hidden=false;updateInventory();}
    if(scene==='supply'){const bone=CS5.supply.spawn(rng(3));CS5.supply.pick(bone,app.active);const b=CS5.supply.spawn(rng(4));b.x=app.active.x+70;b.y=app.active.y-70;}
    if(scene==='journey')C.showHub('map');
    if(scene==='dialogue'){$('menu').hidden=true;D.play('c4.bossIntro',CS5.campaignStory['c4.bossIntro'],{chapter:4},()=>{});D.i=4;D.render();D.next();}
    if(scene==='bosscard'){$('menu').hidden=true;C.showBossCard(17,()=>{});}
    if(['victory','defeat'].includes(scene)){$('menu').hidden=true;C.active={chapter:4,battle:2,attempt:1};C.showResult(scene==='victory');}
    if(scene==='gallery'){complete();C.showHub('gallery');}
    if(scene==='trophy'){complete();C.showHub('trophy');}
    if(scene==='finale'){$('menu').hidden=true;D.play('finale',CS5.campaignStory.finale,{chapter:17},()=>{});D.i=5;D.render();D.next();}
    if(scene==='credits'){$('menu').hidden=true;C.credits(()=>{});document.querySelector('.cmp-roll').style.animationDelay='-10s';}
    if(scene==='settings'){complete();C.showHub('settings');}
    if(scene==='editor'||scene==='error'){openStudio('pugs');if(scene==='error')studioStatus(()=>CS5.i18n.t('ui.main.saveStudio.s001',{p0:16}),true);}
    if(scene==='help')$('help').hidden=false;
    if(scene==='lan')$('lanModal').hidden=false;
    if(scene==='music')$('lyriaModal').hidden=false;
    PocketSiege.render(performance.now()/1000);
   },{scene,lang});
   await page.waitForTimeout(120);
   const layout=await page.evaluate(scene=>{
    const inside=r=>r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,intersect=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
    const visibleRect=el=>{const r=el.getBoundingClientRect(),v={left:r.left,right:r.right,top:r.top,bottom:r.bottom};for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),b=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowX)){v.left=Math.max(v.left,b.left);v.right=Math.min(v.right,b.right);}if(/auto|scroll|hidden|clip/.test(s.overflowY)){v.top=Math.max(v.top,b.top);v.bottom=Math.min(v.bottom,b.bottom);}}return v;};
    const picker=$('languagePicker').querySelector('summary').getBoundingClientRect(),bad=[],buttons=[...document.querySelectorAll('button,select')].filter(el=>el.checkVisibility()&&!el.closest('#languagePicker'));
    for(const el of buttons){const r=visibleRect(el);if(r.right>r.left&&r.bottom>r.top&&intersect(r,picker))bad.push('selector:'+el.id+':'+el.textContent.trim().slice(0,20));}
    if(!inside(picker)||picker.height<36)bad.push('selector fuera de pantalla o pequeño');
    if(['dialogue','finale'].includes(scene)){const box=document.querySelector('.dlg-box').getBoundingClientRect();if(!inside(box))bad.push('diálogo fuera de pantalla');for(const el of document.querySelectorAll('.dlg-actions button'))if(!inside(el.getBoundingClientRect()))bad.push('acción diálogo');}
    if(['combat','arsenal','supply'].includes(scene))for(const id of ['fireButton','touchJump','weaponsButton']){const el=$(id);if(el.checkVisibility()&&!inside(el.getBoundingClientRect()))bad.push(id+' fuera');}
    const text=document.body.innerText;if(/undefined|\[object Object\]|\{p\d+\}/.test(text))bad.push('texto sin resolver');
    return {bad,warnings:[...CS5.i18n.warnings]};
   },scene);checks.push({profile,lang,scene,...layout});
   await page.screenshot({path:path.join(out,`${profile}-${lang}-${scene}.jpg`),type:'jpeg',quality:85});
  }
  await context.close();console.log(profile+' '+lang+': '+scenes.length+' capturas');
 }
 fs.writeFileSync('test-results/i18n/visual.json',JSON.stringify({errors,checks},null,1));console.log(checks.filter(c=>c.bad.length||c.warnings.length));assert.deepEqual(errors,[]);assert.ok(checks.every(c=>!c.bad.length&&!c.warnings.length),'límites/selector/errores de texto');
 console.log(`✔ ${checks.length} capturas bilingües: PC, S23 Ultra, plegable, tableta y Android compacto`);
 }finally{await browser.close();await srv.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
