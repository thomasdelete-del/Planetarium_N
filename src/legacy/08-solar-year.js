
// ── V9: Sonnenjahr statt „Jahreszeiten vergleichen“ ──
// Simulation: 5 Kalendertage pro Sekunde, Uhrzeit wird jeden Schritt auf wahren Sonnenmittag gesetzt.
(function(){
  if(window.__v9SolarYearSimulation) return;
  window.__v9SolarYearSimulation = true;
  const scheduler = window.__planetariumScheduler;
  const solarTimerName = 'solar-year';
  let solarActive = false;
  let solarDayIndex = 0;
  let solarLayerState = null;
  let solarTrail = [];
  window.__resetSolarYearTrail=function(){solarTrail=[];};
  function saveSolarLayers(){
    if(solarLayerState) return;
    solarLayerState = {
      showNames: typeof showNames!=='undefined' ? showNames : null,
      showLines: typeof showLines!=='undefined' ? showLines : null,
      showRefCircles: typeof showRefCircles!=='undefined' ? showRefCircles : null,
      showZodiac: typeof showZodiac!=='undefined' ? showZodiac : null,
      showRA: typeof showRA!=='undefined' ? showRA : null,
      showTwilight: typeof showTwilight!=='undefined' ? showTwilight : null
    };
  }
  function applySolarLayers(){
    saveSolarLayers();
    try{
      if(typeof showNames!=='undefined') showNames=true;
      if(typeof showLines!=='undefined') showLines=true; // Linien bleiben sichtbar; nur der Präzessionskreis wird unten gezielt ausgeblendet
      if(typeof showRefCircles!=='undefined') showRefCircles=true;
      if(typeof showZodiac!=='undefined') showZodiac=false;
      if(typeof showRA!=='undefined') showRA=false;
      if(typeof showTwilight!=='undefined') showTwilight=false;
      window.didHideEcl=true; // Ekliptik lenkt vom Analemma ab
      window.didHideConstNames=true; // nur Linienbeschriftung (Äquator/Wendekreis/Meridian), keine Sternbildnamen
      window.didHidePlanets=true; window.didHideMoon=true; window.didHideCirc=true;
      syncSolarButtons();
    }catch(_){}
  }
  function restoreSolarLayers(){
    window.didHideEcl=false;
    window.didHideConstNames=false;
    window.didHidePlanets=false; window.didHideMoon=false; window.didHideCirc=false;
    if(!solarLayerState) return;
    try{
      const s=solarLayerState;
      if(s.showNames!==null) showNames=s.showNames;
      if(s.showLines!==null) showLines=s.showLines;
      if(s.showRefCircles!==null) showRefCircles=s.showRefCircles;
      if(s.showZodiac!==null) showZodiac=s.showZodiac;
      if(s.showRA!==null) showRA=s.showRA;
      if(s.showTwilight!==null) showTwilight=s.showTwilight;
      solarLayerState=null;
      syncSolarButtons();
    }catch(_){}
  }
  function syncSolarButtons(){
    const set=(id,v)=>{const b=document.getElementById(id); if(b)b.classList.toggle('on',!!v);};
    try{
      if(typeof showNames!=='undefined') set('bn',showNames);
      if(typeof showLines!=='undefined') set('blines',showLines);
      if(typeof showRefCircles!=='undefined') set('brefc',showRefCircles);
      if(typeof showZodiac!=='undefined') set('bzod',showZodiac);
      if(typeof showRA!=='undefined') set('bra',showRA);
      if(typeof showTwilight!=='undefined') set('btwi',showTwilight);
    }catch(_){}
  }
  function leap(y){return (y%4===0 && y%100!==0) || (y%400===0)}
  function daysIn(y){return leap(y)?366:365}
  function doyMD(y,m,d){
    const a=[0,31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31];
    let n=d; for(let i=1;i<m;i++) n+=a[i]; return n;
  }
  function mdFromDoy(y,doy){
    const a=[0,31,leap(y)?29:28,31,30,31,30,31,31,30,31,30,31];
    let m=1; while(m<=12 && doy>a[m]){doy-=a[m];m++;} return {m:m,d:doy};
  }
  function normMinute(v){return ((v%1440)+1440)%1440}
  function tzOffsetFor(y,m,d,la,lo){
    let base = (typeof tzFromLng==='function') ? tzFromLng(lo) : Math.round(lo/15);
    let dst = 0;
    try{
      const inEU = lo >= -10 && lo <= 40 && la >= 34 && la <= 72;
      if(inEU && typeof euDSTactive==='function') dst = euDSTactive(y, doyMD(y,m,d)) ? 1 : 0;
    }catch(_){dst=0}
    return base + dst;
  }
  function trueNoonMinute(y,m,d,la,lo){
    const off = tzOffsetFor(y,m,d,la,lo);
    const jd = (typeof jdn==='function') ? (jdn(y,m,d)-0.5) : (typeof currentJD==='function'?currentJD():2460000);
    const eot = (typeof eqTime==='function') ? eqTime(jd) : 0;
    return normMinute(Math.round((12 - eot/60 - lo/15 + off)*60));
  }
  function currentLocation(){
    if(window.currentGeo && isFinite(window.currentGeo.lat) && isFinite(window.currentGeo.lng)){
      return {lat:+window.currentGeo.lat,lng:+window.currentGeo.lng,label:window.currentGeo.label||'Aktueller Standort'};
    }
    return {lat:(typeof lat==='number'?lat:52.52),lng:(typeof lng==='number'?lng:13.405),label:'Aktueller Standort'};
  }
  function updateUI(label){
    try{
      const sl=document.getElementById('sLat'), sg=document.getElementById('sLng'), st=document.getElementById('sTime'), ys=document.getElementById('yearslider');
      const il=document.getElementById('i-lat'), ig=document.getElementById('i-lng');
      if(sl) sl.value=Math.round(lat); if(sg) sg.value=Math.round(lng); if(st) st.value=Math.round(simMin);
      if(il) il.value=(+lat).toFixed(2); if(ig) ig.value=(+lng).toFixed(2);
      if(ys) ys.value=Math.max(parseInt(ys.min||'-3000',10),Math.min(parseInt(ys.max||'8000',10),simYear));
      if(typeof updateLocDisp==='function') updateLocDisp(label||'Aktueller Standort',lat,lng);
      if(typeof updateTimezone==='function') updateTimezone();
      if(typeof syncYearUI==='function') syncYearUI();
      if(typeof updLabels==='function') updLabels();
    }catch(e){console.warn(e)}
  }
  function captureSolarTrailPoint(){
    try{
      const jd=currentJD();
      const sr=ecl2rd(sunLon(jd),0,jd);
      const FS=document.body.classList.contains('fullscreen');
      const R=C*(FS?.998:.975);
      const HR=R*(showTwilight?.8:(FS?.965:.94));
      const p=altazXY(sr.ra,sr.dec,HR);
      solarTrail.push({x:p.x,y:p.y,alt:p.alt});
      if(solarTrail.length>380) solarTrail.shift();
    }catch(_){}
  }
  function pointObserverAtSun(){
    try{
      if(typeof orientMode!=="undefined"&&orientMode&&typeof disableOrient==="function")disableOrient();
      const jd=currentJD();
      const srd=ecl2rd(sunLon(jd),0,jd);
      const lst=LST();
      const H=(lst-srd.ra*15)*Math.PI/180;
      const phi=lat*Math.PI/180,dec=srd.dec*Math.PI/180;
      const altRad=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H));
      const azRad=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi));
      window.__viewModeUserChosen=true;
      viewMode="real";
      camAz=((azRad*180/Math.PI)+360)%360;
      camAlt=26; // fester Referenzwert wie setRealHome(): Horizont liegt dadurch bei jedem Standort an derselben Bildposition; die tatsächliche Sonnenhöhe (66,56° am Äquator bis -23,44° am Pol, Stand 21.12.) bleibt dadurch sichtbar statt durch Zentrierung verdeckt
      camFov=65;
      if(typeof syncViewModeButtons==="function")syncViewModeButtons();
    }catch(e){}
  }
  function setSolarYearDay(){
    if(solarDayIndex===0) solarTrail=[];
    let loc=currentLocation();
    if(typeof window.__solarYearLatOverride==='number'&&isFinite(window.__solarYearLatOverride)){
      const lv=window.__solarYearLatOverride;
      loc={lat:lv,lng:loc.lng,label:(Math.abs(lv)<0.01?'Äquator':(Math.abs(Math.round(lv*10)/10)+'°'+(lv>=0?'N':'S')))};
    }
    lat=loc.lat; lng=loc.lng; selCity=null;
    applySolarLayers();
    const y0 = window.__solarYearStartYear || simYear || new Date().getFullYear();
    let y=y0, d0=doyMD(y0,12,21), doy=d0+solarDayIndex;
    while(doy>daysIn(y)){doy-=daysIn(y); y++;}
    const md=mdFromDoy(y,doy);
    simYear=y;
    simDay=doy;
    // Feste Uhrzeit über den gesamten Lauf (nicht täglich neu auf wahren Mittag gesetzt):
    // erst die feste Zeitgleichungs-Differenz erzeugt die Achterschleife des Analemmas.
    if(window.__solarYearFixedMin==null){
      window.__solarYearFixedMin = trueNoonMinute(y0,12,21,loc.lat,loc.lng);
      window.__solarYearFixedUtcOff = tzFromLng(loc.lng);
    }
    simMin = window.__solarYearFixedMin;
    // Keine Himmelskörpernamen im Sonnenjahr; Linien bleiben sichtbar, Präzessionskreis wird gezielt ausgeblendet.
    try{ if(typeof showAlt!=='undefined') showAlt=false; const b=document.getElementById('balt'); if(b)b.classList.toggle('on',false); }catch(_){ }
    zoom=1; panX=0; panY=0; zoomedObj=null; interacting=8;
    if(typeof updateTouchMode==='function') updateTouchMode();
    updateUI(loc.label);
    // Feste Zonenzeit ohne Sommerzeit-Sprung während des gesamten Laufs — sonst knickt das Analemma am DST-Wechsel.
    utcOff = window.__solarYearFixedUtcOff;
    dstOffset = 0;
    if(solarDayIndex===0 && typeof pointObserverAtSun==="function")pointObserverAtSun();
    if(typeof draw==='function' && typeof W!=='undefined' && W) draw();
    captureSolarTrailPoint();
  }
  function stopSolarYear(){
    solarActive=false;
    if(scheduler)scheduler.cancel(solarTimerName);
    if(window.didacticSimulationMode==='solar-year') window.didacticSimulationMode=null;
    restoreSolarLayers();
    solarTrail=[];
    window.__solarYearFixedMin=null;
    window.__solarYearFixedUtcOff=null;
  }
  function startSolarYear(){
    stopSolarYear();
    window.__solarYearLatOverride=(typeof arguments[0]==="number")?arguments[0]:(window.__solarYearLatOverride!==undefined?window.__solarYearLatOverride:null);
    if(typeof window.setYearPlay==='function') window.setYearPlay(false);
    if(typeof disableOrient==='function') disableOrient();
    window.didacticSimulationMode='solar-year';
    window.__solarYearStartYear = (typeof simYear==='number' && isFinite(simYear)) ? simYear : new Date().getFullYear();
    solarDayIndex=0;
    solarTrail=[];
    window.__solarYearFixedMin=null;
    setSolarYearDay();
    applySolarLayers();
    if(typeof setPaused==='function') setPaused(false); else paused=false;
    speed=0; lastT=null;
    const l=document.getElementById('lSpd'); if(l) l.textContent='5 Tage/s';
    const s=document.getElementById('sSpd'); if(s) s.value=0;
    if(typeof scrollToSky==='function') scrollToSky();
    if(typeof showToast==='function') showToast('Sonnenjahr · 5 Tage/s · feste Uhrzeit ohne Sommerzeit · Analemma entsteht');
    solarActive=true;
    scheduler.every(solarTimerName,()=>{
      if(!solarActive) return;
      if(typeof paused!=='undefined' && paused) return;
      solarDayIndex += 1;
      if(solarDayIndex>daysIn(window.__solarYearStartYear||simYear)) solarDayIndex=0;
      setSolarYearDay();
    },200);
  }
  const oldJump = window.jumpScene || (typeof jumpScene==='function'?jumpScene:null);
  window.jumpScene = jumpScene = function(id){
    if(id==='sim-seasons') return startSolarYear();
    stopSolarYear();
    return oldJump ? oldJump.apply(this,arguments) : undefined;
  };
  ['homeView','resetView','setNow'].forEach(name=>{
    const old=window[name] || (typeof globalThis[name]==='function'?globalThis[name]:null);
    if(old && !window['__v9SolarStop_'+name]){
      window['__v9SolarStop_'+name]=true;
      window[name]=globalThis[name]=function(){ stopSolarYear(); return old.apply(this,arguments); };
    }
  });
  function drawSolarTrail(){
    if(window.didacticSimulationMode!=='solar-year' || !solarTrail.length) return;
    try{
      const ox=ORX,oy=ORY,z=zoom,panx=panX||0,pany=panY||0,dpr=(window.devicePixelRatio||1);
      g.save();g.setTransform(1,0,0,1,0,0);
      g.strokeStyle='rgba(245,205,110,.8)';
      g.lineWidth=Math.max(1.4,1.7*dpr);
      g.beginPath();
      let pen=false;
      for(let i=0;i<solarTrail.length;i++){
        const p=solarTrail[i];
        if(!p||p.alt<-2){pen=false;continue}
        const X=ox+panx+z*p.x, Y=oy+pany+z*p.y;
        if(!pen){g.moveTo(X,Y);pen=true} else g.lineTo(X,Y);
      }
      g.stroke();
      const last=solarTrail[solarTrail.length-1];
      if(last && last.alt>-2){
        const X=ox+panx+z*last.x, Y=oy+pany+z*last.y;
        g.beginPath();g.arc(X,Y,4.2*dpr,0,Math.PI*2);
        g.fillStyle='rgba(255,228,150,.96)';g.fill();
      }
      g.restore();
    }catch(_){}
  }
  if(window.__planetariumRender && !window.__v9SolarTrailDrawWrapped){
    window.__v9SolarTrailDrawWrapped=true;
    window.__planetariumRender.registerAfterDraw('solar-trail',function(){
      try{ drawSolarTrail(); }catch(_){}
    });
  }
  window.startSolarYearAtLat=function(latVal){window.__solarYearLatOverride=latVal;window.jumpScene('sim-seasons');};
  window.toggleSolarYearLines=function(btn){
    try{ if(typeof showLines!=='undefined') showLines=!showLines; }catch(e){}
    try{ const b=document.getElementById('blines'); if(b)b.classList.toggle('on', typeof showLines!=='undefined'?showLines:false); }catch(e){}
    if(btn)btn.classList.toggle('on', typeof showLines!=='undefined'?showLines:false);
    if(typeof draw==='function' && typeof W!=='undefined' && W) draw();
  };
  window.startSolarYearSimulation=startSolarYear;
  window.stopSolarYearSimulation=stopSolarYear;
})();
