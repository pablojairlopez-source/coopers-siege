// Cooper's Siege 5.0 — Escenografía de fondo por mapa.
// Cada escenario tiene un cielo propio, un hito (volcán, monte Fuji, pirámides,
// faro, catedral…) y 3 capas de parallax pintadas una sola vez con el kit
// (src/rendering/scenery-kit.js), más vida ambiental animada (aves, coches
// voladores, peces, brasas, luciérnagas…). Las capas son periódicas (2048 u) y
// se repiten sin costuras a lo largo del mapa ampliado.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const K=CS5.kit,TAU=Math.PI*2,LW=2048,LH=768;
const {mix,alpha,ridge,heightAt,haze,wrapDraw}=K;
// Elevación de las capas respecto del mundo: así asoman por encima del terreno jugable.
const LIFT=170;

// Definición: {sky(c,w,h,t,s), layers:[{f,paint(c,r,p)}], landmark:{f,x,w,h,paint}, ambient(c,t,s)}
// `p` = utilidades de color de la capa (fog: mezcla hacia la niebla del mapa).
const DEFS=[];

// 0 · Archipiélago Sol — mar turquesa, islas volcánicas, selva y cascadas.
DEFS[0]={
 sky:{stops:['#1f86c9','#5ec3e6','#bfe9ef','#ffd7a1'],sun:{x:.78,y:.2,r:38,color:'#fff3c4',glow:'#ffe2a0'},clouds:{count:7,col:'#ffffff',shade:'#ffd0b8',y:[.1,.32]}},
 landmark:{f:.07,x:520,w:900,h:520,paint(c,r){
  K.ridge(c,r,{width:900,y:470,amp:300,cells:2,oct:3,sharp:1.1,shape:(x,v)=>v*Math.pow(Math.max(0,1-Math.abs(x-450)/430),.8),color:'#6c8fa6',top:'#7fa2b4',bottom:'#9cc4cf',lit:'#c8e6ec',sunDir:1});
  c.fillStyle='#ffffff';c.globalAlpha=.25;for(let k=0;k<6;k++){c.beginPath();c.arc(450+k*30,150-k*24,26+k*8,0,TAU);c.fill();}c.globalAlpha=1;}},
 layers:[
  {f:.04,paint(c,r){const g=c.createLinearGradient(0,470,0,768);g.addColorStop(0,'#7fd9e4');g.addColorStop(.25,'#2bb6c8');g.addColorStop(1,'#0b6f8f');c.fillStyle=g;c.fillRect(0,470,LW,298);
   c.strokeStyle='#ffffff55';c.lineWidth=1;for(let k=0;k<160;k++){const x=r()*LW,y=480+Math.pow(r(),1.6)*260,w=8+r()*40;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();}
   for(let k=0;k<4;k++){const x=r()*LW;K.wrapDraw(LW,x,200,xx=>K.ridge(c,r,{width:LW,y:476,amp:40+r()*30,cells:3,shape:(x2,v)=>v*Math.max(0,1-Math.abs(x2-xx)/(140+r()*60)),color:'#6f9db0',top:'#86b2c0'}));}}},
  {f:.13,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:560,amp:150,cells:5,sharp:1.3,color:'#3f8f78',top:'#5aa88a',bottom:'#2c6f6a',lit:'#9bd8a8',sunDir:1,fade:200});
   for(let k=0;k<70;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4;K.wrapDraw(LW,x,30,xx=>K.palm(c,xx,y,22+r()*20,'#2e6b5a',r));}
   for(let k=0;k<3;k++){const x=200+r()*(LW-400),y=heightAt(pts,x,LW);const g=c.createLinearGradient(0,y,0,y+160);g.addColorStop(0,'#e8fbffcc');g.addColorStop(1,'#e8fbff00');c.fillStyle=g;c.fillRect(x,y+4,7+r()*5,160);}}},
  {f:.26,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:640,amp:120,cells:6,sharp:1.1,color:'#1f5a48',top:'#2f7558',bottom:'#163e3a',lit:'#4f9a6e',sunDir:1});
   for(let k=0;k<26;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.wrapDraw(LW,x,60,xx=>K.palm(c,xx,y,50+r()*40,'#173f33',r));}
   for(let k=0;k<40;k++){const x=r()*LW,y=heightAt(pts,x,LW)+10;c.fillStyle='#163a2e';c.beginPath();c.ellipse(x,y,14+r()*20,8+r()*8,0,Math.PI,0);c.fill();}}}
 ],
 ambient(c,t,s){s.birds(c,t,'#2a3a4a',6,.18);}
};

// 1 · Distrito Neón — megaciudad nocturna, letreros, tren elevado y coches voladores.
DEFS[1]={
 sky:{stops:['#04050f','#120c2e','#3a1450','#a2307a'],moon:{x:.18,y:.16,r:26,color:'#e8e2ff'},stars:70,cityGlow:'#ff4fb0'},
 landmark:{f:.06,x:1300,w:500,h:760,paint(c,r){const x=250;c.fillStyle='#160f34';c.fillRect(x-38,160,76,600);c.fillRect(x-60,420,120,340);c.beginPath();c.moveTo(x-38,160);c.lineTo(x,20);c.lineTo(x+38,160);c.fill();
  c.save();c.shadowColor='#4cfbe0';c.shadowBlur=16;c.strokeStyle='#4cfbe0';c.lineWidth=3;c.beginPath();c.ellipse(x,200,90,16,0,0,TAU);c.stroke();c.beginPath();c.ellipse(x,300,70,12,0,0,TAU);c.stroke();c.fillStyle='#ff4fb0';c.fillRect(x-30,240,60,6);c.restore();
  c.fillStyle='#ffdf8a';for(let k=0;k<160;k++){if(r()<.5)c.fillRect(x-32+r()*64,170+r()*580,2,3);}}},
 layers:[
  {f:.05,paint(c,r){let x=0;while(x<LW){const w=30+r()*70,h=180+r()*320;K.building(c,x,768,w,h,{color:'#1a1440',windows:'#8a7ad8',lit:.18,dark:'#00000000'},r);x+=w+r()*12;}K.haze(c,LW,640,140,'#7a2a6e',.55);}},
  {f:.13,paint(c,r){let x=0;while(x<LW){const w=50+r()*90,h=140+r()*260;K.building(c,x,768,w,h,{color:'#120f2c',side:'#0c0a20',windows:'#ffcf6b',lit:.32,dark:'#2a2450',antenna:true,blink:'#ff4466',neon:['#ff4fb0','#4cfbe0','#ffe14c']},r);x+=w+4+r()*20;}K.haze(c,LW,700,90,'#a2307a',.35);}},
  {f:.27,paint(c,r){c.fillStyle='#0a0818';c.fillRect(0,560,LW,10);for(let x=40;x<LW;x+=180)c.fillRect(x,560,14,208);
   c.save();c.shadowColor='#4cfbe0';c.shadowBlur=10;c.fillStyle='#4cfbe0';c.fillRect(0,556,LW,2);c.restore();
   let x=0;while(x<LW){const w=90+r()*120,h=90+r()*160;K.building(c,x,768,w,h,{color:'#08061a',windows:'#ff9a5c',lit:.12,dark:'#14102e',neon:['#ff4fb0','#4cfbe0']},r);x+=w+30+r()*80;}}}
 ],
 ambient(c,t,s){s.flyingCars(c,t);s.searchlights(c,t,'#9ab8ff');}
};

