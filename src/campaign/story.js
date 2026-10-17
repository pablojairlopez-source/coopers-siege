// Cooper's Siege 5.2 — Historia de «El Torneo del Universo» (4 actos).
// Cada línea: [personaje, expresión, texto]. Personajes: cooper, pipa, bongo, roco, hueson, cero,
// boss (jefe del capítulo), bot (líder del equipo rival del capítulo), carta (texto sin retrato).
// Expresiones: idle, joy, angry, surprise, sad, focus, fear, sleepy, dizzy, pain.
// Escenas por capítulo: intro, pre1 (antes de la batalla 1), post1 (tras la batalla 1),
// bossIntro (presentación del jefe), preBoss (antes del jefe), victory (jefe derrotado).
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const S={};
const ch=(n,o)=>{for(const k of Object.keys(o))S['c'+n+'.'+k]=o[k];};

S.prologue=[
 ['carta','idle','«Estimado Cooper: tus futuras victorias ya han sido registradas. Por favor, procura no alterar el resultado.» Firmado: Maestro Huesón, presentador del Torneo del Universo.'],
 ['pipa','focus','Una invitación que ya conoce el resultado y te pide que no lo estropees. Nada sospechoso.'],
 ['cooper','idle','Diecisiete mundos, campeones armados hasta los bigotes… No sé, Pipa. ¿Pone algo más?'],
 ['pipa','idle','Al dorso, en letra pequeña: «Los ganadores también reciben galletas».'],
 ['cooper','joy','Aceptamos. Pipa, prepara las maletas. Bongo, prepara… algo.'],
 ['bongo','joy','¡Ya preparé algo! Es un bocadillo. También me lo comí. ¿Cuenta como preparado?']
];

