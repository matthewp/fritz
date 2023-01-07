import { define, render, trigger } from './lifecycle.js';
import { DEFINE, RENDER, TRIGGER } from '../message-types.js';
import { sendState } from './cmd.js';

const fritz = Object.create(null);
fritz.tags = Object.create(null);
fritz._id = 1;
fritz._instances = new Map();
fritz._workers = [];
fritz._work = [];

function use(worker) {
  fritz._workers.push(worker);
  worker.addEventListener('message', handleMessage);
  if(fritz.state) {
    sendState(fritz, worker);
  }
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

Object.defineProperty(fritz, 'state', {
  set: function(val){
    this._state = val;
    sendState(fritz);
  },
  get: function(){
    return this._state;
  }
})

export default fritz;
