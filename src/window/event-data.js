const nodeMap = new WeakMap();

export function set(node, eventName, data){
  let nm = nodeMap.get(node);
  if(!nm) {
    nm = new Map();
    nodeMap.set(node, nm);
  }
  nm.set(eventName, data);
}

export function get(node, eventName){
  let nm = nodeMap.get(node);
  if(nm) {
    return nm.get(eventName);
  }
}

export function del(node, eventName){
  if(eventName) {
    let nm = nodeMap.get(node);
    if(nm) {
      nm.delete(eventName);
    }
  } else {
    nodeMap.delete(node);
  }
}
