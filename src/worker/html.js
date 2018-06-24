import { REGISTER } from '../message-types.js';

const templates = new WeakMap();
let globalId = 0;

export default function(strings, ...vals) {
  let id;
  if(templates.has(strings)) {
    id = templates.get(strings);
  } else {
    globalId = globalId + 1;
    id = globalId;
    templates.set(strings, id);
    register(id, strings);
  }

  return [1, id, 2, vals];
}

function register(id, template) {
  postMessage({
    type: REGISTER,
    id,
    template
  });
}
