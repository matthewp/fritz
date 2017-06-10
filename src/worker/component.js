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

  // Force an update, will change to setState()
  update() {
    let id = this._fritzId;
    postMessage({
      type: RENDER,
      id: id,
      tree: renderInstance(this)
    });
  }

  componentWillUpdate(){}

  destroy(){}
}

export default Component;
