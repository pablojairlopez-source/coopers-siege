// Cooper's Siege 5.0 — Compositor procedural y música adaptativa.
// Interpreta las partituras de src/audio/songs.js:
// · Forma larga por secciones (intro, A, B, puente, clímax…) que se recorre en
//   ciclos; cada ciclo aplica variaciones al motivo (inversión, octava,
//   ornamentos, desplazamiento rítmico, cambio de instrumento), de modo que la
//   música no se repite de forma reconocible durante varios minutos.
// · Melodía derivada del motivo de cada canción, ajustada a las notas del acorde
//   en los tiempos fuertes, con contracanto y notas guía.
// · Capas (colchón, bajo, batería, percusión, arpegio, acordes, melodía,
//   contracanto) con ganancia propia: los 8 estados de juego las mezclan con
//   transiciones suaves y saltan de sección en los compases (clímax, respiro,
//   victoria, derrota).
// · Reverb por convolución (respuesta generada) y eco sincronizado al tempo.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const LAYERS=['pad','bass','drums','perc','arp','chords','lead','counter'];

// Mezcla por estado (ganancia relativa por capa) y ajuste de tempo.
const STATE_MIX={
 MENU:{mix:{pad:1,bass:1,drums:1,perc:1,arp:1,chords:1,lead:1,counter:1},tempo:1},
 A:{mix:{pad:1,bass:.75,drums:.25,perc:.8,arp:1,chords:.75,lead:.85,counter:.35},tempo:1,label:'Exploración'},
 B:{mix:{pad:.9,bass:1,drums:1,perc:1,arp:.9,chords:1,lead:1,counter:.75},tempo:1,label:'Combate'},
 C:{mix:{pad:.9,bass:1.1,drums:1.05,perc:1.15,arp:1,chords:1,lead:1,counter:1},tempo:1.02,label:'Peligro'},
 D:{mix:{pad:1,bass:1.15,drums:1.15,perc:1.2,arp:1.05,chords:1.05,lead:1.1,counter:1.1},tempo:1.04,label:'Clímax'},
 E:{mix:{pad:1.1,bass:.7,drums:.2,perc:.45,arp:.55,chords:.4,lead:.8,counter:.4},tempo:.97,label:'Último aliento'},
 F:{mix:{pad:1,bass:1,drums:1,perc:1,arp:1,chords:1,lead:1.1,counter:1},tempo:1,label:'Victoria'},
 G:{mix:{pad:1.1,bass:.5,drums:0,perc:.2,arp:.4,chords:.5,lead:.75,counter:.4},tempo:.86,label:'Derrota'}
};
const STATE_SECTION={D:'climax',E:'breakdown',F:'victory',G:'defeat'};

function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

function makeImpulse(ac,seconds,decay,seed){const len=Math.max(1,Math.floor(ac.sampleRate*seconds)),b=ac.createBuffer(2,len,ac.sampleRate),r=rng(seed);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++){const t=i/len;d[i]=(r()*2-1)*Math.pow(1-t,decay)*(i<ac.sampleRate*.012?i/(ac.sampleRate*.012):1);}}return b;}

// Grado de escala → semitonos (admite grados negativos y por encima de la octava).
function semi(scale,deg){const n=scale.length,o=Math.floor(deg/n),i=((deg%n)+n)%n;return scale[i]+o*12;}

// Patrones de texto: 'x' golpe, 'X' acento, 'o' suave, '-' silencio.
function vel(ch){return ch==='X'?1.25:ch==='x'?1:ch==='o'?.5:0;}

