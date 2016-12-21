importScripts('../../worker.umd.js');

const { h } = fritz;

class ClickCounter {
  static get observedEvents() {
    return ['submit'];
  }

  constructor() {
    this.count = 0;
  }

  onSubmit() {
    this.count++;
  }

  render() {
    return h('div', [
      h('h2', [`Count: ${this.count}`]),
      h('form', {action: '/count', method: 'POST'}, [
        h('button', ['Increment'])
      ])
    ]);
  }
}

fritz.define('click-counter', ClickCounter);
