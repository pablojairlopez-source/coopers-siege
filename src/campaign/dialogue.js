// Cooper's Siege 5.2 — Diálogo cinematográfico y retratos 3D.
// · `CS5.view3d`: un renderizador WebGL propio (fuera de pantalla) que reutiliza el modelo 3D de los
//   pugs (drawPug + DepthRenderer) para pintar retratos y el trofeo en lienzos 2D.
// · `CS5.portraits.get(perfil, expresión, lado)`: retrato grande del pug (variante, colores,
//   accesorio, equipo de espalda y expresión), con caché. Sin WebGL usa el dibujo 2D del juego.
// · `CS5.dialogue.play(id, líneas, contexto)`: texto progresivo con sonido, avanzar (toque, ESPACIO,
//   ENTER), omitir (ESC o botón), historial; funciona con ratón, teclado y táctil.
// · `CS5.dialogue.bark(...)`: frase breve sin pausar el combate (fases del jefe final).
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};

const view3d={
 r:null,canvas:null,
 renderer(){
  if(this.r!==null)return this.r;
  try{
   const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
   const r=Object.create(DepthRenderer.prototype);
   r.canvas=canvas;r.preview=true;r.sphereCache={};r.scratchObjects=new Float32Array(262144);r.objectsCap=262144;
   r.initGL();
   const g=r.g;g.bindTexture(g.TEXTURE_2D,r.texture);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,1,1,0,g.RGBA,g.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
   this.r=r;this.canvas=canvas;
  }catch(e){this.r=false;}
  return this.r;
 },
 // Dibuja una malla en el lienzo GL y la copia a `target` (2D). cam = {y, scale}.
 draw(target,mesh,cam,px){
  const r=this.renderer();if(!r)return false;
  const g=r.g,w=target.width,h=target.height,canvas=this.canvas;
  if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
  const cssW=w/px,cssH=h/px;
  g.viewport(0,0,w,h);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
  g.useProgram(r.program);g.uniform4f(r.uniforms.camera,cam.x||0,cam.y,cam.scale,0);g.uniform2f(r.uniforms.viewport,cssW,cssH);
  g.uniform4f(r.uniforms.sceneLight,-65,-110,1.08,0);g.uniform4f(r.uniforms.lightColor,1,.92,.80,.92);
  g.uniform4f(r.uniforms.lightInfo,-55,-45,140,.22);g.uniform4f(r.uniforms.impact1,65,-35,150,cam.rim??.18);
  for(const n of ['impact2','impact3','lightningInfo','ripple0','ripple1','ripple2','ripple3'])if(r.uniforms[n])g.uniform4f(r.uniforms[n],0,0,1,0);
  g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,r.texture);g.uniform1i(r.uniforms.tex,0);
  r.upload('objects',mesh);r.drawBuffer('objects',false,-1);
  const c=target.getContext('2d');c.clearRect(0,0,w,h);c.drawImage(canvas,0,0);
  return true;
 }
};

// Perfil de pug para un personaje de diálogo.
function pugFrom(p,expr,dir){
 return {id:7000+(p.seedId||0),team:0,x:0,y:0,vx:0,vy:0,dir,hp:100,grounded:true,hurt:0,landTimer:0,recoilTimer:0,
  variant:p.variant||'normal',fur:p.fur,accessory:p.accessory||'none',backgear:p.backgear||'none',cosmeticColor:p.color,size:1,
  previewPose:expr||'idle',name:p.name};
}
const portraits={
 cache:new Map(),
 key(p,expr,side,size){return [p.variant,p.fur,p.accessory,p.backgear,p.color,expr,side,size].join('|');},
 get(p,expr='idle',side='left',size=320){
  const k=this.key(p,expr,side,size);if(this.cache.has(k))return this.cache.get(k);
  const out=document.createElement('canvas');out.width=out.height=size;
  const dir=side==='right'?-1:1,o=pugFrom(p,expr,dir),t=3.2;
  for(let i=0;i<48;i++)CS5.pugAnim.frame([o],t+i/30,1/30,{phase:'menu'});
  let ok=false;
  const r=view3d.renderer();
  if(r){
   const mesh=[];drawPug(r,mesh,o,t,1.25,dir*-.42);
   ok=view3d.draw(out,mesh,{y:-25,scale:size/62},1);
  }
  if(!ok){const c=out.getContext('2d');c.save();c.translate(size/2,size*.86);c.scale(size/46,size/46);c.scale(dir,1);try{drawCanvasPug(c,o,t);}catch{}c.restore();}
  if(this.cache.size>160)this.cache.delete(this.cache.keys().next().value);
  this.cache.set(k,out);return out;
 }
};

