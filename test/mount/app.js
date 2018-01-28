importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class Third extends Component {
  componentDidMount() {
    postMessage({ type: 'app-rendered', detail: 'third' });
  }

  render() {
    return h('div');
  }
}

fritz.define('third-el', Third);

function Second() {
  var self = Reflect.construct(Component, [], Second);
  return self;
}

Second.prototype = Object.create(Component.prototype);
Second.prototype.componentDidMount = function(){
  postMessage({ type: 'app-rendered', detail: 'second' });
};
Second.prototype.render = function(){
  return h('third-el');
};

fritz.define('second-el', Second);

class NoMount extends Component {
  constructor() {
    super();
    this.componentDidMount = () => {
      this.dispatch({ type: 'error' });
    };
  }

  render() {
    return h('div');
  }
}

fritz.define('no-mount', NoMount);

class First extends Component {
  componentDidMount() {
    postMessage({ type: 'app-rendered', detail: 'first' });
  }

  onNoMountError(ev) {
    this.dispatch(Object.assign({}, ev));
  }

  render() {
    return h('div', [
      h('second-el'),
      h('no-mount', { onError: this.onNoMountError })
    ])
  }
}

fritz.define('first-el', First);
