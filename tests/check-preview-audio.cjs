// Verifica los archivos de test-results/preview-audio: se decodifican, duran lo esperado y suenan
// de principio a fin (sin tramos de silencio ni cortes).
// Uso: node tests/check-preview-audio.cjs [segundos-esperados=180]
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {serve,launch,ROOT}=require('./lib/harness.cjs');
const expected=Number(process.argv[2]||180);
(async()=>{
 const dir=path.join(ROOT,'test-results','preview-audio'),files=fs.readdirSync(dir).filter(f=>f.endsWith('.webm'));
 const srv=await serve(),browser=await launch({gpu:false}),page=await browser.newPage();
 let ok=true;
 try{
  await page.goto(srv.url+'test-results/preview-audio/');
  for(const f of files){
   const r=await page.evaluate(async url=>{const buf=await (await fetch(url)).arrayBuffer(),ac=new OfflineAudioContext(2,44100,44100),a=await ac.decodeAudioData(buf),d=a.getChannelData(0),win=a.sampleRate*10,rms=[];
    let peak=0;for(let i=0;i<d.length;i+=win){let s=0,n=0;for(let k=i;k<Math.min(d.length,i+win);k++){s+=d[k]*d[k];n++;peak=Math.max(peak,Math.abs(d[k]));}rms.push(+(Math.sqrt(s/n)).toFixed(3));}
    return {dur:+a.duration.toFixed(1),peak:+peak.toFixed(3),rms};},f);
   const quiet=r.rms.slice(0,-1).filter(v=>v<.01).length;
   console.log(`${f.padEnd(15)} ${r.dur}s · pico ${r.peak} · RMS cada 10 s: ${r.rms.join(' ')}`);
   if(r.dur<expected-2||quiet>0){ok=false;console.log(`  ✘ ${f}: duración ${r.dur}s, ${quiet} tramos de 10 s en silencio`);}
  }
 }finally{await browser.close();await srv.close();}
 assert.ok(ok,'audio de vista previa completo');
 console.log('PASS check-preview-audio');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
