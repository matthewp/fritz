import { isFunction } from '../util.js';
import { RENDER, TRIGGER } from '../message-types.js';
import { enqueueRender } from './instance.js';
import { VFrag } from './vnode.js';

class Component {
  constructor(props = {}) {
    this.state = {};
    this.props = props;
    this._tree = new VFrag();
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
    enqueueRender(this, null, this._fritz);
  }

  // Force an update, will change to setState()
  update() {
    console.warn('update() is deprecated. Use setState() instead.');
    this.setState({});
  }

  componentWillReceiveProps(){}
  shouldComponentUpdate() {
    return true;
  }
  componentWillUpdate(){}
  componentWillUnmount(){}
}

export default Component;
