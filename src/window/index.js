import {
  elementOpen,
  elementClose,
  text,
  patch
} from 'incremental-dom/index.js';

class Framework {
  constructor() {
    this._router = null;
    this._started = false;
  }

  eventHandler(data) {
    var self = this;
    return function(ev){
      ev.preventDefault();

      var attrName = data[2];
      var url = ev.target.getAttribute(attrName);
      self.request({ url, method: 'POST' });
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
    var initialState = document.documentElement.outerHTML;
    this._router.postMessage({
      type: 'initial',
      state: initialState,
      url: location.pathname
    });

    this._router.addEventListener('message',
      ev => this.handle(ev));
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

            var openArgs = [n[1], '', null].concat(n[2]);
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
}

export default new Framework();
