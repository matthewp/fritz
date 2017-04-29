importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class AnotherEl extends Component {
  render() {
    return h('div', ['Another el']);
  }
}

fritz.define('another-el', AnotherEl);

class BasicApp extends Component {
  render() {
    return h('div', {id:'root'}, [
      'Hello world!',
      h(AnotherEl)
    ]);
  }
}

fritz.define('basic-app', BasicApp);