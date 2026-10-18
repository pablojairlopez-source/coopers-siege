// Inventario de desarrollo: cadenas candidatas con ubicación; no modifica el juego.
const fs=require('node:fs'),path=require('node:path'),acorn=require('acorn'),parse5=require('parse5');
const ROOT=path.resolve(__dirname,'..');
const files=['index.html',...fs.readdirSync(path.join(ROOT,'src'),{recursive:true}).filter(f=>f.endsWith('.js')&&!f.replaceAll('\\','/').startsWith('i18n/')).map(f=>'src/'+f.replaceAll('\\','/'))];
const rows=[];
const visible=s=>/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(s)&&!/^\s*(?:[.#][\w-]+|https?:|data:|[\w/-]+\.(?:js|css|png|jpg|json|svg|bat)|(?:bold |[\d.]+px|[\w-]+\([^)]*\)))/.test(s);
function walk(node,fn,parents=[]){if(!node||typeof node!=='object')return;fn(node,parents);for(const [key,value] of Object.entries(node)){if(key==='loc')continue;if(Array.isArray(value))for(const v of value)if(v?.type)walk(v,fn,[...parents,node]);else{}else if(value?.type)walk(value,fn,[...parents,node]);}}
for(const file of files){
 const source=fs.readFileSync(path.join(ROOT,file),'utf8');let code=source,offset=0;
 if(file==='index.html'){
  const html=parse5.parse(source,{sourceCodeLocationInfo:true});
  const scan=(n,skip=false)=>{skip=skip||['script','style'].includes(n.tagName);if(!skip&&n.nodeName==='#text'&&visible(n.value.trim())&&n.sourceCodeLocation)rows.push({file,line:n.sourceCodeLocation.startLine,kind:'html',text:n.value.trim()});if(!skip)for(const a of n.attrs||[])if(['title','aria-label','placeholder','alt'].includes(a.name)&&visible(a.value))rows.push({file,line:n.sourceCodeLocation?.startLine,kind:'attribute',text:a.value});for(const c of n.childNodes||[])scan(c,skip);};scan(html);
  const start=source.indexOf('<script>')+8,end=source.indexOf('</script>',start);offset=source.slice(0,start).split('\n').length-1;code=source.slice(start,end);
 }
 const ast=acorn.parse(code,{ecmaVersion:'latest',sourceType:'script',locations:true});
 walk(ast,(n,parents)=>{
  if(n.type!=='Literal'||typeof n.value!=='string'||!visible(n.value))return;
  const p=parents.at(-1);if(p?.type==='Property'&&p.key===n)return;
  if(n.value.length>3000)return;
  if(!/[A-ZÁÉÍÓÚÜÑáéíóúüñ\s]/.test(n.value))return;
  rows.push({file,line:n.loc.start.line+offset,kind:'js',parent:p?.type,text:n.value});
 });
 walk(ast,n=>{if(n.type==='TemplateElement'&&visible(n.value.cooked||'')&&n.value.cooked.length<3000)rows.push({file,line:n.loc.start.line+offset,kind:'template',text:n.value.cooked});});
}
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});fs.writeFileSync(path.join(ROOT,'test-results/i18n-inventory.json'),JSON.stringify(rows,null,1));
console.log(JSON.stringify({candidates:rows.length,byFile:rows.reduce((r,s)=>(r[s.file]=(r[s.file]||0)+1,r),{})},null,1));
