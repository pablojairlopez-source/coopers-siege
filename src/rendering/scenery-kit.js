// Cooper's Siege 5.0 — Kit de pintura para escenografías de fondo.
// Primitivas deterministas (semilla) que pintan en canvas 2D: cordilleras con
// facetas iluminadas, nieve, bosques, rascacielos, castillos, pagodas, pirámides,
// nubes suaves… Todas aceptan un ancho periódico para que las capas se puedan
// repetir sin costuras al desplazarse por el mapa ampliado.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const TAU=Math.PI*2;
const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);

function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
// Ruido periódico de período `period` (sin costura al repetir la capa).
function pnoise(rand,period,cells){const v=new Float32Array(cells);for(let i=0;i<cells;i++)v[i]=rand()*2-1;return x=>{let u=(x/period*cells)%cells;if(u<0)u+=cells;const i=Math.floor(u),f=u-i;return v[i]+(v[(i+1)%cells]-v[i])*sm(f);};}
function pfbm(rand,period,base=5,oct=5){const ns=[];for(let o=0;o<oct;o++)ns.push(pnoise(rand,period,base<<o));return x=>{let s=0,a=1,n=0;for(const f of ns){s+=f(x)*a;n+=a;a*=.5;}return s/n;};}

function hexToRgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mix(a,b,t){const x=hexToRgb(a),y=hexToRgb(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function alpha(hex,a){return hex+Math.round(Math.max(0,Math.min(1,a))*255).toString(16).padStart(2,'0');}

// Repite una función de dibujo en x, x−w y x+w para que los objetos que cruzan
// el borde aparezcan también al otro lado (capas periódicas).
function wrapDraw(w,x,size,fn){fn(x);if(x-size<0)fn(x+w);if(x+size>w)fn(x-w);}

// Cordillera: perfil fractal + facetas iluminadas por pendiente + borde de luz.
function ridge(c,rand,o){
 const w=o.width,h=o.height||768,step=o.step||6,n=pfbm(rand,w,o.cells||4,o.oct||5),pts=[];
 const jag=o.jagged?pfbm(rand,w,24,3):null;
 for(let x=0;x<=w;x+=step){
  let v=n(x)*.5+.5;
  if(o.sharp)v=Math.pow(v,o.sharp);
  if(jag)v+=jag(x)*o.jagged;
  if(o.shape)v=o.shape(x,v);
  pts.push([x,o.y-v*o.amp]);
 }
 const g=c.createLinearGradient(0,o.y-o.amp,0,o.y+(o.fade||220));
 g.addColorStop(0,o.top||o.color);g.addColorStop(1,o.bottom||o.color);
 c.fillStyle=g;c.beginPath();c.moveTo(0,h);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(w,h);c.closePath();c.fill();
 if(o.lit){
  // Facetas: las pendientes orientadas hacia el sol reciben luz, las otras sombra.
  c.save();c.beginPath();c.moveTo(0,h);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(w,h);c.closePath();c.clip();
  const sunDir=o.sunDir||1;
  for(let i=1;i<pts.length;i++){
   const [x0,y0]=pts[i-1],[x1,y1]=pts[i],slope=(y1-y0)/step*sunDir;
   const depth=o.facetDepth||Math.min(260,o.amp*1.2);
   c.fillStyle=slope<0?alpha(o.lit,Math.min(.55,-slope*.9)):alpha(o.shade||'#000000',Math.min(.4,slope*.7));
   c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1+depth*.35*sunDir,y1+depth);c.lineTo(x0+depth*.35*sunDir,y0+depth);c.closePath();c.fill();
  }
  c.restore();
 }
 if(o.snow){
  c.save();c.beginPath();c.moveTo(0,h);pts.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(w,h);c.closePath();c.clip();
  const sn=pfbm(rand,w,18,3);c.fillStyle=o.snow;c.beginPath();c.moveTo(0,0);
  for(let x=0;x<=w;x+=step)c.lineTo(x,o.snowLine+sn(x)*o.amp*.18);
  c.lineTo(w,0);c.closePath();c.fill();
  if(o.snowShade){c.fillStyle=o.snowShade;for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];if((y1-y0)*(o.sunDir||1)>0){c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1,o.snowLine+60);c.lineTo(x0,o.snowLine+60);c.closePath();c.fill();}}}
  c.restore();
 }
 if(o.rim){c.strokeStyle=o.rim;c.lineWidth=o.rimWidth||2;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();}
 return pts;
}
// Altura de un perfil en x (para posar objetos sobre una cordillera).
function heightAt(pts,x,w){if(!pts.length)return 0;let u=((x%w)+w)%w;const step=pts[1][0]-pts[0][0],i=Math.min(pts.length-2,Math.floor(u/step)),f=(u-pts[i][0])/step;return pts[i][1]+(pts[i+1][1]-pts[i][1])*f;}

