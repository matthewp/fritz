importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { h, Component } = fritz;

class AnotherEl extends Component {
  doStuff(){}

  render() {
    return h('div', { onClick: this.doStuff }, ['Another el']);
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