import { idomRender as render } from './idom-render.js';
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
      let out = render(tree, shadowRoot, this);
      this.afterRender();
      this.handleOrphanedHandles(out);
    }
  }
}
