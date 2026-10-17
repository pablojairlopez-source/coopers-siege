// Cooper's Siege 5.1 — Banda sonora original (18 composiciones procedurales).
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
// 5.1: notación compacta de melodías, un símbolo por paso: grado de la escala (con «!»
// acento o «?» suave), «.» prolonga la nota anterior, «-» silencio, «|» separa compases.
function mel(str){const out=[];let step=0,cur=null;for(const tok of str.trim().split(/\s+/)){if(tok==='|')continue;if(tok==='.'){if(cur)cur[1]++;step++;continue;}if(tok==='-'){cur=null;step++;continue;}const v=tok.endsWith('!')?1.2:tok.endsWith('?')?.6:1;cur=[step,1,parseInt(tok,10),v];out.push(cur);step++;}return out;}
// Las secciones de victoria y derrota se derivan de cada canción si no se definen.
function finish(song){
 const sec=song.sections,mo=song.motifs;
 // 5.1: las piezas con varias melodías (A1, A2…) exponen A y B para victoria y derrota.
 mo.A=mo.A||mo.A1;mo.B=mo.B||mo.B1||mo.A;
 sec.victory=sec.victory||S(4,song.victoryProg||[0,3,4,0],{melody:'A',energy:1,key:sec.climax?.key||0,layers:{...(sec.climax||sec.A).layers,counter:true}});
 sec.defeat=sec.defeat||S(4,song.defeatProg||[5,3,1,4],{melody:'B',energy:.2,var:1,layers:{pad:true,arp:Object.keys(song.patterns.arp||{})[0]}});
 sec.breakdown=sec.breakdown||S(4,sec.A.prog.slice(0,4),{energy:.3,layers:{pad:true,arp:Object.keys(song.patterns.arp||{})[0]}});
 return song;
}

const SONGS=[];

