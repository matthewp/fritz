(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fritz = factory());
}(this, (function () { 'use strict';

function getInstance(fritz, id){
  return fritz._instances[id];
}

function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
}

function delInstance(fritz, id){
  delete fritz._instances[id];
}

function isFunction(val) {
  return typeof val === 'function';
}

const defer = Promise.resolve().then.bind(Promise.resolve());

const sym = typeof Symbol === 'function' ? Symbol : function(v) { return '_' + v };

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';
const RENDERED = 'rendered';
const CLEANUP = 'cleanup';

let currentInstance = null;

function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
}

let queue = [];

function enqueueRender(instance, sentProps) {
  if(!instance._dirty && (instance._dirty = true) && queue.push([instance, sentProps])==1) {
    defer(rerender);
  }
}

function rerender() {
	let p, list = queue;
	queue = [];
	while ( (p = list.pop()) ) {
		if (p[0]._dirty) render(p[0], p[1]);
	}
}

function render(instance, sentProps) {
  if(sentProps) {
    var nextProps = Object.assign({}, instance.props, sentProps);
    instance.componentWillReceiveProps(nextProps);
    instance.props = nextProps;
  }

  if(instance.shouldComponentUpdate(nextProps) !== false) {
    instance.componentWillUpdate();
    instance._dirty = false;

    postMessage({
      type: RENDER,
      id: instance._fritzId,
      tree: renderInstance(instance)
    });
  }
}

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

  componentWillReceiveProps(){}
  shouldComponentUpdate() {
    return true;
  }
  componentWillUpdate(){}
  componentWillUnmount(){}
}

let Store;
let Handle;

Store = class {
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
    this.inUse = true;
  }

  from(fn) {
    let handle;
    let id = this.handleMap.get(fn);
    if(id == null) {
      id = this.id++;
      handle = new Handle(id, fn);
      this.handleMap.set(fn, id);
      this.idMap.set(id, handle);
    } else {
      handle = this.idMap.get(id);
    }
    return handle;
  }

  get(id) {
    return this.idMap.get(id);
  }
};

Handle = class {
  static get store() {
    if(!this._store) {
      this._store = new Store();
    }
    return this._store;
  }

  static from(fn) {
    return this.store.from(fn);
  }

  static get(id) {
    return this.store.get(id);
  }

  constructor(id, fn) {
    this.id = id;
    this.fn = fn;
  }

  del() {
    let store = Handle.store;
    store.handleMap.delete(this.fn);
    store.idMap.delete(this.id);
  }
};

var Handle$1 = Handle;

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {
  if(eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let handle = Handle$1.from(attrValue);
    handle.inUse = true;
    currentInstance._fritzHandles.set(handle.id, handle);
    return [1, eventName, handle.id];
  }
}

const _tree = sym('ftree');

function isTree(obj) {
  return !!(obj && obj[_tree]);
}

function createTree() {
  var out = [];
  out[_tree] = true;
  return out;
}

function h(tag, attrs, children){
  var argsLen = arguments.length;
  var childrenType = typeof children;
  if(argsLen === 2) {
    if(typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if(argsLen > 3 || isTree(children) || isPrimitive(childrenType)) {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = isFunction(tag);

  if(isFn) {
    var localName = tag.prototype.localName;
    if(localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = createTree();
  var uniq;
  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      } else if(key === 'key') {
        uniq = value;
      } else {
        acc.push(key);
        acc.push(value);
      }

      return acc;
    }, []);
  }

  var open = [1, tag, uniq];
  if(attrs) {
    open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  tree.push(open);

  if(children) {
    children.forEach(function(child){
      if(typeof child !== 'undefined' && !Array.isArray(child)) {
        tree.push([4, child + '']);
        return;
      }

      while(child && child.length) {
        tree.push(child.shift());
      }
    });
  }

  tree.push([2, tag]);

  return tree;
}

function isPrimitive(type) {
  return type === 'string' || type === 'number' || type === 'boolean';
}

function render$1(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperties(instance, {
      _fritzId: {
        enumerable: false,
        value: id
      },
      _fritzHandles: {
        enumerable: false,
        writable: true,
        value: new Map()
      }
    });
    setInstance(fritz, id, instance);
  }

  enqueueRender(instance, props);
}

function trigger(fritz, msg){
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if(msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let name = msg.event.type;
    let methodName = 'on' + name[0].toUpperCase() + name.substr(1);
    method = inst[methodName];
  }

  if(method) {
    let event = msg.event;
    method.call(inst, event);

    enqueueRender(inst);
  } else {
    // TODO warn?
  }
}

function destroy(fritz, msg){
  let instance = getInstance(fritz, msg.id);
  instance.componentWillUnmount();

  let handles = instance._fritzHandles;
  handles.forEach(function(handle){
    handle.del();
  });
  handles.clear();
  
  delInstance(fritz, msg.id);
}

function rendered(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  instance.componentDidMount();
}

function cleanup(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  let handles = instance._fritzHandles;
  msg.handles.forEach(function(id){
    let handle = handles.get(id);
    handle.del();
    handles.delete(id);
  });
}

let hasListened = false;

function relay(fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case RENDER:
          render$1(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
          break;
        case STATE:
          fritz.state = msg.state;
          break;
        case DESTROY:
          destroy(fritz, msg);
          break;
        case RENDERED:
          rendered(fritz, msg);
          break;
        case CLEANUP:
          cleanup(fritz, msg);
          break;
      }
    });
  }
}

const fritz$1 = Object.create(null);
fritz$1.Component = Component;
fritz$1.define = define;
fritz$1.h = h;
fritz$1._tags = Object.create(null);
fritz$1._instances = Object.create(null);

function define(tag, constructor) {
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }
  if(constructor.prototype === undefined ||
    constructor.prototype.render === undefined) {
    let render = constructor;
    constructor = class extends Component{};
    constructor.prototype.render = render;
  }

  fritz$1._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz$1);

  postMessage({
    type: DEFINE,
    tag: tag,
    props: constructor.props,
    events: constructor.events,
    features: {
      mount: !!constructor.prototype.componentDidMount
    }
  });
}

let state;
Object.defineProperty(fritz$1, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

return fritz$1;

})));
