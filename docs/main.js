(function () {
'use strict';

function dashCase(str) {
  return typeof str === 'string' ? str.split(/([_A-Z])/).reduce((one, two, idx) => {
    const dash = !one || idx % 2 === 0 ? '' : '-';
    two = two === '_' ? '' : two;
    return `${one}${dash}${two.toLowerCase()}`;
  }) : str;
}

const empty = val => val == null;

function keys(obj) {
  obj = obj || {};
  const names = Object.getOwnPropertyNames(obj);
  return Object.getOwnPropertySymbols ? names.concat(Object.getOwnPropertySymbols(obj)) : names;
}

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

function normaliseAttributeDefinition(name, prop) {
  const { attribute } = prop;
  const obj = typeof attribute === 'object' ? _extends({}, attribute) : {
    source: attribute,
    target: attribute
  };
  if (obj.source === true) {
    obj.source = dashCase(name);
  }
  if (obj.target === true) {
    obj.target = dashCase(name);
  }
  return obj;
}

function normalisePropertyDefinition(name, prop) {
  const { coerce, default: def, deserialize, serialize } = prop;
  return {
    attribute: normaliseAttributeDefinition(name, prop),
    coerce: coerce || (v => v),
    default: def,
    deserialize: deserialize || (v => v),
    serialize: serialize || (v => v)
  };
}

function defineProps(constructor) {
  if (constructor.hasOwnProperty('_propsNormalised')) return;
  const { props } = constructor;
  keys(props).forEach(name => {
    let func = props[name];
    if (typeof func !== 'function') func = prop(func);
    func({ constructor }, name);
  });
}

function delay(fn) {
  if (window.Promise) {
    Promise.resolve().then(fn);
  } else {
    setTimeout(fn);
  }
}

function prop(definition) {
  const propertyDefinition = definition || {};

  // Allows decorators, or imperative definitions.
  const func = function ({ constructor }, name) {
    const normalised = normalisePropertyDefinition(name, propertyDefinition);

    // Ensure that we can cache properties. We have to do this so the _props object literal doesn't modify parent
    // classes or share the instance anywhere where it's not intended to be shared explicitly in userland code.
    if (!constructor.hasOwnProperty('_propsNormalised')) {
      constructor._propsNormalised = {};
    }

    // Cache the value so we can reference when syncing the attribute to the property.
    constructor._propsNormalised[name] = normalised;
    const { attribute: { source, target } } = normalised;

    if (source) {
      constructor._observedAttributes.push(source);
      constructor._attributeToPropertyMap[source] = name;
      if (source !== target) {
        constructor._attributeToAttributeMap[source] = target;
      }
    }

    Object.defineProperty(constructor.prototype, name, {
      configurable: true,
      get() {
        const val = this._props[name];
        return val == null ? normalised.default : val;
      },
      set(val) {
        const { attribute: { target }, serialize } = normalised;
        if (target) {
          const serializedVal = serialize ? serialize(val) : val;
          if (serializedVal == null) {
            this.removeAttribute(target);
          } else {
            this.setAttribute(target, serializedVal);
          }
        }
        this._props[name] = normalised.coerce(val);
        this.triggerUpdate();
      }
    });
  };

  // Allows easy extension of pre-defined props { ...prop(), ...{} }.
  Object.keys(propertyDefinition).forEach(key => func[key] = propertyDefinition[key]);

  return func;
}

const withUpdate = (Base = HTMLElement) => {
  var _class, _temp2;

  return _temp2 = _class = class extends Base {
    constructor(...args) {
      var _temp;

      return _temp = super(...args), this._prevProps = {}, this._prevState = {}, this._props = {}, this._state = {}, _temp;
    }

    static get observedAttributes() {
      // We have to define props here because observedAttributes are retrieved
      // only once when the custom element is defined. If we did this only in
      // the constructor, then props would not link to attributes.
      defineProps(this);
      return this._observedAttributes;
    }

    static get props() {
      return this._props;
    }

    static set props(props) {
      this._props = props;
    }

    get props() {
      return keys(this.constructor.props).reduce((prev, curr) => {
        prev[curr] = this[curr];
        return prev;
      }, {});
    }

    set props(props) {
      const ctorProps = this.constructor.props;
      keys(props).forEach(k => k in ctorProps && (this[k] = props[k]));
    }

    get state() {
      return this._state;
    }

    set state(state) {
      this._state = state;
      this.triggerUpdate();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const {
        _attributeToAttributeMap,
        _attributeToPropertyMap,
        props
      } = this.constructor;

      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, oldValue, newValue);
      }

      const propertyName = _attributeToPropertyMap[name];
      if (propertyName) {
        const propertyDefinition = props[propertyName];
        if (propertyDefinition) {
          const { default: defaultValue, deserialize } = propertyDefinition;
          const propertyValue = deserialize ? deserialize(newValue) : newValue;
          this._props[propertyName] = propertyValue == null ? defaultValue : propertyValue;
        }
      }

      const targetAttributeName = _attributeToAttributeMap[name];
      if (targetAttributeName) {
        if (newValue == null) {
          this.removeAttribute(targetAttributeName);
        } else {
          this.setAttribute(targetAttributeName, newValue);
        }
      }
    }

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }
      this.triggerUpdate();
    }

    shouldUpdate() {
      return true;
    }

    triggerUpdate() {
      if (this._updating) {
        return;
      }
      this._updating = true;
      delay(() => {
        const { _prevProps, _prevState } = this;
        if (this.updating) {
          this.updating(_prevProps, _prevState);
        }
        if (this.updated && this.shouldUpdate(_prevProps, _prevState)) {
          this.updated(_prevProps, _prevState);
        }
        this._prevProps = this.props;
        this._prevState = this.state;
        this._updating = false;
      });
    }
  }, _class._attributeToAttributeMap = {}, _class._attributeToPropertyMap = {}, _class._observedAttributes = [], _class._props = {}, _temp2;
};

