import Component from './component.js';
import h from './hyperscript.js';
import listenFor from './listen-for.js';

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  fritz._tags[tag] = constructor;

  listenFor(tag, fritz);

  postMessage({
    type: 'define',
    tag: tag
  });
}

export default fritz;