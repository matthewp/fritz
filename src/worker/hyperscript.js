import { isFunction } from '../util.js';
import signal from './signal.js';
import { createTree, isTree } from './tree.js';
import { VNode } from './vnode.js';

function Fragment(attrs, children) {
  var child;
  var tree = createTree();
  for(var i = 0; i < children.length; i++) {
    child = children[i];
    tree.push.apply(tree, child);
  }
  return tree;
}

export { Fragment };

export function h2(tag, attrs, children){
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

      var eventInfo = signal(tag, key, value, attrs)
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
};

export default function h(tag, props, ...args) {
  let children, child, i;

  if(Array.isArray(props)) {
    args.unshift(props);
    props = null;
  }

  while(args.length) {
    if((child = args.pop()) && child.pop !== undefined) {
      for(i = child.length; i--;) args.push(child[i]);
    }
    else {
      if(typeof children === 'undefined') {
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

function isPrimitive(type) {
  return type === 'string' || type === 'number' || type === 'boolean';
}
