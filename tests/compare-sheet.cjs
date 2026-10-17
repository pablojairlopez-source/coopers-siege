// Hoja comparativa antes/después: cada fila muestra la misma captura en 4.0 y en 5.0.
// Uso: node tests/compare-sheet.cjs <antes> <después> <salida.jpg> [filtro] [desde] [hasta]
const fs=require('node:fs');
const path=require('node:path');
const {launch,ROOT}=require('./lib/harness.cjs');
(async()=>{
 const [a,b,out,filter='',from='0',to='99']=process.argv.slice(2);
 const A=path.resolve(ROOT,a),B=path.resolve(ROOT,b);
 const files=fs.readdirSync(A).filter(f=>f.includes(filter)&&fs.existsSync(path.join(B,f))).sort().slice(Number(from),Number(to));
 const img=p=>`data:image/jpeg;base64,${fs.readFileSync(p).toString('base64')}`;
 const rows=files.map(f=>`<div class="row"><figure><img src="${img(path.join(A,f))}"><figcaption>4.0 · ${f.replace(/\.\w+$/,'')}</figcaption></figure><figure><img src="${img(path.join(B,f))}"><figcaption>5.0 · ${f.replace(/\.\w+$/,'')}</figcaption></figure></div>`).join('');
 const html=`<html><body style="margin:0;background:#0d1320;font:13px sans-serif;color:#dde">${rows}<style>.row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}figure{margin:0}img{width:100%;display:block}figcaption{padding:3px 6px}</style></body></html>`;
 const browser=await launch({gpu:false}),page=await browser.newPage({viewport:{width:1280,height:600}});
 await page.setContent(html);await page.waitForTimeout(300);
 await page.screenshot({path:path.resolve(ROOT,out),fullPage:true,type:'jpeg',quality:76});
 await browser.close();console.log(`${files.length} pares → ${out}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