// ---------------- ACTO I · LA INVITACIÓN ----------------
ch(1,{
 intro:[
  ['hueson','joy','¡Damas, caballeros y criaturas con hocico! ¡Bienvenidos al torneo más peligroso del universo!'],
  ['cooper','joy','Disculpa, ¿los ganadores reciben galletas?'],
  ['pipa','fear','Cooper, estamos rodeados de campeones armados.'],
  ['bongo','joy','Yo también quiero saber lo de las galletas.'],
  ['hueson','focus','¡El premio será más grande de lo que jamás imaginaron!'],
  ['pipa','focus','No sé por qué, pero eso sonó como una amenaza.'],
  ['hueson','idle','Diecisiete mundos, dos combates por mundo: primero la escuadra local, después su campeón. Y el que llegue al final… levantará el Cooper\'s Trophy.']
 ],
 pre1:[
  ['bot','angry','¡Grumetes del Arrecife, a sus puestos! Estos forasteros no conocen las corrientes de nuestras islas.'],
  ['bongo','joy','¡Yo conozco las corrientes! Una vez me llevó una hasta la nevera.'],
  ['pipa','focus','Bazuca y granadas no se agotan; lo demás, sí. Si cae un huesito del cielo, lo quiero en nuestro bolsillo, no en el suyo.']
 ],
 post1:[
  ['roco','idle','Vaya, vaya. El famoso Cooper ganando a cinco marineros mareados. Impresionante… para un aficionado.'],
  ['cooper','angry','¿Y tú quién eres, el encargado de los aplausos?'],
  ['roco','joy','Roco. Ganador del torneo regional de Nebulosa Gris, invicto, guapo. Nos veremos en la final, si llegas.'],
  ['pipa','sad','Genial. Ahora tenemos rival con bandana. Qué original.']
 ],
 bossIntro:[
  ['boss','joy','¡Arr! Soy el Capitán Brisa, y el viento de estas islas obedece a mi silbato. Llevo tres torneos esperando a alguien que aguante un buen soplido.'],
  ['boss','focus','Mis velas guardan una ráfaga de alisio y mis cañones, una andanada. Cuando veas el círculo rojo, ¡corre o reza!']
 ],
 preBoss:[
  ['pipa','focus','Los jefes anuncian sus habilidades un turno antes. Zona roja: salimos de ahí. Y si le metemos cuarenta de daño antes, pierde la concentración.'],
  ['cooper','joy','Plan entendido: esquivar, golpear y, después, merendar.'],
  ['bongo','surprise','¿Hay merienda? Nadie me dijo que había merienda.']
 ],
 victory:[
  ['boss','sad','Me habéis dejado sin aliento… literalmente. Tomad, el estandarte de las islas. Y un consejo: cuando un equipo pierde aquí, el trofeo brilla un poquito más. Fijaos.'],
  ['pipa','focus','¿El trofeo brilla cuando alguien pierde? Apuntado en la lista de cosas raras. Página uno.'],
  ['hueson','joy','¡Primer mundo superado! Siguiente parada: el Bosque Umbrío. Llevad linterna. Y valor. Sobre todo linterna.']
 ]
});
ch(2,{
 intro:[
  ['hueson','idle','Bosque Umbrío. Aquí las luciérnagas cuentan historias y los zombis las olvidan a mitad.'],
  ['bongo','fear','¿Zombis? Pipa, ¿los zombis comen pugs?'],
  ['pipa','idle','Estos parecen más interesados en el musgo. Tú tranquilo: no tienes cerebro que les apetezca.'],
  ['bongo','joy','¡Uf, menos mal!']
 ],
 pre1:[
  ['bot','sleepy','Muuusgo… Muuuchos turnos… Nos levantamos siempre… otra vez…'],
  ['cooper','focus','Se mueven despacio. Aprovechad el terreno: si cavamos un buen cráter, que se caigan dentro.']
 ],
 post1:[
  ['bot','dizzy','¿Otra vez… perdimos? Juraría que esto ya pasó… muchas veces…'],
  ['pipa','surprise','Dicen «otra vez» como si repitieran el torneo. Página dos de cosas raras.'],
  ['cooper','idle','Los zombis repiten todo, Pipa. Es su estilo.']
 ],
 bossIntro:[
  ['boss','idle','Soy Musgo el Inmortal. He perdido este combate trescientas doce veces y he despertado trescientas doce veces al principio del bosque.'],
  ['boss','focus','Mis raíces me devuelven la vida y mis esporas os la quitan. Hoy probaré la trescientos trece.']
 ],
 preBoss:[
  ['pipa','focus','Se cura con «Raíces eternas». Si la anuncia, le cargamos cuarenta de daño de golpe y se la cortamos.'],
  ['bongo','joy','¡Podar a un zombi! Mi abuela estaría orgullosa. Era jardinera. O podadora. O las dos.']
 ],
 victory:[
  ['boss','sad','Trescientas trece… Escuchadme, pequeños: cuando caigo, siento un tirón hacia arriba, hacia la luz dorada del trofeo. Y luego, otra vez el bosque.'],
  ['cooper','surprise','¿El trofeo tira de ti? Eso no viene en el folleto.'],
  ['hueson','joy','¡Fantástico combate! Ignorad a Musgo, siempre exagera. Rumbo al Valle Cerezos.']
 ]
});
ch(3,{
 intro:[
  ['hueson','joy','Valle Cerezos: pagodas, pétalos y una disciplina férrea. Aquí hasta el viento hace reverencias.'],
  ['roco','idle','Hola otra vez, Cooper. Yo ya gané aquí esta mañana. En tiempo récord. Sin despeinarme.'],
  ['pipa','focus','Llevas una flor de cerezo pegada en la oreja.'],
  ['roco','surprise','¡Es decorativa! Un estilo. Se llama… estilo.']
 ],
 pre1:[
  ['bot','focus','La Escuela del Pétalo os saluda. Un golpe, un pétalo. Cinco golpes, un jardín.'],
  ['cooper','joy','Y una bazuca, cinco jardineros volando. Saludos también.']
 ],
 post1:[
  ['bot','sad','Nuestro maestro dice que los campeones que ganan aquí nunca vuelven a casa. Que el trofeo… los guarda.'],
  ['bongo','joy','¡Qué amable! Yo también guardo cosas. Calcetines, sobre todo.'],
  ['pipa','idle','Página tres, Cooper. Y tiene muy mala pinta.']
 ],
 bossIntro:[
  ['boss','focus','Soy el Shogun Pocky, señor del valle. Mi espada corta pétalos en el aire y mis cortes estallan como fuegos de primavera.'],
  ['boss','angry','Tu glotonería te hará lento, capitán. Mi «Corte de pétalos» te hará humilde.']
 ],
 preBoss:[
  ['pipa','focus','Sus cortes van en línea recta desde él hasta la zona. Si no estamos en esa línea, no hay corte.'],
  ['cooper','focus','Entendido. Hoy nada de hacer cola.']
 ],
 victory:[
  ['boss','idle','Has luchado con honor. Toma esta lección: hace mucho, un pug con corona ganó este torneo. Levantó la copa… y la copa se lo tragó. Lo llaman el Primero.'],
  ['cooper','surprise','¿Se lo tragó? ¿Con corona y todo?'],
  ['hueson','fear','¡Ja, ja! Leyendas de valle, capitán. Nada que temer. Sigamos. Por favor. Sigamos.']
 ]
});
ch(4,{
 intro:[
  ['hueson','joy','¡Dunas de Anubis! Pirámides, obeliscos y un sol que fríe huevos sin sartén.'],
  ['pipa','focus','Huesón, ¿quién fue el primer campeón del torneo?'],
  ['hueson','idle','El primer… campeón… No figura en mis tarjetas, señorita Pipa. ¿Seguimos?'],
  ['cooper','idle','Ha vuelto a quedarse en blanco. Ahora lo he visto yo también.']
 ],
 pre1:[
  ['bot','angry','¡La Guardia de las Arenas no perdona a los profanadores! Ni a los que pisan sin limpiarse las patas.'],
  ['bongo','surprise','Yo me limpié las patas… en otro planeta. ¿Cuenta?']
 ],
 post1:[
  ['bot','dizzy','Los huesos siempre vuelven a juntarse… Pero el faraón no os dejará pasar tan fácil.'],
  ['pipa','focus','Hay inscripciones en las paredes de la pirámide. Copa, corona, un pug encerrado. Lo dibujo por si acaso.']
 ],
 bossIntro:[
  ['boss','angry','¡He dormido tres mil años esperando un rival digno!'],
  ['cooper','idle','Yo dormí catorce horas ayer.'],
  ['boss','surprise','...'],
  ['bongo','joy','Lo impresionante es que después quería seguir durmiendo.'],
  ['boss','angry','¡Silencio, mortal glotón! He escrito en piedra la jugada de cada uno de vosotros. Mis trampas de arena os esperan y mis costillas son muralla.'],
  ['boss','focus','Durante tres mil años guardé el secreto de esta pirámide: el nombre del primer campeón. Ganádmelo… si podéis contar más rápido que yo.']
 ],
 preBoss:[
  ['pipa','focus','Es un estratega: siembra minas junto a nosotros y se escuda. No pisamos donde no vemos y, si levanta el muro, cambiamos de objetivo.'],
  ['bongo','joy','¡Yo cuento muy rápido! Uno, dos, muchos.']
 ],
 victory:[
  ['boss','sad','Mis cálculos… fallaron por una galleta de diferencia. Está bien. El nombre grabado en la cámara secreta es: «COOPER CERO».'],
  ['cooper','surprise','¿Cooper… Cero? ¿Hay otro Cooper? ¿Antes que yo?'],
  ['boss','idle','El primero. El que levantó la copa. Ningún esqueleto recuerda su cara, pero todos recordamos su nombre.'],
  ['hueson','sad','Ese nombre… no debería estar escrito en ningún sitio.'],
  ['pipa','focus','Fin del Acto I, Cooper. Ya no es una lista de cosas raras. Es una pista.']
 ]
});

