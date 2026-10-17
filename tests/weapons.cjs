// 5.2 — Arsenal e igualdad humano/bot.
// · Arsenal estándar: bazuca ∞, granada ∞, escopeta 2, mina 2, bate ∞, el resto 0.
// · Todos los equipos (humano y CPU, 2–4 escuadras) empiezan con inventarios idénticos.
// · Bazuca y granada no se gastan nunca (humano y bot); las limitadas se gastan de una en una;
//   un arma agotada no se puede elegir ni disparar.
// · La IA solo dispara armas con munición, incluso con inventarios aleatorios.
// · Abundante e Infinita se conservan.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');

(async()=>{
 const srv=await serve(),browser=await launch({gpu:false}),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const ev=f=>page.evaluate(f);

  // 1. Arsenal estándar idéntico para todos los equipos.
  const std=await ev(()=>{
   const P=PocketSiege,out=[];
   for(const teams of ['2','3','4']){
    P.mainMenu();document.getElementById('modeCPU').click();document.getElementById('ammoMode').value='standard';
    document.getElementById('teamCount').value=teams;document.getElementById('memberCount').value='3';P.newMatch(77+Number(teams));
    out.push(P.state.teams.map(t=>({human:t.human,sig:CS5.arsenal.signature(t,weapons)})));
   }
   const expected=weapons.map(w=>w.id+':'+({rocket:'∞',grenade:'∞',bat:'∞',shotgun:2,mine:2}[w.id]??0)).join('|');
   return {out,expected};
  });
  for(const teams of std.out){
   assert.ok(teams.some(t=>t.human)&&teams.some(t=>!t.human),'hay humano y CPU');
   for(const t of teams)assert.equal(t.sig,std.expected,'arsenal estándar idéntico para humano y CPU');
  }

  // 2. Consumo: infinitas no bajan; limitadas bajan de una en una; agotadas no disparan.
  const use=await ev(()=>{
   const P=PocketSiege,s=P.state,log={};
   P.mainMenu();document.getElementById('modeCPU').click();document.getElementById('teamCount').value='2';P.newMatch(4242);
   const ready=()=>{s.projectiles=[];s.mines=[];setPhase('aim');s.paused=false;s.shotCount=0;s.shotSecond=false;s.target=null;s.charging=false;};
   // Turno humano.
   let g=0;while(!human()&&g++<8)P.nextTurn();ready();
   const t=s.teams[s.team];
   for(const id of ['rocket','grenade']){let fired=0;for(let i=0;i<40;i++){ready();s.weapon=id;if(P.shoot())fired++;}log[id]={fired,left:t.ammo[id]};}
   for(const id of ['shotgun','mine']){const seq=[];for(let i=0;i<4;i++){ready();s.weapon=id;seq.push(P.shoot()?t.ammo[id]:'x');}log[id]=seq;}
   ready();s.weapon='rocket';P.selectWeapon('super');log.selectExhausted=s.weapon;
   ready();s.weapon='super';log.shootExhausted=P.shoot();log.superLeft=t.ammo.super;
   // Una carga concedida se gasta y luego vuelve a estar agotada.
   CS5.arsenal.grant(t,'super',1);ready();P.selectWeapon('super');log.grantedSelect=s.weapon;log.grantedShot=P.shoot();ready();s.weapon='super';log.afterGrant=P.shoot();log.superFinal=t.ammo.super;
   return log;
  });
  assert.deepEqual(use.rocket,{fired:40,left:Infinity},'bazuca infinita');
  assert.deepEqual(use.grenade,{fired:40,left:Infinity},'granada común infinita');
  assert.deepEqual(use.shotgun,[1,0,'x','x'],'escopeta: 2 usos y después agotada');
  assert.deepEqual(use.mine,[1,0,'x','x'],'mina: 2 usos y después agotada');
  assert.equal(use.selectExhausted,'rocket','no se puede elegir un arma agotada');
  assert.equal(use.shootExhausted,false,'no se puede disparar un arma agotada');
  assert.equal(use.superLeft,0);
  assert.equal(use.grantedSelect,'super');assert.equal(use.grantedShot,true);assert.equal(use.afterGrant,false);assert.equal(use.superFinal,0);

  // 3. IA: con inventarios aleatorios solo elige armas disponibles; bazuca y granada no se gastan.
  const ai=await ev(()=>{
   const P=PocketSiege,s=P.state,bad=[],picked={};
   P.mainMenu();document.getElementById('modeCPU').click();document.getElementById('teamCount').value='2';document.getElementById('memberCount').value='3';
   for(let round=0;round<40;round++){
    P.newMatch(900+round);for(let i=0;i<5;i++)P.step(1/60);
    let g=0;while(human()&&g++<8)P.nextTurn();
    const t=s.teams[s.team],R=(k=>()=>((k=(k*1103515245+12345)>>>0)/4294967296))(round+1);
    for(const w of weapons)if(!CS5.arsenal.isInfinite(w.id))t.ammo[w.id]=R()<.35?1+Math.floor(R()*2):0;
    setPhase('aim');s.aiAge=.5;s.aiPlan=null;
    for(let k=0;k<12;k++){P.planAI();const w=s.aiPlan.weapon;picked[w]=(picked[w]||0)+1;if(!CS5.arsenal.canFire(t,w))bad.push(w);}
   }
   // Turnos completos de CPU: cada disparo debe tener munición en ese instante.
   const fired=[],orig=P.shoot;let refused=0;
   P.newMatch(31337);
   const wrap=window.shoot;
   for(let turn=0;turn<6;turn++){
    let g=0;while(human()&&g++<8)P.nextTurn();
    const t=s.teams[s.team];for(const w of weapons)if(!CS5.arsenal.isInfinite(w.id))t.ammo[w.id]=w.id==='sniper'?1:0;
    s.timer=999;const before=s.totalShots,ammo={...t.ammo};
    for(let i=0;i<60*6&&s.totalShots===before;i++)P.step(1/60);
    if(s.totalShots>before){fired.push({w:s.weapon,had:ammo[s.weapon],left:t.ammo[s.weapon]});}
    s.projectiles=[];s.mines=[];P.nextTurn();
   }
   return {bad,picked,fired};
  });
  assert.deepEqual(ai.bad,[],'la IA nunca planifica un arma agotada');
  assert.ok(Object.keys(ai.picked).length>=6,`la IA usa armas variadas (${JSON.stringify(ai.picked)})`);
  assert.ok(ai.fired.length>=3,'la CPU dispara en sus turnos');
  for(const f of ai.fired){
   assert.ok(f.had>0,`la CPU disparó ${f.w} con munición`);
   if(CS5_INF.includes(f.w))assert.equal(f.left,Infinity,`${f.w} sigue infinita para la CPU`);
   else assert.equal(f.left,f.had-1,`${f.w}: la CPU gasta una carga`);
  }

  // 4. Modos personalizados conservados.
  const modes=await ev(()=>{
   const P=PocketSiege,r={};
   for(const m of ['abundant','infinite']){P.mainMenu();document.getElementById('modeCPU').click();document.getElementById('ammoMode').value=m;P.newMatch(5);const t=P.state.teams[0];r[m]={super:t.ammo.super,shotgun:t.ammo.shotgun,holy:t.ammo.holy,rocket:t.ammo.rocket,grenade:t.ammo.grenade};}
   document.getElementById('ammoMode').value='standard';return r;
  });
  assert.deepEqual(modes.abundant,{super:2,shotgun:8,holy:2,rocket:Infinity,grenade:Infinity},'abundante = clásico ×2');
  for(const v of Object.values(modes.infinite))assert.equal(v,Infinity,'infinita');

  assert.deepEqual(errors,[]);
  console.log(`PASS weapons: arsenal estándar idéntico (humano/CPU), bazuca y granada ∞, limitadas 2→0, agotadas bloqueadas, IA sin trampas (${ai.fired.map(f=>f.w).join(', ')}), modos abundante e infinito.`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
const CS5_INF=['rocket','grenade','bat'];