// Banda de niebla horizontal (perspectiva atmosférica).
function haze(c,w,y,height,color,a=.6){const g=c.createLinearGradient(0,y-height,0,y+height);g.addColorStop(0,alpha(color,0));g.addColorStop(.5,alpha(color,a));g.addColorStop(1,alpha(color,0));c.fillStyle=g;c.fillRect(0,y-height,w,height*2);}

// --- Vegetación ----------------------------------------------------------------
function pine(c,x,y,s,col,lit){c.fillStyle=col;for(let k=0;k<4;k++){const yy=y-k*s*.22,ww=s*(.42-k*.08);c.beginPath();c.moveTo(x-ww,yy);c.lineTo(x,yy-s*.42);c.lineTo(x+ww,yy);c.closePath();c.fill();}
 if(lit){c.fillStyle=lit;for(let k=0;k<4;k++){const yy=y-k*s*.22,ww=s*(.42-k*.08);c.beginPath();c.moveTo(x,yy-s*.42);c.lineTo(x+ww,yy);c.lineTo(x+ww*.25,yy);c.closePath();c.fill();}}
 c.fillRect(x-s*.04,y,s*.08,s*.12);}
function palm(c,x,y,s,col,rand){const lean=(rand()-.5)*s*.5,tx=x+lean,ty=y-s;
 c.strokeStyle=col;c.lineWidth=Math.max(1.5,s*.07);c.lineCap='round';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+lean*.2,y-s*.55,tx,ty);c.stroke();
 c.lineWidth=Math.max(1,s*.05);for(let k=0;k<7;k++){const a=-Math.PI*.5+(k-3)*.42+(rand()-.5)*.2,len=s*(.5+rand()*.25);c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(tx+Math.cos(a)*len*.6,ty+Math.sin(a)*len*.6-s*.12,tx+Math.cos(a)*len,ty+Math.sin(a)*len+s*.18);c.stroke();}}
