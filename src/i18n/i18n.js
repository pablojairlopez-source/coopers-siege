// Servicio de presentación: no escribe en partidas, guardados de campaña ni paquetes LAN.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{},KEY='coopers-siege-language-v1',SUPPORTED=['es-419','en-US'];
 const catalogs={},warnings=new Set(),cache=new Map(),listeners=new Set(),texts=new Map();
const normalize=lang=>/^en(?:-|$)/i.test(lang||'')?'en-US':'es-419';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let preferred=null;try{preferred=localStorage.getItem(KEY);}catch{}
let locale=SUPPORTED.includes(preferred)?preferred:normalize(navigator.language);
const warn=(key,detail)=>{const id=locale+':'+key+':'+detail;if(warnings.has(id))return;warnings.add(id);console.warn('[i18n]',id);};
function resolve(key,fallback){
 const cached=cache.get(key);if(cached!==undefined)return cached;
 let value=catalogs[locale]?.[key];
 if(value==null){warn(key,'falta traducción');value=catalogs['es-419']?.[key];if(value==null)return fallback??(locale==='en-US'?'Text unavailable':'Texto no disponible');}
 cache.set(key,value);return value;
}
function format(key,params={},fallback,html=false){
 let value=resolve(key,fallback);
 if(value&&typeof value==='object')value=value[new Intl.PluralRules(locale).select(Number(params.count)||0)]??value.other;
 return String(value??fallback??'').replace(/\{([\w]+)\}/g,(_,name)=>{
  let v=params[name];if(typeof v==='function')v=v();
  if(v==null){warn(key,'falta parámetro '+name);v='—';}
  return html?escape(v):String(v);
 });
}
const I={
 key:KEY,supported:SUPPORTED,catalogs,warnings,normalize,escape,
 get locale(){return locale;},
 register(lang,strings){if(!SUPPORTED.includes(lang))throw new Error('Código de idioma no compatible');catalogs[lang]=Object.freeze({...catalogs[lang],...strings});cache.clear();},
 t:(key,params,fallback)=>format(key,params,fallback,false),
 html:(key,params,fallback)=>format(key,params,fallback,true),
 textHTML:(key,params,fallback)=>escape(format(key,params,fallback,false)),
 number:(value,options)=>new Intl.NumberFormat(locale,options).format(value),
 characterName:c=>c.name,teamName:t=>t.name,
 onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},
 setLanguage(lang,{persist=true}={}){
  const next=SUPPORTED.includes(lang)?lang:normalize(lang),previous=locale;
  if(persist)try{localStorage.setItem(KEY,next);}catch{}
  if(next===locale){this.syncSelectors();return false;}
  locale=next;cache.clear();document.documentElement.lang=locale;
  this.applyDOM();this.syncSelectors();
  for(const fn of listeners)fn({locale,previous});
  window.dispatchEvent(new CustomEvent('cs5:languagechange',{detail:{locale,previous}}));return true;
 },
 applyDOM(root=document){
  for(const el of root.querySelectorAll('[data-i18n]'))el.textContent=this.t(el.dataset.i18n);
  for(const attr of ['title','aria-label','placeholder','alt','content'])for(const el of root.querySelectorAll('[data-i18n-'+attr+']'))el.setAttribute(attr,this.t(el.getAttribute('data-i18n-'+attr)));
 },
 selector(className=''){
  return `<label class="i18n-control ${className}"><span>IDIOMA / LANGUAGE</span><select data-language aria-label="Idioma / Language"><option value="es-419" ${locale==='es-419'?'selected':''}>Español (Latinoamérica)</option><option value="en-US" ${locale==='en-US'?'selected':''}>English</option></select></label>`;
 },
 syncSelectors(){for(const el of document.querySelectorAll('[data-language]'))el.value=locale;},
 bindText(el,value){if(!el)return;if(typeof value==='function'){texts.set(el,value);el.textContent=value();}else{texts.delete(el);el.textContent=value;}},
 refreshTexts(){for(const [el,fn]of texts){if(!el.isConnected){texts.delete(el);continue;}el.textContent=fn();}},
 // Descriptores únicamente en datos de presentación; IDs y valores de equilibrio quedan intactos.
 labels(object,fields){for(const [field,key] of Object.entries(fields))Object.defineProperty(object,field,{enumerable:true,configurable:true,get:()=>this.t(key)});return object;},
 story(schema){
  const result={},localized=new Map();
  const once=(id,build)=>{const key=locale+':'+id;if(!localized.has(key))localized.set(key,build());return localized.get(key);};
  for(const [id,lines] of Object.entries(schema.scenes))Object.defineProperty(result,id,{enumerable:true,get:()=>once(id,()=>lines.map(([who,expr,key])=>[who,expr,this.t(key)]))});
  Object.defineProperty(result,'credits',{enumerable:true,get:()=>once('credits',()=>schema.credits.map(row=>row.map(key=>this.t(key))))});
  Object.defineProperty(result,'bossPhase',{enumerable:true,get:()=>once('bossPhase',()=>Object.fromEntries(Object.entries(schema.bossPhase).map(([id,keys])=>[id,keys.map(key=>key?this.t(key):'')])))});
  Object.defineProperty(result,'schema',{value:schema});return result;
 }
};
document.documentElement.lang=locale;
document.addEventListener('change',event=>{if(event.target.matches('[data-language]'))I.setLanguage(event.target.value);});
CS5.i18n=I;
})();
