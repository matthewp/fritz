import { REGISTER } from '../message-types.js';
import { currentInstance } from './instance.js';
import Handle from './handle.js';

const templates = new WeakMap();
let globalId = 0;

export default function(strings, ...args) {
  let id;
  if(templates.has(strings)) {
    id = templates.get(strings);
  } else {
    globalId = globalId + 1;
    id = globalId;
    templates.set(strings, id);
    register(id, strings);
  }

  // Set values
  let vals = args.map(arg => {
    let type = typeof arg;
    if(type === 'function') {
      let handle = Handle.from(arg);
      handle.inUse = true;
      currentInstance._fritzHandles.set(handle.id, handle);
      return handle.id;
    }
    return arg;
  });

  console.log(vals);

  return [1, id, 2, vals];
}

function register(id, template) {
  postMessage({
    type: REGISTER,
    id,
    template
  });
}
