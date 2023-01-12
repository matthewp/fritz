import type { WindowFritz } from '../types';
import type { StateMessage } from '../message-types';
import { STATE } from '../message-types.js';

export function sendState(fritz: WindowFritz, worker?: Worker) {
  let workers = worker ? [worker] : fritz._workers;
  let state = fritz.state;
  workers.forEach(function(worker) {
    const msg: StateMessage = {
      type: STATE,
      state: state
    };
    worker.postMessage(msg);
  });
}
