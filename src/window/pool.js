const registry = new WeakMap();
let globalId = 0;

export function add(worker) {
  if(registry.has(worker)) {
    return registry.get(worker);
  }
  globalId = globalId + 1;
  let id = globalId;
  registry.set(worker, id);
  return id;
}

export function get(worker) {
  return registry.get(worker);
}
