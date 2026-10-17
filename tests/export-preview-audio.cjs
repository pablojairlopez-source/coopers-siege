// Exporta las piezas nuevas o revisadas de 5.1 como audio comprimido (WebM/Opus) para
// escucharlas sin abrir el juego (test-results/preview-audio/). Cada pieza se renderiza sin conexión
// por la misma cadena de música del juego (calibración, ecualización, limitador) y se
// codifica en Chromium con MediaRecorder (por eso tarda lo que dura cada pieza; se
// codifican todas en paralelo).
// Uso: node tests/export-preview-audio.cjs [segundos=180] [ids=volcano,supernova,factory,inferno,candy,thorns]
const fs=require('node:fs'),path=require('node:path');
const {serve,launch,ROOT}=require('./lib/harness.cjs');
const seconds=Number(process.argv[2]||180);
const ids=(process.argv[3]||'volcano,supernova,factory,inferno,candy,thorns').split(',');
const OUT=path.join(ROOT,'test-results','preview-audio');
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const srv=await serve(),browser=await launch({gpu:false});
 try{
  const info=[];
  await Promise.all(ids.map(async id=>{
   const page=await browser.newPage();
   await page.goto(srv.url);await page.waitForFunction(()=>window.CS5&&CS5.composer&&window.PocketSiege);
   const r=await page.evaluate(async({id,seconds})=>{
    const song=CS5.songs.list.find(s=>s.id===id)||CS5.songs.menu,sr=44100;
    const oc=new OfflineAudioContext(2,sr*(seconds+3),sr),A=Object.create(audio);A.context=oc;A.buildMix(oc);
    A.musicGain.gain.value=1;// nivel de escucha (en el juego la música va más baja que los efectos)
    const C=CS5.composer;C.ac=null;C.init(oc,A.musicGain);C.song=null;C.next=0;C.play(song,true);C.setState('B',true);
    // Los instrumentos desconectan sus nodos con setTimeout contado desde currentTime; sin conexión todo se programa en t=0 y,
    // si el render va más lento que el tiempo real, esas limpiezas cortarían notas futuras. Se omiten durante la programación.
    const st=window.setTimeout;window.setTimeout=(fn,ms,...a)=>ms>1500?0:st(fn,ms,...a);
    while(C.next<seconds)C.schedule(seconds);window.setTimeout=st;
    // Fundido final de 3 s.
    const end=A.master.gain;end.setValueAtTime(end.value,seconds-.5);end.linearRampToValueAtTime(0,seconds+2.5);
    const buf=await oc.startRendering();
    let peak=0;for(const ch of [0,1])for(const v of buf.getChannelData(ch))peak=Math.max(peak,Math.abs(v));
    const ac=new AudioContext({sampleRate:sr});await ac.resume();
    const src=ac.createBufferSource();src.buffer=buf;const dest=ac.createMediaStreamDestination();src.connect(dest);
    const rec=new MediaRecorder(dest.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:128000}),chunks=[];
    rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    const done=new Promise(res=>rec.onstop=res);rec.start(1000);src.start();
    await new Promise(res=>src.onended=res);await new Promise(res=>setTimeout(res,400));rec.stop();await done;
    const blob=new Blob(chunks,{type:'audio/webm'}),bytes=new Uint8Array(await blob.arrayBuffer());
    let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));
    return {name:song.name,genre:song.genre,peak:+peak.toFixed(3),b64:btoa(bin)};
   },{id,seconds});
   const file=path.join(OUT,`${id}.webm`);fs.writeFileSync(file,Buffer.from(r.b64,'base64'));
   info.push({id,name:r.name,genre:r.genre,peak:r.peak,kb:Math.round(fs.statSync(file).size/1024)});
   console.log(`${id}.webm · ${r.name} · pico ${r.peak} · ${Math.round(fs.statSync(file).size/1024)} KB`);
   await page.close();
  }));
  fs.writeFileSync(path.join(OUT,'piezas.json'),JSON.stringify(ids.map(id=>info.find(i=>i.id===id)),null,1));
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
