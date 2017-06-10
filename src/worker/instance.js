import { RENDER } from '../message-types.js';

export let currentInstance = null;

export function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
};

export function enqueueRender(instance, extra) {
  if(instance.shouldComponentUpdate() !== false) {
    instance.componentWillUpdate();

    let id = instance._fritzId;
    let msg = Object.assign({
      type: RENDER,
      id: id,
      tree: renderInstance(instance)
    }, extra);

    postMessage(msg);
  }  
}