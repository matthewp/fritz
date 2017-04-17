import { Component } from './component.js';
import define from './define.js';
import { renderFor } from './render.js';

const fritz = Object.create(null);
fritz.tags = Object.create(null);
fritz._id = 1;
fritz._instances = Object.create(null);

function use(worker) {
  worker.addEventListener('message', handleMessage);
}

function handleMessage(ev) {
  let msg = ev.data;
  switch(msg.type) {
    case 'define':
      define.call(this, fritz, msg);
      break;
    case 'render':
      renderFor(msg, fritz);
      break;
  }
}

fritz.use = use;

export default fritz;