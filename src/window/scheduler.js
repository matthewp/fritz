import { getInstance } from '../util.js';

let rafId = null;

function schedule(fritz, msg) {
  let work = fritz._work;
  work.push(msg);
  if(!rafId) {
    rafId = requestAnimationFrame(function cycle(){
      let start = new Date();
      do {
        let msg = work.shift();
        render(fritz, msg);
      } while(new Date() - start < 16 && work.length);

      if(work.length)
        requestAnimationFrame(cycle);
      else
        rafId = null;
    });
  }
}

function render(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  if(instance !== undefined) {
    instance.doRenderCallback(msg.tree);
    if(msg.events) {
      instance.observedEventsCallback(msg.events);
    }
  }
}

export default schedule;