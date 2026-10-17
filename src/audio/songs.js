// Cooper's Siege 5.0 — Banda sonora original (17 composiciones procedurales).
// Una por escenario más el tema del menú. Todas son composiciones originales para
// este juego: motivos, progresiones, ritmos y forma propios. No reproducen ni
// derivan de música existente.
//
// Formato de nota de motivo: [paso, duración en pasos, grado de la escala, intensidad]
// Grados: 0 = tónica; los acordes se forman apilando terceras sobre el grado.
// Cada sección: {bars, prog, melody, layers, energy, key, var}
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const SC={
 ionian:[0,2,4,5,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10],
 phrygian:[0,1,3,5,7,8,10],phrygDom:[0,1,4,5,7,8,10],lydian:[0,2,4,6,7,9,11],harmMinor:[0,2,3,5,7,8,11],
 hirajoshi:[0,2,3,7,8],pentaMajor:[0,2,4,7,9],pentaMinor:[0,3,5,7,10],wholeTone:[0,2,4,6,8,10],
 lydianDom:[0,2,4,6,7,9,10]
};
const S=(bars,prog,o={})=>({bars,prog,...o});
// Las secciones de victoria y derrota se derivan de cada canción si no se definen.
function finish(song){
 const sec=song.sections;
 sec.victory=sec.victory||S(4,song.victoryProg||[0,3,4,0],{melody:'A',energy:1,key:sec.climax?.key||0,layers:{...(sec.climax||sec.A).layers,counter:true}});
 sec.defeat=sec.defeat||S(4,song.defeatProg||[5,3,1,4],{melody:'B',energy:.2,var:1,layers:{pad:true,arp:Object.keys(song.patterns.arp||{})[0]}});
 sec.breakdown=sec.breakdown||S(4,sec.A.prog.slice(0,4),{energy:.3,layers:{pad:true,arp:Object.keys(song.patterns.arp||{})[0]}});
 return song;
}

const SONGS=[];

// 0 · Archipiélago Sol — «Brisa de Manglar»: calipso luminoso con steel drums, marimba y ukelele.
SONGS[0]=finish({id:'tropic',name:'Brisa de Manglar',genre:'Calipso tropical',tempo:112,meter:4,sub:4,swing:.12,root:62,scale:SC.mixolydian,
 inst:{pad:'warmPad',chords:'uke',arp:'marimba',bass:'pluckBass',lead:'steel',lead2:'marimba',counter:'ocarina',fill:'conga'},
 patterns:{drums:{soca:{kick:'x---x---x---x---',rim:'----x-------x--x',shaker:'xoxoxoxoxoxoxoxo',conga:'--x--x----x--x-x',congaLo:'x------x--x-----'},lite:{shaker:'x-o-x-o-x-o-x-o-',conga:'---x-----x--x---'}},
  bass:{calypso:'R--5--R-R--5--8-',half:'R-------5-------'},arp:{up:'0-1-2-1-3-2-1-2-'},chords:{strum:'--x-x--x--x-x--x'}},
 motifs:{A:[[0,2,4],[3,1,5],[4,2,6],[6,2,7],[8,3,6],[12,2,4],[14,2,2],[16,2,4],[19,1,5],[20,4,4],[26,2,2],[28,4,0]],
  B:[[0,4,7],[4,2,6],[6,2,5],[8,2,4],[10,2,5],[12,4,6],[16,3,4],[19,1,3],[20,2,2],[22,2,1],[24,8,2]],
  C:[[0,6,9],[6,2,8],[8,4,7],[12,4,4],[16,6,5],[22,2,4],[24,8,2]]},
 sections:{intro:S(4,[0,3,6,0],{layers:{pad:true,arp:'up',perc:'lite'},energy:.3}),
  A:S(8,[0,3,4,0,0,3,6,4],{melody:'A',layers:{drums:'soca',bass:'calypso',chords:'strum'}}),
  A2:S(8,[0,3,4,0,0,3,6,4],{melody:'A',var:1,layers:{drums:'soca',bass:'calypso',chords:'strum',counter:true}}),
  B:S(8,[3,0,3,4,5,3,1,4],{melody:'B',layers:{drums:'soca',bass:'calypso',arp:'up',harmony:true}}),
  bridge:S(4,[5,1,3,4],{melody:'C',layers:{perc:'lite',arp:'up',bass:'half'},energy:.45}),
  climax:S(8,[0,3,4,0,5,3,4,0],{melody:'A',var:2,key:2,layers:{drums:'soca',bass:'calypso',chords:'strum',arp:'up',counter:true},energy:1})},
 form:['intro','A','A2','B','A','bridge','B','climax','breakdown','A2','B','climax'],
 fx:{reverb:1.8,wet:.24,delayBeats:.75,delayWet:.2},seq:2,arpOct:12,leadOct:12,bassOct:-24});

