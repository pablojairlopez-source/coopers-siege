// Cooper's Siege 5.0 — Animación procedural y expresiones de los pugs.
// Todo lo que calcula este módulo es puramente visual (campos `_anim`): nunca
// modifica posición, velocidad, vida ni colisiones, así que no afecta a la
// simulación ni a la sincronización LAN.
//
// · Rebote de panza: muelle amortiguado (squash & stretch) que reacciona a
//   aterrizajes, golpes, retrocesos de disparo y saltos.
// · Balanceo lateral con inercia ante impactos según su dirección.
// · Mirada: las pupilas siguen al proyectil en vuelo, al pug activo o la
//   dirección de puntería; movimientos sacádicos en reposo.
// · Parpadeo natural con intervalos aleatorios por pug.
// · Expresiones: reposo, concentración, carga, sorpresa, miedo, dolor,
//   aturdimiento, alegría, tristeza y sueño.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function hash(n){n=Math.imul(n^0x5bd1e995,0x27d4eb2d);n^=n>>>15;return (n>>>0)/4294967296;}

const EXPRESSIONS={
 // lid: apertura del párpado (1 abierto) · pupil: tamaño · brow: inclinación (− enfadado, + preocupado) · browLift: subida de cejas
 // mouth: apertura de boca · tongue · happy: ojos «^^» · cross: ojos «×» · tear · sweat · blush · shake
 idle:     {lid:1,   pupil:1,   brow:0,    browLift:0,   mouth:0,   tongue:.4},
 focus:    {lid:.72, pupil:.95, brow:-.38, browLift:-.4, mouth:0,   tongue:0},
 charge:   {lid:.6,  pupil:.9,  brow:-.6,  browLift:-.6, mouth:.25, tongue:0, teeth:1},
 surprise: {lid:1.25,pupil:.62, brow:.5,   browLift:.9,  mouth:.7,  tongue:0},
 fear:     {lid:1.15,pupil:.55, brow:.75,  browLift:.7,  mouth:.45, tongue:0, sweat:1, shake:1},
 pain:     {lid:.08, pupil:1,   brow:.6,   browLift:-.2, mouth:.8,  tongue:.2, cross:1},
 dizzy:    {lid:.85, pupil:.8,  brow:.3,   browLift:.2,  mouth:.35, tongue:.8, spiral:1},
 joy:      {lid:1,   pupil:1,   brow:.2,   browLift:.5,  mouth:.9,  tongue:1, happy:1, blush:1},
 sad:      {lid:.55, pupil:1.1, brow:.9,   browLift:.3,  mouth:.1,  tongue:0, tear:1},
 sleepy:   {lid:.32, pupil:1,   brow:.15,  browLift:-.1, mouth:.15, tongue:.3}
};

function anim(c){return c._anim||(c._anim={jig:0,jigV:0,roll:0,rollV:0,lookX:0,lookY:0,nextBlink:0,blinkT:-1,expr:'idle',exprSince:0,mix:{...EXPRESSIONS.idle},prevVy:0,prevGrounded:true,prevHp:c.hp,prevRecoil:0,saccade:0,seed:hash((c.id||0)+1)});}

