import type { default as Component } from './component';
import type { WorkerRenderMessage } from '../message-types';
import type { Tree } from './tree';

import { RENDER } from '../message-types.js';
import { defer } from '../util.js';

export let currentInstance: Component | null = null;

export function renderInstance(instance: Component) {
  currentInstance = instance;
  let tree = instance.render(instance.props, instance.state);
  currentInstance = null;
  return tree;
};

let queue: Array<[Component<any, any, any>, Record<string, any> | undefined, boolean]> = [];

export function enqueueRender(instance: Component<any, any, any>, sentProps: Record<string, any> | undefined, isNew: boolean) {
  if(!instance._dirty && (instance._dirty = true) && queue.push([instance, sentProps, isNew])==1) {
    defer(rerender);
  }
}

function rerender() {
	let p, list = queue;
	queue = [];
	while ( (p = list.pop()) ) {
		if (p[0]._dirty) render(p[0], p[1], p[2]);
	}
}

function render(instance: Component<any, any, any>, sentProps: Record<string, any> | undefined, isNew: boolean) {
  let prevProps = instance.props;
  let prevState = instance.state;
  if(sentProps) {
    var nextProps = Object.assign({}, instance.props, sentProps);
    instance.props = nextProps;
  }

  if(isNew) {
    callRender(instance);
  } else if(instance.shouldComponentUpdate(nextProps) !== false) {
    let snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState);
    callRender(instance);
    instance.componentDidUpdate(prevProps, prevState, snapshot);
  }
}

function callRender(instance: Component<any, any, any>) {
  instance._dirty = false;
  const msg: WorkerRenderMessage = {
    type: RENDER,
    id: instance._fritzId,
    tree: renderInstance(instance) as Tree
  };

  instance._fritzPort.postMessage(msg);
}