const { parse, stringify } = JSON;
const attribute = Object.freeze({ source: true });
const zeroOrNumber = val => empty(val) ? 0 : Number(val);

const any = prop({
  attribute
});

const array = prop({
  attribute,
  coerce: val => Array.isArray(val) ? val : empty(val) ? null : [val],
  default: Object.freeze([]),
  deserialize: parse,
  serialize: stringify
});

const boolean = prop({
  attribute,
  coerce: Boolean,
  default: false,
  deserialize: val => !empty(val),
  serialize: val => val ? '' : null
});

const number = prop({
  attribute,
  default: 0,
  coerce: zeroOrNumber,
  deserialize: zeroOrNumber,
  serialize: val => empty(val) ? null : String(Number(val))
});

const object = prop({
  attribute,
  default: Object.freeze({}),
  deserialize: parse,
  serialize: stringify
});

const string = prop({
  attribute,
  default: '',
  coerce: String,
  serialize: val => empty(val) ? null : String(val)
});

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';
const RENDERED = 'rendered';
const CLEANUP = 'cleanup';

let currentComponent;

function setComponent(component) {
  let previousComponent = currentComponent;
  setComponentTo(component);
  return setComponentTo.bind(null, previousComponent);
}

function setComponentTo(component) {
  currentComponent = component;
}

/**
 * The algorithm to determine when mounted is:
 * 1. When a component is updated, it and parents are updating
 * 2. When children have rendered, parent is done.
 * 3. If no children, parent done after own render.
 */

function withMount(Base) {
  return class extends Base {
    constructor() {
      super();
      this._resetComponent = Function.prototype; // placeholder
      this._parentComponent = currentComponent;
      this._renderCount = 0;
      this._hasChildComponents = false;
      this._amMounted = false;
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this._parentComponent) {
        this._parentComponent._hasChildComponents = true;
      }
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      this._amMounted = false;
    }

    renderer() {
      if (super.renderer) super.renderer();
      this._renderCount = 0;
      if (this._parentComponent) {
        this._parentComponent._incrementRender();
      }
    }

    beforeRender() {
      this._resetComponent = setComponent(this);
    }

    afterRender() {
      this._resetComponent();
      this._resetComponent = Function.prototype;

      if (!this._amMounted && !this._hasChildComponents) {
        this._checkIfRendered();
      }
    }

    _incrementRender() {
      this._renderCount++;
    }

    _decrementRender() {
      this._renderCount--;
      this._checkIfRendered();
    }

    _checkIfRendered() {
      if (this._amMounted) return;

      if (this._renderCount === 0) {
        this._amMounted = true;
        this._worker.postMessage({
          type: RENDERED,
          id: this._id
        });

        if (this._parentComponent) {
          this._parentComponent._decrementRender();
        }
      }
    }
  };
}

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
    handle: handle
  });
}

