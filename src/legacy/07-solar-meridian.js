
// ── V9 Korrektur: Sonne-&-Jahreszeiten-Sprünge auf wahren Sonnenmeridian ──
(function(){
  if(window.__v9SeasonSunOnMeridian) return;
  window.__v9SeasonSunOnMeridian = true;
  const SEASON_DATES = {
    'spring-equinox': {m:3,  d:20, name:'Frühlingsanfang'},
    'summer-solstice':{m:6,  d:21, name:'Sommeranfang'},
    'autumn-equinox': {m:9,  d:22, name:'Herbstanfang'},
    'winter-solstice':{m:12, d:21, name:'Winteranfang'}
  };
  function normDayMinute(min){
    min = ((min % 1440) + 1440) % 1440;
    return min;
  }
  function offsetForDate(la, lo, month, day, year){
    let base = (typeof tzFromLng === 'function') ? tzFromLng(lo) : Math.round(lo/15);
    let dst = 0;
    try{
      const inEU = lo >= -10 && lo <= 40 && la >= 34 && la <= 72;
      if(inEU && typeof doyFromMonthDay === 'function' && typeof euDSTactive === 'function'){
        dst = euDSTactive(year, doyFromMonthDay(year, month, day)) ? 1 : 0;
      }
    }catch(_){ dst = 0; }
    return base + dst;
  }
  function trueSolarNoonMinute(la, lo, month, day, year){
    // Formel wie in sunriseSunset(): wahrer Mittag = Sonne im lokalen Meridian.
    // Equation of time in Minuten, Länge Ost positiv, lokale Zeitzone inklusive Sommerzeit.
    const off = offsetForDate(la, lo, month, day, year);
    const jdApprox = (typeof jdn === 'function') ? (jdn(year, month, day) - 0.5) : (typeof currentJD === 'function' ? currentJD() : 2460000);
    const eot = (typeof eqTime === 'function') ? eqTime(jdApprox) : 0;
    return normDayMinute(Math.round((12 - eot/60 - lo/15 + off) * 60));
  }
  function currentSeasonLocation(){
    if(window.currentGeo && isFinite(window.currentGeo.lat) && isFinite(window.currentGeo.lng)){
      return {lat:+window.currentGeo.lat, lng:+window.currentGeo.lng, label:window.currentGeo.label || 'Aktueller Standort'};
    }
    return {lat:(typeof lat==='number'?lat:52.52), lng:(typeof lng==='number'?lng:13.405), label:'Aktueller Standort'};
  }
  function jumpSeasonSunOnMeridian(id){
    const s = SEASON_DATES[id];
    if(!s) return false;
    const loc = currentSeasonLocation();
    const year = (typeof simYear === 'number' && isFinite(simYear)) ? simYear : new Date().getFullYear();
    const minute = trueSolarNoonMinute(loc.lat, loc.lng, s.m, s.d, year);
    window.__useCurrentLocationForNextScene = true;
    window.didacticLocationOverride = false;
    if(typeof setScene === 'function') setScene(loc.lat, loc.lng, s.m, s.d, minute, loc.label, year);
    setTimeout(()=>{
      // Meridian-Linie bleibt weiterhin nur bei Beobachtungspunkte-Sprüngen sichtbar.
      try{
        if(typeof showAlt !== 'undefined') showAlt = false;
        const b=document.getElementById('balt'); if(b) b.classList.toggle('on', false);
        if(typeof syncFocusButtons === 'function') syncFocusButtons();
      }catch(_){ }
      window.__useCurrentLocationForNextScene = false;
      if(typeof showToast === 'function'){
        const hh=Math.floor(minute/60), mm=Math.round(minute%60);
        showToast(s.name+' · Sonne im Meridian · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'));
      }
      if(typeof draw==='function' && typeof W!=='undefined' && W) draw();
    },260);
    return true;
  }
  const oldJumpScene = window.jumpScene || (typeof jumpScene==='function' ? jumpScene : null);
  window.jumpScene = jumpScene = function(id){
    if(SEASON_DATES[id]) return jumpSeasonSunOnMeridian(id);
    return oldJumpScene ? oldJumpScene.apply(this, arguments) : undefined;
  };
})();