// 2 · Caldera Roja — volcán en erupción, ríos de lava y cielo de ceniza.
DEFS[2]={
 sky:{stops:['#0c0508','#2a0c10','#6a1a14','#e0521e'],sun:{x:.82,y:.34,r:30,color:'#ffcf8a',glow:'#ff7a3a'},ashClouds:'#2a1416'},
 landmark:{f:.06,x:700,w:1100,h:700,paint(c,r){
  const cx=550;c.fillStyle='#1a0e12';c.beginPath();c.moveTo(cx-520,700);c.lineTo(cx-90,250);c.lineTo(cx+90,250);c.lineTo(cx+520,700);c.closePath();c.fill();
  c.fillStyle='#2a1418';c.beginPath();c.moveTo(cx+90,250);c.lineTo(cx+520,700);c.lineTo(cx+120,700);c.closePath();c.fill();
  c.strokeStyle='#ff6a1c';c.lineWidth=5;c.lineCap='round';for(let k=0;k<5;k++){let x=cx-60+k*30,y=255;c.beginPath();c.moveTo(x,y);for(let s=0;s<14;s++){x+=(r()-.5)*40+(k-2)*6;y+=32;c.lineTo(x,y);}c.stroke();}
  K.glow(c,cx,250,160,'#ff8a2a',.9);
  for(let k=0;k<9;k++){const y=230-k*26,rr=50+k*22;c.fillStyle=alpha(k<3?'#3a2020':'#2a1818',.85-k*.06);c.beginPath();c.arc(cx+Math.sin(k)*30+k*10,y,rr,0,TAU);c.fill();}}},
 layers:[
  {f:.05,paint(c,r){K.ridge(c,r,{width:LW,y:560,amp:170,cells:4,sharp:1.4,jagged:.08,color:'#3a1418',top:'#4a1a1c',bottom:'#2a0c10',lit:'#7a2a22',sunDir:-1});K.haze(c,LW,600,120,'#e0521e',.35);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:640,amp:200,cells:6,sharp:1.6,jagged:.12,color:'#1e1014',top:'#2e161a',bottom:'#120a0c',lit:'#5a2420',sunDir:-1});
   c.strokeStyle='#ff5a1c';c.lineCap='round';for(let k=0;k<7;k++){let x=r()*LW,y=heightAt(pts,x,LW)+6;c.lineWidth=2+r()*3;c.save();c.shadowColor='#ff8a2a';c.shadowBlur=10;c.beginPath();c.moveTo(x,y);for(let s=0;s<10;s++){x+=(r()-.5)*28;y+=22;c.lineTo(x,y);}c.stroke();c.restore();}}},
  {f:.28,paint(c,r){const g=c.createLinearGradient(0,690,0,768);g.addColorStop(0,'#ff7a2a');g.addColorStop(1,'#a8200c');c.fillStyle=g;c.fillRect(0,690,LW,78);
   for(let k=0;k<34;k++){const x=r()*LW,h=60+r()*170,w=14+r()*26;K.wrapDraw(LW,x,w,xx=>{c.fillStyle='#120a0c';c.beginPath();c.moveTo(xx-w,700);c.lineTo(xx-w*.2,700-h);c.lineTo(xx+w*.25,700-h*.9);c.lineTo(xx+w,700);c.fill();c.fillStyle='#3a1a14';c.beginPath();c.moveTo(xx-w*.2,700-h);c.lineTo(xx-w*.05,700-h*.4);c.lineTo(xx-w*.5,700);c.lineTo(xx-w,700);c.fill();});}}}
 ],
 ambient(c,t,s){s.embers(c,t,'#ffb050',40,-1);}
};

// 3 · Aurora Polar — picos nevados, bosque de abetos y aurora boreal.
DEFS[3]={
 sky:{stops:['#061433','#163d70','#3f7fb0','#bfe9f0'],stars:120,aurora:['#6af5c8','#9a7aff','#5ef0ff'],moon:{x:.72,y:.14,r:20,color:'#f2fbff'}},
 landmark:{f:.05,x:1000,w:1000,h:600,paint(c,r){K.ridge(c,r,{width:1000,y:560,amp:420,cells:3,oct:4,sharp:1.6,jagged:.05,shape:(x,v)=>v*Math.pow(Math.max(0,1-Math.abs(x-500)/480),.7),color:'#7fa4c8',top:'#9cbcd8',bottom:'#b8d8e8',lit:'#e6f6ff',sunDir:1,snow:'#f4fbff',snowLine:280,snowShade:'#c2d8ea'});}},
 layers:[
  {f:.05,paint(c,r){K.ridge(c,r,{width:LW,y:560,amp:230,cells:5,sharp:1.7,jagged:.06,color:'#7d9cc0',top:'#8fb0cc',bottom:'#a8cce0',lit:'#d8eeff',sunDir:1,snow:'#eaf6ff',snowLine:400,snowShade:'#bcd4e8'});K.haze(c,LW,560,90,'#cfeefa',.5);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:630,amp:240,cells:6,sharp:1.8,jagged:.1,color:'#3c5f88',top:'#4b6f98',bottom:'#2c4a6e',lit:'#a8c8ea',sunDir:1,snow:'#f6fbff',snowLine:470,snowShade:'#b6cfe6'});
   for(let k=0;k<90;k++){const x=r()*LW,y=heightAt(pts,x,LW)+10;if(y>520)K.wrapDraw(LW,x,12,xx=>K.pine(c,xx,y,18+r()*14,'#1f3a52'));}}},
  {f:.27,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:690,amp:110,cells:5,color:'#e6f2fa',top:'#f6fbff',bottom:'#c2d8ea'});
   for(let k=0;k<90;k++){const x=r()*LW,y=heightAt(pts,x,LW)+8;K.wrapDraw(LW,x,24,xx=>K.pine(c,xx,y,40+r()*36,'#14304a','#e8f4ff'));}}}
 ],
 ambient(c,t,s){s.windStreaks(c,t,'#ffffff');}
};

// 4 · Órbita Violeta — planeta anillado, agujas alienígenas y setas bioluminiscentes.
DEFS[4]={
 sky:{stops:['#0a0520','#2a1658','#6a3a92','#ff9ad6'],stars:150,nebula:['#ff5ab8','#5a8aff'],planet:{x:.26,y:.24,r:120,color:'#d89ec8',ring:'#f3d5e8'},moons:2},
 layers:[
  {f:.05,paint(c,r){for(let k=0;k<26;k++){const x=r()*LW,h=160+r()*300,w=10+r()*22;K.wrapDraw(LW,x,w*3,xx=>{c.fillStyle='#4a2a7a';c.beginPath();c.moveTo(xx-w,768);c.quadraticCurveTo(xx-w*.2,768-h*.6,xx+w*(r()-.5)*3,768-h);c.quadraticCurveTo(xx+w*.4,768-h*.5,xx+w,768);c.fill();});}K.haze(c,LW,620,140,'#e7b8ff',.45);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:640,amp:150,cells:4,color:'#3a2068',top:'#4a2a80',bottom:'#22124a',lit:'#8a5ac0',sunDir:-1});
   for(let k=0;k<22;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.wrapDraw(LW,x,60,xx=>K.mushroom(c,xx,y,70+r()*80,'#b8a0d8','#d06aff','#f2d4ff'));}
   for(let k=0;k<30;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4,h=20+r()*40;c.save();c.shadowColor='#5cf2e6';c.shadowBlur=10;c.fillStyle='#5cf2e6';c.beginPath();c.moveTo(x-5,y);c.lineTo(x,y-h);c.lineTo(x+5,y);c.fill();c.restore();}}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:700,amp:90,cells:6,color:'#1a0c34',top:'#24124a',bottom:'#100620'});
   for(let k=0;k<18;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.wrapDraw(LW,x,90,xx=>K.mushroom(c,xx,y,110+r()*90,'#2a1a48','#4a1a6a','#a8fff0'));}}}
 ],
 ambient(c,t,s){s.jellyfish(c,t,'#d8a8ff');s.spores(c,t,'#b8fff0');}
};

// 5 · Bastión Dorado — reino medieval al atardecer: aldeas, molinos y un gran castillo.
DEFS[5]={
 sky:{stops:['#1e2a50','#5a4a78','#c26a7a','#ffcf8f'],sun:{x:.7,y:.42,r:44,color:'#ffe6b0',glow:'#ffb070'},clouds:{count:8,col:'#ffd8b0',shade:'#a86a8a',y:[.08,.34]}},
 landmark:{f:.08,x:1200,w:800,h:620,paint(c,r){
  K.ridge(c,r,{width:800,y:600,amp:160,cells:2,oct:3,shape:(x,v)=>v*Math.max(0,1-Math.abs(x-400)/380),color:'#5a5070',top:'#6a5a80'});
  const base=450,col='#4a4262',roof='#7a3a5a';K.crenellated(c,190,base+40,420,120,col,10);
  for(const [x,h,w] of [[200,230,46],[300,300,52],[400,380,64],[500,300,52],[600,230,46]])K.towerCone(c,x,base+40,w,h,col,roof,'#ffcf6a');
  c.fillStyle='#ffcf6a';for(let k=0;k<30;k++){if(r()<.6)c.fillRect(220+r()*360,base-200+r()*220,4,6);}}},
 layers:[
  {f:.05,paint(c,r){K.ridge(c,r,{width:LW,y:600,amp:110,cells:4,color:'#8a6a8a',top:'#9a7a98',bottom:'#b88a90'});K.haze(c,LW,600,100,'#ffc6a0',.5);
   for(let k=0;k<6;k++){const x=r()*LW;c.fillStyle='#6a5a7a';K.towerCone(c,x,560,10,40+r()*30,'#6a5a7a','#6a5a7a');}}},
  {f:.13,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:660,amp:120,cells:5,color:'#5a6a50',top:'#7a8a5a',bottom:'#3a4a3a',lit:'#b8c07a',sunDir:1});
   for(let k=0;k<20;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4;c.fillStyle='#d8b890';c.fillRect(x-9,y-12,18,12);c.fillStyle='#8a3a3a';c.beginPath();c.moveTo(x-12,y-12);c.lineTo(x,y-22);c.lineTo(x+12,y-12);c.fill();c.fillStyle='#ffcf6a';c.fillRect(x-2,y-8,3,4);}
   for(let k=0;k<3;k++){const x=r()*LW,y=heightAt(pts,x,LW);c.fillStyle='#e8d8c0';c.fillRect(x-5,y-40,10,40);c.strokeStyle='#5a4a3a';c.lineWidth=2;for(let a=0;a<4;a++){const an=a*Math.PI/2+.4;c.beginPath();c.moveTo(x,y-40);c.lineTo(x+Math.cos(an)*26,y-40+Math.sin(an)*26);c.stroke();}}
   for(let k=0;k<50;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.roundTree(c,x,y,24+r()*14,'#3a5a3a','#6a8a4a',r);}}},
  {f:.27,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:720,amp:80,cells:5,color:'#2a3a2c',top:'#3a4a34',bottom:'#1a2420'});
   for(let k=0;k<4;k++){const x=r()*LW,y=heightAt(pts,x,LW)+8;K.crenellated(c,x-90,y,180,70,'#3a3448',9);K.towerCone(c,x-90,y,30,120,'#3a3448','#5a2a40','#e8b84a');K.towerCone(c,x+90,y,30,110,'#3a3448','#5a2a40','#e8b84a');}
   for(let k=0;k<30;k++){const x=r()*LW,y=heightAt(pts,x,LW)+8;K.roundTree(c,x,y,40+r()*24,'#1c2a1e',null,r);}}}
 ],
 ambient(c,t,s){s.birds(c,t,'#2a2030',8,.2);}
};

