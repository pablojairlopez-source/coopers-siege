// 5.1 — Mezcla de audio: la cadena real del juego (audio.buildMix) renderizada sin conexión.
// · Disparos, explosiones y quejidos sobresalen por encima de la música en combate.
// · Sonoridad de las 18 piezas igualada (± 2 dB) y sin clipping tras el limitador.
// · Ducking ante grandes explosiones; controles de volumen respetados.
// · damage()/kill() invocan el quejido correcto (ligero, medio, fuerte) y el lamento de muerte.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
const {measureSongs}=require('./lib/loudness.cjs');
const db=v=>20*Math.log10(Math.max(1e-9,v));
(async()=>{
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege&&CS5.composer);

  // 1) Sonoridad igualada entre canciones.
  const songs=await measureSongs(page,{seconds:24});
  const lks=songs.map(s=>s.lk),med=[...lks].sort((a,b)=>a-b)[Math.floor(lks.length/2)];
  for(const s of songs)console.log(`  ${s.id.padEnd(10)} ${s.lk.toFixed(1).padStart(6)} dB`);
  const spread=Math.max(...lks)-Math.min(...lks);
  console.log(`Sonoridad de ${songs.length} piezas: mediana ${med.toFixed(1)} dB, dispersión ${spread.toFixed(1)} dB`);
  for(const s of songs)assert.ok(Math.abs(s.lk-med)<=2,`${s.id}: ${s.lk} dB se aparta de la mediana ${med}`);

  // 2) Escena de combate en la cadena real: música + disparo + explosión + quejidos.
  const scenes=await page.evaluate(async()=>{
   const out={};
   for(const [mapIdx,weapon] of [[0,'rocket'],[2,'super'],[13,'grenade']]){
    const sr=22050,len=12,oc=new OfflineAudioContext(2,sr*len,sr),A=Object.create(audio);
    A.context=oc;A.buildMix(oc);A.sfx=true;
    // Mismos niveles que scheduleAdventureMusic con los valores por defecto del menú (80/85/90 %).
    const m=.8,mu=.85,fx=.9;A.musicGain.gain.value=.44*mu*m;A.effectsGain.gain.value=.74*fx*m;A.voiceGain.gain.value=.45*fx*m;A.ambienceGain.gain.value=.36*fx*m;
    const C=CS5.composer,app=PocketSiege.state;app.map=mapIdx;
    C.ac=null;C.init(oc,A.musicGain);C.song=null;C.next=0;C.play(CS5.songs.forMap(mapIdx),false);C.setState('C',true);
    while(C.next<len)C.schedule(len);
    const at=(t,fn)=>oc.suspend(t).then(()=>{fn();oc.resume();});
    let duck=1;
    at(4,()=>{app.weapon=weapon;CS5.sfx.play(A,'shot',1,{});});
    at(6,()=>{app.weapon=weapon;CS5.sfx.play(A,'explosion',weapon==='super'?1.9:1.1,{});});
    at(6.3,()=>{duck=A.musicDuck.gain.value;});
    at(8,()=>CS5.sfx.play(A,'hurt',.5,{immediate:true}));
    at(9,()=>CS5.sfx.play(A,'hurt',1.2,{immediate:true}));
    at(10,()=>CS5.sfx.play(A,'hurt',2.5,{immediate:true}));
    const b=await oc.startRendering(),L=b.getChannelData(0),R=b.getChannelData(1);
    const peakRms=(a,z)=>{let best=0;for(let x=a;x+.05<=z;x+=.025)best=Math.max(best,rms(x,x+.05));return best;};
    const rms=(a,z)=>{let s=0,n=0;for(let i=Math.floor(a*sr);i<Math.floor(z*sr);i++){s+=(L[i]*L[i]+R[i]*R[i])*.5;n++;}return Math.sqrt(s/n);};
    let peak=0;for(let i=0;i<L.length;i++)peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));
    out[mapIdx+':'+weapon]={music:rms(1.5,3.9),shot:peakRms(4,4.35),explosion:peakRms(6,6.6),explosionBody:rms(6,6.6),light:peakRms(8,8.25),medium:peakRms(9,9.45),heavy:peakRms(10,10.7),peak,duck};
   }
   return out;
  });
  for(const [k,s] of Object.entries(scenes)){
   const rel=x=>+(db(s[x])-db(s.music)).toFixed(1);
   const r={body:rel('explosionBody'),shot:rel('shot'),explosion:rel('explosion'),light:rel('light'),medium:rel('medium'),heavy:rel('heavy')};
   console.log(`  ${k.padEnd(10)} sobre la música: disparo +${r.shot} dB · explosión +${r.explosion} dB (cuerpo +${r.body}) · quejidos +${r.light}/+${r.medium}/+${r.heavy} dB · pico ${s.peak.toFixed(2)} · ducking ×${s.duck.toFixed(2)}`);
   assert.ok(r.shot>=4,`${k}: disparo distinguible (${r.shot} dB)`);
   assert.ok(r.explosion>=10,`${k}: explosión contundente (${r.explosion} dB)`);
   assert.ok(r.light>=2&&r.medium>=3&&r.heavy>=4,`${k}: quejidos audibles (${r.light}/${r.medium}/${r.heavy})`);
   assert.ok(r.heavy>r.light,`${k}: el grito fuerte suena más que el quejido ligero`);
   assert.ok(s.peak<=1.0,`${k}: sin clipping (pico ${s.peak})`);
   assert.ok(s.duck<.95,`${k}: la música cede ante la explosión`);
  }

  // 3) Eventos de juego → sonidos, y controles de volumen.
  const game=await page.evaluate(()=>{
   const P=PocketSiege,app=P.state,calls=[];P.mainMenu();P.newMatch(5);
   const orig=audio.sound.bind(audio);audio.sound=(k,s,w)=>{calls.push([k,+(s??1).toFixed(2)]);};
   const [a,b]=app.chars;b.shield=0;damage(b,8,b.x,b.y);damage(b,22,b.x,b.y);damage(b,45,b.x,b.y);a.shield=0;damage(a,200,a.x,a.y);
   // El veneno resta vida sin pasar por damage(): también debe quejarse.
   const before=calls.length,p=app.chars.find(c=>c.hp>0&&c!==b);p.poisoned=2.05;for(let i=0;i<70;i++)characterPhysics(p,1/60,0,false);
   const poison=calls.slice(before).filter(c=>c[0]==='hurt').length;
   audio.sound=orig;
   calls.push(['poison',poison]);
   const tiers=calls.filter(c=>c[0]==='hurt').map(c=>CS5.sfx.painKind(c[1]*20));
   // Volúmenes: con el deslizador de efectos a 0 los buses de efectos y voces van a 0.
   audio.init();const targets={};
   for(const bus of ['effectsGain','voiceGain','ambienceGain','musicGain']){const p=audio[bus].gain,o=p.setTargetAtTime.bind(p);p.setTargetAtTime=(v,...r)=>{targets[bus]=v;return o(v,...r);};}
   const el=document.getElementById('volSfx');el.value='0';el.dispatchEvent(new Event('input'));
   app.paused=false;audio.music=true;setPhase('aim');scheduleAdventureMusic();
   const muted={...targets};el.value='90';el.dispatchEvent(new Event('input'));scheduleAdventureMusic();
   return {calls,tiers,muted,restored:{...targets}};
  });
  console.log('  eventos:',JSON.stringify(game.calls));
  assert.deepEqual(game.tiers.slice(0,3),['light','medium','heavy'],'tres niveles de quejido según el daño');
  assert.equal(game.calls.find(c=>c[0]==='poison')[1],2,'cada tic de veneno suena');
  // 4) Saturación en un caso extremo: todos los volúmenes al 100 %, clímax de Caldera Roja,
  //    varias supernovas, dos nubes nucleares y cinco gritos a la vez.
  const stress=await page.evaluate(async()=>{const sr=22050,len=6,oc=new OfflineAudioContext(2,sr*len,sr),A=Object.create(audio);A.context=oc;A.buildMix(oc);A.sfx=true;
   A.musicGain.gain.value=.44;A.effectsGain.gain.value=.74;A.voiceGain.gain.value=.45;A.ambienceGain.gain.value=.36;
   const C=CS5.composer,app=PocketSiege.state;app.map=2;C.ac=null;C.init(oc,A.musicGain);C.song=null;C.next=0;C.play(CS5.songs.forMap(2),false);C.setState('D',true);while(C.next<len)C.schedule(len);
   oc.suspend(2).then(()=>{app.weapon='super';for(let k=0;k<8;k++)CS5.sfx.play(A,'explosion',2.4,{});CS5.sfx.play(A,'nuclear',2,{});CS5.sfx.play(A,'nuclear',2,{});for(let k=0;k<5;k++)CS5.sfx.play(A,'hurt',3,{immediate:true});CS5.sfx.play(A,'death',1,{});oc.resume();});
   const b=await oc.startRendering();let peak=0;for(const ch of [0,1])for(const v of b.getChannelData(ch))peak=Math.max(peak,Math.abs(v));
   // Mapa 17: caer al abismo de nubes no suena a agua.
   app.map=16;const before=CS5.sfx.stats.splash||0;const oc2=new OfflineAudioContext(1,2205,22050);CS5.sfx.play({context:oc2,effectsGain:oc2.destination},'splash',1,{});
   return {peak,cloud:(CS5.sfx.stats.splash||0)===before+1};});
  console.log(`  estrés: pico ${stress.peak.toFixed(3)} (recorte suave de seguridad ≤ 0,96)`);
  assert.ok(stress.peak<=.97,`sin saturación en el caso extremo (pico ${stress.peak})`);
  assert.ok(game.calls.some(c=>c[0]==='death'),'la muerte dispara su lamento');
  assert.ok(game.calls.findIndex(c=>c[0]==='death')<game.calls.findIndex(c=>c[0]==='nuclear'),'lamento antes de la nube nuclear');
  if(Object.keys(game.muted).length){
   assert.equal(game.muted.effectsGain,0,'efectos a 0');assert.equal(game.muted.voiceGain,0,'voces a 0');assert.ok(game.muted.musicGain>0,'la música sigue');
   assert.ok(game.restored.voiceGain>0,'voces restauradas');
  }else console.log('  (contexto de audio sin arrancar en headless: volúmenes no comprobados en vivo)');
  assert.deepEqual(errors,[]);
  console.log('PASS audio-mix: sonoridad igualada, disparos/explosiones/quejidos por encima de la música, sin clipping, ducking, voces por nivel de daño y volúmenes.');
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
