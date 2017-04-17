import { getInstance } from './util.js';

export default function(msg, fritz) {
  let inst = getInstance(msg.id, fritz);
  let event = new Event(msg.event.type, {
    bubbles: true
  });
  inst.dispatchEvent(event);  
};