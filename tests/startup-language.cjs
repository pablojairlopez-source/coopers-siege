// Bienvenida obligatoria en cada carga: persistencia, guardados, teclado y móvil.
const assert=require('node:assert/strict');
const {serve,launch,VIEWPORTS}=require('./lib/harness.cjs');
(async()=>{
 const srv=await serve(),browser=await launch({gpu:false,manualLanguageWelcome:true});
 try{
  const context=await browser.newContext({...VIEWPORTS.desktop,locale:'en-US'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);
  await page.waitForFunction(()=>window.PocketSiege&&window.CS5?.languageWelcome);
  const gate=page.locator('#languageWelcome');
  assert.equal(await gate.isVisible(),true,'la bienvenida aparece antes del menú');
  assert.equal(await page.locator('#menu').evaluate(el=>el.inert),true,'menú bloqueado');
  assert.equal(await page.locator('[data-welcome-language="en-US"]').getAttribute('aria-pressed'),'true','detecta navegador inglés');
  assert.match(await page.locator('#languageWelcomeContinue').innerText(),/CONTINUE/);
  const baseline=await page.evaluate(()=>{
   const save=CS5.campaign.defaultSave();
   localStorage.setItem('coopers-siege-campaign-v1',JSON.stringify(save));
   return localStorage.getItem('coopers-siege-campaign-v1');
  });
  // Cambiar la selección no persiste ni empieza una partida antes de confirmar.
  await page.locator('[data-welcome-language="es-419"]').click();
  assert.equal(await page.evaluate(()=>CS5.i18n.locale),'en-US');
  assert.match(await page.locator('#languageWelcomeContinue').innerText(),/CONTINUAR/);
  assert.equal(await page.locator('#startButton').evaluate(el=>el.closest('#menu').inert),true);
  await page.locator('#languageWelcomeContinue').click();
  assert.equal(await gate.isVisible(),false);
  assert.equal(await page.locator('#menu').evaluate(el=>el.inert),false);
  assert.equal(await page.evaluate(()=>CS5.i18n.locale),'es-419');
  assert.match(await page.locator('#startButton').innerText(),/COMENZAR BATALLA/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('coopers-siege-campaign-v1')),baseline,'progreso intacto');
  assert.equal(await page.evaluate(()=>localStorage.getItem('coopers-siege-language-v1')),'es-419');
  await page.reload();
  await page.waitForFunction(()=>window.PocketSiege&&window.CS5?.languageWelcome);
  assert.equal(await gate.isVisible(),true,'reaparece en cada recarga');
  assert.equal(await page.locator('[data-welcome-language="es-419"]').getAttribute('aria-pressed'),'true','preferencia preseleccionada');
  // Teclado: las flechas alternan el idioma; Enter confirma sin tocar el juego.
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-welcome-language="en-US"]').getAttribute('aria-pressed'),'true');
  await page.locator('#languageWelcomeContinue').focus();
  await page.keyboard.press('Enter');
  assert.equal(await gate.isVisible(),false);
  assert.equal(await page.evaluate(()=>CS5.i18n.locale),'en-US');
  assert.equal(await page.evaluate(()=>localStorage.getItem('coopers-siege-campaign-v1')),baseline);
  await context.close();

  const mobile=await browser.newContext({...VIEWPORTS.s23ultra,locale:'fr-FR'});
  const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(srv.url);await phone.waitForFunction(()=>window.CS5?.languageWelcome);
  assert.equal(await phone.locator('[data-welcome-language="es-419"]').getAttribute('aria-pressed'),'true','respaldo español');
  const geometry=await phone.locator('#languageWelcomeContinue').boundingBox();
  const viewport=phone.viewportSize();
  assert(geometry&&geometry.x>=0&&geometry.y>=0&&geometry.x+geometry.width<=viewport.width+1&&geometry.y+geometry.height<=viewport.height+1,'botón accesible en S23 apaisado');
  await phone.locator('[data-welcome-language="en-US"]').tap();
  await phone.locator('#languageWelcomeContinue').tap();
  assert.equal(await phone.evaluate(()=>CS5.i18n.locale),'en-US');
  assert.equal(await phone.locator('#languageWelcome').isVisible(),false);
  await mobile.close();
  assert.deepEqual(errors,[]);
  console.log('✔ Inicio bilingüe: primera pantalla, confirmación, teclado/táctil, preferencia, recarga y campaña intacta');
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
