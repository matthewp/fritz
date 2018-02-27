import { idomRender as render } from './idom-render.js';
import { withRenderer } from '@matthewp/skatejs/dist/esnext/with-renderer';
import { RENDER, EVENT } from '../message-types.js';
import { patch } from './patch.js';

// TODO This should definitely not go here :(
function postEvent(event, inst, handle) {
  let worker = inst._worker;
  let id = inst._id;
  worker.postMessage({
    type: EVENT,
    event: {
      type: event.type,
      detail: event.detail,
      value: event.target.value
    },
    id: id,
    handle: handle
  });
}

export function withWorkerRender(Base = HTMLElement) {
  return class extends withRenderer(Base) {
    constructor() {
      super();
      if(!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
    }

    renderer() {
      this._worker.postMessage({
        type: RENDER,
        tag: this.localName,
        id: this._id,
        props: this.props
      });
    }

    beforeRender() {}
    afterRender() {}

    doRenderCallback(patches) {
      this.beforeRender();
      let elem = this;
      let root = this.shadowRoot;
      function createEventCallback(type, handle) {
        return function(event){
          postEvent(event, elem, handle);
        };
      }
      patch(patches, root, createEventCallback);
      this.afterRender();
    }
  }
}
