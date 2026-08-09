
// ── Fix: Polartag/Polarnacht springen garantiert auf die Koordinate des nördlichen Polarkreises ──
(function(){
  const ARCTIC_CIRCLE_LAT = 66.5622; // mittlerer nördlicher Polarkreis
  function polarLongitude(){
    if(window.currentGeo && isFinite(window.currentGeo.lng)) return +window.currentGeo.lng;
    if(typeof lng === 'number' && isFinite(lng)) return +lng;
    return 0;
  }
  function setPolarkreisScene(month, day, minute, label, run){
    window.didacticLocationOverride = true;
    window.__useCurrentLocationForNextScene = false;
    if(typeof window.setYearPlay === 'function') window.setYearPlay(false);
    if(typeof setPaused === 'function') setPaused(true);
    if(typeof disableOrient === 'function') disableOrient();
    lat = ARCTIC_CIRCLE_LAT;
    lng = polarLongitude();
    simDay = doyFromMonthDay(simYear, month, day);
    simMin = minute;
    selCity = null;
    const sl=document.getElementById('sLat'), sg=document.getElementById('sLng'), st=document.getElementById('sTime'), il=document.getElementById('i-lat'), ig=document.getElementById('i-lng');
    if(sl) sl.value = Math.round(lat);
    if(sg) sg.value = Math.round(lng);
    if(st) st.value = Math.round(simMin);
    if(il) il.value = lat.toFixed(4);
    if(ig) ig.value = lng.toFixed(4);
    if(typeof updateLocDisp === 'function') updateLocDisp(label || 'Polarkreis', lat, lng);
    if(typeof updateTimezone === 'function') updateTimezone();
    if(typeof updLabels === 'function') updLabels();
    zoom=1; panX=0; panY=0; zoomedObj=null; interacting=8;
    if(typeof updateTouchMode === 'function') updateTouchMode();
    if(typeof scrollToSky === 'function') scrollToSky();
    setTimeout(()=>{ if(typeof draw==='function' && typeof W!=='undefined' && W) draw(); }, 120);
    if(run){
      setTimeout(()=>{ if(typeof setPaused==='function') setPaused(false); if(typeof setSpeedValue==='function') setSpeedValue(3600); }, 250);
    }
    if(typeof showToast === 'function') showToast((label||'Polarkreis') + ' · Breite ' + lat.toFixed(2) + '° N');
  }
  const oldJumpScene = window.jumpScene || jumpScene;
  window.jumpScene = jumpScene = function(id){
    if(id === 'midnight-sun') return setPolarkreisScene(6,21,0,'Polartag am Polarkreis');
    if(id === 'polar-night') return setPolarkreisScene(12,21,12*60,'Polarnacht am Polarkreis');
    if(id === 'sim-polar-day') return setPolarkreisScene(6,21,0,'Polartag am Polarkreis · Simulation', true);
    return oldJumpScene.apply(this, arguments);
  };
})();
