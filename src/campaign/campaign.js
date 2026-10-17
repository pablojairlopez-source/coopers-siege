// Cooper's Siege 5.2 — Campaña «El Torneo del Universo».
// · Guardado automático versionado en localStorage (`coopers-siege-campaign-v1`): capítulo,
//   desbloqueos, batallas 1/2 ganadas, jefes derrotados, victorias, derrotas, dificultad,
//   personalización de la escuadra, diálogos vistos y trofeo. Exportar/importar en JSON.
// · Flujo por capítulo: intro → antes de la batalla 1 → batalla 1 (3 pugs contra 5 bots) → tras la
//   batalla 1 → presentación del jefe → antes del jefe → batalla 2 (jefe) → victoria. Derrota:
//   reintento de la misma batalla sin perder progreso. Capítulo 17: final, trofeo, créditos y
//   escena poscréditos.
// · Se integra con el juego mediante `app.campaign` (newMatch → setupMatch) y `onMatchEnd`.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const KEY='coopers-siege-campaign-v1',VERSION=1;
const D=()=>CS5.campaignData,S=()=>CS5.campaignStory;
const esc=s=>escapeHTML(String(s??''));
const ACCESSORIES=['none','cap','crown','halo','horns','samurai','astronaut','mohawk','chef','vr','bandana','glasses','pirate','helmet','viking','wizard','sombrero','headphones','gasmask','monocle','bowtie'];
const FURS=['#d9ae78','#efdcb8','#7a6a60','#a8a49e','#c99a6b','#f1e2c6','#8d7b6c','#3f3936'];

