export function getInstance(fritz, id){
  return fritz._instances[id];
};

export function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
};

export function delInstance(fritz, id){
  delete fritz._instances[id];
};

export function isFunction(val) {
  return typeof val === 'function';
};

export const defer = Promise.resolve().then.bind(Promise.resolve());

export const sym = typeof Symbol === 'function' ? Symbol : function(v) { return '_' + v };