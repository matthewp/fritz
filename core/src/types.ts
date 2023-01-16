import type { default as Component, ComponentConstructor } from './worker/component';
import type { MountBase } from './window/types';
import type { default as h } from './worker/hyperscript.js';

export type CustomElementTagName = `${string}-${string}`;

export type Fritz<T extends Component<any, any> | MountBase = Component<any, any>> = {
  _instances: Map<number, T>;
  _type: T;
};

export type WindowFritz = Fritz<MountBase> & {
  _id: number;
  _workers: Worker[];
  _sheets: CSSStyleSheet[];
  state?: any;
  use(worker: Worker): void;
  adopt(element: HTMLStyleElement | HTMLLIElement): void;
};

export type WorkerFritz = Fritz<Component<any, any>> & {
  state?: any;
  _define(tag: CustomElementTagName, constructor: ComponentConstructor): void;
  define(tag: CustomElementTagName, constructor: ComponentConstructor): void;
  h: typeof h;
  Component: typeof Component;
  fritz: WorkerFritz;
  _tags: Map<string, ComponentConstructor>;
  _port: MessagePort;
  _listening: boolean;
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

export type Sheet = {
  text: string;
};

export type RemoteElement = {
  selector: string;
};