
// ── V9: Präzessionskarte – Polarstern immer beschriften ──
(function(){
  if(window.__v9PrecessionPolarisAlwaysPatch) return;
  window.__v9PrecessionPolarisAlwaysPatch = true;
  const PREC_IDS = new Set(['prec-year-1','prec-today','prec-6000','prec-vega','prec-cycle']);
  const BODY_SYMBOL_PREFIX = /^(☀|☾|☽|☿|♀|♂|♃|♄|♅|♆)\s*/;
  function isPrecessionView(){
    return window.didacticSimulationMode === 'precession' || window.__v9PrecessionStatic === true;
  }
  function isPolarisText(text){
    const t = String(text==null?'':text).replace(BODY_SYMBOL_PREFIX,'').trim();
    return t === 'Polaris' || t === 'Polarstern' || t === 'Polarstern (Polaris)';
  }
  function polarisStar(){
    try{
      if(typeof STARS !== 'undefined' && Array.isArray(STARS)){
        return STARS.find(s => s && (s.n === 'Polaris' || s.n === 'Polarstern'));
      }
    }catch(_){ }
    return {n:'Polaris',ra:2.53,de:89.26};
  }
  function drawPolarisLabel(){
    if(!isPrecessionView()) return;
    try{
      if(typeof g === 'undefined' || typeof altazXY !== 'function' || typeof precess !== 'function' || typeof currentJD !== 'function') return;
      const st = polarisStar();
      const jd = currentJD();
      const pc = precess(st.ra, st.de, jd);
      const R = (Math.min((cv&&cv.width)||W,(cv&&cv.height)||W)/2)*.94;
      const p = altazXY(pc.ra, pc.dec, R);
      if(!p || p.alt < -8) return;
      const x = ORX + (typeof panX==='number'?panX:0) + (typeof zoom==='number'?zoom:1)*p.x;
      const y = ORY + (typeof panY==='number'?panY:0) + (typeof zoom==='number'?zoom:1)*p.y - 18*PX;
      if(x < -80*PX || y < -80*PX || x > ((cv&&cv.width)||0)+180*PX || y > ((cv&&cv.height)||0)+80*PX) return;
      g.save();
      g.font = (12*PX*(window.userLabelScale||1)*Math.max(.85,Math.min(1,Math.min(window.innerWidth,window.innerHeight)/430))) + 'px Inter, system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineWidth = 4*PX;
      g.strokeStyle = 'rgba(0,0,0,.82)';
      g.fillStyle = 'rgba(235,246,255,.98)';
      g.strokeText('Polarstern', x, y);
      g.fillText('Polarstern', x, y);
      g.restore();
    }catch(e){ console.warn('Polarstern-Label konnte nicht gezeichnet werden', e); }
  }
  if(window.__planetariumRender && !window.__v9PrecessionPolarisDrawWrapped){
    window.__v9PrecessionPolarisDrawWrapped = true;
    window.__planetariumRender.registerAroundDraw('precession-polaris',function(context){
      if(!isPrecessionView() || typeof g === 'undefined') {
        return context.next(...context.args);
      }
      const oldFill = g.fillText.bind(g), oldStroke = g.strokeText.bind(g);
      g.fillText = function(text,x,y,maxWidth){ if(isPolarisText(text)) return; return oldFill(text,x,y,maxWidth); };
      g.strokeText = function(text,x,y,maxWidth){ if(isPolarisText(text)) return; return oldStroke(text,x,y,maxWidth); };
      try{ return context.next(...context.args); }
      finally{ g.fillText = oldFill; g.strokeText = oldStroke; var _pu1=window.__V9_UNIFY_LABELS; window.__V9_UNIFY_LABELS=false; try{ drawPolarisLabel(); } finally { window.__V9_UNIFY_LABELS=_pu1; } }
    });
  }
  if(typeof jumpScene === 'function' && !window.__v9PrecessionPolarisJumpWrapped){
    const oldJump = jumpScene;
    window.__v9PrecessionPolarisJumpWrapped = true;
    jumpScene = function(id){
      const isStatic = PREC_IDS.has(id);
      window.__v9PrecessionStatic = isStatic;
      const r = oldJump.apply(this, arguments);
      if(isStatic){
        setTimeout(()=>{ window.__v9PrecessionStatic = true; if(typeof draw==='function' && typeof W!=='undefined' && W) draw(); }, 360);
      } else if(id !== 'sim-precession') {
        window.__v9PrecessionStatic = false;
      }
      return r;
    };
    window.jumpScene = jumpScene;
  }
  ['homeView','resetView','setNow'].forEach(name=>{
    const old = window[name] || (typeof globalThis[name] === 'function' ? globalThis[name] : null);
    if(old && !window['__v9PrecessionPolarisClear_'+name]){
      window['__v9PrecessionPolarisClear_'+name] = true;
      window[name] = globalThis[name] = function(){ window.__v9PrecessionStatic = false; return old.apply(this, arguments); };
    }
  });
})();
