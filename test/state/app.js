importScripts('../../worker.umd.js');

const { html, Component } = fritz;

class Stateful extends Component {
  constructor() {
    super();
    this.name = fritz.state.name;
  }

  render() {
    return html`<span>Hello ${this.name}</span>`;
  }
}

fritz.define('stateful-el', Stateful);
