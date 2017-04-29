importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class CounterForm extends Component {
  static get observedEvents() {
    return ['submit'];
  }

  onSubmit() {
    this.dispatch({type:'change'});
  }

  render() {
    return h('form', {action: '/count', method: 'POST'}, [
      h('button', ['Increment'])
    ]);
  }
}

fritz.define('counter-form', CounterForm);

class ClickCounter {
  static get observedEvents() {
    return ['change'];
  }

  constructor() {
    this.count = 0;
  }

  onChange() {
    this.count++;
  }

  render() {
    return h('div', [
      h('h2', [`Count: ${this.count}`]),
      h('counter-form')
    ]);
  }
}

fritz.define('click-counter', ClickCounter);
