// Migra la estructura narrativa, preservando escenas, índices, hablantes y expresiones.
const fs=require('node:fs'),vm=require('node:vm');
if(!process.argv.includes('--apply'))throw Error('Requiere --apply; migración inicial de story.js');
const file='src/campaign/story.js',source=fs.readFileSync(file,'utf8');if(source.includes('CS5.i18n.story('))throw Error('Historia ya migrada');
const ctx={window:{CS5:{}}};vm.runInNewContext(source,ctx);const S=ctx.window.CS5.campaignStory;
const catalogs={};for(const lang of ['es-419','en-US'])vm.runInNewContext(fs.readFileSync('src/i18n/'+lang+'.js','utf8'),{CS5:{i18n:{register:(l,d)=>catalogs[l]=d}}});
const manifest=JSON.parse(fs.readFileSync('src/i18n/manifest.json')),schema={scenes:{},credits:[],bossPhase:{}},review=[];
function add(key,text){catalogs['es-419'][key]=text;manifest.push({key,file,kind:'story',original:text});review.push({key,text});return key;}
for(const [id,lines] of Object.entries(S)){
 if(id==='credits'){schema.credits=lines.map((row,i)=>row.map((text,j)=>add('story.credits.'+i+'.'+j,text)));continue;}
 if(id==='bossPhase'){for(const [boss,values] of Object.entries(lines))schema.bossPhase[boss]=values.map((text,i)=>text?add('story.bossPhase.'+boss+'.'+i,text):null);continue;}
 schema.scenes[id]=lines.map(([who,expr,text],i)=>[who,expr,add('story.'+id+'.'+i,text)]);
}
fs.writeFileSync(file,'// Historia completa: IDs, hablantes y expresiones estables; textos en los catálogos locales.\r\nCS5.campaignStory=CS5.i18n.story('+JSON.stringify(schema,null,1)+');\r\n');
for(const lang of ['es-419','en-US'])fs.writeFileSync('src/i18n/'+lang+'.js',`// Recursos locales; claves técnicas estables.\nCS5.i18n.register('${lang}',${JSON.stringify(catalogs[lang],null,1)});\n`);
fs.writeFileSync('src/i18n/manifest.json',JSON.stringify(manifest,null,1));fs.writeFileSync('test-results/i18n-story-review.json',JSON.stringify(review,null,1));
console.log(JSON.stringify({scenes:Object.keys(schema.scenes).length,lines:Object.values(schema.scenes).reduce((s,l)=>s+l.length,0),credits:schema.credits.length,strings:review.length}));
