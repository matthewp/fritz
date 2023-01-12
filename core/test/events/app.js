import fritz, { h, Component } from '../../worker.mjs';

class EventEl extends Component {
  constructor() {
    super();
    this.state = { foo: 'none' };
  }

  componentDidMount() {
    setTimeout(() => {
      this.dispatch({ type: 'mount' });
    }, 10);
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
      return h('div', {'class': 'clicked'}, ['link clicked']);
    }

    return h('div', [
      h('a', {
        href: '#foo',
        onClick: this.myHandler
      }, ['Click me']),

      h('div', {id: 'foo'}, [foo]),
      h('div', {id: 'thing'}, [thing]),
      h('special-el', {onSpecial: this.handleSpecial}, []),
      h('child-el', {onThing: this.handleThing}, [])
    ]);
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
    return h('div', ['Child el']);
  }
}

fritz.define('child-el', ChildEl);

class InputEl extends Component {
  constructor() {
    super();
    this.filter = '';
  }

  componentDidMount() {
    this.dispatch({ type: 'mount' });
  }

  setFilter(ev) {
    this.filter = ev.value;
  }

  render() {
    return h('div', [
      h('div', {'class': 'result'}, [this.filter]),
      h('input', {type: 'text', value: this.filter, onKeyup:this.setFilter})
    ]);
  }
}

fritz.define('input-el', InputEl);
