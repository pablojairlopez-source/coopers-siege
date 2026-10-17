// Cooper's Siege 5.0 — Instrumentos sintetizados con Web Audio.
// Cada instrumento programa sus propios nodos para una nota (y se desconectan
// solos al terminar). No se usan muestras grabadas: todo es original y ligero.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const hz=m=>440*Math.pow(2,(m-69)/12);
let pulse25=null,noiseBuf=null;

function noise(ac){if(noiseBuf&&noiseBuf.sampleRate===ac.sampleRate)return noiseBuf;const b=ac.createBuffer(1,ac.sampleRate*1.2,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return noiseBuf=b;}
function pulse(ac){if(pulse25)return pulse25;const n=32,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++){im[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*.25);}return pulse25=ac.createPeriodicWave(re,im);}

// Envolvente ADSR sobre un AudioParam.
function adsr(p,t,dur,peak,a=.005,d=.1,s=.6,r=.15){
 p.cancelScheduledValues(t);p.setValueAtTime(0.0001,t);
 p.linearRampToValueAtTime(peak,t+a);
 p.setTargetAtTime(peak*s,t+a,d/3);
 const end=t+Math.max(a+.01,dur);
 p.setTargetAtTime(0.0001,end,r/3);
 return end+r*1.5;
}
function osc(ac,type,f,t,stop,detune=0){const o=ac.createOscillator();if(type==='pulse')o.setPeriodicWave(pulse(ac));else o.type=type;o.frequency.setValueAtTime(f,t);o.detune.setValueAtTime(detune,t);o.start(t);o.stop(stop);return o;}
function gain(ac,v=0){const g=ac.createGain();g.gain.value=v;return g;}
function cleanup(nodes,stop,ac){const ms=Math.max(50,(stop-ac.currentTime)*1000+120);setTimeout(()=>{for(const n of nodes){try{n.disconnect();}catch{}}},ms);}
function vib(ac,param,t,stop,rate=5.5,depth=12,delay=.18){const l=ac.createOscillator(),g=ac.createGain();l.frequency.value=rate;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(depth,t+delay+.2);l.connect(g);g.connect(param);l.start(t);l.stop(stop);return [l,g];}
function noiseSrc(ac,t,stop){const s=ac.createBufferSource();s.buffer=noise(ac);s.loop=true;s.start(t,Math.random()*.8);s.stop(stop);return s;}

