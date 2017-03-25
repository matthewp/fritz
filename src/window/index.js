import {
  elementOpen,
  elementClose,
  text,
  patch
} from 'incremental-dom/index.js';

class Framework {
  constructor() {
    this._app = null;
    this._started = false;
    this._componentMap = new WeakMap();
    this._idMap = new Map();
    this._componentId = 1;
    //this._eventHandler2 = this._eventHandler2.bind(this);
  }

  eventHandler(data, id) {
    let self = this;

    return function(ev){
      ev.preventDefault();

      self._app.postMessage({
        type: 'event',
        name: ev.type,
        id: id,
        handle: data[2]
      });
    };
  }

  get app() {
    return this._app;
  }

  set app(val) {
    this._app = val;
    if(!this.started) {
      this.start();
    }
  }

  start() {
    this._app.addEventListener('message',
      ev => this.handle(ev));
  }

  request(request) {
    request.type = 'request';
    this._app.postMessage(request);
  }

  handle(msg) {
    var ev = msg.data;
    switch(ev.type) {
      case 'tag':
        this.handleDefine(ev);
        break;
      case 'render':
        this.patch(ev);
        break;
      case 'event':
        this.handleEvent(ev);
        break;
    }
  }

  patch(ev) {
    var id = ev.id;
    var bc = ev.tree;
    var self = this;

    var render = function(){
      var n;
      for(var i = 0, len = bc.length; i < len; i++) {
        n = bc[i];
        switch(n[0]) {
          // Open
          case 1:
            if(n[3]) {
              for(var j = 0, jlen = n[3].length; j < jlen; j++) {
                n[2].push(n[3][j][1], self.eventHandler(n[3][j], id));
              }
            }

            var openArgs = [n[1], null, null].concat(n[2]);
            elementOpen.apply(null, openArgs);
            break;
          case 2:
            elementClose(n[1]);
            break;
          case 4:
            text(n[1]);
            break;
        }
      }
    };

    let el = this._idMap.get(id);
    patch(el.shadowRoot, render);

    if(ev.events) {
      el.observe(ev.events);
    }
  }

  handleDefine(ev) {
    const tag = ev.tag;
    const fw = this;
    customElements.define(tag, class extends HTMLElement {
      constructor() {
        super();

        this.attachShadow({ mode: 'open' });
      }

      connectedCallback() {
        this._id = fw._componentId++;
        fw._componentMap.set(this, this._id);
        fw._idMap.set(this._id, this);

        this.render();
      }

      handleEvent(ev) {
        fw._app.postMessage({
          type: 'event',
          name: ev.type,
          id: this._id
        });
      }

      observe(events) {
        events.forEach(eventName => {
          this.shadowRoot.addEventListener(eventName, this);
        });
      }

      render() {
        fw._app.postMessage({
          type: 'render',
          id: this._id,
          tag
        });
      }
    });
  }

  handleEvent(msg) {
    let inst = this._idMap.get(msg.id);
    let event = new Event(msg.event.type, {
      bubbles: true
    });
    inst.dispatchEvent(event);
  }
}

export default new Framework();
