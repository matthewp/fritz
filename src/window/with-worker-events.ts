import type { MountBase } from './types';
import type { EventMessage } from '../message-types';

import { CLEANUP, EVENT } from '../message-types.js';

function postEvent(event: Event, inst: MountBase, handle?: number) {
  let worker = inst._worker;
  let id = inst._id;
  let msg: EventMessage = {
    type: EVENT,
    event: {
      type: event.type,
      detail: (event as any).detail,
      value: (event as any).target.value
    },
    id: id,
    handle: handle
  };
  worker.postMessage(msg);
}

export function withWorkerEvents(Base: MountBase) {
  return class extends Base {
    constructor() {
      super();
      this._handlers = Object.create(null);
    }

    addEventCallback(handleId: number) {
      let key = handleId;
      let fn;
      if(fn = this._handlers[key]) {
        return fn;
      }

      // TODO optimize this so functions are reused if possible.
      fn = (ev: Event) => {
        ev.preventDefault();
        postEvent(ev, this, handleId);
      };
      this._handlers[key] = fn;
      return fn;
    }

    addEventProperty(name: string) {
      let evName = name.slice(2);
      let priv = '_' + name;
      let proto = Object.getPrototypeOf(this);
      Object.defineProperty(proto, name, {
        get: function(){ return this[priv]; },
        set: function(val) {
          let cur;
          if(cur = this[priv]) {
            this.removeEventListener(evName, cur);
          }
          this[priv] = val;
          this.addEventListener(evName, val);
        }
      });
    }

    handleEvent(ev: Event) {
      ev.preventDefault();
      postEvent(ev, this);
    }

    handleOrphanedHandles(handles: number[]) {
      if(handles.length) {
        let worker = this._worker;
        worker.postMessage({
          type: CLEANUP,
          id: this._id,
          handles: handles
        });
        let handlers = this._handlers;
        handles.forEach(function(id){
          delete handlers[id];
        });
      }
    }
  }
}
