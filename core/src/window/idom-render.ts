import type { MountBase } from './types';
import {
  attributes,
  elementOpen,
  elementClose,
  symbols,
  text,
  patch
} from 'incremental-dom';
import { isFunction } from '../util.js';

var eventAttrExp = /^on[a-z]/;
var orphanedHandles: any[] | null = null;
var FN_HANDLE = Symbol('fritz.handle');

var attributesSet = attributes[symbols.default];
attributes[symbols.default] = preferProps;

function preferProps(element: any, name: string, value: any){
  if(name in element && !isSVG(element)) {
    if(isEventProperty(name, value)) {
      element[name] = setupEventHandler(element, name, value);
    } else {
      element[name] = value;
    }
  }

  else if(isEventProperty(name, value) && isFunction(element.addEventProperty)) {
    element.addEventProperty(name);
    element[name] = setupEventHandler(element, name, value);
  }
  else
    attributesSet(element, name, value);
}

function isEventProperty(name: string, value: any) {
  return eventAttrExp.test(name) && Array.isArray(value) && isFunction(value[1]);
}

function isSVG(element: Element) {
  return element.namespaceURI === 'http://www.w3.org/2000/svg';
}

function setupEventHandler(element: any, name: string, value: any) {
  var currentValue = element[name];
  var fn = value[1];
  if(currentValue) {
    if(currentValue !== fn) {
      fn[FN_HANDLE] = value[0];
      orphanedHandles!.push(currentValue[FN_HANDLE]);
    }
  } else {
    fn[FN_HANDLE] = value[0];
  }
  return fn;
}

const TAG = 1;
const ID = 2;
const ATTRS = 3;
const EVENTS = 4;

function render(bc: any, component: MountBase){
  var n;
  for(var i = 0, len = bc.length; i < len; i++) {
    n = bc[i];
    switch(n[0]) {
      // Open
      case 1:
        if(n[EVENTS]) {
          var k;
          for(var j = 0, jlen = n[EVENTS].length; j < jlen; j++) {
            k = n[EVENTS][j];
            let handler = component.addEventCallback(k[2], k[1]);
            n[ATTRS].push(k[1], [k[2], handler]);
          }
        }

        var openArgs = [n[TAG], n[ID], null].concat(n[ATTRS]);
        elementOpen.apply(null, openArgs as any);
        break;
      case 2:
        elementClose(n[1]);
        break;
      case 4:
        text(n[1]);
        break;
    }
  }
}

function idomRender(vdom: any, root: any, component: MountBase): number[] {
  orphanedHandles = [];
  patch(root, () => render(vdom, component));
  let out = orphanedHandles;
  orphanedHandles = null;
  return out;
}

export { idomRender };
