
// ── V9: Beobachtungspunkte – neue Erläuterungen und passende Sprungziele ──
(function(){
  if(window.__v9ObservationPointsPatch) return;
  window.__v9ObservationPointsPatch = true;
  const oldJump = window.jumpScene || (typeof jumpScene === 'function' ? jumpScene : null);
  function safeNoon(y,m,d,la,lo){
    try{ if(typeof trueNoonMinute === 'function') return trueNoonMinute(y,m,d,la,lo); }catch(_){ }
    return 12*60;
  }
  function obsScene(id){
    const y = (typeof simYear === 'number' && isFinite(simYear)) ? simYear : new Date().getFullYear();
    const scenes = {
      'obs-equator-spring':       {lat:0,       lng:0, m:3, d:20, noon:true,  label:'Äquator · Frühlingsanfang'},
      'obs-equator-summer':       {lat:0,       lng:0, m:6, d:21, noon:true,  label:'Äquator · Sommeranfang'},
      'obs-tropic-spring':        {lat:23.44,   lng:0, m:3, d:20, noon:true,  label:'Nördlicher Wendekreis · Frühlingsanfang'},
      'obs-tropic-summer':        {lat:23.44,   lng:0, m:6, d:21, noon:true,  label:'Nördlicher Wendekreis · Sommeranfang'},
      'obs-arctic-spring':        {lat:66.5622, lng:0, m:3, d:20, noon:true,  label:'Nördlicher Polarkreis · Frühlingsanfang'},
      'obs-arctic-summer':        {lat:66.5622, lng:0, m:6, d:21, minute:0,   label:'Nördlicher Polarkreis · Sommeranfang'},
      'obs-northpole-spring':     {lat:90,      lng:0, m:3, d:20, noon:true,  label:'Nordpol · Frühlingsanfang'},
      'obs-northpole-summer':     {lat:90,      lng:0, m:6, d:21, noon:true,  label:'Nordpol · Sommeranfang'},
      'obs-southpole-northsummer':{lat:-90,     lng:0, m:6, d:21, noon:true,  label:'Südpol · Sommeranfang der Nordhalbkugel'},
      'obs-northpole-winter':     {lat:90,      lng:0, m:12,d:21, noon:true,  label:'Nordpol · Winteranfang (Polarnacht)'}
    };
    const s = scenes[id];
    if(!s) return false;
    const minute = s.noon ? safeNoon(y,s.m,s.d,s.lat,s.lng) : (s.minute==null ? 12*60 : s.minute);
    try{ if(typeof window.stopSolarYearSimulation==='function') window.stopSolarYearSimulation(); }catch(_){ }
    try{ if(typeof window.stopPrecessionRun100==='function') window.stopPrecessionRun100(); }catch(_){ }
    if(typeof setScene === 'function') setScene(s.lat,s.lng,s.m,s.d,minute,s.label,y);
    else { lat=s.lat; lng=s.lng; simYear=y; if(typeof date2doy==='function') simDay=date2doy(s.d,s.m-1,y); simMin=minute; }
    try{ if(typeof orientMode!=='undefined' && orientMode && typeof disableOrient==='function') disableOrient(); }catch(_){ }
    try{ if(typeof viewMode!=='undefined'){ viewMode='dome'; if(typeof syncViewModeButtons==='function') syncViewModeButtons(); } }catch(_){ }
    try{ if(typeof setSpeedValue==='function') setSpeedValue(1); }catch(_){ }
    window.__pendingRunSpeed = 3600;
    try{ if(typeof showAlt !== 'undefined') showAlt = true; }catch(_){ }
    try{ if(typeof showLines !== 'undefined') showLines = true; }catch(_){ }
    try{ if(typeof syncFocusButtons === 'function') syncFocusButtons(); }catch(_){ }
    try{ const b=document.getElementById('balt'); if(b)b.classList.toggle('on',!!showAlt); const bl=document.getElementById('blines'); if(bl)bl.classList.toggle('on',!!showLines); }catch(_){ }
    if(typeof showToast === 'function') showToast(s.label);
    if(typeof draw === 'function' && typeof W !== 'undefined' && W) draw();
    return true;
  }
  window.jumpScene = jumpScene = function(id){
    if(obsScene(id)) return;
    return oldJump ? oldJump.apply(this,arguments) : undefined;
  };
})();
