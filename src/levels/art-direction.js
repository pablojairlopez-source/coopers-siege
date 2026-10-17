// Cooper's Siege 5.0 — Dirección de arte por escenario.
// Un único lugar donde se define la identidad visual de cada mapa: materiales del
// terreno, decoración de superficie, paleta del cielo/agua, gradación de color del
// post-proceso y el tipo de escenografía de fondo. Los índices coinciden con `maps`.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};

// terrain.top     : capa superior (color, grosor en px, estilo de decoración)
// terrain.sub     : capa inmediatamente inferior
// terrain.mid/deep: interior (degradado por profundidad)
// terrain.pattern : textura del interior
// terrain.accents : detalles incrustados (vetas, cristales, raíces, fósiles…)
// grade           : gradación final (exposición, contraste, saturación, sombras/luces teñidas, viñeta, bloom)
const ART=[
 {id:'tropic',rays:0.8,
  terrain:{top:{color:'#62c95a',hi:'#a8f07a',depth:5,deco:'grass'},sub:{color:'#e6c588',depth:9},mid:'#c58f5c',deep:'#6a4636',pattern:'sandstone',
   accents:[{type:'pebbles',color:'#f2ddb0',density:.0016},{type:'shells',color:'#ffe4d2',density:.0005},{type:'roots',color:'#7d5a3c',density:.6}]},
  sky:['#2a9fd6','#7fd1e8','#ffd7a1'],water:'#1fc6d4',fog:'#ffd9b0',sun:'#fff3c4',
  grade:{exposure:1.04,contrast:1.06,saturation:1.18,shadows:'#1d5a7a',highlights:'#ffd9a0',vignette:.22,bloom:.55},scenery:'tropic'},
 {id:'neon',rays:0.3,
  terrain:{top:{color:'#3e4866',hi:'#4cfbe0',depth:3,deco:'neon'},sub:{color:'#2a3150',depth:8},mid:'#262c45',deep:'#11142a',pattern:'concrete',
   accents:[{type:'windows',color:'#ffcf6b',density:.6},{type:'pipes',color:'#5b6b8c',density:.5},{type:'rebar',color:'#8b5a4a',density:.0007}]},
  sky:['#05061a','#1d1240','#7a2a6e'],water:'#7c3cff',fog:'#b04dff',sun:'#e8f4ff',
  grade:{exposure:.98,contrast:1.14,saturation:1.22,shadows:'#170a3a',highlights:'#ff7ad9',vignette:.34,bloom:.95},scenery:'neon'},
 {id:'volcano',rays:0.55,
  terrain:{top:{color:'#3b3034',hi:'#7a5a52',depth:4,deco:'ash'},sub:{color:'#2c2228',depth:10},mid:'#2a1f26',deep:'#120c12',pattern:'basalt',
   accents:[{type:'veins',color:'#ff6a1c',glow:'#ffd06a',density:.972},{type:'embers',color:'#ff9a3c',density:.0012}]},
  sky:['#140910','#4a1414','#e0521e'],water:'#ff5a1c',fog:'#ff7a3a',sun:'#ffcf8a',
  grade:{exposure:1.02,contrast:1.16,saturation:1.12,shadows:'#2a0608',highlights:'#ffb060',vignette:.36,bloom:1.0},scenery:'volcano'},
 {id:'snow',rays:0.55,
  terrain:{top:{color:'#f4fbff',hi:'#ffffff',depth:7,deco:'snow'},sub:{color:'#c6e2f2',depth:10},mid:'#7d9fbf',deep:'#33506e',pattern:'ice',
   accents:[{type:'veins',color:'#9ff3ff',glow:'#e8ffff',density:.985},{type:'pebbles',color:'#4b6380',density:.0009}]},
  sky:['#0b1f45','#3c74a8','#b8e6f0'],water:'#4f8fc0',fog:'#cfeefa',sun:'#f2fbff',
  grade:{exposure:1.06,contrast:1.04,saturation:.96,shadows:'#16345e',highlights:'#e6fbff',vignette:.2,bloom:.6},scenery:'snow'},
 {id:'alien',rays:0.35,
  terrain:{top:{color:'#a8ef7a',hi:'#e6ffb0',depth:4,deco:'spores'},sub:{color:'#7c5bb0',depth:8},mid:'#5b3f8c',deep:'#22143f',pattern:'cells',
   accents:[{type:'crystals',color:'#5cf2e6',glow:'#d8fffb',density:.0011},{type:'veins',color:'#c86bff',glow:'#f2d4ff',density:.978}]},
  sky:['#120a2e','#4a2a7a','#ff9ad6'],water:'#c35cf2',fog:'#e7b8ff',sun:'#ffe6fa',
  grade:{exposure:1.02,contrast:1.1,saturation:1.25,shadows:'#1a0a3a',highlights:'#b8fff0',vignette:.3,bloom:.9},scenery:'alien'},
 {id:'castle',rays:0.8,
  terrain:{top:{color:'#7fb85a',hi:'#c4e88a',depth:4,deco:'grass'},sub:{color:'#c9ab84',depth:6},mid:'#a98a74',deep:'#5a4656',pattern:'bricks',
   accents:[{type:'moss',color:'#6e9a4a',density:.5},{type:'pebbles',color:'#e0caa8',density:.0008}]},
  sky:['#2b3558','#c26a7a','#ffcf8f'],water:'#4f72a8',fog:'#ffc6a0',sun:'#ffe6b0',
  grade:{exposure:1.03,contrast:1.06,saturation:1.08,shadows:'#2a2850',highlights:'#ffcf90',vignette:.26,bloom:.6},scenery:'castle'},
 {id:'supernova',rays:0.5,
  terrain:{top:{color:'#8a8296',hi:'#d8d0e6',depth:3,deco:'rubble'},sub:{color:'#6a6278',depth:8},mid:'#4f4860',deep:'#221d30',pattern:'craters',
   accents:[{type:'crystals',color:'#ff9ad6',glow:'#fff0fa',density:.0008},{type:'plates',color:'#9aa8c0',density:.4}]},
  sky:['#05040f','#2a1238','#8a3c6a'],water:'#3a2a6a',fog:'#ffb898',sun:'#fff0c0',
  grade:{exposure:1.0,contrast:1.12,saturation:1.15,shadows:'#0a0420',highlights:'#ffd0a0',vignette:.38,bloom:1.05},scenery:'supernova'},
 {id:'harbor',rays:0,
  terrain:{top:{color:'#7a6650',hi:'#b09878',depth:5,deco:'planks'},sub:{color:'#566070',depth:8},mid:'#3e4858',deep:'#1a2230',pattern:'concrete',
   accents:[{type:'barnacles',color:'#c8c0a8',density:.0014},{type:'rebar',color:'#9a5a3a',density:.0006}]},
  sky:['#0a1220','#25364c','#5c7484'],water:'#1d5272',fog:'#a8c0d8',sun:'#dfeaff',
  grade:{exposure:.98,contrast:1.12,saturation:.88,shadows:'#0c1a2c',highlights:'#c8e0ff',vignette:.36,bloom:.7},scenery:'harbor'},
 {id:'forest',rays:0.65,
  terrain:{top:{color:'#3f8a4c',hi:'#86d690',depth:5,deco:'moss'},sub:{color:'#4a3a30',depth:9},mid:'#3a2c26',deep:'#16110f',pattern:'soil',
   accents:[{type:'roots',color:'#6a4a34',density:.9},{type:'pebbles',color:'#7a7064',density:.0012},{type:'mushrooms',color:'#ff6a5a',density:.012}]},
  sky:['#040a18','#10303a','#3a6a5c'],water:'#1a5a64',fog:'#8ee2b8',sun:'#d8fff0',
  grade:{exposure:.98,contrast:1.1,saturation:1.04,shadows:'#06182a',highlights:'#b8ffd8',vignette:.38,bloom:.75},scenery:'forest'},
 {id:'ruins',rays:0.3,
  terrain:{top:{color:'#6a6a5c',hi:'#a8a48c',depth:4,deco:'rubble'},sub:{color:'#7a6a60',depth:8},mid:'#5c524c',deep:'#26201e',pattern:'rubble',
   accents:[{type:'rebar',color:'#a0603c',density:.0012},{type:'pipes',color:'#585c62',density:.4},{type:'bones',color:'#e8dcc0',density:.0005}]},
  sky:['#1a1618','#5a4a44','#d8905c'],water:'#4a3e3a',fog:'#e0b48c',sun:'#ffd8a0',
  grade:{exposure:1.0,contrast:1.1,saturation:.82,shadows:'#201a1c',highlights:'#ffc890',vignette:.4,bloom:.65},scenery:'ruins'},
 {id:'sakura',rays:0.7,
  terrain:{top:{color:'#8ccf6a',hi:'#d0f0a0',depth:4,deco:'petals'},sub:{color:'#a07a5c',depth:8},mid:'#8a6450',deep:'#3c2a2c',pattern:'terraces',
   accents:[{type:'pebbles',color:'#c8b8a8',density:.0012},{type:'roots',color:'#6a4a3a',density:.5}]},
  sky:['#2a2a5a','#c27aa8','#ffd6e6'],water:'#5a9ad0',fog:'#ffe0ee',sun:'#fff0f4',
  grade:{exposure:1.05,contrast:1.04,saturation:1.1,shadows:'#2a2050',highlights:'#ffd8ec',vignette:.22,bloom:.65},scenery:'sakura'},
 {id:'desert',rays:0.75,
  terrain:{top:{color:'#f0cc84',hi:'#fff0c0',depth:6,deco:'sand'},sub:{color:'#e0aa62',depth:10},mid:'#c27a44',deep:'#6a3a24',pattern:'sandstone',
   accents:[{type:'fossils',color:'#f6e6c8',density:.00035},{type:'pebbles',color:'#a0663c',density:.0012}]},
  sky:['#3a6ab0','#f0b070','#ffe8a8'],water:'#2a9ab0',fog:'#ffdc98',sun:'#fff6d0',
  grade:{exposure:1.08,contrast:1.06,saturation:1.1,shadows:'#5a3a5a',highlights:'#ffe6a0',vignette:.24,bloom:.7},scenery:'desert'},
 {id:'atlantis',rays:0,
  terrain:{top:{color:'#ff8a7a',hi:'#ffd0c0',depth:4,deco:'coral'},sub:{color:'#6ab0c0',depth:8},mid:'#3a7a94',deep:'#0e2a40',pattern:'marble',
   accents:[{type:'shells',color:'#ffe8d8',density:.0008},{type:'crystals',color:'#6ef7e8',glow:'#e0fffb',density:.0007}]},
  sky:['#021428','#0a4a6a','#38b8c4'],water:'#0a6a86',fog:'#7ef0ff',sun:'#c8fbff',
  grade:{exposure:1.0,contrast:1.06,saturation:1.12,shadows:'#021a30',highlights:'#a8fff4',vignette:.36,bloom:.85},scenery:'atlantis'},
 {id:'factory',rays:0.2,
  terrain:{top:{color:'#6a7484',hi:'#ffcf3a',depth:4,deco:'hazard'},sub:{color:'#4a5260',depth:8},mid:'#353b46',deep:'#14171d',pattern:'plates',
   accents:[{type:'pipes',color:'#8a5a3a',density:.7},{type:'veins',color:'#ff7a2a',glow:'#ffe08a',density:.985}]},
  sky:['#0c0e14','#3a2a2a','#c8582a'],water:'#ff5a1c',fog:'#ff9a5a',sun:'#ffd8a0',
  grade:{exposure:.98,contrast:1.16,saturation:1.0,shadows:'#10141e',highlights:'#ffb070',vignette:.4,bloom:.95},scenery:'factory'},
 {id:'inferno',rays:0.25,
  terrain:{top:{color:'#2a1418',hi:'#ff4a5a',depth:3,deco:'ash'},sub:{color:'#3a1a20',depth:8},mid:'#2a1016',deep:'#0c0406',pattern:'obsidian',
   accents:[{type:'veins',color:'#ff2a3a',glow:'#ff9aa0',density:.975},{type:'bones',color:'#e8d8c8',density:.0007}]},
  sky:['#0a0206','#3a0a14','#b0202e'],water:'#d0182a',fog:'#ff5a6a',sun:'#ffb0a0',
  grade:{exposure:1.0,contrast:1.18,saturation:1.15,shadows:'#1a0208',highlights:'#ff8a7a',vignette:.44,bloom:1.0},scenery:'inferno'},
 {id:'candy',rays:0.55,
  terrain:{top:{color:'#ffd0ea',hi:'#ffffff',depth:7,deco:'frosting'},sub:{color:'#ff8ac4',depth:6},mid:'#e8a874',deep:'#9a5a3a',pattern:'cake',
   accents:[{type:'sprinkles',color:'#ffffff',density:.004},{type:'gems',color:'#ff4a8a',density:.0006}]},
  sky:['#5a3a9a','#ff9ad0','#ffe6f6'],water:'#ff6ab8',fog:'#ffe0f6',sun:'#fffaf0',
  grade:{exposure:1.06,contrast:1.02,saturation:1.2,shadows:'#5a2a7a',highlights:'#fff0f8',vignette:.18,bloom:.7},scenery:'candy'},
 // 5.1 · Jardín de Espinas: corteza de zarza, musgo con espinas y un abismo de nubes.
 {id:'thorns',rays:0.85,
  terrain:{top:{color:'#5fae4e',hi:'#c4f29a',depth:5,deco:'thorns',thorn:'#3a1e26'},sub:{color:'#6e4a3c',depth:8},mid:'#5a3a32',deep:'#24161a',pattern:'bark',
   accents:[{type:'roots',color:'#3a2420',density:.9},{type:'pebbles',color:'#d8b8e8',density:.0007},{type:'gems',color:'#ff9ad0',density:.0004}]},
  sky:['#3a5294','#93a8de','#ffe2ee'],water:'#c9d2f2',fog:'#f2e8ff',sun:'#fff6e6',
  grade:{exposure:1.05,contrast:1.05,saturation:1.08,shadows:'#3a2a5a',highlights:'#fff0f6',vignette:.24,bloom:.8},scenery:'thorns'}
];

CS5.art=ART;
CS5.artFor=i=>ART[i]||ART[0];

// Sincroniza los colores usados por el resto del motor (paredes 3D, minimapa,
// agua, niebla) con la dirección de arte del mapa.
CS5.applyArtDirection=function(maps){
 for(let i=0;i<maps.length&&i<ART.length;i++){
  const a=ART[i],t=a.terrain;
  Object.assign(maps[i],{rim:t.top.color,soil:[t.mid,t.deep],water:a.water,fog:a.fog,sky:[...a.sky]});
 }
};
})();
