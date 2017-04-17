import render from './render.js';

let hasListened = false;

function listenFor(tag, fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case 'render':
          render(msg, fritz);
          break;
      }
    });
  }
}

export default listenFor;