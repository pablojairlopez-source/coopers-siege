// Medición de sonoridad de la banda sonora (aproximación a LUFS con ponderación K:
// paso alto ~60 Hz + estante agudo +4 dB) renderizando cada pieza sin conexión.
// Se ejecuta dentro de la página (page.evaluate). Devuelve dB relativos a escala completa.
module.exports.measureSongs=async(page,{seconds=24,state='B',trim=true}={})=>page.evaluate(async({seconds,state,trim})=>{
 const C=CS5.composer,songs=[...CS5.songs.list,CS5.songs.menu],out=[];
 const saved=CS5.musicTrim;if(!trim)CS5.musicTrim={};
 for(const song of songs){
  const sr=22050,oc=new OfflineAudioContext(2,sr*seconds,sr);
  const hp=oc.createBiquadFilter();hp.type='highpass';hp.frequency.value=60;hp.Q.value=.5;
  const hs=oc.createBiquadFilter();hs.type='highshelf';hs.frequency.value=1500;hs.gain.value=4;
  hp.connect(hs);hs.connect(oc.destination);
  C.ac=null;C.init(oc,hp);C.song=null;C.next=0;C.play(song,false);C.setState(state,true);
  {const st=window.setTimeout;window.setTimeout=(fn,ms,...a)=>ms>1500?0:st(fn,ms,...a);while(C.next<seconds)C.schedule(seconds);window.setTimeout=st;}
  const buf=await oc.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1);
  // Bloques de 400 ms con umbral relativo (como BS.1770) para no premiar silencios.
  const blk=Math.floor(sr*.4),ms=[];let peak=0;
  for(let i=sr;i+blk<=L.length;i+=blk){let s=0;for(let k=i;k<i+blk;k++){s+=(L[k]*L[k]+R[k]*R[k])*.5;peak=Math.max(peak,Math.abs(L[k]),Math.abs(R[k]));}ms.push(s/blk);}
  const mean=ms.reduce((a,b)=>a+b,0)/ms.length,gated=ms.filter(m=>m>mean*.1),lk=10*Math.log10(gated.reduce((a,b)=>a+b,0)/gated.length);
  out.push({id:song.id,lk:+lk.toFixed(2),peak:+peak.toFixed(3)});
 }
 CS5.musicTrim=saved;C.ac=null;C.song=null;
 return out;
},{seconds,state,trim});
