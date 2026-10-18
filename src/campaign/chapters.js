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
 cooper:{name:'Cooper',get role(){return CS5.i18n.t("campaign.data.cooper.role")},variant:'normal',fur:'#d9ae78',accessory:'cap',backgear:'cape',color:'#ffd36a',voice:430},
 pipa:{name:'Pipa',get role(){return CS5.i18n.t("campaign.data.pipa.role")},variant:'normal',fur:'#efdcb8',accessory:'glasses',backgear:'none',color:'#c0a5ff',voice:610},
 bongo:{name:'Bongo',get role(){return CS5.i18n.t("campaign.data.bongo.role")},variant:'normal',fur:'#7a6a60',accessory:'headphones',backgear:'jetpack',color:'#60e0dd',voice:360},
 roco:{name:'Roco',get role(){return CS5.i18n.t("campaign.data.roco.role")},variant:'normal',fur:'#a8a49e',accessory:'bandana',backgear:'katana',color:'#ff797d',voice:300},
 hueson:{get name(){return CS5.i18n.t("campaign.data.hueson.name")},get role(){return CS5.i18n.t("campaign.data.hueson.role")},variant:'skeleton',fur:'#e9e1cf',accessory:'bowtie',backgear:'cape',color:'#ffcf5a',voice:250},
 cero:{get name(){return CS5.i18n.t("campaign.data.cero.name")},get role(){return CS5.i18n.t("campaign.data.cero.role")},variant:'ghost',fur:'#cfe9ff',accessory:'crown',backgear:'wings',color:'#9fe8ff',voice:200}
};

