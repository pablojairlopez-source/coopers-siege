// Cooper's Siege 5.0 — Decorados 3D propios de cada escenario.
// Sustituye la «torre de vigilancia» genérica que 4.0 usaba en la mitad de los
// mapas. Cada mapa tiene tres variantes elegidas por la semilla del decorado.
// Coordenadas locales: base en y=0, «arriba» = y negativa, ~40 u de alto.
// matId: 0 mate · 1 brillante · 2 metálico · 3 emisivo.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const TAU=Math.PI*2;

const PROPS={
 // Distrito Neón: máquina expendedora, farola LED y letrero holográfico.
 1:[(r,o,m,cap,ell)=>{cap(0,0,0,9,0,-32,0,9,'#2a3a5a','#1a2440',8,2,2,.9,1);cap(-6,-28,8,1.2,6,-28,8,1.2,'#4cfbe0','#ffffff',6,1,3);cap(-5,-14,9,4,5,-14,9,4,'#ff5cb8','#ffd0ec',6,1,3);},
    (r,o,m,cap,ell)=>{cap(0,0,0,1.6,0,-46,0,1.2,'#3a4660','#8fa8c2',6,2,2,.9,1);cap(0,-46,0,1.2,9,-50,0,1,'#3a4660','#8fa8c2',6,1,2);ell(10,-49,0,3,1.6,3,'#e8f6ff','#4cfbe0',8,4,3,1);},
    (r,o,m,cap,ell)=>{cap(-10,0,0,1.6,-10,-30,0,1.4,'#2a3448','#4a5a78',6,1,2);cap(10,0,0,1.6,10,-30,0,1.4,'#2a3448','#4a5a78',6,1,2);cap(-14,-36,1,4,14,-36,1,4,'#ff5cb8','#ffe0f4',8,1,3);cap(-12,-26,2,2,12,-26,2,2,'#4cfbe0','#ffffff',8,1,3);}],
 // Bastión Dorado: estandarte, carreta de heno y pozo de piedra.
 5:[(r,o,m,cap,ell)=>{cap(0,0,0,1.4,0,-50,0,1.1,'#6a4a2a','#a87a4a',6,2,0);for(let k=0;k<5;k++)cap(1,-48+k*4,0,.3,14,-46+k*4+Math.sin(k)*1.5,1,.3,'#c83a4a','#ffcf6a',4,1,0);ell(0,-51,0,2.2,2.2,2.2,'#ffcf6a','#a87a2a',6,4,2);},
    (r,o,m,cap,ell)=>{ell(0,-12,0,16,10,10,'#e8c870','#a87a3a',10,6,0,.95);cap(-14,-4,9,4,-14,-4,11,4,'#5a3a2a','#3a2414',8,1,0);cap(14,-4,9,4,14,-4,11,4,'#5a3a2a','#3a2414',8,1,0);cap(-18,-8,0,1,-30,-2,0,1,'#6a4a2a','#4a3018',5,1,0);},
    (r,o,m,cap,ell)=>{cap(0,0,0,13,0,-14,0,13,'#a89a8a','#6a5e54',10,1,0,.85,1);ell(0,-14,0,10,2,10,'#1a2a3a','#0a1420',10,3,1);cap(-11,-14,0,1,-11,-36,0,1,'#6a4a2a','#4a3018',5,1,0);cap(11,-14,0,1,11,-36,0,1,'#6a4a2a','#4a3018',5,1,0);ell(0,-38,0,15,4,10,'#8a3a3a','#5a2424',8,4,0);}],
 // Última Estrella: satélite caído, antena parabólica y cristal de energía.
 6:[(r,o,m,cap,ell)=>{ell(0,-12,0,10,10,10,'#9aa8c0','#4a5468',10,6,2);cap(-10,-12,0,1.2,-34,-16,0,1.2,'#7a88a0','#4a5468',6,1,2);ell(-30,-16,0,10,.6,8,'#2a4a8a','#1a2a5a',8,3,1);ell(14,-20,0,2,2,2,'#ff6a4a','#ffd0c0',6,4,3);},
    (r,o,m,cap,ell)=>{cap(0,0,0,2,0,-18,0,2,'#5a6478','#8a96aa',6,1,2);ell(0,-26,2,14,10,3,'#c8d4e8','#6a7890',12,6,2,.95);cap(0,-26,4,.8,0,-26,14,.5,'#c8d4e8','#ffffff',5,1,2);ell(0,-26,15,1.4,1.4,1.4,'#5cebe2','#ffffff',6,4,3);},
    (r,o,m,cap,ell)=>{cap(0,0,0,6,-3,-34,0,1,'#ff9ad6','#fff0fa',8,2,3);cap(6,0,2,4,10,-20,3,.8,'#c86bff','#f2d4ff',6,1,3);cap(-6,0,2,3.5,-11,-16,2,.7,'#5cebe2','#ffffff',6,1,3);}],
 // Puerto Tempestad: barriles, bolardo con cabo y ancla.
 7:[(r,o,m,cap,ell)=>{for(const [x,z] of [[-7,0],[7,0],[0,-6]])cap(x,0,z,7,x,-18,z,7,'#7a4a2a','#5a3418',10,2,0,.85,1);for(const [x,z] of [[-7,0],[7,0],[0,-6]])cap(x,-9,z,7.4,x,-10,z,7.4,'#3a3a40','#2a2a30',10,1,2);},
    (r,o,m,cap,ell)=>{cap(0,0,0,7,0,-14,0,6,'#2a3442','#4a5668',10,1,2);ell(0,-16,0,9,4,9,'#3a4658','#2a3442',10,4,2);cap(-8,-10,0,1.4,-26,-2,4,1.4,'#c8a878','#8a6a48',5,1,0);},
    (r,o,m,cap,ell)=>{cap(0,-4,0,2,0,-40,0,2,'#5a6070','#8a90a0',6,2,2);cap(-14,-36,0,1.6,14,-36,0,1.6,'#5a6070','#8a90a0',6,1,2);cap(0,-4,0,2,-14,-12,0,1.6,'#5a6070','#8a90a0',6,1,2);cap(0,-4,0,2,14,-12,0,1.6,'#5a6070','#8a90a0',6,1,2);ell(0,-43,0,4,4,2,'#5a6070','#8a90a0',8,4,2);}],
 // Kilómetro Cero: coche calcinado, farola doblada y bidones.
 9:[(r,o,m,cap,ell)=>{ell(0,-8,0,24,7,12,'#4a3a34','#2a201c',10,5,2,.85);ell(-2,-16,0,13,6,10,'#3a2c28','#1a1412',10,5,2,.85);for(const wx of [-15,15])ell(wx,-3,10,5,5,3,'#141010','#0a0808',8,4,0,.8);ell(8,-10,11,3,2,1,'#ff7a2a','#ffd06a',6,3,3);},
    (r,o,m,cap,ell)=>{cap(0,0,0,1.8,0,-30,0,1.5,'#3a3a40','#5a5a60',6,1,2);cap(0,-30,0,1.5,12,-40,0,1.3,'#3a3a40','#5a5a60',6,1,2);ell(14,-40,0,4,2,3,'#2a2a2a','#1a1a1a',6,3,2);},
    (r,o,m,cap,ell)=>{cap(-6,0,0,6,-6,-18,0,6,'#6a7a3a','#4a5428',10,2,2,.85,1);cap(7,0,2,6,9,-16,2,6,'#8a3a2a','#5a2418',10,2,2,.85,1);ell(-6,-18,0,5,1.5,5,'#2a2a1a','#1a1a10',8,3,1);}],
 // Valle Cerezos: linterna de piedra, cerezo joven y bambú.
 10:[(r,o,m,cap,ell)=>{cap(0,0,0,6,0,-4,0,6,'#8a8a90','#5a5a60',8,1,0);cap(0,-4,0,2.6,0,-20,0,2.6,'#9a9aa0','#6a6a70',8,1,0);ell(0,-24,0,7,4,7,'#ffcf6a','#ff9a3a',8,4,3);ell(0,-30,0,12,4,12,'#7a7a82','#4a4a52',8,4,0);ell(0,-35,0,2,2,2,'#7a7a82','#4a4a52',6,3,0);},
    (r,o,m,cap,ell)=>{cap(0,0,0,2.6,-2,-26,0,1.8,'#5a3a3a','#3a2424',6,2,0);for(let k=0;k<6;k++){const a=k/6*TAU;ell(Math.cos(a)*9-2,-32+Math.sin(a)*5,Math.sin(a)*6,8,6,7,'#ffb6d0','#ff8ab8',8,5,0,.95);}},
    (r,o,m,cap,ell)=>{for(const [x,h] of [[-5,48],[0,58],[5,42]]){cap(x,0,0,1.6,x,-h,0,1.4,'#7ab84a','#a8d878',6,3,0);for(let k=1;k<5;k++)cap(x,-h*k/5,0,1.9,x,-h*k/5-.8,0,1.9,'#5a8a3a','#5a8a3a',6,1,0);}}],
 // Dunas de Anubis: cactus, ánfora y estatua de chacal.
 11:[(r,o,m,cap,ell)=>{cap(0,0,0,4,0,-34,0,3.6,'#4a8a4a','#6ab86a',8,2,0);cap(0,-16,0,2.6,-10,-18,0,2.4,'#4a8a4a','#6ab86a',6,1,0);cap(-10,-18,0,2.4,-10,-28,0,2.2,'#4a8a4a','#6ab86a',6,1,0);cap(0,-22,0,2.4,9,-24,0,2.2,'#4a8a4a','#6ab86a',6,1,0);cap(9,-24,0,2.2,9,-32,0,2,'#4a8a4a','#6ab86a',6,1,0);},
    (r,o,m,cap,ell)=>{ell(0,-12,0,9,12,9,'#c87a44','#8a4a24',10,6,0,.95);cap(0,-22,0,4,0,-28,0,5,'#c87a44','#8a4a24',8,1,0);cap(-8,-20,0,1,-11,-12,0,1,'#a8603a','#8a4a24',5,1,0);cap(8,-20,0,1,11,-12,0,1,'#a8603a','#8a4a24',5,1,0);ell(0,-12,9,7,1.6,.5,'#2a4a8a','#ffd06a',8,3,2);},
    (r,o,m,cap,ell)=>{cap(0,0,0,9,0,-8,0,9,'#d8b070','#a87a40',8,1,0);ell(0,-16,0,6,9,8,'#2a2a3a','#14141e',8,5,2,.9);ell(0,-28,4,4,4,5,'#2a2a3a','#14141e',8,4,2,.9);cap(-2,-31,4,1,-3,-40,3,.4,'#2a2a3a','#ffd06a',5,1,2);cap(2,-31,4,1,3,-40,3,.4,'#2a2a3a','#ffd06a',5,1,2);ell(0,-29,8,1,1,1,'#ffd06a','#ffffff',5,3,3);}],
 // Abismo Atlantis: almeja gigante, ánfora y abanico de coral.
 12:[(r,o,m,cap,ell)=>{ell(0,-6,0,16,6,12,'#6ab0c0','#2a6a84',10,5,1);ell(0,-12,-4,15,8,4,'#7ac0d0','#3a7a94',10,5,1);ell(0,-8,4,4,4,4,'#ffffff','#e8f0ff',8,5,1);},
    (r,o,m,cap,ell)=>{ell(0,-14,0,8,13,8,'#d88a5a','#8a4a2a',10,6,0,.92);cap(0,-26,0,3,0,-32,0,4,'#d88a5a','#8a4a2a',8,1,0);ell(0,-12,8,6,4,.5,'#2a2a2a','#5a3a2a',6,3,0);},
    (r,o,m,cap,ell)=>{const br=(x,y,a,len,w,d)=>{const x1=x+Math.cos(a)*len,y1=y+Math.sin(a)*len;cap(x,y,0,w,x1,y1,0,w*.8,'#ff7a8a','#ffc0c8',6,1,0);if(d>0){br(x1,y1,a-.5,len*.75,w*.8,d-1);br(x1,y1,a+.5,len*.75,w*.8,d-1);}};br(0,0,-Math.PI/2,12,2.2,3);}],
 // Fundición Omega: barril de residuos, tanque de gas y engranaje.
 13:[(r,o,m,cap,ell)=>{cap(0,0,0,8,0,-22,0,8,'#ffcf3a','#c89a1a',10,2,2,.88,1);for(const y of [-6,-16])cap(0,y,0,8.4,0,y-1,0,8.4,'#2a2a30','#1a1a20',10,1,2);ell(0,-12,8,3,3,.5,'#2a2a30','#ff3a2a',6,3,3);},
    (r,o,m,cap,ell)=>{cap(-14,-10,0,9,14,-10,0,9,'#8a96a8','#4a5468',10,2,2,.9,1);ell(-14,-10,0,9,9,9,'#8a96a8','#4a5468',10,6,2);ell(14,-10,0,9,9,9,'#8a96a8','#4a5468',10,6,2);cap(-6,-20,0,1,-6,-24,0,1,'#3a3a40','#ff3a2a',5,1,2);},
    (r,o,m,cap,ell)=>{ell(0,-18,0,16,16,4,'#5a6070','#3a4050',14,6,2);for(let k=0;k<10;k++){const a=k/10*TAU;cap(Math.cos(a)*15,-18+Math.sin(a)*15,0,2.4,Math.cos(a)*20,-18+Math.sin(a)*20,0,2,'#6a7080','#4a5060',5,1,2);}ell(0,-18,4,5,5,1.5,'#ff7a2a','#ffd06a',8,4,3);}],
 // Catedral Gótica: lápida, montón de cráneos y pincho de hueso.
 14:[(r,o,m,cap,ell)=>{cap(0,0,0,9,0,-26,0,9,'#4a3a40','#2a1e24',4,2,0,.85,1);ell(0,-26,0,9,6,4.6,'#4a3a40','#2a1e24',8,4,0);cap(-1,-24,5,.8,1,-12,5,.8,'#ff3a4a','#ff9aa0',5,1,3);cap(-5,-19,5,.8,5,-19,5,.8,'#ff3a4a','#ff9aa0',5,1,3);},
    (r,o,m,cap,ell)=>{for(const [x,y,z] of [[-8,-5,0],[8,-5,0],[0,-5,6],[0,-14,0],[-4,-22,0]]){ell(x,y,z,6,5.5,5.5,'#e8d8c8','#a89888',8,5,0);ell(x-2,y-1,z+5,1.4,1.4,.6,'#120406','#120406',5,3,0);ell(x+2,y-1,z+5,1.4,1.4,.6,'#120406','#120406',5,3,0);}},
    (r,o,m,cap,ell)=>{cap(0,0,0,5,-4,-44,0,.6,'#e8d8c8','#a89888',8,3,0);cap(5,0,2,3.5,11,-26,1,.5,'#e8d8c8','#a89888',6,2,0);cap(-5,0,2,3,-12,-20,1,.5,'#e8d8c8','#a89888',6,2,0);}],
 // Dulce Caos: piruleta, gominola y bastón de caramelo.
 15:[(r,o,m,cap,ell)=>{cap(0,0,0,1.2,0,-34,0,1.2,'#ffffff','#e8e8f0',6,2,1);ell(0,-42,0,10,10,3,'#ff4a8a','#ffffff',12,6,1);ell(0,-42,3.2,6,6,.5,'#ffffff','#ff8ac0',10,4,1);ell(0,-42,3.6,2.5,2.5,.4,'#ff4a8a','#ff4a8a',8,3,1);},
    (r,o,m,cap,ell)=>{const col=['#7af0c8','#ffe06a','#b88aff','#ff8a8a'][Math.floor(r()*4)];ell(0,-10,0,11,11,11,col,col,10,6,1,.95);ell(-3,-16,8,3,4,1,'#ffffff','#ffffff',6,3,1);},
    (r,o,m,cap,ell)=>{for(let k=0;k<9;k++){const y0=-k*5,y1=-(k+1)*5;cap(0,y0,0,2.6,0,y1,0,2.6,k%2?'#ffffff':'#ff3a5a',k%2?'#ffffff':'#ff3a5a',8,1,1);}for(let k=0;k<6;k++){const a=Math.PI+k/6*Math.PI,a2=Math.PI+(k+1)/6*Math.PI;cap(8+Math.cos(a)*8,-45+Math.sin(a)*8,0,2.6,8+Math.cos(a2)*8,-45+Math.sin(a2)*8,0,2.6,k%2?'#ffffff':'#ff3a5a',k%2?'#ffffff':'#ff3a5a',8,1,1);}}],
 // 5.1 · Jardín de Espinas: flor gigante, arco de zarza con espinas y capullo luminoso.
 16:[(r,o,m,cap,ell)=>{cap(0,0,0,1.6,2,-20,0,1.3,'#3f8a4c','#86d690',6,2,0);cap(2,-20,0,1.3,-1,-38,0,1.1,'#3f8a4c','#86d690',6,2,0);ell(-6,-14,0,6,1.4,3,'#4fa65a','#a8f08a',8,3,0);
     const pc=['#ff8ac4','#ffd36a','#b89aff'][Math.floor(r()*3)];for(let k=0;k<7;k++){const a=k/7*TAU;ell(-1+Math.cos(a)*7,-40+Math.sin(a)*7,0,5.5,3.2,2,pc,'#ffffff',8,4,1);}ell(-1,-40,1.5,3.6,3.6,2.2,'#ffe27a','#fff6c0',8,4,3,1);},
    (r,o,m,cap,ell)=>{let px=-16,py=0;for(let k=1;k<=10;k++){const a=Math.PI-k/10*Math.PI,x=Math.cos(a)*16,y=-Math.sin(a)*26;cap(px,py,0,2.4,x,y,0,2.2,'#5a3a32','#8a6a5a',6,1,0);if(k%2)cap(x,y,0,.9,x+(k%4?3:-3),y-4,1.5,.1,'#2a1418','#6a3a3a',4,1,0);px=x;py=y;}ell(0,-27,1,3,2,1.5,'#ff8ac4','#ffe0f0',8,4,1);},
    (r,o,m,cap,ell)=>{cap(0,0,0,1.8,1,-26,0,1.2,'#4a6a3a','#7aa060',6,2,0);for(let k=0;k<4;k++){const y=-5-k*6,s=k%2?1:-1;cap(.5,y,0,.8,.5+s*4,y-3,0,.1,'#2a1418','#5a2a2a',4,1,0);}ell(1,-31,0,4.5,6,4.5,'#ffc0e0','#fff0f8',10,6,3,1);}]
};

// Devuelve true si el mapa tiene un decorado propio para este punto.
CS5.props3d=function(r,out,m,map,p,idx){
 const set=PROPS[map];if(!set)return false;
 // Los cofres (tipo 3) y vehículos (tipo 4) se conservan solo donde encajan.
 if(p.type===3&&map!==7&&map!==9&&map!==5)return false;
 const rand=CS5.kit?CS5.kit.rng(map*7919+idx*104729):Math.random;
 const cap=(...a)=>rigCapsule(r,out,m,...a);
 const ell=(...a)=>rigEllipsoid(r,out,m,...a);
 set[(idx+((p.x|0)>>5))%set.length](rand,out,m,cap,ell);
 return true;
};
})();
