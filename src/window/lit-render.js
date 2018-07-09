import { html, render } from './lit';
import { get as getTemplate } from './templates.js';

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
      
      let fn = instance.addEventCallback(value[1]);
    }
    
    return value;
  });

  let result = html(template, values);
  render(result, root);
};
