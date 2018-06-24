import render from './lit-render.js';
import { withRenderer } from '@matthewp/skatejs/dist/esnext/with-renderer';
import { RENDER } from '../message-types.js';

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

    doRenderCallback(tree) {
      this.beforeRender();
      let shadowRoot = this.shadowRoot;
      let worker = this._worker;
      let out = render.call(worker, tree, shadowRoot, this);
      this.afterRender();

      // TODO we need to add this back
      //this.handleOrphanedHandles(out);
    }
  }
}
