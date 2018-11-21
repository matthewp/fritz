importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { h, Component } = fritz;

fritz.define('my-counter', class extends Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  render() {
    const { count } = this.state;

    let part;
    if(count === 0) {
      part = h('div', null, ['testing']);
    } else {
      part = 'replacement';
    }

    return h('div', [
      h('h1', [`Count: ${count}`]),
      part,
      h('button', {
        onClick: () => this.setState({ count: count + 1 })
      }, ['Increment'])
    ]);
  }
});