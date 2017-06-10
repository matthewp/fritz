import { isFunction } from '../util.js';
import { RENDER, TRIGGER } from '../message-types.js';
import { enqueueRender } from './instance.js';

class Component {
  constructor() {
    this.state = {};
    this.props = {};
  }

  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  setState(state) {
    let s = this.state;
    Object.assign(s, isFunction(state) ? state(s, this.props) : state);
    enqueueRender(this);
  }

  // Force an update, will change to setState()
  update() {
    console.warn('update() is deprecated. Use setState() instead.');
    this.setState({});
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillUpdate(){}

  componentWillUnmount(){}
}

export default Component;
