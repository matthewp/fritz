(function () {
'use strict';

var Messenger = class {
  constructor(router) {
    this.router = router;
    this._listen();
  }

  _listen() {
    self.addEventListener('message', e => this.handle(e));
  }

  handle(e) {
    let msg = e.data;

    switch (msg.type) {
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
    postMessage({ tree });
  }
};

var Response = class {
  constructor(request, app) {
    this.request = request;
    this.app = app;
    this.messenger = app.messenger;
    this.isEnded = false;
  }

  redirect(route) {
    this.app.handle({
      method: 'GET',
      url: route
    });
  }

  push(tree) {
    if (tree[0][1] === 'html') {
      tree.shift();
    }
    if (tree[tree.length - 1][1] === 'html') {
      tree.pop();
    }
    this.messenger.send(tree);
  }

  end(tree) {
    if (!this.isEnded) {
      this.push(tree);
      this.isEnded = true;
    }
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
    for (var i = 0, len = this.routes.length; i < len; i++) {
      if (this.routes[i][0] === request.url) {
        found = this.routes[i];
        break;
      }
    }

    let cb;
    if (found) {
      cb = found[1];
    } else {
      cb = this.routes[0][1];
    }
    let tree = cb(request, response);

    if (tree) {
      response.end(tree);
    }
  }

  use(cb) {
    // TODO not sure what
  }

  get(route, cb) {
    this.routes.push([route, cb]);
  }

  post(route, cb) {
    this.routes.push([route, cb]);
  }
}

var signal = function (tagName, attrName, attrValue, attrs) {
  switch (attrName) {
    case 'fritz-event':
      return [1, 'on' + attrValue, getUrl(attrs), getMethod(attrs)];
    case 'action':
      if (tagName === 'form') {
        return [1, 'onsubmit', attrName];
      }
      break;
  }
};

function getUrl(attrs) {
  return attrs['fritz-url'];
}

function getMethod(attrs) {
  return attrs['fritz-method'];
}

class Tree extends Array {}

var hyperscript = function (tag, attrs, children) {
  const argsLen = arguments.length;
  if (argsLen === 2) {
    if (typeof attrs !== 'object') {
      children = attrs;
      attrs = null;
    }
  } else if (argsLen > 3 || children instanceof Tree || typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if (isFn) {
    return tag(attrs, children);
  }

  var tree = new Tree();
  if (attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function (acc, key) {
      var value = attrs[key];
      acc.push(key);
      acc.push(value);

      var eventInfo = signal(tag, key, value, attrs);
      if (eventInfo) {
        if (!evs) evs = [];
        evs.push(eventInfo);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if (attrs) {
    open.push(attrs);
  }
  if (evs) {
    open.push(evs);
  }
  tree.push(open);

  if (children) {
    children.forEach(function (child) {
      if (typeof child === "string") {
        tree.push([4, child]);
        return;
      }

      while (child && child.length) {
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

var Layout = function (props, children) {
  return hyperscript(
    "html",
    null,
    hyperscript(
      "head",
      null,
      hyperscript(
        "title",
        null,
        "Aliens app!"
      ),
      hyperscript("link", { rel: "stylesheet", href: "./styles.css" })
    ),
    hyperscript(
      "body",
      null,
      hyperscript(
        "h1",
        null,
        "Aliens"
      ),
      hyperscript(
        "main",
        null,
        children
      )
    )
  );
};

var indexRoute = function (app) {
  let species = ['xenomorph', 'predator'];

  app.get('/', function (req, res) {
    return hyperscript(
      Layout,
      null,
      hyperscript(
        'form',
        { 'fritz-event': 'keyup', 'fritz-url': '/search', 'fritz-method': 'GET' },
        hyperscript('input', { type: 'text', value: '', name: 'q', placeholder: 'Search species' })
      ),
      hyperscript(
        'ul',
        null,
        species.map(name => {
          return hyperscript(
            'li',
            null,
            name
          );
        })
      )
    );
  });
};

const app = makeApp();

indexRoute(app);

}());
