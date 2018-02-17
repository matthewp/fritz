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

var attributesSet = attributes[symbols.default];
attributes[symbols.default] = preferProps;

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

const TAG = 1;
const ID = 2;
const ATTRS = 3;
const EVENTS = 4;

function render(bc, component){
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
            n[ATTRS].push(k[1], handler);
          }
        }

        var openArgs = [n[TAG], n[ID], null].concat(n[ATTRS]);
        elementOpen.apply(null, openArgs);
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

function idomRender(vdom, root, component) {
  patch(root, () => render(vdom, component));
}

export { idomRender };
