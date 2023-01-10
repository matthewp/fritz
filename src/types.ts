import type { default as Component } from './worker/component';
import type { MountBase } from './window/types';

export type Fritz<T extends Component<any, any> | MountBase = Component<any, any>> = {
  _instances: Map<number, T>;
  _type: T;
};

export type WindowFritz = Fritz<MountBase> & {
  _id: number;
  _workers: Worker[];
  state?: any;
};

export type WorkerFritz = Fritz<Component<any, any>> & {
  state?: any;
  _tags: Map<string, any>;
};

export type PropDefinition = {
  attribute: boolean;
};

export type PropDefinitions<K extends string = any> = {
  [P in K]: PropDefinition;
};

export type RemoteEvent<D = any> = {
  type: string;
  detail?: D;
  cancelable?: boolean;
  composed?: boolean;
};