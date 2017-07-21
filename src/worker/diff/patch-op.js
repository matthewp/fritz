export class PatchOp {
  constructor() {
    this.index = 0;
    this.patches = [];
  }

  move(val) {
    this.patches[this.index++] = val;
  }

  add(opCode, id, val) {
    this.move(opCode);
    this.move(id);
    this.move(val);
  }

  valueOf() {
    return this.patches;
  }
}