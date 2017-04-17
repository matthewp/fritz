import { Component } from './component.js';

export default function(fritz, msg) {
  let worker = this;
  let tagName = msg.tag;

  class OffThreadElement extends Component {
    constructor() {
      super();
      this._worker = worker;
      this._id = ++fritz._id;
      fritz._instances[this._id] = this;
    }
  }

  fritz.tags[tagName] = {
    worker: worker
  };

  customElements.define(tagName, OffThreadElement);
}