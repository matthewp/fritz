import type { WorkerRenderMessage } from '../message-types';

import { withComponent } from './component.js';
import { withWorkerConnection } from './with-worker-connection.js';
import { getInstance } from '../util.js';

export function define(fritz, msg) {
  let worker = this;
  let tagName = msg.tag;
  let props = msg.props || {};
  let events = msg.events || [];
  let features = msg.features;

  let Element = withWorkerConnection(
    fritz, events, props, worker,
    withComponent(features)
  );

  customElements.define(tagName, Element);
};

export function render(fritz, msg: WorkerRenderMessage) {
  let instance = getInstance(fritz, msg.id);
  if(instance !== undefined) {
    instance.doRenderCallback(msg.tree);
  }
};

export function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let ev = msg.event;
  let event = new CustomEvent(ev.type, {
    bubbles: true,//ev.bubbles,
    cancelable: ev.cancelable,
    detail: ev.detail,
    scoped: ev.scoped,
    composed: ev.composed
  });

  inst.dispatchEvent(event);
};
