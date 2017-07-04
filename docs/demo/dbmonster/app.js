(function () {
'use strict';

function getInstance(fritz, id) {
  return fritz._instances[id];
}

function setInstance(fritz, id, instance) {
  fritz._instances[id] = instance;
}

function delInstance(fritz, id) {
  delete fritz._instances[id];
}

function isFunction(val) {
  return typeof val === 'function';
}

const defer = Promise.resolve().then.bind(Promise.resolve());

const sym = typeof Symbol === 'function' ? Symbol : function (v) {
  return '_' + v;
};

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';

let currentInstance = null;

function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
}

let queue = [];

function enqueueRender(instance, sentProps) {
  if (!instance._dirty && (instance._dirty = true) && queue.push([instance, sentProps]) == 1) {
    defer(rerender);
  }
}

function rerender() {
  let p,
      list = queue;
  queue = [];
  while (p = list.pop()) {
    if (p[0]._dirty) render(p[0], p[1]);
  }
}

function render(instance, sentProps) {
  if (sentProps) {
    var nextProps = Object.assign({}, instance.props, sentProps);
    instance.componentWillReceiveProps(nextProps);
    instance.props = nextProps;
  }

  if (instance.shouldComponentUpdate(nextProps) !== false) {
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

  componentWillReceiveProps() {}
  shouldComponentUpdate() {
    return true;
  }
  componentWillUpdate() {}
  componentWillUnmount() {}
}

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
    if (id == null) {
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
    if (!this._store) {
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
  if (eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let handle = Handle$1.from(attrValue);
    currentInstance._fritzHandles[handle.id] = handle;
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

function h(tag, attrs, children) {
  const argsLen = arguments.length;
  if (argsLen === 2) {
    if (typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if (argsLen > 3 || isTree(children) || typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = isFunction(tag);

  if (isFn) {
    var localName = tag.prototype.localName;
    if (localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = createTree();
  var uniq;
  if (attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function (acc, key) {
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if (eventInfo) {
        if (!evs) evs = [];
        evs.push(eventInfo);
      } else if (key === 'key') {
        uniq = value;
      } else {
        acc.push(key);
        acc.push(value);
      }

      return acc;
    }, []);
  }

  var open = [1, tag, uniq];
  if (attrs) {
    open.push(attrs);
  }
  if (evs) {
    open.push(evs);
  }
  tree.push(open);

  if (children) {
    children.forEach(function (child) {
      if (typeof child !== 'undefined' && !Array.isArray(child)) {
        tree.push([4, child + '']);
        return;
      }

      while (child && child.length) {
        tree.push(child.shift());
      }
    });
  }

  tree.push([2, tag]);

  return tree;
}

function render$1(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  let events;
  if (!instance) {
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

function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if (msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    method = inst[methodName];
  }

  if (method) {
    let event = msg.event;
    method.call(inst, event);

    enqueueRender(inst);
  } else {
    // TODO warn?
  }
}

function destroy(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  instance.componentWillUnmount();
  Object.keys(instance._fritzHandles).forEach(function (key) {
    let handle = instance._fritzHandles[key];
    handle.del();
  });
  instance._fritzHandles = Object.create(null);
  delInstance(fritz, msg.id);
}

let hasListened = false;

function relay(fritz) {
  if (!hasListened) {
    hasListened = true;

    self.addEventListener('message', function (ev) {
      let msg = ev.data;
      switch (msg.type) {
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
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  if (constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }
  if (constructor.prototype.render === undefined) {
    let render = constructor;
    constructor = class extends Component {};
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
  set: function (val) {
    state = val;
  },
  get: function () {
    return state;
  }
});

var styles = ".row-container {\n  display: flex;\n  border-top: 1px solid #ddd;\n}\n\n.table-cell {\n  flex: 1;\n  line-height:1.42857143;\n  padding:8px;\n  vertical-align:top;\n}\n\n.label {border-radius:.25em;color:#fff;display:inline;font-size:75%;font-weight:700;line-height:1;padding:.2em .6em .3em;text-align:center;vertical-align:baseline;white-space:nowrap;}\n.label-success {background-color:#5cb85c;}\n.label-warning {background-color:#f0ad4e;}\n\n.popover {background-color:#fff;background-clip:padding-box;border:1px solid #ccc;border:1px solid rgba(0,0,0,.2);border-radius:6px;box-shadow:0 5px 10px rgba(0,0,0,.2);display:none;left:0;max-width:276px;padding:1px;position:absolute;text-align:left;top:0;white-space:normal;z-index:1010;}\n.popover>.arrow:after {border-width:10px;content:\"\";}\n.popover.left {margin-left:-10px;}\n.popover.left > .arrow {border-right-width:0;border-left-color:rgba(0,0,0,.25);margin-top:-11px;right:-11px;top:50%;}\n.popover.left > .arrow:after {border-left-color:#fff;border-right-width:0;bottom:-10px;content:\" \";right:1px;}\n.popover > .arrow {border-width:11px;}\n.popover > .arrow,.popover>.arrow:after {border-color:transparent;border-style:solid;display:block;height:0;position:absolute;width:0;}\n\n.popover-content {padding:9px 14px;}\n\n.Query {position:relative;}\n.Query:hover .popover {display:block;left:-100%;width:100%;}";

function formatElapsed(value) {
  var str = parseFloat(value).toFixed(2);
  if (value > 60) {
    minutes = Math.floor(value / 60);
    comps = (value % 60).toFixed(2).split('.');
    seconds = comps[0].lpad('0', 2);
    ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}

class TableRow extends Component {
  static get props() {
    return { db: {} };
  }

  render({ db }) {
    var rows = [h('style', [styles]), h('div', { 'class': 'table-cell dbname' }, [db.name]), h('div', { class: 'table-cell query-count' }, [h('span', { class: getCountClassName(db) }, [db.queries.length])])].concat(db.topFiveQueries.map(db => h('div', { 'class': 'table-cell ' + elapsedClassName(db.elapsed) }, [formatElapsed(db.elapsed), h('div', { 'class': 'popover left' }, [h('div', { 'class': 'popover-content' }, [db.query]), h('div', { 'class': 'arrow' })])])));

    return h('div', { 'class': 'row-container' }, rows);
  }
}

fritz.define('table-row', TableRow);

var styles$1 = ".table {\n  font-family: \"Helvetica Neue\",Helvetica,Arial,sans-serif;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #333;\n  background-color: #fff;\n}\n\n#link {\n  position: fixed;\n  top: 0; right: 0;\n  font-size: 12px;\n  padding: 5px 10px;\n  background: rgba(255,255,255,0.85);\n  z-index: 5;\n  box-shadow: 0 0 8px rgba(0,0,0,0.6);\n}\n  #link .center {\n    display: block;\n    text-align: center;\n  }\n\n.Query {\n  position: relative;\n}\n\n.Query:hover .popover {\n  left: -100%;\n  width: 100%;\n  display: block;\n}\n\ntable-row {\n  display: block;\n}\n\ntable-row:nth-child(odd) {\n  background: #f9f9f9;\n}";

importScripts('https://cdn.rawgit.com/WebReflection/dbmonster/master/data.js');

class App extends Component {
  static get props() {
    return { counter: {} };
  }

  constructor() {
    super();
  }

  render() {
    var dbs = getData();

    return h('div', [h('style', [styles$1]), h('div', { 'class': 'table table-striped latest-data' }, [h('div', { 'class': 'tbody' }, dbs.map(db => h('table-row', { db: db, key: db.name })))])]);
  }
}

fritz.define('db-monster', App);

}());
