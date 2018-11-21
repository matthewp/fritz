import { patch } from './patch.js';
import { withRenderer } from '@matthewp/skatejs/dist/esnext/with-renderer';
import { RENDER } from '../message-types.js';
import { shadow } from '@matthewp/skatejs/dist/esnext/shadow';

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

    doRenderCallback(vdom) {
      this.beforeRender();
      let out = patch(vdom, this.shadowRoot, this);
      this.afterRender();
      this.handleOrphanedHandles(out);
    }
  }
}