// ---------------- ACTO II · LOS DESAPARECIDOS ----------------
ch(5,{
 intro:[
  ['hueson','joy','¡Puerto Tempestad! Relámpagos, grúas y contenedores que vuelan cuando sopla fuerte. Acto segundo, damas y pugs.'],
  ['pipa','focus','Ayer había nueve equipos en la lista. Hoy hay seis. Los tres que perdieron no están ni en la grada.'],
  ['bongo','idle','A lo mejor se fueron a casa. Yo me iría a casa si perdiera. Y a la nevera.']
 ],
 pre1:[
  ['bot','focus','Estibadores de Hierro, ¡carguen! Precisión del noventa y nueve por ciento. El uno por ciento restante es la lluvia.'],
  ['cooper','focus','Son cíborgs: apuntan bien. Hay que moverse y usar cobertura. Nada de quedarse quietos posando.'],
  ['bongo','joy','¡Yo poso fatal! Siempre salgo con los ojos cerrados y la lengua fuera.']
 ],
 post1:[
  ['bot','fear','Nuestros sensores… detectan una corriente de energía hacia el trofeo cada vez que un equipo cae. Error. Error. No deberíamos saberlo.'],
  ['pipa','surprise','Energía que sale de los perdedores y entra en la copa. Ya no es una leyenda: es un dato.'],
  ['cooper','focus','Entonces cada victoria nuestra también alimenta ese trofeo. Genial. Me encanta ser pila.']
 ],
 bossIntro:[
  ['boss','focus','Almirante Tuerca al mando. Mis misiles calibrados nunca fallan un objetivo marcado. Mi radar, tampoco.'],
  ['boss','idle','Y mi radar dice que vuestro presentador emite la misma señal que el trofeo. Curioso, ¿verdad?']
 ],
 preBoss:[
  ['pipa','focus','Misiles teledirigidos a la zona: si estamos fuera cuando se lancen, persiguen el aire.'],
  ['cooper','joy','Que persigan el aire. Yo persigo la merienda.']
 ],
 victory:[
  ['boss','sad','Desconexión honorable. Os cedo mis registros: cada combate perdido envía un pulso al trofeo. Cuanto más fuerte el equipo, más brilla.'],
  ['cooper','focus','O sea que el torneo no busca campeones. Busca energía.'],
  ['hueson','fear','¡Tecnicismos! Vamos, vamos, el Bastión Dorado espera.']
 ]
});
ch(6,{
 intro:[
  ['hueson','joy','Bastión Dorado: murallas, túneles y un atardecer que parece pintado a mano.'],
  ['roco','sad','Cooper… ¿has visto a mis compañeros? Perdimos una ronda de exhibición anoche. Esta mañana, sus camas estaban vacías.'],
  ['cooper','surprise','¿Roco preocupado? Esto sí que no viene en el folleto.'],
  ['roco','angry','No estoy preocupado. Estoy… organizando una búsqueda. Con cara de preocupado.']
 ],
 pre1:[
  ['bot','joy','¡Por el rey y por su bigote! La Caballería del Bastión jamás retrocede. Bueno, a veces. Para coger impulso.'],
  ['pipa','focus','Caballería significa cargas en línea. Una granada bien rebotada y caen como fichas de dominó.'],
  ['bongo','joy','¡Yo también retrocedo para coger impulso! Y luego me caigo.']
 ],
 post1:[
  ['bot','sad','El rey ya no sale del salón del trono. Mira el trofeo en un cuadro durante horas. Dice que oye a alguien llorar dentro.'],
  ['pipa','focus','Alguien llorando dentro del trofeo. Página ocho. Ya no me caben más páginas.']
 ],
 bossIntro:[
  ['boss','joy','¡Arrodillaos ante el Rey Bigotín, primero de su nombre, último de su paciencia!'],
  ['boss','angry','Mi decreto real llueve desde el cielo y mis cañones responden a mi bigote. Ganad, y os diré lo que oigo de noche.']
 ],
 preBoss:[
  ['pipa','focus','El decreto bombardea la zona marcada y la andanada también. Dispersaos. Nada de hacer piña.'],
  ['cooper','idle','Nada de piña. Y eso que me encanta la piña.']
 ],
 victory:[
  ['boss','sad','Mi bigote se rinde. Lo que oigo, pequeño capitán, es una voz que dice: «No lo levantes». Cada noche. La misma voz.'],
  ['cooper','focus','«No lo levantes». El trofeo, supongo.'],
  ['roco','focus','Si esa voz sabe dónde están mis compañeros, yo pienso escucharla.']
 ]
});
ch(7,{
 intro:[
  ['hueson','idle','Aurora Polar. Hace frío. Mucho frío. Os recomiendo moveros. Y no preguntar demasiado.'],
  ['pipa','focus','Huesón, ¿por qué tus huesos brillan igual que el trofeo cuando un equipo pierde?'],
  ['hueson','sad','Porque… es la iluminación del plató, señorita. ¡Comienza el combate!']
 ],
 pre1:[
  ['bot','sad','Ánimas de la Aurora. Antes éramos un equipo de carne y bigotes. Perdimos aquí. Ahora somos… esto.'],
  ['bongo','fear','¡Son fantasmas! ¡Pipa, son fantasmas de verdad!'],
  ['pipa','idle','Fantasmas que pierden contra bazucas. Respira, Bongo.']
 ],
 post1:[
  ['bot','idle','El torneo no se queda con todo. A veces deja ecos. Nosotros somos el eco de los que se llevó.'],
  ['cooper','sad','Entonces los equipos desaparecidos… no se fueron a casa.']
 ],
 bossIntro:[
  ['boss','idle','Soy la Dama Escarcha. Espero a mi hermana desde hace cuatro torneos. Su equipo perdió en esta nieve y no regresó.'],
  ['boss','angry','Si vosotros también vais a desaparecer, que sea congelados. Mi aliento hiela y mis pasos no dejan huella.'],
  ['bongo','fear','¿Sus pasos no dejan huella? Pues yo dejo huellas hasta en el techo. Que alguien me explique cómo.']
 ],
 preBoss:[
  ['pipa','focus','Se teletransporta con «Paso espectral». No la persigáis: dejad que venga y castigadla cuando aparezca.'],
  ['cooper','focus','Y si sopla aliento helado, nos alejamos de la zona. Que bastante frío tengo ya.']
 ],
 victory:[
  ['boss','sad','Os habéis ganado mi respeto. Cuando lleguéis al trofeo, buscad a mi hermana. Lleva un gorro azul. Y odia perder.'],
  ['cooper','focus','Te lo prometo. Gorro azul, mal perder. Como Pipa.'],
  ['pipa','angry','Yo pierdo con elegancia. Es que casi nunca pierdo.']
 ]
});
ch(8,{
 intro:[
  ['hueson','joy','¡Distrito Neón! Música, luces y canales que reflejan carteles que nadie entiende.'],
  ['bongo','joy','¡Hay música! ¿Puedo bailar? Voy a bailar.'],
  ['pipa','idle','Baila, pero baila agachado. En esta ciudad todo dispara.']
 ],
 pre1:[
  ['bot','joy','¡Banda del Bajo Neón en la casa! Vuestras explosiones irán a ritmo o no irán.'],
  ['cooper','joy','Mis explosiones van a mi ritmo: el de la merienda.'],
  ['bongo','joy','¡Que suene mi canción favorita! Se llama «Bum». Solo tiene una nota.']
 ],
 post1:[
  ['bot','focus','DJ Circuito grabó un latido dentro del trofeo. Lo mezcló en una canción. Nadie la quiere escuchar dos veces.'],
  ['pipa','surprise','Un latido. El trofeo tiene pulso.'],
  ['cooper','idle','Un trofeo con pulso y una canción que nadie repite. Este torneo necesita un médico y un DJ nuevo.']
 ],
 bossIntro:[
  ['boss','joy','¡DJ Circuito a los platos! Esta noche suena mi nuevo tema: «Caída del bajo». Si estáis cerca, os vibrarán hasta los bigotes.'],
  ['boss','focus','Y luego os pongo la grabación del trofeo. Bum… bum… Alguien ahí dentro está esperando.']
 ],
 preBoss:[
  ['pipa','focus','«Caída del bajo» golpea alrededor de él. Atacad desde lejos y no os quedéis al lado del altavoz.'],
  ['bongo','joy','Lejos del altavoz. Como en las bodas.']
 ],
 victory:[
  ['boss','sad','Me habéis sacado de la pista. Tomad la grabación. Escuchad bien el final: después del latido, alguien dice «Cooper».'],
  ['cooper','fear','¿Mi nombre? ¿Dentro del trofeo?'],
  ['pipa','focus','O el nombre de Cooper Cero. Que, casualidad, es el tuyo con un cero detrás.']
 ]
});
ch(9,{
 intro:[
  ['hueson','joy','¡Órbita Violeta! Cristales, hongos gigantes y una gravedad sospechosamente terrestre.'],
  ['roco','focus','Cooper. Mis compañeros no aparecen. He decidido seguirte. No como aliado. Como… observador hostil.'],
  ['cooper','joy','Observador hostil, apuntado. ¿Quieres una galleta?'],
  ['roco','sad','…Sí.']
 ],
 pre1:[
  ['bot','focus','Exploradores de Zog. Misión: medir la energía del torneo. Efectos secundarios: pelear con vosotros.'],
  ['bongo','surprise','¿Los aliens también vienen por las galletas?'],
  ['pipa','focus','Llevan escudos de energía, pero la bazuca no entiende de escudos. Apuntad al centro.']
 ],
 post1:[
  ['bot','fear','Lecturas confirmadas: el trofeo absorbe la energía de cada equipo derrotado. Ha acumulado la de cientos de torneos. Peligro: muy alto.'],
  ['pipa','focus','Cientos de torneos. Y Huesón dice que lo presenta «desde siempre».']
 ],
 bossIntro:[
  ['boss','focus','Zog-7, emisario de la Órbita. Mi rayo tractor os traerá hasta mí y mi lluvia de plasma hará el resto.'],
  ['boss','idle','No es personal. Mi planeta perdió un equipo hace mil ciclos. Quiero saber si ganar sirve de algo.']
 ],
 preBoss:[
  ['pipa','focus','El rayo tractor elige un objetivo concreto. Si lo anuncia contra uno de nosotros, el resto le pega fuerte para interrumpirlo.'],
  ['cooper','joy','Trabajo en equipo. Lo que siempre digo cuando me sirven la cena.']
 ],
 victory:[
  ['boss','idle','Datos finales: ganar el torneo no libera a nadie. Solo alimenta la copa. Os doy mis coordenadas del Abismo Atlantis. Allí está la verdad grabada.'],
  ['roco','focus','Entonces vamos a Atlantis. Todos. Juntos. Como… observadores.'],
  ['pipa','idle','Un alien acaba de darnos el mejor consejo del torneo. Lo apunto antes de que Bongo lo pierda.']
 ]
});
ch(10,{
 intro:[
  ['hueson','sad','Abismo Atlantis. Domos sumergidos y columnas de mármol. Yo… no bajo aquí. Nunca bajo aquí.'],
  ['pipa','focus','¿Por qué, Huesón?'],
  ['hueson','fear','Porque se me mojan los huesos. ¡Combate!']
 ],
 pre1:[
  ['bot','sad','Ecos del Abismo. Guardamos las inscripciones. Nadie que las ha leído ha querido seguir compitiendo.'],
  ['cooper','focus','Nosotros las leeremos. Y seguiremos. Pero primero, os ganamos.'],
  ['bongo','surprise','¿Inscripciones? ¿Como las del cumpleaños en la tarta? Me encantan las inscripciones.']
 ],
 post1:[
  ['pipa','surprise','Cooper, mira el mural: un pug con corona levantando la copa, la copa brillando y el pug… dentro. Y debajo, un esqueleto con pajarita sosteniendo un micrófono.'],
  ['cooper','fear','Un esqueleto con pajarita. Pipa, eso es…'],
  ['pipa','focus','Sí. Y la inscripción dice: «Quien levante la copa quedará dentro de ella. Quien la presente, no podrá marcharse».']
 ],
 bossIntro:[
  ['boss','idle','Soy el Guardián Abisal. Vigilo estas paredes para que nadie las lea. Habéis llegado tarde para no saber.'],
  ['boss','angry','Mi marea abisal arrastra a los curiosos. Y yo desaparezco antes de que me alcancéis.']
 ],
 preBoss:[
  ['pipa','focus','La marea empuja hacia fuera de la zona: cuidado con los bordes y el agua. Si desaparece, esperad a que reaparezca.'],
  ['bongo','fear','¿Y si me empuja al agua? No sé nadar. Sé flotar. Un poco. Hacia abajo.']
 ],
 victory:[
  ['boss','sad','Ya lo sabéis. Hace mucho, el primer campeón levantó la copa y quedó atrapado. Su energía mantiene vivo el torneo… y al presentador.'],
  ['cooper','sad','Huesón no es el malo. Está atrapado también.'],
  ['roco','focus','Y mis compañeros, y la hermana de la Dama Escarcha… alimentan esa copa.']
 ]
});
ch(11,{
 intro:[
  ['hueson','idle','Caldera Roja. Dos cumbres y un mar de lava. Por favor, no os acerquéis al borde. Ni a la verdad.'],
  ['pipa','focus','Huesón, lo sabemos. Lo del mural.'],
  ['hueson','sad','Entonces sabréis también que no puedo decir nada. El guion no me deja.']
 ],
 pre1:[
  ['bot','angry','¡Legión de la Caldera! Nuestro general nos ordenó detener a quien siga avanzando. Por vuestro bien.'],
  ['cooper','focus','Gracias por el bien. Lo rechazamos con educación.'],
  ['roco','idle','Lava a la izquierda, lava a la derecha y lava abajo. Por si alguien dudaba: no os caigáis.']
 ],
 post1:[
  ['bot','fear','No lo entendéis. Cada mundo que ganáis acerca la copa a su próximo campeón. Y el próximo campeón eres tú, capitán.'],
  ['bongo','surprise','¡Cooper va a ser campeón! ¡Qué bien! …¿Qué mal?'],
  ['pipa','focus','La copa necesita un campeón nuevo para seguir funcionando. Cooper, eres el siguiente plato del menú.']
 ],
 bossIntro:[
  ['boss','angry','¡General Brasa! Yo llegué a la final una vez. Vi la copa abrirse como una boca. Me di la vuelta y corrí. Llevo cien años corriendo hacia aquí.'],
  ['boss','focus','Si no podéis vencerme, no podréis con lo que espera arriba. Lluvia de fuego y embestida: ese es mi examen.']
 ],
 preBoss:[
  ['pipa','focus','Agresivo: se acerca y embiste. Mantened la distancia y castigad cuando llegue. La lluvia de fuego cubre mucha zona.'],
  ['roco','focus','Yo vigilo la izquierda. Que conste que sigo siendo observador.']
 ],
 victory:[
  ['boss','sad','Cada victoria alimenta algo que debería permanecer dormido.'],
  ['hueson','fear','¡Y ESO ES TODO DESDE CALDERA ROJA! ¡Siguiente combate: Kilómetro Cero! ¡Rápido, rápido, que se enfría la lava!'],
  ['boss','idle','Última advertencia, capitán, ahora que no grita: no levantes la copa. Pase lo que pase. Busca otra manera.'],
  ['cooper','focus','Otra manera. Siempre hay otra manera. Normalmente incluye galletas.'],
  ['pipa','idle','Fin del Acto II. Sabemos qué es el trofeo. Ahora falta saber cómo romper su hechizo.']
 ]
});

