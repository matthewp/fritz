const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';

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
      tree: this.render()
    });
  }
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
};

var Handle$1 = Handle;

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {
  if(eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let id = Handle$1.from(attrValue).id;
    return [1, eventName, id];
  }
}

class Tree extends Array {}

function h(tag, attrs, children){
  const argsLen = arguments.length;
  if(argsLen === 2) {
    if(typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if(argsLen > 3 || (children instanceof Tree) ||
    typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if(isFn) {
    var localName = tag.prototype.localName;
    if(localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = new Tree();
  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      } else {
        acc.push(key);
        acc.push(value);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if(attrs) {
    open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  tree.push(open);

  if(children) {
    children.forEach(function(child){
      if(typeof child === "string") {
        tree.push([4, child]);
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

function getInstance(fritz, id){
  return fritz._instances[id];
}

function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
}

function render(fritz, msg) {
  let id = msg.id;
  let instance = getInstance(fritz, id);
  let events;
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperty(instance, '_fritzId', {
      enumerable: false,
      value: id
    });
    setInstance(fritz, id, instance);
    events = constructor.observedEvents;
  }
  let tree = instance.render();
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
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
    let event = new Event(msg.name);

    method.call(inst, event);
    response.type = RENDER;
    response.id = msg.id;
    response.tree = inst.render();
    response.event = event.serialize();
    postMessage(response);
  } else {
    // TODO warn?
  }
}

let hasListened = false;

function relay(fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case RENDER:
          render(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
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
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }

  fritz._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag
  });
}

export { Component, h };export default fritz;
