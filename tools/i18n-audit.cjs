// Candidatos residuales para revisión humana: no sustituye el control visual.
const fs=require('fs'),acorn=require('acorn'),parse5=require('parse5');
const found=[];
const human=s=>/[\p{L}]/u.test(s)&&!s.includes('CS5.i18n')&&!/^[\s\d\p{P}\p{S}]*$/u.test(s);
const files=['index.html',...fs.readdirSync('src',{recursive:true}).filter(f=>f.endsWith('.js')&&!f.startsWith('i18n')).map(f=>'src/'+f.replaceAll('\\','/'))];
for(const file of files){const src=fs.readFileSync(file,'utf8');let code=src,offset=0;
 if(file==='index.html'){
  const doc=parse5.parse(src);function scan(n,skip=false,localized=false){skip||=['style','script'].includes(n.tagName);localized||=!!n.attrs?.find(a=>a.name==='data-i18n');if(!skip&&!localized&&n.nodeName==='#text'&&human(n.value.trim()))found.push({file,kind:'html',text:n.value.trim()});for(const child of n.childNodes||[])scan(child,skip,localized);}scan(doc);
  const start=src.indexOf('<script>')+8;offset=src.slice(0,start).split('\n').length-1;code=src.slice(start,src.indexOf('</script>',start));
 }
 function visit(n,p){if(!n?.type)return;
  if(n.type==='Literal'&&typeof n.value==='string'&&human(n.value)){
   const call=p?.type==='CallExpression'&&(p.callee.property?.name||p.callee.name),assign=p?.type==='AssignmentExpression'&&p.left.property?.name;
   if(['toast','studioStatus','fillText','strokeText','setStatus','alert','confirm'].includes(call)||['textContent','innerHTML','title','placeholder'].includes(assign))found.push({file,line:n.loc.start.line+offset,kind:'js',text:n.value});
  }
  if(n.type==='TemplateElement'&&/<(?:div|span|p|b|small|button|label|option|li|section|header)\b/.test(n.value.cooked||''))for(const m of (n.value.cooked||'').matchAll(/>([^<>]+)</g))if(human(m[1])&&!m[1].includes('data-i18n'))found.push({file,line:n.loc.start.line+offset,kind:'template',text:m[1].trim()});
  for(const v of Object.values(n))if(Array.isArray(v))v.forEach(x=>visit(x,n));else if(v?.type)visit(v,n);
 }visit(acorn.parse(code,{ecmaVersion:'latest',locations:true}));
}
const invariants=new Set(["COOPER'S",'SIEGE.','pablojairlopez-source.github.io/coopers-siege','53m','A','D','Q','F','W','S','Enter','X','.bat','BroadcastChannel']);
const residuals=found.filter(row=>!invariants.has(row.text));
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/i18n-residuals.json',JSON.stringify({reviewed:found,residuals},null,1));console.log({reviewedInvariants:found.length-residuals.length,residuals});
if(process.argv.includes('--check')&&residuals.length)process.exitCode=1;
