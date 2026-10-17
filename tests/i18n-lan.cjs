// Mismos mensajes y reglas con anfitrión es-419 e invitado en-US.
const assert=require('node:assert/strict');const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{const srv=await serve(),browser=await launch({gpu:false});try{
 const ctx=await browser.newContext(VIEWPORTS.desktop);await ctx.addInitScript(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);window.WebSocket=undefined;window.RTCPeerConnection=undefined;});
 const host=await ctx.newPage(),guest=await ctx.newPage(),errors=[];for(const page of [host,guest]){page.on('pageerror',e=>errors.push(e.message));await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);await page.locator('#modeLAN').click();}
 await host.evaluate(()=>CS5.i18n.setLanguage('es-419'));await guest.evaluate(()=>CS5.i18n.setLanguage('en-US'));
 await host.selectOption('#lanGameMode','coop');await host.evaluate(()=>CooperLAN.startAutoHost('6385'));await guest.evaluate(()=>CooperLAN.startAutoJoin('6385'));
 await Promise.all([host.waitForFunction(()=>CooperLAN.connected),guest.waitForFunction(()=>CooperLAN.connected)]);await host.locator('#startButton').click();await guest.waitForFunction(()=>app.chars.length===12);
 async function sync(){const seq=await host.evaluate(()=>{CooperLAN.coopClock=1;CooperLAN.tickCoop(1/60);return CooperLAN.coopSeq;});await guest.waitForFunction(seq=>CooperLAN.receivedCoopSeq>=seq,seq);}
 const state=page=>page.evaluate(()=>({chars:app.chars.map(c=>[c.id,c.team,c.controller,c.hp,c.x,c.y]),ammo:app.teams.map(t=>t.ammo),turn:app.turn,phase:app.phase,seed:CooperLAN.coopSeed,mask:terrain.mask.reduce((s,v,i)=>(s+v*(i%65521))>>>0,0)}));
 await host.evaluate(()=>{for(let i=0;i<80;i++)PocketSiege.step(1/60);});await sync();assert.deepEqual(await state(host),await state(guest));
 const before=await state(host);await host.evaluate(()=>CS5.i18n.setLanguage('en-US'));await guest.evaluate(()=>CS5.i18n.setLanguage('es-419'));assert.deepEqual(await state(host),before);await sync();assert.deepEqual(await state(host),await state(guest));
 await host.evaluate(()=>{PocketSiege.nextTurn();app.projectiles=[];PocketSiege.nextTurn();for(let i=0;i<80;i++)PocketSiege.step(1/60);app.active.hp=50;CS5.arsenal.grant(app.teams[app.team],'medkit',1);});await sync();
 assert.equal(await guest.evaluate(()=>app.active.controller),'client');const shots=await host.evaluate(()=>app.totalShots);
 await guest.evaluate(()=>{PocketSiege.selectWeapon('medkit');PocketSiege.shoot();PocketSiege.shoot();});await host.waitForFunction(n=>app.totalShots===n+1,shots);await sync();assert.equal(await guest.evaluate(()=>app.active.hp),85);assert.deepEqual(await state(host),await state(guest));
 assert.equal(await host.evaluate(()=>CS5.i18n.locale),'en-US');assert.equal(await guest.evaluate(()=>CS5.i18n.locale),'es-419');assert.deepEqual(errors,[]);
 console.log('✔ LAN bilingüe: anfitrión/invitado con idiomas opuestos, cambio durante coop 6v6, autoridad, canje único, vida, arsenal y terreno sincronizados');
 }finally{await browser.close();await srv.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
