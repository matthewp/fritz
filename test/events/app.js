importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class EventEl extends Component {
  myHandler() {
    this.clicked = true;
  }

  render() {
    if(this.clicked) {
      return h('div', {'class': 'clicked'}, ['link clicked']);
    }

    return h('a', {
      href: '/foo',
      onClick: this.myHandler
    }, ['Click me']);
  }
}

fritz.define('event-element', EventEl);

class InputEl extends Component {
  constructor() {
    super();
    this.filter = '';
  }

  setFilter(ev) {
    this.filter = ev.value;
  }

  render() {
    return h('div', [
      h('div', {'class': 'result'}, [this.filter]),
      h('input', {type: 'text', value: this.filter, onKeyup:this.setFilter})
    ]);
  }
}

fritz.define('input-el', InputEl);
