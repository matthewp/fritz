import windowFritz from '../../window.mjs';

export function waitForMount(...els) {
  let remaining = els.length;
  return new Promise(resolve => {
    for(let el of els) {
      el.addEventListener('mount', () => {
        remaining--;
        if(remaining === 0) {
          setTimeout(resolve, 50);
        }
      }, { once: true });
    }
  });
}

export function waitForRender(fritzElement) {
  let id = fritzElement._id;
  let worker = fritzElement._worker;
  return new Promise(resolve => {
    worker.addEventListener('message', function onMessage(ev) {
      if(ev.data?.type === 'fritz:render' && ev.data.id === id) {
        worker.removeEventListener('message', onMessage);
        resolve();
      }
    });
  });
}

export function waitFor(cb) {
  return new Promise(resolve => {
    let id = setInterval(() => {
      if(cb()) {
        clearInterval(id);
        resolve();
      }
    }, 10);
  });
}