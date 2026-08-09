
/* ── V10: Didaktik-Fokus — Szenen-Presets, Chips, Akkordeon ── */
(function(){
  "use strict";
  if(window.__v10DidacticFocus)return;window.__v10DidacticFocus=true;
  var legacy=window.__planetariumLegacy;
  if(!legacy)throw new Error("Planetarium-Legacy-API fehlt");
  function getFlag(n){if(n==="__SP")return!!window.showSunPath;if(n==="__AN")return!!window.showAnalemma;if(n==="__EC")return window.didHideEcl!==true;if(n==="__MK")return !!window.__zodiacOn;return legacy.get(n)}
  function setFlag(n,v){if(n==="__SP"){window.showSunPath=!!v;return}if(n==="__AN"){window.showAnalemma=!!v;return}if(n==="__EC"){window.didHideEcl=!v;return}if(n==="__MK"){window.__zodiacOn=!!v;legacy.set("showZodiac",v);window.didHideEcl=!v;window.didHideConstNames=!v;return}legacy.set(n,v)}
  function setNum(n,v){legacy.set(n,+v)}
  function redraw(){try{if(typeof window.draw==="function")window.draw()}catch(e){}}
  var FLAGS=["showLines","showRefCircles","showNames","showZodiac","showTwilight","showISS","showMeteors","showJMoons","showRA","showAlt"];
  var BTN={showLines:"blines",showRefCircles:"brefc",showNames:"bn",showZodiac:"bzod",showTwilight:"btwi",showISS:"biss",showMeteors:"bmeteor",showRA:"bra",showAlt:"balt"};
  function syncButtons(){for(var f in BTN){var el=document.getElementById(BTN[f]);if(el)el.classList.toggle("on",!!getFlag(f))}}
  var P={
    seasons:{showZodiac:false,showNames:true,showISS:false,showMeteors:false,showJMoons:false,showLines:true,showRefCircles:true,showTwilight:false,showRA:false,showAlt:false},
    polar:{showZodiac:false,showNames:false,showISS:false,showJMoons:false,showLines:true,showRefCircles:true,showTwilight:true,showRA:false,showAlt:false},
    eclipse:{showZodiac:false,showNames:false,showISS:false,showMeteors:false,showJMoons:false,showLines:true,showRefCircles:true,showTwilight:false,showRA:false,showAlt:false},
    moon:{showZodiac:false,showNames:false,showISS:false,showJMoons:false,showLines:true,showRefCircles:true,showTwilight:false,showRA:false,showAlt:false},
    prec:{showZodiac:true,showNames:true,showISS:false,showJMoons:false,showLines:true,showRefCircles:true,showTwilight:false,showRA:false,showAlt:false},
    planets:{showZodiac:false,showNames:false,showISS:false,showJMoons:false,showLines:false,showRefCircles:false,showTwilight:false,showRA:false,showAlt:false},
    rotation:{showZodiac:false,showNames:false,showISS:false,showJMoons:false,showLines:true,showRefCircles:true,showTwilight:false,showRA:false,showAlt:false}
  };
  var MAP={"obs-equator-spring":"seasons","obs-equator-summer":"seasons","obs-tropic-spring":"seasons","obs-tropic-summer":"seasons","obs-arctic-spring":"seasons","obs-arctic-summer":"seasons","obs-northpole-spring":"seasons","obs-northpole-summer":"seasons","obs-southpole-northsummer":"seasons","obs-northpole-winter":"seasons","spring-equinox":"seasons","summer-solstice":"seasons","autumn-equinox":"seasons","winter-solstice":"seasons","equator-day":"seasons","north-pole":"seasons","south-pole":"seasons","tropic-cancer":"seasons","tropic-capricorn":"seasons","midnight-sun":"polar","polar-night":"polar","sim-polar-day":"polar","solar-eclipse":"eclipse","lunar-eclipse":"eclipse","solar-eclipse-prev":"eclipse","lunar-eclipse-prev":"eclipse","eclipse-2026-spain":"eclipse","sim-eclipse-search":"eclipse","new-moon":"moon","first-quarter":"moon","full-moon":"moon","last-quarter":"moon","sim-moon-phases":"moon","sim-precession":"prec","prec-year-1":"prec","prec-today":"prec","prec-6000":"prec","prec-vega":"prec","prec-cycle":"prec","sim-planet-run":"planets","sim-daily-rotation":"rotation","equator-night":"rotation"};
  var CONST_IDS={orion:1,"ursa-major":1,cassiopeia:1,scorpius:1,"milky-way-center":1,widder:1,stier:1,zwillinge:1,loewe:1,jungfrau:1,schuetze:1};
  var CHIPS={
    seasons:[["Sonnenbahn","__SP"],["Analemma","__AN"],["Dämmerung","showTwilight"],["Sternnamen","showNames"]],
    polar:[["Sonnenbahn","__SP"],["Dämmerung","showTwilight"],["Sternnamen","showNames"]],
    eclipse:[["Sternnamen","showNames"],["Tierkreis","showZodiac"]],
    moon:[["Sternnamen","showNames"],["Tierkreis","__MK"],["Dämmerung","showTwilight"]],
    prec:[["Tierkreis","__MK"]],
    planets:[["Sternnamen","showNames"],["Sternbild-Linien","showLines"]],
    rotation:[["Sonnenbahn","__SP"],["RA-Gitter","showRA"],["Sternnamen","showNames"],["Dämmerung","showTwilight"]]
  };
  var SCENE_OVERRIDE={"sim-moon-phases":{flags:{showZodiac:false,showLines:true,showRefCircles:true},after:function(){window.didHideEcl=false;window.showMoonPath=false;window.didHideMoon=false;},hideChips:["Sternnamen"]}};
  var PARTNER={"midnight-sun":"polar-night","polar-night":"midnight-sun","prec-today":"prec-vega","prec-vega":"prec-today","new-moon":"full-moon","full-moon":"new-moon","first-quarter":"last-quarter","last-quarter":"first-quarter","tropic-cancer":"tropic-capricorn","tropic-capricorn":"tropic-cancer","north-pole":"south-pole","south-pole":"north-pole","equator-day":"equator-night","equator-night":"equator-day"};
  var TOURS=[["new-moon","first-quarter","full-moon","last-quarter"],["prec-year-1","prec-today","prec-6000","prec-vega","prec-cycle"]];
  var lastScene=null,curSeason=null;
  window.__clearLastScene=function(){lastScene=null;};
  var SEASON_NAMES=["Frühlingsanfang","Sommeranfang","Herbstanfang","Winteranfang"];
  function seasonIdxFor(id){
    if(!id)return null;
    if(/spring|fruehling/.test(id))return 0;
    if(/northsummer/.test(id))return 1;
    if(/summer/.test(id))return 1;
    if(/autumn/.test(id))return 2;
    if(/winter/.test(id))return 3;
    return null;
  }
  function advanceSeason(btn){
    var next=((curSeason===null?0:curSeason)+1)%4,target=next*90;
    try{
      var sd0=legacy.get("simDay"),diy=legacy.call("daysInYear",legacy.get("simYear"));
      function f(d){setNum("simDay",d);var L=legacy.call("sunLon",legacy.call("currentJD"));return ((L-target)%360+540)%360-180}
      var prev=f(1),hit=null;
      for(var d=2;d<=diy;d++){var cur=f(d);if(prev<0&&cur>=0){hit=(Math.abs(prev)<cur)?d-1:d;break}prev=cur}
      if(hit===null)hit=sd0;
      setNum("simDay",hit);
      curSeason=next;
      window.__lastJumpId=["spring-equinox","summer-solstice","autumn-equinox","winter-solstice"][next];
      var daySlider=document.getElementById("dayslider");if(daySlider)daySlider.value=legacy.get("simDay");
      try{legacy.call("updLabels")}catch(e){}
      try{legacy.call("showToast",SEASON_NAMES[next])}catch(e){}
      if(btn)btn.textContent="⇄ "+SEASON_NAMES[(next+1)%4];
      redraw();
    }catch(e){}
  }
  function tourNext(id){for(var i=0;i<TOURS.length;i++){var k=TOURS[i].indexOf(id);if(k>=0)return TOURS[i][(k+1)%TOURS[i].length]}return null}
  /* Fokus-Schalter (persistiert) */
  var focus=true;try{focus=localStorage.getItem("didFocus")!=="0"}catch(e){}
  window.didacticFocus=focus;
  var snap=null,activeKey=null;
  function applyPreset(key){
    if(!window.didacticFocus||!P[key])return;
    if(!snap){snap={};for(var i=0;i<FLAGS.length;i++)snap[FLAGS[i]]=getFlag(FLAGS[i]);}
    var p=P[key];for(var f in p)setFlag(f,p[f]);
    window.showSunPath=(key==="seasons"||key==="polar"||key==="rotation");window.showAnalemma=false;
    window.didHideEcl=(key==="polar"||key==="prec"||key==="rotation");
    window.didHidePrec=(key!=="prec");
    window.didHidePlanets=(key!=="planets"&&key!=="eclipse");
    window.didHideMoon=(key!=="moon"&&key!=="eclipse"&&key!=="planets");
    window.didHideCirc=(key!=="rotation"&&key!=="prec");
    window.didHideConstNames=(key==="prec");
    window.__zodiacOn=!!p.showZodiac;
    window.didHideMW=(key==="prec");
    var ov=SCENE_OVERRIDE[lastScene];
    if(ov&&ov.flags){for(var of_ in ov.flags)setFlag(of_,ov.flags[of_]);}
    if(ov&&ov.after)ov.after();

    activeKey=key;syncButtons();renderChips();redraw();
    if(key==="seasons"&&curSeason!==null){try{legacy.call("showToast",SEASON_NAMES[curSeason])}catch(e){}}
    var NP_AUTOSTART={"obs-northpole-winter":1,"obs-northpole-summer":1};
    if(key==="seasons"&&NP_AUTOSTART[lastScene||""]){try{window.setGear&&window.setGear(3600,false)}catch(e){}}
    else if(key==="seasons"&&/^obs-/.test(lastScene||"")){try{window.setGear&&window.setGear(3600,true)}catch(e){}}
  }
  function restorePreset(){
    if(snap){for(var f in snap)if(snap[f]!==undefined)setFlag(f,snap[f]);snap=null;}
    window.showSunPath=false;window.showAnalemma=false;window.didHideEcl=false;window.__zodiacOn=false;window.__didScene=null;window.didHidePrec=false;window.didHidePlanets=false;window.didHideMoon=false;window.didHideCirc=false;window.didHideConstNames=false;window.didHideMW=false;window.showMoonPath=false;if(window.didacticSimulationMode==="moon")window.didacticSimulationMode=null;
    activeKey=null;syncButtons();renderChips();redraw();
  }
  window.__didacticRestore=restorePreset;
  /* Chips-Leiste */
  function ensureCss(){
    if(document.getElementById("v10-did-style"))return;
    var css=document.createElement("style");css.id="v10-did-style";
    css.textContent="#didactic-chips{position:absolute;left:calc(env(safe-area-inset-left,0px) + 64px);top:calc(env(safe-area-inset-top,0px) + 8px);z-index:209;display:none;flex-wrap:wrap;gap:.4rem;max-width:calc(70vw - 64px);pointer-events:none}"+
    "#didactic-chips button{font-family:'Inter',system-ui,sans-serif;font-size:.72rem;font-weight:600;color:#dfe8f5;background:rgba(16,20,38,.82);border:1px solid rgba(160,180,220,.4);border-radius:999px;padding:.34rem .7rem;min-height:34px;backdrop-filter:blur(3px);pointer-events:auto}"+
    "#didactic-chips button.on{color:#0b1020;background:#d4b65a;border-color:#d4b65a}"+
    "#jump-focus{display:block;margin:.45rem auto .1rem;font-family:'Inter',system-ui,sans-serif;font-size:.78rem;font-weight:700;color:#d4b65a;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.55);border-radius:999px;padding:.42rem .95rem;min-height:40px}"+
    "#jump-focus.off{color:#9aa4b8;border-color:rgba(154,164,184,.4);background:rgba(154,164,184,.08)}"+
    ".jump-card h2{cursor:pointer;-webkit-tap-highlight-color:transparent;position:relative;padding-right:1.2rem}"+
    ".jump-card h2:after{content:'▾';position:absolute;right:.15rem;top:0;color:#d4b65a;transition:transform .18s}"+
    ".jump-card.collapsed h2:after{transform:rotate(-90deg)}"+
    ".jump-card.collapsed>*:not(h2){display:none}"+
    ".jump-card.collapsed .lat-row{display:none!important}"+
    ".gear-btn{font-family:'Inter',system-ui,sans-serif;font-size:.7rem;font-weight:700;color:#cfd8e8;background:rgba(255,255,255,.07);border:1px solid rgba(160,180,220,.35);border-radius:8px;padding:.3rem .45rem;min-height:38px;flex:1}"+
    ".gear-btn.on{color:#0b1020;background:#d4b65a;border-color:#d4b65a}"+
    "#page-sky button,#page-sky .yb-btn,#page-sky input[type=range]{touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}";
    document.head.appendChild(css);
  }
  function renderChips(){
    ensureCss();
    var sky=document.getElementById("page-sky")||document.body;
    var bar=document.getElementById("didactic-chips");
    if(!bar){bar=document.createElement("div");bar.id="didactic-chips";sky.appendChild(bar);}
    if(!activeKey||!window.didacticFocus||!CHIPS[activeKey]){bar.style.display="none";bar.innerHTML="";return;}
    bar.innerHTML="";
    if(activeKey==="seasons"&&seasonIdxFor(lastScene)!==null){
      var sb=document.createElement("button");sb.type="button";sb.classList.add("on");
      sb.textContent="⇄ "+SEASON_NAMES[((curSeason===null?0:curSeason)+1)%4];
      sb.onclick=function(){advanceSeason(sb)};bar.appendChild(sb);
    }else if(lastScene&&PARTNER[lastScene]){
      var vb=document.createElement("button");vb.type="button";vb.textContent="⇄ Vergleich";vb.classList.add("on");
      vb.onclick=function(){window.jumpScene(PARTNER[lastScene])};bar.appendChild(vb);
    }
    if(lastScene&&tourNext(lastScene)){
      var tb=document.createElement("button");tb.type="button";tb.textContent="Weiter ›";tb.classList.add("on");
      tb.onclick=function(){window.jumpScene(tourNext(lastScene))};bar.appendChild(tb);
    }
    if(activeKey==="prec"){
      var pzb=document.createElement("button");pzb.type="button";pzb.textContent="🔍 Präzessionskreis";
      pzb.classList.toggle("on", typeof zoomedObj!=="undefined" && zoomedObj==="Präzessionskreis");
      pzb.onclick=function(){
        if(typeof zoomedObj!=="undefined" && zoomedObj==="Präzessionskreis"){
          if(typeof resetView==="function") resetView();
          pzb.classList.remove("on");
        }else if(typeof window.zoomToPrecessionCircle==="function"){
          window.zoomToPrecessionCircle();
          pzb.classList.add("on");
        }
      };
      bar.appendChild(pzb);
      if(lastScene==="prec-today"||lastScene==="prec-year-1"){
        var gtb=document.createElement("button");gtb.type="button";gtb.textContent="🔍 Zwillinge & Stier";
        gtb.classList.toggle("on", typeof zoomedObj!=="undefined" && zoomedObj==="Zwillinge & Stier");
        gtb.onclick=function(){
          if(typeof zoomedObj!=="undefined" && zoomedObj==="Zwillinge & Stier"){
            if(typeof resetView==="function") resetView();
            gtb.classList.remove("on");
          }else if(typeof window.zoomToGeminiTaurus==="function"){
            window.zoomToGeminiTaurus();
            gtb.classList.add("on");
          }
        };
        bar.appendChild(gtb);
      }
    }
    var chipsList=CHIPS[activeKey]||[];
    var ovc=SCENE_OVERRIDE[lastScene];
    if(ovc&&ovc.hideChips)chipsList=chipsList.filter(function(c){return ovc.hideChips.indexOf(c[0])<0});
    chipsList.forEach(function(c){
      var b=document.createElement("button");b.type="button";b.textContent=c[0];
      b.classList.toggle("on",!!getFlag(c[1]));
      b.onclick=function(){setFlag(c[1],!getFlag(c[1]));b.classList.toggle("on",!!getFlag(c[1]));syncButtons();redraw();};
      bar.appendChild(b);
    });
    bar.style.display="flex";
  }
  /* jumpScene-Wrapper (läuft als äußerster, da zuletzt installiert) */
  function wrapJump(){
    var old=window.jumpScene;
    if(typeof old!=="function"||old.__v10Wrapped)return false;
    var w=function(id){
      if(id!=="current")window.__lastJumpId=id;
      if(id==="current"){restorePreset();return old.apply(this,arguments);}
      var r=old.apply(this,arguments);
      var k=MAP[id];
      if(k){lastScene=id;curSeason=seasonIdxFor(id);window.__didScene=id;setTimeout(function(){applyPreset(k)},380);}
      else{
        restorePreset();
        if(id&&!CONST_IDS[id]){lastScene=id;}
      }
      try{initMainButtons()}catch(e){}
      return r;
    };
    w.__v10Wrapped=true;window.jumpScene=w;return true;
  }
  if(!wrapJump()){var t=setInterval(function(){if(wrapJump())clearInterval(t)},250);}
  /* Restore beim Rückweg */
  var oldRet=window.returnToDidacticPage;
  window.returnToDidacticPage=function(){
    if(typeof focusConstellation!=="undefined"&&focusConstellation&&typeof window.returnToDidactics==="function"){
      return window.returnToDidactics();
    }
    var ls=lastScene;restorePreset();var r=typeof oldRet==="function"?oldRet.apply(this,arguments):undefined;try{openLastSceneCard(ls)}catch(e){}return r;
  };
  /* Fokus-Toggle auf der Sprungseite */
  function initFocusBtn(){
    var sub=document.querySelector(".jump-sub")||document.querySelector(".jump-title");
    if(!sub||document.getElementById("jump-focus"))return;
    ensureCss();
    var b=document.createElement("button");b.type="button";b.id="jump-focus";
    function paint(){b.textContent="🎓 Fokus-Modus: "+(window.didacticFocus?"An":"Aus");b.classList.toggle("off",!window.didacticFocus);}
    paint();
    b.onclick=function(){
      window.didacticFocus=!window.didacticFocus;
      try{localStorage.setItem("didFocus",window.didacticFocus?"1":"0")}catch(e){}
      if(!window.didacticFocus)restorePreset();
      paint();
    };
    sub.parentNode.insertBefore(b,sub.nextSibling);
  }
  /* Akkordeon: nur eine Karte offen, erste standardmäßig */
  function openLastSceneCard(sceneId){
    var cards=document.querySelectorAll(".jump-card");
    for(var i=0;i<cards.length;i++)cards[i].classList.add("collapsed");
    if(!sceneId)return;
    var btn=document.querySelector('.jump-btn[data-scene-id="'+sceneId+'"]');
    if(!btn)return;
    var card=btn.closest?btn.closest(".jump-card"):null;
    if(card)card.classList.remove("collapsed");
    /* Vorher drei weiche Scrollvorgänge bei 150, 350 und 600 ms. In einem Rahmen
       mit zwingender Rastung bricht die Rastung eine laufende weiche Bewegung ab
       und zieht auf den nächsten Rastpunkt zurück; zusätzlich lösen sich die drei
       Bewegungen gegenseitig ab. Ob die Karte stehen blieb, hing davon ab, wann
       Schriften und Umbruch fertig waren — über das Netz also anders als bei der
       örtlich geöffneten Datei. Jetzt wird die Rastung kurz abgeschaltet, der
       Rollstand unmittelbar gesetzt und nachgeführt, bis er sich nicht mehr ändert. */
    var sc=document.getElementById("scroller");
    if(!sc){try{btn.scrollIntoView({block:"center"})}catch(e){} return;}
    var snapAlt=sc.style.scrollSnapType;
    sc.style.scrollSnapType="none";
    var fertig=function(){try{sc.style.scrollSnapType=snapAlt||""}catch(e){}};
    var ziel=function(){
      var r=btn.getBoundingClientRect(), q=sc.getBoundingClientRect();
      var z=sc.scrollTop+(r.top-q.top)-(sc.clientHeight-r.height)/2;
      return Math.max(0,Math.min(sc.scrollHeight-sc.clientHeight,z));
    };
    var letzt=-1,n=0;
    var schritt=function(){
      var z=ziel();
      sc.scrollTop=z;
      if(Math.abs(z-letzt)<1.5&&n>2){fertig();return;}
      letzt=z;
      if(++n<12)requestAnimationFrame(schritt); else fertig();
    };
    requestAnimationFrame(schritt);
    setTimeout(fertig,1200);
  }
  function initAccordion(){
    var cards=Array.prototype.slice.call(document.querySelectorAll(".jump-card"));
    if(!cards.length||cards[0].__v10Acc)return;
    ensureCss();
    cards.forEach(function(c,i){
      c.__v10Acc=true;
      c.classList.add("collapsed");
      var h=c.querySelector("h2");if(!h)return;
      h.addEventListener("click",function(){
        var wasOpen=!c.classList.contains("collapsed");
        cards.forEach(function(o){o.classList.add("collapsed")});
        if(!wasOpen)c.classList.remove("collapsed");
      });
    });
  }
  /* Ganghebel */
  function markGear(v){var bs=document.querySelectorAll(".gear-btn");for(var i=0;i<bs.length;i++){var t=bs[i].textContent;var on=(v===60&&t==="1 Min/s")||(v===3600&&t==="1 Std/s")||(v===86400&&t==="1 Tag/s")||(v==="year"&&t==="1 Jahr/s");bs[i].classList.toggle("on",!!on)}}
  window.setGear=function(v,noStart){
    ensureCss();
    try{if(typeof window.setYearPlay==="function")window.setYearPlay(false)}catch(e){}
    if(v==="year"){
      try{if(typeof window.setYearPlay==="function")window.setYearPlay(true,1)}catch(e){}
      markGear("year");return;
    }
    setNum("speed",v);
    if(!noStart){try{legacy.call("setPaused",false)}catch(e){}}
    var sl=document.getElementById("sSpd");if(sl)sl.value=Math.round(Math.min(1000,1000*Math.log(Math.min(v,3600))/Math.log(3600)));
    var lb=document.getElementById("lSpd");if(lb)lb.textContent=(v===60?"1 Min/s":v===3600?"1 Std/s":"1 Tag/s");
    markGear(v);
  };
  /* Sonnenbahn + Analemma (Ergebnis-Overlays) */
  function sunPt(HR){
    var jd=legacy.call("currentJD");
    var sr=legacy.call("ecl2rd",legacy.call("sunLon",jd),0,jd);
    return legacy.call("altazXY",sr.ra,sr.dec,HR);
  }
  function proj(p,ox,oy,z,px_,py_){return{X:ox+px_+z*p.x,Y:oy+py_+z*p.y,alt:p.alt}}
  function overlayCurves(){
    if(!window.showSunPath&&!window.showAnalemma)return;
    try{
      var g_=legacy.get("g"),FSf=document.body.classList.contains("fullscreen");
      var C_=legacy.get("C"),R_=C_*(FSf?.998:.975);
      var HR=R_*(legacy.get("showTwilight")?.8:(FSf?.965:.94));
      var z=legacy.get("zoom"),ox=legacy.get("ORX"),oy=legacy.get("ORY"),panx=legacy.get("panX")||0,pany=legacy.get("panY")||0;
      var sm=legacy.get("simMin"),sd=legacy.get("simDay");
      function strokePts(pts,style,dash){
        g_.save();g_.setTransform(1,0,0,1,0,0);
        g_.strokeStyle=style;g_.lineWidth=Math.max(1.2,1.4*(window.devicePixelRatio||1));
        if(dash)g_.setLineDash(dash);
        g_.beginPath();var pen=false;
        for(var i=0;i<pts.length;i++){var p=pts[i];
          if(!p||p.alt<-0.5){pen=false;continue}
          if(!pen){g_.moveTo(p.X,p.Y);pen=true}else g_.lineTo(p.X,p.Y);}
        g_.stroke();g_.setLineDash([]);g_.restore();
      }
      if(window.showSunPath){
        var pts=[];
        for(var t=0;t<=1440;t+=15){setNum("simMin",t);pts.push(proj(sunPt(HR),ox,oy,z,panx,pany))}
        setNum("simMin",sm);
        strokePts(pts,"rgba(245,205,110,.65)",[6,5]);
      }
      if(window.showAnalemma){
        var diy=legacy.call("daysInYear",legacy.get("simYear")),pa=[];
        for(var d=1;d<=diy;d+=3){setNum("simDay",d);pa.push(proj(sunPt(HR),ox,oy,z,panx,pany))}
        setNum("simDay",sd);
        pa.push(pa[0]);
        strokePts(pa,"rgba(125,214,255,.6)",null);
      }
      setNum("simMin",sm);setNum("simDay",sd);
    }catch(e){}
  }
  function wrapDrawForCurves(){
    if(!window.__planetariumRender||window.__v10Curves)return false;
    window.__v10Curves=true;
    window.__planetariumRender.registerAroundDraw('didactic-curves',function(context){var r=context.next(...context.args);try{overlayCurves()}catch(e){}return r});
    return true;
  }
  if(!wrapDrawForCurves()){var t2=setInterval(function(){if(wrapDrawForCurves())clearInterval(t2)},300)}
  /* Gang-Markierung löschen, wenn Speed-Slider manuell bewegt wird */
  function initGearClear(){var sl=document.getElementById("sSpd");if(sl&&!sl.__v10g){sl.__v10g=true;sl.addEventListener("input",function(){markGear(null)})}}
  function initPullRefresh(){
    if(window.__v11Pull)return;window.__v11Pull=true;
    try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
    try{if(sessionStorage.getItem("pullReload")==="1"){sessionStorage.removeItem("pullReload");window.scrollTo(0,0);setTimeout(function(){window.scrollTo(0,0)},60);}}catch(e){}
    var startY=null,dy=0,ind=null,t0=0;
    function ensureInd(){
      if(ind)return ind;
      ind=document.createElement("div");ind.id="pull-refresh-ind";
      ind.style.cssText="position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);z-index:400;font-family:'Inter',system-ui,sans-serif;font-size:.78rem;font-weight:700;color:#0b1020;background:#d4b65a;border-radius:999px;padding:.4rem .9rem;box-shadow:0 4px 16px rgba(0,0,0,.4);display:none";
      document.body.appendChild(ind);return ind;
    }
    document.addEventListener("touchstart",function(e){
      var onJump=e.target&&e.target.closest&&e.target.closest("#page-jumps");
      if(onJump&&(window.scrollY||0)<=2&&e.touches.length===1){startY=e.touches[0].clientY;dy=0;t0=Date.now();}
      else startY=null;
    },{passive:true});
    document.addEventListener("touchmove",function(e){
      if(startY===null)return;
      if((window.scrollY||0)>2){startY=null;ensureInd().style.display="none";return;}
      dy=e.touches[0].clientY-startY;
      var el=ensureInd();
      if(dy>36){var _bereit=(dy>90&&(Date.now()-t0)>=1000);el.textContent=_bereit?"↻ Loslassen: Neu starten":"↓ Ziehen und einen Augenblick halten";el.style.display="block";}
      else el.style.display="none";
    },{passive:true});
    document.addEventListener("touchend",function(){
      var el=ensureInd();el.style.display="none";
      if(startY!==null&&dy>90&&(Date.now()-t0)>=1000){el.textContent="↻ Starte neu …";el.style.display="block";try{sessionStorage.setItem("pullReload","1")}catch(e){}setTimeout(function(){location.reload()},120);}
      startY=null;dy=0;
    },{passive:true});
  }
  function initMainButtons(){
    // "Ganzer Himmel" um Aufräumen erweitern — einmalig, ohne den Klickpfad zu ändern (onclick bleibt)
    if(!window.__homeWrapped && typeof window.homeView==="function"){
      var oh=window.homeView;
      window.homeView=function(){
        try{if(typeof window.stopSolarYearSimulation==="function")window.stopSolarYearSimulation()}catch(e){}
        try{if(typeof window.stopPrecessionRun100==="function")window.stopPrecessionRun100()}catch(e){}
        try{if(typeof window.__didacticRestore==="function")window.__didacticRestore()}catch(e){}
        return oh.apply(this,arguments);
      };
      window.__homeWrapped=true;
    }
  }
  function reparentFixed(){
    try{
      ["panel-handle","info-bl","info-br","info-tr","year-bar","didactic-back","didactic-chips","bview-fs"].forEach(function(id){
        var el=document.getElementById(id);
        if(el && el.parentElement!==document.body){ document.body.appendChild(el); }
      });
    }catch(e){}
  }
  function init(){
    [initFocusBtn,initAccordion,initGearClear,initPullRefresh,initMainButtons,reparentFixed].forEach(function(fn){
      try{fn()}catch(e){console.warn(fn.name,e)}
    });
    setTimeout(reparentFixed,500);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
