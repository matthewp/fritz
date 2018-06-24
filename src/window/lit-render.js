import { html, render } from 'lit-html';
import { get as getTemplate } from './templates.js';

export default function(tree, root, instance){
  let workerUniqueId = tree[1];
  let template = getTemplate(this, workerUniqueId);
  let values = tree[3];

  if(!template) {
     throw new Error('Something went wrong. A template was queued to render before it registered itself. This shouldn\'t happen.');
  }

  let result = html(template, values);
  render(result, root);
};