// 6 · Última Estrella — estrella moribunda, nebulosa, cinturón de asteroides y estación orbital.
DEFS[6]={
 sky:{stops:['#020108','#100620','#2a1238','#8a3c6a'],stars:260,nebula:['#ff5ca8','#6b4cff','#38b6ff'],dyingStar:{x:.74,y:.3,r:80}},
 landmark:{f:.03,x:300,w:700,h:700,paint(c,r){const cx=350,cy=330,R=230;const g=c.createRadialGradient(cx-80,cy-90,20,cx,cy,R);g.addColorStop(0,'#c88a6a');g.addColorStop(.6,'#7a4a4a');g.addColorStop(1,'#2a1418');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  c.strokeStyle='#ffb070';c.lineWidth=2;c.save();c.shadowColor='#ff7a3a';c.shadowBlur=10;for(let k=0;k<7;k++){let x=cx+(r()-.5)*R,y=cy+(r()-.5)*R;c.beginPath();c.moveTo(x,y);for(let s=0;s<6;s++){x+=(r()-.5)*60;y+=(r()-.5)*60;c.lineTo(x,y);}c.stroke();}c.restore();
  c.strokeStyle='#ffd0a088';c.lineWidth=6;c.beginPath();c.arc(cx,cy,R+2,-Math.PI*.9,-Math.PI*.1);c.stroke();}},
 layers:[
  {f:.08,paint(c,r){for(let k=0;k<260;k++){const x=r()*LW,y=380+Math.sin(x/LW*TAU*2)*60+(r()-.5)*90,s=2+Math.pow(r(),3)*14;c.fillStyle=mix('#3a2a4a','#8a6a9a',r());c.beginPath();c.ellipse(x,y,s,s*.7,r()*3,0,TAU);c.fill();}}},
  {f:.16,paint(c,r){for(let k=0;k<5;k++){const x=r()*LW,y=480+r()*120;K.wrapDraw(LW,x,260,xx=>{c.strokeStyle='#4a4060';c.lineWidth=3;c.beginPath();c.moveTo(xx-200,y);c.lineTo(xx+200,y);c.stroke();for(let s=-200;s<200;s+=20){c.beginPath();c.moveTo(xx+s,y);c.lineTo(xx+s+20,y-14);c.lineTo(xx+s+20,y);c.stroke();}c.fillStyle='#2a3a6a';c.fillRect(xx-250,y-40,46,80);c.fillRect(xx+204,y-40,46,80);c.strokeStyle='#5a8aff55';c.lineWidth=1;for(let g=0;g<6;g++){c.beginPath();c.moveTo(xx-250,y-40+g*14);c.lineTo(xx-204,y-40+g*14);c.stroke();}c.fillStyle='#ff6a4a';c.beginPath();c.arc(xx,y,4,0,TAU);c.fill();});}}},
  {f:.3,paint(c,r){for(let k=0;k<40;k++){const x=r()*LW,y=560+r()*200,s=10+r()*40;c.fillStyle='#1a1424';c.beginPath();for(let a=0;a<9;a++){const an=a/9*TAU,rr=s*(.75+r()*.4);a?c.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr*.75):c.moveTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr*.75);}c.closePath();c.fill();c.fillStyle='#ff9ad633';c.beginPath();c.arc(x+s*.2,y-s*.2,s*.3,0,TAU);c.fill();}}}
 ],
 ambient(c,t,s){s.shootingStars(c,t);}
};

// 7 · Puerto Tempestad — mar embravecido, faro con haz giratorio, grúas y cargueros.
DEFS[7]={
 sky:{stops:['#05080f','#0f1a2a','#24344a','#5c7484'],stormClouds:'#1a2434',moon:{x:.3,y:.12,r:18,color:'#c8d8ff',dim:.4}},
 landmark:{f:.07,x:1500,w:500,h:700,paint(c,r){const x=250;K.ridge(c,r,{width:500,y:690,amp:160,cells:2,oct:3,shape:(x2,v)=>v*Math.max(0,1-Math.abs(x2-250)/240),color:'#1a2230'});
  c.fillStyle='#d8d8e0';c.beginPath();c.moveTo(x-26,540);c.lineTo(x-16,330);c.lineTo(x+16,330);c.lineTo(x+26,540);c.fill();c.fillStyle='#b83a3a';for(let k=0;k<3;k++)c.fillRect(x-24+k*2,500-k*60,48-k*4,22);
  c.fillStyle='#2a3240';c.fillRect(x-22,300,44,30);c.beginPath();c.moveTo(x-26,300);c.lineTo(x,272);c.lineTo(x+26,300);c.fill();K.glow(c,x,315,60,'#fff2b0',.9);}},
 layers:[
  {f:.05,paint(c,r){const g=c.createLinearGradient(0,520,0,768);g.addColorStop(0,'#2a3e54');g.addColorStop(1,'#0e1a26');c.fillStyle=g;c.fillRect(0,520,LW,248);
   c.strokeStyle='#8aa8c055';c.lineWidth=2;for(let k=0;k<120;k++){const x=r()*LW,y=530+Math.pow(r(),1.4)*230,w=20+r()*60;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w/2,y-6,x+w,y);c.stroke();}
   for(let k=0;k<3;k++){const x=r()*LW;K.wrapDraw(LW,x,200,xx=>{c.fillStyle='#16202c';c.fillRect(xx-160,505,320,28);c.beginPath();c.moveTo(xx-170,505);c.lineTo(xx-150,533);c.lineTo(xx-160,505);c.fill();c.fillRect(xx+80,470,50,35);for(let s=0;s<6;s++){c.fillStyle=['#5a3a2a','#2a4a5a','#5a5a2a'][s%3];c.fillRect(xx-130+s*34,488,30,17);}});}}},
  {f:.15,paint(c,r){c.fillStyle='#121a24';c.fillRect(0,650,LW,118);for(let k=0;k<8;k++){const x=r()*LW;K.crane(c,x,650,150+r()*80,'#2a3442','#ff5a4a');}
   for(let k=0;k<40;k++){const x=r()*LW,h=1+Math.floor(r()*4);for(let s=0;s<h;s++){c.fillStyle=['#7a3a2a','#2a5a6a','#6a6a2a','#3a3a5a'][Math.floor(r()*4)];c.fillRect(x,650-(s+1)*16,44,15);c.fillStyle='#00000033';for(let l=4;l<44;l+=6)c.fillRect(x+l,650-(s+1)*16,1,15);}}}},
  {f:.28,paint(c,r){c.fillStyle='#0a1018';c.fillRect(0,700,LW,68);for(let k=0;k<10;k++){const x=r()*LW,w=120+r()*120,h=70+r()*60;c.fillStyle='#0e161e';c.fillRect(x,700-h,w,h);c.beginPath();c.moveTo(x-6,700-h);c.lineTo(x+w/2,700-h-26);c.lineTo(x+w+6,700-h);c.fill();c.fillStyle='#ffcf6a55';c.fillRect(x+w*.2,700-h*.5,w*.1,h*.16);}
   for(let x=0;x<LW;x+=60){c.fillStyle='#1a222c';c.fillRect(x,690,6,78);}}}
 ],
 ambient(c,t,s){s.lighthouse(c,t);}
};

