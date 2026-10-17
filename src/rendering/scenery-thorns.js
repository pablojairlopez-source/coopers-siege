// Cooper's Siege 5.1 — Escenografía del Jardín de Espinas (mapa 17, índice 16).
// Un jardín de fantasía suspendido en el cielo: zarzas colosales que se retuercen y se
// trenzan, plataformas de raíces, flores gigantes, bancos de nubes voluminosas, luz
// suave del amanecer y pétalos, polen y motas de polvo flotando. Geometría y dibujo
// originales (curvas procedurales), sin recursos de otros juegos.
// Se carga después de scenery.js y registra DEFS[16].
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const K=CS5.kit,S=CS5.scenery;if(!K||!S)return;
const TAU=Math.PI*2,LW=2048,{mix,alpha,heightAt,wrapDraw}=K;

// Camino de una rama: curva suave con rizos (seno amortiguado + ruido).
function vinePath(r,x0,y0,x1,y1,o={}){
 const steps=o.steps||48,amp=o.amp??60,curl=o.curl??2,ph=r()*TAU,pts=[];
 for(let i=0;i<=steps;i++){const t=i/steps,bx=x0+(x1-x0)*t,by=y0+(y1-y0)*t-Math.sin(t*Math.PI)*(o.arch??0);
  const w=Math.sin(t*TAU*curl+ph)*amp*Math.sin(t*Math.PI);pts.push([bx+Math.cos(ph+t*5)*w*.25,by+w]);}
 return pts;
}
// Zarza: trazo grueso con luz superior, sombra inferior y espinas alternas.
function bramble(c,r,pts,o){
 const w=o.width||18;c.lineCap='round';c.lineJoin='round';
 const stroke=(col,lw,dy=0)=>{c.strokeStyle=col;c.lineWidth=lw;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]+dy):c.moveTo(p[0],p[1]+dy));c.stroke();};
 stroke(o.dark||'#2a1a22',w*1.15,w*.12);stroke(o.color||'#4a3038',w);stroke(o.lit||'#7a5a5a',w*.32,-w*.28);
 // Hebra secundaria que se enrosca alrededor de la principal.
 if(o.twist){c.strokeStyle=o.twist;c.lineWidth=w*.35;c.beginPath();pts.forEach((p,i)=>{const s=Math.sin(i*.9)*w*.45;i?c.lineTo(p[0],p[1]+s):c.moveTo(p[0],p[1]+s);});c.stroke();}
 // Espinas curvas perpendiculares a la rama.
 c.fillStyle=o.thorn||'#1e1016';
 for(let i=2;i<pts.length-1;i+=o.thornStep||2){const [x,y]=pts[i],[nx,ny]=pts[i+1],a=Math.atan2(ny-y,nx-x),side=(i>>1)%2?1:-1,len=w*(.7+r()*.6),b=a+side*Math.PI/2+(r()-.5)*.5;
  const bx=x+Math.cos(a+side*Math.PI/2)*w*.42,by=y+Math.sin(a+side*Math.PI/2)*w*.42;
  c.beginPath();c.moveTo(bx-Math.cos(a)*w*.22,by-Math.sin(a)*w*.22);c.quadraticCurveTo(bx+Math.cos(b)*len*.6,by+Math.sin(b)*len*.6,bx+Math.cos(b+side*.35)*len,by+Math.sin(b+side*.35)*len);c.lineTo(bx+Math.cos(a)*w*.22,by+Math.sin(a)*w*.22);c.fill();}
 // Hojas en algunos puntos.
 if(o.leaf)for(let i=3;i<pts.length;i+=5){if(r()<.35)continue;const [x,y]=pts[i],a=r()*TAU;c.fillStyle=r()<.5?o.leaf:mix(o.leaf,'#ffffff',.25);c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.ellipse(w*.7,0,w*.75,w*.3,0,0,TAU);c.fill();c.restore();}
}
// Flor gigante: pétalos con degradado, corona de estambres y brillo.
function flower(c,r,x,y,s,petal,heart){
 const n=6+Math.floor(r()*3),rot=r()*TAU;
 for(let k=0;k<n;k++){const a=rot+k/n*TAU;c.save();c.translate(x,y);c.rotate(a);const g=c.createLinearGradient(0,0,s,0);g.addColorStop(0,mix(petal,'#ffffff',.45));g.addColorStop(1,petal);c.fillStyle=g;c.beginPath();c.ellipse(s*.55,0,s*.55,s*.26,0,0,TAU);c.fill();c.restore();}
 c.fillStyle=heart;c.beginPath();c.arc(x,y,s*.24,0,TAU);c.fill();c.fillStyle=mix(heart,'#ffffff',.5);for(let k=0;k<8;k++){const a=k/8*TAU;c.beginPath();c.arc(x+Math.cos(a)*s*.14,y+Math.sin(a)*s*.14,s*.04,0,TAU);c.fill();}
}
// Banco de nubes voluminosas (bolas superpuestas con luz desde arriba).
function cloudBank(c,r,y,h,col,shade,count){
 for(let k=0;k<count;k++){const x=r()*LW,rr=h*(.5+r()*.8);wrapDraw(LW,x,rr*1.2,xx=>{c.fillStyle=shade;c.beginPath();c.arc(xx,y+rr*.25,rr,0,TAU);c.fill();c.fillStyle=col;c.beginPath();c.arc(xx-rr*.12,y,rr*.92,0,TAU);c.fill();});}
}

