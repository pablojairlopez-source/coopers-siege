// Auditoría 5.2: planificación de campaña compartida por ambos bandos.
// Predice bazuca/granada con la salida, viento, mecha y rebotes del juego. No modifica
// terreno, personajes, inventario ni semillas. La dificultad añade error al ejecutar.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const AI={
 trajectory(c,angle,power,id='rocket',dt=STEP){
  const w=weaponOf(id),a=rad(angle),dx=c.dir*Math.cos(a),dy=-Math.sin(a),s=pugScale(c),v=170+power*6.8;
  let x=c.x+dx*24*s,y=c.y-18*s+dy*(dy>0?13:20)*s,vx=dx*v,vy=dy*v,age=0;
  const fuse=w.fuse||0;
  for(let frame=0;frame<=Math.ceil((fuse||12)/dt);frame++){
   age+=dt;if(fuse&&age>=fuse)return {x,y,hit:true};
   vy+=480*dt;vx+=app.wind*dt;
   const n=Math.max(1,Math.ceil(Math.hypot(vx,vy)*dt/3.5));
   for(let k=0;k<n;k++){
    const nx=x+vx*dt/n,ny=y+vy*dt/n;
    if(nx<-120||nx>W+120||ny>WATER+25)return {x:nx,y:ny,hit:false};
    if(!fuse&&app.chars.some(e=>e.hp>0&&(e.id!==c.id||age>.45)&&pugHit(e,nx,ny)))return {x:nx,y:ny,hit:true};
    if(terrain.solid(nx,ny)){
     if(!fuse)return {x,y,hit:true};
     const sx=terrain.solid(nx,y),sy=terrain.solid(x,ny);
     if(sx)vx*=-.58;if(sy){vy*=-.48;vx*=.74;}if(!sx&&!sy){vx*=-.5;vy*=-.5;}
    }else{x=nx;y=ny;}
   }
  }
  return {x,y,hit:false};
 },
 score(c,p,w){
  let score=0,nearest=Infinity;
  for(const e of app.chars){
   if(e.hp<=0)continue;
   const d=Math.hypot(e.x-p.x,pugCY(e)-p.y),reach=w.radius+28*pugScale(e);
   if(e.team!==c.team)nearest=Math.min(nearest,d);
   if(!p.hit||d>=reach)continue;
   const damage=Math.min(e.hp,w.damage*(.22+.78*(1-d/reach)));
   score+=e.team===c.team?-damage*1.8:damage+(damage>=e.hp?8:0);
  }
  return score-Math.min(nearest,2000)*.008-(p.hit?0:35);
 },
 shot(c,fast=false){
  let best={score:-Infinity,angle:45,power:60,weapon:'rocket',dir:c.dir};
  const dirs=[...new Set(app.chars.filter(e=>e.hp>0&&e.team!==c.team).map(e=>e.x>=c.x?1:-1))];
  for(const dir of dirs){
   const from={...c,dir};
   for(const id of ['rocket','grenade']){
    const w=weaponOf(id);if(!CS5.arsenal.canFire(app.teams[c.team],id))continue;
    for(let angle=-70;angle<=85;angle+=fast?25:15)for(let power=24;power<=100;power+=fast?25:15){
     const p=this.trajectory(from,angle,power,id),score=this.score(c,p,w);
     if(score>best.score)best={score,angle,power,weapon:id,dir};
    }
   }
  }
  if(!fast){
   const center={...best},from={...c,dir:best.dir},w=weaponOf(best.weapon);
   for(let da=-10;da<=10;da+=5)for(let dp=-10;dp<=10;dp+=5){
    const angle=clamp(center.angle+da,-85,88),power=clamp(center.power+dp,15,100);
    const score=this.score(c,this.trajectory(from,angle,power,w.id),w);
    if(score>best.score)best={score,angle,power,weapon:w.id,dir:center.dir};
   }
  }
  return best;
 },
 // Ensaya caminar y saltar con la física real sobre una copia, sin efectos de combate.
 // Se descartan agua, caída dañina, minas y caminos que no dejan apoyo al terminar.
 route(c,target){
  let best=null;
  const initial=Math.hypot(target.x-c.x,target.y-c.y);
  for(const dir of [Math.sign(target.x-c.x)||1,-(Math.sign(target.x-c.x)||1)]){
   const ghost={...c,boss:null,poisoned:0,hp:100},jumps=[];let lastJump=-1,previous=ghost.x;
   for(let k=0;k<90;k++){
    const time=k/30;
    const floor=terrain.surface(ghost.x+dir*28,ghost.y-12,true,pugScale(c));
    const blocked=k>2&&Math.abs(ghost.x-previous)<1;
    const jump=ghost.grounded&&time-lastJump>.65&&(blocked||!floor||floor.y-ghost.y>24);
    if(jump){lastJump=time;jumps.push(time);}
    previous=ghost.x;characterPhysics(ghost,1/30,dir,jump,true);
    if(ghost.hp<100||ghost.y>WATER-24||app.mines.some(m=>!m.dead&&Math.hypot(m.x-ghost.x,m.y-ghost.y)<65))break;
    if(k<14||!ghost.grounded||Math.abs(ghost.x-c.x)<24)continue;
    const progress=initial-Math.hypot(target.x-ghost.x,target.y-ghost.y);
    const score=progress+Math.max(0,c.y-ghost.y)*.7;
    if(score>12&&(!best||score>best.score))best={score,x:ghost.x,y:ghost.y,dir,time:(k+1)/30,jumps:jumps.slice()};
   }
  }
  return best;
 },
 plan(c,noDetour=false){
  const enemies=app.chars.filter(e=>e.hp>0&&e.team!==c.team);if(!enemies.length)return;
  const target=enemies.reduce((a,b)=>dist(c,a)<dist(c,b)?a:b),team=app.teams[c.team];
  const best=this.shot(c);c.dir=best.dir;
  let weapon=best.weapon,angle=best.angle,power=best.power,score=best.score;
  // Armas directas: valorar solo rivales realmente visibles; no gastar escopeta contra roca.
  const visible=enemies.filter(e=>aiLineOfSight(c,e)).sort((a,b)=>dist(c,a)-dist(c,b)),direct=visible[0];
  if(direct){
   const d=dist(c,direct),dir=direct.x>=c.x?1:-1;
   if(d<62+20*(pugScale(direct)-1)&&score<30){weapon='bat';angle=aiDirectAngle(c,direct);c.dir=dir;score=30;}
   if(d<300&&CS5.arsenal.canFire(team,'shotgun')&&(score<32||app.shotCount===1)){weapon='shotgun';angle=aiDirectAngle(c,direct);c.dir=dir;score=32;}
  }
  // Los premios siguen usando el inventario normal y las preferencias del jefe.
  const preferred=aiChooseWeapon(c,target,team,app.difficulty,{score:best.score});
  if(app.shotCount===1){const aim=direct||target;weapon='shotgun';c.dir=aim.x>=c.x?1:-1;angle=aiDirectAngle(c,aim);}
  else if(['medkit','shield'].includes(preferred))weapon=preferred;
  else if(['sniper','flame'].includes(preferred)&&aiLineOfSight(c,target)){
   weapon=preferred;c.dir=target.x>=c.x?1:-1;angle=aiDirectAngle(c,target);
  }else if(['airstrike','meteor','orbital','homing'].includes(preferred))weapon=preferred;
  else if(['super','drill','acid','salvo','cluster','sticky'].includes(preferred)&&best.weapon==='rocket'&&best.score>8)weapon=preferred;
  else if(['ice','holy','banana'].includes(preferred)){
   const w=weaponOf(preferred),predicted=this.trajectory(c,best.angle,best.power,preferred);
   if(this.score(c,predicted,w)>8)weapon=preferred;
  }else if(['tesla','vampire','saw','blackhole'].includes(preferred)&&aiLineOfSight(c,target)&&dist(c,target)>150){
   weapon=preferred;c.dir=target.x>=c.x?1:-1;angle=aiDirectAngle(c,target);
  }
  const error=(app.difficulty==='easy'?10:app.difficulty==='hard'?1.2:4.5)*(c.boss?.aimError??1);
  const plan={weapon,angle:wrapAngle360(angle+(random()-.5)*error*2*(['bat','shotgun','sniper','flame'].includes(weapon)?.3:1)),power:clamp(power+(random()-.5)*error*2,15,100),target:{x:target.x,y:pugCY(target)},enemy:target.id,score};
  if(!noDetour){
   const detour=CS5.supply.botDetour(c);
   if(detour){plan.walkTo=detour.x;plan.walkTime=detour.time;plan.supplyId=detour.id;}
   else if(best.score<12||dist(c,target)>600){
    const route=this.route(c,target);
    if(route){plan.walkTo=route.x;plan.walkTime=route.time;plan.route=route;}
   }
  }
  if(c.boss)plan.boss=true;
  app.aiPlan=plan;
 }
};
CS5.campaignAI=AI;
})();
