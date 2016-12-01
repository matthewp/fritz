class Messenger {
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
        this.router.handle(request);
        break;
    }
  }

  send(tree) {
    postMessage({tree});
  }
}

class Response {
  constructor(request, messenger) {
    this.request = request;
    this.messenger = messenger;
  }

  end(tree) {
    if(tree[0][1] === 'html') {
      tree.shift();
    }
    if(tree[tree.length - 1][1] === 'html') {
      tree.pop();
    }
    this.messenger.send(tree);
  }
}

class FrameworkRouter {
  constructor() {
    this.messenger = new Messenger(this);
    this.baseURI = '/';
    this.routes = [];
  }

  handle(request) {
    var response = new Response(request, this.messenger);

    // For now we're just doing the first one
    var first = this.routes[0];
    first[1](request, response);
  }

  get(route, cb){
    this.routes.push([route, cb]);
  }
}

self.router = new FrameworkRouter();
