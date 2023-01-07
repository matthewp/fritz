import type { WindowFritz } from '../types';
import { STATE } from '../message-types.js';

export function sendState(fritz: WindowFritz, worker: Worker) {
  let workers = worker ? [worker] : fritz._workers;
  let state = fritz.state;
  workers.forEach(function(worker){
    worker.postMessage({
      type: STATE,
      state: state
    });
  });
}
