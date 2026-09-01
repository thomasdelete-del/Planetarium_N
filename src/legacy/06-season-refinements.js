
// ── V9 Feinschliff: Jahreszeiten exakt, Mondphasenlauf ab Vollmond, Meridian nur bei Beobachtungspunkten ──
(function(){
  const OBSERVATION_SCENES = new Set([
    'equator-day','equator-night','north-pole','south-pole','tropic-cancer','tropic-capricorn','midnight-sun','polar-night'
  ]);
  const SEASON_TARGETS = {
    'spring-equinox': {lon:0,   name:'Frühlingsanfang'},
    'summer-solstice':{lon:90,  name:'Sommeranfang'},
    'autumn-equinox': {lon:180, name:'Herbstanfang'},
    'winter-solstice':{lon:270, name:'Winteranfang'}
  };
  function angleDiff(a,b){return ((a-b+540)%360)-180;}
  function nextSolarLongitudeJD(targetLon){
    let start = (typeof currentJD==='function') ? currentJD() : 2460000;
    // Suche ab kurz vor aktuellem Zeitpunkt, damit der direkt bevorstehende Anfang gefunden wird.
    let prevJ=start, prev=angleDiff(sunLon(prevJ),targetLon);
    for(let d=0.25; d<=370; d+=0.25){
      const j=start+d, cur=angleDiff(sunLon(j),targetLon);
      if(prev===0 || cur===0 || (prev<0 && cur>=0) || (prev>120 && cur<-120)){
        let lo=prevJ, hi=j;
        for(let k=0;k<42;k++){
          const mid=(lo+hi)/2;
          const fm=angleDiff(sunLon(mid),targetLon);
          const flo=angleDiff(sunLon(lo),targetLon);
          if((flo<0 && fm>=0) || (flo>120 && fm<-120)) hi=mid; else lo=mid;
        }
        return (lo+hi)/2;
      }
      prevJ=j; prev=cur;
    }
    return start;
  }
  function currentOrDefaultLocation(){
    if(window.currentGeo && isFinite(window.currentGeo.lat) && isFinite(window.currentGeo.lng)){
      return {lat:window.currentGeo.lat,lng:window.currentGeo.lng,label:window.currentGeo.label||'Aktueller Standort'};
    }
    return {lat:typeof lat==='number'?lat:52.52,lng:typeof lng==='number'?lng:13.405,label:'Aktueller Standort'};
  }
  function setMeridianForScene(id){
    // Der Meridian/Höhenkreis wird nur bei didaktischen Beobachtungspunkt-Sprüngen gezeigt.
    const polarScene = ['midnight-sun','polar-night','sim-polar-day','obs-northpole-summer','obs-northpole-winter'].includes(id);
    if(typeof showAlt!=='undefined') showAlt = !polarScene && OBSERVATION_SCENES.has(id);
    if(typeof syncFocusButtons==='function') syncFocusButtons();
    const b=document.getElementById('balt'); if(b) b.classList.toggle('on', !!(typeof showAlt!=='undefined' && showAlt));
  }
  function jumpSeasonExact(id){
    const s=SEASON_TARGETS[id]; if(!s) return false;
    const loc=currentOrDefaultLocation();
    const jd=nextSolarLongitudeJD(s.lon);
    // Jahreszeiten sind keine Koordinaten-Demo: aktueller Standort bleibt erhalten.
    window.__useCurrentLocationForNextScene=true;
    if(typeof setSceneFromJD==='function') setSceneFromJD(loc.lat,loc.lng,jd,loc.label||'Aktueller Standort');
    try{ if(typeof orientMode!=='undefined' && orientMode && typeof disableOrient==='function') disableOrient(); }catch(_){ }
    try{ if(typeof viewMode!=='undefined'){ viewMode='dome'; if(typeof syncViewModeButtons==='function') syncViewModeButtons(); } }catch(_){ }
    try{ if(typeof setSpeedValue==='function') setSpeedValue(1); }catch(_){ }
    window.__pendingRunSpeed=3600;
    setTimeout(()=>{
      setMeridianForScene(id);
      if(typeof showToast==='function') showToast(s.name+' · exakt berechnet');
      if(typeof draw==='function' && typeof W!=='undefined' && W) draw();
      window.__useCurrentLocationForNextScene=false;
    },260);
    return true;
  }
  if(typeof jumpScene==='function' && !window.__v9JumpSceneFineTuned){
    const oldJumpScene=jumpScene;
    window.__v9JumpSceneFineTuned=true;
    jumpScene=function(id){
      if(SEASON_TARGETS[id]) return jumpSeasonExact(id);
      if(id==='sim-moon-phases'){
        // Mondphasenlauf beginnt didaktisch beim Vollmond.
        window.__moonPhaseTracking=true;
        window.__moonPhaseNeedsCenter=false;
        if(typeof jumpMoonPhase==='function') jumpMoonPhase(180,'Mondphasenlauf · Vollmond','real');
        if(typeof window.startMoonPhaseDayRun==='function') window.startMoonPhaseDayRun();
        setTimeout(()=>{ setMeridianForScene(id); if(typeof showToast==='function') showToast('Mond täglich im Meridian · feste Beobachter-Grundansicht'); },320);
        return;
      }
      const r=oldJumpScene.apply(this,arguments);
      setTimeout(()=>{ setMeridianForScene(id); if(typeof draw==='function' && typeof W!=='undefined' && W) draw(); },360);
      return r;
    };
    window.jumpScene=jumpScene;
  }
  // Falls der Sternbild-Lernmodus noch den Meridian einschaltet, direkt nach dem Start wieder ausschalten.
  if(typeof focusConstellationView==='function' && !window.__v9ConstellationNoMeridian){
    const oldFocus=focusConstellationView;
    window.__v9ConstellationNoMeridian=true;
    focusConstellationView=function(key){
      const r=oldFocus.apply(this,arguments);
      setTimeout(()=>{ setMeridianForScene('constellation'); if(typeof draw==='function'&&typeof W!=='undefined'&&W)draw(); },520);
      return r;
    };
    window.focusConstellationView=focusConstellationView;
  }
})();