const EXPR={idle:'idle',joy:'joy',angry:'angry',surprise:'surprise',sad:'sad',focus:'focus',fear:'fear',sleepy:'sleepy',dizzy:'dizzy',pain:'pain'};
const LEFT=new Set(['cooper','pipa','bongo','roco']);

const dialogue={
 el:null,open:false,lines:[],i:0,typed:0,timer:null,ctx:null,done:null,history:[],id:'',
 build(){
  if(this.el)return this.el;
  const el=document.createElement('div');el.id='dialogue';el.className='dlg';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label',CS5.i18n.t("campaign.dialogue.build.s001"));
  el.innerHTML=`<div class="dlg-shade"></div>
<canvas class="dlg-portrait left" width="320" height="320" aria-hidden="true"></canvas><canvas class="dlg-portrait right" width="320" height="320" aria-hidden="true"></canvas>
<section class="dlg-box"><header class="dlg-head"><b class="dlg-name"></b><small class="dlg-role"></small><span class="dlg-count"></span></header>
<p class="dlg-text" aria-live="polite"></p>
<div class="dlg-actions"><button type="button" class="dlg-log" title="${CS5.i18n.textHTML("campaign.dialogue.build.s002")}" data-i18n-title="campaign.dialogue.build.s002" data-i18n="campaign.dialogue.build.s003">${CS5.i18n.textHTML("campaign.dialogue.build.s003")}</button><button type="button" class="dlg-skip" title="${CS5.i18n.textHTML("campaign.dialogue.build.s004")}" data-i18n-title="campaign.dialogue.build.s004" data-i18n="campaign.dialogue.build.s005">${CS5.i18n.textHTML("campaign.dialogue.build.s005")}</button><button type="button" class="dlg-next" title="${CS5.i18n.textHTML("campaign.dialogue.build.s006")}" data-i18n-title="campaign.dialogue.build.s006" data-i18n="campaign.dialogue.build.s007">${CS5.i18n.textHTML("campaign.dialogue.build.s007")}</button></div></section>
<div class="dlg-history" hidden><div class="dlg-history-box"><header><b data-i18n="campaign.dialogue.build.s008">${CS5.i18n.textHTML("campaign.dialogue.build.s008")}</b><button type="button" class="dlg-history-close" aria-label="${CS5.i18n.textHTML("campaign.dialogue.build.s009")}" data-i18n-aria-label="campaign.dialogue.build.s009">×</button></header><ol></ol></div></div>`;
  document.body.appendChild(el);
  const q=s=>el.querySelector(s);
  this.ui={name:q('.dlg-name'),role:q('.dlg-role'),count:q('.dlg-count'),text:q('.dlg-text'),left:q('.dlg-portrait.left'),right:q('.dlg-portrait.right'),box:q('.dlg-box'),hist:q('.dlg-history'),histList:q('.dlg-history ol')};
  q('.dlg-next').addEventListener('click',e=>{e.stopPropagation();this.next();});
  q('.dlg-skip').addEventListener('click',e=>{e.stopPropagation();this.finish(true);});
  q('.dlg-log').addEventListener('click',e=>{e.stopPropagation();this.showHistory(true);});
  q('.dlg-history-close').addEventListener('click',e=>{e.stopPropagation();this.showHistory(false);});
  this.ui.box.addEventListener('click',e=>{if(e.target.closest('button,select,label'))return;this.next();});
  q('.dlg-shade').addEventListener('click',()=>this.next());
  window.addEventListener('keydown',e=>{
   if(e.target?.closest?.('select,input,textarea,#languagePicker'))return;
   const k=e.key;
   if(!this.ui.hist.hidden){if(k==='Escape'){this.showHistory(false);e.preventDefault();e.stopImmediatePropagation();}return;}
   if(!this.open)return;
   if(k===' '||k==='Enter'){this.next();}else if(k==='Escape'){this.finish(true);}else if(k==='h'||k==='H'){this.showHistory(true);}else return;
   e.preventDefault();e.stopImmediatePropagation();
  },true);
  window.addEventListener('keyup',e=>{if(this.open&&(e.key===' '||e.key==='Enter'||e.key==='Escape')){e.preventDefault();e.stopImmediatePropagation();}},true);
  this.el=el;return el;
 },
 // Perfil visual y nombre de un hablante.
 speaker(who){
  const D=CS5.campaignData,ch=this.ctx?.chapter?D.chapters[this.ctx.chapter-1]:null;
  if(who==='boss'&&ch)return {name:ch.boss.name,role:ch.boss.title,variant:ch.variant,fur:ch.boss.fur,accessory:ch.boss.accessory,backgear:ch.boss.backgear,color:ch.boss.color,voice:220};
  if(who==='bot'&&ch){const look=CS5.campaign.botLook(ch,0);return {name:ch.team,role:CS5.i18n.t("campaign.dialogue.speaker.s001"),...look,voice:520};}
  if(who==='carta')return {name:'',role:'',letter:true};
  return D.cast[who]||D.cast.cooper;
 },
 play(id,lines,ctx={},done=null){
  this.build();
  this.id=id;this.lines=(lines||[]).filter(Boolean);this.i=0;this.ctx=ctx;this.done=done;this.open=true;
  this.el.hidden=false;document.body.classList.add('dlg-open');this.showHistory(false);
  if(!this.lines.length){this.finish(false);return;}
  this.render();
 },
 render(remember=true,offset=0){
  const [who,expr,text]=this.lines[this.i],p=this.speaker(who),u=this.ui;
  this.el.classList.toggle('letter',!!p.letter);
  u.name.textContent=p.name;u.role.textContent=p.role||'';u.count.textContent=(this.i+1)+' / '+this.lines.length;
  u.box.style.setProperty('--speaker',p.color||'#ffd36a');
  const side=LEFT.has(who)?'left':'right';
  for(const s of ['left','right']){const cv=u[s];cv.classList.toggle('active',!p.letter&&s===side);if(!p.letter&&s===side){const img=portraits.get(p,EXPR[expr]||'idle',s);const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.drawImage(img,0,0,cv.width,cv.height);}else if(p.letter){cv.getContext('2d').clearRect(0,0,cv.width,cv.height);}}
  this.el.dataset.side=side;
  this.full=text;this.typed=Math.min(text.length,offset);u.text.textContent=text.slice(0,this.typed);
  if(remember)this.history.push(this.entry(this.i));if(this.history.length>400)this.history.shift();
  clearInterval(this.timer);
  if(this.typed===this.full.length){this.timer=null;return;}
  const pitch=p.voice||480;
  // Velocidad por tiempo real (≈ 75 caracteres/s): no se ralentiza si el dispositivo va cargado.
  const t0=performance.now();let lastBlip=0;
  this.timer=setInterval(()=>{
   this.typed=Math.min(this.full.length,offset+Math.floor((performance.now()-t0)*.075)+1);u.text.textContent=this.full.slice(0,this.typed);
   if(!p.letter&&this.typed-lastBlip>=4){lastBlip=this.typed;audio.sound('blip',.8,{pitch});}
   if(this.typed>=this.full.length){clearInterval(this.timer);this.timer=null;}
  },26);
 },
 next(){
  if(!this.open)return;
  if(this.timer){clearInterval(this.timer);this.timer=null;this.typed=this.full.length;this.ui.text.textContent=this.full;return;}
  if(++this.i>=this.lines.length){this.finish(false);return;}
  audio.sound('menu');this.render();
 },
 finish(skipped){
  clearInterval(this.timer);this.timer=null;
  if(skipped)for(let k=this.i+1;k<this.lines.length;k++)this.history.push(this.entry(k));
  this.open=false;this.el.hidden=true;document.body.classList.remove('dlg-open');
  CS5.campaign?.markSeen?.(this.id);
  const d=this.done;this.done=null;if(d)d(skipped);
 },
 openArchive(seen){
  this.build();const old=this.ctx,entries=[];
  for(const id of new Set(seen)){
   const chapter=Number(/^c(\d+)\./.exec(id)?.[1])||1;this.ctx={chapter};
   const lines=CS5.campaignStory[id];if(!Array.isArray(lines))continue;
   lines.forEach(([who,,text],index)=>entries.push({who:this.speaker(who).name||CS5.i18n.t("campaign.dialogue.openArchive.s001"),text,scene:id,index,chapter}));
  }
  this.ctx=old;this.el.hidden=false;this.showHistory(true,entries);
 },
 showHistory(show,entries=this.history){
  const u=this.ui;if(!u)return;u.hist.hidden=!show;
  if(show){this.historyEntries=entries;u.histList.innerHTML=entries.map(h=>{const row=this.historyRow(h);return `<li><b>${escapeHTML(row.who)}</b> ${escapeHTML(row.text)}</li>`;}).join('');u.histList.parentElement.scrollTop=1e9;}
  else if(!this.open)this.el.hidden=true;
 },
 entry(index){const [who,,text]=this.lines[index];return {who:this.speaker(who).name||CS5.i18n.t('campaign.dialogue.render.s001'),text,scene:this.id,index,chapter:this.ctx?.chapter};},
 historyRow(h){
  const line=CS5.campaignStory[h.scene]?.[h.index];if(!line)return h;
  const keep=this.ctx;this.ctx={chapter:h.chapter};const who=this.speaker(line[0]).name||CS5.i18n.t('campaign.dialogue.render.s001');this.ctx=keep;return {who,text:line[2]};
 },
 refreshLanguage(){
  if(!this.el)return;
  this.el.setAttribute('aria-label',CS5.i18n.t('campaign.dialogue.build.s001'));
  if(this.open&&CS5.campaignStory[this.id]){
   const ratio=this.full?.length?this.typed/this.full.length:0,complete=!this.timer;
   this.lines=CS5.campaignStory[this.id];this.render(false,complete?this.lines[this.i][2].length:Math.floor(this.lines[this.i][2].length*ratio));
  }
  if(!this.ui.hist.hidden){const y=this.ui.histList.parentElement.scrollTop;this.showHistory(true,this.historyEntries);this.ui.histList.parentElement.scrollTop=y;}
  if(this.barkData){const {who,expr,text,ctx}=this.barkData,b=document.getElementById('dlgBark');if(b?.classList.contains('show')){const keep=this.ctx;this.ctx=ctx;const p=this.speaker(who);this.ctx=keep;b.querySelector('p').innerHTML=`<b>${escapeHTML(p.name)}</b>${escapeHTML(typeof text==='function'?text():text)}`;}}
 },
 // Frase breve sin pausar la partida.
 bark(who,expr,text,ctx){
  this.barkData={who,expr,text,ctx};
  let b=document.getElementById('dlgBark');
  if(!b){b=document.createElement('div');b.id='dlgBark';b.innerHTML=`<canvas width="160" height="160"></canvas><p></p>`;document.body.appendChild(b);}
  const keep=this.ctx;this.ctx=ctx||this.ctx;const p=this.speaker(who);this.ctx=keep;
  const cv=b.querySelector('canvas'),c=cv.getContext('2d');c.clearRect(0,0,160,160);c.drawImage(portraits.get(p,EXPR[expr]||'idle','right',160),0,0);
  b.querySelector('p').innerHTML=`<b>${escapeHTML(p.name)}</b>${escapeHTML(typeof text==='function'?text():text)}`;
  b.classList.add('show');clearTimeout(this.barkTimer);this.barkTimer=setTimeout(()=>b.classList.remove('show'),4200);
 }
};
CS5.view3d=view3d;CS5.portraits=portraits;CS5.dialogue=dialogue;
})();
