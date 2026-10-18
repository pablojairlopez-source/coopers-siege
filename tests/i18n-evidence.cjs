// Comparaciones compactas para revisar la PR sin depender de test-results ignorado.
const fs=require('fs'),path=require('path');const {launch}=require('./lib/harness.cjs');
(async()=>{fs.mkdirSync('docs/i18n',{recursive:true});const b=await launch({gpu:false});try{
 for(const [name,profile,scenes]of [['s23-campana','s23ultra',['dialogue','bosscard']],['pc-menu','desktop',['menu']],['compacto-editor','compact',['editor','help']],['vertical','portrait',['menu','dialogue']]]){
  const rows=scenes.flatMap(scene=>['es-419','en-US'].map(lang=>{const filename=`${profile}-${lang}-${scene}.jpg`,data=fs.readFileSync('test-results/i18n/shots/'+filename).toString('base64');return `<figure><figcaption>${lang} · ${scene}</figcaption><img src="data:image/jpeg;base64,${data}"></figure>`;}));
  const p=await b.newPage({viewport:{width:1600,height:100}});await p.setContent(`<style>body{margin:0;background:#132039;color:#fff;display:grid;grid-template-columns:1fr 1fr;gap:8px;font:16px system-ui}figure{margin:0}figcaption{padding:8px}img{display:block;width:100%}</style>${rows.join('')}`);await p.screenshot({path:`docs/i18n/${name}.jpg`,fullPage:true,type:'jpeg',quality:87});await p.close();
 }
 for(const file of ['coverage.json','performance.json'])fs.copyFileSync('test-results/i18n/'+file,'docs/i18n/'+file);
 console.log('✔ Evidencia representativa y métricas guardadas en docs/i18n');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
