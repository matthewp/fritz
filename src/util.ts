import type { Fritz } from './types';

export function getInstance(fritz: Fritz, id: number){
  return fritz._instances.get(id);
};

export function setInstance(fritz: Fritz, id: number, instance: any){
  fritz._instances.set(id, instance);
};

export function delInstance(fritz: Fritz, id: number){
  fritz._instances.delete(id);
};

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
};

export const defer = Promise.resolve().then.bind(Promise.resolve());