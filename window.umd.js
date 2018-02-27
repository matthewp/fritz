(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fritz = factory());
}(this, (function () { 'use strict';

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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
      if(super.connectedCallback) super.connectedCallback();
      if(this._parentComponent) {
        this._parentComponent._hasChildComponents = true;
      }
    }

    disconnectedCallback() {
      if(super.disconnectedCallback) super.disconnectedCallback();
      this._amMounted = false;
    }

    renderer() {
      if(super.renderer) super.renderer();
      this._renderCount = 0;
      if(this._parentComponent) {
        this._parentComponent._incrementRender();
      }
    }

    beforeRender() {
      this._resetComponent = setComponent(this);
    }

    afterRender() {
      this._resetComponent();
      this._resetComponent = Function.prototype;

      if(!this._amMounted && !this._hasChildComponents) {
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
      if(this._amMounted) return;

      if(this._renderCount === 0) {
        this._amMounted = true;
        this._worker.postMessage({
          type: RENDERED,
          id: this._id
        });

        if(this._parentComponent) {
          this._parentComponent._decrementRender();
        }
      }
    }
  }
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
  }
}

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

var symbols_1 = symbols;
var attributes_1 = attributes;

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

var eventAttrExp = /^on[a-z]/;

var attributesSet = attributes_1[symbols_1.default];
attributes_1[symbols_1.default] = preferProps;

function preferProps(element, name, value){
  if(name in element && !isSVG(element))
    element[name] = value;
  else if(isFunction(value) && eventAttrExp.test(name) &&
    isFunction(element.addEventProperty)) {
    element.addEventProperty(name);
    element[name] = value;
  }
  else
    attributesSet(element, name, value);
}

function isSVG(element) {
  return element.namespaceURI === 'http://www.w3.org/2000/svg';
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

const CREATE_ELEMENT = 1;

const SET_ATTR = 3;

const ADD_EVENT = 5;

function patch$1(patches, root, createEventCallback) {
  var index = 0, last = patches.length - 1;

  do {
    var opcode = patches[index++];
    var indices = patches[index++];
    var value = patches[index++];
    var parent;
    switch(opcode) {
      case CREATE_ELEMENT:
        parent = findNode(root, indices, true);
        var child;
        var doc = parent.ownerDocument;
        var refIndex = indices[indices.length - 1];
        var refNode = parent.childNodes[refIndex];
        switch(value[0]) {
          case 1:
            child = doc.createElement(value[1]);
            break;
          case 3:
            child = doc.createTextNode(value[1]);
            break;
        }
        if(refNode !== undefined) {
          parent.insertBefore(refNode, child);
        } else {
          parent.appendChild(child);
        }
        break;
      case SET_ATTR:
        parent = findNode(root, indices, false);
        parent.setAttribute(value[0], value[1]);
        break;
      case ADD_EVENT:
        parent = findNode(root, indices, false);
        var handler = createEventCallback(value[1], value[2]);
        // onclick
        parent[value[1]] = handler;
        break;
    }

  } while (index < last);
}

function findNode(node, indices, findParent) {
  var index;
  var len = findParent ? (indices.length - 1) : indices.length;
  for(var i = 0; i < len; i++) {
    index = indices[i];
    if(index !== undefined) {
      node = node.childNodes[index];
    }
  }
  return node;
}

// TODO This should definitely not go here :(
function postEvent$1(event, inst, handle) {
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

function withWorkerRender(Base = HTMLElement) {
  return class extends withRenderer(Base) {
    constructor() {
      super();
      if(!this.shadowRoot) {
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

    doRenderCallback(patches) {
      this.beforeRender();
      let elem = this;
      let root = this.shadowRoot;
      function createEventCallback(type, handle) {
        return function(event){
          postEvent$1(event, elem, handle);
        };
      }
      patch$1(patches, root, createEventCallback);
      this.afterRender();
    }
  }
}

function withComponent(options) {
  let Base = withWorkerRender(withUpdate(HTMLElement));

  Base = withWorkerEvents(Base);

  if(options.mount) {
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
      if(super.disconnectedCallback) super.disconnectedCallback();
      delInstance(fritz, this._id);
      events.forEach(eventName => {
        this.shadowRoot.removeEventListener(eventName, this);
      });
      this._worker.postMessage({
        type: DESTROY,
        id: this._id
      });
    }
  }
}

function define(fritz, msg) {
  let worker = this;
  let tagName = msg.tag;
  let props = msg.props || {};
  let events = msg.events || [];
  let features = msg.features;

  let Element = withWorkerConnection(
    fritz, events, props, worker,
    withComponent(features)
  );

  customElements.define(tagName, Element);
}

function render(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  if(instance !== undefined) {
    instance.doRenderCallback(msg.patches);
  }
}

function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let ev = msg.event;
  let event = new CustomEvent(ev.type, {
    bubbles: true,//ev.bubbles,
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
  workers.forEach(function(worker){
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
  if(fritz.state) {
    sendState(fritz, worker);
  }
}

function handleMessage(ev) {
  let msg = ev.data;
  switch(msg.type) {
    case DEFINE:
      define.call(this, fritz, msg);
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
  set: function(val){
    this._state = val;
    sendState(fritz);
  },
  get: function(){
    return this._state;
  }
});

return fritz;

})));
