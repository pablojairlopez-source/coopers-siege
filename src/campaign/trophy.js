// Cooper's Siege 5.2 — La Cooper's Cup en 3D: copa dorada (material metálico), asas, peana
// de madera con placa, y una figura de pug dorada en lo alto. Gira sobre sí misma.
// Usa el renderizador de retratos (`CS5.view3d`); sin WebGL dibuja una versión 2D.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const GOLD='#ffd34d',GOLD_D='#b8860b',GOLD_L='#fff1a8';

function buildMesh(r,yaw,time,won){
 const out=[],m0=matRotateY(matTranslate(matIdentity(),0,0,26),yaw);
 const gold=won?GOLD:'#8a8f9a',goldD=won?GOLD_D:'#555b66',goldL=won?GOLD_L:'#b9bec8';
 // Peana de madera en dos escalones y placa dorada.
 rigEllipsoid(r,out,m0,0,-3,0,19,4,19,'#6b3f22','#3e2414',20,6,0,.95);
 rigEllipsoid(r,out,m0,0,-8,0,15,3.4,15,'#7a4a28','#4a2c1a',20,6,0,.95);
 rigEllipsoid(r,out,matTranslate(m0,0,-6,14.6),0,0,0,6,2.2,.6,goldL,goldD,10,4,2,1);
 // Pie y tallo.
 rigEllipsoid(r,out,m0,0,-12,0,9,2.6,9,gold,goldD,18,6,2,1);
 rigCapsule(r,out,m0,0,-13,0,3.2,0,-26,0,2.2,goldD,gold,12,3,2,.9,1);
 rigEllipsoid(r,out,m0,0,-27,0,5.4,2.2,5.4,gold,goldD,16,6,2,1);
 // Copa: cuenco y borde.
 rigEllipsoid(r,out,m0,0,-38,0,14,12,14,goldL,goldD,22,12,2,1);
 rigEllipsoid(r,out,m0,0,-48.5,0,14.6,2.2,14.6,goldL,gold,22,6,2,1);
 // Asas.
 for(const s of [-1,1]){
  rigCapsule(r,out,m0,s*13,-45,0,1.6,s*21,-44,0,1.6,gold,goldL,8,2,2,1,1);
  rigCapsule(r,out,m0,s*21,-44,0,1.6,s*20,-33,0,1.6,goldL,gold,8,2,2,1,1);
  rigCapsule(r,out,m0,s*20,-33,0,1.6,s*12,-31,0,1.6,gold,goldD,8,2,2,1,1);
 }
 // Gema emisiva en el frente.
 rigEllipsoid(r,out,matTranslate(m0,0,-38,13.6),0,0,0,2.6,2.6,1.2,won?'#7ff6ff':'#556','#2bd',10,6,3,1);
 // Figura de pug dorada.
 const pug={id:77,team:0,x:0,y:-43,vx:0,vy:0,dir:1,hp:100,grounded:true,hurt:0,variant:'normal',fur:won?'#ffd34d':'#9aa0aa',accessory:'crown',backgear:'cape',cosmeticColor:won?'#fff1a8':'#c9ced8',size:1,previewPose:won?'celebrate':'idle'};
 CS5.pugAnim.frame([pug],time,1/30,{phase:'menu'});
 drawPug(r,out,pug,time,.62,yaw);
 return out;
}
const trophy={
 // Pinta el trofeo en un lienzo 2D. `won`: dorado (conseguido) o plateado apagado (pendiente).
 render(canvas,time,won=true){
  const r=CS5.view3d.renderer(),yaw=time*.8;
  if(r){const mesh=buildMesh(r,yaw,time,won);if(CS5.view3d.draw(canvas,mesh,{y:-36,scale:Math.min(canvas.width/96,canvas.height/88),rim:.3},1))return true;}
  // Respaldo 2D.
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);c.save();c.translate(w/2,h*.92);const s=h/95;c.scale(s,s);
  const g=c.createLinearGradient(-15,0,15,0);g.addColorStop(0,won?GOLD_D:'#555b66');g.addColorStop(.5,won?GOLD_L:'#b9bec8');g.addColorStop(1,won?GOLD_D:'#555b66');
  c.fillStyle='#4a2c1a';c.fillRect(-18,-8,36,8);c.fillStyle=g;c.fillRect(-3,-28,6,20);c.beginPath();c.ellipse(0,-40,14*Math.abs(Math.cos(yaw))+4,12,0,0,Math.PI*2);c.fill();c.fillRect(-15,-51,30,3);
  c.restore();return false;
 },
 // Animación continua en un lienzo mientras siga en el documento.
 animate(canvas,won=true){
  const t0=performance.now();
  const tick=()=>{if(!canvas.isConnected||canvas.closest('[hidden]'))return;trophy.render(canvas,(performance.now()-t0)/1000,won);canvas._raf=requestAnimationFrame(tick);};
  cancelAnimationFrame(canvas._raf||0);tick();
 }
};
CS5.trophy=trophy;
})();
