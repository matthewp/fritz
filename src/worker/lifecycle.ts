import type { WorkerFritz } from '../types';
import type {
  WindowRenderMessage,
  CleanupMessage,
  DestroyMessage,
  EventMessage,
  RenderedMessage
} from '../message-types';

import { getInstance, setInstance, delInstance } from '../util.js';
import Handle from './handle.js';
import { enqueueRender } from './instance.js';

export function render(fritz: WorkerFritz, msg: WindowRenderMessage) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  if(!instance) {
    let constructor = fritz._tags.get(msg.tag)!;
    instance = new constructor();
    Object.defineProperties(instance, {
      _fritzId: {
        enumerable: false,
        value: id
      },
      _fritzHandles: {
        enumerable: false,
        writable: true,
        value: new Map()
      }
    });
    setInstance(fritz, id, instance);
  }

  enqueueRender(instance as any, props);
};

export function trigger(fritz: WorkerFritz, msg: EventMessage) {
  let inst = getInstance(fritz, msg.id)!;

  let method;
  if(msg.handle != null) {
    method = Handle.get(msg.handle)!.fn;
  } else {
    let name = msg.event.type;
    let methodName = 'on' + name[0].toUpperCase() + name.substr(1);
    method = (inst as any)[methodName];
  }

  if(method) {
    let event = msg.event;
    method.call(inst, event);

    enqueueRender(inst);
  } else {
    // TODO warn?
  }
};

export function destroy(fritz: WorkerFritz, msg: DestroyMessage) {
  let instance = getInstance(fritz, msg.id);
  if(instance) {
    instance.componentWillUnmount();

    let handles = instance._fritzHandles;
    handles.forEach(function(handle){
      handle.del();
    });
    handles.clear();
    
    delInstance(fritz, msg.id);
  }
};

export function rendered(fritz: WorkerFritz, msg: RenderedMessage) {
  let instance = getInstance(fritz, msg.id)!;
  instance.componentDidMount();
};

export function cleanup(fritz: WorkerFritz, msg: CleanupMessage) {
  let instance = getInstance(fritz, msg.id)!;
  let handles = instance._fritzHandles;
  msg.handles.forEach(function(id){
    // A handle might have been previously deleted by a destroy
    // and then the same element re-connected. Those old handles
    // can be ignored.
    if(handles.has(id)) {
      let handle = handles.get(id)!;
      handle.del();
      handles.delete(id);
    }
  });
};
