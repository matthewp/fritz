import {
  CREATE_ELEMENT,
  SET_ATTR
} from '../opcodes.js';

export function patch(patches, root) {
  var index = 0, last = patches.length - 1;

  do {
    var opcode = patches[index++];
    var indices = patches[index++];
    var value = patches[index++];
    var parent = findNode(root, indices);
    var doc = parent.ownerDocument;
    switch(opcode) {
      case CREATE_ELEMENT:
        var child;
        switch(value[0]) {
          case 1:
            child = doc.createElement(value[1]);
            break;
          case 3:
            child = doc.createTextNode(value[1]);
            break;
        }
        parent.appendChild(child);
        break;
      case SET_ATTR:
        parent.setAttribute(value[0], value[1]);
        break;
    }

  } while (index < last);
}

function findNode(node, indices) {
  var index;
  for(var i = 1, len = indices.length; i < len; i++) {
    index = indices[i];
    if(index !== undefined) {
      node = node.childNodes[index];
    }
  }
  return node;
}