import { Component } from './component.js';
import { DESTROY } from '../message-types.js';
import { getInstance, setInstance, delInstance } from '../util.js';

export function define(fritz, msg) {
  let worker = this;
  let tagName = msg.tag;
  let props = msg.props || {};
  let events = msg.events || [];

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
      events.forEach(eventName => {
        this.shadowRoot.addEventListener(eventName, this);
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      delInstance(fritz, this._id);
      events.forEach(eventName => {
        this.shadowRoot.removeEventListener(eventName, this);
      });
      this._worker.postMessage({
        type: DESTROY,
        id: this._id
      });
    }
  }

  customElements.define(tagName, OffThreadElement);
};

export function render(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  if(instance !== undefined) {
    instance.doRenderCallback2(msg.patches);
    //instance.doRenderCallback(msg.tree);

    /*if(msg.events) {
      instance.observedEventsCallback(msg.events);
    }*/
  }
};

export function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let ev = msg.event;
  let event = new CustomEvent(ev.type, {
    bubbles: true,//ev.bubbles,
    cancelable: ev.cancelable,
    detail: ev.detail,
    scoped: ev.scoped,
    composed: ev.composed
  });

  inst.dispatchEvent(event);  
};