import { createContext, wait } from './helpers2.js';
import fritz from '../window.js';
import { Component, h } from '../worker.js';

describe('Functional components', () => {
  afterEach(() => {
    host.innerHTML = '';
  });

  it('works', async () => {
    let { worker, registry } = createContext();
    fritz.use(worker);

    function about() {
      return h('div', ['Hello world!']);
    }

    registry.define('func-app', function() {
      return h(about, null, []);
    });

    host.appendChild(document.createElement('func-app'));
    await wait();

    let root = host.firstChild.shadowRoot;
    assert.equal(root.firstChild.firstChild.nodeValue, 'Hello world!');
  });
});