function defaultSave(){
 return {format:'coopers-siege-campaign',version:VERSION,created:Date.now(),updated:Date.now(),chapter:1,
  progress:Object.fromEntries(D().chapters.map(c=>[c.n,{b1:false,b2:false}])),bosses:[],victories:0,defeats:0,
  difficulty:'normal',squad:Object.fromEntries(['cooper','pipa','bongo','roco'].map(id=>[id,{accessory:D().cast[id].accessory,fur:D().cast[id].fur}])),
  seen:[],trophy:false,finished:false,last:null};
}
// Valida y migra un guardado (también los importados). Devuelve null si no es válido.
function sanitize(raw){
 if(!raw||typeof raw!=='object'||raw.format!=='coopers-siege-campaign')return null;
 if(!Number.isInteger(raw.version)||raw.version<1||raw.version>VERSION)return null;
 const s=defaultSave();
 s.created=Number(raw.created)||Date.now();
 for(const c of D().chapters){const p=raw.progress?.[c.n];if(p)s.progress[c.n]={b1:!!p.b1,b2:!!p.b2&&!!p.b1};}
 // Desbloqueo coherente: un capítulo solo cuenta si el anterior está completo.
 let ch=1;for(const c of D().chapters){if(c.n>1&&!s.progress[c.n-1].b2){s.progress[c.n]={b1:false,b2:false};}else ch=c.n;}
 s.chapter=Math.min(17,Math.max(1,ch));
 s.bosses=D().chapters.filter(c=>s.progress[c.n].b2).map(c=>c.boss.id);
 s.victories=Math.max(0,Math.floor(Number(raw.victories)||0));s.defeats=Math.max(0,Math.floor(Number(raw.defeats)||0));
 s.difficulty=['easy','normal','hard'].includes(raw.difficulty)?raw.difficulty:'normal';
 for(const id of Object.keys(s.squad)){const q=raw.squad?.[id];if(q){if(ACCESSORIES.includes(q.accessory))s.squad[id].accessory=q.accessory;if(/^#[0-9a-f]{6}$/i.test(q.fur||''))s.squad[id].fur=q.fur;}}
 s.seen=Array.isArray(raw.seen)?raw.seen.filter(x=>typeof x==='string'&&x.length<40).slice(0,400):[];
 s.finished=!!raw.finished&&s.progress[17].b2;s.trophy=!!raw.trophy&&s.finished;
 if(raw.last&&Number.isInteger(raw.last.chapter)&&[1,2].includes(raw.last.battle))s.last={chapter:Math.min(17,Math.max(1,raw.last.chapter)),battle:raw.last.battle,won:!!raw.last.won};
 s.updated=Date.now();
 return s;
}

const campaign={
 save:null,active:null,screen:'map',selected:1,
 // ---------- Guardado ----------
 load(){
  let s=null;try{s=sanitize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{}
  this.save=s||defaultSave();return this.save;
 },
 store(){this.save.updated=Date.now();try{localStorage.setItem(KEY,JSON.stringify(this.save));this.saveWarningShown=false;return true;}catch{if(!this.saveWarningShown){toast('No se pudo guardar la campaña en este navegador. Exporta tu progreso desde Ajustes antes de salir.',6);this.saveWarningShown=true;}return false;}},
 hasProgress(){const s=this.save||this.load();return s.victories+s.defeats>0||s.seen.length>0;},
 reset(){this.save=defaultSave();this.store();},
 markSeen(id){if(!id)return;if(!this.save)this.load();if(!this.save.seen.includes(id)){this.save.seen.push(id);this.store();}},
 exportData(){return JSON.stringify(this.save,null,1);},
 importData(text){let raw;try{raw=JSON.parse(text);}catch{return false;}const s=sanitize(raw);if(!s)return false;this.save=s;this.store();return true;},
 // Estado 0..34 (34 = campaña completa): 2 × capítulos completos + batalla 1 del actual.
 stateIndex(){const s=this.save;let k=0;for(const c of D().chapters){if(s.progress[c.n].b1)k++;if(s.progress[c.n].b2)k++;}return k;},
 unlocked(n){return n===1||!!this.save.progress[n-1]?.b2;},
 nextBattle(n){const p=this.save.progress[n];return !p.b1?1:!p.b2?2:0;},
 // ---------- Datos de partida ----------
 chapterDef(n){return D().chapters[(n||this.active?.chapter||1)-1];},
 currentBossDef(){const a=this.active;if(!a||a.battle!==2)return null;const c=this.chapterDef(a.chapter);return {...c.boss,variant:c.variant};},
 botLook(ch,i){
  const L=D().looks,R=rng(ch.n*7919+i*104729+13),pick=a=>a[Math.floor(R()*a.length)];
  const look={variant:ch.variant,accessory:pick(L.accessories),backgear:pick(L.backgears),fur:pick(L.furs),color:pick(L.colors)};
  // El líder (retrato del equipo rival) tiene un aspecto fijo y distinto en cada capítulo.
  if(i===0){look.accessory=L.accessories[(ch.n*7)%L.accessories.length];look.backgear=L.backgears[(ch.n*3)%L.backgears.length];}
  return look;
 },
 squadFor(n,battle){const ids=['cooper','pipa','bongo'];if(battle===2&&n>=16)ids.push('roco');return ids;},
 // Llamado por newMatch tras readSettings.
 applySettings(){
  app.mode='cpu';app.difficulty=this.save.difficulty;app.turnTime=45;app.supplyMode='normal';
 },
 // Llamado por newMatch antes del primer turno: escuadra, rivales y arsenal estándar.
 setupMatch(){
  const a=this.active,ch=this.chapterDef(a.chapter),squad=this.squadFor(a.chapter,a.battle),foes=a.battle===1?5:1;
  app.teams=[
   {id:0,name:'Cooper y compañía',human:true,cursor:0,ammo:CS5.arsenal.initial(weapons,'standard')},
   {id:1,name:a.battle===1?ch.team:ch.boss.name,human:false,cursor:0,ammo:CS5.arsenal.initial(weapons,'standard')}
  ];
  // Colocación: como en las partidas normales, los rivales quedan intercalados cerca de la escuadra
  // (con todos en un extremo del mundo de 3072 px las partidas se atascaban; ver el balance).
  const spots=CS5.safeSpawns(terrain,a.battle===1?8:12,W,WATER).slice().sort((p,q)=>p.x-q.x);
  app.chars=[];let id=0;
  const addSquad=(who,s)=>{const cast=D().cast[who],cus=this.save.squad[who]||{};app.chars.push({id:id++,team:0,name:cast.name,x:s.x,y:s.y,vx:0,vy:0,dir:1,hp:100,grounded:true,hurt:0,fallStart:s.y,lastY:s.y,size:1,variant:cast.variant,fur:cus.fur||cast.fur,accessory:cus.accessory||cast.accessory,backgear:cast.backgear,cosmeticColor:cast.color,squadId:who});};
  if(a.battle===1){
   const pattern=[1,0,1,0,1,0,1,1],bots=[];let si=0;
   spots.forEach((s,k)=>{if(pattern[k]===0&&si<squad.length)addSquad(squad[si++],s);else bots.push(s);});
   bots.slice(0,5).forEach((s,i)=>{const look=this.botLook(ch,i+1);app.chars.push({id:id++,team:1,name:ch.bots[i],x:s.x,y:s.y,vx:0,vy:0,dir:-1,hp:D().botHp,maxHp:D().botHp,grounded:true,hurt:0,fallStart:s.y,lastY:s.y,size:1,variant:look.variant,fur:look.fur,accessory:look.accessory,backgear:look.backgear,cosmeticColor:look.color});});
  }else{
   // Jefe cerca del centro, en un punto despejado para su tamaño; la escuadra a 300–900 px de él.
   const s=CS5.bosses.safePlace(W/2,spots[Math.floor(spots.length/2)].y);
   if(!s)throw new Error('No hay una aparición segura para el jefe.');
   const others=spots.filter(q=>q!==s).sort((p,q)=>Math.abs(Math.abs(p.x-s.x)-550)-Math.abs(Math.abs(q.x-s.x)-550));
   squad.forEach((who,i)=>addSquad(who,others[i]||others[0]));
   const boss={id:id++,team:1,name:ch.boss.name,x:s.x,y:s.y,vx:0,vy:0,dir:-1,hp:100,grounded:true,hurt:0,fallStart:s.y,lastY:s.y};
   CS5.bosses.setup(boss,{...ch.boss,variant:ch.variant},this.save.difficulty);
   app.chars.push(boss);
  }
  app.team=app.teams.length-1;
  $('turnBanner').style.setProperty('--team',colors[0]);
 },
 // ---------- Batallas ----------
 startBattle(n,battle){
  this.active={chapter:n,battle,attempt:(this.active?.chapter===n&&this.active?.battle===battle?this.active.attempt+1:1)};
  app.campaign=this.active;
  this.hideHub();
  selectMap(this.chapterDef(n).map);
  newMatch();makeDecorations();
  this.save.last={chapter:n,battle,won:false};this.store();
  this.showChip();this.updateBossBar();
  if(battle===2)setTimeout(()=>audio.sound('bossRoar',1),400);
 },
 onMatchEnd(winner){
  const a=this.active;if(!a)return;
  const won=!!winner&&winner.id===0,p=this.save.progress[a.chapter];
  a.won=won;
  if(won){
   this.save.victories++;
   if(a.battle===1)p.b1=true;
   else{p.b1=true;p.b2=true;const bid=this.chapterDef(a.chapter).boss.id;if(!this.save.bosses.includes(bid))this.save.bosses.push(bid);if(a.chapter<17)this.save.chapter=Math.max(this.save.chapter,a.chapter+1);else{this.save.finished=true;}}
  }else this.save.defeats++;
  this.save.last={chapter:a.chapter,battle:a.battle,won};
  this.store();
  $('result').hidden=true;
  if(!(app.resultDelay>0))setTimeout(()=>{if(this.active===a&&app.phase==='over')this.reveal();},1400);
 },
 // Llamado cuando termina la pausa dramática del final de la partida.
 reveal(){
  const a=this.active;if(!a)return;
  $('result').hidden=true;$('controls').hidden=true;
  this.showResult(a.won);
 },
 leaveBattle(){
  app.campaign=null;this.active=null;
  mainMenu();$('menu').hidden=true;this.hideChip();this.updateBossBar();
 },
 // ---------- Escenas ----------
 scene(id,ctx,done){const lines=S()[id]||[];CS5.dialogue.play(id,lines,ctx,done);},
 sequence(ids,ctx,done){const list=ids.filter(id=>S()[id]&&S()[id].length);const run=i=>{if(i>=list.length){done&&done();return;}this.scene(list[i],ctx,()=>run(i+1));};run(0);},
 play(n){
  if(!this.unlocked(n))return;
  this.selected=n;const nb=this.nextBattle(n),ctx={chapter:n};
  if(nb===2)return this.bossSequence(n);
  if(nb===0)return this.showChapter(n);
  const ids=[];if(n===1)ids.push('prologue');ids.push('c'+n+'.intro','c'+n+'.pre1');
  this.hideHub();this.sequence(ids,ctx,()=>this.startBattle(n,1));
 },
 bossSequence(n){
  const ctx={chapter:n};this.hideHub();
  this.showBossCard(n,()=>this.sequence(['c'+n+'.bossIntro','c'+n+'.preBoss'],ctx,()=>this.startBattle(n,2)));
 },
 replay(n,battle){this.hideHub();if(battle===2)this.bossSequence(n);else this.sequence(['c'+n+'.pre1'],{chapter:n},()=>this.startBattle(n,1));},
 onBossPhase(c,ph){const lines=S().bossPhase?.[c.boss.id];if(lines&&lines[ph])CS5.dialogue.bark('cero',ph>=2?'angry':'focus',lines[ph],{chapter:17});},
 // ---------- Interfaz ----------
 ensureUI(){
  if(this.root)return;
  const root=document.createElement('div');root.id='campaign';root.className='cmp';root.hidden=true;
  root.innerHTML=`<div class="cmp-bg"></div><section class="cmp-shell">
<header class="cmp-top"><div class="cmp-title"><small>CAMPAÑA</small><h2>El Torneo del Universo</h2></div><div class="cmp-stats"></div>
<nav class="cmp-tools"><button type="button" data-act="map" class="selected">🗺 Recorrido</button><button type="button" data-act="gallery">👑 Jefes</button><button type="button" data-act="trophy">🏆 Trofeo</button><button type="button" data-act="settings">⚙ Ajustes</button><button type="button" data-act="back" class="cmp-back">← Menú</button></nav></header>
<main class="cmp-body"></main></section>
<div class="cmp-modal" hidden></div>`;
  document.body.appendChild(root);this.root=root;this.body=root.querySelector('.cmp-body');this.modal=root.querySelector('.cmp-modal');
  root.querySelector('.cmp-tools').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;audio.sound('menu');const act=b.dataset.act;if(act==='back'){this.close();return;}this.screen=act;this.renderHub();});
  this.body.addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(!b)return;audio.sound('menu');this.action(b.dataset.do,b.dataset);});
  this.modal.addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(!b)return;audio.sound('menu');this.action(b.dataset.do,b.dataset);});
  // Fichas de estado en partida.
  const chip=document.createElement('div');chip.id='campaignChip';chip.hidden=true;document.body.appendChild(chip);
  const bar=document.createElement('div');bar.id='bossBar';bar.hidden=true;bar.innerHTML='<div class="bb-name"><b></b><small></small></div><div class="bb-track"><i class="bb-fill"></i><i class="bb-mark" style="left:66%"></i><i class="bb-mark" style="left:33%"></i></div><div class="bb-meta"><span class="bb-hp"></span><span class="bb-ability"></span></div>';document.body.appendChild(bar);
 },
 open(){
  this.load();this.ensureUI();
  this.selected=Math.min(17,this.save.chapter);this.screen='map';
  $('menu').hidden=true;this.root.hidden=false;this.renderHub();
 },
 close(){this.root.hidden=true;this.modal.hidden=true;$('menu').hidden=false;},
 hideHub(){if(this.root){this.root.hidden=true;this.modal.hidden=true;}},
 showHub(screen){this.ensureUI();$('menu').hidden=true;this.root.hidden=false;if(screen)this.screen=screen;this.renderHub();},
 renderHub(){
  const s=this.save;
  this.root.querySelectorAll('.cmp-tools button').forEach(b=>b.classList.toggle('selected',b.dataset.act===this.screen));
  this.root.querySelector('.cmp-stats').innerHTML=`<span><b>${Math.min(17,s.bosses.length)}</b>/17 jefes</span><span><b>${this.stateIndex()}</b>/34 batallas</span><span>🏅 ${s.victories} · ✖ ${s.defeats}</span><span>${{easy:'Fácil',normal:'Normal',hard:'Difícil'}[s.difficulty]}</span>`;
  if(this.screen==='gallery')return this.renderGallery();
  if(this.screen==='trophy')return this.renderTrophy();
  if(this.screen==='settings')return this.renderSettings();
  this.renderMap();
 },
 renderMap(){
  const s=this.save,acts=['I · La invitación','II · Los desaparecidos','III · La maquinaria','IV · El giro'],actOf=n=>n<=4?0:n<=11?1:n<=15?2:3;
  const nodes=D().chapters.map(c=>{
   const p=s.progress[c.n],open=this.unlocked(c.n),done=p.b2,m=maps[c.map];
   const st=done?'done':open?(p.b1?'half':'open'):'locked';
   return `<button type="button" class="cmp-node ${st} ${this.selected===c.n?'selected':''}" data-do="select" data-n="${c.n}" ${open?'':'aria-disabled="true"'} title="${esc(m.name)}"><span class="cmp-num">${c.n}</span><span class="cmp-icon">${open?m.icon:'🔒'}</span><span class="cmp-map">${open?esc(m.name):'Bloqueado'}</span><span class="cmp-pips"><i class="${p.b1?'on':''}"></i><i class="${p.b2?'on':''}"></i></span></button>`;
  });
  let html='<div class="cmp-route">';let lastAct=-1;
  D().chapters.forEach((c,i)=>{const a=actOf(c.n);if(a!==lastAct){html+=`<div class="cmp-act">ACTO ${acts[a]}</div>`;lastAct=a;}html+=nodes[i];});
  html+='</div>'+this.chapterPanel(this.selected);
  this.body.innerHTML=html;
  this.paintPortraits();
 },
 chapterPanel(n){
  const c=this.chapterDef(n),s=this.save,p=s.progress[n],open=this.unlocked(n),m=maps[c.map],nb=open?this.nextBattle(n):-1;
  const variant={normal:'Normal',zombie:'Zombi',skeleton:'Esqueleto',cyber:'Cíborg',ghost:'Fantasma',alien:'Alienígena',demon:'Demonio'}[c.variant];
  const bossKnown=p.b1||p.b2;
  const abil=c.boss.abilities.map(id=>D().abilities[id]).map(a=>`<li>${a.icon} <b>${esc(a.name)}</b> <small>${esc(a.desc)}</small></li>`).join('');
  let actions='';
  if(!open)actions='<p class="cmp-lock">🔒 Completa el capítulo anterior para desbloquearlo.</p>';
  else if(nb===1)actions=`<button type="button" class="start" data-do="play" data-n="${n}">${s.last&&s.last.chapter===n?'CONTINUAR':'JUGAR'} · BATALLA 1 ↗</button>`;
  else if(nb===2)actions=`<button type="button" class="start cmp-boss-btn" data-do="play" data-n="${n}">${p.b1&&s.last?.chapter===n?'CONTINUAR':'JUGAR'} · JEFE ↗</button><button type="button" class="text-button" data-do="replay" data-n="${n}" data-b="1">Repetir batalla 1</button>`;
  else actions=`<p class="cmp-done">✔ Capítulo completado</p><button type="button" class="mini-button" data-do="replay" data-n="${n}" data-b="1">Repetir batalla 1</button><button type="button" class="mini-button" data-do="replay" data-n="${n}" data-b="2">Repetir jefe</button>`;
  return `<aside class="cmp-panel" style="--accent:${c.boss.color}">
<div class="cmp-panel-head"><small>CAPÍTULO ${n} · ${esc(m.tag)}</small><h3>${m.icon} ${esc(m.name)}</h3></div>
<div class="cmp-vs"><figure><canvas class="cmp-portrait" data-who="squad" width="140" height="140"></canvas><figcaption>Cooper, Pipa y Bongo</figcaption></figure><span class="cmp-vs-x">VS</span>
<figure><canvas class="cmp-portrait" data-who="${open&&bossKnown?'boss':open?'bot':'none'}" data-n="${n}" width="140" height="140"></canvas><figcaption>${open?(bossKnown?esc(c.boss.name):esc(c.team)):'???'}</figcaption></figure></div>
<ol class="cmp-battles"><li class="${p.b1?'on':''}"><b>Batalla 1</b> 3 pugs contra 5 ${esc(variant.toLowerCase())}s · ${esc(c.team)}</li><li class="${p.b2?'on':''}"><b>Batalla 2</b> ${bossKnown?esc(c.boss.name)+' · '+c.boss.hp+' HP':'Jefe misterioso'}</li></ol>
${bossKnown?`<ul class="cmp-abil">${abil}</ul>`:''}
<div class="cmp-actions">${actions}</div></aside>`;
 },
 renderGallery(){
  const s=this.save;
  this.body.innerHTML='<div class="cmp-gallery">'+D().chapters.map(c=>{const won=s.bosses.includes(c.boss.id);return `<figure class="cmp-card ${won?'won':'unknown'}" style="--accent:${c.boss.color}"><canvas class="cmp-portrait" data-who="${won?'boss':'shadow'}" data-n="${c.n}" width="150" height="150"></canvas><figcaption><b>${won?esc(c.boss.name):'???'}</b><small>${won?esc(c.boss.title):'Capítulo '+c.n}</small>${won?`<span>${c.boss.hp} HP · ${c.boss.abilities.map(a=>D().abilities[a].icon).join(' ')}</span>`:''}</figcaption></figure>`;}).join('')+'</div>';
  this.paintPortraits();
 },
 renderTrophy(){
  const s=this.save;
  this.body.innerHTML=`<div class="cmp-trophy"><canvas class="cmp-trophy-canvas" width="420" height="420"></canvas><div><h3>${s.trophy?'El Cooper\'s Trophy es vuestro':'El Cooper\'s Trophy'}</h3><p>${s.trophy?'Compartida con todos los campeones del universo. Las galletas siguen saliendo.':'Derrota a los 17 campeones y descubre la verdad del torneo para conseguirla.'}</p>${s.finished?'<button type="button" class="mini-button" data-do="finale">▶ Ver el final otra vez</button>':''}</div></div>`;
  CS5.trophy.animate(this.body.querySelector('canvas'),s.trophy);
 },
 renderSettings(){
  const s=this.save,opt=(list,cur)=>list.map(v=>`<option value="${v}" ${v===cur?'selected':''}>${v==='none'?'Ninguno':v}</option>`).join('');
  const squad=['cooper','pipa','bongo','roco'].map(id=>`<div class="cmp-squad"><canvas class="cmp-portrait" data-who="${id}" width="96" height="96"></canvas><label>${esc(D().cast[id].name)}<select data-squad="${id}" data-k="accessory">${opt(ACCESSORIES,s.squad[id].accessory)}</select></label><label>Pelaje<select data-squad="${id}" data-k="fur">${FURS.map(f=>`<option value="${f}" ${f===s.squad[id].fur?'selected':''}>${f}</option>`).join('')}</select></label></div>`).join('');
  this.body.innerHTML=`<div class="cmp-settings"><section><h3>Dificultad</h3><select id="cmpDifficulty"><option value="easy">Fácil</option><option value="normal">Normal</option><option value="hard">Difícil</option></select><p class="tiny-note">Afecta a la puntería y a las armas especiales de los bots y jefes. El arsenal es idéntico para todos.</p></section>
<section><h3>Escuadra</h3><div class="cmp-squads">${squad}</div></section>
<section><h3>Progreso</h3><div class="cmp-row"><button type="button" class="mini-button" data-do="export">⬇ Exportar progreso</button><button type="button" class="mini-button" data-do="import">⬆ Importar progreso</button><button type="button" class="mini-button danger" data-do="newgame">✦ Nueva campaña</button><button type="button" class="mini-button" data-do="history">☰ Historial de diálogos</button></div><input type="file" id="cmpImport" accept="application/json,.json" hidden></section></div>`;
  const d=this.body.querySelector('#cmpDifficulty');d.value=s.difficulty;d.addEventListener('change',()=>{this.save.difficulty=d.value;this.store();this.renderHub();});
  this.body.querySelectorAll('select[data-squad]').forEach(sel=>sel.addEventListener('change',()=>{this.save.squad[sel.dataset.squad][sel.dataset.k]=sel.value;this.store();this.paintPortraits();}));
  this.body.querySelector('#cmpImport').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{if(this.importData(t)){toast('Progreso importado.',2.5);this.renderHub();}else toast('El archivo no es un progreso válido de la campaña.',3.5);});});
  this.paintPortraits();
 },
 // Pinta los retratos 3D de la interfaz (escuadra, jefe, bots, sombras de jefes por descubrir).
 paintPortraits(){
  for(const cv of this.root.querySelectorAll('canvas.cmp-portrait'))this.paintPortrait(cv);
 },
 paintPortrait(cv){
  const who=cv.dataset.who,n=Number(cv.dataset.n)||this.selected,c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);
  if(who==='none')return;
  const ch=this.chapterDef(n);let p,side='right',expr='idle';
  if(who==='squad'){p=this.castLook('cooper');side='left';expr='joy';}
  else if(D().cast[who]){p=this.castLook(who);side='left';}
  else if(who==='boss'||who==='shadow'){p={variant:ch.variant,fur:ch.boss.fur,accessory:ch.boss.accessory,backgear:ch.boss.backgear,color:ch.boss.color};expr='angry';}
  else p=this.botLook(ch,0);
  const img=CS5.portraits.get(p,expr,side,cv.width*2);c.drawImage(img,0,0,cv.width,cv.height);
  if(who==='shadow'){c.globalCompositeOperation='source-atop';c.fillStyle='#0b1022';c.fillRect(0,0,cv.width,cv.height);c.globalCompositeOperation='source-over';c.fillStyle='#ffffff55';c.font=`900 ${cv.width*.32}px system-ui`;c.textAlign='center';c.fillText('?',cv.width/2,cv.height*.62);}
 },
 castLook(id){const c=D().cast[id],q=(this.save||this.load()).squad[id]||{};return {...c,accessory:q.accessory||c.accessory,fur:q.fur||c.fur};},
 action(act,data){
  const n=Number(data.n);
  if(act==='select'){if(!this.unlocked(n)){toast('Capítulo bloqueado: completa el anterior.',2.4);return;}this.selected=n;this.renderMap();return;}
  if(act==='play'){this.play(n);return;}
  if(act==='replay'){this.replay(n,Number(data.b));return;}
  if(act==='export'){const blob=new Blob([this.exportData()],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='coopers-siege-campana.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Progreso exportado.',2.4);return;}
  if(act==='import'){this.body.querySelector('#cmpImport')?.click();return;}
  if(act==='newgame'){this.confirm('¿Empezar una campaña nueva?','Se borrará el progreso guardado (capítulos, jefes y trofeo). Puedes exportarlo antes.','Sí, empezar de cero',()=>{this.reset();this.selected=1;this.screen='map';this.renderHub();toast('Campaña nueva. ¡Rumbo al Archipiélago Sol!',3);});return;}
  if(act==='history'){CS5.dialogue.openArchive(this.save.seen);return;}
  if(act==='finale'){this.hideHub();this.finale();return;}
  if(act==='modal-close'){this.modal.hidden=true;return;}
  if(act==='confirm-yes'){this.modal.hidden=true;const f=this._confirm;this._confirm=null;f&&f();return;}
  if(act==='retry'){this.closeResult();const a=this.active;this.startBattle(a.chapter,a.battle);return;}
  if(act==='to-map'){this.closeResult();this.leaveBattle();this.showHub('map');return;}
  if(act==='after-win'){this.closeResult();this.afterWin();return;}
  if(act==='fight-boss'){this.closeResult();const k=this._bossNext;this._bossNext=null;k&&k();return;}
  if(act==='next-chapter'){this.closeResult();this.leaveBattle();const nx=Math.min(17,n);this.selected=nx;this.showHub('map');this.play(nx);return;}
 },
 confirm(title,text,yes,fn){this._confirm=fn;this.modal.innerHTML=`<section class="modal cmp-confirm"><h2>${esc(title)}</h2><p>${esc(text)}</p><button type="button" class="start danger" data-do="confirm-yes">${esc(yes)}</button><button type="button" class="text-button" data-do="modal-close">Cancelar</button></section>`;this.modal.hidden=false;},
 // ---------- Pantallas de resultado ----------
 showResult(won){
  this.ensureUI();const a=this.active,c=this.chapterDef(a.chapter),el=this.resultEl||(this.resultEl=document.createElement('div'));
  el.id='campaignResult';el.className='overlay cmp-result '+(won?'win':'lose');document.body.appendChild(el);
  el.onclick=e=>{const b=e.target.closest('[data-do]');if(b){audio.sound('menu');this.action(b.dataset.do,b.dataset);}};
  if(won){
   const boss=a.battle===2;
   el.innerHTML=`<section class="modal"><p class="eyebrow">${boss?'¡JEFE DERROTADO!':'¡VICTORIA!'}</p><h2>${boss?esc(c.boss.name):esc(c.team)}</h2><canvas class="cmp-result-portrait" width="160" height="160"></canvas><p>${boss?(a.chapter<17?'Capítulo '+a.chapter+' completado. Se desbloquea el capítulo '+(a.chapter+1)+'.':'El Primer Campeón ha caído.'):'Primera batalla del capítulo '+a.chapter+' superada. Te espera su campeón.'}</p><div id="battleStats">${app.turn} turnos · ${app.totalShots} ataques · ${Math.round(app.damageDone)} de daño</div><button type="button" class="start" data-do="after-win">CONTINUAR ↗</button><button type="button" class="text-button" data-do="to-map">Volver al recorrido</button></section>`;
   audio.sound('trophy',.6);
  }else{
   const line=S().defeat[(a.chapter+a.attempt)%S().defeat.length];
   el.innerHTML=`<section class="modal"><p class="eyebrow">DERROTA</p><h2>${a.battle===2?esc(c.boss.name)+' resiste':'¡Os han superado!'}</h2><canvas class="cmp-result-portrait" width="160" height="160"></canvas><p><b>${esc(D().cast[line[0]].name)}:</b> ${esc(line[2])}</p><p class="tiny-note">No pierdes progreso: ${a.battle===2?'la batalla 1 de este capítulo sigue ganada.':'reintenta esta batalla cuando quieras.'}</p><button type="button" class="start" data-do="retry">REINTENTAR BATALLA ${a.battle} ↗</button><button type="button" class="text-button" data-do="to-map">Volver al recorrido</button></section>`;
   audio.sound('defeat');
  }
  el.hidden=false;
  const cv=el.querySelector('canvas'),p=won?(a.battle===2?{variant:c.variant,fur:c.boss.fur,accessory:c.boss.accessory,backgear:c.boss.backgear,color:c.boss.color}:this.castLook('cooper')):this.castLook(S().defeat[(a.chapter+a.attempt)%S().defeat.length][0]);
  cv.getContext('2d').drawImage(CS5.portraits.get(p,won?(a.battle===2?'dizzy':'joy'):'sad',won&&a.battle===2?'right':'left',320),0,0,160,160);
 },
 closeResult(){if(this.resultEl)this.resultEl.hidden=true;},
 afterWin(){
  const a=this.active,n=a.chapter,ctx={chapter:n};
  if(a.battle===1){
   this.leaveBattle();
   this.sequence(['c'+n+'.post1'],ctx,()=>this.bossSequence(n));
   return;
  }
  this.leaveBattle();
  this.sequence(['c'+n+'.victory'],ctx,()=>{
   if(n===17){this.finale();return;}
   this.chapterComplete(n);
  });
 },
 chapterComplete(n){
  const c=this.chapterDef(n),nx=D().chapters[n];
  this.ensureUI();this.root.hidden=false;this.renderHub();
  this.modal.innerHTML=`<section class="modal cmp-complete" style="--accent:${c.boss.color}"><p class="eyebrow">CAPÍTULO ${n} COMPLETADO</p><h2>${esc(c.boss.name)} se une a la galería</h2><canvas width="150" height="150"></canvas><p>Desbloqueado: <b>Capítulo ${n+1} · ${esc(maps[nx.map].name)}</b>. Progreso guardado.</p><button type="button" class="start" data-do="next-chapter" data-n="${n+1}">SIGUIENTE CAPÍTULO ↗</button><button type="button" class="text-button" data-do="modal-close">Ver el recorrido</button></section>`;
  this.modal.hidden=false;
  this.modal.querySelector('canvas').getContext('2d').drawImage(CS5.portraits.get({variant:c.variant,fur:c.boss.fur,accessory:c.boss.accessory,backgear:c.boss.backgear,color:c.boss.color},'joy','right',300),0,0,150,150);
  this.selected=n+1;
 },
 // Presentación del jefe (tarjeta cinematográfica).
 showBossCard(n,next){
  const c=this.chapterDef(n),el=this.resultEl||(this.resultEl=document.createElement('div'));
  el.id='campaignResult';el.className='overlay cmp-result boss-card';document.body.appendChild(el);
  el.style.setProperty('--accent',c.boss.color);
  el.innerHTML=`<section class="modal"><p class="eyebrow">CAPÍTULO ${n} · CAMPEÓN DE ${esc(maps[c.map].name.toUpperCase())}</p><canvas class="cmp-boss-portrait" width="260" height="260"></canvas><h2>${esc(c.boss.name)}</h2><p class="cmp-boss-title">${esc(c.boss.title)}</p><div class="cmp-boss-stats"><span>❤ ${c.boss.hp} HP</span><span>⬆ Tamaño 2×</span>${c.boss.final?'<span>✦ 3 fases</span>':''}</div><ul class="cmp-abil">${c.boss.abilities.map(id=>D().abilities[id]).map(a=>`<li>${a.icon} <b>${esc(a.name)}</b> <small>${esc(a.desc)}</small></li>`).join('')}</ul><button type="button" class="start" data-do="fight-boss">¡A LUCHAR! ↗</button><button type="button" class="text-button" data-do="to-map">Volver al recorrido</button></section>`;
  el.onclick=e=>{const b=e.target.closest('[data-do]');if(b){audio.sound('menu');this.action(b.dataset.do,b.dataset);}};
  this._bossNext=next;el.hidden=false;
  el.querySelector('canvas').getContext('2d').drawImage(CS5.portraits.get({variant:c.variant,fur:c.boss.fur,accessory:c.boss.accessory,backgear:c.boss.backgear,color:c.boss.color},'angry','right',520),0,0,260,260);
  audio.sound('bossRoar',1);
 },
 // ---------- Final ----------
 finale(){
  this.sequence(['finale'],{chapter:17},()=>{
   this.save.trophy=true;this.save.finished=true;this.store();
   this.showTrophyCelebration(()=>this.credits(()=>this.sequence(['postcredits'],{chapter:17},()=>{this.showHub('trophy');})));
  });
 },
 showTrophyCelebration(next){
  const el=document.createElement('div');el.id='trophyCelebration';el.className='overlay cmp-celebrate';
  el.innerHTML=`<section class="modal"><p class="eyebrow">EL TORNEO DEL UNIVERSO</p><h2>COOPER'S TROPHY — CAMPEONES DEL UNIVERSO</h2><canvas width="420" height="420"></canvas><p>El primer trofeo auténtico del torneo, compartido por todos.</p><button type="button" class="start">CRÉDITOS ↗</button></section><div class="cmp-confetti"></div>`;
  document.body.appendChild(el);
  const conf=el.querySelector('.cmp-confetti');for(let i=0;i<70;i++){const s=document.createElement('i');s.style.left=(i*137%100)+'%';s.style.animationDelay=(i%14)*.18+'s';s.style.background=['#ffd36a','#ff797d','#60e0dd','#c0a5ff','#9be37a'][i%5];conf.appendChild(s);}
  CS5.trophy.animate(el.querySelector('canvas'),true);audio.sound('trophy',1);
  el.querySelector('button').addEventListener('click',()=>{el.remove();next&&next();});
 },
 credits(next){
  const el=document.createElement('div');el.id='campaignCredits';el.className='overlay cmp-credits';
  el.innerHTML=`<div class="cmp-roll">${S().credits.map(([a,b])=>`<p><small>${esc(a)}</small><b>${esc(b)}</b></p>`).join('')}<p><small>Gracias por jugar</small><b>🐾</b></p></div><button type="button" class="mini-button cmp-credits-skip">Continuar ⏭</button>`;
  document.body.appendChild(el);
  const done=()=>{if(!el.isConnected)return;el.remove();next&&next();};
  el.querySelector('button').addEventListener('click',done);setTimeout(done,26000);
 },
 // ---------- Fichas en partida ----------
 showChip(){
  this.ensureUI();const a=this.active,c=this.chapterDef(a.chapter),chip=document.getElementById('campaignChip');
  chip.textContent=`CAPÍTULO ${a.chapter} · ${a.battle===1?'BATALLA 1/2':'JEFE · BATALLA 2/2'}`;chip.hidden=false;
 },
 hideChip(){const chip=document.getElementById('campaignChip');if(chip)chip.hidden=true;},
 updateBossBar(){
  const bar=document.getElementById('bossBar');if(!bar)return;
  const boss=app.campaign&&app.phase!=='menu'?app.chars.find(c=>c.boss):null;
  if(!boss){bar.hidden=true;return;}
  bar.hidden=false;bar.style.setProperty('--accent',boss.cosmeticColor||'#ffd36a');
  bar.querySelector('.bb-name b').textContent=boss.boss.name;bar.querySelector('.bb-name small').textContent=boss.boss.title+(boss.boss.final?' · Fase '+(boss.boss.phase+1)+'/3':'');
  bar.querySelector('.bb-fill').style.width=(Math.max(0,boss.hp)/boss.maxHp*100)+'%';
  bar.querySelectorAll('.bb-mark').forEach(m=>m.hidden=!boss.boss.final);
  bar.querySelector('.bb-hp').textContent=Math.max(0,Math.round(boss.hp))+' / '+boss.maxHp+' HP'+(boss.shield>0?' · 🛡 '+boss.shield:'');
  const p=boss.boss.pending,ab=p?D().abilities[p.id]:null;
  bar.querySelector('.bb-ability').textContent=ab?`⚠ ${ab.icon} ${ab.name} ${p.ready?'· ¡AHORA!':'· próximo turno'}`:'';
  bar.classList.toggle('warn',!!p);
 }
};
// Escenas de captura (tests/shots-52.cjs).
CS5.campaignShots={
 hub(){campaign.load();campaign.open();},
 result(){campaign.closeResult();campaign.active={chapter:4,battle:2,attempt:1,won:false};app.turn=12;app.totalShots=9;app.damageDone=210;campaign.showResult(false);},
 dialogue(){campaign.load();campaign.hideHub();$('menu').hidden=true;CS5.dialogue.play('c4.bossIntro',S()['c4.bossIntro'],{chapter:4});CS5.dialogue.next();},
 bosscard(){if(CS5.dialogue.open)CS5.dialogue.finish(true);campaign.load();$('menu').hidden=true;campaign.showBossCard(17,()=>{});},
 boss(){if(CS5.dialogue.open)CS5.dialogue.finish(true);campaign.closeResult();campaign.load();campaign.startBattle(4,2);for(let i=0;i<120;i++)PocketSiege.step(1/60);const b=app.chars.find(c=>c.boss);app.team=1;app.active=b;CS5.bosses.announce(b,'sandTrap');updateHUD();campaign.updateBossBar();},
 battle1(){campaign.closeResult();campaign.load();campaign.startBattle(1,1);for(let i=0;i<150;i++)PocketSiege.step(1/60);},
 gallery(){campaign.leaveBattle();campaign.load();for(const c of CS5.campaignData.chapters.slice(0,7)){campaign.save.progress[c.n]={b1:true,b2:true};campaign.save.bosses.push(c.boss.id);}campaign.showHub('gallery');},
 trophy(){campaign.leaveBattle?.();campaign.load();campaign.save.trophy=true;campaign.showHub('trophy');}
};
campaign.sanitize=sanitize;campaign.defaultSave=defaultSave;
CS5.campaign=campaign;
})();
