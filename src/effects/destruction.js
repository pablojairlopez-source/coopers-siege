// Cooper's Siege 5.0 — Destrucción 2.0 (efectos puramente visuales).
// · Onda expansiva (anillo de choque + anillo de polvo a ras de suelo).
// · Escombros con el color REAL del material del cráter (muestreado antes de
//   destruirlo), que rebotan sobre el terreno y se apagan.
// · Brasas incandescentes con estela, humo cálido y halo de luz aditivo.
// · Chamuscado del borde del cráter según el arma: carbonizado, escarcha, ácido,
//   cristal fundido de plasma, oro sagrado, vacío violeta (lo pinta el pintor de
//   materiales en src/rendering/terrain-materials.js).
// Usa effectsRandom (cosmético) y límites por calidad: nunca altera el combate.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const TAU=Math.PI*2;

// Tinte del chamuscado según el arma que detonó.
const SCORCH={
 normal:{color:[22,16,14],strength:.72},
 fire:{color:[18,10,6],strength:.85,glow:[255,120,40]},
 ice:{color:[200,240,255],strength:.55},
 acid:{color:[70,200,40],strength:.6},
 plasma:{color:[80,240,255],strength:.6,glow:[180,255,255]},
 holy:{color:[255,220,120],strength:.6,glow:[255,240,180]},
 void:{color:[90,40,140],strength:.7},
 super:{color:[12,8,8],strength:.9,glow:[255,150,60]}
};
const WEAPON_SCORCH={flame:'fire',napalm:'fire',meteor:'fire',dynamite:'fire',ice:'ice',acid:'acid',acidGlob:'acid',tesla:'plasma',orbital:'plasma',holy:'holy',blackhole:'void',super:'super'};

function sampleMaterial(terrain,x,y,r,R,W,H){
 const out=[],d=terrain.imageData&&terrain.imageData.data;if(!d)return out;
 for(let k=0;k<14&&out.length<8;k++){
  const a=R()*TAU,rr=r*(.4+R()*.7),px=Math.round(x+Math.cos(a)*rr),py=Math.round(y+Math.sin(a)*rr);
  if(px<0||py<0||px>=W||py>=H||!terrain.mask[py*W+px])continue;
  const j=(py*W+px)*4;out.push(`rgb(${d[j]},${d[j+1]},${d[j+2]})`);
 }
 return out;
}

