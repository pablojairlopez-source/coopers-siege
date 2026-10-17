// Cooper's Siege 5.2 — Datos de la campaña «El Torneo del Universo».
// 17 capítulos × 2 batallas. Batalla 1: Cooper, Pipa y Bongo contra 5 bots de la misma
// variante; batalla 2: un jefe gigante (escala 2×, 250–400 HP, 1–2 habilidades con enfriamiento).
// Editar aquí mapas, variantes, vida de los jefes, habilidades y nombres. Los textos de la
// historia están en `story.js`.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};

// Reparto fijo (retratos y escuadra). `variant`, `accessory` y `backgear` usan los valores del editor de pugs.
const cast={
 cooper:{name:'Cooper',role:'Capitán glotón',variant:'normal',fur:'#d9ae78',accessory:'cap',backgear:'cape',color:'#ffd36a',voice:430},
 pipa:{name:'Pipa',role:'Estratega sarcástica',variant:'normal',fur:'#efdcb8',accessory:'glasses',backgear:'none',color:'#c0a5ff',voice:610},
 bongo:{name:'Bongo',role:'Entusiasta despistado',variant:'normal',fur:'#7a6a60',accessory:'headphones',backgear:'jetpack',color:'#60e0dd',voice:360},
 roco:{name:'Roco',role:'El rival',variant:'normal',fur:'#a8a49e',accessory:'bandana',backgear:'katana',color:'#ff797d',voice:300},
 hueson:{name:'Maestro Huesón',role:'Presentador del torneo',variant:'skeleton',fur:'#e9e1cf',accessory:'bowtie',backgear:'cape',color:'#ffcf5a',voice:250},
 cero:{name:'Cooper Cero',role:'El primer campeón',variant:'ghost',fur:'#cfe9ff',accessory:'crown',backgear:'wings',color:'#9fe8ff',voice:200}
};

// Habilidades de jefe. Se anuncian un turno antes (zona marcada) y se pueden interrumpir
// causando `breakDamage` de daño al jefe antes de que actúe. `cd` = turnos del jefe de enfriamiento.
const abilities={
 gale:{name:'Ráfaga de alisio',icon:'🌬',cd:3,desc:'Viento huracanado y empujón a todos los rivales cercanos a la zona.'},
 broadside:{name:'Andanada',icon:'💥',cd:3,desc:'Tres balas de cañón caen sobre la zona marcada.'},
 regrow:{name:'Raíces eternas',icon:'🌿',cd:4,desc:'El jefe recupera 40 de vida.'},
 spores:{name:'Nube de esporas',icon:'🍄',cd:3,desc:'Envenena a quien esté en la zona.'},
 petals:{name:'Corte de pétalos',icon:'🌸',cd:3,desc:'Cinco cortes explosivos en línea hacia la zona.'},
 sandTrap:{name:'Trampa de arena',icon:'⚱',cd:3,desc:'Siembra dos minas junto a los rivales.'},
 boneWall:{name:'Muro de costillas',icon:'🦴',cd:4,desc:'Escudo de 70 puntos para el jefe.'},
 torpedo:{name:'Misiles calibrados',icon:'🎯',cd:3,desc:'Dos misiles teledirigidos a la zona marcada.'},
 decree:{name:'Decreto real',icon:'👑',cd:3,desc:'Bombardeo de cinco cargas sobre la zona.'},
 frost:{name:'Aliento helado',icon:'❄',cd:3,desc:'Congela y daña a quien esté en la zona.'},
 phase:{name:'Paso espectral',icon:'👻',cd:3,desc:'El jefe se desvanece y reaparece lejos del peligro.'},
 bassDrop:{name:'Caída del bajo',icon:'🔊',cd:3,desc:'Onda expansiva alrededor del jefe.'},
 tractor:{name:'Rayo tractor',icon:'🛸',cd:3,desc:'Atrae al rival marcado hacia el jefe y lo electrocuta.'},
 plasma:{name:'Lluvia de plasma',icon:'⚡',cd:3,desc:'Cinco descargas de plasma sobre la zona.'},
 abyss:{name:'Marea abisal',icon:'🌊',cd:3,desc:'Una ola golpea a quien esté en la zona y lo arrastra.'},
 firestorm:{name:'Lluvia de fuego',icon:'☄',cd:3,desc:'Seis meteoritos caen sobre la zona.'},
 charge:{name:'Embestida ígnea',icon:'🔥',cd:3,desc:'El jefe embiste hasta la zona y estalla al llegar.'},
 outbreak:{name:'Brote',icon:'🧟',cd:3,desc:'Envenena a quien esté en la zona y el jefe se cura 20.'},
 press:{name:'Prensa hidráulica',icon:'⚙',cd:3,desc:'Columna de impacto vertical sobre la zona.'},
 glaze:{name:'Glaseado explosivo',icon:'🍩',cd:3,desc:'Tres bombas adhesivas de azúcar sobre la zona.'},
 bite:{name:'Mordisco de luna',icon:'🦇',cd:3,desc:'Drena vida de quien esté en la zona y cura al jefe.'},
 thornCage:{name:'Jaula de espinas',icon:'🥀',cd:3,desc:'Espinas que dañan e inmovilizan en la zona.'},
 starOrb:{name:'Orbe estelar',icon:'✦',cd:2,desc:'Esfera de energía que estalla en la zona marcada.'},
 nova:{name:'Latido supernova',icon:'☀',cd:3,desc:'Pulso estelar: columna de luz y onda expansiva en la zona.'}
};