S.DEFS[16]={
 sky:{stops:['#2a3f80','#6f86c8','#c9b8e8','#ffe2ec'],sun:{x:.72,y:.2,r:42,color:'#fff8ea',glow:'#ffd8e8'},clouds:{count:10,col:'#ffffff',shade:'#d8c8f0',y:[.06,.36]}},
 // Hito: la Gran Zarza, una torre de ramas retorcidas coronada por una flor colosal.
 landmark:{f:.05,x:1500,w:700,h:760,paint(c,r){
  const cx=350;
  for(let k=0;k<5;k++){const off=(k-2)*26,pts=[];for(let i=0;i<=60;i++){const t=i/60,y=760-t*560,x=cx+off*(1-t*.7)+Math.sin(t*TAU*1.6+k*1.3)*(34-t*18);pts.push([x,y]);}
   bramble(c,r,pts,{width:30-k*3,color:mix('#6a5a8a','#4a3a5a',k/5),dark:'#3a2e4e',lit:'#a898c8',thorn:'#3a2e4e',thornStep:4});}
  // Ramas laterales que se curvan hacia fuera.
  for(let k=0;k<6;k++){const y0=600-k*70,side=k%2?1:-1;bramble(c,r,vinePath(r,cx,y0,cx+side*(150+r()*90),y0-60-r()*80,{amp:18,curl:1.2,steps:24}),{width:12,color:'#5a4a7a',dark:'#3a2e4e',lit:'#9a8abc',thorn:'#3a2e4e',leaf:'#6a8aa0',thornStep:3});}
  K.glow(c,cx,190,170,'#ffd8ec',.55);flower(c,r,cx,190,110,'#f6a8cc','#ffe08a');
  for(let k=0;k<4;k++){const a=r()*TAU;flower(c,r,cx+Math.cos(a)*170,330+Math.sin(a)*90,36+r()*20,'#e8b0e0','#fff0a8');}}},
 layers:[
  // Lejos: islas-jardín flotantes en la bruma y un mar de nubes.
  {f:.05,paint(c,r){
   for(let k=0;k<7;k++){const x=r()*LW,y=330+r()*170,w=90+r()*120;wrapDraw(LW,x,w*1.6,xx=>{
    c.fillStyle='#8a86b8';c.beginPath();c.moveTo(xx-w,y);c.quadraticCurveTo(xx,y+w*.9,xx+w,y);c.closePath();c.fill();
    c.fillStyle='#9fb0d8';c.beginPath();c.ellipse(xx,y,w,w*.18,0,0,TAU);c.fill();
    for(let s=0;s<5;s++){const sx=xx-w*.7+s*w*.35;bramble(c,r,vinePath(r,sx,y,sx+(r()-.5)*60,y-60-r()*70,{amp:10,curl:1,steps:14}),{width:5,color:'#7a76a8',dark:'#6a6698',lit:'#b8b4e0',thorn:'#6a6698',thornStep:3});}
    for(let s=0;s<3;s++)flower(c,r,xx+(r()-.5)*w,y-50-r()*40,10+r()*8,'#e8c0e8','#fff0c0');
    // Raíces colgantes.
    c.strokeStyle='#7c78aa';c.lineWidth=2;for(let s=0;s<6;s++){const rx=xx-w*.5+r()*w;c.beginPath();c.moveTo(rx,y+w*.2);c.quadraticCurveTo(rx+(r()-.5)*20,y+w*.6,rx+(r()-.5)*30,y+w*(.8+r()*.5));c.stroke();}});}
   K.haze(c,LW,520,140,'#f2e8ff',.5);
   cloudBank(c,r,700,90,'#f6f2ff','#cfc6ec',34);cloudBank(c,r,740,70,'#ffffff','#ddd6f2',30);}},
  // Medio: grandes zarzas en arco, cruzándose, con flores rosas y amarillas.
  {f:.14,paint(c,r){
   for(let k=0;k<9;k++){const x0=r()*LW,x1=x0+300+r()*500,y0=760,y1=760;const pts=vinePath(r,x0,y0,x1,y1,{arch:360+r()*200,amp:40,curl:1.5,steps:40});
    bramble(c,r,pts,{width:16+r()*8,color:'#5a4660',dark:'#3c2c44',lit:'#8e7a98',thorn:'#2e2036',twist:'#4a6a58',leaf:'#5e8e62'});
    for(let s=0;s<3;s++){const p=pts[Math.floor(r()*pts.length)];flower(c,r,p[0],p[1]-10,18+r()*16,['#ff9ac8','#ffd36a','#c8a0ff'][Math.floor(r()*3)],'#fff2a8');}}
   K.haze(c,LW,640,110,'#f2e8ff',.35);
   cloudBank(c,r,740,60,'#ffffff','#d6cfee',26);}},
  // Cerca: zarzas oscuras y gruesas que enmarcan la escena, hojas y capullos.
  {f:.28,paint(c,r){
   for(let k=0;k<7;k++){const x0=r()*LW,x1=x0+(r()<.5?-1:1)*(200+r()*300),pts=vinePath(r,x0,790,x1,560+r()*120,{amp:50,curl:1.8,steps:36,arch:120});
    bramble(c,r,pts,{width:26+r()*10,color:'#3a2630',dark:'#22141c',lit:'#6a4a52',thorn:'#160a10',twist:'#2e4a3a',leaf:'#3e6e48',thornStep:2});
    const p=pts[pts.length-1];flower(c,r,p[0],p[1],26+r()*14,['#ff7ab8','#ffb0d8'][Math.floor(r()*2)],'#ffe27a');}
   for(let k=0;k<26;k++){const x=r()*LW,y=700+r()*60;c.fillStyle=r()<.5?'#3e6e48':'#4e8a56';c.save();c.translate(x,y);c.rotate(r()*TAU);c.beginPath();c.ellipse(0,0,16+r()*10,6,0,0,TAU);c.fill();c.restore();}
   cloudBank(c,r,770,50,'#fbf8ff','#d2caf0',22);}}
 ],
 ambient(c,t,s){
  s.petals(c,t,'#ffbcd8',42);
  // Polen dorado y motas de polvo que brillan con la luz.
  s.fireflies(c,t,'#fff2c0',26);
  c.fillStyle='#ffffff';for(let i=0;i<24;i++){const x=(i*173+t*(8+(i%4)*3)+Math.sin(t*.4+i)*30)%s.vw,y=s.vh*(.15+((i*37)%70)*.01)+Math.sin(t*.6+i*1.9)*12;c.globalAlpha=.25+.25*Math.sin(t*1.5+i);c.fillRect(x,y,1.6,1.6);}c.globalAlpha=1;
  s.birds(c,t,'#4a4070',4,.14);
 }
};
})();
