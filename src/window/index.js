import { define, render, trigger } from './lifecycle.js';
import { DEFINE, RENDER, TRIGGER } from '../message-types.js';

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
    case DEFINE:
      define.call(this, fritz, msg);
      break;
    case RENDER:
      render(fritz, msg);
      break;
    case TRIGGER:
      trigger(fritz, msg);
  }
}

fritz.use = use;

export default fritz;