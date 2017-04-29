import { Component } from './component.js';

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
      fritz._instances[this._id] = this;
    }
  }

  customElements.define(tagName, OffThreadElement);
}

export function render(fritz, msg){
  let id = msg.id;
  let instance = fritz._instances[msg.id];
  instance.doRenderCallback(msg.tree);
  if(msg.events) {
    instance.observedEventsCallback(msg.events);
  }
};

export function trigger(fritz, msg) {
  let inst = getInstance(msg.id, fritz);
  let event = new Event(msg.event.type, {
    bubbles: true
  });
  inst.dispatchEvent(event);  
};

function getInstance(id, fritz){
  return fritz._instances[id];
}