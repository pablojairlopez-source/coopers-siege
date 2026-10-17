// Migración inicial revisable desde 0f8cc74. No es un traductor automático.
// Solo con --apply: extrae recursos, preserva IDs y genera un manifiesto de ubicaciones.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn'),parse5=require('parse5');
const ROOT=path.resolve(__dirname,'..'),APPLY=process.argv.includes('--apply');
const catalogs={};for(const lang of ['es-419','en-US'])vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/i18n/'+lang+'.js'),'utf8'),{CS5:{i18n:{register:(l,d)=>catalogs[l]=d}}});
const ES=catalogs['es-419'],manifest=[],counters={},invariants=new Set(['use strict','INPUT','SELECT','TEXTAREA','BUTTON','Count','CPU','LAN','FPS','HP','BPM','PC','WebGL','WebGL 2','WebGL 2.0','WebGL 1','D3D11','PBF','Cooper','Pipa','Bongo','Roco','Cooper’s Siege',"Cooper's Siege","Cooper's Trophy",'Enter','Escape','Space','Shift','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
const attrNames=['title','aria-label','placeholder','alt'];
let file='',code='',offset=0;
const slug=s=>s.replace(/[^\w]+/g,'_').replace(/^_|_$/g,'')||'text';
const name=n=>n?.name??n?.value;
const kids=n=>Object.entries(n).filter(([k])=>k!=='loc').flatMap(([,v])=>Array.isArray(v)?v.filter(x=>x?.type):v?.type?[v]:[]);
function context(parents){for(let i=parents.length-1;i>=0;i--){const n=parents[i];if(n.type==='FunctionDeclaration'&&n.id)return n.id.name;if(/Function/.test(n.type)){const p=parents[i-1];if(p?.type==='Property')return String(name(p.key));if(p?.type==='VariableDeclarator')return p.id.name;if(p?.type==='AssignmentExpression')return name(p.left.property)||p.left.name||'view';}}return 'data';}
function prefix(parents){return file==='index.html'?'ui.main.'+context(parents):file.replace(/^src\//,'').replace(/\.js$/,'').replaceAll('/','.')+'.'+context(parents);}
function add(text,parents=[],kind='js',key=null,line=0){
 const p=prefix(parents);key=key||p+'.s'+String(counters[p]=(counters[p]||0)+1).padStart(3,'0');
 if(ES[key]!=null&&ES[key]!==text)throw Error('Colisión de clave '+key);
 ES[key]=text;manifest.push({key,file,line:line||parents.at(-1)?.loc?.start.line+offset||0,kind,original:text});return key;
}
function human(s){
 if(!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(s)||invariants.has(s))return false;
 if(/^\s*(?:[.#][\w-]+|https?:|data:|rgba?\(|hsl|[\w./-]+\.(?:js|css|png|jpg|json|svg|bat)|(?:bold |italic |[\d.]+(?:px|%)))/.test(s))return false;
 if(/(?:system-ui|sans-serif|monospace|font-family|gl_Position|precision (?:high|medium)p|void main|<svg)/.test(s))return false;
 return /[ÁÉÍÓÚÜÑáéíóúüñ\s]/.test(s)||/^[A-Z][A-ZÁÉÍÓÚÜÑ !?·:…–—-]+$/.test(s)||/^[A-Z][a-z]+$/.test(s);
}
function eligible(n,parents){
 if(typeof n.value!=='string'||!human(n.value))return false;
 const p=parents.at(-1);if(p?.type==='Property'&&p.key===n)return false;
 if(p?.type==='ExpressionStatement'&&p.directive)return false;
 if(p?.type==='BinaryExpression'&&p.operator!=='+')return false;
 if(p?.type==='CallExpression'){
  const callee=code.slice(p.callee.start,p.callee.end);
  if(/(?:^\$$|getElementById|querySelector|createElement|addEventListener|removeEventListener|\.classList\.|getItem|setItem|getContext|\.includes$|\.indexOf$|\.startsWith$|\.endsWith$|\.getParameter$)/.test(callee))return false;
  if(/setAttribute/.test(callee)&&!(p.arguments.indexOf(n)===1&&attrNames.includes(p.arguments[0]?.value)))return false;
 }
 if(file==='src/audio/songs.js')return p?.type==='Property'&&['name','genre'].includes(name(p.key));
 if(file==='src/audio/composer.js')return (n.loc.start.line>=20&&n.loc.start.line<=28)||n.loc.start.line===210;
 if(/^src\/(?:rendering|levels|effects|characters)\//.test(file)||file==='src/audio/instruments.js'||file==='src/audio/sfx.js')return false;
 if(file==='index.html'&&n.loc.start.line+offset<5290){
  return p?.type==='Property'&&['name','desc','label'].includes(name(p.key));
 }
 return true;
}
function recipe(n){
 if(n.type==='Literal'&&typeof n.value==='string')return [n.value];
 if(n.type==='TemplateLiteral'){const out=[];n.quasis.forEach((q,i)=>{out.push(q.value.cooked??q.value.raw);if(n.expressions[i])out.push(n.expressions[i]);});return out;}
 if(n.type==='BinaryExpression'&&n.operator==='+'){
  const a=recipe(n.left),b=recipe(n.right);if(a.some(x=>typeof x==='string')||b.some(x=>typeof x==='string'))return [...a,...b];
 }
 return [n];
}
function bindRecipe(parts,parents,kind='js',asHTML=false){
 const expressions=[],params={};let text='';
 for(const part of parts){if(typeof part==='string')text+=part;else{const p='p'+expressions.length;expressions.push(part);params[p]=part;text+='{'+p+'}';}}
 const key=add(text,parents,kind),args=expressions.length?',{'+Object.entries(params).map(([k,v])=>k+':'+rewrite(unescapeArg(v),parents)).join(',')+'}':'';
 return `CS5.i18n.${asHTML?'textHTML':'t'}(${JSON.stringify(key)}${args})`;
}
function unescapeArg(n){return n?.type==='CallExpression'&&['esc','escapeHTML'].includes(n.callee.name)&&n.arguments.length===1?n.arguments[0]:n;}
function html(parts,parents,staticDocument=false){
 const expressions=[],joined=parts.map(p=>typeof p==='string'?p:'CS5EXPR'+(expressions.push(p)-1)+'TOKEN').join('');
 const tree=staticDocument?parse5.parse(joined,{sourceCodeLocationInfo:true}):parse5.parseFragment(joined,{sourceCodeLocationInfo:true}),edits=[],marks=new Map();
 const local=(value,kind,node,keyHint)=>{
  const plain=value.replace(/CS5EXPR\d+TOKEN/g,'');if(!human(plain.trim()))return null;
  const params=[],text=value.replace(/CS5EXPR(\d+)TOKEN/g,(_,i)=>{const p='p'+params.length;params.push(expressions[Number(i)]);return '{'+p+'}';});
  const key=add(text,parents,kind,keyHint,node.sourceCodeLocation?.startLine);
  return {key,params,call:`CS5.i18n.textHTML(${JSON.stringify(key)}${params.length?',{'+params.map((p,i)=>'p'+i+':'+rewrite(unescapeArg(p),parents)).join(',')+'}':''})`};
 };
 const visit=(n,parent=null,skip=false)=>{
  skip=skip||['script','style'].includes(n.tagName);
  if(!skip&&n.nodeName==='#text'&&n.sourceCodeLocation){
   const raw=n.value,trim=raw.trim();if(trim){
    const id=parent?.attrs?.find(a=>a.name==='id')?.value;
    const keyHint=staticDocument?'ui.html.'+slug(id||parent?.tagName||'text')+'.s'+String(counters['html']=(counters['html']||0)+1).padStart(3,'0'):null;
    const item=local(trim,'html',n,keyHint);
    if(item){
     const loc=n.sourceCodeLocation,start=loc.startOffset,end=loc.endOffset,leading=raw.match(/^\s*/)[0],trailing=raw.match(/\s*$/)[0];
     if(staticDocument){
      const onlyText=parent?.childNodes?.every(c=>c.nodeName==='#text');
      if(onlyText)marks.set(parent,(marks.get(parent)||'')+` data-i18n="${item.key}"`);
      else edits.push({start,end,text:leading+`<span data-i18n="${item.key}">${joined.slice(start,end).trim()}</span>`+trailing});
     }else{
      if(!item.params.length&&parent?.childNodes?.every(c=>c.nodeName==='#text'))marks.set(parent,(marks.get(parent)||'')+` data-i18n="${item.key}"`);
      edits.push({start,end,text:leading+'${'+item.call+'}'+trailing});
     }
    }
   }
  }
  if(!skip&&n.attrs)for(const a of n.attrs){
   if(!attrNames.includes(a.name))continue;
   const al=n.sourceCodeLocation?.attrs?.[a.name];if(!al)continue;
   const id=n.attrs.find(x=>x.name==='id')?.value;
   const hint=staticDocument?'ui.html.'+slug(id||n.tagName)+'.'+a.name+'.s'+String(counters.html=(counters.html||0)+1).padStart(3,'0'):null;
   const item=local(a.value,'attribute',n,hint);if(!item)continue;
   if(!item.params.length)marks.set(n,(marks.get(n)||'')+` data-i18n-${a.name}="${item.key}"`);
   if(!staticDocument)edits.push({start:al.startOffset,end:al.endOffset,text:a.name+'="${'+item.call+'}"'});
  }
  for(const child of n.childNodes||[])visit(child,n,skip);
 };
 visit(tree);
 for(const [n,attrs] of marks){const loc=n.sourceCodeLocation?.startTag;if(!loc)continue;const p=loc.endOffset-(joined[loc.endOffset-2]==='/'?2:1);edits.push({start:p,end:p,text:attrs});}
 let result=patch(joined,edits);
 if(staticDocument)return result;
 // Restaura las expresiones no localizadas, incluidos nombres personalizados y atributos técnicos.
 result=result.replace(/CS5EXPR(\d+)TOKEN/g,(_,i)=>'${'+rewrite(expressions[Number(i)],parents)+'}');
 return '`'+result+'`';
}
function patch(source,edits){for(const e of edits.sort((a,b)=>b.start-a.start||b.end-a.end))source=source.slice(0,e.start)+e.text+source.slice(e.end);return source;}
function metadataKey(n,parents){
 const field=name(n.key);if(!['name','desc','short','tag','role','title','genre','team'].includes(field))return null;
 const object=parents.at(-1);if(object?.type!=='ObjectExpression')return null;
 const id=object.properties.find(p=>name(p.key)==='id')?.value?.value;
 if(file==='index.html'&&id&&n.loc.start.line+offset>5400&&n.loc.start.line+offset<5472)return (['rocket','grenade','shotgun','dynamite','homing','banana','airstrike','mine','bat','cluster','teleport','super','salvo','ice','sniper','medkit','shield','acid','flame','tesla','orbital','meteor','vampire','saw','sticky','holy','blackhole','drill'].includes(id)?'weapons.':'maps.')+id+'.'+field;
 if(file==='src/audio/songs.js'&&id)return 'audio.songs.'+id+'.'+field;
 if(file==='src/campaign/chapters.js'){
  const chapter=object.properties.find(p=>name(p.key)==='n')?.value?.value;if(chapter)return 'campaign.chapters.'+chapter+'.'+field;
  const parent=parents.at(-2);if(parent?.type==='Property')return 'campaign.data.'+name(parent.key)+'.'+field;
 }
 return null;
}
function rewrite(n,parents=[]){
 if(!n)return '';
 const original=code.slice(n.start,n.end),next=[...parents,n];
 if(n.type==='CallExpression'&&file==='src/campaign/chapters.js'&&n.callee.name==='P'){
  const id=n.arguments[0].value,args=n.arguments.map((v,i)=>i===1||i===2?JSON.stringify(add(v.value,next,'metadata','campaign.bosses.'+id+'.'+(i===1?'name':'title'))):rewrite(v,next));return 'P('+args.join(',')+')';
 }
 if(n.type==='Property'&&!n.computed&&n.value?.type==='Literal'&&eligible(n.value,next)){
  const field=name(n.key),key=metadataKey(n,parents);
  if(key){add(n.value.value,next,'metadata',key);return `get ${field}(){return CS5.i18n.t(${JSON.stringify(key)})}`;}
 }
 if(n.type==='Literal'&&typeof n.value==='string'){
  if(/<[a-z][\s\S]*>/i.test(n.value)&&eligible({...n,value:'Texto HTML'},parents))return html([n.value],next);
  if(eligible(n,parents))return `CS5.i18n.t(${JSON.stringify(add(n.value,next))})`;
  return original;
 }
 if(n.type==='TemplateLiteral'||n.type==='BinaryExpression'&&n.operator==='+'){
  const parts=recipe(n),hasHTML=parts.some(p=>typeof p==='string'&&/<\/?[a-z][^>]*>/i.test(p));
  if(hasHTML&&file!=='src/audio/songs.js'&&!(file==='index.html'&&n.loc.start.line+offset<5290))return html(parts,next);
  const strings=parts.filter(p=>typeof p==='string');
  if(strings.some(human)&&parts.length>1&&!(file==='index.html'&&n.loc.start.line+offset<5290)&&!/^src\/(?:audio|rendering|levels|effects|characters)\//.test(file))return bindRecipe(parts,next,'dynamic');
 }
 const edits=[];
 for(const child of kids(n)){const value=rewrite(child,next);if(value!==code.slice(child.start,child.end))edits.push({start:child.start-n.start,end:child.end-n.start,text:value});}
 return patch(original,edits);
}
const sources=['index.html','src/audio/songs.js','src/audio/composer.js','src/input/attack-controls.js','src/campaign/chapters.js','src/campaign/campaign.js','src/campaign/dialogue.js','src/campaign/bosses.js','src/gameplay/supply-config.js','src/gameplay/supply-drops.js'];
for(file of sources){
 const source=fs.readFileSync(path.join(ROOT,file),'utf8');offset=0;code=source;
 if(file==='index.html'){
  if(source.includes('src/i18n/i18n.js'))throw Error('La migración ya está aplicada');
  const start=source.indexOf('<script>')+8,end=source.lastIndexOf('</script>');offset=source.slice(0,start).split('\n').length-1;code=source.slice(start,end);
  const ast=acorn.parse(code,{ecmaVersion:'latest',locations:true}),result=rewrite(ast);
  const staticHTML=html([source.slice(0,start-8)],[],true);
  const scripts='<script src="src/i18n/i18n.js"></script><script src="src/i18n/es-419.js"></script><script src="src/i18n/en-US.js"></script>\n';
  const out=staticHTML.replace('<script src="src/levels/',scripts+'<script src="src/levels/')+'<script>'+result+source.slice(end);
  if(APPLY)fs.writeFileSync(path.join(ROOT,file),out.replace(/\r?\n/g,'\r\n'));
 }else{
  let result=rewrite(acorn.parse(code,{ecmaVersion:'latest',locations:true}));
  if(file==='src/campaign/chapters.js')result=result.replace('const P=(id,name,title,hp,abilities,style,look)=>({id,name,title,hp,abilities,style,...look});','const P=(id,name,title,hp,abilities,style,look)=>CS5.i18n.labels({id,hp,abilities,style,...look},{name,title});');
  acorn.parse(result,{ecmaVersion:'latest'});
  if(APPLY)fs.writeFileSync(path.join(ROOT,file),result.replace(/\r?\n/g,'\r\n'));
 }
}
if(APPLY){
 for(const lang of ['es-419','en-US'])fs.writeFileSync(path.join(ROOT,'src/i18n/'+lang+'.js'),`// Recursos locales; claves técnicas estables.\nCS5.i18n.register('${lang}',${JSON.stringify(catalogs[lang],null,1)});\n`);
 fs.writeFileSync(path.join(ROOT,'src/i18n/manifest.json'),JSON.stringify(manifest,null,1));
}
fs.writeFileSync(path.join(ROOT,'test-results/i18n-extraction-plan.json'),JSON.stringify(manifest,null,1));
console.log(JSON.stringify({apply:APPLY,strings:manifest.length,byFile:manifest.reduce((r,m)=>(r[m.file]=(r[m.file]||0)+1,r),{})},null,1));
