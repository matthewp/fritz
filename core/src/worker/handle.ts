class Store {
  public handleMap: WeakMap<Function, number>;
  public idMap: Map<number, Handle>;
  public id: number;
  
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
  }

  from(fn: Function) {
    let handle;
    let id = this.handleMap.get(fn);
    if(id == null) {
      id = this.id++;
      handle = new Handle(id, fn);
      this.handleMap.set(fn, id);
      this.idMap.set(id, handle);
    } else {
      handle = this.idMap.get(id);
    }
    return handle as Handle;
  }

  get(id: number) {
    return this.idMap.get(id);
  }
}

class Handle {
  public static _store: Store;
  public id: number;
  public fn: Function;
  public inUse: boolean;
  static get store() {
    if(!this._store) {
      this._store = new Store();
    }
    return this._store;
  }

  static from(fn: Function) {
    return this.store.from(fn);
  }

  static get(id: number) {
    return this.store.get(id);
  }

  constructor(id: number, fn: Function) {
    this.id = id;
    this.fn = fn;
    this.inUse = true;
  }

  del() {
    let store = Handle.store;
    store.handleMap.delete(this.fn);
    store.idMap.delete(this.id);
  }
}

export default Handle;