// 1 · Distrito Neón — «Lluvia sobre Neo-Kioto»: synthwave oscuro con caja gated, bajo en semicorcheas y lead con portamento.
SONGS[1]=finish({id:'neon',name:'Lluvia sobre Neo-Kioto',genre:'Synthwave',tempo:100,meter:4,sub:4,swing:0,root:57,scale:SC.aeolian,glide:true,
 inst:{pad:'pad',chords:'supersaw',arp:'square',bass:'synthBass',lead:'sawLead',lead2:'theremin',counter:'glassPad',fill:'gated'},
 patterns:{drums:{drive:{kick:'x-------x-------',gated:'----x-------x---',hat:'--x---x---x---xx',openhat:'------------x---'},city:{hat:'x-x-x-x-x-x-x-x-',clap:'----x-------x---'},pulse:{kick:'x---x---x---x---',gated:'----x-------x---',hat:'xxxxxxxxxxxxxxxx'}},
  bass:{sixteen:'R8R8R8R8R8R8R858',octave:'R-8-R-8-R-8-R-85'},arp:{run:'0123012301230123',slow:'0-2-1-3-0-2-1-3-'},chords:{stab:'x-----x-----x---'}},
 motifs:{A:[[0,6,4],[6,2,3],[8,4,2],[12,4,0],[16,6,2],[22,2,3],[24,8,4]],
  B:[[0,2,7],[2,2,6],[4,4,4],[8,2,7],[10,2,8],[12,4,9],[16,4,7],[20,4,6],[24,8,4]],
  C:[[0,12,0],[12,4,2],[16,12,4],[28,4,3]]},
 sections:{intro:S(4,[0,5,2,6],{layers:{pad:true,arp:'slow'},energy:.3}),
  A:S(8,[0,0,5,5,2,2,6,6],{melody:'A',layers:{drums:'drive',bass:'sixteen',arp:'slow'}}),
  A2:S(8,[0,0,5,5,2,2,6,6],{melody:'A',var:3,layers:{drums:'pulse',bass:'sixteen',arp:'run',counter:true}}),
  B:S(8,[3,3,4,4,5,5,6,6],{melody:'B',layers:{drums:'drive',bass:'octave',chords:'stab',arp:'run'}}),
  bridge:S(8,[5,5,3,3,0,0,4,4],{melody:'C',layers:{perc:'city',arp:'slow',bass:'octave'},energy:.45}),
  climax:S(8,[0,5,2,6,0,5,3,4],{melody:'B',var:2,layers:{drums:'pulse',bass:'sixteen',arp:'run',chords:'stab',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','B','climax','breakdown','A','A2','B','climax'],
 fx:{reverb:3.2,wet:.32,delayBeats:.75,feedback:.42,delayWet:.3},seq:-1,arpOct:12,leadOct:12,bassOct:-24});

// 2 · Caldera Roja — «Corazón de Magma»: épica de percusión en 6/8 con taikos, metales graves y coro (frigio dominante).
SONGS[2]=finish({id:'volcano',name:'Corazón de Magma',genre:'Épica de percusión',tempo:132,meter:6,sub:2,swing:0,root:52,scale:SC.phrygDom,
 inst:{pad:'darkPad',chords:'brass',arp:'pluck',bass:'distBass',lead:'choir',lead2:'horn',counter:'cello',fill:'taiko'},
 patterns:{drums:{war:{taiko:'x--x--x-x-x-',frame:'--x--x--x--x',anvil:'-----------x'},rumble:{taiko:'x-----x-----',timpani:'x-----------'}},
  bass:{gallop:'R-RR-RR-RR-5',drone:'R~~~~~R~~~~~'},arp:{ost:'0-1-2-0-1-2-'},chords:{hits:'x-----x--x--'}},
 motifs:{A:[[0,3,0],[3,3,1],[6,3,2],[9,3,1],[12,6,0],[18,3,-1],[21,3,0]],
  B:[[0,2,4],[2,2,5],[4,2,4],[6,6,2],[12,2,4],[14,2,5],[16,2,7],[18,6,4]],
  C:[[0,6,7],[6,6,6],[12,6,4],[18,6,1]]},
 sections:{intro:S(4,[0,0,1,0],{layers:{perc:'rumble',pad:true,bass:'drone'},energy:.4}),
  A:S(8,[0,0,1,0,5,5,1,0],{melody:'A',layers:{drums:'war',bass:'gallop',arp:'ost'}}),
  B:S(8,[3,3,1,1,5,6,1,0],{melody:'B',layers:{drums:'war',bass:'gallop',chords:'hits',arp:'ost'}}),
  A2:S(8,[0,0,1,0,5,5,1,0],{melody:'A',var:2,layers:{drums:'war',bass:'gallop',arp:'ost',harmony:true}}),
  bridge:S(4,[5,3,1,1],{melody:'C',layers:{perc:'rumble',pad:true,bass:'drone'},energy:.5}),
  climax:S(8,[0,1,0,1,5,6,1,0],{melody:'B',var:3,key:1,layers:{drums:'war',bass:'gallop',chords:'hits',arp:'ost',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','climax','breakdown','A','B','A2','climax'],
 fx:{reverb:3.4,wet:.3,drive:.35,delayBeats:1.5,delayWet:.12},seq:1,arpOct:0,leadOct:12,bassOct:-24,levels:{lead:1.25}});

// 3 · Aurora Polar — «Vals del Hielo Quieto»: vals en 3/4 con piano, celesta y cristal (lidio).
SONGS[3]=finish({id:'snow',name:'Vals del Hielo Quieto',genre:'Vals ambiental',tempo:76,meter:3,sub:4,swing:0,root:62,scale:SC.lydian,
 inst:{pad:'glassPad',chords:'piano',arp:'celesta',bass:'upright',lead:'piano',lead2:'musicbox',counter:'strings',fill:'sleigh'},
 patterns:{drums:{waltz:{brush:'x---o---o---',sleigh:'----x-------',triangle:'x-----------'},still:{triangle:'x-----------'}},
  bass:{waltz:'R-------5---',hold:'R~~~~~~~~~~~'},arp:{flow:'0-1-2-3-2-1-',sparkle:'4---3---2---'},chords:{oompah:'----x---x---'}},
 motifs:{A:[[0,4,4],[4,4,6],[8,4,7],[12,8,9],[20,4,7],[24,12,4]],
  B:[[0,2,2],[2,2,3],[4,8,4],[12,4,6],[16,4,4],[20,4,2],[24,12,0]],
  C:[[0,12,7],[12,12,11],[24,12,9]]},
 sections:{intro:S(4,[0,1,0,1],{layers:{pad:true,arp:'sparkle',perc:'still'},energy:.2}),
  A:S(8,[0,1,4,0,5,1,3,4],{melody:'A',layers:{bass:'waltz',chords:'oompah',arp:'flow',perc:'waltz'}}),
  A2:S(8,[0,1,4,0,5,1,3,4],{melody:'A',var:2,layers:{bass:'waltz',arp:'flow',perc:'waltz',counter:true}}),
  B:S(8,[5,3,1,4,5,3,1,1],{melody:'B',layers:{bass:'waltz',chords:'oompah',arp:'flow',perc:'waltz',harmony:true}}),
  bridge:S(8,[3,3,1,1,5,5,4,4],{melody:'C',layers:{pad:true,arp:'sparkle',bass:'hold'},energy:.35}),
  climax:S(8,[0,1,4,0,5,1,4,0],{melody:'A',var:1,key:2,layers:{bass:'waltz',chords:'oompah',arp:'flow',perc:'waltz',counter:true},energy:.9})},
 form:['intro','A','B','A2','bridge','A','B','climax','breakdown','A2','B','climax'],
 fx:{reverb:4.2,wet:.4,delayBeats:1,delayWet:.25,feedback:.4},seq:2,arpOct:24,leadOct:12,bassOct:-24,padOct:12});

// 4 · Órbita Violeta — «Señales de Otro Cielo»: electrónica alienígena en 7/8, theremin y campanas FM (tonos enteros).
SONGS[4]=finish({id:'alien',name:'Señales de Otro Cielo',genre:'Electrónica alienígena 7/8',tempo:118,meter:7,sub:2,swing:0,root:53,scale:SC.wholeTone,
 inst:{pad:'glassPad',chords:'bell',arp:'celesta',bass:'sub',lead:'theremin',lead2:'bell',counter:'choir',fill:'woodblock'},
 patterns:{drums:{seven:{kick:'x-----x---x---',tek:'---x-----x--x-',woodblock:'--x-------x---',shaker:'xxxxxxxxxxxxxx'},blip:{woodblock:'x---x---x-----',triangle:'x-------------'}},
  bass:{seven:'R---5-R---R-8-',pulse:'R-----R-----5-'},arp:{orbit:'0-2-4-1-3-5-2-',drift:'0---2---4---1-'},chords:{chime:'x------x------'}},
 motifs:{A:[[0,4,0],[4,2,2],[6,4,4],[10,4,3],[14,6,5],[20,2,4],[22,6,2]],
  B:[[0,2,6],[2,2,5],[4,2,4],[6,8,3],[14,4,6],[18,4,8],[22,6,7]],
  C:[[0,14,0],[14,7,3],[21,7,5]]},
 sections:{intro:S(4,[0,2,0,4],{layers:{pad:true,arp:'drift',perc:'blip'},energy:.3}),
  A:S(8,[0,0,2,2,4,4,1,1],{melody:'A',layers:{drums:'seven',bass:'seven',arp:'orbit'}}),
  B:S(8,[3,3,5,5,1,1,4,4],{melody:'B',layers:{drums:'seven',bass:'pulse',chords:'chime',arp:'orbit',counter:true}}),
  A2:S(8,[0,0,2,2,4,4,1,1],{melody:'A',var:3,layers:{drums:'seven',bass:'seven',arp:'orbit',harmony:true}}),
  bridge:S(4,[1,3,5,0],{melody:'C',layers:{perc:'blip',pad:true,bass:'pulse'},energy:.4}),
  climax:S(8,[0,2,4,1,3,5,2,0],{melody:'B',var:2,key:1,layers:{drums:'seven',bass:'seven',chords:'chime',arp:'orbit',counter:true},energy:1})},
 form:['intro','A','B','bridge','A2','B','climax','breakdown','A','B','A2','climax'],
 fx:{reverb:3.6,wet:.38,delayBeats:.5,feedback:.5,delayWet:.32},seq:1,arpOct:12,leadOct:12,bassOct:-24,glide:true});

// 5 · Bastión Dorado — «La Giga del Estandarte»: giga renacentista en 6/8 con flauta dulce, laúd y zanfona (dórico).
SONGS[5]=finish({id:'castle',name:'La Giga del Estandarte',genre:'Giga renacentista',tempo:126,meter:6,sub:2,swing:0,root:62,scale:SC.dorian,
 inst:{pad:'organ',chords:'lute',arp:'harp',bass:'upright',lead:'recorder',lead2:'fiddle',counter:'sitar',fill:'frame'},
 patterns:{drums:{jig:{frame:'x--x-ox--x-o',tamb:'---x-----x--'},march:{frame:'x-----x-----',tamb:'x--x--x--x--'}},
  bass:{jig:'R--5--R--8--',drone:'R~~~~~~~~~~~'},arp:{lute:'0-2-1-0-2-1-'},chords:{strum:'x--x--x--x-x'}},
 motifs:{A:[[0,1,4],[1,1,3],[2,1,2],[3,2,0],[5,1,2],[6,1,4],[7,1,5],[8,1,6],[9,3,7],[12,2,6],[14,1,5],[15,2,4],[17,1,3],[18,3,2],[21,3,0]],
  B:[[0,3,7],[3,1,8],[4,2,9],[6,3,7],[9,3,5],[12,2,6],[14,1,5],[15,3,4],[18,6,2]],
  C:[[0,6,4],[6,6,3],[12,6,2],[18,6,0]]},
 sections:{intro:S(4,[0,6,0,6],{layers:{pad:true,bass:'drone',perc:'march'},energy:.4}),
  A:S(8,[0,6,0,4,0,6,3,0],{melody:'A',layers:{drums:'jig',bass:'jig',chords:'strum'}}),
  B:S(8,[2,6,3,4,2,6,3,4],{melody:'B',layers:{drums:'jig',bass:'jig',arp:'lute',counter:true}}),
  A2:S(8,[0,6,0,4,0,6,3,0],{melody:'A',var:2,layers:{drums:'jig',bass:'jig',chords:'strum',harmony:true}}),
  bridge:S(4,[3,3,6,6],{melody:'C',layers:{perc:'march',bass:'drone',pad:true},energy:.5}),
  climax:S(8,[0,6,3,4,0,6,4,0],{melody:'A',var:1,key:5,layers:{drums:'jig',bass:'jig',chords:'strum',arp:'lute',counter:true},energy:1})},
 form:['intro','A','A2','B','A','bridge','B','climax','breakdown','A','B','climax'],
 fx:{reverb:2.6,wet:.3,delayWet:.08},seq:-1,arpOct:12,leadOct:12,bassOct:-24,levels:{counter:.6}});

// 6 · Última Estrella — «Réquiem para un Sol»: orquesta cósmica lenta, coro, caja de música y timbales.
SONGS[6]=finish({id:'supernova',name:'Réquiem para un Sol',genre:'Orquesta cósmica',tempo:64,meter:4,sub:4,swing:0,root:53,scale:SC.aeolian,
 inst:{pad:'darkPad',chords:'strings',arp:'musicbox',bass:'sub',lead:'choir',lead2:'horn',counter:'cello',fill:'timpani'},
 patterns:{drums:{swell:{timpani:'x-----------x---',gong:'x---------------'},pulse:{timpani:'x-------x-------',triangle:'--------x-------'}},
  bass:{long:'R~~~~~~~5~~~~~~~'},arp:{box:'0-1-2-3-4-3-2-1-'},chords:{sustain:'x---------------'}},
 motifs:{A:[[0,8,4],[8,4,3],[12,4,2],[16,12,0],[28,4,-1]],
  B:[[0,4,7],[4,4,6],[8,8,4],[16,4,5],[20,4,4],[24,8,2]],
  C:[[0,16,9],[16,16,7]]},
 sections:{intro:S(4,[0,5,0,5],{layers:{pad:true,arp:'box'},energy:.2}),
  A:S(8,[0,5,3,4,0,5,'2b',4].map(x=>typeof x==='string'?2:x),{melody:'A',layers:{pad:true,bass:'long',arp:'box',perc:'pulse'}}),
  B:S(8,[5,3,0,4,5,3,6,4],{melody:'B',layers:{bass:'long',chords:'sustain',arp:'box',perc:'pulse',counter:true}}),
  A2:S(8,[0,5,3,4,0,5,2,4],{melody:'A',var:1,layers:{bass:'long',chords:'sustain',arp:'box',harmony:true}}),
  bridge:S(4,[2,6,5,4],{melody:'C',layers:{pad:true,perc:'swell'},energy:.5}),
  climax:S(8,[0,5,3,4,5,6,4,0],{melody:'B',var:2,layers:{bass:'long',chords:'sustain',arp:'box',perc:'swell',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','climax','breakdown','A','B','climax'],
 fx:{reverb:5.5,wet:.48,delayBeats:1,delayWet:.2},seq:2,arpOct:24,leadOct:12,bassOct:-24});

// 7 · Puerto Tempestad — «Canción del Ancla Rota»: saloma marinera con acordeón, violín y pisotones.
SONGS[7]=finish({id:'harbor',name:'Canción del Ancla Rota',genre:'Saloma marinera',tempo:138,meter:4,sub:2,swing:.08,root:50,scale:SC.dorian,
 inst:{pad:'organ',chords:'reed',arp:'pluck',bass:'tuba',lead:'reed',lead2:'fiddle',counter:'fiddle',fill:'snare'},
 patterns:{drums:{stomp:{kick:'x---x---',clap:'--x---x-',tamb:'x-x-x-x-'},storm:{kick:'x--xx---',clap:'--x---x-',snare:'------xx'}},
  bass:{oom:'R-5-R-5-',walk:'R-3-5-b-'},arp:{pick:'0-1-2-1-'},chords:{pah:'-x-x-x-x'}},
 motifs:{A:[[0,2,0],[2,1,0],[3,1,2],[4,2,4],[6,2,4],[8,2,5],[10,2,4],[12,4,2],[14,2,0]],
  B:[[0,3,7],[3,1,6],[4,2,4],[6,2,2],[8,3,4],[11,1,5],[12,4,4]],
  C:[[0,4,0],[4,4,6],[8,4,4],[12,4,0]]},
 sections:{intro:S(4,[0,0,6,0],{layers:{perc:'stomp',bass:'oom'},energy:.5}),
  A:S(8,[0,0,6,6,0,0,4,0],{melody:'A',layers:{drums:'stomp',bass:'oom',chords:'pah'}}),
  A2:S(8,[0,0,6,6,0,0,4,0],{melody:'A',var:3,layers:{drums:'stomp',bass:'oom',chords:'pah',harmony:true}}),
  B:S(8,[2,2,6,6,3,3,4,4],{melody:'B',layers:{drums:'storm',bass:'walk',arp:'pick',counter:true}}),
  bridge:S(4,[5,5,6,4],{melody:'C',layers:{pad:true,perc:'stomp'},energy:.45}),
  climax:S(8,[0,6,0,4,0,6,4,0],{melody:'A',var:2,key:2,layers:{drums:'storm',bass:'oom',chords:'pah',arp:'pick',counter:true},energy:1})},
 form:['intro','A','A2','B','A','bridge','B','climax','breakdown','A2','B','climax'],
 fx:{reverb:2,wet:.22,delayWet:.08},seq:2,arpOct:12,leadOct:12,bassOct:-24});

// 8 · Bosque Umbrío — «El Claro de las Luciérnagas»: folk misterioso en 3/4 con arpa, whistle, chelo y bodhrán.
SONGS[8]=finish({id:'forest',name:'El Claro de las Luciérnagas',genre:'Folk misterioso 3/4',tempo:92,meter:3,sub:4,swing:0,root:52,scale:SC.aeolian,
 inst:{pad:'darkPad',chords:'harp',arp:'harp',bass:'upright',lead:'whistle',lead2:'flute',counter:'cello',fill:'frame'},
 patterns:{drums:{bodhran:{frame:'x--o--x--o-o',woodblock:'------x-----'},night:{triangle:'x-----------',shaker:'--x-----x---'}},
  bass:{drone:'R~~~~~5~~~~~',step:'R---5---8---'},arp:{rain:'0-2-4-2-1-3-',slow:'0---2---4---'},chords:{roll:'x-----------'}},
 motifs:{A:[[0,4,0],[4,2,2],[6,2,3],[8,4,4],[12,6,7],[18,2,6],[20,4,4]],
  B:[[0,2,4],[2,2,5],[4,8,7],[12,4,8],[16,4,7],[20,4,4]],
  C:[[0,6,4],[6,6,2],[12,12,0]]},
 sections:{intro:S(4,[0,6,5,6],{layers:{pad:true,arp:'slow',perc:'night'},energy:.25}),
  A:S(8,[0,6,5,6,0,3,4,0],{melody:'A',layers:{bass:'drone',arp:'rain',perc:'night'}}),
  B:S(8,[5,3,0,6,5,3,4,4],{melody:'B',layers:{drums:'bodhran',bass:'step',arp:'rain',counter:true}}),
  A2:S(8,[0,6,5,6,0,3,4,0],{melody:'A',var:1,layers:{drums:'bodhran',bass:'step',chords:'roll',harmony:true}}),
  bridge:S(8,[3,3,0,0,5,5,4,4],{melody:'C',layers:{pad:true,arp:'slow'},energy:.3}),
  climax:S(8,[0,6,5,4,0,6,4,0],{melody:'B',var:2,layers:{drums:'bodhran',bass:'step',arp:'rain',chords:'roll',counter:true},energy:.95})},
 form:['intro','A','B','A2','bridge','B','climax','breakdown','A','A2','climax'],
 fx:{reverb:4,wet:.4,delayBeats:.75,delayWet:.22},seq:1,arpOct:12,leadOct:12,bassOct:-24});

// 9 · Kilómetro Cero — «Ceniza y Neumáticos»: trip-hop postapocalíptico, breakbeat lento, piano desafinado y bajo saturado.
SONGS[9]=finish({id:'ruins',name:'Ceniza y Neumáticos',genre:'Trip-hop industrial',tempo:84,meter:4,sub:4,swing:.16,root:48,scale:SC.phrygian,
 inst:{pad:'darkPad',chords:'detunedPiano',arp:'pluck',bass:'distBass',lead:'detunedPiano',lead2:'fiddle',counter:'brass',fill:'snare'},
 patterns:{drums:{break:{kick:'x-----x-x-------',snare:'----x--o----x---',hat:'x-x-x-xxx-x-x-xx',anvil:'---------------x'},dust:{hat:'x---x---x---x---',rim:'------x-------x-'}},
  bass:{crawl:'R~~-----5~~-R---',stab:'R---R-------b---'},arp:{rust:'0---1---2---1---'},chords:{hit:'x-------x--x----'}},
 motifs:{A:[[0,6,0],[6,2,1],[8,8,0],[16,4,3],[20,4,1],[24,8,0]],
  B:[[0,2,4],[2,2,3],[4,4,1],[8,4,4],[12,4,6],[16,12,4],[28,4,3]],
  C:[[0,16,7],[16,16,6]]},
 sections:{intro:S(4,[0,0,1,0],{layers:{pad:true,perc:'dust'},energy:.3}),
  A:S(8,[0,0,1,1,5,5,1,0],{melody:'A',layers:{drums:'break',bass:'crawl',chords:'hit'}}),
  B:S(8,[3,3,1,1,6,6,1,1],{melody:'B',layers:{drums:'break',bass:'stab',arp:'rust',counter:true}}),
  A2:S(8,[0,0,1,1,5,5,1,0],{melody:'A',var:2,layers:{drums:'break',bass:'crawl',chords:'hit',harmony:true}}),
  bridge:S(4,[5,6,1,0],{melody:'C',layers:{pad:true,perc:'dust'},energy:.3}),
  climax:S(8,[0,1,5,1,3,1,6,1],{melody:'B',var:3,layers:{drums:'break',bass:'stab',chords:'hit',arp:'rust',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','B','climax','breakdown','A','B','climax'],
 fx:{reverb:3,wet:.3,drive:.25,delayBeats:.75,delayWet:.2,cutoff:9000},seq:1,arpOct:12,leadOct:12,bassOct:-24});

// 10 · Valle Cerezos — «Pétalos sobre el Templo»: koto, shakuhachi y taiko ligero en escala hirajoshi.
SONGS[10]=finish({id:'sakura',name:'Pétalos sobre el Templo',genre:'Japonés tradicional estilizado',tempo:96,meter:4,sub:4,swing:0,root:57,scale:SC.hirajoshi,
 inst:{pad:'glassPad',chords:'koto',arp:'koto',bass:'sub',lead:'shakuhachi',lead2:'koto',counter:'strings',fill:'taiko'},
 patterns:{drums:{temple:{taiko:'x-------x--x----',woodblock:'----x-------x---',shaker:'--x---x---x---x-'},calm:{woodblock:'x-------x-------'}},
  bass:{root:'R-------5-------',move:'R---5---8---5---'},arp:{koto:'0-1-2-3-4-3-2-1-',sparse:'0-----2-----4---'},chords:{pluck:'x-----x---x-----'}},
 motifs:{A:[[0,4,2],[4,2,3],[6,2,4],[8,8,5],[16,4,4],[20,4,3],[24,8,2]],
  B:[[0,2,6],[2,2,5],[4,4,4],[8,4,5],[12,4,7],[16,8,6],[24,8,5]],
  C:[[0,8,0],[8,8,2],[16,16,4]]},
 sections:{intro:S(4,[0,0,3,0],{layers:{pad:true,arp:'sparse',perc:'calm'},energy:.25}),
  A:S(8,[0,0,3,3,1,1,0,0],{melody:'A',layers:{bass:'root',arp:'koto',perc:'calm'}}),
  B:S(8,[3,3,4,4,1,1,2,2],{melody:'B',layers:{drums:'temple',bass:'move',chords:'pluck',counter:true}}),
  A2:S(8,[0,0,3,3,1,1,0,0],{melody:'A',var:1,layers:{drums:'temple',bass:'move',arp:'koto',harmony:true}}),
  bridge:S(4,[2,1,3,0],{melody:'C',layers:{pad:true,arp:'sparse'},energy:.3}),
  climax:S(8,[0,3,1,0,3,4,2,0],{melody:'B',var:2,key:5,layers:{drums:'temple',bass:'move',arp:'koto',chords:'pluck',counter:true},energy:1})},
 form:['intro','A','A2','B','bridge','A','B','climax','breakdown','A2','B','climax'],
 fx:{reverb:3.8,wet:.4,delayBeats:.75,delayWet:.25},seq:1,arpOct:12,leadOct:12,bassOct:-24,padNotes:3});

// 11 · Dunas de Anubis — «Caravana del Escarabajo»: oud, ney y darbuka (maqsum) en modo hijaz.
SONGS[11]=finish({id:'desert',name:'Caravana del Escarabajo',genre:'Maqsum del desierto',tempo:104,meter:4,sub:4,swing:.05,root:50,scale:SC.phrygDom,
 inst:{pad:'warmPad',chords:'oud',arp:'oud',bass:'upright',lead:'ney',lead2:'oud',counter:'sitar',fill:'doum'},
 patterns:{drums:{maqsum:{doum:'x-----x---x-----',tek:'---x----x--x-x-x',tamb:'--x---x---x---x-'},sand:{tek:'x---x---x---x---',shaker:'xoxoxoxoxoxoxoxo'}},
  bass:{doum:'R-----R---5-----',walk:'R---1---3---b---'},arp:{oud:'0-1-2-1-0-1-2-3-',trill:'0101210101210123'},chords:{strum:'x--x--x---x--x--'}},
 motifs:{A:[[0,2,0],[2,2,1],[4,4,2],[8,2,3],[10,2,2],[12,4,1],[16,6,4],[22,2,3],[24,4,2],[28,4,1]],
  B:[[0,4,4],[4,2,5],[6,2,4],[8,4,3],[12,4,4],[16,2,7],[18,2,6],[20,4,5],[24,8,4]],
  C:[[0,8,7],[8,8,5],[16,8,4],[24,8,1]]},
 sections:{intro:S(4,[0,0,1,0],{layers:{pad:true,perc:'sand',bass:'doum'},energy:.3}),
  A:S(8,[0,0,1,1,0,0,6,0],{melody:'A',layers:{drums:'maqsum',bass:'doum',arp:'oud'}}),
  B:S(8,[3,3,1,1,5,5,1,0],{melody:'B',layers:{drums:'maqsum',bass:'walk',chords:'strum',counter:true}}),
  A2:S(8,[0,0,1,1,0,0,6,0],{melody:'A',var:2,layers:{drums:'maqsum',bass:'doum',arp:'trill',harmony:true}}),
  bridge:S(4,[3,1,6,0],{melody:'C',layers:{perc:'sand',pad:true},energy:.4}),
  climax:S(8,[0,1,0,6,3,1,6,0],{melody:'B',var:3,key:2,layers:{drums:'maqsum',bass:'walk',arp:'trill',chords:'strum',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','B','climax','breakdown','A','A2','B','climax'],
 fx:{reverb:2.8,wet:.3,delayBeats:.75,delayWet:.18},seq:1,arpOct:12,leadOct:12,bassOct:-24,levels:{counter:.55}});

// 12 · Abismo Atlantis — «Catedral de Coral»: ambient acuático en 5/4, rhodes, arpegios de cristal y graves profundos.
SONGS[12]=finish({id:'atlantis',name:'Catedral de Coral',genre:'Ambient acuático 5/4',tempo:84,meter:5,sub:4,swing:0,root:53,scale:SC.dorian,
 inst:{pad:'glassPad',chords:'rhodes',arp:'celesta',bass:'sub',lead:'rhodes',lead2:'flute',counter:'choir',fill:'brush'},
 patterns:{drums:{current:{softKick:'x-------x-----x-----',brush:'----x---------x-----',shaker:'x-x-x-x-x-x-x-x-x-x-'},deep:{softKick:'x-------------------'}},
  bass:{tide:'R~~~~~~~5~~~~~R~~~~~',pulse:'R---R-----5---R-----'},arp:{ripple:'0-1-2-3-4-3-2-1-0-2-',drop:'4---3---2---1---0---'},chords:{bloom:'x---------x---------'}},
 motifs:{A:[[0,6,4],[6,2,5],[8,8,6],[16,4,4],[20,8,2],[28,4,3],[32,8,4]],
  B:[[0,4,7],[4,4,6],[8,6,4],[14,6,5],[20,10,2],[30,10,4]],
  C:[[0,20,0],[20,20,4]]},
 sections:{intro:S(4,[0,6,0,6],{layers:{pad:true,arp:'drop',perc:'deep'},energy:.2}),
  A:S(8,[0,6,3,4,0,6,3,4],{melody:'A',layers:{bass:'tide',arp:'ripple',perc:'current'}}),
  B:S(8,[2,3,6,4,2,3,1,4],{melody:'B',layers:{bass:'pulse',chords:'bloom',arp:'ripple',perc:'current',counter:true}}),
  A2:S(8,[0,6,3,4,0,6,3,4],{melody:'A',var:1,layers:{bass:'tide',chords:'bloom',arp:'ripple',harmony:true}}),
  bridge:S(4,[5,3,1,4],{melody:'C',layers:{pad:true,arp:'drop'},energy:.3}),
  climax:S(8,[0,6,3,4,2,3,1,0],{melody:'B',var:2,layers:{bass:'pulse',chords:'bloom',arp:'ripple',perc:'current',counter:true},energy:.9})},
 form:['intro','A','B','A2','bridge','climax','breakdown','A','B','A2','climax'],
 fx:{reverb:5,wet:.5,delayBeats:.75,feedback:.5,delayWet:.34,cutoff:5200},seq:2,arpOct:12,leadOct:12,bassOct:-24});

// 13 · Fundición Omega — «Martillo Hidráulico»: techno industrial a 128, bajo ácido y yunques.
SONGS[13]=finish({id:'factory',name:'Martillo Hidráulico',genre:'Techno industrial',tempo:128,meter:4,sub:4,swing:0,root:48,scale:SC.aeolian,
 inst:{pad:'darkPad',chords:'brass',arp:'acid',bass:'acid',lead:'sawLead',lead2:'square',counter:'pad',fill:'clap'},
 patterns:{drums:{press:{kick:'x---x---x---x---',clap:'----x-------x---',hat:'--x---x---x---x-',anvil:'-------x-------x'},furnace:{hat:'xxxxxxxxxxxxxxxx',anvil:'x-------x-------'}},
  bass:{acid:'RR8RR5R8RR8RR57R',hold:'R~~~R~~~R~~~R~~~'},arp:{squelch:'0-0-1-0-2-0-1-3-'},chords:{alarm:'x--x--x---------'}},
 motifs:{A:[[0,2,0],[2,2,0],[4,2,3],[6,2,0],[8,4,6],[12,4,4],[16,2,0],[18,2,0],[20,2,3],[22,2,4],[24,8,3]],
  B:[[0,8,7],[8,4,6],[12,4,4],[16,8,3],[24,8,2]],
  C:[[0,16,0],[16,16,-1]]},
 sections:{intro:S(4,[0,0,0,0],{layers:{perc:'furnace',bass:'hold'},energy:.5}),
  A:S(8,[0,0,5,5,3,3,6,6],{melody:'A',layers:{drums:'press',bass:'acid'}}),
  B:S(8,[0,0,5,5,3,3,4,4],{melody:'B',layers:{drums:'press',bass:'acid',arp:'squelch',chords:'alarm'}}),
  A2:S(8,[0,0,5,5,3,3,6,6],{melody:'A',var:3,layers:{drums:'press',perc:'furnace',bass:'acid',counter:true}}),
  bridge:S(8,[5,5,6,6,0,0,4,4],{melody:'C',layers:{perc:'furnace',bass:'hold',pad:true},energy:.5}),
  climax:S(8,[0,5,3,6,0,5,4,0],{melody:'B',var:2,layers:{drums:'press',perc:'furnace',bass:'acid',arp:'squelch',chords:'alarm',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','climax','breakdown','A','B','A2','climax'],
 fx:{reverb:2,wet:.2,drive:.45,delayBeats:.75,delayWet:.18},seq:0,arpOct:0,leadOct:12,bassOct:-24,levels:{arp:.7}});

// 14 · Catedral Gótica — «Misa de la Luna de Sangre»: órgano, coro y campanas tubulares en 3/4 (menor armónica).
SONGS[14]=finish({id:'inferno',name:'Misa de la Luna de Sangre',genre:'Barroco gótico 3/4',tempo:108,meter:3,sub:4,swing:0,root:50,scale:SC.harmMinor,
 inst:{pad:'organ',chords:'harpsichord',arp:'harpsichord',bass:'tuba',lead:'choir',lead2:'organ',counter:'tubular',fill:'timpani'},
 patterns:{drums:{mass:{timpani:'x-------x---',gong:'x-----------',tubular:'------------'},toll:{timpani:'x-----------'}},
  bass:{walk:'R---5---8---',toll:'R~~~~~~~~~~~'},arp:{toccata:'0123432101234321'.slice(0,12),broken:'0-2-4-2-1-3-'},chords:{stab:'x---x---x---'}},
 motifs:{A:[[0,4,4],[4,4,3],[8,4,2],[12,6,0],[18,2,6],[20,4,4]],
  B:[[0,2,7],[2,2,6],[4,4,4],[8,4,5],[12,8,4],[20,4,2]],
  C:[[0,12,0],[12,12,-3]]},
 sections:{intro:S(4,[0,0,4,4],{layers:{pad:true,perc:'toll',bass:'toll'},energy:.35}),
  A:S(8,[0,3,4,0,5,3,4,4],{melody:'A',layers:{bass:'walk',arp:'toccata',perc:'mass'}}),
  B:S(8,[5,1,4,0,5,1,4,4],{melody:'B',layers:{bass:'walk',chords:'stab',arp:'broken',counter:true}}),
  A2:S(8,[0,3,4,0,5,3,4,4],{melody:'A',var:2,layers:{bass:'walk',arp:'toccata',perc:'mass',harmony:true}}),
  bridge:S(4,[3,6,2,4],{melody:'C',layers:{pad:true,perc:'toll'},energy:.4}),
  climax:S(8,[0,3,4,0,5,1,4,0],{melody:'B',var:3,layers:{bass:'walk',chords:'stab',arp:'toccata',perc:'mass',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','climax','breakdown','A','B','A2','climax'],
 fx:{reverb:5.2,wet:.45,delayWet:.08},seq:-1,arpOct:12,leadOct:12,bassOct:-24,levels:{pad:.8}});

// 15 · Dulce Caos — «Fiebre de Azúcar»: chiptune-pop a 150 con pulsos, arpegios rápidos y modulación final.
SONGS[15]=finish({id:'candy',name:'Fiebre de Azúcar',genre:'Chiptune pop',tempo:150,meter:4,sub:4,swing:0,root:60,scale:SC.ionian,
 inst:{pad:'warmPad',chords:'chipPulse',arp:'chipPulse',bass:'chipBass',lead:'square',lead2:'bell',counter:'chipPulse',fill:'chipNoise'},
 patterns:{drums:{bounce:{chipKick:'x-----x-x-------',chipNoise:'----x-------x---',hat:'x-x-x-x-x-x-x-x-'},sprinkle:{hat:'x-x-x-x-x-x-x-x-',triangle:'x---------------'}},
  bass:{bounce:'R-8-R-8-5-8-5-8-',half:'R-------5-------'},arp:{fast:'0123012301230123',up:'0-1-2-4-'.repeat(2)},chords:{skank:'--x---x---x---x-'}},
 motifs:{A:[[0,2,4],[2,2,4],[4,2,5],[6,2,7],[8,4,7],[12,2,5],[14,2,4],[16,2,2],[18,2,4],[20,4,5],[24,6,4],[30,2,2]],
  B:[[0,3,0],[3,1,2],[4,4,4],[8,3,5],[11,1,4],[12,4,2],[16,3,7],[19,1,6],[20,4,5],[24,8,4]],
  C:[[0,4,9],[4,4,7],[8,4,8],[12,4,6],[16,8,7],[24,8,4]]},
 sections:{intro:S(4,[0,4,5,3],{layers:{arp:'up',perc:'sprinkle'},energy:.5}),
  A:S(8,[0,4,5,3,0,4,3,4],{melody:'A',layers:{drums:'bounce',bass:'bounce',chords:'skank'}}),
  B:S(8,[3,4,2,5,3,4,1,4],{melody:'B',layers:{drums:'bounce',bass:'bounce',arp:'fast',counter:true}}),
  A2:S(8,[0,4,5,3,0,4,3,4],{melody:'A',var:2,layers:{drums:'bounce',bass:'bounce',chords:'skank',arp:'up',harmony:true}}),
  bridge:S(4,[5,3,1,4],{melody:'C',layers:{perc:'sprinkle',bass:'half',arp:'up'},energy:.5}),
  climax:S(8,[0,4,5,3,0,4,3,0],{melody:'A',var:1,key:2,layers:{drums:'bounce',bass:'bounce',chords:'skank',arp:'fast',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','B','climax','breakdown','A','B','climax'],
 fx:{reverb:1.6,wet:.18,delayBeats:.5,delayWet:.15},seq:2,arpOct:12,leadOct:12,bassOct:-24,levels:{counter:.6,arp:.75}});

// Menú · «Himno de Cooper»: tema original heroico y juguetón (marcha orquestal-pop en Si bemol).
const MENU=finish({id:'menu',name:'Himno de Cooper',genre:'Marcha orquestal-pop',tempo:118,meter:4,sub:4,swing:0,root:58,scale:SC.ionian,gain:1.9,
 inst:{pad:'strings',chords:'piano',arp:'harp',bass:'pluckBass',lead:'brass',lead2:'strings',counter:'horn',fill:'timpani'},
 patterns:{drums:{march:{kick:'x-------x-------',snare:'----x--o----x-oo',timpani:'x---------------',tamb:'--x---x---x---x-'},lite:{tamb:'x---x---x---x---'}},
  bass:{march:'R---5---R---5-b-',half:'R-------5-------'},arp:{harp:'0-1-2-3-4-3-2-1-'},chords:{pump:'x-x-x-x-x-x-x-x-'}},
 motifs:{A:[[0,3,0],[3,1,2],[4,4,4],[8,2,7],[10,2,6],[12,4,4],[16,3,5],[19,1,4],[20,2,2],[22,2,4],[24,8,1]],
  B:[[0,2,7],[2,2,8],[4,4,9],[8,2,7],[10,2,5],[12,4,4],[16,6,5],[22,2,4],[24,8,2]],
  C:[[0,8,4],[8,8,5],[16,8,6],[24,8,7]]},
 sections:{intro:S(4,[0,3,4,4],{layers:{pad:true,perc:'lite',arp:'harp'},energy:.4}),
  A:S(8,[0,3,4,0,5,3,1,4],{melody:'A',layers:{drums:'march',bass:'march',chords:'pump'}}),
  B:S(8,[3,4,2,5,3,4,1,4],{melody:'B',layers:{drums:'march',bass:'march',arp:'harp',counter:true}}),
  A2:S(8,[0,3,4,0,5,3,1,4],{melody:'A',var:2,layers:{drums:'march',bass:'march',chords:'pump',harmony:true}}),
  bridge:S(4,[5,1,3,4],{melody:'C',layers:{pad:true,arp:'harp',bass:'half'},energy:.4}),
  climax:S(8,[0,3,4,0,5,3,4,0],{melody:'A',var:1,key:2,layers:{drums:'march',bass:'march',chords:'pump',arp:'harp',counter:true},energy:1})},
 form:['intro','A','B','A2','bridge','climax','A','B','climax'],
 fx:{reverb:2.6,wet:.3,delayWet:.1},seq:2,arpOct:12,leadOct:12,bassOct:-24});

CS5.songs={list:SONGS,menu:MENU,scales:SC,forMap:i=>SONGS[i]||SONGS[0]};
})();
