const noop = Function.prototype;

// @ts-ignore
export const isWorker = typeof WorkerGlobalScope !== 'undefined';