// --- Instrumentos melódicos ---------------------------------------------------------
const I={
 // Marimba: fundamental + parcial 4 que decae muy rápido + golpe de maza.
 marimba(ac,dest,m,t,dur,v){const f=hz(m),g=gain(ac),stop=t+Math.min(1.2,dur+.6);const o1=osc(ac,'sine',f,t,stop),o2=osc(ac,'sine',f*4,t,stop),g2=gain(ac);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+.9);g2.gain.setValueAtTime(v*.35,t);g2.gain.exponentialRampToValueAtTime(.0005,t+.08);o1.connect(g);o2.connect(g2);g2.connect(dest);g.connect(dest);cleanup([o1,o2,g,g2],stop,ac);},
 // Steel drum: parciales armónicos con caída de afinación al golpear.
 steel(ac,dest,m,t,dur,v){const f=hz(m),stop=t+1.1,g=gain(ac),out=[g];for(const [r,a] of [[1,1],[2,.5],[3.01,.28],[4.2,.12]]){const o=osc(ac,'sine',f*r,t,stop);o.frequency.setValueAtTime(f*r*1.015,t);o.frequency.exponentialRampToValueAtTime(f*r,t+.04);const og=gain(ac,a);o.connect(og);og.connect(g);out.push(o,og);}g.gain.setValueAtTime(v*.7,t);g.gain.exponentialRampToValueAtTime(.0005,t+Math.min(1,.35+dur));g.connect(dest);cleanup(out,stop,ac);},
 // Campana / celesta / caja de música: síntesis FM.
 bell(ac,dest,m,t,dur,v,o={}){const f=hz(m),ratio=o.ratio||3.5,stop=t+(o.len||2.2),car=osc(ac,'sine',f,t,stop),mod=osc(ac,'sine',f*ratio,t,stop),mg=gain(ac),g=gain(ac);mg.gain.setValueAtTime(f*(o.index||2.4),t);mg.gain.exponentialRampToValueAtTime(f*.05,t+(o.len||2.2)*.6);mod.connect(mg);mg.connect(car.frequency);car.connect(g);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,stop);g.connect(dest);cleanup([car,mod,mg,g],stop,ac);},
 celesta(ac,dest,m,t,dur,v){I.bell(ac,dest,m,t,dur,v*.8,{ratio:7,index:1.2,len:1.2});},
 musicbox(ac,dest,m,t,dur,v){I.bell(ac,dest,m+12,t,dur,v*.6,{ratio:5.4,index:1.5,len:1.6});},
 tubular(ac,dest,m,t,dur,v){I.bell(ac,dest,m,t,dur,v,{ratio:2.76,index:3.5,len:3.4});},
 // Rhodes: FM de relación 1 con índice decreciente y trémolo suave.
 rhodes(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+1.2,car=osc(ac,'sine',f,t,stop),mod=osc(ac,'sine',f,t,stop),mg=gain(ac),g=gain(ac);mg.gain.setValueAtTime(f*1.6,t);mg.gain.exponentialRampToValueAtTime(f*.15,t+.6);mod.connect(mg);mg.connect(car.frequency);car.connect(g);adsr(g.gain,t,dur,v,.004,.6,.35,.9);g.connect(dest);cleanup([car,mod,mg,g],stop,ac);},
 // Piano estilizado: triángulo + seno con filtro que se cierra.
 piano(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+1.4,a=osc(ac,'triangle',f,t,stop,o.detune||0),b=osc(ac,'sine',f*2,t,stop),bf=gain(ac,.25),lp=ac.createBiquadFilter(),g=gain(ac);lp.type='lowpass';lp.frequency.setValueAtTime(5200,t);lp.frequency.exponentialRampToValueAtTime(900,t+1.2);a.connect(lp);b.connect(bf);bf.connect(lp);lp.connect(g);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(v*.25,t+.5);g.gain.setTargetAtTime(.0001,t+dur,.25);g.connect(dest);cleanup([a,b,bf,lp,g],stop,ac);},
 // Piano desafinado (ruinas).
 detunedPiano(ac,dest,m,t,dur,v){I.piano(ac,dest,m,t,dur,v*.7,{detune:-22});I.piano(ac,dest,m,t+.012,dur,v*.5,{detune:19});},
 // Punteo (laúd, guitarra, ukelele, oud, koto, arpa): diente de sierra filtrado con caída rápida.
 pluck(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+(o.len||1.2),s=osc(ac,o.wave||'sawtooth',f,t,stop),lp=ac.createBiquadFilter(),g=gain(ac);lp.type='lowpass';lp.Q.value=o.q||1.5;lp.frequency.setValueAtTime(o.bright||3200,t);lp.frequency.exponentialRampToValueAtTime(o.dark||420,t+(o.len||1.2)*.5);if(o.bend){s.frequency.setValueAtTime(f*Math.pow(2,o.bend/12),t);s.frequency.exponentialRampToValueAtTime(f,t+.08);}s.connect(lp);lp.connect(g);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,stop);g.connect(dest);cleanup([s,lp,g],stop,ac);},
 harp(ac,dest,m,t,dur,v){I.pluck(ac,dest,m,t,dur,v*.9,{wave:'triangle',bright:4200,dark:900,len:1.8});},
 koto(ac,dest,m,t,dur,v){I.pluck(ac,dest,m,t,dur,v,{wave:'sawtooth',bright:3600,dark:500,len:1.4,bend:.6,q:4});},
 oud(ac,dest,m,t,dur,v){I.pluck(ac,dest,m,t,dur,v,{wave:'sawtooth',bright:2400,dark:350,len:.9,q:3});},
 lute(ac,dest,m,t,dur,v){I.pluck(ac,dest,m,t,dur,v*.9,{wave:'triangle',bright:2800,dark:600,len:1.1,q:2});},
 uke(ac,dest,m,t,dur,v){I.pluck(ac,dest,m,t,dur,v*.75,{wave:'triangle',bright:3800,dark:900,len:.55,q:1});},
 // Flauta / flauta dulce / ney / shakuhachi: seno + aliento filtrado + vibrato tardío.
 flute(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.4,s=osc(ac,'sine',f,t,stop),tr=osc(ac,'triangle',f,t,stop),tg=gain(ac,.18),n=noiseSrc(ac,t,stop),bp=ac.createBiquadFilter(),ng=gain(ac),g=gain(ac);bp.type='bandpass';bp.frequency.value=f*2;bp.Q.value=2;
  if(o.bend){s.frequency.setValueAtTime(f*Math.pow(2,o.bend/12),t);s.frequency.exponentialRampToValueAtTime(f,t+.18);}
  const [l,lg]=vib(ac,s.frequency,t,stop,o.rate||5.2,f*(o.vib||.012),o.vdelay||.22);
  s.connect(g);tr.connect(tg);tg.connect(g);n.connect(bp);bp.connect(ng);ng.connect(g);ng.gain.setValueAtTime((o.breath||.05)*v*8,t);ng.gain.exponentialRampToValueAtTime(.001,t+.25);
  adsr(g.gain,t,dur,v,o.attack||.06,.2,.85,.18);g.connect(dest);cleanup([s,tr,tg,n,bp,ng,g,l,lg],stop,ac);},
 recorder(ac,dest,m,t,dur,v){I.flute(ac,dest,m,t,dur,v*.9,{vib:.006,attack:.03,breath:.04});},
 ney(ac,dest,m,t,dur,v){I.flute(ac,dest,m,t,dur,v,{bend:-.8,breath:.12,vib:.016,rate:4.8});},
 shakuhachi(ac,dest,m,t,dur,v){I.flute(ac,dest,m,t,dur,v,{bend:-1.2,breath:.16,vib:.02,rate:4.2,attack:.12});},
 whistle(ac,dest,m,t,dur,v){I.flute(ac,dest,m+12,t,dur,v*.7,{vib:.01,breath:.08});},
 ocarina(ac,dest,m,t,dur,v){I.flute(ac,dest,m,t,dur,v*.9,{vib:.008,breath:.02,attack:.04});},
 // Theremin: seno con portamento desde la nota anterior y vibrato amplio.
 theremin(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.5,s=osc(ac,'sine',o.from?hz(o.from):f,t,stop),g=gain(ac);s.frequency.setTargetAtTime(f,t,.06);const [l,lg]=vib(ac,s.frequency,t,stop,6.2,f*.025,.05);s.connect(g);adsr(g.gain,t,dur,v,.12,.2,.9,.3);g.connect(dest);cleanup([s,g,l,lg],stop,ac);},
 // Colchones: sierras desafinadas por paso bajo lento.
 pad(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+(o.rel||1.4),lp=ac.createBiquadFilter(),g=gain(ac),out=[lp,g];lp.type='lowpass';lp.frequency.value=o.cut||1300;lp.Q.value=.7;for(const d of [-11,0,9]){const s=osc(ac,o.wave||'sawtooth',f,t,stop,d);s.connect(lp);out.push(s);}lp.connect(g);adsr(g.gain,t,dur,v*.45,o.att||.7,.6,.85,o.rel||1.4);g.connect(dest);cleanup(out,stop,ac);},
 warmPad(ac,dest,m,t,dur,v){I.pad(ac,dest,m,t,dur,v,{wave:'triangle',cut:1800,att:.9});},
 glassPad(ac,dest,m,t,dur,v){I.pad(ac,dest,m+12,t,dur,v*.7,{wave:'sine',cut:6000,att:1.2,rel:2});},
 darkPad(ac,dest,m,t,dur,v){I.pad(ac,dest,m,t,dur,v,{cut:700,att:1.1,rel:2});},
 // Cuerdas: dos sierras con vibrato.
 strings(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.9,lp=ac.createBiquadFilter(),g=gain(ac),out=[lp,g];lp.type='lowpass';lp.frequency.value=o.cut||2600;for(const d of [-7,7]){const s=osc(ac,'sawtooth',f,t,stop,d);const [l,lg]=vib(ac,s.frequency,t,stop,5.4,f*.006,.3);s.connect(lp);out.push(s,l,lg);}lp.connect(g);adsr(g.gain,t,dur,v*.5,o.att||.22,.3,.9,.7);g.connect(dest);cleanup(out,stop,ac);},
 fiddle(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.3,s=osc(ac,'sawtooth',f,t,stop),bp=ac.createBiquadFilter(),g=gain(ac);bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=.9;const [l,lg]=vib(ac,s.frequency,t,stop,6,f*.01,.12);s.connect(bp);bp.connect(g);adsr(g.gain,t,dur,v*.9,.03,.1,.85,.15);g.connect(dest);cleanup([s,bp,g,l,lg],stop,ac);},
 cello(ac,dest,m,t,dur,v){I.strings(ac,dest,m,t,dur,v*1.2,{cut:1400,att:.15});},
 // Coro: sierra por tres formantes «a».
 choir(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+1.2,g=gain(ac),out=[g];const vowel=o.vowel==='o'?[[500,1],[900,.6],[2400,.25]]:[[800,1],[1150,.55],[2900,.22]];for(const d of [-6,6]){const s=osc(ac,'sawtooth',f,t,stop,d);const [l,lg]=vib(ac,s.frequency,t,stop,5,f*.008,.3);out.push(s,l,lg);for(const [ff,a] of vowel){const bp=ac.createBiquadFilter(),bg=gain(ac,a);bp.type='bandpass';bp.frequency.value=ff;bp.Q.value=7;s.connect(bp);bp.connect(bg);bg.connect(g);out.push(bp,bg);}}adsr(g.gain,t,dur,v*1.6,.35,.4,.9,1);g.connect(dest);cleanup(out,stop,ac);},
 // Órgano: suma de armónicos con trémolo.
 organ(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.3,g=gain(ac),trem=ac.createOscillator(),tg=gain(ac,.12),out=[g,trem,tg];for(const [r,a] of [[.5,.5],[1,1],[2,.6],[3,.35],[4,.25],[6,.12]]){const s=osc(ac,'sine',f*r,t,stop),sg=gain(ac,a*.3);s.connect(sg);sg.connect(g);out.push(s,sg);}trem.frequency.value=6.2;trem.connect(tg);tg.connect(g.gain);trem.start(t);trem.stop(stop);adsr(g.gain,t,dur,v,.03,.1,1,.2);g.connect(dest);cleanup(out,stop,ac);},
 harpsichord(ac,dest,m,t,dur,v){I.pluck(ac,dest,m,t,dur,v*.8,{wave:'sawtooth',bright:7000,dark:1600,len:.9,q:.8});},
 // Metales: sierra con barrido de filtro.
 brass(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.3,s=osc(ac,'sawtooth',f,t,stop),s2=osc(ac,'sawtooth',f,t,stop,8),lp=ac.createBiquadFilter(),g=gain(ac);lp.type='lowpass';lp.Q.value=1.2;lp.frequency.setValueAtTime(260,t);lp.frequency.exponentialRampToValueAtTime(o.cut||2600,t+.08);lp.frequency.setTargetAtTime(1200,t+.12,.3);s.connect(lp);s2.connect(lp);lp.connect(g);adsr(g.gain,t,dur,v*.55,.04,.2,.8,.18);g.connect(dest);cleanup([s,s2,lp,g],stop,ac);},
 horn(ac,dest,m,t,dur,v){I.brass(ac,dest,m,t,dur,v*.9,{cut:1400});},
 // Leads electrónicos.
 sawLead(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.25,lp=ac.createBiquadFilter(),g=gain(ac),out=[lp,g];lp.type='lowpass';lp.frequency.value=o.cut||3400;lp.Q.value=2;for(const d of [-9,9]){const s=osc(ac,'sawtooth',o.from?hz(o.from):f,t,stop,d);if(o.from)s.frequency.setTargetAtTime(f,t,.04);const [l,lg]=vib(ac,s.frequency,t,stop,5.6,f*.008,.25);s.connect(lp);out.push(s,l,lg);}lp.connect(g);adsr(g.gain,t,dur,v*.5,.01,.15,.75,.18);g.connect(dest);cleanup(out,stop,ac);},
 supersaw(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.5,lp=ac.createBiquadFilter(),g=gain(ac),out=[lp,g];lp.type='lowpass';lp.frequency.value=4200;for(const d of [-22,-11,0,12,23]){const s=osc(ac,'sawtooth',f,t,stop,d);s.connect(lp);out.push(s);}lp.connect(g);adsr(g.gain,t,dur,v*.3,.02,.3,.7,.4);g.connect(dest);cleanup(out,stop,ac);},
 square(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.08,s=osc(ac,o.pulse?'pulse':'square',f,t,stop),g=gain(ac);if(o.arpVib){const [l,lg]=vib(ac,s.frequency,t,stop,7,f*.015,.15);cleanup([l,lg],stop,ac);}s.connect(g);adsr(g.gain,t,dur,v*.32,.003,.08,.7,.04);g.connect(dest);cleanup([s,g],stop,ac);},
 chipPulse(ac,dest,m,t,dur,v){I.square(ac,dest,m,t,dur,v,{pulse:true,arpVib:true});},
 reed(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.2,lp=ac.createBiquadFilter(),g=gain(ac),trem=ac.createOscillator(),tg=gain(ac,.08),out=[lp,g,trem,tg];lp.type='lowpass';lp.frequency.value=2300;for(const d of [-12,12]){const s=osc(ac,'square',f,t,stop,d);s.connect(lp);out.push(s);}trem.frequency.value=5.8;trem.connect(tg);tg.connect(g.gain);trem.start(t);trem.stop(stop);lp.connect(g);adsr(g.gain,t,dur,v*.35,.03,.1,.9,.12);g.connect(dest);cleanup(out,stop,ac);},
 sitar(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+1.2,s=osc(ac,'sawtooth',f,t,stop),bp=ac.createBiquadFilter(),g=gain(ac);bp.type='bandpass';bp.Q.value=9;bp.frequency.setValueAtTime(f*6,t);bp.frequency.exponentialRampToValueAtTime(f*2,t+.6);s.frequency.setValueAtTime(f*1.03,t);s.frequency.exponentialRampToValueAtTime(f,t+.06);s.connect(bp);bp.connect(g);g.gain.setValueAtTime(v*1.4,t);g.gain.exponentialRampToValueAtTime(.0005,stop);g.connect(dest);cleanup([s,bp,g],stop,ac);},
 acid(ac,dest,m,t,dur,v,o={}){const f=hz(m),stop=t+dur+.12,s=osc(ac,'sawtooth',f,t,stop),lp=ac.createBiquadFilter(),g=gain(ac);lp.type='lowpass';lp.Q.value=14;lp.frequency.setValueAtTime(o.accent?2600:1500,t);lp.frequency.exponentialRampToValueAtTime(220,t+.18);s.connect(lp);lp.connect(g);adsr(g.gain,t,dur,v*.55,.003,.1,.6,.05);g.connect(dest);cleanup([s,lp,g],stop,ac);},
 // --- Bajos ---
 sub(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.2,s=osc(ac,'sine',f,t,stop),g=gain(ac);s.connect(g);adsr(g.gain,t,dur,v,.01,.2,.85,.12);g.connect(dest);cleanup([s,g],stop,ac);},
 pluckBass(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.25,s=osc(ac,'triangle',f,t,stop),s2=osc(ac,'sawtooth',f,t,stop),lp=ac.createBiquadFilter(),g=gain(ac);lp.type='lowpass';lp.frequency.setValueAtTime(1400,t);lp.frequency.exponentialRampToValueAtTime(240,t+.25);s.connect(g);s2.connect(lp);lp.connect(g);adsr(g.gain,t,dur,v*.8,.004,.25,.5,.1);g.connect(dest);cleanup([s,s2,lp,g],stop,ac);},
 synthBass(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.15,s=osc(ac,'sawtooth',f,t,stop),s2=osc(ac,'square',f/2,t,stop),lp=ac.createBiquadFilter(),g=gain(ac);lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(300,t+.2);lp.Q.value=4;s.connect(lp);s2.connect(lp);lp.connect(g);adsr(g.gain,t,dur,v*.6,.005,.1,.7,.06);g.connect(dest);cleanup([s,s2,lp,g],stop,ac);},
 upright(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.3,s=osc(ac,'sine',f,t,stop),s2=osc(ac,'triangle',f*2,t,stop),g2=gain(ac,.2),g=gain(ac);s.connect(g);s2.connect(g2);g2.connect(g);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(v*.3,t+.3);g.gain.setTargetAtTime(.0001,t+dur,.08);g.connect(dest);cleanup([s,s2,g2,g],stop,ac);},
 distBass(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.15,s=osc(ac,'sawtooth',f,t,stop),ws=ac.createWaveShaper(),lp=ac.createBiquadFilter(),g=gain(ac);const c=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;c[i]=Math.tanh(x*4);}ws.curve=c;lp.type='lowpass';lp.frequency.value=1100;s.connect(ws);ws.connect(lp);lp.connect(g);adsr(g.gain,t,dur,v*.45,.005,.1,.8,.08);g.connect(dest);cleanup([s,ws,lp,g],stop,ac);},
 tuba(ac,dest,m,t,dur,v){I.brass(ac,dest,m,t,dur,v*1.2,{cut:700});},
 chipBass(ac,dest,m,t,dur,v){const f=hz(m),stop=t+dur+.05,s=osc(ac,'triangle',f,t,stop),g=gain(ac);s.connect(g);adsr(g.gain,t,dur,v,.002,.05,.9,.03);g.connect(dest);cleanup([s,g],stop,ac);}
};

