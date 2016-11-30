importScripts('./parser.js');
importScripts('./dom-diff.js');

class Differ {
  constructor(router) {
    this.router = router;
    this.state = {
      tagName: 'HTML',
      nodeType: 1,
      childNodes: [
        {
          tagName: 'BODY',
          nodeType: 1,
          childNodes: [
          ]
        }
      ]
    };
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
        var parser = new HTMLParser();
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
  constructor(request, differ) {
    this.request = request;
    this.differ = differ;
  }

  write(chunk) {
    var tree = {
      tagName: 'HTML',
      nodeType: 1,
      childNodes: [
        {
          tagName: 'BODY',
          nodeType: 1,
          childNodes: [
            {
              tagName: 'H1',
              nodeType: 1,
              childNodes: [
                {
                  nodeType: 3,
                  textContent: 'Hello world!'
                }
              ]
            }
          ]
        }
      ]
    };

    this.differ.diff(tree);

  }

  end() {

  }
}

class FrameworkRouter {
  constructor() {
    this.differ = new Differ(this);
    this.baseURI = '/';
    this.routes = [];
  }

  handle(request) {
    var response = new Response(request, this.differ);

    // For now we're just doing the first one
    var first = this.routes[0];
    first[1](request, response);
  }

  get(route, cb){
    this.routes.push([route, cb]);
  }
}

self.router = new FrameworkRouter();
