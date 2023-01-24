import type { PropDefinitions, RemoteEvent, RemoteElement } from '../types';
import type { default as Handle } from './handle';
import type { ComponentChild } from './component-extras';

import { isFunction } from '../util.js';
import { TRIGGER } from '../message-types.js';
import { enqueueRender } from './instance.js';

interface Component<P = {}, S = {}, SS = {}> {
  _fritzId: number;
  _fritzHandles: Map<number, Handle>;
  _fritzPort: MessagePort;
  _dirty: boolean | undefined;
  localName: string;

  shouldComponentUpdate(props: P): boolean;
  componentDidMount(): void;
  getSnapshotBeforeUpdate(prevProps: P, prevState: S): SS | null;
  componentDidUpdate(prevProps: P, prevState: S, snapshot: SS | null): void;

}

abstract class Component<P, S, SS> {
  public state: S;
  public props: P;
  constructor() {
    this.state = {} as any;
    this.props = {} as any;
  }

  dispatch(ev: RemoteEvent) {
    let id = this._fritzId;
    this._fritzPort.postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  setState<K extends keyof S>(state: Record<K, S[K]> | ((state: S, props: P) => S)) {
    let s = this.state;
    Object.assign(s as any, isFunction(state) ? state(s, this.props) : state);
    enqueueRender(this);
  }

  shouldComponentUpdate() { return true; }
  componentWillUnmount(){}
  getSnapshotBeforeUpdate(){ return null; }
  componentDidUpdate(){}

  abstract render(props: P, state: S): ComponentChild;
}

export interface ComponentConstructor<P = {}, S = {}, SS = {}> {
  props?: PropDefinitions;
  events?: Array<string>;
  styles?: string | Array<RemoteElement | string>;
  new (...params: any[]): Component<P, S, SS>;
}

export default Component;
