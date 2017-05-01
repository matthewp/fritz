import { RENDER, TRIGGER } from '../message-types.js';
import { renderInstance } from './instance.js';

class Component {
  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  update() {
    let id = this._fritzId;
    postMessage({
      type: RENDER,
      id: id,
      tree: renderInstance(this)
    });
  }

  destroy(){}
}

export default Component;
