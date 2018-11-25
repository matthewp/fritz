import { createContext, wait, firstShadow } from './helpers2.js';
import fritz from '../window.js';
import { Component, h } from '../worker.js';

describe('Events', () => {
  afterEach(() => {
    host.innerHTML = '';
  });

  it('supports key events', async () => {
    let tag = 'keydown-which-key';
    let { worker, registry } = createContext();
    fritz.use(worker);

    registry.define(tag, class extends Component {
      handleKey(ev) {
        this.setState({ key: ev.which });
      }

      render() {
        return h('div', null, [
          h('span', null, `key: ${this.state.key}`),
          h('input', {
            onKeyDown: this.handleKey
          })
        ]);
      }
    });
    host.appendChild(document.createElement(tag));
    await wait();

    let root = firstShadow();
    let input = root.firstChild.firstChild.nextSibling;
    input.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'Enter',
      key: 'Enter',
      which: 0
    }));

    await wait();
    let span = root.firstChild.firstChild;
    assert.equal(span.textContent, 'key: 0');
  });

});