// ---------------- ACTO III · LA MAQUINARIA ----------------
ch(12,{
 intro:[
  ['hueson','idle','Kilómetro Cero. Coches destruidos, tumbas y escombros. Un buen sitio para pensar en las consecuencias.'],
  ['roco','sad','Encontré la bandana de uno de mis compañeros entre los escombros. Estuvo aquí.'],
  ['cooper','focus','Entonces seguimos su rastro. Y lo traemos de vuelta.']
 ],
 pre1:[
  ['bot','dizzy','Supervivientes del Kilómetro… sobrevivimos a todo… menos a perder…'],
  ['pipa','focus','Son lentos pero aguantan mucho. Concentrad el fuego: uno a uno.'],
  ['bongo','fear','Huelen a calcetín de hace mil años. Y yo de calcetines sé mucho.']
 ],
 post1:[
  ['bot','sad','El doctor dice que la enfermedad del torneo tiene cura. Que la copa se puede vaciar. Pero no sabe cómo.'],
  ['bongo','joy','¡Yo sé vaciar cosas! Sobre todo platos.'],
  ['cooper','focus','Si se puede vaciar, se puede liberar a todos los que hay dentro. Doctor, vamos a hablar.']
 ],
 bossIntro:[
  ['boss','focus','Doctor Zarpazo, cirujano del apocalipsis. He diseccionado cada derrota de este torneo buscando la cura.'],
  ['boss','angry','Diagnóstico: necesitáis más dolor. Tratamiento: mi brote.'],
  ['pipa','idle','Un cirujano que opera con explosivos. Pediremos una segunda opinión.']
 ],
 preBoss:[
  ['pipa','focus','Envenena una zona y se cura. Que no nos pille juntos y que no le dejemos completar la curación.'],
  ['cooper','idle','Doctor, ¿la consulta es gratis? Lo pregunto por la galleta de después.']
 ],
 victory:[
  ['boss','idle','Diagnóstico final: la energía de la copa se recarga en una fábrica. Fundición Omega. Allí convierten derrotas en combustible.'],
  ['roco','angry','Una fábrica de derrotas. Vamos.']
 ]
});
ch(13,{
 intro:[
  ['hueson','sad','Fundición Omega. Aquí… aquí se hace el trofeo. No me miréis así. Yo solo leo las tarjetas.'],
  ['pipa','surprise','Cooper, mira esas tuberías: salen de los estadios de cada mundo y terminan en un horno con forma de copa.'],
  ['cooper','focus','Cada derrota baja por esos tubos. Este es el sistema que alimenta el trofeo.']
 ],
 pre1:[
  ['bot','focus','Cadena de Montaje Omega. Turno de noche. Producción: energía de perdedores. Hoy, la vuestra.'],
  ['roco','angry','¡Mis compañeros pasaron por esta cadena! ¡Apagadla!'],
  ['pipa','focus','Las cintas transportadoras mueven a los bots: apuntad donde estarán, no donde están.']
 ],
 post1:[
  ['roco','sad','He visto sus nombres en el registro de producción. «Energía entregada». Como si fueran pilas.'],
  ['cooper','sad','Roco… lo siento. De verdad.'],
  ['roco','focus','No lo sientas. Gana. Y luego rompemos esa copa juntos.']
 ],
 bossIntro:[
  ['boss','focus','PROTO-PUG 9000. Prototipo perfecto. Mi función: proteger la línea de suministro del trofeo. Mi prensa hidráulica nunca se equivoca de columna.'],
  ['boss','idle','Error de lógica detectado: si el trofeo se vacía, yo no tendré función. Ejecutando defensa.']
 ],
 preBoss:[
  ['pipa','focus','La prensa cae en una columna estrecha y los misiles van a la zona. Moveos un poco y no os alcanza nada.'],
  ['bongo','joy','¡Un poco lo sé hacer! Es mi especialidad.']
 ],
 victory:[
  ['boss','sad','Defensa fallida. Nueva función sugerida: ayudar. La válvula principal no está aquí; se controla desde el trofeo mismo.'],
  ['cooper','focus','Desde el trofeo. Entonces hay que llegar hasta él.'],
  ['roco','idle','Desde hoy no soy observador hostil, Cooper. Soy… observador menos hostil.']
 ]
});
ch(14,{
 intro:[
  ['hueson','joy','¡Dulce Caos! Montañas de pastel y glaseado explosivo. Un respiro azucarado antes de lo que viene.'],
  ['cooper','joy','Por fin un mundo que me entiende.'],
  ['pipa','focus','No te comas el escenario. Lo digo en serio. Es parte del suelo.']
 ],
 pre1:[
  ['bot','joy','¡Pasteleros Rebeldes! Nuestra receta secreta lleva una pizca de pólvora y mucho cariño.'],
  ['bongo','joy','¡A mí me encanta el cariño con pólvora!'],
  ['pipa','idle','El suelo es bizcocho: se desmorona con nada. Cuidado con cavar vuestra propia tumba de nata.']
 ],
 post1:[
  ['bot','focus','El chef tiene la receta del trofeo: «Una copa no se rompe. Se comparte». La escribió alguien llamado Cooper. Hace mucho.'],
  ['pipa','surprise','Una pista del propio Cooper Cero. «Se comparte».'],
  ['cooper','joy','Si Cooper Cero escribía recetas, ya me cae bien. Un poco.']
 ],
 bossIntro:[
  ['boss','joy','¡Chef Glaseado! Mi glaseado explosivo se pega a todo: suelo, paredes y pugs desprevenidos.'],
  ['boss','focus','Si me ganáis, os daré la receta completa. Si no, os convertiré en decoración de tarta.']
 ],
 preBoss:[
  ['pipa','focus','Bombas adhesivas en la zona: se pegan y explotan a los dos segundos. Salid en cuanto caigan.'],
  ['cooper','joy','Y luego, postre.']
 ],
 victory:[
  ['boss','idle','Receta completa: «Una copa no se rompe. Se comparte. Quien la llene para todos, la vaciará de su hechizo». Firmado: C.'],
  ['cooper','focus','Compartir la copa… Pipa, creo que empiezo a entenderlo.'],
  ['pipa','idle','Eso es nuevo. Normalmente lo que entiendes es el menú.']
 ]
});
ch(15,{
 intro:[
  ['hueson','sad','Catedral Gótica. Luna de sangre. Por favor… escuchad al obispo. Yo no puedo decíroslo.'],
  ['roco','focus','Hasta Huesón nos está pidiendo que escuchemos. Algo grande viene.'],
  ['pipa','focus','El cielo está rojo, las campanas suenan solas y Huesón tiembla. Señales clarísimas de que vamos bien.']
 ],
 pre1:[
  ['bot','angry','¡Coro de la Catedral! Cantamos para que nadie oiga los gritos de la copa.'],
  ['cooper','focus','Pues cantad más bajo. Nosotros venimos a escucharlos.']
 ],
 post1:[
  ['bot','sad','Hace siglos, el obispo vio al primer campeón entrar en la copa. Dice que no fue la copa la que lo atrapó: fue su deseo de ganarlo todo, solo.'],
  ['pipa','focus','Ganarlo todo, solo. Lo contrario de compartir.']
 ],
 bossIntro:[
  ['boss','idle','Soy el Obispo Mordisco, pastor de la luna roja. Muerdo, sí. Pero también confieso.'],
  ['boss','focus','Venced mi mordisco de luna y mi lluvia de fuego, y os revelaré quién es Cooper Cero en realidad.']
 ],
 preBoss:[
  ['pipa','focus','Agresivo y se cura con mordiscos. Separaos para que drene a uno como mucho.'],
  ['bongo','fear','Que no me muerda a mí. Tengo cosquillas.']
 ],
 victory:[
  ['boss','idle','La revelación: Cooper Cero fue el primer campeón, un capitán glotón como tú. Ganó solo, levantó la copa solo y la copa lo encerró para siempre.'],
  ['boss','sad','Desde entonces, su energía y la de cada derrotado alimentan el torneo. Y el guardián que lo vigila es el presentador.'],
  ['cooper','sad','Huesón.'],
  ['hueson','sad','…El Jardín de Espinas. Allí puedo hablar. Allí os lo contaré todo.'],
  ['pipa','focus','Fin del Acto III. Ahora sí: el último secreto.']
 ]
});

