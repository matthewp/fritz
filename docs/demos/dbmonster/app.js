(function () {
'use strict';

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';

let currentInstance = null;

function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance);
  currentInstance = null;
  return tree;
}

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

  destroy() {}
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

class Tree extends Array {}

function h(tag, attrs, children) {
  const argsLen = arguments.length;
  if (argsLen === 2) {
    if (typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if (argsLen > 3 || children instanceof Tree || typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if (isFn) {
    var localName = tag.prototype.localName;
    if (localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = new Tree();
  if (attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function (acc, key) {
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if (eventInfo) {
        if (!evs) evs = [];
        evs.push(eventInfo);
      } else {
        acc.push(key);
        acc.push(value);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if (attrs) {
    open.push(attrs);
  }
  if (evs) {
    open.push(evs);
  }
  tree.push(open);

  if (children) {
    children.forEach(function (child) {
      var type = typeof child;
      if (type === 'string' || type === 'number') {
        tree.push([4, child]);
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

class Serializable {
  serialize() {
    let out = Object.create(null);
    return Object.assign(out, this);
  }
}

class Event extends Serializable {
  constructor(type) {
    super();
    this.type = type;
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

function getInstance(fritz, id) {
  return fritz._instances[id];
}

function setInstance(fritz, id, instance) {
  fritz._instances[id] = instance;
}

function delInstance(fritz, id) {
  delete fritz._instances[id];
}

function render(fritz, msg) {
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
    events = constructor.observedEvents;
  }

  Object.assign(instance, props);

  let tree = renderInstance(instance);
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
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
    let event = new Event(msg.name);
    event.value = msg.value;

    method.call(inst, event);
    response.type = RENDER;
    response.id = msg.id;
    response.tree = renderInstance(inst);
    response.event = event.serialize();
    postMessage(response);
  } else {
    // TODO warn?
  }
}

function destroy(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  instance.destroy();
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
          render(fritz, msg);
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
    props: constructor.props
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

var styles = ".row-container {\n  display: flex;\n}\n\n.table-cell {\n  flex: 1;\n}";

class TableRow extends Component {
  static get props() {
    return { db: {} };
  }

  render({ db }) {
    var rows = [h('style', [styles]), h('div', { 'class': 'table-cell dbname' }, [db.name]), h('div', { class: 'table-cell query-count' }, [h('span', { class: getCountClassName(db) }, [db.queries.length])])].concat(db.topFiveQueries.map(db => h('div', { 'class': 'table-cell ' + elapsedClassName(db.elapsed) }, [db.elapsed, h('div', { 'class': 'popover left' }, [h('div', { 'class': 'popover-content' }, [db.query]), h('div', { 'class': 'arrow' })])])));

    return h('div', { 'class': 'row-container' }, rows);
  }
}

fritz.define('table-row', TableRow);

var styles$1 = ".table {\n  font-family: \"Helvetica Neue\",Helvetica,Arial,sans-serif;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #333;\n  background-color: #fff;\n}\n\n#link {\n  position: fixed;\n  top: 0; right: 0;\n  font-size: 12px;\n  padding: 5px 10px;\n  background: rgba(255,255,255,0.85);\n  z-index: 5;\n  box-shadow: 0 0 8px rgba(0,0,0,0.6);\n}\n  #link .center {\n    display: block;\n    text-align: center;\n  }\n\n.Query {\n  position: relative;\n}\n\n.Query:hover .popover {\n  left: -100%;\n  width: 100%;\n  display: block;\n}";

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

    return h('div', [h('style', [styles$1]), h('div', { 'class': 'table table-striped latest-data' }, [h('div', { 'class': 'tbody' }, dbs.map(db => h('table-row', { db: db })))])]);
  }
}

fritz.define('db-monster', App);

}());
