import { HTMLElement } from 'skatejs/es-latest/util';
import { withProps } from 'skatejs/es-latest/with-props';
import { withRender } from 'skatejs/es-latest/with-render';
import { withUnique } from 'skatejs/es-latest/with-unique';
import { idomRender as render } from './idom-render.js';
import { EVENT, RENDER } from '../message-types.js';

function postEvent(event, inst, handle) {
  let worker = inst._worker;
  let id = inst._id;
  worker.postMessage({
    type: EVENT,
    event: {
      type: event.type,
      detail: event.detail,
      value: event.target.value
    },
    id: id,
    handle: handle,
  });
}

export const withComponent = (Base = HTMLElement) => class extends withUnique(withRender(withProps(Base))) {
  constructor() {
    super();
    this._handlers = Object.create(null);
  }

  rendererCallback (shadowRoot, renderCallback) {
    this._worker.postMessage({
      type: RENDER,
      tag: this.localName,
      id: this._id,
      props: this.props
    });
  }

  doRenderCallback(vdom) {
    let shadowRoot = this.shadowRoot;
    render(vdom, shadowRoot, this);
  }

  addEventCallback(handleId, eventProp) {
    var key = eventProp + '/' + handleId;
    var fn;
    if(fn = this._handlers[key]) {
      return fn;
    }

    // TODO optimize this so functions are reused if possible.
    var self = this;
    fn = function(ev){
      ev.preventDefault();
      postEvent(ev, self, handleId);
    };
    this._handlers[key] = fn;
    return fn;
  }

  addEventProperty(name) {
    var evName = name.substr(2);
    var priv = '_' + name;
    var proto = Object.getPrototypeOf(this);
    Object.defineProperty(proto, name, {
      get: function(){ return this[priv]; },
      set: function(val) {
        var cur;
        if(cur = this[priv]) {
          this.removeEventListener(evName, cur);
        }
        this[priv] = val;
        this.addEventListener(evName, val);
      }
    });
  }

  handleEvent(ev) {
    ev.preventDefault();
    postEvent(ev, this);
  }
};

export const Component = withComponent();