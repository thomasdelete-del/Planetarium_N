import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../src/legacy/'+name,import.meta.url),'utf8');
test('delayed confirmations keep discrete moon days and planet 1 hour/s',()=>{
  const source=read('14-didactic-focus.js');
  const code=source.slice(source.indexOf('var RUNNING_SIMULATIONS='),source.indexOf('var TOURS='));
  for(const [id,speed] of [['sim-moon-phases',86400],['sim-planet-run',3600]]){
    const callbacks=[],speeds=[];
    const ctx={window:{__lastJumpId:id,setGear:(v,noStart)=>speeds.push([v,noStart]),startMoonPhaseDayRun:()=>speeds.push(['day-step']),__queueAtomicSkyCommit:fn=>callbacks.push(fn)},setTimeout:fn=>callbacks.push(fn),redraw(){}};
    vm.createContext(ctx);vm.runInContext(code+`;confirmSimulationRunning('${id}');`,ctx);
    callbacks.forEach(fn=>fn());
    assert.deepEqual(speeds,id==='sim-moon-phases'?[['day-step'],['day-step'],['day-step']]:[[speed,false],[speed,false],[speed,false]]);
  }
});
test('moon-phase scene starts at full moon with 86400 simulated seconds per second',()=>{
  const source=read('06-season-refinements.js');
  const start=source.indexOf("if(id==='sim-moon-phases'){");
  const block=source.slice(start,source.indexOf('const r=oldJumpScene',start));
  const calls=[];
  const ctx={window:{startMoonPhaseDayRun:()=>calls.push('day-step')},jumpMoonPhase:(phase,label,view)=>{calls.push(phase);assert.equal(view,'real')},setTimeout(){}};
  vm.createContext(ctx);vm.runInContext(`(function(id){${block}})('sim-moon-phases');`,ctx);
  assert.deepEqual(calls,[180,'day-step']);
});

test('moon-phase run enters observer view and points at the moon',()=>{
  const source=read('01-core.js');
  const code=source.slice(source.indexOf('function jumpMoonPhase('),source.indexOf('function startYearSimulation('));
  for(const previous of ['dome','real']){
    const ctx={viewMode:previous,orientMode:true,zoom:8,panX:20,panY:30,zoomedObj:'Mond',
      beginAtomicSkyJump(){},findNextMoonPhase:()=>1,findMoonTransitNear:()=>2,
      setSceneFromJD(){ctx.orientMode=false},syncViewModeButtons(){},updateTouchMode(){},showToast(){},
      pointObserverAtMoon(){ctx.viewMode='real';ctx.pointed=true}
    };
    vm.createContext(ctx);vm.runInContext(code+';jumpMoonPhase(180,"Vollmond","real");',ctx);
    assert.equal(ctx.viewMode,'real');assert.equal(ctx.orientMode,false);assert.equal(ctx.pointed,true);
  }
});

