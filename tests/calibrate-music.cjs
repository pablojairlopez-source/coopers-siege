// Calibra la sonoridad de la banda sonora: mide cada pieza sin ajuste y escribe
// src/audio/loudness.js con el factor que la lleva al objetivo común.
// Uso: node tests/calibrate-music.cjs [segundos]
const fs=require('node:fs'),path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');
const {measureSongs}=require('./lib/loudness.cjs');
const TARGET=-15;// dB (ponderación K aproximada), estado de combate B
(async()=>{
 const srv=await serve(),browser=await launch();
 try{
  const page=await (await browser.newContext(VIEWPORTS.desktop)).newPage();
  await page.goto(srv.url);await page.waitForFunction(()=>window.CS5&&CS5.composer&&CS5.songs);
  const r=await measureSongs(page,{seconds:Number(process.argv[2]||30),trim:false});
  const trims={};
  for(const s of r){trims[s.id]=+Math.pow(10,(TARGET-s.lk)/20).toFixed(3);console.log(s.id.padEnd(10),String(s.lk).padStart(7),'dB → ×'+trims[s.id]);}
  const body=`// Generado por tests/calibrate-music.cjs (objetivo ${TARGET} dB, ponderación K aproximada).\n// Factor de ganancia por canción para igualar la sonoridad percibida. No editar a mano:\n// recalibrar con «node tests/calibrate-music.cjs» tras cambiar una composición.\n(function(){const CS5=window.CS5=window.CS5||{};CS5.musicTrim=${JSON.stringify(trims)};})();\n`;
  fs.writeFileSync(path.join(ROOT,'src','audio','loudness.js'),body);
  console.log('Escrito src/audio/loudness.js');
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
