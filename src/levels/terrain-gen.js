// Cooper's Siege 5.0 — Generador de escenarios ampliados.
// Cada mapa tiene un trazado propio (islas, azoteas, conos volcánicos, murallas…)
// definido sobre un mundo de 3072 × 768 unidades. Las variaciones dependen solo
// de la semilla de la partida, así que anfitrión e invitado obtienen el mismo
// terreno en LAN sin enviarlo.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const TAU=Math.PI*2;
const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function seeded(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

// Ruido de valor 1D suave y fractal, determinista por semilla.
function noise1(rand){
 const v=new Float32Array(512);for(let i=0;i<512;i++)v[i]=rand()*2-1;
 const n=x=>{const i=Math.floor(x),f=x-i,a=v[i&511],b=v[(i+1)&511];return a+(b-a)*sm(f);};
 n.fbm=(x,oct=4)=>{let s=0,amp=1,norm=0,f=1;for(let o=0;o<oct;o++){s+=n(x*f+o*37.1)*amp;norm+=amp;amp*=.5;f*=2.03;}return s/norm;};
 return n;
}
const bump=(x,c,w)=>Math.exp(-(((x-c)/w)**2));
// Meseta de cima plana con laderas suaves de ancho «edge».
const mesa=(x,c,half,edge)=>sm((x-(c-half-edge))/edge)*sm(((c+half+edge)-x)/edge);
// Cono afilado (pico volcánico, aguja, pirámide).
const cone=(x,c,w)=>Math.max(0,1-Math.abs(x-c)/w);

// Contorno irregular para rocas flotantes, asteroides y pedruscos.
function blob(rand,cx,cy,rx,ry,rough=.22,pts=22){
 const out=[],ph=rand()*TAU;
 for(let i=0;i<pts;i++){const a=i/pts*TAU,r=1+rough*(Math.sin(a*3+ph)*.5+(rand()-.5));out.push([cx+Math.cos(a)*rx*r,cy+Math.sin(a)*ry*r]);}
 return {type:'poly',pts:out};
}
// Túnel sinuoso formado por una cadena de elipses (cuevas, metro, tubos de lava).
function tunnel(rand,x0,y0,x1,y1,r,wiggle=18){
 const steps=Math.max(6,Math.ceil(Math.hypot(x1-x0,y1-y0)/(r*.7))),out=[];
 for(let i=0;i<=steps;i++){const t=i/steps,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+Math.sin(t*Math.PI*2+rand()*.6)*wiggle;out.push({type:'ellipse',x,y,rx:r*(.85+rand()*.3),ry:r*(.7+rand()*.25)});}
 return out;
}

// --- Trazados por mapa -------------------------------------------------------
// Cada función recibe (ctx de generación) y devuelve {h(x), adds[], carves[]}.
// h(x) es la altura de la superficie (y crece hacia abajo; > WATER = agua).
const LAYOUTS=[
 // 0 · Archipiélago Sol: cuatro islas con canales de agua turquesa, un peñón volcánico y grutas marinas.
 g=>{const {W,WATER,r,n}=g,j=()=>(r()-.5)*90;
  const islands=[[420+j(),330],[1180+j(),300],[1930+j(),320],[2660+j(),300]];
  const gaps=[800+j()*.4,1560+j()*.4,2300+j()*.4];
  const peak=1+Math.floor(r()*2);
  return {h:x=>{let y=470+28*n.fbm(x*.004,4)+12*Math.sin(x*.02);
   islands.forEach(([c,w],i)=>{y-=70*bump(x,c,w*.55)+(i===peak?150*bump(x,c+40,120):0);});
   for(const c of gaps)y+=330*sm(1-Math.abs(x-c)/95);
   return y;},
   adds:[],carves:[...gaps.flatMap(c=>[{type:'ellipse',x:c-150,y:WATER-40,rx:48,ry:120},{type:'ellipse',x:c+150,y:WATER-30,rx:40,ry:105}]),...tunnel(r,islands[peak][0]-120,560,islands[peak][0]+140,520,34,14)]};},
 // 1 · Distrito Neón: azoteas de alturas distintas, puentes, un canal y una línea de metro subterránea.
 g=>{const {W,WATER,r,n}=g,blocks=[];let x=60;
  while(x<W-60){const w=110+r()*190,top=300+r()*190;blocks.push([x,w,top]);x+=w+(r()<.25?60+r()*50:0);}
  const canal=W*.5+(r()-.5)*240;
  return {h:x=>{let y=560;for(const [bx,bw,top] of blocks)if(x>=bx&&x<bx+bw)y=Math.min(y,top+(x-bx<8||bx+bw-x<8?6:0));
   y+=320*sm(1-Math.abs(x-canal)/110);return y;},
   adds:[{type:'rect',x:canal-160,y:420,w:320,h:14}],
   carves:[...tunnel(r,140,600,canal-220,600,30,6),...tunnel(r,canal+220,605,W-140,600,30,6),...blocks.filter(()=>r()<.35).map(([bx,bw,top])=>({type:'rect',x:bx+bw*.25,y:top+60,w:bw*.5,h:46}))]};},
 // 2 · Caldera Roja: tres conos con cráter, un mar de lava y tubos de lava.
 g=>{const {W,WATER,r,n}=g,cones=[[520+(r()-.5)*120,260],[1540+(r()-.5)*120,300],[2560+(r()-.5)*120,250]];
  return {h:x=>{let y=560+22*n.fbm(x*.005,3);
   for(const [c,hgt] of cones)y-=hgt*Math.pow(cone(x,c,430),1.25);
   y+=250*sm(1-Math.abs(x-1030)/120)+250*sm(1-Math.abs(x-2050)/110);return y;},
   adds:[],carves:[...cones.map(([c,hgt])=>({type:'ellipse',x:c,y:555-hgt-12,rx:62,ry:44})),...tunnel(r,cones[0][0]-160,600,cones[0][0]+180,590,32),...tunnel(r,cones[2][0]-200,595,cones[2][0]+150,610,30)]};},
 // 3 · Aurora Polar: crestas dentadas, cuevas de hielo redondeadas y una plataforma de lago helado.
 g=>{const {W,r,n}=g,peaks=[0,1,2,3,4].map(i=>[320+i*610+(r()-.5)*160,90+r()*120]);
  return {h:x=>{let y=500+40*n.fbm(x*.003,5)+14*n(x*.05);
   for(const [c,hgt] of peaks)y-=hgt*Math.pow(cone(x,c,260),1.6)+30*bump(x,c,300);
   y+=18*Math.abs(n(x*.03));return y;},
   adds:[{type:'rect',x:W*.5-260+(r()-.5)*200,y:470,w:520,h:22}],
   carves:peaks.filter((_,i)=>i%2===0).map(([c])=>({type:'ellipse',x:c+70,y:575,rx:85,ry:52}))};},
 // 4 · Órbita Violeta: dunas ondulantes con islas flotantes y setas gigantes con sombrero saliente.
 g=>{const {W,r,n}=g,adds=[],carves=[];
  for(let i=0;i<5;i++){const cx=380+i*560+(r()-.5)*160,cy=270+r()*80;adds.push(blob(r,cx,cy,95+r()*60,32+r()*14,.25));}
  for(let i=0;i<4;i++){const cx=650+i*600+(r()-.5)*120;adds.push({type:'ellipse',x:cx,y:430,rx:120,ry:36});carves.push({type:'ellipse',x:cx,y:470,rx:100,ry:36});}
  return {h:x=>500+70*n.fbm(x*.0035,4)+26*Math.sin(x*.011),adds,carves};},
 // 5 · Bastión Dorado: murallas almenadas, torre del homenaje, foso y pasadizos bajo el castillo.
 g=>{const {W,WATER,r,n}=g,keep=W*.5+(r()-.5)*160,walls=[[keep-900,260],[keep-520,160],[keep+520,160],[keep+900,260]];
  const crenel=x=>((Math.floor(x/26))%2===0?0:-14);
  return {h:x=>{let y=520+16*n.fbm(x*.006,3);
   for(const [c,w] of walls){const m=mesa(x,c,w*.5,24);y=y*(1-m)+(390+crenel(x))*m;}
   const k=mesa(x,keep,120,30);y=y*(1-k)+(300+crenel(x))*k;
   y+=260*sm(1-Math.abs(x-(keep-1250))/90)+260*sm(1-Math.abs(x-(keep+1250))/90);return y;},
   adds:[],carves:[...tunnel(r,keep-820,600,keep+820,600,30,10),{type:'rect',x:keep-36,y:340,w:72,h:120},{type:'ellipse',x:keep,y:340,rx:36,ry:30}]};},
 // 6 · Última Estrella: cinturón de asteroides flotantes sobre una base orbital partida.
 g=>{const {W,WATER,r,n}=g,adds=[];
  for(let i=0;i<9;i++){const cx=200+i*335+(r()-.5)*90,cy=300+r()*170;adds.push(blob(r,cx,cy,110+r()*70,55+r()*35,.32,26));}
  const bases=[[W*.25,380],[W*.75,380]];
  return {h:x=>{let y=WATER+80;for(const [c,w] of bases){const m=mesa(x,c,w*.5,40);y=y*(1-m)+(590+10*n(x*.04))*m;}return y;},adds,carves:adds.filter(()=>r()<.4).map(a=>{const p=a.pts[0];return {type:'ellipse',x:(a.pts[0][0]+a.pts[11][0])/2,y:(a.pts[5][1]+a.pts[16][1])/2+10,rx:34,ry:22};})};},
 // 7 · Puerto Tempestad: muelles sobre pilotes, pilas de contenedores y un rompeolas.
 g=>{const {W,WATER,r,n}=g,adds=[],carves=[];
  const piers=[[260,560],[1050,520],[1900,600],[2700,300]];
  for(let i=0;i<7;i++){const x=180+i*410+(r()-.5)*120,w=90+r()*60,stack=1+Math.floor(r()*3);adds.push({type:'rect',x,y:560-stack*52,w,h:stack*52+10});}
  for(const [px,pw] of piers)for(let k=40;k<pw-20;k+=95)carves.push({type:'rect',x:px+k,y:600,w:58,h:110});
  return {h:x=>{let y=WATER+60;for(const [px,pw] of piers)if(x>px&&x<px+pw)y=575+(x-px<18||px+pw-x<18?8:0);return y+4*n(x*.05);},adds,carves};},
 // 8 · Bosque Umbrío: colinas con arcos de raíces gigantes y un tronco hueco.
 g=>{const {W,r,n}=g,arches=[0,1,2,3].map(i=>520+i*680+(r()-.5)*140);
  return {h:x=>{let y=470+60*n.fbm(x*.0028,5)+20*Math.sin(x*.009);for(const a of arches)y-=60*bump(x,a,180);return y;},
   adds:[],carves:[...arches.map(a=>({type:'ellipse',x:a,y:560,rx:110,ry:70})),...arches.filter((_,i)=>i%2).map(a=>({type:'ellipse',x:a+260,y:500,rx:46,ry:80}))]};},
 // 9 · Kilómetro Cero: pasos elevados rotos, montañas de escombros y edificios derrumbados.
 g=>{const {W,WATER,r,n}=g,adds=[],carves=[];
  for(let i=0;i<4;i++){const x=200+i*720+(r()-.5)*150,w=380+r()*160;adds.push({type:'rect',x,y:400+r()*40,w,h:20});carves.push({type:'rect',x:x+w*.45,y:380,w:40+r()*30,h:60});}
  const blocks=[0,1,2,3,4,5].map(i=>[150+i*500+(r()-.5)*120,100+r()*90,140+r()*120]);
  return {h:x=>{let y=540+30*n.fbm(x*.006,4)+18*Math.abs(n(x*.04));for(const [c,w,hgt] of blocks){const m=mesa(x,c,w*.5,10);y-=hgt*m*(.85+.15*Math.sign(Math.sin(x*.21)));}return y;},adds,carves:[...carves,...blocks.map(([c,w,hgt])=>({type:'rect',x:c-w*.3,y:540-hgt+40,w:w*.6,h:hgt*.45}))]};},
 // 10 · Valle Cerezos: colinas en terrazas, el monte central, un templo y un río con puente.
 g=>{const {W,WATER,r,n}=g,river=W*.66+(r()-.5)*200;
  return {h:x=>{let base=520-150*bump(x,W*.33,420)-90*bump(x,W*.86,260)+20*n.fbm(x*.004,3);
   base=Math.round(base/34)*34+6*n(x*.02);return base+300*sm(1-Math.abs(x-river)/120);},
   adds:[{type:'rect',x:river-190,y:445,w:380,h:16},{type:'rect',x:W*.33-110,y:300,w:220,h:30}],carves:[...tunnel(r,W*.33-240,560,W*.33+240,560,34,12)]};},
 // 11 · Dunas de Anubis: dunas largas y pirámides escalonadas con cámara interior.
 g=>{const {W,r,n}=g,pyr=[[700+(r()-.5)*150,300,290],[2150+(r()-.5)*150,360,340]];
  return {h:x=>{let y=520+38*Math.sin(x*.0045+r.seedPhase)+22*n.fbm(x*.006,3);
   for(const [c,w,hgt] of pyr){const p=cone(x,c,w);if(p>0)y=Math.min(y,560-Math.round(p*hgt/22)*22);}return y;},
   adds:[{type:'rect',x:1430,y:420,w:30,h:150}],
   carves:pyr.flatMap(([c,w,hgt])=>[{type:'rect',x:c-90,y:560-hgt*.38,w:180,h:46},{type:'rect',x:c-14,y:560-hgt*.38-60,w:28,h:60}])};},
 // 12 · Abismo Atlantis: domos huecos, columnas de mármol y arrecifes.
 g=>{const {W,r,n}=g,domes=[0,1,2].map(i=>[560+i*980+(r()-.5)*120,210]),adds=[],carves=[];
  for(const [c,rad] of domes){adds.push({type:'ellipse',x:c,y:560,rx:rad,ry:rad*.85});carves.push({type:'ellipse',x:c,y:575,rx:rad-30,ry:rad*.85-34});}
  for(let i=0;i<6;i++){const x=300+i*480+(r()-.5)*90;adds.push({type:'rect',x,y:330+r()*60,w:34,h:260});}
  return {h:x=>560+30*n.fbm(x*.005,4)+18*Math.abs(n(x*.03)),adds,carves};},
 // 13 · Fundición Omega: plataformas de acero a varias alturas, hornos y tuberías.
 g=>{const {W,WATER,r,n}=g,decks=[];let x=40;
  while(x<W-40){const w=220+r()*260;decks.push([x,w,330+Math.round(r()*5)*40]);x+=w+70+r()*40;}
  return {h:x=>{let y=WATER+60;for(const [dx,dw,top] of decks)if(x>=dx&&x<dx+dw)y=top;
   for(let i=0;i<decks.length-1;i++){const a=decks[i],b=decks[i+1],x0=a[0]+a[1],x1=b[0];if(x>=x0&&x<x1)y=Math.max(a[2],b[2])+180;}return y;},
   adds:decks.map(([dx,dw,top])=>({type:'rect',x:dx-14,y:top,w:dw+28,h:18})),
   carves:[...decks.filter(()=>r()<.5).map(([dx,dw,top])=>({type:'rect',x:dx+dw*.3,y:top+70,w:dw*.4,h:70})),...tunnel(r,120,640,W-120,640,22,4)]};},
 // 14 · Catedral Gótica: agujas de obsidiana, arcos ojivales y simas infernales.
 g=>{const {W,r,n}=g,spires=[0,1,2,3,4,5,6].map(i=>[220+i*440+(r()-.5)*100,160+r()*170]);
  return {h:x=>{let y=540+20*n.fbm(x*.006,3);for(const [c,hgt] of spires)y-=hgt*Math.pow(cone(x,c,120),.9)+40*bump(x,c,180);
   y+=260*sm(1-Math.abs(x-W*.33)/80)+260*sm(1-Math.abs(x-W*.7)/80);return y;},
   adds:[],carves:spires.filter((_,i)=>i%2).flatMap(([c])=>[{type:'rect',x:c-46,y:520,w:92,h:70},{type:'ellipse',x:c,y:520,rx:46,ry:58}])};},
 // 15 · Dulce Caos: pasteles en pisos, colinas de piruleta y una rosquilla gigante.
 g=>{const {W,r,n}=g,cakes=[0,1,2].map(i=>[520+i*1000+(r()-.5)*150,1+Math.floor(r()*2)]),adds=[],carves=[];
  const donut=[W*.5+(r()-.5)*200,380];adds.push({type:'ellipse',x:donut[0],y:donut[1],rx:120,ry:120});carves.push({type:'ellipse',x:donut[0],y:donut[1],rx:50,ry:50});
  return {h:x=>{let y=520+40*Math.sin(x*.006)+16*n.fbm(x*.008,3);
   for(const [c,tiers] of cakes)for(let t=0;t<=tiers;t++){const m=mesa(x,c,230-t*70,18);y=Math.min(y,y*(1-m)+(470-t*70)*m);}return y;},adds,carves};},
 // 16 · Jardín de Espinas (5.1): troncos de zarza suspendidos sobre un mar de nubes, ramas
 // trenzadas que hacen de puentes, plataformas de raíces y flores gigantes con tallo.
 // Las espinas de los puentes cuelgan por debajo: son silueta y terreno destructible, no dañan.
 g=>{const {W,WATER,r,n}=g,adds=[],carves=[];
  const trunks=[0,1,2,3].map(i=>[360+i*790+(r()-.5)*150,150+r()*60,390+r()*60]);
  // Puentes de dos hebras retorcidas entre troncos vecinos.
  for(let i=0;i<trunks.length-1;i++){
   const [a,aw,at]=trunks[i],[b,bw,bt]=trunks[i+1],x0=a+aw*.6,x1=b-bw*.6,sag=40+r()*60,ph=r()*TAU;
   for(let k=0;k<=46;k++){const t=k/46,x=x0+(x1-x0)*t,y=at+(bt-at)*t+sag*Math.sin(t*Math.PI)+12;
    for(const s of [-1,1])adds.push({type:'ellipse',x,y:y+s*7*Math.sin(t*TAU*3+ph),rx:13,ry:9});
    if(k%5===2){const sx=x+(r()-.5)*8,sy=y+14,len=14+r()*12;adds.push({type:'poly',pts:[[sx-5,sy],[sx+5,sy],[sx+(r()-.5)*6,sy+len]]});}}
  }
  // Plataformas de raíces flotantes por encima de los puentes.
  for(let i=0;i<5;i++){const cx=520+i*520+(r()-.5)*140,cy=300+r()*60;adds.push(blob(r,cx,cy,70+r()*40,18+r()*8,.28,20));}
  // Flores gigantes: tallo y corola que sirve de plataforma.
  for(let i=0;i<3;i++){const cx=760+i*790+(r()-.5)*120,cy=360+r()*50;adds.push({type:'rect',x:cx-8,y:cy,w:16,h:WATER+60-cy});adds.push({type:'ellipse',x:cx,y:cy,rx:78,ry:15});adds.push({type:'ellipse',x:cx,y:cy-8,rx:30,ry:10});}
  // Huecos y nudos en los troncos.
  for(const [c,hw,top] of trunks){carves.push({type:'ellipse',x:c+(r()-.5)*hw*.6,y:top+95+r()*30,rx:hw*.32,ry:34});}
  return {h:x=>{let y=WATER+130;
   for(const [c,hw,top] of trunks){const m=mesa(x,c,hw,60),gnarl=top+22*n.fbm(x*.012,3)+10*Math.sin(x*.05);y=y*(1-m)+gnarl*m;}
   return y;},adds,carves};}
];

function makeLayout(index,seed,W,H,WATER){
 const r=seeded((seed>>>0)^Math.imul(index+1,0x9E3779B1));
 r.seedPhase=r()*TAU;
 const n=noise1(r);
 const layout=(LAYOUTS[index]||LAYOUTS[0])({W,H,WATER,r,n});
 // Extensión: superficie cada 2 unidades con playas inclinadas en los extremos del mapa.
 const step=2,line=new Float32Array(Math.ceil(W/step)+1);
 for(let i=0;i<line.length;i++){
  const x=i*step;let y=layout.h(x);
  const edge=Math.min(x,W-x),shore=edge<110?Math.pow((110-edge)/110,1.6)*260:0;
  line[i]=clamp(y,250,WATER+140)+shore;
 }
 return {line,step,adds:layout.adds||[],carves:layout.carves||[]};
}

function drawShape(c,s){
 c.beginPath();
 if(s.type==='ellipse')c.ellipse(s.x,s.y,Math.max(1,s.rx),Math.max(1,s.ry),s.rot||0,0,TAU);
 else if(s.type==='rect')c.rect(s.x,s.y,s.w,s.h);
 else if(s.type==='poly'){s.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();}
 c.fill();
}

// Dibuja el terreno (blanco = sólido) en un contexto 2D de tamaño W×H (o escalado).
function paintLayout(c,layout,W,H){
 c.save();c.fillStyle='#fff';c.beginPath();c.moveTo(0,H);
 for(let i=0;i<layout.line.length;i++)c.lineTo(i*layout.step,layout.line[i]);
 c.lineTo(W,H);c.closePath();c.fill();
 for(const s of layout.adds)drawShape(c,s);
 c.globalCompositeOperation='destination-out';
 for(const s of layout.carves)drawShape(c,s);
 c.restore();
}

CS5.terrainGen={makeLayout,paintLayout,seeded,noise1,MAP_COUNT:LAYOUTS.length};

// Puntos de aparición seguros y repartidos: solo superficies firmes por encima del
// agua, separados entre sí, deterministas a partir del terreno (iguales en LAN).
CS5.safeSpawns=function(terrain,total,W,WATER){
 const candidates=[];
 for(let x=60;x<W-60;x+=12){
  const s=terrain.surface(x,200);
  if(s&&s.y<WATER-40&&s.y>230)candidates.push(s);
 }
 if(!candidates.length)return Array.from({length:total},(_,i)=>({x:120+(W-240)*(i+.5)/total,y:200}));
 const picks=[],minGap=Math.max(70,Math.min(260,(candidates.at(-1).x-candidates[0].x)/(total*1.6)));
 for(let i=0;i<total;i++){
  const target=candidates[0].x+(candidates.at(-1).x-candidates[0].x)*(i+.5)/total;
  let best=null,bd=Infinity;
  for(const c of candidates){
   if(picks.some(p=>Math.abs(p.x-c.x)<minGap&&Math.abs(p.y-c.y)<60))continue;
   const d=Math.abs(c.x-target);if(d<bd){bd=d;best=c;}
  }
  picks.push(best||candidates[Math.floor(candidates.length*(i+.5)/total)]);
 }
 return picks.map(p=>({x:p.x,y:p.y}));
};
})();
