
self.addEventListener('message', function(ev){
  let msg = ev.data;
  switch(msg.type) {
    case 'TEST_DEBUG':
      evalTestCode(msg);
      break;
  }
});

function evalTestCode(msg) {
  let src = 'return ('+ msg.src + ')();';
  let fn = new Function(src);
  try {
    let result = fn();
    postMessage({
      type: 'TEST_DEBUG',
      result: result,
      id: msg.id
    });
  } catch(err) {
    postMessage({
      type: 'TEST_DEBUG',
      id: msg.id,
      error: err.message,
      stack: err.stack
    });
  }
}