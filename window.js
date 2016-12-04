(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.framework = factory());
}(this, (function () { 'use strict';

// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {};

var domIndex_1 = domIndex$1;

function domIndex$1(rootNode, tree, indices, nodes) {
  if (!indices || indices.length === 0) {
    return {}
  } else {
    indices.sort(ascending);
    return recurse(rootNode, tree, indices, nodes, 0)
  }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
  nodes = nodes || {};


  if (rootNode) {
    if (indexInRange(indices, rootIndex, rootIndex)) {
      nodes[rootIndex] = rootNode;
    }

    var treeChildren = tree[0];

    if (treeChildren) {

      var childNodes = rootNode.childNodes;

      for (var i = 0; i < treeChildren.length; i++) {
        rootIndex += 1;

        var vChild = treeChildren[i] || noChild;
        var nextIndex = rootIndex + (vChild[1] || 0);

        // skip recursion down the tree if there are no nodes down here
        if (indexInRange(indices, rootIndex, nextIndex)) {
          recurse(childNodes[i], vChild, indices, nodes, rootIndex);
        }

        rootIndex = nextIndex;
      }
    }
  }

  return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
  if (indices.length === 0) {
    return false
  }

  var minIndex = 0;
  var maxIndex = indices.length - 1;
  var currentIndex;
  var currentItem;

  while (minIndex <= maxIndex) {
    currentIndex = ((maxIndex + minIndex) / 2) >> 0;
    currentItem = indices[currentIndex];

    if (minIndex === maxIndex) {
      return currentItem >= left && currentItem <= right
    } else if (currentItem < left) {
      minIndex = currentIndex + 1;
    } else if (currentItem > right) {
      maxIndex = currentIndex - 1;
    } else {
      return true
    }
  }

  return false;
}

function ascending(a, b) {
  return a > b ? 1 : -1
}

var isObject$1 = function isObject$1(x) {
  return typeof x === "object" && x !== null;
};

var isSoftSetHook_1 = isSoftSetHook$1;

function isSoftSetHook$1(x) {
  return x && typeof x === 'object' && typeof x.value !== 'undefined';
}

var call$2 = function(obj, fn /* args */){
  if(obj[fn]) {
    return obj[fn].apply(obj, Array.prototype.slice.call(arguments, 2));
  }
};

var isObject = isObject$1;
var isSoftSetHook = isSoftSetHook_1;
var call$1 = call$2;

var applyProperties_1 = applyProperties$1;

function applyProperties$1(node, props, previous, options) {
  for (var propName in props) {
    var propValue = props[propName];

    if (propValue === undefined) {
      removeProperty(node, propName, previous);
      call$1(options, 'removedProp', node, propName, propValue);
    } else if (isSoftSetHook(propValue)) {
      removeProperty(node, propName, propValue, previous);
      node[propName] = propValue.value;
    } else {
      if (isObject(propValue)) {
        patchObject(node, props, previous, propName, propValue);
      } else {
        node[propName] = propValue;
      }
      call$1(options, 'addedProp', node, propName, propValue, props);
    }
  }
}

function removeProperty(node, propName, previous) {
  if (!previous) {
    return
  }
  var previousValue = previous[propName];

  if (propName === "attributes") {
    for (var attrName in previousValue) {
      node.removeAttribute(attrName);
    }
  } else if (propName === "style") {
    for (var i in previousValue) {
      node.style[i] = "";
    }
  } else if (typeof previousValue === "string") {
    node[propName] = "";
  } else {
    node[propName] = null;
  }
}

function patchObject(node, props, previous, propName, propValue) {
  var previousValue = previous ? previous[propName] : undefined;

  // Set attributes
  if (propName === "attributes") {
    for (var attrName in propValue) {
      var attrValue = propValue[attrName];

      if (attrValue === undefined) {
        node.removeAttribute(attrName);
      } else {
        node.setAttribute(attrName, attrValue);
      }
    }

    return
  }

  if (previousValue && isObject(previousValue) &&
    getPrototype(previousValue) !== getPrototype(propValue)) {
    node[propName] = propValue;
    return
  }

  if (!isObject(node[propName])) {
    node[propName] = {};
  }

  var replacer = propName === "style" ? "" : undefined;

  for (var k in propValue) {
    var value = propValue[k];
    node[propName][k] = (value === undefined) ? replacer : value;
  }
}

function getPrototype(value) {
  // getPrototypeOf shim for older browsers
  /* istanbul ignore else */
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else {
    return value.__proto__ || value.constructor.prototype;
  }
}

// original this was is-vpatch.js

var patchTypes$1 = {
  NONE: 0,
  VTEXT: 1,
  VNODE: 2,
  WIDGET: 3,
  PROPS: 4,
  ORDER: 5,
  INSERT: 6,
  REMOVE: 7,
  THUNK: 8
};

// copied from vdom-as-json/types.js

var types$1 = {
  VirtualTree: 1,
  VirtualPatch: 2,
  VirtualNode: 3,
  SoftSetHook: 4
};

var isVText$1 = isVirtualText;

var types = types$1;

function isVirtualText(x) {
  return x && x.t === types.VirtualTree;
}

var isVNode$1 = isVirtualNode;

var types$3 = types$1;

function isVirtualNode(x) {
  return x && x.t === types$3.VirtualNode
}

var applyProperties$2 = applyProperties_1;
var isVText = isVText$1;
var isVNode = isVNode$1;

var createElement_1 = createElement;

function createElement(vnode, options) {
  var doc = document;

  if (isVText(vnode)) {
    return doc.createTextNode(vnode.x) // 'x' means 'text'
  } else if (!isVNode(vnode)) {
    return null
  }

  var node = (!vnode.n) ? // 'n' === 'namespace'
    doc.createElement(vnode.tn) : // 'tn' === 'tagName'
    doc.createElementNS(vnode.n, vnode.tn);

  var props = vnode.p; // 'p' === 'properties'
  applyProperties$2(node, props, null, options);

  var children = vnode.c; // 'c' === 'children'

  if (children) {
    for (var i = 0; i < children.length; i++) {
      var childNode = createElement(children[i], options);
      if (childNode) {
        node.appendChild(childNode);
      }
    }
  }

  return node
}

var applyProperties = applyProperties_1;
var patchTypes = patchTypes$1;
var render = createElement_1;
var call = call$2;

var patchOp$1 = applyPatch$2;

function applyPatch$2(vpatch, domNode, patchRecursive, options) {
  var type = vpatch[0];
  var patch = vpatch[1];
  var vNode = vpatch[2];

  switch (type) {
    case patchTypes.REMOVE:
      return removeNode(domNode, options)
    case patchTypes.INSERT:
      return insertNode(domNode, patch, options)
    case patchTypes.VTEXT:
      return stringPatch(domNode, patch)
    case patchTypes.VNODE:
      return vNodePatch(domNode, patch, options)
    case patchTypes.ORDER:
      reorderChildren(domNode, patch);
      return domNode
    case patchTypes.PROPS:
      applyProperties(domNode, patch, vNode.p, options); // 'p' === 'properties'
      return domNode
    case patchTypes.THUNK:
      return replaceRoot(domNode,
          patchRecursive(domNode, patch))
    default:
      return domNode
  }
}

function removeNode(domNode, options) {
  var parentNode = domNode.parentNode;
  call(options, 'removed', domNode);

  if (parentNode) {
    parentNode.removeChild(domNode);
  }

  return null
}

function insertNode(parentNode, vNode) {
  var newNode = render(vNode);

  if (parentNode) {
    parentNode.appendChild(newNode);
  }

  return parentNode
}

function stringPatch(domNode, vText) {
  var newNode;

  if (domNode.nodeType === 3) {
    domNode.replaceData(0, domNode.length, vText.x); // 'x' means 'text'
    newNode = domNode;
  } else {
    var parentNode = domNode.parentNode;
    newNode = render(vText);

    if (parentNode && newNode !== domNode) {
      parentNode.replaceChild(newNode, domNode);
    }
  }

  return newNode
}

function vNodePatch(domNode, vNode, options) {
  var parentNode = domNode.parentNode;
  var newNode = render(vNode, options);

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode);
  }

  return newNode
}

function reorderChildren(domNode, moves) {
  var childNodes = domNode.childNodes;
  var keyMap = {};
  var node;
  var remove;
  var insert;

  for (var i = 0; i < moves.removes.length; i++) {
    remove = moves.removes[i];
    node = childNodes[remove.from];
    if (remove.key) {
      keyMap[remove.key] = node;
    }
    domNode.removeChild(node);
  }

  var length = childNodes.length;
  for (var j = 0; j < moves.inserts.length; j++) {
    insert = moves.inserts[j];
    node = keyMap[insert.key];
    // this is the weirdest bug i've ever seen in webkit
    domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
  }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot);
    }

    return newRoot;
}

