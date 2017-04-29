importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class Hello extends Component {
  static get props() {
    return {
      name: {
        attribute: true
      }
    };
  }

  render() {
    return h('span', [`Hello ${this.name}`]);
  }
}

fritz.define('x-hello', Hello);