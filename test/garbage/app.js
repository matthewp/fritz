import fritz, { h, Component } from "../../worker.mjs";

class App extends Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  componentDidMount() {
    this.dispatch({ type: "mount" });
  }

  decrement() {
    let { count } = this.state;
    this.setState({ count: count - 1 });
  }

  render({}, { count }) {
    var size = this._fritzHandles.size;
    return h("div", [
      h(
        "button",
        {
          id: "increment",
          onClick: () => this.setState({ count: count + 1 }),
        },
        "Increment"
      ),
      h(
        "button",
        {
          onClick: this.decrement,
        },
        "Decrement"
      ),
      h("div", ["Count: " + count]),
      h("div", ["Handles: ", h("span", { id: "handleSize" }, [size])]),
    ]);
  }
}

fritz.define("gc-app", App);
