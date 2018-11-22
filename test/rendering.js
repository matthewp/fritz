import { createContext, wait, firstShadow } from './helpers2.js';
import fritz from '../window.js';
import { Component, h } from '../worker.js';

describe('Rendering', () => {
  afterEach(async () => {
    host.innerHTML = '';
    await wait(100);
  });

  it('Renders children in the correct order when children are args', async () => {
    let { worker, registry } = createContext();
    fritz.use(worker);

    const tag = 'rendering-order1';

    registry.define(tag, class extends Component {
      render() {
        return h('main', null,
          h('h1', null, 'heading'),
          h('footer', null, 'footer')
        );
      }
    });

    host.appendChild(document.createElement(tag));
    await wait();

    let h1 = firstShadow().firstChild.firstChild;
    assert.equal(h1.nodeName, 'H1', 'the h1 is first');
    
    let footer = h1.nextSibling;
    assert.equal(footer.nodeName, 'FOOTER', 'the footer comes after');
  });
});