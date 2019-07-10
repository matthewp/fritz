const noop = Function.prototype;

export const isWorker = typeof WorkerGlobalScope !== 'undefined';
export const postMessage = isWorker ? self.postMessage : noop;
export const addEventListener = isWorker ? self.addEventListener : noop;