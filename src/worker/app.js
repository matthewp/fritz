import Messenger from './messenger.js';
import Route from './route.js';
import Response from './response.js';

class App {
  constructor() {
    this.messenger = new Messenger(this);
    this.componentMap = new Map();
    this.idMap = new Map();
  }

  define(tag, constr) {
    this.componentMap.set(tag, constr);
    this.messenger.define(tag);
  }

  handleEvent(msg) {
    let id = msg.id;
    let inst = this.idMap.get(id);
    let response = {};
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    let method = inst[methodName];
    if(method) {
      method.call(inst);
      response.tree = inst.render();
      this.messenger.send(id, response);
    } else {
      // TODO warn?
    }
  }

  render(msg) {
    let id = msg.id;
    let tag = msg.tag;
    let inst = this.idMap.get(id);
    let response = {};
    if(!inst) {
      let constr = this.componentMap.get(tag);
      inst = new constr();
      this.idMap.set(id, inst);
      response.events = constr.observedEvents;
    }
    response.tree = inst.render();
    this.messenger.send(id, response);
  }
}

export default App;
