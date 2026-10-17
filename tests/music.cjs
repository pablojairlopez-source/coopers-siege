// Banda sonora: cada pieza suena (sin silencios ni saturación), las 17 son
// distintas entre sí y la melodía no se repite de forma idéntica durante minutos.
// Uso: node tests/music.cjs [segundos-de-render]
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');

(async()=>{
 const seconds=Number(process.argv[2]||16);
 const srv=await serve(),browser=await launch(),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege&&window.CS5&&CS5.composer);
  // 1) Repetición: se registra la secuencia de notas de la melodía sin generar audio.
  const repetition=await page.evaluate(()=>{
   const C=CS5.composer,I=CS5.instruments.I,orig={...I},out=[];
   const fake={currentTime:0,sampleRate:44100,createGain:()=>({gain:{value:0,setTargetAtTime(){},setValueAtTime(){}},connect(){},disconnect(){}}),createBiquadFilter:()=>({frequency:{value:0,setTargetAtTime(){}},Q:{value:0},connect(){}}),createWaveShaper:()=>({connect(){}}),createConvolver:()=>({connect(){}}),createDelay:()=>({delayTime:{setTargetAtTime(){}},connect(){}}),createStereoPanner:()=>({pan:{value:0},connect(){}}),createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)})};
   const D=CS5.instruments.D,origD={...D};for(const k of Object.keys(D))D[k]=()=>{};
   const songs=[...CS5.songs.list,CS5.songs.menu],res=[];
   for(const song of songs){
    let seq=[];for(const k of Object.keys(I))I[k]=(ac,dest,m,t)=>{if(dest===C.layers.lead)seq.push(m+'@'+Math.round(t*8));};
    C.ac=null;C.init(fake,{connect(){}});C.song=null;C.next=0;C.play(song,true);C.state='B';C.next=0;
    const bar=60/song.tempo*song.meter,limit=bar*600;while(C.next<limit)C.schedule(limit);
    // Compases como cadenas de notas relativas al inicio del compás.
    const bars=[];for(const s of seq){const [m,ti]=s.split('@').map(Number),t=ti/8,b=Math.floor(t/bar+1e-6);(bars[b]||(bars[b]=[])).push(m+':'+Math.round((t-b*bar)/bar*48));}
    const keys=bars.map(b=>(b||[]).join(','));const W=16;let first=null;
    const seen=new Map();for(let i=0;i+W<=keys.length;i++){const k=keys.slice(i,i+W).join('|');if(!k.replace(/\|/g,''))continue;if(seen.has(k)){first=i;break;}seen.set(k,i);}
    res.push({id:song.id,name:song.name,notes:seq.length,uniqueBars:new Set(keys).size,repeatAfterMin:first===null?bar*600/60:+(first*bar/60).toFixed(1)});
   }
   Object.assign(I,orig);Object.assign(D,origD);C.ac=null;C.song=null;
   return res;
  });
  // 2) Render real sin conexión: nivel, saturación y timbre de cada pieza.
  const renders=await page.evaluate(async seconds=>{
   const C=CS5.composer,songs=[...CS5.songs.list,CS5.songs.menu],out=[];
   for(const song of songs){
    const sr=22050,oc=new OfflineAudioContext(2,sr*seconds,sr);
    C.ac=null;C.init(oc,oc.destination);C.song=null;C.next=0;C.play(song,false);C.setState('B',true);
    while(C.next<seconds)C.schedule(seconds);
    const buf=await oc.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1);
    let peak=0,sum=0,zc=0,diff=0,nan=0;const win=Math.floor(sr*.25),rms=[];let acc=0;
    for(let i=0;i<L.length;i++){const v=(L[i]+R[i])*.5;if(!Number.isFinite(v)){nan++;continue;}peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));sum+=v*v;acc+=v*v;if(i&&(v>0)!==(L[i-1]+R[i-1]>0))zc++;if(i){const d=v-(L[i-1]+R[i-1])*.5;diff+=d*d;}if(i%win===win-1){rms.push(Math.sqrt(acc/win));acc=0;}}
    const total=Math.sqrt(sum/L.length),silent=rms.filter(r=>r<total*.08).length/rms.length;
    let onsets=0;for(let i=1;i<rms.length;i++)if(rms[i]>rms[i-1]*1.35&&rms[i]>total*.4)onsets++;
    out.push({id:song.id,rms:+total.toFixed(4),peak:+peak.toFixed(3),silent:+silent.toFixed(2),brightness:+(Math.sqrt(diff/sum)).toFixed(3),zcr:+(zc/L.length*sr).toFixed(0),onsetsPerSec:+(onsets/seconds).toFixed(2),nan});
   }
   C.ac=null;C.song=null;
   return out;
  },seconds);
  // 3) Efectos de sonido: cada familia de armas, cada material de explosión y las voces suenan.
  const sfx=await page.evaluate(async()=>{
   const out={},P=PocketSiege,app=P.state;
   const render=async fn=>{const oc=new OfflineAudioContext(2,22050*1.6,22050);fn({context:oc,effectsGain:oc.destination});const b=await oc.startRendering(),d=b.getChannelData(0);let s=0;for(const v of d)s+=v*v;return Math.sqrt(s/d.length);};
   const families={};for(const [w,f] of Object.entries(CS5.sfxFamilies))if(!families[f])families[f]=w;
   for(const [f,w] of Object.entries(families)){app.weapon=w;out['disparo:'+f]=await render(a=>CS5.sfx.play(a,'shot',1,{}));}
   for(let m=0;m<P.maps.length;m++){app.map=m;out['explosión:'+P.maps[m].id]=await render(a=>CS5.sfx.play(a,'explosion',1.2,{}));}
   for(const k of ['hurt','death','jump','bounce','splash','turn','victory','nuclear'])out[k]=await render(a=>CS5.sfx.play(a,k,1.2,{}));
   app.map=0;app.weapon='rocket';return out;
  });
  const quiet=Object.entries(sfx).filter(([,v])=>!(v>.002));
  console.log(`Efectos renderizados: ${Object.keys(sfx).length} (${Object.keys(sfx).filter(k=>k.startsWith('disparo')).length} familias de armas, ${Object.keys(sfx).filter(k=>k.startsWith('explosión')).length} materiales de explosión).`);
  assert.deepEqual(quiet,[],'todos los efectos producen sonido');
  console.log('Pieza'.padEnd(12),'RMS'.padStart(7),'pico'.padStart(6),'silencio'.padStart(9),'brillo'.padStart(7),'ZCR'.padStart(6),'ataques/s'.padStart(10),'compases únicos'.padStart(16),'repite tras (min)'.padStart(18));
  for(const r of renders){const rep=repetition.find(x=>x.id===r.id);console.log(r.id.padEnd(12),String(r.rms).padStart(7),String(r.peak).padStart(6),String(r.silent).padStart(9),String(r.brightness).padStart(7),String(r.zcr).padStart(6),String(r.onsetsPerSec).padStart(10),String(rep.uniqueBars).padStart(16),String(rep.repeatAfterMin).padStart(18));}
  fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
  fs.writeFileSync(path.join(ROOT,'test-results','music.json'),JSON.stringify({renders,repetition},null,1));
  for(const r of renders){
   assert.equal(r.nan,0,`${r.id}: sin valores no finitos`);
   assert.ok(r.rms>.01,`${r.id}: suena (RMS ${r.rms})`);
   assert.ok(r.peak<1.5,`${r.id}: sin saturación grave (pico ${r.peak})`);
   assert.ok(r.silent<.5,`${r.id}: sin huecos de silencio (${r.silent})`);
  }
  // Distintas entre sí: ninguna pareja comparte a la vez brillo, ZCR y densidad rítmica.
  for(let i=0;i<renders.length;i++)for(let j=i+1;j<renders.length;j++){
   const a=renders[i],b=renders[j],d=Math.abs(a.brightness-b.brightness)/Math.max(a.brightness,b.brightness)+Math.abs(a.zcr-b.zcr)/Math.max(a.zcr,b.zcr)+Math.abs(a.onsetsPerSec-b.onsetsPerSec)/Math.max(.5,a.onsetsPerSec,b.onsetsPerSec)+Math.abs(a.rms-b.rms)/Math.max(a.rms,b.rms);
   assert.ok(d>.08,`${a.id} y ${b.id} suenan demasiado parecidas (${d.toFixed(3)})`);
  }
  for(const r of repetition)assert.ok(r.repeatAfterMin>=2,`${r.id}: la melodía se repite idéntica a los ${r.repeatAfterMin} min`);
  assert.deepEqual(errors,[]);
  console.log(`PASS music: ${renders.length} piezas suenan, son distintas y no repiten la melodía antes de ${Math.min(...repetition.map(r=>r.repeatAfterMin))} min.`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
