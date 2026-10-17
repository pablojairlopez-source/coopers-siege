// 5.1 — LAN con los controles nuevos y el mapa 17 (BroadcastChannel real, sin red externa).
// · Cooperativo 6v6 en Jardín de Espinas: el terreno coincide en ambos equipos.
// · El invitado usa la máquina de estados (F → mantener ESPACIO → soltar): el anfitrión
//   dispara exactamente una vez con el ángulo y el arma del invitado.
// · Cancelar en el invitado no dispara ni gasta munición.
// · Daño y muerte: el quejido viaja al invitado una sola vez.
// · Versus en el mapa 17: mismo terreno y disparos únicos.
const assert=require('node:assert/strict');
const {serve,launch}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve(),browser=await launch({gpu:false}),errors=[];
 try{
  const context=await browser.newContext({viewport:{width:1366,height:900}});
  await context.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);window.WebSocket=undefined;window.RTCPeerConnection=undefined;});
  const host=await context.newPage(),client=await context.newPage();
  for(const p of [host,client]){p.on('pageerror',e=>errors.push(e.message));await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);await p.locator('#modeLAN').click();}
  await host.selectOption('#lanGameMode','coop');
  await host.evaluate(()=>PocketSiege.selectMap(16));
  await host.evaluate(()=>CooperLAN.startAutoHost('7511'));await client.evaluate(()=>CooperLAN.startAutoJoin('7511'));
  await Promise.all([host.waitForFunction(()=>CooperLAN.connected),client.waitForFunction(()=>CooperLAN.connected)]);
  await host.locator('#startButton').click();
  await client.waitForFunction(()=>PocketSiege.state.chars.length===12);
  const sync=async()=>{const seq=await host.evaluate(()=>{CooperLAN.coopClock=1;CooperLAN.tickCoop(1/60);return CooperLAN.coopSeq;});await client.waitForFunction(s=>CooperLAN.receivedCoopSeq>=s,seq);};
  const advance=async n=>{await host.evaluate(n=>{for(let i=0;i<n;i++)PocketSiege.step(1/60);},n);await sync();};
  const clientStep=n=>client.evaluate(n=>{for(let i=0;i<n;i++){CooperLAN.coopClock=1;PocketSiege.step(1/60);}},n);
  await sync();
  const checksum=p=>p.evaluate(()=>PocketSiege.terrain.mask.reduce((s,v,i)=>(s+v*(i%65521))>>>0,0));
  assert.equal(await host.evaluate(()=>PocketSiege.state.map),16);assert.equal(await client.evaluate(()=>PocketSiege.state.map),16,'el invitado juega el mapa 17');
  assert.equal(await checksum(host),await checksum(client),'terreno del mapa 17 idéntico en LAN');
  // Turno del invitado.
  await host.evaluate(()=>{const s=PocketSiege.state;s.projectiles=[];let g=0;while(s.active.controller!=='client'&&g++<12)PocketSiege.nextTurn();});await advance(80);
  assert.equal(await client.evaluate(()=>PocketSiege.state.active.controller),'client');
  await host.evaluate(()=>{PocketSiege.state.timer=999;});await sync();
  // Cancelar no dispara.
  const shots0=await host.evaluate(()=>PocketSiege.state.totalShots);
  await client.evaluate(()=>{PocketSiege.selectWeapon('grenade');});
  const ammo0=await host.evaluate(()=>{const s=PocketSiege.state;return s.teams[s.team].ammo.grenade;});
  await client.keyboard.press('f');await client.keyboard.down(' ');await clientStep(20);await client.keyboard.press('Escape');await client.keyboard.up(' ');
  await clientStep(5);await advance(10);
  assert.equal(await host.evaluate(()=>PocketSiege.state.totalShots),shots0,'cancelar en el invitado no dispara');
  // Disparo con la máquina de estados: exactamente uno, con el ángulo del invitado.
  await client.keyboard.press('f');await client.evaluate(()=>{PocketSiege.state.angle=38;});
  await client.keyboard.down(' ');await clientStep(30);
  const aim=await client.evaluate(()=>({state:CS5.attack.state,angle:PocketSiege.state.angle,weapon:PocketSiege.state.weapon}));
  assert.equal(aim.state,'charging');
  await client.keyboard.up(' ');await client.keyboard.down(' ');await client.keyboard.up(' ');
  await host.waitForFunction(n=>PocketSiege.state.totalShots===n+1,shots0);await advance(5);
  const fired=await host.evaluate(()=>{const s=PocketSiege.state;return {shots:s.totalShots,weapon:s.weapon,ammo:s.teams[s.team].ammo.grenade,lastAngle:s.angle};});
  assert.equal(fired.shots,shots0+1,'un solo disparo autoritativo');assert.equal(fired.weapon,'grenade');assert.equal(fired.ammo,ammo0-1,'una carga gastada');
  assert.ok(Math.abs(fired.lastAngle-aim.angle)<1e-6,'el anfitrión usa el ángulo del invitado');
  await advance(60);assert.equal(await host.evaluate(()=>PocketSiege.state.totalShots),shots0+1,'sin disparos duplicados');
  // Quejido y lamento: uno por evento en el invitado.
  await advance(240);
  await client.evaluate(()=>{window.heard=[];const o=audio.sound.bind(audio);audio.sound=(k,s,w)=>{window.heard.push(k);return o(k,s,w);};});
  await host.evaluate(()=>{const s=PocketSiege.state,v=s.chars.find(c=>c.hp>0&&c.team===1);v.shield=0;damage(v,12,v.x,v.y);damage(v,500,v.x,v.y);});
  await sync();await sync();
  const heard=await client.evaluate(()=>window.heard);
  assert.equal(heard.filter(k=>k==='hurt').length,1,'quejido una vez en el invitado');
  assert.equal(heard.filter(k=>k==='death').length,1,'lamento una vez en el invitado');
  await host.evaluate(()=>PocketSiege.mainMenu());await client.waitForFunction(()=>PocketSiege.state.phase==='menu');

  // Versus en el mapa 17.
  await host.selectOption('#lanGameMode','versus');await host.evaluate(()=>{syncLanModeUI?.();PocketSiege.selectMap(16);});
  await host.locator('#startButton').click();
  await client.waitForFunction(()=>PocketSiege.state.phase!=='menu'&&PocketSiege.state.chars.length>0);
  await client.waitForFunction(()=>PocketSiege.state.map===16);
  await host.waitForTimeout(300);
  assert.equal(await checksum(host),await checksum(client),'versus: terreno idéntico en el mapa 17');
  // Versus: quien tiene el turno dispara con F → mantener ESPACIO → soltar; el otro ve un solo disparo.
  const stepBoth=async n=>{for(const p of [host,client])await p.evaluate(n=>{for(let i=0;i<n;i++)PocketSiege.step(1/60);},n);};
  let shooter=null,watcher=null;
  for(let k=0;k<40&&!shooter;k++){await stepBoth(10);for(const [a,b] of [[host,client],[client,host]])if(!shooter&&await a.evaluate(()=>human()&&canAct()))[shooter,watcher]=[a,b];}
  assert.ok(shooter,'versus: hay un jugador con turno');
  await shooter.evaluate(()=>{PocketSiege.state.timer=999;});
  const w0=await watcher.evaluate(()=>PocketSiege.state.totalShots);
  await shooter.keyboard.press('f');await shooter.keyboard.down(' ');await shooter.evaluate(()=>{for(let i=0;i<30;i++)PocketSiege.step(1/60);});
  assert.equal(await shooter.evaluate(()=>CS5.attack.state),'charging');
  await shooter.keyboard.up(' ');await shooter.keyboard.down(' ');await shooter.keyboard.up(' ');
  await watcher.waitForFunction(n=>PocketSiege.state.totalShots===n+1,w0);await stepBoth(30);
  assert.equal(await watcher.evaluate(()=>PocketSiege.state.totalShots),w0+1,'versus: el rival ve exactamente un disparo');
  assert.equal(await shooter.evaluate(()=>PocketSiege.state.totalShots),w0+1,'versus: un disparo local');
  console.log('PASS lan-51: coop 6v6 y versus en Jardín de Espinas, disparo único del invitado con ESPACIO, cancelar sin disparo, quejido y lamento replicados una vez.');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