// Impulsos desde la jugabilidad (se llaman desde damage/explode/shoot).
CS5.pugAnim={
 EXPRESSIONS,
 hit(c,amount,x,y){const a=anim(c),dir=Math.sign((c.x||0)-(x??c.x))||(Math.random()<.5?-1:1);a.jigV+=Math.min(9,2+amount*.12);a.rollV+=dir*Math.min(7,1.5+amount*.09);a.hitAt=performance.now()/1000;a.heavy=amount>=28;},
 nearExplosion(c,dist,radius){if(c.hp<=0)return;const a=anim(c);if(dist<radius*3.2){a.surpriseAt=performance.now()/1000;a.jigV+=1.4*(1-dist/(radius*3.2));}},
 recoil(c){const a=anim(c);a.jigV-=2.2;a.rollV-=(c.dir||1)*1.2;},
 // Un compañero cae: tristeza breve en los aliados que siguen vivos.
 grief(list,dead){for(const c of list)if(c!==dead&&c.hp>0&&c.team===dead.team)anim(c).griefAt=performance.now()/1000;},

 // Avanza resortes, mirada, parpadeo y expresión. dt en segundos de render.
 // La mirada se expresa en ejes de pantalla: con la vista 3/4 el eje x local del
 // cuerpo apunta hacia la derecha de la pantalla en ambas orientaciones.
 frame(list,time,dt,ctx){
  dt=clamp(dt||1/60,1/240,.1);
  for(const c of list){
   if(!c||c.hp<=0)continue;
   const a=anim(c);
   // --- Muelle de panza (squash & stretch) -----------------------------------
   if(!a.prevGrounded&&c.grounded){a.jigV+=clamp(Math.abs(a.prevVy)*.012,.6,7);}
   if(a.prevGrounded&&!c.grounded&&(c.vy||0)<-60)a.jigV-=2.4;
   if((c.recoilTimer||0)>a.prevRecoil+.1)CS5.pugAnim.recoil(c);
   // Reacción al recibir el turno: pequeño salto de «¡me toca!».
   const isActiveNow=c===ctx.active;if(isActiveNow&&!a.wasActive)a.jigV+=2.8;a.wasActive=isActiveNow;
   a.prevRecoil=c.recoilTimer||0;a.prevGrounded=!!c.grounded;a.prevVy=c.vy||0;
   a.jigV+=(-180*a.jig-9*a.jigV)*dt;a.jig=clamp(a.jig+a.jigV*dt,-.32,.38);
   a.rollV+=(-120*a.roll-7*a.rollV)*dt;a.roll=clamp(a.roll+a.rollV*dt,-.6,.6);
   // --- Expresión --------------------------------------------------------------
   const now=performance.now()/1000;
   let expr='idle';
   const pose=c.previewPose;
   if(pose&&pose!=='auto'){expr={aim:'focus',celebrate:'joy',hurt:'pain',scared:'fear',sad:'sad',dizzy:'dizzy',sleepy:'sleepy'}[pose]||'idle';}
   else{
    const isActive=c===ctx.active,celebrating=ctx.celebrating&&ctx.celebrating(c);
    const lost=ctx.phase==='over'&&ctx.winner&&c.team!==ctx.winner.id;
    const danger=ctx.danger?ctx.danger(c):0;
    if(c.hurt>0)expr='pain';
    else if(a.heavy&&now-(a.hitAt||0)<1.6)expr='dizzy';
    else if(celebrating)expr='joy';
    else if(lost)expr='sad';
    else if(now-(a.surpriseAt||-9)<.9)expr='surprise';
    else if(now-(a.griefAt||-9)<2.2)expr='sad';
    else if(danger>.35||(c.hp<30&&!isActive))expr='fear';
    else if(isActive&&ctx.charging)expr='charge';
    else if(isActive&&ctx.phase==='aim')expr='focus';
    else if(!isActive&&ctx.phase==='aim'&&((time*.07+a.seed*5)%6)<1.1)expr='sleepy';
   }
   if(expr!==a.expr){a.expr=expr;a.exprSince=now;}
   const target=EXPRESSIONS[expr],k=1-Math.pow(.0008,dt);
   for(const key of ['lid','pupil','brow','browLift','mouth','tongue','happy','cross','tear','sweat','blush','shake','spiral','teeth'])a.mix[key]=lerp(a.mix[key]||0,target[key]||0,k);
   // --- Parpadeo natural ------------------------------------------------------
   if(time>=a.nextBlink&&a.blinkT<0){a.blinkT=0;}
   if(a.blinkT>=0){a.blinkT+=dt;if(a.blinkT>.16){a.blinkT=-1;a.nextBlink=time+1.6+hash(Math.floor(time*3)+(c.id||0)*97)*4.2;}}
   const blink=a.blinkT>=0?Math.sin(a.blinkT/.16*Math.PI):0;
   a.lid=clamp(a.mix.lid*(1-blink),0,1.3);
   // --- Mirada ------------------------------------------------------------------
   let tx=0,ty=0;
   const look=ctx.lookTarget&&ctx.lookTarget(c);
   if(look){const dx=look.x-c.x,dy=look.y-(c.y-14),d=Math.hypot(dx,dy)||1;tx=dx/d*.9;ty=dy/d*.7;}
   else{if(time>a.saccade){a.saccade=time+.8+hash(Math.floor(time*2)+(c.id||0)*31)*2.4;a.sx=(hash(Math.floor(time*5)+(c.id||0))-.5)*1.2;a.sy=(hash(Math.floor(time*7)+(c.id||0)*3)-.5)*.6;}tx=a.sx||0;ty=a.sy||0;}
   a.lookX=lerp(a.lookX,clamp(tx,-1,1),1-Math.pow(.0001,dt));a.lookY=lerp(a.lookY,clamp(ty,-1,1),1-Math.pow(.0001,dt));
   // Firma compacta para las cachés de malla (solo cambia cuando cambia la cara).
   a.sig=expr+(Math.round(a.lid*5))+','+Math.round(a.lookX*4)+','+Math.round(a.lookY*3)+','+Math.round(a.jig*20)+','+Math.round(a.roll*20)+','+Math.round(a.mix.mouth*4);
  }
 },
 get:anim
};
})();
