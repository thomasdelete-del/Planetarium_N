
// ── V9 Ergänzung: Realistische Mondscheibe in der Mondsimulation ──
(function(){
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function moonAlbedo(nx,ny){
    // Einfache, deterministische Maria-/Krater-Andeutung: kein Foto, aber mondähnliche Albedostruktur.
    const r2=nx*nx+ny*ny;
    let a=0.82-0.10*r2;
    const maria=[[-.38,-.10,.30,.18],[-.12,.22,.22,.12],[.23,-.18,.24,.16],[.36,.18,.17,.11],[-.05,-.38,.20,.10]];
    for(const m of maria){
      const dx=(nx-m[0])/m[2],dy=(ny-m[1])/m[2];
      const q=dx*dx+dy*dy;
      if(q<1)a-=m[3]*(1-q);
    }
    // feine Körnung / Kraterpunkte
    const grain=(Math.sin((nx*57.3+ny*19.7)*12.9898)*43758.5453)%1;
    a += (grain-.5)*0.035;
    return clamp(a,.42,.96);
  }
  function drawRealisticMoonDisc(ctx,cx,cy,r,jd,lightAngle){
    const d=Math.max(24,Math.round(r*2));
    const off=document.createElement('canvas');
    off.width=d; off.height=d;
    const og=off.getContext('2d');
    const img=og.createImageData(d,d);
    const elong=(typeof moonElong==='function'?moonElong(jd):180)*Math.PI/180;
    const sx=Math.cos(lightAngle), sy=Math.sin(lightAngle);
    const sPlane=Math.sin(elong);
    // Bei Vollmond zeigt die Sonnenrichtung ungefähr zum Betrachter; bei Neumond von ihm weg.
    const lx=sx*sPlane, ly=sy*sPlane, lz=-Math.cos(elong);
    for(let y=0;y<d;y++){
      for(let x=0;x<d;x++){
        const nx=(x+.5-d/2)/(d/2), ny=(y+.5-d/2)/(d/2);
        const rr=nx*nx+ny*ny;
        const idx=(y*d+x)*4;
        if(rr>1){img.data[idx+3]=0; continue;}
        const nz=Math.sqrt(Math.max(0,1-rr));
        const illum=clamp(nx*lx+ny*ly+nz*lz,0,1);
        const limb=clamp(nz*1.28,0,1);
        const alb=moonAlbedo(nx,ny);
        const lit=0.12+0.92*Math.pow(illum,.62);
        const shade=(0.035+0.13*limb);
        let v=255*alb*(shade + lit*.88);
        // unbeleuchtete Seite nicht komplett schwarz, damit die Scheibe sichtbar bleibt.
        if(illum<=0)v=255*alb*(0.10+0.05*limb);
        const cool=illum>0?1:0;
        img.data[idx]=clamp(v*(.95+0.03*cool),0,255);
        img.data[idx+1]=clamp(v*(.97+0.02*cool),0,255);
        img.data[idx+2]=clamp(v*(1.03+0.05*cool),0,255);
        img.data[idx+3]=Math.round(255*clamp(limb*1.15,0,1));
      }
    }
    og.putImageData(img,0,0);
    ctx.save();
    ctx.shadowColor='rgba(220,230,255,.45)';
    ctx.shadowBlur=Math.max(8,r*.35);
    ctx.drawImage(off,cx-r,cy-r,2*r,2*r);
    ctx.shadowBlur=0;
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(240,245,255,.62)';
    ctx.lineWidth=Math.max(1,1.2*(window.devicePixelRatio||1));
    ctx.stroke();
    ctx.restore();
  }
  function overlayRealMoon(){
    if(window.didacticSimulationMode!=='moon')return;
    if(typeof g==='undefined'||typeof currentJD!=='function'||typeof altazXY!=='function'||typeof ecl2rd!=='function'||typeof moonEcl!=='function')return;
    const jd=currentJD();
    const HR=(typeof C==='number'?C:Math.min(cv.width,cv.height)/2)*((document.body.classList.contains('fullscreen'))?.965:.94);
    let mr;
    try{
      if(typeof moonTopo==='function')mr=moonTopo(jd);
      else {const me=moonEcl(jd); mr=ecl2rd(me.lon,me.lat,jd);}
    }catch(e){return;}
    const mp=altazXY(mr.ra,mr.dec,HR);
    if(mp.alt<-8)return;
    let sr=ecl2rd(sunLon(jd),0,jd), sp=altazXY(sr.ra,sr.dec,HR);
    const z=(typeof zoom==='number'?zoom:1), px=(typeof PX==='number'?PX:(window.devicePixelRatio||1));
    const ox=(typeof ORX==='number'?ORX:(cv.width/2)), oy=(typeof ORY==='number'?ORY:(cv.height/2));
    const panx=(typeof panX==='number'?panX:0), pany=(typeof panY==='number'?panY:0);
    const mx=ox+panx+z*mp.x, my=oy+pany+z*mp.y;
    const sx=ox+panx+z*sp.x, sy=oy+pany+z*sp.y;
    const lightAngle=Math.atan2(sy-my,sx-mx);
    const r=clamp(Math.min(cv.width,cv.height)*0.034,24*px,44*px);
    g.save();
    g.setTransform(1,0,0,1,0,0);
    drawRealisticMoonDisc(g,mx,my,r,jd,lightAngle);
    // Name bleibt, wie gewünscht, nur bei Himmelskörpern sichtbar.
    g.font=`700 ${Math.max(13*px,16*px)}px Inter,system-ui,sans-serif`;
    g.textAlign='center';
    g.textBaseline='top';
    g.fillStyle='rgba(238,242,248,.98)';
    g.shadowColor='rgba(2,6,18,.95)';
    g.shadowBlur=6*px;
    g.fillText('Mond',mx,my+r+5*px);
    g.restore();
  }
  window.overlayRealMoon=overlayRealMoon;
})();
