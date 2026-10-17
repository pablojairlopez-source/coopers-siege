// Cooper's Siege 5.0 — Materiales procedurales del terreno destructible.
// Sustituye al relleno plano de 4.0: cada mapa tiene capas (superficie, subsuelo,
// interior), un patrón propio (arenisca, ladrillo, basalto, hielo, placas de acero,
// bizcocho…), detalles incrustados (vetas incandescentes, cristales, raíces,
// fósiles, tuberías) y decoración que sobresale de la superficie (hierba, nieve,
// coral, glaseado). Todo se recalcula solo en el rectángulo afectado por una
// explosión, así que los cráteres revelan el interior del material.
// La decoración es puramente visual: la colisión sigue usando la máscara.
(function(){
'use strict';
const CS5=window.CS5=window.CS5||{};
const TS=256;

// --- Texturas de ruido periódicas (256×256) generadas una sola vez ----------
function lattice(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function valueTile(seed,cell){
 const r=lattice(seed),g=TS/cell,grid=new Float32Array(g*g);for(let i=0;i<grid.length;i++)grid[i]=r();
 const out=new Float32Array(TS*TS),s=t=>t*t*(3-2*t);
 for(let y=0;y<TS;y++){const gy=y/cell,iy=Math.floor(gy),fy=s(gy-iy),y0=(iy%g)*g,y1=((iy+1)%g)*g;
  for(let x=0;x<TS;x++){const gx=x/cell,ix=Math.floor(gx),fx=s(gx-ix),x0=ix%g,x1=(ix+1)%g;
   const a=grid[y0+x0],b=grid[y0+x1],c=grid[y1+x0],d=grid[y1+x1];
   out[y*TS+x]=a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;}}
 return out;
}
function fbmTile(seed){
 const out=new Float32Array(TS*TS);let amp=1,norm=0;
 for(const cell of [64,32,16,8,4]){const t=valueTile(seed+cell*7,cell);for(let i=0;i<out.length;i++)out[i]+=t[i]*amp;norm+=amp;amp*=.52;}
 for(let i=0;i<out.length;i++)out[i]/=norm;
 // Normaliza al rango 0..1 completo.
 let mn=1,mx=0;for(const v of out){if(v<mn)mn=v;if(v>mx)mx=v;}
 for(let i=0;i<out.length;i++)out[i]=(out[i]-mn)/(mx-mn);
 return out;
}
// Voronoi periódico: borde entre celdas (F2−F1) e identificador de celda.
function voronoiTile(seed,cells){
 const r=lattice(seed),size=TS/cells,pts=[];
 for(let j=0;j<cells;j++)for(let i=0;i<cells;i++)pts.push([(i+.15+r()*.7)*size,(j+.15+r()*.7)*size]);
 const edge=new Float32Array(TS*TS),id=new Uint16Array(TS*TS);
 for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){
  const cx=Math.floor(x/size),cy=Math.floor(y/size);let f1=1e9,f2=1e9,best=0;
  for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
   const gx=(cx+ox+cells)%cells,gy=(cy+oy+cells)%cells,p=pts[gy*cells+gx];
   const px=p[0]+(cx+ox-gx)*size,py=p[1]+(cy+oy-gy)*size,dd=(px-x)**2+(py-y)**2;
   if(dd<f1){f2=f1;f1=dd;best=gy*cells+gx;}else if(dd<f2)f2=dd;}
  edge[y*TS+x]=Math.min(1,(Math.sqrt(f2)-Math.sqrt(f1))/size*2.2);id[y*TS+x]=best;
 }
 return {edge,id};
}
let tiles=null;
function ensureTiles(){
 if(tiles)return tiles;
 tiles={a:fbmTile(1301),b:fbmTile(7717),c:fbmTile(4441),vor:voronoiTile(9091,16),vorBig:voronoiTile(5113,8)};
 return tiles;
}
const hexCache=new Map();
function rgb(hex){let v=hexCache.get(hex);if(!v){v=[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];hexCache.set(hex,v);}return v;}
const hash2=(x,y)=>{let h=Math.imul(x+0x9E37,374761393)^Math.imul(y+0x7F4A,668265263);h=Math.imul(h^h>>>13,1274126177);return (h^h>>>16)>>>0;};
// Muestreo bilineal (para vetas y raíces finas sin escalones).
const bl=(tile,fx,fy)=>{const x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0,a=tile[((y0&255)<<8)|(x0&255)],b=tile[((y0&255)<<8)|((x0+1)&255)],c=tile[(((y0+1)&255)<<8)|(x0&255)],d=tile[(((y0+1)&255)<<8)|((x0+1)&255)];return a+(b-a)*tx+(c-a)*ty+(a-b-c+d)*tx*ty;};
const sstep=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};

