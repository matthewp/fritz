import Messenger from './messenger.js';
import Route from './route.js';
import Response from './response.js';

class App {
  constructor() {
    this.messenger = new Messenger(this);
    this.componentMap = new Map();
    this.idMap = new Map();
    this.instMap = new WeakMap();
  }

  define(tag, constr) {
    this.componentMap.set(tag, constr);
    this.messenger.define(tag);
  }

  handleEvent(msg) {
    let id = msg.id;
    let inst = this.idMap.get(id);
    let response = Object.create(null);
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
    let response = Object.create(null);
    if(!inst) {
      let constr = this.componentMap.get(tag);
      inst = new constr();
      inst._app = this;
      this.idMap.set(id, inst);
      this.instMap.set(inst, id);
      response.events = constr.observedEvents;
    }
    response.tree = inst.render();
    this.messenger.send(id, response);
  }

  update(inst) {
    let id = this.instMap.get(inst);
    let response = Object.create(null);
    response.tree = inst.render();
    this.messenger.send(id, response);
  }

  dispatch(inst, ev) {
    let id = this.instMap.get(inst);
    this.messenger.dispatch(id, ev);
  }
}

export default App;
