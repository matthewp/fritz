import { isFunction } from '../util.js';
import { INSERT, REMOVE, REPLACE, SET_ATTR, RM_ATTR, EVENT, TEXT } from '../bc.js';

const FN_HANDLE = Symbol('fritz.handle');

function decodeString(iter) {
  let out = "", c;
  while(true) {
    c = iter.next().value;
    if(c === 0) return out;
    out += String.fromCharCode(c);
  }
}

function* walk(root, nextIndex) {
  const document = root.ownerDocument;
  const walker = document.createTreeWalker(root, -1);
  let index = 0;
  let currentNode;// = walker.nextNode();

  while(true) {
    if(nextIndex === 0) {
      nextIndex = yield root;
    } else if(index === nextIndex) {
      nextIndex = yield currentNode;
    } else if(index < nextIndex) {
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
  let i = 0, child = parent.firstChild;
  while(i < index) {
    i++;
    child = child.nextSibling;
  }
  return child;
}

function patch(ab, root, component) {
  let instr = new Uint16Array(ab);
  let iter = instr[Symbol.iterator]();
  let orphanedHandles = [];
  let document = root.ownerDocument;
  let walker = walk(root, 0);
  walker.next();

  for(let c of iter) {
    switch(c) {
      case INSERT: {
        let id = iter.next().value;
        let index = iter.next().value;
        let nodeType = iter.next().value;
        let node;
        if(nodeType === 1) {
          let nodeName = decodeString(iter);
          node = document.createElement(nodeName);
        } else if(nodeType === 3) {
          node = document.createTextNode(decodeString(iter));
        }
        
        let parent = getNode(walker, id);
        let ref = getChild(parent, index);
        if(ref) {
          parent.insertBefore(node, ref);
        } else {
          parent.appendChild(node);
        }
        
        break;
      }
      case REMOVE: {
        let id = iter.next().value;
        let index = iter.next().value;
        let parent = getNode(walker, id);
        let child = getChild(parent, index);
        parent.removeChild(child);
        break;
      }
      case REPLACE: {
        let id = iter.next().value;
        let index = iter.next().value;
        let nodeType = iter.next().value;

        let parent = getNode(walker, id);
        let ref = getChild(parent, index);
        let node;
        if(nodeType === 3) {
          node = document.createTextNode(decodeString(iter));
        } else {
          throw new Error('Not yet supported');
        }
        parent.replaceChild(node, ref);
        break;
      }
      case EVENT: {
        let id = iter.next().value;
        let prop = decodeString(iter);
        let handleId = iter.next().value;
        let parent = getNode(walker, id);
        
        let fn = parent[prop];
        if(fn) {
          orphanedHandles.push(fn[FN_HANDLE]);
        }

        fn = component.addEventCallback(handleId);
        fn[FN_HANDLE] = handleId;

        parent[prop] = fn;
        break;
      }
      case TEXT: {
        let id = iter.next().value;
        let nodeValue = decodeString(iter);
        let tn = getNode(walker, id);
        tn.nodeValue = nodeValue;
        break;
      }
      case SET_ATTR: {
        let id = iter.next().value;
        let name = decodeString(iter);
        let value = decodeString(iter);
        let parent = getNode(walker, id);
        parent.setAttribute(name, value);
        break;
      }
      case RM_ATTR: {
        let id = iter.next().value;
        let name = decodeString(iter);
        let parent = getNode(walker, id);
        parent.removeAttribute(name);
        break;
      }
      default:
        throw new Error(`The instruction ${c} has not been implemented.`);
    }
  }

  return orphanedHandles;
}

export { patch };