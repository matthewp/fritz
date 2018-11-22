import { render, trigger, destroy, rendered, cleanup } from './lifecycle.js';
import { RENDER, EVENT, STATE, DESTROY, RENDERED, CLEANUP } from '../message-types.js';

export default function relay(fritz, self) {
  if(!fritz._hasListened) {
    fritz._hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case RENDER:
          render(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
          break;
        case STATE:
          fritz.state = msg.state;
          break;
        case DESTROY:
          destroy(fritz, msg);
          break;
        case RENDERED:
          rendered(fritz, msg);
          break;
        case CLEANUP:
          cleanup(fritz, msg);
          break;
      }
    });
  }
};
