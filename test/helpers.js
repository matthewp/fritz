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