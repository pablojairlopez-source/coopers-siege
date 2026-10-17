// IA de campaña: trayectoria real, terreno, equidad y planificación sin efectos secundarios.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve();let browser;
 try{
  browser=await launch({gpu:false});const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const result=await page.evaluate(()=>{
   const C=CS5.campaign,A=CS5.campaignAI,failures=[],check=(v,s)=>{if(!v)failures.push(s);};
   C.load();C.startBattle(1,1);
   const rect=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)terrain.mask.fill(1,yy*W+x,yy*W+x+w);};
   const scene=()=>{
    terrain.mask.fill(0);rect(0,500,W,H-500);
    const c={id:0,team:0,x:400,y:499,hp:100,vx:0,vy:0,grounded:true,dir:1};
    const e={id:1,team:1,x:640,y:499,hp:60,vx:0,vy:0,grounded:true,dir:-1};
    app.chars=[c,e];app.active=c;app.team=0;app.shotCount=0;app.projectiles=[];app.mines=[];app.supplies=[];app.wind=0;
    for(const t of app.teams)t.ammo=CS5.arsenal.initial(weapons,'standard');return {c,e};
   };
   // La misma salida y colisión que stepProjectile, con granadas que rebotan en suelo/pared.
   let parity=0;
   for(const scale of [1,2])for(const id of ['rocket','grenade'])for(const angle of [-55,25,70])for(const dt of [STEP,1/30]){
    const {c,e}=scene();c.hitScale=scale;e.x=800;rect(580,390,8,110);app.wind=-18;
    const predicted=A.trajectory(c,angle,54,id,dt),old=detonate;let actual=null;
    detonate=p=>{actual={x:p.x,y:p.y,hit:true};p.dead=true;};
    try{
     const p=addProjectile(id,c,angle,54);for(let k=0;k<600&&!p.dead;k++)stepProjectile(p,dt);
     if(!actual)actual={x:p.x,y:p.y,hit:false};
     check(predicted.hit===actual.hit&&(!actual.hit||Math.hypot(predicted.x-actual.x,predicted.y-actual.y)<.01),`trayectoria ${scale}/${id}/${angle}/${dt}: ${JSON.stringify({predicted,actual})}`);parity++;
    }finally{detonate=old;}
   }
   // Rival inferior: debe poder apuntar hacia abajo y causar daño sin malgastar especiales.
   {const {c,e}=scene();c.y=360;rect(370,361,60,139);e.x=570;
    const b=A.shot(c);const p=A.trajectory({...c,dir:b.dir},b.angle,b.power,b.weapon);
    check(b.score>10,'ataque útil contra rival inferior');check(Math.hypot(p.x-e.x,p.y-pugCY(e))<95,'impacto cerca del rival inferior');
    const down=A.trajectory(c,-40,24);check(down.hit&&down.y>c.y,'predicción de tiro descendente');}
   // Obstáculo bajo: saltar y aproximarse sin inventar saltos mayores que los humanos.
   {const {c,e}=scene();e.x=800;rect(455,465,24,35);
    const before=JSON.stringify({chars:app.chars,ammo:app.teams.map(t=>t.ammo),fx:app.fx,floats:app.floats,shots:app.totalShots}),mask=terrain.mask.slice();
    const oldR=random;random=rng(456);const expected=rng(456)();const route=A.route(c,e),next=random();random=oldR;
    check(route&&route.x>500&&route.jumps.length>0,'saltar obstáculo y acercarse');
    check(before===JSON.stringify({chars:app.chars,ammo:app.teams.map(t=>t.ammo),fx:app.fx,floats:app.floats,shots:app.totalShots}),'ruta sin efectos secundarios');
    check(mask.every((v,i)=>v===terrain.mask[i])&&expected===next,'ruta sin cambiar terreno ni RNG');
    if(route){const clone={...c};let j=0;for(let k=0;k<Math.round(route.time*30);k++){const jump=k/30>=route.jumps[j];if(jump)j++;characterPhysics(clone,1/30,route.dir,jump,true);}check(Math.abs(clone.x-route.x)<.1,'ruta reproducible con física real');}
   }
   // Un abismo ancho no se puede cruzar caminando; tampoco acabar cayendo al agua.
   {const {c,e}=scene();for(let y=490;y<H;y++)terrain.mask.fill(0,y*W+470,y*W+800);e.x=950;const r=A.route(c,e);check(!r||r.x<470,'no planificar cruce suicida del agua');}
   // Pared alta: granada con rebote y tiro de excavación siguen usando solo arsenal disponible.
   let plans=0;
   for(const difficulty of ['easy','normal','hard'])for(let n=1;n<=17;n++){
    C.save.difficulty=difficulty;C.startBattle(n,1);for(const t of app.teams)t.human=false;
    for(const c of app.chars){app.active=c;app.team=c.team;const signatures=app.teams.map(t=>CS5.arsenal.signature(t,weapons));A.plan(c);plans++;
     check(CS5.arsenal.canFire(app.teams[c.team],app.aiPlan.weapon),`munición ${difficulty}/${n}/${c.id}`);
     check(signatures.every((v,i)=>v===CS5.arsenal.signature(app.teams[i],weapons)),`plan no regala ni gasta munición ${n}`);
    }
   }
   C.leaveBattle();return {failures,parity,plans};
  });
  assert.deepEqual(result.failures,[]);assert.deepEqual(errors,[]);
  console.log(`✔ IA campaña: ${result.parity} trayectorias reales, tiro descendente, salto, agua, predicción sin efectos; ${result.plans} planes con equidad`);
 }finally{if(browser)await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
