import type { WindowRenderMessage } from '../message-types';
import type { MountBase } from './types';

import { idomRender as render } from './idom-render.js';
import { withRenderer } from '@matthewp/skatejs/dist/esnext/with-renderer';
import { RENDER } from '../message-types.js';

export function withWorkerRender(Base: MountBase) {
  return class extends withRenderer(Base) {
    constructor() {
      super();
      if(!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
    }

    renderer(this: MountBase) {
      // Only send a render when connected
      if(!this.isConnected) return;
      let msg: WindowRenderMessage = {
        type: RENDER,
        tag: this.localName,
        id: this._id,
        props: this.props
      }
      this._worker.postMessage(msg);
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