function withWorkerEvents(Base = HTMLElement) {
  return class extends Base {
    constructor() {
      super();
      this._handlers = Object.create(null);
    }

    addEventCallback(handleId, eventProp) {
      var key = handleId;
      var fn;
      if (fn = this._handlers[key]) {
        return fn;
      }

      // TODO optimize this so functions are reused if possible.
      var self = this;
      fn = function (ev) {
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
        get: function () {
          return this[priv];
        },
        set: function (val) {
          var cur;
          if (cur = this[priv]) {
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

    handleOrphanedHandles(handles) {
      if (handles.length) {
        let worker = this._worker;
        worker.postMessage({
          type: CLEANUP,
          id: this._id,
          handles: handles
        });
        let handlers = this._handlers;
        handles.forEach(function (id) {
          delete handlers[id];
        });
      }
    }
  };
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

function isFunction(val) {
  return typeof val === 'function';
}

const defer = Promise.resolve().then.bind(Promise.resolve());

const INSERT = 0;
const REMOVE = 1;
const SET_ATTR = 2;
const RM_ATTR = 3;
const TEXT = 4;
const EVENT$1 = 5;
const REPLACE = 6;
const PROP = 7;

/**
 * @license
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A cached reference to the hasOwnProperty function.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * A constructor function that will create blank objects.
 * @constructor
 */
function Blank() {}

Blank.prototype = Object.create(null);

/**
 * Used to prevent property collisions between our "map" and its prototype.
 * @param {!Object<string, *>} map The map to check.
 * @param {string} property The property to check.
 * @return {boolean} Whether map has property.
 */
var has = function (map, property) {
  return hasOwnProperty.call(map, property);
};

/**
 * Creates an map object without a prototype.
 * @return {!Object}
 */
var createMap = function () {
  return new Blank();
};

/**
 * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const */
var symbols = {
  default: '__default'
};

/**
 * @param {string} name
 * @return {string|undefined} The namespace to use for the attribute.
 */
var getNamespace = function (name) {
  if (name.lastIndexOf('xml:', 0) === 0) {
    return 'http://www.w3.org/XML/1998/namespace';
  }

  if (name.lastIndexOf('xlink:', 0) === 0) {
    return 'http://www.w3.org/1999/xlink';
  }
};

/**
 * Applies an attribute or property to a given Element. If the value is null
 * or undefined, it is removed from the Element. Otherwise, the value is set
 * as an attribute.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {?(boolean|number|string)=} value The attribute's value.
 */
var applyAttr = function (el, name, value) {
  if (value == null) {
    el.removeAttribute(name);
  } else {
    var attrNS = getNamespace(name);
    if (attrNS) {
      el.setAttributeNS(attrNS, name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
};

/**
 * Applies a property to a given Element.
 * @param {!Element} el
 * @param {string} name The property's name.
 * @param {*} value The property's value.
 */
var applyProp = function (el, name, value) {
  el[name] = value;
};

/**
 * Applies a value to a style declaration. Supports CSS custom properties by
 * setting properties containing a dash using CSSStyleDeclaration.setProperty.
 * @param {CSSStyleDeclaration} style
 * @param {!string} prop
 * @param {*} value
 */
var setStyleValue = function (style, prop, value) {
  if (prop.indexOf('-') >= 0) {
    style.setProperty(prop, /** @type {string} */value);
  } else {
    style[prop] = value;
  }
};

/**
 * Applies a style to an Element. No vendor prefix expansion is done for
 * property names/values.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {*} style The style to set. Either a string of css or an object
 *     containing property-value pairs.
 */
var applyStyle = function (el, name, style) {
  if (typeof style === 'string') {
    el.style.cssText = style;
  } else {
    el.style.cssText = '';
    var elStyle = el.style;
    var obj = /** @type {!Object<string,string>} */style;

    for (var prop in obj) {
      if (has(obj, prop)) {
        setStyleValue(elStyle, prop, obj[prop]);
      }
    }
  }
};

/**
 * Updates a single attribute on an Element.
 * @param {!Element} el
 * @param {string} name The attribute's name.
 * @param {*} value The attribute's value. If the value is an object or
 *     function it is set on the Element, otherwise, it is set as an HTML
 *     attribute.
 */
var applyAttributeTyped = function (el, name, value) {
  var type = typeof value;

  if (type === 'object' || type === 'function') {
    applyProp(el, name, value);
  } else {
    applyAttr(el, name, /** @type {?(boolean|number|string)} */value);
  }
};

/**
 * A publicly mutable object to provide custom mutators for attributes.
 * @const {!Object<string, function(!Element, string, *)>}
 */
var attributes = createMap();

// Special generic mutator that's called for any attribute that does not
// have a specific mutator.
attributes[symbols.default] = applyAttributeTyped;

attributes['style'] = applyStyle;

const FN_HANDLE = Symbol('fritz.handle');

function decodeString(iter) {
  let out = "",
      c;
  while (true) {
    c = iter.next().value;
    if (c === 0) return out;
    out += String.fromCharCode(c);
  }
}

function* walk(root, nextIndex) {
  const document = root.ownerDocument;
  const walker = document.createTreeWalker(root, -1);
  let index = 0;
  let currentNode; // = walker.nextNode();

  while (true) {
    if (nextIndex === 0) {
      nextIndex = yield root;
    } else if (index === nextIndex) {
      nextIndex = yield currentNode;
    } else if (index < nextIndex) {
      index++;
      currentNode = walker.nextNode();
    } else {
      index--;
      currentNode = walker.previousNode();
    }
  }
}

function getNode(walker, index) {
  return walker.next(index).value;
}

function getChild(parent, index) {
  let i = 0,
      child = parent.firstChild;
  while (i < index) {
    i++;
    child = child.nextSibling;
  }
  return child;
}

function patch$$1(ab, root, component, props) {
  let instr = new Uint16Array(ab);
  let iter = instr[Symbol.iterator]();
  let orphanedHandles = [];
  let document = root.ownerDocument;
  let walker = walk(root, 0);
  walker.next();

  for (let c of iter) {
    switch (c) {
      case INSERT:
        {
          let id = iter.next().value;
          let index = iter.next().value;
          let nodeType = iter.next().value;
          let node;
          if (nodeType === 1) {
            let nodeName = decodeString(iter);
            node = document.createElement(nodeName);
          } else if (nodeType === 3) {
            node = document.createTextNode(decodeString(iter));
          }

          let parent = getNode(walker, id);
          let ref = getChild(parent, index);
          if (ref) {
            parent.insertBefore(node, ref);
          } else {
            parent.appendChild(node);
          }

          break;
        }
      case REMOVE:
        {
          let id = iter.next().value;
          let index = iter.next().value;
          let parent = getNode(walker, id);
          let child = getChild(parent, index);
          parent.removeChild(child);
          break;
        }
      case REPLACE:
        {
          let id = iter.next().value;
          let index = iter.next().value;
          let nodeType = iter.next().value;

          let parent = getNode(walker, id);
          let ref = getChild(parent, index);
          let node;
          if (nodeType === 3) {
            node = document.createTextNode(decodeString(iter));
          } else {
            throw new Error('Not yet supported');
          }
          parent.replaceChild(node, ref);
          break;
        }
      case EVENT$1:
        {
          let id = iter.next().value;
          let prop = decodeString(iter);
          let handleId = iter.next().value;
          let parent = getNode(walker, id);

          let fn = parent[prop];
          if (fn) {
            orphanedHandles.push(fn[FN_HANDLE]);
          }

          fn = component.addEventCallback(handleId);
          fn[FN_HANDLE] = handleId;

          if (!(name in parent) && isFunction(parent.addEventProperty)) {
            parent.addEventProperty(prop);
          }

          // TODO this should probably be addEventListener
          parent[prop] = fn;

          break;
        }
      case TEXT:
        {
          let id = iter.next().value;
          let nodeValue = decodeString(iter);
          let tn = getNode(walker, id);
          tn.nodeValue = nodeValue;
          break;
        }
      case SET_ATTR:
        {
          let id = iter.next().value;
          let name = decodeString(iter);
          let value = decodeString(iter);
          let parent = getNode(walker, id);
          parent.setAttribute(name, value);
          break;
        }
      case RM_ATTR:
        {
          let id = iter.next().value;
          let name = decodeString(iter);
          let parent = getNode(walker, id);
          parent.removeAttribute(name);
          break;
        }
      case PROP:
        {
          let id = iter.next().value;
          let key = decodeString(iter);
          let name = decodeString(iter);
          let parent = getNode(walker, id);
          let value = props[key];
          parent[name] = value;
          break;
        }
      default:
        throw new Error(`The instruction ${c} has not been implemented.`);
    }
  }

  return orphanedHandles;
}

function shadow(elem) {
  return elem._shadowRoot || (elem._shadowRoot = elem.shadowRoot || elem.attachShadow({ mode: 'open' }));
}

const withRenderer = (Base = HTMLElement) => {
  return class extends Base {

    get renderRoot() {
      return super.renderRoot || shadow(this);
    }

    renderer(root, html) {
      if (super.renderer) {
        super.renderer(root, html);
      } else {
        root.innerHTML = html() || '';
      }
    }

    updated(...args) {
      super.updated && super.updated(...args);
      this.rendering && this.rendering();
      this.renderer(this.renderRoot, () => this.render && this.render(this));
      this.rendered && this.rendered();
    }
  };
};

function withWorkerRender(Base = HTMLElement) {
  return class extends withRenderer(Base) {
    constructor() {
      super();
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }
    }

    renderer() {
      this._worker.postMessage({
        type: RENDER,
        tag: this.localName,
        id: this._id,
        props: this.props
      });
    }

    beforeRender() {}
    afterRender() {}

    doRenderCallback(vdom, props) {
      this.beforeRender();
      let out = patch$$1(vdom, this.shadowRoot, this, props);
      this.afterRender();
      this.handleOrphanedHandles(out);
    }
  };
}

function withComponent(options) {
  let Base = withWorkerRender(withUpdate(HTMLElement));

  Base = withWorkerEvents(Base);

  if (options.mount) {
    Base = withMount(Base);
  }

  return Base;
}

function withWorkerConnection(fritz, events, props, worker, Base) {
  return class extends Base {
    static get props() {
      return props;
    }

    constructor() {
      super();
      this._id = ++fritz._id;
      this._worker = worker;
    }

    connectedCallback() {
      super.connectedCallback();
      setInstance(fritz, this._id, this);
      events.forEach(eventName => {
        this.shadowRoot.addEventListener(eventName, this);
      });
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) super.disconnectedCallback();
      delInstance(fritz, this._id);
      events.forEach(eventName => {
        this.shadowRoot.removeEventListener(eventName, this);
      });
      this._worker.postMessage({
        type: DESTROY,
        id: this._id
      });
    }
  };
}

function define$1(fritz, msg) {
  let worker = this;
  let tagName = msg.tag;
  let props = msg.props || {};
  let events = msg.events || [];
  let features = msg.features;

  let Element = withWorkerConnection(fritz, events, props, worker, withComponent(features));

  customElements.define(tagName, Element);
}

function render(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  if (instance !== undefined) {
    instance.doRenderCallback(msg.tree, msg.props);
  }
}

function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let ev = msg.event;
  let event = new CustomEvent(ev.type, {
    bubbles: true, //ev.bubbles,
    cancelable: ev.cancelable,
    detail: ev.detail,
    scoped: ev.scoped,
    composed: ev.composed
  });

  inst.dispatchEvent(event);
}

function sendState(fritz, worker) {
  let workers = worker ? [worker] : fritz._workers;
  let state = fritz.state;
  workers.forEach(function (worker) {
    worker.postMessage({
      type: STATE,
      state: state
    });
  });
}

const fritz = Object.create(null);
fritz.tags = Object.create(null);
fritz._id = 1;
fritz._instances = Object.create(null);
fritz._workers = [];
fritz._work = [];

function use(worker) {
  fritz._workers.push(worker);
  worker.addEventListener('message', handleMessage);
  if (fritz.state) {
    sendState(fritz, worker);
  }
}

function handleMessage(ev) {
  let msg = ev.data;
  switch (msg.type) {
    case DEFINE:
      define$1.call(this, fritz, msg);
      break;
    case RENDER:
      render(fritz, msg);
      break;
    case TRIGGER:
      trigger(fritz, msg);
  }
}

fritz.use = use;

Object.defineProperty(fritz, 'state', {
  set: function (val) {
    this._state = val;
    sendState(fritz);
  },
  get: function () {
    return this._state;
  }
});

var styles = "/*!\n * Agate by Taufik Nurrohman <https://github.com/tovic>\n * ----------------------------------------------------\n *\n * #ade5fc\n * #a2fca2\n * #c6b4f0\n * #d36363\n * #fcc28c\n * #fc9b9b\n * #ffa\n * #fff\n * #333\n * #62c8f3\n * #888\n *\n */\n\n.hljs {\n  display: block;\n  overflow-x: auto;\n  padding: 0.5em;\n  background: #333;\n  color: white;\n}\n\n.hljs-name,\n.hljs-strong {\n  font-weight: bold;\n}\n\n.hljs-code,\n.hljs-emphasis {\n  font-style: italic;\n}\n\n.hljs-tag {\n  color: #62c8f3;\n}\n\n.hljs-variable,\n.hljs-template-variable,\n.hljs-selector-id,\n.hljs-selector-class {\n  color: #ade5fc;\n}\n\n.hljs-string,\n.hljs-bullet {\n  color: #a2fca2;\n}\n\n.hljs-type,\n.hljs-title,\n.hljs-section,\n.hljs-attribute,\n.hljs-quote,\n.hljs-built_in,\n.hljs-builtin-name {\n  color: #ffa;\n}\n\n.hljs-number,\n.hljs-symbol,\n.hljs-bullet {\n  color: #d36363;\n}\n\n.hljs-keyword,\n.hljs-selector-tag,\n.hljs-literal {\n  color: #fcc28c;\n}\n\n.hljs-comment,\n.hljs-deletion,\n.hljs-code {\n  color: #888;\n}\n\n.hljs-regexp,\n.hljs-link {\n  color: #c6b4f0;\n}\n\n.hljs-meta {\n  color: #fc9b9b;\n}\n\n.hljs-deletion {\n  background-color: #fc9b9b;\n  color: #333;\n}\n\n.hljs-addition {\n  background-color: #a2fca2;\n  color: #333;\n}\n\n.hljs a {\n  color: inherit;\n}\n\n.hljs a:focus,\n.hljs a:hover {\n  color: inherit;\n  text-decoration: underline;\n}\n";

/*! highlight.js v9.11.0 | BSD3 License | git.io/hljslicense */
!function (e) {
  var n = "object" == typeof window && window || "object" == typeof self && self;"undefined" != typeof exports ? e(exports) : n && (n.hljs = e({}), "function" == typeof define && define.amd && define([], function () {
    return n.hljs;
  }));
}(function (e) {
  function n(e) {
    return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }function t(e) {
    return e.nodeName.toLowerCase();
  }function r(e, n) {
    var t = e && e.exec(n);return t && 0 === t.index;
  }function a(e) {
    return k.test(e);
  }function i(e) {
    var n,
        t,
        r,
        i,
        o = e.className + " ";if (o += e.parentNode ? e.parentNode.className : "", t = B.exec(o)) return w(t[1]) ? t[1] : "no-highlight";for (o = o.split(/\s+/), n = 0, r = o.length; r > n; n++) if (i = o[n], a(i) || w(i)) return i;
  }function o(e) {
    var n,
        t = {},
        r = Array.prototype.slice.call(arguments, 1);for (n in e) t[n] = e[n];return r.forEach(function (e) {
      for (n in e) t[n] = e[n];
    }), t;
  }function u(e) {
    var n = [];return function r(e, a) {
      for (var i = e.firstChild; i; i = i.nextSibling) 3 === i.nodeType ? a += i.nodeValue.length : 1 === i.nodeType && (n.push({ event: "start", offset: a, node: i }), a = r(i, a), t(i).match(/br|hr|img|input/) || n.push({ event: "stop", offset: a, node: i }));return a;
    }(e, 0), n;
  }function c(e, r, a) {
    function i() {
      return e.length && r.length ? e[0].offset !== r[0].offset ? e[0].offset < r[0].offset ? e : r : "start" === r[0].event ? e : r : e.length ? e : r;
    }function o(e) {
      function r(e) {
        return " " + e.nodeName + '="' + n(e.value).replace('"', "&quot;") + '"';
      }s += "<" + t(e) + E.map.call(e.attributes, r).join("") + ">";
    }function u(e) {
      s += "</" + t(e) + ">";
    }function c(e) {
      ("start" === e.event ? o : u)(e.node);
    }for (var l = 0, s = "", f = []; e.length || r.length;) {
      var g = i();if (s += n(a.substring(l, g[0].offset)), l = g[0].offset, g === e) {
        f.reverse().forEach(u);do c(g.splice(0, 1)[0]), g = i(); while (g === e && g.length && g[0].offset === l);f.reverse().forEach(o);
      } else "start" === g[0].event ? f.push(g[0].node) : f.pop(), c(g.splice(0, 1)[0]);
    }return s + n(a.substr(l));
  }function l(e) {
    return e.v && !e.cached_variants && (e.cached_variants = e.v.map(function (n) {
      return o(e, { v: null }, n);
    })), e.cached_variants || e.eW && [o(e)] || [e];
  }function s(e) {
    function n(e) {
      return e && e.source || e;
    }function t(t, r) {
      return new RegExp(n(t), "m" + (e.cI ? "i" : "") + (r ? "g" : ""));
    }function r(a, i) {
      if (!a.compiled) {
        if (a.compiled = !0, a.k = a.k || a.bK, a.k) {
          var o = {},
              u = function (n, t) {
            e.cI && (t = t.toLowerCase()), t.split(" ").forEach(function (e) {
              var t = e.split("|");o[t[0]] = [n, t[1] ? Number(t[1]) : 1];
            });
          };"string" == typeof a.k ? u("keyword", a.k) : x(a.k).forEach(function (e) {
            u(e, a.k[e]);
          }), a.k = o;
        }a.lR = t(a.l || /\w+/, !0), i && (a.bK && (a.b = "\\b(" + a.bK.split(" ").join("|") + ")\\b"), a.b || (a.b = /\B|\b/), a.bR = t(a.b), a.e || a.eW || (a.e = /\B|\b/), a.e && (a.eR = t(a.e)), a.tE = n(a.e) || "", a.eW && i.tE && (a.tE += (a.e ? "|" : "") + i.tE)), a.i && (a.iR = t(a.i)), null == a.r && (a.r = 1), a.c || (a.c = []), a.c = Array.prototype.concat.apply([], a.c.map(function (e) {
          return l("self" === e ? a : e);
        })), a.c.forEach(function (e) {
          r(e, a);
        }), a.starts && r(a.starts, i);var c = a.c.map(function (e) {
          return e.bK ? "\\.?(" + e.b + ")\\.?" : e.b;
        }).concat([a.tE, a.i]).map(n).filter(Boolean);a.t = c.length ? t(c.join("|"), !0) : { exec: function () {
            return null;
          } };
      }
    }r(e);
  }function f(e, t, a, i) {
    function o(e, n) {
      var t, a;for (t = 0, a = n.c.length; a > t; t++) if (r(n.c[t].bR, e)) return n.c[t];
    }function u(e, n) {
      if (r(e.eR, n)) {
        for (; e.endsParent && e.parent;) e = e.parent;return e;
      }return e.eW ? u(e.parent, n) : void 0;
    }function c(e, n) {
      return !a && r(n.iR, e);
    }function l(e, n) {
      var t = N.cI ? n[0].toLowerCase() : n[0];return e.k.hasOwnProperty(t) && e.k[t];
    }function p(e, n, t, r) {
      var a = r ? "" : I.classPrefix,
          i = '<span class="' + a,
          o = t ? "" : C;return i += e + '">', i + n + o;
    }function h() {
      var e, t, r, a;if (!E.k) return n(k);for (a = "", t = 0, E.lR.lastIndex = 0, r = E.lR.exec(k); r;) a += n(k.substring(t, r.index)), e = l(E, r), e ? (B += e[1], a += p(e[0], n(r[0]))) : a += n(r[0]), t = E.lR.lastIndex, r = E.lR.exec(k);return a + n(k.substr(t));
    }function d() {
      var e = "string" == typeof E.sL;if (e && !y[E.sL]) return n(k);var t = e ? f(E.sL, k, !0, x[E.sL]) : g(k, E.sL.length ? E.sL : void 0);return E.r > 0 && (B += t.r), e && (x[E.sL] = t.top), p(t.language, t.value, !1, !0);
    }function b() {
      L += null != E.sL ? d() : h(), k = "";
    }function v(e) {
      L += e.cN ? p(e.cN, "", !0) : "", E = Object.create(e, { parent: { value: E } });
    }function m(e, n) {
      if (k += e, null == n) return b(), 0;var t = o(n, E);if (t) return t.skip ? k += n : (t.eB && (k += n), b(), t.rB || t.eB || (k = n)), v(t, n), t.rB ? 0 : n.length;var r = u(E, n);if (r) {
        var a = E;a.skip ? k += n : (a.rE || a.eE || (k += n), b(), a.eE && (k = n));do E.cN && (L += C), E.skip || (B += E.r), E = E.parent; while (E !== r.parent);return r.starts && v(r.starts, ""), a.rE ? 0 : n.length;
      }if (c(n, E)) throw new Error('Illegal lexeme "' + n + '" for mode "' + (E.cN || "<unnamed>") + '"');return k += n, n.length || 1;
    }var N = w(e);if (!N) throw new Error('Unknown language: "' + e + '"');s(N);var R,
        E = i || N,
        x = {},
        L = "";for (R = E; R !== N; R = R.parent) R.cN && (L = p(R.cN, "", !0) + L);var k = "",
        B = 0;try {
      for (var M, j, O = 0;;) {
        if (E.t.lastIndex = O, M = E.t.exec(t), !M) break;j = m(t.substring(O, M.index), M[0]), O = M.index + j;
      }for (m(t.substr(O)), R = E; R.parent; R = R.parent) R.cN && (L += C);return { r: B, value: L, language: e, top: E };
    } catch (T) {
      if (T.message && -1 !== T.message.indexOf("Illegal")) return { r: 0, value: n(t) };throw T;
    }
  }function g(e, t) {
    t = t || I.languages || x(y);var r = { r: 0, value: n(e) },
        a = r;return t.filter(w).forEach(function (n) {
      var t = f(n, e, !1);t.language = n, t.r > a.r && (a = t), t.r > r.r && (a = r, r = t);
    }), a.language && (r.second_best = a), r;
  }function p(e) {
    return I.tabReplace || I.useBR ? e.replace(M, function (e, n) {
      return I.useBR && "\n" === e ? "<br>" : I.tabReplace ? n.replace(/\t/g, I.tabReplace) : "";
    }) : e;
  }function h(e, n, t) {
    var r = n ? L[n] : t,
        a = [e.trim()];return e.match(/\bhljs\b/) || a.push("hljs"), -1 === e.indexOf(r) && a.push(r), a.join(" ").trim();
  }function d(e) {
    var n,
        t,
        r,
        o,
        l,
        s = i(e);a(s) || (I.useBR ? (n = document.createElementNS("http://www.w3.org/1999/xhtml", "div"), n.innerHTML = e.innerHTML.replace(/\n/g, "").replace(/<br[ \/]*>/g, "\n")) : n = e, l = n.textContent, r = s ? f(s, l, !0) : g(l), t = u(n), t.length && (o = document.createElementNS("http://www.w3.org/1999/xhtml", "div"), o.innerHTML = r.value, r.value = c(t, u(o), l)), r.value = p(r.value), e.innerHTML = r.value, e.className = h(e.className, s, r.language), e.result = { language: r.language, re: r.r }, r.second_best && (e.second_best = { language: r.second_best.language, re: r.second_best.r }));
  }function b(e) {
    I = o(I, e);
  }function v() {
    if (!v.called) {
      v.called = !0;var e = document.querySelectorAll("pre code");E.forEach.call(e, d);
    }
  }function m() {
    addEventListener("DOMContentLoaded", v, !1), addEventListener("load", v, !1);
  }function N(n, t) {
    var r = y[n] = t(e);r.aliases && r.aliases.forEach(function (e) {
      L[e] = n;
    });
  }function R() {
    return x(y);
  }function w(e) {
    return e = (e || "").toLowerCase(), y[e] || y[L[e]];
  }var E = [],
      x = Object.keys,
      y = {},
      L = {},
      k = /^(no-?highlight|plain|text)$/i,
      B = /\blang(?:uage)?-([\w-]+)\b/i,
      M = /((^(<[^>]+>|\t|)+|(?:\n)))/gm,
      C = "</span>",
      I = { classPrefix: "hljs-", tabReplace: null, useBR: !1, languages: void 0 };return e.highlight = f, e.highlightAuto = g, e.fixMarkup = p, e.highlightBlock = d, e.configure = b, e.initHighlighting = v, e.initHighlightingOnLoad = m, e.registerLanguage = N, e.listLanguages = R, e.getLanguage = w, e.inherit = o, e.IR = "[a-zA-Z]\\w*", e.UIR = "[a-zA-Z_]\\w*", e.NR = "\\b\\d+(\\.\\d+)?", e.CNR = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", e.BNR = "\\b(0b[01]+)", e.RSR = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", e.BE = { b: "\\\\[\\s\\S]", r: 0 }, e.ASM = { cN: "string", b: "'", e: "'", i: "\\n", c: [e.BE] }, e.QSM = { cN: "string", b: '"', e: '"', i: "\\n", c: [e.BE] }, e.PWM = { b: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/ }, e.C = function (n, t, r) {
    var a = e.inherit({ cN: "comment", b: n, e: t, c: [] }, r || {});return a.c.push(e.PWM), a.c.push({ cN: "doctag", b: "(?:TODO|FIXME|NOTE|BUG|XXX):", r: 0 }), a;
  }, e.CLCM = e.C("//", "$"), e.CBCM = e.C("/\\*", "\\*/"), e.HCM = e.C("#", "$"), e.NM = { cN: "number", b: e.NR, r: 0 }, e.CNM = { cN: "number", b: e.CNR, r: 0 }, e.BNM = { cN: "number", b: e.BNR, r: 0 }, e.CSSNM = { cN: "number", b: e.NR + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?", r: 0 }, e.RM = { cN: "regexp", b: /\//, e: /\/[gimuy]*/, i: /\n/, c: [e.BE, { b: /\[/, e: /\]/, r: 0, c: [e.BE] }] }, e.TM = { cN: "title", b: e.IR, r: 0 }, e.UTM = { cN: "title", b: e.UIR, r: 0 }, e.METHOD_GUARD = { b: "\\.\\s*" + e.UIR, r: 0 }, e;
});hljs.registerLanguage("css", function (e) {
  var c = "[a-zA-Z-][a-zA-Z0-9_-]*",
      t = { b: /[A-Z\_\.\-]+\s*:/, rB: !0, e: ";", eW: !0, c: [{ cN: "attribute", b: /\S/, e: ":", eE: !0, starts: { eW: !0, eE: !0, c: [{ b: /[\w-]+\(/, rB: !0, c: [{ cN: "built_in", b: /[\w-]+/ }, { b: /\(/, e: /\)/, c: [e.ASM, e.QSM] }] }, e.CSSNM, e.QSM, e.ASM, e.CBCM, { cN: "number", b: "#[0-9A-Fa-f]+" }, { cN: "meta", b: "!important" }] } }] };return { cI: !0, i: /[=\/|'\$]/, c: [e.CBCM, { cN: "selector-id", b: /#[A-Za-z0-9_-]+/ }, { cN: "selector-class", b: /\.[A-Za-z0-9_-]+/ }, { cN: "selector-attr", b: /\[/, e: /\]/, i: "$" }, { cN: "selector-pseudo", b: /:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/ }, { b: "@(font-face|page)", l: "[a-z-]+", k: "font-face page" }, { b: "@", e: "[{;]", i: /:/, c: [{ cN: "keyword", b: /\w+/ }, { b: /\s/, eW: !0, eE: !0, r: 0, c: [e.ASM, e.QSM, e.CSSNM] }] }, { cN: "selector-tag", b: c, r: 0 }, { b: "{", e: "}", i: /\S/, c: [e.CBCM, t] }] };
});hljs.registerLanguage("javascript", function (e) {
  var r = "[A-Za-z$_][0-9A-Za-z$_]*",
      t = { keyword: "in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as", literal: "true false null undefined NaN Infinity", built_in: "eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise" },
      a = { cN: "number", v: [{ b: "\\b(0[bB][01]+)" }, { b: "\\b(0[oO][0-7]+)" }, { b: e.CNR }], r: 0 },
      n = { cN: "subst", b: "\\$\\{", e: "\\}", k: t, c: [] },
      c = { cN: "string", b: "`", e: "`", c: [e.BE, n] };n.c = [e.ASM, e.QSM, c, a, e.RM];var s = n.c.concat([e.CBCM, e.CLCM]);return { aliases: ["js", "jsx"], k: t, c: [{ cN: "meta", r: 10, b: /^\s*['"]use (strict|asm)['"]/ }, { cN: "meta", b: /^#!/, e: /$/ }, e.ASM, e.QSM, c, e.CLCM, e.CBCM, a, { b: /[{,]\s*/, r: 0, c: [{ b: r + "\\s*:", rB: !0, r: 0, c: [{ cN: "attr", b: r, r: 0 }] }] }, { b: "(" + e.RSR + "|\\b(case|return|throw)\\b)\\s*", k: "return throw case", c: [e.CLCM, e.CBCM, e.RM, { cN: "function", b: "(\\(.*?\\)|" + r + ")\\s*=>", rB: !0, e: "\\s*=>", c: [{ cN: "params", v: [{ b: r }, { b: /\(\s*\)/ }, { b: /\(/, e: /\)/, eB: !0, eE: !0, k: t, c: s }] }] }, { b: /</, e: /(\/\w+|\w+\/)>/, sL: "xml", c: [{ b: /<\w+\s*\/>/, skip: !0 }, { b: /<\w+/, e: /(\/\w+|\w+\/)>/, skip: !0, c: [{ b: /<\w+\s*\/>/, skip: !0 }, "self"] }] }], r: 0 }, { cN: "function", bK: "function", e: /\{/, eE: !0, c: [e.inherit(e.TM, { b: r }), { cN: "params", b: /\(/, e: /\)/, eB: !0, eE: !0, c: s }], i: /\[|%/ }, { b: /\$[(.]/ }, e.METHOD_GUARD, { cN: "class", bK: "class", e: /[{;=]/, eE: !0, i: /[:"\[\]]/, c: [{ bK: "extends" }, e.UTM] }, { bK: "constructor", e: /\{/, eE: !0 }], i: /#(?!!)/ };
});hljs.registerLanguage("xml", function (s) {
  var e = "[A-Za-z0-9\\._:-]+",
      t = { eW: !0, i: /</, r: 0, c: [{ cN: "attr", b: e, r: 0 }, { b: /=\s*/, r: 0, c: [{ cN: "string", endsParent: !0, v: [{ b: /"/, e: /"/ }, { b: /'/, e: /'/ }, { b: /[^\s"'=<>`]+/ }] }] }] };return { aliases: ["html", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist"], cI: !0, c: [{ cN: "meta", b: "<!DOCTYPE", e: ">", r: 10, c: [{ b: "\\[", e: "\\]" }] }, s.C("<!--", "-->", { r: 10 }), { b: "<\\!\\[CDATA\\[", e: "\\]\\]>", r: 10 }, { b: /<\?(php)?/, e: /\?>/, sL: "php", c: [{ b: "/\\*", e: "\\*/", skip: !0 }] }, { cN: "tag", b: "<style(?=\\s|>|$)", e: ">", k: { name: "style" }, c: [t], starts: { e: "</style>", rE: !0, sL: ["css", "xml"] } }, { cN: "tag", b: "<script(?=\\s|>|$)", e: ">", k: { name: "script" }, c: [t], starts: { e: "</script>", rE: !0, sL: ["actionscript", "javascript", "handlebars", "xml"] } }, { cN: "meta", v: [{ b: /<\?xml/, e: /\?>/, r: 10 }, { b: /<\?\w+/, e: /\?>/ }] }, { cN: "tag", b: "</?", e: "/?>", c: [{ cN: "name", b: /[^\/><\s]+/, r: 0 }, t] }] };
});

const { highlightBlock } = self.hljs;

class CodeSnippet extends HTMLElement {
  static get observedAttributes() {
    return ['code'];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      let root = this.attachShadow({ mode: 'open' });
      let doc = this.ownerDocument;

      let style = doc.createElement('style');
      style.textContent = styles;
      root.appendChild(style);

      let pre = doc.createElement('pre');
      pre.appendChild(doc.createElement('code'));
      root.appendChild(pre);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
  }

  set code(val) {
    // Remove loading newline
    this._code = val[0] === '\n' ? val.substr(1) : val;
    let tn = this.ownerDocument.createTextNode(this._code);
    let code = this.shadowRoot.querySelector('code');
    code.appendChild(tn);
    highlightBlock(code);
  }
}

customElements.define('code-snippet', CodeSnippet);

fritz.use(new Worker('./app.js'));

}());
