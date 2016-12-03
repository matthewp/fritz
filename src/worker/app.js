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

export default App;
