import fritz, { h, Component } from '../../src/worker/index.js';

fritz.define('loading-indicator', () => (
  h('svg', {
    class: 'icon-loading', xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 32 32'
  })
));

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

class TypedEl extends Component {
  render() {
    return h('div', {}, [
      h('div', {'class':'c-number'}, 27),
      h('div', {'class':'c-boolean'}, false),
    ]);
  }
}

fritz.define('typed-el', TypedEl);

fritz.define('frag-el', class extends Component {
  render() {
    return (
      h(h.frag, null,
        h("div", {id:'one'}, "One"),
        h("div", {id:'two'}, "Two"),
        h("div", null,
          h(h.frag, null,
            h("span", {id:'three'}, "Three")
          )
        )
      )
    );
  }
})

class BasicApp extends Component {
  componentDidMount() {
    this.dispatch({ type: 'mount' });
  }

  render() {
    return h('div', {id:'root'}, [
      'Hello world!',
      h(AnotherEl),
      h(MathEl),
      h(TypedEl),
      h('loading-indicator'),
      h('frag-el')
    ]);
  }
}

fritz.define('basic-app', BasicApp);
