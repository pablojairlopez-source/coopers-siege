// Cooper's Siege 5.2 — Jefes gigantes de la campaña.
// · Escala 2× (modelo 3D, caja de impacto, posición de disparo, sombra y etiqueta usan `size`/`hitScale`),
//   resistencia al empuje (`mass`) y vida de 250–400 (`maxHp`).
// · Habilidades con enfriamiento: se ANUNCIAN al empezar un turno del jefe (zona marcada en el
//   escenario) y se ejecutan en su turno SIGUIENTE en lugar del ataque normal. Contrarrestar:
//   salir de la zona, protegerse o interrumpirla causando `breakDamage` de daño al jefe.
// · IA temática por estilo (cíborg precisión, demonio fuego/agresivo, fantasma desplazamiento,
//   zombi resistencia, esqueleto estrategia, alien energía). El jefe usa el mismo arsenal que el
//   jugador (bazuca y granada ∞, el resto limitado): las habilidades no gastan munición.
// · Determinista: solo usa `random` (semilla de la partida) y la geometría.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const D=()=>CS5.campaignData;
const ZONE={gale:220,broadside:95,spores:120,petals:80,sandTrap:70,torpedo:80,decree:115,frost:110,bassDrop:175,tractor:55,plasma:115,abyss:150,firestorm:165,charge:80,outbreak:130,press:55,glaze:85,bite:110,thornCage:120,starOrb:85,nova:115};
const SELF=new Set(['regrow','boneWall','phase','bassDrop']);
const enemiesOf=c=>app.chars.filter(e=>e.hp>0&&e.team!==c.team);
const near=(x,y,r,c)=>enemiesOf(c).filter(e=>Math.hypot(e.x-x,pugCY(e)-y)<r);
const groundY=x=>{x=Math.max(15,Math.min(W-15,Math.round(x)));const t=terrain.topSurface?.[x];return t>0&&t<WATER?t-2:WATER-30;};