var domIndex = domIndex_1;
var patchOp = patchOp$1;

function patchRecursive$1(rootNode, patches, options) {
  var indices = patchIndices(patches);

  if (indices.length === 0) {
    return rootNode
  }

  var index = domIndex(rootNode, patches.a, indices);

  for (var i = 0; i < indices.length; i++) {
    var nodeIndex = indices[i];
    rootNode = applyPatch$1(rootNode,
      index[nodeIndex],
      patches[nodeIndex],
      options);
  }

  return rootNode
}

function applyPatch$1(rootNode, domNode, patchList, options) {
  if (!domNode) {
    return rootNode
  }

  var newNode;

  for (var i = 0; i < patchList.length; i++) {
    newNode = patchOp(patchList[i], domNode, patchRecursive$1, options);

    if (domNode === rootNode) {
      rootNode = newNode;
    }
  }

  return rootNode
}

function patchIndices(patches) {
  var indices = [];

  for (var key in patches) {
    if (key !== "a") {
      indices.push(Number(key));
    }
  }

  return indices
}


var patchRecursive_1 = patchRecursive$1;

var patchRecursive = patchRecursive_1;

function patch$1(rootNode, patches, options) {
  return patchRecursive(rootNode, patches, options);
}

var index$1 = patch$1;

var patch = index$1;

