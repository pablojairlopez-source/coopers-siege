// 5.1 — Controles: disposición en las esquinas (6 pantallas) y máquina de estados del ataque
// con eventos reales de teclado y de puntero (táctil emulado, multitouch y pointercancel).
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
const SCREENS={
 s23ultra:VIEWPORTS.s23ultra,
 smallphone:{viewport:{width:640,height:360},deviceScaleFactor:3,isMobile:true,hasTouch:true},
 foldClosed:{viewport:{width:882,height:344},deviceScaleFactor:2.6,isMobile:true,hasTouch:true},
 fold:VIEWPORTS.fold,
 tablet:{viewport:{width:1180,height:820},deviceScaleFactor:2,isMobile:true,hasTouch:true},
 desktop:VIEWPORTS.desktop
};
// Prepara una partida con el turno en manos de un humano, sin viento ni reloj.
const PREP=()=>{
 const P=PocketSiege;P.mainMenu();P.selectMap(0);document.getElementById('modeCPU').click();P.newMatch(5);
 for(const t of app.teams)t.human=true;
 for(let i=0;i<240&&app.phase!=='aim';i++)P.step(1/60);
 for(let i=0;i<60;i++)P.step(1/60);
 app.timer=999;app.wind=0;P.resize();P.render(performance.now()/1000);
 window.ptr=(id,type,pid,dx=0,dy=0)=>{const el=document.getElementById(id),r=el.getBoundingClientRect();
  el.dispatchEvent(new PointerEvent(type,{pointerId:pid,pointerType:'touch',isPrimary:pid===1,bubbles:true,cancelable:true,button:type==='pointermove'?-1:0,buttons:type==='pointerup'||type==='pointercancel'?0:1,clientX:r.left+r.width/2+dx,clientY:r.top+r.height/2+dy}));};
 window.run=n=>{for(let i=0;i<n;i++)PocketSiege.step(1/60);};
 window.count=e=>CS5.attack.events.filter(x=>x===e).length;
 return {phase:app.phase,human:human()};
};
const LAYOUT=()=>{
 const W=innerWidth,H=innerHeight,ids=['.match-info','#teamHealth','.wind-pill','.hud-buttons','#minimapWrap','#weaponsButton','#touchMovePad','#fireButton','#touchJump','#aimPad','#aimCancel'],boxes={};
 for(const s of ids){const e=document.querySelector(s);if(!e)continue;const b=e.getBoundingClientRect(),st=getComputedStyle(e);if(st.display==='none'||st.visibility==='hidden'||b.width===0)continue;boxes[s]={x:b.left,y:b.top,w:b.width,h:b.height};}
 const list=Object.entries(boxes),overlaps=[],out=[];
 for(const [s,b] of list)if(b.x<-1||b.y<-1||b.x+b.w>W+1||b.y+b.h>H+1)out.push(s);
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const [sa,a]=list[i],[sb,b]=list[j],ox=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),oy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(ox>0&&oy>0)overlaps.push(sa+' × '+sb);}
 return {W,H,boxes,overlaps,out};
};
(async()=>{
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  for(const [name,vp] of Object.entries(SCREENS)){
   const ctx=await browser.newContext(vp);
   await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
   const page=await ctx.newPage();page.on('pageerror',e=>errors.push(name+': '+e.message));
   await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
   const prep=await page.evaluate(PREP);assert.equal(prep.phase,'aim');assert.ok(prep.human);
   const touch=!!vp.hasTouch;
   const idle=await page.evaluate(LAYOUT);
   await page.evaluate(()=>CS5.attack.enter());
   const aiming=await page.evaluate(LAYOUT);
   for(const [tag,L] of [['reposo',idle],['apuntando',aiming]]){
    assert.deepEqual(L.out,[],`${name}/${tag}: fuera de pantalla ${L.out}`);
    assert.deepEqual(L.overlaps,[],`${name}/${tag}: solapes ${L.overlaps.join('; ')}`);
   }
   const b=aiming.boxes,W=aiming.W;
   const arsenal=b['#weaponsButton'],fire=b['#fireButton'];
   assert.ok(arsenal.x<=24&&arsenal.x+arsenal.w/2<W*.3,`${name}: arsenal en el borde izquierdo (${Math.round(arsenal.x)})`);
   assert.ok(W-(fire.x+fire.w)<=24&&fire.x>W*.55,`${name}: ATACAR en el borde derecho`);
   assert.ok(b['#aimPad']&&b['#aimCancel'],`${name}: pad de ángulo y cancelar visibles al apuntar`);
   assert.ok(b['#aimPad'].x+b['#aimPad'].w<W*.5,`${name}: pad de ángulo al alcance del pulgar izquierdo`);
   if(touch){
    const jump=idle.boxes['#touchJump'],move=idle.boxes['#touchMovePad'];
    assert.ok(jump&&move,`${name}: SALTAR y movimiento visibles en táctil`);
    assert.ok(W-(jump.x+jump.w)<=24,`${name}: SALTAR en el borde derecho`);
    const gap=fire.y-(jump.y+jump.h);assert.ok(gap>=12,`${name}: separación SALTAR–ATACAR ${gap}px`);
    assert.ok(move.x<=24,`${name}: movimiento a la izquierda`);
    assert.ok(fire.h>=40&&jump.h>=44,`${name}: botones cómodos`);
   }
   await page.evaluate(()=>CS5.attack.cancel());
   console.log(`${name.padEnd(10)} ${idle.W}×${idle.H} · arsenal x=${Math.round(arsenal.x)} · ATACAR margen ${Math.round(W-fire.x-fire.w)}px · sin solapes`);

   if(name==='s23ultra'){
    // ── Táctil ──
    const t=await page.evaluate(()=>{
     const o=app.active,r={};
     // Deslizar hacia arriba desde el borde ya no salta.
     const sc=document.getElementById('effects'),x=innerWidth-20,y=innerHeight*.45;
     const pe=(type,yy)=>sc.dispatchEvent(new PointerEvent(type,{pointerId:40,pointerType:'touch',bubbles:true,cancelable:true,button:type==='pointermove'?-1:0,clientX:x,clientY:yy}));
     pe('pointerdown',y);pe('pointermove',y-60);pe('pointermove',y-120);run(1);r.swipeJump=o.vy<0||input.keys.has('jump');pe('pointerup',y-120);run(30);
     // Botón SALTAR: un toque = un salto, aunque llegue duplicado.
     ptr('touchJump','pointerdown',2);ptr('touchJump','pointerdown',3);run(1);r.jumpVy=o.vy;r.jumps=count('jump');ptr('touchJump','pointerup',2);ptr('touchJump','pointerup',3);run(90);
     // Primer toque de ATACAR: solo apunta.
     const before=app.totalShots;ptr('fireButton','pointerdown',4);ptr('fireButton','pointerup',4);run(5);
     r.afterTap={state:CS5.attack.state,shots:app.totalShots-before,phase:app.phase};
     // Pad de ángulo: arrastrar 60 px hacia arriba sube la elevación.
     app.angle=30;ptr('aimPad','pointerdown',5);ptr('aimPad','pointermove',5,0,-60);ptr('aimPad','pointerup',5,0,-60);r.padAngle=app.angle;
     // SALTAR bloqueado mientras se apunta.
     ptr('touchJump','pointerdown',6);ptr('touchJump','pointerup',6);r.jumpWhileAiming=count('jump')-r.jumps;
     // pointercancel durante la carga: vuelve a apuntar sin disparar.
     ptr('fireButton','pointerdown',7);run(20);r.chargingPower=app.power;ptr('fireButton','pointercancel',7);run(2);
     r.afterCancel={state:CS5.attack.state,shots:app.totalShots-before,charging:app.charging};
     // Multitouch: caminar con un dedo y cargar con otro; un tercer dedo sobre ATACAR no cuenta.
     const x0=o.x;ptr('touchMoveLeft','pointerdown',8);run(10);ptr('fireButton','pointerdown',9);ptr('fireButton','pointerdown',10);run(25);
     r.multi={walked:o.x<x0-1,state:CS5.attack.state,power:app.power};
     ptr('fireButton','pointerup',10);r.multi.ghostShot=app.totalShots-before;
     ptr('fireButton','pointerup',9);ptr('touchMoveLeft','pointerup',8);
     r.final={shots:app.totalShots-before,phase:app.phase,state:CS5.attack.state};
     ptr('fireButton','pointerup',9);r.final.shotsAfterRepeat=app.totalShots-before;
     return r;
    });
    assert.equal(t.swipeJump,false,'deslizar hacia arriba no salta');
    assert.ok(t.jumpVy<0,'SALTAR hace saltar');assert.equal(t.jumps,1,'un toque = un salto');
    assert.deepEqual(t.afterTap,{state:'aiming',shots:0,phase:'aim'},'el primer toque solo apunta');
    assert.ok(t.padAngle>=55&&t.padAngle<=61,`pad de ángulo: ${t.padAngle}`);
    assert.equal(t.jumpWhileAiming,0,'SALTAR no salta durante el apuntado');
    assert.ok(t.chargingPower>15,'la potencia sube al mantener');
    assert.deepEqual(t.afterCancel,{state:'aiming',shots:0,charging:false},'pointercancel no dispara');
    assert.ok(t.multi.walked&&t.multi.state==='charging'&&t.multi.power>15,'multitouch: caminar y cargar a la vez');
    assert.equal(t.multi.ghostShot,0,'un tercer dedo no dispara');
    assert.equal(t.final.shots,1,'soltar ATACAR dispara una vez');assert.equal(t.final.phase,'action');
    assert.equal(t.final.shotsAfterRepeat,1,'un pointerup repetido no vuelve a disparar');
    // Multitáctil real por CDP (auditoría 5.1): un dedo en un botón y otro en el escenario
    // no es un pellizco; no debe hacer zoom ni interrumpir la carga.
    {
     await page.evaluate(PREP);const cdp=await ctx.newCDPSession(page);
     const at=async s=>{const b=await page.locator(s).boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
     const touch=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(p=>({x:p.x,y:p.y,id:p.id,radiusX:6,radiusY:6,force:1}))});
     const mr=await at('#touchMoveRight'),sc={x:470,y:150};
     const z0=await page.evaluate(()=>({zoom:app.userZoom||1,x:app.active.x}));
     await touch('touchStart',[{...mr,id:1}]);await page.evaluate(()=>run(8));
     await touch('touchStart',[{...mr,id:1},{...sc,id:2}]);await touch('touchMove',[{...mr,id:1},{x:sc.x+60,y:sc.y-90,id:2}]);await page.evaluate(()=>run(8));
     const walk=await page.evaluate(z0=>({zoomed:Math.abs((app.userZoom||1)-z0.zoom)>1e-3,walked:app.active.x>z0.x+1}),z0);
     await touch('touchEnd',[]);await page.evaluate(()=>run(40));
     assert.deepEqual(walk,{zoomed:false,walked:true},'caminar con un dedo y apuntar con otro no hace zoom');
     await page.evaluate(()=>CS5.attack.enter());const fb=await at('#fireButton');const n0=await page.evaluate(()=>app.totalShots);
     await touch('touchStart',[{...fb,id:3}]);await touch('touchStart',[{...fb,id:3},{x:300,y:200,id:4}]);await touch('touchMove',[{...fb,id:3},{x:360,y:140,id:4}]);
     const mid=await page.evaluate(z=>({state:CS5.attack.state,zoomed:Math.abs((app.userZoom||1)-z)>1e-3}),z0.zoom);
     await touch('touchEnd',[{...fb,id:3}]);await touch('touchEnd',[]);
     assert.deepEqual(mid,{state:'charging',zoomed:false},'cargar con un pulgar y tocar el escenario con el otro');
     assert.equal(await page.evaluate(n=>app.totalShots-n,n0),1,'soltar dispara una vez');
     await cdp.detach();
    }
    // Toques reales del navegador (no sintéticos) en un turno nuevo.
    await page.evaluate(PREP);
    const fb=await page.locator('#fireButton').boundingBox();
    await page.touchscreen.tap(fb.x+fb.width/2,fb.y+fb.height/2);
    const real=await page.evaluate(()=>({state:CS5.attack.state,shots:app.totalShots}));
    assert.deepEqual(real,{state:'aiming',shots:0},'toque real: apunta sin disparar');
    console.log('  táctil: sin salto por deslizamiento, SALTAR único, apuntar→cargar→soltar, pointercancel y multitouch OK');
   }
   if(name==='desktop'){
    // ── Teclado ──
    const k=page.keyboard,ev=f=>page.evaluate(f);
    let x0=await ev(()=>app.active.x);await k.down('d');await ev(()=>run(30));await k.up('d');
    const xr=await ev(()=>app.active.x);await k.down('a');await ev(()=>run(30));await k.up('a');const xl=await ev(()=>app.active.x);
    assert.ok(xr>x0+2&&xl<xr-2,`A/D mueven (${x0}→${xr}→${xl})`);
    await ev(()=>run(60));
    await k.down(' ');const j=await ev(()=>{run(1);return {vy:app.active.vy,jumps:count('jump')};});await k.up(' ');
    assert.ok(j.vy<0&&j.jumps===1,'ESPACIO salta fuera del ataque');
    await ev(()=>run(90));
    // Elegir un arma con carga y munición limitada para comprobar que cancelar no gasta.
    // 5.2: el arsenal estándar no trae armas cargables limitadas: se concede una granada polar (como un huesito).
    const wid=await ev(()=>{const t=app.teams[app.team];CS5.arsenal.grant(t,'ice',2);const w=weapons.find(w=>w.charge&&!w.target&&t.ammo[w.id]>0&&t.ammo[w.id]<Infinity);PocketSiege.selectWeapon(w.id);return w.id;});
    const ammo0=await ev(()=>app.teams[app.team].ammo[app.weapon]);
    await k.press('f');assert.equal(await ev(()=>CS5.attack.state),'aiming','F entra en apuntado');
    await ev(()=>{app.angle=20;});await k.down('w');await ev(()=>run(30));await k.up('w');
    const up=await ev(()=>app.angle);await k.down('s');await ev(()=>run(15));await k.up('s');const down=await ev(()=>app.angle);
    assert.ok(up>40&&down<up-8,`W/S ajustan el ángulo (${up} → ${down})`);
    await k.down(' ');const ch=await ev(()=>{run(40);return {state:CS5.attack.state,power:app.power,vy:app.active.vy,jumps:count('jump'),guide:previewTrajectory(app.active,app.angle,app.power,app.weapon).length};});
    assert.equal(ch.state,'charging');assert.ok(ch.power>15,'ESPACIO carga potencia');assert.equal(ch.jumps,1,'ESPACIO no salta al cargar');assert.ok(ch.guide>3,'guía visible');
    await k.press('Escape');
    const cancel=await ev(()=>({state:CS5.attack.state,ammo:app.teams[app.team].ammo[app.weapon],phase:app.phase,paused:app.paused,charging:app.charging}));
    assert.deepEqual(cancel,{state:'idle',ammo:ammo0,phase:'aim',paused:false,charging:false},'Esc cancela sin gastar munición ni turno');
    await k.up(' ');assert.equal(await ev(()=>app.totalShots),0,'soltar ESPACIO tras cancelar no dispara');
    // Disparo real: la guía coincide con la trayectoria del proyectil disparado.
    await k.press('Enter');await k.down(' ');await ev(()=>run(35));
    const pre=await ev(()=>({pts:previewTrajectory(app.active,app.angle,app.power,app.weapon),angle:app.angle,power:app.power}));
    await k.up(' ');
    const shot=await ev(()=>{const p=app.projectiles[0],pts=[];if(!p)return {shots:app.totalShots};for(let i=1;i<=42&&!p.dead;i++){stepProjectile(p,1/60);if(i%3===0)pts.push({x:p.x,y:p.y});}return {shots:app.totalShots,pts,phase:app.phase,ammo:app.teams[app.team].ammo[app.weapon],lastPower:app.lastPower};});
    assert.equal(shot.shots,1,'soltar ESPACIO dispara exactamente una vez');assert.equal(shot.ammo,ammo0-1,'el disparo gasta una carga');
    assert.equal(shot.lastPower,pre.power,'la potencia del disparo es la mostrada');
    const n=Math.min(pre.pts.length,shot.pts.length);assert.ok(n>=3,'trayectoria comparable');
    const err=Math.max(...pre.pts.slice(0,n).map((p,i)=>Math.hypot(p.x-shot.pts[i].x,p.y-shot.pts[i].y)));
    assert.ok(err<1e-6,`guía = disparo real (error ${err})`);
    await k.down(' ');await k.up(' ');assert.equal(await ev(()=>app.totalShots),1,'ESPACIO tras el disparo no dispara de nuevo');
    console.log(`  teclado (${wid}): A/D, ESPACIO salta, F→W/S→mantener ESPACIO→soltar dispara 1 vez, Esc cancela sin gastar, guía = disparo (error ${err.toExponential(1)})`);
   }
   await ctx.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS controls: 6 pantallas sin solapes, armas a la izquierda, ATACAR/SALTAR a la derecha, táctil y teclado con estados de ataque.');
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
