import { test } from 'node:test';
import assert from 'node:assert';
import fritz, { Component, h } from '../../worker.mjs';
import { renderToString } from '../../node.mjs';

test('Component.styles', () => {
  class Foo extends Component {
    static styles = `div { color: blue; }`;
    render() {
      return h('div', null, 'Hello world')
    }
  }
  fritz.define('styles-basic', Foo);
  let html = renderToString(h(Foo));
  assert.equal(html, `<styles-basic><template shadowroot="open"><style data-fritz-s>div { color: blue; }</style><div>Hello world</div></template></styles-basic>`);
});