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

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';

const APPEND_CHILD = 1;
const REMOVE_CHILD = 2;
const REMOVE_ATTRIBUTE = 3;
const REPLACE_CHILD = 4;
const SET_ATTRIBUTE = 5;
const SET_EVENT = 6;
const SET_PROPERTY = 7;
const TEXT_CONTENT = 8;

const empty = v => v == null;

var compareAttributes = function (src, tar) {
  const { attributes: srcValues } = src;
  const { attributes: tarValues } = tar;
  const instructions = [];

  for (let name in srcValues) {
    if (empty(tarValues[name])) {
      instructions.push({
        data: { name },
        target: tar,
        source: src,
        type: REMOVE_ATTRIBUTE
      });
    }
  }

  for (let name in tarValues) {
    const srcValue = srcValues[name];
    const tarValue = tarValues[name];

    // Only add attributes that have changed.
    if (srcValue !== tarValue && !empty(tarValues[name])) {
      instructions.push({
        data: { name },
        target: tar,
        source: src,
        type: SET_ATTRIBUTE
      });
    }
  }

  return instructions;
};

var compareEvents = function (src, tar) {
  const tarEvents = tar.events;
  const srcEvents = src.events;
  const instructions = [];

  // Remove any source events that aren't in the target before seeing if
  // we need to add any from the target.
  if (srcEvents) {
    for (let name in srcEvents) {
      const srcEvent = srcEvents[name];
      const tarEvent = tarEvents[name];
      if (!tarEvent || srcEvent !== tarEvent) {
        instructions.push({
          data: { name },
          target: tar,
          source: src,
          type: SET_EVENT
        });
      }
    }
  }

  // After instructing to remove any old events, we then can instruct to add
  // new events. This prevents the new events from being removed from earlier
  // instructions.
  if (tarEvents) {
    for (let name in tarEvents) {
      const srcEvent = srcEvents[name];
      const tarEvent = tarEvents[name];
      if (srcEvent !== tarEvent) {
        instructions.push({
          data: { name, value: tarEvent },
          target: tar,
          source: src,
          type: SET_EVENT
        });
      }
    }
  }

  return instructions;
};

var compareProperties = function (src, tar) {
  const { properties: srcValues } = src;
  const { properties: tarValues } = tar;
  const instructions = [];

  for (let name in srcValues) {
    const srcValue = srcValues[name];
    const tarValue = tarValues[name];
    if (srcValue !== tarValue) {
      instructions.push({
        data: { name },
        target: tar,
        source: src,
        type: SET_PROPERTY
      });
    }
  }

  for (let name in tarValues) {
    const srcValue = srcValues[name];
    const tarValue = tarValues[name];
    if (srcValue !== tarValue) {
      instructions.push({
        data: { name },
        target: tar,
        source: src,
        type: SET_PROPERTY
      });
    }
  }

  return instructions;
};

var compareElement = function (src, tar) {
  if (src.localName === tar.localName) {
    return compareAttributes(src, tar)
      .concat(compareEvents(src, tar))
      .concat(compareProperties(src, tar));
  }
};

var compareText = function (src, tar) {
  if (src.textContent === tar.textContent) {
    return [];
  }

  return [{
    target: tar,
    source: src,
    type: TEXT_CONTENT
  }];
};

const NODE_ELEMENT = 1;
const NODE_TEXT = 3;

var compareNode = function (src, tar) {
  const tarType = tar.nodeType;
  const srcType = src.nodeType;

  if (tarType !== srcType) {
    return [];
  } else if (tarType === NODE_ELEMENT) {
    return compareElement(src, tar);
  } else if (tarType === NODE_TEXT) {
    return compareText(src, tar);
  }

  return [];
};

function diffNode (source, target) {
  let nodeInstructions = compareNode(source, target);

  // If there are instructions (even an empty array) it means the node can be
  // diffed and doesn't have to be replaced. If the instructions are falsy
  // it means that the nodes are not similar (cannot be changed) and must be
  // replaced instead.
  if (nodeInstructions) {
    return nodeInstructions.concat(diff(source, target));
  }

  return [{
    target,
    source,
    type: REPLACE_CHILD
  }];
}

