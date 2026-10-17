// Contrato del servicio, sin cargar ni modificar el motor de combate.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function boot(language='es-CL',saved=null,blocked=false){
 const values=new Map(saved?[['coopers-siege-language-v1',saved]]:[]),events=[],messages=[];
 const context=vm.createContext({Intl,Map,Set,Object,String,Number,RegExp,console:{warn:(...args)=>messages.push(args)},navigator:{language},localStorage:{getItem:k=>{if(blocked)throw Error('bloqueado');return values.get(k);},setItem:(k,v)=>{if(blocked)throw Error('bloqueado');values.set(k,v);}},document:{documentElement:{},addEventListener(){},querySelectorAll:()=>[]},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}});
 context.window=context;context.dispatchEvent=e=>events.push(e);
 for(const f of ['i18n','es-419','en-US'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/i18n/'+f+'.js'),'utf8'),context);
 return {I:context.CS5.i18n,values,events,messages};
}
for(const [browser,expected] of [['es-MX','es-419'],['es-ES','es-419'],['en-GB','en-US'],['en-US','en-US'],['fr-FR','es-419']])assert.equal(boot(browser).I.locale,expected);
assert.equal(boot('en-US','es-419').I.locale,'es-419');assert.equal(boot('es-CL','en-US').I.locale,'en-US');
const {I,values,events,messages}=boot();let changes=0;I.onChange(()=>changes++);
assert.equal(I.t('common.items',{count:1}),'1 elemento');assert.equal(I.t('common.items',{count:2}),'2 elementos');
assert.equal(I.html('common.items',{count:'<img onerror=alert(1)>'}),'&lt;img onerror=alert(1)&gt; elementos');
assert.ok(!I.t('common.items',{}).includes('{count}'));assert.equal(messages.length,1);
I.setLanguage('en-US');assert.equal(I.t('common.items',{count:1}),'1 item');assert.equal(I.t('common.items',{count:3}),'3 items');assert.equal(values.get(I.key),'en-US');assert.equal(changes,1);assert.equal(events.length,1);
I.setLanguage('en-US');assert.equal(changes,1);I.setLanguage('xx');assert.equal(I.locale,'es-419');
assert.equal(I.t('unknown',{},'Respaldo'),'Respaldo');I.t('unknown',{},'Respaldo');assert.equal(messages.length,2);
assert.doesNotThrow(()=>boot('en-US',null,true).I.setLanguage('es-419'));
console.log('✔ i18n central: detección, preferencia independiente, parámetros seguros, plurales, respaldo y cambio sin motor');
