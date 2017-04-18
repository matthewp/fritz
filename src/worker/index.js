import Component from './component.js';
import h from './hyperscript.js';
import relay from './relay.js';
import { DEFINE } from '../message-types.js';

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  fritz._tags[tag] = constructor;

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag
  });
}

export default fritz;
export { Component, h };