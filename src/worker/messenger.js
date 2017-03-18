export default class {
  constructor(app) {
    this.app = app;
    this._listen();
  }

  _listen() {
    self.addEventListener('message',
      e => this.handle(e));
  }

  handle(e) {
    let msg = e.data;

    switch(msg.type) {
      case 'render':
        this.app.render(msg);
        break;
      case 'event':
        this.app.handleEvent(msg);
        break;
    }
  }

  define(tag) {
    postMessage({ type: 'tag', tag });
  }

  dispatch(id, event) {
    let msg = { id, type: 'event', event };
    postMessage(msg);
  }

  send(id, response) {
    let msg = Object.assign({ id, type: 'render' }, response);
    postMessage(msg);
  }
}
