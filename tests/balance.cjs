// 5.2 — Simulación de balance (no forma parte de npm test: tarda varios minutos).
// La escuadra del jugador también la juega la IA (misma IA, mismo arsenal), de modo que el
// resultado mide el equilibrio entre bandos, no la habilidad de un humano.
// Uso: node tests/balance.cjs [salida.json] [capítulos=1,4,8,11,13,17] [semillas=4] [dificultad=normal]
const fs=require('node:fs');
const path=require('node:path');
const {serve,launch,VIEWPORTS,ROOT}=require('./lib/harness.cjs');
const out=path.resolve(ROOT,process.argv[2]||'test-results/balance.json');
const chapters=(process.argv[3]||'1,4,8,11,13,17').split(',').map(Number);
const seeds=Number(process.argv[4]||4),difficulty=process.argv[5]||'normal';
(async()=>{
 const srv=await serve(),browser=await launch({gpu:false}),errors=[],runs=[];
 try{
  const ctx=await browser.newContext(VIEWPORTS.desktop);
  await ctx.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb.name==='frame'?0:raf(cb);});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(srv.url);await page.waitForFunction(()=>window.PocketSiege);
  for(const n of chapters)for(const battle of [1,2])for(let k=0;k<seeds;k++){
   const r=await page.evaluate(({n,battle,k,difficulty})=>{
    const C=CS5.campaign;C.load();C.save.difficulty=difficulty;
    // Semilla fija por simulación.
    const now=Date.now;Date.now=()=>1e12+n*1000+battle*100+k;const mr=Math.random;Math.random=(s=>()=>((s=(s*1664525+1013904223)>>>0)/4294967296))(n*97+battle*13+k);
    C.startBattle(n,battle);Date.now=now;Math.random=mr;
    app.teams[0].human=false;app.timer=45;
    const t0=performance.now();let steps=0,abilities=0,supplies=0;const boss=app.chars.find(c=>c.boss);
    const used=()=>boss?boss.boss.used:0;
    while(app.phase!=='over'&&app.turn<90&&steps<60*60*30){PocketSiege.step(1/30);steps++;if(app.phase==='action'&&app.actionAge>20){app.projectiles=[];PocketSiege.nextTurn();}}
    supplies=app.supplyState.picked.length;abilities=used();
    const res={n,battle,seed:k,winner:app.winner?app.winner.id:-1,turns:app.turn,rounds:app.round,shots:app.totalShots,abilities,interrupts:boss?.boss.interrupts||0,supplies,spawned:app.supplyState.spawned,
     squadHp:app.chars.filter(c=>c.team===0&&c.hp>0).reduce((s,c)=>s+c.hp,0),foeHp:app.chars.filter(c=>c.team===1&&c.hp>0).reduce((s,c)=>s+c.hp,0),ms:Math.round(performance.now()-t0)};
    C.leaveBattle();return res;
   },{n,battle,k,difficulty});
   runs.push(r);console.log(JSON.stringify(r));
  }
  const sum={};
  for(const r of runs){const key=r.battle===1?'batalla1':'jefe';const s=sum[key]||(sum[key]={n:0,squadWins:0,turns:0,abilities:0,supplies:0,timeouts:0});s.n++;if(r.winner===0)s.squadWins++;if(r.winner===-1&&r.turns>=90)s.timeouts++;s.turns+=r.turns;s.abilities+=r.abilities;s.supplies+=r.supplies;}
  for(const s of Object.values(sum)){s.squadWinRate=+(s.squadWins/s.n).toFixed(2);s.avgTurns=+(s.turns/s.n).toFixed(1);s.avgAbilities=+(s.abilities/s.n).toFixed(1);s.avgSupplies=+(s.supplies/s.n).toFixed(1);}
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({date:new Date().toISOString(),difficulty,chapters,seeds,summary:sum,runs},null,1));
  console.log('Resumen',JSON.stringify(sum));
  if(errors.length){console.error(errors);process.exitCode=1;}
 }finally{await browser.close();await srv.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
