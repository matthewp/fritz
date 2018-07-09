importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { html, Component } = fritz;

fritz.define('loading-indicator', () => (
  html`
    <svg class="icon-loading" xmls="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>
  `
));

class AnotherEl extends Component {
  doStuff(){}

  render() {
    return html`
      <div on-click="${this.doStuff}">Another el</div>
    `;
  }
}

fritz.define('another-el', AnotherEl);

class MathEl extends Component {
  render() {
    return html`
      <div>${15} of ${15}</div>
    `;
  }
}

fritz.define('math-el', MathEl);

class TypedEl extends Component {
  render() {
    return html`
      <div>
        <div class="c-number">${27}</div>
        <div class="c-boolean">${false}</div>
      </div>
    `;
  }
}

fritz.define('typed-el', TypedEl);

fritz.define('frag-el', class extends Component {
  render() {
    return html`
      <div id="one">One</div>
      <div id="two">Two</div>
      <div>
        <span id="three">Three</span>
      </div>
    `;
  }
})

class BasicApp extends Component {
  render() {
    return html`
      <div id="root">
        Hello world!
        <another-el></another-el>
        <math-el></math-el>
        <typed-el></typed-el>
        <loading-indicator></loading-indicator>
        <frag-el></frag-el>
      </div>
    `;
  }
}

fritz.define('basic-app', BasicApp);
