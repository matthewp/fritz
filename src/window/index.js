import {
  elementOpen,
  elementClose,
  text,
  patch
} from 'incremental-dom/index.js';

import makeRequest from './make-request.js';

class Framework {
  constructor() {
    this._router = null;
    this._started = false;
  }

  eventHandler(data) {
    let self = this;

    return function(ev){
      ev.preventDefault();

      let ct = ev.currentTarget;
      let request = makeRequest(data[2], data[3], ct);
      let push = !ct.dataset.noPush && request.method === 'GET';

      if(push) {
        history.pushState(request, null, request.url);
      }

      self.request(request);
    };
  }

  get router() {
    return this._router;
  }

  set router(val) {
    this._router = val;
    if(!this.started) {
      this.start();
    }
  }

  start() {
    let url = "" + location;
    this._router.postMessage({
      type: 'initial',
      state: this.state,
      url
    });
    history.replaceState({ url, method: 'GET' }, document.title, url);

    this._router.addEventListener('message',
      ev => this.handle(ev));

    window.addEventListener('popstate',
      ev => this.popstate(ev));
  }

  request(request) {
    request.type = 'request';
    this._router.postMessage(request);
  }

  handle(msg) {
    var ev = msg.data;
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
                n[2].push(n[3][j][1], self.eventHandler(n[3][j]));
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

    patch(document.documentElement, render);
  }

  popstate(ev) {
    if(ev.state) {
      this.request(ev.state);
    }
  }
}

export default new Framework();