const fx={
 SCORCH,
 // Se llama ANTES de destruir el terreno (para muestrear el material intacto).
 beforeExplosion(x,y,r,kind,weapon){
  const app=window.PocketSiege&&window.PocketSiege.state;const terrain=window.PocketSiege&&window.PocketSiege.terrain;if(!app||!terrain)return;
  const W=terrain.mask.length/768,H=768,R=effectsRandom,q=app.quality||1;
  const mats=sampleMaterial(terrain,x,y,r,R,W,H);
  const style=WEAPON_SCORCH[weapon]||(kind==='super'?'super':'normal');
  (terrain.scorches||(terrain.scorches=[])).push({x,y,r,style});
  if(terrain.scorches.length>160)terrain.scorches.shift();
  // Anillo de choque y halo de luz.
  app.fx.push({kind:'shock',x,y,vx:0,vy:0,size:r*(kind==='super'?3.2:2.3),life:.42,max:.42,color:'#fff4dc'});
  app.fx.push({kind:'glowHalo',x,y,vx:0,vy:0,size:r*2.6,life:.55,max:.55,color:style==='ice'?'#a8f4ff':style==='acid'?'#9aff5a':style==='plasma'?'#8affff':style==='void'?'#c08aff':'#ffb050'});
  // Polvo a ras de suelo si la explosión toca superficie.
  const ground=terrain.surface?terrain.surface(x,Math.max(0,y-r),false):null;
  if(ground&&Math.abs(ground.y-y)<r*1.4){for(let s=-1;s<=1;s+=2)for(let k=0;k<Math.round(5*q);k++){const f=spawnFX(x+s*r*(.3+R()*.4),ground.y-4,s*(60+R()*120),-8-R()*20,mats[k%Math.max(1,mats.length)]||'#8a7a6a',10+R()*14,.9+R()*.8,'dust');if(f)f.rot=R()*TAU;}}
  // Escombros del material real.
  const chunks=Math.round((10+r*.22)*q);
  for(let k=0;k<chunks;k++){const a=-Math.PI*(.08+R()*.84),v=120+R()*r*4.2,f=spawnFX(x+(R()-.5)*r*.5,y+(R()-.5)*r*.5,Math.cos(a)*v,Math.sin(a)*v,mats[k%Math.max(1,mats.length)]||'#7a6a5a',2.5+R()*5,1.4+R()*1.4,'chunk');if(f){f.rot=R()*TAU;f.spin=(R()-.5)*16;f.bounces=0;f.sides=3+Math.floor(R()*3);}}
  // Brasas incandescentes con estela.
  const embers=Math.round((style==='ice'?4:14+r*.18)*q);
  for(let k=0;k<embers;k++){const a=-Math.PI*(.05+R()*.9),v=90+R()*r*3.6,f=spawnFX(x,y,Math.cos(a)*v,Math.sin(a)*v,style==='plasma'?'#8affff':style==='acid'?'#b8ff5a':style==='ice'?'#e8fbff':R()<.5?'#ffd27a':'#ff7a2a',1.4+R()*1.6,1.2+R()*1.6,'ember');if(f){f.px=f.x;f.py=f.y;}}
 },
 // Actualización propia de los tipos nuevos; devuelve true si se encargó de f.
 update(f,dt,terrain){
  if(f.kind==='shock'||f.kind==='glowHalo')return true;
  if(f.kind==='dust'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=Math.pow(.18,dt);f.vy=f.vy*Math.pow(.3,dt)-4*dt;f.rot+=dt*.4;return true;}
  if(f.kind==='ember'){f.px=f.x;f.py=f.y;f.vy+=150*dt;f.vx*=Math.pow(.55,dt);f.x+=f.vx*dt;f.y+=f.vy*dt;if(terrain.solid(f.x,f.y)){f.vy*=-.25;f.vx*=.5;f.y-=2;}return true;}
  if(f.kind==='chunk'){
   f.vy+=520*dt;f.rot+=(f.spin||0)*dt;
   const nx=f.x+f.vx*dt,ny=f.y+f.vy*dt;
   if(terrain.solid(nx,ny)){if(f.bounces<2&&Math.abs(f.vy)>60){f.vy=-f.vy*.35;f.vx*=.6;f.spin*=.5;f.bounces++;}else{f.vx=f.vy=f.spin=0;f.resting=true;}}
   else{f.x=nx;f.y=ny;}
   if(f.resting&&!terrain.solid(f.x,f.y+2))f.resting=false;
   return true;
  }
  return false;
 },
 // Dibujo de los tipos nuevos en coordenadas de mundo; devuelve true si se encargó.
 draw(c,f){
  const k=Math.max(0,Math.min(1,f.life/f.max));
  if(f.kind==='shock'){const t=1-k,r=f.size*(.15+.85*Math.pow(t,.6));c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k*.55;c.strokeStyle=f.color;c.lineWidth=Math.max(1,f.size*.06*k);c.beginPath();c.arc(f.x,f.y,r,0,TAU);c.stroke();c.globalAlpha=k*.18;c.lineWidth=f.size*.16*k;c.beginPath();c.arc(f.x,f.y,r*.92,0,TAU);c.stroke();c.restore();return true;}
  if(f.kind==='glowHalo'){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(f.x,f.y,0,f.x,f.y,f.size);g.addColorStop(0,f.color+Math.round(180*k).toString(16).padStart(2,'0'));g.addColorStop(.4,f.color+Math.round(70*k).toString(16).padStart(2,'0'));g.addColorStop(1,f.color+'00');c.fillStyle=g;c.fillRect(f.x-f.size,f.y-f.size,f.size*2,f.size*2);c.restore();return true;}
  if(f.kind==='dust'){c.save();c.globalAlpha=k*.38;c.fillStyle=f.color;c.translate(f.x,f.y);c.rotate(f.rot||0);const s=f.size*(1.6-k*.6);c.beginPath();c.ellipse(0,0,s,s*.55,0,0,TAU);c.fill();c.restore();return true;}
  if(f.kind==='ember'){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,k*1.4);c.strokeStyle=f.color;c.lineWidth=f.size;c.lineCap='round';c.beginPath();c.moveTo(f.px-(f.vx||0)*.03,f.py-(f.vy||0)*.03);c.lineTo(f.x,f.y);c.stroke();c.restore();return true;}
  if(f.kind==='chunk'){c.save();c.globalAlpha=Math.min(1,k*3);c.translate(f.x,f.y);c.rotate(f.rot||0);c.fillStyle=f.color;c.beginPath();for(let i=0;i<f.sides;i++){const a=i/f.sides*TAU,rr=f.size*(i%2?.75:1.05);i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.fillStyle='#ffffff2a';c.beginPath();c.arc(-f.size*.25,-f.size*.25,f.size*.35,0,TAU);c.fill();c.restore();return true;}
  return false;
 }
};
CS5.fx=fx;
})();
