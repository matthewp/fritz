import { html, render } from './lit';
import { get as getTemplate } from './templates.js';
import { track, trap } from './handle.js';
import { templateTag } from '../tags.js';

const FN_HANDLE = Symbol('fritz.handle');

function renderTemplate(tree, root, instance){
  let result = createTemplateResult.call(this, tree, 
    getValues.call(this, tree, instance));

  let release = trap();
  render(result, root);
  return release();
}

function getValues(tree, instance) {
  let rawValues = tree[3];

  return rawValues.map(value => {
    if(value instanceof Uint8Array) {
      // This assumes it's always an event
      
      // TODO use handleEvent instead
      //return instance;
      
      let handleId = value[1];
      let fn = instance.addEventCallback(handleId);
      return track(fn, handleId);
    } else if(Array.isArray(value)) {
      let tag = value[0];
      let val = value[1];
      if(tag === templateTag) {
        return createTemplateResult.call(this, val,
          getValues.call(this, val, instance));
      }
      return val;
    }
    
    return value;
  });
}

function createTemplateResult(tree, values) {
  let workerUniqueId = tree[1];
  let template = getTemplate(this, workerUniqueId);

  if(!template) {
     throw new Error('Something went wrong. A template was queued to render before it registered itself. This shouldn\'t happen.');
  }

  let result = html(template, values);
  return result;
}

export default renderTemplate;
