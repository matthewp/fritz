import { sym } from '../util.js';

const _tree = sym('ftree');

export function isTree(obj) {
  return !!(obj && obj[_tree]);
};

export function createTree() {
  var out = [];
  out[_tree] = true;
  return out;
}