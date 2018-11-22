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

  it('Correctly encodes emojis', async () => {
    let { worker, registry } = createContext();
    fritz.use(worker);
    
    const tag = 'emoji-el';
    const char = '👻';

    registry.define(tag, () => h('div', null, char));

    host.appendChild(document.createElement(tag));
    await wait();

    let div = firstShadow().firstChild;
    assert.equal(div.textContent, char);
  });

  describe('Keyed lists', () => {
    it('maintains order when a key is used', async () => {
      let { worker, registry } = createContext();
      fritz.use(worker);
      
      const tag = 'keyed-list';
      let setState;
  
      registry.define(tag, class extends Component {
        constructor() {
          super();
          setState = this.setState.bind(this);
          this.state = { count: 1 };
        }

        render({}, { count }) {
          let list;
          if(count === 1) {
            list = h('ul', null, [
              h('li', { key: 1 }, [`Key 1 count ${count}`]),
              h('li', { key: 2 }, [`Key 2 count ${count}`])
            ]);
          } else {
            list = h('ul', null, [
              h('li', { key: 2 }, [`Key 2 count ${count}`]),
              h('li', { key: 1 }, [`Key 1 count ${count}`])
            ]);
          }

          return h('div', null, list);
        }
      });
  
      host.appendChild(document.createElement(tag));
      await wait();

      setState({ count: 2 });
      await wait();

      let ul = firstShadow().firstChild.firstChild;
      assert.equal(ul.firstChild.textContent, 'Key 1 count 2');
      assert.equal(ul.firstChild.nextSibling.textContent, 'Key 2 count 2');
    });
  });
});