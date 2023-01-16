import fritzWindow from "../../window.mjs";
import fritzWorker from "../../worker.mjs";

export function waitForMount(...els) {
  let remaining = els.length;
  return new Promise(resolve => {
    for(let el of els) {
      el.addEventListener('mount', () => {
        remaining--;
        if(remaining === 0) {
          setTimeout(resolve, 50);
        }
      }, { once: true });
    }
  });
}

export function waitForRender(fritzElement) {
  let id = fritzElement._id;
  let worker = fritzElement._worker;
  return new Promise(resolve => {
    worker.addEventListener('message', function onMessage(ev) {
      if(ev.data?.type === 'fritz:render' && ev.data.id === id) {
        worker.removeEventListener('message', onMessage);
        resolve();
      }
    });
  });
}

export function waitFor(cb) {
  return new Promise(resolve => {
    let id = setInterval(() => {
      if(cb()) {
        clearInterval(id);
        resolve();
      }
    }, 10);
  });
}

export const hooks = {
  before() {
    this.fritzWorker = Object.create(fritzWorker);
    this.fritzWorker.define = fritzWorker._define.bind(this.fritzWorker);
    this.previousPort = fritzWorker._port;
    let channel = new MessageChannel();
    channel.port1.start();
    channel.port2.start();
    this.fritzWorker._port = channel.port2;
    fritzWindow.use(channel.port1);
  },
  after() {
    document.querySelector('#qunit-fixture').innerHTML = '';
  }
};

export const fixture = () => document.querySelector('#qunit-fixture');