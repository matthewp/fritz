import { isFunction } from '../util.js';
import signal from './signal.js';
import { createTree, isTree } from './tree.js';
import { VNode, VFrag } from './vnode.js';

function Fragment() {}

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

const stack = [];

export default function h(tag, props, ...args) {
  let children, child, i, lastSimple, simple;

  for (i = args.length; i-- > 0;) {
    stack.push(args[i]);
  }

  if(Array.isArray(props)) {
    if(!stack.length) stack.unshift(props);
    props = null;
  }

  while(stack.length) {
    if((child = stack.pop()) && child.pop !== undefined) {
      for(i = child.length; i--;) stack.push(child[i]);
    }
    else {
      if ((simple = typeof tag !== 'function')) {
        if (child == null) child = '';
        else if (typeof child === 'number') child = String(child);
        else if (typeof child !== 'string') simple = false;
      }

      if (simple && lastSimple) {
        children[children.length - 1] += child;
      }
      else if(typeof children === 'undefined') {
        children = [child];
      } else {
        children.push(child);
      }

      lastSimple = simple;
    }
  }

  if(tag === Fragment) {
    let p = new VFrag();
    p.children = children;
    return p;
  }

  if(isFunction(tag)) {
    let localName = tag.prototype.localName;
    if(localName) {
      tag = localName;
    }
  }

  let p = new VNode();
  p.nodeName = tag;
  p.children = children;
  p.props = props;
  p.key = props == null ? undefined : props.key;
  return p;
}

h.frag = Fragment;

function isPrimitive(type) {
  return type === 'string' || type === 'number' || type === 'boolean';
}
