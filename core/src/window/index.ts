import type { MessageSentFromWorker } from '../message-types';
import type { WindowFritz } from '../types';

import { define, render, trigger } from './lifecycle.js';
import { DEFINE, RENDER, TRIGGER } from '../message-types.js';
import { sendState } from './cmd.js';
import './types';

const fritz = Object.create(null) as WindowFritz;
fritz._id = 1;
fritz._instances = new Map();
fritz._workers = [];
fritz._sheets = []

function use(worker: Worker) {
  fritz._workers.push(worker);
  worker.addEventListener('message', handleMessage);
  if(fritz.state) {
    sendState(fritz, worker);
  }
}

function handleMessage(this: Worker, ev: MessageEvent<MessageSentFromWorker>) {
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
});

function adopt(element: HTMLStyleElement | HTMLLinkElement) {
  if(element.sheet)
    fritz._sheets.push(element.sheet);
}

fritz.adopt = adopt;

export default fritz;