// 8 · Bosque Umbrío — árboles gigantes en la niebla, luna llena y luciérnagas.
DEFS[8]={
 sky:{stops:['#02060f','#061424','#0e2a34','#2a5a50'],stars:60,moon:{x:.66,y:.16,r:44,color:'#eafff4',halo:'#8ee2b8'}},
 layers:[
  {f:.05,paint(c,r){K.ridge(c,r,{width:LW,y:600,amp:120,cells:4,color:'#1a3a3a',top:'#24484a'});for(let k=0;k<30;k++){const x=r()*LW,w=30+r()*30;c.fillStyle='#16302f';c.fillRect(x-w/2,250,w,520);c.beginPath();c.ellipse(x,260,w*3,90,0,0,TAU);c.fill();}K.haze(c,LW,560,160,'#8ee2b8',.35);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:680,amp:90,cells:5,color:'#0e2422',top:'#163430'});
   for(let k=0;k<14;k++){const x=r()*LW,w=50+r()*40;K.wrapDraw(LW,x,w*4,xx=>{c.fillStyle='#0c1c1c';c.beginPath();c.moveTo(xx-w*.9,768);c.quadraticCurveTo(xx-w*.4,500,xx-w*.4,100);c.lineTo(xx+w*.4,100);c.quadraticCurveTo(xx+w*.4,500,xx+w*.9,768);c.fill();c.fillStyle='#0e2a26';c.beginPath();c.ellipse(xx,120,w*3.2,110,0,0,TAU);c.fill();c.fillStyle='#2a5a4a55';c.beginPath();c.ellipse(xx+w,90,w*1.6,50,0,0,TAU);c.fill();});}
   const x=r()*LW,y=heightAt(pts,x,LW);c.strokeStyle='#2a4a40';c.lineWidth=18;c.beginPath();c.arc(x,y,90,Math.PI,0);c.stroke();}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:730,amp:60,cells:6,color:'#050f0e',top:'#0a1a18'});
   for(let k=0;k<70;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.wrapDraw(LW,x,30,xx=>K.pine(c,xx,y,60+r()*60,'#040c0b'));}
   for(let k=0;k<24;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4;c.save();c.shadowColor='#8affc8';c.shadowBlur=8;K.mushroom(c,x,y,16,'#c8e0d0','#4affb0');c.restore();}}}
 ],
 ambient(c,t,s){s.fireflies(c,t,'#c8ff8a',36);}
};

// 9 · Kilómetro Cero — rascacielos rotos, autopista caída, humo e incendios.
DEFS[9]={
 sky:{stops:['#100c0e','#2a2224','#5a4a44','#d8905c'],sun:{x:.62,y:.4,r:50,color:'#ffc890',glow:'#d8905c',dim:.55},smog:'#5a4a40'},
 layers:[
  {f:.05,paint(c,r){let x=0;while(x<LW){const w=40+r()*80,h=140+r()*300;K.building(c,x,768,w,h,{color:'#4a3c3a',broken:true},r);x+=w+r()*30;}K.haze(c,LW,620,140,'#d8905c',.45);}},
  {f:.14,paint(c,r){let x=0;while(x<LW){const w=60+r()*100,h=110+r()*230;K.building(c,x,768,w,h,{color:'#2a2224',side:'#1e1818',windows:'#ff9a4a',lit:.05,dark:'#120e0e',broken:true},r);x+=w+20+r()*60;}
   c.fillStyle='#1a1414';c.fillRect(0,600,LW,14);for(let x2=60;x2<LW;x2+=220){c.fillRect(x2,600,16,168);}
   for(let k=0;k<4;k++){const gx=r()*LW;c.save();c.globalCompositeOperation='destination-out';c.fillRect(gx,598,40+r()*40,18);c.restore();}
   for(let k=0;k<6;k++){const fx=r()*LW,fy=560+r()*160;K.glow(c,fx,fy,60,'#ff7a2a',.7);}}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:720,amp:80,cells:8,jagged:.15,color:'#140f0f',top:'#1e1616'});
   for(let k=0;k<10;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;c.fillStyle='#0c0a0a';c.beginPath();c.ellipse(x,y-10,34,12,r()*.3-.15,0,TAU);c.fill();c.fillRect(x-20,y-24,26,12);}
   for(let k=0;k<12;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.deadTree(c,x,y,60+r()*50,'#0e0a0a',r);}
   for(let k=0;k<5;k++){const x=r()*LW,y=heightAt(pts,x,LW);c.strokeStyle='#1a1414';c.lineWidth=4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-90);c.quadraticCurveTo(x,y-110,x+30,y-104);c.stroke();}}}
 ],
 ambient(c,t,s){s.smokeColumns(c,t,'#2a2222');s.embers(c,t,'#ff8a3a',14,-1);}
};

// 10 · Valle Cerezos — monte Fuji, pagodas entre la niebla y cerezos en flor.
DEFS[10]={
 sky:{stops:['#1e2050','#6a4a8a','#d27aa8','#ffd6e6'],sun:{x:.8,y:.3,r:40,color:'#fff0f4',glow:'#ffb0d0'},clouds:{count:5,col:'#fff0f6',shade:'#d8a0c8',y:[.12,.3]}},
 landmark:{f:.03,x:900,w:1300,h:700,paint(c,r){c.fillStyle='#7a6aa0';c.beginPath();c.moveTo(0,690);c.quadraticCurveTo(450,520,560,250);c.lineTo(740,250);c.quadraticCurveTo(850,520,1300,690);c.closePath();c.fill();
  c.fillStyle='#f6f2fa';c.beginPath();c.moveTo(500,330);c.lineTo(560,250);c.lineTo(740,250);c.lineTo(800,330);for(let x=800;x>500;x-=25)c.lineTo(x,330+(Math.floor(x/25)%2?28:0)+r()*12);c.closePath();c.fill();
  c.fillStyle='#c8c0e055';c.beginPath();c.moveTo(650,250);c.lineTo(740,250);c.quadraticCurveTo(850,520,1300,690);c.lineTo(900,690);c.closePath();c.fill();}},
 layers:[
  {f:.08,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:620,amp:110,cells:4,color:'#8a6a9a',top:'#9a7aa8'});K.haze(c,LW,600,90,'#ffe0ee',.55);
   for(let k=0;k<5;k++){const x=r()*LW,y=heightAt(pts,x,LW)+8;K.pagoda(c,x,y,70+r()*30,'#5a3a4a','#3a2a3a','#d8a050');}}},
  {f:.15,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:680,amp:100,cells:5,color:'#6a7a5a',top:'#8a9a6a',bottom:'#4a5a4a',lit:'#c0d090',sunDir:1});
   for(let k=0;k<3;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4;c.fillStyle='#c8302a';c.fillRect(x-30,y-60,6,60);c.fillRect(x+24,y-60,6,60);c.fillRect(x-40,y-62,80,8);c.fillRect(x-34,y-48,68,5);}
   for(let k=0;k<40;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.sakura(c,x,y,50+r()*30,'#4a2a2a','#ffb6d0','#ffd8e6',r);}}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:730,amp:60,cells:5,color:'#3a4a3a',top:'#4a5a42'});
   for(let k=0;k<16;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.sakura(c,x,y,110+r()*60,'#2a1a1a','#ff9ac0','#ffc8dc',r);}
   for(let k=0;k<8;k++){const x=r()*LW,y=heightAt(pts,x,LW);c.fillStyle='#6a6a70';c.fillRect(x-4,y-30,8,30);c.fillRect(x-10,y-38,20,8);c.fillStyle='#ffcf8a';c.fillRect(x-5,y-30,10,7);c.fillStyle='#6a6a70';c.beginPath();c.moveTo(x-14,y-38);c.lineTo(x,y-48);c.lineTo(x+14,y-38);c.fill();}}}
 ],
 ambient(c,t,s){s.petals(c,t,'#ffb6d0',50);s.birds(c,t,'#3a2a4a',4,.16);}
};

// 11 · Dunas de Anubis — gran pirámide, obeliscos, oasis y dunas infinitas.
DEFS[11]={
 sky:{stops:['#2a5aa8','#6a9ad0','#f0c080','#ffe8a8'],sun:{x:.82,y:.18,r:46,color:'#fffbe8',glow:'#ffe8a0'},clouds:{count:3,col:'#fff8e8',shade:'#e8c098',y:[.08,.2]}},
 landmark:{f:.06,x:900,w:1000,h:500,paint(c,r){K.pyramid(c,320,480,520,360,'#e8b870','#a86a3a','#b8803a55');K.pyramid(c,660,480,380,260,'#e0b068','#a06438','#b8803a55');K.pyramid(c,880,480,220,150,'#d8a860','#986034');}},
 layers:[
  {f:.05,paint(c,r){K.ridge(c,r,{width:LW,y:560,amp:70,cells:3,oct:3,color:'#e8b880',top:'#f0c890',bottom:'#ffdca0'});K.haze(c,LW,560,80,'#ffdc98',.5);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:640,amp:120,cells:4,oct:3,color:'#d89850',top:'#e8ac60',bottom:'#c08040',lit:'#ffd890',sunDir:-1});
   for(let k=0;k<4;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4;c.fillStyle='#c09050';c.beginPath();c.moveTo(x-9,y);c.lineTo(x-6,y-140);c.lineTo(x,y-154);c.lineTo(x+6,y-140);c.lineTo(x+9,y);c.fill();c.fillStyle='#ffe08a';c.beginPath();c.moveTo(x-6,y-140);c.lineTo(x,y-154);c.lineTo(x+6,y-140);c.fill();}
   const ox=r()*LW,oy=heightAt(pts,ox,LW);c.fillStyle='#3aa0b0';c.beginPath();c.ellipse(ox,oy+6,70,10,0,0,TAU);c.fill();for(let k=0;k<5;k++)K.palm(c,ox-50+k*25,oy+4,40+r()*20,'#3a6a3a',r);}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:720,amp:80,cells:4,oct:3,color:'#b87838',top:'#d09048',bottom:'#8a5428',lit:'#f0b860',sunDir:-1});
   for(let k=0;k<6;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;c.fillStyle='#9a6a3a';c.fillRect(x-8,y-60-r()*40,16,100);c.fillRect(x-12,y-64,24,6);}
   for(let k=0;k<20;k++){const x=r()*LW,y=heightAt(pts,x,LW)+4;c.fillStyle='#7a4a2a';c.beginPath();c.ellipse(x,y,10+r()*14,6+r()*5,0,Math.PI,0);c.fill();}}}
 ],
 ambient(c,t,s){s.sandStreaks(c,t,'#ffe0a8');s.birds(c,t,'#3a2a20',3,.12);}
};

