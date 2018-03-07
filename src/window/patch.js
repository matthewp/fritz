import {
  CREATE_ELEMENT,
  SET_ATTR,
  ADD_EVENT
} from '../opcodes.js';

export function patch(patches, shadow, createEventCallback) {
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
