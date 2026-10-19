// Transferencia manual de partidas entre navegadores: sin cuentas ni servidor.
// Todo el contenido importado pasa por el validador de campaña antes de mostrarse.
(function(){
'use strict';
const C=window.CS5?.campaign,I=window.CS5?.i18n;
if(!C||!I)return;
const t=k=>I.t('saveTransfer.'+k),MAX_BYTES=1024*1024;
const completed=s=>Object.values(s.progress||{}).reduce((n,p)=>n+(p.b1?1:0)+(p.b2?1:0),0);
const date=ms=>{const n=Number(ms);return n>0&&Number.isFinite(n)?new Date(n).toLocaleString(I.locale==='en-US'?'en-US':'es-419'):'—';};
const plain=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let staged=null,feedback='';
function describe(s){
 return '<strong>'+plain(t('chapter'))+' '+Number(s.chapter)+'/17</strong><span>'+completed(s)+'/34 '+plain(t('battles'))+'</span><small>'+plain(t('modified'))+': '+plain(date(s.updated))+'</small>';
}
function notify(message){feedback=message;const el=C.body?.querySelector('#saveTransferFeedback');if(el){el.textContent=message;el.hidden=!message;}}
C.renderSaves=function(){
 const current=this.save||this.load(),backup=this.backupData();
 const backupSave=backup?this.sanitize(JSON.parse(backup)):null;
 const state=this.storageState||'empty',warning=state==='unavailable'||state==='corrupt'||state==='recovered';
 this.body.innerHTML='<section class="save-transfer">'+
 '<div class="st-intro"><h3>'+t('title')+'</h3><p>'+t('intro')+'</p></div>'+
 '<div class="st-current"><h4>'+t('current')+'</h4><div class="st-summary">'+describe(current)+'</div>'+
 '<div class="st-storage '+(warning?'warn':'')+'" role="status">'+t('state.'+state)+'</div></div>'+
 '<div class="st-actions"><button type="button" data-transfer="export">⬇ '+t('export')+'</button>'+
 '<button type="button" data-transfer="import">⬆ '+t('import')+'</button>'+
 '<button type="button" data-transfer="share">↗ '+t('share')+'</button>'+
 (backupSave?'<button type="button" data-transfer="restore">↶ '+t('restore')+'</button>':'')+
 '</div><p class="st-help">'+t('steps')+'</p>'+
 '<p class="st-feedback" id="saveTransferFeedback" role="status" '+(feedback?'':'hidden')+'>'+plain(feedback)+'</p>'+
 '<input id="saveTransferInput" type="file" accept=".json,application/json" hidden>'+
 '</section>';
};
function download(){
 if(!C.save)C.load();
 const filename='coopers-siege-ch'+String(C.save.chapter).padStart(2,'0')+'-'+new Date().toISOString().slice(0,10)+'.json';
 const file=new Blob([C.exportData()],{type:'application/json'});
 const url=URL.createObjectURL(file),a=document.createElement('a');
 a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 notify(t('downloadStarted'));
 return{file,filename};
}
C.downloadSave=download;
async function share(){
 if(!C.save)C.load();
 const filename='coopers-siege-ch'+String(C.save.chapter).padStart(2,'0')+'.json';
 const file=new File([C.exportData()],filename,{type:'application/json'});
 if(typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]})){
  try{await navigator.share({files:[file],title:"Cooper's Siege"});notify(t('shared'));return;}
  catch(e){if(e?.name==='AbortError')return;notify(t('shareFailed'));return;}
 }
 download();notify(t('shareFallback'));
}
function dismiss(){const el=C.root?.querySelector('#saveTransferModal');el?.remove();staged=null;}
function showPreview(raw,source){
 const parsed=typeof raw==='string'?JSON.parse(raw):raw;
 const next=C.sanitize(parsed);
 if(!next)throw new Error('Archivo no compatible');
 staged=JSON.stringify(parsed);
 dismiss(); // cerrar previsualizaciones anteriores antes de crear una nueva
 staged=JSON.stringify(parsed);
 const el=document.createElement('div');el.id='saveTransferModal';el.className='st-modal';
 el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',t('preview'));
 el.innerHTML='<div class="st-dialog"><h3>'+t('preview')+'</h3><p>'+t('comparison')+'</p>'+
 '<div class="st-compare"><section><h4>'+t('current')+'</h4>'+describe(C.save||C.load())+'</section>'+
 '<section><h4>'+t('incoming')+'</h4>'+describe(next)+'</section></div>'+
 '<p class="st-warning">'+t('overwrite')+'</p>'+
 '<div class="st-dialog-actions"><button type="button" data-transfer="cancel">'+t('cancel')+'</button>'+
 '<button type="button" class="st-confirm" data-transfer="confirm">'+t('confirm')+'</button></div></div>';
 C.root.appendChild(el);el.querySelector('[data-transfer="cancel"]').focus({preventScroll:true});
}
async function readFile(input){
 const file=input.files?.[0];input.value='';
 if(!file)return;
 if(file.size>MAX_BYTES){notify(t('tooLarge'));return;}
 try{const json=await file.text();showPreview(json,'file');}
 catch{notify(t('invalid')); }
}
function confirmImport(){
 if(!staged)return;
 const json=staged;
 // importData exige escribir y volver a leer correctamente el almacenamiento local.
 if(!C.importData(json)){dismiss();notify(t('saveFailed'));return;}
 dismiss();C.selected=Math.min(17,C.save.chapter);feedback=t('imported');C.renderHub();
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-transfer]');
 if(!b||!C.root?.contains(b))return;
 const act=b.dataset.transfer;
 if(act==='export'){download();}
 else if(act==='share'){share();}
 else if(act==='import'){const input=C.body.querySelector('#saveTransferInput');if(input){input.value='';input.click();}}
 else if(act==='restore'){const raw=C.backupData();if(raw){try{showPreview(raw,'backup');}catch{notify(t('invalid'));}}}
 else if(act==='cancel'){dismiss();}
 else if(act==='confirm'){confirmImport();}
});
document.addEventListener('change',e=>{if(e.target.id==='saveTransferInput'&&C.root?.contains(e.target))readFile(e.target);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&C.root?.querySelector('#saveTransferModal')){dismiss();e.stopPropagation();}},true);
document.addEventListener('DOMContentLoaded',()=>{
 const campaign=document.getElementById('campaignButton');
 if(!campaign||document.getElementById('saveManagerButton'))return;
 const btn=document.createElement('button');
 btn.id='saveManagerButton';btn.type='button';btn.className='save-manager-start';
 btn.setAttribute('data-i18n','saveTransfer.mainButton');btn.textContent=t('mainButton');
 campaign.insertAdjacentElement('afterend',btn);
 btn.addEventListener('click',()=>{
  C.open();C.screen='saves';C.renderHub();
 });
});
})();