function roundTree(c,x,y,s,col,lit,rand){c.fillStyle=col;c.fillRect(x-s*.05,y-s*.45,s*.1,s*.45);for(let k=0;k<5;k++){const ox=(rand()-.5)*s*.5,oy=-s*.55-rand()*s*.35,r=s*(.2+rand()*.14);c.beginPath();c.arc(x+ox,y+oy,r,0,TAU);c.fill();if(lit){c.fillStyle=lit;c.beginPath();c.arc(x+ox+r*.25,y+oy-r*.25,r*.55,0,TAU);c.fill();c.fillStyle=col;}}}
function sakura(c,x,y,s,trunk,bloom,bloomHi,rand){c.strokeStyle=trunk;c.lineCap='round';const branch=(x0,y0,a,len,wd,d)=>{const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len;c.lineWidth=wd;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();if(d>0){branch(x1,y1,a-.45-rand()*.3,len*.7,wd*.65,d-1);branch(x1,y1,a+.35+rand()*.3,len*.68,wd*.65,d-1);}else{c.fillStyle=rand()<.5?bloom:bloomHi;c.beginPath();c.arc(x1,y1,s*(.1+rand()*.08),0,TAU);c.fill();}};branch(x,y,-Math.PI/2+(rand()-.5)*.3,s*.35,s*.07,4);}
function deadTree(c,x,y,s,col,rand){c.strokeStyle=col;c.lineCap='round';const branch=(x0,y0,a,len,wd,d)=>{const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len;c.lineWidth=wd;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();if(d>0){branch(x1,y1,a-.5-rand()*.4,len*.68,wd*.62,d-1);if(rand()<.8)branch(x1,y1,a+.4+rand()*.4,len*.64,wd*.62,d-1);}};branch(x,y,-Math.PI/2,s*.38,s*.06,4);}
function mushroom(c,x,y,s,stem,cap,dots){c.fillStyle=stem;c.beginPath();c.moveTo(x-s*.06,y);c.quadraticCurveTo(x-s*.1,y-s*.5,x-s*.03,y-s*.8);c.lineTo(x+s*.03,y-s*.8);c.quadraticCurveTo(x+s*.1,y-s*.5,x+s*.06,y);c.fill();c.fillStyle=cap;c.beginPath();c.ellipse(x,y-s*.8,s*.42,s*.2,0,Math.PI,0);c.fill();if(dots){c.fillStyle=dots;for(let k=-2;k<=2;k++){c.beginPath();c.arc(x+k*s*.14,y-s*.88+Math.abs(k)*s*.04,s*.035,0,TAU);c.fill();}}}
function kelp(c,x,y,s,col,rand){c.strokeStyle=col;c.lineWidth=Math.max(1.2,s*.05);c.lineCap='round';c.beginPath();c.moveTo(x,y);const ph=rand()*6;for(let k=1;k<=12;k++){c.lineTo(x+Math.sin(ph+k*.6)*s*.08,y-k*s/12);}c.stroke();}
function coral(c,x,y,s,col,rand){c.strokeStyle=col;c.lineCap='round';const br=(x0,y0,a,len,wd,d)=>{const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len;c.lineWidth=wd;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();if(d>0){br(x1,y1,a-.5,len*.75,wd*.8,d-1);br(x1,y1,a+.5,len*.75,wd*.8,d-1);}};br(x,y,-Math.PI/2,s*.3,s*.08,3);}

