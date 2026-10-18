// Herramienta editorial: aplica pares revisados a catálogos, nunca se carga en el juego.
const fs=require('node:fs'),vm=require('node:vm');
const catalogs={};const CS5={i18n:{register:(lang,data)=>Object.assign(catalogs[lang]??={},data)}};
for(const file of ['es-419','en-US'])vm.runInNewContext(fs.readFileSync('src/i18n/'+file+'.js','utf8'),{CS5});
const pairs=new Map();for(const name of fs.readdirSync('tools/i18n-editorial').filter(x=>x.endsWith('.txt'))){
 for(const line of fs.readFileSync('tools/i18n-editorial/'+name,'utf8').split(/\r?\n/)){if(!line||line.startsWith('#'))continue;const at=line.indexOf('|');if(at<0)throw Error(name+': '+line);pairs.set(line.slice(0,at),line.slice(at+1));}
}
const en={...catalogs['en-US']},missing=[];
for(const [key,value]of Object.entries(catalogs['es-419'])){if(key in en)continue;if(pairs.has(value))en[key]=pairs.get(value);else missing.push([key,value]);}
const revisions=JSON.parse(fs.readFileSync('tools/i18n-editorial/es-revision.json','utf8'));
for(const file of ['es-419','story-es-419']){
 const data={};vm.runInNewContext(fs.readFileSync('src/i18n/'+file+'.js','utf8'),{CS5:{i18n:{register:(lang,values)=>Object.assign(data,values)}}});
 for(const key of Object.keys(data)){
  if(revisions[key])data[key]=revisions[key];
  if(typeof data[key]==='string'&&!key.startsWith('story.'))data[key]=data[key].replace(/ratón/g,'mouse').replace(/Pulsa/g,'Presiona').replace(/pulsa/g,'presiona').replace(/Añade/g,'Agrega').replace(/añade/g,'agrega').replace(/loop continuo/g,'bucle continuo').replace(/Link/g,'Enlace').replace(/Offline Sin Internet/g,'sin conexión a internet').replace(/Rúter/g,'Router');
 }
 fs.writeFileSync('src/i18n/'+file+'.js',"// Textos revisados: español latinoamericano neutro.\r\nCS5.i18n.register('es-419',"+JSON.stringify(data,null,1).replace(/\n/g,'\r\n')+');\r\n');
}
fs.writeFileSync('src/i18n/en-US.js',"// Interfaz y datos: inglés adaptado.\r\nCS5.i18n.register('en-US',"+JSON.stringify(en,null,1).replace(/\n/g,'\r\n')+');\r\n');
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/i18n-pending.json',JSON.stringify(missing,null,1));console.log({translated:Object.keys(en).length,pending:missing.length});
