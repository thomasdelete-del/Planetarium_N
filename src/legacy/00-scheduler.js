(function initPlanetariumScheduler(globalObject){
  if(globalObject.__planetariumScheduler)return;
  const jobs=new Map();
  function every(name,callback,intervalMs){
    if(typeof name!=="string"||!name)throw new TypeError("Scheduler-Name fehlt");
    if(typeof callback!=="function")throw new TypeError("Scheduler-Callback fehlt");
    if(!Number.isFinite(intervalMs)||intervalMs<16)throw new RangeError("Ungültiges Scheduler-Intervall");
    cancel(name);
    const id=setInterval(callback,intervalMs);
    jobs.set(name,{id,intervalMs});
    return ()=>cancel(name);
  }
  function cancel(name){
    const job=jobs.get(name);
    if(!job)return false;
    clearInterval(job.id);
    jobs.delete(name);
    return true;
  }
  function list(){
    return Array.from(jobs,([name,job])=>Object.freeze({name,intervalMs:job.intervalMs}));
  }
  function cancelAll(){for(const name of Array.from(jobs.keys()))cancel(name)}
  globalObject.__planetariumScheduler=Object.freeze({every,cancel,list,cancelAll});
})(window);