// 12 · Abismo Atlantis — luz desde la superficie, templos hundidos, arrecifes y peces.
DEFS[12]={
 sky:{stops:['#38b8c4','#0a6a8a','#063456','#021428'],caustics:true,godrays:'#a8fff4'},
 landmark:{f:.06,x:1100,w:900,h:700,paint(c,r){const x=450;c.fillStyle='#1a5a74';c.fillRect(x-260,420,520,40);for(let k=0;k<8;k++)c.fillRect(x-240+k*66,460,26,230);c.beginPath();c.moveTo(x-290,420);c.lineTo(x,330);c.lineTo(x+290,420);c.fill();c.fillStyle='#4af0e0';c.globalAlpha=.6;for(let k=0;k<8;k++)c.fillRect(x-232+k*66,470,10,200);c.globalAlpha=1;K.dome(c,x,330,70,'#1a6a84','#3a9ab4','#6ef7e8');}},
 layers:[
  {f:.05,paint(c,r){for(let k=0;k<40;k++){const x=r()*LW,h=100+r()*260;c.fillStyle='#0c4a64';c.fillRect(x,768-h,14+r()*10,h);}K.haze(c,LW,560,180,'#2a9ab0',.5);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:690,amp:110,cells:5,color:'#08344a',top:'#0c4058'});
   for(let k=0;k<6;k++){const x=r()*LW,y=heightAt(pts,x,LW)+20;K.dome(c,x,y,50+r()*40,'#0e4a62','#1a6a84','#6ef7e8');}
   for(let k=0;k<60;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.kelp(c,x,y,80+r()*120,'#0e5a4a',r);}}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:740,amp:60,cells:6,color:'#041c2a',top:'#062636'});
   for(let k=0;k<40;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.coral(c,x,y,50+r()*40,['#ff6a7a','#ff9a4a','#c85af0','#ff8ab0'][Math.floor(r()*4)],r);}
   for(let k=0;k<30;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.kelp(c,x,y,120+r()*120,'#063a2e',r);}}}
 ],
 ambient(c,t,s){s.fish(c,t);s.bubbles(c,t,'#c8fbff');}
};

// 13 · Fundición Omega — chimeneas, acero fundido, grúas pórtico y chispas.
DEFS[13]={
 sky:{stops:['#05060a','#14141c','#3a2424','#c8582a'],smog:'#2a1a18',glowBand:'#ff6a2a'},
 layers:[
  {f:.05,paint(c,r){for(let k=0;k<22;k++){const x=r()*LW;K.chimney(c,x,768,26+r()*20,220+r()*220,'#1e1c24','#5a2a24');}K.haze(c,LW,640,140,'#c8582a',.4);}},
  {f:.14,paint(c,r){let x=0;while(x<LW){const w=120+r()*160,h=120+r()*160;c.fillStyle='#16161c';c.fillRect(x,768-h,w,h);c.fillStyle='#22222a';c.beginPath();c.moveTo(x,768-h);c.lineTo(x+w*.5,768-h-30);c.lineTo(x+w,768-h);c.fill();
    if(r()<.5){const gx=x+w*.3;c.save();c.shadowColor='#ffb04a';c.shadowBlur=18;c.fillStyle='#ff8a2a';c.fillRect(gx,768-h*.6,w*.4,8);c.restore();}x+=w+20+r()*40;}
   for(let k=0;k<5;k++){const gx=r()*LW;c.strokeStyle='#2a2a34';c.lineWidth=4;c.beginPath();c.moveTo(gx-120,520);c.lineTo(gx+120,520);c.moveTo(gx-110,520);c.lineTo(gx-110,768);c.moveTo(gx+110,520);c.lineTo(gx+110,768);c.stroke();c.lineWidth=1.5;for(let s=-110;s<110;s+=16){c.beginPath();c.moveTo(gx+s,520);c.lineTo(gx+s+16,534);c.stroke();}}
   for(let k=0;k<6;k++){const tx=r()*LW;c.fillStyle='#24242c';c.beginPath();c.ellipse(tx,690,40,70,0,0,TAU);c.fill();c.fillStyle='#ffcf3a';c.fillRect(tx-40,660,80,4);}}},
  {f:.28,paint(c,r){c.fillStyle='#08080c';c.fillRect(0,700,LW,68);for(let x=0;x<LW;x+=90){c.fillRect(x,600+((x/90)%3)*20,10,168);}c.fillStyle='#0c0c12';c.fillRect(0,600,LW,10);
   for(let x=0;x<LW;x+=40){c.fillStyle=((x/40)%2)?'#ffcf3a':'#14141a';c.fillRect(x,700,40,6);}
   for(let k=0;k<12;k++){const x=r()*LW;c.strokeStyle='#3a2a24';c.lineWidth=12;c.beginPath();c.moveTo(x,768);c.lineTo(x,640);c.quadraticCurveTo(x,610,x+40,610);c.lineTo(x+120,610);c.stroke();}}}
 ],
 ambient(c,t,s){s.sparks(c,t);s.smokeColumns(c,t,'#1a1416');s.warningLights(c,t);}
};

// 14 · Catedral Gótica — eclipse de luna de sangre, agujas de obsidiana y cascadas de lava.
DEFS[14]={
 sky:{stops:['#040002','#1a0408','#3a0a14','#b0202e'],stars:40,eclipse:{x:.5,y:.2,r:60}},
 landmark:{f:.05,x:1000,w:900,h:760,paint(c,r){const x=450,b=700;c.fillStyle='#14060a';c.fillRect(x-200,b-260,400,260);
  for(const [dx,h,w] of [[-170,420,60],[-90,520,70],[0,680,90],[90,520,70],[170,420,60]])K.gothicSpire(c,x+dx,b,w,h,'#14060a',dx===0?'#ff3a4a':null);
  c.save();c.shadowColor='#ff3a4a';c.shadowBlur=18;c.strokeStyle='#ff5a6a';c.lineWidth=3;c.beginPath();c.arc(x,b-200,44,0,TAU);c.stroke();for(let k=0;k<8;k++){const a=k/8*TAU;c.beginPath();c.moveTo(x,b-200);c.lineTo(x+Math.cos(a)*44,b-200+Math.sin(a)*44);c.stroke();}c.restore();}},
 layers:[
  {f:.05,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:600,amp:240,cells:5,sharp:2,jagged:.1,color:'#2a0a10',top:'#3a0e16',bottom:'#1a0408',lit:'#6a1a24',sunDir:1});
   for(let k=0;k<5;k++){const x=r()*LW,y=heightAt(pts,x,LW);const g=c.createLinearGradient(0,y,0,768);g.addColorStop(0,'#ff6a3a');g.addColorStop(1,'#a8100c');c.fillStyle=g;c.fillRect(x,y,6+r()*8,768-y);K.glow(c,x,700,50,'#ff3a1a',.6);}K.haze(c,LW,640,120,'#b0202e',.4);}},
  {f:.14,paint(c,r){for(let k=0;k<12;k++){const x=r()*LW;K.wrapDraw(LW,x,60,xx=>K.gothicSpire(c,xx,768,30+r()*30,200+r()*260,'#100408',r()<.4?'#ff3a4a':null));}}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:740,amp:70,cells:7,jagged:.2,color:'#080204',top:'#120406'});
   for(let k=0;k<26;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6,h=60+r()*140;c.fillStyle='#0c0204';c.beginPath();c.moveTo(x-10,y);c.quadraticCurveTo(x-2,y-h*.6,x+(r()-.5)*30,y-h);c.quadraticCurveTo(x+4,y-h*.5,x+10,y);c.fill();}
   for(let k=0;k<6;k++){const x=r()*LW,y=heightAt(pts,x,LW);c.strokeStyle='#2a1418';c.lineWidth=2;c.beginPath();for(let s=0;s<14;s++){c.lineTo(x+Math.sin(s)*4,y-200+s*14);}c.stroke();}}}
 ],
 ambient(c,t,s){s.bats(c,t,'#120408');s.embers(c,t,'#ff4a3a',24,-1);}
};

