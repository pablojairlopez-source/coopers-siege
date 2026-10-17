// Regresión: cuerpo gigante, geometría estrecha y aparición/rescate en los 17 mapas.
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
   const failures=[],check=(ok,msg)=>{if(!ok)failures.push(msg);},C=CS5.campaign;
   C.load();C.startBattle(1,2);
   let t=terrain;const rect=(x,y,w,h)=>{for(let yy=y;yy<y+h;yy++)t.mask.fill(1,yy*W+x,yy*W+x+w);};
   const setup=(scale=2)=>{
    t.mask.fill(0);rect(0,500,W,H-500);
    const c={id:0,team:0,x:400,y:499,vx:0,vy:0,walkVX:0,hp:100,grounded:true,hitScale:scale};
    app.chars=[c];app.active=c;return c;
   };
   // Túnel de 36 px: el normal pasa; el gigante se detiene en la entrada.
   for(const scale of [1,2]){
    const c=setup(scale);rect(450,420,250,44);
    for(let k=0;k<80;k++)characterPhysics(c,1/60,1);
    check(scale===1?c.x>500:c.x<433,`túnel escala ${scale}: ${c.x}`);
    check(t.bodyClear(c.x,c.y,scale),`cuerpo libre en túnel ${scale}`);
   }
   // Pared, techo de un píxel y apoyo en el borde exterior del pie gigante.
   {const c=setup();rect(450,300,1,200);for(let k=0;k<90;k++)characterPhysics(c,1/60,1,k===1);check(c.x<433,'no atravesar pared fina');}
   {const c=setup();rect(300,400,220,1);let min=999;for(let k=0;k<100;k++){characterPhysics(c,1/60,0,k===0);min=Math.min(min,c.y);check(t.bodyClear(c.x,c.y,2),'no atravesar techo al saltar');}check(min>=452,'cabeza gigante bajo techo');check(c.grounded,'aterrizar después de saltar');}
   {const c=setup();t.mask.fill(0);rect(417,500,1,100);c.y=350;c.grounded=false;c.vy=350;for(let k=0;k<60;k++)characterPhysics(c,1/60);check(c.grounded&&c.y<501,'caída sobre borde del pie 2×');check(c.hp<100,'daño de caída conservado');}
   // Un salto libre mantiene la altura y vuelve al suelo para ambos tamaños.
   for(const scale of [1,2]){const c=setup(scale);let min=c.y;for(let k=0;k<100;k++){characterPhysics(c,1/60,0,k===0);min=Math.min(min,c.y);}check(min<455&&c.grounded&&c.y<501,`salto libre ${scale}`);}
   // No se modifica la máscara al buscar posiciones, saltar o caminar por cada mapa.
   let spawns=0,rescues=0;
   for(let n=1;n<=17;n++)for(let seed=0;seed<3;seed++){
    const now=Date.now;Date.now=()=>1e12+n*1000+seed;try{C.startBattle(n,2);}finally{Date.now=now;}
    t=terrain;const b=app.chars.find(c=>c.boss),mask=t.mask.slice();spawns++;
    check(t.bodyClear(b.x,b.y,2)&&t.support(b.x,b.y,2),`aparición ${n}/${seed}`);
    for(let k=0;k<180;k++){
     characterPhysics(b,1/60,k<90?1:-1,k===5||k===95);
     if(b.hp>0)check(t.bodyClear(b.x,b.y,2),`movimiento ${n}/${seed}/${k}`);
    }
    check(mask.every((v,i)=>v===t.mask[i]),`física no altera mapa ${n}/${seed}`);
    b.hp=b.maxHp;b.y=WATER+10;check(CS5.bosses.rescue(b),`rescate ${n}/${seed}`);rescues++;
    check(t.bodyClear(b.x,b.y,2)&&t.support(b.x,b.y,2),`rescate libre ${n}/${seed}`);
    // La vieja plataforma puede desaparecer: no volver a una posición sin apoyo.
    terrain.destroy(b.x,b.y,65);b.hp=b.maxHp;b.y=WATER+10;
    check(CS5.bosses.rescue(b),`rescate tras cráter ${n}/${seed}`);
    check(t.bodyClear(b.x,b.y,2)&&t.support(b.x,b.y,2),`nuevo apoyo ${n}/${seed}`);
   }
   // Las habilidades de desplazamiento y el teletransporte respetan la escala.
   C.startBattle(7,2);t=terrain;const b=app.chars.find(c=>c.boss);app.active=b;app.team=b.team;
   for(let k=0;k<12;k++){CS5.bosses.abilities.phase(b);check(t.bodyClear(b.x,b.y,2),'fase gigante libre');}
   const e=app.chars.find(c=>c.team!==b.team);CS5.bosses.abilities.charge(b,{targetId:e.id,x:e.x,y:e.y});
   characterPhysics(b,1/60);check(t.bodyClear(b.x,b.y,2),'carga gigante libre');
   C.leaveBattle();return {failures,spawns,rescues};
  });
  assert.deepEqual(result.failures,[]);assert.deepEqual(errors,[]);
  console.log(`✔ Física gigante: túneles, paredes, techos, saltos, caídas; ${result.spawns} apariciones y ${result.rescues*2} rescates en 17 mapas`);
 }finally{if(browser)await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
