// Cooper's Siege 5.0 — Diseño sonoro.
// · Disparos propios de cada familia de armas.
// · Explosiones en capas (golpe grave, crujido, escombros) que varían con el
//   tamaño, la distancia a la cámara (volumen, filtro, paneo) y el material del
//   escenario (hielo, metal, lava, azúcar, bajo el agua…).
// · Voces caricaturescas de los pugs (gañidos, quejidos, «¡hup!»).
// · Ambientes continuos por mapa (viento, olas, lluvia, lava, ciudad, grillos…).
// Variaciones aleatorias de tono y volumen para evitar la repetición.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const rnd=(a,b)=>a+Math.random()*(b-a);

function noiseBuf(ac){return CS5.instruments.noise(ac);}
function env(g,t,peak,a,len){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+len);}
function done(nodes,ac,t){setTimeout(()=>{for(const n of nodes)try{n.disconnect();}catch{}},Math.max(60,(t-ac.currentTime)*1000+200));}
function noise(ac,dest,t,len,v,type,f,q=1,f2){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf(ac);s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+len);fl.Q.value=q;env(g,t,v,.005,len);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*.8);s.stop(t+len+.05);done([s,fl,g],ac,t+len);}
function tone(ac,dest,t,f0,f1,len,v,type='sine',a=.004){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+len*.8);env(g,t,v,a,len);o.connect(g);g.connect(dest);o.start(t);o.stop(t+len+.05);done([o,g],ac,t+len);}
// Bus espacial: paneo y paso bajo según la distancia a la cámara.
function spatial(ac,dest,pos){if(!pos)return dest;const g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';const d=Math.min(1,pos.dist||0);lp.frequency.value=18000*Math.pow(.12,d);g.gain.value=1-d*.7;let node=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pos.pan||0));lp.connect(p);p.connect(dest);}else lp.connect(dest);g.connect(lp);done([g,lp],ac,ac.currentTime+3);return g;}

const WEAPON_FAMILY={rocket:'launch',super:'heavyLaunch',homing:'launch',salvo:'mortar',drill:'drill',grenade:'throw',cluster:'throw',banana:'throw',ice:'throw',sticky:'throw',holy:'holy',acid:'throw',blackhole:'void',mine:'drop',dynamite:'drop',shotgun:'shotgun',sniper:'rifle',flame:'flame',tesla:'zap',orbital:'radio',airstrike:'radio',meteor:'radio',teleport:'warp',medkit:'chime',shield:'bubble',bat:'swing',saw:'saw',vampire:'screech'};
// Material sonoro dominante de cada mapa (por índice).
const MATERIAL=['earth','metal','lava','ice','crystal','stone','metal','metal','earth','rubble','earth','sand','water','metal','lava','candy'];

const SHOTS={
 launch(ac,d,t){noise(ac,d,t,.45,.5,'bandpass',600,1.2,2400);tone(ac,d,t,140,60,.25,.5);},
 heavyLaunch(ac,d,t){noise(ac,d,t,.8,.6,'bandpass',300,1,1800);tone(ac,d,t,90,35,.6,.7);tone(ac,d,t+.05,420,140,.4,.15,'sawtooth');},
 mortar(ac,d,t){for(let k=0;k<3;k++){tone(ac,d,t+k*.09,180,70,.18,.45);noise(ac,d,t+k*.09,.12,.25,'lowpass',1400);}},
 drill(ac,d,t){tone(ac,d,t,90,260,.5,.2,'sawtooth');noise(ac,d,t,.5,.25,'bandpass',1800,4);},
 throw(ac,d,t){noise(ac,d,t,.22,.35,'bandpass',900,2,3200);tone(ac,d,t+.02,2200,1800,.06,.08,'triangle');},
 drop(ac,d,t){tone(ac,d,t,320,180,.12,.25,'triangle');noise(ac,d,t,.08,.15,'lowpass',900);},
 shotgun(ac,d,t){noise(ac,d,t,.35,.9,'lowpass',2600);tone(ac,d,t,120,45,.3,.7);tone(ac,d,t+.28,900,700,.05,.12,'square');tone(ac,d,t+.36,700,500,.05,.1,'square');},
 rifle(ac,d,t){noise(ac,d,t,.12,1,'highpass',1800);tone(ac,d,t,1800,300,.15,.3,'sawtooth');noise(ac,d,t+.1,1.1,.12,'bandpass',900,6);},
 flame(ac,d,t){noise(ac,d,t,.9,.55,'lowpass',800,.7,2200);noise(ac,d,t,.9,.2,'bandpass',300,1);},
 zap(ac,d,t){for(let k=0;k<6;k++)tone(ac,d,t+k*.03,rnd(600,1800),rnd(200,600),.05,.18,'square');noise(ac,d,t,.3,.2,'highpass',4000);},
 radio(ac,d,t){tone(ac,d,t,1400,0,.08,.15,'square');tone(ac,d,t+.12,1400,0,.08,.15,'square');noise(ac,d,t+.2,.4,.12,'bandpass',2200,3);},
 warp(ac,d,t){tone(ac,d,t,220,1800,.45,.25,'sine');tone(ac,d,t+.08,1600,300,.4,.12,'triangle');},
 chime(ac,d,t){for(const [k,m] of [[0,76],[.08,81],[.16,88]])CS5.instruments.I.bell(ac,d,m,t+k,.3,.12,{ratio:3,index:1,len:1});},
 bubble(ac,d,t){for(let k=0;k<4;k++)tone(ac,d,t+k*.05,rnd(300,500),rnd(700,1100),.1,.12);},
 swing(ac,d,t){noise(ac,d,t,.25,.5,'bandpass',500,1.5,2600);},
 saw(ac,d,t){tone(ac,d,t,300,900,.5,.18,'sawtooth');noise(ac,d,t,.5,.15,'bandpass',3000,6);},
 screech(ac,d,t){tone(ac,d,t,2400,1200,.25,.15,'sawtooth');tone(ac,d,t+.1,2600,1500,.2,.1,'sawtooth');},
 holy(ac,d,t){SHOTS.throw(ac,d,t);for(const [k,m] of [[0,72],[.06,76],[.12,79]])CS5.instruments.I.bell(ac,d,m,t+k,.4,.08,{ratio:2,index:.8,len:1.4});},
 void(ac,d,t){tone(ac,d,t,60,30,.8,.5);noise(ac,d,t,.7,.2,'lowpass',400,1,120);}
};

// Capa de material de la explosión.
const MAT={
 earth(ac,d,t,s){noise(ac,d,t+.06,.6+s*.3,.18*s,'lowpass',900);},
 sand(ac,d,t,s){noise(ac,d,t+.05,1+s*.4,.2*s,'bandpass',2600,.6);},
 rubble(ac,d,t,s){for(let k=0;k<8;k++)tone(ac,d,t+.1+k*rnd(.04,.09),rnd(300,900),rnd(150,300),.06,.08*s,'triangle');},
 stone(ac,d,t,s){for(let k=0;k<6;k++)tone(ac,d,t+.08+k*rnd(.05,.1),rnd(500,1200),rnd(300,600),.05,.07*s,'triangle');},
 metal(ac,d,t,s){CS5.instruments.I.bell(ac,d,rnd(60,72),t+.03,.2,.18*s,{ratio:2.41,index:4,len:1.2+s*.6});noise(ac,d,t+.05,.3,.12*s,'highpass',3000);},
 lava(ac,d,t,s){noise(ac,d,t+.1,1.4,.16*s,'highpass',2500);tone(ac,d,t,50,28,1.2,.4*s);},
 ice(ac,d,t,s){for(let k=0;k<7;k++)tone(ac,d,t+.04+k*rnd(.02,.06),rnd(1800,3600),rnd(1200,2600),.08,.06*s,'triangle');},
 crystal(ac,d,t,s){for(let k=0;k<4;k++)CS5.instruments.I.bell(ac,d,rnd(84,96),t+.05+k*.05,.2,.05*s,{ratio:5.4,index:1.4,len:1});},
 water(ac,d,t,s){for(let k=0;k<6;k++)tone(ac,d,t+.08+k*rnd(.05,.12),rnd(250,500),rnd(700,1200),.12,.08*s);},
 candy(ac,d,t,s){tone(ac,d,t+.02,500,120,.25,.3*s,'sine');for(let k=0;k<5;k++)tone(ac,d,t+.1+k*.05,rnd(900,1600),rnd(1600,2400),.06,.05*s,'triangle');}
};

const sfx={
 // Posición sonora relativa a la cámara: pan (-1..1) y distancia normalizada (0..1).
 positional(x,y){const v=window.PocketSiege?.view;if(!v||x==null)return null;const half=v.width/v.scale/2;return {pan:(x-v.x)/Math.max(200,half*1.3),dist:Math.min(1,Math.max(0,(Math.abs(x-v.x)-half*.6)/(half*2.2)))};},
 play(audio,kind,strength=1,opts={}){
  const ac=audio.context,base=audio.effectsGain;if(!ac||!base)return false;
  const t=ac.currentTime+.005,app=window.PocketSiege?.state;
  if(kind==='shot'){const fam=WEAPON_FAMILY[app?.weapon]||'launch';SHOTS[fam](ac,spatial(ac,base,opts.pos),t);return true;}
  if(kind==='explosion'||kind==='nuclear'){
   const s=Math.max(.4,Math.min(2.2,strength)),d=spatial(ac,base,opts.pos),big=kind==='nuclear';
   const p=rnd(.88,1.12);
   tone(ac,d,t,(big?70:110)*p,(big?22:35)*p,(big?1.6:.7)+s*.25,.75*Math.min(1.3,s));
   noise(ac,d,t,(big?1.6:.5)+s*.25,.65*Math.min(1.4,s),'lowpass',(big?1400:2400)*p,.7,180);
   noise(ac,d,t,.09,.5,'highpass',2500);
   if(big){tone(ac,d,t+.25,40,24,2.5,.5);noise(ac,d,t+.3,2.4,.2,'lowpass',500,.5,90);}
   const map=app?.map??0;(MAT[MATERIAL[map]]||MAT.earth)(ac,d,t,s);
   return true;
  }
  if(kind==='hurt'){const p=rnd(.85,1.25),heavy=strength>1;// Gañido caricaturesco: onda cuadrada por un formante que sube y baja.
   const o=ac.createOscillator(),bp=ac.createBiquadFilter(),g=ac.createGain();o.type='square';o.frequency.setValueAtTime(520*p,t);o.frequency.linearRampToValueAtTime(880*p,t+.05);o.frequency.exponentialRampToValueAtTime((heavy?260:420)*p,t+(heavy?.45:.18));bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=3;env(g,t,.22,.01,heavy?.5:.22);o.connect(bp);bp.connect(g);g.connect(base);o.start(t);o.stop(t+.6);done([o,bp,g],ac,t+.6);return true;}
  if(kind==='death'){const p=rnd(.9,1.1);tone(ac,base,t,700*p,180*p,.55,.18,'square');tone(ac,base,t+.5,90,40,.3,.4);noise(ac,base,t+.5,.25,.3,'lowpass',1600);return true;}
  if(kind==='jump'){tone(ac,base,t,rnd(280,340),rnd(600,720),.12,.14,'triangle');return true;}
  if(kind==='bounce'){tone(ac,base,t,rnd(220,300),rnd(110,140),.1,.16,'sine');return true;}
  if(kind==='splash'){noise(ac,base,t,.5,.35,'bandpass',1800,.8,600);for(let k=0;k<4;k++)tone(ac,base,t+.05+k*.06,rnd(400,700),rnd(900,1400),.08,.06);return true;}
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
 candy:{bed:[['bandpass',1500,.025,.2]],chirp:{f:[1800,2600],rate:.5,v:.012}}
};
const ambience={
 nodes:null,map:-1,next:0,
 update(ac,dest,mapIndex,active){
  if(!ac||!dest)return;
  const id=(window.PocketSiege?.maps?.[mapIndex]?.id)||'tropic',cfg=AMB[id]||AMB.tropic;
  if(this.map!==mapIndex){this.stop(ac);this.build(ac,dest,cfg);this.map=mapIndex;}
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

CS5.sfx=sfx;CS5.ambience=ambience;CS5.sfxFamilies=WEAPON_FAMILY;
})();
