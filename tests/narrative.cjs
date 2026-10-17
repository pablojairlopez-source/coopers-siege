// 5.2 — Narrativa y diálogo.
// · Cada capítulo tiene ≥ 6 conversaciones (intro, antes de la batalla 1, tras la batalla 1,
//   presentación del jefe, antes del jefe, victoria) con hablantes válidos y texto no vacío.
// · Sin frases repetidas entre escenas (diálogos originales) y los hitos de la historia presentes.
// · Retratos 3D no vacíos para el reparto, los 17 jefes y los bots, con colores y cosméticos distintos.
// · Avanzar (clic, ESPACIO, ENTER), completar el texto progresivo, omitir (ESC y botón) e historial;
//   el diálogo nunca bloquea: siempre termina y llama a la continuación. Persistencia de vistos.
// · Diseño: en S23 Ultra, plegable, tablet y PC la caja y sus botones quedan dentro de pantalla,
//   sin solaparse con el retrato y con objetivos táctiles ≥ 36 px.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
const SCREENS={...VIEWPORTS,tablet:{viewport:{width:1024,height:768},deviceScaleFactor:2,isMobile:true,hasTouch:true}};

(async()=>{
 const srv=await serve(),browser=await launch({gpu:false}),errors=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  const data=await page.evaluate(()=>{
   const S=CS5.campaignStory,D=CS5.campaignData,kinds=['intro','pre1','post1','bossIntro','preBoss','victory'],who=new Set([...Object.keys(D.cast),'boss','bot','carta']);
   const per=D.chapters.map(c=>({n:c.n,scenes:kinds.filter(k=>S['c'+c.n+'.'+k]?.length).length,lines:kinds.reduce((s,k)=>s+(S['c'+c.n+'.'+k]?.length||0),0)}));
   const bad=[],texts=[];
   for(const [id,lines] of Object.entries(S)){if(!Array.isArray(lines)||id==='credits')continue;for(const l of lines){if(!who.has(l[0])||typeof l[2]!=='string'||l[2].trim().length<2)bad.push(id+':'+l[0]);texts.push(l[2]);}}
   const all=texts.join(' ');
   const beats=['Cooper Cero','Fundición','Atlantis','galletas','Roco','Huesón','invitación'.slice(1)].filter(w=>!all.includes(w));
   return {per,bad,dup:texts.length-new Set(texts).size,beats,total:texts.length,finale:!!S.finale?.length,credits:S.credits?.length,post:!!S.postcredits?.length,prologue:!!S.prologue?.length};
  });
  for(const c of data.per){assert.ok(c.scenes>=6,`capítulo ${c.n}: ${c.scenes} conversaciones`);assert.ok(c.lines>=14,`capítulo ${c.n}: ${c.lines} líneas`);}
  assert.deepEqual(data.bad,[],'hablantes y textos válidos');
  assert.equal(data.dup,0,'ninguna frase repetida');
  assert.deepEqual(data.beats,[],'hitos de la historia presentes');
  assert.ok(data.prologue&&data.finale&&data.post&&data.credits>=6,'prólogo, final, créditos y poscréditos');

  // Retratos: no vacíos y distintos entre personajes.
  const port=await page.evaluate(()=>{
   const D=CS5.campaignData,sig=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let n=0,h=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>20){n++;h=(h+d[i]*3+d[i+1]*5+d[i+2]*7)%1000003;}return {n,h};};
   const res=[];
   for(const [id,p] of Object.entries(D.cast))res.push({id,...sig(CS5.portraits.get(p,'joy','left',200))});
   for(const ch of D.chapters){res.push({id:ch.boss.id,...sig(CS5.portraits.get({variant:ch.variant,fur:ch.boss.fur,accessory:ch.boss.accessory,backgear:ch.boss.backgear,color:ch.boss.color},'angry','right',200))});res.push({id:'bot'+ch.n,...sig(CS5.portraits.get(CS5.campaign.botLook(ch,0),'idle','right',200))});}
   const a=sig(CS5.portraits.get(D.cast.cooper,'joy','left',200)),b=sig(CS5.portraits.get(D.cast.cooper,'sad','left',200));
   return {res,expr:a.h!==b.h,gl:!!CS5.view3d.renderer()};
  });
  for(const r of port.res)assert.ok(r.n>200*200*.12,`retrato ${r.id} visible (${r.n} px)`);
  assert.ok(new Set(port.res.map(r=>r.h)).size>=port.res.length-2,'retratos distintos (variante, colores y cosméticos)');
  assert.ok(port.expr,'la expresión cambia el retrato');

  // Interacción: avanzar, completar, omitir, historial y continuación garantizada.
  const flow=await page.evaluate(async()=>{
   const D=CS5.dialogue,wait=ms=>new Promise(r=>setTimeout(r,ms)),out={};
   let done=0;D.play('c1.intro',CS5.campaignStory['c1.intro'],{chapter:1},()=>done++);
   out.open=D.open&&!D.el.hidden;out.partial=D.ui.text.textContent.length<D.full.length;
   document.querySelector('.dlg-next').click();out.completed=D.ui.text.textContent===D.full&&D.i===0;
   document.querySelector('.dlg-next').click();out.i1=D.i;
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));window.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));out.i2=D.i;
   window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));out.i3=D.i;
   await wait(2600);out.typedAlone=D.ui.text.textContent===D.full;
   document.querySelector('.dlg-log').click();out.history=!D.ui.hist.hidden&&D.ui.histList.children.length>=4;
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));out.historyClosed=D.ui.hist.hidden&&D.open;
   window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));out.skipped=!D.open&&done===1;
   // Escena vacía o inexistente: continúa sin bloquear.
   D.play('nada',[],{},()=>done++);out.empty=done===2&&!D.open;
   // Botón omitir y clic en la caja.
   D.play('c4.bossIntro',CS5.campaignStory['c4.bossIntro'],{chapter:4},()=>done++);out.bossName=D.ui.name.textContent;D.ui.box.click();D.ui.box.click();out.boxAdv=D.i===1;
   document.querySelector('.dlg-skip').click();out.skipBtn=done===3&&!D.open;
   // Carta del prólogo sin retrato.
   D.play('prologue',CS5.campaignStory.prologue,{},()=>done++);out.letter=D.el.classList.contains('letter');D.finish(true);
   // Frase en combate sin pausar.
   CS5.dialogue.bark('cero','angry','Prueba',{chapter:17});out.bark=document.getElementById('dlgBark').classList.contains('show');
   out.seen=JSON.parse(localStorage.getItem('coopers-siege-campaign-v1')||'{}').seen||[];
   return out;
  });
  assert.deepEqual({open:flow.open,partial:flow.partial,completed:flow.completed,i1:flow.i1,i2:flow.i2,i3:flow.i3},{open:true,partial:true,completed:true,i1:1,i2:2,i3:3},'avanzar: clic completa y luego pasa; ENTER y ESPACIO igual');
  assert.ok(flow.typedAlone,'el texto progresivo termina solo');
  assert.ok(flow.history&&flow.historyClosed,'historial abre y cierra con ESC sin cerrar el diálogo');
  assert.ok(flow.skipped&&flow.empty&&flow.skipBtn,'omitir (ESC y botón) y escena vacía nunca bloquean');
  assert.ok(flow.boxAdv);assert.equal(flow.bossName,'Faraón Costilla','el jefe del capítulo habla con su nombre');
  assert.ok(flow.letter&&flow.bark);
  for(const id of ['c1.intro','c4.bossIntro','prologue'])assert.ok(flow.seen.includes(id),`persistencia de diálogos vistos: ${id}`);
  await ctx.close();

  // Diseño en pantallas.
  for(const name of ['s23ultra','fold','tablet','desktop']){
   const c2=await browser.newContext(SCREENS[name]),p=await c2.newPage();p.on('pageerror',e=>errors.push(name+': '+e.message));
   await p.goto(srv.url);await p.waitForFunction(()=>window.PocketSiege);
   for(const scene of ['c4.bossIntro','c1.pre1','prologue']){
    const box=await p.evaluate(scene=>{CS5.dialogue.play(scene,CS5.campaignStory[scene],{chapter:scene==='prologue'?1:Number(scene.slice(1,scene.indexOf('.')))});CS5.dialogue.next();
     const W=innerWidth,H=innerHeight,r=e=>e.getBoundingClientRect(),b=r(document.querySelector('.dlg-box')),btns=[...document.querySelectorAll('.dlg-actions button')].map(r),pt=document.querySelector('.dlg-portrait.active'),pr=pt?r(pt):null;
     const inside=x=>x.left>=-1&&x.top>=-1&&x.right<=W+1&&x.bottom<=H+1;
     const ov=(a,c)=>Math.max(0,Math.min(a.right,c.right)-Math.max(a.left,c.left))*Math.max(0,Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top));
     const res={box:inside(b),btns:btns.every(inside),minH:Math.min(...btns.map(x=>x.height)),overlap:pr?ov(b,pr)/(b.width*b.height):0,portrait:pr?Math.round(pr.height):0,H};
     CS5.dialogue.finish(true);return res;},scene);
    assert.ok(box.box&&box.btns,`${name}/${scene}: diálogo y botones dentro de pantalla`);
    assert.ok(box.minH>=36,`${name}/${scene}: botones táctiles ≥ 36 px (${box.minH})`);
    assert.ok(box.overlap<.02,`${name}/${scene}: el texto no tapa el retrato (${box.overlap})`);
    if(scene!=='prologue')assert.ok(box.portrait>=box.H*.28||box.portrait>=150,`${name}: retrato grande (${box.portrait}px de ${box.H})`);
   }
   await c2.close();
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS narrative: 17 capítulos con ≥ 6 conversaciones (${data.total} líneas sin repetir), retratos 3D de ${port.res.length} personajes, avanzar/omitir/historial sin bloqueo, persistencia y diseño en S23 Ultra, plegable, tablet y PC.`);
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
