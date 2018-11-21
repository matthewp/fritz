
class Node {
  insertBefore(child, ref) {
    let idx = this.children.indexOf(ref);
    this.children.splice(idx, 0, child);
  }
  remove(child) {
    let idx = this.children.indexOf(child);
    this.children.splice(idx, 1);
  }
}

class VNode extends Node {}
class VFrag extends Node {
  constructor() {
    super();
    this.children = [];
  }
}

export { VNode, VFrag };