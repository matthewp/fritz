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

class MathEl extends Component {
  render() {
    return h('div', null, 15, ' of ', 15);
  }
}

fritz.define('math-el', MathEl);

class BasicApp extends Component {
  render() {
    return h('div', {id:'root'}, [
      'Hello world!',
      h(AnotherEl),
      h(MathEl)
    ]);
  }
}

fritz.define('basic-app', BasicApp);
