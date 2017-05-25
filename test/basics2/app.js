importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { h, Component } = fritz;

class App extends Component {
  render() {
    return h('div', {id:'root'}, [
      'Hello world!',
      h(AnotherEl)
    ]);
  }
}

function app() {
  return h('div', ['Hello World']);
}

fritz.mount(h(main), 'main');