const isWorker = typeof WorkerGlobalScope !== 'undefined';
const noop = Function.prototype;

export const postMessage = isWorker ? self.postMessage : noop;
export const addEventListener = isWorker ? self.addEventListener : noop;