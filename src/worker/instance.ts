import type { default as Component } from './component';

import { RENDER } from '../message-types.js';
import { defer } from '../util.js';

export let currentInstance: Component | null = null;

export function renderInstance(instance: Component) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
};

let queue: Array<[Component<any, any>, Record<string, any> | undefined]> = [];

export function enqueueRender(instance: Component<any, any>, sentProps?: Record<string, any>) {
  if(!instance._dirty && (instance._dirty = true) && queue.push([instance, sentProps])==1) {
    defer(rerender);
  }
}

function rerender() {
	let p, list = queue;
	queue = [];
	while ( (p = list.pop()) ) {
		if (p[0]._dirty) render(p[0], p[1]);
	}
}

function render(instance: Component<any, any>, sentProps: Record<string, any> | undefined) {
  if(sentProps) {
    var nextProps = Object.assign({}, instance.props, sentProps);
    instance.componentWillReceiveProps(nextProps);
    instance.props = nextProps;
  }

  if(instance.shouldComponentUpdate(nextProps) !== false) {
    instance.componentWillUpdate();
    instance._dirty = false;

    postMessage({
      type: RENDER,
      id: instance._fritzId,
      tree: renderInstance(instance)
    });
  }
}
