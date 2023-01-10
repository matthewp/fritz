import type { DefineMessage } from '../message-types';
import type { WorkerFritz } from '../types';

import Component from './component.js';
import h, { Fragment } from './hyperscript.js';
import relay from './relay.js';
import { DEFINE } from '../message-types.js';
import { postMessage } from './env.js';

const fritz = Object.create(null) as WorkerFritz;
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = new Map();
fritz._instances = new Map();
fritz.fritz = fritz;

function define(tag: string, constructor: typeof Component) {
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

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  const msg: DefineMessage = {
    type: DEFINE,
    tag: tag,
    props: constructor.props,
    events: constructor.events,
    features: {
      mount: !!constructor.prototype.componentDidMount
    }
  }

  postMessage(msg);
}

let state: any;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

export default fritz;
export { Component, h, Fragment, state };
