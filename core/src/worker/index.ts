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
fritz.define = define;
fritz.h = h;
fritz._tags = new Map();
fritz._instances = new Map();
fritz._port = self as any;
fritz.fritz = fritz;

function define(tag: CustomElementTagName, constructor: ComponentConstructor) {
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

  fritz._tags.set(tag, constructor);

  Object.defineProperties(constructor.prototype, {
    _fritzPort: {
      value: fritz._port
    },
    localName: {
      enumerable: false,
      value: tag
    }
  });

  relay(fritz);

  const msg: DefineMessage = {
    type: DEFINE,
    tag: tag,
    props: constructor.props,
    events: constructor.events,
    adopt: constructor.adopt,
    features: {
      mount: !!constructor.prototype.componentDidMount
    }
  }

  fritz._port.postMessage(msg);
}

let state: any;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

export default fritz;
export { Component, h, Fragment, state };