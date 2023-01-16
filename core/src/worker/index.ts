import type { DefineMessage } from '../message-types';
import type { CustomElementTagName, WorkerFritz } from '../types';
import type { ComponentConstructor } from './component';

import Component from './component.js';
import h, { Fragment } from './hyperscript.js';
import relay from './relay.js';
import { DEFINE } from '../message-types.js';
import '../types'; // This is needed to get the types to be built.

const fritz = Object.create(null) as WorkerFritz;
fritz.Component = Component;
fritz._define = define;
fritz.define = define.bind(fritz)
fritz.h = h;
fritz._tags = new Map();
fritz._instances = new Map();
fritz._port = globalThis as any;
fritz._listening = false;
fritz.fritz = fritz;

function define(this: WorkerFritz, tag: CustomElementTagName, constructor: ComponentConstructor) {
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }
  if(constructor.prototype === undefined ||
    constructor.prototype.render === undefined) {
    let render = constructor;
    // @ts-ignore
    constructor = class extends Component{};
    // @ts-ignore
    constructor.prototype.render = render;
  }

  this._tags.set(tag, constructor);

  Object.defineProperties(constructor.prototype, {
    _fritzPort: {
      value: this._port
    },
    localName: {
      enumerable: false,
      value: tag
    }
  });

  relay(this);

  let styles = undefined;
  if(constructor.styles) {
    styles = [];
    if(typeof constructor.styles === 'string') {
      styles.push({ text: constructor.styles });
    } else {
      for(let def of constructor.styles) {
        if(typeof def === 'string') {
          styles.push({ text: def });
        } else {
          styles.push(def);
        }
      }
    }
  }

  const msg: DefineMessage = {
    type: DEFINE,
    tag: tag,
    props: constructor.props,
    events: constructor.events,
    styles,
    features: {
      mount: !!constructor.prototype.componentDidMount
    }
  }

  this._port.postMessage?.(msg);
}

let state: any;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

const adopt = (selector: string) => ({ selector });

export const css = String.raw;
export default fritz;
export { Component, h, Fragment, adopt, state };