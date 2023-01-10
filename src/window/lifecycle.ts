import type { WorkerRenderMessage, DefineMessage, TriggerMessage } from '../message-types';
import type { WindowFritz } from '../types';

import { withComponent } from './component.js';
import { withWorkerConnection } from './with-worker-connection.js';
import { getInstance } from '../util.js';

export function define(this: Worker, fritz: WindowFritz, msg: DefineMessage) {
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

export function render(fritz: WindowFritz, msg: WorkerRenderMessage) {
  let instance = getInstance<WindowFritz>(fritz, msg.id);
  if(instance !== undefined) {
    instance.doRenderCallback(msg.tree);
  }
};

export function trigger(fritz: WindowFritz, msg: TriggerMessage) {
  let inst = getInstance<WindowFritz>(fritz, msg.id)!;
  let ev = msg.event;
  let event = new CustomEvent(ev.type, {
    bubbles: true,//ev.bubbles,
    cancelable: ev.cancelable,
    detail: ev.detail,
    composed: ev.composed
  });

  inst.dispatchEvent(event);
};