// --- Arquitectura -------------------------------------------------------------
function building(c,x,y,w,h,o,rand){
 c.fillStyle=o.color;c.fillRect(x,y-h,w,h);
 if(o.side){c.fillStyle=o.side;c.fillRect(x+w*.82,y-h,w*.18,h);}
 if(o.broken){c.save();c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(x-1,y-h-1);for(let k=0;k<=6;k++)c.lineTo(x+w*k/6,y-h+rand()*h*.28*(k%2?1:.4));c.lineTo(x+w+1,y-h-1);c.closePath();c.fill();for(let k=0;k<3;k++){c.beginPath();c.arc(x+rand()*w,y-h*rand(),w*.12*rand(),0,TAU);c.fill();}c.restore();}
 if(o.windows){const ww=Math.max(2,w*.09),wh=Math.max(3,ww*1.5),gx=ww*2.1,gy=wh*1.9;
  for(let yy=y-h+gy;yy<y-wh*1.5;yy+=gy)for(let xx=x+ww*.8;xx<x+w-ww*1.2;xx+=gx){const lit=rand()<o.lit;c.fillStyle=lit?o.windows:o.dark||'#00000055';c.fillRect(xx,yy,ww,wh);}}
 if(o.antenna&&rand()<.6){c.fillStyle=o.color;c.fillRect(x+w*.48,y-h-h*.25,Math.max(1.2,w*.03),h*.25);if(o.blink){c.fillStyle=o.blink;c.beginPath();c.arc(x+w*.49,y-h-h*.25,2,0,TAU);c.fill();}}
 if(o.neon&&rand()<.45){const nh=Math.max(6,h*.06),nw=w*(.5+rand()*.4),ny=y-h*(.3+rand()*.5);c.save();c.shadowColor=o.neon[0];c.shadowBlur=14;c.fillStyle=o.neon[Math.floor(rand()*o.neon.length)];c.fillRect(x+(w-nw)/2,ny,nw,nh);c.restore();}
}
function crenellated(c,x,y,w,h,col,merlon=12){c.fillStyle=col;c.fillRect(x,y-h,w,h);for(let xx=x;xx<x+w;xx+=merlon*2)c.fillRect(xx,y-h-merlon*.8,merlon,merlon*.8);}
function towerCone(c,x,y,w,h,col,roof,flag){c.fillStyle=col;c.fillRect(x-w/2,y-h,w,h);c.fillStyle=roof;c.beginPath();c.moveTo(x-w*.62,y-h);c.lineTo(x,y-h-w*1.3);c.lineTo(x+w*.62,y-h);c.closePath();c.fill();if(flag){c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y-h-w*1.3);c.lineTo(x,y-h-w*1.9);c.stroke();c.fillStyle=flag;c.beginPath();c.moveTo(x,y-h-w*1.9);c.lineTo(x+w*.6,y-h-w*1.75);c.lineTo(x,y-h-w*1.6);c.fill();}}
function pagoda(c,x,y,s,wall,roof,trim){for(let k=0;k<4;k++){const ww=s*(.5-k*.08),yy=y-k*s*.32;c.fillStyle=wall;c.fillRect(x-ww*.6,yy-s*.22,ww*1.2,s*.22);c.fillStyle=roof;c.beginPath();c.moveTo(x-ww*1.15,yy-s*.2);c.quadraticCurveTo(x-ww*.6,yy-s*.26,x-ww*.5,yy-s*.33);c.lineTo(x+ww*.5,yy-s*.33);c.quadraticCurveTo(x+ww*.6,yy-s*.26,x+ww*1.15,yy-s*.2);c.closePath();c.fill();if(trim){c.fillStyle=trim;c.fillRect(x-ww*.6,yy-s*.06,ww*1.2,s*.03);}}c.fillStyle=roof;c.fillRect(x-s*.015,y-s*1.5,s*.03,s*.28);}
function pyramid(c,x,y,w,h,lit,shade,steps){c.fillStyle=lit;c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x,y-h);c.lineTo(x+w/2,y);c.closePath();c.fill();c.fillStyle=shade;c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w/2,y);c.lineTo(x+w*.12,y);c.closePath();c.fill();if(steps){c.strokeStyle=steps;c.lineWidth=1;for(let k=1;k<12;k++){const yy=y-h*k/12,hw=w/2*(1-k/12);c.beginPath();c.moveTo(x-hw,yy);c.lineTo(x+hw,yy);c.stroke();}}}
function gothicSpire(c,x,y,w,h,col,glow){c.fillStyle=col;c.fillRect(x-w/2,y-h*.55,w,h*.55);c.beginPath();c.moveTo(x-w*.55,y-h*.55);c.lineTo(x,y-h);c.lineTo(x+w*.55,y-h*.55);c.closePath();c.fill();for(const s of [-1,1]){c.beginPath();c.moveTo(x+s*w*.5,y-h*.4);c.lineTo(x+s*w*.62,y-h*.62);c.lineTo(x+s*w*.74,y-h*.4);c.fill();}if(glow){c.save();c.shadowColor=glow;c.shadowBlur=12;c.fillStyle=glow;c.beginPath();c.arc(x,y-h*.42,w*.18,0,TAU);c.fill();c.fillRect(x-w*.08,y-h*.3,w*.16,h*.12);c.restore();}}
function crane(c,x,y,h,col,lamp){c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.moveTo(x-6,y);c.lineTo(x-6,y-h);c.moveTo(x+6,y);c.lineTo(x+6,y-h);for(let yy=y;yy>y-h;yy-=14){c.moveTo(x-6,yy);c.lineTo(x+6,yy-14);}c.moveTo(x-h*.25,y-h);c.lineTo(x+h*.75,y-h);c.moveTo(x,y-h-18);c.lineTo(x+h*.75,y-h);c.moveTo(x,y-h-18);c.lineTo(x-h*.25,y-h);c.moveTo(x+h*.5,y-h);c.lineTo(x+h*.5,y-h*.55);c.stroke();if(lamp){c.fillStyle=lamp;c.beginPath();c.arc(x,y-h-18,2.5,0,TAU);c.fill();}}
function chimney(c,x,y,w,h,col,band){c.fillStyle=col;c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x-w*.38,y-h);c.lineTo(x+w*.38,y-h);c.lineTo(x+w/2,y);c.closePath();c.fill();if(band){c.fillStyle=band;for(let k=1;k<4;k++)c.fillRect(x-w*.42,y-h*k/4,w*.84,4);}}
function dome(c,x,y,r,col,hi,windows){c.fillStyle=col;c.beginPath();c.arc(x,y,r,Math.PI,0);c.fill();if(hi){c.fillStyle=hi;c.beginPath();c.arc(x-r*.25,y-r*.35,r*.35,0,TAU);c.fill();}if(windows){c.fillStyle=windows;for(let k=0;k<5;k++){const a=Math.PI+(k+.5)*Math.PI/5;c.fillRect(x+Math.cos(a)*r*.75-2,y+Math.sin(a)*r*.75-3,4,6);}}}
function lollipop(c,x,y,s,stick,cols){c.fillStyle=stick;c.fillRect(x-s*.03,y-s,s*.06,s);const r=s*.28,cy=y-s-r*.6;for(let k=0;k<6;k++){c.fillStyle=cols[k%cols.length];c.beginPath();c.arc(x,cy,r*(1-k/6),0,TAU);c.fill();}}