// Estilos de IA de jefe: error de puntería (multiplicador) y armas preferidas.
const styles={
 normal:{aimError:.7,prefer:{rocket:1.3,grenade:1.2,shotgun:1.2}},
 tank:{aimError:.75,prefer:{medkit:2.5,shield:2,grenade:1.4},approach:true},       // zombi: resistencia
 strategist:{aimError:.6,prefer:{mine:3,dynamite:2.5,sticky:2,teleport:1.5}},       // esqueleto: estrategia
 precise:{aimError:.3,prefer:{sniper:3,homing:2.5,rocket:1.4}},                     // cíborg: precisión
 evasive:{aimError:.55,prefer:{homing:1.8,ice:1.8,teleport:2}},                      // fantasma: desplazamiento controlado
 energy:{aimError:.5,prefer:{tesla:3,orbital:2.5,vampire:2,homing:1.6}},             // alienígena: energía
 aggressive:{aimError:.6,prefer:{flame:3,meteor:2.5,dynamite:2,shotgun:2,bat:2},approach:true} // demonio: fuego
};

const P=(id,name,title,hp,abilities,style,look)=>({id,name,title,hp,abilities,style,...look});
const chapters=[
 {n:1,map:0,variant:'normal',team:'Grumetes del Arrecife',bots:['Sal','Coral','Ancla','Ostra','Remo'],
  boss:P('brisa','Capitán Brisa','El Viento de las Islas',250,['gale','broadside'],'normal',{fur:'#e8c99a',accessory:'pirate',backgear:'cape',color:'#5cebe2'})},
 {n:2,map:8,variant:'zombie',team:'Musgosos del Claro',bots:['Liquen','Raíz','Turba','Seta','Tocón'],
  boss:P('musgo','Musgo el Inmortal','El que siempre vuelve',260,['regrow','spores'],'tank',{fur:'#8fae7a',accessory:'mohawk',backgear:'toxic',color:'#9be37a'})},
 {n:3,map:10,variant:'normal',team:'Escuela del Pétalo',bots:['Hoja','Kumo','Yuki','Taiko','Sora'],
  boss:P('pocky','Shogun Pocky','Señor del Valle',265,['petals'],'normal',{fur:'#f0d6b4',accessory:'samurai',backgear:'katana',color:'#ff9ccf'})},
 {n:4,map:11,variant:'skeleton',team:'Guardia de las Arenas',bots:['Escarabajo','Duna','Ankh','Papiro','Obelisco'],
  boss:P('costilla','Faraón Costilla','Soberano de las Dunas',275,['sandTrap','boneWall'],'strategist',{fur:'#efe3c4',accessory:'crown',backgear:'cape',color:'#ffd36a'})},
 {n:5,map:7,variant:'cyber',team:'Estibadores de Hierro',bots:['Grúa','Perno','Muelle','Boya','Cable'],
  boss:P('tuerca','Almirante Tuerca','Comandante de la Tormenta',285,['torpedo'],'precise',{fur:'#9aa6b4',accessory:'helmet',backgear:'jetpack',color:'#8cecff'})},
 {n:6,map:5,variant:'normal',team:'Caballería del Bastión',bots:['Almena','Escudo','Lanza','Torreón','Heraldo'],
  boss:P('bigotin','Rey Bigotín','Monarca del Bastión Dorado',295,['decree','broadside'],'normal',{fur:'#d8b27a',accessory:'crown',backgear:'cape',color:'#ffcf5a'})},
 {n:7,map:3,variant:'ghost',team:'Ánimas de la Aurora',bots:['Bruma','Vaho','Cierzo','Nevisca','Albor'],
  boss:P('escarcha','Dama Escarcha','La Reina Sin Huella',305,['frost','phase'],'evasive',{fur:'#d9f3ff',accessory:'halo',backgear:'wings',color:'#9fe8ff'})},
 {n:8,map:1,variant:'cyber',team:'Banda del Bajo Neón',bots:['Píxel','Láser','Glitch','Sinte','Bit'],
  boss:P('circuito','DJ Circuito','El Ritmo de la Ciudad',315,['bassDrop'],'precise',{fur:'#8f9ad6',accessory:'vr',backgear:'jetpack',color:'#ff5fd2'})},
 {n:9,map:4,variant:'alien',team:'Exploradores de Zog',bots:['Xib','Nuu','Quark','Zil','Orbi'],
  boss:P('zog7','Zog-7','Emisario de la Órbita',325,['tractor','plasma'],'energy',{fur:'#a7e88a',accessory:'astronaut',backgear:'spider',color:'#b9ef8b'})},
 {n:10,map:12,variant:'ghost',team:'Ecos del Abismo',bots:['Perla','Marea','Coral','Nácar','Sirga'],
  boss:P('abisal','Guardián Abisal','Vigía de Atlantis',335,['abyss','phase'],'evasive',{fur:'#8fd8e6',accessory:'helmet',backgear:'cape',color:'#4fd9ff'})},
 {n:11,map:2,variant:'demon',team:'Legión de la Caldera',bots:['Ascua','Tizón','Magma','Cenizo','Hollín'],
  boss:P('brasa','General Brasa','Comandante del Volcán',345,['firestorm','charge'],'aggressive',{fur:'#c46a4a',accessory:'horns',backgear:'batwings',color:'#ff7a3d'})},
 {n:12,map:9,variant:'zombie',team:'Supervivientes del Kilómetro',bots:['Chatarra','Óxido','Bache','Cráter','Tuerto'],
  boss:P('zarpazo','Doctor Zarpazo','El Cirujano del Apocalipsis',350,['outbreak','regrow'],'tank',{fur:'#9fb08c',accessory:'gasmask',backgear:'toxic',color:'#b6ff6a'})},
 {n:13,map:13,variant:'cyber',team:'Cadena de Montaje Omega',bots:['Remache','Biela','Pistón','Forja','Tornillo'],
  boss:P('proto','PROTO-PUG 9000','El Prototipo Perfecto',360,['press','torpedo'],'precise',{fur:'#b9c2cc',accessory:'helmet',backgear:'jetpack',color:'#ff4d4d'})},
 {n:14,map:15,variant:'normal',team:'Pasteleros Rebeldes',bots:['Merengue','Grajea','Bizcocho','Chicle','Praliné'],
  boss:P('glaseado','Chef Glaseado','Maestro Repostero',365,['glaze'],'normal',{fur:'#f3d2b8',accessory:'chef',backgear:'none',color:'#ff9ccf'})},
 {n:15,map:14,variant:'demon',team:'Coro de la Catedral',bots:['Gárgola','Vitral','Cripta','Campana','Cirio'],
  boss:P('mordisco','Obispo Mordisco','Pastor de la Luna Roja',370,['bite','firestorm'],'aggressive',{fur:'#a8586a',accessory:'wizard',backgear:'batwings',color:'#ff4d6d'})},
 {n:16,map:16,variant:'ghost',team:'Espectros del Jardín',bots:['Zarza','Espino','Rocío','Ortiga','Pétalo'],
  boss:P('zarza','Guardián Zarza','Custodio del Jardín',380,['thornCage','phase'],'evasive',{fur:'#cfe8c8',accessory:'wizard',backgear:'cape',color:'#c8ff9b'})},
 {n:17,map:6,variant:'ghost',team:'Ecos del Trofeo',bots:['Eco I','Eco II','Eco III','Eco IV','Eco V'],
  boss:P('cero','Cooper Cero','El Primer Campeón',400,['starOrb','phase','nova'],'evasive',{fur:'#cfe9ff',accessory:'crown',backgear:'wings',color:'#9fe8ff',final:true,
   phases:[{at:1,abilities:['starOrb'],aimError:.55},{at:.66,abilities:['starOrb','phase'],aimError:.45,cdBonus:0},{at:.33,abilities:['starOrb','phase','nova'],aimError:.35,cdBonus:1}]})}
];

// Cosméticos variados y reproducibles de los bots (misma variante, semilla del capítulo).
const looks={
 accessories:['none','cap','bandana','glasses','headphones','helmet','mohawk','monocle','bowtie','sombrero','viking','pirate'],
 backgears:['none','none','cape','wings','jetpack','katana','spider','toxic'],
 furs:['#ddbb88','#ecd7b2','#aaa6a0','#716761','#c99a6b','#e6c9a3','#8d7b6c','#f1e2c6'],
 colors:['#ff797d','#ffb35c','#ffd878','#c0a5ff','#ff8fd0','#8cecff','#9be37a','#ff6b6b']
};

CS5.campaignData={version:1,cast,abilities,styles,chapters,looks,
 squad:['cooper','pipa','bongo'],
 // Valores de equilibrio: escala de los jefes y daño para interrumpir una habilidad anunciada.
 boss:{scale:2,mass:2.6,breakDamage:40,announceChance:.85,rescueDamage:45},
 // Vida de los 5 rivales de la batalla 1 (la escuadra del jugador tiene 3 × 100). Ver docs/CAMPANA-5.2.md (balance).
 botHp:60
};
})();
