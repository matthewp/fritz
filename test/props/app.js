importScripts('../../worker.umd.js');

const { Component, h } = fritz;

class Hello extends Component {
  static get props() {
    return {
      name: {
        attribute: true
      }
    };
  }

  componentDidMount() {
    this.dispatch({ type: 'mount' });
  }

  render({name}) {
    return (
      h('span', null, `Hello ${name}`)
    );
  }
}

fritz.define('x-hello', Hello);
