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
        this.router.baseURI = msg.baseURI;
        var request = {
          method: 'GET',
          url: msg.url
        };
        if(msg.state) {
          this.router.state = msg.state;
        }
        this.router.dispatch(request);
        break;
      case 'request':
        this.router.dispatch(msg);
    }
  }

  send(tree) {
    postMessage({tree});
  }
}