// Patrones del interior: devuelven un multiplicador de brillo (~1) y pueden
// teñir el color a través de `tint` (0 = sin cambio).
const PATTERNS={
 sandstone(x,y,T){const warp=T.a[(((y>>2)&255)<<8)|((x>>2)&255)];const band=Math.sin((y+warp*38)*.21);return 1+.09*band+.07*(T.b[((y&255)<<8)|(x&255)]-.5);},
 concrete(x,y,T){const seam=(x%64<2||y%40<2)?.78:1;return seam*(1+.12*(T.b[((y&255)<<8)|(x&255)]-.5)+((hash2(x,y)&31)===0?-.12:0));},
 basalt(x,y,T){const e=T.vor.edge[(((y>>2)&255)<<8)|(x&255)];return (e<.12?.62:1)*(1+.1*(T.a[((y&255)<<8)|((x*2)&255)]-.5));},
 ice(x,y,T){const s=T.a[(((y>>3)&255)<<8)|((x>>1)&255)];const crack=1-Math.abs(2*T.b[(((y>>1)&255)<<8)|((x>>1)&255)]-1);return 1+.16*(s-.5)+(crack>.93?.28:0);},
 cells(x,y,T){const e=T.vor.edge[((y&255)<<8)|(x&255)];return e<.1?1.32:(1+.08*(T.a[((y&255)<<8)|(x&255)]-.5)-(e>.6?.08:0));},
 bricks(x,y,T){const row=Math.floor(y/22),bx=x+(row&1)*22,col=Math.floor(bx/44),my=y%22,mx=bx%44;
  if(my<2||mx<2)return .62;const id=hash2(col,row);return (my<4||mx<4?1.1:1)*(.9+(id&15)/80)+.05*(T.b[((y&255)<<8)|(x&255)]-.5);},
 craters(x,y,T){const e=T.vorBig.edge[(((y>>1)&255)<<8)|((x>>1)&255)];return (e>.55&&e<.62?1.18:e>.62?.86:1)*(1+.1*(T.b[((y&255)<<8)|(x&255)]-.5));},
 soil(x,y,T){return .92+.22*T.a[((y&255)<<8)|(x&255)]+.08*(T.c[(((y>>1)&255)<<8)|((x>>1)&255)]-.5);},
 rubble(x,y,T){const v=T.vor,k=(((y>>1)&255)<<8)|((x>>1)&255);return (v.edge[k]<.1?.6:.88+(v.id[k]%7)*.04)+.06*(T.b[((y&255)<<8)|(x&255)]-.5);},
 terraces(x,y,T){const k=(((y>>1)&255)<<8)|((x>>2)&255);return (T.vor.edge[k]<.09?.66:.94+(T.vor.id[k]%5)*.03)+.06*(T.a[((y&255)<<8)|(x&255)]-.5);},
 marble(x,y,T){const v=Math.sin(x*.018+y*.006+T.a[(((y>>1)&255)<<8)|((x>>1)&255)]*9);return 1+(Math.abs(v)<.06?.3:0)+.05*(T.c[((y&255)<<8)|(x&255)]-.5);},
 plates(x,y,T){const px=x%64,py=y%40;let p=(px<2||py<2)?.6:(px<4||py<4)?1.12:1;const rx=px-6,ry=py-6,rx2=px-58;if((rx*rx+ry*ry<5)||(rx2*rx2+ry*ry<5))p=1.35;return p+.05*(T.b[((y&255)<<8)|(x&255)]-.5);},
 obsidian(x,y,T){const k=((y&255)<<8)|(x&255),e=T.vor.edge[k];return e<.08?1.45:(.86+(T.vor.id[k]%9)*.035);},
 // Corteza retorcida: fibras diagonales onduladas con nudos.
 bark(x,y,T){const w=T.a[(((y>>2)&255)<<8)|((x>>2)&255)],f=Math.sin(x*.16+y*.42+w*9),knot=T.vorBig.edge[(((y>>1)&255)<<8)|((x>>1)&255)];return (Math.abs(f)<.18?.72:1)*(knot<.06?.7:1)+.08*(T.b[((y&255)<<8)|(x&255)]-.5);},
 cake(x,y,T){const wave=Math.sin(x*.05)*3+T.a[((y&255)<<8)|((x>>1)&255)]*4,band=(y+wave)%30;const pore=(hash2(x>>1,y>>1)%23===0)?.8:1;return band<8?1.35:pore*(1+.06*(T.b[((y&255)<<8)|(x&255)]-.5));}
};

