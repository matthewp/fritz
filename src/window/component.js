
import { HTMLElement } from 'skatejs/out/util';
import { withProps } from 'skatejs/out/with-props';
import { withRender } from 'skatejs/out/with-render';
import { withUnique } from 'skatejs/out/with-unique';
import { idomRender as render } from './idom-render.js';

export const withComponent = (Base = HTMLElement) => class extends withUnique(withRender(withProps(Base))) {
  rendererCallback (shadowRoot, renderCallback) {
    this._worker.postMessage({
      type: 'render',
      tag: this.localName,
      id: this._id
    });
  }

  doRenderCallback(vdom) {
    let shadowRoot = this.shadowRoot;
    render(vdom, shadowRoot);
  }

  observedEventsCallback(events) {
    events.forEach(eventName => {
      this.shadowRoot.addEventListener(eventName, this);
    });
  }

  handleEvent(ev) {
    ev.preventDefault();
    this._worker.postMessage({
      type: 'event',
      name: ev.type,
      id: this._id
    });
  }
};

export const Component = withComponent();