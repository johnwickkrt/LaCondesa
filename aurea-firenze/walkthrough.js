'use strict';
/**
 * AUREA FIRENZE · Recorrido arquitectónico continuo
 * Cámara virtual controlada mediante scroll, renderizada en Canvas 2D.
 * Sin vídeo remoto, librerías externas ni servicios sujetos a facturación.
 * No se presenta como una reconstrucción fotográfica del restaurante.
 */
(() => {
  const section = document.querySelector('.walkthrough');
  const canvas = document.getElementById('walkCanvas');
  if (!section || !canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const copy = document.getElementById('walkCopy');
  const title = document.getElementById('walkTitle');
  const eyebrow = document.getElementById('walkEyebrow');
  const desc = document.getElementById('walkDescription');
  const primary = document.getElementById('walkPrimary');
  const counter = document.getElementById('walkCounter');
  const progressBar = document.getElementById('walkProgress');
  const progressFill = document.getElementById('walkProgressFill');
  const waypoints = [...document.querySelectorAll('[data-walk-stop]')];
  const stops = [
    { eyebrow:'EL UMBRAL · CAPÍTULO I',title:'Las puertas de<br><em>otra época.</em>',body:'Cruza el umbral de un lugar donde el arte renacentista y la gastronomía se encuentran en cada detalle.',action:'Conoce nuestra historia',url:'#concepto' },
    { eyebrow:'LA GALERÍA · CAPÍTULO II',title:'El arte se<br><em>puede habitar.</em>',body:'Arcos, luz dorada y pequeñas obras maestras marcan el camino hacia una experiencia fuera del tiempo.',action:'Nuestra inspiración',url:'#concepto' },
    { eyebrow:'EL COMEDOR · CAPÍTULO III',title:'Cada mesa,<br><em>un encuentro.</em>',body:'Avanza entre salones y descubre el escenario donde una comida se transforma en un recuerdo.',action:'Descubre la carta',url:'#carta' },
    { eyebrow:'LA MESA DE AUTOR · CAPÍTULO IV',title:'Una estación,<br><em>mil sabores.</em>',body:'La cocina celebra los colores de la temporada en cada plato. Pasa, toma asiento y déjate sorprender.',action:'Ver platillos de temporada',url:'#temporada' },
    { eyebrow:'EL SALÓN PRIVADO · CAPÍTULO V',title:'Los momentos<br><em>merecen arte.</em>',body:'Hay ocasiones especiales que piden su propio escenario. Diseñemos una celebración verdaderamente tuya.',action:'Organizar mi evento',url:'#experiencias' },
    { eyebrow:'TU VISITA · CAPÍTULO VI',title:'Tu historia<br><em>continúa aquí.</em>',body:'Has recorrido nuestra casa. Ahora solo falta lo más importante: compartirla contigo.',action:'Planear mi visita',url:'#ubicacion' }
  ];
  let width = 0, height = 0, cameraZ = 0, cameraX = 0, ox = 0, oy = 0, focal = 0, active = -1, requested = false;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const maxTravel = 68;
  const corridorW = 4.65, ceiling = 6.2, eyeY = 2.35;
  const project = (x,y,z) => {
    const depth = z - cameraZ;
    if (depth <= .46) return null;
    const factor = focal / (depth + 1.5);
    return {x:ox + (x-cameraX)*factor, y:oy-(y-eyeY)*factor,scale:factor,depth};
  };
  const poly = (points, fill, stroke, line=1) => {
    if (points.some(p=>!p))return;
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill()}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke()}
  };
  const quad = (a,b,c,d,fill,stroke,line) => poly([project(...a),project(...b),project(...c),project(...d)],fill,stroke,line);
  const line3 = (a,b,color,line=1) => {
    const p=project(...a),q=project(...b);if(!p||!q)return;
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.lineWidth=line;ctx.strokeStyle=color;ctx.stroke();
  };
  const ellipse3 = (cx,cy,cz,rx,rz,fill,stroke,line=1) => {
    const pts=[];
    for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;pts.push(project(cx+Math.cos(a)*rx,cy,cz+Math.sin(a)*rz))}
    poly(pts,fill,stroke,line);
  };
  const glow = (x,y,r,rgba) => {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba);g.addColorStop(1,'rgba(248,203,130,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  };
  const glowAt = (x,y,z,r=100) => {
    const p=project(x,y,z);if(!p)return;
    const rr=Math.min(380,r*Math.min(p.scale/75,2.2));
    if(rr>2)glow(p.x,p.y,rr,'rgba(247,190,99,.19)');
  };

  function renderBackdrop() {
    const bg=ctx.createLinearGradient(0,0,width,height);
    bg.addColorStop(0,'#292d27');bg.addColorStop(.33,'#454237');bg.addColorStop(.65,'#655642');bg.addColorStop(1,'#1d2922');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    const light=ctx.createRadialGradient(ox,oy-25,10,ox,oy-25,height*.88);
    light.addColorStop(0,'rgba(251,218,166,.53)');light.addColorStop(.35,'rgba(223,182,124,.18)');light.addColorStop(1,'rgba(34,35,29,0)');ctx.fillStyle=light;ctx.fillRect(0,0,width,height);
    const p=project(0,2,88);if(p){glow(p.x,p.y,Math.min(500,height*.36),'rgba(255,223,161,.34)')}
  }
  function renderCell(z) {
    const far=z+6, near=Math.max(cameraZ+.62,z);
    if(far<=cameraZ+.62)return;
    const m=Math.floor(z/12);
    const shade=(m%2===0);
    quad([-corridorW,0,near],[corridorW,0,near],[corridorW,0,far],[-corridorW,0,far],shade?'#897460':'#82715e');
    quad([-corridorW,ceiling,near],[-corridorW,ceiling,far],[corridorW,ceiling,far],[corridorW,ceiling,near],shade?'#3b3a32':'#484039');
    quad([-corridorW,0,near],[-corridorW,0,far],[-corridorW,ceiling,far],[-corridorW,ceiling,near],shade?'#8b806a':'#958671');
    quad([corridorW,0,far],[corridorW,0,near],[corridorW,ceiling,near],[corridorW,ceiling,far],shade?'#665c4d':'#736653');
    quad([-corridorW,.02,near],[corridorW,.02,near],[corridorW,.02,far],[-corridorW,.02,far],'rgba(53,41,37,.19)');
    // Directional wall lambris + gold cornice run through all rooms.
    [-1,1].forEach(side=>{
      const x=side*corridorW;
      line3([x,1.15,near],[x,1.15,far],'rgba(61,43,36,.8)',3);
      line3([x,1.31,near],[x,1.31,far],'rgba(221,191,139,.5)',1.7);
      line3([x,5.28,near],[x,5.28,far],'rgba(235,196,126,.63)',2.2);
      line3([x,5.4,near],[x,5.4,far],'rgba(74,45,30,.7)',3);
    });
    // Fuga de mármol y tablero de suelo.
    for(let x=-corridorW;x<=corridorW+.1;x+=1.16)line3([x,.025,near],[x,.025,far],'rgba(244,211,165,.23)',1);
    [z,z+3,z+6].forEach(at=>{if(at>cameraZ+.62)line3([-corridorW,.028,at],[corridorW,.028,at],'rgba(245,209,160,.33)',1.3)});
    if(z>cameraZ+1){
      // Cofres de madera y pequeñas molduras en el techo.
      quad([-3.4,ceiling-.015,z+.4],[3.4,ceiling-.015,z+.4],[3.4,ceiling-.015,z+5.5],[-3.4,ceiling-.015,z+5.5],null,'rgba(218,176,117,.36)',1.5);
      line3([-corridorW,ceiling,z+.15],[corridorW,ceiling,z+.15],'rgba(19,24,22,.8)',3);
    }
    if(z >= 24 && z <= 66){
      const a=Math.max(cameraZ+.7,z),b=z+6;
      if(b>a){quad([-1.8,.035,a],[1.8,.035,a],[1.8,.035,b],[-1.8,.035,b],'rgba(83,41,47,.63)');
      line3([-1.6,.04,a],[-1.6,.04,b],'rgba(229,190,127,.83)',2);line3([1.6,.04,a],[1.6,.04,b],'rgba(229,190,127,.83)',2)}
    }
  }
  function renderDoor(z) {
    if(z<=cameraZ+.6)return;
    // Atrio iluminado que se ve tras el arco, sin cambiar de cámara.
    quad([-2.7,0,z],[2.7,0,z],[2.7,4.65,z],[-2.7,4.65,z],'#b6a181','#e4c990',1.4);
    quad([-2.3,.25,z+.03],[2.3,.25,z+.03],[2.3,4.15,z+.03],[-2.3,4.15,z+.03],'#4e5447');
    const p=project(0,3.5,z);if(p)glow(p.x,p.y,Math.min(260,p.scale*2.7),'rgba(255,224,164,.3)');
    line3([0,0,z+1],[0,4.2,z+1],'rgba(237,202,145,.65)',2);
    line3([-2.3,2.1,z+1],[2.3,2.1,z+1],'rgba(237,202,145,.5)',2);
  }
  function renderArch(z) {
    if(z<cameraZ+.58)return;
    const p=project(0,4,z);if(!p)return;
    const factor=Math.max(.35,Math.min(9,p.scale/90));
    // Pilastras cuadrangulares con basas y capiteles.
    [-1,1].forEach(side=>{
      const inner=side*3.95,outer=side*4.65;
      quad([inner,0,z],[outer,0,z],[outer,4.55,z],[inner,4.55,z],'#8b775e','#c0a57c',1);
      for(let i=1;i<4;i++){const x=inner+(outer-inner)*i/4;line3([x,.22,z-.03],[x,4.31,z-.03],'rgba(229,198,147,.61)',Math.max(.6,factor))}
      quad([side*3.82,4.25,z],[side*4.78,4.25,z],[side*4.78,4.54,z],[side*3.82,4.54,z],'#c6a775','#7c6343',factor);
      quad([side*3.77,.12,z],[side*4.83,.12,z],[side*4.83,.37,z],[side*3.77,.37,z],'#b89f7c');
    });
    const points=[];const outer=[];
    for(let i=0;i<=35;i++){
      const x=-4.06 + (8.12*i/35),norm=x/4.06;
      points.push(project(x,4.15+1.83*Math.sqrt(Math.max(0,1-norm*norm)),z));
      outer.push(project(x,4.25+1.99*Math.sqrt(Math.max(0,1-norm*norm)),z));
    }
    const trace=(arr,col,w)=>{if(arr.some(p=>!p))return;ctx.beginPath();ctx.moveTo(arr[0].x,arr[0].y);arr.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.strokeStyle=col;ctx.lineWidth=w;ctx.stroke()};
    trace(outer,'#513e31',Math.max(2,24*factor));trace(points,'#f1d7a1',Math.max(2.1,3.7*factor));
    const key=project(0,6.14,z);if(key){ctx.save();ctx.translate(key.x,key.y);ctx.rotate(Math.PI/4);ctx.fillStyle='#e9c989';const sz=Math.min(29,factor*8);ctx.fillRect(-sz/2,-sz/2,sz,sz);ctx.restore()}
  }
  function renderPainting(z,side,variant=0) {
    if(z+3<cameraZ+.6)return;
    const x=side*(corridorW-.035),s=side;
    // Perspectiva natural, cuadros sobre el muro lateral.
    quad([x,1.86,z],[x,1.86,z+3.65],[x,4.7,z+3.65],[x,4.7,z],'#6c4c37','#eac68c',4);
    quad([x-s*.025,2.03,z+.18],[x-s*.025,2.03,z+3.47],[x-s*.025,4.53,z+3.47],[x-s*.025,4.53,z+.18],variant%2?'#414d41':'#6f493c','#dbc18e',1.5);
    // Medallón renacentista con silueta dentro del marco.
    const a=project(x-s*.04,3.67,z+1.8),b=project(x-s*.04,2.6,z+1.8);
    if(!a||!b)return;
    const rr=Math.min(44,Math.abs(a.y-b.y)*.43);
    if(rr>1.2){
      ctx.beginPath();ctx.ellipse(a.x,a.y,rr*.82,rr,0,0,Math.PI*2);ctx.fillStyle=variant%2?'#a99772':'#bd986c';ctx.fill();ctx.strokeStyle='#e3c58e';ctx.lineWidth=1.3;ctx.stroke();
      // Cabeza en perfil y ropaje. Ilustración, no retrato real.
      ctx.beginPath();ctx.ellipse(b.x,b.y-rr*.4,rr*.42,rr*.48,side*.2,0,Math.PI*2);ctx.fillStyle='#dfbb91';ctx.fill();
      ctx.beginPath();ctx.ellipse(b.x,b.y+rr*.36,rr*.74,rr*.44,0,Math.PI,0);ctx.fillStyle=variant%2?'#643f38':'#435346';ctx.fill();
    }
    line3([x,1.66,z+.1],[x,1.66,z+3.6],'rgba(245,208,145,.32)',2);
  }
  function renderSconce(z,side) {
    const x=side*4.4, p=project(x,3.75,z);if(!p)return;
    const s=Math.min(8,p.scale*.018);glow(p.x,p.y,Math.min(160,s*19),'rgba(255,192,101,.34)');
    ctx.fillStyle='#e5be80';ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(1,s*.7),Math.max(2,s*1.8),0,0,Math.PI*2);ctx.fill();
  }
  function renderChandelier(z) {
    if(z<cameraZ+.7)return;
    line3([0,ceiling,z],[0,4.98,z],'#e8c996',2);
    const center=project(0,4.92,z);if(!center)return;
    const r=Math.min(54,center.scale*.62);
    if(r<2)return;
    ctx.beginPath();ctx.ellipse(center.x,center.y,r,r*.22,0,0,Math.PI*2);ctx.strokeStyle='#e9c78b';ctx.lineWidth=Math.max(1,r*.075);ctx.stroke();
    [-.72,-.36,0,.36,.72].forEach(k=>{
      const px=center.x+r*k,py=center.y+(Math.abs(k)*r*.18);
      glow(px,py,Math.max(17,r*.78),'rgba(248,193,99,.2)');
      ctx.beginPath();ctx.arc(px,py,Math.max(1.7,r*.07),0,Math.PI*2);ctx.fillStyle='#ffdb92';ctx.fill();
    });
  }
  function renderTable(z,x,variant=0) {
    if(z+1.6<cameraZ+.7)return;
    const y=.92;let tone = variant%2?'#705344':'#664b3b';
    line3([x-.84,.08,z],[x-.84,y,z],'rgba(37,31,26,.8)',Math.max(1,project(x,y,z)?.scale*.04||1));
    line3([x+.84,.08,z],[x+.84,y,z],'rgba(37,31,26,.8)',Math.max(1,project(x,y,z)?.scale*.04||1));
    ellipse3(x,y,z,1.2,.76,'#decbaf','#74573a',1.8);
    ellipse3(x,y+.035,z,.46,.35,'#f8edd9','#ad8554',1.4);
    ellipse3(x,y+.045,z,.29,.21,variant%2?'#ab6745':'#66704a','#ceaf77',.5);
    const candle=project(x+.67,y+.27,z);if(candle){glow(candle.x,candle.y,Math.min(75,candle.scale*.5),'rgba(252,214,129,.2)');ctx.beginPath();ctx.arc(candle.x,candle.y,Math.max(2,candle.scale*.035),0,Math.PI*2);ctx.fillStyle='#f7d79c';ctx.fill()}
  }
  function renderDecor(z) {
    const phase=Math.floor(z/12);
    renderPainting(z+.7,-1,phase);
    renderPainting(z+.2,1,phase+1);
    renderSconce(z+4.9,-1);renderSconce(z+5.3,1);
    if(z >= 25 && z<=70) {
      if(Math.floor(z/6)%2===0){renderTable(z+3.2,-2.5,phase);renderTable(z+6.3,2.45,phase+1)}
    }
    if(Math.round(z)%12===0)renderChandelier(z+5.8);
  }
  function renderFinishing() {
    const vignette=ctx.createRadialGradient(width*.59,height*.52,height*.12,width*.52,height*.5,height*.86);
    vignette.addColorStop(0,'rgba(11,19,15,0)');vignette.addColorStop(1,'rgba(8,15,13,.62)');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
    // Línea ornamental fija en el eje de perspectiva, como un reflejo sobre la piedra.
    const fog=ctx.createLinearGradient(0,height*.55,0,height);
    fog.addColorStop(0,'rgba(240,198,138,0)');fog.addColorStop(1,'rgba(14,23,19,.22)');ctx.fillStyle=fog;ctx.fillRect(0,height*.55,width,height*.45);
  }
  function render(progress) {
    if(!width||!height)return;
    cameraZ = reducedMotion?3:progress*maxTravel;
    cameraX = reducedMotion?0:Math.sin(cameraZ*.18)*.13;
    ox=width*(width<=700?.51:.59);oy=height*(width<=700?.42:.53);
    focal=Math.min(height*1.56,width*1.17);
    ctx.clearRect(0,0,width,height);
    renderBackdrop();renderDoor(Math.max(83,cameraZ+70));
    const end=Math.min(104,Math.ceil((cameraZ+75)/6)*6);
    const begin=Math.max(0,Math.floor(cameraZ/6)*6);
    for(let z=end;z>=begin;z-=6){if(z<cameraZ+.6)continue;renderCell(z);renderDecor(z);if(z%12===0)renderArch(z)}
    renderFinishing();
  }
  function updateStage(stage) {
    if(stage===active)return;
    active=stage;
    const c=stops[stage];
    eyebrow.textContent=c.eyebrow;
    title.innerHTML=c.title;
    desc.textContent=c.body;
    primary.href=c.url;
    primary.innerHTML=c.action+' <span aria-hidden="true">↗</span>';
    counter.textContent=String(stage+1).padStart(2,'0')+' — 06';
    waypoints.forEach((btn,i)=>{
      const current=i===stage;
      btn.classList.toggle('active',current);
      if(current)btn.setAttribute('aria-current','step');else btn.removeAttribute('aria-current');
    });
  }
  function locateProgress(){
    const start=section.getBoundingClientRect().top+window.scrollY;
    const travel=section.offsetHeight-document.querySelector('.walk-sticky').offsetHeight;
    return Math.min(1,Math.max(0,(window.scrollY-start)/Math.max(1,travel)));
  }
  function update(){
    requested=false;
    const progress=locateProgress();
    const currentStage=Math.min(stops.length-1,Math.floor(progress*stops.length));
    updateStage(currentStage);
    progressFill.style.width=(progress*100).toFixed(1)+'%';
    progressBar.setAttribute('aria-valuenow',String(Math.round(progress*100)));
    if(section.getBoundingClientRect().bottom>0 && section.getBoundingClientRect().top < window.innerHeight+150){render(progress)}
  }
  function queue(){if(!requested){requested=true;requestAnimationFrame(update)}}
  function resize(){
    const box=canvas.getBoundingClientRect();
    width=Math.max(1,box.width);height=Math.max(1,box.height);
    const ratio=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    queue();
  }
  waypoints.forEach((btn,i)=>btn.addEventListener('click',()=>{
    const start=section.getBoundingClientRect().top+window.scrollY;
    const travel=section.offsetHeight-document.querySelector('.walk-sticky').offsetHeight;
    window.scrollTo({top:start+(i/stops.length+.008)*travel,behavior:reducedMotion?'instant':'smooth'});
  }));
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',e=>{reducedMotion=e.matches;queue()});
  resize();
})();
