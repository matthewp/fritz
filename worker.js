(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.framework = factory());
}(this, (function () { 'use strict';

var Messenger = class {
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
};

var Response = class {
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
};

class App {
  static get app() {
    return this._val;
  }

  static set app(val) {
    this._app = val;
  }

  constructor() {
    this.messenger = new Messenger(this);
    this.baseURI = '/';
    this.routes = [];
    App.app = this;
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

var h = function(tag /* children, attrs */){
  var children = Array.prototype.slice.call(arguments, 1);
  var last = children[children.length - 1];
  var attrs;
  if(typeof last !== "string" && !Array.isArray(last)) {
    attrs = children.pop();
    attrs = Object.keys(attrs).reduce(function(acc, key){
      acc.push(key);
      acc.push(attrs[key]);
      return acc;
    }, []);
  }

  var tree = [[1, tag, attrs]];

  children.forEach(function(child){
    if(typeof child === "string") {
      tree.push([4, child]);
      return;
    }

    while(child.length) {
      tree.push(child.shift());
    }
  });

  tree.push([2, tag]);
  return tree;
};

function makeApp() {
  return new App();
}

var index = {
  h,
  makeApp
};

return index;

})));
