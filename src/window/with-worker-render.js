import { idomRender as render } from './idom-render.js';
import { withRenderer } from 'skatejs/dist/esnext/with-renderer';
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

    doRenderCallback(vdom) {
      this.beforeRender();
      let shadowRoot = this.shadowRoot;
      render(vdom, shadowRoot, this);
      this.afterRender();
    }
  }
}
