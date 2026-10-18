// Cooper's Siege 5.2 — Configuración de los huesitos (suministros que caen del cielo).
// Editar aquí las probabilidades, cantidades, topes y frecuencias. Nunca incluir la bazuca
// ni la granada común: son infinitas y no pueden ser premio (lo comprueba `tests/supplies.cjs`).
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
CS5.supplyConfig={
 // Frecuencias del menú («Huesitos»): rondas entre apariciones [mín, máx] y primera aparición.
 frequency:{
  normal:{first:[2,3],every:[2,4]},
  frequent:{first:[1,2],every:[1,2]},
  rare:{first:[3,4],every:[4,6]},
  off:null
 },
 maxActive:3,           // huesitos simultáneos en el escenario
 lifetimeRounds:3,      // rondas que dura un huesito posado antes de caducar
 fallSpeed:74,          // velocidad terminal con paracaídas (unidades/s)
 gravity:480,           // gravedad sin paracaídas (suelo destruido o golpe)
 drift:.30,             // fracción del viento que arrastra el paracaídas
 pickupRadius:26,       // distancia de recogida (centro del pug ↔ huesito); se escala con los jefes
 // Categorías: probabilidad (suma 100) y armas con [mín, máx] de cargas por premio.
 categories:[
  {id:'common',get name(){return CS5.i18n.t("gameplay.supply-config.data.s001")},chance:75,color:'#9fe8ff',
   items:{shotgun:[1,3],mine:[1,3],ice:[1,3],sticky:[1,3],shield:[1,2],medkit:[1,2],teleport:[1,2]}},
  {id:'power',get name(){return CS5.i18n.t("gameplay.supply-config.data.s002")},chance:20,color:'#ffb35c',
   items:{dynamite:[1,2],homing:[1,2],cluster:[1,2],salvo:[1,2],sniper:[1,2],flame:[1,2],drill:[1,2],acid:[1,2],tesla:[1,2],saw:[1,2],vampire:[1,2]}},
  {id:'legendary',get name(){return CS5.i18n.t("gameplay.supply-config.data.s003")},chance:5,color:'#ff6bd6',
   items:{super:[1,1],blackhole:[1,1],meteor:[1,1],orbital:[1,1],holy:[1,1],airstrike:[1,2],banana:[1,1]}}
 ],
 // Tope de cargas por equipo y arma: si un premio lo supera, se vuelve a sortear.
 caps:{shotgun:6,mine:6,ice:5,sticky:5,shield:3,medkit:4,teleport:3,
  dynamite:4,homing:4,cluster:4,salvo:4,sniper:4,flame:4,drill:4,acid:4,tesla:4,saw:4,vampire:4,
  super:1,blackhole:1,meteor:2,orbital:2,holy:1,airstrike:2,banana:2},
 rerolls:8,             // intentos de re-sorteo antes de recurrir a un premio de respaldo
 fallbackHeal:25,       // si todo está al tope: curación inmediata al pug que lo recoge
 never:['rocket','grenade','bat']
};
})();
