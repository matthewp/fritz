importScripts('../../worker.umd.js');
importScripts('../worker-debug.js');

const { h, Component } = fritz;

class Namer extends Component {
  constructor() {
    super();
    this.state = {
      name: ''
    };
  }

  handleChange(ev) {
    debugger;
  }

  render({}, {name}) {
    return (
      h('div', {'class':'app'}, [
        h('input', {type:'text', onChange:this.handleChange}),
        h('h2', [name])
      ])
    );
  }
}

fritz.define('app-namer', Namer);
