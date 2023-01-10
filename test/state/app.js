import fritz, { h, Component } from '../../worker.mjs';

class Stateful extends Component {
  constructor() {
    super();
    this.name = fritz.state.name;
  }

  componentDidMount() {
    this.dispatch({ type: 'mount' });
  }

  render() {
    return h('span', [`Hello ${this.name}`]);
  }
}

fritz.define('stateful-el', Stateful);