// Cooper's Siege 5.2 — Arsenal e igualdad humano/bot.
// · Bazuca, granada común y bate son infinitos para todos: humanos, bots,
//   enemigos de campaña y jefes.
// · Arsenal estándar inicial: bazuca ∞, granada ∞, escopeta 2, mina 2, bate ∞;
//   el resto empieza a 0 (las superarmas solo llegan con los huesitos).
// · El inventario es por equipo: humanos y bots pasan por las mismas funciones
//   (`canFire` / `consume`), así que nadie puede disparar un arma agotada.
// · «Abundante» (arsenal clásico ×2) e «Infinita» se conservan para partidas personalizadas.
// Todo es determinista: no usa azar.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const INFINITE=Object.freeze(['rocket','grenade','bat']);
const STANDARD=Object.freeze({rocket:Infinity,grenade:Infinity,shotgun:2,mine:2,bat:Infinity});
const MODES=Object.freeze(['standard','abundant','infinite']);

const arsenal={
 INFINITE,STANDARD,MODES,
 isInfinite(id){return INFINITE.includes(id);},
 // Munición inicial de un equipo. `weapons` es la lista del juego (con la munición clásica de 5.1 en `ammo`).
 initial(weapons,mode='standard'){
  if(!MODES.includes(mode))mode='standard';
  const ammo={};
  for(const w of weapons){
   if(mode==='infinite'||INFINITE.includes(w.id))ammo[w.id]=Infinity;
   else if(mode==='abundant')ammo[w.id]=w.ammo===Infinity?Infinity:w.ammo*2;
   else ammo[w.id]=Object.hasOwn(STANDARD,w.id)?STANDARD[w.id]:0;
  }
  return ammo;
 },
 // JSON convierte Infinity en null (instantáneas LAN): se restaura aquí.
 normalize(team,weapons){
  if(!team||!team.ammo)return team;
  for(const w of weapons){const v=team.ammo[w.id];if(v===null||(v===undefined&&INFINITE.includes(w.id)))team.ammo[w.id]=Infinity;else if(v===undefined)team.ammo[w.id]=0;}
  for(const id of INFINITE)team.ammo[id]=Infinity;
  return team;
 },
 count(team,id){
  if(INFINITE.includes(id))return Infinity;
  const n=team?.ammo?.[id];
  return n===null?Infinity:(typeof n==='number'&&n>0?n:0);
 },
 canFire(team,id){return arsenal.count(team,id)>0;},
 // Gasta una carga. Devuelve false (sin cambios) si el arma está agotada.
 consume(team,id){
  if(!arsenal.canFire(team,id))return false;
  if(team.ammo[id]!==Infinity&&team.ammo[id]!==null)team.ammo[id]=Math.max(0,team.ammo[id]-1);
  return true;
 },
 // Añade cargas (huesitos). Devuelve las cargas realmente añadidas.
 grant(team,id,n,cap=Infinity){
  if(!team||!team.ammo||INFINITE.includes(id))return 0;
  const cur=arsenal.count(team,id);if(cur===Infinity)return 0;
  const add=Math.max(0,Math.min(n,cap-cur));
  team.ammo[id]=cur+add;return add;
 },
 // Armas utilizables ahora mismo por el equipo.
 available(team,weapons){return weapons.filter(w=>arsenal.canFire(team,w.id)).map(w=>w.id);},
 // Huella del inventario (pruebas de igualdad y sincronía).
 signature(team,weapons){return weapons.map(w=>w.id+':'+(arsenal.count(team,w.id)===Infinity?'∞':arsenal.count(team,w.id))).join('|');}
};
CS5.arsenal=arsenal;
})();
