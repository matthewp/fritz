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
const RENDERED = 'rendered';
const CLEANUP = 'cleanup';

class Node {
  insertBefore(child, ref) {
    let idx = this.children.indexOf(ref);
    this.children.splice(idx, 0, child);
  }
  remove(child) {
    let idx = this.children.indexOf(child);
    this.children.splice(idx, 1);
  }
}

class VNode extends Node {}
class VFrag extends Node {
  constructor() {
    super();
    this.children = [];
  }
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

const INSERT = 0;

const SET_ATTR = 2;
const RM_ATTR = 3;
const TEXT = 4;
const EVENT$1 = 5;
const REPLACE = 6;

const enc = new TextEncoder();

function* encodeString(str) {
  yield* enc.encode(str);
  yield 0;
}

function diff(oldTree, newTree, instance) {
  let tree = newTree;
  if (newTree instanceof VNode) {
    tree = new VFrag();
    tree.children = [newTree];
  }

  return Uint16Array.from(idiff(oldTree, tree, 0, { id: 0 }, null, instance));
}

function* idiff(oldNode, newNode, parentId, id, index, instance, orphan) {
  let out = oldNode;
  let thisId = id.id;

  if (typeof newNode === 'string') {
    if (!oldNode) {
      out = new VNode();
      out.nodeValue = newNode;
      out.type = 3;

      if (orphan) {
        yield REPLACE;
        yield parentId;
        yield index;
        yield 3;
        yield* encodeString(newNode);
      } else {
        yield INSERT;
        yield parentId;
        yield index;
        yield 3; // NodeType
        yield* encodeString(newNode);
      }
    } else if (!oldNode.nodeValue) {
      throw new Error('Do not yet support replacing a node with a text node');
    } else if (oldNode.nodeValue === newNode) {
      return oldNode;
    } else {
      oldNode.nodeValue = newNode;

      yield TEXT;
      yield thisId;
      yield* encodeString(newNode);
    }

    return out;
  }

  let vnodeName = newNode.nodeName;
  if (!oldNode || false) {
    out = new VNode();
    out.nodeName = vnodeName;
    out.type = 1;

    yield INSERT;
    yield parentId;
    yield index;
    yield 1;
    yield* encodeString(vnodeName);

    if (oldNode) {
      throw new Error('Move stuff around');
    }
  }

  // TODO fast pass one child

  // Children
  if (newNode.children && newNode.children.length) {
    yield* innerDiffNode(out, newNode, id, instance);
  }

  // Props
  yield* diffProps(out, newNode, thisId, instance);

  return out;
}

function* innerDiffNode(oldNode, newNode, id, instance) {
  let aChildren = oldNode.children && Array.from(oldNode.children),
      bChildren = newNode.children && Array.from(newNode.children),
      children = [],
      keyed = {},
      keyedLen = 0,
      aLen = aChildren && aChildren.length,
      blen = bChildren && bChildren.length,
      childrenLen = 0,
      min = 0,
      parentId = id.id,
      j,
      c,
      f,
      child,
      vchild;

  if (aLen !== 0) {
    for (let i = 0; i < aLen; i++) {
      let child = aChildren[i],

      // TODO props
      props = {},
          key = blen && props ? props.key : null;

      if (key != null) {
        keyedLen++;
        keyed[key] = child;
      } else if (props || true) {
        children[childrenLen++] = child;
      }
    }
  }

  if (blen !== 0) {
    for (let i = 0; i < blen; i++) {
      vchild = bChildren[i];
      child = null;
      let key = vchild.key;

      if (key != null) {
        throw new Error('Keyed matching not yet supported.');
      } else if (min < childrenLen) {
        for (j = min; j < childrenLen; j++) {
          if (children[j] !== undefined && isSameNodeType(c = children[j], vchild)) {
            child = c;
            children[j] = undefined;
            if (j === childrenLen - 1) childrenLen--;
            if (j === min) min++;
            break;
          }
        }
      }

      id.id++;
      f = aChildren && aChildren[i];
      child = yield* idiff(child, vchild, parentId, id, i, instance, f);

      if (child && child !== oldNode && child !== f) {
        // TODO This should put stuff into place
        if (f == null) {
          if (!oldNode.children) {
            oldNode.children = [child];
          } else {
            oldNode.children.push(child);
          }
        }
        // Is nextSibling
        else {
            oldNode.insertBefore(child, f);
            oldNode.remove(f);
          }
      }

      //if(min < )
    }
  }

  // remove orphaned unkeyed children:
  /*while (min<=childrenLen) {
  	if ((child = children[childrenLen--])!==undefined) yield* recollectNodeTree(child, oldNode, parentId);
  }*/
}

function* diffProps(oldNode, newNode, parentId, instance) {
  let name;
  let oldProps = oldNode.props;
  let newProps = newNode.props;

  // Remove props no longer in new props
  if (oldProps) {
    for (name in oldProps) {
      if (!(newProps && newProps[name] != null) && oldProps && oldProps[name] != null) {
        delete oldProps[name];
        yield RM_ATTR;
        yield parentId;
        yield* encodeString(name);
      }
    }
  }

  if (newProps) {
    if (!oldProps) {
      oldProps = oldNode.props = {};
    }

    for (name in newProps) {
      if (!(name in oldProps) || newProps[name] !== oldProps[name]) {
        let value = newProps[name];
        oldProps[name] = value;

        if (typeof value === 'function') {
          yield EVENT$1;
          yield parentId;
          yield* encodeString(name.toLowerCase());

          let handle = Handle$1.from(value);
          handle.inUse = true;
          instance._fritzHandles.set(handle.id, handle);
          yield handle.id;
        } else {
          yield SET_ATTR;
          yield parentId;
          yield* encodeString(name);
          yield* encodeString(value);
        }
      }
    }
  }
}

function isSameNodeType(aNode, bNode) {
  if (typeof bNode === 'string') {
    return aNode.type === 3;
  }
  return aNode.nodeName === bNode.nodeName;
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

    let tree = renderInstance(instance);
    let changes = diff(instance._tree, tree, instance);

    if (changes.length) {
      postMessage({
        type: RENDER,
        id: instance._fritzId,
        tree: changes.buffer
      }, [changes.buffer]);
    }
  }
}

