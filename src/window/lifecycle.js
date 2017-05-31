import { Component } from './component.js';
import { DESTROY } from '../message-types.js';
import { getInstance, setInstance, delInstance } from '../util.js';

export { default as render } from './scheduler.js';

export function define(fritz, msg) {
  let worker = this;
  let tagName = msg.tag;
  let props = msg.props || {};

  class OffThreadElement extends Component {
    static get props() {
      return props;
    }

    constructor() {
      super();
      this._worker = worker;
      this._id = ++fritz._id;
    }

    connectedCallback() {
      super.connectedCallback();
      setInstance(fritz, this._id, this);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      delInstance(fritz, this._id);
      this._worker.postMessage({
        type: DESTROY,
        id: this._id
      });
    }
  }

  customElements.define(tagName, OffThreadElement);
}

export function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let event = new Event(msg.event.type, {
    bubbles: true
  });
  inst.dispatchEvent(event);  
};