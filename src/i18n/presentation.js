// Adaptador de presentación: el idioma no ejecuta partidas, física, audio ni escrituras de campaña.
(function(){
'use strict';
const I=CS5.i18n,C=CS5.campaign;
const accessoryKeys=['494','495','496','497','498','499','500','501','502','503','504','505','506','507','508','509','510','511','512','513','514'];
const accessories=['none','cap','crown','halo','horns','samurai','astronaut','mohawk','chef','vr','bandana','glasses','pirate','helmet','viking','wizard','sombrero','headphones','gasmask','monocle','bowtie'];
I.accessory=id=>{const at=accessories.indexOf(id);return at<0?id:I.t('ui.html.option.s'+accessoryKeys[at]);};
I.characterName=c=>{
 if(!app.campaign)return c.name;
 if(c.squadId)return CS5.campaignData.cast[c.squadId].name;
 if(c.boss)return CS5.campaignData.chapters.find(ch=>ch.boss.id===c.boss.id)?.boss.name||c.name;
 const i=app.chars.filter(e=>e.team===c.team).indexOf(c);return C.chapterDef().bots[i]||c.name;
};
I.teamName=t=>!app.campaign?t.name:t.id===0?I.t('campaign.campaign.setupMatch.s001'):C.active.battle===1?C.chapterDef().team:C.chapterDef().boss.name;
const control=document.createElement('details');control.id='languagePicker';control.className='language-picker';
control.innerHTML='<summary aria-label="Idioma / Language">🌐 <b></b></summary>'+I.selector();document.body.appendChild(control);
control.addEventListener('change',()=>control.open=false);
// Esc/Espacio dentro del selector no controla la partida o el diálogo.
for(const event of ['keydown','keyup','pointerdown','pointerup','click'])control.addEventListener(event,e=>e.stopPropagation());
function refresh(){
 const focus=document.activeElement,focusId=focus?.id,selection=focus?.selectionStart;
 const scroll=[...document.querySelectorAll('.cmp-body,.cmp-modal,.modal,.inventory-grid')].map(el=>[el,el.scrollTop]);
 I.applyDOM();I.refreshTexts();control.querySelector('summary b').textContent=I.locale==='en-US'?'EN':'ES';I.syncSelectors();
 // Actualización de tarjetas existentes: conserva lienzos, controles y manejadores.
 document.querySelectorAll('.map-card').forEach((el,i)=>{el.querySelector('b').textContent=maps[i].name;el.querySelector('small').textContent=maps[i].tag;});
 document.querySelectorAll('#editorTheme option').forEach((el,i)=>el.textContent=maps[i].name);
 $('mapTitle').textContent=studio.enabled&&studio.map===app.map?I.t('ui.main.selectMap.s001'):maps[app.map].tag;
 $('mapDescription').textContent=studio.enabled&&studio.map===app.map?I.t('ui.main.selectMap.s002'):maps[app.map].desc;
 syncPlayOptions();syncGoreOptions();menuLoopEngine.updatePreviewUI();CS5.refreshMenuAudioUI?.();
 for(const id of ['fullscreenButton','menuFullscreenButton'])$(id).title=I.t(fullscreenActive()?'extra.fullscreen.exit':'extra.fullscreen.enter');
 if(lanNet.statusText)lanNet.renderStatus();lanNet.refreshStartButton();
 // Las etiquetas musicales se calculan sin reiniciar pistas ni programar notas.
 const song=adaptiveMusic.state==='MENU'?CS5.songs.menu:CS5.songs.forMap(app.map),label=adaptiveMusic.state==='MENU'?I.t('extra.music.menu'):CS5.composer.STATE_MIX[adaptiveMusic.state]?.label||'';
 $('musicStateLabel').innerHTML='<span class="music-bars"><i></i><i></i><i></i></span> '+I.escape([song.name,CS5.composer.song===song?CS5.composer.describe():'',label].filter(Boolean).join(' · '));
 $('lyriaActiveStateBadge').textContent=I.t('extra.music.state')+(label||adaptiveMusic.state)+' · '+song.name;
 document.querySelectorAll('#soundtrackList li').forEach((el,i)=>{const s=CS5.songs.list[i];if(!s)return;el.querySelector('b').textContent=s.name;el.querySelector('span').textContent=I.t('ui.main.setupIter2Controls.s010',{p0:maps[i]?.name||'',p1:s.genre,p2:s.tempo,p3:s.meter,p4:s.sub===2?8:4});});
 lastHUD='';lastWeapon='';lastInventory='';updateHUD();updateInventory();
 if(app.active)$('turnBanner').textContent=I.teamName(app.teams[app.team])+' · '+I.characterName(app.active)+(cpuTurn()?I.t('ui.main.nextTurn.s001'):isLanCoop()?(human()?I.t('ui.main.nextTurn.s002'):I.t('ui.main.nextTurn.s003')):'');
 if(app.phase==='over'&&!app.campaign){const loss=(app.mode==='cpu'||isLanCoop())&&app.winner&&!app.winner.human;$('resultEyebrow').textContent=I.t(!app.winner?'ui.main.showMatchResult.s001':loss?'ui.main.showMatchResult.s002':'ui.main.showMatchResult.s003');$('winnerTitle').textContent=app.winner?I.teamName(app.winner):I.t('ui.main.showMatchResult.s004');$('winnerText').textContent=I.t(loss?'ui.main.showMatchResult.s005':app.winner?'ui.main.showMatchResult.s006':'ui.main.showMatchResult.s007');$('battleStats').textContent=I.t('ui.main.showMatchResult.s008',{p0:app.turn,p1:app.totalShots,p2:Math.round(app.damageDone)});}
 C.refreshingLanguage=true;
 try{
  if(C.root&&!C.root.hidden){const modalOpen=!C.modal.hidden,view=C.modalView;C.renderHub();if(modalOpen&&view?.kind==='chapter')C.chapterComplete(view.n);if(modalOpen&&view?.kind==='confirm')C.confirm(I.t('campaign.campaign.action.s003'),I.t('campaign.campaign.action.s004'),I.t('campaign.campaign.action.s005'),C._confirm);}
  if(C.resultEl&&!C.resultEl.hidden){if(C.resultView?.kind==='boss')C.showBossCard(C.resultView.n,C._bossNext);else if(C.resultView?.kind==='result')C.showResult(C.resultView.won);}
  if(C.active){C.showChip();C.updateBossBar();}
 }finally{C.refreshingLanguage=false;}
 const credits=document.getElementById('campaignCredits');if(credits)credits.querySelectorAll('.cmp-roll>p').forEach((el,i)=>{const row=CS5.campaignStory.credits[i];if(row){el.querySelector('small').textContent=row[0];el.querySelector('b').textContent=row[1];}});
 CS5.dialogue.refreshLanguage();
 for(const [el,y]of scroll)if(el.isConnected)el.scrollTop=y;
 if(focusId){const el=document.getElementById(focusId);if(el){el.focus({preventScroll:true});if(selection!=null&&el.setSelectionRange)try{el.setSelectionRange(selection,selection);}catch{}}}
}
I.onChange(refresh);refresh();
})();