// --- Cielo -----------------------------------------------------------------------
// Nube cúmulo suave: muchas bolas difuminadas con base plana y sombra inferior.
function cloudSprite(rand,w,h,col,shade){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');
 c.filter='blur(5px)';const base=h*.72;
 for(let k=0;k<26;k++){const x=w*(.12+rand()*.76),dx=Math.abs(x/w-.5)*2,r=h*(.12+rand()*.16)*(1-dx*.45),y=base-r*(.35+rand()*.5)-(1-dx)*h*.12;
  const g=c.createRadialGradient(x-r*.25,y-r*.35,r*.1,x,y,r);g.addColorStop(0,col);g.addColorStop(.75,alpha(mix(col,shade,.35),.95));g.addColorStop(1,alpha(shade,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
 c.filter='none';c.globalCompositeOperation='destination-out';c.fillRect(0,base+h*.06,w,h);c.globalCompositeOperation='source-atop';
 const sg=c.createLinearGradient(0,h*.25,0,base);sg.addColorStop(0,alpha(col,0));sg.addColorStop(1,alpha(shade,.55));c.fillStyle=sg;c.fillRect(0,0,w,h);
 return cv;}
function stars(c,w,h,count,rand,col='#ffffff'){for(let i=0;i<count;i++){const x=rand()*w,y=rand()*h,r=rand()<.06?1.6:rand()*.9+.3;c.globalAlpha=.25+rand()*.75;c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}c.globalAlpha=1;}
function glow(c,x,y,r,col,a=1){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,alpha(col,a));g.addColorStop(.35,alpha(col,a*.35));g.addColorStop(1,alpha(col,0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

CS5.kit={rng,pnoise,pfbm,mix,alpha,wrapDraw,ridge,heightAt,haze,pine,palm,roundTree,sakura,deadTree,mushroom,kelp,coral,building,crenellated,towerCone,pagoda,pyramid,gothicSpire,crane,chimney,dome,lollipop,cloudSprite,stars,glow,TAU};
})();
