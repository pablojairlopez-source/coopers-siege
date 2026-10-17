// Cooper's Siege 5.0 — Post-proceso de pantalla completa.
// · Gradación de color por mapa (exposición, contraste, saturación) con un único
//   backdrop-filter sobre las tres capas de canvas.
// · Tinte de sombras/luces y viñeta propios de cada escenario.
// · Bloom: copia reducida (1/4) del render 3D y de los efectos, umbralizada y
//   difuminada, sumada en modo «screen». Hace brillar lava, neón, explosiones,
//   proyectiles emisivos y relámpagos sin tocar la simulación.
// Se desactiva por niveles: Económico sin bloom ni filtros; Equilibrado sin bloom.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const post={enabled:true,bloomOn:false,level:3,map:-1,cv:null,ctx:null,grade:null,tint:null,last:0};

function el(tag,id,css){let e=document.getElementById(id);if(!e){e=document.createElement(tag);e.id=id;e.setAttribute('aria-hidden','true');Object.assign(e.style,css);const anchor=document.getElementById('effects');anchor.parentNode.insertBefore(e,anchor.nextSibling);}return e;}

post.init=function(){
 if(post.cv)return;
 const base={position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none'};
 post.cv=el('canvas','bloomLayer',{...base,zIndex:'3',mixBlendMode:'screen',opacity:'0'});
 post.ctx=post.cv.getContext('2d');
 post.tint=el('div','gradeTint',{...base,zIndex:'3',mixBlendMode:'soft-light'});
 post.grade=el('div','gradeFilter',{...base,zIndex:'3'});
};

// Aplica la gradación del mapa (llamar al cambiar de mapa o de preset gráfico).
post.apply=function(map,level){
 post.init();post.map=map;post.level=level;
 const g=(CS5.artFor(map).grade)||{};
 const strong=level>=2;
 post.bloomOn=level>=2&&(g.bloom||0)>0;
 post.cv.style.opacity=post.bloomOn?String(Math.min(.75,.32+(g.bloom||0)*.38)):'0';
 if(level<=0){post.grade.style.backdropFilter=post.grade.style.webkitBackdropFilter='none';post.grade.style.background='none';post.tint.style.background='none';return;}
 const f=`brightness(${(g.exposure||1).toFixed(3)}) contrast(${(g.contrast||1).toFixed(3)}) saturate(${(g.saturation||1).toFixed(3)})`;
 post.grade.style.backdropFilter=post.grade.style.webkitBackdropFilter=strong?f:'none';
 const v=g.vignette||.25;
 post.grade.style.background=`radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) ${Math.round(58-v*30)}%, rgba(0,0,0,${(v*.9).toFixed(2)}) 100%)`;
 post.tint.style.background=`linear-gradient(180deg, ${g.highlights||'#ffffff'}55 0%, rgba(128,128,128,0) 45%, ${g.shadows||'#000000'}66 100%)`;
};

post.resize=function(w,h){if(!post.cv)return;const bw=Math.max(64,Math.round(w/4)),bh=Math.max(36,Math.round(h/4));if(post.cv.width!==bw||post.cv.height!==bh){post.cv.width=bw;post.cv.height=bh;}};

// Bloom por frame. `sources` = canvas a umbralizar (render 3D y efectos).
post.frame=function(sources,time){
 if(!post.bloomOn||!post.ctx)return;
 // 30 Hz basta para el halo y ahorra la mitad del coste.
 if(time-post.last<1/32)return;post.last=time;
 const c=post.ctx,w=post.cv.width,h=post.cv.height;
 c.globalCompositeOperation='source-over';c.filter='none';c.clearRect(0,0,w,h);
 c.filter='brightness(.82) contrast(3.4) saturate(1.35) blur(3px)';
 for(const s of sources)if(s&&s.width)c.drawImage(s,0,0,w,h);
 c.filter='blur(6px)';c.globalCompositeOperation='lighter';c.globalAlpha=.6;c.drawImage(post.cv,0,0);
 c.globalAlpha=1;c.filter='none';c.globalCompositeOperation='source-over';
};

CS5.post=post;
})();