function diff (src, tar) {
  let instructions = [];

  const srcChs = src.childNodes;
  const tarChs = tar.childNodes;
  const srcChsLen = srcChs ? srcChs.length : 0;
  const tarChsLen = tarChs ? tarChs.length : 0;

  for (let a = 0; a < tarChsLen; a++) {
    const curSrc = srcChs[a];
    const curtar = tarChs[a];

    // If there is no matching target node it means we need to remove the
    // current source node from the source.
    if (!curSrc) {
      instructions.push({
        target: tarChs[a],
        source: src,
        type: APPEND_CHILD
      });
      continue;
    }

    instructions = instructions.concat(diffNode(curSrc, curtar));
  }

  if (tarChsLen < srcChsLen) {
    for (let a = tarChsLen; a < srcChsLen; a++) {
      instructions.push({
        target: srcChs[a],
        source: src,
        type: REMOVE_CHILD
      });
    }
  }

  return instructions;
}

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
    let tree = renderInstance(instance);
    let instr;
    if(instance._tree) {
      instr = diff(instance._tree, tree);
      tree = null;
    }
    instance._tree = tree;

    postMessage({
      type: RENDER,
      id: instance._fritzId,
      tree: tree,
      instr: instr
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

const nodeType = 3;
var createTextNode = function (textContent) {
  return { nodeType, textContent };
};

// eslint-disable-next-line no-undef
var root = self || global;

// Because weak map polyfills either are too big or don't use native if
// available properly.

let index = 0;
const prefix = '__WEAK_MAP_POLYFILL_';

var WeakMap$1 = (function () {
  if (typeof WeakMap !== 'undefined') {
    return WeakMap;
  }

  function Polyfill () {
    this.key = prefix + index;
    ++index;
  }

  Polyfill.prototype = {
    get (obj) {
      return obj[this.key];
    },
    set (obj, val) {
      obj[this.key] = val;
    }
  };

  return Polyfill;
})();

let { HTMLElement } = root;
if(!HTMLElement) HTMLElement = function(){};
const localNameMap = new WeakMap$1();

function ensureNodes (arr) {
  let out = [];
  if (!Array.isArray(arr)) {
    arr = [arr];
  }
  arr.filter(Boolean).forEach(function (item) {
    if (Array.isArray(item)) {
      out = out.concat(ensureNodes(item));
    } else if (typeof item === 'object') {
      out.push(translateFromReact(item));
    } else {
      out.push(createTextNode(item));
    }
  });
  return out;
}

function ensureObject (val) {
  return val && typeof val === 'object' ? val : {};
}

function isNode (arg) {
  return arg && (typeof arg === 'string' || Array.isArray(arg) || typeof arg.nodeType === 'number' || isReactNode(arg));
}

function isReactNode (item) {
  return item && item.type && item.props;
}

function translateFromReact (item) {
  if (isReactNode(item)) {
    const props = item.props;
    const chren = ensureNodes(props.children);
    delete props.children;
    return {
      attributes: props,
      childNodes: chren,
      localName: item.type,
      nodeType: 1
    };
  }
  return item;
}

let count = 0;
var h$1 = function (localName, props, ...chren) {
  const isPropsNode = isNode(props);

  if (isPropsNode) {
    chren = ensureNodes([props].concat(chren));
    props = {
      attributes: {},
      events: {},
      properties: {}
    };
  } else {
    props = ensureObject(props);
    chren = ensureNodes(chren);
  }

  // If it's a function that isn't an HTMLElement constructor. We test for a
  // common property since this may be used in a worker / non browser
  // environment.
  if (localName.prototype instanceof HTMLElement) {
    const cache = localNameMap.get(localName);
    if (cache) {
      return cache;
    }
    // eslint-disable-next-line new-cap
    const tempLocalName = new localName().localName;
    localNameMap.set(localName, tempLocalName);
    localName = tempLocalName;
  } else if (typeof localName === 'function') {
    return localName(props, chren);
  }

  const node = {
    __id: ++count,
    childNodes: chren,
    localName,
    nodeType: 1
  };

  // Special props
  //
  // - aria: object that sets aria-* attributes
  // - attributes: object of attributes to set
  // - data: object that sets data-* attributes
  // - events: object of event listeners to set
  const { aria, attributes, data, events } = props;

  node.attributes = ensureObject(attributes);
  node.events = ensureObject(events);
  node.properties = ensureObject(props);

  const { attributes: nodeAttributes } = node;

  // Aria attributes
  if (typeof aria === 'object') {
    for (let name in aria) {
      nodeAttributes[`aria-${name}`] = aria[name];
    }
  }

  // Data attributes
  if (typeof data === 'object') {
    for (let name in data) {
      nodeAttributes[`data-${name}`] = data[name];
    }
  }

  // Clean up special props.
  delete props.aria;
  delete props.attributes;
  delete props.data;
  delete props.events;

  return node;
};

let Store;
let Handle;

Store = class {
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
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

function render$1(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  let events;
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
        value: Object.create(null)
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
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
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
  Object.keys(instance._fritzHandles).forEach(function(key){
    let handle = instance._fritzHandles[key];
    handle.del();
  });
  instance._fritzHandles = Object.create(null);
  delInstance(fritz, msg.id);
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
      }
    });
  }
}

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h$1;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }
  if(constructor.prototype.render === undefined) {
    let render = constructor;
    constructor = class extends Component{};
    constructor.prototype.render = render;
  }

  fritz._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag,
    props: constructor.props,
    events: constructor.events
  });
}

let state;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

export { Component, h$1 as h, state };export default fritz;
