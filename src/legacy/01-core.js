"use strict";const cv=document.getElementById("cv"),g=cv.getContext("2d"),wrap=document.getElementById("wrap");(function(){if(!g||!g.createRadialGradient)return;var _rg=g.createRadialGradient.bind(g),_lg=g.createLinearGradient.bind(g);function ok(){for(var i=0;i<arguments.length;i++)if(!isFinite(arguments[i]))return false;return true}g.createRadialGradient=function(x0,y0,r0,x1,y1,r1){return ok(x0,y0,r0,x1,y1,r1)?_rg(x0,y0,r0,x1,y1,r1):_rg(-1e5,-1e5,0,-1e5,-1e5,1)};g.createLinearGradient=function(x0,y0,x1,y1){return ok(x0,y0,x1,y1)?_lg(x0,y0,x1,y1):_lg(-1e5,-1e5,-1e5,-1e5+1)};})();function setFontScale(v){v=Math.max(60,Math.min(180,+v||100));window.userLabelScale=v/100;const l=document.getElementById("lFont");if(l)l.textContent=v+"%";const el=document.getElementById("sFont");if(el&&+el.value!==v)el.value=v;try{localStorage.setItem("skyFontScale",v)}catch(e){}if(typeof W!=="undefined"&&W)draw()}window.setFontScale=setFontScale;(function(){try{const v=+localStorage.getItem("skyFontScale");if(v>=60&&v<=180){window.userLabelScale=v/100;const el=document.getElementById("sFont");if(el)el.value=v;const l=document.getElementById("lFont");if(l)l.textContent=v+"%"}}catch(e){}})();
/* V9 einheitliches Beschriftungssystem für Canvas: Himmelskörper + Linien */
window.__V9_UNIFY_LABELS=true;window.__V9_LABEL_SIZE=13;
(function(){
  const directFillText=g.fillText.bind(g);
  const nativeFillText=function(text,x,y,maxWidth){
    g.save();
    g.shadowColor="transparent";g.shadowBlur=0;g.shadowOffsetX=0;g.shadowOffsetY=0;
    try{
      if(maxWidth===undefined&&window.__renderTextSprite&&window.__renderTextSprite(g,text,x,y))return;
      return maxWidth===undefined?directFillText(text,x,y):directFillText(text,x,y,maxWidth);
    }finally{g.restore()}
  };
  const zNames=new Set(["Widder","Stier","Zwillinge","Krebs","Löwe","Jungfrau","Waage","Skorpion","Schütze","Steinbock","Wassermann","Fische"]);
  const planetNames=new Set(["Merkur","Venus","Mars","Jupiter","Saturn","Uranus","Neptun"]);
  function isLineLabel(t){
    return /^(Meridian|Himmelsnordpol|Präzessionskreis|Himmelsäquator|Wendekreis|Zirkumpolar|Ekliptik|Horizont|Nord|Süd|Ost|West|N|S|O|W|NO|NW|SO|SW)$/.test(t)
      || /^[-+−]?\d+°$/.test(t) || /^\d+ʰ$/.test(t) || /Dämm\.$/.test(t) || /^☄ /.test(t) || t==="☊" || t==="☋" || t==="♈";
  }
  function bodyColor(t){
    if(t==="Sonne" || /^Finsternis/.test(t) || /^Totale Finsternis/.test(t))return "#F5D76E";
    if(t==="Mond" || /^Mond/.test(t))return "#F2F2F2";
    if(planetNames.has(t))return "#EED28A";
    return null;
  }
  function hideBodyLabelBelowHorizon(t){
    if(window.__didScene!=="sim-planet-run")return false;
    try{
      const jd=currentJD();
      if(planetNames.has(t)){
        const p=allPlanets(jd).find(o=>o.n===t);
        return !!p&&geoAlt(p.ra,p.dec)<0;
      }
      if(t==="Sonne"||/^Finsternis/.test(t)||/^Totale Finsternis/.test(t)){
        const p=ecl2rd(sunLon(jd),0,jd);
        return geoAlt(p.ra,p.dec)<0;
      }
      if(t==="Mond"||/^Mond/.test(t)){
        const p=moonTopo(jd);
        return geoAlt(p.ra,p.dec)<0;
      }
    }catch(e){}
    return false;
  }
  g.fillText=function(text,x,y,maxWidth){
    if(window.__V9_UNIFY_LABELS && typeof text==="string"){
      const size=window.__V9_LABEL_SIZE || 13;
      const zodiac=zNames.has(text) && window.__drawingZodiac===true;
      const line=isLineLabel(text);
      const bc=bodyColor(text);
      const looksLikeSkyLabel = zodiac || line || bc || (text.length>1 && text.length<34 && !/^T[−-]/.test(text));
      if(looksLikeSkyLabel){
        if(bc&&hideBodyLabelBelowHorizon(text))return;
        const pf=g.font, pc=g.fillStyle, ps=g.shadowColor, pb=g.shadowBlur, pox=g.shadowOffsetX, poy=g.shadowOffsetY;
        const sz=zodiac?size*.82:size;
        g.font=`600 ${sz}px Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`;
        g.shadowColor="rgba(2,6,18,.94)";g.shadowBlur=Math.max(3,(window.devicePixelRatio||1)*4);g.shadowOffsetX=0;g.shadowOffsetY=0;
        if(zodiac)g.fillStyle="rgba(245,198,92,.88)";
        else if(/^☄ /.test(text))g.fillStyle="rgba(255,185,95,.88)";
        else if(text==="Präzessionskreis")g.fillStyle="rgba(125,214,255,.86)";
        else if(line)g.fillStyle="rgba(172,208,232,.82)";
        else if(bc)g.fillStyle=bc;
        const mustDraw = !!bc || /^(N|S|O|W|NO|NW|SO|SW|Nord|Süd|Ost|West)$/.test(text) || text==="Sonne" || /^Mond/.test(text);
        let boxOK=true;
        if(Array.isArray(window.__lblBoxes)){
          const w=g.measureText(text).width,h=sz*1.25;
          let x0=x;const ta=g.textAlign;if(ta==="center")x0=x-w/2;else if(ta==="right"||ta==="end")x0=x-w;
          let y0=y;const tb=g.textBaseline;if(tb==="middle")y0=y-h/2;else if(tb==="bottom"||tb==="ideographic")y0=y-h;else if(tb==="alphabetic")y0=y-h*.8;
          const m=g.getTransform();
          const cs=[[x0,y0],[x0+w,y0],[x0,y0+h],[x0+w,y0+h]].map(p=>({X:m.a*p[0]+m.c*p[1]+m.e,Y:m.b*p[0]+m.d*p[1]+m.f}));
          const pd=2*(window.devicePixelRatio||1);
          const bx={x1:Math.min(cs[0].X,cs[1].X,cs[2].X,cs[3].X)-pd,y1:Math.min(cs[0].Y,cs[1].Y,cs[2].Y,cs[3].Y)-pd,x2:Math.max(cs[0].X,cs[1].X,cs[2].X,cs[3].X)+pd,y2:Math.max(cs[0].Y,cs[1].Y,cs[2].Y,cs[3].Y)+pd};
          /* Im Zeitlauf veraendert sich eine Textbox pro Bild nur minimal. Eine
             komplett neue Kollisionsentscheidung liess Sternnamen dennoch
             abwechselnd erscheinen und verschwinden; das wurde als Ruckeln
             wahrgenommen, obwohl ihre Projektion korrekt war. Waehrend einer
             laufenden Zeitanimation bleibt die vom Helligkeitsfilter gewaehlte
             Namensmenge deshalb stabil. Im Standbild verhindert die bisherige
             Kollisionspruefung weiterhin unlesbare Ueberlagerungen. */
          const legacyState=window.__planetariumLegacy;
          const smoothTimeLabels=!!legacyState&&(!legacyState.get("paused")||Number(legacyState.get("interacting"))>0);
          if(!mustDraw&&!smoothTimeLabels){for(const o of window.__lblBoxes){if(bx.x1<o.x2&&bx.x2>o.x1&&bx.y1<o.y2&&bx.y2>o.y1){boxOK=false;break}}}
          if(boxOK||mustDraw)window.__lblBoxes.push(bx);
        }
        if(boxOK||mustDraw){if(maxWidth===undefined)nativeFillText(text,x,y);else nativeFillText(text,x,y,maxWidth);}
        g.font=pf;g.fillStyle=pc;g.shadowColor=ps;g.shadowBlur=pb;g.shadowOffsetX=pox;g.shadowOffsetY=poy;
        return;
      }
    }
    if(maxWidth===undefined)nativeFillText(text,x,y);else nativeFillText(text,x,y,maxWidth);
  };
})();let W=0,C=0,PX=1;function resize(){PX=Math.min(window.devicePixelRatio||1,2);const ww=window.innerWidth,hh=window.innerHeight;cv.width=Math.round(ww*PX);cv.height=Math.round(hh*PX);cv.style.width=ww+"px";cv.style.height=hh+"px";W=Math.min(cv.width,cv.height);C=W/2;cvW=cv.width;cvH=cv.height}let cvW=0,cvH=0,ORX=0,ORY=0;function fitToScreen(){resize();if(W&&typeof draw==="function")draw()}resize();window.addEventListener("resize",fitToScreen);window.addEventListener("orientationchange",()=>{setTimeout(fitToScreen,120);setTimeout(fitToScreen,400)});if(window.visualViewport){window.visualViewport.addEventListener("resize",fitToScreen)}document.addEventListener("DOMContentLoaded",fitToScreen);window.addEventListener("load",()=>{fitToScreen();setTimeout(fitToScreen,250)});setTimeout(fitToScreen,150);setTimeout(fitToScreen,600);function jdn(yr,mo,dy){const A=Math.floor((14-mo)/12),Y=yr+4800-A,M=mo+12*A-3;return dy+Math.floor((153*M+2)/5)+365*Y+Math.floor(Y/4)-Math.floor(Y/100)+Math.floor(Y/400)-32045}function simJD(doy,mn){return jdn(simYear,1,1)+doy-1-.5+(mn-utcOff*60)/1440}function sunLon(jd0){const T=(jd0-2451545)/36525,L0=((280.46646+36000.76983*T)%360+360)%360,M=((357.52911+35999.05029*T-1537e-7*T*T)%360+360)*Math.PI/180,C=(1.914602-.004817*T-14e-6*T*T)*Math.sin(M)+(.019993-101e-6*T)*Math.sin(2*M)+289e-6*Math.sin(3*M),omega=(125.04-1934.136*T)*Math.PI/180;return((L0+C-.00569-.00478*Math.sin(omega))%360+360)%360}function oblR(jd0){return _vondrak(jd0).eps}function sunDec(jd0){const lon=sunLon(jd0);return Math.asin(Math.sin(oblR(jd0))*Math.sin(lon*Math.PI/180))*180/Math.PI}function eqTime(jd0){const T=(jd0-2451545)/36525,eps=oblR(jd0),L0=((280.46646+36000.76983*T)%360+360)*Math.PI/180,M=((357.52911+35999.05029*T)%360+360)*Math.PI/180,e=.016708634-42037e-9*T,y=Math.tan(eps/2)**2;return(y*Math.sin(2*L0)-2*e*Math.sin(M)+4*e*y*Math.sin(M)*Math.cos(2*L0)-.5*y*y*Math.sin(4*L0)-1.25*e*e*Math.sin(2*M))*4*180/Math.PI}function sunriseSunset(jd0,latDeg,lngDeg,utcOff){const dec=sunDec(jd0)*Math.PI/180,phi=latDeg*Math.PI/180,h0=-.8333*Math.PI/180,den=Math.cos(phi)*Math.cos(dec);let cosH=(Math.sin(h0)-Math.sin(phi)*Math.sin(dec))/den;if(!isFinite(cosH))cosH=cosH<0?-2:2;if(cosH<=-1)return{rise:0,set:24,polar:"day"};if(cosH>=1)return{rise:12,set:12,polar:"night"};const H=Math.acos(cosH)*180/Math.PI/15,noon=12-eqTime(jd0)/60-lngDeg/15+utcOff;return{rise:noon-H,set:noon+H}}let _gastCache={jd:null,v:0};function GAST(jd0){if(_gastCache.jd===jd0)return _gastCache.v;const _gv=_GASTraw(jd0);_gastCache={jd:jd0,v:_gv};return _gv}function _GASTraw(jd0){const T=(jd0-2451545)/36525,gmst=280.46061837+360.98564736629*(jd0-2451545)+387933e-9*T*T-T*T*T/3871e4,omega=(125.04452-1934.136261*T)*Math.PI/180,L0=(280.4665+36000.7698*T)*Math.PI/180,Lm=(218.3165+481267.8813*T)*Math.PI/180,dpsi=-.00478*Math.sin(omega)-3667e-7*Math.sin(2*L0)-1327e-7*Math.sin(2*Lm);return((gmst+dpsi*Math.cos(oblR(jd0)))%360+360)%360}function ecl2rd(lon,lat2,jd0){const eps=oblR(jd0),lr=lon*Math.PI/180,br=lat2*Math.PI/180,x=Math.cos(br)*Math.cos(lr),y=Math.cos(eps)*Math.cos(br)*Math.sin(lr)-Math.sin(eps)*Math.sin(br),z=Math.sin(eps)*Math.cos(br)*Math.sin(lr)+Math.cos(eps)*Math.sin(br);return{ra:(Math.atan2(y,x)*180/Math.PI+360)%360/15,dec:Math.asin(Math.max(-1,Math.min(1,z)))*180/Math.PI}}function moonEcl(jd0){const T=(jd0-2451545)/36525,d2r=Math.PI/180;const Lp=218.3164477+481267.88123421*T-.0015786*T*T+T*T*T/538841-T*T*T*T/65194e3;const D=297.8501921+445267.1114034*T-.0018819*T*T+T*T*T/545868-T*T*T*T/113065e3;const M=357.5291092+35999.0502909*T-1536e-7*T*T+T*T*T/2449e4;const Mp=134.9633964+477198.8675055*T+.0087414*T*T+T*T*T/69699-T*T*T*T/14712e3;const F=93.272095+483202.0175233*T-.0036539*T*T-T*T*T/3526e3+T*T*T*T/86331e4;const A1=119.75+131.849*T,A2=53.09+479264.29*T,A3=313.45+481266.484*T;const E=1-.002516*T-74e-7*T*T;const Dr=D*d2r,Mr=M*d2r,Mpr=Mp*d2r,Fr=F*d2r;const TA=[[0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],[0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],[0,0,0,2,-114332,-3149],[2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],[2,-1,0,0,45758,-204586],[0,1,-1,0,-40923,-129620],[1,0,0,0,-34720,108743],[0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],[0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],[0,0,3,0,10034,-23210],[4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],[2,1,0,0,-6766,30824],[1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],[2,-1,1,0,4036,-12831],[2,0,2,0,3994,-10445],[4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],[0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],[2,-1,-2,0,2390,10056],[1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],[0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],[2,0,1,-2,-1773,4130],[2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],[3,0,-1,0,-892,3258],[2,1,1,0,-810,2616],[4,-1,-2,0,759,-1897],[0,2,-1,0,-713,-2117],[2,2,-1,0,-700,2354],[2,1,-2,0,691,0],[2,-1,0,-2,596,0],[4,0,1,0,549,-1423],[0,0,4,0,537,-1117],[4,-1,0,0,520,-1571],[1,0,-2,0,-487,-1739],[2,1,0,-2,-399,0],[0,0,2,-2,-381,-4421],[1,1,1,0,351,0],[3,0,-2,0,-340,0],[4,0,-3,0,330,0],[2,-1,2,0,327,0],[0,2,1,0,-323,1165],[1,1,-1,0,299,0],[2,0,3,0,294,0],[2,0,-1,-2,0,8752]];const TB=[[0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],[0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],[0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],[4,0,0,-1,1021],[4,0,-1,1,833],[0,0,1,-3,777],[4,0,-2,1,671],[2,0,0,-3,607],[2,0,2,-1,596],[2,-1,1,-1,491],[2,0,-2,1,-451],[0,0,3,-1,439],[2,0,2,1,422],[2,0,-3,-1,421],[2,1,-1,1,-366],[2,1,0,1,-351],[4,0,0,1,331],[2,-1,1,1,315],[2,-2,0,-1,302],[0,0,1,3,-283],[2,1,1,-1,-229],[1,1,0,-1,223],[1,1,0,1,223],[0,1,-2,-1,-220],[2,1,-1,-1,-220],[1,0,1,1,-185],[2,-1,-2,-1,181],[0,1,2,1,-177],[4,0,-2,-1,176],[4,-1,-1,-1,166],[1,0,1,-1,-164],[4,0,1,-1,132],[1,0,-1,-1,-119],[4,-1,0,-1,115],[2,-2,0,1,107]];let sL=0,sB=0,sR2=0;for(const t of TA){const arg=t[0]*Dr+t[1]*Mr+t[2]*Mpr+t[3]*Fr;let ef=1;const am=Math.abs(t[1]);if(am===1)ef=E;else if(am===2)ef=E*E;sL+=t[4]*ef*Math.sin(arg);sR2+=t[5]*ef*Math.cos(arg)}for(const t of TB){const arg=t[0]*Dr+t[1]*Mr+t[2]*Mpr+t[3]*Fr;let ef=1;const am=Math.abs(t[1]);if(am===1)ef=E;else if(am===2)ef=E*E;sB+=t[4]*ef*Math.sin(arg)}const A1r=A1*d2r,A2r=A2*d2r,A3r=A3*d2r,Lpr=Lp*d2r;sL+=3958*Math.sin(A1r)+1962*Math.sin(Lpr-Fr)+318*Math.sin(A2r);sB+=-2235*Math.sin(Lpr)+382*Math.sin(A3r)+175*Math.sin(A1r-Fr)+175*Math.sin(A1r+Fr)+127*Math.sin(Lpr-Mpr)-115*Math.sin(Lpr+Mpr);const dist=385000.56+sR2/1e3;return{lon:((Lp+sL/1e6)%360+360)%360,lat:sB/1e6,dist:dist}}function moonElong(jd0){const ml=moonEcl(jd0).lon,sl=sunLon(jd0);return((ml-sl)%360+360)%360}function lastNewMoonJD(jd0){let g=jd0-moonElong(jd0)/360*29.53058868;for(let i=0;i<6;i++){let s=moonElong(g);if(s>180)s-=360;g-=s/12.190749}return g}function moonAge(jd0){const S=29.53058868;let a=jd0-lastNewMoonJD(jd0);return(a%S+S)%S}function moonIllum(jd0){return(1-Math.cos(moonElong(jd0)*Math.PI/180))/2}function helio(jd0,L0,dL,a,e,w0,dw,i0,di,O0,dO){const T=(jd0-2451545)/36525,L=((L0+dL*T)%360+360)%360*Math.PI/180,w=((w0+dw*T/3600)%360+360)%360*Math.PI/180,i=(i0+di*T/3600)*Math.PI/180,O=((O0+dO*T/3600)%360+360)%360*Math.PI/180,M=((L-w)*180/Math.PI%360+360)*Math.PI/180;let E=M;for(let k=0;k<4;k++)E=M+e*Math.sin(E);const v=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2)),r=a*(1-e*Math.cos(E)),lon=((w+v)*180/Math.PI%360+360)%360*Math.PI/180,x=r*(Math.cos(O)*Math.cos(lon-O)-Math.sin(O)*Math.sin(lon-O)*Math.cos(i)),y2=r*(Math.sin(O)*Math.cos(lon-O)+Math.cos(O)*Math.sin(lon-O)*Math.cos(i));return{x:x,y:y2}}function earthH(jd0){return helio(jd0,100.4664,36000.7698,1.00001,.016709,-11.26064,6189.4,0,-46.94,174.873,-25.25)}function allPlanets(jd0){const E=earthH(jd0);const PL=[{n:"Merkur",sym:"☿",col:[168,160,148],sz:.009,dia:6.74,H:-.42,el:[252.2509,149472.6746,.3871,.20564,77.4561,6189.4,7.005,-59.66,48.3309,-24.44]},{n:"Venus",sym:"♀",col:[250,243,222],sz:.012,dia:16.92,H:-4.4,el:[181.9798,58517.8156,.72333,.00677,131.5637,692.9,3.3947,-67,76.6799,-12.1]},{n:"Mars",sym:"♂",col:[206,108,66],sz:.011,dia:9.36,H:-1.52,el:[355.433,19140.2993,1.52366,.09341,336.06,6619,1.8497,-83.51,49.5581,-24.45]},{n:"Jupiter",sym:"♃",col:[214,189,158],sz:.016,dia:196.94,H:-9.4,el:[34.3515,3034.9057,5.2044,.04839,14.7312,389,1.303,25.4,100.4542,228.6]},{n:"Saturn",sym:"♄",col:[226,206,158],sz:.014,dia:165.6,H:-8.88,ring:true,el:[50.0775,1222.1138,9.53707,.05415,92.4314,1948,2.4889,-.36,113.6634,-72.26]},{n:"Uranus",sym:"♅",col:[178,224,230],sz:.011,dia:65.8,H:-7.19,el:[314.055,428.4882,19.1913,.04717,170.9643,994,.7733,19.63,74.0005,176.23]},{n:"Neptun",sym:"♆",col:[58,108,214],sz:.01,dia:62.2,H:-6.87,el:[304.3487,218.4622,30.069,.00858,44.971,-36,1.77,30.7,131.7841,-47]}];const Rearth=Math.hypot(E.x,E.y);return PL.map(p=>{const[L0,dL,a,e,w0,dw,i0,di,O0,dO]=p.el;const h=helio(jd0,L0,dL,a,e,w0,dw,i0,di,O0,dO);const gx=h.x-E.x,gy=h.y-E.y;const geoLon=(Math.atan2(gy,gx)*180/Math.PI+360)%360;const rd=ecl2rd(geoLon,0,jd0);const r=Math.hypot(h.x,h.y);const delta=Math.hypot(gx,gy);const cosB=Math.max(-1,Math.min(1,(r*r+delta*delta-Rearth*Rearth)/(2*r*delta)));const beta=Math.acos(cosB)*180/Math.PI;const phaseFrac=(1+cosB)/2;let mag=p.H+5*Math.log10(r*delta);if(p.n==="Venus")mag+=.09*(beta/100)+2.39*Math.pow(beta/100,2)-.65*Math.pow(beta/100,3);else if(p.n==="Mercury"||p.n==="Merkur")mag+=.038*beta-273e-6*beta*beta+2e-6*beta*beta*beta;else if(p.n==="Mars")mag+=.016*beta;else if(p.n==="Saturn"){const B=saturnRingB(geoLon)*Math.PI/180;mag+=.044*beta-2.6*Math.abs(Math.sin(B))+1.25*Math.sin(B)*Math.sin(B)}else mag+=.005*beta;const angDia=p.dia/delta;return{...p,...rd,lon:geoLon,r:r,delta:delta,beta:beta,phaseFrac:phaseFrac,mag:mag,angDia:angDia}})}const STARS=[{n:"Polaris",ra:2.53,de:89.26,mag:2.02,c:"UMi"},{n:"Yildun",ra:17.537,de:86.59,mag:4.35,c:"UMi"},{n:"Kochab",ra:14.845,de:74.16,mag:2.07,c:"UMi"},{n:"Pherkad",ra:15.345,de:71.83,mag:3.05,c:"UMi"},{n:"Schedar",ra:.676,de:56.54,mag:2.24,c:"Cas"},{n:"Caph",ra:.153,de:59.15,mag:2.28,c:"Cas"},{n:"Cih",ra:.945,de:60.72,mag:2.15,c:"Cas"},{n:"Ruchbah",ra:1.43,de:60.24,mag:2.66,c:"Cas"},{n:"Segin",ra:1.907,de:63.67,mag:3.37,c:"Cas"},{n:"Dubhe",ra:11.062,de:61.75,mag:1.81,c:"UMa"},{n:"Merak",ra:11.031,de:56.38,mag:2.34,c:"UMa"},{n:"Phekda",ra:11.897,de:53.69,mag:2.44,c:"UMa"},{n:"Megrez",ra:12.257,de:57.03,mag:3.31,c:"UMa"},{n:"Alioth",ra:12.9,de:55.96,mag:1.76,c:"UMa"},{n:"Mizar",ra:13.399,de:54.93,mag:2.23,c:"UMa"},{n:"Alkaid",ra:13.792,de:49.31,mag:1.85,c:"UMa"},{n:"Eltanin",ra:17.944,de:51.49,mag:2.23,c:"Dra"},{n:"Rastaban",ra:17.507,de:52.3,mag:2.79,c:"Dra"},{n:"Altais",ra:19.209,de:67.66,mag:3.07,c:"Dra"},{n:"Thuban",ra:14.074,de:64.38,mag:3.65,c:"Dra"},{n:"Grumium",ra:17.892,de:56.87,mag:3.75,c:"Dra"},{n:"Alderamin",ra:21.31,de:62.59,mag:2.45,c:"Cep"},{n:"Alfirk",ra:21.478,de:70.56,mag:3.23,c:"Cep"},{n:"Errai",ra:23.656,de:77.63,mag:3.21,c:"Cep"},{n:"Capella",ra:5.278,de:45.99,mag:.08,c:"Aur"},{n:"Menkalinan",ra:5.992,de:44.95,mag:1.9,c:"Aur"},{n:"Mahasim",ra:5.993,de:37.21,mag:2.62,c:"Aur"},{n:"Hassaleh",ra:5,de:33.17,mag:2.69,c:"Aur"},{n:"Almaaz",ra:5.038,de:43.82,mag:2.99,c:"Aur"},{n:"Deneb",ra:20.69,de:45.28,mag:1.25,c:"Cyg"},{n:"Sadr",ra:20.37,de:40.26,mag:2.23,c:"Cyg"},{n:"Gienah Cyg",ra:20.774,de:33.97,mag:2.46,c:"Cyg"},{n:"Aljanah",ra:21.215,de:30.23,mag:2.48,c:"Cyg"},{n:"Albireo",ra:19.512,de:27.96,mag:3.09,c:"Cyg"},{n:"Rukh",ra:19.75,de:45.13,mag:2.86,c:"Cyg"},{n:"Mirfak",ra:3.408,de:49.86,mag:1.8,c:"Per"},{n:"Algol",ra:3.136,de:40.96,mag:2.09,c:"Per"},{n:"Menkib",ra:4.121,de:31.88,mag:2.89,c:"Per"},{n:"Atik",ra:3.965,de:47.99,mag:3.83,c:"Per"},{n:"Vega",ra:18.616,de:38.78,mag:.03,c:"Lyr"},{n:"Sheliak",ra:18.834,de:33.37,mag:3.52,c:"Lyr"},{n:"Sulafat",ra:18.982,de:32.69,mag:3.24,c:"Lyr"},{n:"Almach",ra:2.066,de:42.33,mag:2.1,c:"And"},{n:"Mirach",ra:1.162,de:35.62,mag:2.07,c:"And"},{n:"Alpheratz",ra:.139,de:29.09,mag:2.07,c:"And"},{n:"Nekkar",ra:15.032,de:40.39,mag:3.5,c:"Boo"},{n:"Seginus",ra:14.535,de:38.31,mag:3.04,c:"Boo"},{n:"Izar",ra:14.75,de:27.07,mag:2.37,c:"Boo"},{n:"Arktur",ra:14.261,de:19.18,mag:-.05,c:"Boo"},{n:"Muphrid",ra:13.911,de:18.4,mag:2.68,c:"Boo"},{n:"Kornephoros",ra:16.503,de:21.49,mag:2.78,c:"Her"},{n:"Zeta Her",ra:16.688,de:31.6,mag:2.81,c:"Her"},{n:"Rasalgethi",ra:17.244,de:14.39,mag:2.78,c:"Her"},{n:"Cor Caroli",ra:12.934,de:38.32,mag:2.89,c:"CVn"},{n:"Alphekka",ra:15.578,de:26.71,mag:2.24,c:"CrB"},{n:"Kastor",ra:7.577,de:31.89,mag:1.58,c:"Gem"},{n:"Pollux",ra:7.755,de:28.03,mag:1.16,c:"Gem"},{n:"Tejat",ra:6.383,de:22.51,mag:3.18,c:"Gem"},{n:"Alhena",ra:6.629,de:16.4,mag:1.93,c:"Gem"},{n:"Wasat",ra:7.335,de:21.98,mag:3.53,c:"Gem"},{n:"Mebsuda",ra:6.733,de:25.13,mag:3.06,c:"Gem"},{n:"Elnath",ra:5.438,de:28.61,mag:1.65,c:"Tau"},{n:"Aldebaran",ra:4.599,de:16.51,mag:.87,c:"Tau"},{n:"Alcyone",ra:3.792,de:24.11,mag:2.87,c:"Tau"},{n:"Ain",ra:4.477,de:19.18,mag:3.54,c:"Tau"},{n:"Scheat",ra:23.063,de:28.08,mag:2.44,c:"Peg"},{n:"Markab",ra:23.079,de:15.21,mag:2.49,c:"Peg"},{n:"Matar",ra:22.69,de:30.22,mag:2.95,c:"Peg"},{n:"Enif",ra:21.736,de:9.87,mag:2.4,c:"Peg"},{n:"Algenib",ra:.221,de:15.18,mag:2.84,c:"Peg"},{n:"Hamal",ra:2.119,de:23.46,mag:2,c:"Ari"},{n:"Sheratan",ra:1.911,de:20.81,mag:2.64,c:"Ari"},{n:"Rasalhague",ra:17.582,de:12.56,mag:2.08,c:"Oph"},{n:"Cebalrai",ra:17.724,de:4.57,mag:2.77,c:"Oph"},{n:"Atair",ra:19.847,de:8.87,mag:.77,c:"Aql"},{n:"Tarazed",ra:19.771,de:10.61,mag:2.72,c:"Aql"},{n:"Alshain",ra:19.922,de:6.41,mag:3.71,c:"Aql"},{n:"Denebola",ra:11.818,de:14.57,mag:2.14,c:"Leo"},{n:"Regulus",ra:10.139,de:11.97,mag:1.36,c:"Leo"},{n:"Algieba",ra:10.334,de:19.84,mag:2.01,c:"Leo"},{n:"Zosma",ra:11.235,de:20.52,mag:2.56,c:"Leo"},{n:"Subra",ra:9.686,de:9.89,mag:3.52,c:"Leo"},{n:"Adhafera",ra:10.123,de:23.42,mag:3.44,c:"Leo"},{n:"Prokyon",ra:7.655,de:5.22,mag:.4,c:"CMi"},{n:"Gomeisa",ra:7.453,de:8.29,mag:2.89,c:"CMi"},{n:"Vindemiatrix",ra:13.036,de:10.96,mag:2.83,c:"Vir"},{n:"Porrima",ra:12.694,de:-1.45,mag:2.74,c:"Vir"},{n:"Spica",ra:13.42,de:-11.16,mag:.97,c:"Vir"},{n:"Zavijava",ra:11.845,de:1.76,mag:3.59,c:"Vir"},{n:"Sadalmelik",ra:22.097,de:-.32,mag:2.95,c:"Aqr"},{n:"Sadalsuud",ra:21.526,de:-5.57,mag:2.87,c:"Aqr"},{n:"Skat",ra:22.911,de:-15.82,mag:3.27,c:"Aqr"},{n:"Beteigeuze",ra:5.919,de:7.41,mag:.45,c:"Ori"},{n:"Bellatrix",ra:5.418,de:6.35,mag:1.64,c:"Ori"},{n:"Mintaka",ra:5.533,de:-.3,mag:2.23,c:"Ori"},{n:"Alnilam",ra:5.604,de:-1.2,mag:1.69,c:"Ori"},{n:"Alnitak",ra:5.679,de:-1.94,mag:1.77,c:"Ori"},{n:"Saiph",ra:5.796,de:-9.67,mag:2.07,c:"Ori"},{n:"Rigel",ra:5.242,de:-8.2,mag:.18,c:"Ori"},{n:"Meissa",ra:5.588,de:9.93,mag:3.47,c:"Ori"},{n:"Sirius",ra:6.753,de:-16.72,mag:-1.47,c:"CMa"},{n:"Adhara",ra:6.977,de:-28.97,mag:1.5,c:"CMa"},{n:"Wezen",ra:7.14,de:-26.39,mag:1.83,c:"CMa"},{n:"Aludra",ra:7.401,de:-29.3,mag:2.45,c:"CMa"},{n:"Alphard",ra:9.46,de:-8.66,mag:1.99,c:"Hya"},{n:"Antares",ra:16.49,de:-26.43,mag:1.07,c:"Sco"},{n:"Dschubba",ra:16.005,de:-22.62,mag:2.29,c:"Sco"},{n:"Graffias",ra:16.091,de:-19.81,mag:2.5,c:"Sco"},{n:"Shaula",ra:17.561,de:-37.1,mag:1.62,c:"Sco"},{n:"Sargas",ra:17.622,de:-42.99,mag:1.86,c:"Sco"},{n:"Kaus A.",ra:18.403,de:-34.38,mag:1.79,c:"Sgr"},{n:"Nunki",ra:18.921,de:-26.3,mag:2.05,c:"Sgr"},{n:"Kaus Med.",ra:18.35,de:-29.83,mag:2.71,c:"Sgr"},{n:"Kaus Bor.",ra:18.349,de:-25.42,mag:2.82,c:"Sgr"},{n:"Ascella",ra:19.044,de:-29.88,mag:2.59,c:"Sgr"},{n:"Gienah Crv",ra:12.264,de:-17.54,mag:2.58,c:"Crv"},{n:"Algorab",ra:12.498,de:-16.52,mag:2.95,c:"Crv"},{n:"Sabik",ra:17.173,de:-15.72,mag:2.43,c:"Oph"},{n:"Fomalhaut",ra:22.961,de:-29.62,mag:1.16,c:"PsA"},{n:"Deneb Algedi",ra:21.784,de:-16.13,mag:2.87,c:"Cap"},{n:"Achernar",ra:1.629,de:-57.24,mag:.46,c:"Eri"},{ra:8.504,de:60.718,mag:3.36,c:"UMa"},{ra:9.524,de:63.062,mag:3.8,c:"UMa"},{ra:10.372,de:41.5,mag:3.45,c:"UMa"},{ra:8.986,de:48.042,mag:3.96,c:"UMa"},{ra:9.061,de:47.157,mag:4.48,c:"UMa"},{ra:10.285,de:42.915,mag:4.59,c:"UMa"},{ra:11.161,de:44.499,mag:3.69,c:"UMa"},{ra:8.03,de:64.328,mag:4.55,c:"UMa"},{ra:16.766,de:82.037,mag:4.23,c:"UMi"},{ra:15.734,de:77.794,mag:4.95,c:"UMi"},{ra:22.181,de:57.044,mag:3.43,c:"Cep"},{ra:20.755,de:61.839,mag:4.29,c:"Cep"},{ra:22.828,de:66.2,mag:4.19,c:"Cep"},{ra:16.4,de:61.514,mag:3.29,c:"Dra"},{ra:15.415,de:58.966,mag:3.83,c:"Dra"},{ra:12.558,de:69.788,mag:3.85,c:"Dra"},{ra:16.531,de:52.301,mag:4.01,c:"Dra"},{ra:17.507,de:55.184,mag:3.84,c:"Dra"},{ra:11.514,de:69.331,mag:4.66,c:"Dra"},{ra:20.227,de:40.257,mag:2.23,c:"Cyg"},{ra:19.938,de:35.083,mag:3.89,c:"Cyg"},{ra:19.285,de:53.368,mag:3.76,c:"Cyg"},{ra:20.371,de:40.957,mag:3.72,c:"Cyg"},{ra:21.741,de:45.592,mag:3.94,c:"Cyg"},{ra:18.746,de:37.605,mag:3.25,c:"Lyr"},{ra:18.834,de:36.064,mag:4.34,c:"Lyr"},{ra:19.229,de:39.146,mag:4.22,c:"Lyr"},{ra:19.104,de:13.863,mag:2.99,c:"Aql"},{ra:20.189,de:-.821,mag:3.24,c:"Aql"},{ra:19.425,de:3.115,mag:3.43,c:"Aql"},{ra:16.688,de:21.49,mag:2.81,c:"Her"},{ra:17.005,de:30.926,mag:3.16,c:"Her"},{ra:16.146,de:19.153,mag:3.42,c:"Her"},{ra:17.25,de:24.839,mag:3.49,c:"Her"},{ra:16.715,de:38.922,mag:3.84,c:"Her"},{ra:17.658,de:46.006,mag:3.16,c:"Her"},{ra:16.962,de:27.722,mag:3.86,c:"Her"},{ra:15.879,de:42.437,mag:4.2,c:"Her"},{ra:14.689,de:13.728,mag:3.78,c:"Boo"},{ra:15.258,de:33.315,mag:4.05,c:"Boo"},{ra:14.273,de:46.088,mag:4.18,c:"Boo"},{ra:15.464,de:29.106,mag:3.66,c:"CrB"},{ra:15.713,de:26.296,mag:4.14,c:"CrB"},{ra:15.96,de:26.878,mag:4.59,c:"CrB"},{ra:11.235,de:15.43,mag:2.56,c:"Leo"},{ra:10.122,de:16.763,mag:2.98,c:"Leo"},{ra:9.764,de:23.774,mag:3.44,c:"Leo"},{ra:11.399,de:20.524,mag:3.34,c:"Leo"},{ra:10.278,de:23.417,mag:3.85,c:"Leo"},{ra:9.879,de:26.007,mag:3.88,c:"Leo"},{ra:13.42,de:-.667,mag:.98,c:"Vir"},{ra:12.927,de:-.667,mag:3.38,c:"Vir"},{ra:13.166,de:-5.539,mag:3.37,c:"Vir"},{ra:14.717,de:-5.658,mag:3.88,c:"Vir"},{ra:7.069,de:20.57,mag:3.5,c:"Gem"},{ra:7.429,de:27.798,mag:3.57,c:"Gem"},{ra:4.95,de:33.166,mag:3.17,c:"Aur"},{ra:6.247,de:49.279,mag:4.71,c:"Aur"},{ra:3.964,de:40.01,mag:2.85,c:"Per"},{ra:3.08,de:53.506,mag:2.91,c:"Per"},{ra:3.902,de:31.884,mag:2.93,c:"Per"},{ra:3.715,de:47.788,mag:3.01,c:"Per"},{ra:2.845,de:55.895,mag:3.76,c:"Per"},{ra:4.146,de:47.713,mag:3.77,c:"Per"},{ra:3.158,de:49.613,mag:3.84,c:"Per"},{ra:4.383,de:17.543,mag:3.53,c:"Tau"},{ra:4.478,de:15.962,mag:3.41,c:"Tau"},{ra:4.012,de:12.49,mag:3.61,c:"Tau"},{ra:4.329,de:15.628,mag:3.76,c:"Tau"},{ra:5.627,de:21.143,mag:3,c:"Tau"},{ra:5.408,de:-2.397,mag:2.05,c:"Ori"},{ra:4.831,de:6.961,mag:3.19,c:"Ori"},{ra:5.091,de:2.446,mag:3.36,c:"Ori"},{ra:5.855,de:20.276,mag:4.12,c:"Ori"},{ra:6.378,de:-17.956,mag:3.02,c:"CMa"},{ra:7.029,de:-23.833,mag:3.49,c:"CMa"},{ra:6.339,de:-30.063,mag:3.85,c:"CMa"},{ra:22.691,de:10.831,mag:3.4,c:"Peg"},{ra:1.892,de:19.294,mag:4.59,c:"Ari"},{ra:2.159,de:34.987,mag:3,c:"Tri"},{ra:2.288,de:33.847,mag:4.01,c:"Tri"},{ra:16.239,de:-3.694,mag:2.54,c:"Oph"},{ra:16.306,de:-4.693,mag:3.27,c:"Oph"},{ra:17.348,de:-24.999,mag:3.27,c:"Oph"},{ra:15.738,de:6.426,mag:2.63,c:"Ser"},{ra:18.355,de:-2.898,mag:3.54,c:"Ser"},{ra:15.981,de:-26.114,mag:2.89,c:"Sco"},{ra:16.353,de:-25.593,mag:2.82,c:"Sco"},{ra:15.586,de:-26.114,mag:3,c:"Sco"},{ra:16.836,de:-34.293,mag:1.87,c:"Sco"},{ra:18.402,de:-25.421,mag:2.05,c:"Sgr"},{ra:18.466,de:-25.421,mag:2.81,c:"Sgr"},{ra:19.163,de:-21.024,mag:2.89,c:"Sgr"},{ra:3.038,de:4.09,mag:2.53,c:"Cet"},{ra:.726,de:-17.987,mag:2.04,c:"Cet"},{ra:1.143,de:-10.182,mag:3.46,c:"Cet"},{ra:1.628,de:-43.318,mag:.45,c:"Eri"},{ra:3.549,de:-9.458,mag:2.88,c:"Eri"},{ra:2.94,de:-8.898,mag:3.52,c:"Eri"},{ra:13.343,de:28.268,mag:4.26,c:"Com"},{ra:9.351,de:34.392,mag:3.13,c:"Lyn"},{ra:10.892,de:34.215,mag:3.79,c:"LMi"},{ra:20.626,de:14.595,mag:3.63,c:"Del"},{ra:20.661,de:15.912,mag:3.86,c:"Del"},{ra:19.789,de:18.534,mag:3.51,c:"Sge"},{ra:23.286,de:3.282,mag:3.62,c:"Psc"},{ra:20.3,de:-12.508,mag:2.85,c:"Cap"},{ra:20.768,de:-25.27,mag:3.69,c:"Cap"},{ra:14.848,de:-16.042,mag:2.61,c:"Lib"},{ra:15.283,de:-9.383,mag:2.75,c:"Lib"},{ra:15.067,de:-25.282,mag:3.91,c:"Lib"},{ra:9.847,de:59.039,mag:4.55,c:"UMa"},{ra:14.397,de:75.69,mag:4.95,c:"UMi"},{ra:19.79,de:70.268,mag:4.84,c:"Dra"},{ra:18.351,de:72.733,mag:4.92,c:"Dra"},{ra:2.041,de:72.421,mag:4.73,c:"Cas"},{ra:20.491,de:62.994,mag:4.29,c:"Cep"},{ra:4.954,de:66.342,mag:4.55,c:"Cam"},{ra:3.839,de:65.43,mag:4.39,c:"Cam"},{ra:18.898,de:36.899,mag:4.34,c:"Lyr"},{ra:19.602,de:50.221,mag:4.48,c:"Cyg"},{ra:19.36,de:47.52,mag:4.74,c:"Cyg"},{ra:20.918,de:47.715,mag:4.51,c:"Cyg"},{ra:22.117,de:25.345,mag:4.4,c:"Peg"},{ra:21.444,de:17.36,mag:4.4,c:"Peg"},{ra:22.691,de:12.173,mag:4.6,c:"Peg"},{ra:1.638,de:48.628,mag:4.53,c:"And"},{ra:2.387,de:42.326,mag:4.87,c:"And"},{ra:22.396,de:52.229,mag:4.34,c:"Lac"},{ra:2.738,de:49.228,mag:4.71,c:"Per"},{ra:2.058,de:29,mag:4.83,c:"Tri"},{ra:2.733,de:27.708,mag:4.66,c:"Ari"},{ra:5.029,de:41.076,mag:4.71,c:"Aur"},{ra:6.116,de:45.566,mag:4.99,c:"Aur"},{ra:7.185,de:16.54,mag:4.89,c:"Gem"},{ra:6.205,de:22.506,mag:4.89,c:"Gem"},{ra:3.413,de:9.029,mag:4.27,c:"Tau"},{ra:5.131,de:-7.772,mag:4.65,c:"Ori"},{ra:5.293,de:-6.844,mag:4.6,c:"Ori"},{ra:5.545,de:-17.822,mag:4.36,c:"Lep"},{ra:5.091,de:-22.371,mag:4.71,c:"Lep"},{ra:6.903,de:-16.393,mag:4.83,c:"Mon"},{ra:14.53,de:30.371,mag:4.05,c:"Boo"},{ra:15.412,de:33.315,mag:4.46,c:"CrB"},{ra:17.514,de:36.809,mag:4.41,c:"Her"},{ra:15.826,de:4.478,mag:4.83,c:"Ser"},{ra:17.793,de:2.707,mag:4.62,c:"Oph"},{ra:16.961,de:9.375,mag:4.42,c:"Oph"},{ra:19.404,de:11.422,mag:4.45,c:"Aql"},{ra:19.482,de:18.232,mag:4.58,c:"Sge"},{ra:20.434,de:15.075,mag:4.43,c:"Del"},{ra:12.169,de:-22.62,mag:4.3,c:"Crv"},{ra:11.322,de:-14.779,mag:4.08,c:"Crt"},{ra:9.459,de:-22.349,mag:4.94,c:"Hya"},{ra:8.923,de:5.946,mag:4.3,c:"Hya"},{ra:8.745,de:18.154,mag:4.25,c:"Cnc"},{ra:8.275,de:9.186,mag:4.03,c:"Cnc"},{ra:8.778,de:28.76,mag:4.66,c:"Cnc"},{ra:12.313,de:25.846,mag:4.35,c:"Com"},{ra:22.36,de:-.117,mag:4.69,c:"Aqr"},{ra:20.794,de:-9.496,mag:4.71,c:"Aqr"},{ra:21.099,de:-22.411,mag:4.51,c:"Cap"},{ra:22.877,de:-7.58,mag:4.86,c:"Aqr"},{ra:1.857,de:-10.335,mag:4.44,c:"Cet"},{ra:2.469,de:-8.183,mag:4.71,c:"Cet"},{ra:1.524,de:15.346,mag:4.27,c:"Psc"},{ra:23.666,de:5.626,mag:4.44,c:"Psc"},{ra:.811,de:7.585,mag:4.28,c:"Psc"},{ra:3.327,de:-9.458,mag:3.89,c:"Eri"},{ra:4.198,de:-6.838,mag:4.46,c:"Eri"},{ra:16.024,de:58.565,mag:4.89,c:"Dra"},{ra:17.146,de:65.714,mag:4.88,c:"Dra"},{ra:12.832,de:69.821,mag:5.05,c:"Dra"},{ra:22.485,de:58.415,mag:4.29,c:"Cep"},{ra:20.146,de:36.488,mag:4.93,c:"Cyg"},{ra:18.524,de:33.363,mag:5.25,c:"Lyr"},{ra:19.162,de:39.146,mag:5,c:"Lyr"},{ra:18.078,de:30.563,mag:4.86,c:"Her"},{ra:16.288,de:21.892,mag:4.85,c:"Her"},{ra:17.396,de:24.29,mag:5,c:"Her"},{ra:13.788,de:17.456,mag:4.86,c:"Boo"},{ra:16.618,de:-10.567,mag:4.43,c:"Oph"},{ra:17.349,de:-21.112,mag:4.62,c:"Oph"},{ra:16.961,de:-10.984,mag:5,c:"Oph"},{ra:15.77,de:2.1,mag:4.83,c:"Ser"},{ra:16.314,de:-12.846,mag:5,c:"Ser"},{ra:18.99,de:15.068,mag:5,c:"Aql"},{ra:19.874,de:1.006,mag:5.1,c:"Aql"},{ra:.614,de:33.719,mag:4.53,c:"And"},{ra:1.633,de:41.406,mag:4.88,c:"And"},{ra:5.59,de:9.489,mag:4.39,c:"Ori"},{ra:6.066,de:14.768,mag:4.46,c:"Ori"},{ra:4.853,de:5.605,mag:4.36,c:"Ori"},{ra:13.036,de:3.397,mag:4.96,c:"Vir"},{ra:18.293,de:-29.828,mag:4.6,c:"Sgr"},{ra:16.836,de:-38.047,mag:3,c:"Sco"},{ra:17.708,de:-39.03,mag:3.3,c:"Sco"},{ra:21.444,de:-22.411,mag:3.77,c:"Cap"},{ra:21.668,de:-16.662,mag:4.51,c:"Cap"},{ra:20.864,de:-26.919,mag:4.5,c:"Cap"},{ra:22.281,de:-7.783,mag:4.69,c:"Aqr"},{ra:23.238,de:-6.049,mag:4.69,c:"Aqr"},{ra:22.826,de:-13.592,mag:4.04,c:"Aqr"},{ra:1.756,de:9.157,mag:4.13,c:"Psc"},{ra:.482,de:7.89,mag:4.66,c:"Psc"},{ra:1.144,de:30.089,mag:4.41,c:"And"},{ra:2.722,de:3.236,mag:4.45,c:"Cet"},{ra:2.322,de:8.46,mag:4.7,c:"Cet"},{ra:.323,de:-8.824,mag:4.61,c:"Cet"},{ra:3.967,de:-13.508,mag:3.56,c:"Eri"},{ra:4.298,de:-33.798,mag:3.72,c:"Eri"},{ra:3.769,de:-23.247,mag:4.27,c:"Eri"},{ra:5.47,de:-20.759,mag:2.81,c:"Lep"},{ra:7.05,de:-15.633,mag:4.07,c:"CMa"},{ra:22.828,de:24.602,mag:4.95,c:"Peg"},{ra:1.131,de:46.072,mag:4.96,c:"And"},{ra:23.626,de:46.46,mag:5,c:"And"},{ra:1.41,de:24.58,mag:5.2,c:"Psc"},{ra:23.976,de:6.863,mag:5.04,c:"Psc"},{ra:1.05,de:7.89,mag:5.2,c:"Psc"},{ra:.491,de:57.82,mag:5,c:"Cas"},{ra:23.99,de:67.4,mag:5.4,c:"Cas"},{ra:21.29,de:70.57,mag:5.4,c:"Cep"},{ra:6.31,de:69.32,mag:5.4,c:"Cam"},{ra:5.06,de:60.44,mag:5.3,c:"Cam"},{ra:4.3,de:50.35,mag:5.2,c:"Per"},{ra:5.99,de:54.28,mag:5,c:"Aur"},{ra:6.04,de:38.48,mag:5,c:"Aur"},{ra:6.73,de:38.45,mag:5.2,c:"Aur"},{ra:2.2,de:33.28,mag:5.3,c:"Tri"},{ra:2.83,de:29.94,mag:5.2,c:"Ari"},{ra:3.19,de:21.04,mag:5.2,c:"Ari"},{ra:3.45,de:9.73,mag:5.3,c:"Tau"},{ra:5.13,de:-2.39,mag:5.3,c:"Ori"},{ra:5.8,de:-1.1,mag:5.4,c:"Ori"},{ra:6.75,de:12.9,mag:5,c:"Gem"},{ra:6.48,de:20.21,mag:5.4,c:"Gem"},{ra:7.2,de:30.25,mag:5.2,c:"Gem"},{ra:8.72,de:21.47,mag:5.3,c:"Cnc"},{ra:8.21,de:9.19,mag:5.4,c:"Cnc"},{ra:9,de:11.86,mag:5.4,c:"Cnc"},{ra:9.31,de:22.97,mag:5.3,c:"Leo"},{ra:11.4,de:20.22,mag:5.4,c:"Leo"},{ra:10,de:16.76,mag:5.3,c:"Leo"},{ra:9.46,de:-1.18,mag:5.3,c:"Hya"},{ra:10.83,de:-16.19,mag:5.4,c:"Hya"},{ra:11.55,de:-26.74,mag:5.4,c:"Hya"},{ra:14.68,de:16.42,mag:5.3,c:"Boo"},{ra:16.02,de:29.85,mag:5.3,c:"CrB"},{ra:18.83,de:37.6,mag:5.2,c:"Lyr"},{ra:19.13,de:38.13,mag:5.3,c:"Lyr"},{ra:20.31,de:41.17,mag:5.2,c:"Cyg"},{ra:19.1,de:11.6,mag:5.3,c:"Aql"},{ra:19.48,de:24.66,mag:5.2,c:"Vul"},{ra:19.98,de:21.25,mag:5.4,c:"Vul"},{ra:19.39,de:17.48,mag:5.3,c:"Sge"},{ra:20.78,de:16.12,mag:5.3,c:"Del"},{ra:21.1,de:-17.23,mag:5.3,c:"Cap"},{ra:1.4,de:-8.18,mag:5.2,c:"Cet"},{ra:2.65,de:.33,mag:5.3,c:"Cet"},{ra:15.2,de:-9.38,mag:5,c:"Lib"},{ra:17.7,de:-37.04,mag:5,c:"Sco"},{ra:18.1,de:-30.42,mag:5,c:"Sgr"},{ra:13.16,de:27.88,mag:5,c:"Com"},{ra:12.45,de:28.27,mag:5.2,c:"Com"},{ra:13.2,de:17.53,mag:5.2,c:"Com"},{ra:8,de:48,mag:5,c:"Lyn"},{ra:7.45,de:49.21,mag:5.3,c:"Lyn"},{ra:10.46,de:36.71,mag:5.2,c:"LMi"},{n:"Canopus",ra:6.399,de:-52.7,mag:-0.72,c:"Car"},{n:"Toliman",ra:14.66,de:-60.84,mag:-0.27,c:"Cen"},{n:"Hadar",ra:14.064,de:-60.37,mag:0.61,c:"Cen"},{n:"Acrux",ra:12.443,de:-63.1,mag:0.77,c:"Cru"},{n:"Mimosa",ra:12.795,de:-59.69,mag:1.25,c:"Cru"},{n:"Gacrux",ra:12.519,de:-57.11,mag:1.63,c:"Cru"},{n:"Miaplacidus",ra:9.22,de:-69.72,mag:1.67,c:"Car"},{n:"Alnair",ra:22.137,de:-46.96,mag:1.74,c:"Gru"},{n:"Regor",ra:8.158,de:-47.34,mag:1.75,c:"Vel"},{n:"Avior",ra:8.375,de:-59.51,mag:1.86,c:"Car"},{n:"Atria",ra:16.811,de:-69.03,mag:1.91,c:"TrA"},{n:"Peacock",ra:20.427,de:-56.73,mag:1.94,c:"Pav"},{n:"Alsephina",ra:8.745,de:-54.71,mag:1.96,c:"Vel"},{n:"Tiaki",ra:22.711,de:-46.88,mag:2.07,c:"Gru"},{n:"Muhlifain",ra:12.692,de:-48.96,mag:2.17,c:"Cen"},{n:"Aspidiske",ra:9.285,de:-59.27,mag:2.21,c:"Car"},{n:"Suhail",ra:9.133,de:-43.43,mag:2.21,c:"Vel"},{n:"Naos",ra:8.06,de:-40.0,mag:2.25,c:"Pup"},{n:"Kakkab",ra:14.699,de:-47.39,mag:2.3,c:"Lup"},{n:"Epsilon Cen",ra:13.665,de:-53.47,mag:2.3,c:"Cen"},{n:"Eta Cen",ra:14.591,de:-42.16,mag:2.31,c:"Cen"},{n:"Ankaa",ra:0.438,de:-42.31,mag:2.39,c:"Phe"},{n:"Markeb",ra:9.368,de:-55.01,mag:2.47,c:"Vel"},{n:"Zeta Cen",ra:13.913,de:-47.29,mag:2.55,c:"Cen"},{n:"Delta Cen",ra:12.14,de:-50.72,mag:2.58,c:"Cen"},{n:"Phact",ra:5.66,de:-34.07,mag:2.65,c:"Col"},{n:"Ke Kwan",ra:14.976,de:-43.13,mag:2.68,c:"Lup"},{n:"Alpha Mus",ra:12.619,de:-69.14,mag:2.69,c:"Mus"},{n:"Pi Pup",ra:7.285,de:-37.1,mag:2.71,c:"Pup"},{n:"Iota Cen",ra:13.739,de:-36.71,mag:2.75,c:"Cen"},{n:"Gamma Lup",ra:15.585,de:-41.17,mag:2.78,c:"Lup"},{n:"Imai",ra:12.253,de:-58.75,mag:2.79,c:"Cru"},{n:"Beta Hyi",ra:0.429,de:-77.25,mag:2.8,c:"Hyi"},{n:"Tureis",ra:8.126,de:-24.3,mag:2.81,c:"Pup"},{n:"Alpha Ara",ra:17.531,de:-49.88,mag:2.85,c:"Ara"},{n:"Beta Ara",ra:17.421,de:-55.53,mag:2.85,c:"Ara"},{n:"Alpha Hyi",ra:1.98,de:-61.57,mag:2.86,c:"Hyi"},{n:"Alpha Tuc",ra:22.308,de:-60.26,mag:2.86,c:"Tuc"},{n:"Acamar",ra:2.971,de:-40.3,mag:2.88,c:"Eri"},{n:"Aldhanab",ra:21.899,de:-37.37,mag:3,c:"Gru"},{n:"Beta Mus",ra:12.771,de:-68.11,mag:3.05,c:"Mus"},{n:"Beta TrA",ra:15.917,de:-63.43,mag:2.85,c:"TrA"},{n:"Gamma TrA",ra:15.315,de:-68.68,mag:2.89,c:"TrA"}];const MESSIER=[{m:1,ra:5.575,de:22.014,mag:8.4,t:"s",n:"Krebsnebel"},{m:2,ra:21.558,de:-.823,mag:6.5,t:"k",n:""},{m:3,ra:13.703,de:28.377,mag:6.2,t:"k",n:""},{m:4,ra:16.393,de:-26.526,mag:5.6,t:"k",n:""},{m:5,ra:15.309,de:2.081,mag:5.6,t:"k",n:""},{m:6,ra:17.668,de:-32.246,mag:4.2,t:"o",n:"Schmetterling"},{m:7,ra:17.897,de:-34.793,mag:3.3,t:"o",n:"Ptolemäus-Haufen"},{m:8,ra:18.06,de:-24.38,mag:6,t:"n",n:"Lagunennebel"},{m:9,ra:17.318,de:-18.516,mag:7.7,t:"k",n:""},{m:10,ra:16.952,de:-4.1,mag:6.6,t:"k",n:""},{m:11,ra:18.851,de:-6.27,mag:5.8,t:"o",n:"Wildentenhaufen"},{m:12,ra:16.787,de:-1.948,mag:6.1,t:"k",n:""},{m:13,ra:16.695,de:36.46,mag:5.8,t:"k",n:"Herkuleshaufen"},{m:14,ra:17.626,de:-3.246,mag:7.6,t:"k",n:""},{m:15,ra:21.5,de:12.167,mag:6.2,t:"k",n:""},{m:16,ra:18.313,de:-13.79,mag:6,t:"n",n:"Adlernebel"},{m:17,ra:18.346,de:-16.177,mag:6,t:"n",n:"Omeganebel"},{m:18,ra:18.333,de:-17.133,mag:6.9,t:"o",n:""},{m:19,ra:17.043,de:-26.268,mag:6.8,t:"k",n:""},{m:20,ra:18.045,de:-23.03,mag:6.3,t:"n",n:"Trifidnebel"},{m:21,ra:18.07,de:-22.49,mag:5.9,t:"o",n:""},{m:22,ra:18.607,de:-23.904,mag:5.1,t:"k",n:""},{m:23,ra:17.946,de:-19.017,mag:5.5,t:"o",n:""},{m:24,ra:18.282,de:-18.55,mag:4.6,t:"a",n:""},{m:25,ra:18.529,de:-19.25,mag:4.6,t:"o",n:""},{m:26,ra:18.753,de:-9.387,mag:8,t:"o",n:""},{m:27,ra:19.994,de:22.721,mag:7.4,t:"p",n:"Hantelnebel"},{m:28,ra:18.409,de:-24.87,mag:6.8,t:"k",n:""},{m:29,ra:20.398,de:38.508,mag:6.6,t:"o",n:""},{m:30,ra:21.673,de:-23.18,mag:7.2,t:"k",n:""},{m:31,ra:.712,de:41.269,mag:3.4,t:"g",n:"Andromedagalaxie"},{m:32,ra:.712,de:40.866,mag:8.1,t:"g",n:""},{m:33,ra:1.564,de:30.66,mag:5.7,t:"g",n:"Dreiecksgalaxie"},{m:34,ra:2.702,de:42.721,mag:5.2,t:"o",n:""},{m:35,ra:6.151,de:24.34,mag:5.1,t:"o",n:""},{m:36,ra:5.605,de:34.135,mag:6,t:"o",n:""},{m:37,ra:5.873,de:32.553,mag:5.6,t:"o",n:""},{m:38,ra:5.478,de:35.823,mag:6.4,t:"o",n:""},{m:39,ra:21.53,de:48.43,mag:4.6,t:"o",n:""},{m:40,ra:12.37,de:58.083,mag:8.4,t:"a",n:""},{m:41,ra:6.766,de:-20.757,mag:4.5,t:"o",n:""},{m:42,ra:5.591,de:-5.45,mag:4,t:"n",n:"Orionnebel"},{m:43,ra:5.593,de:-5.27,mag:9,t:"n",n:""},{m:44,ra:8.674,de:19.621,mag:3.7,t:"o",n:"Praesepe"},{m:45,ra:3.79,de:24.105,mag:1.6,t:"o",n:"Plejaden"},{m:46,ra:7.696,de:-14.81,mag:6.1,t:"o",n:""},{m:47,ra:7.61,de:-14.49,mag:4.4,t:"o",n:""},{m:48,ra:8.23,de:-5.8,mag:5.5,t:"o",n:""},{m:49,ra:12.497,de:8,mag:8.4,t:"g",n:""},{m:50,ra:7.053,de:-8.337,mag:5.9,t:"o",n:""},{m:51,ra:13.498,de:47.195,mag:8.4,t:"g",n:"Strudelgalaxie"},{m:52,ra:23.41,de:61.59,mag:6.9,t:"o",n:""},{m:53,ra:13.215,de:18.168,mag:7.6,t:"k",n:""},{m:54,ra:18.918,de:-30.48,mag:7.6,t:"k",n:""},{m:55,ra:19.667,de:-30.96,mag:6.3,t:"k",n:""},{m:56,ra:19.276,de:30.183,mag:8.3,t:"k",n:""},{m:57,ra:18.893,de:33.029,mag:8.8,t:"p",n:"Ringnebel"},{m:58,ra:12.629,de:11.818,mag:9.7,t:"g",n:""},{m:59,ra:12.7,de:11.647,mag:9.6,t:"g",n:""},{m:60,ra:12.728,de:11.553,mag:8.8,t:"g",n:""},{m:61,ra:12.365,de:4.474,mag:9.7,t:"g",n:""},{m:62,ra:17.02,de:-30.112,mag:6.5,t:"k",n:""},{m:63,ra:13.264,de:42.03,mag:8.6,t:"g",n:"Sonnenblumengalaxie"},{m:64,ra:12.945,de:21.683,mag:8.5,t:"g",n:"Blackeye-Galaxie"},{m:65,ra:11.316,de:13.092,mag:9.3,t:"g",n:""},{m:66,ra:11.337,de:12.991,mag:8.9,t:"g",n:""},{m:67,ra:8.84,de:11.81,mag:6.1,t:"o",n:""},{m:68,ra:12.658,de:-26.745,mag:7.8,t:"k",n:""},{m:69,ra:18.523,de:-32.348,mag:7.6,t:"k",n:""},{m:70,ra:18.72,de:-32.292,mag:7.9,t:"k",n:""},{m:71,ra:19.896,de:18.779,mag:8.2,t:"k",n:""},{m:72,ra:20.891,de:-12.537,mag:9.3,t:"k",n:""},{m:73,ra:20.982,de:-12.633,mag:9,t:"a",n:""},{m:74,ra:1.612,de:15.783,mag:9.4,t:"g",n:""},{m:75,ra:20.101,de:-21.922,mag:8.5,t:"k",n:""},{m:76,ra:1.705,de:51.575,mag:10.1,t:"p",n:"Kl.Hantelnebel"},{m:77,ra:2.711,de:.013,mag:8.9,t:"g",n:""},{m:78,ra:5.779,de:.079,mag:8.3,t:"n",n:""},{m:79,ra:5.405,de:-24.524,mag:7.7,t:"k",n:""},{m:80,ra:16.284,de:-22.976,mag:7.3,t:"k",n:""},{m:81,ra:9.926,de:69.066,mag:6.9,t:"g",n:"Bodes Galaxie"},{m:82,ra:9.931,de:69.68,mag:8.4,t:"g",n:"Zigarrengalaxie"},{m:83,ra:13.617,de:-29.866,mag:7.5,t:"g",n:"Südl.Feuerrad"},{m:84,ra:12.418,de:12.887,mag:9.1,t:"g",n:""},{m:85,ra:12.42,de:18.191,mag:9.1,t:"g",n:""},{m:86,ra:12.436,de:12.946,mag:8.9,t:"g",n:""},{m:87,ra:12.514,de:12.391,mag:8.6,t:"g",n:""},{m:88,ra:12.533,de:14.42,mag:9.5,t:"g",n:""},{m:89,ra:12.594,de:12.556,mag:9.8,t:"g",n:""},{m:90,ra:12.614,de:13.163,mag:9.5,t:"g",n:""},{m:91,ra:12.591,de:14.496,mag:10.2,t:"g",n:""},{m:92,ra:17.285,de:43.136,mag:6.4,t:"k",n:""},{m:93,ra:7.742,de:-23.857,mag:6.2,t:"o",n:""},{m:94,ra:12.848,de:41.12,mag:8.2,t:"g",n:""},{m:95,ra:10.732,de:11.704,mag:9.7,t:"g",n:""},{m:96,ra:10.779,de:11.82,mag:9.2,t:"g",n:""},{m:97,ra:11.247,de:55.019,mag:9.9,t:"p",n:"Eulennebel"},{m:98,ra:12.23,de:14.9,mag:10.1,t:"g",n:""},{m:99,ra:12.313,de:14.417,mag:9.9,t:"g",n:""},{m:100,ra:12.385,de:15.822,mag:9.3,t:"g",n:""},{m:101,ra:14.053,de:54.349,mag:7.9,t:"g",n:"Feuerradgalaxie"},{m:102,ra:15.108,de:55.763,mag:9.9,t:"g",n:""},{m:103,ra:1.55,de:60.658,mag:7.4,t:"o",n:""},{m:104,ra:12.667,de:-11.623,mag:8,t:"g",n:"Sombrerogalaxie"},{m:105,ra:10.797,de:12.582,mag:9.3,t:"g",n:""},{m:106,ra:12.316,de:47.304,mag:8.4,t:"g",n:""},{m:107,ra:16.542,de:-13.054,mag:7.9,t:"k",n:""},{m:108,ra:11.192,de:55.674,mag:10,t:"g",n:""},{m:109,ra:11.96,de:53.375,mag:9.8,t:"g",n:""},{m:110,ra:.673,de:41.685,mag:8.5,t:"g",n:""}];const NGC=[{id:"NGC869",ra:2.317,de:57.133,mag:4.3,t:"o",n:"h Persei"},{id:"NGC884",ra:2.372,de:57.137,mag:4.4,t:"o",n:"χ Persei"},{id:"NGC752",ra:1.957,de:37.795,mag:5.7,t:"o",n:""},{id:"NGC457",ra:1.318,de:58.288,mag:6.4,t:"o",n:"Eulenhaufen"},{id:"NGC663",ra:1.766,de:61.213,mag:7.1,t:"o",n:""},{id:"NGC7789",ra:23.96,de:56.726,mag:6.7,t:"o",n:"Carolines Rose"},{id:"IC2602",ra:10.715,de:-64.4,mag:1.9,t:"o",n:"Südl.Plejaden"},{id:"NGC3532",ra:11.106,de:-58.73,mag:3,t:"o",n:""},{id:"NGC2451",ra:7.752,de:-37.97,mag:2.8,t:"o",n:""},{id:"NGC2516",ra:7.967,de:-60.87,mag:3.8,t:"o",n:""},{id:"NGC6231",ra:16.9,de:-41.83,mag:2.6,t:"o",n:""},{id:"IC2391",ra:8.667,de:-53.05,mag:2.5,t:"o",n:"Omicron Velorum"},{id:"NGC253",ra:.792,de:-25.288,mag:7.1,t:"g",n:"Bildhauer-Galaxie"},{id:"NGC5128",ra:13.424,de:-43.02,mag:6.8,t:"g",n:"Centaurus A"},{id:"NGC4565",ra:12.61,de:25.987,mag:9.6,t:"g",n:"Nadelgalaxie"},{id:"NGC891",ra:2.375,de:42.349,mag:9.9,t:"g",n:""},{id:"NGC2403",ra:7.61,de:65.6,mag:8.5,t:"g",n:""},{id:"NGC55",ra:.247,de:-39.196,mag:7.9,t:"g",n:""},{id:"NGC300",ra:.92,de:-37.683,mag:8.1,t:"g",n:""},{id:"NGC6822",ra:19.745,de:-14.8,mag:8.7,t:"g",n:"Barnards Galaxie"},{id:"NGC104",ra:.401,de:-72.08,mag:4,t:"k",n:"47 Tucanae"},{id:"NGC5139",ra:13.446,de:-47.48,mag:3.7,t:"k",n:"Omega Centauri"},{id:"NGC6397",ra:17.68,de:-53.67,mag:5.7,t:"k",n:""},{id:"NGC362",ra:1.053,de:-70.85,mag:6.4,t:"k",n:""},{id:"NGC2070",ra:5.643,de:-69.1,mag:4,t:"n",n:"Tarantelnebel"},{id:"NGC7000",ra:20.98,de:44.33,mag:4,t:"n",n:"Nordamerikanebel"},{id:"IC5070",ra:20.79,de:44.36,mag:8,t:"n",n:"Pelikannebel"},{id:"NGC6960",ra:20.76,de:30.72,mag:7,t:"s",n:"Cirrusnebel"},{id:"NGC6992",ra:20.94,de:31.72,mag:7,t:"s",n:"Cirrusnebel Ost"},{id:"NGC7293",ra:22.49,de:-20.84,mag:7.3,t:"p",n:"Helixnebel"},{id:"NGC2392",ra:7.488,de:20.91,mag:9.1,t:"p",n:"Eskimonebel"},{id:"NGC3242",ra:10.42,de:-18.63,mag:7.7,t:"p",n:"Jupiters Geist"},{id:"NGC6543",ra:17.98,de:66.63,mag:8.1,t:"p",n:"Katzenaugennebel"},{id:"NGC246",ra:.78,de:-11.87,mag:8,t:"p",n:""},{id:"Mel20",ra:3.405,de:49.86,mag:1.2,t:"o",n:"Alpha Persei Haufen"},{id:"Hyaden",ra:4.45,de:15.87,mag:.5,t:"o",n:"Hyaden"},{id:"Coalsack",ra:12.88,de:-63,mag:0,t:"n",n:"Kohlensack"},{id:"NGC1499",ra:4,de:36.62,mag:5,t:"n",n:"Kaliforniennebel"},{id:"IC434",ra:5.68,de:-2.46,mag:7.3,t:"n",n:"Pferdekopfnebel"},{id:"NGC2237",ra:6.53,de:4.95,mag:5.5,t:"n",n:"Rosettennebel"},{id:"NGC2264",ra:6.68,de:9.88,mag:3.9,t:"o",n:"Weihnachtsbaumhaufen"},{id:"NGC4038",ra:12.03,de:-18.87,mag:10.3,t:"g",n:"Antennengalaxien"},{id:"NGC6744",ra:19.16,de:-63.86,mag:8.3,t:"g",n:""},{id:"NGC1316",ra:3.378,de:-37.21,mag:8.5,t:"g",n:"Fornax A"},{id:"NGC2174",ra:6.16,de:20.48,mag:6.8,t:"n",n:"Affenkopfnebel"},{id:"NGC281",ra:.875,de:56.62,mag:7.4,t:"n",n:"Pacman-Nebel"},{id:"IC1396",ra:21.65,de:57.5,mag:3.5,t:"o",n:"Elefantenrüssel"},{id:"NGC1535",ra:4.2,de:-12.74,mag:9.4,t:"p",n:""},{id:"NGC40",ra:.215,de:72.52,mag:11,t:"p",n:""},{id:"NGC7662",ra:23.43,de:42.55,mag:8.3,t:"p",n:"Blauer Schneeball"}];const LINES={UMa:[["Dubhe","Merak"],["Merak","Phekda"],["Phekda","Megrez"],["Megrez","Alioth"],["Alioth","Mizar"],["Mizar","Alkaid"],["Megrez","Dubhe"],["Mizar","Alcor"]],UMi:[["Polaris","Yildun"],["Polaris","Kochab"],["Kochab","Pherkad"]],Dra:[["Eltanin","Rastaban"],["Rastaban","Grumium"],["Eltanin","Altais"],["Thuban","Grumium"]],Cas:[["Caph","Schedar"],["Schedar","Cih"],["Cih","Ruchbah"],["Ruchbah","Segin"]],Cep:[["Alderamin","Alfirk"],["Alfirk","Errai"]],Aur:[["Capella","Menkalinan"],["Menkalinan","Mahasim"],["Mahasim","Hassaleh"],["Hassaleh","Capella"],["Capella","Elnath"],["Capella","Almaaz"]],Cyg:[["Deneb","Sadr"],["Sadr","Gienah Cyg"],["Sadr","Aljanah"],["Sadr","Albireo"],["Deneb","Rukh"]],Lyr:[["Vega","Sheliak"],["Sheliak","Sulafat"],["Sulafat","Vega"]],Per:[["Mirfak","Algol"],["Mirfak","Menkib"],["Mirfak","Atik"]],And:[["Alpheratz","Mirach"],["Mirach","Almach"]],Boo:[["Arktur","Izar"],["Izar","Seginus"],["Seginus","Nekkar"],["Arktur","Muphrid"]],Her:[["Kornephoros","Zeta Her"],["Zeta Her","Rasalgethi"]],Peg:[["Markab","Scheat"],["Scheat","Alpheratz"],["Alpheratz","Algenib"],["Algenib","Markab"],["Enif","Markab"],["Scheat","Matar"]],Gem:[["Kastor","Pollux"],["Kastor","Tejat"],["Pollux","Alhena"],["Tejat","Alhena"],["Alhena","Wasat"],["Tejat","Mebsuda"]],Tau:[["Aldebaran","Elnath"],["Aldebaran","Alcyone"],["Aldebaran","Ain"]],Ori:[["Beteigeuze","Bellatrix"],["Beteigeuze","Mintaka"],["Beteigeuze","Saiph"],["Mintaka","Alnilam"],["Alnilam","Alnitak"],["Alnitak","Saiph"],["Bellatrix","Rigel"],["Rigel","Alnitak"],["Meissa","Beteigeuze"]],CMa:[["Sirius","Adhara"],["Sirius","Wezen"],["Wezen","Aludra"]],CMi:[["Prokyon","Gomeisa"]],Leo:[["Regulus","Algieba"],["Algieba","Adhafera"],["Algieba","Zosma"],["Zosma","Denebola"],["Regulus","Subra"]],Vir:[["Spica","Porrima"],["Porrima","Zavijava"],["Porrima","Vindemiatrix"]],Sco:[["Antares","Dschubba"],["Dschubba","Graffias"],["Antares","Shaula"],["Shaula","Sargas"]],Sgr:[["Kaus A.","Kaus Med."],["Kaus Med.","Kaus Bor."],["Kaus A.","Nunki"],["Kaus A.","Ascella"],["Ascella","Nunki"]],Aql:[["Atair","Tarazed"],["Atair","Alshain"]],Oph:[["Rasalhague","Cebalrai"],["Rasalhague","Sabik"]],Ari:[["Hamal","Sheratan"]],Crv:[["Gienah Crv","Algorab"]],
/* Sternbildlinien des Südhimmels. Sie fehlten vollständig, weil die Liste für
   einen mitteleuropäischen Beobachter angelegt war. Verknüpft werden nur Sterne,
   die auch in der Sternliste stehen; fehlende Namen überspringt die Zeichnung. */
Cru:[["Acrux","Gacrux"],["Mimosa","Imai"]],
Cen:[["Toliman","Hadar"],["Hadar","Epsilon Cen"],["Epsilon Cen","Zeta Cen"],["Zeta Cen","Eta Cen"],["Epsilon Cen","Muhlifain"],["Muhlifain","Delta Cen"]],
Vel:[["Regor","Alsephina"],["Alsephina","Markeb"],["Markeb","Suhail"],["Suhail","Regor"]],
Car:[["Miaplacidus","Aspidiske"],["Aspidiske","Avior"]],
TrA:[["Atria","Beta TrA"],["Beta TrA","Gamma TrA"],["Gamma TrA","Atria"]],
Lup:[["Kakkab","Ke Kwan"],["Ke Kwan","Gamma Lup"]],
Mus:[["Alpha Mus","Beta Mus"]],
Ara:[["Alpha Ara","Beta Ara"]],
Gru:[["Alnair","Tiaki"],["Alnair","Aldhanab"]],
Pup:[["Naos","Pi Pup"]]};const LINES2={Del:[[20.626,14.595,20.661,15.912],[20.661,15.912,20.78,16.12],[20.78,16.12,20.626,14.595],[20.626,14.595,20.56,11.3],[20.56,11.3,20.661,15.912]],Sge:[[19.79,18.534,19.482,18.232],[19.482,18.232,19.789,17.48],[19.482,18.232,19.39,18]],Vul:[[19.478,24.66,19.79,24.4]],Sct:[[18.586,-8.244,18.7,-9.05],[18.7,-9.05,18.82,-4.75]],CrB:[[15.464,29.106,15.578,26.715],[15.578,26.715,15.713,26.296],[15.713,26.296,15.96,26.878],[15.96,26.878,16.025,29.85],[15.464,29.106,15.342,31.36]],Tri:[[2.159,34.987,1.885,29.579],[1.885,29.579,2.288,33.847],[2.288,33.847,2.159,34.987]],Ari:[[2.119,23.463,1.911,20.808],[1.911,20.808,1.892,19.294]],Cap:[[20.3,-12.508,20.768,-25.27],[20.768,-25.27,21.444,-22.41],[21.444,-22.41,21.784,-16.127],[21.784,-16.127,20.3,-12.508]],Aqr:[[22.096,-.32,22.36,-.117],[22.36,-.117,22.877,-15.821],[22.096,-.32,21.526,-5.571],[22.096,-.32,20.794,-9.496]],Psc:[[23.666,5.626,.811,7.585],[.811,7.585,1.524,15.346],[23.286,3.282,23.666,5.626]],Cet:[[1.143,-10.182,.726,-17.987],[.726,-17.987,1.857,-10.335],[1.857,-10.335,2.469,-8.183],[2.469,-8.183,3.038,4.09],[3.038,4.09,2.722,3.236]],Lib:[[14.848,-16.042,15.067,-25.282],[15.067,-25.282,15.283,-9.383],[15.283,-9.383,14.848,-16.042]],Oph:[[17.582,12.56,17.724,4.567],[17.724,4.567,17.173,-15.725],[17.173,-15.725,16.306,-4.693],[16.306,-4.693,16.239,-3.694],[16.239,-3.694,17.582,12.56]],Ser:[[15.738,6.426,15.826,4.478],[15.826,4.478,15.77,2.1],[17.724,4.567,18.355,-2.898]],CVn:[[12.934,38.318,12.563,41.36]],Com:[[13.197,17.529,13.166,27.878],[12.448,28.268,13.166,27.878]],CMi:[[7.655,5.225,7.453,8.289]],Lyn:[[9.351,34.392,8.39,43.19],[8.39,43.19,7.45,49.21],[6.96,58.42,7.45,49.21]],Cam:[[4.954,66.342,3.839,65.43],[4.954,66.342,6.314,69.32],[3.839,65.43,3.49,59.94]],Lac:[[22.396,52.229,22.51,47.71],[22.51,47.71,22.23,50.28]],Equ:[[21.264,10.007,21.196,6.811]],Hya:[[8.923,5.946,9.459,-22.349],[8.679,6.419,8.923,5.946]],Crv:[[12.169,-22.62,12.498,-16.516],[12.498,-16.516,12.573,-23.396],[12.573,-23.396,12.263,-24.729],[12.263,-24.729,12.169,-22.62]],Cnc:[[8.745,18.154,8.275,9.186],[8.745,18.154,8.778,28.76],[8.745,18.154,8.972,11.858]]};const SM={};STARS.forEach(s=>SM[s.n]=s);function sCol(n){if(["Rigel","Adhara","Spica","Mintaka","Alnilam","Alnitak","Bellatrix","Regulus","Vega","Sirius","Achernar","Menkib","Deneb","Acrux","Mimosa","Hadar","Alnair","Regor","Naos","Markeb","Epsilon Cen","Eta Cen","Zeta Cen","Delta Cen","Imai","Alpha Mus","Beta Mus","Alpha Ara","Kakkab","Ke Kwan","Gamma Lup","Peacock","Phact","Aldhanab"].includes(n))return[135,180,255];if(["Beteigeuze","Antares","Tiaki","Gacrux"].includes(n))return[255,118,55];if(["Aldebaran","Arktur","Kochab","Eltanin","Avior","Suhail","Atria","Ankaa","Pi Pup","Beta Ara","Alpha Tuc"].includes(n))return[255,150,65];if(["Capella","Pollux","Prokyon","Dubhe","Toliman","Beta Hyi","Tureis"].includes(n))return[255,232,118];return[225,235,255]}const CON_LBL=[{n:"Großer Bär",ra:11.5,de:56},{n:"Kleiner Bär",ra:15.5,de:78},{n:"Kassiopeia",ra:1,de:62},{n:"Drache",ra:17.5,de:60},{n:"Kepheus",ra:22,de:68},{n:"Schwan",ra:20.4,de:44},{n:"Leier",ra:18.8,de:38},{n:"Fuhrmann",ra:5.5,de:43},{n:"Perseus",ra:3.5,de:46},{n:"Orion",ra:5.6,de:2},{n:"Zwillinge",ra:7.1,de:26},{n:"Stier",ra:4.5,de:20},{n:"Löwe",ra:10.7,de:18},{n:"Bärenhüter",ra:14.5,de:31},{n:"Herkules",ra:17,de:27},{n:"Jungfrau",ra:13.2,de:2},{n:"Skorpion",ra:16.5,de:-26},{n:"Adler",ra:19.7,de:8},{n:"Andromeda",ra:1.2,de:37},{n:"Pegasus",ra:22.7,de:20},{n:"Schwan",ra:20.4,de:44},{n:"Füchschen",ra:19.7,de:24},{n:"Delfin",ra:20.6,de:13},{n:"Pfeil",ra:19.7,de:18},{n:"Schild",ra:18.7,de:-9},{n:"Eidechse",ra:22.4,de:48},{n:"Füllen",ra:21.2,de:8},{n:"Krone",ra:15.7,de:30},{n:"Schlange",ra:15.8,de:7},{n:"Schlangenträger",ra:17.2,de:-5},{n:"Wassermann",ra:22.5,de:-10},{n:"Steinbock",ra:21,de:-18},{n:"Fische",ra:.8,de:12},{n:"Walfisch",ra:1.7,de:-5},{n:"Dreieck",ra:2.2,de:33},{n:"Giraffe",ra:5,de:65},{n:"Luchs",ra:8,de:48},{n:"Jagdhunde",ra:13,de:40},{n:"Haar d.Berenike",ra:12.8,de:24},{n:"Waage",ra:15.2,de:-18},{n:"Wasserschlange",ra:9.5,de:-10},{n:"Widder",ra:2.4,de:22},{n:"Kl.Hund",ra:7.6,de:6},{n:"Gr.Hund",ra:6.9,de:-22},{n:"Rabe",ra:12.3,de:-19},{n:"Krebs",ra:8.6,de:20},{n:"Pfeil",ra:19.7,de:18}];const ZCON=[["Widder",2.4,22],["Stier",4.5,20],["Zwillinge",7.1,26],["Krebs",8.6,20],["Löwe",10.7,18],["Jungfrau",13.2,2],["Waage",15.2,-18],["Skorpion",16.5,-26],["Schütze",19,-25],["Steinbock",21,-18],["Wassermann",22.5,-10],["Fische",.8,12]];const CONSTELLATION_LABELS=[...new Map([...CON_LBL,...ZCON.map(([n,ra,de])=>({n,ra,de}))].map(label=>[label.n,label])).values()];const MW_CENTER=[{ra:17.76,de:-28.9,w:16},{ra:17.99,de:-23.8,w:15.9},{ra:18.2,de:-18.5,w:15.8},{ra:18.4,de:-13.3,w:15.5},{ra:18.58,de:-7.9,w:15.2},{ra:18.77,de:-2.6,w:14.8},{ra:18.95,de:2.7,w:14.3},{ra:19.13,de:8.1,w:13.7},{ra:19.32,de:13.4,w:13.1},{ra:19.52,de:18.7,w:12.6},{ra:19.73,de:23.9,w:12},{ra:19.96,de:29.1,w:11.4},{ra:20.21,de:34.1,w:10.8},{ra:20.49,de:39.1,w:10.3},{ra:20.82,de:43.8,w:9.8},{ra:21.2,de:48.3,w:9.4},{ra:21.65,de:52.5,w:9},{ra:22.19,de:56.2,w:8.6},{ra:22.84,de:59.3,w:8.3},{ra:23.59,de:61.5,w:8.1},{ra:.43,de:62.7,w:7.8},{ra:1.3,de:62.7,w:7.7},{ra:2.14,de:61.5,w:7.5},{ra:2.89,de:59.2,w:7.4},{ra:3.54,de:56.1,w:7.3},{ra:4.07,de:52.4,w:7.2},{ra:4.52,de:48.2,w:7.2},{ra:4.9,de:43.7,w:7.1},{ra:5.23,de:38.9,w:7.1},{ra:5.51,de:34,w:7.1},{ra:5.76,de:28.9,w:7},{ra:5.99,de:23.8,w:7.1},{ra:6.2,de:18.5,w:7.1},{ra:6.4,de:13.3,w:7.1},{ra:6.58,de:7.9,w:7.2},{ra:6.77,de:2.6,w:7.2},{ra:6.95,de:-2.7,w:7.3},{ra:7.13,de:-8.1,w:7.4},{ra:7.32,de:-13.4,w:7.5},{ra:7.52,de:-18.7,w:7.7},{ra:7.73,de:-23.9,w:7.8},{ra:7.96,de:-29.1,w:8.1},{ra:8.21,de:-34.1,w:8.3},{ra:8.49,de:-39.1,w:8.6},{ra:8.82,de:-43.8,w:9},{ra:9.2,de:-48.3,w:9.4},{ra:9.65,de:-52.5,w:9.8},{ra:10.19,de:-56.2,w:10.3},{ra:10.84,de:-59.3,w:10.8},{ra:11.59,de:-61.5,w:11.4},{ra:12.43,de:-62.7,w:12},{ra:13.3,de:-62.7,w:12.6},{ra:14.14,de:-61.5,w:13.1},{ra:14.89,de:-59.2,w:13.7},{ra:15.54,de:-56.1,w:14.3},{ra:16.07,de:-52.4,w:14.8},{ra:16.52,de:-48.2,w:15.2},{ra:16.9,de:-43.7,w:15.5},{ra:17.23,de:-38.9,w:15.8},{ra:17.51,de:-34,w:15.9},{ra:17.76,de:-28.9,w:16}];const MW_CLOUDS=[{ra:18,de:-24,r:7,b:.36},{ra:18.25,de:-18,r:5.5,b:.3},{ra:18.8,de:-5,r:5,b:.28},{ra:19.4,de:13,r:3.5,b:.18},{ra:20,de:30,r:4,b:.22},{ra:20.4,de:40,r:4.5,b:.24},{ra:.9,de:61,r:3.5,b:.13},{ra:6,de:24,r:4.5,b:.1}];const /* Der Grosse Riss, in galaktischen Koordinaten entworfen und umgerechnet. Drei
   versetzte Straenge statt einer einzelnen Kette: ein Hauptstrang entlang der Ebene
   von galaktischer Laenge 8 bis 86 Grad, der leicht um die Breite null schlaengelt,
   ein noerdlicher Nebenstrang um Breite +3 fuer den Adler-Riss und ein suedlicher um
   Breite -2,4. Am Ende ein dichterer Knoten bei Laenge 78 bis 84 fuer den Noerdlichen
   Kohlensack dicht suedlich von Deneb. Die Halbmesser sind deutlich kleiner als zuvor,
   dafuer sind es viermal so viele Anker - daraus entsteht ein durchgehender, unregel-
   maessiger Spalt statt einer Perlenkette weicher Kreise. */
/* Der Grosse Riss wird nicht mehr aus gestreuten Kreisen zusammengesetzt - daraus
   wurde nie ein Spalt, sondern ein Fleckenteppich. Er ist jetzt ein durchgehendes Band
   mit weichem Querprofil, genau wie die Milchstrasse selbst, nur abdunkelnd statt
   aufhellend. MW_DUST enthaelt deshalb nur noch das abgesonderte Dunkelgebiet beim
   Stier, das nicht zum Riss gehoert. */
MW_DUST=[{ra:6.4,de:0,r:2}];
/* Die halbe Rissbreite betraegt jetzt 37 Prozent der jeweiligen halben Bandbreite,
   punktweise aus MW_CENTER abgeleitet: 5,9 Grad im Schuetzen bis 3,5 Grad im Schwan,
   zuvor 4,6 bis 2,2. Mit den frueheren 22 bis 29 Prozent blieb es bei einer dunklen
   Linie in einem sonst durchgehenden Band; auf Aufnahmen teilt der Riss das Band im
   Adler und Schwan dagegen in zwei erkennbare Aeste. */
/* Der Riss besteht jetzt aus drei Straengen. Der Hauptstrang folgt der galaktischen
   Ebene von Laenge 6 bis 88 Grad; seine halbe Breite betraegt 37 Prozent der jeweiligen
   halben Bandbreite und schwankt zusaetzlich um plus/minus 30 Prozent, sodass der Rand
   ausfranst statt schnurgerade zu verlaufen. Dazu zwei Nebenaeste, wie sie Aufnahmen
   zeigen: einer greift im Adler nach Norden bis zu galaktischer Breite 11,7 Grad, einer
   im Schwan nach Sueden bis -6,2 Grad. Beide sind schmaler und klingen zu ihren Enden
   auf null aus. */
const MW_RIFT=[[{ra:17.94,de:-23.4,w:7.2,s:0},{ra:18.0,de:-21.6,w:5.4,s:0.15},{ra:18.06,de:-19.8,w:4.6,s:0.27},{ra:18.12,de:-18.0,w:5.5,s:0.38},{ra:18.19,de:-16.2,w:4.9,s:0.48},{ra:18.25,de:-14.4,w:5.8,s:0.58},{ra:18.31,de:-12.6,w:7.4,s:0.66},{ra:18.37,de:-10.8,w:6.3,s:0.74},{ra:18.43,de:-9.0,w:5.9,s:0.81},{ra:18.49,de:-7.2,w:5.9,s:0.88},{ra:18.55,de:-5.4,w:4.2,s:0.93},{ra:18.61,de:-3.6,w:4.6,s:0.98},{ra:18.67,de:-1.9,w:5.9,s:1},{ra:18.74,de:-0.1,w:5.5,s:1},{ra:18.8,de:1.6,w:6.4,s:1},{ra:18.86,de:3.4,w:6.7,s:1},{ra:18.93,de:5.1,w:4.9,s:1},{ra:18.99,de:6.9,w:4.7,s:1},{ra:19.06,de:8.6,w:4.7,s:1},{ra:19.13,de:10.4,w:3.8,s:1},{ra:19.19,de:12.1,w:5.1,s:1},{ra:19.26,de:13.9,w:6.0,s:1},{ra:19.33,de:15.6,w:5.2,s:1},{ra:19.4,de:17.3,w:5.5,s:1},{ra:19.47,de:19.1,w:4.9,s:1},{ra:19.54,de:20.8,w:3.4,s:1},{ra:19.61,de:22.5,w:4.0,s:0.97},{ra:19.69,de:24.2,w:4.3,s:0.93},{ra:19.76,de:26.0,w:4.1,s:0.88},{ra:19.84,de:27.7,w:5.4,s:0.83},{ra:19.92,de:29.4,w:5.2,s:0.77},{ra:20.0,de:31.1,w:4.0,s:0.71},{ra:20.08,de:32.8,w:4.1,s:0.65},{ra:20.17,de:34.5,w:3.4,s:0.58},{ra:20.26,de:36.1,w:2.9,s:0.51},{ra:20.35,de:37.8,w:4.1,s:0.44},{ra:20.45,de:39.4,w:4.2,s:0.37},{ra:20.55,de:41.1,w:4.1,s:0.3},{ra:20.66,de:42.7,w:4.6,s:0.22},{ra:20.77,de:44.2,w:3.7,s:0.15},{ra:20.89,de:45.8,w:2.8,s:0.07},{ra:21.02,de:47.3,w:3.3,s:0.0}],
[{ra:18.18,de:-13.8,w:2.5,s:0},{ra:18.19,de:-11.7,w:3.1,s:0.28},{ra:18.21,de:-9.5,w:2.7,s:0.54},{ra:18.22,de:-7.4,w:2.6,s:0.76},{ra:18.24,de:-5.2,w:2.6,s:0.91},{ra:18.25,de:-3.1,w:2.0,s:0.99},{ra:18.26,de:-0.9,w:2.1,s:0.99},{ra:18.27,de:1.2,w:2.6,s:0.91},{ra:18.28,de:3.4,w:2.5,s:0.76},{ra:18.29,de:5.5,w:2.9,s:0.54},{ra:18.3,de:7.6,w:3.0,s:0.28},{ra:18.31,de:9.8,w:2.3,s:0.0}],
[{ra:19.52,de:16.4,w:2.1,s:0},{ra:19.61,de:18.0,w:1.9,s:0.22},{ra:19.7,de:19.5,w:1.4,s:0.42},{ra:19.8,de:21.1,w:1.6,s:0.6},{ra:19.89,de:22.6,w:1.7,s:0.74},{ra:19.99,de:24.1,w:1.6,s:0.84},{ra:20.1,de:25.6,w:2.0,s:0.89},{ra:20.2,de:27.0,w:1.9,s:0.89},{ra:20.31,de:28.5,w:1.5,s:0.84},{ra:20.42,de:29.9,w:1.6,s:0.74},{ra:20.54,de:31.3,w:1.3,s:0.6},{ra:20.66,de:32.6,w:1.2,s:0.42},{ra:20.78,de:34.0,w:1.5,s:0.22},{ra:20.9,de:35.2,w:1.6,s:0.0}]];
/* Querprofil des Risses: in der Mitte volle Staerke, zu den Raendern auslaufend. */
const MW_RIFT_PROF=[[0,0],[0.22,0.45],[0.5,1],[0.78,0.45],[1,0]];
const EXT_LUT=(()=>{const N=128,a=new Float32Array(N+1);for(let i=0;i<=N;i++){const s=Math.max(.02,i/N),am=1/s,em=.23*(am-1);a[i]=Math.pow(10,-.4*em)}return a})();function extBySinAlt(sa){if(sa<=0)return 0;const p=Math.min(128,sa*128),i=Math.floor(p),t=p-i;return EXT_LUT[i]+((EXT_LUT[Math.min(128,i+1)]-EXT_LUT[i])*t)}function extByAltDeg(altDeg){return extBySinAlt(Math.sin(altDeg*Math.PI/180))}function reddenRGB(cr,cg,cb,sinAlt){const sa=Math.max(.04,sinAlt),am=1/sa,k=Math.min(.6,(am-1)*.045);if(k<.01)return[cr,cg,cb];return[cr,Math.round(cg*(1-k*.45)),Math.round(cb*(1-k))]}/* Gemeinsame photometrische Kurve fuer den Lagemodus. Magnituden werden nicht mehr
   in wenige Klassen gepresst: Kern, Deckkraft und Leuchthof folgen kontinuierlich
   dem logarithmischen Helligkeitssystem. Die Standortqualitaet blendet Quellen an
   der visuellen Grenzgroesse weich aus. */function orientStarStyle(mag,scale){const lim=window.skyMagBase||5.5,q=Math.max(0,Math.min(1,(lim-4.5)/2)),edge=Math.max(0,Math.min(1,(lim+.25-mag)/1.15)),smooth=edge*edge*(3-2*edge),flux=Math.pow(10,-.145*(Math.max(-1.5,mag)+1.5)),op=Math.max(0,Math.min(1,(.055+.945*Math.pow(flux,.58))*(.72+.28*q)*smooth)),rad=scale*(.42+1.48*Math.pow(flux,.34)),glow=scale*Math.max(0,(2.25-mag)*.72);return{op:op,rad:rad,glow:glow}}(function(){const d2r=Math.PI/180,dNGP=27.12825*d2r,aNGP=192.85948*d2r,lNCP=122.93192*d2r;MW_CENTER.forEach(p=>{const ra=p.ra*15*d2r,de=p.de*d2r;const y=Math.cos(de)*Math.sin(ra-aNGP);const x=Math.cos(dNGP)*Math.sin(de)-Math.sin(dNGP)*Math.cos(de)*Math.cos(ra-aNGP);let l=(lNCP-Math.atan2(y,x))/d2r;l=(l%360+360)%360;p.bf=.28+.72*Math.pow(.5+.5*Math.cos(l*d2r),1.3)})})();
/* ── Milchstraße: aufbereitete Daten, einmalig beim Laden ──────────────────
   1) Mittellinie mit Catmull-Rom auf Einheitsvektoren verdichtet (kein Bruch
      beim Rektaszensionsüberlauf 24h→0h), Halbbreite und Helligkeit mitgeführt.
   2) Zwei Oktaven zyklisches Wertrauschen entlang der Bahn modulieren die
      Helligkeit, damit das Band nicht gleichförmig durchleuchtet.
   3) Aus den acht Wolken- und elf Staubankern wird ein gestreutes Feld weicher
      Flecken erzeugt; die Anker bleiben also erhalten, verlieren aber ihre
      erkennbare Kreisform.                                                    */
const MW_PEAK=.302, MW_HALF=1.25;
const MW_PROF=[[0,0,"150,175,225"],[.12,.10,"155,180,228"],[.25,.35,"165,188,232"],
               [.38,.72,"180,200,240"],[.5,1,"200,214,246"],[.62,.72,"180,200,240"],
               [.75,.35,"165,188,232"],[.88,.10,"155,180,228"],[1,0,"150,175,225"]];
const MW_SPINE=(()=>{
  const d2r=Math.PI/180,r2d=180/Math.PI;
  const src=MW_CENTER.slice(0,MW_CENTER.length-1);
  const n=src.length;
  const V=src.map(p=>{const ra=p.ra*15*d2r,de=p.de*d2r,cd=Math.cos(de);
    return[cd*Math.cos(ra),cd*Math.sin(ra),Math.sin(de)]});
  let seed=20260728;const rnd=()=>{seed=seed*1103515245+12345&2147483647;return seed/2147483647};
  const oct=k=>{const a=[];for(let i=0;i<k;i++)a.push(rnd()*2-1);return a};
  const nA=oct(12),nB=oct(5);
  const wert=(a,u)=>{const m=a.length,f=((u%1)+1)%1*m,i0=f|0,i1=(i0+1)%m,t=f-i0,s=t*t*(3-2*t);
    return a[i0]*(1-s)+a[i1]*s};
  const cr=(a,b,c,d,t)=>{const t2=t*t,t3=t2*t;
    return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)};
  const SUB=6,out=[];
  for(let i=0;i<n;i++){
    const i0=(i-1+n)%n,i1=i,i2=(i+1)%n,i3=(i+2)%n;
    for(let k=0;k<SUB;k++){
      const t=k/SUB,v=[0,0,0];
      for(let a=0;a<3;a++)v[a]=cr(V[i0][a],V[i1][a],V[i2][a],V[i3][a],t);
      const L=Math.hypot(v[0],v[1],v[2]);v[0]/=L;v[1]/=L;v[2]/=L;
      let ra=Math.atan2(v[1],v[0])*r2d/15;if(ra<0)ra+=24;
      const de=Math.asin(Math.max(-1,Math.min(1,v[2])))*r2d;
      const w=src[i1].w+(src[i2].w-src[i1].w)*t;
      const b1=src[i1].bf||.5,b2=src[i2].bf||.5;
      const u=(i+t)/n;
      const nz=1+.20*wert(nA,u)+.10*wert(nB,u);
      out.push({ra:ra,de:de,w:w,bf:Math.max(.05,(b1+(b2-b1)*t)*nz)});
    }
  }
  out.push(out[0]);
  return out;
})();
const MW_BLOBS=(()=>{
  let seed=815263;const rnd=()=>{seed=seed*1103515245+12345&2147483647;return seed/2147483647};
  const out=[];
  const streu=(anker,anz,teiler,dunkel)=>anker.forEach(c=>{
    for(let i=0;i<anz;i++){
      const ang=rnd()*Math.PI*2,rad=Math.pow(rnd(),.6)*c.r*.55;
      const dde=Math.sin(ang)*rad;
      const de=c.de+dde;
      const dra=Math.cos(ang)*rad/Math.max(.25,Math.cos(de*Math.PI/180))/15;
      out.push({ra:((c.ra+dra)%24+24)%24,de:de,r:c.r*(.55+.40*rnd()),
                b:(dunkel?1:c.b)*(.45+.55*rnd())/teiler,dunkel:dunkel});
    }
  });
  streu(MW_CLOUDS,7,2.63,false);
  streu(MW_DUST,2,3.94,true);
  return out;
})();
function mwFleck(g,P,r,b,dunkel){
  const c=dunkel?"4,6,18":"206,218,247";
  const gr=g.createRadialGradient(P.x,P.y,0,P.x,P.y,r);
  gr.addColorStop(0,"rgba("+c+","+b.toFixed(4)+")");
  gr.addColorStop(.4,"rgba("+c+","+(b*.55).toFixed(4)+")");
  gr.addColorStop(.72,"rgba("+c+","+(b*.18).toFixed(4)+")");
  gr.addColorStop(1,"rgba("+c+",0)");
  g.beginPath();g.arc(P.x,P.y,r,0,Math.PI*2);g.fillStyle=gr;g.fill();
}function getDOY(d){return Math.floor((d-new Date(d.getFullYear(),0,0))/864e5)}const MN=["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];function isLeap(y){return y%4===0&&y%100!==0||y%400===0}function monthDays(y){return[31,isLeap(y)?29:28,31,30,31,30,31,31,30,31,30,31]}function daysInYear(y){return isLeap(y)?366:365}const MD=monthDays(2e3);function doy2date(dy,y){const md=monthDays(y||simYear);let d=Math.floor(dy),m=0;while(m<11&&d>md[m]){d-=md[m];m++}return{d:d,m:m}}function date2doy(day,mon,y){const md=monthDays(y||simYear);let doy=day;for(let i=0;i<mon;i++)doy+=md[i];return doy}function hhmm(h){const n=(h%24+24)%24,hh=Math.floor(n),mm=Math.round((n-hh)*60);return`${String(hh).padStart(2,"0")}:${String(mm%60).padStart(2,"0")}`}const n0=new Date;let simYear=n0.getFullYear();let simDay=getDOY(n0)||1,simMin=n0.getHours()*60+n0.getMinutes();let lat=48,lng=11.6;function tzFromLng(lo){if(lo>=-10&&lo<=25&&typeof lat!=="undefined"&&lat>=35&&lat<=72)return 1;return Math.round(lo/15)}let utcBase=tzFromLng(lng),dstOffset=0,utcOff=utcBase;window.telescope=false;let paused=false,speed=136,userSpeed=136,showNames=true,showHorizon=false,showAlt=false,showISS=false,zoom=1,showRA=false,showLines=true,showRefCircles=true,showTwilight=false,showZodiac=true;let showMeteors=true,showJMoons=true;let viewMode="dome",camAz=0,camAlt=26,camFov=65,showGround=true;let focusConstellation=null;let meteorParticles=[],lastMeteorT=0,meteorSpawnAcc=0;let BSC=[];let bscPrecYear=null;let lastBscPrec=0;let bscPrecTargetYear=null;let bscPrecCursor=0;let gaiaPrecTargetYear=null;let gaiaPrecCursor=0;window.skyMagBase=(()=>{try{const m=parseFloat(localStorage.getItem("planetarium-sky-mag"));if(m===4.5||m===5.5||m===6.5)return m}catch(e){}return 5.5})();
let showConstellationNames=true;
function setSkyQuality(m,source){
  window.skyMagBase=m;
  try{localStorage.setItem("planetarium-sky-mag",String(m))}catch(e){}
  ["skyq-city","skyq-land","skyq-dark"].forEach(id=>{
    const b=document.getElementById(id);if(b)b.classList.remove("on");
  });
  const akt=m<=4.5?"skyq-city":(m<=5.5?"skyq-land":"skyq-dark");
  const b=document.getElementById(akt);if(b)b.classList.add("on");
  const parey=document.getElementById("skyq-parey");
  if(parey){
    const aktiv=source==="parey";
    parey.classList.toggle("on",aktiv);
    parey.setAttribute("aria-pressed",String(aktiv));
  }
  const status=document.getElementById("skyq-auto-status");
  if(status&&source!=="auto")status.textContent=m>=6.49?"dunkel · unbegrenzt · keine Grenzgröße":"Manuell gewählt · beim nächsten Standortwechsel wieder automatisch";
  /* Bei einem real dunklen Standort wird der kuenstliche Schimmer samt
     Dunkelwolken ausgeschaltet. Die davon unabhaengigen Gaia-Sterne bleiben. */
  if(m>=6.49){window.didHideMW=true;window.didHideMWGlow=true}
  const mwButton=document.getElementById("bmwglow");
  if(mwButton){const visible=window.didHideMW!==true;mwButton.classList.toggle("on",visible);mwButton.setAttribute("aria-pressed",String(visible))}
  if(typeof draw==="function")try{draw()}catch(e){}
}
function setPareyProfile(){
  lat=52.678;lng=12.247;selCity=null;
  try{updateLocDisp("Sternenblick Parey",lat,lng)}catch(e){}
  updateTimezone();
  /* Parey liegt in der dunkelsten Zone des Sternenparks Westhavelland. Das
     Anwendungsmodell bildet diese geringe reale Lichtverschmutzung mit seinem
     Standortprofil "dunkel" ab; alle anderen Ansichtsparameter bleiben bestehen. */
  updLabels();setSkyQuality(6.5,"parey");
  const status=document.getElementById("skyq-auto-status");
  if(status){status.textContent="Sternenblick Parey · geringe reale Lichtverschmutzung · Profil dunkel";status.title="Standortbezogene Näherung für den Sternenpark Westhavelland; Wetter, Mondlicht und momentane lokale Beleuchtung sind nicht enthalten."}
  try{if(typeof showToast==="function")showToast("Sternenblick Parey · Lichtverschmutzung: dunkel")}catch(e){}
  /* Falls beim Klick noch die kleine Gaia-Startstufe geladen wird, darf der
     Wunsch nach dem tiefen dunklen Katalog nicht verloren gehen. */
  try{_gaiaStart();_gaiaStufenPruefen()}catch(e){}
  if(typeof draw==="function")draw();
}
/* Die manuelle Himmelsqualitaet ueberlebt einen Browser-Reload. */
queueMicrotask(()=>setSkyQuality(window.skyMagBase,"restore"));
function buildStarField(){return[{ra:0,de:0,mag:99,gaiaGridSentinel:true}];/*
  Technischer Wächter für den bestehenden zellenweisen Zeichenweg. Er ist mit
  99 mag stets unsichtbar und enthält keinen erzeugten Stern. Das eigentliche
  Hintergrundfeld stammt ausschließlich aus Gaia DR3. */const arr=[];
  /* Helles Feld von 3,5 bis 6,5 mag nach dem klassischen Zählgesetz.
     log N = 0,5029·m + 0,6902 trifft die Standardsummen: 158 bis 3,0 mag,
     503 bis 4,0, 1.570 bis 5,0, 5.101 bis 6,0 und 9.096 bis 6,5. Die
     namentlich geführten Sterne werden je Größenklassenstufe abgezogen, damit
     die Summe stimmt und das helle Ende nicht doppelt besetzt wird.
     Vorher begann das Feld erst bei 4,5 mag – unter 4,5 gab es also keinen
     einzigen Feldstern, während der Bereich 5,5 bis 6,5 fast doppelt so dicht
     besetzt war wie am wirklichen Himmel. */
  const _zahl=m=>Math.pow(10,.5029*m+.6902);
  const _benannt=(a,b)=>{let k=0;for(let i=0;i<STARS.length;i++){const g=STARS[i].mag;if(g>=a&&g<b)k++}return k};
  for(let m=3.0;m<6.4999;m+=.1){
    const soll=Math.round(_zahl(m+.1)-_zahl(m)-_benannt(m,m+.1));
    for(let i=0;i<soll;i++){
      const mg=m+rnd()*.1;
      if(rnd()<.35){const l=rnd()*360,b=(rnd()+rnd()+rnd()-1.5)*15;const[ra,dec]=gal2eq(l,b);arr.push({ra:ra,de:dec,mag:mg})}
      else arr.push({ra:rnd()*24,de:Math.asin(2*rnd()-1)*r2d,mag:mg});
    }
  }for(let i=0;i<48e3;i++){const ra=rnd()*24,dec=Math.asin(2*rnd()-1)*r2d;arr.push({ra:ra,de:dec,mag:6.5+rnd()*2.5})}for(let i=0;i<64e3;i++){const l=rnd()*360;const b=(rnd()+rnd()+rnd()-1.5)*6;const[ra,dec]=gal2eq(l,b);const dl=Math.min(Math.abs(l),Math.abs(l-360));const bright=dl<60?6.5:6.9;arr.push({ra:ra,de:dec,mag:bright+rnd()*2.2})}for(let i=0;i<72e3;i++){const ra=rnd()*24,dec=Math.asin(2*rnd()-1)*r2d;arr.push({ra:ra,de:dec,mag:9+rnd()*2.5})}for(let i=0;i<96e3;i++){const l=rnd()*360;const b=(rnd()+rnd()+rnd()-1.5)*5;const[ra,dec]=gal2eq(l,b);const dl=Math.min(Math.abs(l),Math.abs(l-360));const bright=dl<60?8.8:9.3;arr.push({ra:ra,de:dec,mag:bright+rnd()*2.4})}for(let i=0;i<104e3;i++){const ra=rnd()*24,dec=Math.asin(2*rnd()-1)*r2d;arr.push({ra:ra,de:dec,mag:11+rnd()*2})}for(let i=0;i<136e3;i++){const l=rnd()*360;const b=(rnd()+rnd()+rnd()-1.5)*4.5;const[ra,dec]=gal2eq(l,b);const dl=Math.min(Math.abs(l),Math.abs(l-360));const bright=dl<60?10.6:11.1;arr.push({ra:ra,de:dec,mag:bright+rnd()*2})}for(let i=0;i<9e4;i++){const ra=rnd()*24,dec=Math.asin(2*rnd()-1)*r2d;arr.push({ra:ra,de:dec,mag:13+rnd()*2})}for(let i=0;i<12e4;i++){const l=rnd()*360;const b=(rnd()+rnd()+rnd()-1.5)*4;const[ra,dec]=gal2eq(l,b);const dl=Math.min(Math.abs(l),Math.abs(l-360));const bright=dl<60?12.6:13.1;arr.push({ra:ra,de:dec,mag:bright+rnd()*2})}arr.sort((a,b)=>a.mag-b.mag);return arr}BSC=buildStarField();const GRID_RA=48,GRID_DEC=24;let starGrid=null;function buildStarGrid(){const g=Array.from({length:GRID_RA*GRID_DEC},()=>[]);for(let i=0;i<BSC.length;i++){const s=BSC[i];const ra=(s.ra%24+24)%24;const ri=Math.min(GRID_RA-1,Math.floor(ra/24*GRID_RA));const di=Math.min(GRID_DEC-1,Math.floor((s.de+90)/180*GRID_DEC));g[di*GRID_RA+ri].push(s)}for(const cell of g)cell.sort((a,b)=>a.mag-b.mag);function _fieldBox(HR){
  try{
  if(!window.telescope)return null;
  if(!(HR>0))return null;
  let alt,A,radDeg;
  if(viewMode==="real"){
    if(camFov>=16.25)return null;
    A=camAz*Math.PI/180;alt=camAlt*Math.PI/180;
    const _q=(Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/360);
    radDeg=2*Math.atan(Math.hypot(cvW||W,cvH||W)/2/_q)*180/Math.PI;
  }else{
    if(zoom<=4)return null;
    const lx=-panX/zoom,ly=-panY/zoom;
    const rl=Math.hypot(lx,ly);
    const zen=Math.min(89.9,rl/HR*90);
    alt=(90-zen)*Math.PI/180;
    A=Math.atan2(lx,ly);
    radDeg=(Math.hypot(cvW||W,cvH||W)/2/zoom)/HR*90;
  }
  const phi=lat*Math.PI/180;
  const sd=Math.sin(phi)*Math.sin(alt)-Math.cos(phi)*Math.cos(alt)*Math.cos(A);
  const dec=Math.asin(Math.max(-1,Math.min(1,sd)));
  const cd=Math.max(1e-9,Math.cos(dec));
  const sH=Math.sin(A)*Math.cos(alt)/cd;
  const cH=(Math.sin(alt)-Math.sin(phi)*Math.sin(dec))/Math.max(1e-9,Math.cos(phi)*cd);
  const H=Math.atan2(sH,cH);
  const decDeg=dec*180/Math.PI;
  const raDeg=LST()-H*180/Math.PI;
  const mk=function(m){
    const dmin=Math.max(-90,decDeg-m),dmax=Math.min(90,decDeg+m);
    let rmin=0,rmax=24,wrap=false,raOn=false;
    if(decDeg-m>-86&&decDeg+m<86){
      const cosd=Math.cos(Math.min(86,Math.max(Math.abs(dmin),Math.abs(dmax)))*Math.PI/180);
      const raHalf=Math.min(180,m/Math.max(.07,cosd))/15;
      if(raHalf<11.9){
        const rc=((raDeg/15)%24+24)%24;
        rmin=rc-raHalf;rmax=rc+raHalf;raOn=true;
        if(rmin<0){rmin+=24;wrap=true}
        if(rmax>=24){rmax-=24;wrap=true}
      }
    }
    return{dmin:dmin,dmax:dmax,rmin:rmin,rmax:rmax,wrap:wrap,raOn:raOn};
  };
  const full=mk(radDeg+4);
  full.c=mk(radDeg*.42+2);
  const rr=raDeg*Math.PI/180,dd=dec;
  full.vx=Math.cos(dd)*Math.cos(rr);full.vy=Math.cos(dd)*Math.sin(rr);full.vz=Math.sin(dd);
  full.mDeg=radDeg+4;full.mDegC=radDeg*.42+2;
  return full;
  }catch(e){return null}
}
window._fieldBox=_fieldBox;
starGrid=g}buildStarGrid();
/* Vorberechnete Richtungsvektoren und Radien der Rasterzellen fuer die Sichtfeldauswahl */
const _cellVX=new Float64Array(GRID_RA*GRID_DEC),_cellVY=new Float64Array(GRID_RA*GRID_DEC),_cellVZ=new Float64Array(GRID_RA*GRID_DEC),_cellRad=new Float64Array(GRID_RA*GRID_DEC);
(function(){
  for(let di=0;di<GRID_DEC;di++){
    const de0=di/GRID_DEC*180-90,de1=(di+1)/GRID_DEC*180-90,cd=(de0+de1)/2;
    const dh=(de1-de0)/2;
    const cosCd=Math.cos(cd*Math.PI/180);
    const maxCos=Math.max(Math.cos(de0*Math.PI/180),Math.cos(de1*Math.PI/180));
    const rw=(24/GRID_RA)*15/2*maxCos;
    const rad=Math.min(90,Math.sqrt(dh*dh+rw*rw)+0.2);
    for(let ri=0;ri<GRID_RA;ri++){
      const cr=(ri+.5)/GRID_RA*360;
      const k=di*GRID_RA+ri;
      _cellVX[k]=cosCd*Math.cos(cr*Math.PI/180);
      _cellVY[k]=cosCd*Math.sin(cr*Math.PI/180);
      _cellVZ[k]=Math.sin(cd*Math.PI/180);
      _cellRad[k]=rad;
    }
  }
})();

/* ══ Gaia-DR3-Katalog ══════════════════════════════════════════════════════
   Ersetzt im Bereich bis 10 mag das künstliche Feld durch echte Sterne.
   Die Datei wird beim ersten Laden einmalig von 36 auf 10 Byte je Stern
   umgepackt, nach dem vorhandenen 48×24-Raster sortiert und in IndexedDB
   abgelegt. Doppelgänger der namentlich geführten Sterne werden entfernt. */
/* Umpacken des Gaia-Katalogs: 36 Byte je Stern → 10 Byte, nach Zellen sortiert.
   Genau dieser Code kommt später ins Planetarium. */
const G_MAGMIN=-2, G_MAGSTEP=1/16, G_FBMIN=-1, G_FBSPAN=6;
function gaiaUmpacken(buf, gRA, gDE, namen){
  const dv=new DataView(buf);
  if(String.fromCharCode(dv.getUint8(0),dv.getUint8(1),dv.getUint8(2),dv.getUint8(3))!=="GDR3")
    throw new Error("keine GDR3-Datei");
  const N=dv.getUint32(8,true);
  if(16+N*36!==buf.byteLength) throw new Error("Länge passt nicht zu "+N+" Sätzen");
  const zellen=gRA*gDE;
  const zahl=new Uint32Array(zellen);
  const kz=new Uint16Array(N), km=new Uint8Array(N);
  const ra32=new Uint32Array(N), de32=new Int32Array(N), fb8=new Uint8Array(N);
  for(let i=0;i<N;i++){
    const o=16+i*36;
    const ra=dv.getFloat64(o+8,true), de=dv.getFloat64(o+16,true);
    const g=dv.getFloat32(o+24,true), bp=dv.getFloat32(o+28,true), rp=dv.getFloat32(o+32,true);
    let ri=Math.floor(((ra/15)%24+24)%24/24*gRA); if(ri>=gRA)ri=gRA-1;
    let di=Math.floor((de+90)/180*gDE); if(di>=gDE)di=gDE-1; if(di<0)di=0;
    const k=di*gRA+ri; kz[i]=k; zahl[k]++;
    ra32[i]=(((ra%360)+360)%360)/360*4294967296>>>0;
    de32[i]=Math.max(-2147483648,Math.min(2147483647,Math.round(de/90*2147483648)));
    /* Gaia misst im breiten G-Band; das Auge sieht V. Die amtliche Umrechnung
       G − V = −0,0176 − 0,00686·(BP−RP) − 0,1732·(BP−RP)² wird angewandt, damit
       Grenzgröße und Sternzahlen dem visuellen Himmel entsprechen. */
    let c=(bp>0&&rp>0)?(bp-rp):0.8;
    const cc=Math.max(-0.5,Math.min(5,c));
    const vmag=g+0.0176+0.00686*cc+0.1732*cc*cc;
    let v=Math.round((vmag-G_MAGMIN)/G_MAGSTEP); km[i]=Math.max(0,Math.min(254,v));
    let w=Math.round((Math.max(G_FBMIN,Math.min(G_FBMIN+G_FBSPAN,c))-G_FBMIN)/G_FBSPAN*255);
    fb8[i]=Math.max(0,Math.min(255,w));
  }
  /* Zählsortierung nach Zelle */
  const verz=new Uint32Array(zellen+1);
  for(let k=0;k<zellen;k++)verz[k+1]=verz[k]+zahl[k];
  const pos=verz.slice(0,zellen);
  const ord=new Uint32Array(N);
  for(let i=0;i<N;i++)ord[pos[kz[i]]++]=i;
  /* innerhalb der Zelle nach Größenklasse */
  for(let k=0;k<zellen;k++){
    const a=verz[k],b=verz[k+1];
    if(b-a>1){
      const teil=Array.prototype.slice.call(ord.subarray(a,b));
      teil.sort((x,y)=>km[x]-km[y]);
      for(let i=0;i<teil.length;i++)ord[a+i]=teil[i];
    }
  }
  /* sortierte Zwischenfelder */
  const sRA=new Uint32Array(N),sDE=new Int32Array(N),sMG=new Uint8Array(N),sFB=new Uint8Array(N);
  for(let i=0;i<N;i++){const j=ord[i];sRA[i]=ra32[j];sDE[i]=de32[j];sMG[i]=km[j];sFB[i]=fb8[j]}
  /* Sterne, die schon namentlich geführt sind, ausscheiden – sonst doppelt gezeichnet */
  const weg=new Uint8Array(N); let doppelt=0;
  if(namen&&namen.length){
    const R=Math.PI/180;
    for(const s of namen){
      let ri=Math.floor(((s.ra%24)+24)%24/24*gRA); if(ri>=gRA)ri=gRA-1;
      let di=Math.floor((s.de+90)/180*gDE); if(di>=gDE)di=gDE-1; if(di<0)di=0;
      let best=-1,bd=1e9;
      for(let dr=-1;dr<=1;dr++)for(let dd=-1;dd<=1;dd++){
        const r2=((ri+dr)%gRA+gRA)%gRA, d2=di+dd;
        if(d2<0||d2>=gDE)continue;
        const k=d2*gRA+r2;
        for(let i=verz[k];i<verz[k+1];i++){
          if(weg[i])continue;
          const ra=sRA[i]*(360/4294967296)/15, de=sDE[i]*(90/2147483648);
          const dl=(((ra-s.ra)%24+36)%24-12)*15*Math.cos((de+s.de)/2*R);
          const dist=Math.hypot(dl,de-s.de);
          if(dist<bd){bd=dist;best=i}
        }
      }
      if(best>=0&&bd<0.03){weg[best]=1;doppelt++}
    }
  }
  /* verdichten, Zellenverzeichnis neu aufbauen */
  const verz2=new Uint32Array(zellen+1); let m=0;
  const halt=new Uint32Array(N);
  for(let k=0;k<zellen;k++){verz2[k]=m;for(let i=verz[k];i<verz[k+1];i++)if(!weg[i])halt[m++]=i}
  verz2[zellen]=m;
  const N2=m;
  const kopf=32, vlen=4*(zellen+1);
  const out=new ArrayBuffer(kopf+vlen+4*N2+4*N2+N2+N2);
  const ov=new DataView(out);
  ov.setUint8(0,71);ov.setUint8(1,68);ov.setUint8(2,82);ov.setUint8(3,51);
  ov.setUint32(4,1,true); ov.setUint32(8,N2,true);
  ov.setFloat32(12,G_MAGMIN,true); ov.setFloat32(16,G_MAGSTEP,true);
  ov.setUint16(20,gRA,true); ov.setUint16(22,gDE,true);
  let o=kopf;
  new Uint32Array(out,o,zellen+1).set(verz2); o+=vlen;
  const oRA=new Uint32Array(out,o,N2); o+=4*N2;
  const oDE=new Int32Array(out,o,N2);  o+=4*N2;
  const oMG=new Uint8Array(out,o,N2);  o+=N2;
  const oFB=new Uint8Array(out,o,N2);  o+=N2;
  for(let i=0;i<N2;i++){const j=halt[i];oRA[i]=sRA[j];oDE[i]=sDE[j];oMG[i]=sMG[j];oFB[i]=sFB[j]}
  return {puffer:out,N:N2,doppelt:doppelt};
}
function gaiaLesen(buf){
  const dv=new DataView(buf);
  if(String.fromCharCode(dv.getUint8(0),dv.getUint8(1),dv.getUint8(2),dv.getUint8(3))!=="GDR3")
    throw new Error("keine GDR3-Datei");
  if(dv.getUint32(4,true)!==1) throw new Error("andere Fassung");
  const N=dv.getUint32(8,true), magMin=dv.getFloat32(12,true), magStep=dv.getFloat32(16,true);
  const gRA=dv.getUint16(20,true), gDE=dv.getUint16(22,true);
  let o=32; const verz=new Uint32Array(buf,o,gRA*gDE+1); o+=4*(gRA*gDE+1);
  const ra=new Uint32Array(buf,o,N); o+=4*N;
  const de=new Int32Array(buf,o,N);  o+=4*N;
  const mg=new Uint8Array(buf,o,N);  o+=N;
  const fb=new Uint8Array(buf,o,N);  o+=N;
  if(o!==buf.byteLength)throw new Error("Länge passt nicht");
  return {N,magMin,magStep,gRA,gDE,verz,ra,de,mg,fb};
}
function gaiaVektorKachelLesen(buf){
  const dv=new DataView(buf);
  if(String.fromCharCode(dv.getUint8(0),dv.getUint8(1),dv.getUint8(2),dv.getUint8(3))!=="GTV1")
    throw new Error("keine Gaia-Vektorkachel");
  const N=dv.getUint32(8,true),magMin=dv.getFloat32(12,true),magStep=dv.getFloat32(16,true);
  const gRA=dv.getUint16(20,true),gDE=dv.getUint16(22,true);
  let o=32;const verz=new Uint32Array(buf,o,gRA*gDE+1);o+=4*(gRA*gDE+1);
  const vx=new Float32Array(buf,o,N);o+=4*N;
  const vy=new Float32Array(buf,o,N);o+=4*N;
  const vz=new Float32Array(buf,o,N);o+=4*N;
  const mg=new Uint8Array(buf,o,N);o+=N;
  const fb=new Uint8Array(buf,o,N);o+=N;
  if(o!==buf.byteLength)throw new Error("Vektorkachel-Laenge passt nicht");
  return {N,magMin,magStep,gRA,gDE,verz,vx,vy,vz,mg,fb,vector:true};
}
let _GAIA=null,_gaiaVersucht=false,_gaiaGefragt=false;
/* WebGL-Sternrenderer: Der Basiskatalog bleibt als Vektor-/Photometriepuffer auf
   der Grafikkarte. Pro Bild werden nur Kameramatrix, Zeit, Standort, Zoom und
   Grenzhelligkeit aktualisiert. Projektion, Ausschnittpruefung, LOD, Farbe und
   Punktgroesse laufen danach parallel im Vertex-/Fragment-Shader. Ein verborgenes
   transparentes Canvas wird an der bisherigen Gaia-Stelle in das 2D-Himmelsbild
   einkopiert; Linien, Namen und Bedienung behalten dadurch exakt ihre Reihenfolge.
   Kann ein Geraet WebGL nicht stabil bereitstellen, bleibt der vorhandene
   Canvas-2D-Pfad automatisch aktiv. */
const _gaiaGL={canvas:null,gl:null,program:null,buffers:new WeakMap(),count:0,failed:false,loc:null};window.__gaiaGpuStatus={active:false,ready:false,count:0,fallback:false};document.documentElement.dataset.gaiaGpu="idle";
let _orientBelowCanvas=null,_orientBelowCtx=null;
function _orientBelowClear(){if(_orientBelowCtx&&_orientBelowCanvas)_orientBelowCtx.clearRect(0,0,_orientBelowCanvas.width,_orientBelowCanvas.height)}
function _orientBelowDraw(pts,HH,sourceTransform){
  if(!orientMode||!showGround||pts.length<3){_orientBelowClear();return}
  if(!_orientBelowCanvas){
    _orientBelowCanvas=document.createElement("canvas");_orientBelowCanvas.id="orientation-below-layer";
    _orientBelowCanvas.setAttribute("aria-hidden","true");
    Object.assign(_orientBelowCanvas.style,{position:"absolute",inset:"0",width:"100%",height:"100%",zIndex:"3",pointerEvents:"none"});
    wrap.appendChild(_orientBelowCanvas);_orientBelowCtx=_orientBelowCanvas.getContext("2d");
  }
  const c=_orientBelowCanvas,q=_orientBelowCtx;if(c.width!==cvW||c.height!==cvH){c.width=cvW;c.height=cvH}
  q.clearRect(0,0,c.width,c.height);
  const m=sourceTransform,screen=pts.map(p=>({x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f}));
  q.beginPath();q.moveTo(screen[0].x,screen[0].y);for(let i=1;i<screen.length;i++)q.lineTo(screen[i].x,screen[i].y);
  q.lineTo(screen[screen.length-1].x,c.height*2);q.lineTo(screen[0].x,c.height*2);q.closePath();
  const y0=screen[Math.floor(screen.length/2)].y,gg=q.createLinearGradient(0,y0,0,y0+HH*1.2);
  /* Weiche Vignette: Am Horizont bleibt die Orientierung gut erkennbar,
     darunter tritt die astronomisch unsichtbare Himmelshaelfte rasch zurueck. */
  gg.addColorStop(0,"rgba(8,14,24,.30)");gg.addColorStop(.18,"rgba(5,9,17,.56)");gg.addColorStop(.48,"rgba(3,6,13,.72)");gg.addColorStop(1,"rgba(1,3,8,.78)");q.fillStyle=gg;q.fill();
}
function _gaiaGLShader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||"Gaia-Shader");return s}
function _gaiaGLInit(){
  if(_gaiaGL.failed)return false;if(_gaiaGL.gl)return true;
  try{
    const c=document.createElement("canvas"),gl=c.getContext("webgl",{alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,premultipliedAlpha:true});
    if(!gl)throw new Error("WebGL nicht verfuegbar");
    const vs=_gaiaGLShader(gl,gl.VERTEX_SHADER,`precision highp float;
attribute vec3 a_pos;attribute float a_mag;attribute vec3 a_col;attribute float a_id;attribute float a_density;
uniform vec3 u_m0,u_m1,u_m2;uniform vec2 u_lst;uniform vec2 u_phi;uniform vec4 u_view;uniform vec4 u_camera;
uniform vec4 u_screen;uniform vec4 u_clip;uniform vec4 u_cull;uniform vec3 u_lod;uniform float u_real;uniform float u_allowBelow;uniform float u_point;uniform float u_night;uniform float u_densityScreen;
varying vec3 v_col;varying float v_alpha;varying float v_densityLayer;
void hide(){gl_Position=vec4(2.0,2.0,0.0,1.0);gl_PointSize=0.0;v_alpha=0.0;v_densityLayer=0.0;}
void main(){
  float mag=a_mag;bool densityLayer=a_density<0.0;
  if(!densityLayer&&mag>u_lod.x){hide();return;}
  float resolution=clamp((u_lod.z-1.0)/2.0,0.0,1.0),densityBoost=1.0+(a_density-1.0)*resolution;
  float stride=max(1.0,floor(u_lod.y/densityBoost+.5));
  if(!densityLayer&&mag>6.5&&stride>1.0&&mod(a_id,stride)>=1.0){hide();return;}
  vec3 p=vec3(dot(u_m0,a_pos),dot(u_m1,a_pos),dot(u_m2,a_pos));
  if(u_cull.w>-1.5&&dot(p,u_cull.xyz)<u_cull.w){hide();return;}
  float cD=u_lst.x*p.x+u_lst.y*p.y,sinAlt=u_phi.x*p.z+u_phi.y*cD;
  if(sinAlt<0.0&&u_allowBelow<.5){hide();return;}
  /* Unter dem Horizont bleibt nur die ruhige Freiaugen-Grundschicht. */
  if(sinAlt<=0.0&&u_allowBelow>.5&&!densityLayer&&mag>5.2){hide();return;}
  float uu=u_lst.y*p.x-u_lst.x*p.y,vv=cD*u_phi.x-p.z*u_phi.y,x,y;
  if(u_real>.5){
    float d=uu*u_camera.x*u_camera.z+vv*u_camera.y*u_camera.z+sinAlt*u_camera.w;if(d<=-.2){hide();return;}
    float px=uu*u_camera.y-vv*u_camera.x;
    float py=uu*(-u_camera.x*u_camera.w)+vv*(-u_camera.y*u_camera.w)+sinAlt*u_camera.z;
    float q=u_view.w/(1.0+d);x=q*px;y=-q*py;
  }else{
    float w=length(vec2(uu,vv)),r=acos(clamp(sinAlt,-1.0,1.0))*u_view.z,k=w>1e-8?r/w:0.0;x=k*uu;y=k*vv;
  }
  if(x<u_clip.x||x>u_clip.y||y<u_clip.z||y>u_clip.w){hide();return;}
  float sx=u_screen.x+(u_real>.5?x:u_view.x+u_lod.z*x),sy=u_screen.y+(u_real>.5?y:u_view.y+u_lod.z*y);
  // Never divide by panY: the normal centered view has panY == 0.
  gl_Position=vec4(sx/u_screen.z*2.0-1.0,1.0-sy/u_screen.w*2.0,0.0,1.0);
  if(densityLayer){
    float bucket=mag,fade=clamp((3.4-u_lod.z)/2.4,0.0,1.0),flux=max(1.0,-a_density);
    /* Canvas-filter: blur() verteilt die Energie eines Samples auf eine grosse
       Flaeche. Ein Punktshader muss seine Spitzenhelligkeit daher stark
       reduzieren; andernfalls wird jedes Katalogsample als heller Wattebausch
       sichtbar. Die groessere Ausdehnung und rund elfmal kleinere Mitte
       ergeben wieder einen ruhigen, sich ueberlagernden Sternschimmer. */
    v_alpha=min(.055,fade*u_night*flux*.00055*pow(1.20,bucket))*u_densityScreen;
    gl_PointSize=max(1.5,(13.0+bucket*.55)*u_point*u_densityScreen);v_col=a_col;v_densityLayer=1.0;return;
  }
  float faint=max(0.0,mag-6.5),lodFlux=mag>6.5?min(1.65,pow(stride,.22)):1.0;
  float telescope=u_real>.5?min(2.45,1.0+.62*log(max(1.0,u_lod.z))/log(2.0)):1.0;
  float alpha=mag<2.0?.98:mag<3.5?.88:mag<5.0?.68:mag<6.5?.48:max(.035,.30*pow(10.0,-.18*faint))*lodFlux*telescope;
  /* Im Lagemodus bleibt auch die gegenueberliegende Himmelshalbkugel sichtbar.
     Wie in Build 20260809s bekommt sie eine gedimmte Ersatzhelligkeit, statt
     entweder voll hell oder komplett unsichtbar zu werden. */
  float extinction=sinAlt<=0.0?(u_allowBelow>.5?.75:0.0):pow(10.0,-.092*(1.0/max(.02,sinAlt)-1.0));
  v_alpha=alpha*extinction*u_night;
  float radius=mag<2.0?1.94:mag<3.5?1.63:mag<5.0?1.35:mag<6.5?1.13:max(.60,.90-.069*faint);
  gl_PointSize=max(1.0,2.0*radius*u_point);v_col=a_col;v_densityLayer=0.0;
}`);
    const fs=_gaiaGLShader(gl,gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 v_col;varying float v_alpha;varying float v_densityLayer;
void main(){vec2 q=gl_PointCoord-.5;float d=dot(q,q);if(d>.25)discard;float edge=v_densityLayer>.5?exp(-d*10.0):smoothstep(.25,.12,d);gl_FragColor=vec4(v_col,v_alpha*edge);}`);
    const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||"Gaia-Programm");
    c.id="gaia-gl-layer";c.setAttribute("aria-hidden","true");Object.assign(c.style,{position:"absolute",inset:"0",width:"100%",height:"100%",zIndex:"2",pointerEvents:"none"});wrap.appendChild(c);
    _gaiaGL.canvas=c;_gaiaGL.gl=gl;_gaiaGL.program=p;_gaiaGL.loc={};window.__gaiaGpuStatus={active:false,ready:true,count:0,fallback:false};document.documentElement.dataset.gaiaGpu="ready";
    for(const n of["a_pos","a_mag","a_col","a_id","a_density","u_m0","u_m1","u_m2","u_lst","u_phi","u_view","u_camera","u_screen","u_clip","u_cull","u_lod","u_real","u_allowBelow","u_point","u_night","u_densityScreen"])_gaiaGL.loc[n]=n[0]==="a"?gl.getAttribLocation(p,n):gl.getUniformLocation(p,n);
    return true;
  }catch(e){console.warn("Gaia WebGL Fallback:",e);window.__gaiaGpuStatus={active:false,ready:false,count:0,fallback:true,error:String(e)};document.documentElement.dataset.gaiaGpu="fallback";_gaiaGL.failed=true;return false}
}
function _gaiaGLColor(bp){const st=[[-1,170,200,255],[0,205,222,255],[.6,240,244,255],[1,255,246,220],[1.6,255,211,160],[2.5,255,166,105],[5,255,137,92]];let a=st[0],b=st[st.length-1];for(let j=1;j<st.length;j++)if(bp<=st[j][0]){a=st[j-1];b=st[j];break}const t=Math.max(0,Math.min(1,(bp-a[0])/(b[0]-a[0]||1))),m=.72;return[1+(a[1]+(b[1]-a[1])*t-255)/255*m,1+(a[2]+(b[2]-a[2])*t-255)/255*m,1+(a[3]+(b[3]-a[3])*t-255)/255*m]}
function _gaiaGLUpload(G){
  if(!_gaiaGLInit()||!G||!G.N)return null;const vorhanden=_gaiaGL.buffers.get(G);if(vorhanden)return vorhanden;
  try{const gl=_gaiaGL.gl,stride=9,data=new Float32Array(G.N*stride);let zk=0;
    for(let i=0;i<G.N;i++){
      if(G.densityLayer){const o=i*stride,j=i*3,bucket=G.bucket[i];data[o]=G.v[j];data[o+1]=G.v[j+1];data[o+2]=G.v[j+2];data[o+3]=bucket;data[o+4]=.65;data[o+5]=.72;data[o+6]=.86;data[o+7]=i%16777213;data[o+8]=-G.flux;continue;}
      while(zk+1<G.verz.length&&i>=G.verz[zk+1])zk++;
      let x,y,z;if(G.vector){x=G.vx[i];y=G.vy[i];z=G.vz[i]}else{const ra=G.ra[i]*(360/4294967296)*Math.PI/180,de=G.de[i]*(90/2147483648)*Math.PI/180,cd=Math.cos(de);x=cd*Math.cos(ra);y=cd*Math.sin(ra);z=Math.sin(de)}
      const mag=G.magMin+G.mg[i]*G.magStep,bp=G.fb?(-1+(G.fb[i]>>3)/31*6):.65,c=_gaiaGLColor(bp),a=G.verz[zk],b=G.verz[zk+1],density=Math.max(1,Math.min(8,Math.sqrt((b-a)/180))),o=i*stride;
      data[o]=x;data[o+1]=y;data[o+2]=z;data[o+3]=mag;data[o+4]=c[0];data[o+5]=c[1];data[o+6]=c[2];data[o+7]=((Math.imul(i+1,2654435761)^Math.imul(zk+1,2246822519))>>>0)%16777213;data[o+8]=density;
    }
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const eintrag={buffer,count:G.N,density:!!G.densityLayer};_gaiaGL.buffers.set(G,eintrag);return eintrag;
  }catch(e){console.warn("Gaia GPU-Puffer Fallback:",e);_gaiaGL.failed=true;return null}
}
function _gaiaGLHide(){if(_gaiaGL.canvas)_gaiaGL.canvas.style.display="none"}
function _gaiaGLDraw(kataloge,o){
  const eintraege=[];if(o.density){const de=_gaiaGLUpload(o.density);if(de)eintraege.push(de)}for(const G of kataloge||[]){const e=_gaiaGLUpload(G);if(e)eintraege.push(e)}if(!eintraege.length)return false;
  try{const gl=_gaiaGL.gl,c=_gaiaGL.canvas;c.style.display="block";if(c.width!==cvW||c.height!==cvH){c.width=cvW;c.height=cvH}gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(_gaiaGL.program);
    const L=_gaiaGL.loc,S=9*4,attr=(n,size,off)=>{gl.enableVertexAttribArray(L[n]);gl.vertexAttribPointer(L[n],size,gl.FLOAT,false,S,off*4)};
    gl.uniform3f(L.u_m0,o.M.m00,o.M.m01,o.M.m02);gl.uniform3f(L.u_m1,o.M.m10,o.M.m11,o.M.m12);gl.uniform3f(L.u_m2,o.M.m20,o.M.m21,o.M.m22);gl.uniform2f(L.u_lst,o.cosLST,o.sinLST);gl.uniform2f(L.u_phi,o.sinPhi,o.cosPhi);
    gl.uniform4f(L.u_view,o.panX,o.panY,o.twoOverPiR,o.rf2);gl.uniform4f(L.u_camera,o.rsA,o.rcA,o.rcc,o.rsc);gl.uniform4f(L.u_screen,o.ORX,o.ORY,cvW,cvH);gl.uniform4f(L.u_clip,o.vx0,o.vx1,o.vy0,o.vy1);gl.uniform4f(L.u_cull,o.cullX,o.cullY,o.cullZ,o.cullCos);gl.uniform3f(L.u_lod,o.lim,o.stride,o.zoom);gl.uniform1f(L.u_real,o.real?1:0);gl.uniform1f(L.u_allowBelow,o.allowBelow?1:0);gl.uniform1f(L.u_point,o.point);gl.uniform1f(L.u_night,o.night);gl.uniform1f(L.u_densityScreen,o.densityScreen==null?1:o.densityScreen);
    gl.enable(gl.BLEND);let gesamt=0;for(const e of eintraege){gl.blendFunc(gl.SRC_ALPHA,e.density?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.bindBuffer(gl.ARRAY_BUFFER,e.buffer);attr("a_pos",3,0);attr("a_mag",1,3);attr("a_col",3,4);attr("a_id",1,7);attr("a_density",1,8);gl.drawArrays(gl.POINTS,0,e.count);gesamt+=e.count}
    /* Im Lagemodus muessen Gaia, Sterne, Linien, Namen und Horizont denselben
       Kamerastand zeigen. Die Gaia-Ebene ist ein separates WebGL-Canvas; ein
       blosses flush() kann deshalb erst beim folgenden Browser-Compositing
       sichtbar werden, waehrend das 2D-Canvas schon die neue Lage zeigt. Nur
       hier warten wir auf den Abschluss des GPU-Bildes. Andere Modi behalten
       den schnelleren asynchronen Pfad. */
    if(orientMode)gl.finish();else gl.flush();
    _gaiaGL.count=gesamt;window.__gaiaGpuStatus={active:true,ready:true,count:gesamt,fallback:false};document.documentElement.dataset.gaiaGpu="active-"+gesamt;return true;
  }catch(e){console.warn("Gaia WebGL Render-Fallback:",e);_gaiaGLHide();_gaiaGL.failed=true;return false}
}
let _gaiaStufen=null,_gaiaManifestVersion=1,_gaiaStufeIndex=-1,_gaiaStufeLaedt=false,_gaiaStufeFehlerBis=0;
let _gaiaStream=null,_gaiaStreamLevel=null,_gaiaStreamTick=0;
let _gaiaDichte=null;
const GAIA_STREAM_CACHE_MAX=24;
const _gaiaKacheln=new Map(),_gaiaKachelnLaden=new Set();
let _gaiaTileWorker=null,_gaiaTileJob=0;const _gaiaTileJobs=new Map();
function _gaiaKachelAusWorker(t){return {N:t.count,magMin:t.magnitudeMinimum,magStep:t.magnitudeStep,gRA:t.gridRa,gDE:t.gridDec,verz:new Uint32Array(t.offsets),vx:new Float32Array(t.x),vy:new Float32Array(t.y),vz:new Float32Array(t.z),mg:new Uint8Array(t.magnitude),fb:new Uint8Array(t.color),vector:true}}
function _gaiaKachelDekodieren(buf){
  if(typeof Worker!=="function")return Promise.resolve(gaiaVektorKachelLesen(buf));
  if(!_gaiaTileWorker){
    _gaiaTileWorker=new Worker("./src/workers/gaiaTileWorker.js",{type:"module"});
    _gaiaTileWorker.onmessage=e=>{const j=_gaiaTileJobs.get(e.data.id);if(!j)return;_gaiaTileJobs.delete(e.data.id);e.data.error?j.nein(new Error(e.data.error)):j.ok(_gaiaKachelAusWorker(e.data.tile))};
    _gaiaTileWorker.onerror=e=>{for(const j of _gaiaTileJobs.values())j.nein(new Error(e.message||"Gaia-Kachelworker"));_gaiaTileJobs.clear();try{_gaiaTileWorker.terminate()}catch(_){}_gaiaTileWorker=null};
  }
  return new Promise((ok,nein)=>{const id=++_gaiaTileJob;_gaiaTileJobs.set(id,{ok,nein});_gaiaTileWorker.postMessage({id,buffer:buf},[buf])});
}
function _gaiaStreamBudget(){const p=window.__devicePerformanceProfile&&window.__devicePerformanceProfile.level;return p==="low"?{parallel:2,cache:14}:p==="high"?{parallel:6,cache:36}:{parallel:4,cache:24}}
/* Die Standortgrenze gilt ausschliesslich fuer das unbewaffnete Auge bei 1x.
   Sobald vergroessert wird, begrenzen Stadt/Land/dunkel den Teleskopkatalog
   nicht mehr. Die logarithmische Staffelung dient nur dem progressiven
   Nachladen: bei 10x ist die tiefste lokal verfuegbare Gaia-Stufe erreicht. */
function _planetGaiaMaximum(){return (window.skyMagBase||6.5)>=6.49}
function _gaiaGrenzmag(z){
  const m=Math.max(1,z||1),basis=window.skyMagBase||6.5;
  const stufen=_gaiaStream&&Array.isArray(_gaiaStream.levels)?_gaiaStream.levels:null;
  const katalogMax=stufen&&stufen.length?stufen[stufen.length-1].magnitude:11.5;
  /* "dunkel" ist in dieser Anwendung ausdruecklich unbegrenzt: keine
     Lichtverschmutzungs- oder Augen-Grenzgroesse, sondern alle lokal
     vorhandenen Gaia-Sterne des sichtbaren Ausschnitts. */
  if(_planetGaiaMaximum()||basis>=6.49)return katalogMax;
  if(m<=1.001)return basis;
  const anteil=Math.max(0,Math.min(1,Math.log10(m)));
  return 6.5+(katalogMax-6.5)*anteil;
}
function _gaiaDB(){
  return new Promise((ok,nein)=>{
    if(!window.indexedDB)return nein(new Error("kein IndexedDB"));
    const a=indexedDB.open("planetarium-gaia",1);
    a.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains("kat"))db.createObjectStore("kat")};
    a.onsuccess=e=>ok(e.target.result); a.onerror=()=>nein(a.error);
  });
}
function _gaiaHolen(){
  return _gaiaDB().then(db=>new Promise((ok,nein)=>{
    const t=db.transaction("kat","readonly").objectStore("kat").get("kompakt");
    t.onsuccess=()=>ok(t.result||null); t.onerror=()=>nein(t.error);
  }));
}
function _gaiaSichern(buf){
  return _gaiaDB().then(db=>new Promise((ok,nein)=>{
    const t=db.transaction("kat","readwrite");
    t.objectStore("kat").put(buf,"kompakt");
    t.oncomplete=()=>ok(true); t.onerror=()=>nein(t.error);
  }));
}
function _gaiaSetzen(buf,sichern){
  const K=gaiaLesen(buf);
  /* Zwischenspeicher für die präzedierten Örter. Gespeichert wird nicht Rektaszension
     und Deklination, sondern unmittelbar der Einheitsvektor im Äquatorsystem. Damit
     entfallen in der Zeichenschleife sämtliche Winkelfunktionen bis auf ein acos:
     Höhe und Richtung ergeben sich aus Skalarprodukten mit Sternzeit und Breite. */
  K.ex=new Float32Array(K.N);K.ey=new Float32Array(K.N);K.ez=new Float32Array(K.N);
  /* Die Katalogtiefe wird aus den Daten selbst bestimmt, nicht angenommen. Der schlichte
     Höchstwert taugt dafür nicht: Gespeichert wird nicht die G-Helligkeit, sondern die
     daraus umgerechnete visuelle. Der Zuschlag dieser Umrechnung wächst mit dem Quadrat
     des Farbindex und erreicht bei sehr roten Sternen über vier Größenklassen — aus einem
     Katalog bis G=10 wird dann ein Höchstwert von fast 14,4, obwohl das nur eine Handvoll
     Ausreißer betrifft. Stattdessen wird die Stufe gesucht, ab der die Sternzahl je
     Helligkeitsstufe zusammenbricht: die letzte Stufe, die noch mindestens ein Hundertstel
     der bestbesetzten erreicht. Bei einem helligkeitsbegrenzten Katalog steigen die Zahlen
     bis zur Grenze steil an und fallen dahinter schlagartig ab, sodass diese Stelle die
     tatsächliche Tiefe trifft. */
  {const hist=new Uint32Array(256);
   for(let i=0;i<K.N;i++)hist[K.mg[i]]++;
   /* 99-Prozent-Quantil: die Stufe, unterhalb derer 99 Prozent aller Sterne liegen.
      Das ist unabhaengig von der Form der Verteilung deutbar und laesst genau den
      roten Auslaeufer aussen vor, den die Farbumrechnung erzeugt. */
   const grenze=K.N*0.99; let summe=0,stufe=0;
   for(let i=0;i<256;i++){summe+=hist[i];if(summe>=grenze){stufe=i;break}}
   K.magMax=K.magMin+stufe*K.magStep;
   let mx=0;for(let i=0;i<K.N;i++){const v=K.mg[i];if(v>mx)mx=v}
   K.magHoechst=K.magMin+mx*K.magStep;}
  gaiaPrecCursor=0;gaiaPrecTargetYear=null;
  /* Bei Sichtfeld-Streaming beschreibt magMax die gemeinsam erreichbare Tiefe
     aus Grundkatalog und Kacheln, nicht nur die gerade geladene Basisdatei. */
  if(_gaiaStream&&Array.isArray(_gaiaStream.levels)&&_gaiaStream.levels.length)
    K.magMax=_gaiaStream.levels.at(-1).magnitude;
  _GAIA=K;
  try{if(typeof showToast==="function")showToast("Gaia DR3 geladen: "+K.N.toLocaleString("de-DE")+" Sterne");}catch(e){}
  const b=document.getElementById("gaia-dlg");if(b)b.classList.remove("open");
  try{const gb=document.getElementById("gaia-btn");
    if(gb){gb.classList.add("on");gb.textContent="✦ Gaia ✓";
      gb.title="Gaia DR3 geladen: "+K.N.toLocaleString("de-DE")+" Sterne";}}catch(e){}
  try{_gaiaHaufenZaehlen()}catch(e){}
  if(sichern)_gaiaSichern(buf).catch(()=>{});
  try{if(typeof draw==="function"&&W)draw()}catch(e){}
  return K;
}
/* Offene Sternhaufen sind in Gaia wirklich aufgelöst — die Plejaden mit 152,
   die Hyaden mit 249 und h+χ Persei mit 104 Sternen bis 10 mag. Sobald genug
   Mitglieder gezeichnet werden, ist das Sinnbild überflüssig und wird
   weggelassen. Galaxien, Nebel und Kugelsternhaufen behalten es, weil dort
   nichts an seine Stelle treten kann: Kugelhaufen beginnen erst bei etwa
   12 mag, für M13 liefert der Katalog null Sterne. */
let _gaiaHaufen=null;
function _gaiaHaufenZaehlen(){
  _gaiaHaufen=null;
  try{
    if(!_GAIA||typeof MESSIER==="undefined"||!MESSIER)return;
    const K=_GAIA,R=Math.PI/180,karte=Object.create(null);
    for(let q=0;q<MESSIER.length;q++){
      const o=MESSIER[q];
      if(o.t!=="o"&&o.t!=="a")continue;
      const rad=(o.t==="a")?1.5:0.75, radA=rad*2.2;
      let n=0,nRing=0;
      let ri=Math.floor((((o.ra%24)+24)%24)/24*K.gRA); if(ri>=K.gRA)ri=K.gRA-1;
      let di=Math.floor((o.de+90)/180*K.gDE); if(di>=K.gDE)di=K.gDE-1; if(di<0)di=0;
      for(let dr=-1;dr<=1;dr++)for(let dd=-1;dd<=1;dd++){
        const r2=((ri+dr)%K.gRA+K.gRA)%K.gRA, d2=di+dd;
        if(d2<0||d2>=K.gDE)continue;
        const k=d2*K.gRA+r2;
        for(let i=K.verz[k];i<K.verz[k+1];i++){
          const de=K.de[i]*(90/2147483648);
          const dv=de-o.de; if(dv>radA||dv<-radA)continue;
          const ra=K.ra[i]*(360/4294967296)/15;
          const dl=(((ra-o.ra)%24+36)%24-12)*15*Math.cos((de+o.de)/2*R);
          const q=dl*dl+dv*dv;
          if(q<=rad*rad)n++; else if(q<=radA*radA)nRing++;
        }
      }
      /* Nur wenn die Dichte im Objekt deutlich über der Umgebung liegt, ist der
         Haufen als solcher aufgelöst. Sonst zählt man bloß Feldsterne der
         Milchstraße mit — M73 besteht aus vier Sternen, hat aber 72 im Umkreis. */
      const flIn=rad*rad, flRing=radA*radA-rad*rad;
      const dIn=n/flIn, dRing=nRing/(flRing||1);
      karte[o.m]=(dRing>0&&dIn/dRing>=2.2)?n:0;
    }
    _gaiaHaufen=karte;
  }catch(e){_gaiaHaufen=null}
}
function _gaiaErsetzt(o,zEff){
  if(!_GAIA||!_gaiaHaufen||!o)return false;
  if(o.t!=="o"&&o.t!=="a")return false;
  /* M24 behaelt seine Beschriftung und Auswahlflaeche; nur sein synthetischer
     Leuchtfleck wird in drawGestalt unterdrueckt. */
  if(o.m===24)return false;
  if(!((_gaiaHaufen[o.m]|0)>=12))return false;
  if(!(zEff>=3))return false;
  const bg=Math.min(15.5,_gaiaGrenzmag(zEff));
  return bg>=8;
}
function gaiaAusRoh(buf){
  const namen=typeof STARS!=="undefined"?STARS:null;
  if(typeof Worker!=="function"){
    const r=gaiaUmpacken(buf,GRID_RA,GRID_DEC,namen);
    return Promise.resolve(_gaiaSetzen(r.puffer,true));
  }
  return new Promise((ok,nein)=>{
    const worker=new Worker("./src/workers/gaiaWorker.js",{type:"module"});
    const fertig=()=>{try{worker.terminate()}catch(e){}};
    worker.onmessage=e=>{
      if(e.data&&e.data.error){fertig();nein(new Error(e.data.error));return}
      try{const k=_gaiaSetzen(e.data.buffer,true);fertig();ok(k)}catch(err){fertig();nein(err)}
    };
    worker.onerror=e=>{fertig();nein(new Error(e.message||"Gaia-Worker fehlgeschlagen"))};
    worker.postMessage({buffer:buf,gridRa:GRID_RA,gridDec:GRID_DEC,namedStars:namen},[buf]);
  });
}
function _gaiaAltStart(){
  _gaiaHolen().then(buf=>{
    if(buf&&buf.byteLength>64){try{_gaiaSetzen(buf,false);return}catch(e){}}
    /* Kein Vorrat: im Ordner der HTML-Datei nachsehen. Scheitert das, etwa bei
       file:// oder content://, geschieht nichts weiter – kein Fehlerhinweis. */
    /* Im Ordner der Seite nachsehen. GitHub unterscheidet Groß- und Kleinschreibung,
       deshalb mehrere Schreibweisen und beide Endungen. */
    const namen=["gaia_compact.bin","gaia_merged.bin","gaia_merged.txt","Gaia_merged.bin","Gaia_merged.txt",
                 "gaia.bin","gaia.txt","gaia/gaia_merged.bin","gaia/gaia_merged.txt"];
    const versuch=i=>{
      if(i>=namen.length)return;
      fetch(namen[i]).then(r=>r.ok?r.arrayBuffer():Promise.reject(new Error("HTTP "+r.status))).then(ab=>{
        try{_gaiaSetzen(ab,false);try{localStorage.setItem("gaiaURL",namen[i])}catch(e3){};return}catch(e){}
        gaiaAusRoh(ab).then(()=>{try{localStorage.setItem("gaiaURL",namen[i])}catch(e3){}}).catch(()=>versuch(i+1));
      }).catch(()=>versuch(i+1));
    };
    versuch(0);
  }).catch(()=>{});
}
function _gaiaStufeLaden(index){
  if(!_gaiaStufen||_gaiaStufeLaedt||Date.now()<_gaiaStufeFehlerBis||index<=_gaiaStufeIndex||index>=_gaiaStufen.length)return;
  _gaiaStufeLaedt=true;const stufe=_gaiaStufen[index];
  fetch(stufe.file+"?v="+_gaiaManifestVersion).then(r=>r.ok?r.arrayBuffer():Promise.reject(new Error("HTTP "+r.status))).then(ab=>{
    _gaiaSetzen(ab,false);_gaiaStufeIndex=index;
    try{const gb=document.getElementById("gaia-btn");if(gb){gb.textContent="✦ Gaia "+String(stufe.magnitude).replace(".",",")+"ᵐ";gb.title="Gaia DR3 bis "+stufe.magnitude+" mag: "+stufe.count.toLocaleString("de-DE")+" Sterne"}}catch(e){}
  }).catch(()=>{_gaiaStufeFehlerBis=Date.now()+10000}).finally(()=>{
    _gaiaStufeLaedt=false;
    /* Eine bereits laufende kleinere Stufe konnte einen inzwischen höheren
       Bedarf blockieren. Nach jedem Abschluss unmittelbar weiterstaffeln. */
    try{_gaiaStufenPruefen()}catch(e){}
  });
}
function _gaiaStufenPruefen(){
  if(!_gaiaStufen||_gaiaStufeLaedt)return;
  const z=typeof curMag==="function"?Math.max(1,curMag()):1;
  const bedarf=_gaiaGrenzmag(z);
  let ziel=0;while(ziel<_gaiaStufen.length-1&&_gaiaStufen[ziel].magnitude+1e-6<bedarf)ziel++;
  if(ziel>_gaiaStufeIndex)_gaiaStufeLaden(ziel);
}
function _gaiaStreamSetzen(streaming){
  _gaiaStream=streaming||null;_gaiaStreamLevel=null;_gaiaKacheln.clear();_gaiaKachelnLaden.clear();
  if(_gaiaStream&&Array.isArray(_gaiaStream.levels)){
    for(const level of _gaiaStream.levels){level.byKey=new Map((level.tiles||[]).map(t=>[t.y+":"+t.x,t]));}
  }
}
function _gaiaDichteLaden(meta){
  if(!meta||!meta.file)return;
  fetch(meta.file+"?v="+_gaiaManifestVersion).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(buf=>{
    const d=new DataView(buf),sig=String.fromCharCode(d.getUint8(0),d.getUint8(1),d.getUint8(2),d.getUint8(3));
    const version=d.getUint32(4,true);if(sig!=="GSMP"||(version!==2&&version!==3))throw new Error("Gaia-Flussformat");
    const n=d.getUint32(8,true),stride=d.getUint16(12,true),gRA=d.getUint16(14,true),gDE=d.getUint16(16,true);
    let o=32;const verz=new Uint32Array(buf,o,gRA*gDE+1);o+=4*(gRA*gDE+1);
    const v=new Float32Array(buf,o,n*3);o+=n*12;const light=new Float32Array(buf,o,n);o+=n*4;
    let max=0;for(let i=0;i<n;i++)if(light[i]>max)max=light[i];
    /* Die galaktische Gewichtung ist eine Eigenschaft der Katalogzelle und
       nicht der Kamera. Sie wurde bisher bei jedem Bild mit acos/asin/exp neu
       berechnet. Vorberechnet kostet sie nur noch einen Byte-Lookup je Zelle. */
    let boost;if(version>=3){boost=new Uint8Array(buf,o,gRA*gDE)}else{
      boost=new Uint8Array(gRA*gDE);const gcx=-.05487556,gcy=-.87343709,gcz=-.48383502,gpx=-.86766615,gpy=-.19807637,gpz=.45598378,mean=n/(gRA*gDE);
      for(let cell=0;cell<boost.length;cell++){
      const ri=cell%gRA,di=Math.floor(cell/gRA),ra=(ri+.5)/gRA*Math.PI*2,de=(di+.5)/gDE*Math.PI-Math.PI/2,cd=Math.cos(de);
      const x=cd*Math.cos(ra),y=cd*Math.sin(ra),z=Math.sin(de);
      const gc=Math.acos(Math.max(-1,Math.min(1,x*gcx+y*gcy+z*gcz)));
      const gb=Math.asin(Math.max(-1,Math.min(1,x*gpx+y*gpy+z*gpz)));
      const plane=Math.exp(-Math.pow(gb/(12*Math.PI/180),2)),bulge=Math.exp(-Math.pow(gc/(48*Math.PI/180),2));
      const density=Math.max(.7,Math.min(2.2,Math.pow(Math.max(.05,(verz[cell+1]-verz[cell])/mean),.28)));
        boost[cell]=Math.max(0,Math.min(5,Math.round(Math.log2((1+5.2*plane*bulge)*density)*2)));
      }
    }
    /* Die Leuchtdichte bekommt beim Laden ihre fertige GPU-Helligkeitsstufe.
       Damit entfallen im laufenden Zeitraffer sowohl die logarithmische
       Einordnung als auch der Aufbau von dreizehn Path2D-Sammelpfaden. */
    const bucket=new Uint8Array(n);for(let cell=0;cell<gRA*gDE;cell++){const dichteStufe=boost?boost[cell]:0;for(let i=verz[cell];i<verz[cell+1];i++)bucket[i]=Math.min(12,Math.max(0,Math.floor(Math.log2(1+light[i])*1.45)+dichteStufe))}
    _gaiaDichte={n,N:n,v,light,max,stride,gRA,gDE,verz,boost,bucket,flux:Math.sqrt(Math.max(1,stride||1)),sample:true,densityLayer:true};if(typeof draw==="function"&&W)draw();
  }).catch(()=>{});
}
/* Sichtfeld-Streaming wie Frustum-Culling in einer Spiele-Engine: Nur die
   30-Grad-Kacheln, welche die vom Renderer bereits ermittelten Rasterzellen
   enthalten, werden angefordert. Ein kleiner LRU-Vorrat beschleunigt schnelles
   Zurueckschwenken; waehrend der Geste werden keine neuen Downloads begonnen. */
function _gaiaStreamPruefen(zellen,bedarf){
  if(!_gaiaStream||!Array.isArray(zellen)||!zellen.length)return;
  if(typeof interacting!=="undefined"&&interacting>0)return;
  const levels=_gaiaStream.levels||[];
  if(bedarf<=(_gaiaStream.baseMagnitude||10)+.05){_gaiaStreamLevel=null;_gaiaKacheln.clear();return;}
  let level=levels.find(l=>l.magnitude+.001>=bedarf)||levels.at(-1);if(!level)return;
  if(_gaiaStreamLevel!==level.magnitude){_gaiaStreamLevel=level.magnitude;_gaiaKacheln.clear();_gaiaKachelnLaden.clear();}
  const gRa=_gaiaStream.groupRa||4,gDe=_gaiaStream.groupDec||4,wanted=new Set(),budget=_gaiaStreamBudget();
  for(const cell of zellen){const ri=cell%GRID_RA,di=Math.floor(cell/GRID_RA);wanted.add(Math.floor(di/gDe)+":"+Math.floor(ri/gRa));}
  for(const key of wanted){
    const cached=_gaiaKacheln.get(key);if(cached){cached.used=++_gaiaStreamTick;continue;}
    if(_gaiaKachelnLaden.has(key)||_gaiaKachelnLaden.size>=budget.parallel)continue;
    const tile=level.byKey&&level.byKey.get(key);if(!tile)continue;
    _gaiaKachelnLaden.add(key);
    fetch(tile.file+"?v="+_gaiaManifestVersion).then(r=>r.ok?r.arrayBuffer():Promise.reject(new Error("HTTP "+r.status))).then(_gaiaKachelDekodieren).then(katalog=>{
      if(_gaiaStreamLevel===level.magnitude){
        _gaiaKacheln.set(key,{catalog:katalog,used:++_gaiaStreamTick});
        if(_gaiaKacheln.size>budget.cache){
          const alt=[..._gaiaKacheln.entries()].filter(([k])=>!wanted.has(k)).sort((a,b)=>a[1].used-b[1].used)[0];
          if(alt)_gaiaKacheln.delete(alt[0]);
        }
        if(typeof draw==="function"&&W)draw();
      }
    }).catch(()=>{}).finally(()=>_gaiaKachelnLaden.delete(key));
  }
  /* Wie Karten-Engines werden direkte Nachbarn erst nach dem sichtbaren Satz und
     nur im Leerlauf vorgeladen. Sie konkurrieren nie mit einer Schwenkgeste. */
  if(typeof requestIdleCallback==="function"&&interacting<=0&&window.__skyRenderQuality!==0){const levelNow=level,visible=new Set(wanted);requestIdleCallback(()=>{
    if(_gaiaStreamLevel!==levelNow.magnitude||interacting>0)return;
    const neighbours=new Set();for(const key of visible){const[y,x]=key.split(":").map(Number);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=(x+dx+Math.ceil(GRID_RA/gRa))%Math.ceil(GRID_RA/gRa),ny=y+dy;if(ny>=0&&ny<Math.ceil(GRID_DEC/gDe))neighbours.add(ny+":"+nx)}}
    for(const key of neighbours){if(_gaiaKacheln.has(key)||_gaiaKachelnLaden.has(key))continue;if(_gaiaKachelnLaden.size>=Math.max(1,budget.parallel-1))break;const tile=levelNow.byKey&&levelNow.byKey.get(key);if(!tile)continue;_gaiaKachelnLaden.add(key);fetch(tile.file+"?v="+_gaiaManifestVersion).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(_gaiaKachelDekodieren).then(katalog=>{if(_gaiaStreamLevel===levelNow.magnitude)_gaiaKacheln.set(key,{catalog:katalog,used:++_gaiaStreamTick})}).catch(()=>{}).finally(()=>_gaiaKachelnLaden.delete(key))}
  },{timeout:900})}
}
function _gaiaStreamFuerZelle(cell){
  if(!_gaiaStream||_gaiaStreamLevel==null)return null;
  const ri=cell%GRID_RA,di=Math.floor(cell/GRID_RA);
  const entry=_gaiaKacheln.get(Math.floor(di/(_gaiaStream.groupDec||4))+":"+Math.floor(ri/(_gaiaStream.groupRa||4)));
  if(entry){entry.used=++_gaiaStreamTick;return entry.catalog}return null;
}
function _gaiaStart(){
  if(_gaiaVersucht)return;_gaiaVersucht=true;
  fetch("gaia/manifest.json?v=8").then(r=>r.ok?r.json():Promise.reject()).then(m=>{
    if(!m||m.strategy!=="cumulative"||!Array.isArray(m.stages)||!m.stages.length)throw new Error("kein Stufenmanifest");
    _gaiaManifestVersion=m.version||1;_gaiaStufen=m.stages;_gaiaStreamSetzen(m.streaming);_gaiaDichteLaden(m.density);_gaiaStufeLaden(0);
  }).catch(()=>_gaiaAltStart());
}
/* Vorschlag für das Adressfeld: zuletzt erfolgreiche Adresse, sonst der Ordner
   der Seite, sonst der bloße Dateiname. In eingebetteten Ansichten hat die Seite
   keine brauchbare Grundadresse — dann ist die vollständige Adresse nötig. */
function _gaiaVorschlag(){
  try{const m=localStorage.getItem("gaiaURL");if(m)return m}catch(e){}
  try{
    const h=location.href.split("#")[0].split("?")[0];
    if(/^https?:/i.test(h))return h.replace(/[^/]*$/,"")+"gaia_merged.bin";
  }catch(e){}
  return "gaia_merged.bin";
}
/* Benennt die tatsächliche Ursache, statt jeden Fehlschlag als fehlende Kennung
   auszugeben. Häufigster Fall: die Adresse zeigt auf einen Ordner oder auf die
   HTML-Seite, dann liefert der Web-Dienst eine Webseite mit Erfolgsmeldung. */
function _gaiaDeuten(ab){
  try{
    const n=ab.byteLength;
    if(n<64)return "Die Adresse liefert nur "+n+" Byte — das ist keine Katalogdatei.";
    const u=new Uint8Array(ab,0,Math.min(256,n));
    let kopf=""; for(let i=0;i<Math.min(80,u.length);i++)kopf+=String.fromCharCode(u[i]);
    if(kopf.slice(0,4)==="GDR3")return null;
    if(/^\s*\uFEFF?\s*</.test(kopf)||/<!DOCTYPE|<html/i.test(kopf))
      return "Die Adresse liefert eine Webseite statt der Katalogdatei. Sie muss auf gaia_merged.bin selbst enden, nicht auf einen Ordner.";
    if(/^version https:\/\/git-lfs/.test(kopf))
      return "Die Adresse liefert einen Git-LFS-Verweis statt der Datei. Der Katalog muss ohne LFS abgelegt sein.";
    let hex=""; for(let i=0;i<4;i++)hex+=("0"+u[i].toString(16)).slice(-2)+" ";
    return "Keine GDR3-Kennung. Erste Bytes: "+hex.trim()+", Größe "+(n/1048576).toFixed(1)+" MB.";
  }catch(e){return "Die Datei ist kein lesbarer Gaia-Katalog."}
}
/* Nimmt sowohl die Rohdatei als auch eine bereits umgepackte Datei an. */
function _gaiaAnnehmen(ab,u){
  const merken=()=>{if(u){try{localStorage.setItem("gaiaURL",u)}catch(e){}}};
  try{_gaiaSetzen(ab,true);merken();return true}catch(e2){}
  try{
    const sig=String.fromCharCode(...new Uint8Array(ab,0,4));
    if(sig==="GDR3"&&ab.byteLength===16+new DataView(ab).getUint32(8,true)*36){
      gaiaAusRoh(ab).then(()=>merken()).catch(err=>{try{showToast(err.message||"Gaia-Katalog konnte nicht verarbeitet werden")}catch(e){}});
      return true;
    }
  }catch(e1){}
  let t=_gaiaDeuten(ab);
  if(!t){
    try{const dv=new DataView(ab),N=dv.getUint32(8,true);
      t="Kennung stimmt, aber die Länge passt nicht: "+N.toLocaleString("de-DE")+" Sätze erwarten "+(16+N*36).toLocaleString("de-DE")+" Byte, vorhanden sind "+ab.byteLength.toLocaleString("de-DE")+". Die Datei ist wohl unvollständig übertragen.";
    }catch(e){t="Die Datei ist kein lesbarer Gaia-Katalog."}
  }
  try{showToast(t)}catch(e){}
  return false;
}
function gaiaDialog(){
  if(_GAIA||_gaiaGefragt)return; _gaiaGefragt=true;
  let d=document.getElementById("gaia-dlg");
  if(!d){
    d=document.createElement("div");d.id="gaia-dlg";
    d.innerHTML='<div class="gd-box"><div class="gd-txt">Für diese Vergrößerung kann der echte Gaia-DR3-Sternkatalog geladen werden.</div>'+
      '<div class="gd-hin">In eingebetteten Ansichten mancher Apps steht die Dateiauswahl nicht zur Verfügung. Dann hilft die Adresse — oder die Datei neben die HTML-Datei legen, sie wird dann beim Start von selbst gefunden.</div>'+
      '<div class="gd-adr"><input type="text" class="gd-url" value="'+_gaiaVorschlag()+'" spellcheck="false" autocapitalize="off" autocorrect="off">'+
      '<button type="button" class="gd-laden">Laden</button></div>'+
      '<div class="gd-btns"><button type="button" class="gd-ja">Datei auswählen</button>'+
      '<button type="button" class="gd-nein">Später</button></div>'+
      '<input type="file" class="gd-datei"></div>';
    document.body.appendChild(d);
    const inp=d.querySelector(".gd-datei");
    /* Wie beim Kreuz der Didaktikansicht: verwirft der Browser das Zeigerereignis,
       weil er die Berührung zunächst für den Beginn einer Wischgeste hält, käme
       ein reiner click-Empfänger nie zum Zug. Beide Wege lösen aus, eine Sperre
       verhindert doppeltes Auslösen. Das Öffnen der Dateiauswahl geschieht dabei
       innerhalb der Benutzergeste, wie es die Browser verlangen. */
    let _gLock=0;
    const _gBind=(el,fn)=>{
      const h=e=>{
        if(e){e.preventDefault();e.stopPropagation();}
        const t=Date.now(); if(t-_gLock<600)return; _gLock=t;
        try{fn()}catch(err){}
      };
      el.onpointerdown=h; el.onclick=h;
    };
    _gBind(d.querySelector(".gd-ja"),()=>inp.click());
    _gBind(d.querySelector(".gd-nein"),()=>d.classList.remove("open"));
    _gBind(d.querySelector(".gd-laden"),()=>{
      const u=(d.querySelector(".gd-url").value||"").trim();
      if(!u)return;
      try{showToast("Katalog wird geladen …")}catch(e){}
      fetch(u).then(r=>r.ok?r.arrayBuffer():Promise.reject(new Error("HTTP "+r.status))).then(ab=>{
        _gaiaAnnehmen(ab,u);
      }).catch(err=>{
        const rel=!/^https?:/i.test(u);
        const txt=rel
          ? "Nicht gefunden. In einer eingebetteten Ansicht ist die vollständige Adresse nötig, etwa https://ihr-name.github.io/Planetarium/gaia_merged.bin"
          : "Nicht erreichbar: "+(err&&err.message?err.message:u);
        try{showToast(txt)}catch(e2){}
      });
    });
    d.onpointerdown=e=>{if(e.target===d){e.preventDefault();d.classList.remove("open")}};
    inp.onchange=()=>{
      const f=inp.files&&inp.files[0];if(!f)return;
      const fr=new FileReader();
      fr.onload=()=>{_gaiaAnnehmen(fr.result,null)};
      fr.readAsArrayBuffer(f);
    };
  }
  d.classList.add("open");
}
/* Nach „Später“ oder einem Tipp auf den Hintergrund bliebe der Dialog sonst für
   immer verschlossen. Über das Bedienfeld lässt er sich wieder öffnen. */
function gaiaDialogZeigen(){
  if(_GAIA){try{showToast("Gaia DR3 ist geladen: "+_GAIA.N.toLocaleString("de-DE")+" Sterne")}catch(e){}return}
  _gaiaGefragt=false; gaiaDialog();
}
window.gaiaDialog=gaiaDialog;window.gaiaAusRoh=gaiaAusRoh;window.gaiaDialogZeigen=gaiaDialogZeigen;
try{if(document.readyState!=="loading")_gaiaStart();else document.addEventListener("DOMContentLoaded",_gaiaStart)}catch(e){}

let _starTier=0;const _STAR_TIERS=[{z:12,base:15},{z:24,base:16.5}];
let _tierJob=null;
function _tierStart(){
  if(_tierJob||_starTier>=_STAR_TIERS.length)return false;
  const t=_STAR_TIERS[_starTier];
  const d2r=Math.PI/180,r2d=180/Math.PI;
  const aNGP=192.85948*d2r,dNGP=27.12825*d2r,lNCP=122.93192*d2r;
  let seed=771131+_starTier*104729;
  _tierJob={
    i:0,total:60000,base:t.base,
    rnd:function(){seed=seed*1103515245+12345&2147483647;return seed/2147483647},
    gal2eq:function(l,b){l*=d2r;b*=d2r;const sd=Math.sin(dNGP)*Math.sin(b)+Math.cos(dNGP)*Math.cos(b)*Math.cos(lNCP-l);const dec=Math.asin(sd);const y=Math.cos(b)*Math.sin(lNCP-l);const x=Math.cos(dNGP)*Math.sin(b)-Math.sin(dNGP)*Math.cos(b)*Math.cos(lNCP-l);let ra=aNGP+Math.atan2(y,x);ra=(ra*r2d%360+360)%360;return[ra/15,dec*r2d]}
  };
  requestAnimationFrame(_tierStep);
  return true;
}
function _tierStep(){
  const j=_tierJob;if(!j)return;
  if(typeof interacting!=="undefined"&&interacting>0){requestAnimationFrame(_tierStep);return}
  const end=Math.min(j.total,j.i+2000);
  for(;j.i<end;j.i++){
    let ra,de;
    if(j.rnd()<.5){const l=j.rnd()*360;const b=(j.rnd()+j.rnd()+j.rnd()-1.5)*11;const p=j.gal2eq(l,b);ra=p[0];de=p[1]}
    else{ra=j.rnd()*24;de=Math.asin(j.rnd()*2-1)*180/Math.PI}
    const mg=j.base+1.5*Math.pow(j.i/j.total,.6);
    const st={ra:ra,de:de,mag:mg,pra:ra,pde:de};
    const rw=(ra%24+24)%24;
    const ri=Math.min(GRID_RA-1,Math.floor(rw/24*GRID_RA));
    const di=Math.min(GRID_DEC-1,Math.floor((de+90)/180*GRID_DEC));
    starGrid[di*GRID_RA+ri].push(st);
    BSC.push(st);
  }
  if(j.i>=j.total){
    _tierJob=null;_starTier++;
    try{if(typeof flashMsg==="function")flashMsg("Schwächere Sterne nachgeladen (bis "+(j.base+1.5).toFixed(1)+" mag)")}catch(e){}
    try{if(typeof draw==="function"&&W)draw()}catch(e){}
  }else requestAnimationFrame(_tierStep);
}
function loadStarTier(){return false/* Keine synthetischen Sternstufen: Gaia wird nach Helligkeit gefiltert. */}
window.loadStarTier=loadStarTier;
/* Sterne nur im Sichtfeld nachladen, zellenweise und verzoegert */
const _DEEP=[];
let _cellTier=null,_baseLen=null,_deepYear=null,_lastInteract=0;
function _deepInit(){
  _cellTier=new Uint8Array(GRID_RA*GRID_DEC);
  _baseLen=new Int32Array(GRID_RA*GRID_DEC);
  for(let k=0;k<starGrid.length;k++)_baseLen[k]=starGrid[k].length;
}
function _deepReset(){
  if(!_cellTier)return;
  for(let k=0;k<starGrid.length;k++)if(_cellTier[k]){starGrid[k].length=_baseLen[k];_cellTier[k]=0}
}
function _deepFill(k,level,jd){
  const t=_DEEP[level-1];if(!t)return;
  const ri=k%GRID_RA,di=Math.floor(k/GRID_RA);
  const ra0=ri/GRID_RA*24,ra1=(ri+1)/GRID_RA*24;
  const de0=di/GRID_DEC*180-90,de1=(di+1)/GRID_DEC*180-90;
  const midDe=(de0+de1)/2;
  let seed=(k*2654435761^level*97531)&2147483647;if(seed<=0)seed=k+level+1;
  const rnd=function(){seed=seed*1103515245+12345&2147483647;return seed/2147483647};
  const N=Math.max(120,Math.round(1100*Math.cos(midDe*Math.PI/180)));
  const cell=starGrid[k];
  const s0=Math.sin(de0*Math.PI/180),s1=Math.sin(de1*Math.PI/180);
  for(let i=0;i<N;i++){
    const ra=ra0+rnd()*(ra1-ra0);
    const de=Math.asin(s0+rnd()*(s1-s0))*180/Math.PI;
    const mg=t.base+t.span*Math.pow(i/N,.6);
    let pra=ra,pde=de;
    try{const pc=precess(ra,de,jd);pra=pc.ra;pde=pc.dec}catch(e){}
    cell.push({ra:ra,de:de,mag:mg,pra:pra,pde:pde});
  }
  _cellTier[k]=level;
}
function _deepStep(fb,jd,wantLevel){
  if(!_cellTier)_deepInit();
  if(!fb)return false;
  let di0=Math.floor((fb.dmin+90)/180*GRID_DEC)-1;
  let di1=Math.floor((fb.dmax+90)/180*GRID_DEC)+1;
  di0=Math.max(0,Math.min(GRID_DEC-1,di0));
  di1=Math.max(0,Math.min(GRID_DEC-1,di1));
  let a=Math.floor(fb.rmin/24*GRID_RA)-1,b=Math.floor(fb.rmax/24*GRID_RA)+1;
  const ris=[];
  const push=function(v){const w=((v%GRID_RA)+GRID_RA)%GRID_RA;if(ris.indexOf(w)<0)ris.push(w)};
  if(fb.wrap){for(let v=a;v<GRID_RA;v++)push(v);for(let v=0;v<=b;v++)push(v)}
  else{a=Math.max(0,a);b=Math.min(GRID_RA-1,b);for(let v=a;v<=b;v++)push(v)}
  const cand=[];
  const dC=(fb.dmin+fb.dmax)/2;
  const rC=fb.wrap?(((fb.rmin+fb.rmax+24)/2)%24):((fb.rmin+fb.rmax)/2);
  for(let di=di0;di<=di1;di++){
    for(let n=0;n<ris.length;n++){
      const ri=ris[n],k=di*GRID_RA+ri;
      if(_cellTier[k]>=wantLevel)continue;
      const cd=(di+.5)/GRID_DEC*180-90;
      const cr=(ri+.5)/GRID_RA*24;
      let dr=Math.abs(cr-rC);if(dr>12)dr=24-dr;
      cand.push([k,dr*15*Math.cos(cd*Math.PI/180)*(dr*15*Math.cos(cd*Math.PI/180))+(cd-dC)*(cd-dC)]);
    }
  }
  if(!cand.length)return false;
  cand.sort(function(a,b){return a[1]-b[1]});
  let done=0;
  for(let i=0;i<cand.length&&done<2;i++){const k=cand[i][0];_deepFill(k,_cellTier[k]+1,jd);done++}
  return done>0;
}
window._deepStep=_deepStep;window._deepReset=_deepReset;let moonImg=null,moonImgReady=false;function loadMoonImg(){try{const im=new Image;im.crossOrigin="anonymous";im.onload=()=>{moonImg=im;moonImgReady=true;if(typeof draw==="function"&&W)draw()};im.onerror=()=>{moonImgReady=false};im.src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Full_moon.png"}catch(e){}}if("requestIdleCallback"in window)requestIdleCallback(loadMoonImg,{timeout:4e3});else setTimeout(loadMoonImg,1800);(function warmMoonAlbedo(){const go=()=>{try{if(typeof moonAlbedoInit==="function")moonAlbedoInit()}catch(e){}};if("requestIdleCallback"in window)requestIdleCallback(go,{timeout:3e3});else setTimeout(go,1500)})();let issTLE=null,issLoading=false,issError=null,issNextCache=null,issNextCacheJD=0;const ISS_TLE_FALLBACK={l1:"1 25544U 98067A   26148.13113954  .00011691  00000-0  21663-3 0  9997",l2:"2 25544  51.6335  39.3887 0007375 106.1024 254.0777 15.49434162568649"};let panX=0,panY=0;let interacting=0;let clickable=[];let lastT=null,sliderActive=false;let tX=0,dX=0,dY=0,vX=0,tch={},pD0=1,pZ0=1,pFov0=90,pMid0X=0,pMid0Y=0,pPan0X=0,pPan0Y=0,gestureInHorizon=true;function currentJD(){return simJD(simDay,simMin)}let _lstCache={jd:null,lng:null,v:0};function LST(){const _lj=currentJD();if(_lstCache.jd===_lj&&_lstCache.lng===lng)return _lstCache.v;const _lv=((GAST(_lj)+lng)%360+360)%360;_lstCache={jd:_lj,lng:lng,v:_lv};return _lv}function topoRaDec(raH,decDeg,distKm,jd0){const sinPi=6378.14/distKm;const phi=lat*Math.PI/180;const u=Math.atan(.99664719*Math.tan(phi));const rhoSin=.99664719*Math.sin(u);const rhoCos=Math.cos(u);const lst=((GAST(jd0)+lng)%360+360)%360;const H=(lst-raH*15)*Math.PI/180;const dec=decDeg*Math.PI/180;const dRA=Math.atan2(-rhoCos*sinPi*Math.sin(H),Math.cos(dec)-rhoCos*sinPi*Math.cos(H));const raT=raH*15*Math.PI/180+dRA;const decT=Math.atan2((Math.sin(dec)-rhoSin*sinPi)*Math.cos(dRA),Math.cos(dec)-rhoCos*sinPi*Math.cos(H));return{ra:(raT*180/Math.PI/15+24)%24,dec:decT*180/Math.PI}}
function moonTopo(jd0){const mec=moonEcl(jd0),mrd=ecl2rd(mec.lon,mec.lat,jd0);const sinPi=6378.14/mec.dist;const phi=lat*Math.PI/180;const u=Math.atan(.99664719*Math.tan(phi));const rhoSin=.99664719*Math.sin(u);const rhoCos=Math.cos(u);const lst=((GAST(jd0)+lng)%360+360)%360;let H=(lst-mrd.ra*15)*Math.PI/180;const dec=mrd.dec*Math.PI/180;const dRA=Math.atan2(-rhoCos*sinPi*Math.sin(H),Math.cos(dec)-rhoCos*sinPi*Math.cos(H));const raT=mrd.ra*15*Math.PI/180+dRA;const decT=Math.atan2((Math.sin(dec)-rhoSin*sinPi)*Math.cos(dRA),Math.cos(dec)-rhoCos*sinPi*Math.cos(H));return{ra:(raT*180/Math.PI/15+24)%24,dec:decT*180/Math.PI,dist:mec.dist,lon:mec.lon,lat:mec.lat}}function moonAltAt(jd){const m=moonTopo(jd);const phi=lat*Math.PI/180,dec=m.dec*Math.PI/180;const lst=((GAST(jd)+lng)%360+360)%360;const H=(lst-m.ra*15)*Math.PI/180;return Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H))*180/Math.PI}function moonRiseSet(jdMid){const h0=.125;let rise=null,set=null,prev=moonAltAt(jdMid)-h0;for(let min=12;min<=1440;min+=12){const cur=moonAltAt(jdMid+min/1440)-h0;if(prev<0&&cur>=0&&rise===null){const f=prev/(prev-cur);rise=(min-12+f*12)/60}if(prev>=0&&cur<0&&set===null){const f=prev/(prev-cur);set=(min-12+f*12)/60}prev=cur}return{rise:rise,set:set}}function objAltAtJD(raH,decDeg,jd){const lstD=(GAST(jd)+lng)%360,H=(lstD-raH*15)*Math.PI/180,dr=decDeg*Math.PI/180,phi=lat*Math.PI/180;return Math.asin(Math.sin(phi)*Math.sin(dr)+Math.cos(phi)*Math.cos(dr)*Math.cos(H))*180/Math.PI}function objRiseTransitSet(raH,decDeg){const jd0=simJD(simDay,0),h0=-.5667;let rise=null,set=null,transit=null,tAlt=-91,prev=objAltAtJD(raH,decDeg,jd0)-h0;for(let min=12;min<=1440;min+=12){const jd=jd0+min/1440,alt=objAltAtJD(raH,decDeg,jd),cur=alt-h0;if(prev<0&&cur>=0&&rise===null){const f=prev/(prev-cur);rise=(min-12+f*12)/60}if(prev>=0&&cur<0&&set===null){const f=prev/(prev-cur);set=(min-12+f*12)/60}if(alt>tAlt){tAlt=alt;transit=min/60}prev=cur}return{rise:rise,set:set,transit:transit,maxAlt:tAlt}}let _mrsCache={key:null,val:{rise:null,set:null}};function moonRiseSetCached(){const key=simYear+"|"+simDay+"|"+Math.round(lat*100)+"|"+Math.round(lng*100)+"|"+utcOff;if(_mrsCache.key!==key)_mrsCache={key:key,val:moonRiseSet(simJD(simDay,0))};return _mrsCache.val}const VK_AS2R=4.848136811095359935899141e-6,VK_TAU=6.283185307179586476925287,VK_EPS0=84381.406*VK_AS2R,VK_PQPOL=[[5851.607687,-1600.886300],[-0.1189000,1.1689818],[-0.00028913,-0.00000020],[0.000000101,-0.000000437]],VK_PQPER=[[708.15,-5486.751211,-684.661560,667.666730,-5523.863691],[2309.00,-17.127623,2446.283880,-2354.886252,-549.747450],[1620.00,-617.517403,399.671049,-428.152441,-310.998056],[492.20,413.442940,-356.652376,376.202861,421.535876],[1183.00,78.614193,-186.387003,184.778874,-36.776172],[622.00,-180.732815,-316.800070,335.321713,-145.278396],[882.00,-87.676083,198.296701,-185.138669,-34.744450],[547.00,46.140315,101.135679,-120.972830,22.885731]],VK_XYPOL=[[5453.282155,-73750.930350],[0.4252841,-0.7675452],[-0.00037173,-0.00018725],[-0.000000152,0.000000231]],VK_XYPER=[[256.75,-819.940624,75004.344875,81491.287984,1558.515853],[708.15,-8444.676815,624.033993,787.163481,7774.939698],[274.20,2600.009459,1251.136893,1251.296102,-2219.534038],[241.45,2755.175630,-1102.212834,-1257.950837,-2523.969396],[2309.00,-167.659835,-2660.664980,-2966.799730,247.850422],[492.20,871.855056,699.291817,639.744522,-846.485643],[396.10,44.769698,153.167220,131.600209,-1393.124055],[288.90,-512.313065,-950.865637,-445.040117,368.526116],[231.10,-819.415595,499.754645,584.522874,749.045012],[1610.00,-538.071099,-145.188210,-89.756563,444.704518],[620.00,-189.793622,558.116553,524.429630,235.934465],[157.87,-402.922932,-23.923029,-13.549067,374.049623],[220.30,179.516345,-165.405086,-210.157124,-171.330180],[1200.00,-9.814756,9.344131,-44.919798,-22.899655]];let _precCache={jd:null,M:null,eps:null};function _vondrak(jd){if(_precCache.jd===jd)return _precCache;const T=(jd-2451545)/36525;let P=0,Q=0;for(let k=0;k<8;k++){const A=VK_TAU*T/VK_PQPER[k][0],S=Math.sin(A),C=Math.cos(A);P+=C*VK_PQPER[k][1]+S*VK_PQPER[k][3];Q+=C*VK_PQPER[k][2]+S*VK_PQPER[k][4];}let W=1;for(let k=0;k<4;k++){P+=VK_PQPOL[k][0]*W;Q+=VK_PQPOL[k][1]*W;W*=T;}P*=VK_AS2R;Q*=VK_AS2R;const Zp=Math.sqrt(Math.max(1-P*P-Q*Q,0)),Se=Math.sin(VK_EPS0),Ce=Math.cos(VK_EPS0);const pecl=[P,-Q*Ce-Zp*Se,-Q*Se+Zp*Ce];let X=0,Y=0;for(let k=0;k<14;k++){const A=VK_TAU*T/VK_XYPER[k][0],S=Math.sin(A),C=Math.cos(A);X+=C*VK_XYPER[k][1]+S*VK_XYPER[k][3];Y+=C*VK_XYPER[k][2]+S*VK_XYPER[k][4];}W=1;for(let k=0;k<4;k++){X+=VK_XYPOL[k][0]*W;Y+=VK_XYPOL[k][1]*W;W*=T;}X*=VK_AS2R;Y*=VK_AS2R;const Wq=X*X+Y*Y,peqr=[X,Y,Wq<1?Math.sqrt(1-Wq):0];const cx=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];let eqx=cx(peqr,pecl);const nn=Math.hypot(eqx[0],eqx[1],eqx[2])||1;eqx=[eqx[0]/nn,eqx[1]/nn,eqx[2]/nn];const mid=cx(peqr,eqx);const dp=Math.min(1,Math.max(-1,peqr[0]*pecl[0]+peqr[1]*pecl[1]+peqr[2]*pecl[2]));_precCache={jd:jd,M:[eqx,mid,peqr],m00:eqx[0],m01:eqx[1],m02:eqx[2],m10:mid[0],m11:mid[1],m12:mid[2],m20:peqr[0],m21:peqr[1],m22:peqr[2],eps:Math.acos(dp)};return _precCache;}function precess(raH,decD,jd){const _P=_vondrak(jd);const ra0=raH*15*Math.PI/180,dec0=decD*Math.PI/180,cd=Math.cos(dec0);const x=cd*Math.cos(ra0),y=cd*Math.sin(ra0),z=Math.sin(dec0);const xd=_P.m00*x+_P.m01*y+_P.m02*z,yd=_P.m10*x+_P.m11*y+_P.m12*z,zd=_P.m20*x+_P.m21*y+_P.m22*z;let ra=(Math.atan2(yd,xd)*180/Math.PI%360+360)%360;const dec=Math.atan2(zd,Math.hypot(xd,yd));return{ra:ra/15,dec:dec*180/Math.PI};}const STAR_PM={Sirius:[-.546,-1.223],Arktur:[-1.0939,-1.9971],Prokyon:[-.7164,-1.0344],Vega:[.2008,.287],Atair:[.5363,.3851],Pollux:[-.6256,-.0457],Capella:[.0756,-.4256],Aldebaran:[.0627,-.1888],Fomalhaut:[.3289,-.1641],Regulus:[-.2486,.0056],Kastor:[-.206,-.1485]};function applyPM(s,jd){const pm=s&&s.n?STAR_PM[s.n]:null;if(!pm)return{ra:s.ra,de:s.de};const dt=(jd-2451545)/365.25;const de=s.de+pm[1]*dt/3600;const cosd=Math.cos(s.de*Math.PI/180);const ra=s.ra+(Math.abs(cosd)>1e-4?pm[0]*dt/3600/cosd/15:0);return{ra:ra,de:de}}let starsPrecYear=null;
/* Eigenbewegung und Praezession fuer die benannten STARS werden jetzt nur noch einmal je
   simuliertem Jahr berechnet statt bei jedem Bild - dieselbe Ueberlegung, die fuer BSC und
   Gaia (bscPrecCursor/gaiaPrecCursor) schon galt: beide haengen nur an jd0 bzw. simYear und
   aendern sich innerhalb eines Jahres um Bruchteile einer Bogensekunde, unsichtbar wenig.
   Das Ergebnis wird direkt auf dem Sternobjekt zwischengespeichert (._pcra/._pcde/._pcy);
   da SM[name] auf dasselbe Objekt zeigt wie STARS, profitiert die Sternbildlinien-Zeichnung
   automatisch mit, ohne eigenen Zwischenspeicher. */
const PM_CACHE_DAYS=30;/* Schwelle statt Kalenderjahr-Grenze: Praezession bewegt einen Stern maximal rund 0,14 Bogensekunden pro Tag, die schnellste hinterlegte Eigenbewegung (Arktur) rund 0,045 Bogensekunden pro Tag - macht bei 30 Tagen zusammen hoechstens etwa 5,5 Bogensekunden Fehler, deutlich unter einem Bildschirmpixel bei ueblichem Zoom. Unabhaengig vom Kalenderjahr: greift auch bei einem Sprung ueber Jahre hinweg sofort und bei Zeitreisen rueckwaerts genauso wie vorwaerts (Betrag der jd-Differenz). */
function starPC(s,jd0){if(s._pcjd===undefined||Math.abs(jd0-s._pcjd)>=PM_CACHE_DAYS){const pp=applyPM(s,jd0);const pc=precess(pp.ra,pp.de,jd0);s._pcra=pc.ra;s._pcde=pc.dec;s._pcjd=jd0}return{ra:s._pcra,dec:s._pcde}}
/* Gleiches Prinzip wie starPC, aber fuer Objekte ohne Eigenbewegung (Sternbild- und
   Tierkreis-Beschriftungen): nur reine Praezession, an das Objekt selbst angehaengt
   (_pjra/_pjde/_pjy), pro simuliertem Jahr einmal berechnet statt pro Bild. Eigener
   Feldname-Präfix (_pj statt _pc), damit bei versehentlicher Objektwiederverwendung
   keine Verwechslung mit dem Eigenbewegungs-Cache von starPC entstehen kann. */
function precYearCache(o,raVal,deVal,jd0){if(o._pjjd===undefined||Math.abs(jd0-o._pjjd)>=PM_CACHE_DAYS){const pc=precess(raVal,deVal,jd0);o._pjra=pc.ra;o._pjde=pc.dec;o._pjjd=jd0}return{ra:o._pjra,dec:o._pjde}}let _phiLat=NaN,_phiSin=0,_phiCos=1;function altazXY(ra,dec,R){const lst=LST();let H=(lst-ra*15)*Math.PI/180;const dr=dec*Math.PI/180;if(_phiLat!==lat){_phiLat=lat;const _pr=lat*Math.PI/180;_phiSin=Math.sin(_pr);_phiCos=Math.cos(_pr)}const _sd=Math.sin(dr),_cd=Math.cos(dr);let alt=Math.asin(_phiSin*_sd+_phiCos*_cd*Math.cos(H));const altDeg=alt*180/Math.PI;if(altDeg>-1.5&&altDeg<15){const hh=altDeg;const Rraw=1/Math.tan((hh+7.31/(hh+4.4))*Math.PI/180);let taper=1;if(hh<-0.5){let t=(hh+1.5)/1.0;t=t<0?0:t>1?1:t;taper=t*t*(3-2*t)}if(hh>10){const t=(hh-10)/5;taper*=1-t*t*(3-2*t)}alt+=(Rraw*taper)/60*Math.PI/180}const A=Math.atan2(Math.sin(H),Math.cos(H)*_phiSin-(_sd/_cd)*_phiCos);if(viewMode==="real")return projReal(A,alt);const z=Math.PI/2-alt;const r=z/(Math.PI/2)*R;const x=r*Math.sin(A),y=r*Math.cos(A);return{x:x,y:y,alt:alt*180/Math.PI}}
let _camCache=[NaN,NaN,NaN,NaN,NaN,NaN,1,0,0,1,1];
/* Im Lagemodus wird auch unterhalb des Horizonts alles gezeichnet. Der Wert -999
   bedeutet dagegen "hinter der Kamera" und muss weiterhin ausgeschlossen bleiben,
   sonst entstuenden aus umgeklappten Punkten unsinnige Linien.
   _altOK: taugt der Punkt zum Zeichnen?  _altV: Hoehe fuer Sichtbarkeitsvergleiche,
   im Lagemodus auf einen positiven Ersatzwert gehoben, damit Linienzuege nicht am
   Horizont beschnitten werden. */
function _altOK(a){return a>=0||(orientMode&&a>-900)}
function _altV(a){return (orientMode&&a>-900)?1:a}
/* Fuer Schwellen ungleich null: im Lagemodus zaehlt nur noch, ob der Punkt vor der
   Kamera liegt; sonst gilt die urspruengliche Schwelle. Liefert true = ueberspringen. */
function _altAb(a,sw){return orientMode?!(a>-900):a<sw}
function projReal(A,altRad){
  const ch=Math.cos(altRad),sh=Math.sin(altRad);
  const px=Math.sin(A)*ch,py=Math.cos(A)*ch,pz=sh;
  if(_camCache[0]!==camAz||_camCache[1]!==camAlt||_camCache[2]!==camFov||_camCache[3]!==cvW||_camCache[4]!==cvH||_camCache[5]!==W){
    const Ac=camAz*Math.PI/180,hc=camAlt*Math.PI/180;
    _camCache=[camAz,camAlt,camFov,cvW,cvH,W,Math.cos(hc),Math.sin(hc),Math.sin(Ac),Math.cos(Ac),
      (Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720)];
  }
  const cc=_camCache[6],sc=_camCache[7],sA=_camCache[8],cA=_camCache[9];
  const d=px*sA*cc+py*cA*cc+pz*sc;
  if(d<=-0.2)return{x:NaN,y:NaN,alt:-999};
  const u=px*cA-py*sA;
  const v=px*(-sA*sc)+py*(-cA*sc)+pz*cc;
  const q=_camCache[10]/(1+d);
  return{x:q*u,y:-q*v,alt:altRad*180/Math.PI};
}
function geoAlt(ra,dec){
  const lst=LST();const H=(lst-ra*15)*Math.PI/180;
  const dr=dec*Math.PI/180,phi=lat*Math.PI/180;
  return Math.asin(Math.sin(phi)*Math.sin(dr)+Math.cos(phi)*Math.cos(dr)*Math.cos(H))*180/Math.PI;
}
function drawFixedOrientationLabels(LScale){
  const HW=(cvW||W)/2,HH=(cvH||W)/2;
  const uiShort=Math.min(window.innerWidth||720,window.innerHeight||720);
  /* Zenit/Nadir sind Orientierungshilfen, keine Himmelsobjekte. Auf einem
     schmalen Handy duerfen sie deshalb weder die Sternnamen noch helle Koerper
     optisch ueberragen. */
  const orientationUiScale=uiShort>=720?1:Math.max(.46,uiShort/900);
  const mark=(az,alt,label,color)=>{
    const P=projReal(az,alt);
    if(P.alt===-999||!isFinite(P.x)||!isFinite(P.y)||Math.abs(P.x)>HW-28*PX||Math.abs(P.y)>HH-28*PX)return;
    g.save();
    g.font=`700 ${Math.max(7*PX,12*PX*LScale*orientationUiScale)}px Inter,system-ui,sans-serif`;
    g.textAlign="center";g.textBaseline="middle";
    g.shadowColor="rgba(2,6,18,.98)";g.shadowBlur=6*PX*orientationUiScale;
    g.fillStyle=color;
    g.beginPath();g.arc(P.x,P.y,2.2*PX*orientationUiScale,0,Math.PI*2);g.fill();
    g.fillText(label,P.x,P.y-10*PX*orientationUiScale);
    g.restore();
  };
  mark(0,Math.PI/2,"Zenit","rgba(225,235,255,.92)");
  mark(0,-Math.PI/2,"Nadir","rgba(170,190,220,.82)");
  mark(Math.PI,lat*Math.PI/180,"N","rgba(225,235,255,.95)");
}
function drawGroundAndCompass(LScale){
  if(!showGround){drawFixedOrientationLabels(LScale);return;}
  const HW=(cvW||W)/2,HH=(cvH||W)/2;
  const pts=[];
  /* Nur die vordere Himmelshalbkugel verwenden. Punkte jenseits von +/-90 Grad
     falten sich in der stereografischen Projektion hinter der Kamera zurück und
     erzeugen beim Füllen eine zweite, falsche Horizontkante. */
  for(let dA=-89.5;dA<=89.5;dA+=1){
    const P=projReal((camAz+dA)*Math.PI/180,0);
    if(P.alt===-999)continue;
    if(Math.abs(P.x)>HW*6)continue;
    pts.push(P);
  }
  if(pts.length>2){
    pts.sort((a,b)=>a.x-b.x);
    g.save();
    g.beginPath();
    g.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);
    g.lineTo(pts[pts.length-1].x,HH*4);
    g.lineTo(pts[0].x,HH*4);
    g.closePath();
    /* Build 20260809s zeigte unter dem Horizont weiterhin den kompletten Himmel,
       legte aber eine halbtransparente, blaugraue Bodenstimmung darueber. Dadurch
       bleiben Sterne, Gaia, Linien und Namen sichtbar und wechseln zugleich klar
       ihre Farbstimmung. Der Beobachtermodus bleibt wie bisher blickdicht. */
    const y0=pts[Math.floor(pts.length/2)].y;
    const gg=g.createLinearGradient(0,y0,0,y0+HH*1.2);
    if(orientMode){
      /* Eigene DOM-Ebene liegt tatsächlich über Gaia-WebGL und Hauptcanvas. */
      _orientBelowDraw(pts,HH,g.getTransform());
    }else{
      gg.addColorStop(0,"#0b1018");gg.addColorStop(.35,"#070a11");gg.addColorStop(1,"#04060a");
      g.fillStyle=gg;g.fill();
    }
    // weicher Horizontsaum - im Lagemodus deutlich kräftiger, damit über/unter dem Horizont klar erkennbar bleibt
    g.beginPath();g.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);
    if(orientMode){g.shadowColor="rgba(140,230,170,.55)";g.shadowBlur=6*PX;g.strokeStyle="rgba(170,255,195,.88)";g.lineWidth=2.6*PX;g.stroke();g.shadowBlur=0;}
    else{g.strokeStyle="rgba(120,150,190,.28)";g.lineWidth=1.2*PX;g.stroke();}
    g.restore();
  }
  // Stilisierte Landschaft: Silhouetten stehen azimutfest und wandern beim Schwenken mit
  if(pts.length>2){
    g.save();
    g.fillStyle="#01020a";g.strokeStyle="rgba(125,155,195,.20)";g.lineWidth=1*PX;
    for(let i=0;i<72;i++){
      const A=i*5;
      const r1=Math.abs(Math.sin(i*12.9898)*43758.5453)%1;
      const r2=Math.abs(Math.sin(i*78.233)*12345.6789)%1;
      if(r1<.18)continue;
      const B=projReal(A*Math.PI/180,0);
      if(B.alt===-999)continue;
      if(Math.abs(B.x)>HW*1.4)continue;
      const hDeg=(r1<.62)?(3.2+r2*3.6):(r1<.86?(1.4+r2*1.2):(3.0+r2*2.2));
      const T=projReal(A*Math.PI/180,hDeg*Math.PI/180);
      if(T.alt===-999)continue;
      const hPx=Math.max(2,B.y-T.y), wPx=hPx*(r1<.62?.55:(r1<.86?1.1:1.25));
      g.beginPath();
      if(r1<.62){ // Baum: Stamm + Krone
        g.moveTo(B.x-wPx*.12,B.y);g.lineTo(B.x-wPx*.12,B.y-hPx*.45);
        g.lineTo(B.x-wPx*.5,B.y-hPx*.5);g.lineTo(B.x,B.y-hPx);
        g.lineTo(B.x+wPx*.5,B.y-hPx*.5);g.lineTo(B.x+wPx*.12,B.y-hPx*.45);
        g.lineTo(B.x+wPx*.12,B.y);
      } else if(r1<.86){ // Busch
        g.moveTo(B.x-wPx*.5,B.y);
        g.quadraticCurveTo(B.x-wPx*.45,B.y-hPx*1.25,B.x,B.y-hPx);
        g.quadraticCurveTo(B.x+wPx*.45,B.y-hPx*1.25,B.x+wPx*.5,B.y);
      } else { // Haus mit Dach
        g.moveTo(B.x-wPx*.5,B.y);g.lineTo(B.x-wPx*.5,B.y-hPx*.62);
        g.lineTo(B.x,B.y-hPx);g.lineTo(B.x+wPx*.5,B.y-hPx*.62);
        g.lineTo(B.x+wPx*.5,B.y);
      }
      g.closePath();g.fill();g.stroke();
      if(r1>=.86&&r2>.45){ // warmes Fensterlicht
        g.fillStyle="rgba(255,190,105,.5)";
        g.fillRect(B.x-wPx*.16,B.y-hPx*.5,Math.max(1,wPx*.16),Math.max(1,hPx*.2));
        g.fillStyle="#01020a";
      }
    }
    g.restore();
  }
  drawFixedOrientationLabels(LScale);
  /* Alte Randmarkierung deaktiviert: Orientierungspunkte werden ausschliesslich
     an ihrer astronomisch projizierten Position gezeichnet. Zenit und Nadir
     werden nur beschriftet, wenn ihre projizierte Position im Sichtfeld liegt.
     Der geografische Nordpunkt am Horizont bleibt davon getrennt; "N" markiert
     hier ausdrücklich den nördlichen Himmelspol auf der Höhe des Breitengrads. */
  if(false){
    const mark=(az,alt,text,col)=>{
      const P=projReal(az,alt);
      let x=P.x,y=P.y,edge=false;
      if(P.alt===-999||!isFinite(x)||!isFinite(y)){
        /* Auch Punkte hinter der Kamera erhalten eine eindeutige Richtung zum
           Bildschirmrand. Dazu wird ihr Himmelsvektor in die Kamerabasis
           projiziert, ohne die Vorwaerts-Halbkugel abzuschneiden. */
        const ch=Math.cos(alt),sh=Math.sin(alt),px=Math.sin(az)*ch,py=Math.cos(az)*ch,pz=sh;
        const Ac=camAz*Math.PI/180,hc=camAlt*Math.PI/180,cc=Math.cos(hc),sc=Math.sin(hc),sA=Math.sin(Ac),cA=Math.cos(Ac);
        x=px*cA-py*sA;y=-(px*(-sA*sc)+py*(-cA*sc)+pz*cc);
        if(Math.hypot(x,y)<1e-6)y=-1;
        edge=true;
      }
      const limX=HW-48*PX,limY=HH-28*PX;
      if(edge||Math.abs(x)>limX||Math.abs(y)>limY){
        const k=Math.min(limX/Math.max(1e-6,Math.abs(x)),limY/Math.max(1e-6,Math.abs(y)));
        x*=k;y*=k;edge=true;
      }
      g.save();
      const uiShort=Math.min(window.innerWidth||720,window.innerHeight||720);
      const orientationUiScale=uiShort>=720?1:Math.max(.62,uiShort/720);
      g.font=`700 ${Math.max(9*PX,14*PX*LScale*orientationUiScale)}px Inter,system-ui,sans-serif`;
      g.textAlign="center";g.textBaseline="middle";
      g.shadowColor="rgba(2,6,18,.98)";g.shadowBlur=6*PX*orientationUiScale;
      g.fillStyle=col;g.fillText(edge?"◂ "+text+" ▸":text,x,y);
      g.restore();
      return !edge;
    };
    mark(0,Math.PI/2,"Zenit","rgba(225,235,255,.92)");
    mark(0,-Math.PI/2,"Nadir","rgba(170,190,220,.78)");
    const poleIsAlreadyDrawn=showRefCircles&&window.didHidePrec!==true&&window.didacticSimulationMode!=="solar-year";
    const poleP=projReal(Math.PI,lat*Math.PI/180);
    const poleInside=poleP.alt!==-999&&isFinite(poleP.x)&&isFinite(poleP.y)&&Math.abs(poleP.x)<=HW-48*PX&&Math.abs(poleP.y)<=HH-28*PX;
    if(!poleIsAlreadyDrawn||!poleInside)mark(Math.PI,lat*Math.PI/180,"N","rgba(225,235,255,.95)");
  }
  // Kompass am Horizont (Azimut im Code von Sued gezaehlt)
  const CMP=[[0,"S"],[45,"SW"],[90,"W"],[135,"NW"],[180,"N"],[225,"NO"],[270,"O"],[315,"SO"]];
  g.save();
  g.textAlign="center";g.textBaseline="middle";
  g.font=`600 ${Math.max(11*PX,13*PX*LScale)}px Inter,system-ui,sans-serif`;
  g.shadowColor="rgba(2,6,18,.95)";g.shadowBlur=5*PX;
  let __cmpVisible=false;
  CMP.forEach(([a,lbl])=>{
    const P=projReal(a*Math.PI/180,0);
    if(P.alt===-999)return;
    if(Math.abs(P.x)>HW||Math.abs(P.y)>HH)return;
    __cmpVisible=true;
    const major=(lbl.length===1);
    g.fillStyle=major?"rgba(240,225,180,.92)":"rgba(190,205,230,.72)";
    g.fillText(lbl,P.x,P.y-14*PX);
    g.beginPath();g.moveTo(P.x,P.y-5*PX);g.lineTo(P.x,P.y+5*PX);
    g.strokeStyle=major?"rgba(240,225,180,.5)":"rgba(190,205,230,.35)";
    g.lineWidth=1.1*PX;g.stroke();
  });
  g.restore();
  if(viewMode==="real" && !__cmpVisible){
    const azNow=((camAz%360)+360)%360;
    let bestLbl="",bestDiff=999;
    CMP.forEach(([a,lbl])=>{const diff=Math.abs(((azNow-a+540)%360)-180);if(diff<bestDiff){bestDiff=diff;bestLbl=lbl;}});
    const belowHorizon=camAlt>0;
    const barY=HH*0.80;
    g.save();
    g.strokeStyle="rgba(140,170,205,.42)";
    g.lineWidth=1.2*PX;
    g.setLineDash([4*PX,3*PX]);
    g.beginPath();g.moveTo(-HW,barY);g.lineTo(HW,barY);g.stroke();
    g.setLineDash([]);
    g.font=`600 ${Math.max(12*PX,14*PX*LScale)}px Inter,system-ui,sans-serif`;
    g.textAlign="center";g.textBaseline="bottom";
    g.shadowColor="rgba(2,6,18,.95)";g.shadowBlur=5*PX;
    g.fillStyle="rgba(240,225,180,.9)";
    g.fillText((belowHorizon?"↓ Horizont Richtung ":"↑ Horizont Richtung ")+bestLbl,0,barY-4*PX);
    g.restore();
  }
}function drawZodiac(i,s){const a=(cx,cy,r,a0,a1,ccw)=>{g.beginPath();g.arc(cx,cy,r,a0,a1,ccw);g.stroke()};const line=(x0,y0,x1,y1)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()};switch(i){case 0:a(-s*.45,-s*.1,s*.45,Math.PI,Math.PI*2,true);a(s*.45,-s*.1,s*.45,Math.PI,Math.PI*2,true);line(0,-s*.55,0,s*.55);break;case 1:a(0,s*.18,s*.42,0,Math.PI*2);a(0,-s*.35,s*.5,Math.PI*1.05,Math.PI*1.95,false);break;case 2:line(-s*.35,-s*.5,-s*.35,s*.5);line(s*.35,-s*.5,s*.35,s*.5);line(-s*.5,-s*.42,s*.5,-s*.42);line(-s*.5,s*.42,s*.5,s*.42);break;case 3:a(-s*.22,-s*.18,s*.2,Math.PI*.2,Math.PI*1.5,false);a(s*.22,s*.18,s*.2,Math.PI*1.2,Math.PI*.5,false);break;case 4:a(-s*.15,s*.05,s*.25,0,Math.PI*2);g.beginPath();g.moveTo(s*.08,s*.2);g.bezierCurveTo(s*.4,s*.3,s*.45,-s*.2,s*.2,-s*.4);g.stroke();break;case 5:line(-s*.5,-s*.4,-s*.5,s*.4);line(-s*.5,-s*.35,-s*.2,-s*.4);line(-s*.2,-s*.4,-s*.2,s*.4);line(-s*.2,-s*.35,s*.1,-s*.4);line(s*.1,-s*.4,s*.1,s*.3);a(s*.1,s*.05,s*.28,Math.PI*1.5,Math.PI*.6,false);break;case 6:line(-s*.5,s*.4,s*.5,s*.4);line(-s*.5,s*.12,-s*.15,s*.12);line(s*.15,s*.12,s*.5,s*.12);a(0,s*.12,s*.2,Math.PI,Math.PI*2,false);break;case 7:line(-s*.5,-s*.35,-s*.5,s*.4);line(-s*.5,-s*.3,-s*.2,-s*.35);line(-s*.2,-s*.35,-s*.2,s*.4);line(-s*.2,-s*.3,s*.1,-s*.35);line(s*.1,-s*.35,s*.1,s*.4);line(s*.1,s*.4,s*.45,s*.15);line(s*.45,s*.15,s*.3,s*.1);line(s*.45,s*.15,s*.5,s*.32);break;case 8:line(-s*.4,s*.4,s*.4,-s*.4);line(s*.4,-s*.4,s*.12,-s*.4);line(s*.4,-s*.4,s*.4,-s*.12);line(-s*.05,s*.05,s*.05,-s*.05);line(-s*.25,s*.05,s*.05,s*.32);break;case 9:g.beginPath();g.moveTo(-s*.5,-s*.3);g.lineTo(-s*.15,s*.4);g.lineTo(s*.05,-s*.3);g.stroke();a(s*.18,s*.1,s*.22,Math.PI*1.2,Math.PI*.8,false);break;case 10:[-s*.18,s*.18].forEach(off=>{g.beginPath();g.moveTo(-s*.5,off-s*.08);g.lineTo(-s*.25,off+s*.08);g.lineTo(0,off-s*.08);g.lineTo(s*.25,off+s*.08);g.lineTo(s*.5,off-s*.08);g.stroke()});break;case 11:a(-s*.35,0,s*.42,Math.PI*.5,Math.PI*1.5,false);a(s*.35,0,s*.42,Math.PI*1.5,Math.PI*.5,false);line(-s*.1,0,s*.1,0);break}}const METEOR_SHOWERS=[{n:"Quadrantiden",ra:15.33,de:49.5,peak:[0,3],zhr:110,hw:.7,col:[170,210,255]},{n:"Lyriden",ra:18.13,de:33.3,peak:[3,22],zhr:18,hw:2,col:[255,245,210]},{n:"η-Aquariiden",ra:22.47,de:-1,peak:[4,6],zhr:50,hw:4,col:[210,235,255]},{n:"Perseiden",ra:3.2,de:58,peak:[7,12],zhr:100,hw:4,col:[180,255,210]},{n:"Orioniden",ra:6.35,de:15.5,peak:[9,21],zhr:20,hw:4,col:[255,225,200]},{n:"Leoniden",ra:10.27,de:21.8,peak:[10,17],zhr:15,hw:2,col:[210,225,255]},{n:"Geminiden",ra:7.55,de:32.4,peak:[11,14],zhr:120,hw:2.5,col:[255,235,180]},{n:"Ursiden",ra:14.48,de:75.8,peak:[11,22],zhr:10,hw:1,col:[235,235,255]}];function activeMeteorShowers(){const out=[];for(const s of METEOR_SHOWERS){const pk=date2doy(s.peak[1],s.peak[0],simYear);let d=simDay-pk;const yl=daysInYear(simYear);if(d>yl/2)d-=yl;if(d<-yl/2)d+=yl;const inten=Math.exp(-(d*d)/(2*s.hw*s.hw));if(inten>.04)out.push({s:s,inten:inten,d:d})}return out}function jupiterMoons(jd0){const d=jd0-2451545,rad=Math.PI/180;const V=172.74+.00111588*d;const M=(357.529+.9856003*d)*rad,sinV=Math.sin(V*rad);const N=(20.02+.0830853*d+.329*sinV)*rad;const J=66.115+.9025179*d-.329*sinV;const A=1.915*Math.sin(M)+.02*Math.sin(2*M);const B=5.555*Math.sin(N)+.168*Math.sin(2*N);const K=(J+A-B)*rad;const R=1.00014-.01671*Math.cos(M)-14e-5*Math.cos(2*M);const r=5.20872-.25208*Math.cos(N)-.00611*Math.cos(2*N);const Delta=Math.sqrt(r*r+R*R-2*r*R*Math.cos(K));const psi=Math.asin(Math.max(-1,Math.min(1,R/Delta*Math.sin(K))));const psiD=psi/rad,lt=Delta/173;let u1=163.8067+203.4058643*(d-lt)+psiD-B;let u2=358.4108+101.2916334*(d-lt)+psiD-B;let u3=5.7129+50.2345179*(d-lt)+psiD-B;let u4=224.8151+21.4879801*(d-lt)+psiD-B;const G=(331.18+50.310482*(d-lt))*rad,H=(87.4+21.569231*(d-lt))*rad;u1+=.473*Math.sin(2*(u1-u2)*rad);u2+=1.065*Math.sin(2*(u2-u3)*rad);u3+=.165*Math.sin(G);u4+=.843*Math.sin(H);const lam=34.35+.083091*d+.329*sinV+B;const Ds=3.12*Math.sin((lam+42.8)*rad);const De=Ds-2.22*Math.sin(psi)*Math.cos((lam+22)*rad)-1.3*(r-Delta)/Delta*Math.sin((lam-100.5)*rad);const sinDe=Math.sin(De*rad);const radii=[5.9057,9.3966,14.9883,26.3699],us=[u1,u2,u3,u4];const names=["Io","Europa","Ganymed","Kallisto"];return us.map((u,i)=>{const ur=u*rad;return{n:names[i],x:radii[i]*Math.sin(ur),y:-radii[i]*Math.cos(ur)*sinDe,front:Math.cos(ur)<0}})}function saturnMoons(jd0){const d=jd0-2451545;const els=[["Tethys",4.89,1.887802,44],["Dione",6.26,2.736915,123],["Rhea",8.74,4.517500,201],["Titan",20.27,15.945421,68]];return els.map(function(e){const ang=(((d/e[2]*360+e[3])%360)+360)%360*Math.PI/180;return{n:e[0],x:e[1]*Math.cos(ang),y:e[1]*Math.sin(ang),front:Math.sin(ang)>0}})}
function raDecToEclLon(raH,decD,jd0){const eps=oblR(jd0),a=raH*15*Math.PI/180,dd=decD*Math.PI/180;return(Math.atan2(Math.sin(a)*Math.cos(eps)+Math.tan(dd)*Math.sin(eps),Math.cos(a))*180/Math.PI+360)%360}function eclScreenAngle(raH,decD,jd0,HR){const L=raDecToEclLon(raH,decD,jd0);const e1=ecl2rd(L-1,0,jd0),e2=ecl2rd(L+1,0,jd0);const q1=altazXY(e1.ra,e1.dec,HR),q2=altazXY(e2.ra,e2.dec,HR);return{th:Math.atan2(q2.y-q1.y,q2.x-q1.x),L:L}}function saturnRingB(L){const i=28.0747*Math.PI/180,Om=169.1*Math.PI/180;return Math.asin(Math.sin(i)*Math.sin(L*Math.PI/180-Om))*180/Math.PI}function moonLitPath(g,cx,cy,R,f,wax){const rx=Math.max(.4,R*Math.abs(1-2*f)),ccw=f<.5;g.beginPath();if(wax){g.arc(cx,cy,R,-Math.PI/2,Math.PI/2,false);g.ellipse(cx,cy,rx,R,0,Math.PI/2,-Math.PI/2,ccw)}else{g.arc(cx,cy,R,Math.PI/2,Math.PI*1.5,false);g.ellipse(cx,cy,rx,R,0,-Math.PI/2,Math.PI/2,ccw)}g.closePath()}let _moonShade={key:"",cv:null};function moonShadeCanvas(illum,wax,size){const key=Math.round(illum*120)+"|"+(wax?1:0)+"|"+size;if(_moonShade.key===key&&_moonShade.cv)return _moonShade.cv;const cv=document.createElement("canvas");cv.width=cv.height=size;const c=cv.getContext("2d");const img=c.createImageData(size,size);const d=img.data;const lightDir=wax?1:-1;const cosG=2*illum-1,sinG=2*Math.sqrt(Math.max(0,illum*(1-illum)));const R=size/2;const p=new Float32Array(size*size);let pmax=1e-4;for(let yy=0;yy<size;yy++){for(let xx=0;xx<size;xx++){const nx=(xx+.5-R)/R,ny=(yy+.5-R)/R,r2=nx*nx+ny*ny,idx=yy*size+xx;if(r2>1){p[idx]=-1;continue}const nz=Math.sqrt(1-r2);const mu0=nx*lightDir*sinG+nz*cosG;if(mu0<=0){p[idx]=0;continue}const val=mu0/(mu0+nz);p[idx]=val;if(val>pmax)pmax=val}}const gamma=.8;for(let i=0;i<p.length;i++){const v=p[i];let a;if(v<0){a=0}else{const m=Math.pow(Math.max(0,Math.min(1,v/pmax)),gamma);a=(1-m)*255|0}const j=i*4;d[j]=0;d[j+1]=0;d[j+2]=2;d[j+3]=a}c.putImageData(img,0,0);_moonShade={key:key,cv:cv};return cv}const MOON_MARIA=[[-.26,-.4,.34,.28,20,.95],[.14,-.3,.26,.24,-10,.95],[.36,-.1,.25,.27,15,1],[.48,.16,.18,.22,0,.9],[.22,.16,.2,.2,30,.85],[-.46,.02,.22,.4,82,.9],[-.4,.36,.2,.22,60,.85],[.02,.44,.18,.16,0,.82],[.46,-.46,.13,.13,0,1],[-.04,-.14,.16,.14,40,.55],[-.2,-.34,.16,.1,0,.55],[-.3,.3,.12,.12,0,.8],[-.1,.4,.11,.1,0,.72]];const MOON_CRATERS=[[.02,.54,.055,1.5],[-.16,.02,.05,1.3],[-.34,-.02,.038,1.2],[.2,-.5,.03,1],[.3,.4,.028,1],[-.1,.3,.025,1],[.48,-.05,.022,1],[-.5,-.2,.024,1],[.1,-.05,.02,1],[-.2,.5,.026,1],[.35,.05,.02,1],[.06,.62,.024,1],[-.28,.3,.02,1],[.4,.3,.017,1],[.52,.02,.018,1],[.44,-.2,.02,1],[.26,-.34,.015,1],[-.36,.5,.019,1],[-.52,.1,.016,1],[-.46,-.04,.015,1],[-.3,-.18,.017,1],[0,-.3,.014,1],[-.12,-.4,.016,1],[.34,-.46,.018,1],[.58,-.14,.014,1],[.22,.54,.015,1],[-.42,.22,.014,1],[.3,.18,.013,1],[-.22,.1,.012,1],[.46,.44,.013,1],[-.16,.62,.014,1]];let _moonAlb=null;function moonAlbedoInit(){if(_moonAlb)return;const N=256,A=new Float32Array(N*N);const rnd=s=>{const t=Math.sin(s*12.9898+78.233)*43758.5453;return t-Math.floor(t)};const noiseAt=(x,y)=>{let v=0,amp=0;for(const cw of[[6,1],[15,.5],[36,.25]]){const c=cw[0],w=cw[1];const gx=x/N*c,gy=y/N*c,x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0;const h=(a,b)=>rnd((a%c+c)%c+(b%c+c)%c*131+c*7);const a0=h(x0,y0)*(1-fx)+h(x0+1,y0)*fx,a1=h(x0,y0+1)*(1-fx)+h(x0+1,y0+1)*fx;v+=w*(a0*(1-fy)+a1*fy);amp+=w}return v/amp};for(let py=0;py<N;py++)for(let px=0;px<N;px++){const nx=(px+.5)/N*2-1,ny=(py+.5)/N*2-1,r2=nx*nx+ny*ny,i=py*N+px;if(r2>1){A[i]=-1;continue}let alb=.7+(noiseAt(px,py)-.5)*.13,mare=0;for(let k=0;k<MOON_MARIA.length;k++){const m=MOON_MARIA[k];const a=m[4]*Math.PI/180,dx=nx-m[0],dy=ny-m[1];const u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a);const e=Math.sqrt(u/m[2]*(u/m[2])+v/m[3]*(v/m[3]));const mm=Math.max(0,Math.min(1,(1-e)/.32))*m[5];if(mm>mare)mare=mm}A[i]=alb*(1-mare)+.3*mare}_moonAlb=A}let _moonCache={key:"",cnv:null,S:0};function renderMoonSurface(Rpx,illum,wax){moonAlbedoInit();const SQ=Math.max(24,Math.min(200,Math.round(Rpx/16)*16));const key=SQ+"|"+(wax?1:0)+"|"+Math.round(illum*100);if(_moonCache.key===key&&_moonCache.cnv)return _moonCache;const S=SQ,D=S*2,cnv=document.createElement("canvas");cnv.width=D;cnv.height=D;const c=cnv.getContext("2d"),img=c.createImageData(D,D),dat=img.data;const g=Math.acos(Math.max(-1,Math.min(1,2*illum-1))),sg=Math.sin(g),cg=Math.cos(g),ld=wax?1:-1;const A=_moonAlb;for(let py=0;py<D;py++)for(let px=0;px<D;px++){const nx=(px-S+.5)/S,ny=(py-S+.5)/S,r2=nx*nx+ny*ny,idx=(py*D+px)*4;if(r2>1){dat[idx+3]=0;continue}const nz=Math.sqrt(1-r2);const ax=(nx+1)*.5*255|0,ayi=(ny+1)*.5*255|0;let alb=A[ayi*256+ax];if(alb<0)alb=.6;let L=nx*sg*ld+nz*cg;if(L<0)L=0;let b=alb*(.055+1.16*L)*(.86+.14*nz);if(b>1)b=1;const mareT=Math.max(0,Math.min(1,(.55-alb)/.25));dat[idx]=b*255*(1-mareT*.06);dat[idx+1]=b*255*(1-mareT*.02);dat[idx+2]=Math.min(255,b*255*(1+mareT*.06));dat[idx+3]=255}c.putImageData(img,0,0);const rayVis=.05+.05*Math.max(0,cg);const drawRays=(rx,ry,len,n,seed)=>{c.strokeStyle=`rgba(248,246,238,${rayVis})`;c.lineWidth=Math.max(1,S*.012);for(let a=0;a<n;a++){const ang=a*2*Math.PI/n+seed;const x0=S+rx*S,y0=S+ry*S;c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+Math.cos(ang)*S*len,y0+Math.sin(ang)*S*len);c.stroke()}};drawRays(.02,.54,.9,16,.6);drawRays(-.16,.02,.5,11,.2);for(let k=0;k<MOON_CRATERS.length;k++){const cc=MOON_CRATERS[k],cnx=cc[0],cny=cc[1],rr=cc[2]*S,br=cc[3];const r2=cnx*cnx+cny*cny;if(r2>.985)continue;const cnz=Math.sqrt(1-r2);let L=cnx*sg*ld+cnz*cg;if(L<=.03)continue;const elev=Math.asin(Math.min(1,L)),px=S+cnx*S,py=S+cny*S;const shLen=Math.min(3.4,1/Math.tan(Math.max(.07,elev)))*rr;const sdx=-ld,sStr=.28+.5*(1-L);const lit=c.createRadialGradient(px+ld*rr*.4,py-rr*.2,rr*.1,px,py,rr*1.15);lit.addColorStop(0,`rgba(255,250,236,${.3*br})`);lit.addColorStop(.6,"rgba(255,250,236,.06)");lit.addColorStop(1,"rgba(255,250,236,0)");c.beginPath();c.arc(px,py,rr*1.12,0,Math.PI*2);c.fillStyle=lit;c.fill();const scx=px+sdx*shLen*.5;const sh=c.createRadialGradient(px+sdx*rr*.5,py,rr*.05,scx,py,rr+shLen);sh.addColorStop(0,`rgba(10,9,7,${sStr})`);sh.addColorStop(.6,`rgba(14,12,9,${sStr*.4})`);sh.addColorStop(1,"rgba(14,12,9,0)");c.beginPath();c.ellipse(scx,py,rr+shLen*.7,rr*.95,0,0,Math.PI*2);c.fillStyle=sh;c.fill();const fl=c.createRadialGradient(px-sdx*rr*.3,py,rr*.05,px,py,rr*.85);fl.addColorStop(0,`rgba(14,12,9,${sStr*.6})`);fl.addColorStop(1,"rgba(20,17,12,0)");c.beginPath();c.arc(px,py,rr*.82,0,Math.PI*2);c.fillStyle=fl;c.fill()}_moonCache={key:key,cnv:cnv,S:S};return _moonCache}function sunDirScreenAngle(ra1,dec1,ra2,dec2,HR,P0){
  const r1=ra1*15*Math.PI/180,d1=dec1*Math.PI/180;
  const r2=ra2*15*Math.PI/180,d2=dec2*Math.PI/180;
  const dra=r2-r1;
  const theta=Math.atan2(Math.sin(dra)*Math.cos(d2),Math.cos(d1)*Math.sin(d2)-Math.sin(d1)*Math.cos(d2)*Math.cos(dra));
  const delta=0.5*Math.PI/180;
  const d3=Math.asin(Math.sin(d1)*Math.cos(delta)+Math.cos(d1)*Math.sin(delta)*Math.cos(theta));
  const r3=r1+Math.atan2(Math.sin(theta)*Math.sin(delta)*Math.cos(d1),Math.cos(delta)-Math.sin(d1)*Math.sin(d3));
  const raStep=((r3*180/Math.PI/15)%24+24)%24,decStep=d3*180/Math.PI;
  const P2=altazXY(raStep,decStep,HR);
  return Math.atan2(P2.y-P0.y,P2.x-P0.x);
}
/* Beleuchtungsrichtung des Mondes wie bei Venus/Mars/Merkur (sunDirScreenAngle), aber auf
   Wunsch nur selten neu berechnet (hoechstens einmal je simuliertem Tag) statt jedes Bild,
   da sich diese Richtung im Tagesverlauf vergleichsweise langsam aendert und die exakte
   Aktualitaet fuer die Darstellung nicht bildgenau wichtig ist. Cache-Schluessel ist jd0
   selbst (nicht simYear/simDay), damit auch Zeitraffer und Zeitsprünge sauber funktionieren -
   gleiches Prinzip wie bei starPC/precYearCache, nur mit einem 1-Tage- statt 30-Tage-Fenster. */
let _moonLimbCache={jd:null,ang:0};
function moonBrightLimbAngle(mtopo,sunRD,HR,mP,jd0){
  if(_moonLimbCache.jd===null||Math.abs(jd0-_moonLimbCache.jd)>=1){
    _moonLimbCache.ang=sunDirScreenAngle(mtopo.ra,mtopo.dec,sunRD.ra,sunRD.dec,HR,mP);
    _moonLimbCache.jd=jd0;
  }
  return _moonLimbCache.ang;
}
let __orientDrawAz=null,__orientDrawAlt=null,__orientDrawFov=null,__orientDrawTS=0;
/* Ein Szenensprung setzt Ort, Zeit, Projektion und Schalter teils in mehreren
   zeitversetzten Schritten. Bis die Transaktion fertig ist, bleibt das letzte
   vollstaendige Bild stehen; danach wird genau ein fertiges Bild gezeichnet. */
let __atomicSkyUntil=0,__atomicSkyTimer=0,__atomicSkyCommits=[];
function beginAtomicSkyJump(ms){
  const wait=Math.max(120,ms||380);
  __atomicSkyUntil=Math.max(__atomicSkyUntil,performance.now()+wait);
  clearTimeout(__atomicSkyTimer);
  __atomicSkyTimer=setTimeout(function finishAtomicSkyJump(){
    const rest=__atomicSkyUntil-performance.now();
    if(rest>1){__atomicSkyTimer=setTimeout(finishAtomicSkyJump,rest+2);return}
    __atomicSkyUntil=0;
    const commits=__atomicSkyCommits.splice(0);
    for(let i=0;i<commits.length;i++){try{commits[i]()}catch(e){}}
    if(W)requestAnimationFrame(()=>draw());
  },wait+2);
}
window.__beginAtomicSkyJump=beginAtomicSkyJump;
function queueAtomicSkyCommit(fn){
  if(typeof fn!=="function")return;
  if(__atomicSkyUntil>performance.now())__atomicSkyCommits.push(fn);
  else{try{fn()}catch(e){}if(W)requestAnimationFrame(()=>draw())}
}
window.__queueAtomicSkyCommit=queueAtomicSkyCommit;
function __orientDrawNeeded(){
  /* Die Kameratransformation des Lagemodus folgt wieder jedem RAF wie im
     bewaehrten Build 20260809s. Andere Modi behalten ihre Drosselung. */
  if(orientMode)return true;
  const now=performance.now(),perf=window.__devicePerformanceProfile&&window.__devicePerformanceProfile.level;
  const minMs=perf==="low"?24:16;
  if(__orientDrawAz===null)return true;
  if(now-__orientDrawTS<minMs)return false;
  const da=orientAngDelta(camAz,__orientDrawAz)*Math.cos(camAlt*Math.PI/180),dh=camAlt-__orientDrawAlt;
  const pixels=Math.hypot(da,dh)*Math.max(1,Math.min(cvW||W,cvH||W))/Math.max(20,camFov);
  return pixels>=.10||Math.abs(camFov-__orientDrawFov)>.01;
}
function __orientDrawCommit(){__orientDrawAz=camAz;__orientDrawAlt=camAlt;__orientDrawFov=camFov;__orientDrawTS=performance.now()}
function draw(){if(!W)return;if(__atomicSkyUntil>performance.now())return;if(orientMode&&!__orientDrawNeeded())return;if(orientMode)__orientDrawCommit();_orientBelowClear();g.clearRect(0,0,cvW||W,cvH||W);clickable=[];window.__lblBoxes=[];ORX=(cvW||W)/2;ORY=(cvH||W)/2;g.save();g.translate(ORX,ORY);if(viewMode!=="real"){g.translate(panX,panY);g.scale(zoom,zoom);}const FS=document.body.classList.contains("fullscreen");const R=C*(FS?.998:.975);const HR=R*(showTwilight?.8:FS?.965:.94);/* Grenzen des sichtbaren Ausschnitts in Zeichenkoordinaten, einmal je Bild.
   In der Kuppelansicht ist die Flaeche mit zoom skaliert und um pan verschoben,
   in der Beobachteransicht nicht. Damit lassen sich Beschriftungen und Linien,
   die ohnehin ausserhalb liegen, verwerfen, bevor gezeichnet wird. */
const _aRand=40*PX/((viewMode==="real")?1:zoom);
const _aX0=((viewMode==="real")?-(cvW||W)/2:(-ORX-panX)/zoom)-_aRand;
const _aX1=((viewMode==="real")? (cvW||W)/2:((cvW||W)-ORX-panX)/zoom)+_aRand;
const _aY0=((viewMode==="real")?-(cvH||W)/2:(-ORY-panY)/zoom)-_aRand;
const _aY1=((viewMode==="real")? (cvH||W)/2:((cvH||W)-ORY-panY)/zoom)+_aRand;
const _imBild=(x,y)=>x>=_aX0&&x<=_aX1&&y>=_aY0&&y<=_aY1;
/* Fuer Strecken: nur verwerfen, wenn beide Enden auf derselben Seite ausserhalb
   liegen — eine Strecke, die den Ausschnitt quert, bleibt so erhalten. */
const _streckeDraussen=(ax,ay,bx,by)=>(ax<_aX0&&bx<_aX0)||(ax>_aX1&&bx>_aX1)||(ay<_aY0&&by<_aY0)||(ay>_aY1&&by>_aY1);
const _vf=(viewMode==="real")?(((Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720))*Math.PI/(4*HR)):1;const _FX=(viewMode==="real")?-(cvW||W)/2:-HR,_FY=(viewMode==="real")?-(cvH||W)/2:-HR,_FW=(viewMode==="real")?(cvW||W):2*HR,_FH=(viewMode==="real")?(cvH||W):2*HR;const ULS=(window.userLabelScale||1)*Math.max(.85,Math.min(1,Math.min(window.innerWidth,window.innerHeight)/430));const LScale=ULS/zoom;const LScaleGrow=Math.pow(zoom,.35)/zoom*ULS;const BODY_LABEL_SIZE=Math.max(13*PX,HR*.026)*LScale;window.__V9_LABEL_SIZE=BODY_LABEL_SIZE;function setBodyLabelStyle(kind){g.font=`600 ${BODY_LABEL_SIZE}px Inter,system-ui,sans-serif`;g.shadowColor="rgba(2,6,18,.95)";g.shadowBlur=5*PX/zoom;g.shadowOffsetX=0;g.shadowOffsetY=0;if(kind==="sun")g.fillStyle="#F5D76E";else if(kind==="moon")g.fillStyle="#F2F2F2";else if(kind==="planet")g.fillStyle="#EED28A";else g.fillStyle="#EAF4FF"}const jd0=currentJD();const didConst=!!focusConstellation;const zEff=curMag();/* zEff ist im Lagemodus bewusst auf eins festgehalten, damit Grenzgroesse des
     Sternhintergrunds und Tageshimmel vom Aufziehen unberuehrt bleiben. Fuer die
     Gestalt der ausgedehnten Objekte ist aber der tatsaechliche Abbildungsmassstab
     massgeblich: Sonst blieben Nebel und Galaxien im Lagemodus auch bei engem
     Bildfeld blosse Sinnbilder statt Wolken. */const zVis=(viewMode==="real")?REAL_HOME_FOV/camFov:zoom;function circ(r,col,lw){if(viewMode==="real")return;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.strokeStyle=col;g.lineWidth=lw;g.stroke()}function disc(r,col){g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.fillStyle=col;g.fill()}function pol(deg,r){const a=(deg-90)*Math.PI/180;return[r*Math.cos(a),r*Math.sin(a)]}const bg=g.createRadialGradient(0,0,R*.1,0,0,R);bg.addColorStop(0,"#000308");bg.addColorStop(1,"#010104");if(viewMode==="real"){const HW=(cvW||W)/2,HH=(cvH||W)/2;const skg=g.createLinearGradient(0,-HH,0,HH);skg.addColorStop(0,"#01030b");skg.addColorStop(.72,"#03060f");skg.addColorStop(1,"#060a16");g.fillStyle=skg;g.fillRect(-HW,-HH,HW*2,HH*2);g.save();g.beginPath();g.rect(-HW,-HH,HW*2,HH*2);g.clip();}else{disc(R,bg);g.save();g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.clip();disc(HR,"#000308");}const sunRD=ecl2rd(sunLon(jd0),0,jd0);const sunP=altazXY(sunRD.ra,sunRD.dec,HR);if(viewMode==="real"&&sunP.alt===-999)sunP.alt=geoAlt(sunRD.ra,sunRD.dec);let eclipseDark=0;{const mtE=moonTopo(jd0);const d1=sunRD.dec*Math.PI/180,d2=mtE.dec*Math.PI/180;const r1=sunRD.ra*15*Math.PI/180,r2=mtE.ra*15*Math.PI/180;const sepE=Math.acos(Math.max(-1,Math.min(1,Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(r1-r2))))*180/Math.PI;const TsE=(jd0-2451545)/36525,MsE=(357.52911+35999.05029*TsE)*Math.PI/180;const sRE=.2666/(1.000001018*(1-.01671123*Math.cos(MsE)));const mRE=Math.atan(1737.4/mtE.dist)*180/Math.PI;const magE=Math.max(0,Math.min(1.1,(sRE+mRE-sepE)/(2*sRE)));if(magE>0&&sunP.alt>-2){
    /* Verdunkelung bei Sonnenfinsternis war bislang auf 52% Reduktion der Taghelligkeit
       gedeckelt - selbst bei totaler Verfinsterung viel zu schwach, um wie eine echte
       Verdunkelung zu wirken. In Wirklichkeit bleibt es bis kurz vor der Totalitaet fast
       taghell (selbst 95% Bedeckung lassen noch reichlich Sonnenlicht durch, da die
       Helligkeit nicht linear mit der bedeckten Flaeche sinkt), dann faellt die Helligkeit
       in den letzten Prozenten vor der Totalitaet schlagartig auf naechtliches Niveau.
       Nachgebessert (Build 20260804z9): Die Schwelle fuer die "Total"-Grafik der Sonnenscheibe
       liegt seit Build 20260804z8 bei magE>=.99 (pragmatischer Kompromiss fuer real
       hauchduenne, aber echte Totalitaetsorte wie Bilbao, siehe dortiger Kommentar). Die
       Verdunkelung folgte dem zunaechst nicht - bei genau dieser Schwelle sprang sie nur auf
       15%, spuerbar zu schwach fuer eine Ansicht, die bereits die volle Korona zeigt. Jetzt
       zweistufig, an dieselbe Schwelle angeglichen: sanfter Anstieg von 0 bis 0,95 Bedeckung
       bis 0,99 (kaum merklich, wie in der Wirklichkeit), ab 0,99 direkter Sprung auf
       75-92% Verdunkelung - deckungsgleich mit dem Punkt, an dem auch die Sonnenscheibe
       bereits die Totalitaets-Grafik zeigt. */
    if(magE>=.99){eclipseDark=Math.min(.92,.75+(magE-.99)/.01*.17)}
    else if(magE>=.95){eclipseDark=(magE-.95)/.04*.15}
  }}function skyDayF(alt){if(!isFinite(alt))return 1;if(alt>=0)return 1;if(alt<=-12)return 0;return Math.pow(1+alt/12,1.6)}const skyHAlt=(Math.max(1,Math.min(10,zEff))-1)/9*1e5;const skyAltFade=orientMode?1:Math.exp(-skyHAlt/6e3);const skyDay=skyDayF(sunP.alt)*(1-eclipseDark)*skyAltFade;let starNight;if(sunP.alt>=0)starNight=0;else if(sunP.alt<=-18)starNight=1;else starNight=Math.pow(-sunP.alt/18,1.7);const nightF=starNight;const eclBrightStars=eclipseDark>.3?Math.min(1,(eclipseDark-.3)/.15):0;if(skyDay>.001){const op=Math.min(.82,Math.max(0,skyDay*.82));if(op>.005){if(viewMode==="real"){
    /* Nachgebessert: Die reine Umgebungsfarbe (voriger Stand) war insgesamt zu dunkel und
       erzeugte einen harten Sprung genau an der 101-Grad-Schwelle von projReal(), wo die
       Sonne hinter die Kamera wandert. Physikalisch ist der Taghimmel als Ganzes hell, nicht
       nur in Sonnennaehe - deshalb jetzt eine gleichmaessige Grundhelligkeit ueber die
       gesamte Flaeche (unabhaengig von der Blickrichtung, behebt das "zu dunkel"), und
       zusaetzlich, nur wenn die Sonne ueberhaupt projizierbar ist, ein additiver Schein in
       ihrer Naehe obendrauf (mildert den Sprung an der Schwelle, da die Grundhelligkeit dort
       unveraendert bleibt und nur der zusaetzliche Schein entfaellt, statt der gesamten
       Himmelshelligkeit). */
    g.fillStyle=`rgba(70,120,205,${(op*.8).toFixed(3)})`;g.fillRect(_FX,_FY,_FW,_FH);
    if(isFinite(sunP.x)&&isFinite(sunP.y)){
      const _diag=Math.hypot(cvW||W,cvH||W);
      const _sr=_diag*1.1;
      let _sx=sunP.x,_sy=sunP.y;
      const _lim=_diag*.55,_dd=Math.hypot(_sx,_sy);
      if(isFinite(_dd)&&_dd>_lim){_sx=_sx/_dd*_lim;_sy=_sy/_dd*_lim;}
      const dg=g.createRadialGradient(_sx,_sy,0,_sx,_sy,_sr);
      dg.addColorStop(0,`rgba(120,170,235,${(op*.55).toFixed(3)})`);
      dg.addColorStop(1,"rgba(120,170,235,0)");
      g.fillStyle=dg;g.fillRect(_FX,_FY,_FW,_FH);
    }
  }else{
    const _sr=HR*1.6;const _sx=sunP.x,_sy=sunP.y;
    const dg=g.createRadialGradient(_sx,_sy,0,_sx,_sy,_sr);
    dg.addColorStop(0,`rgba(120,170,235,${op})`);
    dg.addColorStop(.5,`rgba(70,120,205,${op*.8})`);
    dg.addColorStop(1,`rgba(30,60,150,${op*.5})`);
    g.fillStyle=dg;g.fillRect(_FX,_FY,_FW,_FH)
  }}}if(sunP.alt>-16&&sunP.alt<8){let tw;if(sunP.alt>=0)tw=Math.max(0,1-sunP.alt/8);else tw=Math.max(0,1-Math.pow(-sunP.alt/16,1.3));const glow=tw*.7*(1-eclipseDark);let horizonX,horizonY,_glowR,sunAz;if(viewMode==="real"){const _Hs=(LST()-sunRD.ra*15)*Math.PI/180,_phi=lat*Math.PI/180,_ds=sunRD.dec*Math.PI/180;sunAz=Math.atan2(Math.sin(_Hs),Math.cos(_Hs)*Math.sin(_phi)-Math.tan(_ds)*Math.cos(_phi));const _Ph=projReal(sunAz,0);horizonX=_Ph.x;horizonY=_Ph.y;_glowR=((Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720))*Math.tan(25*Math.PI/180);}else{sunAz=Math.atan2(sunP.x,sunP.y);horizonX=HR*Math.sin(sunAz);horizonY=HR*Math.cos(sunAz);_glowR=HR*.62;}const gw=g.createRadialGradient(horizonX,horizonY,0,horizonX,horizonY,_glowR);gw.addColorStop(0,`rgba(255,140,50,${(glow*.85).toFixed(2)})`);gw.addColorStop(.28,`rgba(255,110,60,${(glow*.48).toFixed(2)})`);gw.addColorStop(.55,`rgba(200,70,90,${(glow*.2).toFixed(2)})`);gw.addColorStop(.8,`rgba(120,60,130,${(glow*.06).toFixed(2)})`);gw.addColorStop(1,"rgba(60,50,120,0)");g.save();g.globalCompositeOperation="lighter";if(viewMode!=="real"){g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.clip();}const ux=Math.sin(sunAz),uy=Math.cos(sunAz);const px=uy,py=-ux;g.beginPath();g.moveTo(px*HR*2,py*HR*2);g.lineTo(-px*HR*2,-py*HR*2);g.lineTo(-px*HR*2+ux*HR*2,-py*HR*2+uy*HR*2);g.lineTo(px*HR*2+ux*HR*2,py*HR*2+uy*HR*2);g.closePath();if(viewMode!=="real")g.clip();g.fillStyle=gw;g.fillRect(_FX,_FY,_FW,_FH);g.restore();if(sunP.alt>-4&&sunP.alt<3){const beltAz=sunAz+Math.PI;let bx,by,_bR;if(viewMode==="real"){const _Pb=projReal(beltAz,0);bx=_Pb.x;by=_Pb.y;_bR=((Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720))*Math.tan(20*Math.PI/180);}else{bx=HR*.9*Math.sin(beltAz);by=HR*.9*Math.cos(beltAz);_bR=HR*.5;}const bg2=g.createRadialGradient(bx,by,0,bx,by,_bR);const beltI=Math.max(0,1-Math.abs(sunP.alt+.5)/3.5)*.1;bg2.addColorStop(0,`rgba(210,160,190,${beltI.toFixed(2)})`);bg2.addColorStop(.6,`rgba(150,140,200,${(beltI*.5).toFixed(2)})`);bg2.addColorStop(1,"rgba(120,130,190,0)");g.save();g.globalCompositeOperation="lighter";if(viewMode!=="real"){g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.clip();}g.fillStyle=bg2;g.fillRect(_FX,_FY,_FW,_FH);g.restore()}}if(showAlt&&viewMode==="real"){g.save();const _LIM=Math.hypot(cvW||W,cvH||W)*4;for(let a=10;a<90;a+=10){const major=a%30===0;g.strokeStyle=major?"rgba(130,170,225,.30)":"rgba(120,150,200,.16)";g.lineWidth=(major?1:.7)*PX;g.beginPath();let f0=true;for(let A=-180;A<=180;A+=2){const P=projReal(A*Math.PI/180,a*Math.PI/180);if(!isFinite(P.x)||Math.abs(P.x)>_LIM||Math.abs(P.y)>_LIM){f0=true;continue}f0?g.moveTo(P.x,P.y):g.lineTo(P.x,P.y);f0=false}g.stroke()}for(let A=0;A<360;A+=30){g.strokeStyle=(A%90===0)?"rgba(150,190,240,.26)":"rgba(120,150,200,.14)";g.lineWidth=.7*PX;g.beginPath();let f1=true;for(let a=0;a<=86;a+=2){const P=projReal(A*Math.PI/180,a*Math.PI/180);if(!isFinite(P.x)||Math.abs(P.x)>_LIM||Math.abs(P.y)>_LIM){f1=true;continue}f1?g.moveTo(P.x,P.y):g.lineTo(P.x,P.y);f1=false}g.stroke()}g.restore()}else if(showAlt){for(let a=10;a<90;a+=10){const r=(90-a)/90*HR;const major=a%30===0;circ(r,major?"rgba(130,170,225,.28)":"rgba(120,150,200,.15)",(major?1:.7)*PX)}for(let A=0;A<360;A+=30){const a=A*Math.PI/180;g.beginPath();g.moveTo(0,0);g.lineTo(HR*Math.sin(a),HR*Math.cos(a));g.strokeStyle="rgba(120,150,200,.09)";g.lineWidth=.6*PX/zoom;g.stroke()}g.beginPath();g.moveTo(0,-HR);g.lineTo(0,HR);g.strokeStyle="rgba(160,205,250,.55)";g.lineWidth=1.3*PX/zoom;g.setLineDash([6*PX/zoom,4*PX/zoom]);g.stroke();g.setLineDash([]);g.save();g.translate(0,-HR*.5);g.rotate(-Math.PI/2);g.font=`${Math.max(9*PX,HR*.015)*LScale}px Cinzel,serif`;g.textAlign="center";g.textBaseline="bottom";g.fillStyle="rgba(160,205,250,.6)";g.shadowColor="rgba(5,8,20,.9)";g.shadowBlur=4;g.fillText("Meridian",0,-2*PX/zoom);g.restore();g.font=`${Math.max(11*PX,HR*.02)*LScale}px Cinzel,serif`;g.textAlign="center";g.textBaseline="middle";g.fillStyle="rgba(150,185,235,.7)";for(let a=10;a<90;a+=10){const r=(90-a)/90*HR;g.fillText(a+"°",0,r);g.fillText(a+"°",0,-r)}}function mwPoint(ra,de,offDeg){const pc=precess(ra,de+offDeg,jd0);return altazXY(pc.ra,pc.dec,HR)}const mwVisible=MW_CENTER.some(p=>{const pc=precess(p.ra,p.de,jd0);return altazXY(pc.ra,pc.dec,HR).alt>-5});if(mwVisible&&window.didHideMW!==true){
  /* Die Abblendung richtete sich nach "zoom". Im Beobachtermodus bleibt zoom aber
     stets 1, weil dort das Bildfeld verändert wird — die Milchstraße wurde also bei
     Fernrohrvergrößerung unvermindert gezeichnet. Bei 7,6-facher Vergrößerung füllt
     ein einzelner Bandabschnitt rund ein Achtel der Bildbreite, sodass die
     Helligkeitsunterschiede zwischen den Abschnitten als senkrechte Streifen
     hervortraten. Maßgeblich ist jetzt die tatsächliche Vergrößerung, und das Band
     verschwindet oberhalb des Vierfachen ganz. */
  const _mwMag=(typeof zEff==="number"&&isFinite(zEff)&&zEff>0)?zEff:zoom;
  /* Ab etwa 1,2x uebernehmen zunehmend die einzeln aufgeloesten Gaia-Sterne.
     Bei 2x bleibt nur noch knapp die Haelfte des diffusen Leuchtens, bei 3x
     ist es verschwunden. */
  const mwZoomFade=_mwMag<=1.2?1:Math.max(0,1-(_mwMag-1.2)*.56);
  const mwA=window.didHideMWGlow===true?0:Math.min(1,Math.max(0,(nightF-.12)/.6))*mwZoomFade;
  if(mwA>.004){
    /* Das Band wird nicht mehr unmittelbar auf die Zeichenfläche gelegt, sondern
       zuerst in einen Zwischenspeicher mit einem Drittel der Kantenlänge. Beim
       Zurückkopieren wird er weichgezeichnet; damit verschwinden die Fugen
       zwischen den Abschnitten, die als Querstreifen sichtbar waren. Zugleich
       fällt nur ein Neuntel der Füllfläche an, sodass die Mittellinie feiner
       unterteilt werden kann. */
    const _S=3;
    const _cw=Math.max(1,Math.ceil(cv.width/_S)),_ch=Math.max(1,Math.ceil(cv.height/_S));
    let _buf=window.__mwBuf,_blr=window.__mwBlur;
    if(!_buf||_buf.width!==_cw||_buf.height!==_ch){
      _buf=window.__mwBuf=document.createElement("canvas");_buf.width=_cw;_buf.height=_ch;
      _blr=window.__mwBlur=document.createElement("canvas");_blr.width=_cw;_blr.height=_ch;
    }
    const bg=_buf.getContext("2d");
    bg.setTransform(1,0,0,1,0,0);bg.clearRect(0,0,_cw,_ch);
    const _T=g.getTransform();
    bg.setTransform(_T.a/_S,_T.b/_S,_T.c/_S,_T.d/_S,_T.e/_S,_T.f/_S);
    bg.globalCompositeOperation="lighter";
    /* Zaehlt, ob ueberhaupt etwas ins Zwischenbild geraten ist. Blickt man vom Band
       weg, entfielen sonst zwar alle Vierecke, die teure Weichzeichnung und das
       Zurueckkopieren ueber die ganze Zeichenflaeche liefen aber weiterhin. */
    let _mwGemalt=0;
    /* Band: ein Viereck je Abschnitt, quer dazu ein Glockenverlauf. */
    let prev=null;
    for(let i=0;i<MW_SPINE.length;i++){
      const p=MW_SPINE[i];
      const Pt=mwPoint(p.ra,p.de,p.w*MW_HALF),Pb=mwPoint(p.ra,p.de,-p.w*MW_HALF);
      /* Früher entfiel das ganze Viereck, sobald ein Rand unter -8° sank. Weil das
         Band bis zu 20° breit ist, verschwand dadurch schon ein Streifen, dessen
         Mitte noch über dem Horizont stand — das Band brach am Horizont schroff ab.
         Maßgeblich ist jetzt die Bandmitte; was darunter liegt, verdeckt in der
         Beobachteransicht der Boden und in der Kuppelansicht die Kreisbeschneidung. */
      const _obenkante=Pt.alt>Pb.alt?Pt.alt:Pb.alt;
      const cur=(Pt.alt<-900||Pb.alt<-900||(_obenkante<-2&&!orientMode))?null:{t:Pt,b:Pb,bf:p.bf};
      if(prev&&cur){
        const A=MW_PEAK*(prev.bf+cur.bf)*.5;
        if(A>.003&&isFinite(prev.t.x)&&isFinite(cur.b.x)&&isFinite(prev.b.x)&&isFinite(cur.t.x)){
          const x0=(prev.b.x+cur.b.x)*.5,y0=(prev.b.y+cur.b.y)*.5;
          const x1=(prev.t.x+cur.t.x)*.5,y1=(prev.t.y+cur.t.y)*.5;
          if(isFinite(x0)&&isFinite(y0)&&isFinite(x1)&&isFinite(y1)){
            const gr=bg.createLinearGradient(x0,y0,x1,y1);
            for(let k=0;k<MW_PROF.length;k++){
              const st=MW_PROF[k];
              gr.addColorStop(st[0],"rgba("+st[2]+","+(A*st[1]).toFixed(4)+")");
            }
            bg.beginPath();bg.moveTo(prev.t.x,prev.t.y);bg.lineTo(cur.t.x,cur.t.y);
            bg.lineTo(cur.b.x,cur.b.y);bg.lineTo(prev.b.x,prev.b.y);bg.closePath();
            bg.fillStyle=gr;bg.fill();_mwGemalt++;
          }
        }
      }
      prev=cur;
    }
    /* Helle Wolkenfelder als gestreute weiche Flecken */
    for(let i=0;i<MW_BLOBS.length;i++){
      const b=MW_BLOBS[i];if(b.dunkel)continue;
      const pc=precess(b.ra,b.de,jd0),P=altazXY(pc.ra,pc.dec,HR);
      if((P.alt<-14&&!(orientMode&&P.alt>-900))||!isFinite(P.x))continue;
      const r=b.r/90*HR;if(!(r>0))continue;
      mwFleck(bg,P,r,b.b,false);_mwGemalt++;
    }
    /* Weichzeichnen, sofern der Browser Zeichenfilter kennt */
    if(_mwGemalt>0){
    let _quelle=_buf;
    /* Die Weichzeichnung glaettet nur die Fugen zwischen den Bandabschnitten. Sie ist
       die teuerste Einzeloperation des ganzen Bildes: ein Gauss-Filter ueber rund
       0,9 Millionen Bildpunkte, je nach Geraet mehrere Millisekunden. Waehrend einer
       Geste entfaellt sie deshalb; die dreifache Vergroesserung beim Zurueckkopieren
       glaettet ohnehin, und in Bewegung faellt der Unterschied nicht auf. Beim
       Loslassen ist sie im naechsten Bild wieder da. */
    try{
      if(!(interacting>0)&&!orientMode&&typeof CanvasRenderingContext2D!=="undefined"&&"filter" in CanvasRenderingContext2D.prototype){
        const bc=_blr.getContext("2d");
        bc.setTransform(1,0,0,1,0,0);bc.clearRect(0,0,_cw,_ch);
        bc.filter="blur(1.4px)";bc.drawImage(_buf,0,0);bc.filter="none";
        _quelle=_blr;
      }
    }catch(e){}
    g.save();
    g.setTransform(1,0,0,1,0,0);
    g.globalCompositeOperation="lighter";g.globalAlpha=mwA;
    g.imageSmoothingEnabled=true;
    g.drawImage(_quelle,0,0,_cw*_S,_ch*_S);
    g.restore();
    }
  }
}
/* Die Dunkelwolken gehoeren nicht zum diffusen Leuchten, sondern sind Staub, der das
   Licht dahinter verschluckt. Sie loesen sich bei Vergroesserung nicht in Sterne auf
   und bleiben deshalb sichtbar, waehrend das Band ab etwa vierfacher Vergroesserung
   verschwindet. Gezeichnet werden sie erst nach den Sternen, damit sie die dahinter
   stehenden tatsaechlich verdecken - vorher lagen sie darunter und blieben wirkungslos. */
let _mwDunkelGemalt=false;
window.__mwDunkel=()=>{
  if(_mwDunkelGemalt)return;
  if(!mwVisible||window.didHideMW===true)return;
  const a=Math.min(1,Math.max(0,(nightF-.15)/.6))*.95;
  if(!(a>.004))return;
  _mwDunkelGemalt=true;
  /* Die Deckkraft waechst mit der Vergroesserung. Bei freiem Auge soll die Wolke nur
     eine Tiefenstruktur im Band andeuten, sonst wirkte sie plakativ. Erst wenn das
     diffuse Leuchten verschwunden ist und einzelne Sterne dahinter stehen, muss sie so
     stark schlucken wie ein echter Dunkelnebel: bei einfacher Vergroesserung 0,12 bis
     0,30 Groessenklassen wie bisher, bei achtfacher 0,46 bis 1,60 - das Mass des
     Grossen Risses im Schwan. Darueber bleibt es dabei, weil dichtere Wolken sonst
     voellig undurchsichtig wuerden. */
  const _mv=(typeof zVis==="number"&&isFinite(zVis)&&zVis>0)?zVis:1;
  const _verst=Math.min(3.2,1+(_mv-1)*.35);
  g.save();
  g.globalAlpha=a;
  /* Der Riss als durchgehendes Band: je zwei benachbarte Punkte der Mittellinie
     spannen ein Viereck auf, quer dazu liegt ein Verlauf, der in der Mitte am
     dunkelsten ist und zu den Raendern ausklingt. Dieselbe Bauform wie beim hellen
     Band, nur abdunkelnd. Unterbrochen wird, sobald ein Punkt hinter der Kamera
     liegt oder das Stueck ganz ausserhalb des Bildes faellt. */
  {/* Der Riss wird nicht unmittelbar auf die Zeichenflaeche gelegt, sondern - genau wie
      das helle Band - zuerst in einen Zwischenspeicher mit einem Drittel der Kantenlaenge
      und beim Zurueckkopieren weichgezeichnet. Ohne das traten die Fugen zwischen den
      41 Vierecken als harte Streifen quer durch das Band hervor, weil der Querverlauf
      je Viereck neu angesetzt wird und an der Naht springt. Waehrend einer Geste
      entfaellt die Weichzeichnung, wie beim hellen Band auch. */
   const _rS=3;
   const _rw=Math.max(1,Math.ceil(cv.width/_rS)),_rh=Math.max(1,Math.ceil(cv.height/_rS));
   let _rbuf=window.__rfBuf,_rblr=window.__rfBlur;
   if(!_rbuf||_rbuf.width!==_rw||_rbuf.height!==_rh){
     _rbuf=window.__rfBuf=document.createElement("canvas");_rbuf.width=_rw;_rbuf.height=_rh;
     _rblr=window.__rfBlur=document.createElement("canvas");_rblr.width=_rw;_rblr.height=_rh;
   }
   const rg=_rbuf.getContext("2d");
   rg.setTransform(1,0,0,1,0,0);rg.clearRect(0,0,_rw,_rh);
   const _rT=g.getTransform();
   rg.setTransform(_rT.a/_rS,_rT.b/_rS,_rT.c/_rS,_rT.d/_rS,_rT.e/_rS,_rT.f/_rS);
   let gemalt=0;
   /* Feste Staerke statt der Staffelung nach Vergroesserung, die von den Dunkelwolken
      stammt und fuer den Riss verkehrt herum wirkte: Sie machte ihn bei einfacher
      Vergroesserung am schwaechsten - dort ist das Band aber am hellsten und der Riss
      sein auffaelligstes Merkmal ueberhaupt. Der feste Wert wirkt in beiden Bereichen
      zugleich richtig: Solange das Band da ist, schneidet er es zu rund drei Vierteln
      weg; ist es verschwunden, bleiben 1,4 Groessenklassen Abschwaechung fuer die
      dahinterstehenden Sterne - nahe den 1,5 des wirklichen Grossen Risses. */
   const grund=.85;
   for(let sIdx=0;sIdx<MW_RIFT.length;sIdx++){
    const STR=MW_RIFT[sIdx];
    let vor=null;
    for(let i=0;i<STR.length;i++){
     const p=STR[i];
     const Pt=mwPoint(p.ra,p.de,p.w),Pb=mwPoint(p.ra,p.de,-p.w);
     const gueltig=(Pt.alt>-900&&Pb.alt>-900&&isFinite(Pt.x)&&isFinite(Pb.x)&&
       ((Pt.alt>-2||Pb.alt>-2)||orientMode));
     const jetzt=gueltig?{t:Pt,b:Pb,s:p.s}:null;
     if(vor&&jetzt){
       const st=Math.min(.97,grund*(vor.s+jetzt.s)*.5);
       if(st>.004&&!_streckeDraussen(vor.t.x,vor.t.y,jetzt.b.x,jetzt.b.y)){
         const x0=(vor.b.x+jetzt.b.x)*.5,y0=(vor.b.y+jetzt.b.y)*.5;
         const x1=(vor.t.x+jetzt.t.x)*.5,y1=(vor.t.y+jetzt.t.y)*.5;
         if(isFinite(x0)&&isFinite(y0)&&isFinite(x1)&&isFinite(y1)){
           const gr=rg.createLinearGradient(x0,y0,x1,y1);
           for(let k=0;k<MW_RIFT_PROF.length;k++){
             const q=MW_RIFT_PROF[k];
             gr.addColorStop(q[0],"rgba(4,6,18,"+(st*q[1]).toFixed(4)+")");
           }
           rg.beginPath();rg.moveTo(vor.t.x,vor.t.y);rg.lineTo(jetzt.t.x,jetzt.t.y);
           rg.lineTo(jetzt.b.x,jetzt.b.y);rg.lineTo(vor.b.x,vor.b.y);rg.closePath();
           rg.fillStyle=gr;rg.fill();gemalt++;
         }
       }
     }
     vor=jetzt;
    }
   }
   if(gemalt>0){
     let _rq=_rbuf;
     try{
       if(!(interacting>0)&&!orientMode&&typeof CanvasRenderingContext2D!=="undefined"&&"filter" in CanvasRenderingContext2D.prototype){
         const rc=_rblr.getContext("2d");
         rc.setTransform(1,0,0,1,0,0);rc.clearRect(0,0,_rw,_rh);
         /* 2,4 statt 1,6 Bildpunkte: Seit der Riss mit fester Staerke 0,85 gezeichnet wird,
            reichte die schwaechere Glaettung nicht mehr - die Naehte zwischen den Vierecken
            traten als Treppenmuster hervor. Je kraeftiger die Kante, desto mehr Glaettung. */
         rc.filter="blur(2.4px)";rc.drawImage(_rbuf,0,0);rc.filter="none";
         _rq=_rblr;
       }
     }catch(e){}
     g.save();
     g.setTransform(1,0,0,1,0,0);
     g.imageSmoothingEnabled=true;
     g.drawImage(_rq,0,0,_rw*_rS,_rh*_rS);
     g.restore();
   }}
  for(let i=0;i<MW_BLOBS.length;i++){
    const b=MW_BLOBS[i];if(!b.dunkel)continue;
    const pc=precess(b.ra,b.de,jd0),P=altazXY(pc.ra,pc.dec,HR);
    if((P.alt<-14&&!(orientMode&&P.alt>-900))||!isFinite(P.x))continue;
    const r=b.r/90*HR;if(!(r>0))continue;
    mwFleck(g,P,r,Math.min(.97,b.b*_verst),true);
  }
  g.restore();
};
/* Gaia enthaelt bereits beobachtete, durch interstellaren Staub abgeschwaechte
   Helligkeiten. Deshalb liegt die synthetische Dunkelstruktur nur ueber dem
   diffusen Milchstrassenhintergrund und unter den Katalogsternen. */
try{window.__mwDunkel()}catch(e){}
function decCircle(decDeg){g.beginPath();let prev=null,started=false;const step=.08,lstH=LST()/15;/* Ein vollstaendiger Deklinationskreis ist im lokalen Horizontsystem ortsfest.
     Feste Rektaszensions-Stuetzpunkte verschoben sich jedoch mit der Sternzeit entlang
     derselben Kurve und liessen die Polygonnaeherung sichtbar kriechen. Mit festen
     Stundenwinkeln bleiben auch die Stuetzpunkte pixelgenau stehen. */for(let hourAngle=-12;hourAngle<=12.001;hourAngle+=step){const raH=lstH-hourAngle;const P=altazXY(raH,decDeg,HR);const cur={x:P.x,y:P.y,alt:P.alt};if(prev){const a=prev,b=cur;/* Liegt einer der beiden Punkte hinter der Kamera, ist seine Bildlage keine Zahl.
     Dann wird der Linienzug sauber unterbrochen, statt in die Zwischenwertrechnung zu
     laufen — die ergaebe NaN und ein moveTo(NaN), was eine Strecke quer durchs Bild
     ziehen kann, die sich beim Schwenken mitbewegt. */if(!isFinite(a.x)||!isFinite(a.y)||!isFinite(b.x)||!isFinite(b.y)){started=false}else if(_altV(a.alt)>=0&&_altV(b.alt)>=0){if(!started){g.moveTo(a.x,a.y);started=true}g.lineTo(b.x,b.y)}else if(_altV(a.alt)>=0&&_altV(b.alt)<0){const t=a.alt/(a.alt-b.alt);const ix=a.x+(b.x-a.x)*t,iy=a.y+(b.y-a.y)*t;if(!started){g.moveTo(a.x,a.y);started=true}g.lineTo(ix,iy);started=false}else if(_altV(a.alt)<0&&_altV(b.alt)>=0){const t=-a.alt/(b.alt-a.alt);const ix=a.x+(b.x-a.x)*t,iy=a.y+(b.y-a.y)*t;g.moveTo(ix,iy);g.lineTo(b.x,b.y);started=true}}prev=cur}}if(showRefCircles&&!didConst){g.save();g.globalAlpha=Math.max(.45,nightF);g.setLineDash([5*PX/zoom,4*PX/zoom]);decCircle(0);g.strokeStyle="rgba(120,200,235,.6)";g.lineWidth=1.4*PX/zoom;g.stroke();const obl=oblR(jd0)*180/Math.PI;decCircle(obl);g.strokeStyle="rgba(255,190,90,.5)";g.lineWidth=1.2*PX/zoom;g.stroke();decCircle(-obl);g.strokeStyle="rgba(255,190,90,.5)";g.lineWidth=1.2*PX/zoom;g.stroke();const circDec=90-Math.abs(lat);if(circDec<90&&window.didHideCirc!==true){decCircle(lat>=0?circDec:-circDec);g.strokeStyle="rgba(150,230,170,.55)";g.lineWidth=1.3*PX/zoom;g.stroke()}g.setLineDash([]);if(!(window.didacticSimulationMode==='solar-year')&&window.didHidePrec!==true){/* Präzessionskreis: als J2000-Sternhimmelskreis berechnet und anschließend wie Sterne ins gewählte Jahr präzediert. */const eps=obl;const epRA=18*15,epDec=90-eps;const epDr=epDec*Math.PI/180,epRr=epRA*Math.PI/180,rr=eps*Math.PI/180;g.beginPath();let started=false,prev=null;for(let pa=0;pa<=360.5;pa+=2){const par=pa*Math.PI/180;const dec=Math.asin(Math.sin(epDr)*Math.cos(rr)+Math.cos(epDr)*Math.sin(rr)*Math.cos(par));const dRA=Math.atan2(Math.sin(par)*Math.sin(rr)*Math.cos(epDr),Math.cos(rr)-Math.sin(epDr)*Math.sin(dec));const ra=epRr+dRA;const raH=(ra*180/Math.PI%360+360)%360/15;const pc=precess(raH,dec*180/Math.PI,jd0);const P=altazXY(pc.ra,pc.dec,HR);const cur={x:P.x,y:P.y,alt:P.alt};if(prev){if(!isFinite(prev.x)||!isFinite(prev.y)||!isFinite(cur.x)||!isFinite(cur.y)){started=false}else if(_altV(prev.alt)>=0&&_altV(cur.alt)>=0){if(!started){g.moveTo(prev.x,prev.y);started=true}g.lineTo(cur.x,cur.y)}else if(_altV(prev.alt)>=0&&_altV(cur.alt)<0){const t=prev.alt/(prev.alt-cur.alt);if(!started){g.moveTo(prev.x,prev.y);started=true}g.lineTo(prev.x+(cur.x-prev.x)*t,prev.y+(cur.y-prev.y)*t);started=false}else if(_altV(prev.alt)<0&&_altV(cur.alt)>=0){const t=-prev.alt/(cur.alt-prev.alt);g.moveTo(prev.x+(cur.x-prev.x)*t,prev.y+(cur.y-prev.y)*t);g.lineTo(cur.x,cur.y);started=true}}prev=cur}g.strokeStyle="rgba(190,160,235,.5)";g.lineWidth=1.2*PX/zoom;g.stroke();/* Der Himmelsnordpol steht in der lokalen Horizontansicht immer im geografischen Norden auf Breitenhöhe. Die Präzession zeigt sich durch die verschobenen Sternkoordinaten, nicht durch einen wandernden Nordpunkt. */const Pole=altazXY(0,90,HR);if(Pole.alt>0){const pr=Math.max(4*PX,HR*.012)*LScale;g.save();g.strokeStyle="rgba(210,225,255,.85)";g.lineWidth=1.3*PX/zoom;g.beginPath();g.moveTo(Pole.x-pr,Pole.y);g.lineTo(Pole.x+pr,Pole.y);g.moveTo(Pole.x,Pole.y-pr);g.lineTo(Pole.x,Pole.y+pr);g.stroke();g.beginPath();g.arc(Pole.x,Pole.y,pr,0,Math.PI*2);g.strokeStyle="rgba(210,225,255,.6)";g.lineWidth=1*PX/zoom;g.stroke();g.font=`bold ${Math.max(13*PX,HR*.028)*LScale}px Cinzel,serif`;g.fillStyle="rgba(225,235,255,.95)";g.textAlign="center";g.textBaseline="middle";g.shadowColor="rgba(5,8,20,.95)";g.shadowBlur=5;g.fillText("N",Pole.x+pr*2.2,Pole.y-pr*1.2);if(showNames){g.font=`${Math.max(8*PX,HR*.015)*LScale}px Cinzel,serif`;g.fillStyle="rgba(210,225,255,.78)";g.fillText("Himmelsnordpol",Pole.x+pr*3.0,Pole.y+pr*1.4)}g.restore()}if(showNames){const pep=precess(epRA/15,epDec,jd0);const Pep=altazXY(pep.ra,pep.dec,HR);if(Pep.alt>2){g.save();g.font=`italic ${Math.max(9*PX,HR*.017)*LScale}px Cinzel,serif`;g.fillStyle="rgba(200,175,240,.75)";g.textAlign="center";g.shadowColor="rgba(5,4,12,.9)";g.shadowBlur=4;g.fillText("Präzessionskreis",Pep.x,Pep.y);g.restore()}}}if(showNames){g.font=`${Math.max(11*PX,HR*.02)*LScale}px Cinzel,serif`;g.textAlign="center";g.textBaseline="middle";const labelAt=(decDeg,txt,col)=>{const lstH=LST()/15;const P=altazXY(lstH,decDeg,HR);if(P.alt>2){g.save();g.globalAlpha=.7;g.shadowColor="rgba(5,8,20,.9)";g.shadowBlur=4;g.fillStyle=col;g.fillText(txt,P.x,P.y);g.restore()}};labelAt(0,"Himmelsäquator","rgba(150,210,240,.8)");labelAt(obl,"Wendekreis +"+obl.toFixed(1).replace(".",",")+"°","rgba(255,200,110,.75)");labelAt(-obl,"Wendekreis −"+obl.toFixed(1).replace(".",",")+"°","rgba(255,200,110,.75)");if(circDec<90&&window.didHideCirc!==true)labelAt(lat>=0?circDec:-circDec,"Zirkumpolar","rgba(160,235,180,.8)")}g.restore();if(!didConst&&window.didHideEcl!==true){const eclStep=Math.max(.3,1.5/Math.max(1,zoom*.6));/* Kurvenpunkte (Rektaszension/Deklination -> Bildschirm) einmal je Bild berechnen statt dreimal: die drei folgenden Striche (Schimmer, mittel, duenn) unterscheiden sich nur in Strichstaerke/Farbe, nicht in der Geometrie. */const _eclPts=[];for(let lon=0;lon<=361;lon+=eclStep){const rd=ecl2rd(lon,0,jd0);const P=altazXY(rd.ra,rd.dec,HR);_eclPts.push(_altAb(P.alt,-2)?null:P)}function eclPathReplay(){g.beginPath();let f=true;for(const P of _eclPts){if(P===null){f=true;continue}f?g.moveTo(P.x,P.y):g.lineTo(P.x,P.y);f=false}}eclPathReplay();g.strokeStyle="rgba(200,150,40,.08)";g.lineWidth=3.5*PX/zoom;g.lineCap="round";g.shadowColor="#aa8830";g.shadowBlur=4;g.stroke();g.shadowBlur=0;eclPathReplay();g.strokeStyle="rgba(190,150,55,.38)";g.lineWidth=1.4*PX/zoom;g.stroke();eclPathReplay();g.strokeStyle="rgba(205,170,90,.55)";g.lineWidth=.7*PX/zoom;g.stroke();g.lineCap="butt";if(window.didacticSimulationMode!=="precession"){const Tn=(jd0-2451545)/36525;const Omega=((125.0445-1934.1362*Tn)%360+360)%360;const incl=5.145;const _mDist=(function(){try{return moonEcl(jd0).dist}catch(e){return 385000}})();const colN="rgba(175,215,255,",colS="rgba(110,160,235,";g.save();g.globalAlpha=Math.max(.4,nightF);let prev=null,prevBeta=0;const mbStep=Math.max(.25,1/Math.max(1,zoom*.6));for(let lon=0;lon<=361;lon+=mbStep){const u=(lon-Omega)*Math.PI/180;const beta=incl*Math.sin(u);const rd=ecl2rd(lon,beta,jd0);const P=altazXY(rd.ra,rd.dec,HR);if(_altAb(P.alt,-2)){prev=null;continue}if(prev){const north=beta+prevBeta>=0;const col=north?colN:colS;const a=north?1:.85;g.beginPath();g.moveTo(prev.x,prev.y);g.lineTo(P.x,P.y);g.strokeStyle=col+a+")";g.lineWidth=.7*PX/zoom;g.stroke()}prev=P;prevBeta=beta}[Omega,(Omega+180)%360].forEach((nodeLon,i)=>{const rd=ecl2rd(nodeLon,0,jd0);const P=altazXY(rd.ra,rd.dec,HR);if(P.alt>=-2){g.beginPath();g.arc(P.x,P.y,2.4*PX/zoom,0,Math.PI*2);g.strokeStyle=i===0?"rgba(180,215,255,.85)":"rgba(140,180,235,.8)";g.lineWidth=1.2*PX/zoom;g.stroke();if(showNames){g.font=`${Math.max(13*PX,HR*.026)*LScale}px serif`;g.fillStyle=i===0?"rgba(190,220,255,.95)":"rgba(150,190,240,.9)";g.textAlign="center";g.textBaseline="middle";g.save();g.shadowColor="rgba(5,8,20,.95)";g.shadowBlur=4;g.fillText(i===0?"☊":"☋",P.x,P.y-HR*.028*LScale);g.restore()}}});g.restore()}}}if((showZodiac||window.__zodiacOn)&&!didConst){window.__drawingZodiac=true;const _prevUnify=window.__V9_UNIFY_LABELS;window.__V9_UNIFY_LABELS=false;if(!(showRefCircles&&window.didHideEcl!==true)){/* Kurve nur zeichnen, wenn der showRefCircles-Block sie nicht schon gezeichnet hat - sonst lag die Ekliptik zweifach uebereinander (gleiche Formel, gleiche Farbe). */const eclStepZ=Math.max(.3,1.5/Math.max(1,zoom*.6));const _eclPtsZ=[];for(let lon=0;lon<=361;lon+=eclStepZ){const rd=ecl2rd(lon,0,jd0);const P=altazXY(rd.ra,rd.dec,HR);_eclPtsZ.push(_altAb(P.alt,-2)?null:P)}const eclPathZReplay=()=>{g.beginPath();let f=true;for(const P of _eclPtsZ){if(P===null){f=true;continue}f?g.moveTo(P.x,P.y):g.lineTo(P.x,P.y);f=false}};eclPathZReplay();g.strokeStyle="rgba(200,150,40,.08)";g.lineWidth=3.5*PX/zoom;g.lineCap="round";g.shadowColor="#aa8830";g.shadowBlur=4;g.stroke();g.shadowBlur=0;eclPathZReplay();g.strokeStyle="rgba(190,150,55,.38)";g.lineWidth=1.4*PX/zoom;g.stroke();eclPathZReplay();g.strokeStyle="rgba(205,170,90,.55)";g.lineWidth=.7*PX/zoom;g.stroke();g.lineCap="butt"}const ZNAME=["Widder","Stier","Zwillinge","Krebs","Löwe","Jungfrau","Waage","Skorpion","Schütze","Steinbock","Wassermann","Fische"];g.font=`italic ${Math.max(11*PX,HR*.026)*LScale}px Cinzel,serif`;g.textAlign="center";g.textBaseline="middle";for(let i=0;i<12;i++){const lon=i*30+15;const rd=ecl2rd(lon,0,jd0);const P=altazXY(rd.ra,rd.dec,HR);if(_altAb(P.alt,2))continue;const rdA=ecl2rd(lon-3,0,jd0),rdB=ecl2rd(lon+3,0,jd0);const PA=altazXY(rdA.ra,rdA.dec,HR),PB=altazXY(rdB.ra,rdB.dec,HR);let ang=Math.atan2(PB.y-PA.y,PB.x-PA.x);if(ang>Math.PI/2)ang-=Math.PI;else if(ang<-Math.PI/2)ang+=Math.PI;g.save();g.globalAlpha=Math.max(.5,nightF*.9);g.translate(P.x,P.y);g.rotate(ang);g.shadowColor="rgba(5,4,12,.95)";g.shadowBlur=4;g.fillStyle="rgba(235,205,135,.92)";g.fillText(ZNAME[i],0,-HR*.022/zoom);g.restore()}window.__V9_UNIFY_LABELS=_prevUnify;window.__drawingZodiac=false;}if(showLines){g.globalAlpha=nightF;Object.entries(LINES).forEach(([ck,ls])=>{if(didConst&&ck!==focusConstellation)return;ls.forEach(([a,b])=>{const sa=SM[a],sb=SM[b];if(!sa||!sb)return;const pa=starPC(sa,jd0),pb=starPC(sb,jd0);const PA=altazXY(pa.ra,pa.dec,HR),PB=altazXY(pb.ra,pb.dec,HR);if(!_altOK(PA.alt)||!_altOK(PB.alt))return;if(_streckeDraussen(PA.x,PA.y,PB.x,PB.y))return;g.beginPath();g.moveTo(PA.x,PA.y);g.lineTo(PB.x,PB.y);g.strokeStyle=didConst?"rgba(190,215,255,.52)":"rgba(120,175,255,.5)";g.lineWidth=(didConst?Math.max(1.2,1.9*PX):Math.max(1.2,1.7*PX))/zoom;g.stroke()})});if(!didConst)Object.entries(LINES2).forEach(([,segs])=>{segs.forEach(([ra1,de1,ra2,de2])=>{const pa=precess(ra1,de1,jd0),pb=precess(ra2,de2,jd0);const PA=altazXY(pa.ra,pa.dec,HR),PB=altazXY(pb.ra,pb.dec,HR);if(!_altOK(PA.alt)||!_altOK(PB.alt))return;if(_streckeDraussen(PA.x,PA.y,PB.x,PB.y))return;g.beginPath();g.moveTo(PA.x,PA.y);g.lineTo(PB.x,PB.y);g.strokeStyle="rgba(120,175,255,.42)";g.lineWidth=Math.max(1,1.4*PX)/zoom;g.stroke()})});g.globalAlpha=1}const magLimit=5.6+(zEff-1)*.28;let dayLimMag=-99;let daySkyMag=22;const sunFactor=Math.max(0,Math.min(1,(sunP.alt+6)/18));if(sunFactor>0){const H_scale=6e3,p0=1013;const hAlt=(Math.max(1,Math.min(10,zEff))-1)/9*1e5;const pRatio=Math.exp(-hAlt/H_scale);const Lratio=Math.pow(10,(22-4)/2.5);const Llin=1+(Lratio-1)*pRatio*sunFactor;daySkyMag=22-2.5*Math.log10(Llin);dayLimMag=daySkyMag-4.5}STARS.forEach(s=>{const pc=starPC(s,jd0);const P=altazXY(pc.ra,pc.dec,HR);if(!_altOK(P.alt))return;if(!_imBild(P.x,P.y))return;const mag=s.mag,[cr,cg,cb]=sCol(s.n);const focusStar=didConst&&s.c===focusConstellation;if(!focusStar&&mag>magLimit)return;const mClamp=Math.min(6.2,Math.max(-1.5,mag)),orientStyle=orientMode?orientStarStyle(mag,PX/zoom):null;let r=orientStyle?orientStyle.rad:Math.max(.55,.75+.2*(3.5-Math.min(3.5,mClamp)))*PX/zoom;if(focusStar)r*=1.85;let glowR=orientStyle?orientStyle.glow:(mClamp<3.8?1.4+.95*(3.8-mClamp):0)*PX/zoom;if(focusStar)glowR=Math.max(glowR,3.6*PX/zoom);const baseOp=orientStyle?orientStyle.op:mag<0?1:mag<1?.96:mag<2?.9:mag<3?.8:mag<4?.7:mag<4.5?.6:.52;const eclContrib=mag<1.5?eclBrightStars*(mag<0?.9:mag<1?.7:.45):0;let dayContrib=0;{const sfSoft=Math.max(0,Math.min(1,(sunP.alt+18)/30));if(sfSoft>0){const Lratio=Math.pow(10,(22-4)/2.5);const hAlt=(Math.max(1,Math.min(10,zEff))-1)/9*1e5;const pRatio=Math.exp(-hAlt/6e3);const Llin=1+(Lratio-1)*pRatio*sfSoft;const limSoft=22-2.5*Math.log10(Llin)-4.5;if(mag<limSoft){const above=limSoft-mag;let vis=Math.max(0,Math.min(1,above/1.5));const altR=Math.max(2,P.alt)*Math.PI/180;const airmass=1/Math.sin(altR);const extMag=.145*airmass*Math.exp(-hAlt/6e3);const extF=Math.pow(10,-.4*extMag);dayContrib=vis*extF}}}const effF=Math.max(nightF,eclContrib,dayContrib);const sinA=Math.sin(P.alt*Math.PI/180);/* Unter dem Horizont liefert die Abschwaechung durch die Lufthuelle null; im Lagemodus
        verwendet Build 20260809s eine gedimmte Ersatzhelligkeit. */let op=Math.min(1,baseOp*effF)*(sinA>0?extBySinAlt(sinA):1);if(focusStar)op=Math.max(op,.95);if(op<.02)return;const rc=reddenRGB(cr,cg,cb,sinA),cr2=rc[0],cg2=rc[1],cb2=rc[2];if(glowR>.6){const gr=g.createRadialGradient(P.x,P.y,0,P.x,P.y,glowR);gr.addColorStop(0,`rgba(${cr2},${cg2},${cb2},${(op*.38).toFixed(3)})`);gr.addColorStop(.45,`rgba(${cr2},${cg2},${cb2},${(op*.13).toFixed(3)})`);gr.addColorStop(1,`rgba(${cr2},${cg2},${cb2},0)`);g.beginPath();g.arc(P.x,P.y,glowR,0,Math.PI*2);g.fillStyle=gr;g.fill()}g.beginPath();g.arc(P.x,P.y,r,0,Math.PI*2);g.fillStyle=`rgb(${cr2},${cg2},${cb2})`;g.globalAlpha=op;g.fill();g.globalAlpha=1;if(focusStar){g.beginPath();g.arc(P.x,P.y,r*2.25,0,Math.PI*2);g.strokeStyle="rgba(230,245,255,.26)";g.lineWidth=Math.max(.55,.8*PX)/zoom;g.stroke()}/* Im Beobachtermodus zeigt der kleinere Ausschnitt weniger Sterne zugleich. Dort
        koennen deshalb die Namen bis mindestens 3,4 mag eingeblendet werden. Mit wachsender
        Vergroesserung steigt die Grenze behutsam bis 4,0 mag. Lagemodus und Kuppel behalten
        die bisherige Grenze 1,8 mag. */const starNameLimit=viewMode==="real"?Math.min(4,3.4+.3*Math.log2(Math.max(1,zEff))):orientMode?5:1.8;if(((showNames&&(mag<starNameLimit||s.n==="Polaris"))||focusStar)&&s.n){g.globalAlpha=focusStar?1:Math.max(.35,nightF*.8)*Math.max(0,Math.min(1,(op-.02)/.12));setBodyLabelStyle("star");g.textAlign="left";g.textBaseline="middle";g.fillText(s.n==="Polaris"?"Polarstern":s.n,P.x+r+2*PX/zoom,P.y);g.globalAlpha=1}if(s.n)clickable.push({sx:ORX+panX+zoom*P.x,sy:ORY+panY+zoom*P.y,type:"star",name:s.n,mag:s.mag,con:s.c,alt:P.alt,ra:s.ra,de:s.de})});if(BSC.length){if(bscPrecTargetYear!==simYear){bscPrecTargetYear=simYear;bscPrecCursor=0}if(bscPrecCursor<BSC.length&&!(typeof interacting!=="undefined"&&interacting>0)&&!_tierJob){const CHUNK=12000;const end=Math.min(BSC.length,bscPrecCursor+CHUNK);for(let i=bscPrecCursor;i<end;i++){const pc=precess(BSC[i].ra,BSC[i].de,jd0);BSC[i].pra=pc.ra;BSC[i].pde=pc.dec}bscPrecCursor=end;if(bscPrecCursor>=BSC.length){bscPrecYear=simYear;lastBscPrec=performance.now()}}if(_GAIA){if(gaiaPrecTargetYear!==simYear){gaiaPrecTargetYear=simYear;gaiaPrecCursor=0}if(gaiaPrecCursor<_GAIA.N&&!(typeof interacting!=="undefined"&&interacting>0)&&!_tierJob){const G=_GAIA;const CHUNKG=12000;const end=Math.min(G.N,gaiaPrecCursor+CHUNKG);const _gmC=_vondrak(jd0);for(let i=gaiaPrecCursor;i<end;i++){const ra0=G.ra[i]*(360/4294967296)/15,de0=G.de[i]*(90/2147483648);const r0=ra0*.2617993877991494,d0=de0*.017453292519943295,cd=Math.cos(d0);const x0=cd*Math.cos(r0),y0=cd*Math.sin(r0),z0=Math.sin(d0);const xd=_gmC.m00*x0+_gmC.m01*y0+_gmC.m02*z0;const yd=_gmC.m10*x0+_gmC.m11*y0+_gmC.m12*z0;const zd=_gmC.m20*x0+_gmC.m21*y0+_gmC.m22*z0;G.ex[i]=xd;G.ey[i]=yd;G.ez[i]=zd}gaiaPrecCursor=end}}let bgLimit=Math.min(15.5,_gaiaGrenzmag(zEff));if(interacting>0&&!_GAIA)bgLimit=Math.min(bgLimit,8);if(_GAIA)bgLimit=Math.min(bgLimit,_GAIA.magMax+.05);const rbg=1.25*PX/zoom;const lstDeg=LST(),phi=lat*Math.PI/180,sinPhi=Math.sin(phi),cosPhi=Math.cos(phi);const _lstR=lstDeg*Math.PI/180,cosLST=Math.cos(_lstR),sinLST=Math.sin(_lstR);const twoOverPiR=HR/(Math.PI/2);const _rm=(viewMode==="real"),_rAc=camAz*Math.PI/180,_rHc=camAlt*Math.PI/180,_rcc=Math.cos(_rHc),_rsc=Math.sin(_rHc),_rsA=Math.sin(_rAc),_rcA=Math.cos(_rAc),_rf2=(Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720);const margin=20*PX;const vx0=(-ORX-panX-margin)/zoom,vx1=((cvW||W)-ORX-panX+margin)/zoom;const vy0=(-ORY-panY-margin)/zoom,vy1=((cvH||W)-ORY-panY+margin)/zoom;/* Sichtkegel: Mittelrichtung und Winkelradius des Bildausschnitts, einmal je Bild.
   Damit lässt sich jeder Stern mit einem Skalarprodukt verwerfen, bevor Zenitdistanz,
   Wurzel und Bildlage überhaupt gerechnet werden. Der Radius ist bewusst großzügig:
   In der abstandstreuen Kuppelabbildung ist der ebene Abstand nie kleiner als der
   wahre Winkelabstand, der Test also stets auf der sicheren Seite. Bei kleiner
   Vergrößerung wird er abgeschaltet, weil dann ohnehin fast alles sichtbar ist. */
let _cullX=0,_cullY=0,_cullZ=0,_cullCos=-2;{let _cAlt,_cAz,_angR;
  if(_rm){_cAz=camAz*Math.PI/180;_cAlt=camAlt*Math.PI/180;/* Stereografisch gilt r=f·tan(θ/2). Der frühere fehlende Faktor 2 halbierte den Sichtkegel und ließ Gaia-Sterne am Bildrand erst nach einem Schwenk erscheinen. */_angR=2*Math.atan(Math.hypot((cvW||W),(cvH||W))/2/_rf2)+.03;}
  else{const _xc=(vx0+vx1)/2,_yc=(vy0+vy1)/2,_rc=Math.hypot(_xc,_yc);
    _cAz=(_rc>1e-9)?Math.atan2(_xc,_yc):0;_cAlt=Math.PI/2-_rc/twoOverPiR;
    _angR=Math.hypot(vx1-vx0,vy1-vy0)/2/twoOverPiR+.03;}
  if(_angR<1.35){const _cch=Math.cos(_cAlt),_hu=Math.sin(_cAz)*_cch,_hv=Math.cos(_cAz)*_cch,_hs=Math.sin(_cAlt);
    /* Horizont- zurück ins Äquatorsystem: die Abbildung ist orthonormal, ihre
       Umkehrung also die gespiegelte Matrix. */
    _cullX=sinLST*_hu+sinPhi*cosLST*_hv+cosPhi*cosLST*_hs;
    _cullY=-cosLST*_hu+sinPhi*sinLST*_hv+cosPhi*sinLST*_hs;
    _cullZ=-cosPhi*_hv+sinPhi*_hs;_cullCos=Math.cos(_angR);}}
/* Flusserhaltendes Gaia-LOD fuer den unbegrenzten dunklen Himmel: Reale
   schwache Quellen werden bei 1x als feine Punktstichprobe addiert. Keine
   Rasterzelle und kein synthetischer Schimmer ist beteiligt. Beim Zoomen
   uebernehmen sukzessive die vollstaendigen Sichtfeldkacheln. */
/* Im Beobachtermodus zeichnet WebGL dieselben vorbereiteten Dichtevektoren.
   Canvas 2D bleibt ausschliesslich als Kompatibilitaets- und Lagemoduspfad. */
/* Das freigegebene PC-Bild ab 900 CSS-Pixel kurzer Kante bleibt exakt
   unveraendert. Nur kleinere Anzeigen erhalten ein eigenes Dichteprofil.
   CSS-Pixel verhindern, dass ein hochaufloesendes Handy als Desktop gilt. */
const _gaiaCssShort=Math.min((cvW||W)/Math.max(1,PX),(cvH||W)/Math.max(1,PX));
const _gaiaCssLong=Math.max((cvW||W)/Math.max(1,PX),(cvH||W)/Math.max(1,PX));
const _gaiaScreenScale=(_gaiaCssLong>=1100||_gaiaCssShort>=900)?1:_gaiaCssShort<=420?.32:
  .32+.68*Math.pow((_gaiaCssShort-420)/480,.9);
const _gaiaDichteGpuMoeglich=_gaiaGLInit();
if(_gaiaDichte&&_gaiaDichte.sample&&!_gaiaDichteGpuMoeglich&&(window.skyMagBase||6.5)>=6.49&&nightF>.18){
  const fade=Math.max(0,Math.min(1,(3.4-zEff)/2.4));
  if(fade>.01){
    const D=_gaiaDichte,halos=Array.from({length:13},()=>new Path2D()),dm=_vondrak(jd0),size=Math.max(.32,Math.min(.62,(_rm?PX:PX/zoom)*.42));
    for(let cell=0;cell<D.gRA*D.gDE;cell++){
      const ri=cell%D.gRA,di=Math.floor(cell/D.gRA),cra=(ri+.5)/D.gRA*Math.PI*2,cde=((di+.5)/D.gDE*Math.PI-Math.PI/2),ccd=Math.cos(cde);
      const cx0=ccd*Math.cos(cra),cy0=ccd*Math.sin(cra),cz0=Math.sin(cde);
      const dichteStufe=D.boost?D.boost[cell]:0;
      const CX=dm.m00*cx0+dm.m01*cy0+dm.m02*cz0,CY=dm.m10*cx0+dm.m11*cy0+dm.m12*cz0,CZ=dm.m20*cx0+dm.m21*cy0+dm.m22*cz0;
      /* Ganze 7,5°-Kacheln ausserhalb des Sichtkegels werden verworfen, bevor
         auch nur ein Stern daraus transformiert wird. */
      if(_cullCos>-1.5&&(CX*_cullX+CY*_cullY+CZ*_cullZ)<_cullCos-.12)continue;
      for(let i=D.verz[cell];i<D.verz[cell+1];i++){
      const j=i*3,x0=D.v[j],y0=D.v[j+1],z0=D.v[j+2];
      const X=dm.m00*x0+dm.m01*y0+dm.m02*z0,Y=dm.m10*x0+dm.m11*y0+dm.m12*z0,Z=dm.m20*x0+dm.m21*y0+dm.m22*z0;
      if(_cullCos>-1.5&&(X*_cullX+Y*_cullY+Z*_cullZ)<_cullCos)continue;
      const cD=cosLST*X+sinLST*Y,sinAlt=sinPhi*Z+cosPhi*cD;if(sinAlt<0)continue;
      const u=sinLST*X-cosLST*Y,v=cD*sinPhi-Z*cosPhi,w=Math.sqrt(u*u+v*v);
      let x,y;
      if(_rm){
        /* Beobachtermodus besitzt eine eigene stereografische Kamera. Der
           Tiefen-Layer wurde bisher absichtlich ausgeschlossen und war daher
           trotz geladenem Gaia-Katalog unsichtbar. Dieselben realen Vektoren
           werden nun durch exakt dieselbe Kamera wie Sterne und Sternbilder
           projiziert. */
        /* Direkte Vektorprojektion statt atan2 -> asin -> projReal. Das ist
           mathematisch dieselbe stereografische Kamera, spart aber pro Stern
           mehrere teure trigonometrische Funktionen. */
        const d=u*_rsA*_rcc+v*_rcA*_rcc+sinAlt*_rsc;
        if(d<=-0.2)continue;
        const pu=u*_rcA-v*_rsA,pv=u*(-_rsA*_rsc)+v*(-_rcA*_rsc)+sinAlt*_rcc,q=_rf2/(1+d);
        x=q*pu;y=-q*pv;
      }else{
        const r=Math.acos(Math.max(-1,Math.min(1,sinAlt)))*twoOverPiR,k=w>1e-12?r/w:0;
        x=k*u;y=k*v;
      }
      if(!_imBild(x,y))continue;
      const bucket=Math.min(12,Math.max(0,Math.floor(Math.log2(1+D.light[i])*1.45)+dichteStufe));
        /* Ein Katalogpunkt repraesentiert beim Uebersichts-LOD mehrere tiefere
           Gaia-Quellen. Ihr Licht darf nicht verschwinden: Ein sehr schwacher,
           additiver Halo erhaelt den aufsummierten Fluss. Erst viele in der
           Sichtlinie dicht liegende Quellen bilden dadurch eine Flaechenhelligkeit;
           ausserhalb der Milchstrasse bleibt der Hintergrund dunkel. */
        const haloR=size*(4.0+bucket*.20)*_gaiaScreenScale;
        halos[bucket].moveTo(x+haloR,y);halos[bucket].arc(x,y,haloR,0,Math.PI*2);
      }
    }
    g.save();g.globalCompositeOperation="lighter";g.fillStyle="rgb(166,184,220)";
    /* Die Halo-Pass ist das flusserhaltende Tiefenbild. Die Wurzel aus dem
       Stichprobenfaktor verhindert Ueberbelichtung, gleicht aber aus, dass nur
       jede 32. schwache Quelle als Vektor gespeichert ist. */
    const fluxAusgleich=Math.sqrt(Math.max(1,D.stride||1));
    /* Etwa fuenf Pixel Glaettung entsprechen in der 1x-Augenansicht einem
       nicht mehr einzeln aufloesbaren Sternhintergrund. Der vorherige kleine
       Blur von 1,35 px liess jeden Stichprobenpunkt als koerniges Rauschen
       erkennen und machte den gesamten Himmel statt nur der galaktischen
       Ebene grau. */
    const tiefenZoom=Math.max(1,_rm?zEff:zoom);
    /* Breite Fluss-Pass: macht die gemeinsame Leuchtdichte der nicht
       aufgeloesten Gaia-Sterne auch mit dem dunkeladaptierten Auge sichtbar. */
    g.filter=`blur(${Math.max(2.4,5.8*PX/Math.sqrt(tiefenZoom))}px)`;
    for(let b=0;b<halos.length;b++){
      g.globalAlpha=Math.min(.30,fade*nightF*fluxAusgleich*.0062*Math.pow(1.20,b))*_gaiaScreenScale;
      g.fill(halos[b]);
    }
    /* Struktur-Pass: deutlich schwaecher und feiner. So bleiben Verdichtungen
       und Staubunterbrechungen erkennbar, ohne dass wieder einzelne
       Stichprobenpunkte als digitales Rauschen erscheinen. */
    g.filter=`blur(${Math.max(1.25,2.35*PX/Math.sqrt(tiefenZoom))}px)`;
    for(let b=0;b<halos.length;b++){
      g.globalAlpha=Math.min(.11,fade*nightF*fluxAusgleich*.00155*Math.pow(1.18,b))*_gaiaScreenScale;
      g.fill(halos[b]);
    }
    g.filter="none";g.restore();
  }
}
/* Gaia BP-RP-Farbindex wird einmal in 32 leicht entsättigte Farbstufen
   umgerechnet. Der Renderpfad verwendet danach nur noch Tabellenzugriffe. */
const _gaiaColorLut=window.__gaiaColorLut||(window.__gaiaColorLut=Array.from({length:32},(_,i)=>{const bp=-1+i/31*6,st=[[-1,170,200,255],[0,205,222,255],[.6,240,244,255],[1,255,246,220],[1.6,255,211,160],[2.5,255,166,105],[5,255,137,92]];let a=st[0],b=st[st.length-1];for(let j=1;j<st.length;j++)if(bp<=st[j][0]){a=st[j-1];b=st[j];break}const t=Math.max(0,Math.min(1,(bp-a[0])/(b[0]-a[0]||1))),m=.72;return `rgb(${Math.round(255+(a[1]+(b[1]-a[1])*t-255)*m)},${Math.round(255+(a[2]+(b[2]-a[2])*t-255)*m)},${Math.round(255+(a[3]+(b[3]-a[3])*t-255)*m)})`}));
g.fillStyle="rgb(228,231,240)";let curOp=-1;const corners=[];const _NS=12;for(let _i=0;_i<=_NS;_i++){const _t=_i/_NS;corners.push([vx0+(vx1-vx0)*_t,vy0]);corners.push([vx0+(vx1-vx0)*_t,vy1])}for(let _i=1;_i<_NS;_i++){const _t=_i/_NS;corners.push([vx0,vy0+(vy1-vy0)*_t]);corners.push([vx1,vy0+(vy1-vy0)*_t])}corners.push([(vx0+vx1)/2,(vy0+vy1)/2]);let raLo=99,raHi=-99,decLo=99,decHi=-99,wrapRA=false;const lstH=lstDeg/15;let anyValid=false;for(const[cx,cy]of corners){const rr=Math.hypot(cx,cy);const altC=Math.PI/2-rr/twoOverPiR;if(altC<-.3)continue;anyValid=true;const Az=Math.atan2(cx,cy);const sinDec=sinPhi*Math.sin(altC)-cosPhi*Math.cos(altC)*Math.cos(Az);const dec=Math.asin(Math.max(-1,Math.min(1,sinDec)))*180/Math.PI;const cosH=(Math.sin(altC)-sinPhi*sinDec)/(cosPhi*Math.cos(Math.asin(sinDec))||1e-6);const H=Math.acos(Math.max(-1,Math.min(1,cosH)))*(Az>0?1:-1);const ra=((lstH-H*12/Math.PI)%24+24)%24;if(dec<decLo)decLo=dec;if(dec>decHi)decHi=dec;if(ra<raLo)raLo=ra;if(ra>raHi)raHi=ra}let useFull=!anyValid||zoom<2.5||raHi-raLo>12||orientMode;let di0,di1,riList=null;if(useFull){/* Im Lagemodus wird der ganze Himmel gebraucht. Sonst schraenkt die Auswahl die
     Deklination auf das ein, was ueberhaupt ueber den Horizont steigen kann — bei
     52,5 Grad Nord auf -39,5 Grad und damit auf die Zellenreihen ab -45 Grad. Alles
     suedlicher, also Achernar, Acrux, Miaplacidus bis zum Suedpol, fiel heraus; sichtbar
     blieben dort nur die benannten Sterne, die aus einer eigenen Liste stammen.
     Die Vorauswahl ueber den Sichtkegel verwirft das Ueberzaehlige ohnehin mit drei
     Multiplikationen je Stern, sodass der volle Bereich hier nicht ins Gewicht faellt. */if(orientMode){di0=0;di1=GRID_DEC-1}else{const decMin=lat-92,decMax=92,decMinN=lat<0?-92:decMin,decMaxN=lat<0?lat+92:decMax;di0=Math.max(0,Math.floor((decMinN+90)/180*GRID_DEC));di1=Math.min(GRID_DEC-1,Math.floor((decMaxN+90)/180*GRID_DEC))}}else{const dm=8;di0=Math.max(0,Math.floor((decLo-dm+90)/180*GRID_DEC));di1=Math.min(GRID_DEC-1,Math.floor((decHi+dm+90)/180*GRID_DEC));const rm=.6;const r0=Math.floor(((raLo-rm)%24+24)%24/24*GRID_RA);const r1=Math.floor(((raHi+rm)%24+24)%24/24*GRID_RA);riList=[];if(r0<=r1){for(let ri=r0;ri<=r1;ri++)riList.push(ri)}else{for(let ri=r0;ri<GRID_RA;ri++)riList.push(ri);for(let ri=0;ri<=r1;ri++)riList.push(ri)}}const drawCell=cell=>{for(let k=0;k<cell.length;k++){const s=cell[k];if(s.mag>bgLimit)break;if(_GAIA&&s.mag<=_GAIA.magMax+.05)continue;if(s.pra===undefined)continue;const H=(lstDeg-s.pra*15)*Math.PI/180;const dr=s.pde*Math.PI/180;const sinAlt=sinPhi*Math.sin(dr)+cosPhi*Math.cos(dr)*Math.cos(H);if(sinAlt<0&&!(_rm&&orientMode))continue;const alt=Math.asin(sinAlt);const A=Math.atan2(Math.sin(H),Math.cos(H)*sinPhi-Math.tan(dr)*cosPhi);let x,y;if(_rm){const _ch=Math.cos(alt),_px=Math.sin(A)*_ch,_py=Math.cos(A)*_ch,_pz=sinAlt;const _d=_px*_rsA*_rcc+_py*_rcA*_rcc+_pz*_rsc;if(_d<=-0.2)continue;const _u=_px*_rcA-_py*_rsA,_v=_px*(-_rsA*_rsc)+_py*(-_rcA*_rsc)+_pz*_rcc;const _q=_rf2/(1+_d);x=_q*_u;y=-_q*_v;}else{const r=(Math.PI/2-alt)*twoOverPiR;x=r*Math.sin(A);y=r*Math.cos(A);}if(x<vx0||x>vx1||y<vy0||y>vy1)continue;let baseOp,rad;if(s.mag<2){baseOp=.95;rad=rbg*1.45}else if(s.mag<3.5){baseOp=.8;rad=rbg*1.25}else if(s.mag<5){baseOp=.62;rad=rbg*1.08}else if(s.mag<6.5){baseOp=.5;rad=rbg*.95}else if(s.mag<8){baseOp=.42;rad=rbg*.85}else if(s.mag<10){baseOp=.36;rad=rbg*.78}else if(s.mag<12){baseOp=.32;rad=rbg*.72}else{baseOp=.28;rad=rbg*.66}const op=Math.round(baseOp*nightF*(sinAlt>0?extBySinAlt(sinAlt):.55)*50)/50;if(op<.03)continue;if(op!==curOp){g.globalAlpha=op;curOp=op}/* Bei dunklem Standort werden gut viertausend Sterne je Bild gezeichnet. Alles ab
   5 mag erhält deshalb ein Quadrat statt eines Kreises – bei zwei bis drei
   Bildpunkten Kantenlänge ist das nicht zu unterscheiden, kostet aber weniger als
   die Hälfte. Der Vergleich mit rbg statt mit einer festen Zahl hält die Grenze
   unabhängig vom Punktverhältnis des Geräts. */
if(op!==curOp){g.globalAlpha=op;curOp=op}if(rad<1.1||rad<=rbg*.96){g.fillRect(x-rad,y-rad,rad*2,rad*2)}else{g.beginPath();g.arc(x,y,rad,0,Math.PI*2);g.fill()}}};const _gM=_GAIA?_vondrak(jd0):null;
  /* Gaming-Vorschau: Während einer Schwenk- oder Zoomgeste wird nur der
     bis 8,5 mag reichende Vordergrund projiziert. Nach dem Loslassen folgen
     automatisch die vollständige Basisstufe und die tiefen Gaia-Kacheln. */
  const _gaiaFast=!_planetGaiaMaximum()&&((typeof interacting!=="undefined"&&interacting>0)||window.__skyRenderQuality<2);
  /* Jede Gaia-Zelle ist nach Helligkeit sortiert. Eine temporaere Magnitudengrenze
     beendet die Zellschleife deshalb frueh und spart nicht nur Zeichen-, sondern
     auch Projektionsarbeit. Der bisherige Test schaltete den Schnellpfad gerade
     am dunklen Standort ab, obwohl dort der tiefste Katalog die meiste Arbeit
     verursacht. Hoher Zoom vertraegt mehr Tiefe, weil der Sichtkegel kleiner ist. */
  if(_gaiaFast){const fastMag=zEff>=4?9:zEff>=2?8.3:7.4;bgLimit=Math.min(bgLimit,fastMag)}
  /* Deterministisches Punktwolken-LOD: Die sichtbare Himmelsflaeche nimmt
     ungefaehr quadratisch mit dem Zoom ab. Im gleichen Verhaeltnis wird der
     Katalog feiner abgetastet. So bleibt die Sternzahl im Bild stabil, waehrend
     zuvor zusammengefasste schwache Sterne beim Hineinzoomen einzeln erscheinen.
     Helle Sterne bis 6,5 mag bleiben in jeder Stufe vollstaendig erhalten. */
  /* 36 statt 100: Das erste LOD war in dichten Milchstrassenfeldern zu grob
     und zeigte bei 2,7x nur jeden 14. schwachen Stern. Jetzt ist es dort etwa
     jeder 5.; die Punktzahl bleibt beim Zoomen weiterhin annaehend konstant. */
  const _gaiaLODStride=_planetGaiaMaximum()?1:Math.max(window.__skyRenderQuality===0?3:window.__skyRenderQuality===1?2:1,Math.round(16/Math.max(1,zEff*zEff)));
  const drawGaia=(zk,katalog)=>{
    const G=katalog||_GAIA;if(!G)return;
    let curColor=-1;
    const a=G.verz[zk],b=G.verz[zk+1];if(a>=b)return;
    /* Sternreiche Gaia-Zellen werden feiner abgetastet als duenne Felder.
       Dadurch bleibt die reale Dichte der Milchstrasse bereits in der
       Uebersicht erkennbar, ohne erfundene Leuchtpunkte zu erzeugen. */
    const roheDichte=Math.max(1,Math.min(8,Math.sqrt((b-a)/180)));
    /* Bei 1x bleibt die schwache Population zusammengefasst. Das verhindert
       den unnatuerlichen weissen Sternteppich; mit dem Zoom wird die reale
       Gaia-Ueberdichte kontinuierlich in Einzelsterne aufgeloest. */
    const aufloesung=Math.max(0,Math.min(1,(zEff-1)/2));
    const dichteBoost=1+(roheDichte-1)*aufloesung;
    const zellStride=Math.max(1,Math.round(_gaiaLODStride/dichteBoost));
    /* Keine Gaia-Quelle wird verworfen: Unterhalb der optischen Aufloesung
       steckt ihr Fluss bereits in der geglaetteten Tiefenebene. Als einzelner
       Punkt erscheint sie erst, wenn die Vergroesserung sie aufloesen kann.
       Dadurch zeigt 1x nur augennahe Sterne, waehrend 2x/4x sukzessive bis
       etwa 9,2/11,6 mag in Einzelquellen uebergehen. */
    const aufloesungsMag=6.8+Math.max(0,Math.log2(Math.max(1,zEff)))*2.4;
    const lim=Math.min(bgLimit,aufloesungsMag);
    for(let i=a;i<b;i++){
      const mag=G.magMin+G.mg[i]*G.magStep;
      if(mag>lim)break;
      if(mag>6.5&&zellStride>1){
        const h=((Math.imul(i+1,2654435761)^Math.imul(zk+1,2246822519))>>>0);
        if(h%zellStride!==0)continue;
      }
      let X,Y,Z;
      if(G===_GAIA&&i<gaiaPrecCursor){X=G.ex[i];Y=G.ey[i];Z=G.ez[i];}
      else{
        let x0,y0,z0;
        if(G.vector){x0=G.vx[i];y0=G.vy[i];z0=G.vz[i];}
        else{
          const ra=G.ra[i]*(360/4294967296)/15,de=G.de[i]*(90/2147483648);
          const r0=ra*.2617993877991494,d0=de*.017453292519943295,cd=Math.cos(d0);
          x0=cd*Math.cos(r0);y0=cd*Math.sin(r0);z0=Math.sin(d0);
        }
        if(_gM){
          X=_gM.m00*x0+_gM.m01*y0+_gM.m02*z0;
          Y=_gM.m10*x0+_gM.m11*y0+_gM.m12*z0;
          Z=_gM.m20*x0+_gM.m21*y0+_gM.m22*z0;
        }else{X=x0;Y=y0;Z=z0;}
      }
      if(_cullCos>-1.5&&(X*_cullX+Y*_cullY+Z*_cullZ)<_cullCos)continue;
      /* cD = cos(δ)·cos(H), u = cos(δ)·sin(H), v = cos(δ)cos(H)sinφ − sin(δ)cosφ.
         Damit ist (u, v, sinAlt) unmittelbar der Richtungsvektor im Horizontsystem
         und sqrt(u²+v²) = cos(Höhe) — ohne eine einzige Winkelfunktion. */
      const cD=cosLST*X+sinLST*Y;
      const sinAlt=sinPhi*Z+cosPhi*cD;
      /* In der Beobachteransicht werden auch Sterne unter dem Horizont gezeichnet;
         die Kuppelansicht behaelt ihren gestauchten Ring ausserhalb des Kreises. */
      if(sinAlt<0&&!(_rm&&orientMode))continue;
      const _u=sinLST*X-cosLST*Y, _v=cD*sinPhi-Z*cosPhi;
      let x,y;
      if(_rm){const _px=_u,_py=_v,_pz=sinAlt;
        const _d=_px*_rsA*_rcc+_py*_rcA*_rcc+_pz*_rsc;if(_d<=-0.2)continue;
        const _uu=_px*_rcA-_py*_rsA,_vv=_px*(-_rsA*_rsc)+_py*(-_rcA*_rsc)+_pz*_rcc;
        const _q=_rf2/(1+_d);x=_q*_uu;y=-_q*_vv;}
      else{const w=Math.sqrt(_u*_u+_v*_v);
        const r=Math.acos(sinAlt>1?1:sinAlt)*twoOverPiR;
        const k=w>1e-12?r/w:0;x=k*_u;y=k*_v;}
      if(x<vx0||x>vx1||y<vy0||y>vy1)continue;
      /* Die scheinbare Helligkeit ist logarithmisch. Zuvor bekamen alle Gaia-
         Sterne ab 8 mag pauschal 36 % Deckkraft. In einem dunklen Feld wurden
         dadurch Millionen physikalisch sehr schwache Quellen fast gleich hell
         und die Milchstrasse erschien als weisser Punkterasen. Die neue Kurve
         komprimiert den enormen realen Dynamikumfang fuer das Display, erhaelt
         aber die Rangfolge: helle Sterne besitzen einen groesseren Kern, tiefe
         Katalogsterne tragen nur noch feine Leuchtdichte zur Milchstrasse bei.
         Das LOD fasst ausgelassene schwache Quellen leicht zusammen, ohne aus
         jeder Stichprobe einen auffaelligen Einzelstern zu machen. */
      const faint=Math.max(0,mag-6.5);
      const lodFlux=mag>6.5?Math.min(1.65,Math.pow(zellStride,.22)):1;
      /* Im Fernrohr schrumpft der Himmelsausschnitt quadratisch. Die bisherige
         Punktdeckkraft blieb jedoch auf dem Wert der 1x-Augenansicht, während
         der diffuse Tiefenlayer schon bei 3,4x endete. So waren die geladenen
         9- bis 11,5-mag-Sterne zwar vorhanden, aber praktisch unsichtbar.
         Der Kontrastgewinn wächst behutsam logarithmisch mit der Vergrößerung;
         er verändert weder Position noch Anzahl der Gaia-Quellen. */
      const telescopeGain=_rm?Math.min(2.45,1+.62*Math.log2(Math.max(1,zEff))):1;
      const orientStyle=orientMode?orientStarStyle(mag,rbg):null;
      const baseOp=orientStyle?orientStyle.op:mag<2?.98:mag<3.5?.88:mag<5?.68:mag<6.5?.48:
        Math.max(.035,.30*Math.pow(10,-.18*faint))*lodFlux*telescopeGain;
      const rad=orientStyle?orientStyle.rad:mag<2?rbg*1.55:mag<3.5?rbg*1.30:mag<5?rbg*1.08:
        mag<6.5?rbg*.90:rbg*Math.max(_rm?.48:.36,.72-.055*faint);
      const op=orientMode?baseOp*nightF*(sinAlt>0?extBySinAlt(sinAlt):(mag>5.2?0:.75)):Math.round(baseOp*nightF*(sinAlt>0?extBySinAlt(sinAlt):.55)*50)/50;
      if(op<.03)continue;
      if(op!==curOp){g.globalAlpha=op;curOp=op}
      if(G.fb){const colorBin=Math.min(31,G.fb[i]>>3);if(colorBin!==curColor){g.fillStyle=_gaiaColorLut[colorBin];curColor=colorBin}}
      if(rad<1.1||rad<=rbg*.96){g.fillRect(x-rad,y-rad,rad*2,rad*2)}
      else{g.beginPath();g.arc(x,y,rad,0,Math.PI*2);g.fill()}
    }
  };
  const _sichtZellen=[];
  for(let di=di0;di<=di1;di++){
    const _sichtZelleHinzufuegen=ri=>{
      const zk=di*GRID_RA+ri;
      /* Im Beobachter- und Lagemodus ganze Katalogzellen vorab am
         Kamerakegel verwerfen. So werden nur Zellen des sichtbaren Ausschnitts
         an Basis-, Gaia- und Streaming-Katalog weitergereicht. */
      if(_rm&&_cullCos>-1.5){
        const ra=(ri+.5)/GRID_RA*Math.PI*2,de=(di+.5)/GRID_DEC*Math.PI-Math.PI/2,cd=Math.cos(de);
        const x0=cd*Math.cos(ra),y0=cd*Math.sin(ra),z0=Math.sin(de),dm=_gM;
        const X=dm?dm.m00*x0+dm.m01*y0+dm.m02*z0:x0;
        const Y=dm?dm.m10*x0+dm.m11*y0+dm.m12*z0:y0;
        const Z=dm?dm.m20*x0+dm.m21*y0+dm.m22*z0:z0;
        if(X*_cullX+Y*_cullY+Z*_cullZ<_cullCos-.13)return;
      }
      _sichtZellen.push(zk);
    };
    if(riList){for(const ri of riList)_sichtZelleHinzufuegen(ri)}
    else for(let ri=0;ri<GRID_RA;ri++)_sichtZelleHinzufuegen(ri);
  }
  _gaiaStreamPruefen(_sichtZellen,bgLimit);
  /* Der kompakte Basiskatalog wird in einem einzigen GPU-Aufruf gezeichnet.
     Die bereits sichtfeldbezogen geladenen Tiefenkacheln bleiben im 2D-Pfad;
     sie wechseln dynamisch und waeren als staendig neu hochzuladende Puffer
     langsamer. Der Lagemodus benutzt vorerst ebenfalls den 2D-Pfad, weil dort
     die kameraabhaengige Photometrie eine andere Kennlinie besitzt. */
  const _gaiaGpuLimit=_planetGaiaMaximum()?bgLimit:Math.min(bgLimit,6.8+Math.max(0,Math.log2(Math.max(1,zEff)))*2.4);
  const _gaiaGpuTief=new Map(),_gaiaGpuKataloge=_GAIA?[_GAIA]:[];
  if(!_gaiaFast){const gesehen=new Set();for(const zk of _sichtZellen){const tief=_gaiaStreamFuerZelle(zk);if(tief){_gaiaGpuTief.set(zk,tief);if(!gesehen.has(tief)){gesehen.add(tief);_gaiaGpuKataloge.push(tief)}}}}
  if(!_GAIA)_gaiaGLHide();
  /* Die vorab berechnete Gaia-Leuchtdichte ist klein und bleibt bei jeder
     Interaktion aktiv. Sie wird auch bei vertikalen Richtungsbewegungen neu
     projiziert, statt ein altes WebGL-Bild festzuhalten. Dadurch verschwindet
     die Milchstraße weder beim Klicken noch beim Schwenken oder Zeitstellen. */
  const _gaiaGpuDensity=_gaiaDichteGpuMoeglich&&_gaiaDichte&&(window.skyMagBase||6.5)>=6.49&&nightF>.18?_gaiaDichte:null;
  const _gaiaGpuBase=!!_GAIA&&_gaiaGLDraw(_gaiaGpuKataloge,{M:_gM,cosLST,sinLST,sinPhi,cosPhi,
    panX,panY,twoOverPiR,rf2:_rf2,rsA:_rsA,rcA:_rcA,rcc:_rcc,rsc:_rsc,ORX,ORY,
    vx0,vx1,vy0,vy1,cullX:_cullX,cullY:_cullY,cullZ:_cullZ,cullCos:_cullCos,lim:_gaiaGpuLimit,stride:_gaiaLODStride,zoom:zEff,real:_rm,
    allowBelow:_rm&&orientMode,night:nightF,point:_rm?rbg:1.25*PX,
    densityScreen:_gaiaScreenScale,density:_gaiaGpuDensity});
  /* Tiefe Sichtfeldkacheln niemals waehrend einer Schwenkgeste durchlaufen.
     Gerade bei "dunkel" enthielten sie hunderttausende Quellen, die der
     Fast-Magnitude-Filter anschliessend ohnehin verwarf. Das volle Bild wird
     im Abschlussbild unmittelbar nach pointerup wieder gezeichnet. */
  if(starGrid){for(const zk of _sichtZellen){drawCell(starGrid[zk]);if(!_gaiaGpuBase)drawGaia(zk);if(!_gaiaFast&&!_gaiaGpuBase){const tief=_gaiaGpuTief.get(zk);if(tief)drawGaia(zk,tief)}}}g.globalAlpha=1}try{if(window.__mwDunkel)window.__mwDunkel()}catch(e){}/* Deep-Sky-Objekte werden in jeder Ansicht gezeichnet. Die Grenzgroesse hat einen
   Sockel von 5,5 mag, was bei einfacher Vergroesserung 16 der 110 Messier-Objekte
   zeigt - ungefaehr das, was dem blossen Auge unter dunklem Himmel zugaenglich ist.
   Ob ein Objekt als Wolke in wahrer Gestalt oder als Sinnbild erscheint, entscheidet
   drawGestalt anhand seiner Groesse im Bild. */
if(zVis>0.5){const mLimit=Math.max(5.5,4+(zVis-1.2)*1.6);const sz=Math.max(3*PX,5*PX)/zoom;g.save();/* Die wenigen wirklich ausgedehnten Objekte werden in ihrer wahren Gestalt
   gezeichnet statt als Sinnbild: große und kleine Achse in Grad und der
   Stellungswinkel der großen Achse, von Nord über Ost gezählt. Die Richtung im
   Bild ergibt sich aus der Abbildung der beiden Achsenenden, sodass Drehung und
   Verzerrung der jeweiligen Ansicht von selbst stimmen. */
const AUSGEDEHNT={
  "IC434":{a:1.5,b:0.5,pa:0,c:"230,150,140"}, /* Pferdekopfnebel */
  "IC5070":{a:1.0,b:0.833,pa:0,c:"230,150,140"}, /* Pelikannebel */
  "M1":{a:0.133,b:0.067,pa:0,c:"220,160,180"}, /* Krebsnebel */
  "M8":{a:0.75,b:0.5,pa:0,c:"230,150,140"}, /* Lagunennebel */
  "M16":{a:2.0,b:0.417,pa:0,c:"230,150,140"}, /* Adlernebel */
  "M17":{a:0.21,b:0.21,pa:0,c:"230,150,140"}, /* Omeganebel */
  "M20":{a:0.467,b:0.467,pa:0,c:"230,150,140"}, /* Trifidnebel */
  "M24":{a:2.0,b:1.0,pa:90.0,c:"222,226,244"}, /* M24 */
  "M27":{a:0.112,b:0.112,pa:0,c:"120,220,200"}, /* Hantelnebel */
  "M31":{a:2.964,b:1.161,pa:35.0,c:"210,220,248"}, /* Andromedagalaxie */
  "M32":{a:0.129,b:0.081,pa:170.0,c:"210,220,248"}, /* M32 */
  "M33":{a:1.035,b:0.612,pa:23.0,c:"210,220,248"}, /* Dreiecksgalaxie */
  "M42":{a:1.5,b:1.0,pa:0,c:"230,150,140"}, /* Orionnebel */
  "M43":{a:0.333,b:0.25,pa:0,c:"230,150,140"}, /* M43 */
  "M49":{a:0.17,b:0.14,pa:156.0,c:"210,220,248"}, /* M49 */
  "M51":{a:0.229,b:0.195,pa:163.0,c:"210,220,248"}, /* Strudelgalaxie */
  "M57":{a:0.021,b:0.021,pa:0,c:"120,220,200"}, /* Ringnebel */
  "M58":{a:0.083,b:0.064,pa:90.0,c:"210,220,248"}, /* M58 */
  "M59":{a:0.076,b:0.053,pa:165.0,c:"210,220,248"}, /* M59 */
  "M60":{a:0.113,b:0.091,pa:105.0,c:"210,220,248"}, /* M60 */
  "M61":{a:0.115,b:0.109,pa:20.0,c:"210,220,248"}, /* M61 */
  "M63":{a:0.197,b:0.119,pa:103.0,c:"210,220,248"}, /* Sonnenblumengalaxie */
  "M64":{a:0.175,b:0.089,pa:114.0,c:"210,220,248"}, /* Blackeye-Galaxie */
  "M65":{a:0.127,b:0.033,pa:173.0,c:"210,220,248"}, /* M65 */
  "M66":{a:0.171,b:0.077,pa:168.0,c:"210,220,248"}, /* M66 */
  "M74":{a:0.165,b:0.155,pa:87.0,c:"210,220,248"}, /* M74 */
  "M76":{a:0.019,b:0.019,pa:0,c:"120,220,200"}, /* Kl.Hantelnebel */
  "M77":{a:0.102,b:0.093,pa:12.0,c:"210,220,248"}, /* M77 */
  "M78":{a:0.075,b:0.075,pa:0,c:"230,150,140"}, /* M78 */
  "M81":{a:0.36,b:0.188,pa:157.0,c:"210,220,248"}, /* Bodes Galaxie */
  "M82":{a:0.183,b:0.085,pa:66.0,c:"210,220,248"}, /* Zigarrengalaxie */
  "M83":{a:0.227,b:0.22,pa:45.0,c:"210,220,248"}, /* Südl.Feuerrad */
  "M84":{a:0.123,b:0.107,pa:133.0,c:"210,220,248"}, /* M84 */
  "M85":{a:0.116,b:0.089,pa:12.0,c:"210,220,248"}, /* M85 */
  "M86":{a:0.192,b:0.14,pa:128.0,c:"210,220,248"}, /* M86 */
  "M87":{a:0.119,b:0.111,pa:153.0,c:"210,220,248"}, /* M87 */
  "M88":{a:0.144,b:0.073,pa:138.0,c:"210,220,248"}, /* M88 */
  "M89":{a:0.136,b:0.133,pa:150.0,c:"210,220,248"}, /* M89 */
  "M90":{a:0.152,b:0.064,pa:22.0,c:"210,220,248"}, /* M90 */
  "M91":{a:0.092,b:0.075,pa:150.0,c:"210,220,248"}, /* M91 */
  "M94":{a:0.129,b:0.111,pa:105.0,c:"210,220,248"}, /* M94 */
  "M95":{a:0.121,b:0.074,pa:11.0,c:"210,220,248"}, /* M95 */
  "M96":{a:0.138,b:0.092,pa:5.0,c:"210,220,248"}, /* M96 */
  "M97":{a:0.06,b:0.06,pa:0,c:"120,220,200"}, /* Eulennebel */
  "M98":{a:0.184,b:0.044,pa:152.0,c:"210,220,248"}, /* M98 */
  "M99":{a:0.084,b:0.079,pa:23.0,c:"210,220,248"}, /* M99 */
  "M100":{a:0.102,b:0.094,pa:108.0,c:"210,220,248"}, /* M100 */
  "M101":{a:0.4,b:0.385,pa:28.0,c:"210,220,248"}, /* Feuerradgalaxie */
  "M102":{a:0.105,b:0.045,pa:126.0,c:"210,220,248"}, /* M102 */
  "M104":{a:0.141,b:0.082,pa:90.0,c:"210,220,248"}, /* Sombrerogalaxie */
  "M105":{a:0.081,b:0.071,pa:71.0,c:"210,220,248"}, /* M105 */
  "M106":{a:0.283,b:0.121,pa:150.0,c:"210,220,248"}, /* M106 */
  "M108":{a:0.066,b:0.028,pa:79.0,c:"210,220,248"}, /* M108 */
  "M109":{a:0.135,b:0.094,pa:78.0,c:"210,220,248"}, /* M109 */
  "M110":{a:0.27,b:0.16,pa:170.0,c:"210,220,248"}, /* M110 */
  "NGC40":{a:0.013,b:0.013,pa:0,c:"120,220,200"}, /* NGC40 */
  "NGC55":{a:0.497,b:0.051,pa:101.0,c:"210,220,248"}, /* NGC55 */
  "NGC246":{a:0.068,b:0.068,pa:0,c:"120,220,200"}, /* NGC246 */
  "NGC253":{a:0.447,b:0.076,pa:53.0,c:"210,220,248"}, /* Bildhauer-Galaxie */
  "NGC281":{a:0.583,b:0.5,pa:0,c:"230,150,140"}, /* Pacman-Nebel */
  "NGC300":{a:0.324,b:0.218,pa:114.0,c:"210,220,248"}, /* NGC300 */
  "NGC891":{a:0.217,b:0.05,pa:22.0,c:"210,220,248"}, /* NGC891 */
  "NGC1316":{a:0.224,b:0.129,pa:50.0,c:"210,220,248"}, /* Fornax A */
  "NGC1499":{a:2.667,b:0.667,pa:0,c:"230,150,140"}, /* Kaliforniennebel */
  "NGC1535":{a:0.014,b:0.014,pa:0,c:"120,220,200"}, /* NGC1535 */
  "NGC2070":{a:0.267,b:0.267,pa:0,c:"230,150,140"}, /* Tarantelnebel */
  "NGC2174":{a:0.667,b:0.5,pa:0,c:"230,150,140"}, /* Affenkopfnebel */
  "NGC2237":{a:1.333,b:0.833,pa:0,c:"230,150,140"}, /* Rosettennebel */
  "NGC2392":{a:0.014,b:0.014,pa:0,c:"120,220,200"}, /* Eskimonebel */
  "NGC2403":{a:0.332,b:0.168,pa:126.0,c:"210,220,248"}, /* NGC2403 */
  "NGC3242":{a:0.007,b:0.007,pa:0,c:"120,220,200"}, /* Jupiters Geist */
  "NGC4038":{a:0.09,b:0.063,pa:80.0,c:"210,220,248"}, /* Antennengalaxien */
  "NGC4565":{a:0.279,b:0.048,pa:135.0,c:"210,220,248"}, /* Nadelgalaxie */
  "NGC5128":{a:0.431,b:0.33,pa:33.0,c:"210,220,248"}, /* Centaurus A */
  "NGC6543":{a:0.015,b:0.015,pa:0,c:"120,220,200"}, /* Katzenaugennebel */
  "NGC6744":{a:0.261,b:0.163,pa:15.0,c:"210,220,248"}, /* NGC6744 */
  "NGC6822":{a:0.29,b:0.279,pa:27.0,c:"210,220,248"}, /* Barnards Galaxie */
  "NGC6960":{a:3.5,b:2.667,pa:0,c:"220,160,180"}, /* Cirrusnebel */
  "NGC6992":{a:1.0,b:0.133,pa:0,c:"220,160,180"}, /* Cirrusnebel Ost */
  "NGC7000":{a:2.0,b:0.5,pa:0,c:"230,150,140"}, /* Nordamerikanebel */
  "NGC7293":{a:0.272,b:0.272,pa:0,c:"120,220,200"}, /* Helixnebel */
  "NGC7662":{a:0.005,b:0.005,pa:0,c:"120,220,200"}, /* Blauer Schneeball */
};
const drawGestalt=(o,op)=>{
  /* M24 ist eine Sternwolke, kein Nebel. Gaia zeichnet ihre Einzelsterne; eine
     positive Rueckgabe unterdrueckt nur das Ersatzsymbol, nicht Beschriftung und
     anklickbare Objektflaeche in drawDSO. */
  if(o.m===24&&_GAIA&&zVis>=1.5&&_GAIA.magMax>=7.8)return 1;
  const key=o.m?("M"+o.m):o.id; const d=AUSGEDEHNT[key]; if(!d)return 0;
  const pa=d.pa*Math.PI/180, ha=d.a/2;
  const cd=Math.max(.05,Math.cos(o.de*Math.PI/180));
  const p1=precess(o.ra+ha*Math.sin(pa)/15/cd,o.de+ha*Math.cos(pa),jd0);
  const p2=precess(o.ra-ha*Math.sin(pa)/15/cd,o.de-ha*Math.cos(pa),jd0);
  const P1=altazXY(p1.ra,p1.dec,HR), P2=altazXY(p2.ra,p2.dec,HR);
  const pc=precess(o.ra,o.de,jd0), Pc=altazXY(pc.ra,pc.dec,HR);
  if(!isFinite(P1.x)||!isFinite(P2.x)||!isFinite(Pc.x))return 0;
  const dx=P2.x-P1.x, dy=P2.y-P1.y;
  const halb=Math.hypot(dx,dy)/2;
  /* halb liegt in Welt-Einheiten; die Kuppelansicht wird erst danach mit zoom
     skaliert. Ohne diesen Faktor haengt die Schwelle gar nicht von der Vergroesserung
     ab, sondern nur von der Winkelausdehnung: Nur Objekte ueber 2,18 Grad grosser
     Achse wurden je als Wolke gezeichnet, alle uebrigen nie - auch bei 363-facher
     Vergroesserung nicht. In der Beobachteransicht ist zoom gleich eins, dort aendert
     sich damit nichts. */
  if(!(halb*zoom>6))return 0;
  const breit=Math.max(2,halb*(d.b/d.a));
  g.save();
  g.translate(Pc.x,Pc.y);
  g.rotate(Math.atan2(dy,dx));
  g.scale(1,breit/halb);
  const gr=g.createRadialGradient(0,0,0,0,0,halb);
  gr.addColorStop(0,   "rgba("+d.c+","+(op*.50).toFixed(3)+")");
  gr.addColorStop(.28, "rgba("+d.c+","+(op*.26).toFixed(3)+")");
  gr.addColorStop(.60, "rgba("+d.c+","+(op*.10).toFixed(3)+")");
  gr.addColorStop(1,   "rgba("+d.c+",0)");
  g.beginPath();g.arc(0,0,halb,0,Math.PI*2);g.fillStyle=gr;g.fill();
  g.restore();
  return halb;
};
const drawDSO=(o,label)=>{if(o.mag>mLimit)return;if(_gaiaErsetzt(o,zVis))return;const pc=precess(o.ra,o.de,jd0);const P=altazXY(pc.ra,pc.dec,HR);if(!_altOK(P.alt))return;if(!_imBild(P.x,P.y))return;const fade=Math.max(0,Math.min(1,(mLimit-o.mag)/1.2));const op=fade*Math.max(.25,nightF);const _gest=drawGestalt(o,op);g.globalAlpha=op;if(_gest){}else if(o.t==="g"){g.save();g.translate(P.x,P.y);g.rotate(-.5);g.strokeStyle="rgba(200,210,235,.9)";g.lineWidth=Math.max(.7*PX/zoom,sz*.18);g.beginPath();g.ellipse(0,0,sz*1.1,sz*.5,0,0,Math.PI*2);g.stroke();g.restore()}else if(o.t==="k"||o.t==="o"){g.strokeStyle=o.t==="k"?"rgba(245,230,170,.9)":"rgba(200,230,180,.9)";g.lineWidth=Math.max(.7*PX/zoom,sz*.16);g.setLineDash([sz*.4,sz*.4]);g.beginPath();g.arc(P.x,P.y,sz*.95,0,Math.PI*2);g.stroke();g.setLineDash([]);if(o.t==="k"){g.beginPath();g.arc(P.x,P.y,sz*.12,0,Math.PI*2);g.fillStyle="rgba(245,230,170,.9)";g.fill()}}else if(o.t==="n"||o.t==="p"||o.t==="s"){const col=o.t==="p"?"120,220,200":o.t==="s"?"220,160,180":"230,150,140";const gr=g.createRadialGradient(P.x,P.y,0,P.x,P.y,sz*1.3);gr.addColorStop(0,`rgba(${col},.55)`);gr.addColorStop(1,`rgba(${col},0)`);g.beginPath();g.arc(P.x,P.y,sz*1.3,0,Math.PI*2);g.fillStyle=gr;g.fill();g.strokeStyle=`rgba(${col},.5)`;g.lineWidth=.6*PX/zoom;g.setLineDash([sz*.3,sz*.3]);g.beginPath();g.arc(P.x,P.y,sz*.9,0,Math.PI*2);g.stroke();g.setLineDash([])}else{g.strokeStyle="rgba(210,210,220,.7)";g.lineWidth=.7*PX/zoom;g.beginPath();g.moveTo(P.x-sz*.6,P.y);g.lineTo(P.x+sz*.6,P.y);g.moveTo(P.x,P.y-sz*.6);g.lineTo(P.x,P.y+sz*.6);g.stroke()}g.globalAlpha=1;if(showNames&&zVis>1.5){g.globalAlpha=op*.9;g.font=`${Math.max(13*PX,sz*1.2)*LScaleGrow}px 'Crimson Pro',serif`;g.fillStyle="rgba(200,210,235,.92)";g.textAlign="left";g.textBaseline="middle";g.save();g.shadowColor="rgba(5,8,20,.9)";g.shadowBlur=3;g.fillText(label.short,P.x+sz*1.3/zoom,P.y);g.restore();g.globalAlpha=1}clickable.push({sx:ORX+panX+zoom*P.x,sy:ORY+panY+zoom*P.y,type:"messier",name:label.full,mag:o.mag,mtype:o.t,alt:P.alt})};MESSIER.forEach(o=>drawDSO(o,{short:o.n?`M${o.m} ${o.n}`:`M${o.m}`,full:o.n?`M${o.m} – ${o.n}`:`Messier ${o.m}`}));if(zVis>1.8)NGC.forEach(o=>drawDSO(o,{short:o.n||o.id,full:o.n?`${o.id} – ${o.n}`:o.id}));g.restore()}if(showNames){g.globalAlpha=nightF;g.font=`${Math.max(12*PX,HR*.022)*LScale}px Cinzel,serif`;g.textAlign="center";g.textBaseline="middle";if(!didConst&&window.didHideConstNames!==true)CONSTELLATION_LABELS.forEach(cl=>{const pc=precYearCache(cl,cl.ra,cl.de,jd0);const P=altazXY(pc.ra,pc.dec,HR);if(_altAb(P.alt,3))return;if(!_imBild(P.x,P.y))return;g.save();g.shadowColor="rgba(5,8,20,.95)";g.shadowBlur=6;g.fillStyle="rgba(150,195,255,.62)";g.fillText(cl.n,P.x,P.y);g.restore()});g.globalAlpha=1}if(window.didHidePlanets!==true)allPlanets(jd0).forEach(p=>{const P=altazXY(p.ra,p.dec,HR);if(!_altOK(P.alt))return;const isFocusTarget=(zoomedObj===p.n);const sinAP=isFocusTarget?1:Math.sin(P.alt*Math.PI/180);const extP=isFocusTarget?1:extBySinAlt(sinAP);const[cr0,cg0,cb0]=p.col;const[cr,cg,cb]=isFocusTarget?[cr0,cg0,cb0]:reddenRGB(cr0,cg0,cb0,sinAP);const mag=p.mag;const skyB=Math.max(0,Math.min(1,(sunP.alt+6)/18))*skyAltFade;const dayLimit=6.5-skyB*10.5;let dayFade;if(skyB<=0)dayFade=1;else{dayFade=Math.max(0,Math.min(1,(dayLimit-mag)/1.6+.5))}if(dayFade<=.02&&!isFocusTarget)return;const bright=isFocusTarget?1:Math.max(0,Math.min(1,(2-mag)/9));/* Die Punktgröße wurde im Beobachtermodus mit min(_vf,3) vervielfacht. _vf ist das
       Verhältnis der Abbildungsmaßstäbe und erreicht schon beim voreingestellten
       Bildfeld 2,94, liegt dort also praktisch immer an der Obergrenze. Planeten waren
       im Beobachtermodus dadurch rund dreimal so groß wie in der Kuppelansicht. Die
       Punktdarstellung ist ein Sinnbild, kein abgebildeter Winkel — ihre Größe hängt
       jetzt nicht mehr vom Abbildungsmaßstab ab. Die Scheibendarstellung bei starker
       Vergrößerung nutzt weiterhin PLSCALE mit _vf und bleibt maßstäblich. */
    const ptR=Math.max(.8*PX,(1.2+bright*3.2)*PX);const PLSCALE=HR*.028/.2666*_vf;const realR0=p.angDia/2/3600*PLSCALE;const discRpx=realR0*((viewMode==="real")?1:zoom);const showDisc=(viewMode==="real")?(discRpx>ptR*.9):(zoom>=3);const op=Math.min(1,(.55+bright*.45)*dayFade)*extP;if(showDisc){const R0=Math.max(realR0,4/Math.max(1,zoom));g.save();{const hR=Math.max(2.6*PX/zoom,R0*2.2);const hg=g.createRadialGradient(P.x,P.y,0,P.x,P.y,hR);hg.addColorStop(0,`rgba(${cr},${cg},${cb},${.3*op})`);hg.addColorStop(1,`rgba(${cr},${cg},${cb},0)`);g.beginPath();g.arc(P.x,P.y,hR,0,Math.PI*2);g.fillStyle=hg;g.fill()}const eclAng=eclScreenAngle(p.ra,p.dec,jd0,HR).th;const paintBody=()=>{g.beginPath();g.arc(P.x,P.y,R0,0,Math.PI*2);const dg=g.createRadialGradient(P.x-R0*.3,P.y-R0*.3,R0*.1,P.x,P.y,R0);dg.addColorStop(0,`rgb(${Math.min(255,cr+30)},${Math.min(255,cg+30)},${Math.min(255,cb+30)})`);dg.addColorStop(1,`rgb(${cr},${cg},${cb})`);g.fillStyle=dg;g.fill();g.save();g.beginPath();g.arc(P.x,P.y,R0,0,Math.PI*2);g.clip();g.translate(P.x,P.y);g.rotate(eclAng);const strip=(y0,y1,c)=>{g.fillStyle=c;g.fillRect(-R0*1.25,y0*R0,R0*2.5,(y1-y0)*R0)};if(p.n==="Jupiter"){strip(-1,-.8,"rgba(150,128,96,0.55)");strip(-.8,-.46,"rgba(232,214,180,0.50)");strip(-.46,-.2,"rgba(150,110,78,0.60)");strip(-.2,.1,"rgba(238,222,188,0.55)");strip(.1,.34,"rgba(158,116,82,0.60)");strip(.34,.62,"rgba(228,210,176,0.50)");strip(.62,.82,"rgba(150,116,86,0.50)");strip(.82,1,"rgba(150,128,96,0.55)");g.save();g.beginPath();g.ellipse(R0*.34,-R0*.31,R0*.19,R0*.11,0,0,Math.PI*2);g.fillStyle="rgba(192,98,72,0.80)";g.fill();g.restore()}else if(p.n==="Saturn"){strip(-1,-.6,"rgba(196,170,120,0.45)");strip(-.6,-.22,"rgba(228,208,160,0.45)");strip(-.22,.18,"rgba(238,222,178,0.50)");strip(.18,.58,"rgba(214,194,148,0.45)");strip(.58,1,"rgba(190,166,120,0.45)")}else if(p.n==="Mars"&&discRpx>12){g.save();g.fillStyle="rgba(115,52,32,0.42)";g.beginPath();g.ellipse(-R0*.16,R0*.1,R0*.5,R0*.28,.4,0,Math.PI*2);g.fill();g.fillStyle="rgba(95,42,26,0.38)";g.beginPath();g.ellipse(R0*.38,-R0*.22,R0*.24,R0*.15,-.3,0,Math.PI*2);g.fill();g.fillStyle="rgba(168,88,54,0.30)";g.beginPath();g.ellipse(-R0*.5,-R0*.4,R0*.2,R0*.13,.9,0,Math.PI*2);g.fill();g.fillStyle="rgba(90,40,24,0.24)";g.beginPath();g.ellipse(R0*.05,R0*.48,R0*.3,R0*.11,-.15,0,Math.PI*2);g.fill();g.restore();g.fillStyle="rgba(240,242,250,0.9)";g.fillRect(-R0*1.25,-R0,R0*2.5,R0*.13);g.fillStyle="rgba(240,242,250,0.5)";g.fillRect(-R0*1.25,R0*.92,R0*2.5,R0*.1)}else if(p.n==="Venus"){strip(-1,1,"rgba(248,238,205,0.30)");g.save();g.globalAlpha=.12;g.fillStyle="rgba(216,196,150,1)";g.beginPath();g.ellipse(-R0*.2,-R0*.1,R0*.6,R0*.34,.5,0,Math.PI*2);g.fill();g.restore()}else if(p.n==="Merkur"){g.save();g.globalAlpha=.05;g.fillStyle="rgba(150,140,128,1)";g.beginPath();g.ellipse(-R0*.15,R0*.2,R0*.35,R0*.25,.2,0,Math.PI*2);g.fill();g.restore()}g.restore();const lg=g.createRadialGradient(P.x,P.y,R0*.35,P.x,P.y,R0);lg.addColorStop(0,"rgba(0,0,0,0)");lg.addColorStop(1,"rgba(0,0,0,0.30)");g.fillStyle=lg;g.beginPath();g.arc(P.x,P.y,R0,0,Math.PI*2);g.fill()};paintBody();if(p.phaseFrac<.96){let ang=sunDirScreenAngle(p.ra,p.dec,sunRD.ra,sunRD.dec,HR,P);g.save();g.beginPath();g.arc(P.x,P.y,R0,0,Math.PI*2);g.clip();const shadowOff=(1-2*p.phaseFrac)*R0;g.translate(P.x,P.y);g.rotate(ang);g.beginPath();g.arc(0,0,R0,Math.PI/2,-Math.PI/2,false);g.ellipse(shadowOff,0,Math.max(R0*.02,Math.abs(shadowOff)),R0,0,-Math.PI/2,Math.PI/2,shadowOff>0);g.closePath();g.fillStyle="rgba(8,8,14,0.82)";g.fill();g.restore()}if(p.ring){const Lsat=raDecToEclLon(p.ra,p.dec,jd0);const rb=saturnRingB(Lsat);const southFace=rb<0;const tilt=Math.max(.045,Math.abs(Math.sin(rb*Math.PI/180)));const rot=eclScreenAngle(p.ra,p.dec,jd0,HR).th;const cIn=1.24,bIn=1.24,bOut=1.95,cas=1.99,aIn=2.03,aOut=2.27;const colA=`rgba(200,184,150,`,colB=`rgba(226,210,172,`,colC=`rgba(150,140,118,`;const drawRingArcs=half=>{g.save();g.translate(P.x,P.y);g.rotate(rot);g.scale(1,tilt);const upper=southFace?half!=="back":half==="back";const a0=upper?Math.PI:0;const a1=upper?Math.PI*2:Math.PI;const band=(rIn,rOut,col,a)=>{g.beginPath();g.arc(0,0,rOut*R0,a0,a1,false);g.arc(0,0,rIn*R0,a1,a0,true);g.closePath();g.fillStyle=col+a+")";g.fill()};band(bIn,bOut,colB,.92);band(aIn,aOut,colA,.78);band(cIn*.93,bIn,colC,.42);g.beginPath();g.arc(0,0,cas*R0,a0,a1,false);g.lineWidth=R0*.05;g.strokeStyle="rgba(20,18,14,0.7)";g.stroke();g.restore()};drawRingArcs("back");paintBody();drawRingArcs("front");g.save();g.translate(P.x,P.y);g.rotate(rot);g.scale(1,tilt);g.beginPath();g.arc(0,0,R0,0,Math.PI*2);g.clip();const shGrad=g.createLinearGradient(-R0*.32,0,R0*.32,0);shGrad.addColorStop(0,"rgba(10,8,6,0)");shGrad.addColorStop(.5,"rgba(10,8,6,0.4)");shGrad.addColorStop(1,"rgba(10,8,6,0)");g.fillStyle=shGrad;g.fillRect(-R0*.32,-R0,R0*.64,R0*2);g.restore()}g.restore()}else{
  /* Alle Planeten wurden als matte Scheibe mit einem einzigen schwachen Hof
     gezeichnet, unabhängig von ihrer Helligkeit. Die Venus mit -4,3 Größenklassen
     sah dadurch aus wie Saturn mit +0,5. Hofgröße, Hofdichte und Kernfarbe
     richten sich jetzt nach der Größenklasse: der Kern wird zum Weiß hin
     überstrahlt, wie das Auge einen sehr hellen Lichtpunkt sieht, und ab etwa
     -2 Größenklassen treten Strahlenspitzen hinzu. */
  const gl=Math.max(0,Math.min(1,(2.5-mag)/7));
  const kr=Math.round(cr+(255-cr)*.62*gl),kg=Math.round(cg+(255-cg)*.56*gl),kb=Math.round(cb+(255-cb)*.46*gl);
  const _gr=Math.min(cvW||W,cvH||W);
  const hR=Math.min(ptR*(2.2+3.6*gl),_gr*.06);
  const hg=g.createRadialGradient(P.x,P.y,0,P.x,P.y,hR);
  hg.addColorStop(0,`rgba(${kr},${kg},${kb},${(.30+.32*gl)*op})`);
  hg.addColorStop(.30,`rgba(${cr},${cg},${cb},${(.11+.18*gl)*op})`);
  hg.addColorStop(1,`rgba(${cr},${cg},${cb},0)`);
  g.beginPath();g.arc(P.x,P.y,hR,0,Math.PI*2);g.fillStyle=hg;g.fill();
  if(gl>.55){
    const sl=Math.min(ptR*(1.5+3.2*gl),_gr*.055),sw=Math.max(.55*PX,ptR*.26);
    g.save();g.translate(P.x,P.y);
    g.globalAlpha=Math.min(1,(.08+.19*(gl-.55)/.45)*op);
    g.fillStyle=`rgb(${kr},${kg},${kb})`;
    for(let sp=0;sp<4;sp++){
      const ln=(sp%2===0)?sl:sl*.52;
      g.save();g.rotate(sp*Math.PI/4);
      g.beginPath();g.moveTo(-ln,0);g.lineTo(0,-sw);g.lineTo(ln,0);g.lineTo(0,sw);g.closePath();g.fill();
      g.restore();
    }
    g.restore();g.globalAlpha=1;
  }
  g.beginPath();g.arc(P.x,P.y,ptR,0,Math.PI*2);g.fillStyle=`rgb(${kr},${kg},${kb})`;g.globalAlpha=op;g.fill();g.globalAlpha=1;
}if(showJMoons&&p.n==="Jupiter"&&zEff>2.2){const jR0=discRpx/zoom;const ea=eclScreenAngle(p.ra,p.dec,jd0,HR);const cth=Math.cos(ea.th),sth=Math.sin(ea.th);const moons=jupiterMoons(jd0);const szs={Io:1.15,Europa:1.05,Ganymed:1.5,Kallisto:1.35};moons.forEach(m=>{if(Math.abs(m.x)<1&&!m.front)return;const ox=(m.x*cth-m.y*sth)*jR0,oy=(m.x*sth+m.y*cth)*jR0;const mx=P.x+ox,my=P.y+oy;const rr=Math.max(.9*PX,szs[m.n]*PX)/zoom*1.6;const transit=Math.abs(m.x)<1&&m.front;g.beginPath();g.arc(mx,my,rr,0,Math.PI*2);g.fillStyle=transit?"rgba(40,34,24,0.85)":"rgba(245,240,225,0.95)";g.globalAlpha=op;g.fill();g.globalAlpha=1})}if(showJMoons&&p.n==="Saturn"&&zEff>2.2){const sR0=discRpx/zoom;const rbS=saturnRingB(raDecToEclLon(p.ra,p.dec,jd0));const tiltS=Math.max(.045,Math.abs(Math.sin(rbS*Math.PI/180)));const eaS=eclScreenAngle(p.ra,p.dec,jd0,HR);const cthS=Math.cos(eaS.th),sthS=Math.sin(eaS.th);const smoons=saturnMoons(jd0);const szsS={Titan:1.3,Rhea:.85,Dione:.7,Tethys:.65};smoons.forEach(m=>{const localY=m.y*tiltS;const ox=(m.x*cthS-localY*sthS)*sR0,oy=(m.x*sthS+localY*cthS)*sR0;const mx=P.x+ox,my=P.y+oy;const rr=Math.max(.8*PX,(szsS[m.n]||.7)*PX)/zoom*1.6;g.beginPath();g.arc(mx,my,rr,0,Math.PI*2);g.fillStyle="rgba(225,215,190,0.95)";g.globalAlpha=op;g.fill();g.globalAlpha=1})}if(showNames){setBodyLabelStyle("planet");g.globalAlpha=.9;g.textAlign="left";g.textBaseline="middle";g.fillText(`${p.n}`,P.x+(showDisc?discRpx/zoom:ptR)+3*PX/zoom,P.y);g.globalAlpha=1}clickable.push({sx:ORX+panX+zoom*P.x,sy:ORY+panY+zoom*P.y,type:"planet",name:p.n,sym:p.sym,alt:P.alt,ra:p.ra,de:p.dec,mag:p.mag,angDia:p.angDia,phase:p.phaseFrac,delta:p.delta,r:p.r})});const mtopo=moonTopo(jd0),mP=altazXY(mtopo.ra,mtopo.dec,HR);if(viewMode==="real"&&mP.alt===-999)mP.alt=geoAlt(mtopo.ra,mtopo.dec);const moonAngR=Math.atan(1737.4/mtopo.dist)*180/Math.PI;const Tsun=(jd0-2451545)/36525,Msun=(357.52911+35999.05029*Tsun)*Math.PI/180;const sunDistAU=1.000001018*(1-.01671123*Math.cos(Msun));const sunAngR=.2666/sunDistAU;const SCALE=HR*.028/.2666*_vf;const sR=sunAngR*SCALE,mR=moonAngR*SCALE;const sP=sunP;const sunRD2=ecl2rd(sunLon(jd0),0,jd0);const ra1=sunRD2.ra*15*Math.PI/180,de1=sunRD2.dec*Math.PI/180;const ra2=mtopo.ra*15*Math.PI/180,de2=mtopo.dec*Math.PI/180;const angSep=Math.acos(Math.max(-1,Math.min(1,Math.sin(de1)*Math.sin(de2)+Math.cos(de1)*Math.cos(de2)*Math.cos(ra1-ra2))))*180/Math.PI;const eclipsing=angSep<sunAngR+moonAngR&&mP.alt>-2&&sP.alt>-2;const eclMag=eclipsing?Math.max(0,Math.min(1.1,(sunAngR+moonAngR-angSep)/(2*sunAngR))):0;const cover=eclMag;const isTotal=eclMag>=.99;/* Pragmatischer Kompromiss: Bilbao (12.8.2026, real ~29s Totalitaet, siehe
     Quellenrecherche) erreicht in der App-eigenen, vereinfachten Formel nur 99,32% - verfehlt
     die exakte geometrische Deckung um rund 13 Bogensekunden. Die reale Totalitaetszone ist
     dort nur wenige zehn Sekunden breit, das braucht Bogensekunden-Praezision, die eine
     vereinfachte Ephemeride (u.a. fehlende Sonnenparallaxe - die Sonnenposition wird rein
     geozentrisch berechnet, nur der Mond topozentrisch) an dieser Kante kaum erreicht. .99
     deckt bekannte, wenn auch hauchduenne reale Totalitaetsorte wie Bilbao ab, bleibt aber
     deutlich unter den ~97%, die zuvor eindeutig partielle Ereignisse faelschlich als "total"
     zeigten. Keine vollstaendige Loesung - eine praezisere Ephemeride waere noetig, um diese
     letzten Bogensekunden zuverlaessig aufzuloesen. */let eclDirX=0,eclDirY=-1;if(eclipsing){const lstE=LST();function altazRaw(ra,dec){let H=(lstE-ra*15)*Math.PI/180;const dr=dec*Math.PI/180,ph=lat*Math.PI/180;const al=Math.asin(Math.sin(ph)*Math.sin(dr)+Math.cos(ph)*Math.cos(dr)*Math.cos(H));const A=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(ph)-Math.tan(dr)*Math.cos(ph));return{al:al,A:A}}const se=altazRaw(sunRD2.ra,sunRD2.dec),me=altazRaw(mtopo.ra,mtopo.dec);let dA=me.A-se.A;while(dA>Math.PI)dA-=2*Math.PI;while(dA<-Math.PI)dA+=2*Math.PI;const ex=dA*Math.cos(se.al),ey=-(me.al-se.al);const el=Math.hypot(ex,ey)||1;eclDirX=ex/el;eclDirY=ey/el}if(sP.alt>=-1)clickable.push({sx:ORX+panX+zoom*sP.x,sy:ORY+panY+zoom*sP.y,type:"sun",name:"Sonne",alt:sP.alt,eclMag:eclMag,ra:sunRD2.ra,de:sunRD2.dec,angR:sunAngR});if(mP.alt>=-1)clickable.push({sx:ORX+panX+zoom*mP.x,sy:ORY+panY+zoom*mP.y,type:"moon",name:"Mond",alt:mP.alt,age:moonAge(jd0),illum:moonIllum(jd0),dist:mtopo.dist,ra:mtopo.ra,de:mtopo.dec,angR:moonAngR});if(sP.alt>=-1){const sX=sP.x,sY=sP.y;
if(isTotal){/* Die Korona besitzt breite, asymmetrische Streamer und keine regelmaessigen Strahlen. Zufallswerte im alten Zeichenpfad liessen den Kranz zudem bei jedem Bild flimmern. */const coronaLayer=(angle,sx,sy,alpha)=>{g.save();g.translate(sX,sY);g.rotate(angle);g.scale(sx,sy);const cg=g.createRadialGradient(0,0,sR*.92,0,0,sR*4.4);cg.addColorStop(0,`rgba(255,253,244,${alpha})`);cg.addColorStop(.12,`rgba(246,248,246,${alpha*.72})`);cg.addColorStop(.38,`rgba(222,230,236,${alpha*.26})`);cg.addColorStop(.72,`rgba(190,205,218,${alpha*.07})`);cg.addColorStop(1,"rgba(170,190,208,0)");g.beginPath();g.arc(0,0,sR*4.4,0,Math.PI*2);g.fillStyle=cg;g.fill();g.restore()};g.save();g.globalCompositeOperation="lighter";coronaLayer(-.19,1.22,.46,.34);coronaLayer(Math.PI-.19,1.08,.42,.25);coronaLayer(1.32,.72,.38,.13);coronaLayer(1.32+Math.PI,.62,.35,.10);const inner=g.createRadialGradient(sX,sY,sR*.9,sX,sY,sR*2.15);inner.addColorStop(0,"rgba(255,255,248,.92)");inner.addColorStop(.08,"rgba(248,249,245,.58)");inner.addColorStop(.32,"rgba(225,231,235,.22)");inner.addColorStop(1,"rgba(190,205,218,0)");g.beginPath();g.arc(sX,sY,sR*2.15,0,Math.PI*2);g.fillStyle=inner;g.fill();g.restore();/* Sehr schwaches Erdlicht und ein feiner Koronasaum vermeiden den ausgeschnittenen schwarzen Kreis. */const occultR=Math.max(sR*.985,Math.min(mR,sR*1.035));const md=g.createRadialGradient(sX-sR*.18,sY-sR*.2,0,sX,sY,occultR);md.addColorStop(0,"#080a12");md.addColorStop(.72,"#05070e");md.addColorStop(1,"#020309");g.beginPath();g.arc(sX,sY,occultR,0,Math.PI*2);g.fillStyle=md;g.fill();g.beginPath();g.arc(sX,sY,occultR,0,Math.PI*2);g.strokeStyle="rgba(245,248,244,.32)";g.lineWidth=Math.max(.55*PX,sR*.018);g.stroke()}
else if(eclipsing){const gi=Math.max(0,1-eclMag*.7);[.16,.1,.06].forEach((o,i)=>{const gr=g.createRadialGradient(sX,sY,0,sX,sY,sR*(4-i));gr.addColorStop(0,`rgba(255,240,80,${o*gi})`);gr.addColorStop(1,"rgba(255,200,0,0)");g.beginPath();g.arc(sX,sY,sR*(4-i),0,Math.PI*2);g.fillStyle=gr;g.fill()});const sg=g.createRadialGradient(sX-sR*.3,sY-sR*.3,sR*.1,sX,sY,sR);sg.addColorStop(0,"#fff");sg.addColorStop(.3,"#fff5d0");sg.addColorStop(.7,"#ffd020");sg.addColorStop(1,"#f59000");g.beginPath();g.arc(sX,sY,sR,0,Math.PI*2);g.fillStyle=sg;g.fill();const dCenters=(sunAngR+moonAngR-2*sunAngR*eclMag)*SCALE;const mX=sX+eclDirX*dCenters,mY=sY+eclDirY*dCenters;const op2=Math.min(.8,Math.max(.06,(sunP.alt+6)/20));const bl=(c,base)=>Math.round(base*(1-op2)+c*op2);const skyR=bl(120,3),skyG=bl(170,4),skyB=bl(235,18);g.save();g.beginPath();g.arc(sX,sY,sR,0,Math.PI*2);g.clip();g.beginPath();g.arc(mX,mY,mR,0,Math.PI*2);g.fillStyle=`rgb(${skyR},${skyG},${skyB})`;g.fill();g.beginPath();g.arc(mX,mY,mR,0,Math.PI*2);g.strokeStyle="rgba(40,45,65,.3)";g.lineWidth=PX;g.stroke();g.restore()}else{const sinAltS=Math.sin(sP.alt*Math.PI/180);const redK=Math.max(0,Math.min(1,1-extBySinAlt(sinAltS)));const mixC=(a,b,t)=>Math.round(a+(b-a)*t);const haloC=`${mixC(255,255,redK)},${mixC(240,140,redK)},${mixC(80,30,redK)}`;const coreC=`${mixC(255,255,redK)},${mixC(255,190,redK)},${mixC(255,120,redK)}`;const midC=`${mixC(255,255,redK)},${mixC(213,150,redK)},${mixC(32,20,redK)}`;const edgeC=`${mixC(245,200,redK)},${mixC(144,70,redK)},${mixC(0,10,redK)}`;[.16,.1,.06].forEach((o,i)=>{const gr=g.createRadialGradient(sX,sY,0,sX,sY,sR*(4-i));gr.addColorStop(0,`rgba(${haloC},${o})`);gr.addColorStop(1,`rgba(255,${mixC(200,90,redK)},0,0)`);g.beginPath();g.arc(sX,sY,sR*(4-i),0,Math.PI*2);g.fillStyle=gr;g.fill()});const sg=g.createRadialGradient(sX-sR*.3,sY-sR*.3,sR*.1,sX,sY,sR);sg.addColorStop(0,`rgb(${coreC})`);sg.addColorStop(.3,`rgb(${midC})`);sg.addColorStop(.7,`rgb(${midC})`);sg.addColorStop(1,`rgb(${edgeC})`);g.beginPath();g.arc(sX,sY,sR,0,Math.PI*2);g.fillStyle=sg;g.shadowColor=`rgb(${midC})`;g.shadowBlur=sR*1.5;g.fill();g.shadowBlur=0}if(showNames){const lbl=isTotal?"Totale Finsternis":eclipsing?`Finsternis ${(eclMag*100).toFixed(0)}%`:"Sonne";setBodyLabelStyle("sun");g.textAlign="left";g.textBaseline="middle";g.fillText(lbl,sX+sR+3*PX/zoom,sY-(eclipsing?sR*2:0))}}const illumNow=moonIllum(jd0);let lunarEcl=null;{const elong=moonElong(jd0);if(Math.abs(elong-180)<2.2){const mecL=moonEcl(jd0);const shLon=(sunLon(jd0)+180)%360;let dLon=(mecL.lon-shLon+540)%360-180;const dLat=mecL.lat;const sep=Math.hypot(dLon,dLat);const moonR=Math.atan(1737.4/mtopo.dist)*180/Math.PI;const umbraR=.7,penumbraR=1.27;if(sep<penumbraR+moonR){let phase="penumbra",depth=0;if(sep<umbraR-moonR){phase="total";depth=1}else if(sep<umbraR+moonR){phase="umbra";depth=(umbraR+moonR-sep)/(2*moonR)}else{phase="penumbra";depth=(penumbraR+moonR-sep)/(penumbraR-umbraR)}lunarEcl={phase:phase,depth:Math.max(0,Math.min(1,depth)),sep:sep,dLon:dLon,dLat:dLat,moonR:moonR,umbraR:umbraR,penumbraR:penumbraR}}}}if(mP.alt>=0&&!eclipsing&&window.didHideMoon!==true){const illum=illumNow,age=moonAge(jd0);const mRdraw=mR,mx=mP.x,my=mP.y;const skyBright=Math.max(0,Math.min(1,(sunP.alt+6)/18));const phaseF=Math.min(1,Math.max(0,(illum-.015)/.12));const distF=Math.min(1,Math.max(0,(angSep-5)/45));const nightVis=phaseF;const dayVis=Math.pow(phaseF,1.4)*distF*.42;const vis=nightVis*(1-skyBright)+dayVis*skyBright;const visClamp=Math.max(0,Math.min(1,vis));if(visClamp<=.02){const aN=.44*(1-skyBright*.45);if(aN>.05){g.save();g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fillStyle="rgba(64,74,100,"+(aN*.5).toFixed(3)+")";g.fill();g.setLineDash([2.2*PX,3*PX]);g.strokeStyle="rgba(200,215,245,"+aN.toFixed(3)+")";g.lineWidth=1.5*PX;g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.stroke();g.setLineDash([]);g.restore()}}if(visClamp>.02){g.save();g.globalAlpha=visClamp;const wax=true,tx=wax?mRdraw*(1-2*illum):mRdraw*(2*illum-1);const brightLimbAng=moonBrightLimbAngle(mtopo,sunRD2,HR,mP,jd0);g.translate(mx,my);g.rotate(brightLimbAng);g.translate(-mx,-my);{const earthGlow=illum<.3?(.3-illum)/.3*.1:0;const bodyA=(.16+earthGlow)*(1-skyBright*.62);if(bodyA>.03){g.save();g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.clip();const eg=g.createRadialGradient(mx-mRdraw*.2,my-mRdraw*.2,mRdraw*.1,mx,my,mRdraw);eg.addColorStop(0,`rgba(118,126,148,${bodyA})`);eg.addColorStop(1,`rgba(82,88,108,${bodyA*.6})`);g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fillStyle=eg;g.fill();g.restore()}}g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.clip();moonLitPath(g,mx,my,mRdraw,illum,wax);const litX=mx+(wax?mRdraw*.35:-mRdraw*.35);const mg=g.createRadialGradient(litX,my-mRdraw*.15,mRdraw*.15,mx,my,mRdraw*1.12);const sinAltM=Math.sin(mP.alt*Math.PI/180);const redKM=Math.max(0,Math.min(1,1-extBySinAlt(sinAltM)));const mixM=(a,b,t)=>Math.round(a+(b-a)*t);if(skyBright>.5){mg.addColorStop(0,`rgb(${mixM(248,255,redKM)},${mixM(248,200,redKM)},${mixM(250,120,redKM)})`);mg.addColorStop(.55,`rgb(${mixM(221,235,redKM)},${mixM(224,160,redKM)},${mixM(230,90,redKM)})`);mg.addColorStop(.85,`rgb(${mixM(196,220,redKM)},${mixM(200,120,redKM)},${mixM(208,60,redKM)})`);mg.addColorStop(1,`rgb(${mixM(170,200,redKM)},${mixM(176,90,redKM)},${mixM(186,40,redKM)})`)}else{mg.addColorStop(0,`rgb(${mixM(244,255,redKM)},${mixM(240,190,redKM)},${mixM(230,110,redKM)})`);mg.addColorStop(.5,`rgb(${mixM(226,235,redKM)},${mixM(220,160,redKM)},${mixM(203,80,redKM)})`);mg.addColorStop(.82,`rgb(${mixM(202,215,redKM)},${mixM(191,130,redKM)},${mixM(166,55,redKM)})`);mg.addColorStop(1,`rgb(${mixM(168,190,redKM)},${mixM(154,90,redKM)},${mixM(122,35,redKM)})`)}g.fillStyle=mg;g.fill();g.restore();if(visClamp>.3){const moonScreenR=mRdraw*zoom/PX;const detail=moonScreenR>8;if(moonImgReady&&moonImg){g.save();g.translate(mx,my);g.rotate(brightLimbAng);g.translate(-mx,-my);g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.clip();moonLitPath(g,mx,my,mRdraw,illum,wax);g.clip();g.drawImage(moonImg,mx-mRdraw,my-mRdraw,mRdraw*2,mRdraw*2);const lightDir2=wax?1:-1;const termF2=1-Math.abs(2*illum-1);if(termF2>.05){const tg=g.createLinearGradient(mx-lightDir2*mRdraw,my,mx+lightDir2*mRdraw,my);tg.addColorStop(0,`rgba(8,8,12,${.55*termF2})`);tg.addColorStop(.4,"rgba(8,8,12,0)");tg.addColorStop(1,"rgba(0,0,0,0)");g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fillStyle=tg;g.fill()}const lg=g.createRadialGradient(mx,my,mRdraw*.7,mx,my,mRdraw);lg.addColorStop(0,"rgba(0,0,0,0)");lg.addColorStop(1,"rgba(0,0,0,0.28)");g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fillStyle=lg;g.fill();if(skyBright>.08){g.globalCompositeOperation="source-atop";g.globalAlpha=visClamp*skyBright*.45;g.fillStyle="#eef1f7";g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fill();g.globalCompositeOperation="source-over";g.globalAlpha=visClamp}if(redKM>.03){g.globalCompositeOperation="source-atop";g.globalAlpha=visClamp*redKM*.5;g.fillStyle="rgb(255,120,40)";g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fill();g.globalCompositeOperation="source-over";g.globalAlpha=visClamp}g.restore()}else{const ms=renderMoonSurface(mRdraw,illum,wax);g.save();g.translate(mx,my);g.rotate(brightLimbAng);g.translate(-mx,-my);g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.clip();if(skyBright>.08){moonLitPath(g,mx,my,mRdraw,illum,wax);g.clip()}g.globalAlpha=visClamp*(1-skyBright*.35);g.drawImage(ms.cnv,mx-mRdraw,my-mRdraw,mRdraw*2,mRdraw*2);if(redKM>.03){g.globalCompositeOperation="source-atop";g.globalAlpha=visClamp*redKM*.5;g.fillStyle="rgb(255,120,40)";g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fill();g.globalCompositeOperation="source-over"}g.restore()}}if(lunarEcl){const pxPerDeg=mRdraw/lunarEcl.moonR;const umbraPx=lunarEcl.umbraR*pxPerDeg;const penumbraPx=lunarEcl.penumbraR*pxPerDeg;const mec0=moonEcl(jd0);const rdA=ecl2rd(mec0.lon,mec0.lat,jd0);const rdL=ecl2rd(mec0.lon+.5,mec0.lat,jd0);const rdB=ecl2rd(mec0.lon,mec0.lat+.5,jd0);const pA=altazXY(rdA.ra,rdA.dec,HR);const pLon=altazXY(rdL.ra,rdL.dec,HR);const pLat=altazXY(rdB.ra,rdB.dec,HR);let lx=pLon.x-pA.x,ly=pLon.y-pA.y;const ll=Math.hypot(lx,ly)||1;lx/=ll;ly/=ll;let bx=pLat.x-pA.x,by=pLat.y-pA.y;const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;const scx=mx-(lunarEcl.dLon*lx+lunarEcl.dLat*bx)*pxPerDeg;const scy=my-(lunarEcl.dLon*ly+lunarEcl.dLat*by)*pxPerDeg;g.save();g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.clip();if(lunarEcl.phase==="total"){const rg=g.createRadialGradient(scx,scy,0,scx,scy,umbraPx);rg.addColorStop(0,"rgba(60,22,18,.94)");rg.addColorStop(.45,"rgba(92,36,26,.9)");rg.addColorStop(.72,"rgba(132,58,38,.86)");rg.addColorStop(.92,"rgba(178,92,58,.82)");rg.addColorStop(1,"rgba(200,120,80,.8)");g.beginPath();g.arc(mx,my,mRdraw,0,Math.PI*2);g.fillStyle=rg;g.fill()}else if(lunarEcl.phase==="umbra"){const ug=g.createRadialGradient(scx,scy,0,scx,scy,umbraPx);ug.addColorStop(0,"rgba(55,22,18,.95)");ug.addColorStop(.5,"rgba(85,34,26,.93)");ug.addColorStop(.78,"rgba(120,52,36,.9)");ug.addColorStop(.93,"rgba(70,42,36,.88)");ug.addColorStop(1,"rgba(75,46,40,.45)");g.beginPath();g.arc(scx,scy,umbraPx,0,Math.PI*2);g.fillStyle=ug;g.fill()}else{const pg=g.createRadialGradient(scx,scy,umbraPx*.6,scx,scy,penumbraPx*1.05);pg.addColorStop(0,"rgba(18,18,24,.18)");pg.addColorStop(.7,"rgba(18,18,24,.07)");pg.addColorStop(1,"rgba(18,18,24,0)");g.beginPath();g.arc(scx,scy,penumbraPx*1.05,0,Math.PI*2);g.fillStyle=pg;g.fill()}g.restore()}if(showNames&&visClamp>.3){g.save();g.globalAlpha=Math.min(1,visClamp+.15);setBodyLabelStyle("moon");g.textAlign="left";g.textBaseline="middle";const mlbl=lunarEcl?lunarEcl.phase==="total"?"Mondfinsternis (total)":lunarEcl.phase==="umbra"?"Mondfinsternis":"Mond (Halbschatten)":"Mond";g.fillText(mlbl,mx+mRdraw+2*PX/zoom,my);g.restore()}}}if(showISS&&!issTLE){g.save();g.font=`${Math.max(12*PX,HR*.024)*LScale}px Cinzel,serif`;g.textAlign="center";g.textBaseline="middle";g.fillStyle="rgba(140,240,175,.7)";let msg=issLoading?"🛰 ISS-Bahndaten werden geladen…":issError?"🛰 "+issError:"🛰 ISS: keine Daten";g.save();g.shadowColor="rgba(5,12,8,.9)";g.shadowBlur=5;g.fillText(msg,0,0);g.restore();g.restore()}if(showISS&&issTLE){try{function azAltToXY(az,alt){const z=(90-alt)/90*HR;const A=(az-180)*Math.PI/180;return{x:z*Math.sin(A),y:z*Math.cos(A)}}const jdNow=currentJD();g.save();const now=issAltAz(jdNow);if(now&&now.alt>=0){const p=azAltToXY(now.az,now.alt);const r=Math.max(1.8*PX,HR*.01);g.beginPath();g.arc(p.x,p.y,r,0,Math.PI*2);g.fillStyle="#ffffff";g.fill();clickable.push({sx:ORX+panX+zoom*p.x,sy:ORY+panY+zoom*p.y,type:"iss",name:"ISS",alt:now.alt});if(showNames){g.font=`bold ${Math.max(12*PX,HR*.022)*LScale}px Cinzel,serif`;g.fillStyle="rgba(245,248,255,.95)";g.textAlign="left";g.textBaseline="middle";g.save();g.shadowColor="rgba(5,8,16,.9)";g.shadowBlur=4;g.fillText("🛰 ISS",p.x+r+3*PX/zoom,p.y);g.restore()}}else{if(issNextCache===null||Math.abs(jdNow-issNextCacheJD)>1/1440){if(!(interacting>0)&&!orientMode){let nd=null;for(let dt=0;dt<=1440;dt+=1){const aa=issAltAz(jdNow+dt/1440);if(aa&&aa.alt>=0){nd=dt;break}}issNextCache=nd;issNextCacheJD=jdNow}}if(issNextCache!==null){const h=Math.floor(issNextCache/60),mn=issNextCache%60;const txt=issNextCache<1?"ISS überfliegt jetzt":`Nächster ISS-Überflug in ${h>0?h+" h ":""}${mn} min`;g.font=`${Math.max(12*PX,HR*.022)*LScale}px Cinzel,serif`;g.fillStyle="rgba(140,240,175,.7)";g.textAlign="center";g.textBaseline="middle";g.save();g.shadowColor="rgba(5,12,8,.9)";g.shadowBlur=5;g.fillText("🛰 "+txt,0,HR*.4);g.restore()}else{g.font=`${Math.max(12*PX,HR*.022)*LScale}px Cinzel,serif`;g.fillStyle="rgba(140,240,175,.6)";g.textAlign="center";g.textBaseline="middle";g.fillText("🛰 ISS: kein Überflug in 24 h",0,HR*.4)}}g.restore()}catch(err){g.restore&&g.restore();g.save();g.font=`${Math.max(12*PX,HR*.022)*LScale}px Cinzel,serif`;g.fillStyle="rgba(255,150,150,.8)";g.textAlign="center";g.textBaseline="middle";g.fillText("🛰 ISS-Berechnung fehlgeschlagen",0,0);g.restore()}}if(showMeteors&&!(interacting>0)&&!orientMode){const now=typeof performance!=="undefined"?performance.now():Date.now();let dt=(now-lastMeteorT)/1e3;if(!(dt>0)||dt>.2)dt=.016;lastMeteorT=now;const nightF2=Math.max(0,Math.min(1,(-sunP.alt-6)/6));const showers=activeMeteorShowers();const rad=showers.map(o=>{const pc=precess(o.s.ra,o.s.de,jd0);const P=altazXY(pc.ra,pc.dec,HR);return{o:o,P:P,up:P.alt>0}});rad.forEach(({o:o,P:P,up:up})=>{if(!up)return;const[cr,cg,cb]=o.s.col,a=.25+.55*o.inten,rr=4*PX/zoom;g.save();g.strokeStyle=`rgba(${cr},${cg},${cb},${a})`;g.lineWidth=1.1*PX/zoom;for(let k=0;k<4;k++){const ang=k*Math.PI/2+Math.PI/4;g.beginPath();g.moveTo(P.x+Math.cos(ang)*rr*.5,P.y+Math.sin(ang)*rr*.5);g.lineTo(P.x+Math.cos(ang)*rr,P.y+Math.sin(ang)*rr);g.stroke()}g.beginPath();g.arc(P.x,P.y,1.4*PX/zoom,0,Math.PI*2);g.fillStyle=`rgba(${cr},${cg},${cb},${Math.min(1,a+.2)})`;g.fill();if(showNames){g.font=`${Math.max(10*PX,HR*.016)}px Inter,system-ui,sans-serif`;g.fillStyle=`rgba(${cr},${cg},${cb},${.55+.4*o.inten})`;g.textAlign="center";g.textBaseline="top";g.shadowColor="rgba(4,6,16,.9)";g.shadowBlur=4;g.fillText("☄ "+o.s.n+(o.inten>.6?" · ZHR "+o.s.zhr:""),P.x,P.y+rr+2*PX/zoom)}g.restore()});const upS=rad.filter(r=>r.up);if(nightF2>.05&&upS.length){let tot=0;upS.forEach(r=>tot+=r.o.s.zhr*r.o.inten);const rate=Math.min(2.2,tot/120)*nightF2;meteorSpawnAcc+=rate*dt;while(meteorSpawnAcc>=1&&meteorParticles.length<60){meteorSpawnAcc-=1;let pick=Math.random()*tot,sel=upS[0];for(const r of upS){pick-=r.o.s.zhr*r.o.inten;if(pick<=0){sel=r;break}}meteorParticles.push({ra:sel.o.s.ra,de:sel.o.s.de,ang:Math.random()*Math.PI*2,dist:(6+Math.random()*16)*PX/zoom,v:(120+Math.random()*160)*PX/zoom,len:(10+Math.random()*22)*PX/zoom,born:now,ttl:.5+Math.random()*.7})}}meteorParticles=meteorParticles.filter(m=>{const age=(now-m.born)/1e3;if(age>m.ttl)return false;m.dist+=m.v*dt;const pc=precess(m.ra,m.de,jd0),Pr=altazXY(pc.ra,pc.dec,HR);if(Pr.alt<0)return false;const hx=Pr.x+Math.cos(m.ang)*m.dist,hy=Pr.y+Math.sin(m.ang)*m.dist;const tx=Pr.x+Math.cos(m.ang)*(m.dist-m.len),ty=Pr.y+Math.sin(m.ang)*(m.dist-m.len);const fade=Math.min(1,(m.ttl-age)/.4)*Math.min(1,age/.08);const grd=g.createLinearGradient(tx,ty,hx,hy);grd.addColorStop(0,"rgba(180,205,255,0)");grd.addColorStop(1,`rgba(255,255,255,${.9*fade})`);g.strokeStyle=grd;g.lineWidth=1.6*PX/zoom;g.lineCap="round";g.beginPath();g.moveTo(tx,ty);g.lineTo(hx,hy);g.stroke();g.beginPath();g.arc(hx,hy,1.5*PX/zoom,0,Math.PI*2);g.fillStyle=`rgba(255,255,255,${.9*fade})`;g.fill();return true})}else if(!showMeteors&&meteorParticles.length){meteorParticles=[]}g.restore();if(showTwilight&&viewMode!=="real"){const ringW=R-HR;const twi=[{deg:6,col:"rgba(255,150,40,",lbl:"bürgerl."},{deg:12,col:"rgba(120,90,180,",lbl:"nautisch"},{deg:18,col:"rgba(60,70,140,",lbl:"astron."}];twi.forEach(t=>{const rr=HR+ringW*(t.deg/18);g.beginPath();g.arc(0,0,rr,0,Math.PI*2);g.strokeStyle=t.col+".5)";g.setLineDash([4*PX,5*PX]);g.lineWidth=1*PX;g.stroke();g.setLineDash([])});if(showNames){g.textAlign="center";g.textBaseline="middle";const la=200*Math.PI/180;const lb=160*Math.PI/180;twi.forEach(t=>{const rr=HR+ringW*(t.deg/18);g.font=`bold ${Math.max(13*PX,R*.022)*LScale}px Cinzel,serif`;g.fillStyle=t.col+".85)";g.save();g.shadowColor="rgba(5,8,20,.9)";g.shadowBlur=3;g.fillText("−"+t.deg+"°",rr*Math.sin(la),rr*Math.cos(la));g.font=`italic ${Math.max(8*PX,R*.014)*LScale}px Cinzel,serif`;g.fillText(t.lbl+" Dämm.",rr*Math.sin(lb),rr*Math.cos(lb));g.restore()})}if(sunP.alt<0&&viewMode!=="real"){const aDeg=Math.min(36,-sunP.alt);const rr=HR+ringW*(aDeg/18);const sd=(isFinite(sunP.x)&&isFinite(sunP.y)?Math.hypot(sunP.x,sunP.y):0)||1;const dx=sunP.x/sd,dy=sunP.y/sd;const sx=rr*dx,sy=rr*dy;const dotR=Math.max(1.6*PX,HR*.013);g.beginPath();g.arc(sx,sy,dotR,0,Math.PI*2);g.fillStyle="rgba(180,185,200,.18)";g.fill();g.strokeStyle="rgba(200,205,220,.4)";g.lineWidth=.7*PX;g.stroke()}}if(orientMode&&viewMode!=="real"){g.save();{/* Ring für die Sterne unterhalb des Horizonts. Bisher wurden hier nur die
     benannten Sterne bis 4,2 mag gezeichnet — von 429 Einträgen also gut hundert,
     wovon nur die Hälfte unter dem Horizont steht. Jetzt speist sich der Ring aus
     dem geladenen Katalog, sofern vorhanden. Da der Ring 90 Grad Himmel auf
     0,4·HR Radius staucht, bleibt die Grenzgröße bewusst bei Freiaugensichtbarkeit —
     tiefer wäre nur Matsch und teuer. */
  const HR2=Math.min(C*1.02,HR*1.4);
  const phiB=lat*Math.PI/180,sPhiB=Math.sin(phiB),cPhiB=Math.cos(phiB);
  const lstRB=LST()*Math.PI/180,cLB=Math.cos(lstRB),sLB=Math.sin(lstRB);
  const limB=Math.min(6.5,(window.skyMagBase||6.5));
  const _gMB=_GAIA?_vondrak(jd0):null;
  g.fillStyle="rgb(190,205,230)";let opB=-1;
  const zeichneB=(X,Y,Z,mag)=>{
    const cD=cLB*X+sLB*Y,sA=sPhiB*Z+cPhiB*cD;
    if(sA>=0)return;
    const u=sLB*X-cLB*Y,v=cD*sPhiB-Z*cPhiB;
    const w=Math.sqrt(u*u+v*v);if(w<1e-12)return;
    const altB=Math.asin(sA<-1?-1:sA)*180/Math.PI;
    const rB=HR+(HR2-HR)*Math.min(1,-altB/90);
    const xB=rB*u/w,yB=rB*v/w;
    const o=Math.round(Math.max(.05,(.4+altB*.006)*(mag<3?1:mag<5?.82:.62))*20)/20;
    if(o!==opB){g.globalAlpha=o;opB=o}
    const rr=mag<2?1.5*PX:mag<4?1.1*PX:.85*PX;
    g.fillRect(xB-rr,yB-rr,rr*2,rr*2);
  };
  if(_GAIA){const G=_GAIA,nZ=G.gRA*G.gDE;
    for(let zk=0;zk<nZ;zk++){const a=G.verz[zk],b=G.verz[zk+1];
      for(let i=a;i<b;i++){const mag=G.magMin+G.mg[i]*G.magStep;if(mag>limB)break;
        let X,Y,Z;
        if(i<gaiaPrecCursor){X=G.ex[i];Y=G.ey[i];Z=G.ez[i];}
        else{const ra=G.ra[i]*(360/4294967296)/15,de=G.de[i]*(90/2147483648);
          const r0=ra*.2617993877991494,d0=de*.017453292519943295,cd=Math.cos(d0);
          const x0=cd*Math.cos(r0),y0=cd*Math.sin(r0),z0=Math.sin(d0);
          if(_gMB){X=_gMB.m00*x0+_gMB.m01*y0+_gMB.m02*z0;Y=_gMB.m10*x0+_gMB.m11*y0+_gMB.m12*z0;Z=_gMB.m20*x0+_gMB.m21*y0+_gMB.m22*z0;}
          else{X=x0;Y=y0;Z=z0;}}
        zeichneB(X,Y,Z,mag);}}}
  else{STARS.forEach(s=>{if(s.mag>limB)return;const pc=starPC(s,jd0);
    const r0=pc.ra*.2617993877991494,d0=pc.dec*.017453292519943295,cd=Math.cos(d0);
    zeichneB(cd*Math.cos(r0),cd*Math.sin(r0),Math.sin(d0),s.mag);})}
  g.globalAlpha=1;}g.beginPath();g.arc(0,0,R*3.2,0,Math.PI*2);g.arc(0,0,HR,0,Math.PI*2);g.fillStyle="rgba(10,8,6,.4)";g.fill("evenodd");const gr=g.createRadialGradient(0,0,HR,0,0,HR*1.55);gr.addColorStop(0,"rgba(48,36,22,.32)");gr.addColorStop(1,"rgba(10,8,5,0)");g.beginPath();g.arc(0,0,HR*1.7,0,Math.PI*2);g.arc(0,0,HR,0,Math.PI*2);g.fillStyle=gr;g.fill("evenodd");g.restore();g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.shadowColor="rgba(140,230,170,.6)";g.shadowBlur=5*PX/zoom;g.strokeStyle="rgba(150,255,180,.85)";g.lineWidth=2.4*PX/zoom;g.stroke();g.shadowBlur=0}if(viewMode!=="real"){g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.strokeStyle="rgba(155,180,205,.30)";g.lineWidth=1*PX;g.stroke();}if(showHorizon&&viewMode!=="real"){g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.strokeStyle="rgba(90,200,130,.22)";g.lineWidth=1.4*PX;g.stroke();g.beginPath();g.arc(0,0,HR,0,Math.PI*2);g.strokeStyle="rgba(200,255,210,.28)";g.lineWidth=.9*PX;g.stroke()}if(!FS&&viewMode!=="real"){const dirs=[["N",180,"★"],["NO",225,"·"],["O",270,"●"],["SO",315,"·"],["S",0,"▲"],["SW",45,"·"],["W",90,"●"],["NW",135,"·"]];dirs.forEach(([l,A,sym])=>{const a=A*Math.PI/180,rr=showTwilight?R*.93:R*.975,x=rr*Math.sin(a),y=rr*Math.cos(a);const major=l.length===1;g.textAlign="center";g.textBaseline="middle";g.save();g.shadowColor="rgba(5,4,12,.95)";g.shadowBlur=6;if(major&&sym){g.font=`${Math.max(13*PX,R*.03)*LScale}px serif`;g.fillStyle=l==="N"?"#ffe9a8":"rgba(201,168,76,.85)";g.fillText(sym,x*.965,y*.965)}g.font=`bold ${Math.max(major?13*PX:9*PX,R*(major?.045:.027))*LScale}px Cinzel,serif`;g.fillStyle=major?"#e8c860":"rgba(201,168,76,.7)";g.fillText(l,x,y);g.restore()})}if(viewMode!=="real"){const zc=R*.018*LScale;g.save();g.strokeStyle="rgba(201,168,76,.55)";g.lineWidth=.8*PX/zoom;g.beginPath();g.moveTo(-zc,0);g.lineTo(zc,0);g.moveTo(0,-zc);g.lineTo(0,zc);g.stroke();g.restore()}else{const zP=projReal(camAz*Math.PI/180,Math.PI/2);if(zP.alt!==-999){const zc2=Math.max(6*PX,HR*.018);g.save();g.strokeStyle="rgba(201,168,76,.7)";g.lineWidth=1*PX;g.beginPath();g.moveTo(zP.x-zc2,zP.y);g.lineTo(zP.x+zc2,zP.y);g.moveTo(zP.x,zP.y-zc2);g.lineTo(zP.x,zP.y+zc2);g.stroke();g.restore()}}if(showRA){const lstH=LST()/15;g.save();g.textAlign="center";g.textBaseline="middle";g.beginPath();let first=true;for(let ra=0;ra<=24.01;ra+=.25){const P=altazXY(ra,0,HR);if(_altAb(P.alt,-1)){first=true;continue}first?g.moveTo(P.x,P.y):g.lineTo(P.x,P.y);first=false}/* Strichstaerke und Strichelung werden durch zoom geteilt, damit sie auf dem Schirm
   gleich bleiben. Die frueher hier stehenden Untergrenzen Math.max(0,8*PX; ...) waren in
   Weltkoordinaten angesetzt und wurden anschliessend mit zoom skaliert - sie begrenzten
   also nicht, sondern liessen Strich und Luecke ab Vergroesserung 1,5 linear mitwachsen:
   bei 7,9-fach 12,6 statt 2,8 Bildpunkte Strichstaerke und 31,6 statt 6 Bildpunkte
   Strichlaenge. Daher die dicken Balken statt feiner Linien. */
g.strokeStyle="rgba(130,205,238,"+(.24+.34*nightF)+")";g.lineWidth=1.4*PX/zoom;g.setLineDash([3*PX/zoom,5*PX/zoom]);g.stroke();g.strokeStyle="rgba(130,205,238,"+(.24+.34*nightF)+")";g.lineWidth=1.4*PX/zoom;g.setLineDash([3*PX/zoom,5*PX/zoom]);for(let hh2=0;hh2<24;hh2+=1){g.beginPath();let f=true,pv=null;for(let de=-80;de<=80;de+=2){const P=altazXY(hh2,de,HR);if(_altAb(P.alt,-1)){f=true;pv=null;continue}if(pv&&_streckeDraussen(pv.x,pv.y,P.x,P.y)){f=true;pv=P;continue}if(f){g.moveTo(pv?pv.x:P.x,pv?pv.y:P.y);if(pv)g.lineTo(P.x,P.y)}else g.lineTo(P.x,P.y);f=false;pv=P}g.stroke()}{g.beginPath();let f0=true,pv0=null;for(let de=-89;de<=89;de+=.25){const P=altazXY(0,de,HR);if(_altAb(P.alt,-1)){f0=true;pv0=null;continue}if(pv0&&_streckeDraussen(pv0.x,pv0.y,P.x,P.y)){f0=true;pv0=P;continue}if(f0){g.moveTo(pv0?pv0.x:P.x,pv0?pv0.y:P.y);if(pv0)g.lineTo(P.x,P.y)}else g.lineTo(P.x,P.y);f0=false;pv0=P}g.stroke()}for(let de=-80;de<=80;de+=10){if(de===0)continue;g.beginPath();let f=true,pv=null;for(let ra=0;ra<=24.01;ra+=.25){const P=altazXY(ra,de,HR);if(_altAb(P.alt,-1)){f=true;pv=null;continue}if(pv&&_streckeDraussen(pv.x,pv.y,P.x,P.y)){f=true;pv=P;continue}if(f){g.moveTo(pv?pv.x:P.x,pv?pv.y:P.y);if(pv)g.lineTo(P.x,P.y)}else g.lineTo(P.x,P.y);f=false;pv=P}g.stroke()}g.setLineDash([]);g.font=`${Math.max(9*PX,R*.017)*LScale}px Cinzel,serif`;g.textAlign="left";g.textBaseline="middle";for(let de=-80;de<=80;de+=10){const P=altazXY(lstH,de,HR);if(_altAb(P.alt,2))continue;g.save();g.shadowColor="rgba(5,8,20,.95)";g.shadowBlur=4;g.fillStyle="rgba(150,210,240,.92)";g.fillText((de>0?"+":"")+de+"°",P.x+5*PX,P.y);g.restore()}g.textAlign="center";for(let h=0;h<24;h++){const P=altazXY(h,0,HR);if(!_altOK(P.alt))continue;const isVernal=h===0;const d=Math.hypot(P.x,P.y)||1;const ox=P.x/d*R*.035*LScale,oy=P.y/d*R*.035*LScale;g.save();g.shadowColor="rgba(5,8,20,.9)";g.shadowBlur=4;if(isVernal){g.font=`${Math.max(13*PX,R*.026)*LScale}px serif`;g.fillStyle="#ffd24a";g.fillText("♈",P.x+ox,P.y+oy)}else{g.font=`${Math.max(11*PX,R*.02)*LScale}px Cinzel,serif`;g.fillStyle="rgba(170,215,245,.9)";g.fillText(h+"ʰ",P.x+ox,P.y+oy)}g.restore()}g.restore()}if(viewMode==="real"){try{drawGroundAndCompass(LScale)}catch(e){if(window.console)console.warn("Boden:",e.message)}}g.restore()}let __idleTS=0,__wl=null,__wlLast=0;function __wlSync(ts){if(ts-__wlLast<1000)return;__wlLast=ts;const want=(!paused||orientMode)&&document.visibilityState==="visible";if(want&&!__wl&&navigator.wakeLock){navigator.wakeLock.request("screen").then(l=>{__wl=l;l.addEventListener("release",()=>{__wl=null})}).catch(()=>{})}else if(!want&&__wl){__wl.release().catch(()=>{});__wl=null}}document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){lastT=null;__idleTS=0;if(W)draw()}else if(__wl){__wl.release().catch(()=>{});__wl=null}});/* Steht die Sternkarte gar nicht im Bild - Bedienfeld hochgezogen, Anleitung oder
   Legende geoeffnet, zur Bedienseite geblaettert -, braucht weder die Zeit zu laufen
   noch etwas gezeichnet zu werden. Geprueft wird ueber die tatsaechliche Lage der
   Zeichenflaeche im Fenster; das deckt alle Faelle zugleich ab, ohne dass jede
   einzelne Ansicht einen eigenen Vermerk braucht. */
function _himmelSichtbar(){
  try{
    if(document.hidden)return false;
    const p=document.getElementById("panel");
    if(p&&p.classList.contains("sheet-open"))return false;
    const r=cv.getBoundingClientRect();
    const H=window.innerHeight||0,B=window.innerWidth||0;
    if(r.bottom<=8||r.top>=H-8)return false;
    if(r.right<=8||r.left>=B-8)return false;
    return true;
  }catch(e){return true}
}
let __loopPending=false,__lastRenderedJD=null,__lastLabelTS=0,__lastAstronomyTS=0,__lastEclipseInfoTS=0;
/* Astronomische Neuberechnung erst ab einer sichtbaren Verschiebung. Die
   scheinbare Himmelsdrehung betraegt rund 15 Grad je Stunde. Aus dem aktuellen
   Projektionsmassstab folgt, wie viele Simulationsminuten einem Bildpixel
   entsprechen. Starker Zoom verkleinert die Zeitschwelle automatisch. */
function __astronomyPixelMinutes(){
  const span=Math.max(1,Math.min(cvW||W,cvH||W));
  const pxRad=viewMode==="real"
    ?span/2/Math.tan(Math.max(.325,camFov)*Math.PI/720)
    :(span*.47/(Math.PI/2))*Math.max(1,zoom);
  /* Die sichtbare Schrittweite wird mit wachsender Zeitgeschwindigkeit kleiner.
     Gerade Beschriftungen verraten bereits Verschiebungen um ein bis zwei Pixel;
     bei 1 h/s wird deshalb unterhalb eines Pixels neu projiziert. */
  const absSpeed=Math.abs(speed);
  /* Eine feste Pixelschwelle waere bei 1 min/s erst nach vielen Frames erreicht
     und erzeugte dadurch seltene sichtbare Spruenge. Proportional zur Rate bleibt
     die Zahl der Positionsupdates dagegen ueber alle Zeitrafferstufen aehnlich. */
  const targetPx=absSpeed>=60?Math.max(.02,Math.min(.65,absSpeed/3600*.65)):1;
  return Math.max(.01,Math.min(4,targetPx/Math.max(.001,pxRad*Math.PI/720)));
}
/* Auf schnellen Endgeraeten darf der 1-h/s-Lauf mit echten 60 Hz praesentiert
   werden. Langsamere Geraete behalten ein groesseres Zeitbudget und vermeiden
   dadurch eine dauerhafte Ueberlastung. Die astronomische Genauigkeit bleibt
   in allen drei Stufen an die sichtbare Pixelbewegung gekoppelt. */
function __fastTimeIsDaylight(){if(viewMode!=="real")return false;const jd=currentJD(),sr=ecl2rd(sunLon(jd),0,jd);return geoAlt(sr.ra,sr.dec)>-12}
function __astronomyFrameInterval(){const s=Math.abs(speed),p=window.__devicePerformanceProfile&&window.__devicePerformanceProfile.level;if(viewMode==="real"&&s>=3600)return 0;if(s>=3600){/* Am Tag fehlen die teuren Gaia-/Milchstrassenebenen weitgehend. Die hohe
     Kontrastkante von Sonne und Horizont macht Positionsspruenge dagegen besonders
     sichtbar; deshalb hier 60-Hz-Ziel. Auch die Nacht laeuft auf mittleren und
     schnellen Geraeten mit 60 Hz, damit Namen und Linien nicht gegenueber den
     GPU-Sternen stufig wandern; schwache Geraete bleiben bei rund 42 Hz. */if(__fastTimeIsDaylight())return 16;return p==="low"?24:16}if(s>=900)return p==="low"?33:p==="high"?16:24;if(s>=60)return p==="low"?24:16;/* Auch die normale Startgeschwindigkeit muss Namen und Objekte im selben
     flüssigen Bildtakt bewegen. Die vorherigen 50–67 ms (15–20 Hz) waren als
     deutliches Hinterherspringen sichtbar. Nur als schwach erkannte Geräte
     werden auf rund 30 Hz begrenzt; alle anderen nutzen den vorhandenen RAF. */if(s>1)return p==="low"?33:16;return 0}
function __requestPlanetariumFrame(){
  if(__loopPending||document.hidden)return;
  __loopPending=true;
  requestAnimationFrame(loop);
}
/* Auch nachgeladene UI-Module muessen einen nach einem atomaren Szenensprung
   beendeten Bildtakt wieder anfordern koennen. */
window.__requestPlanetariumFrame=__requestPlanetariumFrame;
/* Nach einem Projektionswechsel folgt auf das schnelle Vorschaubild garantiert
   ein vollstaendiges Qualitaetsbild, auch wenn die Zeit pausiert ist. */
let __settledSkyFrameTimer=null;
function __requestSettledSkyFrame(){
  interacting=Math.max(2,interacting||0);__requestPlanetariumFrame();
  clearTimeout(__settledSkyFrameTimer);
  __settledSkyFrameTimer=setTimeout(()=>{interacting=0;if(W)draw()},90);
}
window.requestSettledSkyFrame=__requestSettledSkyFrame;
window.requestPlanetariumFrame=__requestPlanetariumFrame;
function __requestOptimalSkyFrame(){
  interacting=0;window.__gaiaVerticalPan=false;window.__gaiaTimeAdjusting=false;
  clearTimeout(__settledSkyFrameTimer);
  requestAnimationFrame(()=>{if(W)draw()});
}
window.requestOptimalSkyFrame=__requestOptimalSkyFrame;
/* Diese drei Grundfunktionen sind keine laufenden Gesten. Nach ihrem Klick darf
   deshalb niemals ein reduziertes Vorschau-LOD stehen bleiben. */
document.addEventListener("click",e=>{
  const id=e.target&&e.target.closest?e.target.closest("#bhome,#borient,#bview,#bview-fs")?.id:null;
  if(id){
    /* Die Hauptschalter steuern Ansichten des Himmels und dürfen den Benutzer
       nicht auf der Didaktik- oder Bedienseite stehen lassen. */
    if(typeof scrollToSky==="function")scrollToSky();
    queueMicrotask(__requestOptimalSkyFrame);
  }
},{capture:true});
/* Zeitregler und Zeitgesten behalten die vorab berechnete Gaia-Dichte sichtbar.
   Nach dem Loslassen wird einmal das vollständige Qualitätsbild gezeichnet. */
window.__gaiaTimeAdjusting=false;
function __beginGaiaTimeAdjustment(){window.__gaiaTimeAdjusting=true;__requestPlanetariumFrame()}
function __endGaiaTimeAdjustment(){
  if(!window.__gaiaTimeAdjusting)return;
  /* Kein Zwischenbild ohne Milchstraße erzeugen: Die schnelle Dichteebene bleibt
     bis zum vollständigen Abschlussbild aktiv und wird erst unmittelbar davor
     aus dem Zeitgestenmodus entlassen. */
  clearTimeout(__settledSkyFrameTimer);
  __settledSkyFrameTimer=setTimeout(()=>{
    interacting=0;window.__gaiaTimeAdjusting=false;if(W)draw();
  },90);
}
(function bindGaiaTimeControls(){
  const ids=new Set(["sTime","dayslider","yearslider"]);
  document.addEventListener("pointerdown",e=>{
    if((e.target&&ids.has(e.target.id))||(e.target===cv&&zoom<=1&&viewMode!=="real"))__beginGaiaTimeAdjustment();
  },{passive:true});
  document.addEventListener("input",e=>{if(e.target&&ids.has(e.target.id)){__beginGaiaTimeAdjustment();__requestPlanetariumFrame()}},{passive:true});
  document.addEventListener("change",e=>{if(e.target&&ids.has(e.target.id))__endGaiaTimeAdjustment()},{passive:true});
  window.addEventListener("pointerup",__endGaiaTimeAdjustment,{passive:true});
  window.addEventListener("pointercancel",__endGaiaTimeAdjustment,{passive:true});
})();
["pointerdown","wheel","input","change","keydown"].forEach(type=>{
  window.addEventListener(type,__requestPlanetariumFrame,{passive:true});
});
function loop(ts){__loopPending=false;const _sicht=_himmelSichtbar();
/* Waehrend einer Geste steht die Zeit still. Damit aendern sich die Oerter von Sonne,
   Mond und Planeten nicht, die zwischengespeicherte Praezession bleibt gueltig, und
   das Bild folgt allein dem Finger. lastT wird trotzdem weiter nachgefuehrt, sodass
   beim Loslassen kein Zeitsprung entsteht. */
if(!paused&&lastT!==null&&!sliderActive&&!(interacting>0)&&_sicht){const dt=Math.min((ts-lastT)/1e3,.08);simMin+=speed*dt/60;if(simMin>=1440){simMin-=1440;simDay++;if(simDay>daysInYear(simYear)){simDay=1;simYear++}}if(simMin<0){simMin+=1440;simDay--;if(simDay<1){simYear--;simDay=daysInYear(simYear)}}if((ts||0)-__lastLabelTS>=(Math.abs(speed)<=2?1000:250)){__lastLabelTS=ts||0;document.getElementById("sTime").value=Math.round(simMin);document.getElementById("dayslider").value=simDay;updLabels()}}if(!paused)lastT=ts;else lastT=null;if(interacting>0)interacting--;{const zr=document.getElementById("telfac");if(zr){const zm=curMag();const t="🔭 "+(zm<10?zm.toFixed(1):Math.round(zm))+"×";zr.style.opacity=zm>1.05?1:.55;if(zr.textContent!==t)zr.textContent=t}}{const pb=document.getElementById("bpause");if(pb){const _ez=paused;const t=_ez?"▶":"⏸";const html='<span class="bsym">'+t+'</span>';if(pb.innerHTML!==html)pb.innerHTML=html;pb.classList.toggle("on",!_ez)}}if(orientMode)stepOrient();{const ta="pan-y";if(cv.style.touchAction!==ta)cv.style.touchAction=ta}__wlSync(ts||0);const __jdNow=currentJD(),__timeMoved=__lastRenderedJD===null||Math.abs(__jdNow-__lastRenderedJD)*1440>=__astronomyPixelMinutes(),__frameReady=(ts||0)-__lastAstronomyTS>=__astronomyFrameInterval();const __act=interacting>0||orientMode||sliderActive||(!paused&&__timeMoved&&__frameReady);if(_sicht&&(__act||((ts||0)-__idleTS)>600)){__idleTS=ts||0;__lastAstronomyTS=ts||0;draw();__lastRenderedJD=__jdNow}
  /* Die Finsternisleiste braucht keine 60 vollständigen topozentrischen
     Berechnungen pro Sekunde. Vier Aktualisierungen je Sekunde wirken selbst im
     Zeitlauf kontinuierlich; bei Echtzeit ändert sich der Wert deutlich langsamer. */
  if(_sicht&&(ts-__lastEclipseInfoTS>=250||__lastEclipseInfoTS===0)){
    __lastEclipseInfoTS=ts;try{eclBoxAuto()}catch(e){}
  }
  try{_gaiaStufenPruefen();if(!_GAIA&&!_gaiaGefragt&&typeof curMag==="function"&&curMag()>=3)gaiaDialog()}catch(e){}
  if(!paused||interacting>0||orientMode||sliderActive)__requestPlanetariumFrame()
}/* Der Zeitregler las bisher zusätzlich den Breitenregler aus. Weil dieser nur
   ganze Grad kennt, wurde eine von Hand eingegebene Breite beim nächsten
   Verschieben der Uhrzeit auf ganze Grad gerundet. Beide Regler haben jetzt
   getrennte Empfänger. */
function onSl(){simMin=+document.getElementById("sTime").value;updLabels()}
function onLat(){
  const el=document.getElementById("sLat");if(!el)return;
  const v=parseFloat(el.value);if(!isFinite(v))return;
  lat=Math.max(-90,Math.min(90,v));
  selCity=null;document.querySelectorAll(".cbtn").forEach(b=>b.classList.remove("sel"));
  const il=document.getElementById("i-lat");if(il)il.value=lat.toFixed(1);
  updateLocDisp(null,lat,lng);updateTimezone();updLabels();
}function onSlLng(){lng=+document.getElementById("sLng").value;selCity=null;document.querySelectorAll(".cbtn").forEach(b=>b.classList.remove("sel"));const ig=document.getElementById("i-lng");if(ig)ig.value=lng.toFixed(1);updateLocDisp(null,lat,lng);updateTimezone();updLabels()}function onDaySlider(){simDay=+document.getElementById("dayslider").value;updLabels()}function yearLabel(y){return y<=0?(-y+1)+" v. Chr.":y+" n. Chr."}function yearShort(y){return y<=0?(-y+1)+" v. Chr.":""+y}function syncYearUI(){const ys=document.getElementById("yearslider");if(ys)ys.value=Math.max(-3e3,Math.min(8e3,simYear));const ds=document.getElementById("dayslider");if(ds){ds.max=daysInYear(simYear);ds.value=Math.max(1,Math.min(daysInYear(simYear),simDay))}const ytxt=yearShort(simYear);const ly=document.getElementById("lYear");if(ly)ly.textContent=ytxt;const yd=document.getElementById("yb-display");if(yd){yd.textContent=ytxt;yd.title="Jahr "+ytxt+" · antippen zum Eingeben"}}function stepDay(n){simDay+=n;while(simDay>daysInYear(simYear)){simDay-=daysInYear(simYear);simYear++}while(simDay<1){simYear--;simDay+=daysInYear(simYear)}syncYearUI();updateTimezone();updLabels()}function onYearSlider(){simYear=+document.getElementById("yearslider").value;if(simYear===0)simYear=-1;if(simDay>daysInYear(simYear))simDay=daysInYear(simYear);syncYearUI();updateTimezone();updLabels()}function stepYear(n){simYear=Math.max(-3e3,Math.min(8e3,simYear+n));if(simYear===0)simYear+=n>=0?1:-1;if(simDay>daysInYear(simYear))simDay=daysInYear(simYear);syncYearUI();updateTimezone();updLabels()}function promptYear(){const inp=prompt("Jahr eingeben: 2026 oder 1 v.Chr. als -1 (kein Jahr 0):",simYear);if(inp===null)return;let y=parseInt(String(inp).replace(/[^0-9+\-]/g,""),10);if(!isNaN(y)&&y>=-5e3&&y<=12e3){if(y===0)y=-1;simYear=y;if(simDay>daysInYear(simYear))simDay=daysInYear(simYear);syncYearUI();updateTimezone();updLabels()}}function findEclipse(dir,type){const startJD=currentJD();let jd=startJD+dir*.7;for(let i=0;i<2e4;i++){jd+=dir*.25;const el=moonElong(jd);const near=type==="solar"?el<5||el>355:Math.abs(el-180)<5;if(near){let best=jd,bestD=999;for(let dd=-.5;dd<=.5;dd+=.02){const e2=moonElong(jd+dd);const d=type==="solar"?Math.min(e2,360-e2):Math.abs(e2-180);if(d<bestD){bestD=d;best=jd+dd}}const lat0=Math.abs(moonEcl(best).lat);const thr=type==="solar"?1.4:1.5;if(lat0<thr&&Math.abs(best-startJD)>.5){if(type==="lunar"){let msep=1e9,mj=best;for(let dd=-.5;dd<=.5;dd+=.01){const mec=moonEcl(best+dd);const shLon=(sunLon(best+dd)+180)%360;let dLon=(mec.lon-shLon+540)%360-180;const sp=Math.hypot(dLon,mec.lat);if(sp<msep){msep=sp;mj=best+dd}}const mtU=moonTopo(mj);const mRu=Math.atan(1737.4/mtU.dist)*180/Math.PI;if(msep>=.7+mRu){jd=best+dir*15;continue}best=mj}if(type==="lunar"){const mt=moonTopo(best);const lstE=((GAST(best)+lng)%360+360)%360;const phi=lat*Math.PI/180;const altOf=(raH,decD)=>{const H=(lstE-raH*15)*Math.PI/180,dr=decD*Math.PI/180;return Math.asin(Math.sin(phi)*Math.sin(dr)+Math.cos(phi)*Math.cos(dr)*Math.cos(H))*180/Math.PI};const moonAlt=altOf(mt.ra,mt.dec);const srd=ecl2rd(sunLon(best),0,best);const sunAlt=altOf(srd.ra,srd.dec);if(!(moonAlt>0&&sunAlt<0)){jd=best+dir*15;continue}}if(type==="solar"){let bt=best,bd=1e9;for(let mm=-90;mm<=90;mm+=1){const j=best+mm/1440;const srd=ecl2rd(sunLon(j),0,j);const mt=moonTopo(j);const r1=srd.ra*15*Math.PI/180,d1=srd.dec*Math.PI/180,r2=mt.ra*15*Math.PI/180,d2=mt.dec*Math.PI/180;const sep=Math.acos(Math.max(-1,Math.min(1,Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(r1-r2))))*180/Math.PI;if(sep<bd){bd=sep;bt=j}}for(let ss=-60;ss<=60;ss+=.1){const j=bt+ss/1440;const srd=ecl2rd(sunLon(j),0,j);const mt=moonTopo(j);const r1=srd.ra*15*Math.PI/180,d1=srd.dec*Math.PI/180,r2=mt.ra*15*Math.PI/180,d2=mt.dec*Math.PI/180;const sep=Math.acos(Math.max(-1,Math.min(1,Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(r1-r2))))*180/Math.PI;if(sep<bd){bd=sep;bt=j}}const sepRadii=j=>{const srd=ecl2rd(sunLon(j),0,j);const mt=moonTopo(j);const r1=srd.ra*15*Math.PI/180,d1=srd.dec*Math.PI/180,r2=mt.ra*15*Math.PI/180,d2=mt.dec*Math.PI/180;const sep=Math.acos(Math.max(-1,Math.min(1,Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(r1-r2))))*180/Math.PI;const mR=Math.atan(1737.4/mt.dist)*180/Math.PI;const Tsun=(j-2451545)/36525,Msun=(357.52911+35999.05029*Tsun)*Math.PI/180;const sR=.2666/(1.000001018*(1-.01671123*Math.cos(Msun)));return sep-(sR+mR)};let c1=bt;for(let mm=0;mm<=180;mm++){const j=bt-mm/1440;if(sepRadii(j)>=0){c1=j;break}c1=j}return c1-6/1440}const lunarContact=j=>{const mec=moonEcl(j);const shLon=(sunLon(j)+180)%360;let dLon=(mec.lon-shLon+540)%360-180;const sep=Math.hypot(dLon,mec.lat);const mt=moonTopo(j);const mR=Math.atan(1737.4/mt.dist)*180/Math.PI;return sep-(.7+mR)};let c1=best;for(let mm=0;mm<=240;mm++){const j=best-mm/1440;if(lunarContact(j)>=0){c1=j;break}c1=j}let startJump=c1-6/1440;{const phi=lat*Math.PI/180;const moonAltAt=j=>{const mt=moonTopo(j);const lstE=((GAST(j)+lng)%360+360)%360;const H=(lstE-mt.ra*15)*Math.PI/180,dr=mt.dec*Math.PI/180;return Math.asin(Math.sin(phi)*Math.sin(dr)+Math.cos(phi)*Math.cos(dr)*Math.cos(H))*180/Math.PI};if(moonAltAt(startJump)<0){for(let mm=6;mm<=360;mm++){const j=c1-mm/1440;if(moonAltAt(j)<0){startJump=c1-(mm-1)/1440;break}}}}return startJump}jd=best+dir*15}}return null}/* ── Ort einer Sonnenfinsternis ───────────────────────────────────────────
*/
/* Die allgemeine Routine filtert Mondfinsternisse am lokalen Horizont zum
   Zeitpunkt des Maximums. Das ueberspringt reale Ereignisse, deren fruehere
   Phase noch sichtbar ist (insbesondere 28.08.2026). Fuer den Mond wird daher
   eine rein geometrische Ereignissuche verwendet; Ort und Ansicht bleiben beim
   anschliessenden Sprung weiterhin unveraendert. */
const _findEclipseMitOrtsfilter=findEclipse;
function _findGlobalLunarEclipse(dir){
  /* Beim ersten Aufruf darf auch eine unmittelbar bevorstehende oder bereits
     laufende Finsternis gefunden werden. Erst die Vor/Zurueck-Navigation der
     eingeblendeten Leiste ueberspringt das aktuelle Ereignis deutlich, damit
     derselbe Termin nicht erneut ausgewaehlt wird. */
  const navigiertBereits=!!(window.__eclipseNavigation&&window.__eclipseNavigation.type==="lunar");
  const startJD=currentJD();
  /* Die erste Vorwärtssuche umfasst den gesamten lokalen Kalendertag. So
     bleibt die Berliner Mondfinsternis vom 28.08.2026 auch nach ihrem
     morgendlichen Maximum der für diesen Tag ausgewählte Termin. */
  let jd=startJD+(dir>0&&!navigiertBereits?-1.25:0);
  for(let i=0;i<2e4;i++){
    jd+=dir*.25;
    if(Math.abs(moonElong(jd)-180)>=5)continue;
    let best=jd,bestSep=1e9;
    for(let dd=-.55;dd<=.55;dd+=.005){
      const j=jd+dd,mec=moonEcl(j),shadowLon=(sunLon(j)+180)%360;
      const dLon=(mec.lon-shadowLon+540)%360-180;
      const sep=Math.hypot(dLon,mec.lat);
      if(sep<bestSep){bestSep=sep;best=j}
    }
    const mt=moonTopo(best),moonR=Math.atan(1737.4/mt.dist)*180/Math.PI;
    const lokalerTag=j=>Math.floor(j+utcOff/24+.5);
    const gleicherTag=!navigiertBereits&&lokalerTag(best)===lokalerTag(startJD);
    const richtungOk=dir>0
      ? best>startJD+(navigiertBereits?.5:-.5)||gleicherTag
      : best<startJD-(navigiertBereits?.5:-.5);
    if(bestSep>=.7+moonR||!richtungOk){jd+=dir*15;continue}
    const contactDistance=j=>{
      const mec=moonEcl(j),shadowLon=(sunLon(j)+180)%360;
      const dLon=(mec.lon-shadowLon+540)%360-180;
      const r=Math.atan(1737.4/moonTopo(j).dist)*180/Math.PI;
      return Math.hypot(dLon,mec.lat)-(.7+r);
    };
    let first=best;
    for(let mm=0;mm<=240;mm++){
      const j=best-mm/1440;
      if(contactDistance(j)>=0){first=j;break}
      first=j;
    }
    return first-6/1440;
  }
  return null;
}
findEclipse=function(dir,type){
  return type==="lunar"?_findGlobalLunarEclipse(dir):_findEclipseMitOrtsfilter(dir,type);
};

/* Der Sprung zur nächsten Sonnenfinsternis stellte bisher nur die Zeit um und
   ließ den Beobachtungsort stehen. Von dort aus war die Finsternis meist gar
   nicht zu sehen. Jetzt wird unter den Städten der Ortsliste diejenige gesucht,
   in der die Bedeckung am größten ist und die Sonne dabei mindestens 3° hoch
   steht. Städte liegen auf dem Land, damit ist die Forderung nach einem Ort an
   Land ohne Küstenlinien erfüllt.                                            */
function _finSonne(j){
  const r=ecl2rd(sunLon(j),0,j);
  const T=(j-2451545)/36525,M=(357.52911+35999.05029*T)*Math.PI/180;
  return {ra:r.ra,dec:r.dec,R:.2666/(1.000001018*(1-.01671123*Math.cos(M)))};
}
function _finMondGeo(j){const m=moonEcl(j),r=ecl2rd(m.lon,m.lat,j);return {ra:r.ra,dec:r.dec,dist:m.dist}}
function _finTopo(mg,j,la,lo){
  const sinPi=6378.14/mg.dist,phi=la*Math.PI/180;
  const u=Math.atan(.99664719*Math.tan(phi));
  const rhoSin=.99664719*Math.sin(u),rhoCos=Math.cos(u);
  const lst=((GAST(j)+lo)%360+360)%360;
  const H=(lst-mg.ra*15)*Math.PI/180,dec=mg.dec*Math.PI/180;
  const dRA=Math.atan2(-rhoCos*sinPi*Math.sin(H),Math.cos(dec)-rhoCos*sinPi*Math.cos(H));
  const raT=mg.ra*15*Math.PI/180+dRA;
  const decT=Math.atan2((Math.sin(dec)-rhoSin*sinPi)*Math.cos(dRA),Math.cos(dec)-rhoCos*sinPi*Math.cos(H));
  return {ra:(raT*180/Math.PI/15+24)%24,dec:decT*180/Math.PI,dist:mg.dist};
}
function _finHoehe(ra,dec,j,la,lo){
  const lst=((GAST(j)+lo)%360+360)%360;
  const H=(lst-ra*15)*Math.PI/180,d=dec*Math.PI/180,phi=la*Math.PI/180;
  return Math.asin(Math.sin(phi)*Math.sin(d)+Math.cos(phi)*Math.cos(d)*Math.cos(H))*180/Math.PI;
}
function _finSep(a,b){
  const r1=a.ra*15*Math.PI/180,d1=a.dec*Math.PI/180,r2=b.ra*15*Math.PI/180,d2=b.dec*Math.PI/180;
  return Math.acos(Math.max(-1,Math.min(1,Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(r1-r2))))*180/Math.PI;
}
function _finMag(j,la,lo){
  const s=_finSonne(j),mt=_finTopo(_finMondGeo(j),j,la,lo);
  const mR=Math.atan(1737.4/mt.dist)*180/Math.PI;
  return {mag:(s.R+mR-_finSep(s,mt))/(2*s.R),h:_finHoehe(s.ra,s.dec,j,la,lo)};
}
/* Ersten Kontakt fuer den bereits gewaehlten Beobachtungsort bestimmen.
   Die grobe Ortssuche arbeitet minutenweise; fuer den Szenenstart wird die
   Nullstelle der Bedeckung anschliessend auf deutlich unter eine Sekunde
   verfeinert. */
function _finErsterKontakt(jdMax,la,lo){
  let innen=jdMax,aussen=jdMax-8/24;
  if(_finMag(innen,la,lo).mag<=0)return jdMax;
  let vorher=innen;
  for(let m=1;m<=480;m++){
    const j=jdMax-m/1440;
    if(_finMag(j,la,lo).mag<=0){aussen=j;innen=vorher;break}
    vorher=j;
  }
  for(let i=0;i<28;i++){
    const mitte=(aussen+innen)/2;
    if(_finMag(mitte,la,lo).mag>0)innen=mitte;else aussen=mitte;
  }
  return innen;
}
function _finGroesste(j0){
  let bt=j0,bd=1e9;
  for(let m=-720;m<=720;m+=5){const j=j0+m/1440;const d=_finSep(_finSonne(j),_finMondGeo(j));if(d<bd){bd=d;bt=j}}
  for(let m=-10;m<=10;m+=.2){const j=bt+m/1440;const d=_finSep(_finSonne(j),_finMondGeo(j));if(d<bd){bd=d;bt=j}}
  return bt;
}
const _FIN_EU_LAENDER=new Set(["Deutschland","Österreich","Schweiz","Großbritannien","Frankreich","Spanien","Italien","Niederlande","Belgien","Portugal","Griechenland","Schweden","Norwegen","Dänemark","Finnland","Island","Irland","Polen","Tschechien","Ungarn","Slowakei","Slowenien","Kroatien","Serbien","Rumänien","Bulgarien","Lettland","Litauen","Estland","Ukraine","Belarus","Russland"]);
let _finNurEuropa=false,_eclipseVorgabeJD=null;
function finsternisStadt(j0){
  if(typeof CITIES==="undefined"||!CITIES||!CITIES.length)return null;
  const tm=_finGroesste(j0);
  const proben=[];
  for(let m=-240;m<=240;m+=10){const j=tm+m/1440;proben.push({j:j,s:_finSonne(j),m:_finMondGeo(j)})}
  let beste=null;
  for(let i=0;i<CITIES.length;i++){
    const c=CITIES[i];if(_finNurEuropa&&!_FIN_EU_LAENDER.has(c.land))continue;let bm=-9,bj=null,bh=0;
    for(let k=0;k<proben.length;k++){
      const p=proben[k];
      const h=_finHoehe(p.s.ra,p.s.dec,p.j,c.la,c.lo);
      if(h<3)continue;
      const mt=_finTopo(p.m,p.j,c.la,c.lo);
      const mR=Math.atan(1737.4/mt.dist)*180/Math.PI;
      const mag=(p.s.R+mR-_finSep(p.s,mt))/(2*p.s.R);
      if(mag>bm){bm=mag;bj=p.j;bh=h}
    }
    if(bm>0&&(!beste||bm>beste.mag))beste={c:c,mag:bm,j:bj,h:bh};
  }
  if(!beste)return null;
  for(let m=-12;m<=12;m+=.5){
    const j=beste.j+m/1440,r=_finMag(j,beste.c.la,beste.c.lo);
    if(r.h>=0&&r.mag>beste.mag){beste.mag=r.mag;beste.j=j;beste.h=r.h}
  }
  /* erster Kontakt an diesem Ort, sechs Minuten Vorlauf */
  let start=beste.j;
  for(let m=1;m<=200;m++){
    const j=beste.j-m/1440,r=_finMag(j,beste.c.la,beste.c.lo);
    start=j;
    if(r.mag<=0)break;
  }
  return {stadt:beste.c,mag:beste.mag,jdMax:beste.j,jdStart:start-6/1440,hoehe:beste.h};
}
/* Wie bei der Sonnenfinsternis wird auch für eine Mondfinsternis vor dem
   Szenenwechsel ein geeigneter Beobachtungsort bestimmt. Entscheidend sind
   die Finsternistiefe, ein sichtbarer Mond und ein dunkler Himmel. */
function mondfinsternisStadt(j0){
  if(typeof CITIES==="undefined"||!CITIES||!CITIES.length)return null;
  let jdMax=j0,maxMag=_lunarEclipseMagnitude(j0);
  for(let m=-360;m<=480;m+=2){
    const j=j0+m/1440,mag=_lunarEclipseMagnitude(j);
    if(mag>maxMag){maxMag=mag;jdMax=j}
  }
  let beste=null;
  for(let i=0;i<CITIES.length;i++){
    const c=CITIES[i],mond=_finMondGeo(jdMax),mt=_finTopo(mond,jdMax,c.la,c.lo);
    const mondHoehe=_finHoehe(mt.ra,mt.dec,jdMax,c.la,c.lo);
    const sonne=_finSonne(jdMax),sonnenHoehe=_finHoehe(sonne.ra,sonne.dec,jdMax,c.la,c.lo);
    if(mondHoehe<3||sonnenHoehe>0)continue;
    const score=maxMag*1000+mondHoehe-sonnenHoehe*.15;
    if(!beste||score>beste.score)beste={c:c,score:score,h:mondHoehe};
  }
  if(!beste)return null;
  return {stadt:beste.c,mag:maxMag,jdMax:jdMax,jdStart:j0,hoehe:beste.h};
}
/* Rückfall für Finsternisse, die keine größere Stadt der eingebauten Ortsliste treffen. */
function _finOzean(la,lo){
  if(la>66)return "Arktischer Ozean";
  if(la<-55)return "Südlicher Ozean";
  if(lo>=20&&lo<120)return "Indischer Ozean";
  if(lo>=-70&&lo<20)return "Atlantischer Ozean";
  return "Pazifischer Ozean";
}
function _finGebietsname(la,lo){
  if(typeof CITIES!=="undefined"&&CITIES&&CITIES.length){
    let nah=null,dist=1e9;
    for(let i=0;i<CITIES.length;i++){
      const c=CITIES[i],dy=c.la-la,dx=(((c.lo-lo+540)%360)-180)*Math.cos(la*Math.PI/180),d=Math.hypot(dx,dy);
      if(d<dist){dist=d;nah=c}
    }
    if(nah&&dist<12)return {n:nah.land,land:""};
  }
  return {n:_finOzean(la,lo),land:""};
}
function finsternisGebiet(j0){
  const tm=_finGroesste(j0);let beste=null;
  for(let la=-70;la<=70;la+=5)for(let lo=-180;lo<180;lo+=5)for(let m=-180;m<=180;m+=15){
    const j=tm+m/1440,r=_finMag(j,la,lo);
    if(r.h>=3&&r.mag>0&&(!beste||r.mag>beste.mag))beste={la:la,lo:lo,j:j,mag:r.mag,h:r.h};
  }
  if(!beste)return null;
  for(let la=beste.la-5;la<=beste.la+5;la+=1)for(let lo=beste.lo-5;lo<=beste.lo+5;lo+=1)for(let m=-15;m<=15;m+=1){
    const j=beste.j+m/1440,r=_finMag(j,la,lo);
    if(r.h>=0&&r.mag>beste.mag)beste={la:la,lo:lo,j:j,mag:r.mag,h:r.h};
  }
  const ort=_finGebietsname(beste.la,beste.lo);
  return {stadt:{n:ort.n,land:ort.land,la:beste.la,lo:beste.lo},mag:beste.mag,jdMax:beste.j,hoehe:beste.h,fallback:true};
}
function _merkeFinsternisAusgang(){
  if(window.__eclipseNavigationOrigin)return window.__eclipseNavigationOrigin;
  const p=_eclipseCurrentPlace();
  return window.__eclipseNavigationOrigin={lat:lat,lng:lng,stadt:p.stadt,land:p.land||""};
}
function _stelleFinsternisAusgangWiederHer(heute){
  const o=window.__eclipseNavigationOrigin;
  if(!o)return;
  lat=o.lat;lng=o.lng;selCity=null;
  try{updateTimezone()}catch(e){}
  try{updateLocDisp(o.stadt,lat,lng)}catch(e){}
  const il=document.getElementById("i-lat"),ig=document.getElementById("i-lng"),sl=document.getElementById("sLat"),sg=document.getElementById("sLng");
  if(il)il.value=lat.toFixed(4);if(ig)ig.value=lng.toFixed(4);if(sl)sl.value=lat;if(sg)sg.value=lng;
  if(heute&&typeof setNow==="function")setNow();else{try{updLabels()}catch(e){}}
}
function ensureEclBox(){
  let b=document.getElementById("ecl-info");
  if(b)return b;
  b=document.createElement("div");b.id="ecl-info";
  b.innerHTML='<button type="button" class="ei-prev" title="Zur vorherigen Sonnenfinsternis">◀ Vorherige</button>'+
    '<span class="ei-date"></span><span class="ei-place"></span><span class="ei-cover"></span>'+
    '<button type="button" class="ei-next" title="Zur folgenden Sonnenfinsternis: Zeit und Ort werden neu gesetzt, der Ort auf die Stadt mit der größten Bedeckung">Nächste \u25B6</button>'+
    '<button type="button" class="ei-zu" title="Anzeige schließen">\u2715</button>';
  document.body.appendChild(b);
  b.querySelector(".ei-prev").onclick=function(e){e.preventDefault();e.stopPropagation();
    const typ=(window.__eclipseNavigation&&window.__eclipseNavigation.type)||"solar";
    try{beginAtomicSkyJump(520);_stelleFinsternisAusgangWiederHer(false);jumpToEclipse(-1,typ)}catch(err){}};
  b.querySelector(".ei-next").onclick=function(e){e.preventDefault();e.stopPropagation();
    const typ=(window.__eclipseNavigation&&window.__eclipseNavigation.type)||"solar";
    try{beginAtomicSkyJump(520);_stelleFinsternisAusgangWiederHer(false);jumpToEclipse(1,typ)}catch(err){}};
  b.querySelector(".ei-zu").onclick=function(e){
    e.preventDefault();e.stopPropagation();
    window.__eclZu=true;verbergeEclBox();_pendingEclBox=null;
    window.__eclipseNavigation=null;
    _stelleFinsternisAusgangWiederHer(true);
    window.__eclipseNavigationOrigin=null;
    if(W)draw();
  };
  return b;
}
function verbergeEclBox(){const b=document.getElementById("ecl-info");if(b)b.classList.remove("open")}
function _himmelsseiteIstSichtbar(){
  const sc=document.getElementById("scroller"),sky=document.getElementById("page-sky");
  if(!sc||!sky)return false;
  return Math.abs(sc.scrollTop-sky.offsetTop)<Math.max(4,window.innerHeight*.08);
}
let _pendingEclBox=null;
function zeigeEclBox(datum,stadt,land,proz,type){
  const b=ensureEclBox();
  type=type==="lunar"?"lunar":"solar";
  window.__eclipseNavigation={stadt:stadt,land:land||"",type:type};
  b.dataset.eclipseType=type;
  b.querySelector(".ei-prev").title=type==="lunar"?"Zur vorherigen Mondfinsternis":"Zur vorherigen Sonnenfinsternis";
  b.querySelector(".ei-next").title=type==="lunar"?"Zur folgenden Mondfinsternis":"Zur folgenden Sonnenfinsternis";
  b.querySelector(".ei-date").textContent=datum;
  b.querySelector(".ei-place").textContent=stadt+(land?", "+land:"");
  b.querySelector(".ei-cover").textContent=proz+"\u202F% "+(type==="lunar"?"im Erdschatten":"bedeckt");
  _pendingEclBox=b;
  if(__atomicSkyUntil>performance.now()||window.__didacticSceneJumpActive||!_himmelsseiteIstSichtbar()){
    b.classList.remove("open");
    return;
  }
  b.classList.add("open");
}
function zeigeVorgemerkteEclBoxAufHimmel(){
  const b=_pendingEclBox;
  if(!b||!window.__eclipseNavigation)return;
  let n=0;
  const pruefe=function(){
    if(window.__eclZu||_pendingEclBox!==b||!window.__eclipseNavigation)return;
    if(_himmelsseiteIstSichtbar()&&!window.__didacticSceneJumpActive){b.classList.add("open");return}
    if(++n<12)requestAnimationFrame(pruefe);
  };
  requestAnimationFrame(pruefe);
}
window.__hideEclipseNavigation=verbergeEclBox;
window.__closeEclipseNavigation=function(){
  window.__eclZu=true;
  _pendingEclBox=null;
  window.__eclipseNavigation=null;
  window.__eclipseNavigationOrigin=null;
  verbergeEclBox();
};
function _lunarEclipseMagnitude(j){
  const mec=moonEcl(j),shadowLon=(sunLon(j)+180)%360;
  const dLon=(mec.lon-shadowLon+540)%360-180;
  const sep=Math.hypot(dLon,mec.lat);
  const moonR=Math.atan(1737.4/moonTopo(j).dist)*180/Math.PI;
  return Math.max(0,Math.min(1,(.7+moonR-sep)/(2*moonR)));
}
/* Sichtbarkeit am wirklich eingestellten/GPS-Ort wird über die gesamte
   Finsternis geprüft. Damit zählen auch eine partielle Phase sowie Ereignisse,
   deren Maximum erst nach Mond-/Sonnenuntergang liegt. */
function _eclipseLocalVisibility(j0,type,la,lo){
  let first=null,bestJ=null,bestMag=0,bestAlt=-90;
  for(let m=-480;m<=480;m+=2){
    const j=j0+m/1440;
    let mag,hoehe;
    if(type==="solar"){
      const r=_finMag(j,la,lo);mag=r.mag;hoehe=r.h;
    }else{
      mag=_lunarEclipseMagnitude(j);
      const mt=_finTopo(_finMondGeo(j),j,la,lo);
      hoehe=_finHoehe(mt.ra,mt.dec,j,la,lo);
    }
    if(mag<=0||hoehe<=0)continue;
    if(first===null)first=j;
    if(mag>bestMag){bestMag=mag;bestJ=j;bestAlt=hoehe}
  }
  if(first===null)return null;
  return {jdStart:first,jdMax:bestJ,mag:bestMag,hoehe:bestAlt};
}
function _besteEuropaeischeFinsternis(j0,type){
  if(typeof CITIES==="undefined"||!CITIES)return null;
  let beste=null;
  for(let i=0;i<CITIES.length;i++){
    const c=CITIES[i];
    if(!_FIN_EU_LAENDER.has(c.land))continue;
    const sicht=_eclipseLocalVisibility(j0,type,c.la,c.lo);
    if(!sicht)continue;
    const score=sicht.mag*1000+sicht.hoehe;
    if(!beste||score>beste.score)beste={
      stadt:c,mag:sicht.mag,jdMax:sicht.jdMax,jdStart:sicht.jdStart,
      hoehe:sicht.hoehe,score:score,europa:true
    };
  }
  return beste;
}
function _eclipseCurrentPlace(){
  const c=_eclNaechsteStadt(lat,lng);
  if(c)return {stadt:c.n,land:c.land||""};
  return {stadt:`${Math.abs(lat).toFixed(1)}°${lat>=0?"N":"S"} ${Math.abs(lng).toFixed(1)}°${lng>=0?"O":"W"}`,land:""};
}
/* Nach dem Sprung soll die Himmelsansicht sichtbar sein */
function zeigeHimmelsseite(){
  try{
    if(__atomicSkyUntil>performance.now()){
      queueAtomicSkyCommit(zeigeHimmelsseite);
      return;
    }
    const sc=document.getElementById("scroller"),sky=document.getElementById("page-sky");
    if(!sc||!sky)return;
    const snapAlt=sc.style.scrollSnapType;sc.style.scrollSnapType="none";
    let n=0;
    const schritt=function(){
      sc.scrollTop=sky.offsetTop;
      if(++n<6)requestAnimationFrame(schritt);
      else{try{sc.style.scrollSnapType=snapAlt||""}catch(e){}zeigeVorgemerkteEclBoxAufHimmel()}
    };
    requestAnimationFrame(schritt);
    setTimeout(function(){try{sc.style.scrollSnapType=snapAlt||""}catch(e){}},900);
    const p=document.getElementById("loc-panel");if(p)p.classList.remove("open");
  }catch(e){}
}
/* Der Kasten erschien bisher nur beim Sprung über die Finsternisschalter. Wird
   dieselbe Finsternis über eine Didaktikkarte aufgerufen, lief er nicht mit.
   Er richtet sich jetzt nach dem tatsächlichen Zustand: läuft am eingestellten
   Ort und Zeitpunkt eine Sonnenfinsternis, wird er gezeigt, sonst ausgeblendet. */
function _eclNaechsteStadt(la,lo){
  if(typeof CITIES==="undefined"||!CITIES)return null;
  let best=null,bd=1e9;
  for(let i=0;i<CITIES.length;i++){
    const c=CITIES[i];
    const dl=Math.abs(((c.lo-lo+540)%360)-180)*Math.cos((la+c.la)/2*Math.PI/180);
    const d=Math.hypot(c.la-la,dl);
    if(d<bd){bd=d;best=c}
  }
  return (best&&bd<4.5)?best:null;   /* etwa 500 km */
}
let _eclPruef=0;
function eclBoxAuto(){
  const now=(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();
  if(now-_eclPruef<400)return; _eclPruef=now;
  try{
    const jd=currentJD();
    const r=_finMag(jd,lat,lng);
    if(window.__eclipseNavigation){
      const nav=window.__eclipseNavigation;
      const ld=new Date((jd-2440587.5)*864e5+(typeof utcOff!=="undefined"?utcOff:0)*3600e3);
      const ds=`${ld.getUTCDate()}.${ld.getUTCMonth()+1}.${ld.getUTCFullYear()}`;
      const proz=nav.type==="lunar"?Math.round(_lunarEclipseMagnitude(jd)*100):Math.round(Math.max(0,Math.min(100,r.mag*100)));
      zeigeEclBox(ds,nav.stadt,nav.land,proz,nav.type);
      return;
    }
    /* Nur ein ausdruecklicher Finsternissprung aus der Didaktik darf die
       Navigation einblenden. Nach dem Kreuz bleibt sie geschlossen. */
    verbergeEclBox();
  }catch(e){}
}
function jumpToEclipse(dir,type){beginAtomicSkyJump(420);_merkeFinsternisAusgang();window.__lastJumpId="eclipse-"+type;window.__eclZu=false;let jd=_eclipseVorgabeJD??findEclipse(dir,type),finOrt=null;_eclipseVorgabeJD=null;
  if(jd===null){alert("Keine Finsternis gefunden.");return}
  /* Die Suche beginnt stets mit den wiederhergestellten aktuellen
     Standortparametern. Ist das Ereignis irgendwo in Europa sichtbar, wird
     dort der beste Beobachtungsort gewählt. Andernfalls folgt der aktuelle
     Ort und erst zuletzt die weltweite Ausweichsuche. */
  const europaSicht=_besteEuropaeischeFinsternis(jd,type);
  if(europaSicht){
    finOrt=europaSicht;
    jd=europaSicht.jdStart;
    if(typeof applyCity==="function")applyCity({n:finOrt.stadt.n,la:finOrt.stadt.la,lo:finOrt.stadt.lo,land:finOrt.stadt.land},finOrt.stadt.n);
    else{lat=finOrt.stadt.la;lng=finOrt.stadt.lo}
  }
  const lokaleSicht=!finOrt?_eclipseLocalVisibility(jd,type,lat,lng):null;
  if(lokaleSicht){
    const p=_eclipseCurrentPlace();
    finOrt={stadt:{n:p.stadt,land:p.land,la:lat,lo:lng},mag:lokaleSicht.mag,jdMax:lokaleSicht.jdMax,jdStart:lokaleSicht.jdStart,hoehe:lokaleSicht.hoehe,lokal:true};
    jd=lokaleSicht.jdStart;
  }
  if(type==="solar"&&!finOrt){
    try{
      finOrt=finsternisStadt(jd)||(!_finNurEuropa?finsternisGebiet(jd):null);
      if(finOrt){
        jd=_finErsterKontakt(finOrt.jdMax,finOrt.stadt.la,finOrt.stadt.lo);
        if(typeof applyCity==="function")applyCity({n:finOrt.stadt.n,la:finOrt.stadt.la,lo:finOrt.stadt.lo,land:finOrt.stadt.land},finOrt.stadt.n);
        else{lat=finOrt.stadt.la;lng=finOrt.stadt.lo}
      }
    }catch(e){finOrt=null}
  }else if(type==="lunar"&&!finOrt){
    try{
      finOrt=mondfinsternisStadt(jd);
      if(finOrt){
        jd=finOrt.jdStart;
        if(typeof applyCity==="function")applyCity({n:finOrt.stadt.n,la:finOrt.stadt.la,lo:finOrt.stadt.lo,land:finOrt.stadt.land},finOrt.stadt.n);
        else{lat=finOrt.stadt.la;lng=finOrt.stadt.lo}
      }
    }catch(e){finOrt=null}
  }
const date=new Date((jd-2440587.5)*864e5);simYear=date.getUTCFullYear();utcBase=tzFromLng(lng);const approxLocal=new Date(date.getTime()+utcBase*3600*1e3);const approxDoy=date2doy(approxLocal.getUTCDate(),approxLocal.getUTCMonth(),approxLocal.getUTCFullYear());const inEU=lng>=-10&&lng<=40&&lat>=34&&lat<=72;applyDST(inEU&&euDSTactive(simYear,approxDoy));const localMs=date.getTime()+utcOff*3600*1e3;const ld=new Date(localMs);simDay=date2doy(ld.getUTCDate(),ld.getUTCMonth(),simYear);simMin=ld.getUTCHours()*60+ld.getUTCMinutes()+ld.getUTCSeconds()/60;syncYearUI();document.getElementById("sTime").value=Math.round(simMin);document.getElementById("dayslider").value=simDay;updLabels();setSpeedValue(30);setPaused(false);__requestPlanetariumFrame();if(type==="solar"&&typeof pointObserverAtSun==="function")pointObserverAtSun();if(type==="lunar"&&typeof pointObserverAtMoon==="function")pointObserverAtMoon();const pb=document.getElementById("ba");if(pb){pb.textContent="⏸ Pause";pb.classList.add("on")}const tn=type==="solar"?"Sonnenfinsternis":"Mondfinsternis";const ds=`${ld.getUTCDate()}.${ld.getUTCMonth()+1}.${simYear}`;
const ort=finOrt?` · ${finOrt.stadt.n}${finOrt.stadt.land?`, `+finOrt.stadt.land:``} · ${Math.round(Math.min(100,finOrt.mag*100))} % ${type==="lunar"?"im Erdschatten":"bedeckt"}`:(type==="solar"?" · von keiner Stadt der Liste aus sichtbar":"");showToast(`${dir>0?"Nächste":"Vorherige"} ${tn}: ${ds}${ort} — Beginn der Verdeckung · 30 s/s`);
  if(type==="solar"&&finOrt)zeigeEclBox(ds,finOrt.stadt.n,finOrt.stadt.land,0,"solar");
  else if(type==="lunar"){
    const p=finOrt?{stadt:finOrt.stadt.n,land:finOrt.stadt.land||""}:_eclipseCurrentPlace();
    zeigeEclBox(ds,p.stadt,p.land,Math.round(_lunarEclipseMagnitude(jd)*100),"lunar");
  }else{window.__eclipseNavigation=null;verbergeEclBox()}
  zeigeHimmelsseite();if(W)draw()}let _toastT=null;function showToast(msg){let t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";t.style.cssText="position:fixed;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(20,16,30,.95);color:#e8d08a;padding:.5rem .9rem;border-radius:8px;border:1px solid #6a5a30;font-size:.8rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.5);pointer-events:none";document.body.appendChild(t)}t.style.pointerEvents="none";t.textContent=msg;t.style.visibility="visible";t.style.opacity="1";clearTimeout(_toastT);_toastT=setTimeout(()=>{t.style.opacity="0";t.style.transition="opacity .5s";setTimeout(()=>{if(t.style.opacity==="0")t.style.visibility="hidden"},600)},2600)}function promptDate(){const{d:d,m:m}=doy2date(simDay);const inp=prompt("Datum eingeben (Tag.Monat oder Tag.Monat.Jahr):",`${d}.${m+1}.${simYear}`);if(!inp)return;const parts=inp.split(".").map(s=>parseInt(s.trim()));if(parts.length>=2&&parts[0]>=1&&parts[1]>=1&&parts[1]<=12){if(parts.length>=3&&parts[2]>=1&&parts[2]<=9999)simYear=parts[2];const md=monthDays(simYear);const day=Math.min(parts[0],md[parts[1]-1]);simDay=Math.max(1,Math.min(daysInYear(simYear),date2doy(day,parts[1]-1,simYear)));document.getElementById("dayslider").value=simDay;updLabels()}}function updLabels(){const{d:d,m:m}=doy2date(simDay);const sm=(simMin%1440+1440)%1440,hh=Math.floor(sm/60),mm=Math.round(sm%60);document.getElementById("lDay").textContent=`${d}. ${MN[m]}`;document.getElementById("lTime").textContent=`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;syncYearUI();document.getElementById("lLat").textContent=`${Math.abs(Math.round(lat*10)/10)}°${lat>=0?"N":"S"}`;const llng=document.getElementById("lLng");if(llng)llng.textContent=`${Math.abs(Math.round(lng*10)/10)}°${lng>=0?"O":"W"}`;const slng=document.getElementById("sLng");if(slng&&!sliderActive)slng.value=Math.max(-180,Math.min(180,Math.round(lng*10)/10));const slat=document.getElementById("sLat");if(slat&&!sliderActive)slat.value=Math.max(-90,Math.min(90,Math.round(lat*10)/10));const jd=currentJD(),{rise:rise,set:set}=sunriseSunset(jd,lat,lng,utcOff),age=moonAge(jd),mp=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"][Math.floor(moonElong(jd)/45)%8];const lstDeg=((GAST(jd)+lng)%360+360)%360,lstH=lstDeg/15,lh=Math.floor(lstH),lm=Math.floor((lstH-lh)*60);const latStr=`${Math.abs(lat).toFixed(1)}°${lat>=0?"N":"S"}`;const fmt=hh2=>hh2==null?"–":hhmm(hh2);const mrs=moonRiseSetCached();const tr=document.getElementById("info-tr");const _rt=(typeof speed==="number"&&speed>=.5&&speed<=2);let _hh2=hh,_mm2=_rt?Math.floor(sm%60):mm;const _ss=Math.floor((sm*60)%60);if(_mm2>=60){_mm2=0;_hh2=(_hh2+1)%24}const _clock=String(_hh2).padStart(2,"0")+":"+String(_mm2).padStart(2,"0")+(_rt?":"+String(_ss).padStart(2,"0"):"");if(tr)tr.innerHTML=`<strong>${d}. ${MN[m]} ${yearShort(simYear)}</strong>`+`<br>🕐 <b class="hi num">${_clock}</b>`+`<br>★ <strong class="num">${String(lh).padStart(2,"0")}:${String(lm).padStart(2,"0")}</strong>`;const br=document.getElementById("info-br");if(br){const zm=curMag();br.innerHTML=`<span id="telfac" class="num" style="opacity:${zm>1.05?1:.55}">🔭 ${zm<10?zm.toFixed(1):Math.round(zm)}×</span>`+`<br><strong>${latStr}</strong>`+`<br><strong>${Math.abs(lng).toFixed(1)}°${lng>=0?"O":"W"}</strong>`}const bl=document.getElementById("info-bl");if(bl)bl.innerHTML=`<div class="rsgrid">`+`<span>☀</span><span class="lbl">↑</span><strong class="num">${fmt(rise)}</strong><span class="lbl">↓</span><strong class="num">${fmt(set)}</strong>`+`<span>${mp}</span><span class="lbl">↑</span><strong class="num">${fmt(mrs.rise)}</strong><span class="lbl">↓</span><strong class="num">${fmt(mrs.set)}</strong>`+`</div>`+`<div class="agerow"><span class="lbl">Alter</span> <strong class="num">${age.toFixed(1).replace(".",",")}</strong> <span class="lbl">Tage</span></div>`}function setSp(v){const pos=+v/1e3;const sp=Math.exp(pos*Math.log(3600));speed=sp;if(sp>2)userSpeed=sp;let label;if(sp>=3600)label="1h/s";else if(sp>=60)label=(sp/60).toFixed(sp<600?1:0)+"min/s";else if(sp>=1)label=Math.round(sp)+"×";else label=sp.toFixed(1)+"×";document.getElementById("lSpd").textContent=label}function updatePauseButtons(){const ba=document.getElementById("ba");if(ba){ba.textContent=paused?"▶ Play":"⏸ Pause";ba.classList.toggle("on",!paused)}const bp=document.getElementById("bpause");if(bp){bp.textContent=paused?"▶ Start":"⏸ Pause";bp.classList.toggle("on",!paused)}}function setPaused(v){paused=!!v;lastT=null;updatePauseButtons()}function togAnim(){setPaused(!paused);if(!paused&&typeof window.__requestPlanetariumFrame==="function")window.__requestPlanetariumFrame();if(W)draw()}function togNames(){showNames=!showNames;document.getElementById("bn").classList.toggle("on",showNames)}function togHorizon(){showHorizon=!showHorizon;document.getElementById("bh").classList.toggle("on",showHorizon)}function togAlt(){showAlt=!showAlt;document.getElementById("balt").classList.toggle("on",showAlt)}function togRA(){showRA=!showRA;document.getElementById("bra").classList.toggle("on",showRA);if(W)draw()}function togLines(){showLines=!showLines;document.getElementById("blines").classList.toggle("on",showLines);if(W)draw()}function togRefCircles(){showRefCircles=!showRefCircles;document.getElementById("brefc").classList.toggle("on",showRefCircles);if(W)draw()}function togZodiac(){showZodiac=!showZodiac;document.getElementById("bzod").classList.toggle("on",showZodiac);if(W)draw()}let cleanSaved=null;function toggleClean(){if(cleanSaved===null){cleanSaved={lines:showLines,refc:showRefCircles,names:showNames,zodiac:showZodiac,ra:showRA,alt:showAlt};showLines=showRefCircles=showNames=showZodiac=showRA=showAlt=false}else{showLines=cleanSaved.lines;showRefCircles=cleanSaved.refc;showNames=cleanSaved.names;showZodiac=cleanSaved.zodiac;showRA=cleanSaved.ra;showAlt=cleanSaved.alt;cleanSaved=null}const sync=(id,v)=>{const b=document.getElementById(id);if(b)b.classList.toggle("on",v)};sync("blines",showLines);sync("brefc",showRefCircles);sync("bn",showNames);sync("bzod",showZodiac);sync("bra",showRA);sync("balt",showAlt);if(W)draw()}let lastImmersiveT=0;function toggleImmersive(){const now=Date.now();if(now-lastImmersiveT<450)return;lastImmersiveT=now;if(document.body.classList.contains("fullscreen")){exitFullscreen();if(cleanSaved!==null)toggleClean();if(paused)togAnim()}else{if(cleanSaved===null)toggleClean();enterFullscreen()}}function togTwilight(){showTwilight=!showTwilight;document.getElementById("btwi").classList.toggle("on",showTwilight);if(W)draw()}function togMeteors(){showMeteors=!showMeteors;document.getElementById("bmeteor").classList.toggle("on",showMeteors);if(!showMeteors)meteorParticles=[];if(W)draw()}let sheetPage=0;function scrollToPage(id){const el=document.getElementById(id);if(el){try{el.scrollIntoView({behavior:"smooth",block:"start"})}catch(_){el.scrollIntoView()}}}function setSheetPage(p){sheetPage=p>=1?1:0;scrollToPage(sheetPage>=1?"page-panel":"page-sky")}function skyTopExact(){const sc=document.getElementById("scroller"),sky=document.getElementById("page-sky");if(!sc||!sky)return 0;return sky.offsetTop}
let _europaFinsternisCache=null,_europaFinsternisLaedt=false;
function berechneEuropeanEclipse(){
  let jd=findEclipse(1,"solar"),ort=null,suchStart=jd;
  _finNurEuropa=true;
  try{
    for(let versuch=0;jd!==null&&versuch<40;versuch++){
      ort=finsternisStadt(jd);if(ort)break;
      const alt=currentJD;currentJD=()=>suchStart+2;
      try{jd=findEclipse(1,"solar")}finally{currentJD=alt}
      suchStart=jd;
    }
    if(jd===null||!ort)return null;
    return {jd:jd,ort:ort};
  }finally{_finNurEuropa=false}
}
function aktualisiereEuropeanEclipseSchalter(){
  if(_europaFinsternisCache||_europaFinsternisLaedt)return;
  _europaFinsternisLaedt=true;
  const titel=document.querySelector("#eclipse-europe-next b");
  if(titel)titel.textContent="Nächste Sonnenfinsternis wird berechnet …";
  setTimeout(()=>{
    try{
      _europaFinsternisCache=berechneEuropeanEclipse();
      if(titel)titel.textContent=_europaFinsternisCache?`Nächste Sonnenfinsternis in ${_europaFinsternisCache.ort.stadt.n}, ${_europaFinsternisCache.ort.stadt.land}`:"Keine Sonnenfinsternis in Europa gefunden";
    }finally{_europaFinsternisLaedt=false}
  },0);
}
function jumpToEuropeanEclipse(){
  const treffer=_europaFinsternisCache||berechneEuropeanEclipse();
  if(!treffer){alert("Keine nächste in Europa sichtbare Sonnenfinsternis gefunden.");return}
  const {jd,ort}=treffer;
  _finNurEuropa=true;
  try{
    const titel=document.querySelector("#eclipse-europe-next b");
    if(titel)titel.textContent=`Nächste Sonnenfinsternis in ${ort.stadt.n}, ${ort.stadt.land}`;
    _eclipseVorgabeJD=jd;jumpToEclipse(1,"solar");
  }finally{_finNurEuropa=false;_eclipseVorgabeJD=null}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",aktualisiereEuropeanEclipseSchalter,{once:true});else aktualisiereEuropeanEclipseSchalter();
function forceSkyPosition(){if(__atomicSkyUntil>performance.now()){queueAtomicSkyCommit(forceSkyPosition);return}const sc=document.getElementById("scroller"),sky=document.getElementById("page-sky");if(!sc||!sky)return;const old=sc.style.scrollBehavior;sc.style.scrollBehavior="auto";const top=skyTopExact();sc.scrollTop=top;sc.scrollTo(0,top);sc.style.scrollBehavior=old;if(W)draw()}
function scrollToSky(){sheetPage=0;const sc=document.getElementById("scroller"),sky=document.getElementById("page-sky");if(sc&&sky){const old=sc.style.scrollBehavior;sc.style.scrollBehavior="auto";const top=skyTopExact();sc.scrollTop=top;sc.scrollTo(0,top);sc.style.scrollBehavior=old;requestAnimationFrame(forceSkyPosition);setTimeout(forceSkyPosition,80);setTimeout(forceSkyPosition,220);setTimeout(forceSkyPosition,520)}else{scrollToPage("page-sky")}}function togglePanel(){scrollToPage("page-panel")}function toggleLegend(){scrollToPage("page-legend")}function scrollToGuide(){scrollToPage("page-guide")}function scrollToHistory(){scrollToPage("page-history")}function attachPager(){}(function initPanelDrag(){return;const w=document.getElementById("panel"),bar=document.getElementById("panel-bar");if(!w||!bar)return;let drag=false,ox=0,oy=0;bar.addEventListener("pointerdown",e=>{if(e.target.id==="panel-close")return;drag=true;const r=w.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;w.style.left=r.left+"px";w.style.top=r.top+"px";w.style.right="auto";try{bar.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});bar.addEventListener("pointermove",e=>{if(!drag)return;let x=e.clientX-ox,y=e.clientY-oy;x=Math.max(0,Math.min(window.innerWidth-44,x));y=Math.max(0,Math.min(window.innerHeight-30,y));w.style.left=x+"px";w.style.top=y+"px"});const pend=e=>{drag=false;try{bar.releasePointerCapture(e.pointerId)}catch(_){}};bar.addEventListener("pointerup",pend);bar.addEventListener("pointercancel",pend)})();function togISS(){showISS=!showISS;document.getElementById("biss").classList.toggle("on",showISS);if(showISS&&!issTLE&&!issLoading)loadISS();updISSbtn()}function updISSbtn(){const b=document.getElementById("biss");if(issLoading)b.textContent="🛰 lädt…";else if(issError&&showISS)b.textContent="🛰 ✕";else b.textContent="🛰 ISS"}function ensureSatelliteJS(){if(typeof satellite!=="undefined"||ensureSatelliteJS._loading)return;ensureSatelliteJS._loading=true;const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/satellite.js/4.1.3/satellite.min.js";s.onerror=()=>{ensureSatelliteJS._loading=false;issError="Bibliothek nicht geladen (Internet?)";if(typeof updISSbtn==="function")updISSbtn()};document.head.appendChild(s)}function loadISS(){if(typeof satellite==="undefined"){ensureSatelliteJS();issError="Bibliothek lädt…";updISSbtn();let tries=0;const wait=setInterval(()=>{tries++;if(typeof satellite!=="undefined"){clearInterval(wait);issError=null;loadISS()}else if(tries>40){clearInterval(wait);issError="Bibliothek nicht geladen (Internet?)";issLoading=false;updISSbtn()}},300);return}issLoading=true;issError=null;updISSbtn();const sources=["https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE","https://corsproxy.io/?url=https://celestrak.org/NORAD/elements/gp.php?CATNR=25544%26FORMAT=TLE","https://api.allorigins.win/raw?url=https%3A%2F%2Fcelestrak.org%2FNORAD%2Felements%2Fgp.php%3FCATNR%3D25544%26FORMAT%3DTLE"];let idx=0;function useFallback(){try{issTLE={l1:ISS_TLE_FALLBACK.l1,l2:ISS_TLE_FALLBACK.l2,satrec:satellite.twoline2satrec(ISS_TLE_FALLBACK.l1,ISS_TLE_FALLBACK.l2),embedded:true};issError=null}catch(e){issError="Bahndaten ungültig"}issLoading=false;updISSbtn()}function tryNext(){if(idx>=sources.length){useFallback();return}fetch(sources[idx]).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}).then(txt=>{const lines=txt.trim().split("\n").map(l=>l.trim());const l1=lines.find(l=>l.startsWith("1 ")),l2=lines.find(l=>l.startsWith("2 "));if(l1&&l2){issTLE={l1:l1,l2:l2,satrec:satellite.twoline2satrec(l1,l2)};issError=null;issLoading=false;updISSbtn()}else{idx++;tryNext()}}).catch(e=>{idx++;tryNext()})}tryNext()}function issGstime(date){if(typeof satellite.gstime==="function")return satellite.gstime(date);if(typeof satellite.gstimeFromDate==="function")return satellite.gstimeFromDate(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds());if(typeof satellite.gstimeFromJday==="function")return satellite.gstimeFromJday(2440587.5+date.getTime()/864e5);return 0}function issAltAz(jdUTC){if(!issTLE||!issTLE.satrec)return null;const date=new Date((jdUTC-2440587.5)*864e5);const pv=satellite.propagate(issTLE.satrec,date);if(!pv||!pv.position)return null;const gmst=issGstime(date);const obs={longitude:lng*Math.PI/180,latitude:lat*Math.PI/180,height:.1};const ecf=satellite.eciToEcf(pv.position,gmst);const la=satellite.ecfToLookAngles(obs,ecf);return{alt:la.elevation*180/Math.PI,az:la.azimuth*180/Math.PI}}const CITIES=[{n:"Berlin",la:52.52,lo:13.4,land:"Deutschland",cap:1},{n:"München",la:48.14,lo:11.58,land:"Deutschland"},{n:"Hamburg",la:53.55,lo:10,land:"Deutschland"},{n:"Köln",la:50.94,lo:6.96,land:"Deutschland"},{n:"Frankfurt",la:50.11,lo:8.68,land:"Deutschland"},{n:"Stuttgart",la:48.78,lo:9.18,land:"Deutschland"},{n:"Dresden",la:51.05,lo:13.74,land:"Deutschland"},{n:"Leipzig",la:51.34,lo:12.37,land:"Deutschland"},{n:"Wien",la:48.21,lo:16.37,land:"Österreich",cap:1},{n:"Graz",la:47.07,lo:15.44,land:"Österreich"},{n:"Salzburg",la:47.81,lo:13.04,land:"Österreich"},{n:"Innsbruck",la:47.27,lo:11.39,land:"Österreich"},{n:"Bern",la:46.95,lo:7.45,land:"Schweiz",cap:1},{n:"Zürich",la:47.38,lo:8.54,land:"Schweiz"},{n:"Genf",la:46.2,lo:6.14,land:"Schweiz"},{n:"Basel",la:47.56,lo:7.59,land:"Schweiz"},{n:"London",la:51.51,lo:-.13,land:"Großbritannien",cap:1},{n:"Paris",la:48.85,lo:2.35,land:"Frankreich",cap:1},{n:"Madrid",la:40.42,lo:-3.7,land:"Spanien",cap:1},{n:"Barcelona",la:41.39,lo:2.17,land:"Spanien"},{n:"Bilbao",la:43.26,lo:-2.93,land:"Spanien"},{n:"Rom",la:41.9,lo:12.5,land:"Italien",cap:1},{n:"Mailand",la:45.46,lo:9.19,land:"Italien"},{n:"Amsterdam",la:52.37,lo:4.9,land:"Niederlande",cap:1},{n:"Brüssel",la:50.85,lo:4.35,land:"Belgien",cap:1},{n:"Lissabon",la:38.72,lo:-9.14,land:"Portugal",cap:1},{n:"Athen",la:37.98,lo:23.73,land:"Griechenland",cap:1},{n:"Stockholm",la:59.33,lo:18.07,land:"Schweden",cap:1},{n:"Oslo",la:59.91,lo:10.75,land:"Norwegen",cap:1},{n:"Kopenhagen",la:55.68,lo:12.57,land:"Dänemark",cap:1},{n:"Helsinki",la:60.17,lo:24.94,land:"Finnland",cap:1},{n:"Reykjavík",la:64.13,lo:-21.9,land:"Island",cap:1},{n:"Dublin",la:53.35,lo:-6.26,land:"Irland",cap:1},{n:"Warschau",la:52.23,lo:21.01,land:"Polen",cap:1},{n:"Prag",la:50.08,lo:14.44,land:"Tschechien",cap:1},{n:"Budapest",la:47.5,lo:19.04,land:"Ungarn",cap:1},{n:"Moskau",la:55.76,lo:37.62,land:"Russland",cap:1},{n:"Istanbul",la:41.01,lo:28.98,land:"Türkei"},{n:"Ankara",la:39.93,lo:32.86,land:"Türkei",cap:1},{n:"New York",la:40.71,lo:-74.01,land:"USA"},{n:"Washington",la:38.91,lo:-77.04,land:"USA",cap:1},{n:"Los Angeles",la:34.05,lo:-118.24,land:"USA"},{n:"Chicago",la:41.88,lo:-87.63,land:"USA"},{n:"Ottawa",la:45.42,lo:-75.7,land:"Kanada",cap:1},{n:"Toronto",la:43.65,lo:-79.38,land:"Kanada"},{n:"Mexiko-Stadt",la:19.43,lo:-99.13,land:"Mexiko",cap:1},{n:"Brasília",la:-15.79,lo:-47.88,land:"Brasilien",cap:1},{n:"Rio de Janeiro",la:-22.91,lo:-43.17,land:"Brasilien"},{n:"Buenos Aires",la:-34.61,lo:-58.38,land:"Argentinien",cap:1},{n:"Lima",la:-12.05,lo:-77.04,land:"Peru",cap:1},{n:"Santiago",la:-33.45,lo:-70.67,land:"Chile",cap:1},{n:"Kairo",la:30.05,lo:31.24,land:"Ägypten",cap:1},{n:"Kapstadt",la:-33.92,lo:18.42,land:"Südafrika"},{n:"Nairobi",la:-1.29,lo:36.82,land:"Kenia",cap:1},{n:"Lagos",la:6.52,lo:3.38,land:"Nigeria"},{n:"Marrakesch",la:31.63,lo:-7.99,land:"Marokko"},{n:"Tokio",la:35.69,lo:139.69,land:"Japan",cap:1},{n:"Peking",la:39.9,lo:116.41,land:"China",cap:1},{n:"Shanghai",la:31.23,lo:121.47,land:"China"},{n:"Hongkong",la:22.32,lo:114.17,land:"China"},{n:"Neu-Delhi",la:28.61,lo:77.21,land:"Indien",cap:1},{n:"Mumbai",la:19.08,lo:72.88,land:"Indien"},{n:"Bangkok",la:13.76,lo:100.5,land:"Thailand",cap:1},{n:"Singapur",la:1.35,lo:103.82,land:"Singapur",cap:1},{n:"Seoul",la:37.57,lo:126.98,land:"Südkorea",cap:1},{n:"Dubai",la:25.2,lo:55.27,land:"VAE"},{n:"Jerusalem",la:31.78,lo:35.22,land:"Israel",cap:1},{n:"Sydney",la:-33.87,lo:151.21,land:"Australien"},{n:"Canberra",la:-35.28,lo:149.13,land:"Australien",cap:1},{n:"Melbourne",la:-37.81,lo:144.96,land:"Australien"},{n:"Auckland",la:-36.85,lo:174.76,land:"Neuseeland"},{n:"Wellington",la:-41.29,lo:174.78,land:"Neuseeland",cap:1},{n:"Düsseldorf",la:51.23,lo:6.78,land:"Deutschland"},{n:"Dortmund",la:51.51,lo:7.47,land:"Deutschland"},{n:"Essen",la:51.46,lo:7.01,land:"Deutschland"},{n:"Bremen",la:53.08,lo:8.8,land:"Deutschland"},{n:"Hannover",la:52.37,lo:9.74,land:"Deutschland"},{n:"Nürnberg",la:49.45,lo:11.08,land:"Deutschland"},{n:"Duisburg",la:51.43,lo:6.76,land:"Deutschland"},{n:"Bochum",la:51.48,lo:7.22,land:"Deutschland"},{n:"Wuppertal",la:51.26,lo:7.18,land:"Deutschland"},{n:"Bielefeld",la:52.02,lo:8.53,land:"Deutschland"},{n:"Bonn",la:50.74,lo:7.1,land:"Deutschland"},{n:"Münster",la:51.96,lo:7.63,land:"Deutschland"},{n:"Karlsruhe",la:49,lo:8.4,land:"Deutschland"},{n:"Mannheim",la:49.49,lo:8.47,land:"Deutschland"},{n:"Augsburg",la:48.37,lo:10.9,land:"Deutschland"},{n:"Wiesbaden",la:50.08,lo:8.24,land:"Deutschland"},{n:"Kiel",la:54.32,lo:10.14,land:"Deutschland"},{n:"Freiburg",la:47.99,lo:7.85,land:"Deutschland"},{n:"Linz",la:48.31,lo:14.29,land:"Österreich"},{n:"Klagenfurt",la:46.62,lo:14.31,land:"Österreich"},{n:"Lausanne",la:46.52,lo:6.63,land:"Schweiz"},{n:"Marseille",la:43.3,lo:5.37,land:"Frankreich"},{n:"Lyon",la:45.76,lo:4.84,land:"Frankreich"},{n:"Toulouse",la:43.6,lo:1.44,land:"Frankreich"},{n:"Nizza",la:43.7,lo:7.27,land:"Frankreich"},{n:"Nantes",la:47.22,lo:-1.55,land:"Frankreich"},{n:"Straßburg",la:48.57,lo:7.75,land:"Frankreich"},{n:"Bordeaux",la:44.84,lo:-.58,land:"Frankreich"},{n:"Lille",la:50.63,lo:3.06,land:"Frankreich"},{n:"Birmingham",la:52.49,lo:-1.89,land:"Großbritannien"},{n:"Manchester",la:53.48,lo:-2.24,land:"Großbritannien"},{n:"Glasgow",la:55.86,lo:-4.25,land:"Großbritannien"},{n:"Liverpool",la:53.41,lo:-2.99,land:"Großbritannien"},{n:"Edinburgh",la:55.95,lo:-3.19,land:"Großbritannien"},{n:"Leeds",la:53.8,lo:-1.55,land:"Großbritannien"},{n:"Cork",la:51.9,lo:-8.47,land:"Irland"},{n:"Valencia",la:39.47,lo:-.38,land:"Spanien"},{n:"Sevilla",la:37.39,lo:-5.99,land:"Spanien"},{n:"Málaga",la:36.72,lo:-4.42,land:"Spanien"},{n:"Zaragoza",la:41.65,lo:-.89,land:"Spanien"},{n:"Porto",la:41.15,lo:-8.61,land:"Portugal"},{n:"Neapel",la:40.85,lo:14.27,land:"Italien"},{n:"Turin",la:45.07,lo:7.69,land:"Italien"},{n:"Palermo",la:38.12,lo:13.36,land:"Italien"},{n:"Genua",la:44.41,lo:8.93,land:"Italien"},{n:"Bologna",la:44.49,lo:11.34,land:"Italien"},{n:"Florenz",la:43.77,lo:11.26,land:"Italien"},{n:"Venedig",la:45.44,lo:12.32,land:"Italien"},{n:"Rotterdam",la:51.92,lo:4.48,land:"Niederlande"},{n:"Den Haag",la:52.08,lo:4.31,land:"Niederlande"},{n:"Utrecht",la:52.09,lo:5.12,land:"Niederlande"},{n:"Antwerpen",la:51.22,lo:4.4,land:"Belgien"},{n:"Gent",la:51.05,lo:3.72,land:"Belgien"},{n:"Göteborg",la:57.71,lo:11.97,land:"Schweden"},{n:"Malmö",la:55.6,lo:13,land:"Schweden"},{n:"Bergen",la:60.39,lo:5.32,land:"Norwegen"},{n:"Aarhus",la:56.16,lo:10.2,land:"Dänemark"},{n:"Tampere",la:61.5,lo:23.79,land:"Finnland"},{n:"Krakau",la:50.06,lo:19.94,land:"Polen"},{n:"Łódź",la:51.76,lo:19.46,land:"Polen"},{n:"Breslau",la:51.11,lo:17.04,land:"Polen"},{n:"Posen",la:52.41,lo:16.93,land:"Polen"},{n:"Danzig",la:54.35,lo:18.65,land:"Polen"},{n:"Brünn",la:49.2,lo:16.61,land:"Tschechien"},{n:"Bratislava",la:48.15,lo:17.11,land:"Slowakei",cap:1},{n:"Ljubljana",la:46.06,lo:14.51,land:"Slowenien",cap:1},{n:"Zagreb",la:45.81,lo:15.98,land:"Kroatien",cap:1},{n:"Belgrad",la:44.79,lo:20.45,land:"Serbien",cap:1},{n:"Bukarest",la:44.43,lo:26.1,land:"Rumänien",cap:1},{n:"Sofia",la:42.7,lo:23.32,land:"Bulgarien",cap:1},{n:"Debrecen",la:47.53,lo:21.63,land:"Ungarn"},{n:"Riga",la:56.95,lo:24.11,land:"Lettland",cap:1},{n:"Vilnius",la:54.69,lo:25.28,land:"Litauen",cap:1},{n:"Tallinn",la:59.44,lo:24.75,land:"Estland",cap:1},{n:"Kiew",la:50.45,lo:30.52,land:"Ukraine",cap:1},{n:"Charkiw",la:49.99,lo:36.23,land:"Ukraine"},{n:"Minsk",la:53.9,lo:27.57,land:"Belarus",cap:1},{n:"Sankt Petersburg",la:59.93,lo:30.34,land:"Russland"},{n:"Thessaloniki",la:40.64,lo:22.94,land:"Griechenland"},{n:"Izmir",la:38.42,lo:27.14,land:"Türkei"}];let selCity=0;const QUICK=["Berlin","München","Wien","Zürich","London","Paris","Madrid","Rom","New York"];function initCityGrid(){const gr=document.getElementById("cgrid");gr.innerHTML="";QUICK.forEach(name=>{const i=CITIES.findIndex(c=>c.n===name);if(i<0)return;const b=document.createElement("button");b.className="cbtn";b.textContent=CITIES[i].n;b.onclick=()=>selectCity(i);gr.appendChild(b)})}function applyCity(c,name){lat=c.la;lng=c.lo;selCity=null;
  document.querySelectorAll(".cbtn").forEach(b=>b.classList.remove("sel"));
  const il=document.getElementById("i-lat");if(il)il.value=c.la.toFixed(2);
  const ig=document.getElementById("i-lng");if(ig)ig.value=c.lo.toFixed(2);
  const sa=document.getElementById("sLat");if(sa)sa.value=Math.max(-90,Math.min(90,Math.round(lat*10)/10));
  const sg=document.getElementById("sLng");if(sg)sg.value=Math.max(-180,Math.min(180,Math.round(lng*10)/10));
  updateLocDisp(name===undefined?c.n:name,c.la,c.lo);updateTimezone();updLabels();if(typeof window.applyAutomaticSkyQuality==="function")window.applyAutomaticSkyQuality(c.la,c.lo)}function selectCity(i){const c=CITIES[i];selCity=i;applyCity(c);setTimeout(()=>document.getElementById("loc-panel").classList.remove("open"),300)}function normalize(s){return s.toLowerCase().replace(/[äàá]/g,"a").replace(/[öòó]/g,"o").replace(/[üùú]/g,"u").replace(/ß/g,"ss").trim()}function searchPlaces(q){const nq=normalize(q);if(!nq)return[];const results=[];CITIES.forEach((c,i)=>{if(normalize(c.n).includes(nq))results.push({type:"city",c:c,i:i,score:normalize(c.n).startsWith(nq)?0:1})});const lands=[...new Set(CITIES.map(c=>c.land))];lands.forEach(land=>{if(normalize(land).includes(nq)){const cap=CITIES.find(c=>c.land===land&&c.cap)||CITIES.find(c=>c.land===land);if(cap&&!results.some(r=>r.c===cap))results.push({type:"country",c:cap,land:land,score:normalize(land).startsWith(nq)?0:2})}});results.sort((a,b)=>a.score-b.score||a.c.n.localeCompare(b.c.n));return results.slice(0,8)}let srSel=-1,srCurrent=[];/* Erkennt geografische Koordinaten in freier Schreibweise. */
/* Didaktik-Spruenge bleiben bis zum vollstaendigen Endzustand auf der
   Didaktikseite. Auch alte direkte Scroll-Aufrufe werden erst zusammen mit
   der letzten Zeichnung ausgefuehrt. */
const __scrollToPageImmediate=scrollToPage;
scrollToPage=function(id){
  if(id==="page-sky"&&__atomicSkyUntil>performance.now()){
    queueAtomicSkyCommit(function(){__scrollToPageImmediate(id)});
    return;
  }
  return __scrollToPageImmediate(id);
};
const __scrollToSkyImmediate=scrollToSky;
scrollToSky=function(){
  if(__atomicSkyUntil>performance.now()){
    queueAtomicSkyCommit(__scrollToSkyImmediate);
    return;
  }
  return __scrollToSkyImmediate();
};
function parseKoord(roh){
  let t=String(roh==null?"":roh).trim();
  if(t.length<3)return null;
  t=t.toUpperCase().replace(/[\u2032\u2019\u00B4]/g,"'").replace(/[\u2033\u201D]/g,'"')
     .replace(/\bGRAD\b|\bDEG\b/g,"\u00B0").replace(/\u00A0/g," ");
  /* Nur Ziffern, Trennzeichen und Himmelsrichtungen zulassen – sonst ist es ein Ortsname */
  if(!/^[\s0-9.,;:\u00B0'"+\-NSEWO]+$/.test(t))return null;
  if((t.match(/\d/g)||[]).length<2)return null;
  const hatPunkt=/\d\.\d/.test(t);
  const varianten=hatPunkt?[t.replace(/,/g," ")]
                          :[t.replace(/,/g,"."),t.replace(/,/g," ")];
  for(const v of varianten){const r=deuteKoord(v);if(r)return r}
  return null;
}
function deuteKoord(s){
  const zahlen=[];{let m;const re=/[+-]?\d+(?:\.\d+)?/g;while((m=re.exec(s)))zahlen.push({v:parseFloat(m[0]),i:m.index})}
  const bst=[];{let m;const re=/[NSEWO]/g;while((m=re.exec(s)))bst.push({z:m[0],i:m.index})}
  const n=zahlen.length;
  if(n!==2&&n!==4&&n!==6)return null;
  const k=n/2;
  const zuGrad=a=>{
    const g=Math.abs(a[0].v)+(a[1]?Math.abs(a[1].v)/60:0)+(a[2]?Math.abs(a[2].v)/3600:0);
    if(a[1]&&Math.abs(a[1].v)>=60)return null;
    if(a[2]&&Math.abs(a[2].v)>=60)return null;
    return {g:g,neg:a[0].v<0||1/a[0].v===-Infinity};
  };
  const A=zuGrad(zahlen.slice(0,k)),B=zuGrad(zahlen.slice(k));
  if(!A||!B)return null;
  /* Himmelsrichtungen zuordnen. Bei zwei Buchstaben unterschiedlicher Art gilt die
     Reihenfolge: der erste gehört zur ersten Zahlengruppe. Das trifft sowohl auf
     "52,52N 13,40O" als auch auf "N 40 42 46 W 74 0 22" zu. */
  const grenze=zahlen[k].i;
  const istBreiteZ=z=>z==="N"||z==="S";
  let hA=null,hB=null;
  if(bst.length>=2&&istBreiteZ(bst[0].z)!==istBreiteZ(bst[1].z)){hA=bst[0].z;hB=bst[1].z}
  else if(bst.length===1){if(bst[0].i<grenze)hA=bst[0].z;else hB=bst[0].z}
  const istBreite=istBreiteZ;
  let lat,lng;
  if(hA&&hB&&istBreite(hA)!==istBreite(hB)){
    const gA=(hA==="S"||hA==="W")?-A.g:A.g, gB=(hB==="S"||hB==="W")?-B.g:B.g;
    if(istBreite(hA)){lat=gA;lng=gB}else{lat=gB;lng=gA}
  }else if(hA&&!hB){
    const gA=(hA==="S"||hA==="W")?-A.g:A.g;
    if(istBreite(hA)){lat=gA;lng=B.neg?-B.g:B.g}else{lng=gA;lat=B.neg?-B.g:B.g}
  }else if(!hA&&hB){
    const gB=(hB==="S"||hB==="W")?-B.g:B.g;
    if(istBreite(hB)){lat=gB;lng=A.neg?-A.g:A.g}else{lng=gB;lat=A.neg?-A.g:A.g}
  }else{
    lat=A.neg?-A.g:A.g; lng=B.neg?-B.g:B.g;
  }
  if(!isFinite(lat)||!isFinite(lng))return null;
  if(Math.abs(lat)>90||Math.abs(lng)>180)return null;
  const f=(x,p,m)=>Math.abs(x).toFixed(3).replace(".",",")+"\u00B0"+(x>=0?p:m);
  return {lat:lat,lng:lng,text:f(lat,"N","S")+"  "+f(lng,"O","W")};
}
let __koordMerk=null;
function koordUebernehmen(){
  if(!__koordMerk)return;
  applyCity({n:__koordMerk.text,la:__koordMerk.lat,lo:__koordMerk.lng,land:"Koordinaten"},null);
  const f=document.getElementById("city-search");if(f)f.value=__koordMerk.text;
  const b=document.getElementById("search-results");if(b)b.classList.remove("open");
  const h=document.getElementById("koord-hint");if(h)h.classList.remove("open");
  const p=document.getElementById("loc-panel");
  if(p)setTimeout(()=>p.classList.remove("open"),250);
}
function renderSearchResults(resetSel){const box=document.getElementById("search-results");const q=document.getElementById("city-search").value;if(resetSel!==false)srSel=-1;if(!q.trim()){box.classList.remove("open");box.innerHTML="";return}if(srCurrent.length===0){box.innerHTML='<div class="sr-none">Kein Treffer</div>';box.classList.add("open");return}const hasOnline=srCurrent.some(r=>r.type==="online");box.innerHTML=srCurrent.map((r,k)=>{const capBadge=r.c.cap?'<span class="sr-cap">Hauptstadt</span>':"";const onlineBadge=r.type==="online"?'<span class="sr-cap" style="opacity:.6">🌐</span>':"";const sub=r.type==="country"?`${r.land} →`:r.c.land;return`<div class="sr-item" data-k="${k}" onclick="pickSearch(${k})"><span>${r.c.n} ${capBadge}${onlineBadge}</span><span class="sr-land">${sub}</span></div>`}).join("")+(hasOnline?'<div class="sr-none" style="opacity:.55;font-size:.7em;text-align:right;padding:2px 8px">Ortsdaten teils: © OpenStreetMap-Mitwirkende</div>':"");box.classList.add("open");if(srSel>=0)[...box.querySelectorAll(".sr-item")].forEach((el,k)=>el.classList.toggle("sel",k===srSel))}
/* Online-Ortssuche (Nominatim/OpenStreetMap), auf Wunsch ergaenzend zur festen Staedteliste,
   damit praktisch jede nennenswerte Ortschaft weltweit auffindbar ist, nicht nur die rund
   160 fest hinterlegten groesseren Staedte - z.B. Zaragoza war zwar schon vorher enthalten,
   viele kleinere, aber durchaus bekannte Staedte aber nicht. Erst nach 450 Millisekunden
   Tippschreibpause abgeschickt (Nominatims Nutzungsbedingungen verlangen maximal eine
   Anfrage pro Sekunde); ein Laufzaehler verwirft veraltete Antworten, falls zwischenzeitlich
   weitergetippt wurde. Ergaenzt nur, ueberschreibt nie: Die feste Liste bleibt die primaere,
   sofort verfuegbare Quelle; findet sich keine Internetverbindung, aendert sich nichts am
   bisherigen Verhalten - der Fehler wird still abgefangen. */
let _onlineSearchT=null,_onlineSearchSeq=0;
function scheduleOnlineSearch(q){
  clearTimeout(_onlineSearchT);
  const nq=q.trim();
  if(nq.length<2)return;
  _onlineSearchT=setTimeout(()=>fetchOnlineCities(nq),450);
}
async function fetchOnlineCities(q){
  const seq=++_onlineSearchSeq;
  try{
    const url="https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=de&q="+encodeURIComponent(q);
    const res=await fetch(url,{headers:{"Accept":"application/json"}});
    if(!res.ok)return;
    const data=await res.json();
    if(seq!==_onlineSearchSeq)return;
    const feld=document.getElementById("city-search");
    if(!feld||feld.value.trim()!==q)return;
    const settlementTypes=new Set(["city","town","village","municipality","hamlet","borough","suburb","county"]);
    const online=data.filter(d=>(d.category||d.class)==="place"&&settlementTypes.has(d.type)&&isFinite(parseFloat(d.lat))&&isFinite(parseFloat(d.lon))).map(d=>{
      const addr=d.address||{};
      const land=addr.country||"";
      const name=d.name||addr.city||addr.town||addr.village||addr.municipality||(d.display_name||"").split(",")[0];
      return{type:"online",c:{n:name,la:parseFloat(d.lat),lo:parseFloat(d.lon),land:land}};
    });
    const seen=new Set(srCurrent.map(r=>normalize(r.c.n)+"|"+normalize(r.c.land||"")));
    const fresh=[];
    online.forEach(r=>{const key=normalize(r.c.n)+"|"+normalize(r.c.land);if(seen.has(key))return;seen.add(key);fresh.push(r)});
    if(fresh.length){srCurrent=srCurrent.concat(fresh);renderSearchResults(false)}
  }catch(e){/* kein Internet oder Nominatim nicht erreichbar - lokale Treffer bleiben unveraendert bestehen */}
}
function onCitySearch(){const q=document.getElementById("city-search").value;const box=document.getElementById("search-results");srCurrent=searchPlaces(q);
  /* Statt eines Ortsnamens dürfen auch geografische Koordinaten eingegeben werden.
     Sie erscheinen dann als erster Treffer der Liste. */
  try{
    const kk=parseKoord(q);
    const feld=document.getElementById("city-search");
    if(feld)feld.classList.toggle("koord",!!kk);
    /* Die Trefferliste schließt sich, sobald man neben das Feld tippt – etwa um die
       Bildschirmtastatur auszublenden. Die Übernahmezeile steht deshalb fest im
       Seitenfluss und bleibt sichtbar, bis die Eingabe geändert wird. */
    const hin=document.getElementById("koord-hint");
    if(hin){
      if(kk){
        __koordMerk={lat:kk.lat,lng:kk.lng,text:kk.text};
        hin.innerHTML='<span class="kh-wert">\uD83D\uDCCD '+kk.text+'</span>'+
                      '<button type="button" onclick="koordUebernehmen()">\u2713 Übernehmen</button>';
        hin.classList.add("open");
      }else{__koordMerk=null;hin.innerHTML="";hin.classList.remove("open")}
    }
    if(kk)srCurrent=[{type:"koord",c:{n:kk.text,la:kk.lat,lo:kk.lng,land:"Koordinaten \u2713"}}].concat(srCurrent);
  }catch(e){}
  renderSearchResults(true);
  scheduleOnlineSearch(q);
}function pickSearch(k){const r=srCurrent[k];if(!r)return;applyCity(r.c,r.type==="koord"?null:r.c.n);document.getElementById("city-search").value=r.c.n;document.getElementById("search-results").classList.remove("open");setTimeout(()=>document.getElementById("loc-panel").classList.remove("open"),250)}document.getElementById("city-search").addEventListener("keydown",e=>{const box=document.getElementById("search-results");
  /* Eine erkannte Koordinate wird auch dann übernommen, wenn die Trefferliste
     gerade geschlossen ist – etwa weil zwischendurch die Tastatur ausgeblendet wurde. */
  if(e.key==="Enter"&&!box.classList.contains("open")){
    try{
      const kk=parseKoord(document.getElementById("city-search").value);
      if(kk){e.preventDefault();
        srCurrent=[{type:"koord",c:{n:kk.text,la:kk.lat,lo:kk.lng,land:"Koordinaten"}}];
        pickSearch(0);return;}
    }catch(_){}
  }
  if(!box.classList.contains("open"))return;if(e.key==="ArrowDown"){e.preventDefault();srSel=Math.min(srCurrent.length-1,srSel+1)}else if(e.key==="ArrowUp"){e.preventDefault();srSel=Math.max(0,srSel-1)}else if(e.key==="Enter"){e.preventDefault();pickSearch(srSel>=0?srSel:0);return}else if(e.key==="Escape"){box.classList.remove("open");return}else return;[...box.querySelectorAll(".sr-item")].forEach((el,k)=>el.classList.toggle("sel",k===srSel))});document.addEventListener("click",e=>{const wrap=document.getElementById("search-wrap");if(wrap&&!wrap.contains(e.target))document.getElementById("search-results").classList.remove("open")});/* Bisher stand hier parseFloat(...)||48 beziehungsweise ||11.6. Eine eingegebene
   Null ist in JavaScript unwahr, sodass Äquator und Nullmeridian nicht
   einstellbar waren. Jetzt wird auf eine gültige Zahl geprüft und der Bereich
   begrenzt; beide Regler werden auf Zehntelgrad nachgeführt. */
function applyManual(){
  const zahl=(id,ersatz,min,max)=>{
    const el=document.getElementById(id);
    const v=el?parseFloat(String(el.value).replace(",","." )):NaN;
    if(!isFinite(v))return ersatz;
    return Math.max(min,Math.min(max,v));
  };
  lat=zahl("i-lat",lat,-90,90);
  lng=zahl("i-lng",lng,-180,180);
  selCity=null;document.querySelectorAll(".cbtn").forEach(b=>b.classList.remove("sel"));
  const il=document.getElementById("i-lat");if(il)il.value=lat.toFixed(1);
  const ig=document.getElementById("i-lng");if(ig)ig.value=lng.toFixed(1);
  const sa=document.getElementById("sLat");if(sa)sa.value=Math.round(lat*10)/10;
  const sg=document.getElementById("sLng");if(sg)sg.value=Math.round(lng*10)/10;
  updateLocDisp(null,lat,lng);updateTimezone();updLabels();if(typeof window.applyAutomaticSkyQuality==="function")window.applyAutomaticSkyQuality(lat,lng);
}function updateLocDisp(name,la,lo){
  /* So viele Nachkommastellen wie nötig, höchstens drei – damit von Hand
     eingegebene Koordinaten nicht auf ein Zehntelgrad gerundet erscheinen. */
  const gr=x=>{let t=Math.abs(x).toFixed(3);if(t.indexOf(".")>=0)t=t.replace(/0+$/,"").replace(/\.$/,"");return t};
  const ls=`${gr(la)}°${la>=0?"N":"S"}`,lns=`${gr(lo)}°${lo>=0?"O":"W"}`;document.getElementById("loc-disp").textContent=`📍 ${name?name+"  ":""}${ls}  ${lns}`}function togLocPanel(){document.getElementById("loc-panel").classList.toggle("open")}
function openCoords(){
  const p=document.getElementById("loc-panel");if(!p)return;
  p.classList.add("open");
  const il=document.getElementById("i-lat");
  if(il){try{il.scrollIntoView({block:"nearest"})}catch(e){}
    setTimeout(()=>{try{il.focus();il.select()}catch(e){}},60);}
}function togDST(){const p=utcOff;dstOffset=dstOffset===0?1:0;utcOff=utcBase+dstOffset;simMin+=(utcOff-p)*60;if(simMin<0)simMin+=1440;if(simMin>=1440)simMin-=1440;document.getElementById("sTime").value=Math.round(simMin);const b=document.getElementById("btn-dst");b.textContent=dstOffset?"☀ MESZ":"☀ MEZ";b.classList.toggle("on",dstOffset===1);updLabels()}function lastSunday(year,month){const d=new Date(Date.UTC(year,month+1,0));return d.getUTCDate()-d.getUTCDay()}function euDSTactive(year,doy){const mar=lastSunday(year,2),oct=lastSunday(year,9);const md=monthDays(year);let marDoy=mar;for(let i=0;i<2;i++)marDoy+=md[i];let octDoy=oct;for(let i=0;i<9;i++)octDoy+=md[i];return doy>=marDoy&&doy<octDoy}function autoDetectDST(){const inEU=lng>=-10&&lng<=40&&lat>=34&&lat<=72;applyDST(inEU&&euDSTactive(simYear,simDay))}function updateTimezone(){utcBase=tzFromLng(lng);autoDetectDST();utcOff=utcBase+dstOffset}function applyDST(active){dstOffset=active?1:0;utcOff=utcBase+dstOffset;const b=document.getElementById("btn-dst");if(b){b.textContent=dstOffset?"☀ MESZ":"☀ MEZ";b.classList.toggle("on",dstOffset===1)}}function applyGPSResult(la,lo,label){lat=la;lng=lo;selCity=null;document.querySelectorAll(".cbtn").forEach(b=>b.classList.remove("sel"));const il=document.getElementById("i-lat"),ig=document.getElementById("i-lng"),sl=document.getElementById("sLat");if(il)il.value=lat.toFixed(4);if(ig)ig.value=lng.toFixed(4);if(sl)sl.value=Math.max(-90,Math.min(90,Math.round(lat)));updateLocDisp(label||null,lat,lng);updateTimezone();updLabels();if(W)draw()}const IP_PROVIDERS=[{url:"https://ipwho.is/",parse:d=>d&&d.success!==false&&d.latitude!=null?{lat:+d.latitude,lng:+d.longitude,name:d.city||d.region||d.country}:null},{url:"https://ipapi.co/json/",parse:d=>d&&!d.error&&d.latitude!=null?{lat:+d.latitude,lng:+d.longitude,name:d.city||d.region||d.country_name}:null},{url:"https://get.geojs.io/v1/ip/geo.json",parse:d=>d&&d.latitude!=null?{lat:+d.latitude,lng:+d.longitude,name:d.city||d.region||d.country}:null},{url:"https://freeipapi.com/api/json",parse:d=>d&&d.latitude!=null?{lat:+d.latitude,lng:+d.longitude,name:d.cityName||d.regionName||d.countryName}:null}];function getLocationByIP(setMsg){setMsg=setMsg||function(){};setMsg("Standort über Internet wird ermittelt…");let i=0;const tryNext=()=>{if(i>=IP_PROVIDERS.length){setMsg("Standort nicht ermittelbar (kein Internet?). Bitte Stadt manuell wählen.");return}const p=IP_PROVIDERS[i++];fetch(p.url,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{const res=p.parse(d);if(res&&isFinite(res.lat)&&isFinite(res.lng)&&!(res.lat===0&&res.lng===0)){applyGPSResult(res.lat,res.lng,res.name||null);setMsg(`✓ Standort (per Internet): ${res.name?res.name+" ":""}(${res.lat.toFixed(2)}°, ${res.lng.toFixed(2)}°)`)}else{tryNext()}}).catch(()=>tryNext())};tryNext()}function getGPS(){const st=document.getElementById("gps-st");const setMsg=m=>{if(st)st.textContent=m;showToast(m)};setMsg("Standort wird ermittelt…");if(!navigator.geolocation){getLocationByIP(setMsg);return}navigator.geolocation.getCurrentPosition(pos=>{applyGPSResult(pos.coords.latitude,pos.coords.longitude,null);setMsg(`✓ GPS-Standort: ${pos.coords.latitude.toFixed(3)}°, ${pos.coords.longitude.toFixed(3)}°`)},err=>{getLocationByIP(setMsg)},{timeout:1e4,enableHighAccuracy:false,maximumAge:6e5})}document.addEventListener("click",e=>{const w=document.getElementById("loc-wrap");if(!w.contains(e.target))document.getElementById("loc-panel").classList.remove("open")});function doyFromMonthDay(y,m,d){const md=monthDays(y);let n=d;for(let i=0;i<m-1;i++)n+=md[i];return n}
function setScene(la,lo,month,day,minute,label,year){
  beginAtomicSkyJump(380);
  window.__pendingRunSpeed=null;
  focusConstellation=null;
  if(typeof window.setYearPlay==="function")window.setYearPlay(false);
  if(typeof setPaused==="function")setPaused(true);
  if(typeof disableOrient==="function")disableOrient();
  if(year!==undefined&&year!==null)simYear=year;
  lat=la;lng=lo;simDay=doyFromMonthDay(simYear,month,day);simMin=minute;selCity=null;
  const sl=document.getElementById("sLat"),sg=document.getElementById("sLng"),st=document.getElementById("sTime"),il=document.getElementById("i-lat"),ig=document.getElementById("i-lng"),ys=document.getElementById("yearslider");
  if(sl)sl.value=Math.max(-90,Math.min(90,Math.round(lat)));
  if(sg)sg.value=Math.max(-180,Math.min(180,Math.round(lng)));
  if(st)st.value=Math.round(simMin);
  if(il)il.value=lat.toFixed(2);
  if(ig)ig.value=lng.toFixed(2);
  if(ys)ys.value=Math.max(parseInt(ys.min||"-3000",10),Math.min(parseInt(ys.max||"8000",10),simYear));
  updateLocDisp(label,lat,lng);updateTimezone();syncYearUI();updLabels();
  zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;if(typeof updateTouchMode==="function")updateTouchMode();
  if(typeof window.setYearPlay==="function")window.setYearPlay(false);scrollToSky();setTimeout(()=>{if(W)draw()},220);
}
function jumpEclipse(dir,type){beginAtomicSkyJump(640);if(typeof window.setYearPlay==="function")window.setYearPlay(false);/* Jede neue Suche aus der Didaktik beginnt am aktuell eingestellten oder per GPS ermittelten Ort. */window.__eclipseNavigation=null;window.__eclipseNavigationOrigin=null;_pendingEclBox=null;window.__eclZu=false;var __repeat=(window.__lastEclipse===dir+"|"+type);window.__lastEclipse=dir+"|"+type;if(!__repeat){try{const n=new Date();simYear=n.getFullYear();if(typeof updateTimezone==="function")updateTimezone();const utcMin=n.getUTCHours()*60+n.getUTCMinutes();let local=utcMin+utcOff*60;const ud=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()));let doy=Math.floor((ud-Date.UTC(n.getUTCFullYear(),0,0))/864e5);while(local<0){local+=1440;doy--}while(local>=1440){local-=1440;doy++}if(doy<1){simYear--;doy=daysInYear(simYear)}if(doy>daysInYear(simYear)){doy-=daysInYear(simYear);simYear++}simDay=doy;simMin=local;}catch(e){}}return jumpToEclipse(dir,type)}
function normalizeAngleDiff(a,b){return ((a-b+540)%360)-180}
function setSpeedValue(sp){
  speed=sp;lastT=null;if(sp>2)userSpeed=sp;
  const ss=document.getElementById("sSpd");
  if(ss){ss.value=Math.round(Math.log(Math.max(1,sp))/Math.log(3600)*1000)}
  const ls=document.getElementById("lSpd");
  if(ls){
    if(sp>=86400)ls.textContent=(sp/86400)+" Tag/s";else if(sp>=3600)ls.textContent=(sp/3600)+"h/s";else if(sp>=60)ls.textContent=(sp/60).toFixed(sp<600?1:0)+"min/s";else ls.textContent=Math.round(sp)+"×";
  }
}
function sceneRun(sp){setTimeout(()=>{if(typeof setPaused==="function")setPaused(false);setSpeedValue(sp||600);if(W)draw();/* Der Sprung kann den vorher pausierten RAF-Zyklus beendet haben. Ein
  Einzelbild reicht dann nicht: Die laufende Simulation braucht einen neuen
  Animationsauftrag. */if(typeof __requestPlanetariumFrame==="function")__requestPlanetariumFrame()},260)}
function setSceneFromJD(la,lo,jd,label){
  window.__pendingRunSpeed=null;
  focusConstellation=null;
  if(typeof window.setYearPlay==="function")window.setYearPlay(false);
  if(typeof setPaused==="function")setPaused(true);
  lat=la;lng=lo;selCity=null;
  const utcDate=new Date((jd-2440587.5)*864e5);
  simYear=utcDate.getUTCFullYear();
  updateTimezone();
  let localMs=utcDate.getTime()+utcOff*3600e3;
  let ld=new Date(localMs);
  simYear=ld.getUTCFullYear();
  simDay=date2doy(ld.getUTCDate(),ld.getUTCMonth(),simYear);
  simMin=ld.getUTCHours()*60+ld.getUTCMinutes()+ld.getUTCSeconds()/60;
  const sl=document.getElementById("sLat"),sg=document.getElementById("sLng"),st=document.getElementById("sTime"),il=document.getElementById("i-lat"),ig=document.getElementById("i-lng"),ys=document.getElementById("yearslider");
  if(sl)sl.value=Math.max(-90,Math.min(90,Math.round(lat)));
  if(sg)sg.value=Math.max(-180,Math.min(180,Math.round(lng)));
  if(st)st.value=Math.round(simMin);
  if(il)il.value=lat.toFixed(2); if(ig)ig.value=lng.toFixed(2);
  if(ys)ys.value=Math.max(parseInt(ys.min||"-3000",10),Math.min(parseInt(ys.max||"8000",10),simYear));
  updateLocDisp(label,lat,lng);updateTimezone();syncYearUI();updLabels();
  zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;if(typeof updateTouchMode==="function")updateTouchMode();
  scrollToSky();setTimeout(()=>{if(W)draw()},220);
}
function findNextMoonPhase(targetDeg){
  let base=currentJD();
  let best=base,bd=999;
  for(let d=0;d<=35;d+=0.25){const j=base+d;const diff=Math.abs(normalizeAngleDiff(moonElong(j),targetDeg));if(diff<bd){bd=diff;best=j}}
  for(let d=-0.4;d<=0.4;d+=0.01){const j=best+d;const diff=Math.abs(normalizeAngleDiff(moonElong(j),targetDeg));if(diff<bd){bd=diff;best=j}}
  return best;
}
function findMoonTransitNear(jd0){
  lat=52.52;lng=13.405;
  let best=jd0,bestAlt=-999;
  for(let h=-14;h<=14;h+=0.25){const j=jd0+h/24;const a=moonAltAt(j);if(a>bestAlt){bestAlt=a;best=j}}
  for(let h=-0.3;h<=0.3;h+=0.01){const j=best+h/24;const a=moonAltAt(j);if(a>bestAlt){bestAlt=a;best=j}}
  return best;
}
function syncViewModeButtons(){
  try{["bview","bview-fs"].forEach(function(id){const b=document.getElementById(id);if(b){b.innerHTML='<span class="bsym">👁</span>';b.classList.toggle("on",viewMode==="real")}})}catch(e){}
  try{const ob=document.getElementById("borient");if(ob)ob.classList.toggle("on",!!(typeof orientMode!=="undefined"&&orientMode))}catch(e){}
}
function pointObserverAtMoon(){
  try{
    if(typeof orientMode!=="undefined"&&orientMode&&typeof disableOrient==="function")disableOrient();
    const jd=currentJD();
    const m=moonTopo(jd);
    const lst=LST();
    const H=(lst-m.ra*15)*Math.PI/180;
    const phi=lat*Math.PI/180,dec=m.dec*Math.PI/180;
    const altRad=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H));
    const azRad=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi));
    window.__viewModeUserChosen=true;
    viewMode="real";
    camAz=((azRad*180/Math.PI)+360)%360;
    camAlt=Math.max(2,altRad*180/Math.PI);
    camFov=65;
    zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;
    syncViewModeButtons();
    try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}
  }catch(e){}
}
function pointObserverAtSun(){
  try{
    if(typeof orientMode!=="undefined"&&orientMode&&typeof disableOrient==="function")disableOrient();
    const jd=currentJD(),s=ecl2rd(sunLon(jd),0,jd);
    const H=(LST()-s.ra*15)*Math.PI/180;
    const phi=lat*Math.PI/180,dec=s.dec*Math.PI/180;
    const altRad=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H));
    const azRad=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi));
    window.__viewModeUserChosen=true;
    viewMode="real";
    camAz=((azRad*180/Math.PI)+360)%360;
    camAlt=Math.max(-5,altRad*180/Math.PI);
    /* Normales Beobachter-Sichtfeld: nur die Himmelsrichtung wird gesetzt,
       es findet bewusst keine teleskopische Vergroesserung statt. */
    camFov=65;
    zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;
    syncViewModeButtons();
    try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}
    try{if(typeof __requestSettledSkyFrame==="function")__requestSettledSkyFrame()}catch(e){}
  }catch(e){}
}
function jumpMoonPhase(targetDeg,label,targetView="real"){
  beginAtomicSkyJump(420);
  const jd0=findNextMoonPhase(targetDeg);
  const jd=findMoonTransitNear(jd0);
  setSceneFromJD(52.52,13.405,jd,label||"Berlin");
  if(targetView==="dome"){
    viewMode="dome";zoom=1;panX=0;panY=0;zoomedObj=null;
    syncViewModeButtons();
    if(typeof updateTouchMode==="function")updateTouchMode();
  }else pointObserverAtMoon();
  showToast(label+" · Mond im Meridian · "+(targetView==="dome"?"Himmelsansicht":"Beobachtermodus"));
}
function startYearSimulation(dir,stepDays){
  if(typeof window.setYearPlay==="function")window.setYearPlay(true,dir||1);
  showToast("Jahreslauf gestartet");
}
const CONST_FOCUS={orion:{c:"Ori",n:"Orion",ra:5.6,de:2,lat:52.52,lng:13.405,m:1,d:15,label:"Berlin",z:3.2},"ursa-major":{c:"UMa",n:"Großer Wagen",ra:11.2,de:56,lat:52.52,lng:13.405,m:4,d:15,label:"Berlin",z:2.7},cassiopeia:{c:"Cas",n:"Kassiopeia",ra:1.1,de:60,lat:52.52,lng:13.405,m:10,d:15,label:"Berlin",z:3.0},scorpius:{c:"Sco",n:"Skorpion",ra:16.4,de:-26,lat:37.98,lng:23.73,m:7,d:15,label:"Athen",z:2.8},"milky-way-center":{c:"Sgr",n:"Milchstraßenzentrum",ra:17.761,de:-29.01,lat:41.65,lng:-0.89,m:8,d:15,label:"Saragossa",z:2.2},widder:{c:"Ari",n:"Widder",ra:2.6,de:20,lat:52.52,lng:13.405,m:10,d:15,label:"Berlin",z:3.2},stier:{c:"Tau",n:"Stier",ra:4.6,de:16,lat:52.52,lng:13.405,m:11,d:15,label:"Berlin",z:3.0},zwillinge:{c:"Gem",n:"Zwillinge",ra:7.0,de:22,lat:52.52,lng:13.405,m:12,d:15,label:"Berlin",z:3.0},loewe:{c:"Leo",n:"Löwe",ra:10.7,de:13,lat:52.52,lng:13.405,m:2,d:15,label:"Berlin",z:3.0},jungfrau:{c:"Vir",n:"Jungfrau",ra:13.4,de:-4,lat:52.52,lng:13.405,m:3,d:15,label:"Berlin",z:2.8},schuetze:{c:"Sgr",n:"Schütze",ra:19.0,de:-25,lat:37.98,lng:23.73,m:6,d:15,label:"Athen",z:2.6}};
function bestTransitMinute(ra,de){const old=simMin;let bestM=old,bestAlt=-999;for(let m=0;m<1440;m+=4){simMin=m;const pc=precess(ra,de,currentJD());const P=altazXY(pc.ra,pc.dec,100);if(P.alt>bestAlt){bestAlt=P.alt;bestM=m}}simMin=old;return bestM}
function syncFocusButtons(){const set=(id,v)=>{const b=document.getElementById(id);if(b)b.classList.toggle("on",!!v)};set("bn",showNames);set("bzod",showZodiac);set("bra",showRA);set("balt",showAlt);set("blines",showLines);set("brefc",showRefCircles);set("bmeteor",showMeteors)}
function domeHR(){const FS=document.body.classList.contains("fullscreen");const C=Math.min(cv.width||W,cv.height||W)/2;const R=C*(FS?.998:.975);return R*(showTwilight?.8:(FS?.965:.94))}
function focusConstellationView(key){beginAtomicSkyJump(440);const f=CONST_FOCUS[key];if(!f)return false;setScene(f.lat,f.lng,f.m,f.d,22*60,f.label);setTimeout(()=>{focusConstellation=f.c;viewMode="dome";if(typeof syncViewModeButtons==="function")syncViewModeButtons();showNames=false;showZodiac=false;showRA=false;showAlt=true;showLines=true;showRefCircles=true;showMeteors=true;simMin=bestTransitMinute(f.ra,f.de);const st=document.getElementById("sTime");if(st)st.value=Math.round(simMin);updLabels();syncFocusButtons();zoom=f.z||3;const HR=domeHR();const pc=precess(f.ra,f.de,currentJD());const P=altazXY(pc.ra,pc.dec,HR);panX=-zoom*P.x;panY=-zoom*P.y;interacting=8;if(typeof updateTouchMode==="function")updateTouchMode();scrollToSky();if(typeof showToast==="function")showToast(f.n+" · Lernansicht: Linien stärker · Sternnamen des Sternbilds · Meridian/Meteore");if(W)draw()},260);return true}
function searchDarkMinuteFor(name,sunMax,minAlt){
  if(minAlt===undefined)minAlt=25;
  const oldDay=simDay,oldMin=simMin,oldYear=simYear;
  let fbDay=simDay,fbMin=simMin,fbAlt=-999,fbYear=simYear;
  let result=null;
  let day=simDay,yr=simYear;
  for(let dOff=0;dOff<200&&!result;dOff++){
    if(dOff>0){
      day+=1;
      const dc=daysInYear(yr);
      if(day>dc){day-=dc;yr+=1}
    }
    simDay=day;simYear=yr;
    if(typeof updateTimezone==="function")updateTimezone();
    let dayBestAlt=-999,dayBestMin=-1;
    for(let m=0;m<1440;m+=10){
      simMin=m;
      const jd=currentJD();
      const p=allPlanets(jd).find(x=>x.n===name);
      if(!p)continue;
      const sunRD=ecl2rd(sunLon(jd),0,jd);
      const sAlt=geoAlt(sunRD.ra,sunRD.dec);
      const oAlt=geoAlt(p.ra,p.dec);
      if(oAlt>fbAlt){fbAlt=oAlt;fbDay=day;fbMin=m;fbYear=yr}
      if(sAlt<sunMax&&oAlt>minAlt&&oAlt>dayBestAlt){dayBestAlt=oAlt;dayBestMin=m}
    }
    if(dayBestMin>=0)result={day:day,min:dayBestMin,alt:dayBestAlt,year:yr,night:true};
  }
  simDay=oldDay;simMin=oldMin;simYear=oldYear;
  if(typeof updateTimezone==="function")updateTimezone();
  if(result)return result;
  return{day:fbDay,min:fbMin,alt:fbAlt,year:fbYear,night:false};
}
function findClosestApproachDay(name,maxDays){
  const oldDay=simDay,oldMin=simMin,oldYear=simYear;
  let bestDelta=1e9,bestDay=simDay,bestYear=simYear;
  let day=simDay,yr=simYear;
  for(let dOff=0;dOff<=maxDays;dOff+=2){
    if(dOff>0){
      day+=2;
      const dc=daysInYear(yr);
      while(day>dc){day-=dc;yr+=1}
    }
    simDay=day;simYear=yr;simMin=720;
    if(typeof updateTimezone==="function")updateTimezone();
    const jd=currentJD();
    const p=allPlanets(jd).find(x=>x.n===name);
    if(p&&p.delta<bestDelta){bestDelta=p.delta;bestDay=day;bestYear=yr}
  }
  simDay=oldDay;simMin=oldMin;simYear=oldYear;
  if(typeof updateTimezone==="function")updateTimezone();
  return{day:bestDay,year:bestYear,delta:bestDelta};
}
function findMaxElongationDay(name,maxDays){
  const oldDay=simDay,oldMin=simMin,oldYear=simYear;
  let bestSep=-1,bestDay=simDay,bestYear=simYear;
  let day=simDay,yr=simYear;
  for(let dOff=0;dOff<=maxDays;dOff+=2){
    if(dOff>0){
      day+=2;
      const dc=daysInYear(yr);
      while(day>dc){day-=dc;yr+=1}
    }
    simDay=day;simYear=yr;simMin=720;
    if(typeof updateTimezone==="function")updateTimezone();
    const jd=currentJD();
    const p=allPlanets(jd).find(x=>x.n===name);
    if(!p)continue;
    const sunRD=ecl2rd(sunLon(jd),0,jd);
    const ra1=p.ra*15*Math.PI/180,de1=p.dec*Math.PI/180;
    const ra2=sunRD.ra*15*Math.PI/180,de2=sunRD.dec*Math.PI/180;
    const cosSep=Math.sin(de1)*Math.sin(de2)+Math.cos(de1)*Math.cos(de2)*Math.cos(ra1-ra2);
    const sep=Math.acos(Math.max(-1,Math.min(1,cosSep)))*180/Math.PI;
    if(sep>bestSep){bestSep=sep;bestDay=day;bestYear=yr}
  }
  simDay=oldDay;simMin=oldMin;simYear=oldYear;
  if(typeof updateTimezone==="function")updateTimezone();
  return{day:bestDay,year:bestYear,elong:bestSep};
}
function findNightMinuteFor(name){
  if(name==="Mars"){
    const ca=findClosestApproachDay("Mars",780);
    const oldDay=simDay,oldYear=simYear;
    let day=ca.day-25,yr=ca.year;
    while(day<1){yr-=1;day+=daysInYear(yr)}
    simDay=day;simYear=yr;
    if(typeof updateTimezone==="function")updateTimezone();
    const res=findNightMinuteForBase("Mars");
    simDay=oldDay;simYear=oldYear;
    if(typeof updateTimezone==="function")updateTimezone();
    res.approachDelta=ca.delta;
    return res;
  }
  if(name==="Venus"||name==="Merkur"){
    const scanDays=name==="Venus"?600:130;
    const me=findMaxElongationDay(name,scanDays);
    const oldDay=simDay,oldYear=simYear;
    let day=me.day-10,yr=me.year;
    while(day<1){yr-=1;day+=daysInYear(yr)}
    simDay=day;simYear=yr;
    if(typeof updateTimezone==="function")updateTimezone();
    const res=findNightMinuteForBase(name);
    simDay=oldDay;simYear=oldYear;
    if(typeof updateTimezone==="function")updateTimezone();
    res.elongation=me.elong;
    return res;
  }
  return findNightMinuteForBase(name);
}
function findNightMinuteForBase(name){
  const deep=searchDarkMinuteFor(name,-18,25);
  if(deep.night){deep.deep=true;return deep}
  const dark=searchDarkMinuteFor(name,-16,25);
  if(dark.night){dark.deep=false;return dark}
  const dusk=searchDarkMinuteFor(name,-2,8);
  if(dusk.night){dusk.deep=false;dusk.dusk=true;return dusk}
  return dusk;
}
window.__planetViewSaved=null;
function doPlanetReturnRestore(btnId,pos){
  const box=document.getElementById("planeten-kasten");
  const btn=btnId?document.getElementById(btnId):null;
  if(box){
    box.classList.remove("collapsed");
    box.scrollIntoView({block:"start",behavior:"auto"});
    if(btn){
      btn.classList.add("jump-btn-flash");
      setTimeout(()=>btn.classList.remove("jump-btn-flash"),900);
    }
    return true;
  }
  if(btn){
    btn.scrollIntoView({block:"center",behavior:"auto"});
    btn.classList.add("jump-btn-flash");
    setTimeout(()=>btn.classList.remove("jump-btn-flash"),900);
    return true;
  }
  if(pos!==null&&pos!==undefined){
    const sc=document.getElementById("scroller");
    if(sc){const old=sc.style.scrollBehavior;sc.style.scrollBehavior="auto";sc.scrollTop=pos;sc.style.scrollBehavior=old;}
  }
  return false;
}
window.__planetReturnScroll=null;
window.__planetReturnBtnId=null;
function restorePlanetReturnScroll(){
  const btnId=window.__planetReturnBtnId;const pos=window.__planetReturnScroll;
  window.__planetReturnBtnId=null;window.__planetReturnScroll=null;
  if(btnId===null&&(pos===null||pos===undefined))return;
  requestAnimationFrame(()=>doPlanetReturnRestore(btnId,pos));
  setTimeout(()=>doPlanetReturnRestore(btnId,pos),750);
}
function restorePlanetViewFlags(){if(window.__planetViewSaved){showLines=window.__planetViewSaved.lines;showRefCircles=window.__planetViewSaved.refc;showZodiac=window.__planetViewSaved.zodiac;window.didHideEcl=window.__planetViewSaved.ecl;window.__planetViewSaved=null;try{if(typeof syncFocusButtons==="function")syncFocusButtons()}catch(e){}}}
function focusPlanetView(name){
  beginAtomicSkyJump(440);
  /* Auf Wunsch: nur der erste Sprung in dieser Didaktik-Sitzung erzwingt die Kuppelansicht
     (bzw. beendet einen laufenden Lagemodus). Waehlt der Nutzer danach ausdruecklich den
     Beobachter- oder Lagemodus, bleibt diese Wahl bei weiteren Planeten-Spruengen erhalten,
     statt bei jedem Sprung erneut auf die Kuppel zurueckgesetzt zu werden. Das Flag wird in
     toggleViewMode()/enableOrient() bei einer echten, manuellen Wahl gesetzt und beim
     Verlassen des Didaktikbereichs (returnToDidacticPage) wieder zurueckgesetzt, damit ein
     neuer Didaktik-Aufenthalt wieder mit der Kuppelansicht beginnt. */
  if(!window.__viewModeUserChosen){
    try{if(orientMode&&typeof disableOrient==="function")disableOrient()}catch(e){}
    viewMode="dome";
  }
  focusConstellation=null;
  if(typeof window.setYearPlay==="function")window.setYearPlay(false);
  if(typeof setNow==="function")setNow();
  let jd0=currentJD();
  let p=allPlanets(jd0).find(x=>x.n===name);
  if(!p){if(typeof showToast==="function")showToast(name+" nicht gefunden.");return}
  const nt=findNightMinuteFor(name);
  if(nt.alt<0){if(typeof showToast==="function")showToast(name+" steht auch nachts in den nächsten Wochen nicht über dem Horizont — vermutlich Sonnennähe (Konjunktion).");return}
  simDay=nt.day;simMin=nt.min;simYear=nt.year;
  if(typeof updateTimezone==="function")updateTimezone();
  if(typeof syncYearUI==="function")syncYearUI();
  const stEl=document.getElementById("sTime");if(stEl)stEl.value=Math.round(simMin);
  jd0=currentJD();
  p=allPlanets(jd0).find(x=>x.n===name);
  const HR=domeHR();
  const P=altazXY(p.ra,p.dec,HR);
  if(P.alt<0){if(typeof showToast==="function")showToast(name+" steht aktuell unter dem Horizont.");scrollToSky();return}
  if(window.__planetViewSaved===null)window.__planetViewSaved={lines:showLines,refc:showRefCircles,zodiac:showZodiac,ecl:window.didHideEcl===true};
  showLines=false;showRefCircles=false;showZodiac=false;window.didHideEcl=true;
  window.telescope=true;
  zoom=200;
  panX=-zoom*P.x;panY=-zoom*P.y;
  interacting=8;paused=true;lastT=null;
  const b=document.getElementById("ba");if(b){b.textContent="▶ Play";b.classList.remove("on")}
  zoomedObj=name;
  setSkyQuality(6.5,"planet-jump");
  try{_gaiaStart();_gaiaStufenPruefen()}catch(e){}
  if(typeof syncFocusButtons==="function")syncFocusButtons();
  if(typeof updateTouchMode==="function")updateTouchMode();
  if(typeof updLabels==="function")updLabels();
  try{const sc=document.getElementById("scroller");if(sc)window.__planetReturnScroll=sc.scrollTop;window.__planetReturnBtnId="pbtn-"+name.toLowerCase();}catch(e){}
  scrollToSky();
  const ntLabel=nt.night?(nt.deep?" · nächste völlig dunkle Nacht (Sonne >18° unter Horizont, Höhe >25°)":" · nächste dunkle Nacht (Sonne >16° unter Horizont, Höhe >25°)"):(nt.dusk?" · beste erreichbare Dämmerungssichtbarkeit (echte Nacht bei diesem Planeten derzeit nicht in ausreichender Höhe erreichbar)":" · beste verfügbare Sichtbarkeit (evtl. mit Horizont-/Tageslicht)");
  const approachLabel=nt.approachDelta?(" · nächste Annäherung: "+nt.approachDelta.toFixed(2)+" AE Entfernung"):(nt.elongation?(" · "+(nt.elongation.toFixed(0))+"° Sonnenabstand ("+(name==="Venus"||name==="Merkur"?"Morgen-/Abendstern-Sichtbarkeit":"")+")"):"");
  if(typeof showToast==="function")showToast(name+ntLabel+approachLabel+" · maximale Vergrößerung · Ekliptik, Mondknotenlinie und Koordinatenlinien ausgeblendet");
  if(W)draw();
}
function getCurrentPolarLng(){
  if(window.currentGeo && isFinite(window.currentGeo.lng)) return window.currentGeo.lng;
  if(typeof lng==='number' && isFinite(lng)) return lng;
  return 0;
}
function jumpScene(id){
  /* Spaetere Didaktik-Module verfeinern einzelne Ziele noch bis 520 ms nach
     dem Aufruf. Das Zeitfenster deckt auch diese letzte bekannte Stufe ab. */
  beginAtomicSkyJump(680);
  try{if(orientMode&&typeof disableOrient==="function")disableOrient()}catch(e){}
  if(id==="current"){setNow();scrollToSky();return}
  function jumpObsPoint(la,lo,m,d,minute,label){
    setScene(la,lo,m,d,minute,label);
    if(typeof orientMode!=="undefined"&&orientMode&&typeof disableOrient==="function")disableOrient();
    viewMode="dome";if(typeof syncViewModeButtons==="function")syncViewModeButtons();
    setSpeedValue(1);
    window.__pendingRunSpeed=3600;
  }
  if(id==="equator-day")return jumpObsPoint(0,0,3,20,12*60,"Äquator");
  if(id==="equator-night")return jumpObsPoint(0,0,3,20,0,"Äquator");
  if(id==="north-pole")return jumpObsPoint(90,0,3,20,12*60,"Nordpol");
  if(id==="south-pole")return jumpObsPoint(-90,0,9,22,12*60,"Südpol");
  if(id==="tropic-cancer")return jumpObsPoint(23.44,0,6,21,12*60,"Nördlicher Wendekreis");
  if(id==="tropic-capricorn")return jumpObsPoint(-23.44,0,12,21,12*60,"Südlicher Wendekreis");
  function jumpSunSeason(la,lo,m,d,minute,label){
    setScene(la,lo,m,d,minute,label);
    try{ if(typeof orientMode!=="undefined" && orientMode && typeof disableOrient==="function") disableOrient(); }catch(_){ }
    try{ if(typeof viewMode!=="undefined"){ viewMode="dome"; if(typeof syncViewModeButtons==="function") syncViewModeButtons(); } }catch(_){ }
    try{ if(typeof setSpeedValue==="function") setSpeedValue(1); }catch(_){ }
    window.__pendingRunSpeed=3600;
  }
  if(id==="spring-equinox")return jumpSunSeason(52.52,13.405,3,20,12*60,"Berlin");
  if(id==="summer-solstice")return jumpSunSeason(52.52,13.405,6,21,12*60,"Berlin");
  if(id==="autumn-equinox")return jumpSunSeason(52.52,13.405,9,22,12*60,"Berlin");
  if(id==="winter-solstice")return jumpSunSeason(52.52,13.405,12,21,12*60,"Berlin");
  if(id==="midnight-sun")return jumpSunSeason(66.563,getCurrentPolarLng(),6,21,0,"Polarkreis 66,56° N · aktuelle Länge");
  if(id==="polar-night")return jumpSunSeason(66.563,getCurrentPolarLng(),12,21,12*60,"Polarkreis 66,56° N · aktuelle Länge");
  if(id==="solar-eclipse")return jumpEclipse(1,"solar");
  if(id==="lunar-eclipse")return jumpEclipse(1,"lunar");
  if(id==="solar-eclipse-prev")return jumpEclipse(-1,"solar");
  if(id==="lunar-eclipse-prev")return jumpEclipse(-1,"lunar");
  if(id==="eclipse-2026-spain")return jumpToEuropeanEclipse();
  if(id==="new-moon")return jumpMoonPhase(0,"Neumond · Berlin");
  if(id==="first-quarter")return jumpMoonPhase(90,"Erstes Viertel · Berlin");
  if(id==="full-moon")return jumpMoonPhase(180,"Vollmond · Berlin");
  if(id==="last-quarter")return jumpMoonPhase(270,"Letztes Viertel · Berlin");
  if(id==="sim-daily-rotation"){
    setScene(52.52,13.405,3,20,21*60,"Berlin");
    // Set the final camera inside setScene's atomic jump, on phones as on desktop.
    // setScene has already disabled orientation and cleared zoom/pan/object focus.
    viewMode="real";setRealHome();
    ["bview","bview-fs"].forEach(id=>{const b=document.getElementById(id);if(b)b.classList.add("on")});
    if(typeof updateTouchMode==="function")updateTouchMode();
    sceneRun(900);return;
  }
  if(id==="sim-moon-phases"){jumpMoonPhase(180,"Mondphasenlauf · Vollmond","dome");sceneRun(86400);return}
  if(id==="sim-precession"){setScene(52.52,13.405,12,21,0,"Berlin",1);viewMode="dome";if(typeof syncViewModeButtons==="function")syncViewModeButtons();if(typeof showZodiac!=="undefined")showZodiac=true;window.__zodiacOn=true;setTimeout(()=>{if(typeof window.setYearPlay==="function")window.setYearPlay(true,1);showToast("Präzessions-Jahreslauf gestartet")},300);return}
  if(id==="sim-polar-day"){setScene(66.563,getCurrentPolarLng(),6,21,0,"Polarkreis 66,56° N · aktuelle Länge");sceneRun(3600);return}
  if(id==="sim-seasons"){setScene(52.52,13.405,3,20,12*60,"Berlin");setTimeout(()=>{if(typeof window.setYearPlay==="function")window.setYearPlay(true,1);showToast("Jahreszeitenlauf gestartet")},300);return}
  if(id==="sim-eclipse-search")return jumpEclipse(1,"solar");
  function jumpPrecYear(year){
    setScene(52.52,13.405,12,21,0,"Berlin",year);
    viewMode="dome";if(typeof syncViewModeButtons==="function")syncViewModeButtons();
    if(typeof showZodiac!=="undefined")showZodiac=true;
    window.__zodiacOn=true;
  }
  if(id==="prec-year-1")return jumpPrecYear(1);
  if(id==="prec-today")return jumpPrecYear((new Date).getFullYear());
  if(id==="prec-6000")return jumpPrecYear(6000);
  if(id==="prec-vega")return jumpPrecYear(12000);
  if(id==="prec-cycle")return jumpPrecYear(26000);
  if(id==="orion")return focusConstellationView("orion");
  if(id==="ursa-major")return focusConstellationView("ursa-major");
  if(id==="cassiopeia")return focusConstellationView("cassiopeia");
  if(id==="scorpius")return focusConstellationView("scorpius");
  if(id==="milky-way-center")return focusConstellationView("milky-way-center");
  if(id==="widder")return focusConstellationView("widder");
  if(id==="stier")return focusConstellationView("stier");
  if(id==="zwillinge")return focusConstellationView("zwillinge");
  if(id==="loewe")return focusConstellationView("loewe");
  if(id==="jungfrau")return focusConstellationView("jungfrau");
  if(id==="schuetze")return focusConstellationView("schuetze");
  if(id==="planet-merkur")return focusPlanetView("Merkur");
  if(id==="planet-venus")return focusPlanetView("Venus");
  if(id==="planet-mars")return focusPlanetView("Mars");
  if(id==="planet-jupiter")return focusPlanetView("Jupiter");
  if(id==="planet-saturn")return focusPlanetView("Saturn");
  if(id==="planet-uranus")return focusPlanetView("Uranus");
  if(id==="planet-neptun")return focusPlanetView("Neptun");
}
function setNow(){focusConstellation=null;const n=new Date;simYear=n.getUTCFullYear();updateTimezone();const utcMin=n.getUTCHours()*60+n.getUTCMinutes()+n.getUTCSeconds()/60;let local=utcMin+utcOff*60;const ud=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()));let doy=Math.floor((ud-Date.UTC(n.getUTCFullYear(),0,0))/864e5);while(local<0){local+=1440;doy--}while(local>=1440){local-=1440;doy++}if(doy<1){simYear--;doy=daysInYear(simYear)}if(doy>daysInYear(simYear)){doy-=daysInYear(simYear);simYear++}simDay=doy||1;simMin=local;updateTimezone();syncYearUI();const st=document.getElementById("sTime");if(st)st.value=Math.round(simMin);setPaused(false);updLabels();if(W)draw()}function canvasXY(clientX,clientY){const rect=cv.getBoundingClientRect();return{x:(clientX-rect.left)/rect.width*(cvW||W),y:(clientY-rect.top)/rect.height*(cvH||W)}}/* Prueft, ob ein Bildschirmpunkt innerhalb des gezeichneten Himmelshorizonts liegt. Im Fernrohrmodus (viewMode "real") und im Lagemodus gibt es keinen Horizontkreis im Sinn dieser Pruefung - dort gilt der ganze Schirm als Geste. Sonst wird derselbe Kreis wie in draw() nachgerechnet: Mittelpunkt ORX+panX/ORY+panY, Radius HR*zoom. */function insideHorizon(clientX,clientY){if(viewMode==="real"||orientMode)return true;if(!W)return true;const p=canvasXY(clientX,clientY);const FS=document.body.classList.contains("fullscreen");const R=C*(FS?.998:.975);const HR=R*(showTwilight?.8:FS?.965:.94);const cx=ORX+panX,cy=ORY+panY,rr=HR*zoom;const dx=p.x-cx,dy=p.y-cy;return dx*dx+dy*dy<=rr*rr}function findObject(cx,cy){let best=null,bd=28*PX;clickable.forEach(o=>{const d=Math.hypot(o.sx-cx,o.sy-cy);if(d<bd){bd=d;best=o}});return best}let zoomedObj=null;function zoomToObject(o){const px=(o.sx-ORX-panX)/zoom,py=(o.sy-ORY-panY)/zoom;zoom=100;panX=-zoom*px;panY=-zoom*py;interacting=8;if(typeof updateTouchMode==="function")updateTouchMode();paused=true;lastT=null;const b=document.getElementById("ba");if(b){b.textContent="▶ Play";b.classList.remove("on")}zoomedObj=o.name;if(W)draw()}
/* Zoomt auf den Ausschnitt, der den Präzessionskreis zeigt - Mittelpunkt ist der
   Ekliptikpol (RA 18h, Dek 90°-Schiefe, ins aktuelle Jahr präzediert), Radius der
   Winkelabstand der Schiefe der Ekliptik (rund 23,44°). Statt diesen Radius pauschal
   anzunehmen, werden 24 echte Kreispunkte mit derselben Formel wie beim Zeichnen des
   Präzessionskreises abgetastet und ihr tatsächlicher Bildschirmabstand vom Mittelpunkt
   gemessen: Die Kuppelprojektion ist radial abstandstreu (Radius wächst linear mit dem
   Zenitabstand), aber nicht überall gleich verzerrt, wenn der Ekliptikpol nicht im Zenit
   steht - der Kreis kann dadurch leicht oval erscheinen. Der größte gemessene Abstand wird
   für die Zoomberechnung verwendet, damit der komplette Kreis unabhängig von dieser
   Verzerrung ins Bild passt, statt sich auf eine angenommene perfekte Kreisform zu
   verlassen, die es in dieser Projektion so nicht gibt. Zeit läuft dabei weiter (anders
   als beim Antippen eines Planeten/Monds bei zoomToObject); ein erneutes Antippen der
   Himmelsansicht setzt wie gewohnt zurück (zoomedObj ist gesetzt). */
function zoomToPrecessionCircle(){
  if(typeof precess!=="function"||typeof altazXY!=="function"||typeof currentJD!=="function"||typeof domeHR!=="function"||typeof oblR!=="function")return;
  try{
    const jd0=currentJD();
    const eps=oblR(jd0)*180/Math.PI;
    const epRA=18*15,epDec=90-eps;
    const HR=domeHR();
    const pep=precess(epRA/15,epDec,jd0);
    const cen=altazXY(pep.ra,pep.dec,HR);
    if(!isFinite(cen.x)||!isFinite(cen.y))return;
    const epDr=epDec*Math.PI/180,epRr=epRA*Math.PI/180,rr=eps*Math.PI/180;
    let maxD=0;
    for(let pa=0;pa<360;pa+=15){
      const par=pa*Math.PI/180;
      const dec=Math.asin(Math.sin(epDr)*Math.cos(rr)+Math.cos(epDr)*Math.sin(rr)*Math.cos(par));
      const dRA=Math.atan2(Math.sin(par)*Math.sin(rr)*Math.cos(epDr),Math.cos(rr)-Math.sin(epDr)*Math.sin(dec));
      const ra=epRr+dRA;
      const raH=(ra*180/Math.PI%360+360)%360/15;
      const pc=precess(raH,dec*180/Math.PI,jd0);
      const P=altazXY(pc.ra,pc.dec,HR);
      if(isFinite(P.x)&&isFinite(P.y)){const d=Math.hypot(P.x-cen.x,P.y-cen.y);if(d>maxD)maxD=d}
    }
    if(!(maxD>0))return;
    const targetPx=HR*.62;
    let z=targetPx/maxD;
    z=Math.max(1,Math.min(8,z));
    zoom=z;panX=-z*cen.x;panY=-z*cen.y;
    interacting=8;
    if(typeof updateTouchMode==="function")updateTouchMode();
    zoomedObj="Präzessionskreis";
    if(typeof showToast==="function")showToast("🔍 Präzessionskreis");
    if(W)draw();
  }catch(e){console.warn(e)}
}
window.zoomToPrecessionCircle=zoomToPrecessionCircle;
function zoomToGeminiTaurus(){
  if(typeof precess!=="function"||typeof altazXY!=="function"||typeof currentJD!=="function"||typeof domeHR!=="function")return;
  try{
    const jd0=currentJD();
    const HR=domeHR();
    /* Ankersterne: Aldebaran/Elnath/Zeta Tauri (Stier), Castor/Pollux/Alhena (Zwillinge) - J2000 */
    const pts=[[4.5987,16.509],[5.4382,28.607],[5.6274,21.143],[7.5767,31.888],[7.7553,28.026],[6.6286,16.399]];
    const cRA=(4.5987+7.7553)/2,cDe=(16.509+28.026)/2; /* Mitte zwischen Aldebaran und Pollux */
    const pc0=precess(cRA,cDe,jd0);
    const cen=altazXY(pc0.ra,pc0.dec,HR);
    if(!isFinite(cen.x)||!isFinite(cen.y))return;
    let maxD=0;
    for(const pt of pts){
      const pc=precess(pt[0],pt[1],jd0);
      const P=altazXY(pc.ra,pc.dec,HR);
      if(isFinite(P.x)&&isFinite(P.y)){const d=Math.hypot(P.x-cen.x,P.y-cen.y);if(d>maxD)maxD=d}
    }
    if(!(maxD>0))return;
    const targetPx=HR*.62;
    let z=targetPx/maxD;
    z=Math.max(1,Math.min(8,z));
    zoom=z;panX=-z*cen.x;panY=-z*cen.y;
    showNames=true;
    interacting=8;
    if(typeof updateTouchMode==="function")updateTouchMode();
    if(typeof syncFocusButtons==="function")syncFocusButtons();
    zoomedObj="Zwillinge & Stier";
    if(typeof showToast==="function")showToast("🔍 Zwillinge & Stier");
    if(W)draw();
  }catch(e){console.warn(e)}
}
window.zoomToGeminiTaurus=zoomToGeminiTaurus;
function resetView(){focusConstellation=null;if(typeof disableOrient==="function")disableOrient();zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;if(typeof updateTouchMode==="function")updateTouchMode();hideInfo();if(paused)togAnim();if(W)draw()}function homeView(){window.telescope=false;focusConstellation=null;viewMode="dome";try{["bview","bview-fs"].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove("on")})}catch(e){}if(typeof disableOrient==="function")disableOrient();if(typeof setSheetPage==="function")setSheetPage(0);zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;if(typeof hideInfo==="function")hideInfo();if(typeof window.setYearPlay==="function")window.setYearPlay(false);speed=1;try{const sl=document.getElementById("sSpd");if(sl){sl.value=Math.round(Math.log(speed)/Math.log(3600)*1e3);}if(typeof setSp==="function")setSp(document.getElementById("sSpd")?document.getElementById("sSpd").value:585);}catch(e){}try{if(window.__gearClear)window.__gearClear();var gb=document.querySelectorAll(".gear-btn");gb.forEach(function(b){b.classList.remove("on")});}catch(e){}setNow();if(typeof updateTouchMode==="function")updateTouchMode();if(W)draw()}function rtsRows(raH,decDeg){if(raH==null||decDeg==null)return"";const r=objRiseTransitSet(raH,decDeg),f=h=>h==null?"—":hhmm(h);let s=`<div class="irow">Aufgang:<b>${f(r.rise)}</b></div>`;s+=`<div class="irow">Kulmination:<b>${r.transit==null?"—":hhmm(r.transit)+" · "+r.maxAlt.toFixed(0)+"°"}</b></div>`;s+=`<div class="irow">Untergang:<b>${f(r.set)}</b></div>`;return s}function showInfo(o,clientX,clientY){const pop=document.getElementById("info-pop");let html=`<div class="ititle">${o.type==="planet"?o.sym+" ":o.type==="sun"?"☀ ":o.type==="moon"?"☽ ":o.type==="iss"?"🛰 ":""}${o.name}</div>`;if(o.type==="star"){const conNames={Ori:"Orion",UMa:"Großer Bär",UMi:"Kleiner Bär",Cas:"Kassiopeia",Cyg:"Schwan",Lyr:"Leier",Aql:"Adler",Boo:"Bärenhüter",Leo:"Löwe",Tau:"Stier",Gem:"Zwillinge",CMa:"Großer Hund",CMi:"Kleiner Hund",Sco:"Skorpion",Sgr:"Schütze",Vir:"Jungfrau",Aur:"Fuhrmann",Per:"Perseus",And:"Andromeda",Peg:"Pegasus",Dra:"Drache",Cep:"Kepheus",Her:"Herkules",Oph:"Schlangenträger",Aqr:"Wassermann",Cap:"Steinbock",Ari:"Widder",Hya:"Wasserschlange",Crv:"Rabe",CVn:"Jagdhunde",CrB:"Nördliche Krone",PsA:"Südlicher Fisch",Eri:"Eridanus"};html+=`<div class="irow">Helligkeit:<b>${o.mag.toFixed(2)} mag</b></div>`;html+=`<div class="irow">Sternbild:<b>${conNames[o.con]||o.con}</b></div>`;html+=`<div class="irow">Höhe:<b>${o.alt.toFixed(1)}°</b></div>`;html+=rtsRows(o.ra,o.de)}else if(o.type==="planet"){html+=`<div class="irow">Typ:<b>Planet</b></div><div class="irow">Höhe:<b>${o.alt.toFixed(1)}°</b></div>`;if(o.mag!=null)html+=`<div class="irow">Helligkeit:<b>${o.mag.toFixed(1)} mag</b></div>`;if(o.delta!=null)html+=`<div class="irow">Distanz:<b>${(o.delta*149.6).toFixed(1)} Mio km</b></div>`;if(o.angDia!=null)html+=`<div class="irow">Winkelgröße:<b>${o.angDia.toFixed(1)}″</b></div>`;if(o.phase!=null)html+=`<div class="irow">Beleuchtung:<b>${(o.phase*100).toFixed(0)}%</b></div>`;html+=rtsRows(o.ra,o.de)}else if(o.type==="sun"){html+=`<div class="irow">Höhe:<b>${o.alt.toFixed(1)}°</b></div>`;if(o.angR!=null)html+=`<div class="irow">Winkelgröße:<b>${(o.angR*2*60).toFixed(1)}′</b></div>`;if(o.eclMag>0)html+=`<div class="irow">Finsternis:<b>${(o.eclMag*100).toFixed(0)}%${o.eclMag>=.995?" (total)":""}</b></div>`;html+=rtsRows(o.ra,o.de)}else if(o.type==="moon"){const ph=["Neumond","zunehmende Sichel","erstes Viertel","zunehmender Mond","Vollmond","abnehmender Mond","letztes Viertel","abnehmende Sichel"][Math.floor(o.age/29.53*8)%8];html+=`<div class="irow">Phase:<b>${ph}</b></div>`;html+=`<div class="irow">Beleuchtung:<b>${(o.illum*100).toFixed(0)}%</b></div>`;html+=`<div class="irow">Alter:<b>${o.age.toFixed(1)} Tage</b></div>`;html+=`<div class="irow">Höhe:<b>${o.alt.toFixed(1)}°</b></div>`;html+=`<div class="irow">Entfernung:<b>${Math.round(o.dist).toLocaleString("de")} km</b></div>`;if(o.angR!=null)html+=`<div class="irow">Winkelgröße:<b>${(o.angR*2*60).toFixed(1)}′</b></div>`;html+=rtsRows(o.ra,o.de)}else if(o.type==="iss"){html+=`<div class="irow">Internationale<br>Raumstation</div>`;html+=`<div class="irow">Höhe über Horizont:<b>${o.alt.toFixed(1)}°</b></div>`;html+=`<div class="irow" style="font-size:.85em;opacity:.7">Bahnhöhe ca. 420 km, ~7,7 km/s</div>`}else if(o.type==="messier"){const tn={g:"Galaxie",k:"Kugelsternhaufen",o:"Offener Sternhaufen",n:"Nebel",p:"Planetarischer Nebel",s:"Supernova-Überrest",a:"Asterismus"}[o.mtype]||"Deep-Sky-Objekt";html+=`<div class="irow">${tn}</div>`;html+=`<div class="irow">Helligkeit:<b>${o.mag.toFixed(1)} mag</b></div>`;html+=`<div class="irow">Höhe über Horizont:<b>${o.alt.toFixed(1)}°</b></div>`}pop.innerHTML=html;pop.classList.add("show");const pw=pop.offsetWidth,ph2=pop.offsetHeight;let px=clientX+12,py=clientY+12;if(px+pw>window.innerWidth-8)px=clientX-pw-12;if(py+ph2>window.innerHeight-8)py=clientY-ph2-12;pop.style.transform="";pop.style.left=Math.max(8,px)+"px";pop.style.top=Math.max(8,py)+"px";clearTimeout(showInfo._t);showInfo._t=setTimeout(()=>pop.classList.remove("show"),5e3)}function hideInfo(){document.getElementById("info-pop").classList.remove("show")}function toggleBrowserFullscreen(){try{const d=document,el=d.documentElement;const fsEl=d.fullscreenElement||d.webkitFullscreenElement;if(!fsEl){(el.requestFullscreen||el.webkitRequestFullscreen||el.webkitRequestFullScreen||function(){}).call(el)}else{(d.exitFullscreen||d.webkitExitFullscreen||function(){}).call(d)}}catch(e){}}function syncFullBtn(){const b=document.getElementById("bfull");if(b)b.classList.toggle("on",!!(document.fullscreenElement||document.webkitFullscreenElement))}document.addEventListener("fullscreenchange",syncFullBtn);document.addEventListener("webkitfullscreenchange",syncFullBtn);let _orientVorMode=null;let orientMode=false,orientHandler=null,oAlt=45,oAz=180,oAltT=45,oAzT=180,deviceZoom=6.2,orientNoSensor=false,orientGotEvent=false,orientGotData=false,orientGotAbs=false,orientAzOffset=0,orientWarnedAccuracy=false,orientLastEvent=0,orientFallback=false;
/* Diagnose-Anzeige fuer das gemeldete Umherspringen im Lagemodus waehrend des Schwenkens.
   Nur mit ?orientdebug=1 in der Adresszeile aktiv, sonst keine Kosten. Zeigt die rohen
   Sensorwerte jedes einzelnen deviceorientation-Ereignisses, damit sich der Sprung beim
   naechsten Mal an echten Zahlen statt am Video ablesen laesst - insbesondere ob
   webkitCompassHeading selbst springt (Sensor/iOS-seitig) oder ob Alpha/Beta/Gamma
   stetig bleiben und erst az/alt aus der Rotationsmatrix den Sprung erzeugen (Rechenfehler
   hier im Code). */
const ORIENT_DEBUG=/[?&]orientdebug=1/.test(location.search);
let _orientDbgEl=null,_orientDbgLast=null;
/* Ausreisser-Erkennung fuer die rohe Kompasspeilung. Dokumentiert und weit verbreitet:
   Magnete in Huellen, MagSafe-Halterungen und -Geldboersen (auch beim iPhone 14 Pro)
   koennen den Magnetometer kurzzeitig stoeren, was sich als einzelner grosser Sprung im
   webkitCompassHeading-Wert zeigt, physikalisch aber keiner echten Drehung entsprechen kann.
   Ein Sprung von mehr als rund 900 Grad/Sekunde ist mit blossem Handschwenken nicht zu
   erreichen (das waeren 2,5 volle Umdrehungen je Sekunde); ein einzelnes solches Ereignis
   wird deshalb verworfen. Haelt der Sprung drei Ereignisse in Folge an, wird er als echt
   akzeptiert (etwa fuer sehr schnelle absichtliche Drehungen oder eine echte, dauerhafte
   Kalibrierungsverschiebung) - so friert das Bild nicht auf einem veralteten Wert ein. */
let _orientPrevAz=null,_orientPrevT=0,_orientOutlierStreak=0;
function orientAngDelta(a,b){return Math.abs(((a-b+540)%360+360)%360-180)}
function orientDebugShow(e,isAbs,dir,note){
  if(!ORIENT_DEBUG)return;
  if(!_orientDbgEl){
    _orientDbgEl=document.createElement("div");
    _orientDbgEl.id="orientdbg";
    _orientDbgEl.style.cssText="position:fixed;left:6px;top:6px;z-index:99999;background:rgba(0,0,0,.72);color:#0f0;font:11px/1.4 monospace;padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre;max-width:96vw";
    document.body.appendChild(_orientDbgEl);
  }
  const t=performance.now();
  const dt=_orientDbgLast==null?0:(t-_orientDbgLast).toFixed(0);
  _orientDbgLast=t;
  const wch=typeof e.webkitCompassHeading==="number"?e.webkitCompassHeading.toFixed(1):"–";
  const acc=typeof e.webkitCompassAccuracy==="number"?e.webkitCompassAccuracy.toFixed(1):"–";
  const a=typeof e.alpha==="number"?e.alpha.toFixed(1):"–";
  const b=typeof e.beta==="number"?e.beta.toFixed(1):"–";
  const g=typeof e.gamma==="number"?e.gamma.toFixed(1):"–";
  _orientDbgEl.textContent="Lagemodus-Debug  Δt="+dt+"ms  "+e.type+"  abs="+isAbs+"\ncompass="+wch+"°  genau=±"+acc+"°\nalpha="+a+"  beta="+b+"  gamma="+g+"\naz="+(dir?dir.az.toFixed(1)+"°":"–")+"  alt="+(dir?dir.alt.toFixed(1)+"°":"–")+"  oAzOffset="+orientAzOffset.toFixed(1)+(note?"\n"+note:"");
}
function flashMsg(t){const pop=document.getElementById("info-pop");if(!pop)return;pop.innerHTML=`<div class="irow">${t}</div>`;pop.classList.add("show");pop.style.left="50%";pop.style.top="13%";pop.style.transform="translateX(-50%)";clearTimeout(flashMsg._t);flashMsg._t=setTimeout(()=>{pop.classList.remove("show");pop.style.transform=""},3200)}
function norm360(a){return(a%360+360)%360}
function screenAngleDeg(){try{if(screen.orientation&&typeof screen.orientation.angle==="number")return screen.orientation.angle||0;if(typeof window.orientation==="number")return window.orientation||0}catch(e){}return 0}
function applyOrientView(){if(viewMode==="real"){/* DeviceOrientation beschreibt die Display-Achse. Fuer den Blick der
   rueckseitigen Handykamera ist deshalb die Gegenrichtung erforderlich. */camAz=norm360(oAz-180);camAlt=Math.max(-89,Math.min(89,oAlt));zoom=1;panX=0;panY=0;if(typeof updateTouchMode==="function")updateTouchMode();return;}const R=(cvW||W)/2*(showTwilight?.8:.94);const altc=Math.max(-8,Math.min(89,oAlt));const Aproj=(oAz-180)*Math.PI/180;const r=(90-altc)/90*R,cx=r*Math.sin(Aproj),cy=r*Math.cos(Aproj);zoom=deviceZoom;panX=-zoom*cx;panY=-zoom*cy;updateTouchMode&&updateTouchMode()}
function orientAltFromBetaGamma(beta,gamma){if(beta==null||!isFinite(beta))return 45;const b=(beta||0)*Math.PI/180,gm=(gamma||0)*Math.PI/180;let c=Math.cos(b)*Math.cos(gm);c=Math.max(-1,Math.min(1,c));/* Die Blickrichtung ist die Rueckseite des Geraets, wie bei einer Kamera. Flach
     liegend mit dem Bildschirm nach oben weist sie nach unten: Nadir, bei 52,5 Grad
     Nord also Deklination -52,5 und damit die Suedpolgegend. Flach mit dem Bildschirm
     nach unten weist sie zum Zenit, senkrecht gehalten zum Horizont. Die frueher hier
     stehende Vorzeichenumkehr lieferte fuer beide flachen Lagen denselben Wert +90 und
     machte sie ununterscheidbar. */
  const alt=Math.acos(c)*180/Math.PI-90;return Math.max(-89,Math.min(89,alt))}
/* Blickrichtung aus der vollstaendigen Drehung des Geraets.
   Die Lagewinkel beschreiben R = Rz(alpha)·Rx(beta)·Ry(gamma); die Rueckseite des
   Geraets, also die Blickrichtung, zeigt entgegen der Bildschirmnormalen: -R·(0,0,1).
   Weltachsen: x nach Osten, y nach Norden, z nach oben.
   Bisher wurde als Azimut schlicht 360-alpha genommen. Das trifft nur zu, solange das
   Geraet nicht seitlich gekippt ist; bei gamma=45 und beta=45 liegt der Fehler schon bei
   55 Grad, und bei flach liegendem Geraet springt der Wert um 180 Grad. Da beim Halten in
   der Hand staendig ein wenig gekippt wird, ergab das ein Wackeln und Umherspringen. */
function orientDirFromEvent(e){
  let alphaEff=null;
  /* -1 ist bei webkitCompassHeading kein echter Winkel, sondern das Fehlersignal von
     Apples CoreLocation-Kompass fuer "Richtung nicht bestimmbar" (kurzer Verlust der
     Kalibrierung, Stoerung durch Metall/Magnete). Ohne diese Pruefung wurde 360-(-1)=361,
     genormt 1 Grad, also praktisch Norden, als gueltige Peilung uebernommen - das Bild
     riss kurz Richtung Norden und sprang beim naechsten echten Wert zurueck. Jetzt faellt
     ein solches Bild einfach aus; oAzT/oAltT behalten den letzten gueltigen Wert, bis
     wieder eine echte Peilung eintrifft. */
  if(typeof e.webkitCompassHeading==="number"&&!isNaN(e.webkitCompassHeading)&&e.webkitCompassHeading>=0){
    alphaEff=360-e.webkitCompassHeading;
  }else if((e.type==="deviceorientationabsolute"||e.absolute===true)&&typeof e.alpha==="number"&&!isNaN(e.alpha)){
    alphaEff=e.alpha;
  }
  if(alphaEff==null)return null;
  const A=alphaEff*Math.PI/180,B=(e.beta||0)*Math.PI/180,G=(e.gamma||0)*Math.PI/180;
  const cA=Math.cos(A),sA=Math.sin(A),cB=Math.cos(B),sB=Math.sin(B),cG=Math.cos(G),sG=Math.sin(G);
  const nx=cA*sG+sA*sB*cG, ny=sA*sG-cA*sB*cG, nz=cB*cG;
  let az=Math.atan2(-nx,-ny)*180/Math.PI;
  const alt=Math.asin(Math.max(-1,Math.min(1,-nz)))*180/Math.PI;
  /* Die Bildschirmdrehung bleibt aussen vor: Die Rueckseite des Geraets zeigt unabhaengig
     davon in dieselbe Richtung, und beta/gamma beziehen sich ohnehin auf das Geraet. */
  return {az:norm360(az+orientAzOffset), alt:Math.max(-89,Math.min(89,alt))};
}
function orientAzFromEvent(e){let az=null;if(typeof e.webkitCompassHeading==="number"&&!isNaN(e.webkitCompassHeading)){az=e.webkitCompassHeading}else if((e.type==="deviceorientationabsolute"||e.absolute===true)&&typeof e.alpha==="number"&&!isNaN(e.alpha)){az=360-e.alpha}if(az==null)return null;az=norm360(az+screenAngleDeg()+orientAzOffset);return az}
function onDeviceOrient(e){if(!orientMode||orientFallback)return;orientGotEvent=true;orientLastEvent=performance.now();const isAbs=e.type==="deviceorientationabsolute"||e.absolute===true;if(isAbs)orientGotAbs=true;if(orientGotAbs&&!isAbs){if(ORIENT_DEBUG)orientDebugShow(e,isAbs,null,"verworfen: absolute Quelle erwartet, nicht-absolutes Ereignis erhalten");return;}const dir=orientDirFromEvent(e);if(ORIENT_DEBUG)orientDebugShow(e,isAbs,dir,dir==null?"verworfen: kein gueltiger Winkel":"");if(dir==null)return;const az=dir.az;const _now=performance.now();if(_orientPrevAz!=null){const _dtms=_now-_orientPrevT;const _dAng=orientAngDelta(az,_orientPrevAz);const _maxPlausibel=Math.max(20,.9*_dtms);if(_dAng>_maxPlausibel){_orientOutlierStreak++;if(_orientOutlierStreak<3){if(ORIENT_DEBUG)orientDebugShow(e,isAbs,dir,"verworfen: unplausibler Sprung "+_dAng.toFixed(1)+"° in "+_dtms.toFixed(0)+"ms (Ausreißer "+_orientOutlierStreak+"/3)");return}}else{_orientOutlierStreak=0}}_orientPrevAz=az;_orientPrevT=_now;orientGotData=true;if(typeof e.webkitCompassAccuracy==="number"&&e.webkitCompassAccuracy>35&&!orientWarnedAccuracy){orientWarnedAccuracy=true;flashMsg("📱 Kompass ungenau · Gerät kurz als Acht bewegen oder ◎ kalibrieren")}oAzT=az;oAltT=dir.alt}
let __orientStepTS=0;
function stepOrient(){if(!orientMode){__orientStepTS=0;return}/* Der Lagemodus ist nur in der Beobachterprojektion sinnvoll. Die Kuppelansicht ist zenitzentriert und abstandstreu; sie bloss so zu verschieben, dass die Blickrichtung in der Mitte steht, liefert weder die richtige Bilddrehung noch einen geraden Horizont — der Horizont erscheint dort als stark gekruemmter Kreisbogen. Die Umstellung geschieht hier einmalig, weil der Lagemodus ueber fuenf verschiedene Wege eingeschaltet werden kann. */if(_orientVorMode===null){_orientVorMode=viewMode;if(viewMode!=="real"){viewMode="real";camFov=REAL_HOME_FOV;zoom=1;panX=0;panY=0;zoomedObj=null;}}/* Die Glaettung ist jetzt zeit- statt bildabhaengig. Dadurch bleibt ihre Reaktion
     auf 30-, 60- und 120-Hz-Geraeten gleich und wird auch bei einzelnen teuren
     Gaia-Bildern nicht ploetzlich zaeh. Die Zeitkonstanten entsprechen bei 60 Hz
     ungefaehr den bisherigen Faktoren 0,12 (Sensor) und 0,085 (Pfeilsimulation). */const __orientNow=performance.now(),__orientDt=__orientStepTS?Math.max(1/240,Math.min(.05,(__orientNow-__orientStepTS)/1000)):1/60;__orientStepTS=__orientNow;const __orientTau=orientFallback?.188:.130;const k=1-Math.exp(-__orientDt/__orientTau);/* Fuer den Lagesensor etwas kraeftiger als frueher (0,12
     statt 0,18), weil die neue Richtungsrechnung dem Geraet treu folgt und damit auch das
     Handzittern ungefiltert weitergibt; die Verzoegerung bleibt mit rund einer Zehntel
     Sekunde bis zur halben Annaeherung unauffaellig. Im manuellen Fallback
     simulieren die Pfeile mit einer weicheren Annaeherung eine ruhige Drehung
     des Handys statt eines sprunghaften Kameraschnitts. *//* Geglaettet wird der Richtungsvektor, nicht Azimut und Hoehe einzeln. Getrennt
     gemittelt ergaebe das nahe Zenit und Nadir ein Umherspringen, weil der Azimut dort
     unbestimmt ist und schon winzige Lageaenderungen ihn um viele Grad wandern lassen —
     die Hoehe aendert sich dabei kaum, die Blickrichtung also auch nicht, das Bild
     drehte sich aber heftig. Ueber den Vektor gemittelt entfaellt das von selbst, und
     der Umlauf bei 360 Grad braucht keine Sonderbehandlung mehr. */const _tr=oAzT*Math.PI/180,_ta=oAltT*Math.PI/180,_cr=oAz*Math.PI/180,_ca=oAlt*Math.PI/180;const _tc=Math.cos(_ta),_cc=Math.cos(_ca);const _tx=_tc*Math.sin(_tr),_ty=_tc*Math.cos(_tr),_tz=Math.sin(_ta);const _sx=_cc*Math.sin(_cr),_sy=_cc*Math.cos(_cr),_sz=Math.sin(_ca);const _pp=Math.max(-1,Math.min(1,_tx*_sx+_ty*_sy+_tz*_sz));if(_pp<0.9999999){let _nx=_sx+(_tx-_sx)*k,_ny=_sy+(_ty-_sy)*k,_nz=_sz+(_tz-_sz)*k;const _L=Math.hypot(_nx,_ny,_nz);if(_L>1e-9){_nx/=_L;_ny/=_L;_nz/=_L;oAlt=Math.asin(Math.max(-1,Math.min(1,_nz)))*180/Math.PI;oAz=norm360(Math.atan2(_nx,_ny)*180/Math.PI);}}applyOrientView();if(!orientFallback&&orientGotEvent&&performance.now()-orientLastEvent>2500){enableOrientFallback("📱 Sensorsignal pausiert · manueller Alldocube-Modus aktiv");orientLastEvent=performance.now()+999999}}
function setOrientFallbackUI(on){document.body.classList.toggle("orient-fallback",!!on)}
function enableOrientFallback(msg){if(!orientMode)return;const wasFallback=orientFallback;orientNoSensor=true;orientFallback=true;setOrientFallbackUI(true);if(orientHandler){window.removeEventListener("deviceorientationabsolute",orientHandler,true);window.removeEventListener("deviceorientation",orientHandler,true);orientHandler=null}/* Ohne Sensor beginnt die Pfeilsimulation in derselben Grundausrichtung wie der Beobachtermodus: Blick nach Sueden, 26 Grad Hoehe. Erst danach veraendern die Pfeile die simulierte Handylage. */if(!wasFallback){oAzT=oAz=180;oAltT=oAlt=26;applyOrientView()}else{oAzT=oAz;oAltT=oAlt}deviceZoom=Math.max(5.5,Math.min(8,deviceZoom||6.2));if(msg)flashMsg(msg);if(W)draw()}
function manualOrient(da,dalt){if(!orientMode){enableOrient();setTimeout(()=>enableOrientFallback("Manueller Lagemodus"),80)}else if(!orientFallback){enableOrientFallback("Manueller Lagemodus")}
oAzT=norm360(oAzT+da);/* Der Hoehenbereich war auf -5 bis 88 Grad eingeklemmt; damit liess sich mit den
     Pfeiltasten nicht unter den Horizont und schon gar nicht zum Nadir blicken.
     Jetzt derselbe Bereich wie beim Lagesensor: bis knapp an Zenit und Nadir, die
     letzten Grad ausgespart, weil die Richtungsrechnung am Pol entartet. */oAltT=Math.max(-89,Math.min(89,oAltT+dalt));if(W)draw()}
function calibrateOrient(){if(!orientMode){flashMsg("📱 Lage-Modus zuerst einschalten");return}if(orientFallback){oAzT=oAz=180;oAltT=oAlt=45;flashMsg("◎ Manuelle Lage zurückgesetzt: Süden · 45° Höhe");if(W)draw();return}if(ORIENT_DEBUG&&_orientDbgEl)_orientDbgEl.textContent="◎ KALIBRIERT  oAz="+oAz.toFixed(1)+"  oAzT(vorher)="+oAzT.toFixed(1)+"  Offset-Aenderung="+norm360(oAz-oAzT).toFixed(1)+"°\n"+_orientDbgEl.textContent;orientAzOffset=norm360(orientAzOffset+(oAz-oAzT));oAzT=oAz;_orientPrevAz=null;_orientOutlierStreak=0;try{document.body.classList.add("orient-kalibriert")}catch(e){}flashMsg("◎ Lagemodus kalibriert")}
function disableOrient(){try{clearTimeout(enableOrient._t)}catch(e){}try{stopVrCamera()}catch(e){}if(!orientMode){orientFallback=false;try{setOrientFallbackUI(false)}catch(e){}}if(!orientMode)return;orientMode=false;orientFallback=false;setOrientFallbackUI(false);document.body.classList.remove("orient-mode");document.body.classList.remove("orient-kalibriert");if(orientHandler){window.removeEventListener("deviceorientationabsolute",orientHandler,true);window.removeEventListener("deviceorientation",orientHandler,true);orientHandler=null}const b=document.getElementById("borient");if(b)b.classList.remove("on");if(_orientVorMode&&_orientVorMode!=="real"&&viewMode==="real"){viewMode=_orientVorMode;camFov=REAL_HOME_FOV;}_orientVorMode=null;zoom=1;panX=0;panY=0;zoomedObj=null;try{["bview","bview-fs"].forEach(function(id){var vb=document.getElementById(id);if(vb)vb.classList.toggle("on",viewMode==="real")})}catch(e){}updateTouchMode&&updateTouchMode();if(W)draw();__requestSettledSkyFrame()}
/* Der Beobachtermodus-Knopf (Auge) wirkt waehrend des Lagemodus nicht mehr - toggleViewMode()
   bricht dort fruehzeitig ab. Damit er das auch anzeigt, statt weiterhin "an" zu leuchten,
   wird seine Markierung beim Einschalten des Lagemodus entfernt, unabhaengig davon, ob der
   Lagemodus danach die Kuppel- oder die Beobachterprojektion nutzt - die Projektion selbst
   bleibt unveraendert, nur die Knopf-Anzeige wird synchron gehalten. */
function syncViewButtonsForOrient(){try{["bview","bview-fs"].forEach(function(id){var vb=document.getElementById(id);if(vb)vb.classList.remove("on")})}catch(e){}}
function enableOrient(){const _wasAutoStart=!!window.__orientAutoStart;window.__orientAutoStart=false;try{clearTimeout(enableOrient._t)}catch(e){}if(orientHandler){try{window.removeEventListener("deviceorientationabsolute",orientHandler,true);window.removeEventListener("deviceorientation",orientHandler,true)}catch(e){}orientHandler=null}orientHandler=onDeviceOrient;orientFallback=false;setOrientFallbackUI(false);orientGotEvent=false;orientGotData=false;orientGotAbs=false;orientWarnedAccuracy=false;orientLastEvent=performance.now();_orientPrevAz=null;_orientPrevT=0;_orientOutlierStreak=0;oAzT=oAz;oAltT=oAlt;try{window.addEventListener("deviceorientationabsolute",orientHandler,true);window.addEventListener("deviceorientation",orientHandler,true)}catch(e){}orientMode=true;document.body.classList.add("orient-mode");const b=document.getElementById("borient");if(b)b.classList.add("on");syncViewButtonsForOrient();deviceZoom=Math.max(5.5,Math.min(8,deviceZoom||6.2));try{if(viewMode==="real")applyOrientView()}catch(e){}if(!_wasAutoStart){flashMsg("📱 Lage-Modus an · wenn Alldocube keinen Sensor liefert: manueller Fallback startet automatisch");window.__viewModeUserChosen=true}clearTimeout(enableOrient._t);if(orientNoSensor){enableOrientFallback("📱 Lage-Modus · manuelle Steuerung mit den Pfeilen");return}/* Erkennungszeit von 1800 auf 3500 Millisekunden angehoben: Seit dem automatischen Start
   beim allerersten Antippen der Seite (autoStartOrient) kann diese Pruefung auch ganz am
   Seitenanfang laufen, noch bevor die Sensorik des Geraets vollstaendig angelaufen ist -
   ein zu kurzes Zeitfenster haette dort faelschlich "kein Sensor" gemeldet, obwohl einer
   vorhanden ist und nur etwas spaeter zu senden beginnt. */
  /* Beide Fehlschlag-Zweige (gar kein Ereignis / Ereignisse ohne brauchbare Richtung)
     leiten beim automatischen Start gleichermassen zum Beobachtermodus um - eine
     einzelne Hilfsfunktion vermeidet die vorher doppelt gefuehrte Umleitung. Wichtig
     fuer den gemeldeten Fall (Alldocube-Tablet): viele einfache Android-Geraete liefern
     durchaus deviceorientation-Ereignisse (etwa von einem Beschleunigungsmesser), aber
     nie eine brauchbare absolute Richtung - das faellt in den zweiten, nicht den ersten
     Zweig, und wurde von der ersten Fassung dieser Aenderung noch nicht erfasst. */
  const _gehZuBeobachter=()=>{
    disableOrient();
    viewMode="real";zoom=1;panX=0;panY=0;zoomedObj=null;interacting=8;
    setRealHome();
    try{updateTouchMode&&updateTouchMode()}catch(e){}
    try{flashMsg("👁 Kein Lagesensor erkannt · Beobachtermodus")}catch(e){}
    if(typeof draw==="function"&&W)draw();
  };
  enableOrient._t=setTimeout(()=>{if(!orientMode)return;if(!orientGotEvent){
    if(_wasAutoStart){_gehZuBeobachter()}
    else{enableOrientFallback("⚠ Kein Gerätesensor erkannt · Alldocube-Fallback: Pfeile verwenden")}
  }else if(!orientGotData){
    if(_wasAutoStart){_gehZuBeobachter()}
    else{enableOrientFallback("⚠ Kein echter Kompass/keine absolute Richtung · Pfeile verwenden")}
  }},3500)}
function ensureLiveTime(){try{if(typeof speed==="number"&&speed<1)setSpeedValue(1)}catch(e){}try{setPaused(false)}catch(e){}}
window.leaveRealView=function(){if(viewMode!=="real")return;viewMode="dome";zoom=1;panX=0;panY=0;zoomedObj=null;try{["bview","bview-fs"].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove("on")})}catch(e){}try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}if(W)draw();};function setRealHome(){camAz=0;camAlt=26;camFov=65}const REAL_HOME_FOV=65;/* Im Lagemodus bleibt die wirksame Vergroesserung bei eins, egal wie weit die
   Zwei-Finger-Geste das Bildfeld aufzieht. Davon haengen die Grenzgroesse des
   Sternhintergrunds, die Auswahl der Deep-Sky-Objekte und die simulierte Beobachtungs-
   hoehe ab: Der Himmel am Tag bleibt damit blau, und nachts erscheinen keine
   zusaetzlichen Sterne — die Geste veraendert allein den Bildausschnitt. */
function curMag(){return orientMode?1:(viewMode==="real"?REAL_HOME_FOV/camFov:zoom)}
/* Die Vergroesserung ist jetzt immer bis 6000-fach beziehungsweise bis 0,325 Grad
   Bildfeld freigegeben; nur im Lagemodus bleibt es bei 30 bis 100 Grad, weil dort die
   Gerätelage die Blickrichtung fuehrt und starke Vergroesserung unbrauchbar waere.
   Der frühere Umschalter hatte damit keine Aufgabe mehr. Die Flaeche unten rechts
   setzt stattdessen die Vergroesserung auf Normalgroesse zurueck - die einzige
   Handlung, die der Umschalter beim Ausschalten ohnehin schon leistete. */
function toggleTelescope(){
  if(orientMode){camFov=65;try{if(typeof flashMsg==="function")flashMsg("Bildfeld zurückgesetzt · 65°")}catch(e){}}
  else{
    zoom=1;panX=0;panY=0;zoomedObj=null;
    if(typeof deviceZoom!=="undefined")deviceZoom=1;
    camFov=65;
    try{if(typeof flashMsg==="function")flashMsg("Ansicht in Normalgröße")}catch(e){}
  }
  try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}
  try{if(typeof updLabels==="function")updLabels()}catch(e){}
  if(W)draw();
}
window.toggleTelescope=toggleTelescope;
function toggleViewMode(){
  window.__viewModeUserChosen=true;
  __requestSettledSkyFrame();
  /* Bisher blieb dieser Umschalter waehrend des Lagemodus wirkungslos. Auf Wunsch jetzt
     umgekehrt: Ein Tipp auf den Beobachtermodus-Knopf beendet den Lagemodus und aktiviert
     danach ausdruecklich den Beobachtermodus - unabhaengig davon, ob der Lagemodus zuletzt
     die Kuppel- oder die Beobachterprojektion genutzt hat. disableOrient() stellt zwar
     schon die vorherige Ansicht wieder her (und synchronisiert dabei bereits den Knopf,
     siehe Build 20260804zc), aber falls das die Kuppelsicht war, reicht das hier nicht -
     der Tipp auf DIESEN Knopf bedeutet eindeutig "jetzt den Beobachtermodus", nicht nur
     "zurueck zum vorherigen Zustand". */
  if(orientMode){
    disableOrient();
    if(viewMode!=="real"){
      viewMode="real";zoom=1;panX=0;panY=0;zoomedObj=null;interacting=0;
      setRealHome();
      try{["bview","bview-fs"].forEach(function(id){var b=document.getElementById(id);if(b){b.innerHTML='<span class="bsym">👁</span>';b.classList.add("on")}})}catch(e){}
      try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}
      if(W)draw();
    }
    return;
  }
  /* Erneutes Antippen schaltet den bereits aktiven Beobachtermodus aus und
     fuehrt zur vollstaendigen Himmelsansicht zurueck. */
  if(viewMode==="real"){
    viewMode="dome";
    zoom=1;panX=0;panY=0;zoomedObj=null;interacting=0;
    try{["bview","bview-fs"].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove("on")})}catch(e){}
    try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}
    if(W)draw();
    return;
  }
  viewMode="real";
  zoom=1;panX=0;panY=0;zoomedObj=null;interacting=0;
  setRealHome();
  try{["bview","bview-fs"].forEach(function(id){var b=document.getElementById(id);if(b){b.innerHTML='<span class="bsym">👁</span>';b.classList.add("on")}})}catch(e){}
  try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}
  if(W)draw();
}
function toggleOrient(){/* Der Schalter waehlt den Lagemodus aus. Laeuft er bereits,
     schaltet ein wiederholter Tipp ihn aus und fuehrt zur kompletten Himmelsansicht.
     Der Wechsel zum Beobachtermodus erfolgt weiterhin ueber dessen eigenen Knopf.
     Frueher war dies ein Aus- und Einschalter: disableOrient
     stellt dabei ueber _orientVorMode die Ansicht wieder her, die vor dem Einschalten
     aktiv war — Kuppel oder Beobachter. Die frueher hier stehende Ruecksetzung auf die
     Kuppelansicht entfaellt, weil sie genau diese Erinnerung ueberschrieben haette und
     ein Wechsel aus dem Beobachtermodus heraus dorthin nicht mehr zurueckgefuehrt haette.
     Schutz gegen doppelten Aufruf: seit dem automatischen Start beim allerersten Antippen
     der Seite (autoStartOrient) kann derselbe Tipp toggleOrient() zweimal ausloesen, wenn
     er zufaellig auf den Lagemodus-Knopf selbst trifft - der Erfassungs-Beobachter ruft es
     einmal auf, danach feuert der Knopf ganz normal seinen eigenen onclick. Waehrend die
     Erlaubnisabfrage noch laeuft, ist orientMode noch nicht wahr, der Schutz greift
     also nicht; ohne dieses Flag koennte iOS zweimal nach der Erlaubnis fragen und die
     Sensor-Erkennung kaeme durcheinander. */if(orientMode){disableOrient();viewMode="dome";zoom=1;panX=0;panY=0;zoomedObj=null;interacting=0;try{["bview","bview-fs"].forEach(function(id){var b=document.getElementById(id);if(b)b.classList.remove("on")})}catch(e){}try{if(typeof updateTouchMode==="function")updateTouchMode()}catch(e){}if(W)draw();return}if(window.__orientPermPending)return;setPaused(false);setSpeedValue(1);ensureLiveTime();try{if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){window.__orientPermPending=true;DeviceOrientationEvent.requestPermission().then(s=>{window.__orientPermPending=false;if(s==="granted")enableOrient();else{orientMode=true;document.body.classList.add("orient-mode");const b=document.getElementById("borient");if(b)b.classList.add("on");syncViewButtonsForOrient();enableOrientFallback("Bewegungssensor nicht erlaubt · manueller Lagemodus")}}).catch(()=>{window.__orientPermPending=false;orientMode=true;document.body.classList.add("orient-mode");const b=document.getElementById("borient");if(b)b.classList.add("on");syncViewButtonsForOrient();enableOrientFallback("Bewegungssensor nicht verfügbar · manueller Lagemodus")})}else if(typeof DeviceOrientationEvent!=="undefined"){enableOrient()}else{orientMode=true;document.body.classList.add("orient-mode");const b=document.getElementById("borient");if(b)b.classList.add("on");syncViewButtonsForOrient();enableOrientFallback("Kein Lagesensor · manueller Alldocube-Modus")}}catch(e){orientMode=true;document.body.classList.add("orient-mode");const b=document.getElementById("borient");if(b)b.classList.add("on");syncViewButtonsForOrient();enableOrientFallback("Lagesensor nicht verfügbar · manueller Modus")}}
let vrCameraStream=null,vrCameraPending=false;
function stopVrCamera(){const v=document.getElementById("vr-camera-feed");if(v){try{v.pause()}catch(e){}v.srcObject=null}if(vrCameraStream){try{vrCameraStream.getTracks().forEach(t=>t.stop())}catch(e){}vrCameraStream=null}vrCameraPending=false;document.body.classList.remove("vr-mode");window.cameraStarOnly=false;if(window.__cameraObjectNamesBefore!==undefined){showObjectNames=window.__cameraObjectNamesBefore;delete window.__cameraObjectNamesBefore}try{syncNameLayerButtons()}catch(e){}const b=document.getElementById("bvr");if(b){b.classList.remove("on");b.setAttribute("aria-pressed","false")}if(W)draw()}
async function toggleVrCamera(){if(vrCameraStream||document.body.classList.contains("vr-mode")){stopVrCamera();flashMsg("📷 VR-Kamera aus");return}if(vrCameraPending)return;if(!navigator.mediaDevices||typeof navigator.mediaDevices.getUserMedia!=="function"){flashMsg("⚠ Kamera nicht verfügbar · HTTPS erforderlich");return}vrCameraPending=true;try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});vrCameraStream=stream;const v=document.getElementById("vr-camera-feed");if(!v)throw new Error("Kameraelement fehlt");v.srcObject=stream;await v.play();if(!orientMode)toggleOrient();window.__cameraObjectNamesBefore=showObjectNames;showObjectNames=true;window.cameraStarOnly=true;document.body.classList.add("vr-mode");try{syncNameLayerButtons()}catch(e){}const b=document.getElementById("bvr");if(b){b.classList.add("on");b.setAttribute("aria-pressed","true")}if(W)draw();flashMsg("📷 Kamera an · hellste Sterne und Planeten beschriftet")}catch(e){stopVrCamera();const denied=e&&(""+e.name).match(/NotAllowed|PermissionDenied|Security/);flashMsg(denied?"⚠ Kamerazugriff nicht erlaubt":"⚠ Kamera konnte nicht gestartet werden")}finally{vrCameraPending=false}}
window.toggleVrCamera=toggleVrCamera;window.stopVrCamera=stopVrCamera;
(function randZiehen(){
  const z=document.createElement("div");
  z.id="real-sheet-drag";
  z.innerHTML='<div id="real-sheet-grip"></div>';
  document.body.appendChild(z);

  /* Sichtbar überall dort, wo die Himmelsansicht zu sehen ist – unabhängig von
     Kuppel-/Beobachter-/Orientierungsmodus, Vollbild, Didaktik und Vergrößerung.
     Auf den Textseiten (Sprünge, Erläuterung, Historie) wird der Streifen
     abgeschaltet, damit er dort weder Bedienelemente noch das Blättern stört. */
  function aufHimmelsseite(){
    try{
      if(document.body.classList.contains("fullscreen")) return true;
      const sc=document.getElementById("scroller"), sky=document.getElementById("page-sky");
      if(!sc||!sky) return true;
      return Math.abs(sc.scrollTop-sky.offsetTop) < Math.max(40, sky.offsetHeight*0.35);
    }catch(e){ return true; }
  }
  function syncSicht(){ z.classList.toggle("an", aufHimmelsseite()); }
  syncSicht();
  try{
    const sc=document.getElementById("scroller");
    if(sc) sc.addEventListener("scroll",syncSicht,{passive:true});
  }catch(e){}
  window.addEventListener("resize",syncSicht);
  window.addEventListener("orientationchange",syncSicht);
  setInterval(syncSicht,400);

  let sperre=0;
  function amZiel(){
    try{
      const sc=document.getElementById("scroller"), p=document.getElementById("page-panel");
      if(!sc||!p) return false;
      return Math.abs(sc.scrollTop-p.offsetTop)<10;
    }catch(e){ return false; }
  }
  function gehZumBedienfeld(){
    try{ if(typeof setSheetPage==="function"){ setSheetPage(1); return; } }catch(e){}
    try{ if(typeof scrollToPage==="function"){ scrollToPage("page-panel"); return; } }catch(e){}
    try{
      const el=document.getElementById("page-panel");
      if(el){ try{ el.scrollIntoView({behavior:"smooth",block:"start"}); }catch(_){ el.scrollIntoView(); } }
    }catch(e){}
  }
  function oeffne(){
    const t=Date.now();
    if(t-sperre<700) return;
    sperre=t;
    /* Im Vollbild ist der Seitenlauf abgeschaltet – erst verlassen, dann blättern. */
    try{
      if(document.body.classList.contains("fullscreen") && typeof exitFull==="function") exitFull();
    }catch(e){}
    gehZumBedienfeld();
    [90,260,520,900].forEach(ms=>setTimeout(()=>{ if(!amZiel()) gehZumBedienfeld(); },ms));
  }
  window.__oeffneBedienfeld=oeffne;

  const SCHWELLE=26;
  let pid=null, y0=0, x0=0, gezogen=false;

  if("PointerEvent" in window){
    z.addEventListener("pointerdown",e=>{
      if(!z.classList.contains("an")) return;
      pid=e.pointerId; y0=e.clientY; x0=e.clientX; gezogen=false;
      try{ z.setPointerCapture(pid); }catch(_){}
      e.stopPropagation();
      if(e.cancelable) e.preventDefault();
    },{passive:false});
    z.addEventListener("pointermove",e=>{
      if(pid===null||e.pointerId!==pid) return;
      e.stopPropagation();
      if(e.cancelable) e.preventDefault();
      const dy=y0-e.clientY, dx=Math.abs(e.clientX-x0);
      if(dy>SCHWELLE && dy>dx){
        gezogen=true; const p=pid; pid=null;
        try{ z.releasePointerCapture(p); }catch(_){}
        oeffne();
      }
    },{passive:false});
    z.addEventListener("pointerup",e=>{
      if(pid===null) return;
      const p=pid; pid=null;
      try{ z.releasePointerCapture(p); }catch(_){}
      e.stopPropagation();
      /* Tippen öffnet nur mittig auf dem sichtbaren Griff – ein Tipper am Rand
         bleibt folgenlos und wird nicht als Wischgeste fehlgedeutet. */
      if(!gezogen && Math.abs(e.clientX-(window.innerWidth||0)/2)<70) oeffne();
    });
    z.addEventListener("pointercancel",()=>{ pid=null; });
  } else {
    let ty0=null;
    z.addEventListener("touchstart",e=>{
      if(!z.classList.contains("an")) return;
      ty0=(e.touches&&e.touches[0])?e.touches[0].clientY:null; gezogen=false;
      e.stopPropagation();
    },{passive:true});
    z.addEventListener("touchmove",e=>{
      if(ty0===null||!e.touches||!e.touches[0]) return;
      e.stopPropagation();
      if(ty0-e.touches[0].clientY>SCHWELLE){ ty0=null; gezogen=true; oeffne(); }
    },{passive:true});
    z.addEventListener("touchend",e=>{
      e.stopPropagation();
      const tx=(e.changedTouches&&e.changedTouches[0])?e.changedTouches[0].clientX:0;
      if(ty0!==null && !gezogen && Math.abs(tx-(window.innerWidth||0)/2)<70){ ty0=null; oeffne(); }
      ty0=null;
    },{passive:true});
    let my0=null;
    z.addEventListener("mousedown",e=>{ if(!z.classList.contains("an"))return; my0=e.clientY; gezogen=false; e.stopPropagation(); });
    window.addEventListener("mousemove",e=>{ if(my0===null)return; if(my0-e.clientY>SCHWELLE){ my0=null; gezogen=true; oeffne(); } });
    window.addEventListener("mouseup",()=>{ if(my0!==null && !gezogen) oeffne(); my0=null; });
  }
})();
function updateTouchMode(){try{document.body.classList.toggle("real-view",viewMode==="real")}catch(e){}
  /* touch-action stand bisher im Beobachter-/Lagemodus (viewMode "real") fest auf "none" -
     das unterbindet natives Scrollen auf CSS-Ebene vollstaendig, unabhaengig davon, ob
     JS per preventDefault() eingreift oder nicht. Die 340-Millisekunden-Schwelle aus
     Build 20260804t konnte deshalb dort gar nicht wirken: der Browser hatte schon durch
     dieses "none" keine Moeglichkeit, eine Beruehrung selbst als vertikales Scrollen zu
     werten, egal wie kurz sie war. "pan-y" erlaubt das native Scrollen weiterhin, laesst
     aber zu, dass ein einzelner touchmove-Aufruf mit preventDefault() die Geste noch
     uebernehmen kann - genau das tut die neue Zeitschwelle nach Ablauf der 500 Millisekunden. */
  const ta="pan-y";cv.style.touchAction=ta;wrap.style.touchAction=ta;if(zoom<=1){panX=0;panY=0}}cv.addEventListener("wheel",e=>{if(!orientMode&&!insideHorizon(e.clientX,e.clientY)){return;}e.preventDefault();if(orientMode)return;if(viewMode==="real"){camFov=Math.max(orientMode?30:.325,Math.min(100,camFov*(e.deltaY<0?.92:1.087)));interacting=8;return;}if(orientMode)disableOrient();zoomedObj=null;const _oz=zoom;zoom=Math.max(1,Math.min(orientMode?1:6000,zoom*(e.deltaY<0?1.12:.89)));/* Ein Weltpunkt liegt bei OR+pan+zoom·p. Fest bleibt unter einer reinen
   Zoomänderung nur p=0, also der Zenit — nicht die Bildmitte. Damit der in der
   Mitte stehende Punkt dort bleibt, muss die Verschiebung mitskaliert werden. */
if(_oz>0&&zoom!==_oz){const _k=zoom/_oz;panX*=_k;panY*=_k}if(zoom<=1){panX=0;panY=0}interacting=8;updateTouchMode()},{passive:false});let mDown=false,mMoved=false,mx0=0,my0=0,dayAcc=0,minAcc=0;cv.addEventListener("mousedown",e=>{if(e.button!==0||orientMode)return;mDown=true;mMoved=false;mx0=e.clientX;my0=e.clientY;dayAcc=0;minAcc=0});window.addEventListener("mousemove",e=>{if(!mDown)return;const dx=e.clientX-mx0,dy=e.clientY-my0;if(Math.abs(dx)+Math.abs(dy)>3)mMoved=true;if(viewMode==="real"){if(mMoved&&orientMode)disableOrient();const kr=360/(Math.PI*((Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720)));camAz=((camAz+dx*kr)%360+360)%360;camAlt=Math.max(-25,Math.min(85,camAlt+dy*kr));interacting=8;mx0=e.clientX;my0=e.clientY;__requestPlanetariumFrame();return;}if(zoom<=1){if(mMoved){setPaused(true);minAcc+=dx*0.9;dayAcc+=dy*0.06;const dMin=Math.trunc(minAcc);minAcc-=dMin;const dDay=Math.trunc(dayAcc);dayAcc-=dDay;if(dMin!==0){simMin+=dMin;while(simMin<0){simMin+=1440;simDay--}while(simMin>=1440){simMin-=1440;simDay++}}if(dDay!==0){simDay+=dDay;}simMin=Math.round(simMin);simDay=Math.round(simDay);if(!isFinite(simMin))simMin=720;if(!isFinite(simDay))simDay=1;while(simDay<1){simYear--;simDay+=daysInYear(simYear)}while(simDay>daysInYear(simYear)){simDay-=daysInYear(simYear);simYear++}const dsl=document.getElementById("dayslider");if(dsl)dsl.value=simDay;const tsl=document.getElementById("sTime");if(tsl)tsl.value=simMin;if(typeof updateTimezone==="function")updateTimezone();if(typeof updLabels==="function")updLabels();interacting=8;}mx0=e.clientX;my0=e.clientY;__requestPlanetariumFrame();return;}panX+=dx*W/cv.getBoundingClientRect().width;panY+=dy*W/cv.getBoundingClientRect().height;mx0=e.clientX;my0=e.clientY;interacting=8;__requestPlanetariumFrame()});window.addEventListener("mouseup",e=>{if(e.button!==0)return;if(mDown&&!mMoved){if(document.body.classList.contains("fullscreen")){exitFull()}else{const{x:x,y:y}=canvasXY(e.clientX,e.clientY);const o=findObject(x,y);if(zoomedObj){resetView()}else if(o&&(o.type==="planet"||o.type==="moon")){zoomToObject(o);showInfo(o,e.clientX,e.clientY)}else if(o)showInfo(o,e.clientX,e.clientY);else hideInfo()}}mDown=false});cv.addEventListener("contextmenu",e=>e.preventDefault());let rDown=false,rMoved=false,rx0=0,ry0=0,rMode=null,rDayAcc=0,rMinAcc=0;cv.addEventListener("mousedown",e=>{if(e.button!==2||orientMode)return;e.preventDefault();rDown=true;rMoved=false;rMode=null;rx0=e.clientX;ry0=e.clientY;rDayAcc=0;rMinAcc=0});window.addEventListener("mousemove",e=>{if(!rDown)return;e.preventDefault();const dx=e.clientX-rx0,dy=e.clientY-ry0;if(rMode===null){if(Math.abs(dx)>14&&Math.abs(dx)>=Math.abs(dy)){rMode="time"}else if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)){rMode="date"}else{return}rMoved=true;setPaused(true);rx0=e.clientX;ry0=e.clientY;return}rMoved=true;if(rMode==="time"){const ddx=e.clientX-rx0;rMinAcc+=ddx*.9;const dMin=Math.trunc(rMinAcc);rMinAcc-=dMin;if(dMin!==0){simMin+=dMin;while(simMin<0){simMin+=1440;simDay--}while(simMin>=1440){simMin-=1440;simDay++}}}else{const ddy=e.clientY-ry0;rDayAcc+=ddy*.06;const dDay=Math.trunc(rDayAcc);rDayAcc-=dDay;if(dDay!==0)simDay+=dDay}simMin=Math.round(simMin);simDay=Math.round(simDay);if(!isFinite(simMin))simMin=720;if(!isFinite(simDay))simDay=1;while(simDay<1){simYear--;simDay+=daysInYear(simYear)}while(simDay>daysInYear(simYear)){simDay-=daysInYear(simYear);simYear++}const dsl=document.getElementById("dayslider");if(dsl)dsl.value=simDay;const tsl=document.getElementById("sTime");if(tsl)tsl.value=simMin;if(typeof updateTimezone==="function")updateTimezone();if(typeof updLabels==="function")updLabels();interacting=8;rx0=e.clientX;ry0=e.clientY});window.addEventListener("mouseup",e=>{if(e.button===2){rDown=false;rMode=null}});let tStart=0,tMoved=false,tx0=0,ty0=0,twoMode=null,dateBaseDay=1,dateBaseYear=2026,dateMidY0=0,lpTimer=null,longPressed=false;function advanceSimMinutes(dmin){simMin+=dmin;while(simMin>=1440){simMin-=1440;simDay++;if(simDay>daysInYear(simYear)){simDay=1;simYear++}}while(simMin<0){simMin+=1440;simDay--;if(simDay<1){simYear--;simDay=daysInYear(simYear)}}}function setDateFromBase(baseYear,baseDay,deltaDays){let y=baseYear,dn=baseDay+deltaDays;while(dn>daysInYear(y)){dn-=daysInYear(y);y++}while(dn<1){y--;dn+=daysInYear(y)}simYear=y;simDay=dn}cv.addEventListener("touchstart",e=>{/* Im Lagemodus richtet sich die Blickrichtung allein nach der Lage des Geraets.
     Einzig die Zwei-Finger-Geste ist zugelassen, und zwar nur zum Vergroessern;
     Schieben, Antippen und langes Druecken bleiben ohne Wirkung. */if(orientMode){[...e.changedTouches].forEach(t=>{tch[t.identifier]={x:t.clientX,y:t.clientY}});const _ids=Object.keys(tch);if(_ids.length===2){twoMode="zoom";const a=tch[_ids[0]],b=tch[_ids[1]];pD0=Math.hypot(b.x-a.x,b.y-a.y);pFov0=camFov;}return}const _tsWasEmpty=Object.keys(tch).length===0;[...e.changedTouches].forEach(t=>{tch[t.identifier]={x:t.clientX,y:t.clientY}});if(_tsWasEmpty){const _tf=e.changedTouches[0];gestureInHorizon=insideHorizon(_tf.clientX,_tf.clientY)}const ids=Object.keys(tch);if(ids.length===1){tStart=Date.now();tMoved=false;tx0=tch[ids[0]].x;ty0=tch[ids[0]].y;longPressed=false;clearTimeout(lpTimer);lpTimer=setTimeout(()=>{if(tMoved||Object.keys(tch).length!==1)return;longPressed=true;const{x:x,y:y}=canvasXY(tx0,ty0);const o=findObject(x,y);if(o)showInfo(o,tx0,ty0);else hideInfo();try{if(navigator.vibrate)navigator.vibrate(15)}catch(e){}},420)}else if(ids.length===2){clearTimeout(lpTimer);twoMode=null;const t0=tch[ids[0]],t1=tch[ids[1]];pD0=Math.hypot(t1.x-t0.x,t1.y-t0.y);pZ0=zoom;pFov0=camFov;const rect=cv.getBoundingClientRect();const scX=(cvW||W)/rect.width,scY=(cvH||W)/rect.height;pMid0X=((t0.x+t1.x)/2-rect.left)*scX;pMid0Y=((t0.y+t1.y)/2-rect.top)*scY;pPan0X=panX;pPan0Y=panY}},{passive:false});cv.addEventListener("touchmove",e=>{if(orientMode){[...e.changedTouches].forEach(t=>{if(tch[t.identifier])tch[t.identifier]={x:t.clientX,y:t.clientY}});const _ids=Object.keys(tch);if(_ids.length<2||twoMode!=="zoom"||!pD0)return;e.preventDefault();const a=tch[_ids[0]],b=tch[_ids[1]];const d=Math.hypot(b.x-a.x,b.y-a.y);if(d<1)return;/* Begrenzt auf einen sinnvollen Bereich: enger als 30 Grad waere fuer eine Lageansicht
     unbrauchbar, weiter als 100 Grad verzerrt die Raender zu stark. */camFov=Math.max(30,Math.min(100,pFov0*pD0/d));interacting=8;if(W)draw();return}if(!gestureInHorizon)return;const _n=Object.keys(tch).length;if(_n<2&&zoom<=1&&viewMode!=="real"){const _t=e.touches&&e.touches[0];if(_t&&Math.abs(_t.clientX-tx0)+Math.abs(_t.clientY-ty0)>6){tMoved=true;clearTimeout(lpTimer)}return}
/* Auf Wunsch: ein schnelles Wischen soll auch innerhalb des Himmelsausschnitts (und im
   Lagemodus) zum Scrollen fuehren koennen - erst bei etwas laengerem Kontakt werden
   Verschieben/Drehen des Himmels ausgefuehrt. Solange die Beruehrung juenger als rund
   500 Millisekunden ist, wird noch nicht per preventDefault eingegriffen; der Browser
   kann die Beruehrung dann selbst als vertikales Scrollen (touch-action:pan-y) uebernehmen,
   genau wie es ausserhalb des Himmelsausschnitts ohnehin schon geschieht. Haelt der Finger
   laenger, greift ab hier wie gehabt die Himmelsgeste - Tipp- und Lang-Druck-Erkennung
   bleiben unberuehrt, da tMoved/lpTimer identisch zur bestehenden Weiche oben gepflegt
   werden. Betrifft nur einzelne Finger; Zwei-Finger-Gesten (Kneifzoom, Zeit/Datum-Wischen)
   sind bereits eindeutig und bleiben unveraendert sofort aktiv. */
if(_n<2&&Date.now()-tStart<500){const _t=e.touches&&e.touches[0];if(_t&&Math.abs(_t.clientX-tx0)+Math.abs(_t.clientY-ty0)>6){tMoved=true;clearTimeout(lpTimer)}return}
e.preventDefault();const prev={};Object.keys(tch).forEach(k=>prev[k]={...tch[k]});[...e.changedTouches].forEach(t=>{tch[t.identifier]={x:t.clientX,y:t.clientY}});const ids=Object.keys(tch);const rect=cv.getBoundingClientRect();const scX=(cvW||W)/rect.width,scY=(cvH||W)/rect.height;if(ids.length===1){const id=ids[0];if(prev[id]){const dx=(tch[id].x-prev[id].x)*scX,dy=(tch[id].y-prev[id].y)*scY;if(viewMode==="real"){if(Math.abs(tch[id].x-tx0)+Math.abs(tch[id].y-ty0)>6){tMoved=true;clearTimeout(lpTimer);if(orientMode)disableOrient();}const kv=360/(Math.PI*((Math.min(cvW||W,cvH||W))/2/Math.tan(camFov*Math.PI/720)));camAz=((camAz+dx*kv)%360+360)%360;camAlt=Math.max(-25,Math.min(85,camAlt+dy*kv));interacting=8;}else{if(Math.abs(tch[id].x-tx0)+Math.abs(tch[id].y-ty0)>6){tMoved=true;zoomedObj=null;clearTimeout(lpTimer);if(orientMode)disableOrient()}if(!orientMode){panX+=dx;panY+=dy}}}}else if(ids.length>=2){tMoved=true;zoomedObj=null;clearTimeout(lpTimer);const t0=tch[ids[0]],t1=tch[ids[1]];const d=Math.hypot(t1.x-t0.x,t1.y-t0.y);const midX=((t0.x+t1.x)/2-rect.left)*scX,midY=((t0.y+t1.y)/2-rect.top)*scY;let pmidX=midX;if(prev[ids[0]]&&prev[ids[1]])pmidX=((prev[ids[0]].x+prev[ids[1]].x)/2-rect.left)*scX;if(twoMode===null){const dDist=Math.abs(d-pD0),dMidX=Math.abs(midX-pMid0X),dMidY=Math.abs(midY-pMid0Y);if(dDist>14&&dDist>=dMidX&&dDist>=dMidY){twoMode="zoom"}else if(dMidX>16&&dMidX>=dMidY*1.1){twoMode="time";sliderActive=true}else if(dMidY>16){twoMode="date";sliderActive=true;dateBaseDay=simDay;dateBaseYear=simYear;dateMidY0=midY}}if(twoMode==="time"){const minPerPx=720/(cvW||W);advanceSimMinutes(-(midX-pmidX)*minPerPx);const st=document.getElementById("sTime");if(st)st.value=Math.round(simMin);const ds=document.getElementById("dayslider");if(ds)ds.value=simDay;updLabels()}else if(twoMode==="date"){const daysPerPx=30/(cvH||W);setDateFromBase(dateBaseYear,dateBaseDay,Math.round(-(midY-dateMidY0)*daysPerPx));const ds=document.getElementById("dayslider");if(ds)ds.value=simDay;const ys=document.getElementById("yearslider");if(ys)ys.value=simYear;updLabels()}else{if(viewMode==="real"){camFov=Math.max(orientMode?30:.325,Math.min(100,pFov0*pD0/Math.max(1,d)));interacting=8;return;}const nz=Math.max(1,Math.min(orientMode?1:6000,pZ0*d/pD0));const worldX=(pMid0X-ORX-pPan0X)/pZ0,worldY=(pMid0Y-ORY-pPan0Y)/pZ0;zoom=nz;if(orientMode)deviceZoom=nz;panX=midX-ORX-worldX*nz;panY=midY-ORY-worldY*nz;if(zoom<=1){panX=0;panY=0}}}interacting=8},{passive:false});cv.addEventListener("touchend",e=>{if(orientMode){[...e.changedTouches].forEach(t=>{delete tch[t.identifier]});if(Object.keys(tch).length<2)twoMode=null;return}const wasOne=Object.keys(tch).length===1;[...e.changedTouches].forEach(t=>{delete tch[t.identifier]});clearTimeout(lpTimer);if(!gestureInHorizon){if(Object.keys(tch).length<2){if(twoMode==="time"||twoMode==="date")sliderActive=false;twoMode=null}if(Object.keys(tch).length===0)gestureInHorizon=true;return}if(Object.keys(tch).length<2){if(twoMode==="time"||twoMode==="date")sliderActive=false;twoMode=null}if(wasOne&&!tMoved&&!longPressed&&Date.now()-tStart<400){e.preventDefault();const now=Date.now();if(now-lastTapT<350){clearTimeout(exitFullTimer);toggleImmersive();lastTapT=0}else{lastTapT=now;if(document.body.classList.contains("fullscreen")){clearTimeout(exitFullTimer);exitFullTimer=setTimeout(exitFull,330)}else{const{x:x,y:y}=canvasXY(tx0,ty0);const o=findObject(x,y);if(zoomedObj){resetView()}else if(o&&(o.type==="planet"||o.type==="moon")){zoomToObject(o);showInfo(o,tx0,ty0)}else if(o)showInfo(o,tx0,ty0);else hideInfo()}}}},{passive:false});let lastTapT=0,exitFullTimer=null;cv.addEventListener("dblclick",e=>{e.preventDefault();if(orientMode)return;toggleImmersive()});function enterFullscreen(){hideInfo&&hideInfo();document.body.classList.add("fullscreen");requestAnimationFrame(()=>{if(typeof resize==="function")resize();if(W)draw()})}function exitFullscreen(){document.body.classList.remove("fullscreen");requestAnimationFrame(()=>{if(typeof resize==="function")resize();if(W)draw()})}function exitFull(){if(!document.body.classList.contains("fullscreen"))return;exitFullscreen();if(cleanSaved!==null)toggleClean();if(zoomedObj){zoom=1;panX=0;panY=0;zoomedObj=null;if(typeof updateTouchMode==="function")updateTouchMode();if(W)draw()}const b=document.getElementById("bfull");if(b)b.classList.remove("on");try{(document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document)}catch(e){}}function toggleFull(){if(document.body.classList.contains("fullscreen")){exitFull();return}enterFullscreen();const b=document.getElementById("bfull");if(b)b.classList.add("on");try{const el=document.documentElement;(el.requestFullscreen||el.webkitRequestFullscreen||el.webkitRequestFullScreen||function(){}).call(el)}catch(e){}}window.addEventListener("pointerup",()=>{sliderActive=false});window.addEventListener("pointercancel",()=>{sliderActive=false});const wm=document.getElementById("worldmap"),wmg=wm.getContext("2d");function drawWorldMap(){const w=wm.width=640,h=wm.height=320;wmg.fillStyle="#0a1428";wmg.fillRect(0,0,w,h);wmg.strokeStyle="rgba(120,150,200,.15)";wmg.lineWidth=1;for(let lo=-180;lo<=180;lo+=30){const x=(lo+180)/360*w;wmg.beginPath();wmg.moveTo(x,0);wmg.lineTo(x,h);wmg.stroke()}for(let la=-90;la<=90;la+=30){const y=(90-la)/180*h;wmg.beginPath();wmg.moveTo(0,y);wmg.lineTo(w,y);wmg.stroke()}wmg.strokeStyle="rgba(201,168,76,.3)";wmg.beginPath();wmg.moveTo(0,h/2);wmg.lineTo(w,h/2);wmg.stroke();wmg.fillStyle="rgba(80,130,90,.55)";const land=[[-100,40,60,30],[-75,-15,35,45],[10,50,45,25],[20,5,40,35],[25,-25,30,25],[80,30,60,30],[100,-25,35,20],[135,-25,20,18],[-150,65,80,15],[60,60,120,20]];land.forEach(([lo,la,bw,bh])=>{const x=(lo+180)/360*w,y=(90-la)/180*h;wmg.fillRect(x-bw/360*w/2,y-bh/180*h/2,bw/360*w,bh/180*h)});const px=(lng+180)/360*w,py=(90-lat)/180*h;wmg.fillStyle="#ffe066";wmg.strokeStyle="#fff";wmg.lineWidth=2;wmg.beginPath();wmg.arc(px,py,7,0,Math.PI*2);wmg.fill();wmg.stroke();wmg.font="12px Cinzel,serif";wmg.fillStyle="#ffe066";wmg.textAlign="center";wmg.fillText("📍",px,py-12)}function openMap(){document.getElementById("map-modal").classList.add("show");drawWorldMap();document.getElementById("loc-panel").classList.remove("open")}function closeMap(){document.getElementById("map-modal").classList.remove("show")}wm.addEventListener("click",e=>{const rect=wm.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width;const y=(e.clientY-rect.top)/rect.height;lng=x*360-180;lat=90-y*180;lat=Math.max(-85,Math.min(85,lat));selCity=null;document.querySelectorAll(".cbtn").forEach(b=>b.classList.remove("sel"));document.getElementById("i-lat").value=lat.toFixed(2);document.getElementById("i-lng").value=lng.toFixed(2);document.getElementById("sLat").value=Math.max(-90,Math.min(90,Math.round(lat)));updateLocDisp(null,lat,lng);updateTimezone();updLabels();drawWorldMap()});/* Ein Antippen im Bedienfeld soll nur wirken, wenn die Liste gerade still steht - nicht waehrend das Feld selbst gescrollt wird und der Finger zufaellig auf einer Schaltflaeche landet. Erfasst wird jedes Scrollereignis von panel-body; waehrend einer laufenden oder gerade beendeten Bewegung wird ein Klick im Bedienfeld auf der Erfassungsphase abgefangen, bevor er die Schaltflaeche und ihr onclick erreicht. scrollend wird genutzt, wo vorhanden, sonst greift eine kurze Wartezeit nach dem letzten scroll-Ereignis als Ersatz. */(function initPanelScrollGate(){const pb=document.getElementById("panel-body");if(!pb)return;let panelScrolling=false,panelScrollT=null;const markBusy=()=>{panelScrolling=true;clearTimeout(panelScrollT);panelScrollT=setTimeout(()=>{panelScrolling=false},150)};pb.addEventListener("scroll",markBusy,{passive:true});pb.addEventListener("scrollend",()=>{clearTimeout(panelScrollT);panelScrolling=false});pb.addEventListener("click",e=>{if(panelScrolling){e.preventDefault();e.stopPropagation()}},true);
  /* Zweimal nachgebessert: Pointer Events (erster und zweiter Versuch) kamen fuer den
     nativen Sprung auf die Beruehrungsstelle offenbar zu spaet - vermutlich verarbeitet
     der Browser die Touch-Beruehrung eines <input type=range> schon auf Ebene des
     zugrundeliegenden touchstart, bevor das daraus abgeleitete pointerdown ueberhaupt bei
     unserem Beobachter ankommt. Jetzt auf echte Touch-Events umgestellt - dasselbe Muster,
     das im Himmelsausschnitt fuer genau dieses Problem bereits nachweislich funktioniert
     (cv.addEventListener("touchstart"/"touchmove"/"touchend",...,{passive:false})). Der
     Touch-Listener sitzt in der Erfassungsphase auf panel-body und damit vor jedem
     moeglichen internen Listener des Reglers selbst; {passive:false} ist zwingend, sonst
     verweigert der Browser preventDefault() auf einem touchstart stillschweigend. */
  const _sliderRevertFn={
    yearslider:()=>{if(typeof onYearSlider==="function")onYearSlider()},
    dayslider:()=>{if(typeof onDaySlider==="function")onDaySlider()},
    sTime:()=>{if(typeof onSl==="function")onSl()},
    sLat:()=>{if(typeof onLat==="function")onLat()},
    sLng:()=>{if(typeof onSlLng==="function")onSlLng()},
    sFont:()=>{if(typeof setFontScale==="function")setFontScale(document.getElementById("sFont").value)}
  };
  function applySliderFromX(el,clientX){
    const rect=el.getBoundingClientRect();
    const min=parseFloat(el.min)||0,max=parseFloat(el.max)||100,step=parseFloat(el.step)||1;
    let frac=rect.width>0?(clientX-rect.left)/rect.width:0;
    frac=Math.max(0,Math.min(1,frac));
    let val=min+frac*(max-min);
    val=Math.round(val/step)*step;
    val=Math.max(min,Math.min(max,val));
    el.value=val;
  }
  let pendingSlider=null;
  pb.addEventListener("touchstart",e=>{
    const t=e.target;
    if(!(t&&t.tagName==="INPUT"&&t.type==="range"))return;
    e.preventDefault();
    if(panelScrolling){return}
    const tt=e.touches[0];
    pendingSlider={el:t,val:t.value,x:tt.clientX,y:tt.clientY,decided:false,mode:null};
  },{passive:false,capture:true});
  pb.addEventListener("touchmove",e=>{
    if(!pendingSlider)return;
    const t=pendingSlider.el;
    const tt=[...e.changedTouches].find(x=>true)||e.touches[0];
    if(!tt)return;
    if(!pendingSlider.decided){
      const dx=tt.clientX-pendingSlider.x,dy=tt.clientY-pendingSlider.y;
      if(Math.abs(dx)+Math.abs(dy)<8)return;
      pendingSlider.decided=true;
      pendingSlider.mode=(Math.abs(dy)>Math.abs(dx)*1.2)?"scroll":"slider";
      if(pendingSlider.mode==="scroll"){
        panelScrolling=true;clearTimeout(panelScrollT);panelScrollT=setTimeout(()=>{panelScrolling=false},150);
      }
    }
    if(pendingSlider.mode==="slider"){
      e.preventDefault();
      applySliderFromX(t,tt.clientX);
      const revert=_sliderRevertFn[t.id];
      if(revert)revert();
    }
  },{passive:false,capture:true});
  pb.addEventListener("touchend",e=>{
    if(pendingSlider&&!pendingSlider.decided){
      const tt=e.changedTouches[0];
      if(tt){
        applySliderFromX(pendingSlider.el,tt.clientX);
        const revert=_sliderRevertFn[pendingSlider.el.id];
        if(revert)revert();
      }
    }
    pendingSlider=null;
  },{capture:true});
  pb.addEventListener("touchcancel",()=>{pendingSlider=null},{capture:true});
})();initCityGrid();autoDetectDST();selectCity(0);setSpeedValue(1);setNow();lastT=null;__requestPlanetariumFrame();
(function autoStartOrient(){
  const cover=document.getElementById("sensor-start"),status=document.getElementById("sensor-start-status"),button=document.getElementById("sensor-start-button");
  let finished=false,timer=null;
  function finish(event){
    if(finished)return;
    finished=true;clearTimeout(timer);
    window.removeEventListener("deviceorientationabsolute",sample,true);
    window.removeEventListener("deviceorientation",sample,true);
    viewMode="real";zoom=1;panX=0;panY=0;zoomedObj=null;
    if(event){
      window.__orientAutoStart=true;enableOrient();onDeviceOrient(event);
      oAz=oAzT;oAlt=oAltT;applyOrientView();
    }else{
      if(orientMode)disableOrient();
      setRealHome();
    }
    syncViewModeButtons();updateTouchMode();
    function reveal(){
      if(__atomicSkyUntil>performance.now()){setTimeout(reveal,50);return}
      if(W)draw();
      __requestPlanetariumFrame();
      requestAnimationFrame(()=>{
        document.documentElement.classList.remove("sensor-starting");
        if(cover)cover.remove();
      });
    }
    setTimeout(reveal,0);
  }
  function sample(event){
    if(Number.isFinite(event.beta)&&Number.isFinite(event.gamma)&&orientDirFromEvent(event))finish(event);
  }
  function probe(){
    if(status)status.textContent="Lagesensor wird geprüft …";
    if(button)button.hidden=true;
    window.addEventListener("deviceorientationabsolute",sample,true);
    window.addEventListener("deviceorientation",sample,true);
    // Schnellstart: gültige Daten sofort übernehmen, höchstens 500 ms warten.
    timer=setTimeout(()=>finish(null),500);
  }
  const api=window.DeviceOrientationEvent;
  if(!api){finish(null);return}
  /* iOS erlaubt die Sensorfreigabe nur nach einer bewussten Benutzergeste.
     Beim Programmstart erscheint deshalb keine vorgeschaltete Nachfrage mehr:
     Die App startet direkt im Beobachtermodus. Wer den Lagemodus antippt, kann
     die systemeigene Freigabe dort weiterhin gezielt erteilen. */
  if(typeof api.requestPermission==="function")finish(null);else probe();
})();(function initLocationByTimezone(){try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";const tzCity={"Europe/Berlin":"Berlin","Europe/Vienna":"Wien","Europe/Zurich":"Zürich","Europe/Paris":"Paris","Europe/London":"London","Europe/Madrid":"Madrid","Europe/Rome":"Rom","Europe/Amsterdam":"Amsterdam","Europe/Brussels":"Brüssel","Europe/Prague":"Prag","Europe/Warsaw":"Warschau","Europe/Budapest":"Budapest","Europe/Stockholm":"Stockholm","Europe/Oslo":"Oslo","Europe/Copenhagen":"Kopenhagen","Europe/Helsinki":"Helsinki","Europe/Athens":"Athen","Europe/Lisbon":"Lissabon","Europe/Dublin":"Dublin","Europe/Moscow":"Moskau","Europe/Istanbul":"Istanbul","Europe/Kiev":"Kiew","Europe/Bucharest":"Bukarest","Europe/Sofia":"Sofia","America/New_York":"New York","America/Chicago":"Chicago","America/Denver":"Chicago","America/Los_Angeles":"Los Angeles","America/Toronto":"Toronto","America/Mexico_City":"Mexiko-Stadt","America/Sao_Paulo":"Rio de Janeiro","America/Buenos_Aires":"Buenos Aires","America/Argentina/Buenos_Aires":"Buenos Aires","Asia/Tokyo":"Tokio","Asia/Shanghai":"Peking","Asia/Hong_Kong":"Hongkong","Asia/Singapore":"Singapur","Asia/Kolkata":"Mumbai","Asia/Dubai":"Dubai","Asia/Bangkok":"Bangkok","Asia/Seoul":"Seoul","Australia/Sydney":"Sydney","Australia/Melbourne":"Melbourne","Pacific/Auckland":"Auckland","Africa/Cairo":"Kairo","Africa/Johannesburg":"Kapstadt","Africa/Lagos":"Lagos"};const cityName=tzCity[tz];if(cityName){const idx=CITIES.findIndex(c=>c.n===cityName);if(idx>=0){selectCity(idx)}}}catch(e){}})();function initLocationByGPS(){const quiet=()=>{};const ipFallback=()=>getLocationByIP(quiet);if(navigator.geolocation){try{navigator.geolocation.getCurrentPosition(pos=>applyGPSResult(pos.coords.latitude,pos.coords.longitude,null),()=>ipFallback(),{timeout:6e3,enableHighAccuracy:false,maximumAge:6e5})}catch(e){ipFallback()}}else{ipFallback()}}if("requestIdleCallback"in window)requestIdleCallback(initLocationByGPS,{timeout:2500});else setTimeout(initLocationByGPS,1200);(function(){const wrap=document.getElementById("wrap");const handle=document.getElementById("panel-handle");if(!wrap||!handle)return;return;let dragging=false,startY=0,startOff=0,off=0;const clamp=v=>{const maxDown=Math.min(window.innerHeight*.5,wrap.offsetHeight*.7);return Math.max(0,Math.min(maxDown,v))};const apply=()=>{wrap.style.transform=`translateY(${off}px)`};const onDown=e=>{dragging=true;startY=e.touches?e.touches[0].clientY:e.clientY;startOff=off;e.pointerId!=null&&handle.setPointerCapture&&handle.setPointerCapture(e.pointerId);e.preventDefault()};const onMove=e=>{if(!dragging)return;const y=e.touches?e.touches[0].clientY:e.clientY;off=clamp(startOff+(y-startY));apply();e.preventDefault()};const onUp=()=>{dragging=false};handle.addEventListener("pointerdown",onDown);window.addEventListener("pointermove",onMove,{passive:false});window.addEventListener("pointerup",onUp);handle.addEventListener("touchstart",onDown,{passive:false});window.addEventListener("touchmove",onMove,{passive:false});window.addEventListener("touchend",onUp);window.addEventListener("resize",()=>{off=clamp(off);apply()})})();(function bottomSheet(){return;const zone=document.getElementById("sheet-drag"),grab=document.getElementById("sheet-grabber");if(!zone)return;const T1=55,T2=235;let cand=false,active=false,startY=0,pid=null,gP=false,gL=false;const setPanel=open=>{const p=document.getElementById("panel");if(!p)return;const hidden=p.classList.contains("hidden");if(open&&hidden){p.classList.remove("hidden");gP=true}else if(!open&&!hidden&&gP){p.classList.add("hidden");gP=false}};const setLegend=open=>{const w=document.getElementById("legend");if(!w)return;const vis=w.style.display==="block";const b=document.getElementById("blegend");if(open&&!vis){w.style.display="block";if(b)b.classList.add("on");gL=true}else if(!open&&vis&&gL){w.style.display="none";if(b)b.classList.remove("on");gL=false}};const pt=e=>e.touches?e.touches[0].clientY:e.clientY;const multi=e=>e.touches&&e.touches.length>1;const down=e=>{if(multi(e))return;cand=true;active=false;startY=pt(e);pid=e.pointerId};const move=e=>{if(!cand)return;if(multi(e)){cand=false;active=false;if(grab)grab.style.background="rgba(201,168,76,.45)";return}const dy=startY-pt(e);if(!active){if(Math.abs(dy)>8)active=true;else return}if(e.cancelable)e.preventDefault();const up=Math.max(0,dy);setPanel(up>T1);setLegend(up>T2);if(grab)grab.style.background=up>T1?"rgba(232,208,138,.9)":"rgba(201,168,76,.45)";const wrap=document.getElementById("wrap");if(wrap)wrap.style.transform=`translateY(${-Math.min(26,up*.14)}px)`};const end=()=>{cand=false;active=false;const wrap=document.getElementById("wrap");if(wrap)wrap.style.transform="";if(grab)grab.style.background="rgba(201,168,76,.45)"};zone.addEventListener("pointerdown",down);window.addEventListener("pointermove",move,{passive:false});window.addEventListener("pointerup",end);window.addEventListener("pointercancel",end);zone.addEventListener("touchstart",down,{passive:true});window.addEventListener("touchmove",move,{passive:false});window.addEventListener("touchend",end)})();(function loadBSC(){const url="https://brettonw.github.io/YaleBrightStarCatalog/bsc5.json";fetch(url).then(r=>r.ok?r.json():Promise.reject()).then(data=>{const out=[];for(const s of data){const ra=s.RA,dec=s.Dec,vm=parseFloat(s.Vmag);if(!ra||!dec||isNaN(vm))continue;if(vm<4)continue;const rm=ra.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);const dm=dec.match(/([+-]?)(\d+)°\s*(\d+)[′']\s*([\d.]+)/);if(!rm||!dm)continue;const raH=+rm[1]+ +rm[2]/60+ +rm[3]/3600;const sign=dm[1]==="-"?-1:1;const deD=sign*(+dm[2]+ +dm[3]/60+ +dm[4]/3600);out.push({ra:raH,de:deD,mag:vm})}if(out.length>500){BSC=BSC.concat(out);BSC.sort((a,b)=>a.mag-b.mag);buildStarGrid();bscPrecYear=null;if(W)draw()}}).catch(()=>{})})();let rocketActive=false,rocketTimer=null,audioCtx=null,rocketPrevSpeed=136;let musicOn=false;function getAudio(){if(!audioCtx){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)}catch(e){audioCtx=null}}if(audioCtx&&audioCtx.state==="suspended")audioCtx.resume();return audioCtx}function beep(freq,dur,type,vol,when){const ac=getAudio();if(!ac)return;const t0=when||ac.currentTime;const o=ac.createOscillator(),g=ac.createGain();o.type=type||"sine";o.frequency.value=freq;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||.3,t0+.02);g.gain.exponentialRampToValueAtTime(1e-4,t0+dur);o.connect(g);g.connect(ac.destination);o.start(t0);o.stop(t0+dur+.05)}function rumble(dur){const ac=getAudio();if(!ac)return;const n=ac.sampleRate*dur,buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++){d[i]=(Math.random()*2-1)*Math.pow(1-i/n,.4)}const src=ac.createBufferSource();src.buffer=buf;const lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.value=180;const g=ac.createGain();g.gain.value=.5;src.connect(lp);lp.connect(g);g.connect(ac.destination);src.start()}let thrustNodes=null;function rocketThrustSound(dur,stage){stage=stage||1;const ac=getAudio();if(!ac)return;stopThrustSound();const t0=ac.currentTime;const len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const lp=ac.createBiquadFilter();lp.type="lowpass";lp.Q.value=.7;const lp2=ac.createBiquadFilter();lp2.type="bandpass";lp2.Q.value=.6;const g=ac.createGain();let peak,plateau,subF,subPeak,subPlat,lpF,bpF;if(stage===1){peak=.95;plateau=.58;subF=36;subPeak=.36;subPlat=.2;lpF=150;bpF=90}else{peak=.82;plateau=.46;subF=58;subPeak=.22;subPlat=.12;lpF=240;bpF=180}lp.frequency.value=lpF;lp2.frequency.value=bpF;g.gain.setValueAtTime(1e-4,t0);g.gain.exponentialRampToValueAtTime(peak,t0+.5);g.gain.exponentialRampToValueAtTime(plateau,t0+2.5);g.gain.setValueAtTime(plateau,t0+Math.max(2.6,dur-2));g.gain.exponentialRampToValueAtTime(1e-4,t0+dur);const sub=ac.createOscillator();sub.type="sine";sub.frequency.value=subF;const subG=ac.createGain();subG.gain.setValueAtTime(1e-4,t0);subG.gain.exponentialRampToValueAtTime(subPeak,t0+.5);subG.gain.exponentialRampToValueAtTime(subPlat,t0+2.5);subG.gain.setValueAtTime(subPlat,t0+Math.max(2.6,dur-2));subG.gain.exponentialRampToValueAtTime(1e-4,t0+dur);src.connect(lp);lp.connect(g);src.connect(lp2);lp2.connect(g);g.connect(ac.destination);sub.connect(subG);subG.connect(ac.destination);src.start(t0);sub.start(t0);src.stop(t0+dur+.1);sub.stop(t0+dur+.1);thrustNodes={src:src,sub:sub}}function stageSep(){const ac=getAudio();if(!ac)return;const t=ac.currentTime;const o=ac.createOscillator(),g=ac.createGain();o.type="triangle";o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.18);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(1e-4,t+.32);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.34);const n=Math.floor(ac.sampleRate*.26),b=ac.createBuffer(1,n,ac.sampleRate),dd=b.getChannelData(0);for(let i=0;i<n;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.2);const s=ac.createBufferSource();s.buffer=b;const hp=ac.createBiquadFilter();hp.type="highpass";hp.frequency.value=600;const sg=ac.createGain();sg.gain.value=.4;s.connect(hp);hp.connect(sg);sg.connect(ac.destination);s.start(t);s.stop(t+.3)}function stageIgnite(){const ac=getAudio();if(!ac)return;const t=ac.currentTime;const o=ac.createOscillator(),g=ac.createGain();o.type="sawtooth";o.frequency.setValueAtTime(55,t);o.frequency.exponentialRampToValueAtTime(230,t+.5);const lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(300,t);lp.frequency.exponentialRampToValueAtTime(1300,t+.5);g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(.45,t+.15);g.gain.exponentialRampToValueAtTime(1e-4,t+.75);o.connect(lp);lp.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.8);rumble(1)}function stopThrustSound(){if(thrustNodes){try{thrustNodes.src.stop();thrustNodes.sub.stop()}catch(e){}thrustNodes=null}}let commsNode=null;function commsHiss(on){const ac=getAudio();if(!ac)return;if(!on){if(commsNode){try{commsNode.src.stop()}catch(e){}commsNode=null}return}if(commsNode)return;const len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const bp=ac.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1500;bp.Q.value=.6;const hp=ac.createBiquadFilter();hp.type="highpass";hp.frequency.value=520;const g=ac.createGain();g.gain.value=.03;src.connect(bp);bp.connect(hp);hp.connect(g);g.connect(ac.destination);src.start();commsNode={src:src,g:g}}function commsBlip(){const ac=getAudio();if(!ac)return;const t=ac.currentTime;const len=Math.floor(ac.sampleRate*.08),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=buf;const bp=ac.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1900;bp.Q.value=.8;const g=ac.createGain();g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(1e-4,t+.08);src.connect(bp);bp.connect(g);g.connect(ac.destination);src.start(t);src.stop(t+.09)}function meco(){const ac=getAudio();if(!ac)return;const t=ac.currentTime;const len=Math.floor(ac.sampleRate*1.6),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=buf;const lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.setValueAtTime(300,t);lp.frequency.exponentialRampToValueAtTime(42,t+1.1);const g=ac.createGain();g.gain.setValueAtTime(.6,t);g.gain.exponentialRampToValueAtTime(1e-4,t+1.35);src.connect(lp);lp.connect(g);g.connect(ac.destination);src.start(t);src.stop(t+1.5);const o=ac.createOscillator(),og=ac.createGain();o.type="sine";o.frequency.setValueAtTime(74,t);o.frequency.exponentialRampToValueAtTime(26,t+.55);og.gain.setValueAtTime(.42,t);og.gain.exponentialRampToValueAtTime(1e-4,t+.65);o.connect(og);og.connect(ac.destination);o.start(t);o.stop(t+.75)}function countBeep(high){const ac=getAudio();if(!ac)return;const t=ac.currentTime;const f=high?1200:760;beep(f,.18,"square",.22,t);beep(f*2,.12,"sine",.1,t);beep(f,.22,"sine",.06,t+.04)}function spaceFanfare(){const ac=getAudio();if(!ac)return;stopThrustSound();const t=ac.currentTime+.1;const seq=[[392,0,.5],[523,.45,.5],[659,.9,.6],[784,1.5,1.1],[659,2.5,.5],[784,2.9,.5],[1047,3.3,1.6]];seq.forEach(([f,off,dur])=>{beep(f,dur,"triangle",.22,t+off);beep(f/2,dur,"sine",.12,t+off)});beep(196,4.8,"sine",.1,t);beep(294,4.8,"sine",.08,t)}let melodyNodes=[];function trautoniumNote(freq,t0,dur,vol,glideFrom){const ac=getAudio();if(!ac)return;vol=vol||.2;const out=ac.createGain();const filt=ac.createBiquadFilter();filt.type="lowpass";filt.Q.value=7;filt.frequency.setValueAtTime(Math.min(7e3,freq*6),t0);filt.frequency.exponentialRampToValueAtTime(Math.min(7e3,Math.max(300,freq*2.3)),t0+dur*.9);const partials=[{m:1,type:"sawtooth",g:.5},{m:.5,type:"square",g:.34},{m:1/3,type:"sawtooth",g:.22}];const oscs=[];partials.forEach(p=>{const o=ac.createOscillator();o.type=p.type;const f0=(glideFrom||freq)*p.m,f1=freq*p.m;o.frequency.setValueAtTime(f0,t0);if(glideFrom)o.frequency.exponentialRampToValueAtTime(f1,t0+Math.min(.22,dur*.55));const og=ac.createGain();og.gain.value=p.g;o.connect(og);og.connect(filt);const lfo=ac.createOscillator();lfo.type="sine";lfo.frequency.value=5.3;const lfoG=ac.createGain();lfoG.gain.setValueAtTime(0,t0);lfoG.gain.linearRampToValueAtTime(f1*.011,t0+.25);lfo.connect(lfoG);lfoG.connect(o.frequency);oscs.push(o,lfo)});out.gain.setValueAtTime(1e-4,t0);out.gain.exponentialRampToValueAtTime(vol,t0+.09);out.gain.setValueAtTime(vol,t0+Math.max(.1,dur*.7));out.gain.exponentialRampToValueAtTime(1e-4,t0+dur);filt.connect(out);out.connect(ac.destination);oscs.forEach(n=>{n.start(t0);n.stop(t0+dur+.05)});melodyNodes.push(...oscs)}function stopMelody(){melodyNodes.forEach(n=>{try{n.stop()}catch(e){}});melodyNodes=[]}function brassNote(freq,t0,dur,vol,glideFrom){const ac=getAudio();if(!ac)return;vol=vol||.16;const out=ac.createGain();const filt=ac.createBiquadFilter();filt.type="lowpass";filt.Q.value=2.5;filt.frequency.setValueAtTime(Math.min(9e3,Math.max(300,freq*1.6)),t0);filt.frequency.linearRampToValueAtTime(Math.min(1e4,freq*5),t0+.035);filt.frequency.exponentialRampToValueAtTime(Math.min(9e3,Math.max(350,freq*2.2)),t0+dur*.8);const voices=[{m:1,det:0,g:.5,type:"sawtooth"},{m:1,det:9,g:.42,type:"sawtooth"},{m:1,det:-10,g:.42,type:"sawtooth"},{m:.5,det:0,g:.5,type:"square"}];const oscs=[];voices.forEach(v=>{const o=ac.createOscillator();o.type=v.type;const f0=(glideFrom||freq)*v.m,f1=freq*v.m;o.frequency.setValueAtTime(f0,t0);if(glideFrom)o.frequency.exponentialRampToValueAtTime(f1,t0+Math.min(.18,dur*.5));o.detune.value=v.det;const og=ac.createGain();og.gain.value=v.g;o.connect(og);og.connect(filt);oscs.push(o)});out.gain.setValueAtTime(1e-4,t0);out.gain.exponentialRampToValueAtTime(vol,t0+.022);out.gain.exponentialRampToValueAtTime(vol*.75,t0+Math.min(.18,dur*.4));out.gain.setValueAtTime(vol*.75,t0+Math.max(.2,dur*.75));out.gain.exponentialRampToValueAtTime(1e-4,t0+dur);filt.connect(out);out.connect(ac.destination);oscs.forEach(o=>{o.start(t0);o.stop(t0+dur+.05)});melodyNodes.push(...oscs)}function drumHit(t0,kind,vol){const ac=getAudio();if(!ac)return;vol=vol||.4;if(kind==="kick"){const o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.setValueAtTime(150,t0);o.frequency.exponentialRampToValueAtTime(46,t0+.12);g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(1e-4,t0+.24);o.connect(g);g.connect(ac.destination);o.start(t0);o.stop(t0+.26)}else{const n=Math.floor(ac.sampleRate*.18),buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,1.6);const src=ac.createBufferSource();src.buffer=buf;const hp=ac.createBiquadFilter();hp.type="highpass";hp.frequency.value=1400;const g=ac.createGain();g.gain.value=vol;src.connect(hp);hp.connect(g);g.connect(ac.destination);src.start(t0);src.stop(t0+.2)}}function enterpriseMelody(){const ac=getAudio();if(!ac)return;const t=ac.currentTime+.12;const N={C2:65.41,G2:98,C3:130.81,E3:164.81,G3:196,C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,C6:1046.5};const mel=[["C4",0,.42],["G4",.42,.42],["C5",.84,.85],["D5",1.85,.38],["E5",2.23,.38],["G5",2.61,1.25],["E5",4.1,.36],["C5",4.46,.36],["G4",4.82,.36],["C5",5.18,.36],["F5",5.6,.36],["D5",5.96,.36],["A4",6.32,.36],["D5",6.68,.36],["G5",7.1,.48],["E5",7.58,.48],["C5",8.06,.95],["C5",9.6,.4],["E5",10,.4],["G5",10.4,.55]];mel.forEach(([k,off,d])=>brassNote(N[k],t+off,d,.16));trautoniumNote(N.C6,t+11,2.1,.2,N.G5);brassNote(N.G5,t+13.3,.45,.16);brassNote(N.C6,t+13.8,2.7,.19,N.G5);[N.C4,N.E4,N.G4].forEach(f=>brassNote(f,t+13.8,2.7,.09));let bt=4;for(let i=0;i<13;i++){brassNote(i%2===0?N.C2:N.G2,t+bt,.3,.13);bt+=.36}trautoniumNote(N.C3,t+0,3.8,.1);trautoniumNote(N.C2,t+13.3,3.2,.12);drumHit(t+0,"kick",.55);drumHit(t+2.61,"kick",.5);let dt=4.1;for(let i=0;i<11;i++){drumHit(t+dt,i%2===0?"kick":"snare",i%2===0?.42:.3);dt+=.36}for(let i=0;i<9;i++)drumHit(t+8.9+i*.07,"snare",.1+i*.028);drumHit(t+9.6,"kick",.6);drumHit(t+11,"kick",.55);drumHit(t+13.8,"kick",.65)}let nasaVoice=null;function pickNasaVoice(){try{if(!("speechSynthesis"in window))return;const vs=speechSynthesis.getVoices()||[];nasaVoice=vs.find(v=>/en[-_]US/i.test(v.lang)&&/(google us english|david|mark|guy|eric|aaron|tom|fred|daniel|natural|neural|enhanced|premium|male)/i.test(v.name))||vs.find(v=>/en[-_]GB/i.test(v.lang)&&/(google uk english male|daniel|arthur|natural|male)/i.test(v.name))||vs.find(v=>/^en/i.test(v.lang))||vs.find(v=>/^de/i.test(v.lang))||vs[0]||null}catch(e){nasaVoice=null}}if("speechSynthesis"in window){try{pickNasaVoice();speechSynthesis.onvoiceschanged=pickNasaVoice}catch(e){}}function nasaSpeak(text,rate,pitch){try{if(!("speechSynthesis"in window))return;if(!nasaVoice)pickNasaVoice();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);if(nasaVoice){u.voice=nasaVoice;u.lang=nasaVoice.lang}else{u.lang="en-US"}u.rate=rate==null?.94:rate;u.pitch=pitch==null?.78:pitch;u.volume=1;speechSynthesis.speak(u)}catch(e){}}const NUM_EN={10:"ten",9:"nine",8:"eight",7:"seven",6:"six",5:"five",4:"four",3:"three",2:"two",1:"one",0:"Zero. Lift off!"};const NUM_DE={10:"zehn",9:"neun",8:"acht",7:"sieben",6:"sechs",5:"fünf",4:"vier",3:"drei",2:"zwei",1:"eins",0:"Null. Start!"};function speakCount(n,rate,pitch){if(!nasaVoice)pickNasaVoice();const de=nasaVoice&&/^de/i.test(nasaVoice.lang||"");nasaSpeak((de?NUM_DE:NUM_EN)[n],rate,pitch)}function setRocketUI(count,status,liftoff){const c=document.getElementById("rocket-count"),s=document.getElementById("rocket-status"),ov=document.getElementById("rocket-overlay");if(c)c.textContent=count;if(s)s.textContent=status;if(ov)ov.classList.toggle("liftoff",!!liftoff)}const APOLLO_URL="https://archive.org/download/NasaAudioHighlightReels/Sound-Bite_Apollo-11_Liftoff-Commentary.mp3";const APOLLO_TAIL=13;let apolloMode=true,apolloReady=false,apolloAudio=null,apolloIsCustom=false;function updateApolloBtn(){const b=document.getElementById("bapollo");if(!b)return;b.textContent=apolloReady||!apolloAudio?"🚀 Apollo 11":"🚀 Apollo 11 (lädt…)"}function initApolloAudio(){try{apolloAudio=new Audio;apolloAudio.preload="auto";apolloAudio.addEventListener("loadedmetadata",()=>{apolloReady=true;updateApolloBtn()});apolloAudio.addEventListener("canplaythrough",()=>{apolloReady=true;updateApolloBtn()});apolloAudio.addEventListener("error",()=>{if(!apolloIsCustom){apolloReady=false;updateApolloBtn()}});apolloAudio.src=APOLLO_URL;apolloAudio.load()}catch(e){apolloAudio=null;apolloReady=false}updateApolloBtn()}function toggleApollo(){apolloMode=!apolloMode;if(apolloMode&&!apolloAudio)initApolloAudio();updateApolloBtn()}function loadApolloFile(){const f=document.getElementById("apollo-file");if(f)f.click()}function apolloFilePicked(ev){const f=ev.target.files&&ev.target.files[0];if(!f)return;try{if(!apolloAudio)apolloAudio=new Audio;apolloAudio.src=URL.createObjectURL(f);apolloIsCustom=true;apolloMode=true;apolloReady=false;apolloAudio.addEventListener("loadedmetadata",()=>{apolloReady=true;updateApolloBtn()},{once:true});apolloAudio.load();updateApolloBtn()}catch(e){}}function stopApollo(){try{if(apolloAudio){apolloAudio.pause();apolloAudio.currentTime=0}}catch(e){}}function startRocketLaunch(){if(rocketActive){abortRocketLaunch();return}if(apolloMode&&!apolloAudio){try{initApolloAudio()}catch(e){}}rocketActive=true;getAudio();paused=false;rocketPrevSpeed=speed;speed=1;const ss=document.getElementById("sSpd");if(ss)ss.value=0;const ls=document.getElementById("lSpd");if(ls)ls.textContent="1×";paused=false;const btn=document.getElementById("bapollo");if(btn)btn.classList.add("on");const ov=document.getElementById("rocket-overlay");if(ov)ov.classList.add("active");if(apolloMode&&apolloReady&&apolloAudio){try{apolloAudio.muted=true;const pr=apolloAudio.play();if(pr&&pr.then)pr.then(()=>{apolloAudio.pause();apolloAudio.currentTime=0;apolloAudio.muted=false}).catch(()=>{apolloAudio.muted=false})}catch(e){}}startSynthLaunch()}function playApolloCommentary(){if(!(apolloMode&&apolloReady&&apolloAudio))return false;try{const d=apolloAudio.duration;const at=isFinite(d)&&d>APOLLO_TAIL+1?Math.max(0,d-APOLLO_TAIL):0;apolloAudio.muted=false;apolloAudio.currentTime=at;apolloAudio.play();return true}catch(e){return false}}function beginLiftoff(synthSound){setRocketUI("▲ 0 km","🔥 LIFTOFF! · Aufstieg in den Weltraum",true);const ac=getAudio();if(synthSound&&ac){const t=ac.currentTime;beep(1760,.5,"square",.28,t);const o=ac.createOscillator(),gg=ac.createGain();o.type="sawtooth";o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(420,t+1.2);gg.gain.setValueAtTime(1e-4,t);gg.gain.exponentialRampToValueAtTime(.18,t+.2);gg.gain.exponentialRampToValueAtTime(1e-4,t+1.4);o.connect(gg);gg.connect(ac.destination);o.start(t);o.stop(t+1.5)}rumble(2.5);if(rocketTimer){clearInterval(rocketTimer);rocketTimer=null}rocketAscend()}function startSynthLaunch(){let n=10;commsHiss(true);commsBlip();setRocketUI("T−10","T‑minus 10 Sekunden · Countdown läuft",false);speakCount(10);rocketTimer=setInterval(()=>{n--;if(n>0){let status;if(n===6){status="T−6 · Haupttriebwerk · Zündung"}else if(n===3){status="T−3 · Zündsequenz"}else{status="T−"+n+(n<=2?" · Zündsequenz":" · Countdown läuft")}setRocketUI("T−"+n,status,false);speakCount(n);if(n<=3)countBeep(true)}else if(n===0){commsHiss(false);const hasApollo=playApolloCommentary();if(!hasApollo)speakCount(0);beginLiftoff(!hasApollo)}},1e3)}let apolloOnTime=null;function startApolloLaunch(){const d=apolloAudio.duration;const liftoffAt=isFinite(d)&&d>20?d-APOLLO_TAIL:isFinite(d)&&d>0?Math.max(0,d-2):40;setRocketUI("T−"+Math.ceil(liftoffAt),"APOLLO 11 · Original-Funkspruch · Houston",false);let fired=false;const t0=performance.now();const fire=()=>{if(fired||!rocketActive)return;fired=true;if(rocketTimer){clearInterval(rocketTimer);rocketTimer=null}beginLiftoff(false)};try{apolloAudio.currentTime=0}catch(e){}const pr=apolloAudio.play();if(pr&&pr.catch)pr.catch(()=>{if(!rocketActive||fired)return;if(rocketTimer){clearInterval(rocketTimer);rocketTimer=null}startSynthLaunch()});rocketTimer=setInterval(()=>{if(!rocketActive)return;const cur=apolloAudio.currentTime>.05?apolloAudio.currentTime:(performance.now()-t0)/1e3;const rem=liftoffAt-cur;if(rem<=0){fire()}else{setRocketUI("T−"+Math.ceil(rem),"APOLLO 11 · Original-Funkspruch · Houston",false)}},250);apolloAudio.addEventListener("ended",fire,{once:true})}function rocketAscend(){const startZoom=zoom,targetZoom=10,dur=9e4,t0=performance.now();panX=0;panY=0;const ts1=.3;const tsep=.345;const tb=.62;const vmax=2.4;rocketThrustSound(dur/1e3*ts1+.6,1);let lastThrust=0;let mecoDone=false;let sep1=false,ign2=false;const step=now=>{if(!rocketActive)return;const p=Math.min(1,(now-t0)/dur);if(p>=ts1&&!sep1){sep1=true;stageSep()}if(p>=tsep&&!ign2){ign2=true;stageIgnite();rocketThrustSound(dur/1e3*(tb-tsep)+1,2)}if(p>=tb&&!mecoDone){mecoDone=true;stopThrustSound();meco();if(musicOn)enterpriseMelody()}let h,v;if(p<tb){const t=p/tb;v=t;h=.5*t*t*tb}else{const t=(p-tb)/(1-tb);v=1-.5*t;const hBurn=.5*tb;h=hBurn+(1-hBurn)*(t-.25*t*t)/.75}h=Math.min(1,h);zoom=startZoom+(targetZoom-startZoom)*h;if(p<1){const km=Math.round(h*100);const kmh=Math.round(v*vmax*3600);const speedStr=kmh>=1e3?(kmh/1e3).toFixed(1)+"k km/h":kmh+" km/h";let phase;if(p<ts1*.45)phase="🔥 1. Stufe · Triebwerk zündet";else if(p<ts1*.8)phase="🔥 1. Stufe · Max-Q · max. Staudruck";else if(p<ts1)phase="🔥 1. Stufe · Beschleunigung";else if(p<tsep)phase="✷ Stufentrennung · Brennschluss 1. Stufe";else if(p<tsep+(tb-tsep)*.35)phase="🔥 2. Stufe · Zündung";else if(p<tb)phase="🔥 2. Stufe · Beschleunigung";else if(km<92)phase="✦ Brennschluss · ballistischer Flug";else phase="✦ Kármán-Linie · Eintritt ins All";setRocketUI("▲ "+km+" km",phase+" · "+speedStr,true);if((p<ts1||p>=tsep&&p<tb)&&now-lastThrust>2600){lastThrust=now;rumble(1.2)}if(W)draw();requestAnimationFrame(step)}else{zoom=targetZoom;if(W)draw();const ovA=document.getElementById("rocket-overlay");if(ovA)ovA.classList.add("arrived");setRocketUI("▲ 100 km","★ Kármán-Linie erreicht · Schwerelosigkeit",true);spaceFanfare();setTimeout(()=>{const o=document.getElementById("rocket-overlay");if(o)o.classList.remove("active","liftoff","arrived");const btn=document.getElementById("bapollo");if(btn)btn.classList.remove("on");rocketActive=false},5600)}};requestAnimationFrame(step)}function abortRocketLaunch(){rocketActive=false;if(rocketTimer){clearInterval(rocketTimer);rocketTimer=null}commsHiss(false);try{if("speechSynthesis"in window)speechSynthesis.cancel()}catch(e){}stopThrustSound();stopMelody();stopApollo();if(apolloOnTime&&apolloAudio){apolloAudio.removeEventListener("timeupdate",apolloOnTime);apolloOnTime=null}const ov=document.getElementById("rocket-overlay");if(ov)ov.classList.remove("active","liftoff","arrived");const btn=document.getElementById("bapollo");if(btn)btn.classList.remove("on")}

/* Zwei unabhaengige Namensebenen. showNames bleibt der bestehende Szenen-
   Hauptschalter; die Benutzerschalter filtern darunter Objekt- und
   Sternbildnamen getrennt, ohne die vielen Didaktik-Szenen umzubauen. */
let showObjectNames=true;
function syncNameLayerButtons(){
  const lage=typeof orientMode!=="undefined"&&orientMode;
  const kamera=document.body&&document.body.classList.contains("vr-mode");
  /* Im reinen Lagemodus sind Orientierungshilfen Teil der festen Ansicht:
     Objekt- und Sternbildnamen sowie Sternbildlinien bleiben deshalb immer
     aktiv. Im VR-Kameramodus gilt weiterhin dessen reduzierte Beschriftung. */
  if(lage&&!kamera){
    showNames=true;
    showObjectNames=true;
    showConstellationNames=true;
    showLines=true;
    const lines=document.getElementById("blines");
    if(lines){lines.classList.add("on");lines.setAttribute("aria-pressed","true");}
  }
  const obj=document.getElementById("bn"),con=document.getElementById("bconstnames");
  if(obj){obj.classList.toggle("on",showObjectNames);obj.setAttribute("aria-pressed",String(showObjectNames));obj.title=kamera?"Kameramodus: Planeten und nur die hellsten Sterne beschriften":"Namen von Sternen, Planeten, Sonne und Mond ein-/ausblenden"}
  if(con){const sichtbar=showConstellationNames&&!kamera;con.classList.toggle("on",sichtbar);con.setAttribute("aria-pressed",String(sichtbar));con.disabled=lage||kamera;con.title=kamera?"Sternbildnamen sind im Kameramodus ausgeblendet":lage?"Sternbildnamen sind im Lagemodus immer eingeblendet":"Namen der Sternbilder ein-/ausblenden"}
  window.didHideConstNames=!showConstellationNames||kamera;
}
togNames=function(){showObjectNames=!showObjectNames;syncNameLayerButtons();if(W)draw()};
function togConstellationNames(){
  if(typeof orientMode!=="undefined"&&orientMode){try{showToast("Sternbildnamen sind im Lagemodus immer eingeblendet")}catch(e){}return}
  showConstellationNames=!showConstellationNames;syncNameLayerButtons();if(W)draw();
}
const toggleLinesOutsideOrientation=togLines;
togLines=function(){
  if(typeof orientMode!=="undefined"&&orientMode){
    showLines=true;
    const button=document.getElementById("blines");
    if(button){button.classList.add("on");button.setAttribute("aria-pressed","true");}
    try{showToast("Sternbildlinien sind im Lagemodus immer eingeblendet")}catch(e){}
    if(W)draw();
    return;
  }
  return toggleLinesOutsideOrientation();
};
queueMicrotask(()=>{
  syncNameLayerButtons();
  /* Der bestehende Renderer benutzt einen gemeinsamen fillText-Weg. Der Filter
     trennt nur bekannte astronomische Objekt- und Sternbildnamen; Koordinaten,
     Uhrzeit und didaktische Hinweise bleiben davon unberuehrt. */
  if(g&&!g.__nameLayersInstalled){
    const originalFillText=g.fillText.bind(g);
    const objectLabels=new Set(STARS.map(s=>s.n).filter(Boolean));
    const brightestCameraStars=new Set(STARS.filter(s=>Number.isFinite(s.mag)&&s.mag<=1.5).map(s=>s.n));
    const cameraBodies=new Set(["Sonne","Mond","Merkur","Venus","Erde","Mars","Jupiter","Saturn","Uranus","Neptun"]);
    brightestCameraStars.add("Polarstern");
    ["Polarstern","Sonne","Mond","Merkur","Venus","Erde","Mars","Jupiter","Saturn","Uranus","Neptun"].forEach(n=>objectLabels.add(n));
    const constellationLabels=new Set(CON_LBL.map(c=>c.n));
    ZCON.forEach(c=>constellationLabels.add(c[0]));
    window.__planetariumLabelAllowed=function(label){
      label=String(label);
      const cameraOnly=window.cameraStarOnly===true||document.body.classList.contains("vr-mode");
      if(cameraOnly&&objectLabels.has(label)&&!brightestCameraStars.has(label)&&!cameraBodies.has(label))return false;
      if(constellationLabels.has(label)&&(!showConstellationNames||cameraOnly))return false;
      if(objectLabels.has(label)&&!showObjectNames)return false;
      return true;
    };
    g.fillText=function(text,x,y,maxWidth){
      const label=String(text);
      if(!window.__planetariumLabelAllowed(label))return;
      return maxWidth===undefined?originalFillText(text,x,y):originalFillText(text,x,y,maxWidth);
    };
    g.__nameLayersInstalled=true;
  }
  if(document.body&&typeof MutationObserver!=="undefined"){
    new MutationObserver(syncNameLayerButtons).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }
});

/* Die synthetische Milchstrassenebene kann getrennt vom echten Gaia-Katalog
   beurteilt werden. didHideMW wird sowohl vom diffusen Band als auch von den
   Dunkelwolken respektiert; Gaia-Sterne bleiben davon unberuehrt. */
function togMilkyWayGlow(){
  const hidden=window.didHideMW!==true;
  window.didHideMW=hidden;
  window.didHideMWGlow=hidden;
  const b=document.getElementById("bmwglow");
  if(b){b.classList.toggle("on",!hidden);b.setAttribute("aria-pressed",String(!hidden))}
  if(W)draw();
}

/* Schwenk-Rendering an Pointer-Ereignisse koppeln. Die alten Maus- und Touch-
   Handler aktualisieren weiterhin die Kamera; dieser kleine Scheduler sorgt
   dafuer, dass schnelle Bewegungen auf hoechstens ein Bild pro RAF gebuendelt
   werden und der sparsame Gaia-Pfad waehrend der gesamten Geste aktiv bleibt. */
(function initFastSkyInteraction(){
  /* Bei einer vertikalen Schwenkgeste bleibt das letzte vollstaendige Bild stehen.
     Gaia wird erst am Gestenende fuer den neuen Ausschnitt neu projiziert. */
  if(!cv)return;
  const active=new Map();
  cv.addEventListener("pointerdown",e=>{if(!insideHorizon(e.clientX,e.clientY))return;active.set(e.pointerId,{x:e.clientX,y:e.clientY,vertical:false});interacting=8;__requestPlanetariumFrame()},{passive:true});
  window.addEventListener("pointermove",e=>{const start=active.get(e.pointerId);if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>8){start.vertical=Math.abs(dy)>Math.abs(dx)*1.15;window.__gaiaVerticalPan=start.vertical}interacting=8;if(!start.vertical)__requestPlanetariumFrame()},{passive:true});
  const end=e=>{if(!active.delete(e.pointerId))return;window.__gaiaVerticalPan=false;/* Der Abschlussframe muss als aktive Aenderung gelten; mit 0 verwarf der Scheduler ihn. Das entprellte Ruhebild laedt danach auch die fuer Zoom und neuen Ausschnitt benoetigten Gaia-Kacheln. */__requestSettledSkyFrame()};
  window.addEventListener("pointerup",end,{passive:true});
  window.addEventListener("pointercancel",end,{passive:true});
  /* Mausrad-Ereignisse besitzen kein eigenes Gestenende. Jeder Impuls verschiebt
     daher den Timer; erst 90 ms nach dem letzten Impuls entsteht das volle
     Qualitaetsbild, ohne den laufenden Zoom mit Kachelarbeit zu bremsen. */
  cv.addEventListener("wheel",__requestSettledSkyFrame,{passive:true});
})();

// Didaktische Schalter: Auswahl nicht als Scroll-/Canvas-Geste weiterreichen
(function shieldJumpButtons(){
  const page=document.getElementById('page-jumps');
  if(!page)return;
  ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(ev=>{
    page.addEventListener(ev,e=>{ if(e.target.closest('.jump-btn,.jump-home')) e.stopPropagation(); }, {passive:true});
  });
})();

// Beim Öffnen bleibt die Himmelsseite Startseite, obwohl die Sprungseite im Dokument darüber steht.
(function startOnSkyPage(){
  function go(){ forceSkyPosition(); setTimeout(forceSkyPosition,80); setTimeout(forceSkyPosition,260); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true}); else go();
  window.addEventListener('load',go,{once:true});
})();


// Jahresleiste liegt über dem Canvas: Eingaben nicht an Himmel/Scroller durchreichen
(function shieldYearBar(){
  const bar=document.getElementById('year-bar');
  if(!bar)return;
  ['touchstart','touchmove','touchend','pointerdown','pointermove','pointerup','mousedown','mouseup','click','wheel'].forEach(ev=>{
    bar.addEventListener(ev,e=>{e.stopPropagation();}, {passive:false});
  });
})();

// ── Jahreszahl-Leiste oben: ◂ · Jahr · ▸ · Play, Langdruck 10→100 Jahre ──
(function initYearBar(){
  let playTimer=null;
  let playDir=1;
  const playBtn=document.getElementById('yb-play');
  function updatePlayBtn(){
    if(!playBtn)return;
    playBtn.classList.toggle('on',!!playTimer);
    playBtn.textContent=playTimer?'⏸':'▶';
    playBtn.title=playTimer?'Jahreslauf anhalten':'Jahreslauf starten';
  }
  window.setYearPlay=function(on,dir){
    if(typeof dir==='number' && dir!==0)playDir=dir>0?1:-1;
    if(playTimer){clearInterval(playTimer);playTimer=null;}
    if(on){playTimer=setInterval(()=>stepYear(playDir),260);}
    updatePlayBtn();
  };
  function togglePlay(e){
    if(e){e.preventDefault();e.stopPropagation();}
    window.setYearPlay(!playTimer);
  }
  if(playBtn){
    playBtn.addEventListener('pointerdown',togglePlay,{passive:false});
    playBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
  }
  function bindYearButton(id,dir){
    const b=document.getElementById(id); if(!b)return;
    let down=false, didHold=false, t10=null, t100=null, rep=null;
    const clearAll=()=>{clearTimeout(t10);clearTimeout(t100);clearInterval(rep);t10=t100=rep=null;b.classList.remove('pressed');};
    const startRepeat=(delta,ms)=>{clearInterval(rep);stepYear(delta);rep=setInterval(()=>stepYear(delta),ms);};
    b.addEventListener('pointerdown',e=>{
      e.preventDefault();e.stopPropagation();
      down=true; didHold=false; playDir=dir; b.classList.add('pressed');
      try{b.setPointerCapture(e.pointerId)}catch(_e){}
      t10=setTimeout(()=>{ if(!down)return; didHold=true; startRepeat(dir*10,240); },520);
      t100=setTimeout(()=>{ if(!down)return; didHold=true; startRepeat(dir*100,220); },1850);
    },{passive:false});
    b.addEventListener('pointerup',e=>{
      e.preventDefault();e.stopPropagation();
      const held=didHold; clearAll();
      if(down&&!held){ playDir=dir; stepYear(dir); if(playTimer)window.setYearPlay(true,dir); }
      down=false;
    },{passive:false});
    b.addEventListener('pointerleave',()=>{if(down){clearAll();down=false;}});
    b.addEventListener('pointercancel',()=>{clearAll();down=false;});
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
  }
  bindYearButton('yb-back',-1);
  bindYearButton('yb-forward',1);
  updatePlayBtn();
  syncYearUI();
  if(typeof updatePauseButtons==="function")updatePauseButtons();
  if(typeof updateTouchMode==="function")updateTouchMode();
})();



// ── Sternbild-Lernmodus: Zurück-Schalter zur Didaktik ──
(function initConstellationBackButton(){
  const sky=document.getElementById('page-sky')||document.body;
  let btn=document.getElementById('constellation-back');
  if(!btn){
    btn=document.createElement('button');
    btn.id='constellation-back';
    btn.type='button';
    btn.innerHTML='✕';
    btn.title='Sternbild-Lernmodus verlassen und zur didaktischen Sprungseite wechseln';
    sky.appendChild(btn);
  }
  const css=document.createElement('style');
  css.textContent=`
    #constellation-back{
      position:absolute;left:calc(env(safe-area-inset-left,0px) + 10px);top:calc(env(safe-area-inset-top,0px) + 12px);
      z-index:188;display:none;align-items:center;gap:.35rem;
      font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:.82rem;font-weight:750;letter-spacing:.01em;color:#f6f7fb;
      background:rgba(7,12,24,.62);border:1px solid rgba(255,255,255,.14);border-radius:999px;
      padding:.52rem .86rem;box-shadow:0 12px 34px rgba(0,0,0,.34);
      backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
      cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent
    }
    #constellation-back:active{background:rgba(125,214,255,.18);border-color:rgba(125,214,255,.42);transform:translateY(1px)}
    body.fullscreen #constellation-back{display:none!important}
  `;
  document.head.appendChild(css);
  let savedLayerState=null;
  let lastConstellationKey=null;
  function layerState(){
    return {
      showNames:typeof showNames!=='undefined'?showNames:null,
      showZodiac:typeof showZodiac!=='undefined'?showZodiac:null,
      showRA:typeof showRA!=='undefined'?showRA:null,
      showAlt:typeof showAlt!=='undefined'?showAlt:null,
      showLines:typeof showLines!=='undefined'?showLines:null,
      showRefCircles:typeof showRefCircles!=='undefined'?showRefCircles:null,
      showMeteors:typeof showMeteors!=='undefined'?showMeteors:null
    };
  }
  function restoreLayerState(){
    const s=savedLayerState;
    if(!s)return;
    if(s.showNames!==null)showNames=s.showNames;
    if(s.showZodiac!==null)showZodiac=s.showZodiac;
    if(s.showRA!==null)showRA=s.showRA;
    if(s.showAlt!==null)showAlt=s.showAlt;
    if(s.showLines!==null)showLines=s.showLines;
    if(s.showMeteors!==null)showMeteors=s.showMeteors;
    savedLayerState=null;
  }
  function reopenConstellationCard(key){
    if(!key)return;
    var all=document.querySelectorAll('.jump-btn[onclick]');
    var btn=null;
    for(var i=0;i<all.length;i++){
      var oc=all[i].getAttribute('onclick')||'';
      if(oc.indexOf("'"+key+"'")>=0||oc.indexOf('"'+key+'"')>=0){btn=all[i];break;}
    }
    if(!btn)return;
    var card=btn.closest?btn.closest('.jump-card'):null;
    if(card)card.classList.remove('collapsed');
    var sc=document.getElementById('scroller');
    if(!sc){try{btn.scrollIntoView({block:'center'})}catch(e){} return;}
    var snapAlt=sc.style.scrollSnapType;
    sc.style.scrollSnapType='none';
    var fertig=function(){try{sc.style.scrollSnapType=snapAlt||''}catch(e){}};
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
  window.updateConstellationBackButton=function(){
    btn.style.display=(typeof focusConstellation!=='undefined' && focusConstellation)?'flex':'none';
  };
  window.returnToDidactics=function(){
    if(typeof focusConstellation!=='undefined')focusConstellation=null;
    restoreLayerState();
    if(typeof syncFocusButtons==='function')syncFocusButtons();
    if(typeof updateConstellationBackButton==='function')updateConstellationBackButton();
    const page=document.getElementById('page-jumps');
    const sc=document.getElementById('scroller');
    if(page&&sc){sc.scrollTop=page.offsetTop;}
    const key=lastConstellationKey;
    lastConstellationKey=null;
    reopenConstellationCard(key);
    if(typeof draw==='function'&&W)draw();
  };
  btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();window.returnToDidactics();},{passive:false});
  btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
  if(typeof focusConstellationView==='function'){
    const oldFocus=focusConstellationView;
    focusConstellationView=function(key){
      savedLayerState=layerState();
      lastConstellationKey=key;
      try{ if(typeof window.__clearLastScene==='function') window.__clearLastScene(); }catch(e){}
      const r=oldFocus.apply(this,arguments);
      setTimeout(()=>{ if(typeof updateConstellationBackButton==='function')updateConstellationBackButton(); },360);
      return r;
    };
  }
  ['homeView','resetView','setNow'].forEach(name=>{
    if(typeof window[name]==='function'){
      const old=window[name];
      window[name]=function(){
        const r=old.apply(this,arguments);
        if(typeof focusConstellation==='undefined' || !focusConstellation){savedLayerState=null;lastConstellationKey=null;}
        setTimeout(()=>{ if(typeof updateConstellationBackButton==='function')updateConstellationBackButton(); },40);
        return r;
      };
    }
  });
  window.updateConstellationBackButton();
})();

// Bottom-Navigation entfernt.

/* Geordnete Erweiterungspunkte für zusätzliche Canvas-Ebenen. */
const __planetariumBaseDraw = draw;
const __planetariumAfterDraw = new Map();
const __planetariumAroundDraw = new Map();
function __planetariumDrawTerminal() {
  const result = __planetariumBaseDraw.apply(this, arguments);
  for (const [name, hook] of __planetariumAfterDraw) {
    try {
      hook();
    } catch (error) {
      console.warn("Render-Hook fehlgeschlagen: " + name, error);
    }
  }
  return result;
}
function __planetariumRebuildDraw() {
  let next = __planetariumDrawTerminal;
  for (const [name, middleware] of __planetariumAroundDraw) {
    const inner = next;
    next = function () {
      return middleware({
        name,
        args: Array.from(arguments),
        thisArg: this,
        next: (...args) => inner.apply(this, args)
      });
    };
  }
  draw = next;
  window.draw = draw;
}
__planetariumRebuildDraw();
window.__planetariumRender = Object.freeze({
  registerAfterDraw(name, hook) {
    if (typeof name !== "string" || !name) throw new TypeError("Render-Hook benötigt einen Namen");
    if (typeof hook !== "function") throw new TypeError("Render-Hook muss eine Funktion sein");
    if (__planetariumAfterDraw.has(name)) throw new Error("Render-Hook bereits registriert: " + name);
    __planetariumAfterDraw.set(name, hook);
    return () => __planetariumAfterDraw.delete(name);
  },
  listAfterDraw() {
    return Array.from(__planetariumAfterDraw.keys());
  },
  registerAroundDraw(name, middleware) {
    if (typeof name !== "string" || !name) throw new TypeError("Render-Middleware benötigt einen Namen");
    if (typeof middleware !== "function") throw new TypeError("Render-Middleware muss eine Funktion sein");
    if (__planetariumAroundDraw.has(name)) throw new Error("Render-Middleware bereits registriert: " + name);
    __planetariumAroundDraw.set(name, middleware);
    __planetariumRebuildDraw();
    return () => {
      const removed = __planetariumAroundDraw.delete(name);
      if (removed) __planetariumRebuildDraw();
      return removed;
    };
  },
  listAroundDraw() {
    return Array.from(__planetariumAroundDraw.keys());
  }
});

/*
 * Explizite Übergangs-API für noch nicht migrierte Erweiterungen.
 * Sie ersetzt dynamisches eval() und hält sämtliche erlaubten Zugriffe an
 * einer überprüfbaren Stelle. Mit jeder Modulextraktion wird diese Liste kürzer.
 */
window.setSliderActive = function setSliderActive(value) {
  sliderActive = Boolean(value);
};

window.__planetariumLegacy = Object.freeze({
  get(name) {
    switch (name) {
      case "simDay": return simDay;
      case "simYear": return simYear;
      case "simMin": return simMin;
      case "speed": return speed;
      case "interacting": return interacting;
      case "lat": return lat;
      case "lng": return lng;
      case "utcOff": return utcOff;
      case "paused": return paused;
      case "viewMode": return viewMode;
      case "showLines": return showLines;
      case "showRefCircles": return showRefCircles;
      case "showNames": return showNames;
      case "showZodiac": return showZodiac;
      case "showTwilight": return showTwilight;
      case "showISS": return showISS;
      case "showMeteors": return showMeteors;
      case "showJMoons": return showJMoons;
      case "showRA": return showRA;
      case "showAlt": return showAlt;
      case "g": return g;
      case "C": return C;
      case "zoom": return zoom;
      case "ORX": return ORX;
      case "ORY": return ORY;
      case "panX": return panX;
      case "panY": return panY;
      default: return undefined;
    }
  },

  set(name, value) {
    switch (name) {
      case "simDay": simDay = Number(value); break;
      case "simYear": simYear = Number(value); break;
      case "simMin": simMin = Number(value); break;
      case "speed": speed = Number(value); break;
      case "lat": lat = Number(value); break;
      case "lng": lng = Number(value); break;
      case "utcOff": utcOff = Number(value); break;
      case "paused": paused = Boolean(value); break;
      case "zoom": if(Number.isFinite(Number(value)) && Number(value)>0) zoom = Number(value); break;
      case "viewMode": viewMode = value === "real" ? "real" : "dome"; break;
      case "showLines": showLines = Boolean(value); break;
      case "showRefCircles": showRefCircles = Boolean(value); break;
      case "showNames": showNames = Boolean(value); break;
      case "showZodiac": showZodiac = Boolean(value); break;
      case "showTwilight": showTwilight = Boolean(value); break;
      case "showISS": showISS = Boolean(value); break;
      case "showMeteors": showMeteors = Boolean(value); break;
      case "showJMoons": showJMoons = Boolean(value); break;
      case "showRA": showRA = Boolean(value); break;
      case "showAlt": showAlt = Boolean(value); break;
      default: return false;
    }
    return true;
  },

  call(name, ...args) {
    switch (name) {
      case "daysInYear": return daysInYear(...args);
      case "currentJD": return currentJD(...args);
      case "sunLon": return sunLon(...args);
      case "ecl2rd": return ecl2rd(...args);
      case "altazXY": return altazXY(...args);
      case "updLabels": return updLabels(...args);
      case "showToast": return showToast(...args);
      case "setPaused": return setPaused(...args);
      default: throw new Error("Nicht freigegebener Legacy-Aufruf: " + name);
    }
  }
});
