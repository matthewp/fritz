importScripts('../../worker.umd.js');

const { html, Component } = fritz;

class EventEl extends Component {
  constructor() {
    super();
    this.state = { foo: 'none' };
  }

  myHandler() {
    this.setState({clicked: true});
  }

  handleSpecial(ev) {
    this.setState({foo: ev.detail.foo});
  }

  handleThing(ev) {
    this.setState({thing: ev.detail});
  }

  render({}, {clicked, foo, thing}) {
    if(clicked) {
      return html`
        <div class="clicked">link clicked</div>
      `;
    }

    return html`
      <div>
        <a href="/foo" onClick="${this.myHandler}">Click me</a>
        <div id="foo">${foo}</div>
        <div id="thing">${thing}</div>
        <special-el onSpecial="${this.handleSpecial}"></special-el>
        <child-el onThing="${this.handleThing}"></child-el>
      </div>
    `;
  }
}

fritz.define('event-element', EventEl);

class ChildEl extends Component {
  constructor() {
    super();
    this.hasDispatched = false;
  }

  componentWillUpdate() {
    if(!this.hasDispatched) {
      // EWWWWW, how would you really do something like this?
      setTimeout(_ => {
        this.hasDispatched = true;
        this.dispatch({ type: 'thing', detail: 'hello' });
      });
    }
  }

  render() {
    return html`<div>Child el</div>`;
  }
}

fritz.define('child-el', ChildEl);

class InputEl extends Component {
  constructor() {
    super();
    this.filter = '';
  }

  setFilter(ev) {
    this.filter = ev.value;
  }

  render() {
    return html`
      <div>
        <div class="result">${this.filter}</div>
        <input type="text" value="${this.filter}" onKeyup=${this.setFilter}">
      </div>
    `;
  }
}

fritz.define('input-el', InputEl);
