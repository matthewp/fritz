import type { Tree } from './tree';
import type { PropDefinitions, RemoteEvent } from '../types';
import type { default as Handle } from './handle';

import { isFunction } from '../util.js';
import { TRIGGER } from '../message-types.js';
import { enqueueRender } from './instance.js';

interface Component<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>> {
  _fritzId: number;
  _fritzHandles: Map<number, Handle>;
  _dirty: boolean | undefined;
  localName: string;

  componentWillReceiveProps(props: P): void;
  shouldComponentUpdate(props: P): boolean;
  componentDidMount(): void;
}

abstract class Component<P extends Record<string, any> = Record<string, any>, S extends Record<string, any> = Record<string, any>> {
  public state: S;
  public props: P;
  constructor() {
    this.state = {} as any;
    this.props = {} as any;
  }

  dispatch(ev: RemoteEvent) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  setState(state: S | ((state: S, props: P) => S)) {
    let s = this.state;
    Object.assign(s, isFunction(state) ? state(s, this.props) : state);
    enqueueRender(this);
  }

  componentWillReceiveProps(){}
  shouldComponentUpdate() {
    return true;
  }
  componentWillUpdate(){}
  componentWillUnmount(){}

  abstract render(props: P, state: S): Tree;
}

export interface ComponentConstructor {
  props?: PropDefinitions;
  events?: Array<string>;
  new (...params: any[]): Component;
}

export default Component;
