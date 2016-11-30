(function(){

  class Framework {
    constructor() {
      this._router = null;
      this._started = false;
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

      this._router.onmessage = function(ev){
        this.handle(ev);
      }.bind(this);
    }

    handle(msg) {
      var bc = [[1,'html'],
        [1,'body'],
        [1,'h1'],
        [4,'Hello world'],
        [2,'h1'],
        [2,'body'],
        [2,'html']];

      var render = function(){
        bc.forEach(function(i){
          switch(i[0]) {
            // Open
            case 1:
              IncrementalDOM.elementOpen(i[1]);
              break;
            case 2:
              IncrementalDOM.elementClose(i[1]);
              break;
            case 4:
              IncrementalDOM.text(i[1]);
              break;
          }
        });
      };

      IncrementalDOM.patch(document.documentElement, render);

    }
  }

  self.framework = new Framework();

})();
