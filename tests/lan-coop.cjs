const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');

(async()=>{
 // 5.0: el juego carga módulos de src/, así que se sirve el repositorio como en GitHub Pages.
 const root=path.join(__dirname,'..'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.mp3':'audio/mpeg','.png':'image/png'};
 const server=http.createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(/^\/+/,'')||'index.html',file=path.join(root,rel);if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.statusCode=404;return res.end();}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.TEST_BROWSER_PATH?{executablePath:process.env.TEST_BROWSER_PATH}:{}),args:['--autoplay-policy=no-user-gesture-required']});
  const context=await browser.newContext({viewport:{width:1366,height:900},locale:'es-CL'});
  // Drive fixed simulation steps ourselves. Exercise the real BroadcastChannel
  // transport without depending on public brokers or external STUN services.
  await context.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);window.WebSocket=undefined;window.RTCPeerConnection=undefined;});
  const host=await context.newPage(),client=await context.newPage(),errors=[];
  for(const p of [host,client]){p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}`);await p.waitForFunction(()=>window.PocketSiege);await p.locator('#modeLAN').click();}
  await host.selectOption('#lanGameMode','coop');await host.selectOption('#difficulty','hard');
  await host.evaluate(()=>CooperLAN.startAutoHost('7391'));
  await client.evaluate(()=>CooperLAN.startAutoJoin('7391'));
  await Promise.all([host.waitForFunction(()=>CooperLAN.connected),client.waitForFunction(()=>CooperLAN.connected)]);
  await host.locator('#startButton').click();
  await client.waitForFunction(()=>PocketSiege.state.chars.length===12).catch(async e=>{console.log('client diagnostic',await client.evaluate(()=>({mode:app.mode,variant:app.lanGameMode,chars:app.chars.length,seed:lanNet.lastMatchSeed,role:lanNet.role,phase:app.phase})),errors);throw e;});
  async function sync(){const seq=await host.evaluate(()=>{CooperLAN.coopClock=1;CooperLAN.tickCoop(1/60);return CooperLAN.coopSeq;});await client.waitForFunction(seq=>CooperLAN.receivedCoopSeq>=seq,seq);}
  async function advance(n){await host.evaluate(n=>{for(let i=0;i<n;i++)PocketSiege.step(1/60);},n);await sync();}
  await sync();
  const roster=await host.evaluate(()=>({owners:PocketSiege.state.chars.reduce((r,c)=>(r[c.controller]=(r[c.controller]||0)+1,r),{}),teams:PocketSiege.state.teams.length}));
  assert.deepEqual(roster,{owners:{host:3,cpu:6,client:3},teams:2});
  assert.equal(await client.evaluate(()=>PocketSiege.state.difficulty),'hard');
  await advance(70);
  const firstOwner=await host.evaluate(()=>PocketSiege.state.active.controller);assert.equal(firstOwner,'host');
  await host.evaluate(()=>document.getElementById('cycleButton').click());assert.equal(await host.evaluate(()=>PocketSiege.state.active.controller),'host');
  const shots=await host.evaluate(()=>PocketSiege.state.totalShots);
  await client.evaluate(()=>CooperLAN.sendCoopAction('shoot'));
  await host.waitForFunction(()=>CooperLAN.lastAction===1);await sync();
  assert.equal(await host.evaluate(()=>PocketSiege.state.totalShots),shots,'guest cannot fire host pug');
  await host.evaluate(()=>PocketSiege.nextTurn());await advance(200);
  assert.ok(await host.evaluate(()=>PocketSiege.state.totalShots>0),'CPU fires on host');
  await host.evaluate(()=>{const s=PocketSiege.state;s.projectiles=[];PocketSiege.nextTurn();});await advance(70);
  assert.equal(await client.evaluate(()=>PocketSiege.state.active.controller),'client');
  const clientId=await client.evaluate(()=>PocketSiege.state.active.id);
  await client.evaluate(()=>document.getElementById('cycleButton').click());await host.waitForFunction(id=>PocketSiege.state.active.id!==id,clientId);await sync();
  assert.equal(await host.evaluate(()=>PocketSiege.state.active.controller),'client');
  const x=await host.evaluate(()=>PocketSiege.state.active.x);
  await client.evaluate(()=>{PocketSiege.input.keys.add('d');CooperLAN.coopClock=1;PocketSiege.step(1/60);});
  await host.waitForFunction(()=>CooperLAN.remoteControl?.move===1);await advance(8);
  assert.ok(await host.evaluate(x=>PocketSiege.state.active.x>x,x),'guest movement simulated by host');
  await client.evaluate(()=>{PocketSiege.input.keys.clear();CooperLAN.coopClock=1;PocketSiege.step(1/60);});
  await host.evaluate(()=>{PocketSiege.state.active.hp=50;});await sync();
  // 5.2: el arsenal estándar ya no trae premio curativo; el anfitrión concede uno (como un huesito). Solo preparación: aserciones intactas.
  await host.evaluate(()=>{const s=PocketSiege.state;CS5.arsenal.grant(s.teams[s.team],'medkit',1);});await sync();
  const before=await host.evaluate(()=>PocketSiege.state.totalShots);
  await client.evaluate(()=>{PocketSiege.selectWeapon('medkit');PocketSiege.shoot();PocketSiege.shoot();});
  await host.waitForFunction(n=>PocketSiege.state.totalShots===n+1,before);await sync();
  assert.equal(await host.evaluate(()=>PocketSiege.state.active.hp),85,'medkit applied once');
  assert.equal(await client.evaluate(()=>PocketSiege.state.active.hp),85);
  // Pausing is shared, including when it is the CPU's turn.
  await client.evaluate(()=>pauseGame(true));await host.waitForFunction(()=>PocketSiege.state.paused);await sync();
  assert.equal(await client.evaluate(()=>PocketSiege.state.paused),true);
  await client.evaluate(()=>pauseGame(false));await host.waitForFunction(()=>!PocketSiege.state.paused);await sync();
  const version=await host.evaluate(()=>{const t=PocketSiege.terrain;t.destroy(PocketSiege.state.active.x,PocketSiege.state.active.y+20,38);CooperLAN.terrainClock=1;return t.version;});await sync();
  await client.waitForFunction(v=>PocketSiege.terrain.version===v,version);
  const checksum=p=>p.evaluate(()=>PocketSiege.terrain.mask.reduce((sum,v,i)=>(sum+v*(i%65521))>>>0,0));
  assert.equal(await checksum(host),await checksum(client),'craters match');
  // A surviving partner continues after all three of the other player's pugs die.
  await host.evaluate(()=>{const s=PocketSiege.state;s.projectiles=[];for(const c of s.chars)if(c.controller==='host')c.hp=-1;while(s.team!==1)PocketSiege.nextTurn();PocketSiege.nextTurn();});await sync();
  assert.equal(await client.evaluate(()=>PocketSiege.state.active.controller),'client');
  assert.notEqual(await host.evaluate(()=>PocketSiege.state.phase),'over');
  await host.evaluate(()=>{for(const c of PocketSiege.state.chars)if(c.team===1)c.hp=-1;PocketSiege.checkWinner(true);});await sync();
  assert.equal(await client.evaluate(()=>PocketSiege.state.winner.id),0);
  assert.equal(await client.locator('#resultEyebrow').textContent(),'VICTORIA');
  // Stale snapshots and inputs cannot overwrite a newer turn or another match.
  assert.equal(await host.evaluate(()=>{const n=CooperLAN,s=PocketSiege.state,shots=s.totalShots;n.onMessage({type:'coop_action',seed:n.coopSeed-1,seq:999,action:'shoot',turn:s.turn,charId:s.active.id,angle:45,power:65,weapon:'rocket'},'bc');return shots===s.totalShots;}),true);
  await host.evaluate(()=>PocketSiege.mainMenu());await client.waitForFunction(()=>PocketSiege.state.phase==='menu');
  // Retain standalone CPU/local and LAN-versus rosters.
  for(const mode of ['cpu','local','lan']){
   await host.evaluate(mode=>{document.getElementById(mode==='cpu'?'modeCPU':mode==='local'?'modeLocal':'modeLAN').click();document.getElementById('lanGameMode').value='versus';syncLanModeUI();PocketSiege.newMatch(912);},mode);
   assert.equal(await host.evaluate(()=>PocketSiege.state.chars.length),6,`${mode} roster unchanged`);
  }
  // The guide and the real rocket follow exactly the same integrator.
  const trajectory=await host.evaluate(()=>{
   const s=PocketSiege.state,c=s.active;terrain.solid=()=>false;c.x=500;c.y=400;c.dir=1;s.chars=[c];s.wind=24;s.target=null;
   const predicted=previewTrajectory(c,55,63,'rocket'),p=addProjectile('rocket',c,55,63),actual=[];
   for(let i=1;i<=42;i++){stepProjectile(p,1/60);if(i%3===0)actual.push({x:p.x,y:p.y});}
   return {error:Math.max(...predicted.map((p,i)=>Math.hypot(p.x-actual[i].x,p.y-actual[i].y))),tail:p.trail.at(-1),x:p.x,y:p.y};
  });assert.ok(trajectory.error<1e-8,`guide error ${trajectory.error}`);assert.equal(trajectory.tail.x,trajectory.x);assert.equal(trajectory.tail.y,trajectory.y);
  const levels=await host.evaluate(()=>{
   audio.init();const param=audio.musicGain.gain,original=param.setTargetAtTime.bind(param),values=[];
   param.setTargetAtTime=(value,...rest)=>{values.push(value);return original(value,...rest);};
   app.paused=false;audio.music=true;menuLoopEngine.stagePreviewActive=false;adaptiveMusic.forcedState=null;
   setPhase('menu');scheduleAdventureMusic();setPhase('aim');scheduleAdventureMusic();
   param.setTargetAtTime=original;return values;
  });assert.ok(levels[1]>levels[0]*2,'stage music gets independent compensation');
  await host.evaluate(()=>{const el=document.getElementById('volMusic');el.value='42';el.dispatchEvent(new Event('input'));});
  await host.reload();await host.waitForFunction(()=>window.PocketSiege);
  assert.equal(await host.locator('#volMusic').inputValue(),'42','audio balance survives reload');
  const rtcContext=await browser.newContext({viewport:{width:1366,height:900},locale:'es-CL'});
  await rtcContext.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);window.WebSocket=undefined;});
  const rtcHost=await rtcContext.newPage(),rtcClient=await rtcContext.newPage();
  for(const p of [rtcHost,rtcClient]){p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}`);await p.waitForFunction(()=>window.PocketSiege);await p.evaluate(()=>{CooperLAN.rtcConfig=()=>({iceServers:[]});document.getElementById('modeLAN').click();});}
  await rtcHost.selectOption('#lanGameMode','coop');
  await rtcHost.evaluate(()=>CooperLAN.startAutoHost('7392'));await rtcClient.evaluate(()=>CooperLAN.startAutoJoin('7392'));
  await Promise.all([rtcHost.waitForFunction(()=>CooperLAN.dc?.readyState==='open'),rtcClient.waitForFunction(()=>CooperLAN.dc?.readyState==='open')]);
  await rtcHost.locator('#startButton').click();await rtcClient.waitForFunction(()=>PocketSiege.state.chars.length===12);
  await rtcHost.evaluate(()=>{for(let i=0;i<75;i++)PocketSiege.step(1/60);CooperLAN.coopClock=1;CooperLAN.tickCoop(1/60);});
  await rtcClient.waitForFunction(()=>CooperLAN.receivedCoopSeq>0);
  assert.equal(await rtcClient.evaluate(()=>PocketSiege.state.active.controller),'host');
  await rtcContext.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: LAN 6v6 over BroadcastChannel and WebRTC, ownership, CPU, input/shot authority, pause, terrain, victory, stale packets, existing modes, projectile trajectory and persistent audio balance.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
