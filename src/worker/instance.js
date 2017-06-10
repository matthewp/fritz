import { RENDER } from '../message-types.js';
import { defer } from '../util.js';

export let currentInstance = null;

export function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
};

let queue = [];

export function enqueueRender(instance) {
  if(!instance._dirty && (instance._dirty = true) && queue.push(instance)==1) {
    defer(rerender);
  }
}

function rerender() {
	let p, list = queue;
	queue = [];
	while ( (p = list.pop()) ) {
		if (p._dirty) render(p);
	}
}

function render(instance) {
  if(instance.shouldComponentUpdate() !== false) {
    instance.componentWillUpdate();
    instance._dirty = false;

    postMessage({
      type: RENDER,
      id: instance._fritzId,
      tree: renderInstance(instance)
    });
  }
}