const bosses={
 // Busca apoyo y espacio para todo el cuerpo; también sirve tras destruir la plataforma.
 safePlace(x,y,c=null){
  const scale=c?pugScale(c):D().boss.scale;
  const spot=terrain.spot(x,y,scale,c);if(spot)return spot;
  let best=null,score=Infinity;
  for(let xx=40;xx<W-40;xx+=12){
   const s=terrain.surface(xx,0,true,scale);if(!s||s.y>WATER-30)continue;
   if(app.chars.some(e=>e!==c&&e.hp>0&&Math.abs(e.x-s.x)<40&&Math.abs(e.y-s.y)<65))continue;
   const d=Math.abs(s.x-x)+Math.abs(s.y-y)*.5;if(d<score){best=s;score=d;}
  }
  return best;
 },
 // Convierte un personaje en jefe. `def` viene de chapters.js.
 setup(c,def,difficulty='normal'){
  const st=D().styles[def.style]||D().styles.normal,cfg=D().boss;
  Object.assign(c,{name:def.name,size:cfg.scale,hitScale:cfg.scale,mass:cfg.mass,maxHp:def.hp,hp:def.hp,variant:def.variant||c.variant,fur:def.fur,accessory:def.accessory,backgear:def.backgear,cosmeticColor:def.color});
  const list=(def.phases?def.phases[0].abilities:def.abilities).slice();
  c.boss={id:def.id,name:def.name,title:def.title,style:def.style,final:!!def.final,abilities:list,cd:Object.fromEntries(def.abilities.map(a=>[a,1])),pending:null,phase:0,
   aimError:(def.phases?def.phases[0].aimError:st.aimError)*(difficulty==='easy'?1.6:difficulty==='hard'?.7:1),cdBonus:0,home:{x:c.x,y:c.y},interrupts:0,used:0,difficulty};
  c.boss.aimErrorBase=c.boss.aimError;
  return c;
 },
 bossOf(){return app.chars.find(c=>c.boss&&c.hp>0)||null;},
 // Llamado al final de nextTurn.
 onTurnStart(){
  const c=app.active;if(!c||!c.boss||c.hp<=0)return;
  const b=c.boss;
  if(b.pending){b.pending.ready=true;return;}
  for(const k of Object.keys(b.cd))b.cd[k]=Math.max(0,b.cd[k]-1);
  const ready=b.abilities.filter(a=>b.cd[a]<=0);
  if(!ready.length||random()>D().boss.announceChance)return;
  this.announce(c,ready[Math.floor(random()*ready.length)]);
 },
 announce(c,id){
  const b=c.boss,foes=enemiesOf(c);if(!foes.length)return null;
  // Objetivo: el rival más cercano o, a veces, el más débil.
  const byDist=foes.slice().sort((a,b2)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b2.x-c.x,b2.y-c.y));
  const t=random()<.35?foes.slice().sort((a,b2)=>a.hp-b2.hp)[0]:byDist[0];
  const self=SELF.has(id);
  b.pending={id,x:self?c.x:t.x,y:self?pugCY(c):pugCY(t),targetId:t.id,dmg:0,ready:false,r:ZONE[id]||0,self};
  const a=D().abilities[id];
  app.floats.push({x:c.x,y:c.y-90,life:2.6,get text(){return '⚠ '+a.icon+' '+a.name.toUpperCase()},color:'#ffb35c'});
  toastLocalized(()=>CS5.i18n.t("campaign.bosses.announce.s001",{p0:b.name,p1:a.name,p2:a.desc,p3:D().boss.breakDamage}),4.2);
  audio.sound('bossCharge',1,{x:c.x,y:c.y});
  return b.pending;
 },
 // Turno de la IA del jefe: si hay una habilidad lista, la ejecuta en lugar del ataque normal.
 aiTurn(c,dt){
  const p=c.boss.pending;if(!p||!p.ready)return false;
  if(app.aiAge>1.35&&!p.done){p.done=true;this.execute(c,p);}
  return true;
 },
 execute(c,p){
  const b=c.boss,a=D().abilities[p.id];
  b.pending=null;b.cd[p.id]=Math.max(1,a.cd-b.cdBonus);b.used++;
  app.floats.push({x:c.x,y:c.y-92,life:1.8,get text(){return a.icon+' '+a.name},color:'#ff6b6b'});
  audio.sound('bossRoar',1,{x:c.x,y:c.y});
  app.shake=Math.max(app.shake,10);
  c._immune=true;
  try{(this.abilities[p.id]||(()=>{}))(c,p);}finally{c._immune=false;}
  app.weapon='rocket';app.target=null;app.charging=false;
  setPhase('action');app.actionAge=0;app.stable=0;app.shotSecond=false;app.totalShots++;app.aiFired=true;
  updateHUD();
 },
 // Daño recibido por un jefe: interrupción de la habilidad anunciada y fases del jefe final.
 onDamage(c,amount){
  const b=c.boss;if(!b)return;
  if(b.pending){
   b.pending.dmg+=amount;
   if(b.pending.dmg>=D().boss.breakDamage){
    const a=D().abilities[b.pending.id];b.cd[b.pending.id]=Math.max(1,a.cd-b.cdBonus);b.pending=null;b.interrupts++;
    app.floats.push({x:c.x,y:c.y-96,life:2,get text(){return CS5.i18n.t("campaign.bosses.onDamage.s001")},color:'#9bffd3'});
    toastLocalized(()=>CS5.i18n.t("campaign.bosses.onDamage.s002",{p0:b.name}),3);
   }
  }
  this.checkPhase(c);
  CS5.campaign?.updateBossBar?.();
 },
 checkPhase(c){
  const b=c.boss,def=CS5.campaign?.currentBossDef?.();if(!def||!def.phases||c.hp<=0)return;
  const ratio=c.hp/c.maxHp;let ph=0;def.phases.forEach((f,i)=>{if(ratio<=f.at)ph=i;});
  if(ph<=b.phase)return;
  b.phase=ph;const f=def.phases[ph];
  for(const id of f.abilities)if(!b.abilities.includes(id)){b.abilities.push(id);b.cd[id]=0;}
  b.aimError=f.aimError*(b.difficulty==='easy'?1.6:b.difficulty==='hard'?.7:1);b.cdBonus=f.cdBonus||0;
  app.floats.push({x:c.x,y:c.y-100,life:2.6,get text(){return CS5.i18n.t("campaign.bosses.checkPhase.s001",{p0:ph+1})},color:'#9fe8ff'});
  audio.sound('bossRoar',1.2,{x:c.x,y:c.y});app.shake=Math.max(app.shake,16);
  for(let i=0;i<40;i++)spawnFX(c.x,c.y-30,(effectsRandom()-.5)*260,(effectsRandom()-.5)*260,'#9fe8ff',3,1.1,'spark');
  CS5.campaign?.onBossPhase?.(c,ph);
 },
 // Caer al agua no elimina al jefe de golpe: pierde vida y vuelve a su plataforma.
 rescue(c){
  if(!c.boss)return false;
  const loss=D().boss.rescueDamage;
  if(c.hp-loss<=0)return false;
  const s=this.safePlace(c.boss.home.x,c.boss.home.y,c);if(!s)return false;
  c.hp-=loss;c.x=s.x;c.y=s.y;c.boss.home={...s};c.vx=c.vy=c.walkVX=0;c.grounded=true;
  app.floats.push({x:c.x,y:c.y-80,life:2,text:'🌊 −'+loss,color:'#8cecff'});
  toastLocalized(()=>CS5.i18n.t("campaign.bosses.rescue.s001",{p0:CS5.i18n.characterName(c),p1:loss}),3);
  this.onDamage(c,loss);
  return true;
 },
 // Preferencias de armas por estilo (solo entre armas con munición: la lista ya está filtrada).
 weighWeapons(c,list){
  const st=D().styles[c.boss.style]||D().styles.normal;
  for(const e of list)e[1]*=st.prefer[e[0]]||1;
 },
 // Estilos agresivos: se acercan antes de atacar si hay camino.
 adjustPlan(c,plan,target,noDetour){
  plan.boss=true;
  const st=D().styles[c.boss.style]||D().styles.normal;
  if(noDetour||plan.walkTo!=null||!st.approach)return;
  const dx=target.x-c.x;if(Math.abs(dx)<200)return;
  const dir=Math.sign(dx);let prev=c.y,x=c.x,steps=0;
  for(;steps<18;steps++){const f=terrain.surface(x+dir*8,prev-40);if(!f||Math.abs(f.y-prev)>10||f.y>WATER-30)break;x+=dir*8;prev=f.y;}
  if(steps>=6){plan.walkTo=x;plan.walkTime=Math.min(1.6,Math.abs(x-c.x)/112+.2);}
 },
 // Dibujo (lienzo 2D, coordenadas del mundo): aura del jefe y zona de la habilidad anunciada.
 draw(c2,time){
  for(const c of app.chars){
   if(!c.boss||c.hp<=0)continue;
   const col=c.cosmeticColor||'#ffd36a',pulse=.5+.5*Math.sin(time*3);
   c2.save();c2.globalAlpha=.25+.15*pulse;c2.strokeStyle=col;c2.lineWidth=3;c2.beginPath();c2.ellipse(c.x,c.y+1,34+pulse*4,8,0,0,Math.PI*2);c2.stroke();c2.restore();
   const p=c.boss.pending;if(!p)continue;
   const a=D().abilities[p.id],ready=p.ready?1:.6;
   c2.save();
   if(p.r){
    c2.globalAlpha=(.18+.16*pulse)*ready;c2.fillStyle='#ff4d4d';c2.beginPath();c2.arc(p.x,p.y,p.r,0,Math.PI*2);c2.fill();
    c2.globalAlpha=.85*ready;c2.setLineDash([10,7]);c2.lineDashOffset=-time*30;c2.strokeStyle='#ffb35c';c2.lineWidth=3;c2.beginPath();c2.arc(p.x,p.y,p.r,0,Math.PI*2);c2.stroke();c2.setLineDash([]);
   }
   c2.globalAlpha=1;c2.font='bold 15px system-ui,sans-serif';c2.textAlign='center';c2.fillStyle='#ffe0b0';c2.strokeStyle='#2a0f0f';c2.lineWidth=4;
   const label=a.icon+' '+a.name+(p.ready?CS5.i18n.t("campaign.bosses.draw.s001"):CS5.i18n.t("campaign.bosses.draw.s002"));
   c2.strokeText(label,p.x,p.y-(p.r||40)-10);c2.fillText(label,p.x,p.y-(p.r||40)-10);
   if(!p.self){const left=Math.max(0,D().boss.breakDamage-p.dmg);c2.font='bold 12px system-ui,sans-serif';const t2=CS5.i18n.t("campaign.bosses.draw.s003",{p0:left});c2.strokeText(t2,c.x,c.y-104);c2.fillText(t2,c.x,c.y-104);}
   c2.restore();
  }
 },
 // Implementación de las habilidades: (jefe, {x,y,targetId}).
 abilities:{
  gale(c,p){const dir=Math.sign(p.x-c.x)||1;app.wind=dir*58;for(const e of near(p.x,p.y,ZONE.gale,c)){damage(e,12,c.x,c.y);e.vx+=dir*420/(e.mass||1);e.vy-=220/(e.mass||1);e.grounded=false;}for(let i=0;i<50;i++)spawnFX(p.x-dir*200+effectsRandom()*400*dir,p.y-60+effectsRandom()*120,dir*(300+effectsRandom()*200),(effectsRandom()-.5)*40,'#e8fbff',2,.8,'spark');},
  broadside(c,p){for(let i=0;i<3;i++)app.projectiles.push({id:'airbomb',x:Math.max(20,Math.min(W-20,p.x+(i-1)*42)),y:-60-i*55,vx:0,vy:220,age:-i*.15,team:c.team,owner:c.id,fuse:0,radius:48,damage:36,trail:[]});},
  regrow(c){c.hp=Math.min(c.maxHp,c.hp+40);app.floats.push({x:c.x,y:c.y-70,life:1.8,text:'🌿 +40',color:'#9be37a'});for(let i=0;i<30;i++)spawnFX(c.x+(effectsRandom()-.5)*60,c.y,(effectsRandom()-.5)*40,-60-effectsRandom()*90,'#9be37a',3,1);},
  spores(c,p){app.fx.push({kind:'acidPool',x:p.x,y:groundY(p.x),vx:0,vy:0,size:40,life:2.2,max:2.2,nextMelt:9,team:c.team});for(const e of near(p.x,p.y,ZONE.spores,c)){damage(e,10,p.x,p.y);e.poisoned=6;app.floats.push({x:e.x,y:e.y-50,life:1.4,get text(){return CS5.i18n.t("campaign.bosses.spores.s001")},color:'#9be37a'});}},
  petals(c,p){for(let k=1;k<=5;k++){const x=c.x+(p.x-c.x)*k/5,y=Math.min(groundY(x),c.y+(p.y-c.y)*k/5+30);app.projectiles.push({id:'chain',x,y,vx:0,vy:0,age:-k*.12,fuse:.05,team:c.team,owner:c.id,radius:30,damage:24});}},
  sandTrap(c){const foes=enemiesOf(c).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y)).slice(0,2);for(const e of foes){const side=e.x>c.x?1:-1;app.mines.push({x:Math.max(10,Math.min(W-10,e.x+side*34)),y:e.y-8,vx:0,vy:0,age:0,team:c.team,dead:false});}},
  boneWall(c){c.shield=70;app.floats.push({x:c.x,y:c.y-70,life:1.8,get text(){return CS5.i18n.t("campaign.bosses.boneWall.s001")},color:'#efe3c4'});},
  torpedo(c,p){const dir=Math.sign(p.x-c.x)||1;for(let i=0;i<2;i++)app.projectiles.push({id:'homing',x:c.x+dir*30,y:c.y-56,vx:dir*190,vy:-260-i*70,age:-i*.2,team:c.team,owner:c.id,fuse:0,radius:50,damage:38,target:{x:p.x,y:p.y},trail:[],bounces:0});},
  decree(c,p){for(let i=0;i<5;i++)app.projectiles.push({id:'airbomb',x:Math.max(20,Math.min(W-20,p.x+(i-2)*42)),y:-45-i*52,vx:app.wind*.2,vy:165,age:-i*.12,team:c.team,owner:c.id,fuse:0,radius:42,damage:30,trail:[]});},
  frost(c,p){app.fx.push({kind:'cryoNova',x:p.x,y:p.y,size:ZONE.frost,life:.85,max:.85,color:'#8cf5ff'});audio.sound('splash');for(const e of near(p.x,p.y,ZONE.frost,c)){e.chilled=8.5;damage(e,22,p.x,p.y);app.floats.push({x:e.x,y:e.y-52,life:1.5,get text(){return CS5.i18n.t("campaign.bosses.frost.s001")},color:'#8cf5ff'});}},
  phase(c){
   const foes=enemiesOf(c);let best=null,score=-1;
   for(let k=0;k<14;k++){const x=60+random()*(W-120),s=terrain.spot(x,groundY(x),pugScale(c),c);if(!s||s.y>WATER-40)continue;const d=Math.min(...foes.map(e=>Math.abs(e.x-s.x)));const sc=Math.min(d,700)-Math.abs(d-480)*.3;if(sc>score){score=sc;best=s;}}
   if(!best)return;
   for(let i=0;i<30;i++){spawnFX(c.x,c.y-30,(effectsRandom()-.5)*140,(effectsRandom()-.5)*160,'#cfe9ff',4,.8);spawnFX(best.x,best.y-30,(effectsRandom()-.5)*140,(effectsRandom()-.5)*160,'#9fe8ff',4,.9);}
   app.fx.push({x:c.x,y:c.y-30,end:{x:best.x,y:best.y-30},life:.4,max:.4,kind:'beam',color:'#cfe9ff'});
   c.x=best.x;c.y=best.y;c.vx=c.vy=c.walkVX=0;c.grounded=true;c.boss.home={x:best.x,y:best.y};audio.sound('teleport');
  },
  bassDrop(c){app.fx.push({x:c.x,y:c.y-20,vx:0,vy:0,color:'#ff5fd2',size:ZONE.bassDrop,life:.7,max:.7,kind:'flash'});for(const e of near(c.x,pugCY(c),ZONE.bassDrop,c)){const d=Math.hypot(e.x-c.x,pugCY(e)-pugCY(c)),f=1-d/ZONE.bassDrop;damage(e,Math.round(10+22*f),c.x,c.y);const dir=Math.sign(e.x-c.x)||1;e.vx+=dir*(260+260*f)/(e.mass||1);e.vy-=(180+160*f)/(e.mass||1);e.grounded=false;}},
  tractor(c,p){const t=app.chars.find(e=>e.id===p.targetId&&e.hp>0);if(!t)return;const dir=Math.sign(c.x-t.x)||1;app.fx.push({x:c.x,y:pugCY(c),end:{x:t.x,y:pugCY(t)},life:.6,max:.6,kind:'teslaArc',color:'#b9ef8b'});damage(t,18,c.x,c.y);t.shocked=1.3;t.vx=dir*360/(t.mass||1);t.vy=-230;t.grounded=false;},
  plasma(c,p){for(let k=0;k<5;k++){const x=Math.max(20,Math.min(W-20,p.x+(k-2)*46));app.projectiles.push({id:'chain',x,y:groundY(x),vx:0,vy:0,age:-k*.15,fuse:.05,team:c.team,owner:c.id,radius:34,damage:20});app.fx.push({x,y:0,end:{x,y:groundY(x)},life:.5,max:.5,kind:'teslaArc',color:'#b9ef8b'});}},
  abyss(c,p){addWaterRipple(p.x,2.2);audio.sound('splash');for(let i=0;i<40;i++)spawnFX(p.x+(effectsRandom()-.5)*ZONE.abyss*2,p.y+20,(effectsRandom()-.5)*80,-120-effectsRandom()*160,'#4fd9ff',3,1);const dir=Math.sign(p.x-c.x)||1;for(const e of near(p.x,p.y,ZONE.abyss,c)){damage(e,20,p.x,p.y);e.vx+=dir*380/(e.mass||1);e.vy-=150;e.grounded=false;}},
  firestorm(c,p){for(let i=0;i<6;i++){const tx=Math.max(30,Math.min(W-30,p.x+(i-2.5)*46));app.projectiles.push({id:'meteor',x:tx-160,y:-70-i*68,vx:125,vy:275,age:-i*.12,team:c.team,owner:c.id,fuse:0,radius:44,damage:32,trail:[]});}},
  charge(c,p){const t=app.chars.find(e=>e.id===p.targetId&&e.hp>0);const tx=t?t.x:p.x,dir=Math.sign(tx-c.x)||1;const s=terrain.spot(Math.max(30,Math.min(W-30,tx-dir*46)),t?t.y:p.y,pugScale(c),c);if(s){app.fx.push({x:c.x,y:c.y-30,end:{x:s.x,y:s.y-30},life:.35,max:.35,kind:'beam',color:'#ff7a3d'});c.x=s.x;c.y=s.y;c.vx=c.vy=c.walkVX=0;c.grounded=true;c.boss.home={x:s.x,y:s.y};}explode(c.x+dir*34,c.y-16,46,34,c.team,'normal');},
  outbreak(c,p){bosses.abilities.spores(c,{...p});c.hp=Math.min(c.maxHp,c.hp+20);app.floats.push({x:c.x,y:c.y-70,life:1.8,text:'🧟 +20',color:'#b6ff6a'});},
  press(c,p){const tx=Math.max(25,Math.min(W-25,p.x));app.fx.push({x:tx,y:0,end:{x:tx,y:WATER},life:1.15,max:1.15,kind:'orbitalBeam',color:'#ff4d4d',radius:46});for(let yy=110;yy<WATER-8;yy+=40){if(terrain.solid(tx,yy)||yy>terrain.topSurface[tx|0]-30)explode(tx,yy,40,20,c.team,'super');if(yy>terrain.topSurface[tx|0]+60)break;}},
  glaze(c,p){for(let i=0;i<3;i++)app.projectiles.push({id:'sticky',x:Math.max(20,Math.min(W-20,p.x+(i-1)*38)),y:-60-i*40,vx:0,vy:180,age:-i*.15,team:c.team,owner:c.id,fuse:0,radius:50,damage:32,trail:[]});},
  bite(c,p){let healed=0;for(const e of near(p.x,p.y,ZONE.bite,c)){damage(e,22,p.x,p.y);healed+=18;app.fx.push({kind:'siphonStream',x:e.x,y:pugCY(e),end:{x:c.x,y:pugCY(c)},life:.6,max:.6});}if(healed){c.hp=Math.min(c.maxHp,c.hp+healed);app.floats.push({x:c.x,y:c.y-70,life:1.8,text:'🦇 +'+healed,color:'#ff5c8a'});}},
  thornCage(c,p){for(let i=0;i<34;i++)spawnFX(p.x+(effectsRandom()-.5)*ZONE.thornCage*2,groundY(p.x),(effectsRandom()-.5)*30,-140-effectsRandom()*120,'#5f8f3a',3.4,.9,'debris');for(const e of near(p.x,p.y,ZONE.thornCage,c)){damage(e,20,p.x,p.y);e.chilled=8.5;app.floats.push({x:e.x,y:e.y-52,life:1.5,get text(){return CS5.i18n.t("campaign.bosses.thornCage.s001")},color:'#c8ff9b'});}},
  starOrb(c,p){app.fx.push({x:c.x,y:pugCY(c)-20,end:{x:p.x,y:p.y},life:.45,max:.45,kind:'beam',color:'#9fe8ff'});app.projectiles.push({id:'chain',x:p.x,y:p.y,vx:0,vy:0,age:0,fuse:.35,team:c.team,owner:c.id,radius:58,damage:40});for(let i=0;i<24;i++)spawnFX(p.x,p.y,(effectsRandom()-.5)*90,(effectsRandom()-.5)*90,'#cfe9ff',3.5,.5,'spark');},
  nova(c,p){const tx=Math.max(25,Math.min(W-25,p.x));app.fx.push({x:tx,y:0,end:{x:tx,y:WATER},life:1.3,max:1.3,kind:'orbitalBeam',color:'#ffe9a8',radius:60});const gy=groundY(tx);app.projectiles.push({id:'chain',x:tx,y:gy,vx:0,vy:0,age:0,fuse:.25,team:c.team,owner:c.id,radius:66,damage:42});for(const e of near(tx,gy,ZONE.nova,c)){const dir=Math.sign(e.x-tx)||1;e.vx+=dir*300;e.vy-=200;e.grounded=false;}}
 }
};
CS5.bosses=bosses;
})();
