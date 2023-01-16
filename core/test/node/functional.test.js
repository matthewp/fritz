import { test } from 'node:test';
import assert from 'node:assert';
import fritz, { h } from '../../worker.mjs';
import { renderToString } from '../../node.mjs';

test('functional components', t => {
  function HelloWorld() {
    return h('div', null, 'Hello world')
  }
  fritz.define('functional-1', HelloWorld);
  let html = renderToString(h(HelloWorld));
  assert.equal(html, '<div>Hello world</div>');
});