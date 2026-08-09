
// ── V10: Präzessionssimulation 100 Jahre/s; nur Polarstern, Errai, Alderamin, Vega ──
(function(){
  if(window.__v9Precession100Patch) return;
  window.__v9Precession100Patch = true;
  const BODY_SYMBOL_PREFIX = /^(☀|☾|☽|☿|♀|♂|♃|♄|♅|♆)\s*/;
  const PRECESSION_LABELS = new Set([
    'Polaris','Polarstern','Polarstern (Polaris)',
    'Errai','γ Cephei','Gamma Cephei',
    'Alderamin','Aldemarin','α Cephei','Alpha Cephei',
    'Wega','Vega','α Lyrae','Alpha Lyrae','Vega (α Lyrae)',
    'N'
  ]);
  function isAllowedPrecessionLabel(text){
    const t = String(text==null?'':text).replace(BODY_SYMBOL_PREFIX,'').trim();
    if(!t) return false;
    return t==='N' || PRECESSION_LABELS.has(t);
  }
  /* Auf ausdruecklichen Wunsch zurueck zur urspruenglichen Loesung: simYear springt wieder
     per setInterval einmal pro Sekunde um 100 Jahre (keine Bild-fuer-Bild-Glaettung mehr).
     Der Knopf "Praezessionskreis" (zoomToPrecessionCircle, eigener Abschnitt weiter oben in
     der Datei) bleibt unveraendert bestehen. Die Jahreszahl oben im Info-Kasten laeuft
     weiter mit, weil jeder Sekundenschritt ueber setPrecessionYear() simYear setzt und
     syncYearUI()/draw() aufruft.
     WICHTIG (siehe Build 20260804l): precessionTimer muss hier deklariert sein, sonst
     wirft stopPrecessionRun() beim ersten Aufruf sofort einen ReferenceError - das war die
     genaue Ursache des zuletzt gemeldeten Absturzes. */
  let precessionTimer = null;
  function stopPrecessionRun(){
    if(precessionTimer){ clearInterval(precessionTimer); precessionTimer = null; }
    if(window.didacticSimulationMode === 'precession') window.didacticSimulationMode = null;
  }
  function setPrecessionYear(y){
    try{
      simYear = y;
      const ys=document.getElementById('yearslider'); if(ys) ys.value = Math.max(+ys.min||-3000, Math.min(+ys.max||8000, y));
      if(typeof syncYearUI==='function') syncYearUI();
      if(typeof updLabels==='function') updLabels();
      if(typeof draw==='function'&&typeof W!=='undefined'&&W) draw();
    }catch(e){ console.warn(e); }
  }
  function stepPrecessionYears(){
    if(typeof paused!=='undefined' && paused) return;
    try{
      const current = (typeof simYear === 'number') ? simYear : 2026;
      setPrecessionYear(current + 100);
    }catch(e){ console.warn(e); }
  }
  function startPrecessionRun(){
    try{ if(typeof window.stopSolarYearSimulation==='function') window.stopSolarYearSimulation(); }catch(_){ }
    try{ if(typeof window.setYearPlay==='function') window.setYearPlay(false); }catch(_){ }
    stopPrecessionRun();
    window.didacticSimulationMode = 'precession';
    if(typeof setScene === 'function') setScene(52.52,13.405,3,20,22*60,'Berlin',1);
    setTimeout(()=>{
      window.didacticSimulationMode = 'precession';
      try{ if(typeof showNames!=='undefined') showNames = true; }catch(_){ }
      try{ const b=document.getElementById('bn'); if(b) b.classList.toggle('on', !!showNames); }catch(_){ }
      try{ if(typeof setSpeedValue === 'function') setSpeedValue(1); }catch(_){ }
      if(typeof setPaused === 'function') setPaused(false); else if(typeof paused!=='undefined') paused = false;
      precessionTimer = setInterval(stepPrecessionYears,1000);
      if(typeof showToast === 'function') showToast('Präzession · 100 Jahre/s · Polarstern, Errai, Alderamin, Vega');
      if(typeof draw === 'function' && typeof W !== 'undefined' && W) draw();
    },260);
  }
  // Im Canvas-Durchlauf der Präzessionssimulation alle Beschriftungen außer Polarstern, Errai, Alderamin und Wega unterdrücken.
  if(window.__planetariumRender && !window.__v9PrecessionDrawWrapped){
    window.__v9PrecessionDrawWrapped = true;
    window.__planetariumRender.registerAroundDraw('precession-label-filter',function(context){
      if(window.didacticSimulationMode !== 'precession' || !g) return context.next(...context.args);
      const oldFill = g.fillText.bind(g), oldStroke = g.strokeText.bind(g);
      g.fillText = function(text,x,y,maxWidth){ if(window.__drawingZodiac===true) return oldFill(text,x,y,maxWidth); if(!isAllowedPrecessionLabel(text)) return; const _t=String(text==null?'':text).replace(BODY_SYMBOL_PREFIX,'').trim(); const shown=_t==='Polaris'?'Polarstern':text; return oldFill(shown,x,y,maxWidth); };
      g.strokeText = function(text,x,y,maxWidth){ if(!isAllowedPrecessionLabel(text)) return; const _t=String(text==null?'':text).replace(BODY_SYMBOL_PREFIX,'').trim(); const shown=_t==='Polaris'?'Polarstern':text; return oldStroke(shown,x,y,maxWidth); };
      let r;
      try { r=context.next(...context.args); }
      finally { g.fillText = oldFill; g.strokeText = oldStroke; }
      return r;
    });
  }
  if(typeof jumpScene === 'function' && !window.__v9PrecessionJumpWrapped){
    const oldJump = jumpScene;
    window.__v9PrecessionJumpWrapped = true;
    jumpScene = function(id){
      if(id === 'sim-precession') return startPrecessionRun();
      stopPrecessionRun();
      return oldJump.apply(this,arguments);
    };
    window.jumpScene = jumpScene;
  }
  ['homeView','resetView','setNow','togAnim'].forEach(name=>{
    const old = window[name] || (typeof globalThis[name] === 'function' ? globalThis[name] : null);
    if(old && !window['__v9PrecessionStop_'+name]){
      window['__v9PrecessionStop_'+name] = true;
      window[name] = globalThis[name] = function(){ stopPrecessionRun(); return old.apply(this,arguments); };
    }
  });
  window.startPrecessionRun100 = startPrecessionRun;
  window.stopPrecessionRun100 = stopPrecessionRun;
})();
