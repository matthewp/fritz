import { HTMLElement } from 'skatejs/out/util';
import { withProps } from 'skatejs/out/with-props';
import { withRender } from 'skatejs/out/with-render';
import { withUnique } from 'skatejs/out/with-unique';
import { idomRender as render } from './idom-render.js';
import { EVENT, RENDER } from '../message-types.js';

function postEvent(event, inst, handle) {
  let worker = inst._worker;
  let id = inst._id;
  worker.postMessage({
    type: EVENT,
    name: event.type,
    id: id,
    handle: handle,
    value: event.target.value
  });
}

export const withComponent = (Base = HTMLElement) => class extends withUnique(withRender(withProps(Base))) {
  rendererCallback (shadowRoot, renderCallback) {
    this._worker.postMessage({
      type: RENDER,
      tag: this.localName,
      id: this._id
    });
  }

  doRenderCallback(vdom) {
    let shadowRoot = this.shadowRoot;
    render(vdom, shadowRoot, this);
  }

  observedEventsCallback(events) {
    events.forEach(eventName => {
      this.shadowRoot.addEventListener(eventName, this);
    });
  }

  addEventCallback(handleId) {
    var self = this;
    return function(ev){
      ev.preventDefault();
      postEvent(ev, self, handleId);
    };
  }

  handleEvent(ev) {
    ev.preventDefault();
    postEvent(ev, this);
  }
};

export const Component = withComponent();