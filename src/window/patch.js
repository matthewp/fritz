import {
  CREATE_ELEMENT
} from '../opcodes.js';

export function patch(patches, root) {
  var index = 0, last = patches.length - 1;

  do {
    var opcode = patches[index];
    var indices = patches[++index];
    var value = patches[++index];
    var parent = findNode(root, indices);
    switch(opcode) {
      case CREATE_ELEMENT:
        var child = document.createElement(value);
        parent.appendChild(child);
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