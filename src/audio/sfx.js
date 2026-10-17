// Cooper's Siege 5.1 — Diseño sonoro.
// · Disparos propios de cada familia de armas, con transitorio (clic), golpe grave
//   según el calibre y cola acústica.
// · Explosiones en capas: chasquido inicial, golpe sub-grave, cuerpo, escombros,
//   cola ambiental y capa de material del escenario; escalan con el tamaño y el
//   arma (supernova, misiles y ataques orbitales llevan un segundo golpe y una
//   cola larga, y piden «ducking» discreto de la música).
// · Voces de los pugs por síntesis de formantes: quejido breve (daño ligero),
//   gemido (medio), grito caricaturesco (fuerte) y lamento de muerte; tono,
//   vocal y duración varían en cada toma.
// · Enrutamiento: disparos y explosiones → bus de efectos; voces → bus de voces;
//   ambientes → bus de ambiente (ver audio.init en index.html).
// · Protección contra acumulación: límite de voces simultáneas por tipo.
// Todo es cosmético: usa Math.random y nunca afecta al combate ni al terreno.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];

function noiseBuf(ac){return CS5.instruments.noise(ac);}
function env(g,t,peak,a,len){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+len);}
function done(nodes,ac,t){setTimeout(()=>{for(const n of nodes)try{n.disconnect();}catch{}},Math.max(60,(t-ac.currentTime)*1000+200));}
function noise(ac,dest,t,len,v,type,f,q=1,f2){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+len);fl.Q.value=q;env(g,t,v,.004,len);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*.8);s.stop(t+len+.05);done([s,fl,g],ac,t+len);}
function tone(ac,dest,t,f0,f1,len,v,type='sine',a=.004){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+len*.8);env(g,t,v,a,len);o.connect(g);g.connect(dest);o.start(t);o.stop(t+len+.05);done([o,g],ac,t+len);}
// Clic de ataque: ráfaga de ruido muy corta que da definición al inicio.
function click(ac,d,t,v=.7,f=3200){noise(ac,d,t,.025,v,'highpass',f,.7);}
// Golpe grave: seno con caída rápida de tono (bombo de cañón).
function thump(ac,d,t,v=.8,f0=150,f1=42,len=.22){tone(ac,d,t,f0,f1,len,v,'sine',.002);}
// Cola: ruido filtrado con caída lenta (eco del entorno).
function tail(ac,d,t,len,v,f=900){noise(ac,d,t,len,v,'lowpass',f,.5,Math.max(80,f*.18));}
// Bus espacial: paneo y paso bajo según la distancia a la cámara. `floor` limita la atenuación.
function spatial(ac,dest,pos,floor=.3){if(!pos)return dest;const g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';const d=Math.min(1,pos.dist||0);lp.frequency.value=18000*Math.pow(.15,d);g.gain.value=1-d*(1-floor);if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-.85,Math.min(.85,pos.pan||0));lp.connect(p);p.connect(dest);}else lp.connect(dest);g.connect(lp);done([g,lp],ac,ac.currentTime+4);return g;}

const WEAPON_FAMILY={rocket:'launch',super:'heavyLaunch',homing:'launch',salvo:'mortar',drill:'drill',grenade:'throw',cluster:'throw',banana:'throw',ice:'throw',sticky:'throw',holy:'holy',acid:'throw',blackhole:'void',mine:'drop',dynamite:'drop',shotgun:'shotgun',sniper:'rifle',flame:'flame',tesla:'zap',orbital:'radio',airstrike:'radio',meteor:'radio',teleport:'warp',medkit:'chime',shield:'bubble',bat:'swing',saw:'saw',vampire:'screech'};
// Armas cuyas explosiones son «grandes»: segundo golpe, cola larga y ducking.
const HEAVY=new Set(['super','orbital','meteor','airstrike','holy','dynamite','blackhole']);
// Material sonoro dominante de cada mapa (por índice). El 16 es Jardín de Espinas.
const MATERIAL=['earth','metal','lava','ice','crystal','stone','metal','metal','earth','rubble','earth','sand','water','metal','lava','candy','wood'];

const SHOTS={
 launch(ac,d,t){click(ac,d,t,.6,2400);thump(ac,d,t,.75,160,50,.3);noise(ac,d,t,.55,.55,'bandpass',600,1.1,2600);tail(ac,d,t+.08,.9,.14,1400);},
 heavyLaunch(ac,d,t){click(ac,d,t,.8,1800);thump(ac,d,t,1,110,32,.6);noise(ac,d,t,.9,.65,'bandpass',300,1,1900);tone(ac,d,t+.05,420,140,.45,.16,'sawtooth');tail(ac,d,t+.1,1.6,.2,900);},
 mortar(ac,d,t){for(let k=0;k<3;k++){click(ac,d,t+k*.09,.4,2000);thump(ac,d,t+k*.09,.6,190,60,.2);noise(ac,d,t+k*.09,.14,.3,'lowpass',1500);}tail(ac,d,t+.25,1,.12,1000);},
 drill(ac,d,t){click(ac,d,t,.4);tone(ac,d,t,90,260,.55,.24,'sawtooth');noise(ac,d,t,.55,.3,'bandpass',1800,4);},
 throw(ac,d,t){click(ac,d,t,.45,2600);noise(ac,d,t,.26,.85,'bandpass',900,1.6,3400);thump(ac,d,t,.6,220,90,.1);tone(ac,d,t+.02,2200,1800,.06,.1,'triangle');},
 drop(ac,d,t){tone(ac,d,t,320,180,.13,.32,'triangle');thump(ac,d,t+.02,.3,120,60,.1);noise(ac,d,t,.08,.2,'lowpass',900);},
 shotgun(ac,d,t){click(ac,d,t,1,2200);thump(ac,d,t,.95,130,40,.32);noise(ac,d,t,.4,.95,'lowpass',3000,.7,600);tail(ac,d,t+.05,1.2,.2,1600);tone(ac,d,t+.32,900,700,.05,.14,'square');tone(ac,d,t+.4,700,500,.05,.12,'square');},
 rifle(ac,d,t){click(ac,d,t,1,4000);noise(ac,d,t,.12,1,'highpass',1800);thump(ac,d,t,.6,240,70,.12);tone(ac,d,t,1800,300,.15,.32,'sawtooth');tail(ac,d,t+.08,1.4,.16,2200);},
 flame(ac,d,t){thump(ac,d,t,.4,90,50,.3);noise(ac,d,t,.95,.65,'lowpass',800,.7,2400);noise(ac,d,t,.95,.25,'bandpass',300,1);},
 zap(ac,d,t){click(ac,d,t,.6,5000);for(let k=0;k<7;k++)tone(ac,d,t+k*.03,rnd(600,1800),rnd(200,600),.05,.2,'square');noise(ac,d,t,.35,.25,'highpass',4000);},
 radio(ac,d,t){tone(ac,d,t,1400,0,.08,.18,'square');tone(ac,d,t+.12,1400,0,.08,.18,'square');noise(ac,d,t+.2,.45,.16,'bandpass',2200,3);tone(ac,d,t+.3,180,60,.8,.25,'sawtooth');},
 warp(ac,d,t){tone(ac,d,t,220,1800,.45,.28,'sine');tone(ac,d,t+.08,1600,300,.4,.14,'triangle');},
 chime(ac,d,t){for(const [k,m] of [[0,76],[.08,81],[.16,88]])CS5.instruments.I.bell(ac,d,m,t+k,.3,.14,{ratio:3,index:1,len:1});},
 bubble(ac,d,t){for(let k=0;k<4;k++)tone(ac,d,t+k*.05,rnd(300,500),rnd(700,1100),.1,.14);},
 swing(ac,d,t){noise(ac,d,t,.25,.6,'bandpass',500,1.5,2800);thump(ac,d,t+.18,.5,200,80,.1);},
 saw(ac,d,t){tone(ac,d,t,300,900,.5,.2,'sawtooth');noise(ac,d,t,.5,.18,'bandpass',3000,6);},
 screech(ac,d,t){tone(ac,d,t,2400,1200,.25,.17,'sawtooth');tone(ac,d,t+.1,2600,1500,.2,.12,'sawtooth');},
 holy(ac,d,t){SHOTS.throw(ac,d,t);for(const [k,m] of [[0,72],[.06,76],[.12,79]])CS5.instruments.I.bell(ac,d,m,t+k,.4,.09,{ratio:2,index:.8,len:1.4});},
 void(ac,d,t){thump(ac,d,t,.7,60,28,.9);noise(ac,d,t,.75,.25,'lowpass',400,1,120);}
};

// Capa de material de la explosión.
const MAT={
 earth(ac,d,t,s){noise(ac,d,t+.06,.7+s*.3,.22*s,'lowpass',900);},
 sand(ac,d,t,s){noise(ac,d,t+.05,1+s*.4,.22*s,'bandpass',2600,.6);},
 rubble(ac,d,t,s){for(let k=0;k<8;k++)tone(ac,d,t+.1+k*rnd(.04,.09),rnd(300,900),rnd(150,300),.06,.09*s,'triangle');},
 stone(ac,d,t,s){for(let k=0;k<6;k++)tone(ac,d,t+.08+k*rnd(.05,.1),rnd(500,1200),rnd(300,600),.05,.08*s,'triangle');},
 metal(ac,d,t,s){CS5.instruments.I.bell(ac,d,rnd(60,72),t+.03,.2,.18*s,{ratio:2.41,index:4,len:1.2+s*.6});noise(ac,d,t+.05,.3,.14*s,'highpass',3000);},
 lava(ac,d,t,s){noise(ac,d,t+.1,1.4,.18*s,'highpass',2500);tone(ac,d,t,50,28,1.2,.4*s);},
 ice(ac,d,t,s){for(let k=0;k<7;k++)tone(ac,d,t+.04+k*rnd(.02,.06),rnd(1800,3600),rnd(1200,2600),.08,.07*s,'triangle');},
 crystal(ac,d,t,s){for(let k=0;k<4;k++)CS5.instruments.I.bell(ac,d,rnd(84,96),t+.05+k*.05,.2,.06*s,{ratio:5.4,index:1.4,len:1});},
 water(ac,d,t,s){for(let k=0;k<6;k++)tone(ac,d,t+.08+k*rnd(.05,.12),rnd(250,500),rnd(700,1200),.12,.09*s);},
 candy(ac,d,t,s){tone(ac,d,t+.02,500,120,.25,.3*s,'sine');for(let k=0;k<5;k++)tone(ac,d,t+.1+k*.05,rnd(900,1600),rnd(1600,2400),.06,.06*s,'triangle');},
 // Ramas y espinas que crujen y se astillan.
 wood(ac,d,t,s){for(let k=0;k<7;k++){const tt=t+.06+k*rnd(.03,.08);noise(ac,d,tt,.05,.12*s,'bandpass',rnd(700,1600),3);tone(ac,d,tt,rnd(180,320),rnd(90,150),.07,.08*s,'triangle');}noise(ac,d,t+.1,.9,.08*s,'bandpass',2400,.8,900);}
};

// ── Voces de los pugs (síntesis de formantes) ──────────────────────────────────
// Vocales caricaturescas: [F1, F2] en Hz.
const VOWEL={a:[820,1250],o:[520,900],u:[360,820],e:[560,1800],i:[330,2300]};
// Curvas de voz: tono (Hz relativos), vocales de inicio/fin, duración, vibrato y nivel.
const VOICE={
 light:()=>({len:rnd(.13,.19),p:[rnd(470,560),rnd(380,430)],v:[pick(['u','o']),'u'],vib:0,level:.62,breath:.15}),
 medium:()=>({len:rnd(.28,.38),p:[rnd(520,600),rnd(760,860),rnd(400,460)],v:[pick(['a','o']),pick(['u','o'])],vib:6,level:.8,breath:.2}),
 heavy:()=>({len:rnd(.52,.68),p:[rnd(620,700),rnd(1050,1200),rnd(950,1050),rnd(380,450)],v:['a',pick(['i','e'])],vib:9.5,level:1.15,breath:.28}),
 death:()=>({len:rnd(.85,1.05),p:[rnd(820,900),rnd(980,1060),rnd(520,600),rnd(190,230)],v:['a','o'],vib:7,level:1.1,breath:.24})
};
function voice(ac,dest,t,kind,pitch=1){
 const c=VOICE[kind](),len=c.len,src=ac.createOscillator(),g=ac.createGain(),mix=ac.createGain(),out=ac.createGain();
 src.type='sawtooth';
 const steps=c.p.length-1;src.frequency.setValueAtTime(c.p[0]*pitch,t);
 for(let i=1;i<=steps;i++)src.frequency.exponentialRampToValueAtTime(c.p[i]*pitch,t+len*i/steps);
 const nodes=[src,g,mix,out];
 if(c.vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=c.vib;lg.gain.value=c.p[0]*pitch*.045;l.connect(lg);lg.connect(src.frequency);l.start(t);l.stop(t+len+.05);nodes.push(l,lg);}
 // Dos formantes en paralelo que se deslizan de una vocal a otra.
 const [a,b]=[VOWEL[c.v[0]],VOWEL[c.v[1]]];
 for(let k=0;k<2;k++){const f=ac.createBiquadFilter(),fg=ac.createGain();f.type='bandpass';f.Q.value=k?7:5;f.frequency.setValueAtTime(a[k],t);f.frequency.linearRampToValueAtTime(b[k],t+len*.85);fg.gain.value=k?2.2:3.2;src.connect(f);f.connect(fg);fg.connect(mix);nodes.push(f,fg);}
 // Algo de cuerpo grave directo para que no suene a silbido.
 const body=ac.createBiquadFilter(),bg=ac.createGain();body.type='lowpass';body.frequency.value=900;bg.gain.value=.35;src.connect(body);body.connect(bg);bg.connect(mix);nodes.push(body,bg);
 mix.connect(g);g.connect(out);out.connect(dest);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(c.level,t+.018);g.gain.setValueAtTime(c.level*.9,t+len*.7);g.gain.exponentialRampToValueAtTime(.0001,t+len);
 out.gain.value=.55;
 src.start(t);src.stop(t+len+.05);done(nodes,ac,t+len);
 // Aliento: soplido filtrado al principio.
 if(c.breath)noise(ac,dest,t,len*.6,c.breath*.5,'bandpass',a[1]*1.4,1.5);
 return len;
}

// Límite de voces simultáneas por tipo (racimos, cadenas de minas, varios heridos).
const LIMITS={explosion:[5,.25],nuclear:[2,.4],hurt:[3,.15],death:[3,.3],shot:[4,.12],bounce:[4,.1],splash:[3,.2]};
const recentByCtx=new WeakMap();
function gate(ac,kind){const lim=LIMITS[kind];if(!lim)return true;let recent=recentByCtx.get(ac);if(!recent)recentByCtx.set(ac,recent={});const now=ac.currentTime,list=(recent[kind]||(recent[kind]=[])).filter(x=>now-x<lim[1]);recent[kind]=list;if(list.length>=lim[0])return false;list.push(now);return true;}

const sfx={
 stats:{},
 // Posición sonora relativa a la cámara: pan (-1..1) y distancia normalizada (0..1).
 positional(x,y){const v=window.PocketSiege?.view;if(!v||x==null)return null;const half=v.width/v.scale/2;return {pan:(x-v.x)/Math.max(200,half*1.3),dist:Math.min(1,Math.max(0,(Math.abs(x-v.x)-half*.6)/(half*2.2)))};},
 // Nivel de daño → tipo de quejido.
 painKind(amount){return amount>=35?'heavy':amount>=15?'medium':'light';},
 play(audio,kind,strength=1,opts={}){
  const ac=audio.context,base=audio.effectsGain;if(!ac||!base)return false;
  const voiceBus=audio.voiceGain||base;
  const t=ac.currentTime+.005,app=window.PocketSiege?.state;
  if(!gate(ac,kind))return true;
  sfx.stats[kind]=(sfx.stats[kind]||0)+1;
  if(kind==='shot'){const fam=WEAPON_FAMILY[app?.weapon]||'launch';SHOTS[fam](ac,spatial(ac,base,opts.pos,.45),t);return true;}
  if(kind==='explosion'||kind==='nuclear'){
   const nuke=kind==='nuclear',heavy=nuke||HEAVY.has(app?.weapon)||strength>=1.3;
   const s=Math.max(.4,Math.min(2.4,strength)),d=spatial(ac,base,opts.pos,.4),p=rnd(.9,1.1),lv=Math.min(1.4,.65+s*.4);
   // 1. Chasquido inicial.
   click(ac,d,t,.9*lv,2600);noise(ac,d,t,.07,.6*lv,'bandpass',1800,.8);
   // 2. Golpe sub-grave.
   thump(ac,d,t,1.1*lv,(nuke?80:115)*p,(nuke?24:34)*p,(nuke?1.3:.55)+s*.2);
   // 3. Cuerpo de la explosión.
   noise(ac,d,t,(nuke?1.5:.55)+s*.3,.8*lv,'lowpass',(nuke?1600:2600)*p,.7,170);
   // 4. Escombros que caen.
   const bits=Math.round(4+s*5);for(let k=0;k<bits;k++){const tt=t+.12+rnd(0,.5+s*.35);tone(ac,d,tt,rnd(500,1400),rnd(200,500),.04,rnd(.04,.09)*lv,'triangle');noise(ac,d,tt,.03,rnd(.05,.1)*lv,'highpass',3500);}
   // 5. Cola ambiental (retumbo).
   tail(ac,d,t+.08,(heavy?2.6:1.3)+s*.4,(heavy?.3:.2)*lv,heavy?700:1100);
   if(heavy){thump(ac,d,t+.07,.8*lv,62,24,1.6+s*.3);noise(ac,d,t+.25,2.2,.22*lv,'lowpass',500,.5,90);audio.duck?.(nuke?.42:.6,nuke?1.6:1.1);}
   else if(s>=1)audio.duck?.(.78,.6);
   const map=app?.map??0;(MAT[MATERIAL[map]]||MAT.earth)(ac,d,t,s);
   return true;
  }
  if(kind==='hurt'){
   // `strength` es el daño recibido / 20. Pequeño retardo para no quedar tapado por el estallido.
   const kindV=sfx.painKind(strength*20),d=spatial(ac,voiceBus,opts.pos,.7);
   voice(ac,d,t+(opts.immediate?0:.07),kindV,rnd(.88,1.16));sfx.stats['hurt:'+kindV]=(sfx.stats['hurt:'+kindV]||0)+1;
   return true;
  }
  if(kind==='death'){const d=spatial(ac,voiceBus,opts.pos,.7);const len=voice(ac,d,t+.04,'death',rnd(.9,1.1));tone(ac,d,t+.04+len,140,60,.18,.25,'triangle');return true;}
  if(kind==='jump'){tone(ac,base,t,rnd(280,340),rnd(600,720),.12,.16,'triangle');return true;}
  if(kind==='bounce'){tone(ac,base,t,rnd(220,300),rnd(110,140),.1,.18,'sine');return true;}
  if(kind==='splash'){noise(ac,base,t,.5,.4,'bandpass',1800,.8,600);for(let k=0;k<4;k++)tone(ac,base,t+.05+k*.06,rnd(400,700),rnd(900,1400),.08,.07);return true;}
  if(kind==='turn'){CS5.instruments.I.bell(ac,base,79,t,.1,.1,{ratio:3,index:.8,len:.6});CS5.instruments.I.bell(ac,base,86,t+.09,.1,.1,{ratio:3,index:.8,len:.8});return true;}
  if(kind==='victory'){const I=CS5.instruments.I;[[0,67],[.14,72],[.28,76],[.42,79],[.62,84]].forEach(([k,m])=>I.brass(ac,base,m,t+k,k>.5?.8:.16,.5));I.timpani?.(ac,base,43,t,1,.4);return true;}
  return false;
 }
};

// --- Ambientes continuos por mapa -----------------------------------------------
const AMB={
 tropic:{bed:[['lowpass',500,.05,.08]],chirp:{f:[2200,3200],rate:.6,v:.02}},
 neon:{bed:[['lowpass',180,.08,0],['highpass',6000,.03,.4]],hum:55},
 volcano:{bed:[['lowpass',140,.12,.15],['highpass',4000,.02,.6]]},
 snow:{bed:[['bandpass',700,.07,.25]]},
 alien:{bed:[['bandpass',1200,.03,.3]],hum:72,chirp:{f:[900,1600],rate:.35,v:.015}},
 castle:{bed:[['bandpass',500,.04,.2]],chirp:{f:[2600,3600],rate:.4,v:.015}},
 supernova:{bed:[['lowpass',90,.08,.1]],hum:41},
 harbor:{bed:[['lowpass',420,.12,.12],['highpass',5000,.05,.5]]},
 forest:{bed:[['bandpass',600,.03,.2]],chirp:{f:[4200,4600],rate:2.2,v:.012}},
 ruins:{bed:[['bandpass',420,.06,.3]]},
 sakura:{bed:[['bandpass',900,.035,.25]],chirp:{f:[2400,3000],rate:.5,v:.014}},
 desert:{bed:[['bandpass',1600,.05,.35]]},
 atlantis:{bed:[['lowpass',260,.12,.1]],chirp:{f:[300,600],rate:1.2,v:.03,bubble:true}},
 factory:{bed:[['lowpass',160,.1,0]],hum:60,clank:true},
 inferno:{bed:[['lowpass',120,.1,.15],['highpass',3500,.02,.5]]},
 candy:{bed:[['bandpass',1500,.025,.2]],chirp:{f:[1800,2600],rate:.5,v:.012}},
 // Jardín de Espinas: brisa alta entre ramas y trinos lejanos.
 thorns:{bed:[['bandpass',1100,.04,.35],['lowpass',300,.03,.2]],chirp:{f:[3000,4200],rate:.45,v:.012}}
};
const ambience={
 nodes:null,map:-1,next:0,
 update(ac,dest,mapIndex,active){
  if(!ac||!dest)return;
  const id=(window.PocketSiege?.maps?.[mapIndex]?.id)||'tropic',cfg=AMB[id]||AMB.tropic;
  if(this.map!==mapIndex||this.dest!==dest){this.stop(ac);this.build(ac,dest,cfg);this.map=mapIndex;this.dest=dest;}
  if(this.out)this.out.gain.setTargetAtTime(active?1:0,ac.currentTime,.6);
  if(!active||!cfg.chirp&&!cfg.clank)return;
  // Eventos puntuales: pájaros, grillos, burbujas, golpes metálicos lejanos.
  const now=ac.currentTime;if(now<this.next)return;
  if(cfg.chirp){const c=cfg.chirp;this.next=now+rnd(.4,1.6)/c.rate;const n=c.bubble?1:Math.ceil(rnd(1,4));for(let k=0;k<n;k++){const f=rnd(c.f[0],c.f[1]);tone(ac,this.out,now+k*.11,f,f*(c.bubble?1.8:rnd(.85,1.2)),c.bubble?.12:.07,c.v,'sine');}}
  else if(cfg.clank){this.next=now+rnd(1.5,4);CS5.instruments.I.bell(ac,this.out,rnd(55,66),now,.2,.04,{ratio:2.41,index:4,len:1.5});}
 },
 build(ac,dest,cfg){
  this.out=ac.createGain();this.out.gain.value=0;this.out.connect(dest);const nodes=[this.out];
  for(const [type,f,v,lfo] of cfg.bed){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=.6;g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(this.out);s.start();nodes.push(s,fl,g);
   if(lfo){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=.07+Math.random()*.08;lg.gain.value=v*lfo;l.connect(lg);lg.connect(g.gain);l.start();nodes.push(l,lg);}}
  if(cfg.hum){const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=cfg.hum;g.gain.value=.025;o.connect(g);g.connect(this.out);o.start();nodes.push(o,g);}
  this.nodes=nodes;
 },
 stop(ac){if(!this.nodes)return;const old=this.nodes,out=this.out;out.gain.setTargetAtTime(0,ac.currentTime,.4);setTimeout(()=>{for(const n of old){try{n.stop&&n.stop();}catch{}try{n.disconnect();}catch{}}},1600);this.nodes=null;}
};

CS5.sfx=sfx;CS5.ambience=ambience;CS5.sfxFamilies=WEAPON_FAMILY;CS5.sfxVoice=voice;
})();
