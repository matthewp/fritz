import fritz, { Component } from 'fritz';

type Props = {
  count: number;
}

export default class App extends Component<Props> {
  static props = {
    count: { attribute: true }
  };
  state = {
    count: 0,
    mounted: false
  };
  componentDidMount() {
    if(this.props.count) {
      this.setState({
        mounted: true,
        count: Number(this.props.count)
      });
    } else {
      this.setState({ mounted: true });
    }
  }
  render() {
    let count = this.state.mounted ? this.state.count : this.props.count;
    return (
      <div>
        <div>Count: {count}</div>

        <button type="button" onClick={() => this.setState({
          count: count + 1
        })}>Increment</button>
      </div>
    );
  }
}

fritz.define('my-app', App);