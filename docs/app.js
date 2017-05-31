(function () {
'use strict';

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';
const DESTROY = 'destroy';

let currentInstance = null;

function renderInstance(instance) {
  currentInstance = instance;
  let tree = instance.render(instance);
  currentInstance = null;
  return tree;
}

class Component {
  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  update() {
    let id = this._fritzId;
    postMessage({
      type: RENDER,
      id: id,
      tree: renderInstance(this)
    });
  }

  destroy() {}
}

let Store;
let Handle;

Store = class {
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
  }

  from(fn) {
    let handle;
    let id = this.handleMap.get(fn);
    if (id == null) {
      id = this.id++;
      handle = new Handle(id, fn);
      this.handleMap.set(fn, id);
      this.idMap.set(id, handle);
    } else {
      handle = this.idMap.get(id);
    }
    return handle;
  }

  get(id) {
    return this.idMap.get(id);
  }
};

Handle = class {
  static get store() {
    if (!this._store) {
      this._store = new Store();
    }
    return this._store;
  }

  static from(fn) {
    return this.store.from(fn);
  }

  static get(id) {
    return this.store.get(id);
  }

  constructor(id, fn) {
    this.id = id;
    this.fn = fn;
  }

  del() {
    let store = Handle.store;
    store.handleMap.delete(this.fn);
    store.idMap.delete(this.id);
  }
};

var Handle$1 = Handle;

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {
  if (eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let handle = Handle$1.from(attrValue);
    currentInstance._fritzHandles[handle.id] = handle;
    return [1, eventName, handle.id];
  }
}

class Tree extends Array {}

function h(tag, attrs, children) {
  const argsLen = arguments.length;
  if (argsLen === 2) {
    if (typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if (argsLen > 3 || children instanceof Tree || typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if (isFn) {
    var localName = tag.prototype.localName;
    if (localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = new Tree();
  if (attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function (acc, key) {
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if (eventInfo) {
        if (!evs) evs = [];
        evs.push(eventInfo);
      } else {
        acc.push(key);
        acc.push(value);
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
}

class Serializable {
  serialize() {
    let out = Object.create(null);
    return Object.assign(out, this);
  }
}

class Event extends Serializable {
  constructor(type) {
    super();
    this.type = type;
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

function getInstance(fritz, id) {
  return fritz._instances[id];
}

function setInstance(fritz, id, instance) {
  fritz._instances[id] = instance;
}

function delInstance(fritz, id) {
  delete fritz._instances[id];
}

function render(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  let events;
  if (!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperties(instance, {
      _fritzId: {
        enumerable: false,
        value: id
      },
      _fritzHandles: {
        enumerable: false,
        writable: true,
        value: Object.create(null)
      }
    });
    setInstance(fritz, id, instance);
    events = constructor.observedEvents;
  }

  Object.assign(instance, props);

  let tree = renderInstance(instance);
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
}

function trigger(fritz, msg) {
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if (msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    method = inst[methodName];
  }

  if (method) {
    let event = new Event(msg.name);
    event.value = msg.value;

    method.call(inst, event);
    response.type = RENDER;
    response.id = msg.id;
    response.tree = renderInstance(inst);
    response.event = event.serialize();
    postMessage(response);
  } else {
    // TODO warn?
  }
}

function destroy(fritz, msg) {
  let instance = getInstance(fritz, msg.id);
  instance.destroy();
  Object.keys(instance._fritzHandles).forEach(function (key) {
    let handle = instance._fritzHandles[key];
    handle.del();
  });
  instance._fritzHandles = Object.create(null);
  delInstance(fritz, msg.id);
}

let hasListened = false;

function relay(fritz) {
  if (!hasListened) {
    hasListened = true;

    self.addEventListener('message', function (ev) {
      let msg = ev.data;
      switch (msg.type) {
        case RENDER:
          render(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
          break;
        case STATE:
          fritz.state = msg.state;
          break;
        case DESTROY:
          destroy(fritz, msg);
          break;
      }
    });
  }
}

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  if (constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }
  if (constructor.prototype.render === undefined) {
    let render = constructor;
    constructor = class extends Component {};
    constructor.prototype.render = render;
  }

  fritz._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag,
    props: constructor.props
  });
}

let state;
Object.defineProperty(fritz, 'state', {
  set: function (val) {
    state = val;
  },
  get: function () {
    return state;
  }
});

var styles = ".about {\n  background-color: var(--alt-bg);\n  max-width: 80%;\n  margin: auto;\n  font-size: 120%;\n}\n\n.about p {\n  line-height: 2rem;\n}\n\n.about h1 {\n  color: var(--vermilion);\n  font-size: 220%;\n}\n\n.about a, .about a:visited {\n  color: var(--main-color);\n}\n\n.about code-snippet,\n.about code-file {\n  width: 60%;\n}\n\n.about code-file {\n  --box-shadow: none;\n}\n\n@media only screen and (max-width: 768px) {\n  .about code-snippet,\n  .about code-file {\n    width: 100%;\n    font-size: 90%;\n  }\n}";

const npmInstall = `
npm install fritz --save
`;

const yarnAdd = `
yarn add fritz
`;

function about() {
  return h(
    'section',
    { 'class': 'about' },
    h(
      'style',
      null,
      styles
    ),
    h(
      'h1',
      { id: 'what-is-fritz' },
      'What is Fritz?'
    ),
    h(
      'p',
      null,
      h(
        'strong',
        null,
        'Fritz'
      ),
      ' is a UI library that allows you to define ',
      h(
        'em',
        null,
        'components'
      ),
      ' that run inside of a ',
      h(
        'a',
        { href: 'https://www.w3.org/TR/workers/' },
        'Web Worker'
      ),
      '. By running your application logic inside of a Worker, you can ensure that the main thread and scrolling are never blocked by expensive work you are doing. Fritz makes jank-free apps possible.'
    ),
    h(
      'p',
      null,
      'Fritz plays nicely with frameworks. Since it is built on web components you can use Fritz just by adding a tag. Use Fritz within your ',
      h(
        'a',
        { href: 'https://facebook.github.io/react/' },
        'React'
      ),
      ', ',
      h(
        'a',
        { href: 'https://vuejs.org/' },
        'Vue.js'
      ),
      ', ',
      h(
        'a',
        { href: 'https://angular.io/' },
        'Angular'
      ),
      ', or any other framework. If you have an expensive component that operates on a large dataset, this is a good candidate to turn into a Fritz component. Although you can create your entire app using Fritz (this page is), you don\'t have to.'
    ),
    h(
      'p',
      null,
      'If you\'ve heard of React\'s new version, ',
      h(
        'strong',
        null,
        'Fiber'
      ),
      ', Fritz is in some ways an alternative. Fiber enables React to smartly schedule updates. Fritz allows for ',
      h(
        'em',
        null,
        'parallel'
      ),
      ' updates. You\'re app can launch as many workers as you want and Fritz will use them all. The main thread only ever needs to apply changes. Due to this design, Fritz\'s scheduler is dead simple; it only needs to ensure that it applies only 16ms of work per frame. It can completely ignore the cost of user-code; that\'s free with Fritz.'
    ),
    h(
      'h1',
      null,
      'Getting Started'
    ),
    h(
      'h2',
      null,
      'Installation'
    ),
    h(
      'p',
      null,
      'Install Fritz with npm:'
    ),
    h('code-snippet', { code: npmInstall }),
    h(
      'p',
      null,
      'Or with Yarn:'
    ),
    h('code-snippet', { code: yarnAdd }),
    h(
      'h2',
      null,
      'Using Fritz'
    ),
    h(
      'p',
      null,
      'Fritz lets you define ',
      h(
        'a',
        { href: 'https://www.webcomponents.org/introduction' },
        'web components'
      ),
      ' inside of a Web Worker. So, the first step to using Fritz is to create a Worker. Use ',
      h(
        'code',
        null,
        'new Worker'
      ),
      ' to do so:'
    ),
    h('code-snippet', { code: `const worker = new Worker('./app.js');` }),
    h(
      'p',
      null,
      'And then define a component inside of that worker. We\'ll assume you know how to configure your bundler tool and skip that part. But we should point out that you want to change your ',
      h(
        'a',
        { href: 'https://babeljs.io/' },
        'Babel'
      ),
      ' config so that it renders JSX to Fritz ',
      h(
        'code',
        null,
        'h()'
      ),
      ' calls.'
    ),
    h('code-snippet', { code: `
{
  "plugins": [
    ["transform-react-jsx", { "pragma":"h" }]
  ]
}
` }),
    h(
      'p',
      null,
      'Then import all of the needed things and create a basic component:'
    ),
    h('code-file', { name: 'app.js', code: `
import fritz, { Component, h } from 'fritz';

class Hello extends Component {
  static get props() {
    return {
      name: { attribute: true }
    };
  }

  render({name}) {
    return <div>Hello {name}!</div>
  }
}

fritz.define('hello-message', Hello);
` }),
    h(
      'p',
      null,
      'Cool, now that we have created a component we need to actually use it. Create another bundle named main.js, this will be a script we add to our page which will sync up the DOM to our component:'
    ),
    h('code-file', { name: 'main.js', code: `
import fritz from 'fritz/window';

const worker = new Worker('./app.js');
fritz.use(worker);
` }),
    h(
      'p',
      null,
      'Now we just need to add this script to our page and use the component.'
    ),
    h('code-file', { name: 'index.html', code: `
<!doctype html>
<html lang="en">
<title>Our app</title>

<hello-message name="World"></hello-message>

<script src="./main.js" async></script>
` }),
    h(
      'p',
      null,
      'And that\'s it!'
    ),
    h(
      'h2',
      null,
      'In a React app'
    ),
    h(
      'p',
      null,
      'How'
    )
  );
}

var styles$1 = ":host {\n  display: block;\n  --main-bg: var(--cadetblue);\n  --alt-bg: var(--gray);\n\n  --main-color: var(--jet);\n  --alt-color: #fff;\n}\n\na, a:visited {\n  font-weight: 600;\n}\n\n.shadow-section {\n  box-shadow: 0px 1px 10px 1px rgba(0,0,0,0.3);\n  margin-bottom: 12px;\n}\n\n.intro, .about {\n  padding: 2.7777777777777777rem 2.2222222222222223rem 1.6666666666666667rem 2.2222222222222223rem;\n}\n\n/* intro */\n.intro {\n  text-align: center;\n  background-color: var(--main-bg);\n  color: var(--main-color);\n}\n\n.primary-title {\n  font-size: 2.2em;\n}\n\n.fritz-flame {\n  width: 14rem;\n  border-radius: 0.8rem;\n}\n\n.github {\n  display: inline-block;\n  text-align: center;\n  width: 11rem;\n  padding: 0.5rem 0;\n  margin: 0.5rem 1rem;\n  font-size: 150%;\n  font-weight: 100;\n}\n\n.github, .github:visited {\n  color: #fff;\n  background-color: var(--vermilion);\n  text-decoration: none;\n}\n\n.intro code-file {\n  display: block;\n  width: 60%;\n  margin: auto;\n  text-align: initial;\n  font-size: 130%;\n}\n\ncode-file:nth-of-type(1) {\n  margin-top: 4rem;\n}\n\ncode-snippet, code-file {\n  display: block;\n}\n\n@media only screen and (max-width: 768px) {\n  .intro code-file {\n    width: 85%;\n    font-size: 90%;\n  }\n}\n/* end intro */\n\nfooter {\n  background-color: var(--main-bg);\n  height: 7rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  font-size: 120%;\n}\n\nfooter p {\n  margin: 0;\n}\n\nfooter a,\nfooter a:visited {\n  color: #fff;\n  font-weight: 600;\n}";

var styles$2 = ".title {\n  text-align: center;\n  font-weight: 100;\n}\n\ncode-snippet {\n  display: block;\n  box-shadow: var(--box-shadow, 3px 3px 12px 1px rgba(0,0,0,0.4));\n}";

class CodeFile extends Component {
  static get props() {
    return {
      code: 'string',
      name: 'string'
    };
  }

  render({ code, name }) {
    return h(
      'div',
      null,
      h(
        'style',
        null,
        styles$2
      ),
      h(
        'div',
        { 'class': 'title' },
        name
      ),
      h('code-snippet', { code: code })
    );
  }
}

fritz.define('code-file', CodeFile);

// https://coolors.co/bac1b8-58a4b0-303030-0c7c59-d64933

const jsCode = `
class HelloMessage extends Component {
  static props = {
    name: { attribute: true }
  }

  render() {
    return (
      <div>Hello {this.name}!</div>
    );
  }
}

fritz.define('hello-message', HelloMessage);
`;

const htmlCode = `
<hello-message name="World"></hello-message>

<script src="./node_modules/fritz/window.umd.js"></script>
<script>
  fritz.use(new Worker('./worker.js'));
</script>
`;

function main() {
  return h(
    'main',
    null,
    h(
      'style',
      null,
      styles$1
    ),
    h(
      'section',
      { 'class': 'intro shadow-section' },
      h(
        'header',
        { 'class': 'title' },
        h(
          'h1',
          { 'class': 'primary-title' },
          'Fritz'
        ),
        h('img', { 'class': 'fritz-flame', src: './frankenstein-fritz-flame.png', title: 'Fritz, with a flame' }),
        h(
          'h2',
          null,
          'Take your UI off the main thread.'
        )
      ),
      h(
        'a',
        { 'class': 'github', href: 'https://github.com/matthewp/fritz' },
        'GitHub'
      ),
      h('code-file', { name: 'worker.js', code: jsCode }),
      h('code-file', { name: 'index.html', code: htmlCode })
    ),
    h(about, null),
    h(
      'footer',
      null,
      h(
        'p',
        null,
        'Made with \uD83C\uDF83 by ',
        h(
          'a',
          { href: 'https://twitter.com/matthewcp' },
          '@matthewcp'
        )
      )
    )
  );
}

fritz.define('its-fritz-yall', main);

}());
