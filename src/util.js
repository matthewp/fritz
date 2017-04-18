export function getInstance(fritz, id){
  return fritz._instances[id];
};

export function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
};