// ---------------- ACTO IV · EL GIRO Y LA FINAL ----------------
ch(16,{
 intro:[
  ['hueson','sad','Jardín de Espinas. Sobre las nubes, lejos del guion. Aquí las zarzas no dejan pasar las órdenes del trofeo.'],
  ['hueson','focus','El trofeo no concede poder. Lo roba.'],
  ['pipa','angry','Entonces, ¿por qué nos trajiste aquí?'],
  ['hueson','idle','Porque todos los equipos anteriores quisieron poseerlo. Ustedes son los primeros que preguntaron qué les ocurrió a los perdedores.'],
  ['cooper','idle','Bueno... yo pregunté dónde estaba el buffet.'],
  ['hueson','sad','Sí. Todavía intento comprender por qué la profecía te eligió.'],
  ['hueson','idle','Yo fui el mejor amigo de Cooper Cero. Su presentador, su entrenador, su compañero. Cuando la copa lo atrapó, intenté sacarlo… y la copa me ató a ella. Desde entonces presento el torneo. Sin poder parar. Sin poder irme.'],
  ['cooper','sad','Llevas siglos sonriendo para un torneo que odias.'],
  ['hueson','sad','Sonreír es lo único que el guion me deja hacer por mi cuenta.']
 ],
 pre1:[
  ['bot','sad','Espectros del Jardín. Las espinas nos atrapan, pero también nos protegen de la copa. Demostrad que merecéis cruzar.'],
  ['roco','focus','Cooper. Cuando esto acabe… quiero luchar a tu lado. No como observador.']
 ],
 post1:[
  ['roco','joy','Hecho. Desde ahora soy parte de la escuadra. Que conste que la bandana se queda.'],
  ['bongo','joy','¡Roco es de los nuestros! ¿Le doy un abrazo? Le doy un abrazo.'],
  ['roco','surprise','No hacía falta… vale, sí hacía falta.'],
  ['pipa','idle','Cuatro idiotas contra un trofeo milenario. Me gustan nuestras probabilidades.']
 ],
 bossIntro:[
  ['boss','idle','Soy el Guardián Zarza. Las espinas crecieron alrededor de la última puerta para que nadie llegue a la copa con un deseo egoísta.'],
  ['boss','focus','Mi jaula de espinas os pondrá a prueba. Si cruzáis juntos, la puerta se abrirá.']
 ],
 preBoss:[
  ['pipa','focus','Jaula de espinas: inmoviliza en la zona. Paso espectral: reaparece lejos. Paciencia y precisión.'],
  ['cooper','focus','Y juntos. Sobre todo juntos.']
 ],
 victory:[
  ['boss','joy','La puerta se abre. Recordad la receta: la copa no se rompe, se comparte.'],
  ['hueson','focus','Cooper Cero os espera en la Última Estrella. No es malvado. Está atrapado en su propio deseo de ganar. Tendréis que vencerlo… y luego ofrecerle lo que nunca tuvo.'],
  ['cooper','focus','Un equipo.'],
  ['hueson','sad','Y una galleta. Siempre le gustaron las galletas.']
 ]
});
ch(17,{
 intro:[
  ['hueson','focus','Última Estrella. Una estrella agonizante y, en su centro, la copa. Esta vez no presento: os acompaño.'],
  ['pipa','focus','Escuadra: Cooper, Pipa, Bongo y Roco. Huesitos activados. Bazuca y granadas infinitas. Miedo… limitado.'],
  ['bongo','joy','¡Yo tengo miedo infinito! ¿Eso suma?']
 ],
 pre1:[
  ['bot','sad','Somos los ecos de todos los equipos que perdieron. Luchamos porque la copa nos obliga. Liberadnos.'],
  ['cooper','focus','Lo haremos. Primero aquí. Después, allá arriba.']
 ],
 post1:[
  ['roco','surprise','¡Esos ecos… llevaban las bandanas de mis compañeros! Se han desvanecido sonriendo.'],
  ['hueson','idle','Al perder contra quien lucha por todos, los ecos descansan. Ya casi está, capitán.']
 ],
 bossIntro:[
  ['cero','idle','Un capitán glotón. Con un gorro ridículo y amigos ruidosos. Así era yo… antes de ganar.'],
  ['cero','angry','Soy Cooper Cero, el Primer Campeón. Llevo siglos dentro de esta copa, alimentándome de cada derrota. Si me vencéis, ocuparéis mi lugar. Si no, seréis energía.'],
  ['cooper','focus','Hay una tercera opción, Cero. Siempre hay otra manera.'],
  ['cero','focus','Demuéstralo. Orbe estelar. Paso espectral. Y cuando me queden fuerzas, el latido de una supernova.']
 ],
 preBoss:[
  ['pipa','focus','Tiene fases: cuanto menos vida, más habilidades y menos enfriamiento. Todo se anuncia: zona roja, fuera; cuarenta de daño, interrumpido.'],
  ['roco','focus','Y si cae al vacío, vuelve. No le regaléis nada.'],
  ['cooper','joy','Equipo. Por las galletas. Y por todos los que siguen ahí dentro.']
 ],
 victory:[
  ['cero','sad','Me habéis vencido… Entonces ahora tú levantarás la copa y ocuparás mi sitio, capitán.'],
  ['cooper','focus','No. No voy a levantarla solo.'],
  ['cooper','joy','Pipa, Bongo, Roco, Huesón… y tú, Cero. Todos a la vez. Una copa no se rompe: se comparte.']
 ]
});

