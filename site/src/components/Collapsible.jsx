import fritz, {Component} from 'fritz';

export default class Collapsible extends Component {
  render() {
    // TODO collapsible button
    return (
      <slot></slot>
    );
  }
}

fritz.define('x-collapse', Collapsible);