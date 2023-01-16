import type { WorkerFritz } from '../types';
import type { MessageSentFromWindow } from '../message-types';
 
import { render, trigger, destroy, rendered, cleanup } from './lifecycle.js';
import { RENDER, EVENT, STATE, DESTROY, RENDERED, CLEANUP } from '../message-types.js';

let hasListened = false;

export default function relay(fritz: WorkerFritz) {
  if(!hasListened) {
    hasListened = true;

    fritz._port.addEventListener?.('message', function(ev: MessageEvent<MessageSentFromWindow>){
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
