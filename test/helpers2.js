import { create } from '../worker.js';
import mitt from 'https://unpkg.com/mitt@1.1.2/dist/mitt.es.js';

class Channel {
  constructor() {
    this.e = mitt();
  }

  addEventListener(name, cb) {
    const handler = (...args) => {
      cb.apply(this, args);
    };
    this.e.on(name, handler);
  }

  postMessage(data) {
    this.port.e.emit('message', { data });
  }
}

function createContext() {
  let worker = new Channel();
  let context = new Channel();

  worker.port = context;
  context.port = worker;
  let registry = create(context);

  return { worker, registry };
}

function wait(ms = 4) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function firstShadow() {
  return host.firstChild.shadowRoot;
}

export { createContext, wait, firstShadow };