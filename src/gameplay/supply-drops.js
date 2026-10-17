// Cooper's Siege 5.2 — Huesitos: suministros que caen del cielo.
// · Aparición determinista: cada 2–4 rondas (según `CS5.supplyConfig`), columna elegida con
//   una semilla derivada de la partida y de la ronda (idéntica en ambos equipos LAN).
// · Física: paracaídas (caída lenta con deriva de viento), gravedad sin paracaídas, colisión
//   con el terreno, nunca dentro de la roca; si el suelo se destruye vuelven a caer; en el agua
//   se pierden; una explosión cercana los lanza por los aires.
// · Recogida en vuelo o en el suelo por cualquier pug vivo. La recogida y el premio los decide
//   la autoridad (partida local, anfitrión LAN); el premio se sortea con una semilla propia del
//   huesito (categoría → arma → cantidad, re-sorteo si supera el tope del equipo).
// · Un identificador solo se puede canjear una vez (`app.supplyState.picked`).
// · Lo cosmético (brillos, polvo, balanceo) usa effectsRandom y nunca afecta al combate.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const cfg=()=>CS5.supplyConfig;
const hashSeed=(a,b)=>{let h=(a^Math.imul(b|0,0x9E3779B1))>>>0;h=Math.imul(h^(h>>>16),0x85EBCA6B)>>>0;h=Math.imul(h^(h>>>13),0xC2B2AE35)>>>0;return (h^(h>>>16))>>>0;};
const rangeInt=(R,[a,b])=>a+Math.floor(R()*(b-a+1));

