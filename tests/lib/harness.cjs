// Utilidades compartidas por las pruebas visuales y de rendimiento.
// Sirve el repositorio completo (index.html + src/ + assets/) con rutas relativas,
// igual que GitHub Pages.
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');

const ROOT=path.join(__dirname,'..','..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg','.ogg':'audio/ogg','.webp':'image/webp','.svg':'image/svg+xml'};

async function serve(root=ROOT){
 const server=http.createServer((req,res)=>{
  let rel=decodeURIComponent(new URL(req.url,'http://x').pathname).replace(/^\/+/,'')||'index.html';
  const file=path.join(root,rel);
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.statusCode=404;return res.end('not found');}
  res.setHeader('Content-Type',TYPES[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 return {server,url:`http://127.0.0.1:${server.address().port}/`,close:()=>new Promise(r=>server.close(r))};
}

// GPU real cuando está disponible (ANGLE/D3D11 en Windows); si no, SwiftShader.
async function launch({gpu=true}={}){
 const args=['--autoplay-policy=no-user-gesture-required','--ignore-gpu-blocklist'];
 if(gpu)args.push('--enable-gpu','--use-angle=d3d11','--enable-unsafe-webgpu');
 return chromium.launch({headless:true,args,...(process.env.TEST_BROWSER_PATH?{executablePath:process.env.TEST_BROWSER_PATH}:{})});
}

async function gpuInfo(page){
 return page.evaluate(()=>{
  const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');
  if(!g)return {webgl:false};
  const d=g.getExtension('WEBGL_debug_renderer_info');
  return {webgl:true,version:g.getParameter(g.VERSION),renderer:d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER),maxTexture:g.getParameter(g.MAX_TEXTURE_SIZE)};
 });
}

// Viewports de prueba. El Galaxy S23 Ultra se emula (412×915 CSS, DPR 3.5):
// no se dispone de un dispositivo físico.
const VIEWPORTS={
 desktop:{viewport:{width:1366,height:768},deviceScaleFactor:1},
 s23ultra:{viewport:{width:915,height:412},deviceScaleFactor:3.5,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'},
 fold:{viewport:{width:904,height:832},deviceScaleFactor:2.6,isMobile:true,hasTouch:true},
 ultrawide:{viewport:{width:2560,height:1080},deviceScaleFactor:1}
};
// Las aserciones históricas de texto se ejecutan con idioma español explícito.
// Las suites bilingües sobrescriben locale para comprobar la detección real.
for(const profile of Object.values(VIEWPORTS))profile.locale='es-CL';

module.exports={ROOT,serve,launch,gpuInfo,VIEWPORTS};