// 15 · Dulce Caos — montañas de pastel, piruletas, arcoíris y nubes de algodón.
DEFS[15]={
 sky:{stops:['#5a3a9a','#a86ac8','#ff9ad0','#ffe6f6'],sun:{x:.2,y:.2,r:36,color:'#fffaf0',glow:'#ffe0f0'},rainbow:true,clouds:{count:8,col:'#ffffff',shade:'#ffc0e6',y:[.06,.3]}},
 layers:[
  {f:.05,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:600,amp:220,cells:4,oct:2,sharp:.8,color:'#c890d8',top:'#d8a8e6',bottom:'#e8c0ee'});
   c.save();c.beginPath();c.moveTo(0,768);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(LW,768);c.clip();c.fillStyle='#fff4fa';c.beginPath();c.moveTo(0,0);for(let x=0;x<=LW;x+=8)c.lineTo(x,heightAt(pts,x,LW)+18+Math.abs(Math.sin(x*.05))*22);c.lineTo(LW,0);c.fill();c.restore();K.haze(c,LW,620,90,'#ffe0f6',.5);}},
  {f:.14,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:680,amp:120,cells:5,oct:2,color:'#ff8ac4',top:'#ffa8d4',bottom:'#e86aa8'});
   for(let k=0;k<20;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.lollipop(c,x,y,70+r()*50,'#ffffff',[['#ff4a8a','#ffffff'],['#4ad8ff','#ffffff'],['#ffd84a','#ff8a4a']][Math.floor(r()*3)]);}
   for(let k=0;k<25;k++){const x=r()*LW,y=heightAt(pts,x,LW)+8;c.fillStyle=['#7af0c8','#ffe06a','#b88aff','#ff8a8a'][Math.floor(r()*4)];c.beginPath();c.ellipse(x,y,16,22,0,Math.PI,0);c.fill();c.fillStyle='#ffffff88';c.beginPath();c.ellipse(x-5,y-12,4,6,0,0,TAU);c.fill();}}},
  {f:.28,paint(c,r){const pts=K.ridge(c,r,{width:LW,y:740,amp:70,cells:5,oct:2,color:'#c86a9a',top:'#e88ab8'});
   for(let k=0;k<12;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;c.strokeStyle='#ffffff';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x,y-110);c.arc(x+22,y-110,22,Math.PI,0);c.stroke();c.strokeStyle='#ff3a5a';c.lineWidth=12;c.setLineDash([10,12]);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-110);c.arc(x+22,y-110,22,Math.PI,0);c.stroke();c.setLineDash([]);}
   for(let k=0;k<10;k++){const x=r()*LW,y=heightAt(pts,x,LW)+6;K.lollipop(c,x,y,120+r()*50,'#fff4e8',[['#ff6ab8','#ffe0f0'],['#8a6aff','#e0d8ff']][Math.floor(r()*2)]);}}}
 ],
 ambient(c,t,s){s.sparkles(c,t,'#ffffff');}
};

// ---------------------------------------------------------------------------------
// Motor: construye y cachea capas, y dibuja cielo + capas + ambiente cada frame.
const cache=new Map();
// Resolución de las capas pintadas por nivel. Son fondos suaves vistos a ~0,9 px por unidad:
// 0,85 en Ultra apenas se nota y ahorra ~28 % de memoria frente a 1,0.
function quality(level){return level<=0?.42:level===1?.58:level===2?.72:.85;}
function build(map,level){
 const key=map+':'+level;if(cache.has(key))return cache.get(key);
 const def=DEFS[map]||DEFS[0],q=quality(level),rand=K.rng(4242+map*977);
 const layers=[];
 for(const L of def.layers){
  if(level<=0&&L===def.layers[0]&&def.layers.length>2)continue; // Económico: una capa lejana menos.
  const cv=document.createElement('canvas');cv.width=Math.ceil(LW*q);cv.height=Math.ceil(LH*q);
  const c=cv.getContext('2d');c.scale(q,q);L.paint(c,K.rng(rand()*1e9|0));
  // Color de relleno bajo la capa (cuando la cámara muestra por debajo de 768).
  const px=c.getImageData(Math.floor(cv.width/2),cv.height-1,1,1).data;
  layers.push({cv,f:L.f,fill:px[3]>200?`rgb(${px[0]},${px[1]},${px[2]})`:null});
 }
 let landmark=null;
 if(def.landmark){const lm=def.landmark,cv=document.createElement('canvas');cv.width=Math.ceil(lm.w*q);cv.height=Math.ceil(lm.h*q);const c=cv.getContext('2d');c.scale(q,q);lm.paint(c,K.rng(rand()*1e9|0));landmark={cv,f:lm.f,x:lm.x,w:lm.w,h:lm.h};}
 // Cielo estático (estrellas, nebulosa, planeta) pintado a resolución fija.
 const sky=def.sky||{},skyCv=document.createElement('canvas');skyCv.width=1024;skyCv.height=512;
 const sc=skyCv.getContext('2d'),sr=K.rng(99+map);
 if(sky.nebula){for(let k=0;k<14;k++){const x=sr()*1024,y=sr()*360,rr=80+sr()*180;K.glow(sc,x,y,rr,sky.nebula[k%sky.nebula.length],.22);}}
 if(sky.stars)K.stars(sc,1024,400,sky.stars,sr);
 const clouds=[];
 if(sky.clouds){for(let k=0;k<sky.clouds.count;k++)clouds.push({cv:K.cloudSprite(sr,260,110,sky.clouds.col,sky.clouds.shade),x:sr(),y:sky.clouds.y[0]+sr()*(sky.clouds.y[1]-sky.clouds.y[0]),s:.7+sr()*.7,v:.004+sr()*.008});}
 const out={def,layers,landmark,skyCv,clouds};
 cache.set(key,out);
 // Solo se conservan 2 mapas (el actual y el anterior, para volver del menú sin repintar) y del nivel vigente.
 for(const k of [...cache.keys()])if(!k.endsWith(':'+level))cache.delete(k);
 while(cache.size>2){const k=cache.keys().next().value;if(k===key)break;cache.delete(k);}
 return out;
}

