// Pantalla inicial de idioma: selección explícita en cada carga; no toca la campaña.
(function(){
'use strict';
const I=window.CS5?.i18n,gate=document.getElementById('languageWelcome');
if(!I||!gate)return;
const choices=Array.from(gate.querySelectorAll('[data-welcome-language]'));
const confirm=gate.querySelector('#languageWelcomeContinue');
const note=gate.querySelector('#languageWelcomeNote');
let selected=I.locale,finished=false;
const gated=[];
for(const el of Array.from(document.body.children)){
 if(el===gate||el.tagName==='SCRIPT')continue;
 gated.push({el,wasInert:el.inert});
 el.inert=true;
}
function label(){
 for(const btn of choices)btn.setAttribute('aria-pressed',String(btn.dataset.welcomeLanguage===selected));
 confirm.textContent=I.catalogs[selected]?.['startup.continue']||(selected==='en-US'?'CONTINUE  →':'CONTINUAR  →');
 note.textContent=I.catalogs[selected]?.['startup.note']||(selected==='en-US'?'You can change the language later in settings.':'Puedes cambiar el idioma más adelante en las opciones.');
}
function select(lang,focus=false){
 if(finished||!I.supported.includes(lang))return;
 selected=lang;label();
 if(focus)choices.find(btn=>btn.dataset.welcomeLanguage===lang)?.focus({preventScroll:true});
}
function finish(){
 if(finished)return;
 finished=true;
 I.setLanguage(selected);
 for(const {el,wasInert} of gated)el.inert=wasInert;
 document.documentElement.classList.remove('language-startup-pending');
 gate.hidden=true;
 const destination=document.getElementById('startButton')||document.getElementById('menu');
 destination?.focus?.({preventScroll:true});
}
for(const btn of choices)btn.addEventListener('click',()=>select(btn.dataset.welcomeLanguage));
confirm.addEventListener('click',finish);
// Los manejadores generales de teclado del combate no deben recibir teclas del diálogo.
function interceptKey(e){
 if(finished)return;
 if(e.type==='keydown'){
  if(e.key==='Escape'){e.preventDefault();}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();select(selected==='es-419'?'en-US':'es-419',true);
  }
  if(e.key==='Tab'){
   const focusable=[...choices,confirm],current=focusable.indexOf(document.activeElement);
   if((e.shiftKey&&current===0)||(!e.shiftKey&&current===focusable.length-1)){
    e.preventDefault();focusable[e.shiftKey?focusable.length-1:0].focus();
   }
  }
 }
}
document.addEventListener('keydown',interceptKey,true);
// Detener la propagación desde el propio diálogo conserva la activación nativa
// con Enter y Espacio, sin entregar esas teclas a los controles del combate.
for(const type of ['keydown','keyup','pointerdown','pointerup','click','touchstart','touchend'])gate.addEventListener(type,e=>e.stopPropagation());
// Evita que un clic muy rápido en Continuar pueda pasar al menú que queda debajo.
gate.addEventListener('click',e=>e.stopPropagation());
label();
choices.find(btn=>btn.dataset.welcomeLanguage===selected)?.focus({preventScroll:true});
// API de inspección sin acceso a inventarios, partidas ni guardados.
window.CS5.languageWelcome={get open(){return !finished;},get selected(){return selected;}};
})();
