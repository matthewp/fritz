importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { html, Component } = fritz;

class App extends Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  decrement() {
    let {count} = this.state;
    this.setState({count: count - 1});
  }

  render({}, {count}) {
    var size = this._fritzHandles.size;
    return html`
      <div>
        <button id="increment" on-click="${() => this.setState({count: count + 1})}">Increment></button>
        <button id="decrement" on-click="${this.decrement}">Increment></button>
        <div>Count: ${count}</div>
        <div>
          Handles: <span id="handleSize">${size}</span>
        </div>
      </div>
    `;
  }
}

fritz.define('gc-app', App);
