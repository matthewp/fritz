importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class Stateful extends Component {
  constructor() {
    super();
    this.name = fritz.state.name;
  }

  render() {
    return h('span', [`Hello ${this.name}`]);
  }
}

fritz.define('stateful-el', Stateful);