function drawSky(c,S,t,vw,vh,view){
 const sky=S.def.sky||{},st=sky.stops||['#000','#000','#000','#000'];
 const g=c.createLinearGradient(0,0,0,vh);st.forEach((col,i)=>g.addColorStop(i/(st.length-1),col));c.fillStyle=g;c.fillRect(0,0,vw,vh);
 c.drawImage(S.skyCv,0,0,vw,vh*.8);
 if(sky.planet){const p=sky.planet,x=vw*p.x,y=vh*p.y,R=p.r*Math.min(1.4,vh/700);const pg=c.createRadialGradient(x-R*.4,y-R*.4,R*.1,x,y,R);pg.addColorStop(0,'#fff0fa');pg.addColorStop(.5,p.color);pg.addColorStop(1,'#2a1438');c.fillStyle=pg;c.beginPath();c.arc(x,y,R,0,TAU);c.fill();c.strokeStyle=alpha(p.ring,.7);c.lineWidth=R*.08;c.beginPath();c.ellipse(x,y,R*1.9,R*.34,-.3,0,TAU);c.stroke();c.strokeStyle=alpha(p.ring,.35);c.lineWidth=R*.04;c.beginPath();c.ellipse(x,y,R*2.2,R*.42,-.3,0,TAU);c.stroke();
  for(let k=0;k<(sky.moons||0);k++){const mx=x+Math.cos(t*.05+k*2)*R*2.6,my=y+Math.sin(t*.05+k*2)*R*.6;c.fillStyle=k?'#9ab8ff':'#ffd8a8';c.beginPath();c.arc(mx,my,R*.12,0,TAU);c.fill();}}
 if(sky.aurora){c.save();c.globalCompositeOperation='screen';const n=60;for(let j=0;j<3;j++){const col=sky.aurora[j];for(let i=0;i<n;i++){const x=i*vw/n+Math.sin(t*.2+j)*20,base=vh*(.1+j*.06)+Math.sin(i*.28+t*.3+j*2)*vh*.05,len=vh*(.12+.08*Math.sin(i*.6+t*.5+j));const a=(.08+.07*Math.sin(i*.9+t*1.1+j*3))*(1-Math.abs(i/n-.5));const ag=c.createLinearGradient(0,base,0,base+len);ag.addColorStop(0,alpha(col,0));ag.addColorStop(.25,alpha(col,a));ag.addColorStop(1,alpha(col,0));c.fillStyle=ag;c.fillRect(x,base,vw/n+1,len);}}c.restore();}
 if(sky.dyingStar){const d=sky.dyingStar,x=vw*d.x,y=vh*d.y,R=d.r*Math.min(1.4,vh/700);c.save();c.globalCompositeOperation='screen';K.glow(c,x,y,R*5,'#ff7a3a',.5);K.glow(c,x,y,R*2.4,'#ffd08a',.8);for(let k=0;k<10;k++){const a=k/10*TAU+t*.05,len=R*(2.2+Math.sin(t*1.3+k*1.7)*.6);c.strokeStyle=alpha('#ffb070',.35);c.lineWidth=R*.18;c.beginPath();c.moveTo(x+Math.cos(a)*R,y+Math.sin(a)*R);c.quadraticCurveTo(x+Math.cos(a+.3)*len*.7,y+Math.sin(a+.3)*len*.7,x+Math.cos(a)*len,y+Math.sin(a)*len);c.stroke();}c.restore();c.fillStyle='#fff6e0';c.beginPath();c.arc(x,y,R,0,TAU);c.fill();}
 if(sky.eclipse){const e=sky.eclipse,x=vw*e.x,y=vh*e.y,R=e.r*Math.min(1.4,vh/700);c.save();c.globalCompositeOperation='screen';K.glow(c,x,y,R*3.2,'#ff2a3a',.55+.1*Math.sin(t*.8));c.restore();c.fillStyle='#b8202e';c.beginPath();c.arc(x,y,R*1.04,0,TAU);c.fill();c.fillStyle='#120206';c.beginPath();c.arc(x+R*.08,y-R*.04,R,0,TAU);c.fill();}
 if(sky.sun){const s=sky.sun,x=vw*s.x,y=vh*s.y,R=s.r*Math.min(1.4,vh/700);c.save();c.globalCompositeOperation='screen';K.glow(c,x,y,R*6,s.glow||s.color,(s.dim||1)*.55);K.glow(c,x,y,R*2,s.color,(s.dim||1)*.8);c.restore();c.globalAlpha=s.dim||1;c.fillStyle=s.color;c.beginPath();c.arc(x,y,R,0,TAU);c.fill();c.globalAlpha=1;}
 if(sky.moon){const m=sky.moon,x=vw*m.x,y=vh*m.y,R=m.r*Math.min(1.4,vh/700);c.save();c.globalCompositeOperation='screen';K.glow(c,x,y,R*5,m.halo||m.color,(m.dim||1)*.35);c.restore();c.globalAlpha=m.dim||1;c.fillStyle=m.color;c.beginPath();c.arc(x,y,R,0,TAU);c.fill();c.fillStyle='#00000018';c.beginPath();c.arc(x-R*.3,y-R*.1,R*.22,0,TAU);c.arc(x+R*.25,y+R*.3,R*.15,0,TAU);c.fill();c.globalAlpha=1;}
 if(sky.rainbow){c.save();c.globalAlpha=.32;const cx=vw*.55,cy=vh*.9,R=vw*.42;['#ff5a5a','#ffaa4a','#ffee5a','#6aff8a','#5ac8ff','#8a6aff'].forEach((col,i)=>{c.strokeStyle=col;c.lineWidth=vh*.018;c.beginPath();c.arc(cx,cy,R-i*vh*.018,Math.PI,0);c.stroke();});c.restore();}
 if(sky.cityGlow){const gg=c.createLinearGradient(0,vh*.55,0,vh);gg.addColorStop(0,alpha(sky.cityGlow,0));gg.addColorStop(1,alpha(sky.cityGlow,.35));c.fillStyle=gg;c.fillRect(0,vh*.55,vw,vh*.45);}
 if(sky.glowBand){const gg=c.createLinearGradient(0,vh*.5,0,vh);gg.addColorStop(0,alpha(sky.glowBand,0));gg.addColorStop(1,alpha(sky.glowBand,.4));c.fillStyle=gg;c.fillRect(0,vh*.5,vw,vh*.5);}
 if(sky.godrays){c.save();c.globalCompositeOperation='screen';for(let k=0;k<7;k++){const x=vw*(k/7)+Math.sin(t*.2+k)*vw*.05,w=vw*.05;const gg=c.createLinearGradient(0,0,0,vh*.8);gg.addColorStop(0,alpha(sky.godrays,.22));gg.addColorStop(1,alpha(sky.godrays,0));c.fillStyle=gg;c.beginPath();c.moveTo(x,0);c.lineTo(x+w,0);c.lineTo(x+w*3+vw*.08,vh*.8);c.lineTo(x+vw*.08,vh*.8);c.fill();}c.restore();}
 if(sky.caustics){c.save();c.globalCompositeOperation='screen';c.strokeStyle='#c8fff833';c.lineWidth=2;for(let k=0;k<18;k++){c.beginPath();for(let i=0;i<=20;i++){const x=i*vw/20,y=vh*.03*k+Math.sin(i*.9+t*1.2+k)*8;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();}
 const cloudCol=sky.stormClouds||sky.ashClouds||sky.smog;
 if(cloudCol){c.save();for(let k=0;k<5;k++){const y=vh*(.05+k*.07),off=(t*(4+k*2)+view.x*.05*k)%(vw+400);c.fillStyle=alpha(cloudCol,.55-k*.06);for(let i=-1;i<6;i++){const x=i*(vw/4)-off*.5;c.beginPath();c.ellipse(x,y,vw*.18,vh*.06,0,0,TAU);c.fill();}}c.restore();}
 for(const cl of S.clouds){const x=((cl.x*(vw+600)+t*cl.v*600-view.x*.04)%(vw+600)+vw+600)%(vw+600)-300,y=vh*cl.y,s=cl.s*Math.min(1.5,vh/600);c.globalAlpha=.85;c.drawImage(cl.cv,x,y,260*s,110*s);}c.globalAlpha=1;
}

function drawLayerImage(c,cv,f,lx0,lw,lh,view,W,vw,vh,tile,fill){
 const sL=view.base*Math.pow(Math.max(.01,view.scale/view.base),.15+f*.85);
 const camX=(tile?LW/2:0)+(view.x-W/2)*f,camY=384+(view.y-384)*Math.min(1,f*1.6);
 const top=vh/2+(0-camY-LIFT)*sL;
 if(tile){
  const left=camX-vw/2/sL,first=Math.floor(left/LW),last=Math.floor((camX+vw/2/sL)/LW);
  for(let k=first;k<=last;k++)c.drawImage(cv,vw/2+(k*LW-camX)*sL,top,LW*sL+1,LH*sL);
  if(fill){const bottom=top+LH*sL;if(bottom<vh){c.fillStyle=fill;c.fillRect(0,bottom-1,vw,vh-bottom+1);}}
 }else{
  c.drawImage(cv,vw/2+(lx0-lw/2-camX)*sL,vh/2+(LH-lh-camY-LIFT)*sL,lw*sL,lh*sL);
 }
}

// --- Vida ambiental (dibujada cada frame sobre el fondo) ------------------------
const amb={
 birds(c,t,col,n,y0){c.strokeStyle=col;c.lineWidth=1.6;for(let i=0;i<n;i++){const x=((i*211+t*(28+i*3))%(this.vw+200))-100,y=this.vh*(y0+(i%3)*.04)+Math.sin(t*1.3+i)*8,f=Math.sin(t*9+i)*4;c.beginPath();c.moveTo(x-7,y-f);c.quadraticCurveTo(x-3,y-2,x,y);c.quadraticCurveTo(x+3,y-2,x+7,y-f);c.stroke();}},
 flyingCars(c,t){for(let i=0;i<10;i++){const dir=i%2?1:-1,spd=60+(i%4)*30,x=dir>0?((i*240+t*spd)%(this.vw+200))-100:this.vw+100-((i*240+t*spd)%(this.vw+200)),y=this.vh*(.18+(i%5)*.07)+Math.sin(t*2+i)*3;c.fillStyle='#1a2844';c.fillRect(x-9,y-3,18,6);c.save();c.shadowColor=dir>0?'#5cebe2':'#ff5cb8';c.shadowBlur=8;c.fillStyle=dir>0?'#5cebe2':'#ff5cb8';c.fillRect(dir>0?x+7:x-11,y-1.5,4,3);c.globalAlpha=.4;c.fillRect(dir>0?x-40:x+9,y-1,31,2);c.restore();}},
 searchlights(c,t,col){c.save();c.globalCompositeOperation='screen';for(let i=0;i<3;i++){const x=this.vw*(.2+i*.3),a=-Math.PI/2+Math.sin(t*.4+i*2)*.5;const g=c.createLinearGradient(x,this.vh,x+Math.cos(a)*this.vh,this.vh+Math.sin(a)*this.vh);g.addColorStop(0,alpha(col,.25));g.addColorStop(1,alpha(col,0));c.fillStyle=g;c.beginPath();c.moveTo(x,this.vh);c.lineTo(x+Math.cos(a-.05)*this.vh*1.2,this.vh+Math.sin(a-.05)*this.vh*1.2);c.lineTo(x+Math.cos(a+.05)*this.vh*1.2,this.vh+Math.sin(a+.05)*this.vh*1.2);c.fill();}c.restore();},
 embers(c,t,col,n,dir){c.save();c.globalCompositeOperation='screen';c.fillStyle=col;for(let i=0;i<n;i++){const ph=(t*.08*(1+(i%5)*.3)+i*.137)%1,x=(i*97.3+Math.sin(t*.7+i)*30)%this.vw,y=dir<0?this.vh*(1-ph):this.vh*ph;c.globalAlpha=Math.sin(ph*Math.PI)*.8;c.beginPath();c.arc(x,y,1.2+(i%3)*.6,0,TAU);c.fill();}c.restore();},
 windStreaks(c,t,col){c.strokeStyle=alpha(col,.25);c.lineWidth=1;for(let i=0;i<14;i++){const x=((i*173+t*240)%(this.vw+300))-150,y=this.vh*(.3+(i%7)*.08);c.beginPath();c.moveTo(x,y);c.lineTo(x+60+(i%3)*30,y-4);c.stroke();}},
 jellyfish(c,t,col){for(let i=0;i<6;i++){const x=(this.vw*(i+.5)/6+Math.sin(t*.2+i)*30),y=this.vh*(.25+(i%3)*.12)+Math.sin(t*.6+i*2)*20,p=.8+.2*Math.sin(t*2+i);c.fillStyle=alpha(col,.35);c.beginPath();c.ellipse(x,y,14*p,10,0,Math.PI,0);c.fill();c.strokeStyle=alpha(col,.3);c.lineWidth=1;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(x+k*5,y);c.quadraticCurveTo(x+k*5+Math.sin(t*2+k)*4,y+14,x+k*4,y+26);c.stroke();}}},
 spores(c,t,col){c.save();c.globalCompositeOperation='screen';for(let i=0;i<30;i++){const x=(i*131+Math.sin(t*.3+i)*40)%this.vw,y=this.vh*(.35+((i*43)%50)*.01)+Math.cos(t*.5+i)*14;c.globalAlpha=.4+.4*Math.sin(t*2+i);K.glow(c,x,y,6,col,.8);}c.restore();},
 shootingStars(c,t){for(let i=0;i<3;i++){const ph=(t*.13+i*.37)%1;if(ph>.25)continue;const k=ph/.25,x=this.vw*(.2+i*.3)+k*220,y=this.vh*(.1+i*.08)+k*90;const g=c.createLinearGradient(x-120,y-50,x,y);g.addColorStop(0,'#ffffff00');g.addColorStop(1,'#ffffffcc');c.strokeStyle=g;c.lineWidth=2;c.beginPath();c.moveTo(x-120,y-50);c.lineTo(x,y);c.stroke();}},
 lighthouse(c,t){const lm=this.S.landmark;if(!lm)return;const v=this.view,sL=v.base*Math.pow(Math.max(.01,v.scale/v.base),.15+lm.f*.85),camX=(v.x-this.W/2)*lm.f,camY=384+(v.y-384)*Math.min(1,lm.f*1.6);const x=this.vw/2+(lm.x-camX)*sL,y=this.vh/2+(LH-lm.h+315-camY-LIFT)*sL;const a=t*.9,len=this.vw*.9;c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,0,x,y,len);g.addColorStop(0,'#fff6c8aa');g.addColorStop(1,'#fff6c800');c.fillStyle=g;for(const s of [0,Math.PI]){c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a+s-.08)*len,y+Math.sin(a+s-.08)*len*.25);c.lineTo(x+Math.cos(a+s+.08)*len,y+Math.sin(a+s+.08)*len*.25);c.fill();}c.restore();},
 fireflies(c,t,col,n){c.save();c.globalCompositeOperation='screen';for(let i=0;i<n;i++){const x=(i*97+Math.sin(t*.7+i*1.7)*40)%this.vw,y=this.vh*(.4+((i*43)%50)*.01)+Math.cos(t*.9+i)*16,p=Math.pow(Math.max(0,Math.sin(t*2.2+i*1.3)),2);K.glow(c,x,y,8,col,p);}c.restore();},
 smokeColumns(c,t,col){for(let i=0;i<4;i++){const bx=this.vw*(.15+i*.24);for(let k=0;k<10;k++){const ph=((t*.05+k*.1+i*.13)%1),x=bx+Math.sin(ph*4+i)*30+ph*60,y=this.vh*(.75-ph*.7),r=10+ph*60;c.fillStyle=alpha(col,.22*(1-ph));c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}}},
 petals(c,t,col,n){c.fillStyle=col;for(let i=0;i<n;i++){const ph=(t*.05*(1+(i%4)*.25)+i*.071)%1,x=((i*137)+t*30+Math.sin(t+i)*40)%this.vw,y=this.vh*ph;c.save();c.translate(x,y);c.rotate(t*2+i);c.globalAlpha=.8;c.beginPath();c.ellipse(0,0,3,1.6,0,0,TAU);c.fill();c.restore();}},
 sandStreaks(c,t,col){c.strokeStyle=alpha(col,.3);c.lineWidth=1;for(let i=0;i<24;i++){const x=((i*157+t*180)%(this.vw+300))-150,y=this.vh*(.55+(i%9)*.05);c.beginPath();c.moveTo(x,y);c.lineTo(x+40+(i%4)*20,y+2);c.stroke();}},
 fish(c,t){for(let s=0;s<3;s++){const dir=s%2?1:-1,cx=dir>0?((t*30+s*400)%(this.vw+400))-200:this.vw+200-((t*30+s*400)%(this.vw+400)),cy=this.vh*(.3+s*.15);for(let i=0;i<12;i++){const x=cx+Math.cos(i*1.7+t)*30+(i%4)*10*dir,y=cy+Math.sin(i*2.3+t*1.3)*16;c.fillStyle=s===1?'#ffcf6a99':'#a8f0ff88';c.beginPath();c.ellipse(x,y,5,2.2,0,0,TAU);c.fill();c.beginPath();c.moveTo(x-5*dir,y);c.lineTo(x-9*dir,y-3);c.lineTo(x-9*dir,y+3);c.fill();}}},
 bubbles(c,t,col){c.strokeStyle=alpha(col,.5);c.lineWidth=1;for(let i=0;i<26;i++){const ph=(t*.07*(1+(i%5)*.2)+i*.13)%1,x=(i*71.3+Math.sin(t+i)*10)%this.vw,y=this.vh*(1-ph);c.beginPath();c.arc(x,y,1.5+(i%4),0,TAU);c.stroke();}},
 sparks(c,t){c.save();c.globalCompositeOperation='screen';for(let s=0;s<3;s++){const bx=this.vw*(.2+s*.3),by=this.vh*.62;for(let i=0;i<18;i++){const ph=((t*1.3+i*.071+s*.3)%1),vx=Math.cos(i*2.1)*90,vy=-140+Math.sin(i*1.3)*40;const x=bx+vx*ph,y=by+vy*ph+260*ph*ph;c.fillStyle=`rgba(255,${180+Math.round(60*(1-ph))},80,${1-ph})`;c.fillRect(x,y,2,2);}}c.restore();},
 warningLights(c,t){const on=Math.sin(t*5)>0;if(!on)return;for(let i=0;i<5;i++){K.glow(c,this.vw*(.1+i*.2),this.vh*(.45+(i%2)*.1),10,'#ff3a2a',.9);}},
 bats(c,t,col){c.fillStyle=col;for(let i=0;i<9;i++){const x=((i*173+t*(40+i*5))%(this.vw+200))-100,y=this.vh*(.15+(i%4)*.07)+Math.sin(t*3+i)*12,f=Math.sin(t*16+i)*5;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-6,y-6-f,x-12,y-f);c.quadraticCurveTo(x-6,y+1,x,y+3);c.quadraticCurveTo(x+6,y+1,x+12,y-f);c.quadraticCurveTo(x+6,y-6-f,x,y);c.fill();}},
 sparkles(c,t,col){c.fillStyle=col;for(let i=0;i<30;i++){const x=(i*137)%this.vw,y=this.vh*(.1+((i*53)%60)*.01),p=Math.max(0,Math.sin(t*3+i*1.7));if(p<.2)continue;c.globalAlpha=p;c.beginPath();c.moveTo(x,y-4*p);c.lineTo(x+1,y);c.lineTo(x,y+4*p);c.lineTo(x-1,y);c.fill();c.beginPath();c.moveTo(x-4*p,y);c.lineTo(x,y+1);c.lineTo(x+4*p,y);c.lineTo(x,y-1);c.fill();}c.globalAlpha=1;}
};

