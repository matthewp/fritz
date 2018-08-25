import { REGISTER } from '../message-types.js';
import { currentInstance } from './instance.js';
import Handle from './handle.js';
import { templateTag, valueTag } from '../tags.js';

const templates = new WeakMap();
const _template = Symbol();
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
      return Uint8Array.from([0, handle.id]);
    } else if (Array.isArray(arg)) {
      let tag;
      if(isTemplate(arg)) {
        tag = templateTag;
      } else {
        tag = valueTag;
      }
      return [tag, arg];
    }
    return arg;
  });

  return mark([1, id, 2, vals]);
}

function register(id, template) {
  postMessage({
    type: REGISTER,
    id,
    template
  });
}

function mark(template) {
  template[_template] = true;
  return template;
}

function isTemplate(template) {
  return !!template[_template];
}
