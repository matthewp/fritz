import { html, render } from 'lit-html';

const templates = new WeakSet();

export default function(tree, root, instance){
  console.log('have', templates.has(tree));

  if(!templates.has(tree)) {
    templates.add(tree);
  }

  let result = html(tree[1], tree[3]);
  render(result, root);
};
