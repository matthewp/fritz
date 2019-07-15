(function () {
  'use strict';

  function getInstance(fritz, id){
    return fritz._instances.get(id);
  }
  function setInstance(fritz, id, instance){
    fritz._instances.set(id, instance);
  }
  function delInstance(fritz, id){
    fritz._instances.delete(id);
  }
  function isFunction(val) {
    return typeof val === 'function';
  }
  const defer = Promise.resolve().then.bind(Promise.resolve());

  const DEFINE = 'define';
  const TRIGGER = 'trigger';
  const RENDER = 'render';
  const EVENT = 'event';
  const STATE = 'state';
  const DESTROY = 'destroy';
  const RENDERED = 'rendered';
  const CLEANUP = 'cleanup';

  let currentInstance = null;

  function renderInstance(instance) {
    currentInstance = instance;
    let tree = instance.render(instance.props, instance.state);
    currentInstance = null;
    return tree;
  }
  let queue = [];

  function enqueueRender(instance, sentProps) {
    if(!instance._dirty && (instance._dirty = true) && queue.push([instance, sentProps])==1) {
      defer(rerender);
    }
  }

  function rerender() {
  	let p, list = queue;
  	queue = [];
  	while ( (p = list.pop()) ) {
  		if (p[0]._dirty) render(p[0], p[1]);
  	}
  }

  function render(instance, sentProps) {
    if(sentProps) {
      var nextProps = Object.assign({}, instance.props, sentProps);
      instance.componentWillReceiveProps(nextProps);
      instance.props = nextProps;
    }

    if(instance.shouldComponentUpdate(nextProps) !== false) {
      instance.componentWillUpdate();
      instance._dirty = false;

      postMessage({
        type: RENDER,
        id: instance._fritzId,
        tree: renderInstance(instance)
      });
    }
  }

  class Component {
    constructor() {
      this.state = {};
      this.props = {};
    }

    dispatch(ev) {
      let id = this._fritzId;
      postMessage({
        type: TRIGGER,
        event: ev,
        id: id
      });
    }

    setState(state) {
      let s = this.state;
      Object.assign(s, isFunction(state) ? state(s, this.props) : state);
      enqueueRender(this);
    }

    componentWillReceiveProps(){}
    shouldComponentUpdate() {
      return true;
    }
    componentWillUpdate(){}
    componentWillUnmount(){}
  }

  const noop = Function.prototype;

  const isWorker = typeof WorkerGlobalScope !== 'undefined';
  const postMessage$1 = isWorker ? self.postMessage : noop;
  const addEventListener$1 = isWorker ? self.addEventListener : noop;

  let Store, Handle;

  Store = class {
    constructor() {
      this.handleMap = new WeakMap();
      this.idMap = new Map();
      this.id = 0;
      this.inUse = true;
    }

    from(fn) {
      let handle;
      let id = this.handleMap.get(fn);
      if(id == null) {
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
      if(!this._store) {
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
    if(eventAttrExp.test(attrName)) {
      if(!isWorker) {
        return [];
      }

      let eventName = attrName.toLowerCase();
      let handle = Handle$1.from(attrValue);
      handle.inUse = true;
      currentInstance._fritzHandles.set(handle.id, handle);
      return [1, eventName, handle.id];
    }
  }

  const _tree = Symbol('ftree');

  function isTree(obj) {
    return !!(obj && obj[_tree]);
  }
  function createTree() {
    let out = [];
    out[_tree] = true;
    return out;
  }

  function Fragment(attrs, children) {
    let child;
    let tree = createTree();
    for(let i = 0; i < children.length; i++) {
      child = children[i];
      tree.push.apply(tree, child);
    }
    return tree;
  }

  function h(tag, attrs, children){
    let argsLen = arguments.length;
    let childrenType = typeof children;
    if(argsLen === 2) {
      if(typeof attrs !== 'object' || Array.isArray(attrs)) {
        children = attrs;
        attrs = null;
      }
    } else if(argsLen > 3 || isTree(children) || isPrimitive(childrenType)) {
      children = Array.prototype.slice.call(arguments, 2);
    }

    let isFn = isFunction(tag);

    if(isFn) {
      let localName = tag.prototype.localName;
      if(localName) {
        return h(localName, attrs, children);
      }

      return tag(attrs || {}, children);
    }

    let tree = createTree();
    let uniq, evs;
    if(attrs) {
      attrs = Object.keys(attrs).reduce(function(acc, key){
        let value = attrs[key];

        let eventInfo = signal(tag, key, value);
        if(eventInfo) {
          if(!evs) evs = [];
          evs.push(eventInfo);
        } else if(key === 'key') {
          uniq = value;
        } else {
          acc.push(key);
          acc.push(value);
        }

        return acc;
      }, []);
    }

    let open = [1, tag, uniq];
    if(attrs) {
      open.push(attrs);
    }
    if(evs) {
      open.push(evs);
    }
    tree.push(open);

    if(children) {
      children.forEach(function(child){
        if(typeof child !== 'undefined' && !Array.isArray(child)) {
          tree.push([4, child + '']);
          return;
        }

        while(child && child.length) {
          tree.push(child.shift());
        }
      });
    }

    tree.push([2, tag]);

    return tree;
  }
  h.frag = Fragment;

  function isPrimitive(type) {
    return type === 'string' || type === 'number' || type === 'boolean';
  }

  function render$1(fritz, msg) {
    let id = msg.id;
    let props = msg.props || {};

    let instance = getInstance(fritz, id);
    if(!instance) {
      let constructor = fritz._tags.get(msg.tag);
      instance = new constructor();
      Object.defineProperties(instance, {
        _fritzId: {
          enumerable: false,
          value: id
        },
        _fritzHandles: {
          enumerable: false,
          writable: true,
          value: new Map()
        }
      });
      setInstance(fritz, id, instance);
    }

    enqueueRender(instance, props);
  }
  function trigger(fritz, msg){
    let inst = getInstance(fritz, msg.id);

    let method;
    if(msg.handle != null) {
      method = Handle$1.get(msg.handle).fn;
    } else {
      let name = msg.event.type;
      let methodName = 'on' + name[0].toUpperCase() + name.substr(1);
      method = inst[methodName];
    }

    if(method) {
      let event = msg.event;
      method.call(inst, event);

      enqueueRender(inst);
    }
  }
  function destroy(fritz, msg){
    let instance = getInstance(fritz, msg.id);
    instance.componentWillUnmount();

    let handles = instance._fritzHandles;
    handles.forEach(function(handle){
      handle.del();
    });
    handles.clear();
    
    delInstance(fritz, msg.id);
  }
  function rendered(fritz, msg) {
    let instance = getInstance(fritz, msg.id);
    instance.componentDidMount();
  }
  function cleanup(fritz, msg) {
    let instance = getInstance(fritz, msg.id);
    let handles = instance._fritzHandles;
    msg.handles.forEach(function(id){
      let handle = handles.get(id);
      handle.del();
      handles.delete(id);
    });
  }

  let hasListened = false;

  function relay(fritz) {
    if(!hasListened) {
      hasListened = true;

      addEventListener$1('message', function(ev){
        let msg = ev.data;
        switch(msg.type) {
          case RENDER:
            render$1(fritz, msg);
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
          case RENDERED:
            rendered(fritz, msg);
            break;
          case CLEANUP:
            cleanup(fritz, msg);
            break;
        }
      });
    }
  }

  const fritz = Object.create(null);
  fritz.Component = Component;
  fritz.define = define;
  fritz.h = h;
  fritz._tags = new Map();
  fritz._instances = new Map();
  fritz.fritz = fritz;

  function define(tag, constructor) {
    if(constructor === undefined) {
      throw new Error('fritz.define expects 2 arguments');
    }
    if(constructor.prototype === undefined ||
      constructor.prototype.render === undefined) {
      let render = constructor;
      constructor = class extends Component{};
      constructor.prototype.render = render;
    }

    fritz._tags.set(tag, constructor);

    Object.defineProperty(constructor.prototype, 'localName', {
      enumerable: false,
      value: tag
    });

    relay(fritz);

    postMessage$1({
      type: DEFINE,
      tag: tag,
      props: constructor.props,
      events: constructor.events,
      features: {
        mount: !!constructor.prototype.componentDidMount
      }
    });
  }

  let state;
  Object.defineProperty(fritz, 'state', {
    set: function(val) { state = val; },
    get: function() { return state; }
  });

  var n=function(t,r,u,e){for(var p=1;p<r.length;p++){var s=r[p++],a="number"==typeof s?u[s]:s;1===r[p]?e[0]=a:2===r[p]?(e[1]=e[1]||{})[r[++p]]=a:3===r[p]?e[1]=Object.assign(e[1]||{},a):e.push(r[p]?t.apply(null,n(t,a,u,["",null])):a);}return e},t=function(n){for(var t,r,u=1,e="",p="",s=[0],a=function(n){1===u&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?s.push(n||e,0):3===u&&(n||e)?(s.push(n||e,1),u=2):2===u&&"..."===e&&n?s.push(n,3):2===u&&e&&!n?s.push(!0,2,e):4===u&&r&&(s.push(n||e,2,r),r=""),e="";},f=0;f<n.length;f++){f&&(1===u&&a(),a(f));for(var h=0;h<n[f].length;h++)t=n[f][h],1===u?"<"===t?(a(),s=[s],u=3):e+=t:p?t===p?p="":e+=t:'"'===t||"'"===t?p=t:">"===t?(a(),u=1):u&&("="===t?(u=4,r=e,e=""):"/"===t?(a(),3===u&&(s=s[0]),u=s,(s=s[0]).push(u,4),u=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(a(),u=2):e+=t);}return a(),s},r="function"==typeof Map,u=r?new Map:{},e=r?function(n){var r=u.get(n);return r||u.set(n,r=t(n)),r}:function(n){for(var r="",e=0;e<n.length;e++)r+=n[e].length+"-"+n[e];return u[r]||(u[r]=t(n))};function htm(t){var r=n(this,e(t),arguments,[]);return r.length>1?r:r[0]}

  var html = htm.bind(h);

  var styles = ".about {\n  background-color: var(--alt-bg);\n  max-width: 80%;\n  margin: auto;\n  font-size: 120%;\n}\n\n.about p, .about ul {\n  line-height: 2rem;\n}\n\n.about h1 {\n  color: var(--vermilion);\n  font-size: 220%;\n}\n\n.about a, .about a:visited {\n  color: var(--main-color);\n}\n\n.about code-snippet,\n.about code-file {\n  width: 60%;\n}\n\n.about code-file {\n  --box-shadow: none;\n}\n\n@media only screen and (max-width: 768px) {\n  .about code-snippet,\n  .about code-file {\n    width: 100%;\n    font-size: 90%;\n  }\n}";

  const npmInstall = `
npm install fritz@next --save
`;

  const yarnAdd = `
yarn add fritz@next
`;

  function about() {
    return html`
    <section class="about">
      <style>${styles}</style>
      <h1 id="what-is-fritz">What is Fritz?</h1>
      <p><strong>Fritz</strong> is a UI library that allows you to define <em>components</em> that run inside of a <a href="https://www.w3.org/TR/workers/">Web Worker</a>. By running your application logic inside of a Worker, you can ensure that the main thread and scrolling are never blocked by expensive work you are doing. Fritz makes jank-free apps possible.</p>

      <p>Fritz plays nicely with frameworks. Since it is built on web components you can use Fritz just by adding a tag. Use Fritz within your <a href="https://facebook.github.io/react/">React</a>, <a href="https://vuejs.org/">Vue.js</a>, <a href="https://angular.io/">Angular</a>, or any other framework. If you have an expensive component that operates on a large dataset, this is a good candidate to turn into a Fritz component. Although you can create your entire app using Fritz (this page is), you don't have to.</p>

      <p>If you've heard of React's new version, <strong>Fiber</strong>, Fritz is in some ways an alternative. Fiber enables React to smartly schedule updates. Fritz allows for <em>parallel</em> updates. You're app can launch as many workers as you want and Fritz will use them all. The main thread only ever needs to apply changes. Due to this design, Fritz's scheduler is dead simple; it only needs to ensure that it applies only 16ms of work per frame. It can completely ignore the cost of user-code; that's free with Fritz.</p>

      <h1>Getting Started</h1>
      <h2>Installation</h2>

      <p>Install Fritz with npm:</p>
      <code-snippet lang="shell" code=${npmInstall}></code-snippet>

      <p>Or with Yarn:</p>
      <code-snippet lang="shell" code=${yarnAdd}></code-snippet>

      <h2>Using Fritz</h2>
      <p>Fritz lets you define <a href="https://www.webcomponents.org/introduction">web components</a> inside of a Web Worker. So, the first step to using Fritz is to create a Worker. Use <code>new Worker</code> to do so:</p>

      <code-snippet code=${`const worker = new Worker('./app.js');`}></code-snippet>

      <p>And then define a component inside of that worker. We'll assume you know how to configure your bundler tool and skip that part. But we should point out that you want to change your <a href="https://babeljs.io/">Babel</a> config so that it renders JSX to Fritz <code>h()</code> calls.</p>

      <code-snippet lang="json" code=${`
{
  "plugins": [
    ["transform-react-jsx", { "pragma":"h" }]
  ]
}
`}></code-snippet>

      <p>Then import all of the needed things and create a basic component:</p>

      <code-file name="app.js" code=${`
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
`}></code-file>

      <p>Cool, now that we have created a component we need to actually use it. Create another bundle named main.js, this will be a script we add to our page which will sync up the DOM to our component:</p>

      <code-file name="main.js" code=${`
import fritz from 'fritz/window';

const worker = new Worker('./app.js');
fritz.use(worker);
`}></code-file>

      <p>Now we just need to add this script to our page and use the component.</p>

      <code-file name="index.html" code=${`
<!doctype html>
<html lang="en">
<title>Our app</title>

<hello-message name="World"></hello-message>

<script type="module" src="./main.js"></script>
`}></code-file>

      <p>And that's it!</p>

      <h2>In a React app</h2>
      <p>Using Fritz components within a <a href="https://facebook.github.io/react/">React</a> application is simple. First step is to update your <code>.babelrc</code> to use h as the pragma:</p>
      <code-snippet code=${`
{
  "plugins": [
    ["transform-react-jsx", { "pragma":"h" }]
  ]
}
`}></code-snippet>

      <p>This will allow you to transform JSX both for the React and Fritz sides of your application. As before, we won't explain how to configure your bundler, but know that you will need to create a worker bundle (that contains Fritz code) and a bundle for your React code.</p>

      <p>React doesn't properly handle passing data to web components, but luckily there is a helper library that fixes the issue for us. Install <a href="https://github.com/skatejs/val">skatejs/val</a> like so:</p>
      <code-snippet lang="shell" code=${'npm install @skatejs/val'}></code-snippet>

      <p>Then create the module that will act as our wrapper:</p>

      <code-file name="val.js" code=${`
import React from 'react';
import val from '@skatejs/val';

export default val(React.createElement);
`}></code-file>

      <p>And within your React code, use it:</p>


      <code-file name="app.js" lang="jsx" code=${`
import React from 'react';
import ReactDOM from 'react-dom';
import fritz from 'fritz/window';
import h from './val.js';

fritz.use(new Worker('/worker.js'));

class Home extends React.Component {
  render() {
    return (
      <div>
        <span>Hello world</span>
        <worker-component name="Wilbur"></worker-component>
      </div>
    );
  }
}

const main = document.querySelector('main');
ReactDOM.render(<Home/>, main);
`}></code-file>
      <p>Note that this imports our implementation of <code>h</code>, which is just a small wrapper around <code>React.createElement</code>. Since we are using h in both the React app and the worker, our babel config remains the same.</p>

      <p>Now we just need to implement <code>${'<'}worker-component${'>'}</code>.</p>

      <code-file name="app.js" code=${`
import fritz, { Component, h } from 'fritz';

class MyWorkerComponent extends Component {
  static get props() {
    return {
      name: {}
    };
  }

  constructor() {
    super();
    this.state = { count: 0 };
  }

  add() {
    const count = this.state.count + 1;
    this.setState({count});
  }

  render({name}, {count}) {
    return (
      <section>
        <div>Hi {name}. This has been clicked {count} times.</div>
        <a href="#" onClick={this.add}>Add</a>
      </section>
    );
  }
}

fritz.define('worker-component', MyWorkerComponent);
`}></code-file>

      <p>A few things worth noting here:</p>
      <ul>
        <li>We define <strong>props</strong> that we expect to receive with a static <code>props</code> getter (of course you can use class properties here if using the Babel plugin).</li>
        <li><code>render</code> receives props and state as its arguments, so you can destruct.</li>
        <li>Unlike in React and Preact, you can directly pass your class methods as event handlers. Fritz will know to call your component as the <code>this</code> value when calling that function.</li>
        <li>As always, we finish out component by calling <code>fritz.define</code> to define the custom element tag name.</li>
      </ul>

      <p>And that's it! Now you can seemlessly use any Fritz components within your React application.</p>
    </section>
  `;
  }

  var styles$1 = ":host {\n  display: block;\n  --main-bg: var(--cadetblue);\n  --alt-bg: var(--gray);\n\n  --main-color: var(--jet);\n  --alt-color: #fff;\n}\n\na, a:visited {\n  font-weight: 600;\n}\n\n.shadow-section {\n  box-shadow: 0px 1px 10px 1px rgba(0,0,0,0.3);\n  margin-bottom: 12px;\n}\n\n.intro, .about {\n  padding: 2.7777777777777777rem 2.2222222222222223rem 1.6666666666666667rem 2.2222222222222223rem;\n}\n\n/* intro */\n.intro {\n  text-align: center;\n  background-color: var(--main-bg);\n  color: var(--main-color);\n}\n\n.primary-title {\n  font-size: 2.2em;\n}\n\n.fritz-flame {\n  width: 14rem;\n  border-radius: 0.8rem;\n  min-height: 134px;\n}\n\n.github {\n  display: inline-block;\n  text-align: center;\n  width: 11rem;\n  padding: 0.5rem 0;\n  margin: 0.5rem 1rem;\n  font-size: 150%;\n  font-weight: 100;\n}\n\n.github, .github:visited {\n  color: #fff;\n  background-color: var(--vermilion);\n  text-decoration: none;\n}\n\n.intro code-file {\n  display: block;\n  width: 60%;\n  margin: auto;\n  text-align: initial;\n  font-size: 130%;\n}\n\ncode-file:nth-of-type(1) {\n  margin-top: 4rem;\n}\n\ncode-snippet, code-file {\n  display: block;\n}\n\n@media only screen and (max-width: 768px) {\n  .intro code-file {\n    width: 100%;\n    font-size: 90%;\n  }\n}\n/* end intro */\n\nfooter {\n  background-color: var(--main-bg);\n  height: 7rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  font-size: 120%;\n}\n\nfooter p {\n  margin: 0;\n}\n\nfooter a,\nfooter a:visited {\n  color: #fff;\n  font-weight: 600;\n}\n";

  var styles$2 = ".title {\n  text-align: center;\n  font-weight: 100;\n}\n\ncode-snippet {\n  display: block;\n  box-shadow: var(--box-shadow, 3px 3px 12px 1px rgba(0,0,0,0.4));\n}";

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var highlight_pack = createCommonjsModule(function (module, exports) {
  /*! highlight.js v9.15.8 | BSD3 License | git.io/hljslicense */
  !function(e){var n="object"==typeof window&&window||"object"==typeof self&&self||commonjsGlobal;e(exports,n);}(function(a,n){n.hljs=a;var f=[],u=Object.keys,N={},c={},n=/^(no-?highlight|plain|text)$/i,s=/\blang(?:uage)?-([\w-]+)\b/i,t=/((^(<[^>]+>|\t|)+|(?:\n)))/gm,r={case_insensitive:"cI",lexemes:"l",contains:"c",keywords:"k",subLanguage:"sL",className:"cN",begin:"b",beginKeywords:"bK",end:"e",endsWithParent:"eW",illegal:"i",excludeBegin:"eB",excludeEnd:"eE",returnBegin:"rB",returnEnd:"rE",relevance:"r",variants:"v",IDENT_RE:"IR",UNDERSCORE_IDENT_RE:"UIR",NUMBER_RE:"NR",C_NUMBER_RE:"CNR",BINARY_NUMBER_RE:"BNR",RE_STARTERS_RE:"RSR",BACKSLASH_ESCAPE:"BE",APOS_STRING_MODE:"ASM",QUOTE_STRING_MODE:"QSM",PHRASAL_WORDS_MODE:"PWM",C_LINE_COMMENT_MODE:"CLCM",C_BLOCK_COMMENT_MODE:"CBCM",HASH_COMMENT_MODE:"HCM",NUMBER_MODE:"NM",C_NUMBER_MODE:"CNM",BINARY_NUMBER_MODE:"BNM",CSS_NUMBER_MODE:"CSSNM",REGEXP_MODE:"RM",TITLE_MODE:"TM",UNDERSCORE_TITLE_MODE:"UTM",COMMENT:"C",beginRe:"bR",endRe:"eR",illegalRe:"iR",lexemesRe:"lR",terminators:"t",terminator_end:"tE"},b="</span>",h={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0};function _(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function E(e){return e.nodeName.toLowerCase()}function v(e,n){var t=e&&e.exec(n);return t&&0===t.index}function l(e){return n.test(e)}function g(e){var n,t={},r=Array.prototype.slice.call(arguments,1);for(n in e)t[n]=e[n];return r.forEach(function(e){for(n in e)t[n]=e[n];}),t}function R(e){var a=[];return function e(n,t){for(var r=n.firstChild;r;r=r.nextSibling)3===r.nodeType?t+=r.nodeValue.length:1===r.nodeType&&(a.push({event:"start",offset:t,node:r}),t=e(r,t),E(r).match(/br|hr|img|input/)||a.push({event:"stop",offset:t,node:r}));return t}(e,0),a}function i(e){if(r&&!e.langApiRestored){if(typeof e !='string')e.langApiRestored=!0;for(var n in r)e[n]&&(e[r[n]]=e[n]);(e.c||[]).concat(e.v||[]).forEach(i);}}function m(o){function s(e){return e&&e.source||e}function c(e,n){return new RegExp(s(e),"m"+(o.cI?"i":"")+(n?"g":""))}!function n(t,e){if(!t.compiled){if(t.compiled=!0,t.k=t.k||t.bK,t.k){function r(t,e){o.cI&&(e=e.toLowerCase()),e.split(" ").forEach(function(e){var n=e.split("|");a[n[0]]=[t,n[1]?Number(n[1]):1];});}var a={};"string"==typeof t.k?r("keyword",t.k):u(t.k).forEach(function(e){r(e,t.k[e]);}),t.k=a;}t.lR=c(t.l||/\w+/,!0),e&&(t.bK&&(t.b="\\b("+t.bK.split(" ").join("|")+")\\b"),t.b||(t.b=/\B|\b/),t.bR=c(t.b),t.endSameAsBegin&&(t.e=t.b),t.e||t.eW||(t.e=/\B|\b/),t.e&&(t.eR=c(t.e)),t.tE=s(t.e)||"",t.eW&&e.tE&&(t.tE+=(t.e?"|":"")+e.tE)),t.i&&(t.iR=c(t.i)),null==t.r&&(t.r=1),t.c||(t.c=[]),t.c=Array.prototype.concat.apply([],t.c.map(function(e){return function(n){return n.v&&!n.cached_variants&&(n.cached_variants=n.v.map(function(e){return g(n,{v:null},e)})),n.cached_variants||n.eW&&[g(n)]||[n]}("self"===e?t:e)})),t.c.forEach(function(e){n(e,t);}),t.starts&&n(t.starts,e);var i=t.c.map(function(e){return e.bK?"\\.?(?:"+e.b+")\\.?":e.b}).concat([t.tE,t.i]).map(s).filter(Boolean);t.t=i.length?c(function(e,n){for(var t=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./,r=0,a="",i=0;i<e.length;i++){var o=r,c=s(e[i]);for(0<i&&(a+=n);0<c.length;){var u=t.exec(c);if(null==u){a+=c;break}a+=c.substring(0,u.index),c=c.substring(u.index+u[0].length),"\\"==u[0][0]&&u[1]?a+="\\"+String(Number(u[1])+o):(a+=u[0],"("==u[0]&&r++);}}return a}(i,"|"),!0):{exec:function(){return null}};}}(o);}function C(e,n,i,t){function c(e,n,t,r){var a='<span class="'+(r?"":h.classPrefix);return e?(a+=e+'">')+n+(t?"":b):n}function o(){E+=null!=l.sL?function(){var e="string"==typeof l.sL;if(e&&!N[l.sL])return _(g);var n=e?C(l.sL,g,!0,f[l.sL]):O(g,l.sL.length?l.sL:void 0);return 0<l.r&&(R+=n.r),e&&(f[l.sL]=n.top),c(n.language,n.value,!1,!0)}():function(){var e,n,t,r,a,i,o;if(!l.k)return _(g);for(r="",n=0,l.lR.lastIndex=0,t=l.lR.exec(g);t;)r+=_(g.substring(n,t.index)),a=l,i=t,o=s.cI?i[0].toLowerCase():i[0],(e=a.k.hasOwnProperty(o)&&a.k[o])?(R+=e[1],r+=c(e[0],_(t[0]))):r+=_(t[0]),n=l.lR.lastIndex,t=l.lR.exec(g);return r+_(g.substr(n))}(),g="";}function u(e){E+=e.cN?c(e.cN,"",!0):"",l=Object.create(e,{parent:{value:l}});}function r(e,n){if(g+=e,null==n)return o(),0;var t=function(e,n){var t,r,a;for(t=0,r=n.c.length;t<r;t++)if(v(n.c[t].bR,e))return n.c[t].endSameAsBegin&&(n.c[t].eR=(a=n.c[t].bR.exec(e)[0],new RegExp(a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"),"m"))),n.c[t]}(n,l);if(t)return t.skip?g+=n:(t.eB&&(g+=n),o(),t.rB||t.eB||(g=n)),u(t),t.rB?0:n.length;var r=function e(n,t){if(v(n.eR,t)){for(;n.endsParent&&n.parent;)n=n.parent;return n}if(n.eW)return e(n.parent,t)}(l,n);if(r){var a=l;for(a.skip?g+=n:(a.rE||a.eE||(g+=n),o(),a.eE&&(g=n));l.cN&&(E+=b),l.skip||l.sL||(R+=l.r),(l=l.parent)!==r.parent;);return r.starts&&(r.endSameAsBegin&&(r.starts.eR=r.eR),u(r.starts)),a.rE?0:n.length}if(function(e,n){return !i&&v(n.iR,e)}(n,l))throw new Error('Illegal lexeme "'+n+'" for mode "'+(l.cN||"<unnamed>")+'"');return g+=n,n.length||1}var s=B(e);if(!s)throw new Error('Unknown language: "'+e+'"');m(s);var a,l=t||s,f={},E="";for(a=l;a!==s;a=a.parent)a.cN&&(E=c(a.cN,"",!0)+E);var g="",R=0;try{for(var d,p,M=0;l.t.lastIndex=M,d=l.t.exec(n);)p=r(n.substring(M,d.index),d[0]),M=d.index+p;for(r(n.substr(M)),a=l;a.parent;a=a.parent)a.cN&&(E+=b);return {r:R,value:E,language:e,top:l}}catch(e){if(e.message&&-1!==e.message.indexOf("Illegal"))return {r:0,value:_(n)};throw e}}function O(t,e){e=e||h.languages||u(N);var r={r:0,value:_(t)},a=r;return e.filter(B).filter(M).forEach(function(e){var n=C(e,t,!1);n.language=e,n.r>a.r&&(a=n),n.r>r.r&&(a=r,r=n);}),a.language&&(r.second_best=a),r}function d(e){return h.tabReplace||h.useBR?e.replace(t,function(e,n){return h.useBR&&"\n"===e?"<br>":h.tabReplace?n.replace(/\t/g,h.tabReplace):""}):e}function o(e){var n,t,r,a,i,o=function(e){var n,t,r,a,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",t=s.exec(i))return B(t[1])?t[1]:"no-highlight";for(n=0,r=(i=i.split(/\s+/)).length;n<r;n++)if(l(a=i[n])||B(a))return a}(e);l(o)||(h.useBR?(n=document.createElementNS("http://www.w3.org/1999/xhtml","div")).innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n"):n=e,i=n.textContent,r=o?C(o,i,!0):O(i),(t=R(n)).length&&((a=document.createElementNS("http://www.w3.org/1999/xhtml","div")).innerHTML=r.value,r.value=function(e,n,t){var r=0,a="",i=[];function o(){return e.length&&n.length?e[0].offset!==n[0].offset?e[0].offset<n[0].offset?e:n:"start"===n[0].event?e:n:e.length?e:n}function c(e){a+="<"+E(e)+f.map.call(e.attributes,function(e){return " "+e.nodeName+'="'+_(e.value).replace('"',"&quot;")+'"'}).join("")+">";}function u(e){a+="</"+E(e)+">";}function s(e){("start"===e.event?c:u)(e.node);}for(;e.length||n.length;){var l=o();if(a+=_(t.substring(r,l[0].offset)),r=l[0].offset,l===e){for(i.reverse().forEach(u);s(l.splice(0,1)[0]),(l=o())===e&&l.length&&l[0].offset===r;);i.reverse().forEach(c);}else"start"===l[0].event?i.push(l[0].node):i.pop(),s(l.splice(0,1)[0]);}return a+_(t.substr(r))}(t,R(a),i)),r.value=d(r.value),e.innerHTML=r.value,e.className=function(e,n,t){var r=n?c[n]:t,a=[e.trim()];return e.match(/\bhljs\b/)||a.push("hljs"),-1===e.indexOf(r)&&a.push(r),a.join(" ").trim()}(e.className,o,r.language),e.result={language:r.language,re:r.r},r.second_best&&(e.second_best={language:r.second_best.language,re:r.second_best.r}));}function p(){if(!p.called){p.called=!0;var e=document.querySelectorAll("pre code");f.forEach.call(e,o);}}function B(e){return e=(e||"").toLowerCase(),N[e]||N[c[e]]}function M(e){var n=B(e);return n&&!n.disableAutodetect}return a.highlight=C,a.highlightAuto=O,a.fixMarkup=d,a.highlightBlock=o,a.configure=function(e){h=g(h,e);},a.initHighlighting=p,a.initHighlightingOnLoad=function(){addEventListener("DOMContentLoaded",p,!1),addEventListener("load",p,!1);},a.registerLanguage=function(n,e){var t=N[n]=e(a);i(t),t.aliases&&t.aliases.forEach(function(e){c[e]=n;});},a.listLanguages=function(){return u(N)},a.getLanguage=B,a.autoDetection=M,a.inherit=g,a.IR=a.IDENT_RE="[a-zA-Z]\\w*",a.UIR=a.UNDERSCORE_IDENT_RE="[a-zA-Z_]\\w*",a.NR=a.NUMBER_RE="\\b\\d+(\\.\\d+)?",a.CNR=a.C_NUMBER_RE="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",a.BNR=a.BINARY_NUMBER_RE="\\b(0b[01]+)",a.RSR=a.RE_STARTERS_RE="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",a.BE=a.BACKSLASH_ESCAPE={b:"\\\\[\\s\\S]",r:0},a.ASM=a.APOS_STRING_MODE={cN:"string",b:"'",e:"'",i:"\\n",c:[a.BE]},a.QSM=a.QUOTE_STRING_MODE={cN:"string",b:'"',e:'"',i:"\\n",c:[a.BE]},a.PWM=a.PHRASAL_WORDS_MODE={b:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},a.C=a.COMMENT=function(e,n,t){var r=a.inherit({cN:"comment",b:e,e:n,c:[]},t||{});return r.c.push(a.PWM),r.c.push({cN:"doctag",b:"(?:TODO|FIXME|NOTE|BUG|XXX):",r:0}),r},a.CLCM=a.C_LINE_COMMENT_MODE=a.C("//","$"),a.CBCM=a.C_BLOCK_COMMENT_MODE=a.C("/\\*","\\*/"),a.HCM=a.HASH_COMMENT_MODE=a.C("#","$"),a.NM=a.NUMBER_MODE={cN:"number",b:a.NR,r:0},a.CNM=a.C_NUMBER_MODE={cN:"number",b:a.CNR,r:0},a.BNM=a.BINARY_NUMBER_MODE={cN:"number",b:a.BNR,r:0},a.CSSNM=a.CSS_NUMBER_MODE={cN:"number",b:a.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},a.RM=a.REGEXP_MODE={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[a.BE,{b:/\[/,e:/\]/,r:0,c:[a.BE]}]},a.TM=a.TITLE_MODE={cN:"title",b:a.IR,r:0},a.UTM=a.UNDERSCORE_TITLE_MODE={cN:"title",b:a.UIR,r:0},a.METHOD_GUARD={b:"\\.\\s*"+a.UIR,r:0},a});hljs.registerLanguage("javascript",function(e){var r="[A-Za-z$_][0-9A-Za-z$_]*",a={keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},t={cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},n={cN:"subst",b:"\\$\\{",e:"\\}",k:a,c:[]},c={cN:"string",b:"`",e:"`",c:[e.BE,n]};n.c=[e.ASM,e.QSM,c,t,e.RM];var s=n.c.concat([e.CBCM,e.CLCM]);return {aliases:["js","jsx"],k:a,c:[{cN:"meta",r:10,b:/^\s*['"]use (strict|asm)['"]/},{cN:"meta",b:/^#!/,e:/$/},e.ASM,e.QSM,c,e.CLCM,e.CBCM,t,{b:/[{,]\s*/,r:0,c:[{b:r+"\\s*:",rB:!0,r:0,c:[{cN:"attr",b:r,r:0}]}]},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{cN:"function",b:"(\\(.*?\\)|"+r+")\\s*=>",rB:!0,e:"\\s*=>",c:[{cN:"params",v:[{b:r},{b:/\(\s*\)/},{b:/\(/,e:/\)/,eB:!0,eE:!0,k:a,c:s}]}]},{cN:"",b:/\s/,e:/\s*/,skip:!0},{b:/</,e:/(\/[A-Za-z0-9\\._:-]+|[A-Za-z0-9\\._:-]+\/)>/,sL:"xml",c:[{b:/<[A-Za-z0-9\\._:-]+\s*\/>/,skip:!0},{b:/<[A-Za-z0-9\\._:-]+/,e:/(\/[A-Za-z0-9\\._:-]+|[A-Za-z0-9\\._:-]+\/)>/,skip:!0,c:[{b:/<[A-Za-z0-9\\._:-]+\s*\/>/,skip:!0},"self"]}]}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:r}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:s}],i:/\[|%/},{b:/\$[(.]/},e.METHOD_GUARD,{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]},{bK:"constructor get set",e:/\{/,eE:!0}],i:/#(?!!)/}});hljs.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},s={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]};return {aliases:["sh","zsh"],l:/\b-?[a-z\._]+\b/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",_:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"meta",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,s,{cN:"string",b:/'/,e:/'/},t]}});hljs.registerLanguage("xml",function(s){var e={eW:!0,i:/</,r:0,c:[{cN:"attr",b:"[A-Za-z0-9\\._:-]+",r:0},{b:/=\s*/,r:0,c:[{cN:"string",endsParent:!0,v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s"'=<>`]+/}]}]}]};return {aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist"],cI:!0,c:[{cN:"meta",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},s.C("\x3c!--","--\x3e",{r:10}),{b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"meta",b:/<\?xml/,e:/\?>/,r:10},{b:/<\?(php)?/,e:/\?>/,sL:"php",c:[{b:"/\\*",e:"\\*/",skip:!0},{b:'b"',e:'"',skip:!0},{b:"b'",e:"'",skip:!0},s.inherit(s.ASM,{i:null,cN:null,c:null,skip:!0}),s.inherit(s.QSM,{i:null,cN:null,c:null,skip:!0})]},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{name:"style"},c:[e],starts:{e:"</style>",rE:!0,sL:["css","xml"]}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{name:"script"},c:[e],starts:{e:"<\/script>",rE:!0,sL:["actionscript","javascript","handlebars","xml"]}},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"name",b:/[^\/><\s]+/,r:0},e]}]}});hljs.registerLanguage("css",function(e){var c={b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{eW:!0,eE:!0,c:[{b:/[\w-]+\(/,rB:!0,c:[{cN:"built_in",b:/[\w-]+/},{b:/\(/,e:/\)/,c:[e.ASM,e.QSM]}]},e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"number",b:"#[0-9A-Fa-f]+"},{cN:"meta",b:"!important"}]}}]};return {cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,{cN:"selector-id",b:/#[A-Za-z0-9_-]+/},{cN:"selector-class",b:/\.[A-Za-z0-9_-]+/},{cN:"selector-attr",b:/\[/,e:/\]/,i:"$"},{cN:"selector-pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/},{b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{b:"@",e:"[{;]",i:/:/,c:[{cN:"keyword",b:/\w+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[e.ASM,e.QSM,e.CSSNM]}]},{cN:"selector-tag",b:"[a-zA-Z-][a-zA-Z0-9_-]*",r:0},{b:"{",e:"}",i:/\S/,c:[e.CBCM,c]}]}});
  });

  const isNode = typeof process !== 'undefined' && Object.prototype.toString.call(global.process) === '[object process]';

  debugger;

  highlight_pack.configure({ useBR: true });

  const entities = /(&lt;|&gt;|\n)/g;
  const LESS_THAN = '&lt;';
  const GREATER_THAN = '&gt;';
  const NEW_LINE = '\n';
  const entityMap = {
    [LESS_THAN]: '<',
    [GREATER_THAN]: '>',
    [NEW_LINE]: '<br />'
  };

  function clean(value) {
    let strings = [], values = [];
    let res;

    let start = 0;

    while(res = (entities.exec(value))) {
      let [ match ] = res;
      let { index } = res;
      let entityValue = entityMap[match];
      let matchLength = match.length;

      let indexLength = index - start;
      let string = value.substr(start, indexLength);
      
      if(match === NEW_LINE) {
        string = string + entityValue;
        entityValue = '';
      }

      strings.push(string);
      values.push(entityValue);

      start = index + matchLength;
    }

    // Push the final string.
    strings.push(value.substr(start));

    return [strings, values];
  }

  function highlight(code, lang) {
    const result = highlight_pack.highlightAuto(code.trim(), [lang]);
    let { value } = result;

    if(code.includes('HelloMessage')) {
      debugger;
    }
    

    let [strings, values] = clean(value);

    return html(strings, ...values);
  }

  var styles$3 = "/*!\n * Agate by Taufik Nurrohman <https://github.com/tovic>\n * ----------------------------------------------------\n *\n * #ade5fc\n * #a2fca2\n * #c6b4f0\n * #d36363\n * #fcc28c\n * #fc9b9b\n * #ffa\n * #fff\n * #333\n * #62c8f3\n * #888\n *\n */\n\n.hljs {\n  display: block;\n  overflow-x: auto;\n  padding: 0.5em;\n  background: #333;\n  color: white;\n}\n\n.hljs-name,\n.hljs-strong {\n  font-weight: bold;\n}\n\n.hljs-code,\n.hljs-emphasis {\n  font-style: italic;\n}\n\n.hljs-tag {\n  color: #62c8f3;\n}\n\n.hljs-variable,\n.hljs-template-variable,\n.hljs-selector-id,\n.hljs-selector-class {\n  color: #ade5fc;\n}\n\n.hljs-string,\n.hljs-bullet {\n  color: #a2fca2;\n}\n\n.hljs-type,\n.hljs-title,\n.hljs-section,\n.hljs-attribute,\n.hljs-quote,\n.hljs-built_in,\n.hljs-builtin-name {\n  color: #ffa;\n}\n\n.hljs-number,\n.hljs-symbol,\n.hljs-bullet {\n  color: #d36363;\n}\n\n.hljs-keyword,\n.hljs-selector-tag,\n.hljs-literal {\n  color: #fcc28c;\n}\n\n.hljs-comment,\n.hljs-deletion,\n.hljs-code {\n  color: #888;\n}\n\n.hljs-regexp,\n.hljs-link {\n  color: #c6b4f0;\n}\n\n.hljs-meta {\n  color: #fc9b9b;\n}\n\n.hljs-deletion {\n  background-color: #fc9b9b;\n  color: #333;\n}\n\n.hljs-addition {\n  background-color: #a2fca2;\n  color: #333;\n}\n\n.hljs a {\n  color: inherit;\n}\n\n.hljs a:focus,\n.hljs a:hover {\n  color: inherit;\n  text-decoration: underline;\n}\n";

  class CodeSnippet extends Component {
    static get props() {
      return {
        code: {},
        name: {},
        lang: {}
      };
    }

    render({ code, lang = 'js' }) {
      let classes = `hljs ${lang}`;

      return html`
      <div>
        <style>${styles$3}</style>
        <pre>
          <code class=${classes}>${highlight(code.trim(), lang)}</code>
        </pre>
      </div>
    `;
    }
  }

  fritz.define('code-snippet', CodeSnippet);

  class CodeFile extends Component {
    static get props() {
      return {
        code: { attribute: true },
        name: { attribute: true },
        lang: { attribute: true }
      };
    }

    render({code, lang, name}) {
      return html`
      <div>
        <style>${styles$2}</style>
        <div class="title">${name}</div>
        <code-snippet lang=${lang} code=${code}></code-snippet>
      </div>
    `;
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

<script type="module">
  import fritz from 'https://unpkg.com/fritz@next/window.js';

  fritz.use(new Worker('./worker.js'));
</script>
`;

  function main() {
    return html`
    <main>  
      <style>${styles$1}</style>

      <section class="intro shadow-section">
        <header class="title">
          <h1 class="primary-title">Fritz</h1>
          <picture>
            <source srcset="./frankenstein-fritz-flame.webp" type="image/webp"/>
            <source srcset="./frankenstein-fritz-flame.png" type="image/jpeg"/>
            <img src="./frankenstein-fritz-flame.png" class="fritz-flame" title="Fritz, with a flame"/>
          </picture>
          <h2>Take your UI off the main thread.</h2>
        </header>

        <a class="github" href="https://github.com/matthewp/fritz">GitHub</a>

        <code-file name="worker.js" lang="js" code=${jsCode}></code-file>
        <code-file name="index.html" lang="html" code=${htmlCode}></code-file>
      </section>

      ${about()}

      <footer>
        <p>Made with 🎃 by <a href="https://twitter.com/matthewcp">@matthewcp</a></p>
      </footer>
    </main>
  `;
  }

  fritz.define('its-fritz-yall', main);

}());
