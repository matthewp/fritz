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

  render({name}) {
    return h('span', [`Hello ${name}`]);
  }
}

fritz.define('x-hello', Hello);
