// Compone una hoja de contactos (cuadrícula) a partir de una carpeta de capturas.
// Uso: node tests/contact-sheet.cjs <carpeta> <salida.jpg> [filtro] [columnas]
const fs=require('node:fs');
const path=require('node:path');
const {launch,ROOT}=require('./lib/harness.cjs');
(async()=>{
 const dir=path.resolve(ROOT,process.argv[2]),out=path.resolve(ROOT,process.argv[3]),filter=process.argv[4]||'',cols=Number(process.argv[5]||4);
 const files=fs.readdirSync(dir).filter(f=>/\.(jpe?g|png)$/i.test(f)&&f.includes(filter)&&!f.includes('menu')).sort();
 const cells=files.map(f=>`<figure><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(dir,f)).toString('base64')}"><figcaption>${f.replace(/\.\w+$/,'')}</figcaption></figure>`).join('');
 const html=`<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;font:12px sans-serif;color:#ddd">${cells}<style>figure{margin:0}img{width:100%;display:block}figcaption{padding:2px 4px}</style></body></html>`;
 const browser=await launch({gpu:false}),page=await browser.newPage({viewport:{width:cols*480,height:400}});
 await page.setContent(html);await page.waitForTimeout(300);
 await page.screenshot({path:out,fullPage:true,type:'jpeg',quality:80});
 await browser.close();console.log(`${files.length} capturas → ${path.relative(ROOT,out)}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