class Component {
  constructor() {
    this.state = {};
    this.props = {};
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

const _tree = sym('ftree');

function createTree() {
  var out = [];
  out[_tree] = true;
  return out;
}

function Fragment(attrs, children) {
  var child;
  var tree = createTree();
  for (var i = 0; i < children.length; i++) {
    child = children[i];
    tree.push.apply(tree, child);
  }
  return tree;
}

function h(tag, props, ...args) {
  let children, child, i;

  if (Array.isArray(props)) {
    args.unshift(props);
    props = null;
  }

  while (args.length) {
    if ((child = args.pop()) && child.pop !== undefined) {
      for (i = child.length; i--;) args.push(child[i]);
    } else {
      if (typeof children === 'undefined') {
        children = [child];
      } else {
        children.push(child);
      }
    }
  }

  let p = new VNode();
  p.nodeName = tag;
  p.children = children;
  p.props = props;
  return p;
}

h.frag = Fragment;

function render$1(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
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
        value: new Map()
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
    let name = msg.event.type;
    let methodName = 'on' + name[0].toUpperCase() + name.substr(1);
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

  let handles = instance._fritzHandles;
  handles.forEach(function (handle) {
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
  msg.handles.forEach(function (id) {
    let handle = handles.get(id);
    handle.del();
    handles.delete(id);
  });
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
  if (constructor.prototype === undefined || constructor.prototype.render === undefined) {
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
    events: constructor.events,
    features: {
      mount: !!constructor.prototype.componentDidMount
    }
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

importScripts('./src/data.js');

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