const composer={
 ac:null,out:null,layers:{},song:null,state:'MENU',next:0,step:0,bar:0,cycle:0,form:0,sectionName:'intro',sectionBar:0,
 pending:null,lastLead:null,rand:Math.random,enabled:true,
 init(ac,dest){
  if(this.ac===ac)return;
  this.ac=ac;
  this.out=ac.createGain();this.out.gain.value=1;
  this.filter=ac.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=20000;this.filter.Q.value=.5;
  this.drive=ac.createWaveShaper();this.setDrive(0);
  this.out.connect(this.drive);this.drive.connect(this.filter);this.filter.connect(dest);
  this.reverb=ac.createConvolver();this.revGain=ac.createGain();this.revGain.gain.value=.25;this.reverb.connect(this.revGain);this.revGain.connect(this.filter);
  this.delay=ac.createDelay(2);this.fb=ac.createGain();this.delWet=ac.createGain();const dlp=ac.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=2600;
  this.delay.connect(dlp);dlp.connect(this.fb);this.fb.connect(this.delay);dlp.connect(this.delWet);this.delWet.connect(this.filter);
  for(const n of LAYERS){
   const g=ac.createGain();g.gain.value=0;
   let node=g;
   if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value={pad:0,bass:0,drums:0,perc:.25,arp:-.3,chords:.18,lead:-.05,counter:.32}[n];g.connect(p);node=p;}
   node.connect(this.out);
   const rs=ac.createGain();rs.gain.value={pad:.55,bass:.05,drums:.12,perc:.25,arp:.45,chords:.35,lead:.4,counter:.45}[n];g.connect(rs);rs.connect(this.reverb);
   if(n==='lead'||n==='arp'||n==='counter'){const ds=ac.createGain();ds.gain.value=n==='arp'?.32:.22;g.connect(ds);ds.connect(this.delay);}
   this.layers[n]=g;
  }
 },
 setDrive(amount){const c=new Float32Array(512);for(let i=0;i<512;i++){const x=i/256-1;c[i]=amount>0?Math.tanh(x*(1+amount*6))/Math.tanh(1+amount*6):x;}this.drive.curve=c;},
 // Cambia de canción. `fromIntro` empieza por la introducción (inicio de batalla).
 play(song,fromIntro=true){
  if(!this.ac)return;
  const ac=this.ac,now=ac.currentTime;
  if(this.song!==song){
   this.song=song;
   const fx=song.fx||{};
   this.reverb.buffer=makeImpulse(ac,fx.reverb||2.2,fx.decay||3,hashStr(song.id));
   this.revGain.gain.setTargetAtTime(fx.wet??.28,now,.2);
   const beat=60/song.tempo;this.delay.delayTime.setTargetAtTime(Math.min(1.9,beat*(fx.delayBeats||.75)),now,.05);
   this.fb.gain.setTargetAtTime(fx.feedback??.32,now,.1);this.delWet.gain.setTargetAtTime(fx.delayWet??.25,now,.1);
   this.setDrive(fx.drive||0);
   this.baseCut=fx.cutoff||20000;
   this.filter.frequency.setTargetAtTime(this.baseCut,now,.3);
   this.rand=rng(hashStr(song.id)^0x51ed27);
  }
  this.cycle=0;this.form=0;this.sectionBar=0;this.bar=0;this.step=0;this.pending=null;this.occ=0;this.special=0;
  this.sectionName=fromIntro&&song.sections.intro?'intro':song.form[0];
  if(!fromIntro&&song.form[0]==='intro')this.form=1,this.sectionName=song.form[1];
  this.next=Math.max(now+.05,this.next);
  if(fromIntro&&song.sections.intro)CS5.instruments.D.riser(ac,this.layers.perc,now+.02,.7,Math.min(2.5,this.barDur()*.9));
 },
 stop(){this.song=null;for(const n of LAYERS)this.layers[n]&&this.layers[n].gain.setTargetAtTime(0,this.ac.currentTime,.3);},
 barDur(){const s=this.song;return 60/(s.tempo*this.tempoMul())*s.meter;},
 tempoMul(){return (STATE_MIX[this.state]||STATE_MIX.B).tempo;},
 stepsPerBar(){return this.song.meter*this.song.sub;},
 // Estado adaptativo: mezcla de capas y, si corresponde, salto de sección en el próximo compás.
 setState(st,force=false){
  if(!this.ac||!this.song)return;
  const changed=st!==this.state;this.state=st;
  const now=this.ac.currentTime,mix=(STATE_MIX[st]||STATE_MIX.B).mix,lv=this.song.levels||{};
  // 5.1: `CS5.musicTrim` (src/audio/loudness.js) iguala la sonoridad percibida entre canciones.
  const trim=CS5.musicTrim?.[this.song.id]??1;
  for(const n of LAYERS){const target=(mix[n]??1)*(lv[n]??1)*(this.song.gain||1)*trim;this.layers[n].gain.setTargetAtTime(target,now,force?.05:1.1);}
  this.filter.frequency.setTargetAtTime(st==='G'?Math.min(this.baseCut,1400):st==='E'?Math.min(this.baseCut,3200):this.baseCut,now,.8);
  if(changed){const want=STATE_SECTION[st];if(want&&this.song.sections[want]&&this.sectionName!==want)this.pending=want;else if(!want&&STATE_SECTION[this.prevState])this.pending='__resume';}
  this.prevState=st;
 },
 section(){return this.song.sections[this.sectionName]||this.song.sections[this.song.form[0]];},
 advanceBar(){
  const sec=this.section();
  this.sectionBar++;
  if(this.pending){const p=this.pending;this.pending=null;
   if(p==='__resume'){this.sectionName=this.song.form[this.form%this.song.form.length];this.occ=this.countOcc();}else{this.sectionName=p;this.occ=++this.special;}this.sectionBar=0;return;}
  if(this.sectionBar>=sec.bars){
   this.sectionBar=0;
   const special=STATE_SECTION[this.state];
   if(special&&this.song.sections[special]){this.sectionName=special;this.occ=++this.special;return;}
   this.form++;
   if(this.form>=this.song.form.length){this.form=this.song.form[0]==='intro'?1:0;this.cycle++;}
   this.sectionName=this.song.form[this.form];this.occ=this.countOcc();
  }
 },
 countOcc(){const f=this.song.form,n=this.sectionName;let k=0;for(let i=0;i<this.form;i++)if(f[i]===n)k++;return k;},
 // Variación del motivo: ciclo de la forma, aparición de la sección y frase dentro de ella.
 variantFor(sec,barInSec){return ((this.cycle+(sec.var||0)+(this.occ||0)+Math.floor(barInSec/4))%4+4)%4;},
 chordAt(sec,barInSec,half){const p=sec.prog[barInSec%sec.prog.length];return Array.isArray(p)?p[Math.min(p.length-1,half)]:p;},
 chordTones(deg,n=4){const out=[];for(let k=0;k<n;k++)out.push(deg+k*2);return out;},
 // Melodía del compás: motivo + transformaciones según posición en la frase y ciclo.
 // 5.1: `sec.melody` puede ser una lista de motivos (uno por frase de 4 compases) y
 // `sec.literal` respeta la melodía escrita la primera vez (sin secuencia ni cadencia
 // automáticas); en las reapariciones se aplican las variaciones.
 motifName(sec,barInSec,key='melody'){const m=sec[key];if(!Array.isArray(m))return m;return m[Math.floor(barInSec/4)%m.length];},
 literalBar(motif,barInSec,spb){const mBars=Math.max(1,Math.ceil(Math.max(...motif.map(n=>n[0]+1))/spb)),src=(barInSec%4)%mBars;return motif.filter(n=>Math.floor(n[0]/spb)===src).map(n=>[n[0]%spb,n[1],n[2],n[3]??1]);},
 melodyBar(sec,barInSec){
  const s=this.song,motif=s.motifs[this.motifName(sec,barInSec)];if(!motif)return [];
  const spb=this.stepsPerBar(),mBars=Math.max(1,Math.ceil(Math.max(...motif.map(n=>n[0]+1))/spb));
  const phrasePos=barInSec%4,src=phrasePos%mBars;
  let notes=motif.filter(n=>Math.floor(n[0]/spb)===src).map(n=>[n[0]%spb,n[1],n[2],n[3]??1]);
  const variant=this.variantFor(sec,barInSec);
  if(sec.literal){
   // Primera aparición: tal cual. Reapariciones: ornamentos o desplazamiento rítmico alternos.
   const v=(this.cycle+(this.occ||0))%3;
   if(v===1){const out=[];for(let i=0;i<notes.length;i++){const n=notes[i],nx=notes[i+1];out.push(n);if(nx&&nx[0]-n[0]>=4&&Math.abs(nx[2]-n[2])>=2){out[out.length-1]=[n[0],Math.floor((nx[0]-n[0])/2),n[2],n[3]];out.push([n[0]+Math.floor((nx[0]-n[0])/2),Math.ceil((nx[0]-n[0])/2),n[2]+Math.sign(nx[2]-n[2]),.75]);}}notes=out;}
   if(v===2)notes=notes.map((n,i)=>i%3===1&&n[0]+1<spb&&n[1]>1?[n[0]+1,n[1]-1,n[2],n[3]]:n);
   return notes;
  }
  // Secuencia: el tercer compás de cada frase repite el motivo desplazado.
  if(phrasePos===2)notes=notes.map(n=>[n[0],n[1],n[2]+(s.seq??2),n[3]]);
  // Cadencia: el último compás de la frase termina en nota larga del acorde.
  if(phrasePos===3&&notes.length){const last=notes[notes.length-1];const ch=this.chordAt(sec,barInSec,1);notes=notes.filter(n=>n!==last);notes.push([last[0],Math.max(last[1],spb-last[0]),ch+(variant%2?2:0),1]);}
  if(variant===1){const pivot=notes[0]?.[2]??0;notes=notes.map((n,i)=>i?[n[0],n[1],pivot-(n[2]-pivot),n[3]]:n);}
  if(variant===2){const out=[];for(let i=0;i<notes.length;i++){const n=notes[i],nx=notes[i+1];out.push(n);if(nx&&nx[0]-n[0]>=3&&n[1]>=2&&Math.abs(nx[2]-n[2])>=2){out[out.length-1]=[n[0],Math.floor((nx[0]-n[0])/2),n[2],n[3]];out.push([n[0]+Math.floor((nx[0]-n[0])/2),Math.ceil((nx[0]-n[0])/2),n[2]+Math.sign(nx[2]-n[2]),.7]);}}notes=out;}
  if(variant===3)notes=notes.map((n,i)=>i%2&&n[0]+1<spb?[n[0]+1,Math.max(1,n[1]-1),n[2],n[3]]:n);
  // Notas de los tiempos fuertes ajustadas al acorde.
  return notes.map(n=>{const beatStrong=n[0]%(s.sub*2)===0;if(!beatStrong)return n;const ch=this.chordAt(sec,barInSec,n[0]>=spb/2?1:0);const tones=this.chordTones(ch,3);let best=n[2],bd=99;for(const tn of tones)for(const o of [-7,0,7]){const d=Math.abs(tn+o-n[2]);if(d<bd){bd=d;best=tn+o;}}return bd<=1?[n[0],n[1],best,n[3]]:n;});
 },
 // Programa los pasos hasta `until` (segundos del AudioContext).
 schedule(until){
  if(!this.ac||!this.song||!this.enabled)return;
  const ac=this.ac,s=this.song,I=CS5.instruments.I,D=CS5.instruments.D;
  if(this.next<ac.currentTime-.2)this.next=ac.currentTime+.05;
  let guard=0;
  while(this.next<until&&guard++<64){
   const t=this.next,sec=this.section(),spb=this.stepsPerBar(),st=this.step;
   const stepDur=60/(s.tempo*this.tempoMul()*(sec.tempo||1))/s.sub;
   const swing=(st%2===1)?stepDur*(s.swing||0):0,tt=t+swing;
   const barInSec=this.sectionBar,half=st>=spb/2?1:0;
   const chord=this.chordAt(sec,barInSec,half),root=s.root+(sec.key||0);
   const note=d=>root+semi(s.scale,d);
   // 5.1: `sec.inst` cambia la instrumentación de una sección.
   const L=sec.layers||{},inst=sec.inst?{...s.inst,...sec.inst}:s.inst,energy=sec.energy??.7;
   const variant=this.variantFor(sec,barInSec);
   // Colchón: acorde sostenido por medio compás o compás.
   if(L.pad!==false&&inst.pad&&(st===0||(st===spb/2&&Array.isArray(sec.prog[barInSec%sec.prog.length])))){
    const len=Array.isArray(sec.prog[barInSec%sec.prog.length])?spb/2:spb;
    for(const d of this.chordTones(chord,s.padNotes||3))I[inst.pad](ac,this.layers.pad,note(d)+(s.padOct??0),tt,len*stepDur*.98,.18);
   }
   // Acordes rítmicos (rasgueo, stabs, órgano…).
   const cp=s.patterns.chords?.[L.chords];
   if(cp&&inst.chords){const ch=cp[st%cp.length],v=vel(ch);if(v){for(const [k,d] of this.chordTones(chord,3).entries())I[inst.chords](ac,this.layers.chords,note(d)+(s.chordOct??0),tt+k*(s.strum||0),stepDur*(s.chordLen||1.6),.16*v);}}
   // Arpegio.
   const ap=s.patterns.arp?.[L.arp];
   if(ap&&inst.arp){const tok=ap[st%ap.length];if(tok!=='-'){const idx=+tok,d=chord+(idx%4)*2+(idx>=4?7:0);I[inst.arp](ac,this.layers.arp,note(d)+(s.arpOct??12)+(variant===2&&energy>.6?12:0),tt,stepDur*(s.arpLen||1.4),.2*(st%s.sub===0?1:.75));}}
   // Bajo.
   const bp=s.patterns.bass?.[L.bass];
   if(bp&&inst.bass){const tok=bp[st%bp.length];if(tok!=='-'&&tok!=='~'){let d=chord;if(tok==='5')d=chord+4;else if(tok==='3')d=chord+2;else if(tok==='7')d=chord+6;else if(tok==='8')d=chord+7;else if(tok==='b'){const nx=this.chordAt(sec,barInSec+1,0);d=nx-1;}let len=1;for(let k=st+1;k<spb&&bp[k%bp.length]==='~';k++)len++;I[inst.bass](ac,this.layers.bass,note(d)+(s.bassOct??-24),tt,stepDur*len*.95,.42*(st%s.sub===0?1:.8),{accent:st%4===0});}}
   // Batería y percusión.
   for(const [layerName,patName] of [['drums',L.drums],['perc',L.perc]]){
    const dp=s.patterns.drums?.[patName];if(!dp)continue;
    for(const [instName,str] of Object.entries(dp)){const v=vel(str[(this.bar%Math.max(1,Math.floor(str.length/spb)))*spb+st]??str[st%str.length]);if(v&&D[instName])D[instName](ac,this.layers[layerName],tt,.5*v);}
   }
   // Redoble de transición en el último compás de la sección.
   if(sec.fill!==false&&barInSec===sec.bars-1&&st>=spb-s.sub&&energy>.5&&inst.fill)D[inst.fill](ac,this.layers.drums,tt,.35+.12*(st-(spb-s.sub)));
   // Melodía y contracanto.
   if(sec.melody&&inst.lead){
    if(st===0)this.barMelody=this.melodyBar(sec,barInSec);
    const leadInst=(variant===3&&inst.lead2)?inst.lead2:inst.lead;
    for(const n of this.barMelody||[]){if(n[0]!==st)continue;const m=note(n[2])+(s.leadOct??12)+(variant===2&&sec.melody!=='B'?12:0);I[leadInst](ac,this.layers.lead,m,tt,stepDur*n[1]*.96,.34*(n[3]??1),{from:this.lastLead});this.lastLead=m;
     if(L.harmony&&inst.counter)I[inst.counter](ac,this.layers.counter,m-semi(s.scale,n[2])+semi(s.scale,n[2]-2),tt,stepDur*n[1]*.96,.2*(n[3]??1));}
   }
   // 5.1: contracanto escrito (`sec.counterMelody`), independiente de la melodía.
   if(sec.counterMelody&&inst.counter){
    if(st===0){const cm=s.motifs[this.motifName(sec,barInSec,'counterMelody')];this.barCounter=cm?this.literalBar(cm,barInSec,spb):[];}
    for(const n of this.barCounter||[]){if(n[0]!==st)continue;I[inst.counter](ac,this.layers.counter,note(n[2])+(s.counterOct??0),tt,stepDur*n[1]*.96,.22*(n[3]??1));}
   }
   else if(L.counter&&inst.counter&&(st===0||st===spb/2)){const d=chord+(st===0?2:6);I[inst.counter](ac,this.layers.counter,note(d)+(s.counterOct??0),tt,stepDur*spb/2*.95,.2);}
   // Latido en «último aliento».
   if(this.state==='E'&&st%(s.sub*2)===0)D.heartbeat(ac,this.layers.drums,tt,.6);
   this.next+=stepDur;this.step++;
   if(this.step>=spb){this.step=0;this.bar++;this.advanceBar();}
  }
 },
 describe(){if(!this.song)return '';const sec=this.sectionName,names={intro:'Introducción',A:'Tema A',A2:'Tema A′',A3:'Tema A″',B:'Tema B',B2:'Tema B′',C:'Desarrollo',C2:'Desarrollo II',D:'Segunda melodía',D2:'Segunda melodía II',dev:'Modulación',stop:'Sorpresa',bridge:'Puente',breakdown:'Respiro',climax:'Clímax',climax2:'Gran clímax',victory:'Victoria',defeat:'Derrota',outro:'Coda'};return names[sec]||sec;},
 STATE_MIX,LAYERS
};
CS5.composer=composer;
})();
