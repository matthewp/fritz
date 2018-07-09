importScripts('../../worker.umd.js');

const { html, Component } = fritz;

class Third extends Component {
  componentDidMount() {
    postMessage({ type: 'app-rendered', detail: 'third' });
  }

  render() {
    return html`<div></div>`;
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
  return html`<third-el></third-el>`;
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
    return html`<div></div>`;
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
    return html`
      <div>
        <second-el></second-el>
        <no-mount on-error="${this.onNoMountError}"></no-mount>
      </div>
    `;
  }
}

fritz.define('first-el', First);
