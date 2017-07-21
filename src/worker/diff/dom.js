import { VNode } from '../vnode.js';

export function createNode(nodeName, isSvg){
  var v = new VNode();
  v.nodeName = nodeName;
  v.isSvg = isSvg;
  v.children = [];
  v.attributes = [];
  return v;
};