
// ── V9 Standortlogik: Himmel = aktuelle Koordinaten, didaktische Koordinaten-Sprünge als Ausnahme ──
(function initCurrentLocationPolicy(){
  if(window.__currentLocationPolicyV9) return;
  window.__currentLocationPolicyV9=true;
  const COORDINATE_SCENE_IDS=new Set([
    'equator-day','equator-night','north-pole','south-pole','tropic-cancer','tropic-capricorn',
    'midnight-sun','polar-night','eclipse-2026-spain'
  ]);
  window.currentGeo={lat:typeof lat==='number'?lat:48,lng:typeof lng==='number'?lng:11.6,label:'Aktueller Standort',known:false,source:'start'};
  window.didacticLocationOverride=false;
  window.__useCurrentLocationForNextScene=false;
  function clampLat(v){return Math.max(-90,Math.min(90,+v||0));}
  function normLng(v){v=+v||0;while(v<-180)v+=360;while(v>180)v-=360;return v;}
  window.getPlanetariumCities=()=>CITIES;
  window.getPlanetariumMapLocation=()=>({lat:lat,lng:lng});
  function updateSlidersAndLocationLabel(label){
    const sl=document.getElementById('sLat'),sg=document.getElementById('sLng'),il=document.getElementById('i-lat'),ig=document.getElementById('i-lng');
    if(sl)sl.value=Math.round(lat);
    if(sg)sg.value=Math.round(lng);
    if(il)il.value=(+lat).toFixed(4);
    if(ig)ig.value=(+lng).toFixed(4);
    if(typeof updateLocDisp==='function') updateLocDisp(label||window.currentGeo.label||'Aktueller Standort',lat,lng);
  }
  function setCurrentGeo(la,lo,label,source,applyNow){
    if(!isFinite(la)||!isFinite(lo))return;
    window.currentGeo={lat:clampLat(la),lng:normLng(lo),label:label||'Aktueller Standort',known:true,source:source||'gps'};
    window.applyAutomaticSkyQuality?.(window.currentGeo.lat,window.currentGeo.lng);
    if(applyNow!==false && !window.didacticLocationOverride){
      lat=window.currentGeo.lat; lng=window.currentGeo.lng;
      updateSlidersAndLocationLabel(window.currentGeo.label);
      if(typeof updateTimezone==='function')updateTimezone();
      if(typeof updLabels==='function')updLabels();
      if(typeof draw==='function'&&typeof W!=='undefined'&&W)draw();
    }
  }
  window.setCurrentGeo=setCurrentGeo;
  window.applyCurrentGeo=function(label){
    window.didacticLocationOverride=false;
    lat=window.currentGeo.lat; lng=window.currentGeo.lng;
    window.applyAutomaticSkyQuality?.(lat,lng);
    updateSlidersAndLocationLabel(label||window.currentGeo.label||'Aktueller Standort');
    if(typeof updateTimezone==='function')updateTimezone();
    if(typeof updLabels==='function')updLabels();
    if(typeof draw==='function'&&typeof W!=='undefined'&&W)draw();
  };
  function requestCurrentGeoOnce(){
    if(window.__geoRequestStarted)return;
    window.__geoRequestStarted=true;
    if(!navigator.geolocation)return;
    navigator.geolocation.getCurrentPosition(pos=>{
      setCurrentGeo(pos.coords.latitude,pos.coords.longitude,'Aktueller Standort','gps',true);
      if(typeof showToast==='function')showToast('✓ Aktuelle Koordinaten verwendet');
    },()=>{}, {timeout:9000,enableHighAccuracy:false,maximumAge:300000});
  }
  if(typeof applyGPSResult==='function'&&!window.__gpsResultWrappedForCurrentGeo){
    const oldApplyGPSResult=applyGPSResult;
    window.__gpsResultWrappedForCurrentGeo=true;
    applyGPSResult=function(la,lo,label){
      window.didacticLocationOverride=false;
      setCurrentGeo(la,lo,label||'Aktueller Standort','gps',false);
      return oldApplyGPSResult.apply(this,arguments);
    };
    window.applyGPSResult=applyGPSResult;
  }
  if(typeof applyManual==='function'&&!window.__applyManualWrappedForCurrentGeo){
    const oldApplyManual=applyManual;
    window.__applyManualWrappedForCurrentGeo=true;
    applyManual=function(){
      const r=oldApplyManual.apply(this,arguments);
      setCurrentGeo(lat,lng,'Manuelle Koordinaten','manual',false);
      window.didacticLocationOverride=false;
      return r;
    };
    window.applyManual=applyManual;
  }
  if(typeof applyCity==='function'&&!window.__applyCityWrappedForSkyQuality){
    const oldApplyCity=applyCity;
    window.__applyCityWrappedForSkyQuality=true;
    applyCity=function(c,name){
      const r=oldApplyCity.apply(this,arguments);
      setCurrentGeo(c.la,c.lo,name===undefined?c.n:name,'city',false);
      window.didacticLocationOverride=false;
      return r;
    };
    window.applyCity=applyCity;
  }
  if(typeof setScene==='function'&&!window.__setSceneWrappedForCurrentGeo){
    const oldSetScene=setScene;
    window.__setSceneWrappedForCurrentGeo=true;
    setScene=function(la,lo,month,day,minute,label,year){
      if(window.__useCurrentLocationForNextScene){
        la=window.currentGeo.lat; lo=window.currentGeo.lng; label=window.currentGeo.label||'Aktueller Standort';
        window.didacticLocationOverride=false;
      }else{
        window.didacticLocationOverride=true;
      }
      return oldSetScene.call(this,la,lo,month,day,minute,label,year);
    };
    window.setScene=setScene;
  }
  if(typeof setSceneFromJD==='function'&&!window.__setSceneFromJDWrappedForCurrentGeo){
    const oldSetSceneFromJD=setSceneFromJD;
    window.__setSceneFromJDWrappedForCurrentGeo=true;
    setSceneFromJD=function(la,lo,jd,label){
      if(window.__useCurrentLocationForNextScene){
        la=window.currentGeo.lat; lo=window.currentGeo.lng; label=window.currentGeo.label||'Aktueller Standort';
        window.didacticLocationOverride=false;
      }else{
        window.didacticLocationOverride=true;
      }
      return oldSetSceneFromJD.call(this,la,lo,jd,label);
    };
    window.setSceneFromJD=setSceneFromJD;
  }
  if(typeof jumpScene==='function'&&!window.__jumpSceneWrappedForCurrentGeo){
    const oldJumpScene=jumpScene;
    window.__jumpSceneWrappedForCurrentGeo=true;
    jumpScene=function(id){
      const useCurrent=!COORDINATE_SCENE_IDS.has(id);
      window.__useCurrentLocationForNextScene=useCurrent;
      if(useCurrent)window.didacticLocationOverride=false;
      try{return oldJumpScene.apply(this,arguments);}finally{setTimeout(()=>{window.__useCurrentLocationForNextScene=false;},80);}
    };
    window.jumpScene=jumpScene;
  }
  if(typeof setNow==='function'&&!window.__setNowWrappedForCurrentGeo){
    const oldSetNow=setNow;
    window.__setNowWrappedForCurrentGeo=true;
    setNow=function(){
      /* "Jetzt" beendet auch eine laufende Finsternis-Navigation. Sonst
         bleibt deren Zielort intern aktiv und kann beim naechsten Zeichnen
         den aktuellen Standort wieder ueberschreiben. */
      window.__eclZu=true;
      window.__eclipseNavigation=null;
      window.__eclipseNavigationOrigin=null;
      if(typeof _pendingEclBox!=='undefined')_pendingEclBox=null;
      if(typeof verbergeEclBox==='function')verbergeEclBox();
      window.didacticLocationOverride=false;
      if(window.currentGeo) {lat=window.currentGeo.lat; lng=window.currentGeo.lng;}
      const r=oldSetNow.apply(this,arguments);
      if(window.currentGeo){lat=window.currentGeo.lat; lng=window.currentGeo.lng; updateSlidersAndLocationLabel(window.currentGeo.label); if(typeof updateTimezone==='function')updateTimezone(); if(typeof updLabels==='function')updLabels(); if(typeof draw==='function'&&typeof W!=='undefined'&&W)draw();}
      return r;
    };
    window.setNow=setNow;
  }
  if(typeof scrollToSky==='function'&&!window.__scrollToSkyWrappedForCurrentGeo){
    const oldScrollToSky=scrollToSky;
    window.__scrollToSkyWrappedForCurrentGeo=true;
    scrollToSky=function(){
      if(!window.didacticLocationOverride && window.currentGeo){
        lat=window.currentGeo.lat; lng=window.currentGeo.lng;
        updateSlidersAndLocationLabel(window.currentGeo.label);
        if(typeof updateTimezone==='function')updateTimezone();
        if(typeof updLabels==='function')updLabels();
      }
      return oldScrollToSky.apply(this,arguments);
    };
    window.scrollToSky=scrollToSky;
  }
  // Beim ersten Öffnen aktuelle Koordinaten ermitteln. Bei Ablehnung bleibt der zuletzt gewählte Standort aktiv.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(requestCurrentGeoOnce,700));
  else setTimeout(requestCurrentGeoOnce,700);
})();