CS5.scenery={
 LW,DEFS,
 prepare(map,level){return build(map,level);},
 cacheEntry(map,level){return cache.get(map+':'+level)||null;},
 // Posición en pantalla (fracción) de la fuente de luz principal del cielo.
 lightSource(map){const s=(DEFS[map]||DEFS[0]).sky||{},src=s.sun||s.moon||s.dyingStar||s.eclipse||s.planet;return src?{x:src.x,y:src.y}:{x:.5,y:.04};},
 // Dibuja el fondo completo en coordenadas de pantalla (c ya tiene la escala DPR).
 draw(c,time,view,W,map,level){
  const S=build(map,level),vw=view.width,vh=view.height;
  drawSky(c,S,time,vw,vh,view);
  if(S.landmark&&S.layers.length)drawLayerImage(c,S.layers[0].cv,S.layers[0].f,0,0,0,view,W,vw,vh,true,null);
  if(S.landmark){const lm=S.landmark;drawLayerImage(c,lm.cv,lm.f,lm.x,lm.w,lm.h,view,W,vw,vh,false,null);}
  for(let i=S.landmark?1:0;i<S.layers.length;i++){const L=S.layers[i];drawLayerImage(c,L.cv,L.f,0,0,0,view,W,vw,vh,true,L.fill);}
  if(level>0&&S.def.ambient){amb.vw=vw;amb.vh=vh;amb.S=S;amb.view=view;amb.W=W;S.def.ambient(c,time,amb);}
 },
 // Miniatura del menú: cielo + capas a escala reducida.
 thumbnail(cv,map){const S=build(map,1),c=cv.getContext('2d'),w=cv.width,h=cv.height,fake={x:3072/2,y:384,scale:h/768*1.1,base:h/768*1.1,width:w,height:h};
  drawSky(c,S,0,w,h,fake);for(const L of S.layers)drawLayerImage(c,L.cv,L.f,0,0,0,fake,3072,w,h,true,L.fill);}
};
})();
