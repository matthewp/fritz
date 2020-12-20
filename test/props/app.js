import fritz, { Component, h } from '../../src/worker/index.js';

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
