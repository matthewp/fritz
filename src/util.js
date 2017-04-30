export function getInstance(fritz, id){
  return fritz._instances[id];
};

export function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
};

export function delInstance(fritz, id){
  delete fritz._instances[id];
};