
// ── V9 Ergänzung: Planetenlauf und Mondlauf mit 1 h/s ──
(function initOrbitalDidacticSimulations(){
  const ONE_HOUR_PER_SECOND = 3600;
  let savedLayerState = null;
  function snapshotLayers(){
    return {
      showNames: typeof showNames!=='undefined' ? showNames : null,
      showZodiac: typeof showZodiac!=='undefined' ? showZodiac : null,
      showRA: typeof showRA!=='undefined' ? showRA : null,
      showAlt: typeof showAlt!=='undefined' ? showAlt : null,
      showLines: typeof showLines!=='undefined' ? showLines : null,
      showRefCircles: typeof showRefCircles!=='undefined' ? showRefCircles : null,
      showTwilight: typeof showTwilight!=='undefined' ? showTwilight : null,
      showMeteors: typeof showMeteors!=='undefined' ? showMeteors : null
    };
  }
  function syncButtons(){
    const set=(id,v)=>{const b=document.getElementById(id); if(b) b.classList.toggle('on',!!v)};
    if(typeof showNames!=='undefined')set('bn',showNames);
    if(typeof showZodiac!=='undefined')set('bzod',showZodiac);
    if(typeof showRA!=='undefined')set('bra',showRA);
    if(typeof showAlt!=='undefined')set('balt',showAlt);
    if(typeof showLines!=='undefined')set('blines',showLines);
    if(typeof showRefCircles!=='undefined')set('brefc',showRefCircles);
    if(typeof showTwilight!=='undefined')set('btwi',showTwilight);
    if(typeof showMeteors!=='undefined')set('bmeteor',showMeteors);
  }
  function restoreLayers(){
    if(!savedLayerState) return;
    const s=savedLayerState;
    if(s.showNames!==null) showNames=s.showNames;
    if(s.showZodiac!==null) showZodiac=s.showZodiac;
    if(s.showRA!==null) showRA=s.showRA;
    if(s.showAlt!==null) showAlt=s.showAlt;
    if(s.showLines!==null) showLines=s.showLines;
    if(s.showRefCircles!==null) showRefCircles=s.showRefCircles;
    if(s.showTwilight!==null) showTwilight=s.showTwilight;
    if(s.showMeteors!==null) showMeteors=s.showMeteors;
    savedLayerState=null;
    syncButtons();
  }
  function setSixHourSpeed(){
    if(typeof setSpeedValue==='function') setSpeedValue(ONE_HOUR_PER_SECOND);
    else speed=ONE_HOUR_PER_SECOND;
    const l=document.getElementById('lSpd');
    if(l) l.textContent='1h/s';
    const s=document.getElementById('sSpd');
    if(s) s.value=s.max||1000;
  }
  function setNoLinesBase(){
    if(!savedLayerState) savedLayerState=snapshotLayers();
    if(typeof focusConstellation!=='undefined') focusConstellation=null;
    if(typeof showNames!=='undefined') showNames=false;
    if(typeof showRA!=='undefined') showRA=false;
    if(typeof showAlt!=='undefined') showAlt=false;
    if(typeof showLines!=='undefined') showLines=false;
    if(typeof showRefCircles!=='undefined') showRefCircles=false;
    if(typeof showZodiac!=='undefined') showZodiac=false;
    if(typeof showTwilight!=='undefined') showTwilight=false;
    syncButtons();
  }
  function startPlanetRun(){
    window.didacticSimulationMode='planets';
    setNoLinesBase();
    if(typeof setScene==='function') setScene(52.52,13.405,3,20,22*60,'Berlin');
    setTimeout(()=>{
      setNoLinesBase();
      setSixHourSpeed();
      if(typeof setPaused==='function') setPaused(false); else paused=false;
      if(typeof showToast==='function') showToast('Planetenlauf · 1 h/s · alle Linien ausgeblendet');
      if(typeof window.scheduleDidacticSkyDraw==='function')window.scheduleDidacticSkyDraw('didactic-orbit');
    },280);
  }
  function startMoonOrbitRun(){
    window.didacticSimulationMode='moon';
    setNoLinesBase();
    let didJump=false;
    try{ if(typeof jumpMoonPhase==='function'){ jumpMoonPhase(0,'Mondlauf · Berlin'); didJump=true; } }catch(e){}
    if(!didJump && typeof setScene==='function') setScene(52.52,13.405,3,20,22*60,'Berlin');
    setTimeout(()=>{
      setNoLinesBase();
      setSixHourSpeed();
      if(typeof setPaused==='function') setPaused(false); else paused=false;
      if(typeof showToast==='function') showToast('Mondlauf · 1 h/s · Ekliptik, mittlere Mondbahn und Mondknoten');
      if(typeof window.scheduleDidacticSkyDraw==='function')window.scheduleDidacticSkyDraw('didactic-orbit');
    },340);
  }
  function screenPointFromRaDec(ra,dec,R){
    const p=altazXY(ra,dec,R);
    return {x:ORX+panX+zoom*p.x, y:ORY+panY+zoom*p.y, alt:p.alt};
  }
  function drawTextHalo(txt,x,y,align,color){
    g.save();
    g.font=(12*PX*(window.userLabelScale||1)*Math.max(.85,Math.min(1,Math.min(window.innerWidth,window.innerHeight)/430)))+'px Inter, system-ui, sans-serif';
    g.textAlign=align||'center';
    g.textBaseline='middle';
    g.fillStyle=color||'rgba(245,247,255,.92)';
    g.fillText(txt,x,y);
    g.restore();
  }
  function labelObject(name,ra,dec,color,dy,minAlt){
    try{
      const R=(Math.min(cv.width||W,cv.height||W)/2)*.94;
      const p=screenPointFromRaDec(ra,dec,R);
      if(!p || p.alt<(typeof minAlt==='number'?minAlt:-8)) return;
      drawTextHalo(name,p.x,p.y+(dy||-15)*PX,'center',color||'rgba(245,247,255,.94)');
    }catch(e){}
  }
  function drawSolarSystemNamesOnly(){
    if(window.didacticSimulationMode!=='planets' && window.didacticSimulationMode!=='moon') return;
    if(typeof currentJD!=='function' || typeof ecl2rd!=='function') return;
    const jd=currentJD();
    try{
      const srd=ecl2rd(sunLon(jd),0,jd);
      labelObject('Sonne',srd.ra,srd.dec,'rgba(245,215,110,.98)',-18);
    }catch(e){}
    try{
      const me=moonEcl(jd), mrd=ecl2rd(me.lon,me.lat,jd);
      labelObject('Mond',mrd.ra,mrd.dec,'rgba(238,242,248,.98)',-18);
    }catch(e){}
    try{
      const pls=allPlanets(jd)||[];
      for(const pl of pls){
        labelObject(pl.n,pl.ra,pl.dec,'rgba(238,210,138,.96)',-16,0);
      }
    }catch(e){}
  }
  function drawEclipticAndMoonNodes(){
    if(window.didacticSimulationMode==='precession') return;
    /* Im Mondphasen-Komposit zeichnet der gemeinsame Himmelsweg Ekliptik,
       Mondbahn und Knoten. Die zusätzliche Didaktik-Ebene würde dieselben
       Linien ein zweites Mal zeichnen und den Bild-Schalter umgehen. */
    if(window.__moonPhaseTracking===true) return;
    if(!(window.didacticSimulationMode==='moon' || window.showMoonPath===true)) return;
    if(window.didHideMoon===true && window.showMoonPath!==true) return;
    if(typeof currentJD!=='function' || typeof ecl2rd!=='function' || typeof altazXY!=='function') return;
    const jd=currentJD();
    const R=(Math.min(cv.width||W,cv.height||W)/2)*.94;
    g.save();
    g.lineWidth=1.35*PX;
    g.strokeStyle='rgba(245,198,92,.72)';
    g.setLineDash([7*PX,6*PX]);
    let started=false, lastAlt=-999;
    for(let lon=0;lon<=360;lon+=2){
      const rd=ecl2rd(lon,0,jd), p=screenPointFromRaDec(rd.ra,rd.dec,R);
      const visible=p.alt>-8;
      if(!visible || Math.abs(p.alt-lastAlt)>65){started=false; lastAlt=p.alt; continue;}
      if(!started){g.beginPath();g.moveTo(p.x,p.y);started=true;} else g.lineTo(p.x,p.y);
      lastAlt=p.alt;
    }
    if(started)g.stroke();
    g.setLineDash([]);
    const T=(jd-2451545)/36525;
    const asc=((125.04452-1934.136261*T)%360+360)%360;
    const nodes=[{lon:asc,sym:'☊',name:'aufsteigender Mondknoten'},{lon:(asc+180)%360,sym:'☋',name:'absteigender Mondknoten'}];
    for(const n of nodes){
      const rd=ecl2rd(n.lon,0,jd), p=screenPointFromRaDec(rd.ra,rd.dec,R);
      if(p.alt<-8) continue;
      g.beginPath();
      g.arc(p.x,p.y,7*PX,0,Math.PI*2);
      g.fillStyle='rgba(125,214,255,.18)';
      g.fill();
      g.lineWidth=1.7*PX;
      g.strokeStyle='rgba(125,214,255,.92)';
      g.stroke();
      drawTextHalo(n.sym+' '+n.name,p.x+12*PX,p.y-13*PX,'left','rgba(194,238,255,.96)');
    }
    drawTextHalo('Ekliptik',cv.width-66*PX,48*PX,'center','rgba(245,198,92,.95)');
    g.restore();
  }
  if(window.__planetariumRender && !window.__orbitalDidacticDrawWrapped){
    window.__orbitalDidacticDrawWrapped=true;
    window.__realMoonOverlayWrapped=true;
    window.__planetariumRender.registerAfterDraw('didactic-orbits',function(){
      try{ drawEclipticAndMoonNodes(); drawSolarSystemNamesOnly(); }catch(e){ console.warn(e); }
      try{ if(window.overlayRealMoon)window.overlayRealMoon(); }catch(e){ console.warn('Realistic moon overlay', e); }
    });
  }
  if(typeof jumpScene==='function' && !window.__orbitalDidacticJumpWrapped){
    const oldJump=jumpScene;
    window.__orbitalDidacticJumpWrapped=true;
    jumpScene=function(id){
      if(id==='sim-planet-run') return startPlanetRun();
      if(id==='sim-moon-orbit') return startMoonOrbitRun();
      if(id!=='sim-planet-run' && id!=='sim-moon-orbit' && id!=='sim-moon-phases'){
        window.didacticSimulationMode=null;
      }
      return oldJump.apply(this,arguments);
    };
    window.jumpScene=jumpScene;
  }
  ['homeView','resetView','setNow'].forEach(name=>{
    if(typeof window[name]==='function' && !window['__orbitalDidactic_'+name]){
      const old=window[name]; window['__orbitalDidactic_'+name]=true;
      window[name]=function(){window.didacticSimulationMode=null; restoreLayers(); return old.apply(this,arguments)};
    }
  });
  window.startPlanetRun=startPlanetRun;
  window.startMoonOrbitRun=startMoonOrbitRun;
})();
