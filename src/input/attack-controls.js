// Cooper's Siege 5.1 — máquina de estados del ataque, común a PC y smartphone.
//
//   idle ──ATACAR (botón, F o Enter)──▶ aiming ──mantener ESPACIO / F / Enter / ATACAR──▶ charging
//    ▲                                   │  ▲                                                │
//    └──── Esc · clic derecho · ✕ ───────┘  └── pointercancel (sin disparar) ───────────────┤
//    ◀──────────────────── soltar la misma tecla o el mismo dedo: dispara una sola vez ─────┘
//
// - En idle, ESPACIO y el botón SALTAR saltan. En aiming/charging nunca saltan.
// - El primer toque de ATACAR solo entra en aiming: nunca dispara.
// - Cancelar no llama a shoot(): no se gasta munición ni turno.
// - Solo cambia app.angle, app.power y app.charging, igual que antes: el disparo sigue
//   pasando por shoot() y la autoridad LAN no cambia (el anfitrión decide).
// Script clásico: usa app, canAct, human, shoot… solo en tiempo de ejecución.
(function(){
 const CS5=window.CS5=window.CS5||{};
 const A={state:'idle',source:null,firePointer:null,padPointer:null,lastJump:0,
  fireStartY:0,fireStartAngle:0,padStartY:0,padStartAngle:0,events:[]};
 const ok=()=>canAct()&&human();
 const note=e=>{A.events.push(e);if(A.events.length>40)A.events.shift();};
 const stopCharge=()=>{if(!app.charging)return;app.charging=false;app.chargePeakFlash=0;audio.stopChargeTone?.();};
 function sync(){
  app.aimMode=A.state!=='idle';
  document.body.dataset.attack=A.state;
  updateHUD();
 }
 A.isActive=()=>A.state!=='idle';
 // Sin efectos secundarios visibles: lo usan setPhase, el cambio de turno, la pausa y blur.
 A.reset=()=>{
  if(A.state==='idle'&&!app.charging&&A.firePointer===null)return;
  A.state='idle';A.source=null;A.firePointer=null;A.padPointer=null;stopCharge();
  app.aimMode=false;document.body.dataset.attack='idle';
 };
 A.enter=()=>{
  ensureAimPhase();
  if(!ok())return false;
  if(A.state!=='idle')return true;
  A.state='aiming';note('aim');audio.init();
  const w=weaponOf();
  if(w.target&&!app.target)toast(()=>CS5.i18n.t("input.attack-controls.enter.s001"),2.8);
  sync();return true;
 };
 A.cancel=()=>{
  if(A.state==='idle')return false;
  A.state='idle';A.source=null;A.firePointer=null;stopCharge();note('cancel');
  sync();toast(()=>CS5.i18n.t("input.attack-controls.cancel.s001"),1.5);return true;
 };
 A.beginCharge=src=>{
  if(!ok()||A.state!=='aiming')return false;
  A.state='charging';A.source=src;note('charge:'+src);
  if(weaponOf().charge){app.power=15;app.chargeDir=1;app.chargeSpeed=58;app.chargePeakFlash=0;app.charging=true;}
  sync();return true;
 };
 // Interrupción ajena (pointercancel, pérdida de captura): vuelve a apuntar sin disparar.
 A.abortCharge=src=>{
  if(A.state!=='charging'||A.source!==src)return false;
  A.state='aiming';A.source=null;stopCharge();note('abort');sync();return true;
 };
 A.release=src=>{
  if(A.state!=='charging'||A.source!==src)return false;
  A.state='idle';A.source=null;stopCharge();
  if(!ok()){sync();return false;}
  const w=weaponOf();
  if(w.target&&!app.target){A.state='aiming';sync();toast(()=>CS5.i18n.t("input.attack-controls.release.s001"),2.4);return false;}
  const fired=shoot();note(fired?'shot':'blocked');
  if(!fired&&canAct())A.state='aiming';
  sync();return fired;
 };
 // Salto: solo fuera del ataque y como mucho uno cada 180 ms (un toque = un salto).
 A.jump=()=>{
  ensureAimPhase();
  if(A.state!=='idle'||!canMove()||!human())return false;
  const now=performance.now();if(now-A.lastJump<180)return false;
  A.lastJump=now;input.keys.add('jump');note('jump');
  if(touchPlay.edgeVisual)touchPlay.edgeVisual.jump=0.38;
  return true;
 };
 // Elevación relativa a la orientación del pug: subir/bajar sin cruzar la vertical,
 // dentro de [-85°, 90°] en el hemisferio al que apunta. Solo cambia app.angle (LAN seguro).
 A.nudgeAngle=delta=>{
  const a=wrapAngle360(app.angle),front=a<=90||a>=270;
  let e=front?(a>180?a-360:a):180-a;
  e=Math.max(-85,Math.min(90,e+delta));
  app.angle=wrapAngle360(front?e:180-e);
 };
 // Teclado. Devuelve true si la tecla quedó consumida.
 A.keyDown=(k,repeat)=>{
  if(k===' '){
   if(repeat)return true;
   if(A.state==='aiming')A.beginCharge('space');
   else if(A.state==='idle')A.jump();
   return true;
  }
  if(k==='f'||k==='enter'){
   if(repeat)return true;
   if(A.state==='idle')A.enter();
   else if(A.state==='aiming')A.beginCharge('key');
   return true;
  }
  return false;
 };
 A.keyUp=k=>{
  if(k===' ')return A.release('space');
  if(k==='f'||k==='enter')return A.release('key');
  return false;
 };

 function bindHold(el,down,up){
  el.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();markTouch(e);down(e);});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,e=>up(e,ev));
 }
 A.setup=()=>{
  const fire=$('fireButton');
  bindHold(fire,e=>{
   ensureAimPhase();
   if(!ok())return;
   if(A.firePointer!==null)return; // un segundo dedo sobre ATACAR no cuenta
   if(A.state==='idle'){A.enter();return;} // primer toque: solo apuntar
   if(A.state==='aiming'){
    try{fire.setPointerCapture(e.pointerId);}catch{}
    A.firePointer=e.pointerId;A.fireStartY=e.clientY;A.fireStartAngle=app.angle;
    A.beginCharge('ptr:'+e.pointerId);
   }
  },(e,ev)=>{
   if(e.pointerId!==A.firePointer)return;
   A.firePointer=null;
   if(ev==='pointerup')A.release('ptr:'+e.pointerId);
   else A.abortCharge('ptr:'+e.pointerId);
  });
  // Mientras se carga, deslizar el dedo arriba/abajo sobre ATACAR afina el ángulo.
  fire.addEventListener('pointermove',e=>{
   if(e.pointerId!==A.firePointer||!ok())return;
   e.preventDefault();
   const dy=e.clientY-A.fireStartY;
   if(Math.abs(dy)>8){app.angle=A.fireStartAngle;A.nudgeAngle(-dy*0.45);updateHUD();}
  });
  // Por si la captura falla: soltar fuera del botón también dispara (una vez).
  window.addEventListener('pointerup',e=>{if(e.pointerId===A.firePointer){A.firePointer=null;A.release('ptr:'+e.pointerId);}});

  const jump=$('touchJump');
  if(jump)bindHold(jump,()=>{if(A.jump())jump.classList.add('pressed');},()=>jump.classList.remove('pressed'));

  const cancel=$('aimCancel');
  if(cancel)bindHold(cancel,()=>A.cancel(),()=>{});

  const pad=$('aimPad');
  if(pad){
   bindHold(pad,e=>{
    if(!ok()||A.state==='idle')return;
    try{pad.setPointerCapture(e.pointerId);}catch{}
    A.padPointer=e.pointerId;A.padStartY=e.clientY;A.padStartAngle=app.angle;pad.classList.add('pressed');
   },e=>{if(e.pointerId===A.padPointer){A.padPointer=null;pad.classList.remove('pressed');}});
   pad.addEventListener('pointermove',e=>{
    if(e.pointerId!==A.padPointer||!ok())return;
    e.preventDefault();
    app.angle=A.padStartAngle;A.nudgeAngle(-(e.clientY-A.padStartY)*0.5);updateHUD();
   });
  }
  for(const id of ['touchMoveLeft','touchMoveRight','touchJump','aimPad','aimCancel']){
   const el=$(id);if(!el)continue;
   for(const type of ['selectstart','contextmenu','dragstart'])el.addEventListener(type,e=>e.preventDefault());
  }
  document.body.dataset.attack='idle';
 };
 // Textos del botón ATACAR y del pad según el estado (lo llama updateHUD).
 A.labels=w=>{
  const touch=document.body.dataset.touch==='true',pct=Math.round(app.power)+'%';
  if(A.state==='charging')return {main:w.charge?CS5.i18n.t("input.attack-controls.labels.s001"):'¡SUELTA!',sub:w.charge?CS5.i18n.t("input.attack-controls.labels.s002"):CS5.i18n.t("input.attack-controls.labels.s003")};
  if(A.state==='aiming'){
   if(w.target&&!app.target)return {main:CS5.i18n.t("input.attack-controls.labels.s004"),sub:CS5.i18n.t("input.attack-controls.labels.s005")};
   return {main:CS5.i18n.t("input.attack-controls.labels.s006"),sub:touch?(w.charge?CS5.i18n.t("input.attack-controls.labels.s007"):CS5.i18n.t("input.attack-controls.labels.s008")):(w.charge?CS5.i18n.t("input.attack-controls.labels.s009"):CS5.i18n.t("input.attack-controls.labels.s010"))};
  }
  return {main:CS5.i18n.t("input.attack-controls.labels.s011"),sub:touch?CS5.i18n.t("input.attack-controls.labels.s012"):CS5.i18n.t("input.attack-controls.labels.s013")};
 };
 CS5.attack=A;
})();