test('moon-phase tracking is updated through the common draw pipeline',()=>{
  const source=readFileSync(new URL('../src/features/render/moonPhaseTracking.js',import.meta.url),'utf8');
  assert.match(source,/registerAroundDraw\("moon-phase-tracking"/);
  assert.match(source,/__trackMoonObserver/);
  assert.match(read('01-core.js'),/window\.__moonPhaseTracking=true;window\.__moonPhaseNeedsCenter=false;jumpMoonPhase\(180,"Mondphasenlauf · Vollmond","real"\)/);
  assert.match(read('01-core.js'),/camFov=65;zoom=1;panX=0;panY=0/);
});

test('moon-phase run keeps the fixed observer home camera',()=>{
  const core=read('01-core.js');
  const start=core.slice(core.indexOf('function startMoonPhaseDayRun()'),core.indexOf('window.startMoonPhaseDayRun='));
  assert.match(start,/viewMode="real";setRealHome\(\);zoom=1;panX=0;panY=0/);
  assert.match(start,/camAlt=45;camFov=100/);
  assert.doesNotMatch(start,/__moonPhaseNeedsCenter=true/);
});

test('illuminated fraction uses the physical Sun-Earth-Moon phase angle',()=>{
  const core=read('01-core.js');
  assert.match(core,/function moonPhaseGeometry\(jd0\)/);
  assert.match(core,/Math\.cos\(b\)\*Math\.cos\(dl\)/);
  assert.match(core,/149597870\.7/);
  assert.match(core,/illum:\(1\+cosPhase\)\/2/);
  assert.match(core,/flux:flux/);
});

test('bright limb orientation is refreshed within a day',()=>{
  assert.match(read('01-core.js'),/Math\.abs\(jd0-_moonLimbCache\.jd\)>=1\/1440/);
});

test('lunar craters follow the projected lunar axis instead of the bright limb',()=>{
  const core=read('01-core.js');
  assert.match(core,/function moonAxisScreenAngle\(mtopo,HR,mP,jd0\)/);
  assert.match(core,/function drawMoonSurfaceFixed\(ctx,image,mx,my,r,brightLimbAng,axisAng\)/);
  assert.match(core,/ctx\.rotate\(-brightLimbAng\+\(axisAng\|\|0\)\)/);
  assert.match(core,/drawMoonSurfaceFixed\(g,moonImg,mx,my,mRdraw,brightLimbAng,moonAxisAng\)/);
  assert.match(core,/drawMoonSurfaceFixed\(g,ms\.cnv,mx,my,mRdraw,brightLimbAng,moonAxisAng\)/);
  assert.doesNotMatch(core,/g\.drawImage\(moonImg,mx-mRdraw/);
});

test('moon-phase composite retains up to 30 fading meridian positions',()=>{
  const core=read('01-core.js');
  assert.match(core,/__moonMeridianTrail\.length>30/);
  assert.match(core,/Komposit · tägliche Meridianpassagen/);
  const tracking=readFileSync(new URL('../src/features/render/moonPhaseTracking.js',import.meta.url),'utf8');
  assert.match(tracking,/__drawMoonMeridianTrail/);
});

test('leaving observer mode clears the images without stopping the moon run',()=>{
  const core=read('01-core.js');
  const clear=core.slice(core.indexOf('function clearMoonCompositeOnObserverExit()'),core.indexOf('function startMoonPhaseDayRun()'));
  assert.match(clear,/resetStoredSkyImagesOnViewToggle\(\)/);
  assert.doesNotMatch(clear,/stopMoonPhaseDayRun\(\)/);
  assert.doesNotMatch(clear,/setPaused\(true\)/);
  const toggle=core.slice(core.indexOf('function toggleViewMode()'),core.indexOf('function toggleOrient()'));
  assert.match(toggle,/if\(viewMode==="real"\)\{\s*clearMoonCompositeOnObserverExit\(\)/);
  assert.match(core,/window\.leaveRealView=function\(\)\{if\(viewMode!=="real"\)return;clearMoonCompositeOnObserverExit\(\)/);
});

test('every observer-mode toggle clears stored Moon and analemma images',()=>{
  const core=read('01-core.js');
  assert.match(core,/function resetStoredSkyImagesOnViewToggle\(\)/);
  assert.match(core,/window\.__resetMoonMeridianTrail\(\)/);
  assert.match(core,/window\.__resetSolarYearTrail\(\)/);
  const toggle=core.slice(core.indexOf('function toggleViewMode()'),core.indexOf('function toggleOrient()'));
  assert.match(toggle,/resetStoredSkyImagesOnViewToggle\(\)/);
  const solar=read('08-solar-year.js');
  assert.match(solar,/window\.__resetSolarYearTrail=function\(\)\{solarTrail=\[\];\}/);
  const focus=read('14-didactic-focus.js');
  assert.match(focus,/if\(n==="__AN"\)\{if\(typeof window\.__resetSolarYearTrail==="function"\)window\.__resetSolarYearTrail\(\)/);
});

test('observer moon tracking does not draw the old dome moon overlay twice',()=>{
  const source=read('04-moon-rendering.js');
  assert.match(source,/if\(window\.__moonPhaseTracking\)return/);
});

test('moon phase view starts without ecliptic, moon nodes or twilight and offers one image switch',()=>{
  const focus=read('14-didactic-focus.js');
  assert.match(focus,/moon:\[\["Sternnamen","showNames"\],\["Ekliptik & Mondknoten","__EC"\]\]/);
  assert.match(focus,/"sim-moon-phases":\{flags:\{showZodiac:false,showLines:true,showRefCircles:true,showTwilight:false\}/);
  assert.match(focus,/window\.didHideEcl=true;window\.showMoonPath=false/);
  const orbits=read('02-didactic-orbits.js');
  assert.match(orbits,/if\(window\.__moonPhaseTracking===true\) return/);
});

test('moon phases advance in quiet whole-day steps without camera recentering',()=>{
  const core=read('01-core.js');
  assert.match(core,/function startMoonPhaseDayRun\(\)/);
  assert.match(core,/findMoonTransitNear\(currentJD\(\)\+1\)/);
  assert.match(core,/simMin=localDate\.getUTCHours\(\)\*60/);
  assert.match(core,/every\("moon-phase-day",step,1000\)/);
  const tracking=readFileSync(new URL('../src/features/render/moonPhaseTracking.js',import.meta.url),'utf8');
  assert.match(tracking,/__moonPhaseTracking && globalObject\.__moonPhaseNeedsCenter/);
});

test('every direct planet focus stops moon phase tracking and delayed restarts',()=>{
  const core=read('01-core.js');
  const start=core.indexOf('function focusPlanetView(name){');
  const block=core.slice(start,core.indexOf('beginAtomicSkyJump(440);',start));
  assert.match(block,/window\.__moonPhaseTracking=false/);
  assert.match(block,/stopMoonPhaseDayRun\(\)/);
  assert.match(block,/didacticSimulationMode==="moon"/);
  assert.match(block,/__didacticSimulationRunToken=.*\+1/);
  assert.match(block,/__resetMoonMeridianTrail/);
});

test('every other didactic scene switch stops the moon phase scheduler',()=>{
  const core=read('01-core.js');
  assert.match(core,/window\.stopMoonPhaseDayRun=stopMoonPhaseDayRun/);
  const focus=read('14-didactic-focus.js');
  const start=focus.indexOf('function stopMoonPhaseForOtherScene(id){');
  const block=focus.slice(start,focus.indexOf('var TOURS=',start));
  assert.match(block,/if\(id==="sim-moon-phases"\)return/);
  assert.match(block,/__didacticSimulationRunToken=.*\+1/);
  assert.match(block,/window\.__moonPhaseTracking=false/);
  assert.match(block,/window\.stopMoonPhaseDayRun&&window\.stopMoonPhaseDayRun\(\)/);
  const wrapper=focus.slice(focus.indexOf('var w=function(id){'),focus.indexOf('w.__v10Wrapped'));
  assert.match(wrapper,/stopMoonPhaseForOtherScene\(id\)/);
});

test('object labels use no canvas shadow or dark stroke outline',()=>{
  const core=read('01-core.js');
  const unified=core.slice(core.indexOf('g.fillText=function'),core.indexOf('})();let W=',core.indexOf('g.fillText=function')));
  assert.match(unified,/g\.shadowColor="transparent";g\.shadowBlur=0/);
  for(const file of ['02-didactic-orbits.js','11-precession-polaris.js','12-didactic-navigation.js','13-precession-labels.js']){
    assert.doesNotMatch(read(file),/strokeText\(/,file+' must not outline object labels');
  }
});
