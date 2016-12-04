import applyPatch from 'vdom-serialized-patch/patch';
import getDomState from './get-dom-state.js';
import PatchOptions from './patch-options.js';
import { get as getEventData } from './event-data.js';

class Framework {
  constructor() {
    this._router = null;
    this._started = false;
    this.eventHandler = this.eventHandler.bind(this);
    this.patchOptions = new PatchOptions(this);
  }

  get router() {
    return this._router;
  }

  set router(val) {
    this._router = val;
    if(!this.started) {
      this.start();
    }
  }

  start() {
    let initialState = getDomState();
    this._router.postMessage({
      type: 'initial',
      state: initialState,
      url: location.pathname
    });

    this._router.addEventListener('message',
      ev => this.handle(ev));
  }

  eventHandler(ev) {
    ev.preventDefault();
    let data = getEventData(ev.target, ev.type);
    this.request(data);
  }

  request(request) {
    request.type = 'request';
    this._router.postMessage(request);
  }

  handle(msg) {
    let patches = msg.data.patches;
    applyPatch(document.documentElement, patches, this.patchOptions);
  }
}

export default new Framework();
