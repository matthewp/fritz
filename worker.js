importScripts('./test.js');

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
        //var parser = new HTMLParser();
        //this.state = parser.parse(msg.state);

        this.router.baseURI = msg.baseURI;
        var request = {
          method: 'GET',
          url: msg.url
        };
        this.router.handle(request);
        break;
    }
  }

  diff(newTree) {
    var patches = skatejsDomDiff.default.diff({
      destination: newTree,
      source: this.state
    });
    // this.state = newTree;
    postMessage({
      type: 'patch',
      patches: patches
    });
  }
}

class Response {
  constructor(request, messenger) {
    this.request = request;
    this.messenger = messenger;
  }

  write() {

  }

  end() {

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
