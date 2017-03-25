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
