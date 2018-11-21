importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { h, Component } = fritz;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

    let h1Attrs = null;
    if(Math.random() >= 0.5) {
      h1Attrs = { style: `color: ${getRandomColor()}` };
    }

    return h('div', [
      h('h1', h1Attrs, [`Count: ${count}`]),
      part,
      h('button', {
        onClick: () => this.setState({ count: count + 1 })
      }, ['Increment'])
    ]);
  }
});