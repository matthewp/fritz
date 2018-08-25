import { get as getWorkerId } from './pool.js';

const templates = new Map();

export function getId(worker, workerUniqueId) {
  let workerId = getWorkerId(worker);
  let id = workerId + '|' + workerUniqueId;
  return id;
}

export function register(worker, workerUniqueId, strings) {
  let id = getId(worker, workerUniqueId);
  templates.set(id, strings);
}

export function get(worker, workerUniqueId) {
  let id = getId(worker, workerUniqueId);
  return templates.get(id);
}
