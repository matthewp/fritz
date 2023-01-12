const _tree = Symbol('ftree');

export function isTree(obj: any): obj is Tree {
  return !!(obj && obj[_tree]);
};

export function createTree(): Tree {
  let out: any = [];
  out[_tree] = true;
  return out;
}

export type Tree = Array<any> & {
  [_tree]: boolean;
}