importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class EventEl extends Component {
  constructor() {
    super();
    this.foo = 'none';
  }

  myHandler() {
    this.clicked = true;
  }

  handleSpecial(ev) {
    this.foo = ev.detail.foo;
  }

  render() {
    if(this.clicked) {
      return h('div', {'class': 'clicked'}, ['link clicked']);
    }

    return h('div', [
      h('a', {
        href: '/foo',
        onClick: this.myHandler
      }, ['Click me']),

      h('div', {id: 'foo'}, [this.foo]),
      h('special-el', {onSpecial: this.handleSpecial}, [])
    ]);
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