// 0 · Archipiélago Sol — «Brisa de Manglar»: calipso luminoso con steel drums, marimba y ukelele.
SONGS[0]=finish({id:'tropic',get name(){return CS5.i18n.t("audio.songs.tropic.name")},get genre(){return CS5.i18n.t("audio.songs.tropic.genre")},tempo:112,meter:4,sub:4,swing:.12,root:62,scale:SC.mixolydian,
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
SONGS[1]=finish({id:'neon',get name(){return CS5.i18n.t("audio.songs.neon.name")},get genre(){return CS5.i18n.t("audio.songs.neon.genre")},tempo:100,meter:4,sub:4,swing:0,root:57,scale:SC.aeolian,glide:true,
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

// 2 · Caldera Roja — «Furia de la Caldera» (5.1): épica volcánica en frigio dominante.
// Taikos profundos, metales graves y coro oscuro; cinco ideas melódicas distintas
// (llamada de guerra, respuesta, himno coral, ostinato rápido y tema del clímax),
// un puente sombrío, desarrollo modulante y una segunda erupción medio tono arriba.
SONGS[2]=finish({id:'volcano',get name(){return CS5.i18n.t("audio.songs.volcano.name")},get genre(){return CS5.i18n.t("audio.songs.volcano.genre")},tempo:138,meter:4,sub:4,swing:0,root:52,scale:SC.phrygDom,
 inst:{pad:'darkPad',chords:'lowBrass',arp:'pizz',bass:'distBass',lead:'lowBrass',lead2:'choirDark',counter:'cello',fill:'taikoBig'},
 patterns:{drums:{
   war:{taikoBig:'x-----x-x-------',taiko:'----x-------x-x-',frame:'--x---x---x---x-'},
   gallop:{taikoBig:'x--x--x-x--x--x-',taiko:'----x-------x---',snare:'oo--x-oo--o-x-oo',crash:'x'+'-'.repeat(63)},
   rumble:{timpani:'x-----------x---',taiko:'--------x-------'},
   heart:{taikoBig:'x--x------------',frame:'--------x-------'}},
  bass:{ostinato:'R-RR-RR-R-RR-R5-',drone:'R~~~~~~~R~~~~~~~',run:'R-R-8-R-5-R-8-R-',throb:'R---R---R---R-R-'},
  arp:{ost:'0-1-2-1-0-1-2-3-',fury:'0120012001200123'},chords:{hits:'x-----x-----x---',stabs:'x--x--x---x-x---'}},
 motifs:{
  A1:mel('0! . . . 0 . 1 . 2! . . . 1 . 0 . | -1 . . . . . . . 0 . 1 . 2 . 3 . | 4! . . . 3 . 2 . 3 . . . 1 . . . | 0 . . . . . . . . . . . - - - -'),
  A2:mel('4! . . . 4 . 5 . 4 . 3 . 2 . . . | 3 . 2 . 1 . 2 . 0 . . . . . . . | 6 . . . 5 . 4 . 5 . 6 . 7! . . . | 4 . . . . . . . 2 . 1 . 0 . . .'),
  B1:mel('7 . . . . . . . 6 . . . 5 . . . | 4 . . . . . . . . . . . 3 . . . | 5 . . . 6 . . . 7 . . . 8 . . . | 7 . . . . . . . . . . . . . . .'),
  B2:mel('8 . . . . . . . 7 . . . 6 . 5 . | 4 . . . . . . . 5 . . . 3 . . . | 2 . . . 3 . . . 4 . . . 1 . . . | 0 . . . . . . . . . . . . . . .'),
  C1:mel('0 1 2 1 0 1 2 3 4 3 2 1 2 3 4 5 | 4 . 2 . 4 . 2 . 1 . . . 0 . . . | 0 1 2 1 0 1 2 3 5 4 3 2 3 4 5 6 | 7! . . . 6 . 5 . 4 . . . - . . .'),
  C2:mel('7 6 5 4 5 4 3 2 3 2 1 0 1 2 3 4 | 5 . 4 . 3 . 4 . 2 . . . . . . . | 1 2 3 2 1 2 3 4 5 4 3 2 1 0 -1 0 | 0! . . . . . . . -1 . . . 0 . . .'),
  D:mel('2 . . . . . . . 1 . . . . . . . | 0 . . . . . . . . . . . . . . . | 3 . . . . . . . 2 . . . . . . . | 1 . . . . . . . . . . . . . . .'),
  E1:mel('0! . . 2 4 . . . 7! . . . 6 . 5 . | 6 . . . 5 . 4 . 5 . . . . . . . | 3 . . 4 5 . . . 8! . . . 7 . 6 . | 7 . . . . . . . 4 . . . . . . .'),
  E2:mel('8! . . 7 6 . . . 5 . . . 6 . 7 . | 8 . . . 7 . 6 . 5 . . . . . . . | 4 . . 5 6 . . . 7 . . . 6 . 5 . | 0! . . . . . . . . . . . - . . .'),
  K1:mel('-7 . . . . . . . -8 . . . . . . . | -10 . . . . . . . -9 . . . . . . . | -8 . . . . . . . -7 . . . . . . . | -10 . . . . . . . -8 . . . . . . .'),
  K2:mel('4 . . . 3 . . . 2 . . . 1 . . . | 2 . . . 3 . . . 4 . . . . . . . | 5 . . . 4 . . . 3 . . . 2 . . . | 1 . . . 0 . . . -1 . . . . . . .')},
 sections:{intro:S(4,[0,0,1,0],{layers:{perc:'rumble',pad:true,bass:'drone'},energy:.4}),
  A:S(8,[0,0,1,0,3,1,0,0],{melody:['A1','A2'],literal:true,layers:{drums:'war',bass:'ostinato',arp:'ost'}}),
  A2:S(8,[3,1,0,0,0,0,1,0],{melody:['A2','A1'],literal:true,inst:{lead:'horn'},counterMelody:'K1',layers:{drums:'war',bass:'ostinato',chords:'hits'}}),
  B:S(8,[3,3,1,0,5,6,1,0],{melody:['B1','B2'],literal:true,inst:{lead:'choirDark'},layers:{drums:'heart',bass:'drone',chords:'hits',arp:'ost'},energy:.65}),
  C:S(8,[0,1,0,1,3,1,0,0],{melody:['C1','C2'],literal:true,inst:{lead:'fiddle',arp:'pizz'},layers:{drums:'gallop',bass:'run',arp:'fury',chords:'stabs'},energy:.95}),
  bridge:S(8,[0,1,0,6,3,1,6,0],{melody:'D',literal:true,inst:{lead:'choirDark'},layers:{perc:'rumble',pad:true,bass:'drone'},energy:.35}),
  climax:S(8,[0,3,3,0,1,6,3,0],{melody:['E1','E2'],literal:true,counterMelody:'K2',layers:{drums:'gallop',bass:'ostinato',chords:'stabs',arp:'fury'},energy:1}),
  dev:S(8,[0,0,1,0,3,1,0,0],{melody:['A1','C1'],literal:true,key:1,inst:{lead:'horn',counter:'choirDark'},counterMelody:'K1',layers:{drums:'war',bass:'throb',chords:'hits',arp:'ost'},energy:.85}),
  climax2:S(8,[1,6,3,0,0,3,3,0],{melody:['E2','E1'],literal:true,key:1,inst:{counter:'choirDark'},counterMelody:'K2',layers:{drums:'gallop',bass:'run',chords:'stabs',arp:'fury'},energy:1})},
 form:['intro','A','A2','B','C','A','bridge','B','climax','dev','C','breakdown','A2','B','climax2','C'],
 fx:{reverb:3.4,wet:.3,drive:.3,delayBeats:1.5,delayWet:.1},seq:1,arpOct:0,leadOct:12,bassOct:-24,counterOct:0,levels:{lead:1.2,counter:.85}});

// 3 · Aurora Polar — «Vals del Hielo Quieto»: vals en 3/4 con piano, celesta y cristal (lidio).
SONGS[3]=finish({id:'snow',get name(){return CS5.i18n.t("audio.songs.snow.name")},get genre(){return CS5.i18n.t("audio.songs.snow.genre")},tempo:76,meter:3,sub:4,swing:0,root:62,scale:SC.lydian,
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
SONGS[4]=finish({id:'alien',get name(){return CS5.i18n.t("audio.songs.alien.name")},get genre(){return CS5.i18n.t("audio.songs.alien.genre")},tempo:118,meter:7,sub:2,swing:0,root:53,scale:SC.wholeTone,
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
SONGS[5]=finish({id:'castle',get name(){return CS5.i18n.t("audio.songs.castle.name")},get genre(){return CS5.i18n.t("audio.songs.castle.genre")},tempo:126,meter:6,sub:2,swing:0,root:62,scale:SC.dorian,
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

// 6 · Última Estrella — «Réquiem para un Sol» (5.1): conserva el tema coral original y la
// caja de música, y lo desarrolla con una respuesta nueva, una segunda melodía de
// sintetizador más rítmica, una tercera melodía amplia para el clímax, contracantos
// de chelo y de sintetizador, arpegios espaciales y una reexposición en otra tonalidad.
SONGS[6]=finish({id:'supernova',get name(){return CS5.i18n.t("audio.songs.supernova.name")},get genre(){return CS5.i18n.t("audio.songs.supernova.genre")},tempo:64,meter:4,sub:4,swing:0,root:53,scale:SC.aeolian,
 inst:{pad:'darkPad',chords:'strings',arp:'musicbox',bass:'sub',lead:'choir',lead2:'horn',counter:'cello',fill:'timpani'},
 patterns:{drums:{swell:{timpani:'x-----------x---',gong:'x'+'-'.repeat(31)},pulse:{timpani:'x-------x-------',triangle:'--------x-------'},
   orbit:{softKick:'x-------x-------',shaker:'--x---x---x---x-',triangle:'x'+'-'.repeat(31)},
   comet:{softKick:'x-----x---x-----',brush:'----x-------x---',shaker:'xoxoxoxoxoxoxoxo'}},
  bass:{long:'R~~~~~~~5~~~~~~~',move:'R~~~~~5~R~~~8~~~',breath:'R~~~~~~~~~~~~~~~'},
  arp:{box:'0-1-2-3-4-3-2-1-',stars:'4-2-0-2-5-3-1-3-',pulse16:'0123456701234567',drift:'0---4---2---6---'},chords:{sustain:'x---------------',swell:'x-------x-------'}},
 motifs:{
  // Tema original (dos primeros compases) con su continuación nueva.
  A1:mel('4 . . . . . . . 3 . . . 2 . . . | 0 . . . . . . . . . . . -1 . . . | 2 . . . . . . . 3 . . . 4 . . . | 5 . . . . . . . 4 . . . . . . .'),
  A2:mel('7 . . . . . . . 6 . . . 4 . . . | 5 . . . . . . . 4 . . . 2 . . . | 3 . . . . . . . 2 . . . 1 . . . | 0 . . . . . . . . . . . . . . .'),
  B1:mel('7 . . . 6 . . . 4 . . . . . . . | 5 . . . 4 . . . 2 . . . . . . . | 3 . . . 4 . . . 5 . . . 7 . . . | 6 . . . . . . . . . . . . . . .'),
  B2:mel('9 . . . 8 . . . 7 . . . . . . . | 6 . . . 7 . . . 4 . . . . . . . | 5 . . . 4 . . . 3 . . . 2 . . . | 1 . . . . . . . 4 . . . . . . .'),
  // Segunda melodía (sintetizador): más rítmica, se abre hacia el relativo mayor.
  D1:mel('2 . . 4 7 . . . 6 . 4 . 2 . . . | 3 . . 5 9 . . . 7 . . . . . . . | 6 . . 5 4 . . . 2 . 4 . 3 . . . | 2 . . . . . . . . . . . - . . .'),
  D2:mel('2 . . 4 7 . . . 9 . 7 . 6 . . . | 5 . . 4 3 . . . 4 . . . 5 . . . | 6 . . 7 9 . . . 11 . . . 9 . . . | 7 . . . . . . . . . . . . . . .'),
  // Tercera melodía: intervalos amplios para el clímax.
  E1:mel('0 . . . 4 . . . 7 . . . . . . . | 8 . . . 7 . . . 6 . . . 4 . . . | 3 . . . 7 . . . 10 . . . . . . . | 9 . . . 8 . . . 7 . . . . . . .'),
  E2:mel('11 . . . 10 . . . 9 . . . 7 . . . | 8 . . . 7 . . . 6 . . . 4 . . . | 5 . . . 4 . . . 3 . . . 2 . . . | 0 . . . . . . . . . . . . . . .'),
  C:mel('9 . . . . . . . . . . . . . . . | 7 . . . . . . . . . . . . . . . | 6 . . . . . . . . . . . . . . . | 4 . . . . . . . . . . . . . . .'),
  K1:mel('-7 . . . . . . . . . . . . . . . | -9 . . . . . . . . . . . . . . . | -10 . . . . . . . . . . . . . . . | -8 . . . . . . . . . . . . . . .'),
  K2:mel('- - - - 2 . . . 4 . . . 3 . . . | 2 . . . . . . . 0 . . . 1 . . . | - - - - 0 . . . 2 . . . 4 . . . | 3 . . . . . . . 1 . . . . . . .')},
 sections:{intro:S(4,[0,5,0,5],{layers:{pad:true,arp:'box'},energy:.2}),
  A:S(8,[0,5,2,5,0,5,6,0],{melody:['A1','A2'],literal:true,counterMelody:'K1',layers:{pad:true,bass:'long',arp:'box',perc:'pulse'}}),
  B:S(8,[0,5,3,6,2,0,5,4],{melody:['B1','B2'],literal:true,inst:{lead:'horn',counter:'softLead'},counterMelody:'K2',layers:{bass:'long',chords:'sustain',arp:'stars',perc:'pulse'}}),
  D:S(8,[0,3,2,2,0,5,2,0],{melody:['D1','D2'],literal:true,inst:{lead:'softLead',arp:'celesta'},layers:{pad:true,bass:'move',arp:'pulse16',drums:'orbit'},energy:.75}),
  bridge:S(8,[2,0,6,4,2,0,6,4],{melody:'C',literal:true,inst:{arp:'glassPad'},layers:{pad:true,arp:'drift',perc:'swell',bass:'breath'},energy:.4}),
  A3:S(8,[0,5,2,5,0,5,6,0],{melody:['A2','A1'],literal:true,key:3,inst:{lead:'softLead',counter:'strings'},counterMelody:'K2',layers:{bass:'move',chords:'swell',arp:'stars',drums:'orbit'},energy:.7}),
  climax:S(8,[0,4,3,0,0,4,3,0],{melody:['E1','E2'],literal:true,inst:{counter:'strings'},counterMelody:'K2',layers:{bass:'long',chords:'sustain',arp:'pulse16',drums:'comet',perc:'swell'},energy:1}),
  D2:S(8,[0,3,2,2,0,5,2,0],{melody:['D2','D1'],literal:true,key:-2,inst:{lead:'softLead',counter:'cello'},counterMelody:'K1',layers:{bass:'move',arp:'stars',drums:'comet'},energy:.85})},
 form:['intro','A','B','D','bridge','A3','climax','breakdown','D2','B','climax','A'],
 fx:{reverb:5.5,wet:.48,delayBeats:1,delayWet:.22},seq:2,arpOct:24,leadOct:12,bassOct:-24,counterOct:0});

// 7 · Puerto Tempestad — «Canción del Ancla Rota»: saloma marinera con acordeón, violín y pisotones.
SONGS[7]=finish({id:'harbor',get name(){return CS5.i18n.t("audio.songs.harbor.name")},get genre(){return CS5.i18n.t("audio.songs.harbor.genre")},tempo:138,meter:4,sub:2,swing:.08,root:50,scale:SC.dorian,
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
SONGS[8]=finish({id:'forest',get name(){return CS5.i18n.t("audio.songs.forest.name")},get genre(){return CS5.i18n.t("audio.songs.forest.genre")},tempo:92,meter:3,sub:4,swing:0,root:52,scale:SC.aeolian,
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
SONGS[9]=finish({id:'ruins',get name(){return CS5.i18n.t("audio.songs.ruins.name")},get genre(){return CS5.i18n.t("audio.songs.ruins.genre")},tempo:84,meter:4,sub:4,swing:.16,root:48,scale:SC.phrygian,
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
SONGS[10]=finish({id:'sakura',get name(){return CS5.i18n.t("audio.songs.sakura.name")},get genre(){return CS5.i18n.t("audio.songs.sakura.genre")},tempo:96,meter:4,sub:4,swing:0,root:57,scale:SC.hirajoshi,
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
SONGS[11]=finish({id:'desert',get name(){return CS5.i18n.t("audio.songs.desert.name")},get genre(){return CS5.i18n.t("audio.songs.desert.genre")},tempo:104,meter:4,sub:4,swing:.05,root:50,scale:SC.phrygDom,
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
SONGS[12]=finish({id:'atlantis',get name(){return CS5.i18n.t("audio.songs.atlantis.name")},get genre(){return CS5.i18n.t("audio.songs.atlantis.genre")},tempo:84,meter:5,sub:4,swing:0,root:53,scale:SC.dorian,
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

// 13 · Fundición Omega — «Inspección de Engranajes» (5.1): groove industrial y mecánico en
// dórico. Ostinato de marimba como engranajes, pistones, golpes metálicos y vapor; bajo
// contundente, metales en llamada y respuesta y un lead de sierra en el clímax.
// Dirección pedida a partir de una referencia de la que solo se pudo consultar el título
// («Kirby 64 – Factory Inspection»): la pieza es una composición original.
SONGS[13]=finish({id:'factory',get name(){return CS5.i18n.t("audio.songs.factory.name")},get genre(){return CS5.i18n.t("audio.songs.factory.genre")},tempo:124,meter:4,sub:4,swing:0,root:48,scale:SC.dorian,
 inst:{pad:'darkPad',chords:'brass',arp:'marimba',bass:'synthBass',lead:'square',lead2:'sawLead',counter:'brass',fill:'piston'},
 patterns:{drums:{
   press:{kick:'x---x---x---x---',clap:'----x-------x---',gear:'-x-x-x-x-x-x-x-x',metalHit:'------x-------x-'},
   machine:{kick:'x--x--x---x--x--',piston:'----x-------x---',metalHit:'x-----x---x-----',steam:'-'.repeat(30)+'x-',hat:'x-x-x-x-x-x-x-x-'},
   idle:{gear:'x---x---x---x---',steam:'x'+'-'.repeat(31),cowbell:'--------------x-'},
   furnace:{kick:'x---x---x---x---',hat:'xxxxxxxxxxxxxxxx',anvil:'x-------x-------',piston:'--x---x---x---x-'}},
  bass:{stomp:'R---R---R-R-R---',pump:'R-R8R-R8R-R8R-58',acid:'RR8RR5R8RR8RR57R',hold:'R~~~R~~~R~~~R~~~'},
  arp:{cog:'0-2-1-3-0-2-1-3-',squelch:'0-0-1-0-2-0-1-3-'},chords:{alarm:'x--x--x---------',stab:'x--x--x---x-----'}},
 motifs:{
  A1:mel('0 . 0 . - 0 2 . 4 . - 4 3 . 2 . | 0 . 0 . - 0 2 . 4 . 6 . 5 . 4 . | 3 . 3 . - 3 5 . 7 . - 7 6 . 5 . | 4 . . . 2 . . . - . . . . . . .'),
  A2:mel('7 . 7 . - 7 6 . 4 . - 4 5 . 6 . | 7 . . . 4 . . . 2 . . . . . . . | 6 . 6 . - 6 5 . 3 . - 3 4 . 5 . | 6 . . . 8 . . . 7! . . . . . . .'),
  B1:mel('4! . . . . . 4 . 6 . . . 4 . . . | 3 . . . 2 . . . 0 . . . . . . . | 4! . . . . . 4 . 7 . . . 6 . . . | 5 . . . 4 . . . 3 . . . . . . .'),
  B2:mel('9 . . . 8 . 7 . 6 . . . 4 . . . | 5 . . . 6 . . . 7 . . . . . . . | 9 . . . 8 . 7 . 6 . . . 7 . 8 . | 9! . . . . . . . 7 . . . . . . .'),
  C1:mel('0 2 4 2 0 2 4 7 6 4 2 4 6 4 2 1 | 0 2 4 2 0 2 4 7 8 7 6 4 3 2 1 0 | 3 5 7 5 3 5 7 9 8 7 5 7 8 7 5 4 | 3 . 1 . 2 . 0 . -1 . . . 0 . . .'),
  C2:mel('7 6 4 6 7 6 4 2 4 2 0 2 4 . . . | 6 5 3 5 6 5 3 1 3 1 -1 1 3 . . . | 2 4 6 4 2 4 6 8 7 6 4 6 7 . . . | 6 . 4 . 2 . 1 . 0! . . . . . . .'),
  D1:mel('7! . . 7 . . 9 . 8 . . 7 . . 6 . | 4 . . . . . 6 . 7 . . . . . . . | 8! . . 8 . . 10 . 9 . . 8 . . 7 . | 6 . . . 4 . . . 2 . . . . . . .'),
  D2:mel('11! . . 11 . . 10 . 9 . . 8 . . 7 . | 8 . . . . . 7 . 6 . . . . . . . | 5 . . 6 . . 7 . 8 . . 9 . . 10 . | 11! . . . . . . . 7 . . . . . . .'),
  Z:mel('0 . . . . . . . . . . . . . . . | -1 . . . . . . . . . . . . . . . | -2 . . . . . . . . . . . . . . . | -3 . . . . . . . -1 . . . . . . .'),
  K1:mel('- . . . . . . . 2 . . . . . . . | 1 . . . . . . . -1 . . . . . . . | 0 . . . . . . . 3 . . . . . . . | 1 . . . . . . . 2 . . . . . . .')},
 sections:{intro:S(4,[0,0,6,6],{layers:{perc:'idle',bass:'hold',arp:'cog'},energy:.45}),
  A:S(8,[0,[0,4],3,[4,0],[0,6],0,[6,3],[6,0]],{melody:['A1','A2'],literal:true,layers:{drums:'press',bass:'stomp',arp:'cog'}}),
  B:S(8,[4,[6,0],[0,6],3,2,[3,0],[2,6],[2,0]],{melody:['B1','B2'],literal:true,inst:{lead:'brass',bass:'acid'},layers:{drums:'machine',bass:'acid',chords:'stab'}}),
  C:S(8,[0,[0,6],3,[6,0],0,6,[2,0],[4,0]],{melody:['C1','C2'],literal:true,inst:{lead:'marimba'},layers:{drums:'furnace',bass:'stomp',counter:true},energy:.9}),
  bridge:S(8,[0,6,3,4,0,6,3,4],{melody:'Z',literal:true,inst:{lead:'sawLead'},layers:{perc:'idle',pad:true,bass:'hold',arp:'squelch'},energy:.4}),
  A2:S(8,[0,[0,4],3,[4,0],[0,6],0,[6,3],[6,0]],{melody:['A2','A1'],literal:true,key:5,inst:{lead:'sawLead'},counterMelody:'K1',layers:{drums:'press',bass:'pump',arp:'cog'}}),
  climax:S(8,[[0,6],[4,0],6,2,[4,6],6,[3,6],[4,0]],{melody:['D1','D2'],literal:true,inst:{lead:'sawLead',bass:'acid'},layers:{drums:'machine',perc:'furnace',bass:'acid',chords:'alarm',arp:'squelch',counter:true},energy:1}),
  C2:S(8,[0,[0,6],3,[6,0],0,6,[2,0],[4,0]],{melody:['C2','C1'],literal:true,key:-2,inst:{lead:'xylophone'},layers:{drums:'press',bass:'pump',counter:true},energy:.85}),
  B2:S(8,[4,[6,0],[0,6],3,2,[3,0],[2,6],[2,0]],{melody:['B2','B1'],literal:true,key:2,inst:{lead:'brass',bass:'acid'},counterMelody:'K1',layers:{drums:'machine',bass:'acid',chords:'stab',arp:'cog'}})},
 form:['intro','A','B','A','C','bridge','A2','climax','breakdown','C2','B2','climax','A'],
 fx:{reverb:2,wet:.2,drive:.35,delayBeats:.75,delayWet:.16},seq:0,arpOct:12,leadOct:12,bassOct:-24,counterOct:0,levels:{arp:.75}});

// 14 · Catedral Gótica — «Vigilia de los Colmillos» (5.1): rock gótico en re menor armónica.
// Guitarra saturada, órgano, clavecín con figuraciones barrocas de nota pedal, bajo
// eléctrico y batería rápida; coral de órgano en el puente y solo de guitarra en el clímax.
// Inspirada en la energía del rock gótico de los juegos de vampiros: melodías,
// progresiones (i–iv–V, bII napolitano, VI–V) y arreglos propios.
SONGS[14]=finish({id:'inferno',get name(){return CS5.i18n.t("audio.songs.inferno.name")},get genre(){return CS5.i18n.t("audio.songs.inferno.genre")},tempo:144,meter:4,sub:4,swing:0,root:50,scale:SC.harmMinor,
 inst:{pad:'darkPad',chords:'organ',arp:'harpsichord',bass:'electricBass',lead:'overdrive',lead2:'organ',counter:'organ',fill:'rockSnare'},
 patterns:{drums:{
   rock:{rockKick:'x-----x-x-x-----',rockSnare:'----x-------x---',hat:'x-x-x-x-x-x-x-x-',crash:'x'+'-'.repeat(63)},
   gallop:{rockKick:'x-xx-xx-x-xx-xx-',rockSnare:'----x-------x---',ride:'x-x-x-x-x-x-x-x-'},
   blast:{rockKick:'x-x-x-x-x-x-x-x-',rockSnare:'----x-------x-x-',ride:'xxxxxxxxxxxxxxxx',crash:'x'+'-'.repeat(31)},
   toll:{timpani:'x-------x-------',gong:'x'+'-'.repeat(63)}},
  bass:{drive:'R-R-R-R-R-R-R-R-',gallop:'R-RRR-RRR-RRR-RR',walk:'R-8-R-8-5-8-R-b-',toll:'R~~~~~~~R~~~~~~~'},
  arp:{toccata:'0123432101234321',broken:'0-2-1-3-2-4-3-1-'},chords:{stab:'x-------x-------',pulse:'x-x-x-x-x-x-x-x-'}},
 motifs:{
  A1:mel('0! . 2 . 4 . 7 . 6 . 7 . 4 . 2 . | 3! . 5 . 7 . 5 . 4 . . . . . 6 . | 7! . 6 . 5 . 4 . 3 . 4 . 5 . 3 . | 4 . . . 6 . . . 7! . . . . . . .'),
  A2:mel('7! . 9 . 8 . 7 . 6 . 7 . 9 . 11 . | 10! . 9 . 8 . 9 . 7 . . . . . . . | 5 . 4 . 5 . 7 . 8 . 7 . 5 . 4 . | 6 . . . 4 . . . 1 . . . 0 . . .'),
  A3:mel('0! . 2 . 4 . 7 . 9 . 7 . 4 . 2 . | 3 . 5 . 8 . 10 . 9 . . . 8 . . . | 7 . 6 . 7 . 4 . 5 . 4 . 3 . 1 . | 0 . . . . . . . . . . . - . . .'),
  B1:mel('4 3 4 2 4 1 4 0 5 4 5 3 5 2 5 1 | 6 5 6 4 6 3 6 2 7 6 7 5 7 4 7 3 | 8 7 8 6 8 5 8 4 9 8 9 7 9 6 9 5 | 8 . 6 . 4 . 2 . 1 . . . 0 . . .'),
  B2:mel('7 . . . 9 . . . 8 . 7 . 6 . 7 . | 5 . . . 7 . . . 6 . 5 . 4 . 5 . | 3 . . . 5 . . . 4 . 3 . 2 . 3 . | 4 . . . . . . . 6 . . . . . . .'),
  B3:mel('4 3 4 2 4 1 4 0 5 4 5 3 5 2 5 1 | 6 5 6 4 6 3 6 2 7 6 7 5 7 4 7 3 | 9 8 7 6 5 4 3 2 3 4 5 6 7 8 9 10 | 11! . . . 7 . . . 4 . . . 0 . . .'),
  C:mel('0 . . . . . . . 1 . . . . . . . | 2 . . . . . . . 1 . . . . . . . | 5 . . . . . . . 4 . . . . . . . | 6 . . . . . . . 4 . . . . . . .'),
  D1:mel('7! . . 4 7 . 9 . 10! . . . 9 . 7 . | 8 . . 6 8 . 9 . 11! . . . 10 . 8 . | 9 . . 7 9 . 10 . 12 . . . 11 . 9 . | 8 . 9 . 8 . 6 . 7! . . . . . . .'),
  D2:mel('14! . . . 13 . 12 . 11 . . . 10 . 9 . | 10 . . . 9 . 8 . 7 . . . 6 . 5 . | 4 . 5 . 6 . 7 . 8 . 9 . 10 . 11 . | 14! . . . . . . . 7 . . . . . . .'),
  D3:mel('7! . . 4 7 . 9 . 10! . . . 9 . 7 . | 8 . . 6 8 . 9 . 11! . . . 10 . 8 . | 12 . 11 . 10 . 9 . 8 . 7 . 6 . 5 . | 4 . . . 6 . . . 7! . . . . . . .'),
  F1:mel('0 . . . 0 . 1 . 2 . . . 0 . . . | 3 . . . 2 . 1 . 2 . . . . . . . | 4 . . . 4 . 5 . 6 . . . 4 . . . | 7 . . . 6 . 5 . 4 . . . . . . .'),
  F2:mel('7 . . . 7 . 6 . 5 . . . 7 . . . | 3 . . . 4 . 5 . 4 . . . . . . . | 2 . . . 2 . 1 . 0 . . . 2 . . . | 1 . . . -1 . . . 0 . . . . . . .'),
  K1:mel('-7 . . . . . . . -4 . . . . . . . | -4 . . . . . . . -3 . . . . . . . | -2 . . . . . . . -3 . . . . . . . | -3 . . . . . . . -7 . . . . . . .'),
  K2:mel('2 . . . . . . . 3 . . . . . . . | 1 . . . . . . . 6 . . . . . . . | 5 . . . . . . . 2 . . . . . . . | 1 . . . . . . . 2 . . . . . . .')},
 sections:{intro:S(4,[0,0,4,4],{layers:{pad:true,perc:'toll',bass:'toll',arp:'broken'},energy:.4}),
  A:S(16,[0,[3,4],5,[4,0],0,[3,0],5,[4,0],0,[3,4],5,[4,0],0,[3,4],[5,4],0],{melody:['A1','A2','A1','A3'],literal:true,layers:{drums:'rock',bass:'drive',chords:'stab'}}),
  B:S(16,[[0,3],[4,0],[4,5],[4,0],0,5,3,4,[0,3],[4,0],[4,5],[4,0],[0,3],[4,0],[5,3],[4,0]],{melody:['B1','B2','B1','B3'],literal:true,inst:{lead:'harpsichord'},layers:{drums:'gallop',bass:'gallop',chords:'pulse'},energy:.9}),
  A2:S(8,[0,[3,4],5,[4,0],0,[3,0],5,[4,0]],{melody:['A1','A2'],literal:true,inst:{lead:'organ'},counterMelody:'K1',layers:{drums:'rock',bass:'walk',arp:'toccata'}}),
  bridge:S(8,[[0,4],[5,4],[5,4],4,[0,4],[5,4],[5,4],4],{melody:'C',literal:true,inst:{lead:'choir'},layers:{pad:true,perc:'toll',bass:'toll',arp:'broken'},energy:.4}),
  climax:S(16,[[0,3],4,5,[4,0],[0,5],[3,4],4,0,[0,3],4,5,[4,0],[0,3],4,[5,3],[4,0]],{melody:['D1','D2','D1','D3'],literal:true,counterMelody:'K2',inst:{counter:'strings'},layers:{drums:'blast',bass:'gallop',chords:'pulse',arp:'toccata'},energy:1}),
  B2:S(8,[[0,3],[4,0],[4,5],[4,0],0,5,3,4],{melody:['B1','B2'],literal:true,key:5,inst:{lead:'harpsichord'},counterMelody:'K1',layers:{drums:'gallop',bass:'drive',chords:'stab'},energy:.85}),
  dev:S(8,[0,[3,0],4,[0,4],5,3,0,[4,0]],{melody:['F1','F2'],literal:true,key:7,inst:{lead:'organ'},layers:{drums:'rock',bass:'walk',arp:'toccata',chords:'stab'},energy:.8}),
  A3:S(8,[0,[3,4],5,[4,0],0,[3,4],[5,4],0],{melody:['A2','A3'],literal:true,inst:{lead:'overdrive',counter:'harpsichord'},counterMelody:'K2',layers:{drums:'rock',bass:'drive',arp:'broken'}}),
  climax2:S(16,[[0,3],4,5,[4,0],[0,5],[3,4],4,0,[0,3],4,5,[4,0],[0,3],4,[5,3],[4,0]],{melody:['D3','D2','D1','D3'],literal:true,key:2,counterMelody:'K2',inst:{counter:'strings'},layers:{drums:'blast',bass:'gallop',chords:'pulse',arp:'toccata'},energy:1})},
 form:['intro','A','B','A2','bridge','climax','B2','dev','A3','breakdown','climax2','A'],
 fx:{reverb:4.4,wet:.34,delayWet:.08},seq:-1,arpOct:12,leadOct:12,bassOct:-24,counterOct:0,levels:{pad:.7,arp:.8}});

// 15 · Dulce Caos — «Desfile de Caramelos» (5.1): pieza juguetona y extravagante con piano de
// juguete, kazoo, xilófono, vibráfono, silbato de émbolo, tuba en oom-pah y percusión de
// juguete; cambios de tonalidad bruscos, paradas sorpresa y secciones muy distintas.
// Dirección pedida a partir de una referencia de la que solo se pudo consultar el título
// («Kirby 64 – File Select»): la pieza es una composición original.
SONGS[15]=finish({id:'candy',get name(){return CS5.i18n.t("audio.songs.candy.name")},get genre(){return CS5.i18n.t("audio.songs.candy.genre")},tempo:136,meter:4,sub:4,swing:.1,root:60,scale:SC.ionian,
 inst:{pad:'warmPad',chords:'pizz',arp:'vibes',bass:'pluckBass',lead:'toyPiano',lead2:'xylophone',counter:'kalimba',fill:'toyDrum'},
 patterns:{drums:{
   bounce:{toyDrum:'x-----x-x-------',slap:'----x-------x---',hat:'x-x-x-x-x-x-x-x-',boing:'-'.repeat(63)+'x'},
   toy:{chipKick:'x-------x-------',cowbell:'--x---x---x---x-',woodblock:'------x-------x-'},
   march:{toyDrum:'x---x---x---x---',slap:'--x---x---x---x-',triangle:'x'+'-'.repeat(15)},
   stop:{slap:'x'+'-'.repeat(15),boing:'-'.repeat(31)+'x'}},
  bass:{bounce:'R-8-R-8-5-8-5-8-',tuba:'R---5---R---5---',walk:'R-3-5-8-R-3-5-b-',half:'R-------5-------'},
  arp:{fast:'0123012301230123',up:'0-1-2-4-0-1-2-4-',twinkle:'4---6---5---7---'},chords:{skank:'--x---x---x---x-',pump:'x-x-x-x-x-x-x-x-'}},
 motifs:{
  A1:mel('4 . 2 . 4 . 7 . - . 6 . 4 . . . | 5 . 3 . 5 . 8 . - . 7 . 5 . . . | 4 . 7 . 9 . 7 . 4 . 2 . 4 . 5 . | 4 . . . 1 . . . 2 . . . - . . .'),
  A2:mel('7 . 9 . 7 . 4 . 5 . 7 . 5 . 2 . | 4 . 5 . 4 . 0 . 1 . . . - . . . | 3 . 5 . 8 . 7 . 6 . 5 . 4 . 3 . | 2 . . . 4 . . . 7! . . . - . . .'),
  B1:mel('0 . . 1 2 . . 3 4 . . . 2 . . . | 3 . . 2 1 . . 0 -1 . . . 1 . . . | 2 . . 3 4 . . 5 6 . . . 4 . . . | 5 . 4 . 3 . 2 . 1 . . . . . . .'),
  B2:mel('7 . . 6 5 . . 4 3 . . . 5 . . . | 4 . . 3 2 . . 1 0 . . . 2 . . . | 1 . . 2 3 . . 4 5 . . . 8 . . . | 7 . . . . . . . - . . . . . . .'),
  C1:mel('4 5 4 3 4 7 4 3 4 5 4 3 2 . . . | 5 6 5 4 5 8 5 4 5 6 5 4 3 . . . | 7 8 7 6 7 9 7 6 5 6 5 4 3 4 3 2 | 1 . . . 4 . . . 0! . . . - . . .'),
  C2:mel('2 . . . . . . . 4 . . . 3 . . . | 1 . . . . . . . 0 . . . . . . . | 5 . . . . . . . 4 . . . 2 . . . | 3 . . . . . . . . . . . . . . .'),
  D1:mel('7! . 7 . 9 . 7 . 4 . 7 . 11 . 9 . | 8 . 8 . 10 . 8 . 5 . 8 . 12 . 10 . | 9 . 7 . 8 . 6 . 7 . 5 . 6 . 4 . | 5 . 4 . 2 . 1 . 0! . . . - . . .'),
  D2:mel('11 . 9 . 7 . 9 . 11 . 12 . 14! . . . | 13 . 11 . 9 . 11 . 13 . 12 . 11 . . . | 10 . 8 . 6 . 8 . 10 . 11 . 12 . 10 . | 7! . . . . . . . - . 4 . 7 . . .'),
  S:mel('7 . . . . . . . 4 . . . . . . . | 9 . . . . . . . 2 . . . . . . . | 11 . . . . . . . 5 . . . . . . . | 7! . . . . . . . - . . . . . . .'),
  K1:mel('- - 9 . - - 9 . - - 8 . - - 8 . | - - 8 . - - 8 . - - 7 . - - 7 . | - - 9 . - - 9 . - - 10 . - - 10 . | - - 11 . - - 8 . - - 9 . - . . .'),
  K2:mel('4 . . . 5 . . . 4 . . . 2 . . . | 3 . . . 5 . . . 8 . . . 5 . . . | 4 . . . 2 . . . 4 . . . 6 . . . | 4 . . . 2 . . . 0 . . . . . . .')},
 sections:{intro:S(4,[0,1,4,0],{layers:{arp:'twinkle',perc:'toy',pad:true},energy:.45}),
  A:S(8,[0,1,0,[4,0],[0,5],[0,4],[1,4],0],{melody:['A1','A2'],literal:true,layers:{drums:'bounce',bass:'bounce',chords:'skank'}}),
  B:S(8,[0,4,[0,4],[3,4],[0,3],[4,0],1,0],{melody:['B1','B2'],literal:true,inst:{lead:'kazoo',bass:'tuba'},counterMelody:'K1',layers:{drums:'march',bass:'tuba'}}),
  C:S(8,[0,3,[0,5],[4,0],[0,3],[4,0],[5,0],3],{melody:['C1','C2'],literal:true,key:5,inst:{lead:'xylophone'},layers:{drums:'toy',bass:'walk',arp:'up'},energy:.8}),
  stop:S(4,[0,4,5,4],{melody:'S',literal:true,inst:{lead:'slideWhistle'},layers:{perc:'stop',pad:true},energy:.3,fill:false}),
  A2:S(8,[0,1,0,[4,0],[0,5],[0,4],[1,4],0],{melody:['A2','A1'],literal:true,key:-2,inst:{lead:'chipPulse',counter:'kazoo'},counterMelody:'K2',layers:{drums:'bounce',bass:'bounce',arp:'fast'}}),
  climax:S(8,[0,1,[0,4],[4,0],0,2,4,0],{melody:['D1','D2'],literal:true,key:2,inst:{lead:'chipPulse',counter:'kazoo'},counterMelody:'K2',layers:{drums:'bounce',perc:'toy',bass:'bounce',chords:'pump',arp:'fast'},energy:1}),
  B2:S(8,[0,4,[0,4],[3,4],[0,3],[4,0],1,0],{melody:['B2','B1'],literal:true,key:-5,inst:{lead:'square',bass:'tuba',counter:'xylophone'},counterMelody:'K1',layers:{drums:'march',bass:'tuba',chords:'skank'}}),
  C2:S(8,[[0,3],[4,0],[5,0],3,0,3,[0,5],[4,0]],{melody:['C2','C1'],literal:true,key:-3,inst:{lead:'vibes'},layers:{pad:true,bass:'half',arp:'twinkle',perc:'toy'},energy:.55}),
  climax2:S(8,[0,1,[0,4],[4,0],0,2,4,0],{melody:['D2','D1'],literal:true,key:3,inst:{lead:'toyPiano',counter:'kazoo'},counterMelody:'K2',layers:{drums:'bounce',perc:'toy',bass:'bounce',chords:'pump',arp:'fast'},energy:1})},
 form:['intro','A','B','A','C','stop','A2','climax','breakdown','B2','C2','stop','climax2','B','A'],
 fx:{reverb:1.6,wet:.18,delayBeats:.5,delayWet:.14},seq:2,arpOct:12,leadOct:12,bassOct:-24,counterOct:0,levels:{counter:.8,arp:.7}});

// 16 · Jardín de Espinas — «Bruma entre Zarzas» (5.1): pieza contemplativa, etérea y
// aventurera en mi dórico. Colchones de cristal, kalimba y vibráfono, arpegios que
// envuelven, bajo ambiental y percusión delicada; las capas entran y salen con suavidad.
// Evoca la atmósfera de los niveles de zarzas sin tomar melodía, armonía ni arreglo de
// ninguna obra existente: todos los temas son originales.
SONGS[16]=finish({id:'thorns',get name(){return CS5.i18n.t("audio.songs.thorns.name")},get genre(){return CS5.i18n.t("audio.songs.thorns.genre")},tempo:92,meter:4,sub:4,swing:0,root:52,scale:SC.dorian,
 inst:{pad:'glassPad',chords:'vibes',arp:'celesta',bass:'sub',lead:'softLead',lead2:'vibes',counter:'choirSoft',fill:'chimes'},
 patterns:{drums:{
   soft:{softKick:'x-------x-------',brush:'----x-------x---',shaker:'--x---x---x---x-'},
   drift:{triangle:'x'+'-'.repeat(31),chimes:'x'+'-'.repeat(63)},
   walk:{softKick:'x-----x---x-----',brush:'----x-------x---',shaker:'x-x-x-x-x-x-x-x-',rim:'------------x---'}},
  bass:{drone:'R~~~~~~~R~~~~~~~',pulse:'R-----R-R-----5-',glide:'R~~~5~~~8~~~5~~~'},
  arp:{ripple:'0-1-2-3-4-3-2-1-',cascade:'7-5-4-2-3-1-0-1-',sixteen:'0123210123456543'},chords:{bloom:'x-------x-------',breath:'x---------------'}},
 motifs:{
  A1:mel('4 . . . . . 3 . 4 . . . 7 . . . | 6 . . . . . . . 3 . . . . . . . | 2 . . . . . 1 . 2 . . . 4 . . . | 3 . . . . . . . . . . . . . . .'),
  A2:mel('4 . . . . . 3 . 4 . . . 9 . . . | 8 . . . . . 7 . 6 . . . . . . . | 5 . . . . . 4 . 3 . . . 6 . . . | 4 . . . . . . . . . . . . . . .'),
  B1:mel('0 . 2 . 4 . 7 . . . 6 . 4 . . . | 2 . 4 . 6 . 9 . . . 8 . 6 . . . | 3 . 5 . 7 . 10 . . . 9 . 7 . . . | 6 . . . . . . . 3 . . . . . . .'),
  B2:mel('0 . 2 . 4 . 7 . . . 6 . 4 . . . | 1 . 3 . 5 . 8 . . . 7 . 5 . . . | 2 . 4 . 6 . 9 . . . 8 . 6 . . . | 4 . . . . . . . . . . . - . . .'),
  C1:mel('7 . . . 6 . . . 4 . . . 2 . . . | 3 . . . . . . . 1 . . . . . . . | 6 . . . 4 . . . 3 . . . 1 . . . | 2 . . . . . . . 0 . . . . . . .'),
  C2:mel('9 . . . 8 . . . 7 . . . 4 . . . | 5 . . . . . . . 3 . . . . . . . | 8 . . . 7 . . . 6 . . . 3 . . . | 4 . . . . . . . . . . . . . . .'),
  Z:mel('4 . . . . . . . . . . . . . . . | 3 . . . . . . . . . . . . . . . | 2 . . . . . . . . . . . . . . . | 1 . . . . . . . . . . . . . . .'),
  K1:mel('2 . . . . . . . . . . . . . . . | 1 . . . . . . . . . . . . . . . | -1 . . . . . . . . . . . . . . . | 0 . . . . . . . -1 . . . . . . .'),
  K2:mel('- - 7 . - - 7 . - - 6 . - - 6 . | - - 9 . - - 9 . - - 8 . - - 8 . | - - 10 . - - 10 . - - 9 . - - 9 . | - - 8 . - - 8 . - - 6 . - - 6 .')},
 sections:{intro:S(4,[0,6,2,3],{layers:{pad:true,arp:'ripple',perc:'drift'},energy:.2}),
  A:S(8,[0,6,2,3,0,6,[3,6],4],{melody:['A1','A2'],literal:true,counterMelody:'K1',layers:{pad:true,bass:'drone',arp:'ripple',perc:'soft'},energy:.5}),
  B:S(8,[0,2,3,6,0,1,2,4],{melody:['B1','B2'],literal:true,inst:{lead:'kalimba',counter:'celesta'},counterMelody:'K2',layers:{bass:'pulse',chords:'bloom',drums:'walk'},energy:.75}),
  C:S(8,[0,6,6,[2,0],0,3,6,4],{melody:['C1','C2'],literal:true,inst:{lead:'vibes'},layers:{pad:true,bass:'glide',perc:'drift',arp:'cascade'},energy:.45}),
  A2:S(8,[0,6,2,3,0,6,[3,6],4],{melody:['A2','A1'],literal:true,key:5,inst:{lead:'flute'},counterMelody:'K1',layers:{pad:true,bass:'pulse',arp:'ripple',perc:'soft',chords:'breath'},energy:.6}),
  bridge:S(8,[0,6,2,1,0,6,2,1],{melody:'Z',literal:true,inst:{lead:'choirSoft',arp:'glassPad'},layers:{pad:true,bass:'drone',arp:'sixteen',perc:'drift'},energy:.3}),
  climax:S(8,[0,2,3,6,0,1,2,4],{melody:['B1','B2'],literal:true,key:2,inst:{counter:'kalimba'},counterMelody:'K2',layers:{pad:true,bass:'pulse',chords:'bloom',arp:'sixteen',drums:'walk'},energy:1}),
  B2:S(8,[0,2,3,6,0,1,2,4],{melody:['B2','B1'],literal:true,key:-2,inst:{lead:'vibes',counter:'celesta'},counterMelody:'K2',layers:{bass:'glide',arp:'cascade',drums:'soft'},energy:.65})},
 form:['intro','A','B','C','A2','bridge','climax','breakdown','C','A','B2','climax'],
 fx:{reverb:5.2,wet:.46,delayBeats:.75,feedback:.45,delayWet:.3},seq:1,arpOct:12,leadOct:12,bassOct:-24,counterOct:0,padOct:0});

// Menú · «Himno de Cooper»: tema original heroico y juguetón (marcha orquestal-pop en Si bemol).
const MENU=finish({id:'menu',get name(){return CS5.i18n.t("audio.songs.menu.name")},get genre(){return CS5.i18n.t("audio.songs.menu.genre")},tempo:118,meter:4,sub:4,swing:0,root:58,scale:SC.ionian,gain:1.9,
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
