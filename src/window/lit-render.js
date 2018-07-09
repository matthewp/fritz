import { html, render } from './lit';
import { get as getTemplate } from './templates.js';
import { track, trap } from './handle.js';

const FN_HANDLE = Symbol('fritz.handle');

export default function(tree, root, instance){
  let workerUniqueId = tree[1];
  let template = getTemplate(this, workerUniqueId);
  let rawValues = tree[3];

  if(!template) {
     throw new Error('Something went wrong. A template was queued to render before it registered itself. This shouldn\'t happen.');
  }

  let values = rawValues.map(value => {
    if(value instanceof Uint8Array) {
      // This assumes it's always an event
      
      // TODO use handleEvent instead
      //return instance;
      
      let handleId = value[1];
      let fn = instance.addEventCallback(handleId);
      return track(fn, handleId);
    }
    
    return value;
  });

  let result = html(template, values);

  let release = trap();
  render(result, root);
  return release();
};