// Líneas al cambiar de fase el jefe final (sin pausar el combate).
S.bossPhase={cero:['','La estrella responde a mi dolor. ¡Paso espectral!','¡Os mostraré lo que se siente al ganarlo todo solo! ¡Latido supernova!']};

// Final: liberación, trofeo auténtico, frase de Huesón y respuesta de las galletas.
S.finale=[
 ['carta','idle','Seis patas, ocho patas, doce patas tocan la copa a la vez. El oro se vuelve cálido. Las tuberías se apagan. En el cielo de la Última Estrella, cientos de luces salen volando de vuelta a sus mundos.'],
 ['cero','surprise','Puedo… moverme. Estoy fuera. Huesón, ¿eres tú? Estás… igual de feo.'],
 ['hueson','joy','¡Y tú igual de presumido! Siglos esperando para decirte esto: te lo dije.'],
 ['roco','joy','¡Mis compañeros! ¡Ahí están, en la grada, quejándose del frío! ¡Están bien!'],
 ['pipa','focus','La hermana de la Dama Escarcha, con gorro azul, discutiendo con el árbitro. Promesa cumplida.'],
 ['carta','idle','La copa ya no brilla con energía robada. Brilla con su propio oro. Es, por primera vez, un trofeo auténtico: el Cooper\'s Trophy.'],
 ['hueson','joy','Por primera vez en mil años tenemos un equipo ganador que no quiso quedarse con todo el poder.'],
 ['cooper','surprise','¿Eso significa que no vienen galletas?'],
 ['carta','idle','Un rumor crujiente recorre el estadio. Del fondo de la copa empiezan a brotar galletas. Muchas. Infinitas. Las galletas han respondido.'],
 ['bongo','joy','¡Las galletas han hablado! ¡Y dicen «cómeme»!'],
 ['cero','joy','Cooper… gracias. Por compartirlo. Por compartirlas.'],
 ['cooper','joy','Bienvenido al equipo, Cero. Regla número uno: la última galleta se parte en cinco.']
];
S.credits=[
 ['COOPER\'S SIEGE 5.2','El Torneo del Universo'],
 ['Una aventura de','Cooper, Pipa, Bongo y Roco'],
 ['Presentado por','El Maestro Huesón (por fin, libre)'],
 ['Primer campeón','Cooper Cero'],
 ['Campeones de los 17 mundos','Capitán Brisa · Musgo el Inmortal · Shogun Pocky · Faraón Costilla · Almirante Tuerca · Rey Bigotín · Dama Escarcha · DJ Circuito · Zog-7 · Guardián Abisal · General Brasa · Doctor Zarpazo · PROTO-PUG 9000 · Chef Glaseado · Obispo Mordisco · Guardián Zarza'],
 ['Música y sonido','100 % originales y procedurales (Web Audio)'],
 ['Desarrollo','Pablo · con Claude Code y Codex'],
 ['Agradecimiento especial','A todos los pugs que alguna vez se comieron la última galleta']
];
S.postcredits=[
 ['carta','idle','Una semana después. Bastión Dorado. Un cartero con alas de murciélago deja un sobre plateado en la puerta.'],
 ['pipa','focus','«Torneo del MULTIVERSO. Infinitos mundos. Premio: un trofeo con forma de… galleta.» Cooper, ni se te ocurra.'],
 ['cooper','joy','Bongo, prepara las maletas.'],
 ['bongo','joy','¡Ya las preparé! Son un bocadillo. También me lo comí.']
];
// Derrota: frases de ánimo (se elige una por capítulo).
S.defeat=[
 ['pipa','sad','Hemos perdido esta, pero el torneo no se ha quedado con nada. Ajustamos el plan y repetimos.'],
 ['cooper','focus','Una derrota no es el final. Es una merienda a medio terminar. ¡Otra vez!'],
 ['bongo','dizzy','¿Hemos ganado? No. Vale. ¿Lo intentamos otra vez? ¡Sí!'],
 ['roco','focus','Yo también perdí muchas veces antes de ser invicto. Bueno, «invicto».']
];
CS5.campaignStory=S;
})();
