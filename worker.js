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
      case 'request':
        this.router.handle(msg);
    }
  }

  send(tree) {
    postMessage({tree});
  }
};

var Response = class {
  constructor(request, app) {
    this.request = request;
    this.app = app;
    this.messenger = app.messenger;
  }

  redirect(route) {
    this.app.handle({
      method: 'GET',
      url: route
    });
  }

  push(tree) {
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
    var response = new Response(request, this);

    var found;
    for(var i = 0, len = this.routes.length; i < len; i++) {
      if(this.routes[i][0] === request.url) {
        found = this.routes[i];
        break;
      }
    }

    if(found) {
      found[1](request, response);
    } else {
      this.routes[0][1](request, response);
    }
  }

  use(cb) {
    // TODO not sure what
  }

  get(route, cb){
    this.routes.push([route, cb]);
  }

  post(route, cb) {
    this.routes.push([route, cb]);
  }
}

var signal = function(tagName, attrName, attrValue) {
  if(tagName === 'form' && attrName === 'action') {
    return [1, 'onsubmit', attrName];
  }
};

var h = function(tag, attrs, children){
  const isStringChild = typeof attrs === 'string';
  if(Array.isArray(attrs)|| isStringChild) {
    children = attrs;
    attrs = null;

    if(isStringChild) {
      children = [children];
    }
  }

  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];
      acc.push(key);
      acc.push(value);

      var eventInfo = signal(tag, key, value);
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if(attrs) {
    open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  var tree = [open];

  if(children) {
    children.forEach(function(child){
      if(typeof child === "string") {
        tree.push([4, child]);
        return;
      }

      while(child.length) {
        tree.push(child.shift());
      }
    });
  }

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
