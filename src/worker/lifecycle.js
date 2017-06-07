import { getInstance, setInstance, delInstance } from '../util.js';
import Handle from './handle.js';
import { RENDER } from '../message-types.js';
import { renderInstance } from './instance.js';

export function render(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  let events;
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperties(instance, {
      _fritzId: {
        enumerable: false,
        value: id
      },
      _fritzHandles: {
        enumerable: false,
        writable: true,
        value: Object.create(null)
      }
    });
    setInstance(fritz, id, instance);
    events = constructor.observedEvents;
  }

  Object.assign(instance, props);

  let tree = renderInstance(instance);
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
};

export function trigger(fritz, msg){
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
    let event = msg.event;
    method.call(inst, event);
    response.type = RENDER;
    response.id = msg.id;
    response.tree = renderInstance(inst);
    response.event = event;
    postMessage(response);
  } else {
    // TODO warn?
  }
};

export function destroy(fritz, msg){
  let instance = getInstance(fritz, msg.id);
  instance.destroy();
  Object.keys(instance._fritzHandles).forEach(function(key){
    let handle = instance._fritzHandles[key];
    handle.del();
  });
  instance._fritzHandles = Object.create(null);
  delInstance(fritz, msg.id);
};