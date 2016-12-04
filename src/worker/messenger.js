import bctovdom from './bc-to-vdom.js';
import diff from 'virtual-dom/diff';
import serializePatch from 'vdom-serialized-patch/serialize';

export default class {
  constructor(router) {
    this.router = router;
    this._listen();
  }

  _listen() {
    self.addEventListener('message',
      e => this.handle(e));
  }

  handle(e) {
    let msg = e.data;

    switch(msg.type) {
      case 'initial':
        this.state = bctovdom(msg.state);
        this.router.baseURI = msg.baseURI;
        var request = {
          method: 'GET',
          url: msg.url
        };
        this.router.handle(request);
        break;
      case 'request':
        this.router.handle(msg);
    }
  }

  diff(tree) {
    let patch = diff(this.state, tree);
    let serializedPatch = serializePatch(patch);
    this.state = tree;
    return serializedPatch;
  }

  send(tree) {
    let patches = this.diff(tree);
    postMessage({
      patches
    });
  }
}
