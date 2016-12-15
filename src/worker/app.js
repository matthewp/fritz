import Messenger from './messenger.js';
import Route from './route.js';
import Response from './response.js';
import isPromise from './is-promise.js';

class App {
  static get app() {
    return this._val;
  }

  static set app(val) {
    this._app = val;
  }

  static hasMatchingRoute(method, path) {
    return this._app.hasMatchingRoute(method, path);
  }

  constructor() {
    this.messenger = new Messenger(this);
    this.baseURI = '/';
    this.routes = [];
    this.callbacks = [];
    this.state = {};
    App.app = this;
  }

  dispatch(request) {
    let url = request.url = new URL(request.url, this.currentURL);
    this.currentURL = url;
    request.params = {};
    let response = new Response(request, this);
    let i = 0;
    let self = this;

    function next() {
      let fn = self.callbacks[i++];
      if(!fn) return; // TODO this should do a unhandled
      fn(request, response, next);
    }

    next();
  }

  hasMatchingRoute(method, path) {
    for(var i = 0, len = this.routes.length; i < len; i++) {
      if(this.routes[i].isMatch(method, path)) return true;
    }
    return false;
  }

  _addRoute(method, path, fns) {
    // route <path> to <callback ...>
    if (fns.length) {
      var route = new Route(/** @type {string} */ (path), { method });
      for (var i = 0; i < fns.length; ++i) {
        this.callbacks.push(route.middleware(fns[i]));
      }
      this.routes.push(route);
      // show <path> with [state]
    }
  }

  configure(fn) {
    fn.call(this);
    return this;
  }

  use(path, ...fns) {
    this._addRoute(null, path || '*', fns);
    return this;
  }

  get(path, ...fns){
    this._addRoute('GET', path, fns);
  }

  post(path, ...fns) {
    this._addRoute('POST', path, fns);
  }
}

export default App;