// Habilidades de jefe. Se anuncian un turno antes (zona marcada) y se pueden interrumpir
// causando `breakDamage` de daño al jefe antes de que actúe. `cd` = turnos del jefe de enfriamiento.
const abilities={
 gale:{get name(){return CS5.i18n.t("campaign.data.gale.name")},icon:'🌬',cd:3,get desc(){return CS5.i18n.t("campaign.data.gale.desc")}},
 broadside:{get name(){return CS5.i18n.t("campaign.data.broadside.name")},icon:'💥',cd:3,get desc(){return CS5.i18n.t("campaign.data.broadside.desc")}},
 regrow:{get name(){return CS5.i18n.t("campaign.data.regrow.name")},icon:'🌿',cd:4,get desc(){return CS5.i18n.t("campaign.data.regrow.desc")}},
 spores:{get name(){return CS5.i18n.t("campaign.data.spores.name")},icon:'🍄',cd:3,get desc(){return CS5.i18n.t("campaign.data.spores.desc")}},
 petals:{get name(){return CS5.i18n.t("campaign.data.petals.name")},icon:'🌸',cd:3,get desc(){return CS5.i18n.t("campaign.data.petals.desc")}},
 sandTrap:{get name(){return CS5.i18n.t("campaign.data.sandTrap.name")},icon:'⚱',cd:3,get desc(){return CS5.i18n.t("campaign.data.sandTrap.desc")}},
 boneWall:{get name(){return CS5.i18n.t("campaign.data.boneWall.name")},icon:'🦴',cd:4,get desc(){return CS5.i18n.t("campaign.data.boneWall.desc")}},
 torpedo:{get name(){return CS5.i18n.t("campaign.data.torpedo.name")},icon:'🎯',cd:3,get desc(){return CS5.i18n.t("campaign.data.torpedo.desc")}},
 decree:{get name(){return CS5.i18n.t("campaign.data.decree.name")},icon:'👑',cd:3,get desc(){return CS5.i18n.t("campaign.data.decree.desc")}},
 frost:{get name(){return CS5.i18n.t("campaign.data.frost.name")},icon:'❄',cd:3,get desc(){return CS5.i18n.t("campaign.data.frost.desc")}},
 phase:{get name(){return CS5.i18n.t("campaign.data.phase.name")},icon:'👻',cd:3,get desc(){return CS5.i18n.t("campaign.data.phase.desc")}},
 bassDrop:{get name(){return CS5.i18n.t("campaign.data.bassDrop.name")},icon:'🔊',cd:3,get desc(){return CS5.i18n.t("campaign.data.bassDrop.desc")}},
 tractor:{get name(){return CS5.i18n.t("campaign.data.tractor.name")},icon:'🛸',cd:3,get desc(){return CS5.i18n.t("campaign.data.tractor.desc")}},
 plasma:{get name(){return CS5.i18n.t("campaign.data.plasma.name")},icon:'⚡',cd:3,get desc(){return CS5.i18n.t("campaign.data.plasma.desc")}},
 abyss:{get name(){return CS5.i18n.t("campaign.data.abyss.name")},icon:'🌊',cd:3,get desc(){return CS5.i18n.t("campaign.data.abyss.desc")}},
 firestorm:{get name(){return CS5.i18n.t("campaign.data.firestorm.name")},icon:'☄',cd:3,get desc(){return CS5.i18n.t("campaign.data.firestorm.desc")}},
 charge:{get name(){return CS5.i18n.t("campaign.data.charge.name")},icon:'🔥',cd:3,get desc(){return CS5.i18n.t("campaign.data.charge.desc")}},
 outbreak:{get name(){return CS5.i18n.t("campaign.data.outbreak.name")},icon:'🧟',cd:3,get desc(){return CS5.i18n.t("campaign.data.outbreak.desc")}},
 press:{get name(){return CS5.i18n.t("campaign.data.press.name")},icon:'⚙',cd:3,get desc(){return CS5.i18n.t("campaign.data.press.desc")}},
 glaze:{get name(){return CS5.i18n.t("campaign.data.glaze.name")},icon:'🍩',cd:3,get desc(){return CS5.i18n.t("campaign.data.glaze.desc")}},
 bite:{get name(){return CS5.i18n.t("campaign.data.bite.name")},icon:'🦇',cd:3,get desc(){return CS5.i18n.t("campaign.data.bite.desc")}},
 thornCage:{get name(){return CS5.i18n.t("campaign.data.thornCage.name")},icon:'🥀',cd:3,get desc(){return CS5.i18n.t("campaign.data.thornCage.desc")}},
 starOrb:{get name(){return CS5.i18n.t("campaign.data.starOrb.name")},icon:'✦',cd:2,get desc(){return CS5.i18n.t("campaign.data.starOrb.desc")}},
 nova:{get name(){return CS5.i18n.t("campaign.data.nova.name")},icon:'☀',cd:3,get desc(){return CS5.i18n.t("campaign.data.nova.desc")}}
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

const P=(id,name,title,hp,abilities,style,look)=>CS5.i18n.labels({id,hp,abilities,style,...look},{name,title});
const chapters=[
 {n:1,map:0,variant:'normal',get team(){return CS5.i18n.t("campaign.chapters.1.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s001"),CS5.i18n.t("campaign.chapters.data.s002"),CS5.i18n.t("campaign.chapters.data.s003"),CS5.i18n.t("campaign.chapters.data.s004"),CS5.i18n.t("campaign.chapters.data.s005")]},
  boss:P('brisa',"campaign.bosses.brisa.name","campaign.bosses.brisa.title",250,['gale','broadside'],'normal',{fur:'#e8c99a',accessory:'pirate',backgear:'cape',color:'#5cebe2'})},
 {n:2,map:8,variant:'zombie',get team(){return CS5.i18n.t("campaign.chapters.2.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s006"),CS5.i18n.t("campaign.chapters.data.s007"),CS5.i18n.t("campaign.chapters.data.s008"),CS5.i18n.t("campaign.chapters.data.s009"),CS5.i18n.t("campaign.chapters.data.s010")]},
  boss:P('musgo',"campaign.bosses.musgo.name","campaign.bosses.musgo.title",260,['regrow','spores'],'tank',{fur:'#8fae7a',accessory:'mohawk',backgear:'toxic',color:'#9be37a'})},
 {n:3,map:10,variant:'normal',get team(){return CS5.i18n.t("campaign.chapters.3.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s011"),CS5.i18n.t("campaign.chapters.data.s012"),CS5.i18n.t("campaign.chapters.data.s013"),CS5.i18n.t("campaign.chapters.data.s014"),CS5.i18n.t("campaign.chapters.data.s015")]},
  boss:P('pocky',"campaign.bosses.pocky.name","campaign.bosses.pocky.title",265,['petals'],'normal',{fur:'#f0d6b4',accessory:'samurai',backgear:'katana',color:'#ff9ccf'})},
 {n:4,map:11,variant:'skeleton',get team(){return CS5.i18n.t("campaign.chapters.4.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s016"),CS5.i18n.t("campaign.chapters.data.s017"),CS5.i18n.t("campaign.chapters.data.s018"),CS5.i18n.t("campaign.chapters.data.s019"),CS5.i18n.t("campaign.chapters.data.s020")]},
  boss:P('costilla',"campaign.bosses.costilla.name","campaign.bosses.costilla.title",275,['sandTrap','boneWall'],'strategist',{fur:'#efe3c4',accessory:'crown',backgear:'cape',color:'#ffd36a'})},
 {n:5,map:7,variant:'cyber',get team(){return CS5.i18n.t("campaign.chapters.5.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s021"),CS5.i18n.t("campaign.chapters.data.s022"),CS5.i18n.t("campaign.chapters.data.s023"),CS5.i18n.t("campaign.chapters.data.s024"),CS5.i18n.t("campaign.chapters.data.s025")]},
  boss:P('tuerca',"campaign.bosses.tuerca.name","campaign.bosses.tuerca.title",285,['torpedo'],'precise',{fur:'#9aa6b4',accessory:'helmet',backgear:'jetpack',color:'#8cecff'})},
 {n:6,map:5,variant:'normal',get team(){return CS5.i18n.t("campaign.chapters.6.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s026"),CS5.i18n.t("campaign.chapters.data.s027"),CS5.i18n.t("campaign.chapters.data.s028"),CS5.i18n.t("campaign.chapters.data.s029"),CS5.i18n.t("campaign.chapters.data.s030")]},
  boss:P('bigotin',"campaign.bosses.bigotin.name","campaign.bosses.bigotin.title",295,['decree','broadside'],'normal',{fur:'#d8b27a',accessory:'crown',backgear:'cape',color:'#ffcf5a'})},
 {n:7,map:3,variant:'ghost',get team(){return CS5.i18n.t("campaign.chapters.7.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s031"),CS5.i18n.t("campaign.chapters.data.s032"),CS5.i18n.t("campaign.chapters.data.s033"),CS5.i18n.t("campaign.chapters.data.s034"),CS5.i18n.t("campaign.chapters.data.s035")]},
  boss:P('escarcha',"campaign.bosses.escarcha.name","campaign.bosses.escarcha.title",305,['frost','phase'],'evasive',{fur:'#d9f3ff',accessory:'halo',backgear:'wings',color:'#9fe8ff'})},
 {n:8,map:1,variant:'cyber',get team(){return CS5.i18n.t("campaign.chapters.8.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s036"),CS5.i18n.t("campaign.chapters.data.s037"),CS5.i18n.t("campaign.chapters.data.s038"),CS5.i18n.t("campaign.chapters.data.s039"),CS5.i18n.t("campaign.chapters.data.s040")]},
  boss:P('circuito',"campaign.bosses.circuito.name","campaign.bosses.circuito.title",315,['bassDrop'],'precise',{fur:'#8f9ad6',accessory:'vr',backgear:'jetpack',color:'#ff5fd2'})},
 {n:9,map:4,variant:'alien',get team(){return CS5.i18n.t("campaign.chapters.9.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s041"),CS5.i18n.t("campaign.chapters.data.s042"),CS5.i18n.t("campaign.chapters.data.s043"),CS5.i18n.t("campaign.chapters.data.s044"),CS5.i18n.t("campaign.chapters.data.s045")]},
  boss:P('zog7',"campaign.bosses.zog7.name","campaign.bosses.zog7.title",325,['tractor','plasma'],'energy',{fur:'#a7e88a',accessory:'astronaut',backgear:'spider',color:'#b9ef8b'})},
 {n:10,map:12,variant:'ghost',get team(){return CS5.i18n.t("campaign.chapters.10.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s046"),CS5.i18n.t("campaign.chapters.data.s047"),CS5.i18n.t("campaign.chapters.data.s048"),CS5.i18n.t("campaign.chapters.data.s049"),CS5.i18n.t("campaign.chapters.data.s050")]},
  boss:P('abisal',"campaign.bosses.abisal.name","campaign.bosses.abisal.title",335,['abyss','phase'],'evasive',{fur:'#8fd8e6',accessory:'helmet',backgear:'cape',color:'#4fd9ff'})},
 {n:11,map:2,variant:'demon',get team(){return CS5.i18n.t("campaign.chapters.11.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s051"),CS5.i18n.t("campaign.chapters.data.s052"),CS5.i18n.t("campaign.chapters.data.s053"),CS5.i18n.t("campaign.chapters.data.s054"),CS5.i18n.t("campaign.chapters.data.s055")]},
  boss:P('brasa',"campaign.bosses.brasa.name","campaign.bosses.brasa.title",345,['firestorm','charge'],'aggressive',{fur:'#c46a4a',accessory:'horns',backgear:'batwings',color:'#ff7a3d'})},
 {n:12,map:9,variant:'zombie',get team(){return CS5.i18n.t("campaign.chapters.12.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s056"),CS5.i18n.t("campaign.chapters.data.s057"),CS5.i18n.t("campaign.chapters.data.s058"),CS5.i18n.t("campaign.chapters.data.s059"),CS5.i18n.t("campaign.chapters.data.s060")]},
  boss:P('zarpazo',"campaign.bosses.zarpazo.name","campaign.bosses.zarpazo.title",350,['outbreak','regrow'],'tank',{fur:'#9fb08c',accessory:'gasmask',backgear:'toxic',color:'#b6ff6a'})},
 {n:13,map:13,variant:'cyber',get team(){return CS5.i18n.t("campaign.chapters.13.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s061"),CS5.i18n.t("campaign.chapters.data.s062"),CS5.i18n.t("campaign.chapters.data.s063"),CS5.i18n.t("campaign.chapters.data.s064"),CS5.i18n.t("campaign.chapters.data.s065")]},
  boss:P('proto',"campaign.bosses.proto.name","campaign.bosses.proto.title",360,['press','torpedo'],'precise',{fur:'#b9c2cc',accessory:'helmet',backgear:'jetpack',color:'#ff4d4d'})},
 {n:14,map:15,variant:'normal',get team(){return CS5.i18n.t("campaign.chapters.14.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s066"),CS5.i18n.t("campaign.chapters.data.s067"),CS5.i18n.t("campaign.chapters.data.s068"),CS5.i18n.t("campaign.chapters.data.s069"),CS5.i18n.t("campaign.chapters.data.s070")]},
  boss:P('glaseado',"campaign.bosses.glaseado.name","campaign.bosses.glaseado.title",365,['glaze'],'normal',{fur:'#f3d2b8',accessory:'chef',backgear:'none',color:'#ff9ccf'})},
 {n:15,map:14,variant:'demon',get team(){return CS5.i18n.t("campaign.chapters.15.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s071"),CS5.i18n.t("campaign.chapters.data.s072"),CS5.i18n.t("campaign.chapters.data.s073"),CS5.i18n.t("campaign.chapters.data.s074"),CS5.i18n.t("campaign.chapters.data.s075")]},
  boss:P('mordisco',"campaign.bosses.mordisco.name","campaign.bosses.mordisco.title",370,['bite','firestorm'],'aggressive',{fur:'#a8586a',accessory:'wizard',backgear:'batwings',color:'#ff4d6d'})},
 {n:16,map:16,variant:'ghost',get team(){return CS5.i18n.t("campaign.chapters.16.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s076"),CS5.i18n.t("campaign.chapters.data.s077"),CS5.i18n.t("campaign.chapters.data.s078"),CS5.i18n.t("campaign.chapters.data.s079"),CS5.i18n.t("campaign.chapters.data.s080")]},
  boss:P('zarza',"campaign.bosses.zarza.name","campaign.bosses.zarza.title",380,['thornCage','phase'],'evasive',{fur:'#cfe8c8',accessory:'wizard',backgear:'cape',color:'#c8ff9b'})},
 {n:17,map:6,variant:'ghost',get team(){return CS5.i18n.t("campaign.chapters.17.team")},get bots(){return [CS5.i18n.t("campaign.chapters.data.s081"),CS5.i18n.t("campaign.chapters.data.s082"),CS5.i18n.t("campaign.chapters.data.s083"),CS5.i18n.t("campaign.chapters.data.s084"),CS5.i18n.t("campaign.chapters.data.s085")]},
  boss:P('cero',"campaign.bosses.cero.name","campaign.bosses.cero.title",400,['starOrb','phase','nova'],'evasive',{fur:'#cfe9ff',accessory:'crown',backgear:'wings',color:'#9fe8ff',final:true,
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
