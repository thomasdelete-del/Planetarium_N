
// ── V10.1: Präzession – Wega ergänzt, Sternnamen klein und zoomunabhängig ──
(function(){
  if(window.__v10PrecessionSmallFixedLabels) return;
  window.__v10PrecessionSmallFixedLabels = true;
  const BODY_SYMBOL_PREFIX=/^(☀|☾|☽|☿|♀|♂|♃|♄|♅|♆)\s*/;
  const PRECESSION_STARS=[
    {names:['Polaris','Polarstern','Polarstern (Polaris)'], label:'Polarstern', ra:2.53, de:89.26, dy:-20},
    {names:['Errai','γ Cephei','Gamma Cephei'], label:'Errai', ra:23.6558, de:77.6323, dy:-18},
    {names:['Alderamin','Aldemarin','α Cephei','Alpha Cephei'], label:'Alderamin', ra:21.3096, de:62.5856, dy:-18},
    {names:['Wega','Vega','α Lyrae','Alpha Lyrae','Vega (α Lyrae)'], label:'Wega', ra:18.6156, de:38.7837, dy:-18},
    {names:['Thuban','α Draconis','Alpha Draconis'], label:'Thuban', ra:14.0732, de:64.3758, dy:-18},
    {names:['Kochab','β Ursae Minoris','Beta Ursae Minoris'], label:'Kochab', ra:14.8451, de:74.1555, dy:-18},
    {names:['Deneb','α Cygni','Alpha Cygni'], label:'Deneb', ra:20.6905, de:45.2803, dy:-18}
  ];
  function isPrecessionView(){return window.didacticSimulationMode==='precession' || window.__v9PrecessionStatic===true;}
  function clean(t){return String(t==null?'':t).replace(BODY_SYMBOL_PREFIX,'').trim();}
  function isPrecessionStarName(t){const s=clean(t);return PRECESSION_STARS.some(st=>st.names.includes(s)||st.label===s);}
  function findStar(st){
    try{ if(typeof STARS!=='undefined'&&Array.isArray(STARS)){const f=STARS.find(s=>s&&st.names.includes(s.n)); if(f)return f;} }catch(_){ }
    return st;
  }
  function drawSmallFixedPrecessionLabel(st){
    try{
      if(typeof g==='undefined'||typeof cv==='undefined'||typeof altazXY!=='function'||typeof precess!=='function'||typeof currentJD!=='function')return;
      const star=findStar(st), jd=currentJD(), pc=precess(star.ra,star.de,jd);
      const R=(Math.min((cv&&cv.width)||W,(cv&&cv.height)||W)/2)*0.94;
      const p=altazXY(pc.ra,pc.dec,R);
      if(!p||p.alt<-10)return;
      const z=(typeof zoom==='number'?zoom:1), px=(typeof PX==='number'?PX:1);
      const x=ORX+(typeof panX==='number'?panX:0)+z*p.x;
      const y=ORY+(typeof panY==='number'?panY:0)+z*p.y+(st.dy||-18)*px;
      if(x<-120*px||y<-100*px||x>((cv&&cv.width)||0)+220*px||y>((cv&&cv.height)||0)+120*px)return;
      g.save();
      // ca. 60 % der normalen Himmelskörper-Beschriftung; bleibt unabhängig vom Zoom konstant.
      g.font=(8.4*px*(window.userLabelScale||1)*Math.max(.85,Math.min(1,Math.min(window.innerWidth,window.innerHeight)/430)))+'px Inter, system-ui, -apple-system, Segoe UI, sans-serif';
      g.textAlign='center'; g.textBaseline='middle';
      g.lineWidth=3*px;
      g.strokeStyle='rgba(0,0,0,.86)';
      g.fillStyle='rgba(235,246,255,.96)';
      g.strokeText(st.label,x,y);
      g.fillText(st.label,x,y);
      g.restore();
    }catch(e){console.warn('Präzessions-Sternname konnte nicht gezeichnet werden',e);}
  }
  function drawPrecessionSmallLabels(){ if(!isPrecessionView())return; PRECESSION_STARS.forEach(drawSmallFixedPrecessionLabel); }
  if(window.__planetariumRender){
    window.__planetariumRender.registerAroundDraw('precession-small-labels',function(context){
      if(!isPrecessionView()||typeof g==='undefined') return context.next(...context.args);
      const oldFill=g.fillText.bind(g), oldStroke=g.strokeText.bind(g);
      // Interne/alte große Präzessions-Sternnamen unterdrücken; Nordmarkierung N bleibt erhalten.
      g.fillText=function(text,x,y,maxWidth){ if(isPrecessionStarName(text))return; return oldFill(text,x,y,maxWidth); };
      g.strokeText=function(text,x,y,maxWidth){ if(isPrecessionStarName(text))return; return oldStroke(text,x,y,maxWidth); };
      try{return context.next(...context.args);} finally{g.fillText=oldFill;g.strokeText=oldStroke;var _pu3=window.__V9_UNIFY_LABELS;window.__V9_UNIFY_LABELS=false;try{drawPrecessionSmallLabels();}finally{window.__V9_UNIFY_LABELS=_pu3;}}
    });
  }
})();
