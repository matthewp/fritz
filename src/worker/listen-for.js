import render from './render.js';
import trigger from './trigger-event.js';

let hasListened = false;

function listenFor(fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case 'render':
          render(msg, fritz);
          break;
        case 'event':
          trigger(msg, fritz);
          break;
      }
    });
  }
}

export default listenFor;