var getDomState = function(){
  return getState(document.documentElement);
};

function getState(node) {
  switch(node.nodeType) {
    // Element
    case 1:
      let bc = [node.nodeName.toLowerCase()];
      if(node.hasAttributes() ) {
        bc.push(Array.prototype.reduce.call(node.attributes, function(out, attr){
          out[attr.name] = attr.value;
        }, {}));
      } else {
        bc.push(null);
      }
      if(node.firstChild) {
        bc.push(Array.prototype.map.call(node.childNodes, getState));
      }
      return bc;
    // TextNode
    case 3:
      return node.nodeValue;
  }
}

const nodeMap = new WeakMap();

function set(node, eventName, data){
  let nm = nodeMap.get(node);
  if(!nm) {
    nm = new Map();
    nodeMap.set(node, nm);
  }
  nm.set(eventName, data);
}

function get(node, eventName){
  let nm = nodeMap.get(node);
  if(nm) {
    return nm.get(eventName);
  }
}

function del(node, eventName){
  if(eventName) {
    let nm = nodeMap.get(node);
    if(nm) {
      nm.delete(eventName);
    }
  } else {
    nodeMap.delete(node);
  }
}

var PatchOptions = class {
  constructor(framework) {
    this.framework = framework;
  }

  addedProp(node, name, value, props) {
    if(name === 'fritz-event') {
      let url = props['fritz-url'];
      let method = props['fritz-method'];
      set(node, value, {
        method: method || 'POST',
        url: url
      });
      node.addEventListener(value, this.framework.eventHandler);
    }

    if(name === 'action') {

    }
  }

  removedProp(node, name) {
    // TODO remove the event (how) ?
  }

  removed(node){
    del(node);
  }
};

class Framework {
  constructor() {
    this._router = null;
    this._started = false;
    this.eventHandler = this.eventHandler.bind(this);
    this.patchOptions = new PatchOptions(this);
  }

  get router() {
    return this._router;
  }

  set router(val) {
    this._router = val;
    if(!this.started) {
      this.start();
    }
  }

  start() {
    let initialState = getDomState();
    this._router.postMessage({
      type: 'initial',
      state: initialState,
      url: location.pathname
    });

    this._router.addEventListener('message',
      ev => this.handle(ev));
  }

  eventHandler(ev) {
    ev.preventDefault();
    let data = get(ev.target, ev.type);
    this.request(data);
  }

  request(request) {
    request.type = 'request';
    this._router.postMessage(request);
  }

  handle(msg) {
    let patches = msg.data.patches;
    patch(document.documentElement, patches, this.patchOptions);
  }
}

var index = new Framework();

return index;

})));
