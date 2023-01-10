import type { Fritz } from './types';
import type { default as Component } from './worker/component';
import type { MountBase } from './window/types';

type AcceptableFritz = Fritz<Component<any, any> | MountBase>;

export function getInstance<F extends AcceptableFritz>(fritz: F, id: number): F['_type'] | undefined {
  return fritz._instances.get(id);
};

export function setInstance<F extends AcceptableFritz>(fritz: F, id: number, instance: any) {
  fritz._instances.set(id, instance);
};

export function delInstance<F extends AcceptableFritz>(fritz: F, id: number) {
  fritz._instances.delete(id);
};

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
};

export const defer = Promise.resolve().then.bind(Promise.resolve());