// --- Percusión -------------------------------------------------------------------
function drumTone(ac,dest,t,f0,f1,len,v,type='sine'){const o=osc(ac,type,f0,t,t+len+.05),g=gain(ac);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+len*.6);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+len);o.connect(g);g.connect(dest);cleanup([o,g],t+len+.05,ac);}
function drumNoise(ac,dest,t,len,v,type,f,q=1){const s=noiseSrc(ac,t,t+len+.05),fl=ac.createBiquadFilter(),g=gain(ac);fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+len);s.connect(fl);fl.connect(g);g.connect(dest);cleanup([s,fl,g],t+len+.05,ac);}
const D={
 kick:(ac,d,t,v)=>{drumTone(ac,d,t,150,45,.32,v*1.1);drumNoise(ac,d,t,.02,v*.25,'highpass',3000);},
 kick808:(ac,d,t,v)=>drumTone(ac,d,t,110,38,.9,v*1.1),
 softKick:(ac,d,t,v)=>drumTone(ac,d,t,90,45,.25,v*.8),
 snare:(ac,d,t,v)=>{drumNoise(ac,d,t,.18,v*.6,'bandpass',2200,.8);drumTone(ac,d,t,220,160,.1,v*.4,'triangle');},
 gated:(ac,d,t,v)=>{drumNoise(ac,d,t,.32,v*.7,'bandpass',1800,.6);drumTone(ac,d,t,200,150,.12,v*.4,'triangle');},
 clap:(ac,d,t,v)=>{for(const o of [0,.012,.024])drumNoise(ac,d,t+o,.09,v*.5,'bandpass',1400,1.2);},
 hat:(ac,d,t,v)=>drumNoise(ac,d,t,.04,v*.35,'highpass',7200),
 openhat:(ac,d,t,v)=>drumNoise(ac,d,t,.28,v*.3,'highpass',6800),
 shaker:(ac,d,t,v)=>drumNoise(ac,d,t,.06,v*.22,'bandpass',6000,1.5),
 tamb:(ac,d,t,v)=>{drumNoise(ac,d,t,.12,v*.3,'highpass',8000);drumTone(ac,d,t,5200,5000,.08,v*.08);},
 rim:(ac,d,t,v)=>drumTone(ac,d,t,1800,1600,.03,v*.35,'triangle'),
 woodblock:(ac,d,t,v)=>drumTone(ac,d,t,900,880,.06,v*.5),
 conga:(ac,d,t,v)=>drumTone(ac,d,t,330,260,.22,v*.7),
 congaLo:(ac,d,t,v)=>drumTone(ac,d,t,220,170,.28,v*.7),
 bongo:(ac,d,t,v)=>drumTone(ac,d,t,520,420,.12,v*.6),
 doum:(ac,d,t,v)=>drumTone(ac,d,t,140,90,.35,v*.9),
 tek:(ac,d,t,v)=>{drumTone(ac,d,t,700,620,.05,v*.45);drumNoise(ac,d,t,.04,v*.25,'highpass',4000);},
 taiko:(ac,d,t,v)=>{drumTone(ac,d,t,95,52,.8,v*1.2);drumNoise(ac,d,t,.12,v*.35,'lowpass',900);},
 frame:(ac,d,t,v)=>{drumTone(ac,d,t,180,120,.3,v*.7);drumNoise(ac,d,t,.06,v*.2,'bandpass',1200);},
 timpani:(ac,d,t,v)=>{drumTone(ac,d,t,98,90,1.4,v);drumNoise(ac,d,t,.2,v*.2,'lowpass',500);},
 brush:(ac,d,t,v)=>drumNoise(ac,d,t,.16,v*.15,'bandpass',3500,.6),
 sleigh:(ac,d,t,v)=>{for(const o of [0,.03,.06])drumNoise(ac,d,t+o,.08,v*.16,'highpass',9000);},
 triangle:(ac,d,t,v)=>{const o=osc(ac,'sine',4200,t,t+1.6),g=gain(ac);g.gain.setValueAtTime(v*.12,t);g.gain.exponentialRampToValueAtTime(.0005,t+1.5);o.connect(g);g.connect(d);cleanup([o,g],t+1.6,ac);},
 anvil:(ac,d,t,v)=>{I.bell(ac,d,79,t,.1,v*.6,{ratio:2.41,index:5,len:.6});},
 gong:(ac,d,t,v)=>{I.bell(ac,d,40,t,2,v*.7,{ratio:1.41,index:2,len:4});drumNoise(ac,d,t,1.2,v*.1,'bandpass',600,.5);},
 chipNoise:(ac,d,t,v)=>drumNoise(ac,d,t,.07,v*.35,'highpass',3000),
 chipKick:(ac,d,t,v)=>drumTone(ac,d,t,220,50,.12,v,'square'),
 heartbeat:(ac,d,t,v)=>{drumTone(ac,d,t,70,40,.18,v);drumTone(ac,d,t+.18,65,38,.2,v*.7);},
 riser:(ac,d,t,v,len=2)=>{const s=noiseSrc(ac,t,t+len+.1),f=ac.createBiquadFilter(),g=gain(ac);f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(7000,t+len);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v*.3,t+len);g.gain.exponentialRampToValueAtTime(.0001,t+len+.1);s.connect(f);f.connect(g);g.connect(d);cleanup([s,f,g],t+len+.1,ac);}
};

CS5.instruments={I,D,hz,noise};
})();
