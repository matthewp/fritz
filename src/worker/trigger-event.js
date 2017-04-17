import Event from './event.js';
import { getInstance } from './util.js';
import Handle from './handle.js';

export default function(msg, fritz){
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;

  if(msg.handle != null) {
    method = Handle.get(msg.handle).fn;
  } else {
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    method = inst[methodName];
  }

  if(method) {
    let event = new Event(msg.name);

    method.call(inst, event);
    response.type = 'render';
    response.id = msg.id;
    response.tree = inst.render();
    response.event = event.serialize();
    postMessage(response);
  } else {
    // TODO warn?
  }
};