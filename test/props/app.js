importScripts('../../worker.umd.js');

const { Component, html } = fritz;

class Hello extends Component {
  static get props() {
    return {
      name: {
        attribute: true
      }
    };
  }

  render({name}) {
    return html`
      <span>Hello ${name}</span>
    `;
  }
}

fritz.define('x-hello', Hello);
