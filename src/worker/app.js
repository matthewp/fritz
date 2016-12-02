import Messenger from './messenger.js';
import Response from './response.js';

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

export default App;
