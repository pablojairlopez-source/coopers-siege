// Integridad editorial y técnica de todos los recursos locales.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const catalogs={};const ctx={CS5:{i18n:{register:(l,d)=>Object.assign(catalogs[l]??={},d)}}};
for(const file of ['es-419','en-US','story-es-419','story-en-US'])vm.runInNewContext(fs.readFileSync('src/i18n/'+file+'.js','utf8'),ctx);
const es=catalogs['es-419'],en=catalogs['en-US'];
assert.deepEqual(Object.keys(es).sort(),Object.keys(en).sort());
const params=s=>[...String(s).matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
for(const [key,value]of Object.entries(es)){
 assert.ok(value&&en[key],key+' no puede estar vacío');
 if(typeof value==='object'){assert.deepEqual(Object.keys(value).sort(),Object.keys(en[key]).sort(),key+' plurales');for(const form of Object.keys(value)){assert.ok(value[form]&&en[key][form]);assert.deepEqual(params(value[form]),params(en[key][form]));}}
 if(typeof value==='string'){
  assert.deepEqual(params(value),params(en[key]),key+' parámetros');
  assert.ok(!/(?<!\p{L})(vosotros|vuestro|vuestra|habéis|tenéis|podéis|os|nevera|bocadillo|ratón|ordenador|vale)(?!\p{L})/iu.test(value),key+' regionalismo: '+value);
  assert.ok(!/CS5EXPR|\$\{|undefined|\[object Object\]/.test(value+en[key]),key+' residuo técnico');
 }
}
// El orden, hablantes, expresiones y escenas vienen de la versión publicada 5.2.
const original=cp.execFileSync('git',['show','0f8cc74:src/campaign/story.js'],{encoding:'utf8'}),old={CS5:{}};vm.runInNewContext(original,{window:old});
let schema;vm.runInNewContext(fs.readFileSync('src/campaign/story.js','utf8'),{CS5:{i18n:{story:s=>(schema=s,{})}}});
const oldStory=old.CS5.campaignStory;
assert.deepEqual(Object.keys(schema.scenes).sort(),Object.keys(oldStory).filter(k=>Array.isArray(oldStory[k])&&!['credits','bossPhase'].includes(k)).sort());
let rows=0;
for(const [id,lines]of Object.entries(schema.scenes)){
 assert.equal(lines.length,oldStory[id].length,id);
 lines.forEach(([who,expr,key],i)=>{assert.equal(who,oldStory[id][i][0]);assert.equal(expr,oldStory[id][i][1]);assert.ok(es[key]&&en[key],key);rows++;});
}
assert.equal(rows,319);assert.equal(Object.keys(schema.scenes).length,106);
console.log(`✔ Catálogos: ${Object.keys(es).length} claves por idioma, 106 escenas y ${rows} intervenciones; paridad, parámetros, es-419 y estructura 5.2`);
