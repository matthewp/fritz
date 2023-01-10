import type { MountBase } from './types';
import type { WindowFritz, PropDefinitions } from '../types';
import type { DefineMessage } from '../message-types';

import { DESTROY } from '../message-types.js';
import { setInstance, delInstance } from '../util.js';

export function withWorkerConnection(
  fritz: WindowFritz,
  events: DefineMessage['events'],
  props: PropDefinitions,
  worker: Worker,
  Base: MountBase
) {
  return class extends Base {
    static get props() {
      return props;
    }

    constructor() {
      super();
      this._id = ++fritz._id;
      this._worker = worker;
    }

    connectedCallback() {
      super.connectedCallback();
      setInstance(fritz, this._id, this);
      events.forEach(eventName => {
        (this.shadowRoot as any).addEventListener(eventName, this);
      });
    }

    disconnectedCallback() {
      // @ts-ignore
      if(super.disconnectedCallback) super.disconnectedCallback();
      delInstance(fritz, this._id);
      events.forEach(eventName => {
        (this.shadowRoot as any).removeEventListener(eventName, this);
      });
      this._worker.postMessage({
        type: DESTROY,
        id: this._id
      });
    }
  }
}
