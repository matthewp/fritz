export function getInstance(fritz, id){
  return fritz._instances.get(id);
};

export function setInstance(fritz, id, instance){
  fritz._instances.set(id, instance);
};

export function delInstance(fritz, id){
  fritz._instances.delete(id);
};

export function isFunction(val) {
  return typeof val === 'function';
};

export const defer = Promise.resolve().then.bind(Promise.resolve());