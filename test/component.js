import { createContext, wait, firstShadow } from './helpers2.js';
import fritz from '../window.js';
import { Component, h } from '../worker.js';

describe('Components', () => {
  afterEach(() => {
    host.innerHTML = '';
  });

  it('props are passed to the constructor', async () => {
    let tag = 'props-in-ctr';
    let { worker, registry } = createContext();
    fritz.use(worker);

    registry.define(tag, class extends Component {
      static get props() {
        return { idProp: {} };
      }

      constructor(props) {
        super(props);
        assert.equal(props.idProp, 4, 'props provided to ctr');
      }

      render() {
        return h('div');
      }
    });

    let el = document.createElement(tag);
    el.idProp = 4;

    host.appendChild(el);
    await wait();
  });

  it('Only defines events once', async () => {
    let childTag = 'on-click-child';
    let parentTag = 'on-click-parent';

    let { worker, registry } = createContext();
    fritz.use(worker);

    registry.define(childTag, class extends Component {
      render() {
        return h('div');
      }
    });

    registry.define(parentTag, class extends Component {
      constructor(props) {
        super(props);
        this.state = { clicked: false };
      }
      render() {
        return h('div', null, [
          h('span', null, `clicked: ${this.state.clicked}`),
          h(childTag, {
            onClick: () => this.setState({ clicked: true })
          }),
          h(childTag, {
            onClick: () => this.setState({ clicked: true })
          })
        ]);
      }
    });

    host.appendChild(document.createElement(parentTag));
    await wait();

    let root = firstShadow();
    let child = root.firstChild.firstChild.nextSibling;
    child.dispatchEvent(new Event('click'));
    await wait();
    
    let text = root.firstChild.firstChild.textContent;
    assert.equal(text, 'clicked: true');
  });
});