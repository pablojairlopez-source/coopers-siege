// Exporta la banda sonora a WAV (para escucharla fuera del juego).
// Uso: node tests/export-music.cjs [segundos=60] [estado=B] [carpeta=test-results/music]
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,ROOT}=require('./lib/harness.cjs');
function wav(samples,sr){const b=Buffer.alloc(44+samples.length*2);b.write('RIFF',0);b.writeUInt32LE(36+samples.length*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(samples[i]*28000))),44+i*2);return b;}
(async()=>{
 const seconds=Number(process.argv[2]||60),state=process.argv[3]||'B',out=path.resolve(ROOT,process.argv[4]||'test-results/music');
 fs.mkdirSync(out,{recursive:true});
 const srv=await serve(),browser=await launch(),page=await browser.newPage();
 await page.goto(srv.url);await page.waitForFunction(()=>window.CS5&&CS5.composer);
 const count=await page.evaluate(()=>CS5.songs.list.length+1);
 for(let i=0;i<count;i++){
  const r=await page.evaluate(async({i,seconds,state})=>{
   const C=CS5.composer,song=i<CS5.songs.list.length?CS5.songs.list[i]:CS5.songs.menu,sr=22050,oc=new OfflineAudioContext(2,sr*seconds,sr);
   C.ac=null;C.init(oc,oc.destination);C.song=null;C.next=0;C.play(song,true);C.setState(i<CS5.songs.list.length?state:'MENU',true);
   while(C.next<seconds)C.schedule(seconds);
   const b=await oc.startRendering(),L=b.getChannelData(0),R=b.getChannelData(1),m=new Float32Array(L.length);let peak=0;for(let k=0;k<L.length;k++){m[k]=(L[k]+R[k])/2;peak=Math.max(peak,Math.abs(m[k]));}
   const norm=peak>.9?.9/peak:1;return {id:song.id,name:song.name,sr,data:Array.from(m,v=>v*norm)};
  },{i,seconds,state});
  const file=path.join(out,`${String(i).padStart(2,'0')}-${r.id}.wav`);fs.writeFileSync(file,wav(r.data,r.sr));console.log(file,'·',r.name);
 }
 await browser.close();await srv.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
