
export function waitForMount(...els) {
  let remaining = els.length;
  return new Promise(resolve => {
    for(let el of els) {
      el.addEventListener('mount', () => {
        remaining--;
        if(remaining === 0) {
          resolve();
        }
      }, { once: true });
    }
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

/*

makeTestHelpers = function(win){
  let uniq = 1;

  return {
    instanceCount() {
      return Object.keys(win.fritz._instances).length;
    },
    runInWorker(fn) {
      let src = fn.toString();
      let worker = win.fritz._workers[0];
      let id = ++uniq;
      worker.postMessage({
        type: 'TEST_DEBUG',
        id: id,
        src: src
      });

      return new Promise(function(resolve, reject){
        worker.addEventListener('message', function onmsg(ev){
          let msg = ev.data;
          switch(msg.type) {
            case 'TEST_DEBUG':
              if(msg.id === id) {
                worker.removeEventListener('message', onmsg);
                if(!msg.error) {
                  resolve(msg.result);
                } else {
                  reject(new Error(msg.error));
                }
              }
              break;
          }
        });
      });
    }
  };
};

*/