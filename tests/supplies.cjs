// 5.2 — Huesitos (suministros que caen del cielo).
// · Aparición por rondas, máximo simultáneo, caída con paracaídas, aterrizaje sin quedar dentro
//   del terreno, nueva caída si se destruye el suelo, pérdida en el agua y caducidad.
// · Recogida en el suelo y en vuelo por un humano; recogida por un bot que camina hacia él.
// · Sorteo: 75 / 20 / 5 %, nunca bazuca ni granada, topes con re-sorteo y respaldo curativo,
//   determinista por identificador, canje único (sin duplicados).
// · LAN versus (el anfitrión decide y el invitado aplica) y cooperativo (instantánea).
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');

(async()=>{
 const srv=await serve(),browser=await launch({gpu:false}),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);

  const local=await page.evaluate(()=>{
   const P=PocketSiege,s=P.state,S=CS5.supply,out={};
   const fresh=(m=0,seedN=4100)=>{P.mainMenu();P.selectMap(m);document.getElementById('modeCPU').click();document.getElementById('teamCount').value='2';document.getElementById('memberCount').value='3';document.getElementById('supplyMode').value='normal';P.newMatch(seedN);for(let i=0;i<4;i++)P.step(1/60);};
   const settle=(sup,n=900)=>{for(let i=0;i<n&&sup.state==='fall';i++)S.step(1/60);return sup;};
   const inside=sup=>P.terrain.solid(sup.x,sup.y);
   // 1. Aparición por rondas.
   fresh();
   const first=s.supplyState.next;out.firstRange=first;let rounds=[];
   for(let t=0;t<80&&rounds.length<4;t++){const before=s.supplyState.spawned;s.projectiles=[];s.mines=[];P.nextTurn();if(s.supplyState.spawned>before)rounds.push(s.round);for(const q of s.supplies)q.state='gone';S.step(1/60);}
   out.spawnRounds=rounds;
   // 2. Caída, aterrizaje y nunca dentro del terreno (17 mapas × varias columnas).
   let landed=0,water=0,bad=[];
   for(let m=0;m<P.maps.length;m++){
    fresh(m,600+m);
    for(let k=0;k<6;k++){const sup=S.spawn(rng(1000+m*31+k));settle(sup);if(sup.state==='ground'){landed++;if(inside(sup)||!P.terrain.solid(sup.x,sup.y+3))bad.push([m,sup.x,sup.y]);}else water++;}
    s.supplies=[];
   }
   out.landed=landed;out.water=water;out.bad=bad;
   // 3. Suelo destruido: vuelve a caer y vuelve a posarse fuera de la roca.
   fresh(0,77);
   let sup=null;for(let k=0;k<20&&!sup;k++){const q=settle(S.spawn(rng(50+k)));if(q.state==='ground')sup=q;else s.supplies=[];}
   const y0=sup.y;P.terrain.destroy(sup.x,sup.y+14,34);P.terrain.paint();S.step(1/60);out.refall=sup.state;settle(sup);
   out.refallEnd={state:sup.state,lower:sup.y>y0,inside:sup.state==='ground'?inside(sup):false};
   // 4. Recogida en el suelo por un humano.
   fresh(0,88);
   let g=0;while(!human()&&g++<8)P.nextTurn();setPhase('aim');
   const team=s.teams[s.team],hero=s.active;sup=null;for(let k=0;k<20&&!sup;k++){const q=settle(S.spawn(rng(70+k)));if(q.state==='ground')sup=q;else s.supplies=[];}
   const sig0=CS5.arsenal.signature(team,weapons);
   hero.x=sup.x;hero.y=sup.y;hero.vx=hero.vy=0;S.step(1/60);
   out.humanPick={gone:!s.supplies.includes(sup),changed:CS5.arsenal.signature(team,weapons)!==sig0,picked:s.supplyState.picked.includes(sup.id),fresh:(team.fresh||[]).length};
   // 5. Recogida en vuelo.
   const flying=S.spawn(rng(5));flying.x=hero.x;flying.y=hero.y-200;flying.vy=74;
   let caught=false;for(let i=0;i<240&&!caught;i++){S.step(1/60);caught=s.supplyState.picked.includes(flying.id);}
   out.midair=caught&&flying.state==='picked';
   // 6. Bot que camina hasta un huesito y lo recoge.
   let botPick=null;
   for(let attempt=0;attempt<12&&!botPick;attempt++){
    fresh(attempt%3===0?0:attempt%3===1?5:10,300+attempt);
    let gg=0;while(human()&&gg++<8)P.nextTurn();
    const bot=s.active,bt=s.teams[s.team];
    // Huesito posado a 60–120 px sobre suelo continuo.
    let placed=null;
    for(const off of [70,-70,100,-100,55,-55,120,-120]){const f=P.terrain.surface(bot.x+off,bot.y-40);if(f&&Math.abs(f.y-bot.y)<8){placed={x:bot.x+off,y:f.y};break;}}
    if(!placed)continue;
    const q=S.spawn(rng(attempt+9));q.x=placed.x;q.y=placed.y;q.state='ground';q.chute=false;q.vy=0;q.landRound=s.round;
    if(!S.botDetour(bot))continue;
    const sig=CS5.arsenal.signature(bt,weapons);s.timer=999;
    for(let i=0;i<60*5&&!s.supplyState.picked.includes(q.id);i++)P.step(1/60);
    if(s.supplyState.picked.includes(q.id))botPick={changed:CS5.arsenal.signature(bt,weapons)!==sig,byBotTeam:!s.teams[bot.team].human};
   }
   out.botPick=botPick;
   // 7. Caducidad y máximo simultáneo.
   fresh(0,99);
   const a=settle(S.spawn(rng(1)));a.state='ground';a.landRound=s.round;
   s.round+=CS5.supplyConfig.lifetimeRounds;s.supplyState.lastRound=-1;s.supplyState.next=Infinity;S.onTurn();out.expiring=a.state;
   for(let i=0;i<80;i++)S.step(1/60);out.expired=!s.supplies.includes(a);
   s.supplies=[];for(let k=0;k<CS5.supplyConfig.maxActive;k++)S.spawn(rng(k+40));
   const n0=s.supplies.length;s.supplyState.next=s.round+1;s.round+=1;s.supplyState.lastRound=-1;S.onTurn();out.maxActive=[n0,s.supplies.length];
   // 8. Sorteo: distribución, armas prohibidas, topes y determinismo.
   const counts={common:0,power:0,legendary:0},weaponsSeen=new Set(),forbidden=[];let overCap=0;
   for(let i=1;i<=20000;i++){const t={ammo:CS5.arsenal.initial(weapons,'standard')};const r=S.roll(t,i);counts[r.cat]++;weaponsSeen.add(r.weapon);if(CS5.supplyConfig.never.includes(r.weapon))forbidden.push(r.weapon);if(CS5.arsenal.count(t,r.weapon)+r.qty>CS5.supplyConfig.caps[r.weapon])overCap++;}
   out.dist=counts;out.forbidden=forbidden;out.overCap=overCap;out.kinds=weaponsSeen.size;
   const full={ammo:CS5.arsenal.initial(weapons,'standard')};for(const [w,cap] of Object.entries(CS5.supplyConfig.caps))full.ammo[w]=cap;
   out.fullRoll=S.roll(full,5);
   const nearly={ammo:{...full.ammo,ice:0}};out.nearlyRoll=S.roll(nearly,6);
   out.det=JSON.stringify(S.roll({ammo:CS5.arsenal.initial(weapons,'standard')},321))===JSON.stringify(S.roll({ammo:CS5.arsenal.initial(weapons,'standard')},321));
   // Ninguna categoría contiene bazuca o granada común.
   out.cfgForbidden=CS5.supplyConfig.categories.flatMap(c=>Object.keys(c.items)).filter(w=>CS5.supplyConfig.never.includes(w));
   // 9. Canje único: aplicar el mismo mensaje dos veces solo suma una vez.
   fresh(0,123);
   const t0=s.teams[0],before=CS5.arsenal.count(t0,'dynamite'),msg={id:999,team:0,charId:s.chars.find(c=>c.team===0).id,weapon:'dynamite',qty:2,cat:'power'};
   out.dup=[S.apply(msg),S.apply(msg),CS5.arsenal.count(t0,'dynamite')-before];
   // 10. Una explosión cercana lanza el huesito.
   const b=settle(S.spawn(rng(2)));if(b.state==='ground'){P.explode(b.x+10,b.y-4,30,0,-1);out.blast=b.state==='fall'&&b.vy<0;}else out.blast=true;
   return out;
  });
  assert.ok(local.firstRange>=2&&local.firstRange<=3,'primer huesito entre las rondas 2 y 3');
  assert.ok(local.spawnRounds.length>=3,'aparecen huesitos a lo largo de la partida');
  for(let i=1;i<local.spawnRounds.length;i++){const gap=local.spawnRounds[i]-local.spawnRounds[i-1];assert.ok(gap>=2&&gap<=4,`intervalo de 2–4 rondas (${local.spawnRounds})`);}
  assert.deepEqual(local.bad,[],'ningún huesito queda dentro del terreno');
  assert.ok(local.landed>=60,`la mayoría aterriza en suelo (${local.landed} en suelo, ${local.water} al agua)`);
  assert.equal(local.refall,'fall','si se destruye el suelo, vuelve a caer');
  assert.ok(local.refallEnd.state==='gone'||(local.refallEnd.lower&&!local.refallEnd.inside),'se posa más abajo o cae al agua');
  assert.deepEqual(local.humanPick,{gone:true,changed:true,picked:true,fresh:1},'un humano recoge el huesito del suelo');
  assert.ok(local.midair,'se puede recoger en vuelo');
  assert.ok(local.botPick,'un bot camina hasta el huesito y lo recoge');
  assert.deepEqual(local.botPick,{changed:true,byBotTeam:true});
  assert.equal(local.expiring,'expiring');assert.ok(local.expired,'caduca tras las rondas configuradas');
  assert.deepEqual(local.maxActive,[3,3],'respeta el máximo simultáneo');
  const pct=k=>local.dist[k]/200;
  assert.ok(Math.abs(pct('common')-75)<1.5&&Math.abs(pct('power')-20)<1.5&&Math.abs(pct('legendary')-5)<.8,`distribución 75/20/5 (${JSON.stringify(local.dist)})`);
  assert.deepEqual(local.forbidden,[],'nunca bazuca ni granada común');assert.deepEqual(local.cfgForbidden,[]);
  assert.equal(local.overCap,0,'ningún premio supera el tope');
  assert.ok(local.kinds>=24,'todas las armas premiables aparecen');
  assert.equal(local.fullRoll.weapon,null);assert.ok(local.fullRoll.heal>0,'con todo al tope: galleta curativa');
  assert.equal(local.nearlyRoll.weapon,'ice','re-sorteo/respaldo hacia la única arma con hueco');
  assert.ok(local.det,'sorteo determinista por identificador');
  assert.deepEqual(local.dup,[true,false,2],'el mismo huesito no se canjea dos veces');
  assert.ok(local.blast,'una explosión lanza el huesito');

  // LAN: versus y cooperativo con BroadcastChannel real.
  const lanCtx=await browser.newContext({viewport:{width:1366,height:900}});
  await lanCtx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);window.WebSocket=undefined;window.RTCPeerConnection=undefined;});
  const host=await lanCtx.newPage(),client=await lanCtx.newPage();
  for(const p of [host,client]){p.on('pageerror',e=>errors.push(e.message));await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);await p.locator('#modeLAN').click();}
  await host.selectOption('#lanGameMode','versus');await host.evaluate(()=>{syncLanModeUI();PocketSiege.selectMap(0);});
  await host.evaluate(()=>CooperLAN.startAutoHost('7611'));await client.evaluate(()=>CooperLAN.startAutoJoin('7611'));
  await Promise.all([host.waitForFunction(()=>CooperLAN.connected),client.waitForFunction(()=>CooperLAN.connected)]);
  await host.locator('#startButton').click();
  await client.waitForFunction(()=>PocketSiege.state.phase!=='menu'&&PocketSiege.state.chars.length>0);
  await host.waitForTimeout(250);
  const both=f=>Promise.all([host.evaluate(f),client.evaluate(f)]);
  const [hs,cs]=await both(()=>{const s=PocketSiege.state;s.supplies=[];const q=CS5.supply.spawn(rng(4321));for(let i=0;i<900&&q.state==='fall';i++)CS5.supply.step(1/60);return {id:q.id,x:q.x,y:Math.round(q.y),state:q.state};});
  assert.deepEqual(hs,cs,'versus: el huesito aparece igual en ambos lados');
  // El invitado no puede canjear por su cuenta.
  const clientTry=await client.evaluate(()=>{const s=PocketSiege.state,q=s.supplies[0],c=s.chars[0];c.x=q.x;c.y=q.y;CS5.supply.step(1/60);return {picked:s.supplyState.picked.length,left:s.supplies.length};});
  assert.deepEqual(clientTry,{picked:0,left:1},'versus: el invitado no decide recogidas');
  const hostPick=await host.evaluate(()=>{const s=PocketSiege.state,q=s.supplies[0],c=s.chars[1];c.x=q.x;c.y=q.y;CS5.supply.step(1/60);return {picked:s.supplyState.picked.slice(),sig:s.teams.map(t=>CS5.arsenal.signature(t,weapons))};});
  assert.equal(hostPick.picked.length,1);
  await client.waitForFunction(id=>PocketSiege.state.supplyState.picked.includes(id),hostPick.picked[0]);
  const clientAfter=await client.evaluate(()=>({sig:PocketSiege.state.teams.map(t=>CS5.arsenal.signature(t,weapons)),left:PocketSiege.state.supplies.length}));
  assert.deepEqual(clientAfter.sig,hostPick.sig,'versus: inventario sincronizado tras el canje');assert.equal(clientAfter.left,0);
  // Un mensaje repetido no duplica.
  await host.evaluate(id=>{const s=PocketSiege.state,m={type:'supply_pick',id,team:1,charId:1,weapon:'super',qty:1,cat:'legendary'};CooperLAN.send(m);},hostPick.picked[0]);
  await client.waitForTimeout(200);
  assert.deepEqual(await client.evaluate(()=>PocketSiege.state.teams.map(t=>CS5.arsenal.signature(t,weapons))),hostPick.sig,'versus: sin duplicados por mensajes repetidos');
  await host.evaluate(()=>PocketSiege.mainMenu());await client.evaluate(()=>PocketSiege.mainMenu());

  // Cooperativo 6v6: el anfitrión simula y la instantánea lleva huesitos e inventario.
  await host.selectOption('#lanGameMode','coop');await host.evaluate(()=>syncLanModeUI());
  await host.locator('#startButton').click();
  await client.waitForFunction(()=>PocketSiege.state.chars.length===12);
  const sync=async()=>{const seq=await host.evaluate(()=>{CooperLAN.coopClock=1;CooperLAN.tickCoop(1/60);return CooperLAN.coopSeq;});await client.waitForFunction(s=>CooperLAN.receivedCoopSeq>=s,seq);};
  await host.evaluate(()=>{const s=PocketSiege.state;s.supplies=[];const q=CS5.supply.spawn(rng(8));for(let i=0;i<900&&q.state==='fall';i++)CS5.supply.step(1/60);});await sync();
  assert.equal(await client.evaluate(()=>PocketSiege.state.supplies.length),1,'coop: el invitado ve el huesito');
  const coopSig=await host.evaluate(()=>{const s=PocketSiege.state,q=s.supplies[0],c=s.chars.find(c=>c.controller==='client');c.x=q.x;c.y=q.y;CS5.supply.step(1/60);return s.teams.map(t=>CS5.arsenal.signature(t,weapons));});
  await sync();
  assert.deepEqual(await client.evaluate(()=>PocketSiege.state.teams.map(t=>CS5.arsenal.signature(t,weapons))),coopSig,'coop: inventario compartido sincronizado');
  assert.equal(await client.evaluate(()=>PocketSiege.state.supplies.length),0);
  await lanCtx.close();

  assert.deepEqual(errors,[]);
  console.log(`PASS supplies: rondas ${local.spawnRounds.join(',')}, ${local.landed} aterrizajes sin atravesar roca, recogida humano/vuelo/bot, distribución ${JSON.stringify(local.dist)}, topes, canje único, LAN versus y coop.`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
