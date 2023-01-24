import fritzWindow from "../../window.mjs";
import { Component, h, adopt } from "../../worker.mjs";
import { waitForRender, fixture, setupTest } from "./helpers.js";

QUnit.module('getSnapshotBeforeUpdate', hooks => {
  setupTest(hooks);
});

QUnit.test('can use a <style> element', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;

  let tag = 'get-snapshot-1';
  fritzWorker.define(tag, class extends Component {
    render() {
      return h('div', null, 'worked!');
    }
  });
  await customElements.whenDefined(tag);
  let el = document.createElement(tag);
  fixture().append(el);
  await waitForRender(el);
  console.log(el);
});