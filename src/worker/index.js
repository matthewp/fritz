import Component from './component.js';
import h from './hyperscript.js';
import relay from './relay.js';
import { DEFINE } from '../message-types.js';

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.mount = mount;
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }

  fritz._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag,
    props: constructor.props
  });
}

function mount(vdom, selector){

}

let state;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

export default fritz;
export { Component, h, state };