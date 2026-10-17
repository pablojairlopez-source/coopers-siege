// 5.2 — Campaña «El Torneo del Universo».
// · Progresión completa de los 34 estados (17 capítulos × 2 batallas) por el flujo real:
//   diálogos → batalla → resultado → diálogos → presentación del jefe → jefe → capítulo completo.
// · Batalla 1: 3 pugs contra 5 bots de la misma variante con cosméticos reproducibles.
// · Batalla 2: jefe 2× (tamaño y caja de impacto), 250–400 HP, habilidades válidas; Roco se une en 16–17.
// · Arsenal estándar en ambos equipos. Derrota → reintento de la misma batalla sin perder progreso.
// · Guardado/restauración tras recargar, exportar/importar, saneado de guardados incoherentes.
// · Final: trofeo, créditos, escena poscréditos y trofeo guardado.
// · Habilidades de los 17 jefes: anuncio, ejecución, interrupción, fases de Cooper Cero, rescate del agua
//   y turno real de la IA del jefe.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');

(async()=>{
 const srv=await serve(),browser=await launch({gpu:false}),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  await page.evaluate(()=>{localStorage.removeItem('coopers-siege-campaign-v1');
   // Utilidades de prueba: cerrar diálogos encadenados, ganar o perder la batalla en curso.
   window.T={
    drain(){let g=0;while(CS5.dialogue.open&&g++<60)CS5.dialogue.finish(true);},
    end(win){const s=PocketSiege.state;s.projectiles=[];for(const c of s.chars)if(c.team===(win?1:0))c.hp=-1;PocketSiege.checkWinner(true);CS5.campaign.reveal();},
    snapshot(){const s=PocketSiege.state,a=CS5.campaign.active;return {ch:a?.chapter,b:a?.battle,map:s.map,phase:s.phase,mode:s.mode,
     squad:s.chars.filter(c=>c.team===0).map(c=>c.name),foes:s.chars.filter(c=>c.team===1).map(c=>({name:c.name,variant:c.variant,size:c.size||1,hit:c.hitScale||1,hp:c.hp,maxHp:c.maxHp||100,boss:!!c.boss,abil:c.boss?.abilities?.slice(),look:[c.accessory,c.backgear,c.fur,c.cosmeticColor].join(',')})),
     ammo:s.teams.map(t=>CS5.arsenal.signature(t,weapons)),state:CS5.campaign.stateIndex()};}
   };
  });
  const ev=(f,a)=>page.evaluate(f,a);

  // Abrir la campaña desde el menú.
  await page.locator('#campaignButton').click();
  assert.equal(await ev(()=>!document.getElementById('campaign').hidden),true,'el botón del menú abre la campaña');
  assert.equal(await ev(()=>document.querySelectorAll('.cmp-node').length),17,'17 capítulos en el recorrido');
  assert.equal(await ev(()=>document.querySelectorAll('.cmp-node.locked').length),16,'solo el capítulo 1 está desbloqueado');
  // Un capítulo bloqueado no se puede jugar.
  await ev(()=>CS5.campaign.play(5));assert.equal(await ev(()=>CS5.campaign.active),null,'no se puede saltar a un capítulo bloqueado');

  const std=await ev(()=>CS5.arsenal.signature({ammo:CS5.arsenal.initial(weapons,'standard')},weapons));
  const looks1=[],visited=[];let defeatsChecked=0;
  for(let n=1;n<=17;n++){
   // Batalla 1 (prólogo + intro + antes de la batalla).
   await ev(n=>{CS5.campaign.play(n);T.drain();},n);
   const b1=await ev(()=>T.snapshot());
   visited.push(b1.state);
   assert.equal(b1.ch,n);assert.equal(b1.b,1);assert.equal(b1.map,CS5_MAP[n-1],`capítulo ${n}: mapa correcto`);
   assert.equal(b1.mode,'cpu');assert.equal(b1.squad.length,3,'3 pugs del jugador');
   assert.deepEqual(b1.squad,['Cooper','Pipa','Bongo']);
   assert.equal(b1.foes.length,5,`capítulo ${n}: 5 bots`);
   assert.equal(new Set(b1.foes.map(f=>f.variant)).size,1,'misma variante de pug');assert.equal(b1.foes[0].variant,CS5_VAR[n-1]);
   assert.ok(new Set(b1.foes.map(f=>f.look)).size>=3,'cosméticos variados');
   assert.ok(b1.foes.every(f=>!f.boss&&f.size===1));
   for(const a of b1.ammo)assert.equal(a,std,'arsenal estándar en ambos equipos');
   if(n===3)looks1.push(...b1.foes.map(f=>f.look));
   // Derrota en la batalla 1 del capítulo 2: reintento de la misma batalla.
   if(n===2){
    await ev(()=>T.end(false));
    assert.equal(await ev(()=>!document.getElementById('campaignResult').hidden&&document.querySelector('#campaignResult .eyebrow').textContent),'DERROTA');
    assert.equal(await ev(()=>CS5.campaign.stateIndex()),b1.state,'perder no cambia el progreso');
    await ev(()=>CS5.campaign.action('retry',{}));
    const r=await ev(()=>T.snapshot());assert.deepEqual([r.ch,r.b,r.state],[2,1,b1.state],'reintento de la misma batalla');defeatsChecked++;
   }
   await ev(()=>T.end(true));
   assert.equal(await ev(()=>document.querySelector('#campaignResult .eyebrow').textContent),'¡VICTORIA!');
   // Tras la batalla 1 → diálogo → presentación del jefe → diálogos → jefe.
   await ev(()=>{CS5.campaign.action('after-win',{});T.drain();});
   assert.equal(await ev(()=>!document.getElementById('campaignResult').hidden&&document.getElementById('campaignResult').classList.contains('boss-card')),true,`capítulo ${n}: presentación del jefe`);
   await ev(()=>{CS5.campaign.action('fight-boss',{});T.drain();});
   const b2=await ev(()=>T.snapshot());
   visited.push(b2.state);
   assert.equal(b2.b,2);assert.equal(b2.foes.length,1,'un jefe');
   const boss=b2.foes[0];
   assert.ok(boss.boss&&boss.size===2&&boss.hit===2,`capítulo ${n}: jefe gigante 2×`);
   assert.ok(boss.maxHp>=250&&boss.maxHp<=400&&boss.hp===boss.maxHp,`vida del jefe ${boss.maxHp}`);
   assert.ok(boss.abil.length>=1&&boss.abil.length<=2,'1–2 habilidades activas al empezar');
   assert.equal(b2.squad.length,n>=16?4:3,'Roco se une en el capítulo 16');
   for(const a of b2.ammo)assert.equal(a,std,'el jefe respeta el arsenal estándar');
   if(n===17)assert.equal(boss.maxHp,400,'Cooper Cero: 400 HP');
   // Derrota contra el jefe del capítulo 4: la batalla 1 sigue ganada y se reintenta el jefe.
   if(n===4){
    await ev(()=>T.end(false));
    const p=await ev(()=>CS5.campaign.save.progress[4]);assert.deepEqual(p,{b1:true,b2:false},'la batalla 1 sigue ganada');
    await ev(()=>CS5.campaign.action('retry',{}));
    const r=await ev(()=>T.snapshot());assert.deepEqual([r.ch,r.b],[4,2],'se reintenta el jefe, no la batalla 1');defeatsChecked++;
   }
   await ev(()=>T.end(true));
   assert.equal(await ev(()=>document.querySelector('#campaignResult .eyebrow').textContent),'¡JEFE DERROTADO!');
   if(n<17){
    await ev(()=>{CS5.campaign.action('after-win',{});T.drain();});
    assert.equal(await ev(()=>!CS5.campaign.modal.hidden&&CS5.campaign.modal.textContent.includes('COMPLETADO')),true,`capítulo ${n} completado`);
    assert.equal(await ev(n=>CS5.campaign.unlocked(n+1),n),true,`se desbloquea el capítulo ${n+1}`);
    await ev(()=>CS5.campaign.action('modal-close',{}));
    // A mitad de campaña: recargar y comprobar que el progreso se restaura.
    if(n===8){
     const before=await ev(()=>({state:CS5.campaign.stateIndex(),bosses:CS5.campaign.save.bosses.length,v:CS5.campaign.save.victories,d:CS5.campaign.save.defeats,seen:CS5.campaign.save.seen.length}));
     await page.reload();await page.waitForFunction(()=>window.PocketSiege);
     await ev(()=>{window.T=null;});
     const after=await ev(()=>{const c=CS5.campaign;c.load();return {state:c.stateIndex(),bosses:c.save.bosses.length,v:c.save.victories,d:c.save.defeats,seen:c.save.seen.length};});
     assert.deepEqual(after,before,'el guardado sobrevive a la recarga');
     await ev(()=>{window.T={drain(){let g=0;while(CS5.dialogue.open&&g++<60)CS5.dialogue.finish(true);},end(win){const s=PocketSiege.state;s.projectiles=[];for(const c of s.chars)if(c.team===(win?1:0))c.hp=-1;PocketSiege.checkWinner(true);CS5.campaign.reveal();},snapshot(){const s=PocketSiege.state,a=CS5.campaign.active;return {ch:a?.chapter,b:a?.battle,map:s.map,phase:s.phase,mode:s.mode,squad:s.chars.filter(c=>c.team===0).map(c=>c.name),foes:s.chars.filter(c=>c.team===1).map(c=>({name:c.name,variant:c.variant,size:c.size||1,hit:c.hitScale||1,hp:c.hp,maxHp:c.maxHp||100,boss:!!c.boss,abil:c.boss?.abilities?.slice(),look:[c.accessory,c.backgear,c.fur,c.cosmeticColor].join(',')})),ammo:s.teams.map(t=>CS5.arsenal.signature(t,weapons)),state:CS5.campaign.stateIndex()};}};CS5.campaign.open();});
     // Cosméticos reproducibles tras recargar.
     const again=await ev(()=>{const ch=CS5.campaignData.chapters[2];return [1,2,3,4,5].map(i=>{const l=CS5.campaign.botLook(ch,i);return [l.accessory,l.backgear,l.fur,l.color].join(',');});});
     assert.deepEqual(again,looks1,'los cosméticos de los bots son reproducibles');
    }
   }
  }
  assert.equal(defeatsChecked,2);
  assert.deepEqual(visited,Array.from({length:34},(_,i)=>i),'se recorren los 34 estados en orden');
  // Final.
  await ev(()=>{CS5.campaign.action('after-win',{});T.drain();});
  assert.equal(await ev(()=>!!document.getElementById('trophyCelebration')),true,'celebración con el trofeo');
  const trophyPixels=await ev(()=>{const c=document.querySelector('#trophyCelebration canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n;});
  assert.ok(trophyPixels>5000,`el trofeo se dibuja (${trophyPixels} px)`);
  await ev(()=>document.querySelector('#trophyCelebration button').click());
  assert.equal(await ev(()=>!!document.getElementById('campaignCredits')),true,'créditos');
  await ev(()=>{document.querySelector('#campaignCredits button').click();});
  assert.equal(await ev(()=>CS5.dialogue.open&&CS5.dialogue.id),'postcredits','escena poscréditos');
  await ev(()=>T.drain());
  const fin=await ev(()=>({...CS5.campaign.save,state:CS5.campaign.stateIndex(),hub:!document.getElementById('campaign').hidden,screen:CS5.campaign.screen}));
  assert.equal(fin.state,34);assert.equal(fin.bosses.length,17);assert.equal(fin.trophy,true);assert.equal(fin.finished,true);assert.equal(fin.hub,true);assert.equal(fin.screen,'trophy');
  assert.equal(fin.defeats,2);assert.equal(fin.victories,34);
  for(const id of ['prologue','finale','postcredits','c1.intro','c17.victory'])assert.ok(fin.seen.includes(id),`diálogo visto: ${id}`);

  // Exportar / importar / saneado.
  const io=await ev(()=>{const c=CS5.campaign,json=c.exportData();c.reset();const empty=c.stateIndex();const ok=c.importData(json);const back=c.stateIndex();
   const bad=c.importData('{"format":"otra-cosa"}'),garbage=c.importData('no es json');
   const tampered=JSON.parse(json);for(const k of Object.keys(tampered.progress))tampered.progress[k]={b1:false,b2:false};tampered.progress[9]={b1:true,b2:true};tampered.trophy=true;
   const s=c.sanitize(tampered);
   return {empty,ok,back,bad,garbage,san:{state:Object.values(s.progress).filter(p=>p.b2).length,ch:s.chapter,trophy:s.trophy}};});
  assert.deepEqual(io,{empty:0,ok:true,back:34,bad:false,garbage:false,san:{state:0,ch:1,trophy:false}},'exportar/importar y saneado');
  // Nueva campaña con confirmación.
  await ev(()=>{CS5.campaign.showHub('settings');CS5.campaign.action('newgame',{});});
  assert.equal(await ev(()=>!CS5.campaign.modal.hidden&&CS5.campaign.stateIndex()),34,'nueva campaña pide confirmación');
  await ev(()=>CS5.campaign.action('confirm-yes',{}));
  assert.equal(await ev(()=>CS5.campaign.stateIndex()),0,'nueva campaña confirmada');

  // Habilidades de los 17 jefes, interrupción, fases y rescate.
  const abil=await ev(()=>{
   const out={ran:[],interrupt:null,phases:[],rescue:null,aiExec:null};
   const C=CS5.campaign,D=CS5.campaignData;
   for(const ch of D.chapters){
    C.save.progress[ch.n]={b1:true,b2:false};
    C.startBattle(ch.n,2);
    const b=app.chars.find(c=>c.boss);
    for(const id of ch.boss.abilities){
     app.projectiles=[];app.mines=[];setPhase('aim');app.team=1;app.active=b;
     const p=CS5.bosses.announce(b,id);p.ready=true;const hp0=app.chars.filter(c=>c.team===0).reduce((s,c)=>s+c.hp,0);
     CS5.bosses.execute(b,p);for(let i=0;i<240;i++)PocketSiege.step(1/60);
     out.ran.push({id,phase:app.phase,pendingCleared:b.boss.pending===null,cd:b.boss.cd[id]});
     for(const c of app.chars)if(c.team===0&&c.hp<=0){c.hp=100;}
     b.hp=b.maxHp;b.shield=0;
    }
   }
   // Interrupción: 40 de daño cancelan la habilidad anunciada.
   C.startBattle(5,2);let b=app.chars.find(c=>c.boss);CS5.bosses.announce(b,'torpedo');damage(b,25,b.x,b.y);const still=!!b.boss.pending;damage(b,20,b.x,b.y);out.interrupt={still,after:b.boss.pending,interrupts:b.boss.interrupts};
   // Fases de Cooper Cero.
   C.startBattle(17,2);b=app.chars.find(c=>c.boss);
   for(const hp of [300,250,130,100]){damage(b,b.hp-hp,b.x,b.y);out.phases.push({hp:b.hp,phase:b.boss.phase,abil:b.boss.abilities.slice()});}
   // Rescate del agua.
   b.hp=200;b.y=WATER+10;b.vy=100;characterPhysics(b,1/60);out.rescue={alive:b.hp>0,hp:b.hp,y:b.y<WATER};
   // Turno real de la IA del jefe con una habilidad lista: se ejecuta sin munición y cambia el turno.
   C.startBattle(11,2);b=app.chars.find(c=>c.boss);
   let g=0;while(app.active!==b&&g++<10){app.projectiles=[];PocketSiege.nextTurn();}
   b.boss.pending={id:'firestorm',x:app.chars[0].x,y:app.chars[0].y-15,targetId:0,dmg:0,ready:true,r:165,self:false};
   setPhase('aim');app.aiAge=0;app.aiPlan=null;app.timer=999;const shots=app.totalShots,ammo=CS5.arsenal.signature(app.teams[1],weapons);
   for(let i=0;i<60*4&&app.totalShots===shots;i++)PocketSiege.step(1/60);
   out.aiExec={fired:app.totalShots===shots+1,pending:b.boss.pending,ammoSame:CS5.arsenal.signature(app.teams[1],weapons)===ammo,meteors:app.projectiles.filter(p=>p.id==='meteor').length};
   C.leaveBattle();
   return out;
  });
  const total=await ev(()=>CS5.campaignData.chapters.reduce((s,c)=>s+c.boss.abilities.length,0));
  assert.equal(abil.ran.length,total,'todas las habilidades de jefe se ejecutan');
  for(const r of abil.ran){assert.ok(r.pendingCleared,`${r.id}: ejecutada`);assert.ok(r.cd>=1,`${r.id}: enfriamiento`);}
  assert.deepEqual(abil.interrupt,{still:true,after:null,interrupts:1},'40 de daño interrumpen la habilidad');
  assert.deepEqual(abil.phases.map(p=>p.phase),[0,1,2,2],'Cooper Cero cambia de fase con la vida');
  assert.ok(abil.phases[1].abil.includes('phase')&&abil.phases[2].abil.includes('nova'),'nuevas habilidades por fase');
  assert.deepEqual(abil.rescue,{alive:true,hp:155,y:true},'caer al agua no elimina al jefe de golpe');
  assert.ok(abil.aiExec.fired&&abil.aiExec.pending===null&&abil.aiExec.ammoSame&&abil.aiExec.meteors===6,`la IA del jefe ejecuta la habilidad sin gastar munición (${JSON.stringify(abil.aiExec)})`);

  assert.deepEqual(errors,[]);
  console.log(`PASS campaign: 34 estados en orden, 5 bots por capítulo, 17 jefes 2× (250–400 HP), ${total} habilidades, derrota y reintento, guardado tras recarga, exportar/importar, final con trofeo, créditos y poscréditos.`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
const CS5_MAP=[0,8,10,11,7,5,3,1,4,12,2,9,13,15,14,16,6];
const CS5_VAR=['normal','zombie','normal','skeleton','cyber','normal','ghost','cyber','alien','ghost','demon','zombie','cyber','normal','demon','ghost','ghost'];