CS5.paintTerrain=function(t,rect,W,H,WATER,mapIndex){
 const T=ensureTiles(),art=CS5.artFor(mapIndex),M=art.terrain,mask=t.mask,d=t.imageData.data;
 const top=rgb(M.top.color),hi=rgb(M.top.hi||M.top.color),sub=rgb(M.sub.color),mid=rgb(M.mid),deep=rgb(M.deep);
 const pattern=PATTERNS[M.pattern]||PATTERNS.soil,deco=M.top.deco;
 const thornCol=rgb(M.top.thorn||'#3a1e26');
 const acc={};for(const a of M.accents||[])acc[a.type]=a;
 const vein=acc.veins,veinCol=vein?rgb(vein.color):null,veinGlow=vein?rgb(vein.glow||vein.color):null;
 const ys=Math.max(0,rect.y1-96),ye=Math.min(H-1,rect.y2+28);
 const dTop=new Int16Array(H),dBot=new Int16Array(H),aDist=new Int16Array(H);
 const sprites=['pebbles','shells','sprinkles','gems','fossils','bones','barnacles','embers','crystals'].filter(k=>acc[k]).map(k=>({k,...acc[k],rgb:rgb(acc[k].color),glow:acc[k].glow?rgb(acc[k].glow):null}));
 const topBase=M.top.depth,subD=M.sub.depth,nSprites=sprites.length;
 // Chamuscados de cráteres que tocan este rectángulo (src/effects/destruction.js).
 const scorches=(t.scorches||[]).filter(s=>s.x+s.r*1.6>=rect.x1&&s.x-s.r*1.6<=rect.x2&&s.y+s.r*1.6>=rect.y1&&s.y-s.r*1.6<=rect.y2).map(s=>({...s,st:(CS5.fx&&CS5.fx.SCORCH[s.style])||{color:[22,16,14],strength:.7}}));
 const nScorch=scorches.length;
 const out=[0,0,0];
 for(let x=rect.x1;x<=rect.x2;x++){
  // Pasada descendente: profundidad desde el aire superior.
  let run=ys>0&&mask[ys*W+x]?48:-1;
  for(let y=ys;y<=ye;y++){if(mask[y*W+x]){run=run<0?0:Math.min(run+1,1000);dTop[y]=run;}else{run=-1;dTop[y]=-1;}}
  // Pasada ascendente: distancia al aire inferior (sólido) o al suelo inferior (aire).
  let below=ye<H-1&&mask[(ye+1)*W+x]?40:-1,air=99;
  for(let y=ye;y>=ys;y--){if(mask[y*W+x]){below=below<0?0:Math.min(below+1,40);dBot[y]=below;air=0;}else{below=-1;air=air<99?air+1:99;aDist[y]=air;}}
  // Variación por columna de la capa superior (ondulaciones, goteos de glaseado).
  const ch=hash2(x,77);
  let topD=topBase+Math.round((T.a[(x>>1)&255]-.5)*4);
  if(deco==='frosting'&&(ch%11)<3)topD+=6+(ch>>5)%18;
  const spike=deco==='thorns'&&(ch%13)<3;
  const bladeH=deco==='thorns'?(spike?5+((ch>>4)&3):1+((ch>>3)&1)):deco==='grass'?(2+((ch>>3)&7))*(T.b[(x>>2)&255]>.35?1:.45):deco==='moss'?1+((ch>>4)&3):deco==='petals'?1+((ch>>4)&3):deco==='snow'?2+Math.round(T.a[((x>>3)&255)]*4):deco==='coral'?(T.c[(x>>2)&255]>.58?3+((ch>>2)&7):0):deco==='rubble'?((T.b[(x*3)&255]>.62)?1+((ch>>6)&1):0):0;
  const bladeOn=deco==='thorns'?true:deco==='grass'?(ch&3)!==0:deco==='coral'?true:deco==='snow'||deco==='rubble'?true:(ch&1)===0;
  const mushroom=acc.mushrooms&&(ch%97)===0;
  for(let y=rect.y1;y<=rect.y2;y++){
   const i=y*W+x,j=i*4;
   if(!mask[i]){
    // Decoración que sobresale de la superficie (solo visual).
    const a=aDist[y];let painted=false;
    // Sin hierba/nieve/coral dentro de un cráter chamuscado.
    let burnt=false;for(let si=0;si<nScorch;si++){const s=scorches[si];if((x-s.x)**2+(y-s.y)**2<(s.r*1.3)**2){burnt=true;break;}}
    if(a<=12&&a>0&&!burnt){
     if(bladeOn&&a<=bladeH){
      const k=a/Math.max(1,bladeH);
      if(deco==='snow'){const s=1-.18*k;out[0]=245*s;out[1]=250*s;out[2]=255;}
      else if(deco==='coral'){const c=(x>>4)%3;const base=c===0?[255,128,110]:c===1?[255,180,90]:[200,110,220];const s=.75+.35*k;out[0]=base[0]*s;out[1]=base[1]*s;out[2]=base[2]*s;if(hash2(x,y)%3===0){d[j+3]=0;continue;}}
      else if(spike){const s=.8+.35*k;out[0]=thornCol[0]*s;out[1]=thornCol[1]*s;out[2]=thornCol[2]*s;}
      else if(deco==='rubble'){const s=.8+.2*(hash2(x,y)&3)/3;out[0]=mid[0]*s*1.25;out[1]=mid[1]*s*1.25;out[2]=mid[2]*s*1.25;}
      else{out[0]=top[0]+(hi[0]-top[0])*k;out[1]=top[1]+(hi[1]-top[1])*k;out[2]=top[2]+(hi[2]-top[2])*k;const sh=.72+.28*k;out[0]*=sh;out[1]*=sh;out[2]*=sh;}
      painted=true;
     }else if(mushroom&&a<=6){
      if(a>=5){out[0]=255;out[1]=96;out[2]=84;}else if(a===4){out[0]=255;out[1]=230;out[2]=220;}else{out[0]=232;out[1]=220;out[2]=200;}
      painted=a<=3?(x%97)<2||true:true;
     }else if(deco==='petals'&&a<=2&&hash2(x,y)%17===0){out[0]=255;out[1]=170;out[2]=205;painted=true;}
     else if(deco==='spores'&&a>2&&hash2(x,y)%420===0){out[0]=220;out[1]=255;out[2]=170;painted=true;}
    }
    if(painted){d[j]=out[0];d[j+1]=out[1];d[j+2]=out[2];d[j+3]=255;}else{d[j]=d[j+1]=d[j+2]=d[j+3]=0;}
    continue;
   }
   const dt=dTop[y],db=dBot[y];
   let r,g,b;
   if(dt<topD){
    // Capa superior con su estilo propio.
    const k=dt<2?1:0;
    if(deco==='neon'&&dt<2){r=hi[0];g=hi[1];b=hi[2];}
    else if(deco==='hazard'&&dt>=1){const stripe=((x+y)>>3)&1;r=stripe?hi[0]:30;g=stripe?hi[1]:30;b=stripe?hi[2]:34;}
    else if(deco==='planks'){const seam=(x%26)<1||dt===topD-1;r=seam?top[0]*.55:top[0];g=seam?top[1]*.55:top[1];b=seam?top[2]*.55:top[2];const grain=.9+.2*T.c[((y&255)<<8)|((x*3)&255)];r*=grain;g*=grain;b*=grain;}
    else if(deco==='sand'){const rip=1+.07*Math.sin(x*.42+T.a[((y&255)<<8)|((x>>1)&255)]*5);r=top[0]*rip;g=top[1]*rip;b=top[2]*rip;}
    else{const f=k?.5:0;r=top[0]+(hi[0]-top[0])*f;g=top[1]+(hi[1]-top[1])*f;b=top[2]+(hi[2]-top[2])*f;}
    if(deco==='petals'&&dt<2&&hash2(x,y)%9===0){r=255;g=175;b=210;}
    const n=.92+.16*T.b[((y&255)<<8)|(x&255)];r*=n;g*=n;b*=n;
   }else if(dt<topD+subD){
    const k=(dt-topD)/subD,p=pattern(x,y,T)*.5+.5;
    r=(sub[0]+(mid[0]-sub[0])*k*.4)*p;g=(sub[1]+(mid[1]-sub[1])*k*.4)*p;b=(sub[2]+(mid[2]-sub[2])*k*.4)*p;
   }else{
    const k=sstep(0,170,dt-topD-subD)*.85+.15*T.c[(((y>>2)&255)<<8)|((x>>2)&255)];
    const p=pattern(x,y,T);
    r=(mid[0]+(deep[0]-mid[0])*k)*p;g=(mid[1]+(deep[1]-mid[1])*k)*p;b=(mid[2]+(deep[2]-mid[2])*k)*p;
    // Bandas de pastel: capas de crema y bizcocho alternas.
    if(M.pattern==='cake'&&p>1.3){r=255;g=238;b=246;}
   }
   // Raíces cerca de la superficie.
   if(acc.roots&&dt>=topD&&dt<40){const rr=1-Math.abs(2*bl(T.c,x*.45+y*.12,y*.3)-1);if(rr>.985-acc.roots.density*.012){const c=rgb(acc.roots.color);r=c[0];g=c[1];b=c[2];}}
   // Musgo sobre la mampostería.
   if(acc.moss&&dt<22&&T.a[(((y>>1)&255)<<8)|((x>>1)&255)]>.62){const c=rgb(acc.moss.color),s=.85+.3*T.b[((y&255)<<8)|(x&255)];r=c[0]*s;g=c[1]*s;b=c[2]*s;}
   // Ventanas iluminadas (edificios del distrito neón).
   if(acc.windows&&dt>16){const wx=x%18,wy=y%26,on=hash2((x/18)|0,(y/26)|0)%5<2;if(wx>5&&wx<12&&wy>6&&wy<17){if(on){const c=rgb(acc.windows.color);r=c[0];g=c[1];b=c[2];}else{r*=.55;g*=.55;b*=.6;}}}
   // Tuberías horizontales con volumen.
   if(acc.pipes&&dt>24){const row=Math.floor(y/96),py=y%96;if(py>40&&py<50&&hash2(row,(x>>7))%3===0){const c=rgb(acc.pipes.color),s=.6+.5*Math.sin((py-40)/10*Math.PI);r=c[0]*s;g=c[1]*s;b=c[2]*s;}}
   // Placas metálicas sueltas.
   if(acc.plates&&dt>8){const k=(((y>>1)&255)<<8)|((x>>1)&255);if(T.vorBig.id[k]%11<2){const c=rgb(acc.plates.color),e=T.vorBig.edge[k];const s=e<.08?.55:1+.08*(T.b[((y&255)<<8)|(x&255)]-.5);r=c[0]*s;g=c[1]*s;b=c[2]*s;}}
   // Vetas incandescentes / cristalinas (lava, hielo, plasma).
   if(vein&&dt>=topD){const v=1-Math.abs(2*bl(T.b,x*.33+y*.11+T.a[(((y>>4)&255)<<8)|((x>>4)&255)]*30,y*.33)-1);if(v>vein.density){const k=(v-vein.density)/(1-vein.density);const core=k>.55;r=core?veinGlow[0]:veinCol[0];g=core?veinGlow[1]:veinCol[1];b=core?veinGlow[2]:veinCol[2];}}
   // Detalles incrustados: guijarros, conchas, fósiles, cristales, virutas…
   if(dt>=topD-1&&nSprites)for(let si=0;si<nSprites;si++){const s=sprites[si];
    const cx=x>>3,cy=y>>3,h=hash2(cx*3+s.k.length,cy*5+s.k.charCodeAt(0));
    if((h%100000)/100000<s.density*22){
     const ox=(cx<<3)+2+((h>>8)&3),oy=(cy<<3)+2+((h>>12)&3),rad=s.k==='sprinkles'?1.6:s.k==='crystals'?2.6+((h>>16)&3):s.k==='fossils'?3.4:1.2+((h>>16)&3)*.5;
     const dx=x-ox,dy=y-oy;
     const inside=s.k==='crystals'?(Math.abs(dx)*1.4+Math.abs(dy)*.8<rad):s.k==='sprinkles'?(Math.abs(dx-dy*((h>>20)&1?1:-1)*.5)<.9&&Math.abs(dy)<2.5):(dx*dx+dy*dy<rad*rad);
     if(inside){
      if(s.k==='sprinkles'){const pal=[[255,90,140],[90,220,255],[255,230,90],[150,255,150],[255,255,255]][h%5];r=pal[0];g=pal[1];b=pal[2];}
      else if(s.k==='fossils'){const ring=Math.abs(Math.sqrt(dx*dx+dy*dy)-2.2)<.7;r=ring?s.rgb[0]:s.rgb[0]*.8;g=ring?s.rgb[1]:s.rgb[1]*.8;b=ring?s.rgb[2]:s.rgb[2]*.8;}
      else{const shade=.78+.3*Math.max(0,-dy/rad);const glow=s.glow&&Math.abs(dx)+Math.abs(dy)<rad*.5;r=(glow?s.glow[0]:s.rgb[0])*shade;g=(glow?s.glow[1]:s.rgb[1])*shade;b=(glow?s.glow[2]:s.rgb[2])*shade;}
     }
    }
   }
   // Varillas de acero en el hormigón.
   if(acc.rebar&&dt>20){const h=hash2(x>>5,y>>6);if(h%9===0&&Math.abs(((x+((y*(h&1?1:-1))>>2))&31)-16)<1){const c=rgb(acc.rebar.color);r=c[0];g=c[1];b=c[2];}}
   // Borde del cráter chamuscado (carbón, escarcha, ácido, plasma, oro…), con borde ruidoso.
   for(let si=0;si<nScorch;si++){const s=scorches[si],dx=x-s.x,dy=y-s.y,d=Math.sqrt(dx*dx+dy*dy);if(d>s.r*1.55)continue;const n=T.a[((y&255)<<8)|(x&255)];let k=1.25-(d-s.r*.95)/(s.r*.55)+(n-.5)*.7;if(k<=0)continue;k=Math.min(1,k)*s.st.strength;const sc=s.st.color;r+=(sc[0]-r)*k;g+=(sc[1]-g)*k;b+=(sc[2]-b)*k;if(s.st.glow&&d<s.r*1.05&&n>.62){const gl=s.st.glow;r=gl[0];g=gl[1];b=gl[2];}}
   // Oclusión ambiental: techos de cuevas, bordes laterales y profundidad.
   let ao=1;
   if(db<16)ao*=.5+.5*(db/16);
   const side=((x>=2&&!mask[i-2])||(x<W-2&&!mask[i+2]))?2:((x>=4&&!mask[i-4])||(x<W-4&&!mask[i+4]))?4:((x>=7&&!mask[i-7])||(x<W-7&&!mask[i+7]))?7:9;
   ao*=.74+.26*Math.min(1,side/8);
   ao*=1-.28*sstep(60,300,dt);
   if(dt<2&&deco!=='neon'&&deco!=='hazard')ao*=1.14;
   const grain=((hash2(x,y)&15)-7.5)*1.4;
   d[j]=Math.max(0,Math.min(255,r*ao+grain));d[j+1]=Math.max(0,Math.min(255,g*ao+grain));d[j+2]=Math.max(0,Math.min(255,b*ao+grain));d[j+3]=255;
  }
 }
};
CS5.terrainMaterialTiles=ensureTiles;
})();
