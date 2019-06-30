const _tree = Symbol('ftree');

export function isTree(obj) {
  return !!(obj && obj[_tree]);
};

export function createTree() {
  let out = [];
  out[_tree] = true;
  return out;
}