const supply={
 // Llamado por newMatch tras reiniciar la partida.
 reset(matchSeed,mode='normal'){
  const freq=cfg().frequency[mode]===undefined?cfg().frequency.normal:cfg().frequency[mode];
  const R=rng(hashSeed(matchSeed>>>0,0x5100));
  app.supplies=[];
  app.supplyState={mode:freq?mode:'off',next:freq?rangeInt(R,freq.first):Infinity,seq:0,lastRound:-1,picked:[],spawned:0};
 },
 enabled(){return !!app.supplyState&&app.supplyState.mode!=='off';},
 // Solo la autoridad detecta recogidas y sortea premios. En LAN versus es el anfitrión;
 // en cooperativo el invitado no simula (recibe `app.supplies` en la instantánea).
 authority(){return !(app.mode==='lan'&&!isLanCoop()&&lanNet.connected&&lanNet.role==='client');},
 active(){return (app.supplies||[]).filter(s=>s.state==='fall'||s.state==='ground');},
 // Llamado al final de nextTurn (ambos lados LAN versus, de forma determinista).
 onTurn(){
  const st=app.supplyState;if(!st||st.lastRound===app.round)return;
  st.lastRound=app.round;
  for(const s of app.supplies)if(s.state==='ground'&&app.round-s.landRound>=cfg().lifetimeRounds){s.state='expiring';s.fade=0;audio.sound('supplyExpire',1,{x:s.x,y:s.y});}
  if(!this.enabled()||app.round<st.next)return;
  const freq=cfg().frequency[st.mode],R=rng(hashSeed(seed>>>0,app.round*7919+st.seq*104729+17));
  st.next=app.round+rangeInt(R,freq.every);
  if(this.active().length>=cfg().maxActive)return;
  this.spawn(R);
 },
 spawn(R){
  const st=app.supplyState,id=++st.seq;
  let x=W/2,ok=false;
  for(let k=0;k<16&&!ok;k++){
   x=Math.round(70+R()*(W-140));
   const top=terrain.topSurface?terrain.topSurface[x]:0;
   ok=top>40&&top<WATER-10&&app.supplies.every(s=>s.state==='gone'||Math.abs(s.x-x)>140);
  }
  const s={id,x,y:-46,vx:0,vy:cfg().fallSpeed,state:'fall',chute:true,age:0,landRound:-1,fade:0,sway:R()*6.28};
  app.supplies.push(s);st.spawned++;
  audio.sound('supplyDrop',1,{x:s.x,y:120});
  if(app.phase!=='menu')toast('🦴 ¡Un huesito cae del cielo! Recógelo con cualquier pug.',2.6);
  return s;
 },
 // Física de todos los huesitos (paso fijo de la simulación).
 step(dt){
  if(!app.supplies||!app.supplies.length)return;
  const c=cfg();
  for(const s of app.supplies){
   if(s.state==='gone'||s.state==='picked')continue;
   s.age+=dt;
   if(s.state==='expiring'){s.fade+=dt;if(s.fade>=1)s.state='gone';continue;}
   if(s.state==='ground'){
    // El suelo desapareció: vuelve a caer (sin paracaídas).
    if(!terrain.solid(s.x,s.y+2)&&!terrain.solid(s.x-6,s.y+2)&&!terrain.solid(s.x+6,s.y+2)){s.state='fall';s.chute=false;s.vy=0;s.vx=0;}
    else{let g=0;while(terrain.solid(s.x,s.y)&&g++<40)s.y-=1;}
   }
   if(s.state==='fall'){
    if(s.chute){s.vy+=(c.fallSpeed-s.vy)*Math.min(1,dt*3);s.vx+=(app.wind*c.drift-s.vx)*Math.min(1,dt*2);}
    else{s.vy=Math.min(600,s.vy+c.gravity*dt);s.vx*=Math.pow(.6,dt);}
    const n=Math.max(1,Math.ceil(Math.abs(s.vy*dt)/3));
    for(let i=0;i<n;i++){
     const nx=Math.max(20,Math.min(W-20,s.x+s.vx*dt/n)),ny=s.y+s.vy*dt/n;
     if(ny>0&&terrain.solid(nx,ny+1)){
      s.x=nx;s.y=ny;let g=0;while(terrain.solid(s.x,s.y)&&g++<60)s.y-=1;
      const hard=s.vy>160;s.state='ground';s.vx=0;s.vy=0;s.chute=false;s.landRound=app.round;
      audio.sound('supplyLand',hard?1.4:1,{x:s.x,y:s.y});
      for(let k=0;k<10;k++)spawnFX(s.x,s.y,(effectsRandom()-.5)*90,-20-effectsRandom()*50,terrain.map.soil?.[k%2]||'#c8a070',2.5,.6,'debris');
      break;
     }
     s.x=nx;s.y=ny;
    }
    if(s.y>WATER){s.state='gone';audio.sound('splash',.6,{x:s.x,y:WATER});addWaterRipple?.(s.x,.7);continue;}
   }
   if(this.authority()&&app.phase!=='menu'&&app.phase!=='over'){
    for(const ch of app.chars){
     if(ch.hp<=0)continue;
     const r=c.pickupRadius*pugScale(ch)+(s.state==='fall'?6:0);
     if(Math.hypot(ch.x-s.x,pugCY(ch)-(s.y-8))<r){this.pick(s,ch);break;}
    }
   }
  }
  if(app.supplies.some(s=>s.state==='gone'||s.state==='picked'))app.supplies=app.supplies.filter(s=>s.state!=='gone'&&s.state!=='picked');
 },
 // Explosión cercana: el huesito sale despedido (determinista: solo depende de los argumentos).
 onExplosion(x,y,r){
  for(const s of app.supplies||[]){
   if(s.state!=='ground'&&s.state!=='fall')continue;
   const dx=s.x-x,dy=s.y-8-y,d=Math.hypot(dx,dy),reach=r+18;
   if(d>=reach)continue;
   const f=1-d/reach,len=Math.max(8,d);
   s.state='fall';s.chute=false;s.vx=dx/len*150*f;s.vy=-120-160*f;
  }
 },
 // Sorteo autoritativo: categoría → arma → cantidad; re-sorteo si supera el tope del equipo.
 roll(team,id){
  const c=cfg(),R=rng(hashSeed((seed>>>0)^0xB0E5,id*2654435761));
  for(let attempt=0;attempt<=c.rerolls;attempt++){
   let pick=R()*100,cat=c.categories[c.categories.length-1];
   for(const k of c.categories){pick-=k.chance;if(pick<0){cat=k;break;}}
   const entries=Object.entries(cat.items),[weapon,range]=entries[Math.floor(R()*entries.length)],qty=rangeInt(R,range);
   if(CS5.arsenal.count(team,weapon)+qty<=(c.caps[weapon]??Infinity))return {weapon,qty,cat:cat.id,attempts:attempt+1};
  }
  // Respaldo determinista: la primera común que aún admita una carga.
  for(const [weapon] of Object.entries(c.categories[0].items))if(CS5.arsenal.count(team,weapon)+1<=(c.caps[weapon]??Infinity))return {weapon,qty:1,cat:'common',attempts:c.rerolls+2};
  return {weapon:null,qty:0,cat:'common',heal:c.fallbackHeal,attempts:c.rerolls+2};
 },
 pick(s,ch){
  if(s.state==='picked'||s.state==='gone')return null;
  const team=app.teams[ch.team],r=this.roll(team,s.id);
  const msg={type:'supply_pick',id:s.id,team:ch.team,charId:ch.id,weapon:r.weapon,qty:r.qty,cat:r.cat,heal:r.heal||0};
  this.apply(msg);
  if(app.mode==='lan'&&!isLanCoop()&&lanNet.connected&&lanNet.role==='host')lanNet.send(msg);
  return msg;
 },
 // Aplica un canje (local o recibido del anfitrión). Idempotente por identificador.
 apply(msg){
  const st=app.supplyState;if(!st||st.picked.includes(msg.id))return false;
  st.picked.push(msg.id);
  const s=app.supplies.find(o=>o.id===msg.id),team=app.teams[msg.team],ch=app.chars.find(o=>o.id===msg.charId);
  if(s){s.state='picked';app.supplies=app.supplies.filter(o=>o!==s);}
  if(!team)return false;
  const px=ch?ch.x:(s?s.x:0),py=ch?ch.y:(s?s.y:0),cat=cfg().categories.find(k=>k.id===msg.cat)||cfg().categories[0];
  if(msg.weapon){
   CS5.arsenal.grant(team,msg.weapon,msg.qty);
   team.fresh=[...new Set([...(team.fresh||[]),msg.weapon])];
   const w=weaponOf(msg.weapon);
   app.floats.push({x:px,y:py-58,life:2.4,text:w.icon+' '+w.name+' ×'+msg.qty,color:cat.color});
   toast('🦴 '+team.name+' abre un huesito '+cat.name.toLowerCase()+': '+w.icon+' '+w.name+' ×'+msg.qty+'.',3.2);
  }else if(ch&&msg.heal){
   ch.hp=Math.min(ch.maxHp||100,ch.hp+msg.heal);
   app.floats.push({x:px,y:py-58,life:2.2,text:'🦴 +'+msg.heal+' HP',color:'#9bffd3'});
   toast('🦴 Arsenal lleno: el huesito era una galleta curativa (+'+msg.heal+').',3);
  }
  audio.sound('pickup',cat.id==='legendary'?3:cat.id==='power'?2:1,{x:px,y:py});
  const R=effectsRandom;
  for(let i=0;i<(cat.id==='legendary'?46:26);i++)spawnFX(px,py-20,(R()-.5)*190,-40-R()*170,i%3?cat.color:'#fff4d6',2.2+R()*2.4,.7+R()*.7,'spark');
  if(typeof updateInventory==='function')updateInventory();
  if(typeof updateHUD==='function')updateHUD();
  return true;
 },
 // IA: huesito cercano, alcanzable a pie y seguro. Devuelve {x,time,id} o null. No mira el contenido.
 botDetour(c){
  if(!app.supplies)return null;
  let best=null;
  for(const s of app.supplies){
   if(s.state!=='ground'&&!(s.state==='fall'&&s.y>c.y-70))continue;
   const dx=s.x-c.x,ad=Math.abs(dx);
   if(ad<6||ad>260||Math.abs(s.y-c.y)>36)continue;
   if(app.mines.some(m=>!m.dead&&Math.hypot(m.x-s.x,m.y-s.y)<75))continue;
   if(app.projectiles.some(p=>!p.dead&&Math.hypot(p.x-s.x,p.y-s.y)<160))continue;
   if(s.y>WATER-30)continue;
   // Camino transitable: sin saltos de más de 10 px ni huecos hacia el agua.
   let prev=c.y,walk=true;
   for(let x=c.x;Math.abs(x-s.x)>4;x+=Math.sign(dx)*8){
    const f=terrain.surface(x,prev-40);
    if(!f||Math.abs(f.y-prev)>10||f.y>WATER-26){walk=false;break;}
    prev=f.y;
   }
   if(!walk)continue;
   const time=Math.min(2.6,ad/112+.3);
   if(!best||time<best.time)best={x:s.x,time,id:s.id};
  }
  return best;
 },
 // Dibujo en el lienzo 2D, en coordenadas del mundo.
 draw(c,time){
  for(const s of app.supplies||[]){
   if(s.state==='gone'||s.state==='picked')continue;
   const fade=s.state==='expiring'?Math.max(0,1-s.fade):1,sway=s.chute?Math.sin(time*2.2+s.sway)*.16:0;
   c.save();c.globalAlpha=fade;c.translate(s.x,s.y-12);c.rotate(sway);c.scale(1.3,1.3);
   if(s.chute){
    c.strokeStyle='#fff3dccc';c.lineWidth=1.1;
    for(const k of [-1,-.35,.35,1]){c.beginPath();c.moveTo(k*7,-4);c.lineTo(k*26,-46);c.stroke();}
    for(let i=0;i<6;i++){c.fillStyle=i%2?'#fff6e6':'#ff6b6b';c.beginPath();c.moveTo(0,-46);c.arc(0,-46,28,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6);c.closePath();c.fill();}
    c.strokeStyle='#7a3b3b';c.lineWidth=1.4;c.beginPath();c.arc(0,-46,28,Math.PI,0);c.stroke();
   }
   const glow=.5+.5*Math.sin(time*5+s.id);
   c.shadowColor='#fff2b0';c.shadowBlur=8+glow*10;
   // Hueso: dos nudos por extremo y una caña con lazo.
   c.fillStyle='#f6ead0';c.strokeStyle='#6b4a2b';c.lineWidth=2;
   const bone=()=>{c.beginPath();c.roundRect?c.roundRect(-11,-4.5,22,9,3):c.rect(-11,-4.5,22,9);for(const [x,y] of [[-12,-4.5],[-12,4.5],[12,-4.5],[12,4.5]]){c.moveTo(x+5.5,y);c.arc(x,y,5.5,0,Math.PI*2);}};
   bone();c.fill();c.shadowBlur=0;bone();c.stroke();
   c.fillStyle='#ff5f7a';c.beginPath();c.moveTo(-3,-4.5);c.lineTo(3,4.5);c.lineTo(-3,4.5);c.lineTo(3,-4.5);c.closePath();c.fill();
   c.fillStyle='#ffe28a';c.font='bold 9px system-ui,sans-serif';c.textAlign='center';c.fillText('?',0,-11-glow*2);
   c.restore();
   if(s.state==='ground'&&fade>0){c.save();c.globalAlpha=.22*fade;c.fillStyle='#000';c.beginPath();c.ellipse(s.x,s.y+1,15,3.5,0,0,Math.PI*2);c.fill();c.restore();}
  }
 },
 drawMinimap(c,sx,sy){
  for(const s of app.supplies||[]){if(s.state!=='fall'&&s.state!=='ground')continue;c.fillStyle='#fff2b0';c.fillRect(s.x*sx-2,Math.max(1,s.y)*sy-2,4,4);}
 }
};
CS5.supply=supply;
})();
