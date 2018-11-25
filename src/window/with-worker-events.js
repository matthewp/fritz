import { CLEANUP, EVENT } from '../message-types.js';

function postEvent(event, inst, handle) {
  let worker = inst._worker;
  let id = inst._id;
  let eventMsg = {
    type: event.type,
    detail: event.detail,
    value: event.target.value
  };
  if(event instanceof KeyboardEvent) {
    eventMsg.key = event.key;
    eventMsg.code = event.code;
    eventMsg.which = event.which;
  }
  worker.postMessage({
    type: EVENT,
    event, id, handle
  });
}

const preventables = new Set(['click']);

export function withWorkerEvents(Base = HTMLElement) {
  return class extends Base {
    constructor() {
      super();
      this._handlers = Object.create(null);
    }

    addEventCallback(handleId, eventProp) {
      var key = handleId;
      var fn;
      if(fn = this._handlers[key]) {
        return fn;
      }

      // TODO optimize this so functions are reused if possible.
      var self = this;
      fn = function(ev){
        if(preventables.has(ev.type))
          ev.preventDefault();
        postEvent(ev, self, handleId);
      };
      this._handlers[key] = fn;
      return fn;
    }

    addEventProperty(name) {
      var evName = name.substr(2);
      var priv = '_' + name;
      var proto = Object.getPrototypeOf(this);
      Object.defineProperty(proto, name, {
        get: function(){ return this[priv]; },
        set: function(val) {
          var cur;
          if(cur = this[priv]) {
            this.removeEventListener(evName, cur);
          }
          this[priv] = val;
          this.addEventListener(evName, val);
        }
      });
    }

    handleEvent(ev) {
      ev.preventDefault();
      postEvent(ev, this);
    }

    handleOrphanedHandles(handles) {
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
